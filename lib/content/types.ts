/**
 * Gemeinsame Inhaltsstruktur der Website «Baryton Cocktail Lounge».
 *
 * Diese Typen sind die Schnittstelle zwischen Inhaltsquelle und Darstellung:
 * - lib/content/local.ts  liefert sie aus data/*.json (GitHub-Pages-Demo, JETZT)
 * - lib/content/sanity.ts liefert sie aus Sanity (SPÄTER, Vercel)
 * Seitenkomponenten kennen nur diese Typen, nie die Quelle.
 *
 * Feldnamen sind deutsch und decken sich 1:1 mit den Sanity-Schemas in sanity/schemas/.
 */
import type { PortableTextBlock } from "@portabletext/types";

export type RichText = PortableTextBlock[];

/** Fertig aufbereitetes Bild – beide Provider liefern dieselbe Form. */
export interface Bild {
  /** Stabile Kennung (lokal: Schlüssel in data/bilder.json; Sanity: Asset-ID) */
  id: string;
  alt: string;
  breite: number;
  hoehe: number;
  /** Sichtbare Bildunterschrift, z. B. Herkunft eines freigegebenen Fotos */
  bildunterschrift?: string;
  /** Renditions aufsteigend nach Breite; `url` ist absolut (Sanity) oder wurzelrelativ ohne Unterpfad (lokal). */
  quellen: { breite: number; url: string }[];
}

export interface Link {
  titel: string;
  /** Interner Pfad («/besuch»), externe URL (https://…), tel: oder mailto: */
  ziel: string;
  extern?: boolean;
}

export interface Adresse {
  strasse: string;
  plz: string;
  ort: string;
  land?: string;
}

export const WOCHENTAGE = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"] as const;
export type Wochentag = (typeof WOCHENTAGE)[number];

/**
 * Ein Eintrag der Öffnungszeiten. `tage`/`zeiten` sind der sichtbare Text.
 *
 * `wochentag`/`von`/`bis`/`geschlossen` sind die strukturierte Fassung. Sie speisen die
 * Wochengrafik («Resonanz»), den Geöffnet-Status in der Kopfzeile und die strukturierten
 * Daten (JSON-LD `OpeningHoursSpecification`). Ohne sie erscheint der Eintrag nur als Text.
 *
 * `bis` darf über Mitternacht gehen («02:00») – das wird als Sperrstunde des Folgetags gelesen.
 */
export interface Oeffnungszeit {
  _key: string;
  tage: string;
  zeiten: string;
  /** Einzelner Wochentag – nötig für Grafik, Status und strukturierte Daten */
  wochentag?: Wochentag;
  /** Öffnet um (HH:MM) */
  von?: string;
  /** Schliesst um (HH:MM); kleiner als `von` bedeutet «nach Mitternacht» */
  bis?: string;
  /** An diesem Tag geschlossen – erscheint dann nicht in den strukturierten Daten */
  geschlossen?: boolean;
}

/**
 * Abweichung vom Wochenrhythmus (Feiertag, Betriebsferien, verlängerte Öffnung).
 *
 * Eine Ausnahme ersetzt für ihr Datum den ganzen Kalendertag – auch ein Fenster,
 * das vom Vortag über Mitternacht hineinreicht. `von`/`bis` sind optional und
 * wirken wie bei `Oeffnungszeit`: nur mit ihnen kennt die Website die Ausnahme
 * auch für den Geöffnet-Hinweis, sonst erscheint sie ausschliesslich als Text.
 */
export interface Sonderoeffnungszeit {
  id: string;
  bezeichnung: string;
  /** ISO-Datum (JJJJ-MM-TT) */
  datum: string;
  /** Sichtbarer Zeittext; leer lassen, wenn `geschlossen` gesetzt ist */
  zeiten?: string;
  /** Öffnet um (HH:MM) */
  von?: string;
  /** Schliesst um (HH:MM); kleiner als `von` bedeutet «nach Mitternacht» */
  bis?: string;
  geschlossen?: boolean;
  hinweis?: string;
}

/** Eine Kategorie der Getränkekarte (z. B. «Signature Drinks»). */
export interface Getraenkekategorie {
  id: string;
  titel: string;
  beschreibung?: string;
  reihenfolge: number;
}

/**
 * Ein Eintrag der Getränkekarte. Alle Angaben ausser `name` sind optional, damit eine Karte
 * auch dann korrekt dargestellt wird, wenn (noch) keine Preise oder Mengen bekannt sind.
 */
export interface Getraenk {
  id: string;
  name: string;
  beschreibung?: string;
  /** Preis in Franken als Zahl, z. B. 18.5 – die Darstellung formatiert «18.50» */
  preis?: number;
  /** z. B. «4 cl» oder «0.3 l» */
  menge?: string;
  /** Kurzer Zusatz, z. B. «alkoholfrei» */
  hinweis?: string;
  /** id einer Getraenkekategorie */
  kategorie: string;
  reihenfolge: number;
}

export interface Rechtstext {
  id: string;
  art: "impressum" | "datenschutz";
  titel: string;
  stand?: string;
  inhalt: RichText;
}

