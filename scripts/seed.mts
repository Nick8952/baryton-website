/**
 * Importskript: lokale Demo-Inhalte (data/) und freigegebene Originalbilder (assets/originale/) → Sanity.
 *
 * NUR NACH DER SANITY-EINRICHTUNG AUSFÜHREN (docs/SANITY-VERCEL-EINRICHTUNG.md).
 * Braucht in .env.local: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.
 *
 *   npm run seed -- --probe zeigt nur, was passieren würde (kein Schreibzugriff) – EMPFOHLENER ERSTER SCHRITT
 *   npm run seed            legt fehlende Dokumente an, überschreibt NICHTS Vorhandenes
 *   npm run seed -- --force ersetzt die vom Skript verwalteten Dokumente (nur die mit bekannten IDs)
 *
 * Dokument-IDs sind deterministisch (einstellungen, seite-<slug>, getraenk-<id>, rechtstext-<art>),
 * damit das Skript wiederholbar ist; _key-Werte stammen unverändert aus den JSON-Dateien.
 * Bilder dedupliziert Sanity anhand des Dateiinhalts (Hash) – kein zweites Asset bei Wiederholung.
 */
import { createClient, type SanityClient } from "@sanity/client";
import nextEnv from "@next/env";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

nextEnv.loadEnvConfig(process.cwd());

