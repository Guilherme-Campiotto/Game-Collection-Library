const fs = require("node:fs");
const path = require("node:path");
const { saveDownloadedCover, saveUploadedCover, slugify } = require("./storage");

const LOCAL_CONFIG_DIR = ".local";
const OPENAI_KEY_FILE = "openai-key.json";
const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const OPENAI_MODEL = "gpt-5-nano";
const MAX_COVER_IMAGE_BYTES = 5 * 1024 * 1024;
const RATE_LIMIT_RETRY_ATTEMPTS = 3;
const DEFAULT_RATE_LIMIT_RETRY_MS = 7000;

function getOpenAiKeyPath(repoRoot) {
  return path.join(repoRoot, LOCAL_CONFIG_DIR, OPENAI_KEY_FILE);
}

function hasOpenAiKey(repoRoot) {
  return fs.existsSync(getOpenAiKeyPath(repoRoot));
}

function saveOpenAiKey(repoRoot, apiKey) {
  const trimmedKey = String(apiKey || "").trim();
  if (!trimmedKey) {
    throw new Error("A chave da API não pode ficar vazia.");
  }

  const configPath = getOpenAiKeyPath(repoRoot);
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, `${JSON.stringify({ apiKey: trimmedKey }, null, 2)}\n`, "utf8");
}

function readOpenAiKey(repoRoot) {
  const configPath = getOpenAiKeyPath(repoRoot);
  if (!fs.existsSync(configPath)) {
    throw new Error("Configure a chave da IA antes de cadastrar por foto.");
  }

  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  if (!config.apiKey) {
    throw new Error("A chave da IA não foi encontrada.");
  }

  return config.apiKey;
}

function extractResponseText(responsePayload) {
  if (typeof responsePayload.output_text === "string") {
    return responsePayload.output_text;
  }

  const message = responsePayload.output?.find((item) => item.type === "message");
  const textContent = message?.content?.find((item) => item.type === "output_text");
  return textContent?.text || "";
}

function parseJsonFromText(text) {
  const trimmed = text.trim();
  const jsonText = trimmed.startsWith("{") ? trimmed : trimmed.match(/\{[\s\S]*\}/)?.[0];

  if (!jsonText) {
    throw new Error("A IA não retornou um JSON válido.");
  }

  return JSON.parse(jsonText);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRateLimitRetryDelay(errorPayload, response) {
  const retryAfterSeconds = Number(response.headers.get("retry-after"));
  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
    return retryAfterSeconds * 1000;
  }

  const retryAfterMs = Number(response.headers.get("retry-after-ms"));
  if (Number.isFinite(retryAfterMs) && retryAfterMs > 0) {
    return retryAfterMs;
  }

  const message = String(errorPayload?.error?.message || "");
  const match = message.match(/try again in ([\d.]+)s/i);
  if (match) {
    return Math.ceil(Number(match[1]) * 1000);
  }

  return DEFAULT_RATE_LIMIT_RETRY_MS;
}

async function fetchOpenAiWithRetry(url, options, { attempts = RATE_LIMIT_RETRY_ATTEMPTS } = {}) {
  for (let attempt = 0; attempt <= attempts; attempt += 1) {
    const response = await fetch(url, options);
    const payload = await response.json();

    if (response.ok || response.status !== 429 || attempt === attempts) {
      return { response, payload };
    }

    const retryDelay = getRateLimitRetryDelay(payload, response);
    console.warn(`Rate limit da OpenAI atingido. Tentando novamente em ${Math.ceil(retryDelay / 1000)}s.`);
    await sleep(retryDelay);
  }

  throw new Error("NÃ£o foi possÃ­vel concluir a chamada para a OpenAI.");
}

function normalizeIdentifiedGame(game, index = 0) {
  const title = String(game.title || "").trim();
  if (!title) {
    throw new Error("Não foi possível identificar o título do jogo.");
  }

  const platform = String(game.platform || "").trim() || "Não informada";
  const releaseYear = Number(game.releaseYear) || new Date().getFullYear();
  const averagePriceBrl = Number(game.averagePriceBrl) || 0;

  return {
    id: `${slugify(platform)}-${slugify(title)}-${Date.now()}-${index + 1}`,
    title,
    platform,
    genre: String(game.genre || "Não informado").trim(),
    releaseYear,
    averagePriceBrl,
    status: "Na fila",
    format: "Fisica",
    condition: String(game.condition || "Completo").trim(),
    location: "Cadastro por foto",
    image: "",
    coverImageUrl: String(game.coverImageUrl || "").trim(),
    notes: String(game.notes || "Cadastro gerado por foto com apoio de IA e busca web.").trim(),
    sourceUrl: String(game.sourceUrl || "").trim(),
    sourceLabel: String(game.sourceLabel || "Busca web").trim()
  };
}

