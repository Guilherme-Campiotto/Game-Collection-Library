(function () {
  const LANGUAGE_KEY = "game-collection-library-language";
  const GALLERY_API_URL = "/api/gallery";
  const GALLERY_UPLOAD_API_URL = "/api/gallery/upload";
  const GALLERY_DELETE_API_URL = "/api/gallery/photo";
  const MAX_GALLERY_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
  const supportsProjectStorage = window.location.protocol.startsWith("http");

  const translations = {
    "pt-BR": {
      locale: "pt-BR",
      htmlLang: "pt-BR",
      eyebrow: "Galeria",
      navHome: "Biblioteca",
      navRare: "Jogos mais raros",
      navGallery: "Fotos da coleção",
      menuLanguage: "Idioma: PT / EN",
      title: "Fotos da coleção",
      text: "Guarde fotos da estante, detalhes das edições e registros especiais da sua biblioteca.",
      upload: "Enviar nova foto",
      uploadLoading: "Enviando...",
      listEyebrow: "Álbum",
      listTitle: "Registros salvos",
      help: "Clique em uma foto para ampliar. Use o ícone no canto para excluir.",
      empty: "Nenhuma foto cadastrada ainda.",
      deletePhoto: "Excluir foto",
      photoAlt: (name) => `Foto da coleção: ${name}`,
      confirmDelete: "Excluir esta foto da galeria?",
      toastUploadSuccess: "Foto adicionada à galeria.",
      toastDeleteSuccess: "Foto excluída da galeria.",
      toastGenericError: "Algo deu errado. Tente novamente.",
      toastReadError: "Não foi possível ler a imagem selecionada.",
      toastImageTooLarge: "A imagem excede o limite de 5 MB.",
      localServerRequired: "Abra o site com npm start para usar a galeria."
    },
    en: {
      locale: "en-US",
      htmlLang: "en",
      eyebrow: "Gallery",
      navHome: "Library",
      navRare: "Rarest games",
      navGallery: "Collection photos",
      menuLanguage: "Language: PT / EN",
      title: "Collection photos",
      text: "Save shelf photos, edition details, and special records from your library.",
      upload: "Upload new photo",
      uploadLoading: "Uploading...",
      listEyebrow: "Album",
      listTitle: "Saved records",
      help: "Click a photo to enlarge it. Use the corner icon to delete it.",
      empty: "No photos have been added yet.",
      deletePhoto: "Delete photo",
      photoAlt: (name) => `Collection photo: ${name}`,
      confirmDelete: "Delete this photo from the gallery?",
      toastUploadSuccess: "Photo added to the gallery.",
      toastDeleteSuccess: "Photo deleted from the gallery.",
      toastGenericError: "Something went wrong. Please try again.",
      toastReadError: "The selected image could not be read.",
      toastImageTooLarge: "The image exceeds the 5 MB limit.",
      localServerRequired: "Open the site with npm start to use the gallery."
    }
  };

  const elements = {
    html: document.documentElement,
    menuLanguageToggle: document.getElementById("menu-language-toggle"),
    eyebrow: document.getElementById("gallery-eyebrow"),
    navHome: document.getElementById("gallery-nav-home-link"),
    navRare: document.getElementById("gallery-nav-rare-link"),
    navGallery: document.getElementById("gallery-nav-link"),
    title: document.getElementById("gallery-title"),
    text: document.getElementById("gallery-text"),
    uploadLabel: document.getElementById("gallery-upload-label"),
    uploadInput: document.getElementById("gallery-upload-input"),
    listEyebrow: document.getElementById("gallery-list-eyebrow"),
    listTitle: document.getElementById("gallery-list-title"),
    help: document.getElementById("gallery-help"),
    grid: document.getElementById("gallery-grid"),
    lightbox: document.getElementById("gallery-lightbox"),
    lightboxImage: document.getElementById("gallery-lightbox-image"),
    lightboxClose: document.getElementById("gallery-lightbox-close"),
    toastContainer: document.getElementById("toast-container")
  };

  let currentLanguage = localStorage.getItem(LANGUAGE_KEY) || "pt-BR";
  let photos = [];
  let activeToastTimeout;
  let isUploading = false;

  function t() {
    return translations[currentLanguage] || translations["pt-BR"];
  }

  function saveLanguage() {
    localStorage.setItem(LANGUAGE_KEY, currentLanguage);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function showToast(type, message) {
    if (!elements.toastContainer) {
      return;
    }

    clearTimeout(activeToastTimeout);
    elements.toastContainer.innerHTML = "";

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.setAttribute("role", type === "error" ? "alert" : "status");
    toast.textContent = message;
    elements.toastContainer.appendChild(toast);

    activeToastTimeout = setTimeout(() => toast.remove(), 2000);
  }

  function updateStaticTexts() {
    elements.html.lang = t().htmlLang;
    elements.eyebrow.textContent = t().eyebrow;
    elements.navHome.textContent = t().navHome;
    elements.navRare.textContent = t().navRare;
    elements.navGallery.textContent = t().navGallery;
    elements.menuLanguageToggle.textContent = t().menuLanguage;
    elements.title.textContent = t().title;
    elements.text.textContent = t().text;
    elements.uploadLabel.textContent = isUploading ? t().uploadLoading : t().upload;
    elements.listEyebrow.textContent = t().listEyebrow;
    elements.listTitle.textContent = t().listTitle;
    elements.help.textContent = t().help;
    elements.menuLanguageToggle.setAttribute(
      "aria-label",
      currentLanguage === "en" ? "Switch to Portuguese" : "Switch to English"
    );
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      if (file.size > MAX_GALLERY_IMAGE_SIZE_BYTES) {
        reject(new Error(t().toastImageTooLarge));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error(t().toastReadError));
      reader.readAsDataURL(file);
    });
  }

  async function loadGallery() {
    if (!supportsProjectStorage) {
      throw new Error(t().localServerRequired);
    }

    const response = await fetch(GALLERY_API_URL, { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok || !Array.isArray(payload.photos)) {
      throw new Error(payload.error || t().toastGenericError);
    }

    photos = payload.photos;
  }

  async function uploadGalleryPhoto(file) {
    if (!supportsProjectStorage) {
      throw new Error(t().localServerRequired);
    }

    isUploading = true;
    updateStaticTexts();

    try {
      const dataUrl = await fileToDataUrl(file);
      const response = await fetch(GALLERY_UPLOAD_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fileName: file.name.replace(/\.[^.]+$/, ""),
          dataUrl
        })
      });
      const payload = await response.json();
      if (!response.ok || !payload.photo) {
        throw new Error(payload.error || t().toastGenericError);
      }

      await loadGallery();
      renderGallery();
      showToast("success", t().toastUploadSuccess);
    } finally {
      isUploading = false;
      updateStaticTexts();
    }
  }

  async function deletePhoto(photo) {
    if (!confirm(t().confirmDelete)) {
      return;
    }

    const response = await fetch(GALLERY_DELETE_API_URL, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ path: photo.path })
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || t().toastGenericError);
    }

    photos = photos.filter((item) => item.path !== photo.path);
    renderGallery();
    closeLightbox();
    showToast("success", t().toastDeleteSuccess);
  }

  function openLightbox(photo) {
    elements.lightboxImage.src = photo.path;
    elements.lightboxImage.alt = t().photoAlt(photo.name);
    elements.lightbox.classList.remove("hidden");
  }

  function closeLightbox() {
    elements.lightbox.classList.add("hidden");
    elements.lightboxImage.removeAttribute("src");
    elements.lightboxImage.alt = "";
  }

  function renderGallery() {
    elements.grid.innerHTML = "";

    if (!photos.length) {
      elements.grid.innerHTML = `<p class="gallery-empty">${escapeHtml(t().empty)}</p>`;
      return;
    }

    photos.forEach((photo) => {
      const card = document.createElement("article");
      card.className = "gallery-card";
      card.innerHTML = `
        <button class="gallery-photo-button" type="button">
          <img src="${escapeHtml(photo.path)}" alt="${escapeHtml(t().photoAlt(photo.name))}">
        </button>
        <button class="gallery-delete-button" type="button" aria-label="${escapeHtml(t().deletePhoto)}" title="${escapeHtml(t().deletePhoto)}">×</button>
      `;

      card.querySelector(".gallery-photo-button").addEventListener("click", () => openLightbox(photo));
      card.querySelector(".gallery-delete-button").addEventListener("click", () => {
        deletePhoto(photo).catch((error) => {
          console.error(error);
          showToast("error", error.message || t().toastGenericError);
        });
      });
      elements.grid.appendChild(card);
    });
  }

  function setLanguage(language) {
    currentLanguage = language in translations ? language : "pt-BR";
    saveLanguage();
    updateStaticTexts();
    renderGallery();
  }

  function bindEvents() {
    elements.menuLanguageToggle.addEventListener("click", () => {
      setLanguage(currentLanguage === "pt-BR" ? "en" : "pt-BR");
    });
    elements.uploadInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      event.target.value = "";
      if (!file) {
        return;
      }

      uploadGalleryPhoto(file).catch((error) => {
        console.error(error);
        showToast("error", error.message || t().toastGenericError);
      });
    });
    elements.lightboxClose.addEventListener("click", closeLightbox);
    elements.lightbox.addEventListener("click", (event) => {
      if (event.target === elements.lightbox) {
        closeLightbox();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeLightbox();
      }
    });
  }

  async function initializePage() {
    bindEvents();
    updateStaticTexts();

    try {
      await loadGallery();
    } catch (error) {
      console.error(error);
      showToast("error", error.message || t().toastGenericError);
      photos = [];
    }

    renderGallery();
  }

  initializePage().catch((error) => {
    console.error(error);
    updateStaticTexts();
    renderGallery();
    showToast("error", error.message || t().toastGenericError);
  });
})();