const force = process.argv.includes("--force");
const probe = process.argv.includes("--probe");
const WURZEL = process.cwd();
const json = async <T,>(p: string): Promise<T> => JSON.parse(await readFile(path.join(WURZEL, "data", p), "utf8")) as T;

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!probe && (!projectId || !token)) {
  console.error("Fehlend: NEXT_PUBLIC_SANITY_PROJECT_ID und/oder SANITY_API_WRITE_TOKEN in .env.local (siehe .env.example).");
  process.exit(1);
}
const client: SanityClient = createClient({ projectId: projectId ?? "probe", dataset, token, apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-09-15", useCdn: false });

type BildRef = { bild: string; alt: string; bildunterschrift?: string };
type BildEintrag = { id: string; original: string };

// Die Demo kommt ohne Fotos aus – fehlt das Verzeichnis, gibt es schlicht nichts hochzuladen.
const bilder = await json<Record<string, BildEintrag>>("bilder.json").catch(() => ({}) as Record<string, BildEintrag>);
const assetIds = new Map<string, string>();

async function bildHochladen(id: string): Promise<string> {
  if (assetIds.has(id)) return assetIds.get(id)!;
  const eintrag = bilder[id];
  if (!eintrag) throw new Error(`Bild «${id}» fehlt in data/bilder.json`);
  const datei = path.join(WURZEL, eintrag.original);
  if (probe) {
    await readFile(datei); // Datei muss existieren
    console.log(`  [probe] würde hochladen: ${eintrag.original}`);
    assetIds.set(id, `probe-${id}`);
    return `probe-${id}`;
  }
  const asset = await client.assets.upload("image", await readFile(datei), { filename: path.basename(datei), label: id });
  console.log(`  hochgeladen: ${eintrag.original} → ${asset._id}`);
  assetIds.set(id, asset._id);
  return asset._id;
}

async function bild(ref: BildRef | undefined) {
  if (!ref) return undefined;
  return {
    _type: "bild",
    asset: { _type: "reference", _ref: await bildHochladen(ref.bild) },
    alt: ref.alt,
    ...(ref.bildunterschrift ? { bildunterschrift: ref.bildunterschrift } : {}),
  };
}

const ref = (_ref: string, key?: string) => ({ _type: "reference", _ref, ...(key ? { _key: key } : {}) });
const link = (l: unknown) => (l && typeof l === "object" ? { _type: "link", ...(l as object) } : undefined);

async function bausteinUmwandeln(b: Record<string, unknown>) {
  const kopie: Record<string, unknown> = { ...b };
  for (const k of ["knopf", "zweiterKnopf", "weiterLink"]) if (k in b) kopie[k] = link(b[k]);
  if (b._type === "spaltenBaustein") kopie.spalten = ((b.spalten as Record<string, unknown>[]) ?? []).map((sp) => ({ _type: "spalte", ...sp }));
  if (b._type === "faktenBaustein") kopie.fakten = ((b.fakten as Record<string, unknown>[]) ?? []).map((f) => ({ _type: "faktum", ...f }));
  if (b._type === "karteBaustein" || b._type === "speisenBaustein") kopie.kategorien = ((b.kategorien as string[] | undefined) ?? []).map((id) => ref(id, id));
  if (b._type === "bildBaustein") kopie.bild = await bild(b.bild as BildRef);
  if (b._type === "rechtstextBaustein") kopie.rechtstext = ref(`rechtstext-${b.rechtstext as string}`);
  return kopie;
}

const dokumente: Record<string, unknown>[] = [];

// Einstellungen
const e = await json<Record<string, unknown>>("einstellungen.json");
dokumente.push({
  ...e,
  _id: "einstellungen",
  _type: "einstellungen",
  adresse: { _type: "adresse", ...(e.adresse as object) },
  oeffnungszeiten: ((e.oeffnungszeiten as Record<string, unknown>[]) ?? []).map((z, i) => ({ _type: "oeffnungszeit", _key: `zeit-${i}`, ...z })),
  navigation: (e.navigation as Record<string, unknown>[]).map((l, i) => ({ _type: "link", _key: `nav-${i}`, ...l })),
  rechtslinks: (e.rechtslinks as Record<string, unknown>[]).map((l, i) => ({ _type: "link", _key: `recht-${i}`, ...l })),
  seo: { ...(e.seo as object), bild: await bild((e.seo as { bild?: BildRef }).bild) },
  // In Sanity sind abweichende Öffnungszeiten eigene Dokumente, nicht ein Feld der Einstellungen.
  sonderoeffnungszeiten: undefined,
});

// Getränkekategorien
for (const k of await json<Record<string, unknown>[]>("getraenkekategorien.json")) {
  dokumente.push({ ...k, _id: k.id as string, _type: "getraenkekategorie", id: undefined });
}
// Getränke (Kategorie wird zur Referenz, Preisvarianten bekommen _type)
for (const g of await json<Record<string, unknown>[]>("getraenke.json")) {
  dokumente.push({
    ...g,
    _id: g.id as string,
    _type: "getraenk",
    id: undefined,
    kategorie: ref(g.kategorie as string),
    varianten: (g.varianten as Record<string, unknown>[] | undefined)?.map((v) => ({ _type: "preisvariante", ...v })),
  });
}
// Speisekategorien
for (const k of await json<Record<string, unknown>[]>("speisekategorien.json")) {
  dokumente.push({ ...k, _id: k.id as string, _type: "speisekategorie", id: undefined });
}
// Speisen (gleiches Muster wie Getränke)
for (const sp of await json<Record<string, unknown>[]>("speisen.json")) {
  dokumente.push({
    ...sp,
    _id: sp.id as string,
    _type: "speise",
    id: undefined,
    kategorie: ref(sp.kategorie as string),
    varianten: (sp.varianten as Record<string, unknown>[] | undefined)?.map((v) => ({ _type: "preisvariante", ...v })),
  });
}
// Abweichende Öffnungszeiten (stehen in einstellungen.json)
for (const s of ((e.sonderoeffnungszeiten as Record<string, unknown>[]) ?? [])) {
  dokumente.push({ ...s, _id: s.id as string, _type: "sonderoeffnungszeit", id: undefined });
}
// Rechtstexte
for (const datei of await readdir(path.join(WURZEL, "data/rechtstexte"))) {
  const t = await json<Record<string, unknown>>(`rechtstexte/${datei}`);
  dokumente.push({ ...t, _id: t.id as string, _type: "rechtstext", id: undefined });
}
// Seiten
for (const datei of await readdir(path.join(WURZEL, "data/seiten"))) {
  const s = await json<Record<string, unknown>>(`seiten/${datei}`);
  const hero = s.hero as Record<string, unknown> | undefined;
  dokumente.push({
    ...s,
    _id: s.id as string,
    _type: "seite",
    id: undefined,
    slug: { _type: "slug", current: s.slug },
    hero: hero ? { ...hero, knopf: link(hero.knopf), zweiterKnopf: link(hero.zweiterKnopf) } : undefined,
    bausteine: await Promise.all((s.bausteine as Record<string, unknown>[]).map(bausteinUmwandeln)),
  });
}

// Dokument-IDs müssen über alle Typen hinweg eindeutig sein – in Sanity gibt es
// einen gemeinsamen Namensraum. Gleiche IDs würden sich sonst still überschreiben.
{
  const gesehen = new Map<string, string>();
  for (const d of dokumente) {
    const id = String(d._id);
    const vorher = gesehen.get(id);
    if (vorher) {
      console.error(`Abbruch: Dokument-ID «${id}» wird doppelt verwendet (${vorher} und ${d._type}).`);
      process.exit(1);
    }
    gesehen.set(id, String(d._type));
  }
}

// Schreiben
console.log(`${dokumente.length} Dokumente, ${assetIds.size} Bild(er). Modus: ${probe ? "PROBE (kein Schreiben)" : force ? "FORCE (ersetzen)" : "nur fehlende anlegen"}`);
if (probe) {
  for (const d of dokumente) console.log(`  ${d._type}: ${d._id}`);
  process.exit(0);
}
const tx = client.transaction();
for (const d of dokumente) {
  const sauber = JSON.parse(JSON.stringify(d)); // undefined-Felder entfernen
  if (force) tx.createOrReplace(sauber);
  else tx.createIfNotExists(sauber);
}
const ergebnis = await tx.commit();
console.log(`Fertig: ${ergebnis.results.length} Operationen (${ergebnis.results.filter((r) => r.operation === "create").length} neu angelegt).`);
console.log("Nächster Schritt: im Studio prüfen (/studio) und veröffentlichen – der Seed schreibt direkt veröffentlichte Dokumente.");
