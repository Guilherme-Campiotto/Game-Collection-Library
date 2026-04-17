const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function loadSeedGames(repoRoot) {
  const seedFile = path.join(repoRoot, "data", "seed-games.js");
  const source = fs.readFileSync(seedFile, "utf8");
  const context = { window: {} };

  vm.createContext(context);
  vm.runInContext(source, context, { filename: seedFile });

  return context.window.SEED_GAMES;
}

module.exports = { loadSeedGames };
