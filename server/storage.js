const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const COLLECTION_FILE = path.join("data", "library-games.json");
const COVERS_DIR = path.join("assets", "covers");

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function loadSeedGames(repoRoot) {
  const seedFile = path.join(repoRoot, "data", "seed-games.js");
  const source = fs.readFileSync(seedFile, "utf8");
  const context = { window: {} };

  vm.createContext(context);
  vm.runInContext(source, context, { filename: seedFile });

  return Array.isArray(context.window.SEED_GAMES) ? context.window.SEED_GAMES : [];
}

function mergeWithSeeds(seedGames, collection) {
  const mergedById = new Map();

  seedGames.forEach((game) => {
    mergedById.set(game.id, { ...game });
  });

  collection.forEach((game) => {
    if (game && game.id) {
      mergedById.set(game.id, { ...game });
    }
  });

  return [...mergedById.values()];
}

function loadCollection(repoRoot) {
  const seedGames = loadSeedGames(repoRoot);
  const collectionPath = path.join(repoRoot, COLLECTION_FILE);

  if (!fs.existsSync(collectionPath)) {
    return seedGames;
  }

  const content = fs.readFileSync(collectionPath, "utf8");
  const parsed = JSON.parse(content);
  const collection = Array.isArray(parsed) ? parsed : parsed.games;

  if (!Array.isArray(collection)) {
    throw new Error("Collection file must contain an array of games.");
  }

  return mergeWithSeeds(seedGames, collection);
}

function saveCollection(repoRoot, games) {
  const collectionPath = path.join(repoRoot, COLLECTION_FILE);
  fs.mkdirSync(path.dirname(collectionPath), { recursive: true });
  fs.writeFileSync(collectionPath, `${JSON.stringify(games, null, 2)}\n`, "utf8");
  return collectionPath;
}

function saveUploadedCover(repoRoot, { fileName, dataUrl }) {
  const match = /^data:(image\/(?:png|jpeg|webp));base64,([a-z0-9+/=]+)$/i.exec(dataUrl || "");
  if (!match) {
    throw new Error("Unsupported image format.");
  }

  const mimeType = match[1].toLowerCase();
  const base64 = match[2];
  const extension = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  const safeName = slugify(fileName) || "cover";
  const targetName = `${safeName}-${Date.now()}.${extension}`;
  const relativePath = path.join(COVERS_DIR, targetName);
  const absolutePath = path.join(repoRoot, relativePath);

  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, Buffer.from(base64, "base64"));

  return relativePath.replaceAll("\\", "/");
}

module.exports = {
  COLLECTION_FILE,
  COVERS_DIR,
  loadSeedGames,
  loadCollection,
  saveCollection,
  saveUploadedCover,
  mergeWithSeeds,
  slugify
};
