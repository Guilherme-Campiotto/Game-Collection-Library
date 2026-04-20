const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const indexHtml = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");

test("index.html contains the main interactive sections", () => {
  const requiredIds = [
    "stats-grid",
    "search-input",
    "platform-filter",
    "genre-filter",
    "status-filter",
    "games-grid",
    "games-table-scroll-top",
    "games-table-scroll-spacer",
    "games-table-body",
    "bulk-edit-table",
    "bulk-save-table",
    "bulk-cancel-table",
    "bulk-action-footer",
    "bulk-save-table-bottom",
    "bulk-cancel-table-bottom",
    "game-form",
    "menu-language-toggle",
    "nav-home-link",
    "nav-rare-link",
    "nav-gallery-link",
    "identify-by-photo",
    "configure-ai-key",
    "toast-container"
  ];

  for (const id of requiredIds) {
    assert.match(indexHtml, new RegExp(`id="${id}"`), `Missing #${id} in index.html`);
  }
});

test("index.html loads the main app script locally", () => {
  assert.doesNotMatch(indexHtml, /data\/seed-games\.js/);
  assert.match(indexHtml, /<script src="app\.js"><\/script>/);
});
