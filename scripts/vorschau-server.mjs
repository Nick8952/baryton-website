// Lokaler Testserver, der den statischen Export so ausliefert wie GitHub Pages:
// unter dem Repository-Unterpfad, mit index.html bei Ordnern und 404.html bei Fehlern.
// Aufruf: npm run vorschau:pages  → http://localhost:4321/baryton-website/
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const wurzel = path.resolve(import.meta.dirname, "..", "out");
const basePath = process.env.BASE_PATH ?? "/baryton-website";
const port = Number(process.env.PORT ?? 4321);
const typen = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".txt": "text/plain", ".xml": "application/xml", ".ico": "image/x-icon" };

createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://x");
  let p = decodeURIComponent(url.pathname);
  if (!p.startsWith(basePath + "/") && p !== basePath) {
    res.writeHead(404, { "content-type": "text/plain" }); return res.end("Ausserhalb des Unterpfads (wie auf GitHub Pages).");
  }
  p = p.slice(basePath.length) || "/";
  let datei = path.join(wurzel, p);
  try {
    if ((await stat(datei)).isDirectory()) datei = path.join(datei, "index.html");
  } catch {
    if (!path.extname(datei)) datei = datei + ".html";
  }
  try {
    const inhalt = await readFile(datei);
    res.writeHead(200, { "content-type": typen[path.extname(datei)] ?? "application/octet-stream" });
    res.end(inhalt);
  } catch {
    res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
    res.end(await readFile(path.join(wurzel, "404.html")));
  }
}).listen(port, () => console.log(`Vorschau: http://localhost:${port}${basePath}/`));
