const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { getRateLimitRetryDelay, hasOpenAiKey, normalizeIdentifiedGames, saveOpenAiKey } = require("../server/ai");

test("OpenAI key is saved in local config outside source files", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "gcl-ai-"));

  assert.equal(hasOpenAiKey(tempRoot), false);

  saveOpenAiKey(tempRoot, "sk-test");

  const configPath = path.join(tempRoot, ".local", "openai-key.json");
  assert.equal(hasOpenAiKey(tempRoot), true);
  assert.deepEqual(JSON.parse(fs.readFileSync(configPath, "utf8")), { apiKey: "sk-test" });
});

test(".local is ignored by git", () => {
  const repoRoot = path.resolve(__dirname, "..");
  const gitignore = fs.readFileSync(path.join(repoRoot, ".gitignore"), "utf8");

  assert.match(gitignore, /^\.local\/$/m);
});

test("AI photo identification can normalize multiple games", () => {
  const games = normalizeIdentifiedGames({
    games: [
      {
        title: "Final Fantasy VII Rebirth",
        platform: "PS5",
        genre: "RPG",
        releaseYear: 2024,
        averagePriceBrl: 240,
        coverImageUrl: "https://example.com/final-fantasy-vii-rebirth-ps5.jpg"
      },
      {
        title: "Super Mario Odyssey",
        platform: "Switch",
        genre: "Plataforma",
        releaseYear: 2017,
        averagePriceBrl: 220
      }
    ]
  });

  assert.equal(games.length, 2);
  assert.equal(games[0].title, "Final Fantasy VII Rebirth");
  assert.equal(games[0].coverImageUrl, "https://example.com/final-fantasy-vii-rebirth-ps5.jpg");
  assert.equal(games[1].title, "Super Mario Odyssey");
  assert.notEqual(games[0].id, games[1].id);
});

test("AI photo identification still accepts a single-game response", () => {
  const games = normalizeIdentifiedGames({
    title: "Dead Space",
    platform: "PS3",
    genre: "Terror",
    releaseYear: 2008,
    averagePriceBrl: 120
  });

  assert.equal(games.length, 1);
  assert.equal(games[0].title, "Dead Space");
});

test("rate limit retry delay uses the retry time from the OpenAI error message", () => {
  const delay = getRateLimitRetryDelay(
    {
      error: {
        message: "Rate limit reached. Please try again in 6.113s."
      }
    },
    {
      headers: new Map()
    }
  );

  assert.equal(delay, 6113);
});

test("rate limit retry delay prefers retry-after headers", () => {
  const delay = getRateLimitRetryDelay(
    {
      error: {
        message: "Please try again in 6.113s."
      }
    },
    {
      headers: new Map([["retry-after", "2"]])
    }
  );

  assert.equal(delay, 2000);
});
