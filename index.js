const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = parseInt(process.env.PORT, 10) || 3000;
const DIST = path.join(__dirname, "dist");

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".webp": "image/webp",
  ".txt": "text/plain",
  ".xml": "application/xml",
  ".pdf": "application/pdf",
};

const server = http.createServer((req, res) => {
  const url = req.url.split("?")[0];

  if (url === "/healthz") {
    res.writeHead(200);
    res.end("ok");
    return;
  }

  const fp = path.join(DIST, url);
  try {
    if (fs.existsSync(fp) && fs.statSync(fp).isFile()) {
      const ext = path.extname(fp);
      const headers = { "Content-Type": mime[ext] || "application/octet-stream" };
      if (url.includes("/assets/")) headers["Cache-Control"] = "public, max-age=31536000, immutable";
      res.writeHead(200, headers);
      fs.createReadStream(fp).pipe(res);
      return;
    }
  } catch (e) {}

  const idx = path.join(DIST, "index.html");
  if (fs.existsSync(idx)) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    fs.createReadStream(idx).pipe(res);
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("Server started on 0.0.0.0:" + PORT);
});

server.on("error", (err) => {
  console.error("Server error:", err);
  process.exit(1);
});
