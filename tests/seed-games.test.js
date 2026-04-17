const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { loadSeedGames } = require("./helpers/load-seed-games");

const repoRoot = path.resolve(__dirname, "..");
const seedGames = loadSeedGames(repoRoot);

test("seed games define a non-empty collection with unique ids", () => {
  assert.ok(Array.isArray(seedGames));
  assert.ok(seedGames.length > 0);

  const ids = seedGames.map((game) => game.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("seed games include the required catalog fields", () => {
  for (const game of seedGames) {
    assert.ok(game.id, "Game id is required");
    assert.ok(game.title, `Title is required for ${game.id}`);
    assert.ok(game.platform, `Platform is required for ${game.id}`);
    assert.ok(game.genre, `Genre is required for ${game.id}`);
    assert.equal(typeof game.releaseYear, "number", `Release year must be numeric for ${game.id}`);
    assert.equal(typeof game.averagePriceBrl, "number", `Average price must be numeric for ${game.id}`);
    assert.ok(game.status, `Status is required for ${game.id}`);
    assert.ok(game.format, `Format is required for ${game.id}`);
    assert.ok(game.image, `Image is required for ${game.id}`);
  }
});

test("seed games use local cover assets that exist inside the project", () => {
  for (const game of seedGames) {
    assert.ok(!/^https?:\/\//i.test(game.image), `Seed image should be local for ${game.id}`);

    const imagePath = path.join(repoRoot, game.image);
    assert.ok(fs.existsSync(imagePath), `Missing local cover file for ${game.id}: ${game.image}`);
  }
});

test("seed games keep plausible year and price ranges", () => {
  for (const game of seedGames) {
    assert.ok(game.releaseYear >= 1980 && game.releaseYear <= 2035, `Unexpected year for ${game.id}`);
    assert.ok(game.averagePriceBrl >= 0, `Average price must be positive for ${game.id}`);
  }
});
