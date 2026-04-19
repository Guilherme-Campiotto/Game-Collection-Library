const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  deleteGalleryPhoto,
  listGalleryPhotos,
  loadCollection,
  removeUnusedCovers,
  saveCollection,
  saveGalleryPhoto,
  saveUploadedCover
} = require("../server/storage");

test("server storage can load library games from the repository", () => {
  const repoRoot = path.resolve(__dirname, "..");
  const games = loadCollection(repoRoot);

  assert.ok(Array.isArray(games));
  assert.ok(games.length > 0);
});

test("server storage persists uploaded covers inside assets/covers", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "gcl-storage-"));
  fs.mkdirSync(path.join(tempRoot, "assets", "covers"), { recursive: true });

  const imagePath = saveUploadedCover(tempRoot, {
    fileName: "Switch Zelda",
    dataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WnHCqQAAAAASUVORK5CYII="
  });

  assert.match(imagePath, /^assets\/covers\/switch-zelda-\d+\.png$/);
  assert.ok(fs.existsSync(path.join(tempRoot, imagePath)));
});

test("server storage manages gallery photos inside assets/gallery", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "gcl-gallery-"));
  const photoPath = saveGalleryPhoto(tempRoot, {
    fileName: "Minha Estante",
    dataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WnHCqQAAAAASUVORK5CYII="
  });

  assert.match(photoPath, /^assets\/gallery\/minha-estante-\d+\.png$/);
  assert.ok(fs.existsSync(path.join(tempRoot, photoPath)));

  const photos = listGalleryPhotos(tempRoot);
  assert.equal(photos.length, 1);
  assert.equal(photos[0].path, photoPath);

  const deletedPath = deleteGalleryPhoto(tempRoot, photoPath);
  assert.equal(deletedPath, photoPath);
  assert.equal(fs.existsSync(path.join(tempRoot, photoPath)), false);
});

test("server storage persists and reloads the collection file", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "gcl-collection-"));
  const dataDir = path.join(tempRoot, "data");
  fs.mkdirSync(dataDir, { recursive: true });

  saveCollection(tempRoot, [
    {
      id: "custom",
      title: "Custom Game",
      platform: "Switch",
      genre: "Adventure",
      releaseYear: 2024,
      averagePriceBrl: 250,
      status: "Na fila",
      format: "Fisica",
      image: "assets/covers/custom.jpg"
    }
  ]);

  const loaded = loadCollection(tempRoot);
  const ids = loaded.map((game) => game.id);

  assert.deepEqual(ids, ["custom"]);
});

test("server storage removes old uploaded covers that are no longer referenced", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "gcl-cleanup-"));
  const coversDir = path.join(tempRoot, "assets", "covers");
  fs.mkdirSync(coversDir, { recursive: true });

  const oldCover = path.join(coversDir, "old-cover.jpg");
  const activeCover = path.join(coversDir, "active-cover.jpg");
  const protectedCover = path.join(coversDir, "protected-cover.jpg");
  const orphanCover = path.join(coversDir, "orphan-cover.jpg");
  fs.writeFileSync(oldCover, "old");
  fs.writeFileSync(activeCover, "active");
  fs.writeFileSync(protectedCover, "protected");
  fs.writeFileSync(orphanCover, "orphan");

  const removed = removeUnusedCovers(tempRoot, {
    previousGames: [
      { id: "old", image: "assets/covers/old-cover.jpg" },
      { id: "active", image: "assets/covers/active-cover.jpg" },
      { id: "protected", image: "assets/covers/protected-cover.jpg" }
    ],
    nextGames: [
      { id: "active", image: "assets/covers/active-cover.jpg" }
    ],
    preservedGames: [
      { id: "protected", image: "assets/covers/protected-cover.jpg" }
    ]
  });

  assert.deepEqual(removed.sort(), ["assets/covers/old-cover.jpg", "assets/covers/orphan-cover.jpg"]);
  assert.equal(fs.existsSync(oldCover), false);
  assert.equal(fs.existsSync(activeCover), true);
  assert.equal(fs.existsSync(protectedCover), true);
  assert.equal(fs.existsSync(orphanCover), false);
});