export interface Einstellungen {
  /** Angezeigter Name des Betriebs */
  firmenname: string;
  /** Kurzform für Kopfzeile / Browser-Titel */
  kurzname: string;
  /** Kurze Positionierung unter dem Namen (Kopfzeile, Open Graph) */
  claim?: string;
  adresse: Adresse;
  telefon: string;
  /** Nur setzen, wenn die Adresse verifiziert ist – erst dann erscheinen E-Mail-Links. */
  email?: string;
  /** Rechtlicher Firmenname, falls abweichend und belegt */
  rechtsname?: string;
  uid?: string;
  oeffnungszeiten: Oeffnungszeit[];
  /** Herkunft der Öffnungszeiten, wenn sie nicht vom Betrieb selbst bestätigt sind */
  oeffnungszeitenHinweis?: string;
  sonderoeffnungszeiten?: Sonderoeffnungszeit[];
  /** Externer Routenlink (Google Maps) – wird nur als Link geöffnet, nie eingebettet. */
  routenlink?: string;
  navigation: Link[];
  rechtslinks: Link[];
  seo: { titelZusatz: string; beschreibung: string; bild?: Bild };
  /** Hinweis auf jeder Seite, dass es sich um eine unverbindliche Demo handelt */
  demoHinweis?: string;
}

/* ------------------------------------------------------------------ */
/* Seitenbausteine (Page-Builder)                                       */
/* ------------------------------------------------------------------ */

interface BausteinBasis {
  _key: string;
  /** Kleine Zeile über dem Titel (Etikett) */
  kurzzeile?: string;
  titel?: string;
}

export interface TextBaustein extends BausteinBasis {
  _type: "textBaustein";
  inhalt: RichText;
  breite?: "schmal" | "normal";
  /** Dunkler Abschnitt (Nachtfläche) statt heller Papierfläche */
  dunkel?: boolean;
}

/**
 * Getränkekarte. Liegt keine Karte vor, bleiben `kategorien` leer und `hinweis` erklärt,
 * warum – es werden nie Beispielgetränke erfunden.
 */
export interface KarteBaustein extends BausteinBasis {
  _type: "karteBaustein";
  einleitung?: string;
  /** Leer = alle Kategorien in ihrer Reihenfolge */
  kategorien: Getraenkekategorie[];
  getraenke: Getraenk[];
  /** Text, der erscheint, wenn keine Getränke hinterlegt sind */
  hinweis?: string;
  weiterLink?: Link;
}

export interface OeffnungszeitenBaustein extends BausteinBasis {
  _type: "oeffnungszeitenBaustein";
  einleitung?: string;
  /** «resonanz» = Wochengrafik, «liste» = reine Tabelle */
  darstellung: "resonanz" | "liste";
  mitSonderzeiten?: boolean;
}

export interface FaktenBaustein extends BausteinBasis {
  _type: "faktenBaustein";
  fakten: { _key: string; bezeichnung: string; wert: string }[];
}

export interface SpaltenBaustein extends BausteinBasis {
  _type: "spaltenBaustein";
  spalten: { _key: string; titel: string; inhalt: RichText }[];
}

export interface BildBaustein extends BausteinBasis {
  _type: "bildBaustein";
  bild: Bild;
  text?: string;
}

export interface KontaktBaustein extends BausteinBasis {
  _type: "kontaktBaustein";
  einleitung?: string;
  /** Anfrage-Assistent anzeigen (bereitet nur eine E-Mail vor, versendet nichts) */
  mitFormular: boolean;
  formularHinweis?: string;
}

export interface AufrufBaustein extends BausteinBasis {
  _type: "aufrufBaustein";
  text?: string;
  knopf: Link;
  zweiterKnopf?: Link;
}

export interface RechtstextBaustein extends BausteinBasis {
  _type: "rechtstextBaustein";
  rechtstext: Rechtstext;
}

export type Baustein =
  | TextBaustein
  | KarteBaustein
  | OeffnungszeitenBaustein
  | FaktenBaustein
  | SpaltenBaustein
  | BildBaustein
  | KontaktBaustein
  | AufrufBaustein
  | RechtstextBaustein;

export const BAUSTEIN_TYPEN: Baustein["_type"][] = [
  "textBaustein",
  "karteBaustein",
  "oeffnungszeitenBaustein",
  "faktenBaustein",
  "spaltenBaustein",
  "bildBaustein",
  "kontaktBaustein",
  "aufrufBaustein",
  "rechtstextBaustein",
];

export interface Hero {
  kurzzeile?: string;
  /** Grosse erste Zeile des Schriftzugs */
  titel: string;
  /** Zweite, gesperrt gesetzte Zeile unter dem Schriftzug */
  untertitel?: string;
  text?: string;
  knopf?: Link;
  zweiterKnopf?: Link;
}

export interface Seite {
  id: string;
  /** «start» für die Startseite, sonst URL-Segment */
  slug: string;
  titel: string;
  /** Kurze Einleitung unter dem Seitentitel (Unterseiten) */
  einleitung?: string;
  seoTitel?: string;
  seoBeschreibung?: string;
  /** Nur Startseite */
  hero?: Hero;
  bausteine: Baustein[];
}

/** Vertrag, den jede Inhaltsquelle erfüllt. Alle Funktionen sind asynchron, damit Sanity später ohne Umbau passt. */
export interface Inhaltsquelle {
  getEinstellungen(): Promise<Einstellungen>;
  getSeite(slug: string): Promise<Seite | null>;
  getAlleSeitenSlugs(): Promise<string[]>;
  getGetraenkekategorien(): Promise<Getraenkekategorie[]>;
  getGetraenke(): Promise<Getraenk[]>;
  getRechtstext(art: Rechtstext["art"]): Promise<Rechtstext | null>;
}
