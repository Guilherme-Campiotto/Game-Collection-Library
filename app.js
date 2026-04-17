(function () {
  const STORAGE_KEY = "game-collection-library-state-v2";
  const LEGACY_KEY = "game-collection-library-custom-games";
  const VIEW_KEY = "game-collection-library-view-mode";
  const LANGUAGE_KEY = "game-collection-library-language";
  const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
  const seedGames = Array.isArray(window.SEED_GAMES) ? window.SEED_GAMES : [];
  const seedImageMap = Object.fromEntries(seedGames.map((game) => [game.id, game.image]));

  const translations = {
    "pt-BR": {
      locale: "pt-BR",
      htmlLang: "pt-BR",
      heroEyebrow: "Colecao Pessoal",
      navHome: "Biblioteca",
      navRare: "Jogos mais raros",
      heroText:
        "Um catalogo visual da sua biblioteca de jogos com cadastro rapido, filtros por plataforma e um painel para acompanhar preco medio de mercado, genero, ano e status da colecao.",
      heroGalleryLabel: "Fotos da colecao",
      heroGalleryAlt1: "Estante com jogos de PS4",
      heroGalleryAlt2: "Estante com jogos de PS3",
      heroGalleryAlt3: "Outra estante com jogos de PS4",
      addNewGame: "Cadastrar novo jogo",
      rarePageCta: "Ver jogos raros",
      exportJson: "Exportar JSON",
      collectionSummary: "Resumo da colecao",
      statsItems: "Itens cadastrados",
      statsValue: "Valor estimado",
      statsPlatforms: "Plataformas",
      statsNewest: "Jogo mais novo",
      controlsEyebrow: "Explorar",
      controlsTitle: "Buscar, filtrar e ordenar",
      searchLabel: "Busca",
      searchPlaceholder: "Nome, genero, observacoes...",
      platformLabel: "Plataforma",
      genreLabel: "Genero",
      statusLabel: "Status",
      yearMinLabel: "Ano minimo",
      yearMinPlaceholder: "Ex: 2010",
      priceMaxLabel: "Preco maximo (R$)",
      priceMaxPlaceholder: "Ex: 120",
      sortLabel: "Ordenar por",
      clearFilters: "Limpar filtros",
      importJson: "Importar JSON",
      libraryEyebrow: "Biblioteca",
      libraryTitle: "Jogos cadastrados",
      switchToTable: "Trocar para tabela",
      switchToCards: "Trocar para cards",
      tableTitle: "Jogo",
      tablePlatform: "Plataforma",
      tableGenre: "Genero",
      tableYear: "Ano",
      tablePrice: "Preco medio",
      tableStatus: "Status",
      tablePhoto: "Foto",
      tableActions: "Acoes",
      formEyebrow: "Cadastro",
      formTitle: "Adicionar ou editar item",
      formModeDefault: "Use o formulario para incluir um novo jogo ou atualizar um item existente.",
      formModeEditing: (title) => `Editando: ${title}. Altere os campos e salve para atualizar o jogo.`,
      formNameLabel: "Nome",
      formPlatformLabel: "Plataforma",
      formPlatformPlaceholder: "PS4, PS3, Switch...",
      formGenreLabel: "Genero",
      formGenrePlaceholder: "Acao, RPG, Corrida...",
      formYearLabel: "Ano de lancamento",
      formPriceLabel: "Preco medio (R$)",
      formStatusLabel: "Status",
      formFormatLabel: "Midia",
      formConditionLabel: "Condicao",
      formConditionPlaceholder: "Completo, lacrado, usado...",
      formNotesLabel: "Observacoes",
      formNotesPlaceholder: "Edicao, steelbook, idioma, observacoes de compra...",
      formPhotoLabel: "Foto da capa ou da midia",
      formPhotoHelp: "Envie uma imagem JPG, PNG ou WebP com tamanho maximo de 2 MB.",
      currentImageDefault: "A imagem atual sera mantida se voce nao enviar outra.",
      currentImageEditing: (image) => `Imagem atual: ${image}`,
      saveGame: "Salvar jogo",
      saveChanges: "Salvar alteracoes",
      cancelEdit: "Cancelar edicao",
      restoreCollection: "Restaurar colecao inicial",
      allPlatforms: "Todas as plataformas",
      allGenres: "Todos os generos",
      allStatuses: "Todos os status",
      sortTitleAsc: "Titulo (A-Z)",
      sortPriceDesc: "Preco (maior)",
      sortPriceAsc: "Preco (menor)",
      sortYearDesc: "Lancamento (mais novo)",
      sortYearAsc: "Lancamento (mais antigo)",
      sortPlatformAsc: "Plataforma",
      sourcePrice: (label) => `Ver referencia de preco em ${label || "fonte externa"}`,
      sourceManual: "Manual",
      noNotes: "Sem observacoes.",
      noCondition: "Nao informada",
      originManual: "Manual",
      mediaLabel: "Midia",
      conditionLabel: "Condicao",
      originLabel: "Origem",
      priceSourceLabel: "Fonte do preco",
      edit: "Editar",
      delete: "Excluir",
      noResults: "Nenhum jogo encontrado com os filtros atuais.",
      resultsCount: (count, total) => `${count} jogo(s) visiveis, somando ${total} em valor medio.`,
      imageAlt: (title) => `Capa de ${title}`,
      imageCurrent: (title) => `Capa de ${title}`,
      gameAlertReset:
        "Isso vai restaurar a colecao inicial e remover alteracoes salvas no navegador. Continuar?",
      gameAlertDelete: (title) => `Excluir "${title}" da colecao?`,
      importError: "O arquivo precisa conter um array de jogos.",
      toastAddSuccess: (title) => `"${title}" cadastrado com sucesso.`,
      toastEditSuccess: (title) => `"${title}" atualizado com sucesso.`,
      toastDeleteSuccess: (title) => `"${title}" excluido com sucesso.`,
      toastGenericError: "Algo deu errado. Tente novamente.",
      toastReadError: "Nao foi possivel ler o arquivo selecionado.",
      toastImageTooLarge: "A imagem excede o limite de 2 MB.",
      status: {
        "Na fila": "Na fila",
        Jogando: "Jogando",
        Finalizado: "Finalizado",
        Platinado: "Platinado",
        Colecao: "Colecao"
      },
      format: {
        Fisica: "Fisica",
        Digital: "Digital",
        Colecionador: "Colecionador"
      }
    },
    en: {
      locale: "en-US",
      htmlLang: "en",
      heroEyebrow: "Personal Collection",
      navHome: "Library",
      navRare: "Rarest games",
      heroText:
        "A visual catalog for your game library with quick registration, platform filters, and a dashboard to track average market price, genre, release year, and collection status.",
      heroGalleryLabel: "Collection photos",
      heroGalleryAlt1: "Shelf with PS4 games",
      heroGalleryAlt2: "Shelf with PS3 games",
      heroGalleryAlt3: "Another shelf with PS4 games",
      addNewGame: "Add new game",
      rarePageCta: "View rare games",
      exportJson: "Export JSON",
      collectionSummary: "Collection summary",
      statsItems: "Registered items",
      statsValue: "Estimated value",
      statsPlatforms: "Platforms",
      statsNewest: "Newest game",
      controlsEyebrow: "Explore",
      controlsTitle: "Search, filter, and sort",
      searchLabel: "Search",
      searchPlaceholder: "Title, genre, notes...",
      platformLabel: "Platform",
      genreLabel: "Genre",
      statusLabel: "Status",
      yearMinLabel: "Minimum year",
      yearMinPlaceholder: "e.g. 2010",
      priceMaxLabel: "Max price (R$)",
      priceMaxPlaceholder: "e.g. 120",
      sortLabel: "Sort by",
      clearFilters: "Clear filters",
      importJson: "Import JSON",
      libraryEyebrow: "Library",
      libraryTitle: "Registered games",
      switchToTable: "Switch to table",
      switchToCards: "Switch to cards",
      tableTitle: "Game",
      tablePlatform: "Platform",
      tableGenre: "Genre",
      tableYear: "Year",
      tablePrice: "Average price",
      tableStatus: "Status",
      tablePhoto: "Photo",
      tableActions: "Actions",
      formEyebrow: "Form",
      formTitle: "Add or edit item",
      formModeDefault: "Use the form to add a new game or update an existing item.",
      formModeEditing: (title) => `Editing: ${title}. Change the fields and save to update the game.`,
      formNameLabel: "Title",
      formPlatformLabel: "Platform",
      formPlatformPlaceholder: "PS4, PS3, Switch...",
      formGenreLabel: "Genre",
      formGenrePlaceholder: "Action, RPG, Racing...",
      formYearLabel: "Release year",
      formPriceLabel: "Average price (R$)",
      formStatusLabel: "Status",
      formFormatLabel: "Format",
      formConditionLabel: "Condition",
      formConditionPlaceholder: "Complete, sealed, used...",
      formNotesLabel: "Notes",
      formNotesPlaceholder: "Edition, steelbook, language, purchase notes...",
      formPhotoLabel: "Cover or media photo",
      formPhotoHelp: "Upload a JPG, PNG, or WebP image up to 2 MB.",
      currentImageDefault: "The current image will be kept if you do not upload another one.",
      currentImageEditing: (image) => `Current image: ${image}`,
      saveGame: "Save game",
      saveChanges: "Save changes",
      cancelEdit: "Cancel editing",
      restoreCollection: "Restore initial collection",
      allPlatforms: "All platforms",
      allGenres: "All genres",
      allStatuses: "All statuses",
      sortTitleAsc: "Title (A-Z)",
      sortPriceDesc: "Price (highest)",
      sortPriceAsc: "Price (lowest)",
      sortYearDesc: "Release (newest)",
      sortYearAsc: "Release (oldest)",
      sortPlatformAsc: "Platform",
      sourcePrice: (label) => `View price reference on ${label || "external source"}`,
      sourceManual: "Manual",
      noNotes: "No notes.",
      noCondition: "Not informed",
      originManual: "Manual",
      mediaLabel: "Format",
      conditionLabel: "Condition",
      originLabel: "Origin",
      priceSourceLabel: "Price source",
      edit: "Edit",
      delete: "Delete",
      noResults: "No games found with the current filters.",
      resultsCount: (count, total) => `${count} visible game(s), totaling ${total} in average market value.`,
      imageAlt: (title) => `Cover for ${title}`,
      imageCurrent: (title) => `Cover for ${title}`,
      gameAlertReset:
        "This will restore the initial collection and remove changes saved in the browser. Continue?",
      gameAlertDelete: (title) => `Delete \"${title}\" from the collection?`,
      importError: "The file must contain an array of games.",
      toastAddSuccess: (title) => `"${title}" added successfully.`,
      toastEditSuccess: (title) => `"${title}" updated successfully.`,
      toastDeleteSuccess: (title) => `"${title}" deleted successfully.`,
      toastGenericError: "Something went wrong. Please try again.",
      toastReadError: "The selected file could not be read.",
      toastImageTooLarge: "The image exceeds the 2 MB limit.",
      status: {
        "Na fila": "Backlog",
        Jogando: "Playing",
        Finalizado: "Finished",
        Platinado: "Platinum",
        Colecao: "Collection"
      },
      format: {
        Fisica: "Physical",
        Digital: "Digital",
        Colecionador: "Collector's"
      }
    }
  };

  const elements = {
    html: document.documentElement,
    statsGrid: document.getElementById("stats-grid"),
    resultsCount: document.getElementById("results-count"),
    gamesGrid: document.getElementById("games-grid"),
    tableWrap: document.getElementById("games-table-wrap"),
    tableBody: document.getElementById("games-table-body"),
    template: document.getElementById("game-card-template"),
    searchInput: document.getElementById("search-input"),
    platformFilter: document.getElementById("platform-filter"),
    genreFilter: document.getElementById("genre-filter"),
    statusFilter: document.getElementById("status-filter"),
    yearMinFilter: document.getElementById("year-min-filter"),
    priceMaxFilter: document.getElementById("price-max-filter"),
    sortSelect: document.getElementById("sort-select"),
    clearFilters: document.getElementById("clear-filters"),
    gameForm: document.getElementById("game-form"),
    exportButton: document.getElementById("export-json"),
    importInput: document.getElementById("import-json"),
    resetStorage: document.getElementById("reset-storage"),
    toggleView: document.getElementById("toggle-view"),
    scrollToForm: document.getElementById("scroll-to-form"),
    heroRareLink: document.getElementById("hero-rare-link"),
    formPanel: document.getElementById("form-panel"),
    formModeLabel: document.getElementById("form-mode-label"),
    currentImageLabel: document.getElementById("current-image-label"),
    submitButton: document.getElementById("submit-button"),
    cancelEdit: document.getElementById("cancel-edit"),
    languageToggle: document.getElementById("language-toggle"),
    navHomeLink: document.getElementById("nav-home-link"),
    navRareLink: document.getElementById("nav-rare-link"),
    toastContainer: document.getElementById("toast-container"),
    heroEyebrow: document.getElementById("hero-eyebrow"),
    heroText: document.getElementById("hero-text"),
    heroGallery: document.getElementById("hero-gallery"),
    controlsEyebrow: document.getElementById("controls-eyebrow"),
    controlsTitle: document.getElementById("controls-title"),
    searchLabel: document.getElementById("search-label"),
    platformLabel: document.getElementById("platform-label"),
    genreLabel: document.getElementById("genre-label"),
    statusLabel: document.getElementById("status-label"),
    yearMinLabel: document.getElementById("year-min-label"),
    priceMaxLabel: document.getElementById("price-max-label"),
    sortLabel: document.getElementById("sort-label"),
    importLabelText: document.getElementById("import-label-text"),
    libraryEyebrow: document.getElementById("library-eyebrow"),
    libraryTitle: document.getElementById("library-title"),
    formEyebrow: document.getElementById("form-eyebrow"),
    formTitle: document.getElementById("form-title"),
    tableHeadTitle: document.getElementById("table-head-title"),
    tableHeadPlatform: document.getElementById("table-head-platform"),
    tableHeadGenre: document.getElementById("table-head-genre"),
    tableHeadYear: document.getElementById("table-head-year"),
    tableHeadPrice: document.getElementById("table-head-price"),
    tableHeadStatus: document.getElementById("table-head-status"),
    tableHeadPhoto: document.getElementById("table-head-photo"),
    tableHeadActions: document.getElementById("table-head-actions"),
    formNameLabel: document.getElementById("form-name-label"),
    formPlatformLabel: document.getElementById("form-platform-label"),
    formGenreLabel: document.getElementById("form-genre-label"),
    formYearLabel: document.getElementById("form-year-label"),
    formPriceLabel: document.getElementById("form-price-label"),
    formStatusLabel: document.getElementById("form-status-label"),
    formFormatLabel: document.getElementById("form-format-label"),
    formConditionLabel: document.getElementById("form-condition-label"),
    formNotesLabel: document.getElementById("form-notes-label"),
    formPhotoLabel: document.getElementById("form-photo-label"),
    formPhotoHelp: document.getElementById("form-photo-help")
  };

  let games = loadGames();
  let currentEditId = null;
  let viewMode = localStorage.getItem(VIEW_KEY) || "grid";
  let currentLanguage = localStorage.getItem(LANGUAGE_KEY) || "pt-BR";
  let activeToastTimeouts = [];

  function t() {
    return translations[currentLanguage] || translations["pt-BR"];
  }

  function cloneSeeds() {
    return seedGames.map((game) => ({ ...game }));
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

  function loadGames() {
    try {
      const persisted = localStorage.getItem(STORAGE_KEY);
      if (persisted) {
        const parsed = JSON.parse(persisted);
        if (Array.isArray(parsed)) {
          return mergeWithSeeds(parsed);
        }
      }

      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy) {
        const parsedLegacy = JSON.parse(legacy);
        if (Array.isArray(parsedLegacy)) {
          return mergeWithSeeds(parsedLegacy);
        }
      }
    } catch (error) {
      console.warn("Nao foi possivel carregar a colecao salva.", error);
    }

    return cloneSeeds();
  }

  function saveGames() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
  }

  function saveLanguage() {
    localStorage.setItem(LANGUAGE_KEY, currentLanguage);
  }

  function clearToastTimers() {
    activeToastTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    activeToastTimeouts = [];
  }

  function showToast(type, message) {
    if (!elements.toastContainer) {
      return;
    }

    clearToastTimers();
    elements.toastContainer.innerHTML = "";

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.setAttribute("role", type === "error" ? "alert" : "status");
    toast.textContent = message;
    elements.toastContainer.appendChild(toast);

    const removeTimeout = setTimeout(() => {
      toast.remove();
    }, 2000);

    activeToastTimeouts.push(removeTimeout);
  }

  function slugify(value) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
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

  function translateStatus(value) {
    return t().status[value] || value;
  }

  function translateFormat(value) {
    return t().format[value] || value;
  }

  function translateSourceLabel(value) {
    return value === "Manual" ? t().sourceManual : value;
  }

  function getFilterValues() {
    return {
      search: elements.searchInput.value.trim().toLowerCase(),
      platform: elements.platformFilter.value,
      genre: elements.genreFilter.value,
      status: elements.statusFilter.value,
      yearMin: Number(elements.yearMinFilter.value) || 0,
      priceMax: Number(elements.priceMaxFilter.value) || Infinity,
      sort: elements.sortSelect.value
    };
  }

  function populateSelect(select, values, allText) {
    const previous = select.value;
    select.innerHTML = "";

    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = allText;
    select.appendChild(allOption);

    values.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });

    if ([...select.options].some((option) => option.value === previous)) {
      select.value = previous;
    }
  }

  function refreshFilterOptions() {
    populateSelect(elements.platformFilter, [...new Set(games.map((game) => game.platform))].sort(), t().allPlatforms);
    populateSelect(elements.genreFilter, [...new Set(games.map((game) => game.genre))].sort(), t().allGenres);

    const previous = elements.statusFilter.value;
    elements.statusFilter.innerHTML = "";
    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = t().allStatuses;
    elements.statusFilter.appendChild(allOption);

    [...new Set(games.map((game) => game.status))].sort().forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = translateStatus(value);
      elements.statusFilter.appendChild(option);
    });

    if ([...elements.statusFilter.options].some((option) => option.value === previous)) {
      elements.statusFilter.value = previous;
    }
  }

  function updateStaticTexts() {
    elements.html.lang = t().htmlLang;
    elements.heroEyebrow.textContent = t().heroEyebrow;
    elements.navHomeLink.textContent = t().navHome;
    elements.navRareLink.textContent = t().navRare;
    elements.heroText.textContent = t().heroText;
    elements.heroGallery.setAttribute("aria-label", t().heroGalleryLabel);

    const heroImages = elements.heroGallery.querySelectorAll("img");
    if (heroImages[0]) heroImages[0].alt = t().heroGalleryAlt1;
    if (heroImages[1]) heroImages[1].alt = t().heroGalleryAlt2;
    if (heroImages[2]) heroImages[2].alt = t().heroGalleryAlt3;

    elements.scrollToForm.textContent = t().addNewGame;
    elements.heroRareLink.textContent = t().rarePageCta;
    elements.exportButton.textContent = t().exportJson;
    elements.statsGrid.setAttribute("aria-label", t().collectionSummary);
    elements.controlsEyebrow.textContent = t().controlsEyebrow;
    elements.controlsTitle.textContent = t().controlsTitle;
    elements.searchLabel.textContent = t().searchLabel;
    elements.searchInput.placeholder = t().searchPlaceholder;
    elements.platformLabel.textContent = t().platformLabel;
    elements.genreLabel.textContent = t().genreLabel;
    elements.statusLabel.textContent = t().statusLabel;
    elements.yearMinLabel.textContent = t().yearMinLabel;
    elements.yearMinFilter.placeholder = t().yearMinPlaceholder;
    elements.priceMaxLabel.textContent = t().priceMaxLabel;
    elements.priceMaxFilter.placeholder = t().priceMaxPlaceholder;
    elements.sortLabel.textContent = t().sortLabel;
    elements.clearFilters.textContent = t().clearFilters;
    elements.importLabelText.textContent = t().importJson;
    elements.libraryEyebrow.textContent = t().libraryEyebrow;
    elements.libraryTitle.textContent = t().libraryTitle;
    elements.formEyebrow.textContent = t().formEyebrow;
    elements.formTitle.textContent = t().formTitle;

    elements.tableHeadTitle.textContent = t().tableTitle;
    elements.tableHeadPlatform.textContent = t().tablePlatform;
    elements.tableHeadGenre.textContent = t().tableGenre;
    elements.tableHeadYear.textContent = t().tableYear;
    elements.tableHeadPrice.textContent = t().tablePrice;
    elements.tableHeadStatus.textContent = t().tableStatus;
    elements.tableHeadPhoto.textContent = t().tablePhoto;
    elements.tableHeadActions.textContent = t().tableActions;

    elements.formNameLabel.textContent = t().formNameLabel;
    elements.formPlatformLabel.textContent = t().formPlatformLabel;
    elements.gameForm.elements.platform.placeholder = t().formPlatformPlaceholder;
    elements.formGenreLabel.textContent = t().formGenreLabel;
    elements.gameForm.elements.genre.placeholder = t().formGenrePlaceholder;
    elements.formYearLabel.textContent = t().formYearLabel;
    elements.formPriceLabel.textContent = t().formPriceLabel;
    elements.formStatusLabel.textContent = t().formStatusLabel;
    elements.formFormatLabel.textContent = t().formFormatLabel;
    elements.formConditionLabel.textContent = t().formConditionLabel;
    elements.gameForm.elements.condition.placeholder = t().formConditionPlaceholder;
    elements.formNotesLabel.textContent = t().formNotesLabel;
    elements.gameForm.elements.notes.placeholder = t().formNotesPlaceholder;
    elements.formPhotoLabel.textContent = t().formPhotoLabel;
    elements.formPhotoHelp.textContent = t().formPhotoHelp;
    elements.submitButton.textContent = currentEditId ? t().saveChanges : t().saveGame;
    elements.cancelEdit.textContent = t().cancelEdit;
    elements.resetStorage.textContent = t().restoreCollection;

    [...elements.gameForm.elements.status.options].forEach((option) => {
      option.textContent = translateStatus(option.value);
    });
    [...elements.gameForm.elements.format.options].forEach((option) => {
      option.textContent = translateFormat(option.value);
    });

    elements.sortSelect.options[0].textContent = t().sortTitleAsc;
    elements.sortSelect.options[1].textContent = t().sortPriceDesc;
    elements.sortSelect.options[2].textContent = t().sortPriceAsc;
    elements.sortSelect.options[3].textContent = t().sortYearDesc;
    elements.sortSelect.options[4].textContent = t().sortYearAsc;
    elements.sortSelect.options[5].textContent = t().sortPlatformAsc;

    if (!currentEditId) {
      elements.formModeLabel.textContent = t().formModeDefault;
      elements.currentImageLabel.textContent = t().currentImageDefault;
    }

    elements.languageToggle.classList.toggle("is-en", currentLanguage === "en");
    elements.languageToggle.setAttribute(
      "aria-label",
      currentLanguage === "en" ? "Switch to Portuguese" : "Switch to English"
    );
  }

  function sortGames(collection, sort) {
    const sorted = [...collection];
    sorted.sort((first, second) => {
      switch (sort) {
        case "price-desc":
          return second.averagePriceBrl - first.averagePriceBrl;
        case "price-asc":
          return first.averagePriceBrl - second.averagePriceBrl;
        case "year-desc":
          return second.releaseYear - first.releaseYear;
        case "year-asc":
          return first.releaseYear - second.releaseYear;
        case "platform-asc":
          return first.platform.localeCompare(second.platform) || first.title.localeCompare(second.title);
        case "title-asc":
        default:
          return first.title.localeCompare(second.title);
      }
    });
    return sorted;
  }

  function filterGames() {
    const { search, platform, genre, status, yearMin, priceMax, sort } = getFilterValues();

    const filtered = games.filter((game) => {
      const haystack = [game.title, game.platform, game.genre, game.notes, game.condition, game.location]
        .join(" ")
        .toLowerCase();

      return (
        (!search || haystack.includes(search)) &&
        (!platform || game.platform === platform) &&
        (!genre || game.genre === genre) &&
        (!status || game.status === status) &&
        game.releaseYear >= yearMin &&
        Number(game.averagePriceBrl) <= priceMax
      );
    });

    return sortGames(filtered, sort);
  }

  function renderStats(collection) {
    const total = collection.length;
    const totalValue = collection.reduce((sum, game) => sum + Number(game.averagePriceBrl || 0), 0);
    const platforms = new Set(collection.map((game) => game.platform)).size;
    const newest = collection.reduce((max, game) => Math.max(max, game.releaseYear), 0);

    const stats = [
      { label: t().statsItems, value: total },
      { label: t().statsValue, value: currency(totalValue) },
      { label: t().statsPlatforms, value: platforms },
      { label: t().statsNewest, value: newest || "-" }
    ];

    elements.statsGrid.innerHTML = "";
    stats.forEach((stat) => {
      const article = document.createElement("article");
      article.innerHTML = `<p>${stat.label}</p><strong>${stat.value}</strong>`;
      elements.statsGrid.appendChild(article);
    });
  }

  function createMetaItem(label, value) {
    const wrapper = document.createElement("div");
    const term = document.createElement("dt");
    const definition = document.createElement("dd");
    term.textContent = label;
    definition.textContent = value;
    wrapper.append(term, definition);
    return wrapper;
  }

  function createActionButtons(id) {
    const wrapper = document.createElement("div");
    wrapper.className = "game-card-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "secondary action-button";
    editButton.dataset.action = "edit";
    editButton.dataset.id = id;
    editButton.textContent = t().edit;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "danger action-button";
    deleteButton.dataset.action = "delete";
    deleteButton.dataset.id = id;
    deleteButton.textContent = t().delete;

    wrapper.append(editButton, deleteButton);
    return wrapper;
  }

  function renderCards(collection) {
    elements.gamesGrid.innerHTML = "";

    if (!collection.length) {
      elements.gamesGrid.innerHTML = `<p>${t().noResults}</p>`;
      return;
    }

    collection.forEach((game) => {
      const fragment = elements.template.content.cloneNode(true);
      const card = fragment.querySelector(".game-card");
      const image = fragment.querySelector(".game-image");
      const title = fragment.querySelector(".game-title");
      const platform = fragment.querySelector(".game-platform");
      const price = fragment.querySelector(".game-price");
      const tagRow = fragment.querySelector(".tag-row");
      const meta = fragment.querySelector(".game-meta");
      const notes = fragment.querySelector(".game-notes");
      const source = fragment.querySelector(".game-source");
      const actions = fragment.querySelector(".game-card-actions");

      card.dataset.id = game.id;
      image.src = game.image;
      image.alt = t().imageAlt(game.title);
      title.textContent = game.title;
      platform.textContent = game.platform;
      price.textContent = currency(game.averagePriceBrl);

      [
        { text: game.genre, className: "tag" },
        { text: String(game.releaseYear), className: "tag" },
        { text: translateStatus(game.status), className: "tag status" }
      ].forEach((item) => {
        const badge = document.createElement("span");
        badge.className = item.className;
        badge.textContent = item.text;
        tagRow.appendChild(badge);
      });

      meta.append(
        createMetaItem(t().mediaLabel, translateFormat(game.format)),
        createMetaItem(t().conditionLabel, game.condition || t().noCondition),
        createMetaItem(t().originLabel, game.location || t().originManual),
        createMetaItem(t().priceSourceLabel, translateSourceLabel(game.sourceLabel || "Manual"))
      );

      notes.textContent = game.notes || t().noNotes;
      if (game.sourceUrl) {
        source.href = game.sourceUrl;
        source.textContent = t().sourcePrice(translateSourceLabel(game.sourceLabel));
      } else {
        source.remove();
      }

      actions.replaceWith(createActionButtons(game.id));
      elements.gamesGrid.appendChild(fragment);
    });
  }

  function renderTable(collection) {
    elements.tableBody.innerHTML = "";

    collection.forEach((game) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${escapeHtml(game.title)}</td>
        <td>${escapeHtml(game.platform)}</td>
        <td>${escapeHtml(game.genre)}</td>
        <td>${escapeHtml(game.releaseYear)}</td>
        <td>${escapeHtml(currency(game.averagePriceBrl))}</td>
        <td>${escapeHtml(translateStatus(game.status))}</td>
        <td><img class="mini-photo" src="${escapeHtml(game.image)}" alt="${escapeHtml(t().imageCurrent(game.title))}"></td>
        <td></td>
      `;

      row.lastElementChild.appendChild(createActionButtons(game.id));
      elements.tableBody.appendChild(row);
    });
  }

  function render() {
    const filtered = filterGames();
    renderStats(games);
    renderCards(filtered);
    renderTable(filtered);

    const totalValue = filtered.reduce((sum, game) => sum + Number(game.averagePriceBrl || 0), 0);
    elements.resultsCount.textContent = t().resultsCount(filtered.length, currency(totalValue));
    updateView();
  }

  function updateView() {
    const isGrid = viewMode === "grid";
    elements.gamesGrid.classList.toggle("hidden", !isGrid);
    elements.tableWrap.classList.toggle("hidden", isGrid);
    elements.toggleView.textContent = isGrid ? t().switchToTable : t().switchToCards;
    localStorage.setItem(VIEW_KEY, viewMode);
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        reject(new Error(t().toastImageTooLarge));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error(t().toastReadError));
      reader.readAsDataURL(file);
    });
  }

  function setFormMode(game) {
    const editing = Boolean(game);
    currentEditId = editing ? game.id : null;
    elements.cancelEdit.classList.toggle("hidden", !editing);
    elements.submitButton.textContent = editing ? t().saveChanges : t().saveGame;
    elements.formModeLabel.textContent = editing ? t().formModeEditing(game.title) : t().formModeDefault;
    elements.currentImageLabel.textContent = editing ? t().currentImageEditing(game.image) : t().currentImageDefault;
  }

  function fillForm(game) {
    elements.gameForm.elements.title.value = game.title;
    elements.gameForm.elements.platform.value = game.platform;
    elements.gameForm.elements.genre.value = game.genre;
    elements.gameForm.elements.releaseYear.value = game.releaseYear;
    elements.gameForm.elements.averagePriceBrl.value = game.averagePriceBrl;
    elements.gameForm.elements.status.value = game.status;
    elements.gameForm.elements.format.value = game.format;
    elements.gameForm.elements.condition.value = game.condition || "";
    elements.gameForm.elements.notes.value = game.notes || "";
    elements.gameForm.elements.photo.value = "";
    setFormMode(game);
    elements.formPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function clearForm() {
    elements.gameForm.reset();
    setFormMode(null);
  }

  function findGame(id) {
    return games.find((game) => game.id === id);
  }

  async function handleFormSubmit(event) {
    event.preventDefault();

    try {
      const formData = new FormData(elements.gameForm);
      const title = formData.get("title").trim();
      const platform = formData.get("platform").trim();
      const genre = formData.get("genre").trim();
      const releaseYear = Number(formData.get("releaseYear"));
      const averagePriceBrl = Number(formData.get("averagePriceBrl"));
      const photoFile = formData.get("photo");
      const existing = currentEditId ? findGame(currentEditId) : null;

      let image = existing?.image || "photo-1.jpeg";
      if (photoFile && photoFile.size) {
        image = await fileToDataUrl(photoFile);
      }

      const payload = {
        id: existing?.id || `${slugify(platform)}-${slugify(title)}-${Date.now()}`,
        title,
        platform,
        genre,
        releaseYear,
        averagePriceBrl,
        status: formData.get("status"),
        format: formData.get("format"),
        condition: formData.get("condition").trim() || "Nao informada",
        location: existing?.location || "Cadastro manual",
        image,
        notes: formData.get("notes").trim(),
        sourceUrl: existing?.sourceUrl || "",
        sourceLabel: existing?.sourceLabel || "Manual"
      };

      if (existing) {
        games = games.map((game) => (game.id === existing.id ? payload : game));
      } else {
        games.unshift(payload);
      }

      saveGames();
      refreshFilterOptions();
      clearForm();
      updateStaticTexts();
      render();
      showToast("success", existing ? t().toastEditSuccess(title) : t().toastAddSuccess(title));
    } catch (error) {
      console.error(error);
      showToast("error", error.message || t().toastGenericError);
    }
  }

  function exportCollection() {
    const blob = new Blob([JSON.stringify(games, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "game-collection-library-export.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function importCollection(event) {
    try {
      const file = event.target.files[0];
      if (!file) {
        return;
      }

      const text = await file.text();
      const imported = JSON.parse(text);
      if (!Array.isArray(imported)) {
        throw new Error(t().importError);
      }

      games = imported;
      saveGames();
      refreshFilterOptions();
      clearForm();
      updateStaticTexts();
      render();
      event.target.value = "";
    } catch (error) {
      event.target.value = "";
      throw error;
    }
  }

  function clearFilters() {
    elements.searchInput.value = "";
    elements.platformFilter.value = "";
    elements.genreFilter.value = "";
    elements.statusFilter.value = "";
    elements.yearMinFilter.value = "";
    elements.priceMaxFilter.value = "";
    elements.sortSelect.value = "title-asc";
    render();
  }

  function resetStorage() {
    if (!confirm(t().gameAlertReset)) {
      return;
    }

    games = cloneSeeds();
    localStorage.removeItem(LEGACY_KEY);
    saveGames();
    refreshFilterOptions();
    clearForm();
    updateStaticTexts();
    render();
  }

  function deleteGame(id) {
    const game = findGame(id);
    if (!game) {
      showToast("error", t().toastGenericError);
      return;
    }

    if (!confirm(t().gameAlertDelete(game.title))) {
      return;
    }

    games = games.filter((item) => item.id !== id);
    saveGames();
    refreshFilterOptions();
    if (currentEditId === id) {
      clearForm();
    }
    updateStaticTexts();
    render();
    showToast("success", t().toastDeleteSuccess(game.title));
  }

  function handleActionClick(event) {
    const button = event.target.closest("[data-action]");
    if (!button) {
      return;
    }

    const { action, id } = button.dataset;
    if (action === "edit") {
      const game = findGame(id);
      if (game) {
        fillForm(game);
      }
    }

    if (action === "delete") {
      deleteGame(id);
    }
  }

  function setLanguage(language) {
    currentLanguage = language in translations ? language : "pt-BR";
    saveLanguage();
    refreshFilterOptions();
    updateStaticTexts();
    render();
  }

  function bindEvents() {
    [
      elements.searchInput,
      elements.platformFilter,
      elements.genreFilter,
      elements.statusFilter,
      elements.yearMinFilter,
      elements.priceMaxFilter,
      elements.sortSelect
    ].forEach((element) => element.addEventListener("input", render));

    elements.gameForm.addEventListener("submit", handleFormSubmit);
    elements.exportButton.addEventListener("click", exportCollection);
    elements.importInput.addEventListener("change", (event) => {
      importCollection(event).catch((error) => {
        console.error(error);
        showToast("error", error.message || t().toastGenericError);
      });
    });
    elements.clearFilters.addEventListener("click", clearFilters);
    elements.resetStorage.addEventListener("click", resetStorage);
    elements.toggleView.addEventListener("click", () => {
      viewMode = viewMode === "grid" ? "table" : "grid";
      updateView();
    });
    elements.scrollToForm.addEventListener("click", () => {
      elements.formPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    elements.cancelEdit.addEventListener("click", clearForm);
    elements.gamesGrid.addEventListener("click", handleActionClick);
    elements.tableBody.addEventListener("click", handleActionClick);
    elements.languageToggle.addEventListener("click", () => {
      setLanguage(currentLanguage === "pt-BR" ? "en" : "pt-BR");
    });
  }

  refreshFilterOptions();
  bindEvents();
  clearForm();
  updateStaticTexts();
  render();
})();
