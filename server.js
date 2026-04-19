const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const {
  deleteGalleryPhoto,
  listGalleryPhotos,
  loadCollection,
  removeUnusedCovers,
  saveCollection,
  saveGalleryPhoto,
  saveUploadedCover
} = require("./server/storage");
const {
  hasOpenAiKey,
  saveOpenAiKey,
  identifyGameFromPhoto
} = require("./server/ai");

const PORT = Number(process.env.PORT) || 3000;
const HOST = "127.0.0.1";
const REPO_ROOT = __dirname;

saveCollection(REPO_ROOT, loadCollection(REPO_ROOT));

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp"
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 10 * 1024 * 1024) {
        reject(new Error("Payload too large."));
        request.destroy();
      }
    });

    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function serveStatic(requestPath, response) {
  const normalizedPath = requestPath === "/" ? "/index.html" : requestPath;
  const safePath = path.normalize(normalizedPath).replace(/^(\.\.[/\\])+/, "");
  const targetPath = path.join(REPO_ROOT, safePath);

  if (!targetPath.startsWith(REPO_ROOT)) {
    sendJson(response, 403, { error: "Forbidden." });
    return;
  }

  fs.readFile(targetPath, (error, content) => {
    if (error) {
      sendJson(response, 404, { error: "Not found." });
      return;
    }

    const extension = path.extname(targetPath).toLowerCase();
    response.writeHead(200, {
      "Content-Type": MIME_TYPES[extension] || "application/octet-stream"
    });
    response.end(content);
  });
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  try {
    if (request.method === "GET" && url.pathname === "/api/collection") {
      const games = loadCollection(REPO_ROOT);
      sendJson(response, 200, { games });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/collection") {
      const body = await readBody(request);
      const payload = JSON.parse(body || "{}");
      const games = Array.isArray(payload) ? payload : payload.games;

      if (!Array.isArray(games)) {
        sendJson(response, 400, { error: "The body must include a games array." });
        return;
      }

      const previousGames = loadCollection(REPO_ROOT);
      saveCollection(REPO_ROOT, games);
      removeUnusedCovers(REPO_ROOT, {
        previousGames,
        nextGames: games
      });
      sendJson(response, 200, { games });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/upload") {
      const body = await readBody(request);
      const payload = JSON.parse(body || "{}");
      const imagePath = saveUploadedCover(REPO_ROOT, payload);
      sendJson(response, 200, { imagePath });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/gallery") {
      const photos = listGalleryPhotos(REPO_ROOT);
      sendJson(response, 200, { photos });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/gallery/upload") {
      const body = await readBody(request);
      const payload = JSON.parse(body || "{}");
      const photoPath = saveGalleryPhoto(REPO_ROOT, payload);
      sendJson(response, 200, { photo: { path: photoPath, name: path.basename(photoPath) } });
      return;
    }

    if (request.method === "DELETE" && url.pathname === "/api/gallery/photo") {
      const body = await readBody(request);
      const payload = JSON.parse(body || "{}");
      const deletedPath = deleteGalleryPhoto(REPO_ROOT, payload.path);
      sendJson(response, 200, { deletedPath });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/ai-key/status") {
      sendJson(response, 200, { configured: hasOpenAiKey(REPO_ROOT) });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/ai-key") {
      const body = await readBody(request);
      const payload = JSON.parse(body || "{}");
      saveOpenAiKey(REPO_ROOT, payload.apiKey);
      sendJson(response, 200, { configured: true });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/identify-game") {
      const body = await readBody(request);
      const payload = JSON.parse(body || "{}");
      const game = await identifyGameFromPhoto(REPO_ROOT, payload);
      sendJson(response, 200, { game });
      return;
    }

    if (request.method === "GET") {
      serveStatic(url.pathname, response);
      return;
    }

    sendJson(response, 405, { error: "Method not allowed." });
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { error: error.message || "Unexpected server error." });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Game Collection running at http://${HOST}:${PORT}`);
});
