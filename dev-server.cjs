const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || process.argv[2] || 8787);
const routes = {
  "/": "index.html",
  "/fire-calculator": "fire-calculator.html",
  "/about": "about.html",
  "/privacy": "privacy.html",
  "/terms": "terms.html",
  "/contact": "contact.html",
  "/disclaimer": "disclaimer.html"
};
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};

http.createServer((req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${port}`);
  if (url.pathname === "/compound-interest" || url.pathname === "/compound-interest.html") {
    res.writeHead(301, { Location: "/" });
    res.end();
    return;
  }

  const file = routes[url.pathname] || url.pathname.slice(1);
  const fullPath = path.resolve(root, file);

  if (!fullPath.startsWith(root) || !fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("not found");
    return;
  }

  res.writeHead(200, {
    "Content-Type": types[path.extname(fullPath)] || "application/octet-stream",
    "Cache-Control": "no-store"
  });
  fs.createReadStream(fullPath).pipe(res);
}).listen(port, "127.0.0.1", () => {
  console.log(`Local server running: http://127.0.0.1:${port}/`);
});
