/**
 * Prüft die lokalen Inhaltsdateien (data/) auf Vollständigkeit – läuft ohne Sanity.
 *   npm run inhalt:pruefen
 * Meldet fehlende Bilder, fehlende Alt-Texte, doppelte Slugs/_keys, unbekannte Bausteine,
 * unbekannte Kategorie-IDs, unsaubere Preise/Preisvarianten, unsaubere Öffnungszeiten,
 * fehlende Rechtstexte und interne Links auf nicht vorhandene Seiten.
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const DATA = path.resolve(process.cwd(), "data");
const json = async <T,>(p: string): Promise<T> => JSON.parse(await readFile(path.join(DATA, p), "utf8")) as T;
const fehler: string[] = [];
// Die Demo kommt ohne Fotos aus – ohne Bildverzeichnis sind schlicht keine Bilder referenzierbar.
const bilder = await json<Record<string, unknown>>("bilder.json").catch(() => ({}) as Record<string, unknown>);
const BAUSTEINE = new Set([
  "textBaustein",
  "karteBaustein",
  "speisenBaustein",
  "oeffnungszeitenBaustein",
  "faktenBaustein",
  "spaltenBaustein",
  "bildBaustein",
  "kontaktBaustein",
  "aufrufBaustein",
  "rechtstextBaustein",
]);
const WOCHENTAGE = new Set(["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"]);
// Gleiche Regel wie lib/assets.ts#istErlaubtesLinkziel
const linkErlaubt = (z: string) => /^\/(?!\/)/.test(z) || /^(https?:\/\/[^\s]+|mailto:[^\s]+|tel:\+?[\d\s()-]+)$/.test(z);

function bildPruefen(ref: { bild?: string; alt?: string } | undefined, ort: string) {
  if (!ref) return;
  if (!ref.bild || !bilder[ref.bild]) fehler.push(`${ort}: Bild «${ref.bild}» fehlt in bilder.json`);
  if (typeof ref.alt !== "string") fehler.push(`${ort}: Alt-Text fehlt`);
}

interface Kategorie {
  id: string;
  titel: string;
  reihenfolge: number;
}
interface Eintrag {
  id: string;
  name: string;
  preis?: unknown;
  varianten?: { _key?: string; bezeichnung?: string; preis?: unknown }[];
  menge?: unknown;
  kategorie: string;
  reihenfolge: number;
}

/** Prüft eine Preis-Angabe: höchstens zwei Nachkommastellen, keine negativen Werte. */
function preisPruefen(preis: unknown, ort: string) {
  if (preis === undefined) return;
  if (typeof preis !== "number" || !Number.isFinite(preis) || preis < 0) {
    fehler.push(`${ort}: Preis muss eine Zahl in Franken sein (z. B. 18 oder 18.5)`);
  } else if (Math.abs(Math.round(preis * 100) - preis * 100) > 1e-6) {
    // Mehr als zwei Nachkommastellen würde die Anzeige still runden.
    // Grenzwert statt strikter Gleichheit, weil z. B. 17.9 * 100 als 1790.0000000000002 dargestellt wird.
    fehler.push(`${ort}: Preis mit höchstens zwei Nachkommastellen angeben`);
  }
}

/** Gemeinsame Prüfung für Getränke- und Speisekategorien (gleicher Aufbau). */
function kategorienPruefen(kategorien: Kategorie[], bezeichnung: string): Set<string> {
  const ids = new Set<string>();
  for (const k of kategorien) {
    if (!k.id) fehler.push(`${bezeichnung} ohne ID: ${JSON.stringify(k.titel ?? "?")}`);
    else if (ids.has(k.id)) fehler.push(`${bezeichnung} ${k.id}: doppelte ID`);
    if (k.id) ids.add(k.id);
    if (!k.titel) fehler.push(`${bezeichnung} ${k.id ?? "?"}: Titel fehlt`);
    if (!Number.isInteger(k.reihenfolge)) fehler.push(`${bezeichnung} ${k.id ?? "?"}: Reihenfolge fehlt oder keine Ganzzahl`);
  }
  return ids;
}

