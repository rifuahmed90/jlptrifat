/* Tiny zero-dependency static server for the Kanji PWA. */
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = __dirname;
const PORT = Number(process.argv[2]) || 8080;
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
};

const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch {
    res.writeHead(400);
    res.end("Bad request");
    return;
  }

  if (pathname.endsWith("/")) pathname += "index.html";
  const file = path.resolve(ROOT, "." + pathname);

  if (!file.startsWith(ROOT + path.sep) && file !== ROOT) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream",
      "Service-Worker-Allowed": "/",
    });
    res.end(data);
  });
});

function startServer(port) {
  server.removeAllListeners("error");
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`  Port ${port} is already busy. Trying http://localhost:${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error("  Server error:", err);
    }
  });

  server.listen(port, () => {
    console.log(`\n  =======================================`);
    console.log(`  Kanji app is running!`);
    console.log(`  Open in browser: http://localhost:${port}`);
    console.log(`  =======================================\n`);
    console.log(`  Press Ctrl+C to stop.\n`);
  });
}

startServer(PORT);
