(function () {
  const VIEW_KEY = "game-collection-library-view-mode";
  const LANGUAGE_KEY = "game-collection-library-language";
  const CARD_PAGE_SIZE_KEY = "game-collection-library-card-page-size";
  const TABLE_PAGE_SIZE_KEY = "game-collection-library-table-page-size";
  const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
  const DEFAULT_CARD_PAGE_SIZE = 6;
  const DEFAULT_TABLE_PAGE_SIZE = 10;
  const PAGE_SIZE_OPTIONS = [6, 9, 10, 12, 15, 20];
  const COLLECTION_API_URL = "/api/collection";
  const UPLOAD_API_URL = "/api/upload";
  const AI_KEY_API_URL = "/api/ai-key";
  const IDENTIFY_GAME_API_URL = "/api/identify-game";
  const supportsProjectStorage = window.location.protocol.startsWith("http");

  const translations = {
    "pt-BR": {
      locale: "pt-BR",
      htmlLang: "pt-BR",
      heroEyebrow: "Coleção Pessoal",
      navHome: "Biblioteca",
      navRare: "Jogos mais raros",
      navGallery: "Fotos da coleção",
      menuLanguage: "Idioma: PT / EN",
      heroText:
        "Um catálogo visual da sua biblioteca de jogos com cadastro rápido, filtros por plataforma e um painel para acompanhar preço médio de mercado, gênero, ano e status da coleção.",
      heroGalleryLabel: "Fotos da coleção",
      heroGalleryAlt1: "Estante com jogos de PS4",
      heroGalleryAlt2: "Estante com jogos de PS3",
      heroGalleryAlt3: "Outra estante com jogos de PS4",
      addNewGame: "Cadastrar jogo",
      addByPhoto: "Cadastrar por foto",
      configureAiKey: "Configurar IA",
      exportJson: "Exportar JSON",
      collectionSummary: "Resumo da coleção",
      statsItems: "Itens cadastrados",
      statsValue: "Valor estimado",
      statsPlatforms: "Plataformas",
      controlsEyebrow: "Explorar",
      controlsTitle: "Buscar, filtrar e ordenar",
      searchLabel: "Busca",
      searchPlaceholder: "Nome, gênero, observações...",
      platformLabel: "Plataforma",
      genreLabel: "Gênero",
      statusLabel: "Status",
      yearMinLabel: "Ano mínimo",
      yearMinPlaceholder: "Ex: 2010",
      priceMaxLabel: "Preço máximo (R$)",
      priceMaxPlaceholder: "Ex: 120",
      sortLabel: "Ordenar por",
      clearFilters: "Limpar filtros",
      importJson: "Importar JSON",
      libraryEyebrow: "Biblioteca",
      libraryTitle: "Jogos cadastrados",
      switchToTable: "Trocar para tabela",
      switchToCards: "Trocar para cards",
      bulkEdit: "Editar em massa",
      bulkSave: "Salvar tudo",
      bulkCancel: "Cancelar",
      bulkImageUpload: (title) => `Trocar imagem de ${title}`,
      bulkNoActions: "Edição em massa",
      tableTitle: "Jogo",
      tablePlatform: "Plataforma",
      tableGenre: "Gênero",
      tableYear: "Ano",
      tablePrice: "Preço médio",
      tableStatus: "Status",
      tablePhoto: "Foto",
      tableActions: "Ações",
      paginationSizeLabel: "Itens por página",
      paginationPageLabel: "Página",
      paginationPrevious: "Anterior",
      paginationNext: "Próxima",
      paginationInfo: (page, totalPages) => `Página ${page} de ${totalPages}`,
      formEyebrow: "Cadastro",
      formTitle: "Adicionar ou editar item",
      formModeDefault: "Use o formulário para incluir um novo jogo ou atualizar um item existente.",
      formModeEditing: (title) => `Editando: ${title}. Altere os campos e salve para atualizar o jogo.`,
      formNameLabel: "Nome",
      formPlatformLabel: "Plataforma",
      formPlatformPlaceholder: "PS4, PS3, Switch...",
      formGenreLabel: "Gênero",
      formGenrePlaceholder: "Ação, RPG, Corrida...",
      formYearLabel: "Ano de lançamento",
      formPriceLabel: "Preço médio (R$)",
      formSourceUrlLabel: "Link da referência de preço",
      formSourceUrlPlaceholder: "https://...",
      formSourceLabelLabel: "Nome da fonte",
      formSourceLabelPlaceholder: "Mercado Livre, PriceCharting...",
      formStatusLabel: "Status",
      formFormatLabel: "Mídia",
      formConditionLabel: "Condição",
      formConditionPlaceholder: "Completo, lacrado, usado...",
      formNotesLabel: "Observações",
      formNotesPlaceholder: "Edição, steelbook, idioma, observações de compra...",
      formPhotoLabel: "Foto da capa ou da mídia",
      formPhotoHelp: "Envie uma imagem JPG, PNG ou WebP com tamanho máximo de 2 MB.",
      currentImageDefault: "A imagem atual será mantida se você não enviar outra.",
      currentImageEditing: (image) => `Imagem atual: ${image}`,
      saveGame: "Salvar jogo",
      saveChanges: "Salvar alterações",
      cancelEdit: "Cancelar edição",
      allPlatforms: "Todas as plataformas",
      allGenres: "Todos os gêneros",
      allStatuses: "Todos os status",
      sortTitleAsc: "Título (A-Z)",
      sortPriceDesc: "Preço (maior)",
      sortPriceAsc: "Preço (menor)",
      sortYearDesc: "Lançamento (mais novo)",
      sortYearAsc: "Lançamento (mais antigo)",
      sortPlatformAsc: "Plataforma",
      sourcePrice: (label) => `Ver referência de preço em ${label || "fonte externa"}`,
      sourceManual: "Manual",
      noNotes: "Sem observações.",
      noCondition: "Não informada",
      originManual: "Manual",
      mediaLabel: "Mídia",
      conditionLabel: "Condição",
      priceSourceLabel: "Fonte do preço",
      edit: "Editar",
      delete: "Excluir",
      noResults: "Nenhum jogo encontrado com os filtros atuais.",
      resultsCount: (count, total) => `${count} jogo(s) visíveis, somando ${total} em valor médio.`,
      imageAlt: (title) => `Capa de ${title}`,
      imageCurrent: (title) => `Capa de ${title}`,
      gameAlertDelete: (title) => `Excluir "${title}" da coleção?`,
      importError: "O arquivo precisa conter um array de jogos.",
      toastAddSuccess: (title) => `"${title}" cadastrado com sucesso.`,
      toastEditSuccess: (title) => `"${title}" atualizado com sucesso.`,
      toastDeleteSuccess: (title) => `"${title}" excluido com sucesso.`,
      toastBulkEditSuccess: (count) =>
        count === 1 ? "1 jogo atualizado com sucesso." : `${count} jogos atualizados com sucesso.`,
      toastBulkEditEmpty: "Nenhum jogo visível para editar.",
      toastGenericError: "Algo deu errado. Tente novamente.",
      toastReadError: "Não foi possível ler o arquivo selecionado.",
      toastImageTooLarge: "A imagem excede o limite de 2 MB.",
      toastAiKeySaved: "Chave da IA salva localmente.",
      toastAiKeyRequired: "Configure a chave da IA antes de cadastrar por foto.",
      toastIdentifyProgress: "Analisando a foto e buscando dados dos jogos...",
      toastIdentifySuccess: (count) =>
        count === 1 ? "1 jogo cadastrado pela foto." : `${count} jogos cadastrados pela foto.`,
      toastIdentifyError: "Não foi possível cadastrar o jogo pela foto.",
      toastClose: "Fechar",
      identifyPhotoLoading: "Analisando foto...",
      aiKeyPrompt:
        "Cole sua API key da OpenAI. Ela será salva apenas neste projeto, em .local/openai-key.json, e não será enviada ao Git.",
      status: {
        "Na fila": "Na fila",
        Jogando: "Jogando",
        Finalizado: "Finalizado",
      },
      format: {
        Fisica: "Física",
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
      navGallery: "Collection photos",
      menuLanguage: "Language: PT / EN",
      heroText:
        "A visual catalog for your game library with quick registration, platform filters, and a dashboard to track average market price, genre, release year, and collection status.",
      heroGalleryLabel: "Collection photos",
      heroGalleryAlt1: "Shelf with PS4 games",
      heroGalleryAlt2: "Shelf with PS3 games",
      heroGalleryAlt3: "Another shelf with PS4 games",
      addNewGame: "Add new game",
      addByPhoto: "Add by photo",
      configureAiKey: "Configure AI",
      exportJson: "Export JSON",
      collectionSummary: "Collection summary",
      statsItems: "Registered items",
      statsValue: "Estimated value",
      statsPlatforms: "Platforms",
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
      bulkEdit: "Bulk edit",
      bulkSave: "Save all",
      bulkCancel: "Cancel",
      bulkImageUpload: (title) => `Change image for ${title}`,
      bulkNoActions: "Bulk editing",
      tableTitle: "Game",
      tablePlatform: "Platform",
      tableGenre: "Genre",
      tableYear: "Year",
      tablePrice: "Average price",
      tableStatus: "Status",
      tablePhoto: "Photo",
      tableActions: "Actions",
      paginationSizeLabel: "Items per page",
      paginationPageLabel: "Page",
      paginationPrevious: "Previous",
      paginationNext: "Next",
      paginationInfo: (page, totalPages) => `Page ${page} of ${totalPages}`,
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
      formSourceUrlLabel: "Price reference link",
      formSourceUrlPlaceholder: "https://...",
      formSourceLabelLabel: "Source name",
      formSourceLabelPlaceholder: "Mercado Livre, PriceCharting...",
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
      priceSourceLabel: "Price source",
      edit: "Edit",
      delete: "Delete",
      noResults: "No games found with the current filters.",
      resultsCount: (count, total) => `${count} visible game(s), totaling ${total} in average market value.`,
      imageAlt: (title) => `Cover for ${title}`,
      imageCurrent: (title) => `Cover for ${title}`,
      gameAlertDelete: (title) => `Delete \"${title}\" from the collection?`,
      importError: "The file must contain an array of games.",
      toastAddSuccess: (title) => `"${title}" added successfully.`,
      toastEditSuccess: (title) => `"${title}" updated successfully.`,
      toastDeleteSuccess: (title) => `"${title}" deleted successfully.`,
      toastBulkEditSuccess: (count) =>
        count === 1 ? "1 game updated successfully." : `${count} games updated successfully.`,
      toastBulkEditEmpty: "There are no visible games to edit.",
      toastGenericError: "Something went wrong. Please try again.",
      toastReadError: "The selected file could not be read.",
      toastImageTooLarge: "The image exceeds the 2 MB limit.",
      toastAiKeySaved: "AI key saved locally.",
      toastAiKeyRequired: "Configure the AI key before adding by photo.",
      toastIdentifyProgress: "Analyzing the photo and searching for game data...",
      toastIdentifySuccess: (count) =>
        count === 1 ? "1 game added from the photo." : `${count} games added from the photo.`,
      toastIdentifyError: "The game could not be added from the photo.",
      toastClose: "Close",
      identifyPhotoLoading: "Analyzing photo...",
      aiKeyPrompt:
        "Paste your OpenAI API key. It will be saved only in this project, under .local/openai-key.json, and will not be committed to Git.",
      status: {
        "Na fila": "Backlog",
        Jogando: "Playing",
        Finalizado: "Finished"
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
    collectionPanel: document.querySelector(".collection-panel"),
    resultsCount: document.getElementById("results-count"),
    gamesGrid: document.getElementById("games-grid"),
    tableScrollTop: document.getElementById("games-table-scroll-top"),
    tableScrollSpacer: document.getElementById("games-table-scroll-spacer"),
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
    toggleView: document.getElementById("toggle-view"),
    bulkEditTable: document.getElementById("bulk-edit-table"),
    bulkSaveTable: document.getElementById("bulk-save-table"),
    bulkCancelTable: document.getElementById("bulk-cancel-table"),
    bulkActionFooter: document.getElementById("bulk-action-footer"),
    bulkSaveTableBottom: document.getElementById("bulk-save-table-bottom"),
    bulkCancelTableBottom: document.getElementById("bulk-cancel-table-bottom"),
    paginationControls: document.getElementById("pagination-controls"),
    paginationSizeLabel: document.getElementById("pagination-size-label"),
    paginationSizeSelect: document.getElementById("pagination-size-select"),
    paginationPrev: document.getElementById("pagination-prev"),
    paginationNext: document.getElementById("pagination-next"),
    paginationPageLabel: document.getElementById("pagination-page-label"),
    paginationPageSelect: document.getElementById("pagination-page-select"),
    paginationInfo: document.getElementById("pagination-info"),
    scrollToForm: document.getElementById("scroll-to-form"),
    identifyByPhoto: document.getElementById("identify-by-photo"),
    identifyPhotoInput: document.getElementById("identify-photo-input"),
    configureAiKey: document.getElementById("configure-ai-key"),
    heroRareLink: document.getElementById("hero-rare-link"),
    formPanel: document.getElementById("form-panel"),
    formModeLabel: document.getElementById("form-mode-label"),
    currentImageLabel: document.getElementById("current-image-label"),
    submitButton: document.getElementById("submit-button"),
    cancelEdit: document.getElementById("cancel-edit"),
    menuLanguageToggle: document.getElementById("menu-language-toggle"),
    navHomeLink: document.getElementById("nav-home-link"),
    navRareLink: document.getElementById("nav-rare-link"),
    navGalleryLink: document.getElementById("nav-gallery-link"),
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
    formSourceUrlLabel: document.getElementById("form-source-url-label"),
    formSourceLabelLabel: document.getElementById("form-source-label-label"),
    formStatusLabel: document.getElementById("form-status-label"),
    formFormatLabel: document.getElementById("form-format-label"),
    formConditionLabel: document.getElementById("form-condition-label"),
    formNotesLabel: document.getElementById("form-notes-label"),
    formPhotoLabel: document.getElementById("form-photo-label"),
    formPhotoHelp: document.getElementById("form-photo-help")
  };

  let games = [];
  let currentEditId = null;
  let viewMode = localStorage.getItem(VIEW_KEY) || "grid";
  let currentLanguage = localStorage.getItem(LANGUAGE_KEY) || "pt-BR";
  let activeToastTimeouts = [];
  let isIdentifyingPhoto = false;
  let isBulkEditing = false;
  let isSyncingTableScroll = false;
  const currentPage = {
    grid: 1,
    table: 1
  };
  const pageSize = {
    grid: PAGE_SIZE_OPTIONS.includes(Number(localStorage.getItem(CARD_PAGE_SIZE_KEY)))
      ? Number(localStorage.getItem(CARD_PAGE_SIZE_KEY))
      : DEFAULT_CARD_PAGE_SIZE,
    table: PAGE_SIZE_OPTIONS.includes(Number(localStorage.getItem(TABLE_PAGE_SIZE_KEY)))
      ? Number(localStorage.getItem(TABLE_PAGE_SIZE_KEY))
      : DEFAULT_TABLE_PAGE_SIZE
  };
  const bulkImageFiles = new Map();

  function t() {
    return translations[currentLanguage] || translations["pt-BR"];
  }

  function normalizeCollection(collection) {
    return Array.isArray(collection) ? collection.map(normalizeGame).filter(Boolean) : [];
  }

  function normalizeGame(game) {
    if (!game || typeof game !== "object") {
      return game;
    }

    return { ...game };
  }

  async function loadProjectGames() {
    const response = await fetch(COLLECTION_API_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Não foi possível carregar a coleção do projeto.");
    }

    const payload = await response.json();
    const collection = Array.isArray(payload) ? payload : payload.games;
    if (!Array.isArray(collection)) {
      throw new Error("A resposta da coleção do projeto é inválida.");
    }

    return normalizeCollection(collection);
  }

  async function persistGames() {
    if (!supportsProjectStorage) {
      throw new Error("Abra o site com npm start para salvar a coleção no projeto.");
    }

    const response = await fetch(COLLECTION_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ games })
    });

    if (!response.ok) {
      throw new Error("Não foi possível salvar a coleção no projeto.");
    }

    const payload = await response.json();
    const collection = Array.isArray(payload) ? payload : payload.games;
    if (!Array.isArray(collection)) {
      throw new Error("A resposta do salvamento da coleção é inválida.");
    }
    games = normalizeCollection(collection);
  }

  function saveLanguage() {
    localStorage.setItem(LANGUAGE_KEY, currentLanguage);
  }

  function clearToastTimers() {
    activeToastTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    activeToastTimeouts = [];
  }

  function showToast(type, message, options = {}) {
    if (!elements.toastContainer) {
      return;
    }

    const duration = options.duration ?? 2000;
    const persistent = Boolean(options.persistent);

    clearToastTimers();
    elements.toastContainer.innerHTML = "";

    const toast = document.createElement("div");
    toast.className = `toast ${type}${persistent ? " persistent" : ""}`;
    toast.setAttribute("role", type === "error" ? "alert" : "status");

    const messageElement = document.createElement("span");
    messageElement.textContent = message;
    toast.appendChild(messageElement);

    if (persistent) {
      const closeButton = document.createElement("button");
      closeButton.type = "button";
      closeButton.className = "toast-close";
      closeButton.setAttribute("aria-label", t().toastClose);
      closeButton.textContent = "×";
      closeButton.addEventListener("click", () => toast.remove());
      toast.appendChild(closeButton);
    }

    elements.toastContainer.appendChild(toast);

    if (persistent || duration === null) {
      return;
    }

    const removeTimeout = setTimeout(() => {
      toast.remove();
    }, duration);

    activeToastTimeouts.push(removeTimeout);
  }

  function setIdentifyPhotoLoading(isLoading) {
    isIdentifyingPhoto = isLoading;
    elements.identifyByPhoto.disabled = isLoading;
    elements.identifyByPhoto.setAttribute("aria-busy", String(isLoading));
    elements.identifyByPhoto.textContent = isLoading ? t().identifyPhotoLoading : t().addByPhoto;
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
    elements.navGalleryLink.textContent = t().navGallery;
    elements.menuLanguageToggle.textContent = t().menuLanguage;
    elements.heroText.textContent = t().heroText;
    elements.heroGallery.setAttribute("aria-label", t().heroGalleryLabel);

    const heroImages = elements.heroGallery.querySelectorAll("img");
    if (heroImages[0]) heroImages[0].alt = t().heroGalleryAlt1;
    if (heroImages[1]) heroImages[1].alt = t().heroGalleryAlt2;
    if (heroImages[2]) heroImages[2].alt = t().heroGalleryAlt3;

    elements.scrollToForm.textContent = t().addNewGame;
    elements.identifyByPhoto.textContent = isIdentifyingPhoto ? t().identifyPhotoLoading : t().addByPhoto;
    elements.configureAiKey.textContent = t().configureAiKey;
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
    elements.bulkEditTable.textContent = t().bulkEdit;
    elements.bulkSaveTable.textContent = t().bulkSave;
    elements.bulkCancelTable.textContent = t().bulkCancel;
    elements.bulkSaveTableBottom.textContent = t().bulkSave;
    elements.bulkCancelTableBottom.textContent = t().bulkCancel;
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
    elements.paginationSizeLabel.textContent = t().paginationSizeLabel;
    elements.paginationPageLabel.textContent = t().paginationPageLabel;
    elements.paginationPrev.textContent = t().paginationPrevious;
    elements.paginationNext.textContent = t().paginationNext;

    elements.formNameLabel.textContent = t().formNameLabel;
    elements.formPlatformLabel.textContent = t().formPlatformLabel;
    elements.gameForm.elements.platform.placeholder = t().formPlatformPlaceholder;
    elements.formGenreLabel.textContent = t().formGenreLabel;
    elements.gameForm.elements.genre.placeholder = t().formGenrePlaceholder;
    elements.formYearLabel.textContent = t().formYearLabel;
    elements.formPriceLabel.textContent = t().formPriceLabel;
    elements.formSourceUrlLabel.textContent = t().formSourceUrlLabel;
    elements.gameForm.elements.sourceUrl.placeholder = t().formSourceUrlPlaceholder;
    elements.formSourceLabelLabel.textContent = t().formSourceLabelLabel;
    elements.gameForm.elements.sourceLabel.placeholder = t().formSourceLabelPlaceholder;
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

    elements.menuLanguageToggle.setAttribute(
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
      const haystack = [
        game.title,
        game.platform,
        game.genre,
        game.notes,
        game.condition,
        game.location,
        game.sourceLabel,
        game.sourceUrl
      ]
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

  function getActivePageSize() {
    return pageSize[viewMode] || (viewMode === "table" ? DEFAULT_TABLE_PAGE_SIZE : DEFAULT_CARD_PAGE_SIZE);
  }

  function getActivePage() {
    return currentPage[viewMode] || 1;
  }

  function getPagination(collection) {
    const size = getActivePageSize();
    const totalPages = Math.max(1, Math.ceil(collection.length / size));
    const page = Math.min(Math.max(getActivePage(), 1), totalPages);
    currentPage[viewMode] = page;

    const start = (page - 1) * size;
    return {
      page,
      size,
      totalPages,
      items: collection.slice(start, start + size)
    };
  }

  function resetPages() {
    currentPage.grid = 1;
    currentPage.table = 1;
  }

  function updatePaginationControls(pagination) {
    elements.paginationSizeSelect.value = String(pagination.size);
    elements.paginationPrev.disabled = pagination.page <= 1;
    elements.paginationNext.disabled = pagination.page >= pagination.totalPages;
    elements.paginationInfo.textContent = t().paginationInfo(pagination.page, pagination.totalPages);

    elements.paginationPageSelect.innerHTML = "";
    for (let page = 1; page <= pagination.totalPages; page += 1) {
      const option = document.createElement("option");
      option.value = String(page);
      option.textContent = String(page);
      elements.paginationPageSelect.appendChild(option);
    }
    elements.paginationPageSelect.value = String(pagination.page);
  }

  function renderStats(collection) {
    const total = collection.length;
    const totalValue = collection.reduce((sum, game) => sum + Number(game.averagePriceBrl || 0), 0);
    const platforms = new Set(collection.map((game) => game.platform)).size;
    const newest = collection.reduce((max, game) => Math.max(max, game.releaseYear), 0);

    const stats = [
      { label: t().statsItems, value: total },
      { label: t().statsValue, value: currency(totalValue) },
      { label: t().statsPlatforms, value: platforms }
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

  function createBulkTextInput(id, field, value, inputType = "text") {
    const input = document.createElement("input");
    input.className = "table-edit-input";
    input.dataset.id = id;
    input.dataset.field = field;
    input.type = inputType;
    input.value = value ?? "";

    if (inputType === "number") {
      input.min = field === "releaseYear" ? "1980" : "0";
      input.max = field === "releaseYear" ? "2035" : "";
      input.step = "1";
    }

    return input;
  }

  function createBulkStatusSelect(game) {
    const select = document.createElement("select");
    select.className = "table-edit-input";
    select.dataset.id = game.id;
    select.dataset.field = "status";

    const statuses = [...new Set(["Na fila", "Jogando", "Finalizado", game.status].filter(Boolean))];
    statuses.forEach((status) => {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = translateStatus(status);
      select.appendChild(option);
    });

    select.value = game.status;
    return select;
  }

  function createBulkImageEditor(game) {
    const wrapper = document.createElement("div");
    wrapper.className = "bulk-photo-editor";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "bulk-photo-button";
    button.setAttribute("aria-label", t().bulkImageUpload(game.title));

    const image = document.createElement("img");
    image.className = "mini-photo";
    image.src = game.image;
    image.alt = t().imageCurrent(game.title);

    const hint = document.createElement("span");
    hint.textContent = t().tablePhoto;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/webp";
    input.className = "hidden";
    input.dataset.id = game.id;

    button.append(image, hint);
    button.addEventListener("click", () => input.click());
    input.addEventListener("change", () => {
      const file = input.files[0];
      if (!file) {
        return;
      }

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        input.value = "";
        showToast("error", t().toastImageTooLarge);
        return;
      }

      bulkImageFiles.set(game.id, file);
      image.src = URL.createObjectURL(file);
      hint.textContent = file.name;
    });

    wrapper.append(button, input);
    return wrapper;
  }

  function createBulkCell(content) {
    const cell = document.createElement("td");
    cell.appendChild(content);
    return cell;
  }

  function renderBulkEditRow(game) {
    const row = document.createElement("tr");
    row.dataset.id = game.id;
    row.className = "bulk-edit-row";

    row.append(
      createBulkCell(createBulkTextInput(game.id, "title", game.title)),
      createBulkCell(createBulkTextInput(game.id, "platform", game.platform)),
      createBulkCell(createBulkTextInput(game.id, "genre", game.genre)),
      createBulkCell(createBulkTextInput(game.id, "releaseYear", game.releaseYear, "number")),
      createBulkCell(createBulkTextInput(game.id, "averagePriceBrl", game.averagePriceBrl, "number")),
      createBulkCell(createBulkStatusSelect(game)),
      createBulkCell(createBulkImageEditor(game))
    );

    const actionsCell = document.createElement("td");
    actionsCell.className = "bulk-edit-note";
    actionsCell.textContent = t().bulkNoActions;
    row.appendChild(actionsCell);

    return row;
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
      if (isBulkEditing) {
        elements.tableBody.appendChild(renderBulkEditRow(game));
        return;
      }

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
    const pagination = getPagination(filtered);
    renderStats(games);
    renderCards(pagination.items);
    renderTable(pagination.items);

    const totalValue = filtered.reduce((sum, game) => sum + Number(game.averagePriceBrl || 0), 0);
    elements.resultsCount.textContent = t().resultsCount(filtered.length, currency(totalValue));
    updatePaginationControls(pagination);
    updateView();
    updateTableScrollSpacer();
  }

  function updateView() {
    const isGrid = viewMode === "grid";
    elements.gamesGrid.classList.toggle("hidden", !isGrid);
    elements.tableScrollTop.classList.toggle("hidden", isGrid);
    elements.tableScrollTop.classList.toggle("is-bulk-editing", isBulkEditing);
    elements.tableWrap.classList.toggle("hidden", isGrid);
    elements.tableWrap.classList.toggle("is-bulk-editing", isBulkEditing);
    elements.toggleView.textContent = isGrid ? t().switchToTable : t().switchToCards;
    elements.bulkEditTable.classList.toggle("hidden", isGrid || isBulkEditing);
    elements.bulkSaveTable.classList.toggle("hidden", isGrid || !isBulkEditing);
    elements.bulkCancelTable.classList.toggle("hidden", isGrid || !isBulkEditing);
    elements.bulkActionFooter.classList.toggle("hidden", isGrid || !isBulkEditing);
    localStorage.setItem(VIEW_KEY, viewMode);
  }

  function updateTableScrollSpacer() {
    const table = elements.tableWrap.querySelector(".games-table");
    if (!table) {
      return;
    }

    elements.tableScrollSpacer.style.width = `${table.scrollWidth}px`;
    elements.tableScrollTop.scrollLeft = elements.tableWrap.scrollLeft;
  }

  function syncTableScroll(source, target) {
    if (isSyncingTableScroll) {
      return;
    }

    isSyncingTableScroll = true;
    target.scrollLeft = source.scrollLeft;
    requestAnimationFrame(() => {
      isSyncingTableScroll = false;
    });
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

  async function uploadCover(file, title, platform) {
    const dataUrl = await fileToDataUrl(file);

    if (!supportsProjectStorage) {
      return dataUrl;
    }

    const response = await fetch(UPLOAD_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fileName: `${platform}-${title}`,
        dataUrl
      })
    });

    if (!response.ok) {
      throw new Error(t().toastGenericError);
    }

    const payload = await response.json();
    if (!payload.imagePath) {
      throw new Error(t().toastGenericError);
    }

    return payload.imagePath;
  }

  async function configureAiKey() {
    if (!supportsProjectStorage) {
      showToast("error", "Abra o site com npm start para configurar a IA.");
      return;
    }

    const apiKey = prompt(t().aiKeyPrompt);
    if (!apiKey) {
      return;
    }

    const response = await fetch(AI_KEY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ apiKey })
    });

    if (!response.ok) {
      throw new Error(t().toastGenericError);
    }

    showToast("success", t().toastAiKeySaved);
  }

  async function identifyGameByPhoto(file) {
    if (!supportsProjectStorage) {
      showToast("error", "Abra o site com npm start para cadastrar por foto.");
      return;
    }

    setIdentifyPhotoLoading(true);
    showToast("info", t().toastIdentifyProgress, { duration: null });

    try {
      const dataUrl = await fileToDataUrl(file);
      const response = await fetch(IDENTIFY_GAME_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ dataUrl })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || t().toastIdentifyError);
      }

      const identifiedGames = Array.isArray(payload.games) ? payload.games : payload.game ? [payload.game] : [];
      if (!identifiedGames.length) {
        throw new Error(t().toastIdentifyError);
      }

      games.unshift(...identifiedGames);
      await persistGames();
      resetPages();
      refreshFilterOptions();
      clearForm();
      updateStaticTexts();
      render();
      showToast("success", t().toastIdentifySuccess(identifiedGames.length), { persistent: true });
    } finally {
      setIdentifyPhotoLoading(false);
    }
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
    elements.gameForm.elements.sourceUrl.value = game.sourceUrl || "";
    elements.gameForm.elements.sourceLabel.value = game.sourceLabel || "";
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
      const sourceUrl = formData.get("sourceUrl").trim();
      const sourceLabel = formData.get("sourceLabel").trim();
      const photoFile = formData.get("photo");
      const existing = currentEditId ? findGame(currentEditId) : null;

      let image = existing?.image || "photo-1.jpeg";
      if (photoFile && photoFile.size) {
        image = await uploadCover(photoFile, title, platform);
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
        condition: formData.get("condition").trim() || "Não informada",
        location: existing?.location || "Cadastro manual",
        image,
        notes: formData.get("notes").trim(),
        sourceUrl,
        sourceLabel: sourceLabel || "Manual"
      };

      if (existing) {
        games = games.map((game) => (game.id === existing.id ? payload : game));
      } else {
        games.unshift(payload);
        resetPages();
      }

      await persistGames();
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

      games = normalizeCollection(imported);
      await persistGames();
      resetPages();
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
    resetPages();
    render();
  }

  function startBulkEdit() {
    const visibleGames = filterGames();
    if (!visibleGames.length) {
      showToast("error", t().toastBulkEditEmpty);
      return;
    }

    viewMode = "table";
    isBulkEditing = true;
    bulkImageFiles.clear();
    render();
  }

  function scrollCollectionToTop() {
    elements.collectionPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function cancelBulkEdit(options = {}) {
    isBulkEditing = false;
    bulkImageFiles.clear();
    render();

    if (options.scrollToTop) {
      scrollCollectionToTop();
    }
  }

  function readBulkRow(row) {
    const id = row.dataset.id;
    const current = findGame(id);
    if (!current) {
      return null;
    }

    const fields = {};
    row.querySelectorAll("[data-field]").forEach((input) => {
      const value = input.value.trim();
      fields[input.dataset.field] = value;
    });

    return {
      ...current,
      title: fields.title || current.title,
      platform: fields.platform || current.platform,
      genre: fields.genre || current.genre,
      releaseYear: Number(fields.releaseYear) || current.releaseYear,
      averagePriceBrl: Number(fields.averagePriceBrl) || 0,
      status: fields.status || current.status
    };
  }

  function hasBulkChanges(current, edited, photoFile) {
    return (
      Boolean(photoFile) ||
      current.title !== edited.title ||
      current.platform !== edited.platform ||
      current.genre !== edited.genre ||
      Number(current.releaseYear) !== Number(edited.releaseYear) ||
      Number(current.averagePriceBrl) !== Number(edited.averagePriceBrl) ||
      current.status !== edited.status
    );
  }

  function setBulkActionButtonsDisabled(disabled) {
    [
      elements.bulkSaveTable,
      elements.bulkCancelTable,
      elements.bulkSaveTableBottom,
      elements.bulkCancelTableBottom
    ].forEach((button) => {
      button.disabled = disabled;
    });
  }

  async function saveBulkEdit(options = {}) {
    const rows = [...elements.tableBody.querySelectorAll("tr[data-id]")];
    if (!rows.length) {
      showToast("error", t().toastBulkEditEmpty);
      return;
    }

    setBulkActionButtonsDisabled(true);

    try {
      const editedGames = new Map();

      for (const row of rows) {
        const edited = readBulkRow(row);
        if (!edited) {
          continue;
        }

        const current = findGame(edited.id);
        const photoFile = bulkImageFiles.get(edited.id);
        if (!current || !hasBulkChanges(current, edited, photoFile)) {
          continue;
        }

        if (photoFile) {
          edited.image = await uploadCover(photoFile, edited.title, edited.platform);
        }

        editedGames.set(edited.id, edited);
      }

      games = games.map((game) => editedGames.get(game.id) || game);
      await persistGames();
      isBulkEditing = false;
      bulkImageFiles.clear();
      refreshFilterOptions();
      updateStaticTexts();
      render();
      showToast("success", t().toastBulkEditSuccess(editedGames.size));

      if (options.scrollToTop) {
        scrollCollectionToTop();
      }
    } catch (error) {
      console.error(error);
      showToast("error", error.message || t().toastGenericError);
    } finally {
      setBulkActionButtonsDisabled(false);
    }
  }

  async function deleteGame(id) {
    const game = findGame(id);
    if (!game) {
      showToast("error", t().toastGenericError);
      return;
    }

    if (!confirm(t().gameAlertDelete(game.title))) {
      return;
    }

    games = games.filter((item) => item.id !== id);
    await persistGames();
    resetPages();
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
      deleteGame(id).catch((error) => {
        console.error(error);
        showToast("error", error.message || t().toastGenericError);
      });
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
    ].forEach((element) =>
      element.addEventListener("input", () => {
        resetPages();
        render();
      })
    );

    elements.gameForm.addEventListener("submit", handleFormSubmit);
    elements.identifyByPhoto.addEventListener("click", () => {
      if (isIdentifyingPhoto) {
        return;
      }

      elements.identifyPhotoInput.click();
    });
    elements.identifyPhotoInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      event.target.value = "";
      if (!file) {
        return;
      }

      identifyGameByPhoto(file).catch((error) => {
        console.error(error);
        showToast("error", error.message || t().toastIdentifyError, { persistent: true });
      });
    });
    elements.configureAiKey.addEventListener("click", () => {
      configureAiKey().catch((error) => {
        console.error(error);
        showToast("error", error.message || t().toastGenericError);
      });
    });
    elements.exportButton.addEventListener("click", exportCollection);
    elements.importInput.addEventListener("change", (event) => {
      importCollection(event).catch((error) => {
        console.error(error);
        showToast("error", error.message || t().toastGenericError);
      });
    });
    elements.clearFilters.addEventListener("click", clearFilters);
    elements.toggleView.addEventListener("click", () => {
      viewMode = viewMode === "grid" ? "table" : "grid";
      if (viewMode === "grid") {
        isBulkEditing = false;
        bulkImageFiles.clear();
      }
      render();
    });
    elements.paginationSizeSelect.addEventListener("change", () => {
      const nextSize = Number(elements.paginationSizeSelect.value) || getActivePageSize();
      pageSize[viewMode] = nextSize;
      localStorage.setItem(viewMode === "table" ? TABLE_PAGE_SIZE_KEY : CARD_PAGE_SIZE_KEY, String(nextSize));
      currentPage[viewMode] = 1;
      render();
    });
    elements.paginationPageSelect.addEventListener("change", () => {
      currentPage[viewMode] = Number(elements.paginationPageSelect.value) || 1;
      render();
      scrollCollectionToTop();
    });
    elements.paginationPrev.addEventListener("click", () => {
      currentPage[viewMode] = Math.max(1, getActivePage() - 1);
      render();
      scrollCollectionToTop();
    });
    elements.paginationNext.addEventListener("click", () => {
      currentPage[viewMode] = getActivePage() + 1;
      render();
      scrollCollectionToTop();
    });
    elements.bulkEditTable.addEventListener("click", startBulkEdit);
    elements.bulkSaveTable.addEventListener("click", saveBulkEdit);
    elements.bulkCancelTable.addEventListener("click", cancelBulkEdit);
    elements.bulkSaveTableBottom.addEventListener("click", () => saveBulkEdit({ scrollToTop: true }));
    elements.bulkCancelTableBottom.addEventListener("click", () => cancelBulkEdit({ scrollToTop: true }));
    elements.tableScrollTop.addEventListener("scroll", () => syncTableScroll(elements.tableScrollTop, elements.tableWrap));
    elements.tableWrap.addEventListener("scroll", () => syncTableScroll(elements.tableWrap, elements.tableScrollTop));
    window.addEventListener("resize", updateTableScrollSpacer);
    elements.scrollToForm.addEventListener("click", () => {
      elements.formPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    elements.cancelEdit.addEventListener("click", clearForm);
    elements.gamesGrid.addEventListener("click", handleActionClick);
    elements.tableBody.addEventListener("click", handleActionClick);
    elements.menuLanguageToggle.addEventListener("click", () => {
      setLanguage(currentLanguage === "pt-BR" ? "en" : "pt-BR");
    });
  }

  async function initializeApp() {
    try {
      games = supportsProjectStorage ? await loadProjectGames() : [];
    } catch (error) {
      console.warn("Não foi possível carregar a coleção do projeto.", error);
      games = [];
    }

    refreshFilterOptions();
    bindEvents();
    clearForm();
    updateStaticTexts();
    render();
  }

  initializeApp().catch((error) => {
    console.error(error);
    games = [];
    refreshFilterOptions();
    bindEvents();
    clearForm();
    updateStaticTexts();
    render();
    showToast("error", error.message || t().toastGenericError);
  });
})();