/** Gemeinsame Prüfung für Getränke- und Speiseeinträge (gleicher Aufbau, nur der Feldname für den Namen unterscheidet sich nicht mehr – beide heissen «name»). */
function eintraegePruefen(eintraege: Eintrag[], kategorieIds: Set<string>, bezeichnung: string): Set<string> {
  const ids = new Set<string>();
  for (const e of eintraege) {
    const kennung = e.id || "(ohne ID)";
    const ort = `${bezeichnung} ${kennung}`;
    if (!e.id) fehler.push(`${bezeichnung} ohne ID: ${JSON.stringify(e.name ?? "?")}`);
    else if (ids.has(e.id)) fehler.push(`${ort}: doppelte ID`);
    if (e.id) ids.add(e.id);
    if (!e.name) fehler.push(`${ort}: Bezeichnung fehlt`);
    if (!kategorieIds.has(e.kategorie)) fehler.push(`${ort}: Kategorie «${e.kategorie}» existiert nicht`);
    if (e.preis !== undefined && e.varianten?.length) {
      fehler.push(`${ort}: «preis» und «varianten» gleichzeitig gesetzt – nur eines von beiden verwenden`);
    }
    preisPruefen(e.preis, ort);
    if (e.varianten?.length) {
      const vk = new Set<string>();
      for (const v of e.varianten) {
        if (!v._key || vk.has(v._key)) fehler.push(`${ort}: Varianten-_key fehlt oder doppelt`);
        vk.add(v._key ?? "");
        if (!v.bezeichnung) fehler.push(`${ort}: Variante ohne Bezeichnung`);
        preisPruefen(v.preis, `${ort} (${v.bezeichnung ?? "?"})`);
        if (v.preis === undefined) fehler.push(`${ort}: Variante «${v.bezeichnung ?? "?"}» ohne Preis`);
      }
    }
    if (!Number.isInteger(e.reihenfolge)) fehler.push(`${ort}: Reihenfolge fehlt oder keine Ganzzahl`);
  }
  return ids;
}

const getraenkekategorien = await json<Kategorie[]>("getraenkekategorien.json");
const getraenkekategorieIds = kategorienPruefen(getraenkekategorien, "Getränkekategorie");
const getraenke = await json<Eintrag[]>("getraenke.json");
eintraegePruefen(getraenke, getraenkekategorieIds, "Getränk");

const speisekategorien = await json<Kategorie[]>("speisekategorien.json");
const speisekategorieIds = kategorienPruefen(speisekategorien, "Speisekategorie");
const speisen = await json<Eintrag[]>("speisen.json");
eintraegePruefen(speisen, speisekategorieIds, "Speise");

const seiten = (await readdir(path.join(DATA, "seiten"))).filter((f) => f.endsWith(".json"));
const slugs = new Set<string>();
const interneLinks: [string, string][] = [];
const linkSammeln = (ziel: unknown, ort: string) => {
  if (typeof ziel !== "string") return;
  if (!linkErlaubt(ziel)) fehler.push(`${ort}: unzulässiges Linkziel «${ziel}»`);
  if (ziel.startsWith("/")) interneLinks.push([ziel.replace(/\/$/, "").split("?")[0] || "/", ort]);
};
const pflicht = (b: Record<string, unknown>, felder: string[], ort: string) => {
  for (const f of felder) if (b[f] === undefined || b[f] === null || b[f] === "") fehler.push(`${ort}: Pflichtfeld «${f}» fehlt`);
};
/** Ein Link ohne Ziel würde erst im Browser auffallen – deshalb hier hart prüfen. */
const linkPruefen = (l: unknown, ort: string) => {
  if (l === undefined || l === null) return;
  const link = l as { titel?: unknown; ziel?: unknown };
  if (typeof link.titel !== "string" || !link.titel.trim()) fehler.push(`${ort}: Link ohne Beschriftung`);
  if (typeof link.ziel !== "string" || !link.ziel.trim()) fehler.push(`${ort}: Link ohne Ziel`);
  else linkSammeln(link.ziel, ort);
};

function richTextLinks(inhalt: unknown, ort: string) {
  for (const block of (inhalt as { markDefs?: { href?: string }[] }[]) ?? []) for (const m of block.markDefs ?? []) linkSammeln(m.href, ort);
}

