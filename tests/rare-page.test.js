const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const rareHtml = fs.readFileSync(path.join(repoRoot, "rare.html"), "utf8");

test("rare.html contains the podium and rare games table sections", () => {
  const requiredIds = [
    "menu-language-toggle",
    "rare-nav-home-link",
    "rare-nav-link",
    "rare-nav-gallery-link",
    "rare-podium",
    "rare-table-body"
  ];

  for (const id of requiredIds) {
    assert.match(rareHtml, new RegExp(`id="${id}"`), `Missing #${id} in rare.html`);
  }
});

test("rare.html loads the rarity script locally", () => {
  assert.doesNotMatch(rareHtml, /data\/seed-games\.js/);
  assert.match(rareHtml, /<script src="rare\.js"><\/script>/);
});
