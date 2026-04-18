(function () {
  const LANGUAGE_KEY = "game-collection-library-language";
  const COLLECTION_API_URL = "/api/collection";
  const seedGames = Array.isArray(window.SEED_GAMES) ? window.SEED_GAMES : [];
  const seedImageMap = Object.fromEntries(seedGames.map((game) => [game.id, game.image]));
  const supportsProjectStorage = window.location.protocol.startsWith("http");

  const translations = {
    "pt-BR": {
      locale: "pt-BR",
      htmlLang: "pt-BR",
      eyebrow: "Raridades",
      navHome: "Biblioteca",
      navRare: "Jogos mais raros",
      menuLanguage: "Idioma: PT / EN",
      title: "Jogos mais raros da colecao",
      text:
        "Um ranking dos itens com maior valor medio estimado, mostrando o top 3 no topo e uma tabela completa com o restante da colecao logo abaixo.",
      topEyebrow: "Top 3",
      topTitle: "Os tres jogos mais raros",
      topLabel: (rank) => `${rank} lugar`,
      topFallback: "Ainda nao ha jogos suficientes para montar o top 3.",
      tableEyebrow: "Lista completa",
      tableTitle: "Outros jogos ordenados por preco",
      tableHelp: "A tabela mostra o restante da colecao do mais caro para o mais acessivel.",
      tableRank: "Posicao",
      tableGame: "Jogo",
      tablePlatform: "Plataforma",
      tableGenre: "Genero",
      tableYear: "Ano",
      tablePrice: "Preco medio",
      noGames: "Nenhum outro jogo para listar abaixo do top 3."
    },
    en: {
      locale: "en-US",
      htmlLang: "en",
      eyebrow: "Rarities",
      navHome: "Library",
      navRare: "Rarest games",
      menuLanguage: "Language: PT / EN",
      title: "Rarest games in the collection",
      text:
        "A ranking of the items with the highest estimated average value, showing the top 3 above and a full table with the rest of the collection below.",
      topEyebrow: "Top 3",
      topTitle: "The three rarest games",
      topLabel: (rank) => `${rank}${rank === 1 ? "st" : rank === 2 ? "nd" : "rd"} place`,
      topFallback: "There are not enough games yet to build the top 3.",
      tableEyebrow: "Full list",
      tableTitle: "Other games sorted by price",
      tableHelp: "The table shows the rest of the collection from the most expensive to the most affordable.",
      tableRank: "Rank",
      tableGame: "Game",
      tablePlatform: "Platform",
      tableGenre: "Genre",
      tableYear: "Year",
      tablePrice: "Average price",
      noGames: "There are no other games to list below the top 3."
    }
  };

  const elements = {
    html: document.documentElement,
    menuLanguageToggle: document.getElementById("menu-language-toggle"),
    eyebrow: document.getElementById("rare-eyebrow"),
    navHome: document.getElementById("rare-nav-home-link"),
    navRare: document.getElementById("rare-nav-link"),
    title: document.getElementById("rare-title"),
    text: document.getElementById("rare-text"),
    topEyebrow: document.getElementById("podium-eyebrow"),
    topTitle: document.getElementById("podium-title"),
    topGrid: document.getElementById("rare-podium"),
    tableEyebrow: document.getElementById("rare-table-eyebrow"),
    tableTitle: document.getElementById("rare-table-title"),
    tableHelp: document.getElementById("rare-table-help"),
    tableHeadRank: document.getElementById("rare-head-rank"),
    tableHeadGame: document.getElementById("rare-head-game"),
    tableHeadPlatform: document.getElementById("rare-head-platform"),
    tableHeadGenre: document.getElementById("rare-head-genre"),
    tableHeadYear: document.getElementById("rare-head-year"),
    tableHeadPrice: document.getElementById("rare-head-price"),
    tableBody: document.getElementById("rare-table-body")
  };

  let currentLanguage = localStorage.getItem(LANGUAGE_KEY) || "pt-BR";

  function t() {
    return translations[currentLanguage] || translations["pt-BR"];
  }

  function cloneSeeds() {
    return seedGames.map((game) => ({ ...game }));
  }

  function normalizeGame(game) {
    if (!game || typeof game !== "object") {
      return game;
    }

    const normalized = { ...game };
    if (
      seedImageMap[normalized.id] &&
      typeof normalized.image === "string" &&
      (normalized.image.startsWith("http") || /^photo-\d+\.jpe?g$/i.test(normalized.image))
    ) {
      normalized.image = seedImageMap[normalized.id];
    }

    return normalized;
  }

  function mergeWithSeeds(collection) {
    const normalizedCollection = Array.isArray(collection) ? collection.map(normalizeGame) : [];
    const mergedById = new Map();

    cloneSeeds().forEach((game) => {
      mergedById.set(game.id, game);
    });

    normalizedCollection.forEach((game) => {
      if (game && game.id) {
        mergedById.set(game.id, game);
      }
    });

    return [...mergedById.values()];
  }

  async function loadProjectGames() {
    const response = await fetch(COLLECTION_API_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Nao foi possivel carregar a colecao do projeto.");
    }

    const payload = await response.json();
    const collection = Array.isArray(payload) ? payload : payload.games;
    if (!Array.isArray(collection)) {
      throw new Error("A resposta da colecao do projeto e invalida.");
    }

    return mergeWithSeeds(collection);
  }

  function saveLanguage() {
    localStorage.setItem(LANGUAGE_KEY, currentLanguage);
  }

  function currency(value) {
    return new Intl.NumberFormat(t().locale, {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0
    }).format(value || 0);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function sortByPrice(collection) {
    return [...collection].sort((first, second) => {
      return (
        Number(second.averagePriceBrl || 0) - Number(first.averagePriceBrl || 0) ||
        first.title.localeCompare(second.title)
      );
    });
  }

  function renderTopThree(topGames) {
    elements.topGrid.innerHTML = "";

    if (!topGames.length) {
      elements.topGrid.innerHTML = `<div class="podium-empty">${escapeHtml(t().topFallback)}</div>`;
      return;
    }

    topGames.forEach((game, index) => {
      const rank = index + 1;
      const card = document.createElement("article");
      card.className = "podium-card";
      card.style.setProperty("--podium-image", `url("${game.image}")`);
      card.innerHTML = `
        <span class="podium-badge">${rank}</span>
        <p class="podium-rank-label">${escapeHtml(t().topLabel(rank))}</p>
        <h3 class="podium-title">${escapeHtml(game.title)}</h3>
        <div class="podium-meta">
          <span>${escapeHtml(game.platform)}</span>
          <span>${escapeHtml(game.genre)}</span>
        </div>
        <p class="podium-price">${escapeHtml(currency(game.averagePriceBrl))}</p>
        <p class="podium-note">${escapeHtml(String(game.releaseYear))}</p>
      `;
      elements.topGrid.appendChild(card);
    });
  }

  function renderTable(otherGames) {
    elements.tableBody.innerHTML = "";

    if (!otherGames.length) {
      const row = document.createElement("tr");
      row.innerHTML = `<td colspan="6">${escapeHtml(t().noGames)}</td>`;
      elements.tableBody.appendChild(row);
      return;
    }

    otherGames.forEach((game, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${escapeHtml(String(index + 4))}</td>
        <td>${escapeHtml(game.title)}</td>
        <td>${escapeHtml(game.platform)}</td>
        <td>${escapeHtml(game.genre)}</td>
        <td>${escapeHtml(String(game.releaseYear))}</td>
        <td>${escapeHtml(currency(game.averagePriceBrl))}</td>
      `;
      elements.tableBody.appendChild(row);
    });
  }

  function updateStaticTexts() {
    elements.html.lang = t().htmlLang;
    elements.eyebrow.textContent = t().eyebrow;
    elements.navHome.textContent = t().navHome;
    elements.navRare.textContent = t().navRare;
    elements.menuLanguageToggle.textContent = t().menuLanguage;
    elements.title.textContent = t().title;
    elements.text.textContent = t().text;
    elements.topEyebrow.textContent = t().topEyebrow;
    elements.topTitle.textContent = t().topTitle;
    elements.tableEyebrow.textContent = t().tableEyebrow;
    elements.tableTitle.textContent = t().tableTitle;
    elements.tableHelp.textContent = t().tableHelp;
    elements.tableHeadRank.textContent = t().tableRank;
    elements.tableHeadGame.textContent = t().tableGame;
    elements.tableHeadPlatform.textContent = t().tablePlatform;
    elements.tableHeadGenre.textContent = t().tableGenre;
    elements.tableHeadYear.textContent = t().tableYear;
    elements.tableHeadPrice.textContent = t().tablePrice;
    elements.menuLanguageToggle.setAttribute(
      "aria-label",
      currentLanguage === "en" ? "Switch to Portuguese" : "Switch to English"
    );
  }

  function render(games) {
    const sortedGames = sortByPrice(games);
    renderTopThree(sortedGames.slice(0, 3));
    renderTable(sortedGames.slice(3));
  }

  function setLanguage(language) {
    currentLanguage = language in translations ? language : "pt-BR";
    saveLanguage();
    updateStaticTexts();
    initializePage();
  }

  elements.menuLanguageToggle.addEventListener("click", () => {
    setLanguage(currentLanguage === "pt-BR" ? "en" : "pt-BR");
  });

  async function initializePage() {
    let games;

    try {
      games = supportsProjectStorage ? await loadProjectGames() : cloneSeeds();
    } catch (error) {
      console.warn("Nao foi possivel carregar a colecao do projeto.", error);
      games = cloneSeeds();
    }

    updateStaticTexts();
    render(games);
  }

  initializePage().catch((error) => {
    console.error(error);
    updateStaticTexts();
    render(cloneSeeds());
  });
})();