/** Prüft einen Karten-Baustein (Getränke oder Speisen): Kategorien müssen existieren, sonst braucht es einen Hinweis. */
function kartenBausteinPruefen(
  b: Record<string, unknown>,
  ort: string,
  kategorieIds: Set<string>,
  eintraege: Eintrag[],
  eintraegeFeld: string,
) {
  const auswahl = (b.kategorien as string[]) ?? [];
  for (const id of auswahl) if (!kategorieIds.has(id)) fehler.push(`${ort}: Kategorie «${id}» existiert nicht`);
  const sichtbar = auswahl.length ? eintraege.filter((e) => auswahl.includes(e.kategorie)) : eintraege;
  if (!sichtbar.length && !b.hinweis) fehler.push(`${ort}: keine ${eintraegeFeld} sichtbar und kein Hinweistext hinterlegt`);
}

for (const f of seiten) {
  const s = await json<Record<string, unknown>>(`seiten/${f}`);
  const slug = s.slug as string;
  if (slugs.has(slug)) fehler.push(`Doppelter Slug: ${slug}`);
  slugs.add(slug);
  if (`${slug}.json` !== f) fehler.push(`${f}: Dateiname passt nicht zum Slug «${slug}»`);
  if (!s.titel) fehler.push(`${slug}: Titel fehlt`);
  const hero = s.hero as Record<string, unknown> | undefined;
  if (hero) for (const k of ["knopf", "zweiterKnopf"]) linkPruefen(hero[k], `${slug} hero › ${k}`);
  const keys = new Set<string>();
  for (const b of (s.bausteine as Record<string, unknown>[]) ?? []) {
    const ort = `${slug} › ${b._key}`;
    if (!BAUSTEINE.has(b._type as string)) fehler.push(`${ort}: unbekannter Baustein «${b._type}»`);
    if (!b._key) fehler.push(`${slug}: Baustein ohne _key`);
    if (keys.has(b._key as string)) fehler.push(`${ort}: doppelter _key`);
    keys.add(b._key as string);
    if ("bild" in b) bildPruefen(b.bild as never, ort);
    if ("inhalt" in b) richTextLinks(b.inhalt, ort);
    if (b._type === "textBaustein") pflicht(b, ["inhalt"], ort);
    if (b._type === "bildBaustein") pflicht(b, ["bild"], ort);
    if (b._type === "aufrufBaustein") pflicht(b, ["knopf"], ort);
    if (b._type === "kontaktBaustein" && typeof b.mitFormular !== "boolean") fehler.push(`${ort}: mitFormular muss true/false sein`);
    if (b._type === "oeffnungszeitenBaustein" && !["resonanz", "liste"].includes(b.darstellung as string)) fehler.push(`${ort}: darstellung muss «resonanz» oder «liste» sein`);
    if (b._type === "spaltenBaustein") {
      const spalten = (b.spalten as { _key?: string; titel?: string; inhalt?: unknown }[] | undefined) ?? [];
      if (!spalten.length || spalten.length > 3) fehler.push(`${ort}: 1–3 Spalten nötig`);
      const sk = new Set<string>();
      for (const sp of spalten) {
        if (!sp._key || sk.has(sp._key)) fehler.push(`${ort}: Spalten-_key fehlt oder doppelt`);
        sk.add(sp._key ?? "");
        if (!sp.titel || !sp.inhalt) fehler.push(`${ort}: Spalte ohne Titel/Inhalt`);
        richTextLinks(sp.inhalt, ort);
      }
    }
    if (b._type === "faktenBaustein") {
      const fk = new Set<string>();
      for (const f of (b.fakten as { _key?: string; bezeichnung?: string; wert?: string }[] | undefined) ?? []) {
        if (!f._key || fk.has(f._key)) fehler.push(`${ort}: Fakten-_key fehlt oder doppelt`);
        fk.add(f._key ?? "");
        if (!f.bezeichnung || !f.wert) fehler.push(`${ort}: Faktum ohne Bezeichnung/Wert`);
      }
      if (!((b.fakten as unknown[])?.length)) fehler.push(`${ort}: keine Fakten`);
    }
    if (b._type === "karteBaustein") kartenBausteinPruefen(b, ort, getraenkekategorieIds, getraenke, "Getränke");
    if (b._type === "speisenBaustein") kartenBausteinPruefen(b, ort, speisekategorieIds, speisen, "Speisen");
    for (const k of ["knopf", "zweiterKnopf", "weiterLink"]) linkPruefen(b[k], `${ort} › ${k}`);
    if (b._type === "rechtstextBaustein") {
      try { await readFile(path.join(DATA, `rechtstexte/${b.rechtstext}.json`)); } catch { fehler.push(`${ort}: Rechtstext «${b.rechtstext}» fehlt`); }
    }
  }
}
const e = await json<Record<string, unknown>>("einstellungen.json");
bildPruefen((e.seo as { bild?: never }).bild, "Einstellungen SEO-Bild");
for (const k of ["firmenname", "kurzname", "telefon"]) if (!e[k]) fehler.push(`Einstellungen: ${k} fehlt`);
{
  const ZEIT = /^([01]\d|2[0-3]):[0-5]\d$/;
  const zk = new Set<string>();
  const tage = new Set<string>();
  for (const z of (e.oeffnungszeiten as { _key?: string; tage?: string; zeiten?: string; wochentag?: string; von?: string; bis?: string; geschlossen?: boolean }[]) ?? []) {
    if (!z._key || zk.has(z._key)) fehler.push(`Öffnungszeiten: _key fehlt oder doppelt (${z.tage ?? "?"})`);
    zk.add(z._key ?? "");
    if (!z.tage || !z.zeiten) fehler.push(`Öffnungszeiten: «tage»/«zeiten» fehlt bei ${z._key ?? "?"}`);
    if (z.von && !ZEIT.test(z.von)) fehler.push(`Öffnungszeiten ${z._key}: «von» keine gültige Uhrzeit (HH:MM)`);
    if (z.bis && !ZEIT.test(z.bis)) fehler.push(`Öffnungszeiten ${z._key}: «bis» keine gültige Uhrzeit (HH:MM)`);
    if (z.wochentag && !WOCHENTAGE.has(z.wochentag)) fehler.push(`Öffnungszeiten ${z._key}: «${z.wochentag}» ist kein Wochentag`);
    if (!z.geschlossen && (z.wochentag ? !z.von || !z.bis : z.von || z.bis)) fehler.push(`Öffnungszeiten ${z._key}: «wochentag», «von» und «bis» gehören zusammen (oder «geschlossen» setzen)`);
    if (z.wochentag) {
      if (tage.has(z.wochentag)) fehler.push(`Öffnungszeiten: «${z.wochentag}» kommt doppelt vor`);
      tage.add(z.wochentag);
    }
  }
  // Der Geöffnet-Hinweis und die Wochengrafik brauchen alle sieben Tage – sonst fehlen Zeilen.
  if (tage.size && tage.size < 7) {
    fehler.push(`Öffnungszeiten: nur ${tage.size} von 7 Wochentagen erfasst (fehlend: ${[...WOCHENTAGE].filter((t) => !tage.has(t)).join(", ")})`);
  }
}
for (const l of [...(e.navigation as { ziel: string }[]), ...(e.rechtslinks as { ziel: string }[])]) linkSammeln(l.ziel, "Einstellungen");
for (const t of await readdir(path.join(DATA, "rechtstexte"))) richTextLinks((await json<{ inhalt: unknown }>(`rechtstexte/${t}`)).inhalt, `Rechtstext ${t}`);

for (const [ziel, ort] of interneLinks) {
  const slug = ziel === "/" ? "start" : ziel.slice(1).split("#")[0];
  if (!slugs.has(slug)) fehler.push(`${ort}: interner Link «${ziel}» zeigt auf keine Seite`);
}

if (fehler.length) {
  console.error(`✗ ${fehler.length} Problem(e):\n` + fehler.map((f) => `  - ${f}`).join("\n"));
  process.exit(1);
}
console.log(
  `✓ Inhalte in Ordnung: ${seiten.length} Seiten, ${getraenkekategorien.length} Getränkekategorien, ${getraenke.length} Getränke, ` +
    `${speisekategorien.length} Speisekategorien, ${speisen.length} Speisen, ${Object.keys(bilder).length} Bild(er), ${interneLinks.length} interne Links geprüft.`,
);
