(function () {
  const STORAGE_KEY = "game-collection-library-custom-games";
  const VIEW_KEY = "game-collection-library-view-mode";
  const seedGames = Array.isArray(window.SEED_GAMES) ? window.SEED_GAMES : [];

  const elements = {
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
    formPanel: document.getElementById("form-panel")
  };

  let customGames = loadCustomGames();
  let viewMode = localStorage.getItem(VIEW_KEY) || "grid";

  function loadCustomGames() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      console.warn("Nao foi possivel ler os jogos personalizados.", error);
      return [];
    }
  }

  function saveCustomGames() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customGames));
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
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0
    }).format(value || 0);
  }

  function buildFullCollection() {
    return [...seedGames, ...customGames];
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

  function populateSelect(select, values, label) {
    const previous = select.value;
    select.innerHTML = "";

    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = `Todos os ${label}`;
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
    const collection = buildFullCollection();
    populateSelect(elements.platformFilter, [...new Set(collection.map((game) => game.platform))].sort(), "plataformas");
    populateSelect(elements.genreFilter, [...new Set(collection.map((game) => game.genre))].sort(), "generos");
    populateSelect(elements.statusFilter, [...new Set(collection.map((game) => game.status))].sort(), "status");
  }

  function sortGames(games, sort) {
    const sorted = [...games];
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

    const filtered = buildFullCollection().filter((game) => {
      const haystack = [
        game.title,
        game.platform,
        game.genre,
        game.notes,
        game.condition,
        game.location
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!search || haystack.includes(search)) &&
        (!platform || game.platform === platform) &&
        (!genre || game.genre === genre) &&
        (!status || game.status === status) &&
        game.releaseYear >= yearMin &&
        game.averagePriceBrl <= priceMax
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
      { label: "Itens cadastrados", value: total },
      { label: "Valor estimado", value: currency(totalValue) },
      { label: "Plataformas", value: platforms },
      { label: "Jogo mais novo", value: newest || "-" }
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

  function renderCards(games) {
    elements.gamesGrid.innerHTML = "";

    if (!games.length) {
      elements.gamesGrid.innerHTML = "<p>Nenhum jogo encontrado com os filtros atuais.</p>";
      return;
    }

    games.forEach((game) => {
      const fragment = elements.template.content.cloneNode(true);
      const image = fragment.querySelector(".game-image");
      const title = fragment.querySelector(".game-title");
      const platform = fragment.querySelector(".game-platform");
      const price = fragment.querySelector(".game-price");
      const tagRow = fragment.querySelector(".tag-row");
      const meta = fragment.querySelector(".game-meta");
      const notes = fragment.querySelector(".game-notes");
      const source = fragment.querySelector(".game-source");

      image.src = game.image;
      image.alt = `Foto de referencia para ${game.title}`;
      title.textContent = game.title;
      platform.textContent = game.platform;
      price.textContent = currency(game.averagePriceBrl);

      [
        { text: game.genre, className: "tag" },
        { text: String(game.releaseYear), className: "tag" },
        { text: game.status, className: "tag status" }
      ].forEach((item) => {
        const badge = document.createElement("span");
        badge.className = item.className;
        badge.textContent = item.text;
        tagRow.appendChild(badge);
      });

      meta.append(
        createMetaItem("Midia", game.format),
        createMetaItem("Condicao", game.condition || "Nao informada"),
        createMetaItem("Origem", game.location || "Manual"),
        createMetaItem("Fonte do preco", game.sourceLabel || "Manual")
      );

      notes.textContent = game.notes || "Sem observacoes.";
      if (game.sourceUrl) {
        source.href = game.sourceUrl;
        source.textContent = `Ver referencia de preco em ${game.sourceLabel || "fonte externa"}`;
      } else {
        source.remove();
      }
      elements.gamesGrid.appendChild(fragment);
    });
  }

  function renderTable(games) {
    elements.tableBody.innerHTML = "";

    games.forEach((game) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${game.title}</td>
        <td>${game.platform}</td>
        <td>${game.genre}</td>
        <td>${game.releaseYear}</td>
        <td>${currency(game.averagePriceBrl)}</td>
        <td>${game.status}</td>
        <td><img class="mini-photo" src="${game.image}" alt="Foto de ${game.title}"></td>
      `;
      elements.tableBody.appendChild(row);
    });
  }

  function render() {
    const fullCollection = buildFullCollection();
    const filtered = filterGames();

    renderStats(fullCollection);
    renderCards(filtered);
    renderTable(filtered);

    const totalValue = filtered.reduce((sum, game) => sum + game.averagePriceBrl, 0);
    elements.resultsCount.textContent = `${filtered.length} jogo(s) visiveis, somando ${currency(totalValue)} em valor medio.`;
    updateView();
  }

  function updateView() {
    const isGrid = viewMode === "grid";
    elements.gamesGrid.classList.toggle("hidden", !isGrid);
    elements.tableWrap.classList.toggle("hidden", isGrid);
    elements.toggleView.textContent = isGrid ? "Trocar para tabela" : "Trocar para cards";
    localStorage.setItem(VIEW_KEY, viewMode);
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Falha ao ler o arquivo."));
      reader.readAsDataURL(file);
    });
  }

  async function handleFormSubmit(event) {
    event.preventDefault();

    const formData = new FormData(elements.gameForm);
    const title = formData.get("title").trim();
    const platform = formData.get("platform").trim();
    const genre = formData.get("genre").trim();
    const releaseYear = Number(formData.get("releaseYear"));
    const averagePriceBrl = Number(formData.get("averagePriceBrl"));
    const photoFile = formData.get("photo");

    let image = "photo-1.jpeg";
    if (photoFile && photoFile.size) {
      image = await fileToDataUrl(photoFile);
    }

    customGames.unshift({
      id: `${slugify(platform)}-${slugify(title)}-${Date.now()}`,
      title,
      platform,
      genre,
      releaseYear,
      averagePriceBrl,
      status: formData.get("status"),
      format: formData.get("format"),
      condition: formData.get("condition").trim() || "Nao informada",
      location: "Cadastro manual",
      image,
      notes: formData.get("notes").trim() || "Adicionado manualmente pelo formulario.",
      sourceUrl: "",
      sourceLabel: "Manual"
    });

    saveCustomGames();
    refreshFilterOptions();
    elements.gameForm.reset();
    render();
  }

  function exportCollection() {
    const blob = new Blob([JSON.stringify(buildFullCollection(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "game-collection-library-export.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function importCollection(event) {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const text = await file.text();
    const imported = JSON.parse(text);

    if (!Array.isArray(imported)) {
      throw new Error("O arquivo precisa conter um array de jogos.");
    }

    customGames = imported.filter((item) => !seedGames.some((seed) => seed.id === item.id));
    saveCustomGames();
    refreshFilterOptions();
    render();
    event.target.value = "";
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
    customGames = [];
    saveCustomGames();
    refreshFilterOptions();
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
        alert(error.message);
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
  }

  refreshFilterOptions();
  bindEvents();
  render();
})();
