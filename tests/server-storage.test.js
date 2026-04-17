const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { loadSeedGames, loadCollection, saveCollection, saveUploadedCover } = require("../server/storage");

test("server storage can load seed games from the repository", () => {
  const repoRoot = path.resolve(__dirname, "..");
  const games = loadSeedGames(repoRoot);

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

test("server storage persists and reloads the collection file", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "gcl-collection-"));
  const dataDir = path.join(tempRoot, "data");
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(
    path.join(dataDir, "seed-games.js"),
    'window.SEED_GAMES = [{ id: "seed", title: "Seed Game", platform: "PS4", genre: "Action", releaseYear: 2020, averagePriceBrl: 100, status: "Na fila", format: "Fisica", image: "assets/covers/seed.jpg" }];\n',
    "utf8"
  );

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
  const ids = loaded.map((game) => game.id).sort();

  assert.deepEqual(ids, ["custom", "seed"]);
});
