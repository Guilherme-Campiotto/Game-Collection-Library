const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const galleryHtml = fs.readFileSync(path.join(repoRoot, "gallery.html"), "utf8");
const galleryJs = fs.readFileSync(path.join(repoRoot, "gallery.js"), "utf8");

test("gallery.html contains the gallery upload and lightbox sections", () => {
  const requiredIds = [
    "gallery-nav-home-link",
    "gallery-nav-rare-link",
    "gallery-nav-link",
    "gallery-upload-input",
    "gallery-grid",
    "gallery-lightbox",
    "gallery-lightbox-close",
    "gallery-lightbox-image",
    "toast-container"
  ];

  for (const id of requiredIds) {
    assert.match(galleryHtml, new RegExp(`id="${id}"`), `Missing #${id} in gallery.html`);
  }
});

test("gallery page uses project gallery endpoints", () => {
  assert.match(galleryHtml, /<script src="gallery\.js"><\/script>/);
  assert.match(galleryJs, /\/api\/gallery/);
  assert.match(galleryJs, /\/api\/gallery\/upload/);
  assert.match(galleryJs, /\/api\/gallery\/photo/);
});
