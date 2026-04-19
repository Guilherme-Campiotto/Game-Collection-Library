const fs = require("node:fs");
const path = require("node:path");
const { saveUploadedCover, slugify } = require("./storage");

const LOCAL_CONFIG_DIR = ".local";
const OPENAI_KEY_FILE = "openai-key.json";
const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const OPENAI_MODEL = "gpt-5-nano";

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
    '      "notes": "Resumo curto explicando a identificação e a estimativa de preço",',
    '      "sourceUrl": "URL usada como referência de preço",',
    '      "sourceLabel": "Nome da fonte"',
    "    }",
    "  ]",
    "}",
    "Inclua somente jogos que você consegue identificar com confiança.",
    "Se algum dado de um jogo identificado não puder ser confirmado, use uma estimativa conservadora e explique em notes."
  ].join("\n");

  const response = await fetch(OPENAI_RESPONSES_URL, {
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

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error?.message || "Não foi possível identificar o jogo pela foto.");
  }

  const identifiedGames = normalizeIdentifiedGames(parseJsonFromText(extractResponseText(payload)));
  identifiedGames.forEach((game) => {
    game.image = saveUploadedCover(repoRoot, {
      fileName: `${game.platform}-${game.title}`,
      dataUrl
    });
  });

  return identifiedGames;
}

module.exports = {
  hasOpenAiKey,
  saveOpenAiKey,
  identifyGameFromPhoto,
  normalizeIdentifiedGames
};
