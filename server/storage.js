const fs = require("node:fs");
const path = require("node:path");

const COLLECTION_FILE = path.join("data", "library-games.json");
const COVERS_DIR = path.join("assets", "covers");
const GALLERY_DIR = path.join("assets", "gallery");
const COVERS_PREFIX = COVERS_DIR.replaceAll("\\", "/");
const COVER_EXTENSIONS = new Set([".jpeg", ".jpg", ".png", ".webp"]);

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function loadCollection(repoRoot) {
  const collectionPath = path.join(repoRoot, COLLECTION_FILE);

  if (!fs.existsSync(collectionPath)) {
    return [];
  }

  const content = fs.readFileSync(collectionPath, "utf8");
  const parsed = JSON.parse(content);
  const collection = Array.isArray(parsed) ? parsed : parsed.games;

  if (!Array.isArray(collection)) {
    throw new Error("Collection file must contain an array of games.");
  }

  return collection;
}

function saveCollection(repoRoot, games) {
  const collectionPath = path.join(repoRoot, COLLECTION_FILE);
  fs.mkdirSync(path.dirname(collectionPath), { recursive: true });
  fs.writeFileSync(collectionPath, `${JSON.stringify(games, null, 2)}\n`, "utf8");
  return collectionPath;
}

function saveImageDataUrl(repoRoot, targetDir, { fileName, dataUrl }) {
  const match = /^data:(image\/(?:png|jpeg|webp));base64,([a-z0-9+/=]+)$/i.exec(dataUrl || "");
  if (!match) {
    throw new Error("Unsupported image format.");
  }

  const mimeType = match[1].toLowerCase();
  const base64 = match[2];
  const extension = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  const safeName = slugify(fileName) || "cover";
  const targetName = `${safeName}-${Date.now()}.${extension}`;
  const relativePath = path.join(targetDir, targetName);
  const absolutePath = path.join(repoRoot, relativePath);

  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, Buffer.from(base64, "base64"));

  return relativePath.replaceAll("\\", "/");
}

function saveUploadedCover(repoRoot, payload) {
  return saveImageDataUrl(repoRoot, COVERS_DIR, payload);
}

function saveGalleryPhoto(repoRoot, payload) {
  return saveImageDataUrl(repoRoot, GALLERY_DIR, payload);
}

function normalizeRelativeImagePath(imagePath) {
  return String(imagePath || "")
    .replaceAll("\\", "/")
    .replace(/^\/+/, "");
}

function resolveManagedCoverPath(repoRoot, imagePath) {
  const normalizedPath = normalizeRelativeImagePath(imagePath);
  if (!normalizedPath.startsWith(`${COVERS_PREFIX}/`)) {
    return null;
  }

  const coversRoot = path.resolve(repoRoot, COVERS_DIR);
  const absolutePath = path.resolve(repoRoot, normalizedPath);
  if (!absolutePath.startsWith(`${coversRoot}${path.sep}`)) {
    return null;
  }

  return {
    absolutePath,
    relativePath: normalizedPath
  };
}

function collectManagedCoverPaths(repoRoot, games) {
  const paths = new Set();

  (Array.isArray(games) ? games : []).forEach((game) => {
    const resolved = resolveManagedCoverPath(repoRoot, game?.image);
    if (resolved) {
      paths.add(resolved.relativePath);
    }
  });

  return paths;
}

function listManagedCoverFiles(repoRoot) {
  const coversRoot = path.join(repoRoot, COVERS_DIR);
  if (!fs.existsSync(coversRoot)) {
    return [];
  }

  return fs.readdirSync(coversRoot)
    .filter((fileName) => COVER_EXTENSIONS.has(path.extname(fileName).toLowerCase()))
    .map((fileName) => `${COVERS_PREFIX}/${fileName}`);
}

function removeUnusedCovers(repoRoot, { previousGames = [], nextGames = [], preservedGames = [] } = {}) {
  const cleanupCandidates = new Set([
    ...listManagedCoverFiles(repoRoot),
    ...collectManagedCoverPaths(repoRoot, previousGames)
  ]);
  const activeCoverPaths = new Set([
    ...collectManagedCoverPaths(repoRoot, nextGames),
    ...collectManagedCoverPaths(repoRoot, preservedGames)
  ]);
  const removedCoverPaths = [];

  cleanupCandidates.forEach((relativePath) => {
    if (activeCoverPaths.has(relativePath)) {
      return;
    }

    const resolved = resolveManagedCoverPath(repoRoot, relativePath);
    if (!resolved || !fs.existsSync(resolved.absolutePath)) {
      return;
    }

    fs.unlinkSync(resolved.absolutePath);
    removedCoverPaths.push(relativePath);
  });

  return removedCoverPaths;
}

function resolveManagedGalleryPath(repoRoot, imagePath) {
  const normalizedPath = normalizeRelativeImagePath(imagePath);
  const galleryPrefix = GALLERY_DIR.replaceAll("\\", "/");
  if (!normalizedPath.startsWith(`${galleryPrefix}/`)) {
    return null;
  }

  const galleryRoot = path.resolve(repoRoot, GALLERY_DIR);
  const absolutePath = path.resolve(repoRoot, normalizedPath);
  if (!absolutePath.startsWith(`${galleryRoot}${path.sep}`)) {
    return null;
  }

  return {
    absolutePath,
    relativePath: normalizedPath
  };
}

function listGalleryPhotos(repoRoot) {
  const galleryRoot = path.join(repoRoot, GALLERY_DIR);
  if (!fs.existsSync(galleryRoot)) {
    return [];
  }

  return fs.readdirSync(galleryRoot)
    .filter((fileName) => COVER_EXTENSIONS.has(path.extname(fileName).toLowerCase()))
    .map((fileName) => {
      const relativePath = `${GALLERY_DIR.replaceAll("\\", "/")}/${fileName}`;
      const stats = fs.statSync(path.join(galleryRoot, fileName));
      return {
        path: relativePath,
        name: fileName,
        createdAt: stats.birthtime.toISOString()
      };
    })
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt));
}

function deleteGalleryPhoto(repoRoot, imagePath) {
  const resolved = resolveManagedGalleryPath(repoRoot, imagePath);
  if (!resolved || !fs.existsSync(resolved.absolutePath)) {
    throw new Error("Gallery photo not found.");
  }

  fs.unlinkSync(resolved.absolutePath);
  return resolved.relativePath;
}

module.exports = {
  COLLECTION_FILE,
  COVERS_DIR,
  GALLERY_DIR,
  loadCollection,
  saveCollection,
  saveUploadedCover,
  saveGalleryPhoto,
  listGalleryPhotos,
  deleteGalleryPhoto,
  removeUnusedCovers,
  slugify
};