function normalizeIdentifiedGames(payload) {
  const games = Array.isArray(payload?.games) ? payload.games : Array.isArray(payload) ? payload : [payload];
  const normalizedGames = games
    .filter((game) => game && typeof game === "object")
    .map((game, index) => normalizeIdentifiedGame(game, index));

  if (!normalizedGames.length) {
    throw new Error("Não foi possível identificar nenhum jogo na foto.");
  }

  return normalizedGames;
}

async function saveOfficialCoverOrFallback(repoRoot, game, dataUrl) {
  if (/^https?:\/\//i.test(game.coverImageUrl)) {
    try {
      const response = await fetch(game.coverImageUrl, {
        headers: {
          "User-Agent": "GameCollectionLibrary/1.0"
        }
      });
      const contentType = response.headers.get("content-type") || "";
      const contentLength = Number(response.headers.get("content-length")) || 0;

      if (!response.ok) {
        throw new Error(`Cover download failed with status ${response.status}.`);
      }

      if (contentLength > MAX_COVER_IMAGE_BYTES) {
        throw new Error("Cover image is too large.");
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.byteLength > MAX_COVER_IMAGE_BYTES) {
        throw new Error("Cover image is too large.");
      }

      return saveDownloadedCover(repoRoot, {
        fileName: `${game.platform}-${game.title}-official-cover`,
        mimeType: contentType,
        buffer
      });
    } catch (error) {
      console.warn(`Não foi possível baixar a capa oficial de ${game.title}. Usando a foto enviada.`, error);
    }
  }

  return saveUploadedCover(repoRoot, {
    fileName: `${game.platform}-${game.title}`,
    dataUrl
  });
}

async function identifyGameFromPhoto(repoRoot, { dataUrl }) {
  if (!/^data:image\/(?:png|jpeg|webp);base64,/i.test(dataUrl || "")) {
    throw new Error("Envie uma imagem JPG, PNG ou WebP.");
  }

  const apiKey = readOpenAiKey(repoRoot);
  const prompt = [
    "Você está cadastrando um jogo físico em uma coleção pessoal.",
    "Analise a foto enviada e identifique todos os jogos visíveis. Se houver mais de um jogo na mesma foto, cadastre cada jogo como um item separado.",
    "Para cada jogo, identifique o título e, se possível, a plataforma exata.",
    "Use busca web para estimar o preço médio atual no Brasil de cada jogo, preferindo Mercado Livre quando houver resultados relevantes.",
    "Para cada jogo, busque também a capa oficial lançada para a plataforma identificada e retorne uma URL direta para a imagem da capa.",
    "Responda somente com um JSON válido, sem markdown, no formato:",
    "{",
    '  "games": [',
    "    {",
    '      "title": "Nome oficial do jogo",',
    '      "platform": "PS5, PS4, PS3, Switch etc",',
    '      "genre": "Gênero em português",',
    '      "releaseYear": 2024,',
    '      "averagePriceBrl": 250,',
    '      "condition": "Completo",',
    '      "coverImageUrl": "URL direta da imagem da capa oficial nessa plataforma",',
    '      "notes": "Resumo curto explicando a identificação e a estimativa de preço",',
    '      "sourceUrl": "URL usada como referência de preço",',
    '      "sourceLabel": "Nome da fonte"',
    "    }",
    "  ]",
    "}",
    "Inclua somente jogos que você consegue identificar com confiança.",
    "A coverImageUrl precisa apontar diretamente para um arquivo de imagem JPG, PNG ou WebP; não use URL de página HTML.",
    "Se algum dado de um jogo identificado não puder ser confirmado, use uma estimativa conservadora e explique em notes."
  ].join("\n");

  const { response, payload } = await fetchOpenAiWithRetry(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      tools: [
        {
          type: "web_search",
          user_location: {
            type: "approximate",
            country: "BR",
            timezone: "America/Sao_Paulo"
          }
        }
      ],
      tool_choice: "auto",
      include: ["web_search_call.action.sources"],
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            { type: "input_image", image_url: dataUrl }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(payload.error?.message || "Não foi possível identificar o jogo pela foto.");
  }

  const identifiedGames = normalizeIdentifiedGames(parseJsonFromText(extractResponseText(payload)));
  for (const game of identifiedGames) {
    game.image = await saveOfficialCoverOrFallback(repoRoot, game, dataUrl);
    delete game.coverImageUrl;
  }

  return identifiedGames;
}

module.exports = {
  hasOpenAiKey,
  saveOpenAiKey,
  identifyGameFromPhoto,
  getRateLimitRetryDelay,
  normalizeIdentifiedGames
};
