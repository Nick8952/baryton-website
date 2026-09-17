// Prüft den fertigen statischen Export (out/) so, wie er auf GitHub Pages liegt:
//  - jede Seite hat index.html + 404.html vorhanden
//  - alle internen href/src beginnen mit dem Unterpfad und zeigen auf vorhandene Dateien
//  - keine externen Ressourcen (Skripte, Stylesheets, Bilder, Schriften) von fremden Hosts,
//    auch nicht per url(...) oder @import aus den exportierten CSS-Dateien
//  - jede Seite trägt <meta name="robots" content="noindex"> solange INDEXIERUNG nicht gesetzt ist
// Aufruf: npm run export:pruefen   (nach npm run build:pages)
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const WURZEL = path.resolve(import.meta.dirname, "..", "out");
const basePath = (process.env.BASE_PATH ?? "/baryton-website").replace(/\/$/, "");
const indexierung = process.env.INDEXIERUNG === "1";
const fehler = [];

async function htmlDateien(ordner) {
  const liste = [];
  for (const e of await readdir(ordner, { withFileTypes: true })) {
    const p = path.join(ordner, e.name);
    if (e.isDirectory()) liste.push(...(await htmlDateien(p)));
    else if (e.name.endsWith(".html")) liste.push(p);
  }
  return liste;
}
async function existiert(p) {
  try { await stat(p); return true; } catch { return false; }
}

/** Alle Dateien mit einer bestimmten Endung im Export. */
async function dateienMit(ordner, endung) {
  const liste = [];
  for (const e of await readdir(ordner, { withFileTypes: true })) {
    const p = path.join(ordner, e.name);
    if (e.isDirectory()) liste.push(...(await dateienMit(p, endung)));
    else if (e.name.endsWith(endung)) liste.push(p);
  }
  return liste;
}

let seiten;
try {
  seiten = await htmlDateien(WURZEL);
} catch {
  console.error("✗ out/ fehlt – zuerst `npm run build:pages` ausführen.");
  process.exit(1);
}
if (!seiten.length) { console.error("✗ out/ enthält keine HTML-Dateien."); process.exit(1); }
const erwarteteSeiten = ["index.html", "404.html", "getraenke/index.html", "besuch/index.html", "impressum/index.html", "datenschutz/index.html"];
for (const s of erwarteteSeiten) if (!(await existiert(path.join(WURZEL, s)))) fehler.push(`Seite fehlt im Export: ${s}`);
if (!(await existiert(path.join(WURZEL, "404.html")))) fehler.push("out/404.html fehlt");
let geprueft = 0;
for (const datei of seiten) {
  const html = await readFile(datei, "utf8");
  const rel = path.relative(WURZEL, datei);
  if (!indexierung && !/<meta name="robots" content="noindex/.test(html)) fehler.push(`${rel}: kein noindex`);
  // Next setzt selbst <link rel="preconnect" href="/"> (eigener Ursprung) – unproblematisch.
  const ohnePreconnect = html.replace(/<link rel="preconnect"[^>]*>/g, "");
  // Ressourcen-Tags (Skript, Stylesheet, Bild, Schrift, iframe …) dürfen keine fremden Hosts laden; <a href> nach aussen ist erlaubt.
  for (const tag of ohnePreconnect.matchAll(/<(script|link|img|source|video|audio|iframe|embed|object)\b[^>]*>/g)) {
    // <link rel="canonical|alternate"> verweist nur, lädt nichts – absolute Site-URL ist dort gewollt.
    if (tag[1] === "link" && /rel="(canonical|alternate|next|prev)"/.test(tag[0])) continue;
    for (const attr of tag[0].matchAll(/(?:src|href|srcset|data)="([^"]+)"/g)) {
      for (const u of attr[1].split(",").map((s) => s.trim().split(" ")[0])) {
        if (/^(https?:)?\/\//.test(u)) fehler.push(`${rel}: externe Ressource in <${tag[1]}>: ${u}`);
      }
    }
  }
  for (const imp of ohnePreconnect.matchAll(/@import\s+(?:url\()?["']?((?:https?:)?\/\/[^"')\s]+)/g)) fehler.push(`${rel}: externer CSS-Import ${imp[1]}`);
  for (const m of ohnePreconnect.matchAll(/(?:href|src|srcset)="([^"]+)"/g)) {
    for (const rohUrl of m[1].split(",").map((s) => s.trim().split(" ")[0])) {
      if (!rohUrl || rohUrl.startsWith("#") || /^(mailto:|tel:|data:)/.test(rohUrl)) continue;
      if (/^(https?:)?\/\//.test(rohUrl)) continue; // externe Links: oben geprüft, hier nur interne Ziele
      const url = rohUrl.split("?")[0].split("#")[0];
      if (!url.startsWith(basePath + "/") && url !== basePath) { fehler.push(`${rel}: Pfad ohne Unterpfad: ${rohUrl}`); continue; }
      let ziel = path.join(WURZEL, url.slice(basePath.length));
      if (url.endsWith("/")) ziel = path.join(ziel, "index.html");
      if (!(await existiert(ziel)) && !(await existiert(ziel + ".html")) && !(await existiert(ziel + ".txt"))) fehler.push(`${rel}: Ziel fehlt: ${rohUrl}`);
      geprueft++;
    }
  }
}
// Stylesheets gesondert: Schriften und Hintergrundbilder dürfen ebenfalls nicht von fremden
// Hosts kommen. Im HTML steht davon nichts, der Verweis steckt erst in der CSS-Datei.
let cssGeprueft = 0;
for (const datei of await dateienMit(WURZEL, ".css")) {
  const css = await readFile(datei, "utf8");
  const rel = path.relative(WURZEL, datei);
  for (const m of css.matchAll(/url\(\s*["']?((?:https?:)?\/\/[^"')\s]+)/g)) fehler.push(`${rel}: externe Ressource in url(): ${m[1]}`);
  for (const m of css.matchAll(/@import\s+(?:url\()?["']?((?:https?:)?\/\/[^"')\s]+)/g)) fehler.push(`${rel}: externer CSS-Import: ${m[1]}`);
  cssGeprueft++;
}

if (fehler.length) {
  console.error(`✗ ${fehler.length} Problem(e) im Export:\n` + [...new Set(fehler)].map((f) => `  - ${f}`).join("\n"));
  process.exit(1);
}
console.log(`✓ Export in Ordnung: ${seiten.length} HTML-Dateien, ${cssGeprueft} CSS-Dateien, ${geprueft} interne Verweise unter ${basePath}, noindex ${indexierung ? "aus (Indexierung erlaubt)" : "auf allen Seiten"}.`);
