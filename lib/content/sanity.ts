import "server-only";
import { defineQuery } from "next-sanity";
import { client, vorschauClient } from "@/sanity/client";
import { sanityPruefen } from "@/sanity/env";
import { BILD_PROJEKTION, sanityBild, type SanityBildRoh } from "@/sanity/bild";
import { istVorschau } from "@/lib/vorschau/status";
import type {
  Baustein,
  Einstellungen,
  Getraenk,
  Getraenkekategorie,
  Inhaltsquelle,
  Rechtstext,
  Seite,
  Speise,
  Speisekategorie,
} from "./types";

/**
 * Sanity-Inhaltsquelle (für Vercel). Liefert exakt dieselben Typen wie lib/content/local.ts.
 *
 * Cache-Strategie: veröffentlichte Inhalte werden mit dem Tag «inhalt» gecacht und per
 * Webhook (server-routes/app/api/revalidate) invalidiert – ein Tag für alles, weil Listen
 * (Getränkekarte) von Einzeldokumenten abhängen. In der Entwurfsvorschau (Draft Mode)
 * wird ungecacht mit Perspektive «drafts» gelesen.
 *
 * Status: VORBEREITET – erst nach Anlegen eines Sanity-Projekts überprüfbar.
 */
export const INHALT_TAG = "inhalt";

async function abfrage<T>(query: string, params: Record<string, unknown> = {}): Promise<T> {
  sanityPruefen();
  const vorschau = await istVorschau();
  const c = vorschau ? vorschauClient() : client;
  return c.fetch<T>(query, params, vorschau ? { cache: "no-store" } : { next: { revalidate: false, tags: [INHALT_TAG] } });
}

const LINK = `{ titel, ziel, extern }`;
const KATEGORIE = `{ "id": _id, titel, beschreibung, reihenfolge }`;
const VARIANTEN = `varianten[] { _key, bezeichnung, preis }`;
const GETRAENK = `{ "id": _id, name, beschreibung, preis, menge, ${VARIANTEN}, hinweis, "kategorie": kategorie->_id, reihenfolge }`;
const SPEISEKATEGORIE = `{ "id": _id, titel, beschreibung, reihenfolge }`;
const SPEISE = `{ "id": _id, name, beschreibung, preis, ${VARIANTEN}, hinweis, "kategorie": kategorie->_id, reihenfolge }`;
const RECHTSTEXT = `{ "id": _id, art, titel, stand, inhalt }`;

const BAUSTEINE = `bausteine[] {
  _key, _type, kurzzeile, titel,
  _type == "textBaustein" => { inhalt, breite, dunkel },
  _type == "karteBaustein" => {
    einleitung, hinweis, mitSprungmarken, weiterLink ${LINK},
    "kategorien": select(
      coalesce(count(kategorien), 0) > 0 => kategorien[]-> ${KATEGORIE},
      *[_type == "getraenkekategorie"] | order(reihenfolge asc) ${KATEGORIE}
    ),
    "getraenke": *[_type == "getraenk" && (
      coalesce(count(^.kategorien), 0) == 0 || kategorie._ref in ^.kategorien[]._ref
    )] | order(reihenfolge asc) ${GETRAENK}
  },
  _type == "speisenBaustein" => {
    einleitung, hinweis, mitSprungmarken, weiterLink ${LINK},
    "kategorien": select(
      coalesce(count(kategorien), 0) > 0 => kategorien[]-> ${SPEISEKATEGORIE},
      *[_type == "speisekategorie"] | order(reihenfolge asc) ${SPEISEKATEGORIE}
    ),
    "speisen": *[_type == "speise" && (
      coalesce(count(^.kategorien), 0) == 0 || kategorie._ref in ^.kategorien[]._ref
    )] | order(reihenfolge asc) ${SPEISE}
  },
  _type == "oeffnungszeitenBaustein" => { einleitung, darstellung, mitSonderzeiten },
  _type == "faktenBaustein" => { fakten[] { _key, bezeichnung, wert } },
  _type == "spaltenBaustein" => { spalten[] { _key, titel, inhalt } },
  _type == "bildBaustein" => { text, bild ${BILD_PROJEKTION} },
  _type == "kontaktBaustein" => { einleitung, mitFormular, formularHinweis },
  _type == "aufrufBaustein" => { text, knopf ${LINK}, zweiterKnopf ${LINK} },
  _type == "rechtstextBaustein" => { rechtstext-> ${RECHTSTEXT} }
}`;

const EINSTELLUNGEN_QUERY = defineQuery(`*[_type == "einstellungen"][0] {
  firmenname, kurzname, claim, adresse, telefon, email, rechtsname, uid, routenlink, demoHinweis,
  oeffnungszeiten[] { _key, tage, zeiten, wochentag, von, bis, geschlossen }, oeffnungszeitenHinweis,
  "sonderoeffnungszeiten": *[_type == "sonderoeffnungszeit"] | order(datum asc) {
    "id": _id, bezeichnung, datum, zeiten, von, bis, geschlossen, hinweis
  },
  navigation[] ${LINK},
  rechtslinks[] ${LINK},
  seo { titelZusatz, beschreibung, bild ${BILD_PROJEKTION} }
}`);

