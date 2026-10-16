// Servidor local mínimo para probar la web: node server.js  →  http://localhost:5173
const http = require("http"), fs = require("fs"), path = require("path");
const root = __dirname, port = process.env.PORT || 5173;
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon" };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  // Funciones de /api como en Vercel (api/auth/login.js → /api/auth/login)
  if (p.startsWith("/api/") && !p.includes("_lib")) {
    const fn = path.join(root, p + ".js");
    if (!fn.startsWith(path.join(root, "api")) || !fs.existsSync(fn)) { res.writeHead(404); return res.end("No encontrado"); }
    req.query = Object.fromEntries(new URL(req.url, "http://x").searchParams);
    res.status = c => { res.statusCode = c; return res; };
    res.json = d => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(d)); };
    return Promise.resolve(require(fn)(req, res)).catch(e => { console.error(e); res.statusCode = 500; res.end(); });
  }
  if (p.endsWith("/")) p += "index.html";
  const file = path.join(root, p);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end("No encontrado"); }
    res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(data);
  });
}).listen(port, () => console.log(`Kairos en http://localhost:${port}`));
