const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { hasOpenAiKey, saveOpenAiKey } = require("../server/ai");

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