const SEITE_QUERY = defineQuery(`*[_type == "seite" && slug.current == $slug][0] {
  "id": _id, "slug": slug.current, titel, einleitung, seoTitel, seoBeschreibung,
  hero { kurzzeile, titel, untertitel, text, knopf ${LINK}, zweiterKnopf ${LINK} },
  ${BAUSTEINE}
}`);

type Roh = Record<string, unknown>;

function bausteinAufbereiten(b: Roh): Baustein {
  switch (b._type) {
    case "karteBaustein": {
      const kategorien = ((b.kategorien as Getraenkekategorie[]) ?? []).sort((x, y) => x.reihenfolge - y.reihenfolge);
      const ids = new Set(kategorien.map((k) => k.id));
      const getraenke = ((b.getraenke as Getraenk[]) ?? [])
        .filter((g) => ids.has(g.kategorie))
        .sort((x, y) => x.reihenfolge - y.reihenfolge);
      return { ...(b as object), kategorien, getraenke } as Baustein;
    }
    case "speisenBaustein": {
      const kategorien = ((b.kategorien as Speisekategorie[]) ?? []).sort((x, y) => x.reihenfolge - y.reihenfolge);
      const ids = new Set(kategorien.map((k) => k.id));
      const speisen = ((b.speisen as Speise[]) ?? [])
        .filter((s) => ids.has(s.kategorie))
        .sort((x, y) => x.reihenfolge - y.reihenfolge);
      return { ...(b as object), kategorien, speisen } as Baustein;
    }
    case "faktenBaustein":
      return { ...(b as object), fakten: (b.fakten as unknown[]) ?? [] } as Baustein;
    case "spaltenBaustein":
      return { ...(b as object), spalten: (b.spalten as unknown[]) ?? [] } as Baustein;
    case "bildBaustein": {
      const bild = sanityBild(b.bild as SanityBildRoh | undefined);
      if (!bild) throw new Error(`Sanity: bildBaustein ${b._key} ohne Bild.`);
      return { ...(b as object), bild } as Baustein;
    }
    case "kontaktBaustein":
      return { ...(b as object), mitFormular: Boolean(b.mitFormular) } as Baustein;
    case "rechtstextBaustein":
      if (!b.rechtstext) throw new Error(`Sanity: rechtstextBaustein ${b._key} ohne Rechtstext.`);
      return b as unknown as Baustein;
    default:
      return b as unknown as Baustein;
  }
}

export const sanityQuelle: Inhaltsquelle = {
  async getEinstellungen() {
    const e = await abfrage<Roh | null>(EINSTELLUNGEN_QUERY);
    if (!e) throw new Error("Sanity: Dokument «einstellungen» fehlt – `npm run seed` ausführen.");
    return {
      ...(e as object),
      oeffnungszeiten: (e.oeffnungszeiten as Einstellungen["oeffnungszeiten"]) ?? [],
      sonderoeffnungszeiten: (e.sonderoeffnungszeiten as Einstellungen["sonderoeffnungszeiten"]) ?? [],
      navigation: (e.navigation as Einstellungen["navigation"]) ?? [],
      rechtslinks: (e.rechtslinks as Einstellungen["rechtslinks"]) ?? [],
      seo: { ...((e.seo as object) ?? {}), bild: sanityBild((e.seo as Roh | undefined)?.bild as SanityBildRoh | undefined) },
    } as Einstellungen;
  },

  async getSeite(slug) {
    const s = await abfrage<Roh | null>(SEITE_QUERY, { slug });
    if (!s) return null;
    return {
      ...(s as object),
      hero: (s.hero as Seite["hero"]) ?? undefined,
      bausteine: ((s.bausteine as Roh[]) ?? []).map(bausteinAufbereiten),
    } as Seite;
  },

  async getAlleSeitenSlugs() {
    return abfrage<string[]>(`*[_type == "seite" && defined(slug.current)].slug.current`);
  },

  async getGetraenkekategorien() {
    return abfrage<Getraenkekategorie[]>(`*[_type == "getraenkekategorie"] | order(reihenfolge asc) ${KATEGORIE}`);
  },

  async getGetraenke() {
    return abfrage<Getraenk[]>(`*[_type == "getraenk"] | order(reihenfolge asc) ${GETRAENK}`);
  },

  async getSpeisekategorien() {
    return abfrage<Speisekategorie[]>(`*[_type == "speisekategorie"] | order(reihenfolge asc) ${SPEISEKATEGORIE}`);
  },

  async getSpeisen() {
    return abfrage<Speise[]>(`*[_type == "speise"] | order(reihenfolge asc) ${SPEISE}`);
  },

  async getRechtstext(art) {
    return abfrage<Rechtstext | null>(`*[_type == "rechtstext" && art == $art][0] ${RECHTSTEXT}`, { art });
  },
};
