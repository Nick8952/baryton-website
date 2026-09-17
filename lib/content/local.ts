import "server-only";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type {
  Baustein,
  Bild,
  Einstellungen,
  Getraenk,
  Getraenkekategorie,
  Inhaltsquelle,
  Rechtstext,
  Seite,
} from "./types";

/**
 * Lokale Inhaltsquelle: liest die JSON-Dateien in data/.
 *
 * Die Dateien sind bewusst wie Sanity-Dokumente aufgebaut (gleiche Feldnamen, Bausteine mit
 * _type/_key, Rich Text als Portable Text). Bilder werden per Kennung referenziert
 * (`{ "bild": "raum", "alt": "…" }`) und über data/bilder.json aufgelöst, das `npm run bilder` erzeugt.
 */

const DATA = path.resolve(process.cwd(), "data");

interface BildEintrag {
  id: string;
  breite: number;
  hoehe: number;
  quellen: { breite: number; url: string }[];
}
interface BildReferenz {
  bild: string;
  alt: string;
  bildunterschrift?: string;
}

async function json<T>(datei: string): Promise<T> {
  const text = await readFile(path.join(DATA, datei), "utf8");
  return JSON.parse(text) as T;
}
/** Nur «Datei fehlt» ist ein erwarteter Fall; kaputtes JSON soll den Build laut abbrechen. */
const fehltNur = (err: unknown) => (err as NodeJS.ErrnoException)?.code === "ENOENT";

let bilderCache: Record<string, BildEintrag> | undefined;
async function bilder(): Promise<Record<string, BildEintrag>> {
  if (!bilderCache) {
    try {
      bilderCache = await json<Record<string, BildEintrag>>("bilder.json");
    } catch (err) {
      // Die Demo kommt bewusst ohne Fotos aus; ohne Verzeichnis sind schlicht keine Bilder referenzierbar.
      if (!fehltNur(err)) throw err;
      bilderCache = {};
    }
  }
  return bilderCache;
}

async function bild(ref: BildReferenz | undefined, kontext: string): Promise<Bild | undefined> {
  if (!ref) return undefined;
  const eintrag = (await bilder())[ref.bild];
  if (!eintrag) throw new Error(`Bild «${ref.bild}» (${kontext}) fehlt in data/bilder.json – \`npm run bilder\` ausführen?`);
  if (typeof ref.alt !== "string") throw new Error(`Bild «${ref.bild}» (${kontext}) hat keinen Alt-Text.`);
  return {
    id: eintrag.id,
    alt: ref.alt,
    breite: eintrag.breite,
    hoehe: eintrag.hoehe,
    bildunterschrift: ref.bildunterschrift,
    quellen: eintrag.quellen,
  };
}

/* ---------- Rohformen der JSON-Dateien ---------- */
type RohEinstellungen = Omit<Einstellungen, "seo"> & {
  seo: Omit<Einstellungen["seo"], "bild"> & { bild?: BildReferenz };
};
type RohBaustein =
  | (Omit<Extract<Baustein, { _type: "karteBaustein" }>, "kategorien" | "getraenke"> & { kategorien?: string[] })
  | (Omit<Extract<Baustein, { _type: "bildBaustein" }>, "bild"> & { bild: BildReferenz })
  | (Omit<Extract<Baustein, { _type: "rechtstextBaustein" }>, "rechtstext"> & { rechtstext: Rechtstext["art"] })
  | Extract<
      Baustein,
      {
        _type:
          | "textBaustein"
          | "oeffnungszeitenBaustein"
          | "faktenBaustein"
          | "spaltenBaustein"
          | "kontaktBaustein"
          | "aufrufBaustein";
      }
    >;
type RohSeite = Omit<Seite, "bausteine"> & { bausteine: RohBaustein[] };

/** Fehlt die Datei, gibt es schlicht keine Getränke – die Karte zeigt dann ihren Hinweis. */
async function listeOderLeer<T extends { reihenfolge: number }>(datei: string): Promise<T[]> {
  try {
    const liste = await json<T[]>(datei);
    return [...liste].sort((a, b) => a.reihenfolge - b.reihenfolge);
  } catch (err) {
    if (fehltNur(err)) return [];
    throw err;
  }
}

const kategorien = () => listeOderLeer<Getraenkekategorie>("getraenkekategorien.json");
const getraenke = () => listeOderLeer<Getraenk>("getraenke.json");

async function rechtstext(art: Rechtstext["art"]): Promise<Rechtstext | null> {
  try {
    return await json<Rechtstext>(`rechtstexte/${art}.json`);
  } catch (err) {
    if (fehltNur(err)) return null;
    throw err;
  }
}

async function baustein(roh: RohBaustein, seite: string): Promise<Baustein> {
  const ort = `Seite ${seite}, Baustein ${roh._key}`;
  switch (roh._type) {
    case "karteBaustein": {
      const alle = await kategorien();
      const auswahl = roh.kategorien?.length ? alle.filter((k) => roh.kategorien!.includes(k.id)) : alle;
      const ids = new Set(auswahl.map((k) => k.id));
      return { ...roh, kategorien: auswahl, getraenke: (await getraenke()).filter((g) => ids.has(g.kategorie)) };
    }
    case "bildBaustein": {
      const b = await bild(roh.bild, ort);
      if (!b) throw new Error(`Pflichtbild fehlt: ${ort}`);
      return { ...roh, bild: b };
    }
    case "rechtstextBaustein": {
      const text = await rechtstext(roh.rechtstext);
      if (!text) throw new Error(`Rechtstext «${roh.rechtstext}» fehlt (${ort}).`);
      return { ...roh, rechtstext: text };
    }
    default:
      return roh;
  }
}

export const lokaleQuelle: Inhaltsquelle = {
  async getEinstellungen() {
    const roh = await json<RohEinstellungen>("einstellungen.json");
    return { ...roh, seo: { ...roh.seo, bild: await bild(roh.seo.bild, "Einstellungen: SEO-Bild") } };
  },

  async getSeite(slug) {
    let roh: RohSeite;
    try {
      roh = await json<RohSeite>(`seiten/${slug}.json`);
    } catch (err) {
      if (fehltNur(err)) return null;
      throw err;
    }
    return { ...roh, bausteine: await Promise.all(roh.bausteine.map((b) => baustein(b, slug))) };
  },

  async getAlleSeitenSlugs() {
    const dateien = await readdir(path.join(DATA, "seiten"));
    return dateien.filter((d) => d.endsWith(".json")).map((d) => d.replace(/\.json$/, ""));
  },

  getGetraenkekategorien: kategorien,
  getGetraenke: getraenke,
  getRechtstext: rechtstext,
};
