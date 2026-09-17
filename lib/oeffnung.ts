/**
 * Auswertung der Öffnungszeiten – gemeinsame Grundlage für die Wochengrafik,
 * den Status in der Kopfzeile und die strukturierten Daten.
 *
 * Alle Funktionen sind rein: sie bekommen die Zeitangaben und einen Zeitpunkt und
 * rechnen nichts selbst aus der Systemzeit. Der Zeitpunkt wird in Zürcher Ortszeit
 * zerlegt, damit die Anzeige auch für Gäste in anderen Zeitzonen stimmt.
 */
import { WOCHENTAGE, type Oeffnungszeit, type Sonderoeffnungszeit, type Wochentag } from "./content/types";

export const ZEITZONE = "Europe/Zurich";

/** «15:30» → 930 Minuten. Ungültige Angaben ergeben `null`. */
export function minuten(zeit: string | undefined): number | null {
  if (!zeit) return null;
  const treffer = /^(\d{1,2}):(\d{2})$/.exec(zeit.trim());
  if (!treffer) return null;
  const h = Number(treffer[1]);
  const m = Number(treffer[2]);
  if (h > 23 || m > 59) return null;
  return h * 60 + m;
}

export interface Tagesfenster {
  wochentag: Wochentag;
  /** Minuten seit 00:00 */
  von: number;
  /** Minuten seit 00:00 des Öffnungstags; > 1440, wenn über Mitternacht geöffnet ist */
  bis: number;
  eintrag: Oeffnungszeit;
}

/** Alle strukturiert gepflegten Öffnungsfenster. Tage ohne `wochentag`/`von`/`bis` fallen weg. */
export function fenster(zeiten: Oeffnungszeit[]): Tagesfenster[] {
  const liste: Tagesfenster[] = [];
  for (const z of zeiten) {
    if (z.geschlossen || !z.wochentag) continue;
    const von = minuten(z.von);
    const roh = minuten(z.bis);
    if (von === null || roh === null) continue;
    // «15:30 – 02:00» heisst: Sperrstunde am Folgetag.
    liste.push({ wochentag: z.wochentag, von, bis: roh <= von ? roh + 1440 : roh, eintrag: z });
  }
  return liste;
}

/** Zerlegt einen Zeitpunkt in Zürcher Ortszeit. */
export function ortszeit(jetzt: Date): { wochentag: Wochentag; minute: number; datum: string } {
  const teile = new Intl.DateTimeFormat("de-CH", {
    timeZone: ZEITZONE,
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour12: false,
  }).formatToParts(jetzt);
  const teil = (art: Intl.DateTimeFormatPartTypes) => teile.find((t) => t.type === art)?.value ?? "";
  const wochentag = (WOCHENTAGE.find((t) => t === teil("weekday")) ?? "Montag") as Wochentag;
  // 24:00 kommt in manchen Umgebungen für Mitternacht zurück.
  const stunde = Number(teil("hour")) % 24;
  return {
    wochentag,
    minute: stunde * 60 + Number(teil("minute")),
    datum: `${teil("year")}-${teil("month")}-${teil("day")}`,
  };
}

const folgetag = (t: Wochentag): Wochentag => WOCHENTAGE[(WOCHENTAGE.indexOf(t) + 1) % 7];

/** «2026-09-19» + 1 → «2026-09-20». Rechnet über UTC-Mittag, damit Sommerzeitwechsel nichts verschieben. */
function datumPlus(datum: string, tage: number): string {
  const d = new Date(`${datum}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + tage);
  return d.toISOString().slice(0, 10);
}

export type Status =
  | { art: "geoeffnet"; bis: string }
  | { art: "geschlossen"; naechsterTag: Wochentag; naechsteZeit: string; heuteNoch: boolean }
  | { art: "unbekannt" };

const hhmm = (m: number) => `${String(Math.floor((m % 1440) / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

/** Die Öffnungsfenster eines konkreten Kalendertags: eine Ausnahme ersetzt den Wochenrhythmus vollständig. */
function tagesfenster(
  alle: Tagesfenster[],
  sonder: Sonderoeffnungszeit[],
  datum: string,
  wochentag: Wochentag,
): { fenster: { von: number; bis: number }[]; ausnahme: boolean } {
  const ausnahme = sonder.find((s) => s.datum === datum);
  if (ausnahme) {
    if (ausnahme.geschlossen) return { fenster: [], ausnahme: true };
    const von = minuten(ausnahme.von);
    const roh = minuten(ausnahme.bis);
    if (von === null || roh === null) return { fenster: [], ausnahme: true };
    return { fenster: [{ von, bis: roh <= von ? roh + 1440 : roh }], ausnahme: true };
  }
  return { fenster: alle.filter((f) => f.wochentag === wochentag).map((f) => ({ von: f.von, bis: f.bis })), ausnahme: false };
}

/**
 * Aktueller Status.
 *
 * Berücksichtigt Fenster über Mitternacht: Ein Fenster von gestern (Samstag 15:00–02:00)
 * läuft am Sonntag um 00:30 noch. Eine Ausnahme für ein Datum ersetzt den ganzen
 * Kalendertag – auch das hineinragende Fenster des Vortags. Ohne `von`/`bis` zählt eine
 * offene Ausnahme wie «keine Öffnung an diesem Tag», weil die Zeiten dann nur als Text
 * vorliegen und nicht gerechnet werden können.
 */
export function status(zeiten: Oeffnungszeit[], jetzt: Date, sonder: Sonderoeffnungszeit[] = []): Status {
  const alle = fenster(zeiten);
  if (!alle.length && !sonder.length) return { art: "unbekannt" };
  const { wochentag, minute, datum } = ortszeit(jetzt);

  const heute = tagesfenster(alle, sonder, datum, wochentag);
  for (const f of heute.fenster) {
    if (minute >= f.von && minute < f.bis) return { art: "geoeffnet", bis: hhmm(f.bis) };
  }

  // Ein Fenster von gestern kann noch laufen – aber nur, wenn heute keine Ausnahme gilt.
  if (!heute.ausnahme) {
    const gestern = datumPlus(datum, -1);
    const vorgestern = tagesfenster(alle, sonder, gestern, WOCHENTAGE[(WOCHENTAGE.indexOf(wochentag) + 6) % 7]);
    for (const f of vorgestern.fenster) {
      if (f.bis > 1440 && minute < f.bis - 1440) return { art: "geoeffnet", bis: hhmm(f.bis) };
    }
  }

  // Nächste Öffnung suchen: heute später, sonst an einem der nächsten sieben Tage.
  const spaeterHeute = heute.fenster.filter((f) => f.von > minute).sort((a, b) => a.von - b.von);
  if (spaeterHeute.length) {
    return { art: "geschlossen", naechsterTag: wochentag, naechsteZeit: hhmm(spaeterHeute[0].von), heuteNoch: true };
  }

  let tag = wochentag;
  for (let i = 1; i <= 7; i++) {
    tag = folgetag(tag);
    const kandidat = tagesfenster(alle, sonder, datumPlus(datum, i), tag);
    const treffer = [...kandidat.fenster].sort((a, b) => a.von - b.von)[0];
    if (treffer) return { art: "geschlossen", naechsterTag: tag, naechsteZeit: hhmm(treffer.von), heuteNoch: false };
  }
  return { art: "unbekannt" };
}

export interface Wochenzeile {
  wochentag: Wochentag;
  eintrag?: Oeffnungszeit;
  /** Anteil 0–1, ab wann am Tag geöffnet ist (bezogen auf das Fenster der ganzen Woche) */
  start: number;
  /** Anteil 0–1 der Länge */
  laenge: number;
  stunden: number;
  /** Ausdrücklich als geschlossen gepflegt */
  geschlossen: boolean;
  /** Weder Öffnungsfenster noch «geschlossen» gepflegt – dann wird nichts behauptet */
  unbekannt: boolean;
  text: string;
}

/**
 * Bereitet die Woche als Balken auf: Skala vom frühesten Öffnen bis zur spätesten Sperrstunde,
 * damit die Länge einer Zeile die tatsächliche Öffnungsdauer zeigt.
 *
 * `hatFenster` ist false, wenn kein einziger Tag strukturiert gepflegt ist. Dann darf keine
 * Grafik gezeichnet werden – sieben leere Linien würden sonst «die ganze Woche geschlossen»
 * behaupten, obwohl die Zeiten schlicht unbekannt sind.
 */
export function woche(zeiten: Oeffnungszeit[]): {
  zeilen: Wochenzeile[];
  von: number;
  bis: number;
  hatFenster: boolean;
} {
  const alle = fenster(zeiten);
  const von = alle.length ? Math.min(...alle.map((f) => f.von)) : 0;
  const bis = alle.length ? Math.max(...alle.map((f) => f.bis)) : 1440;
  const spanne = Math.max(bis - von, 1);

  const zeilen = WOCHENTAGE.map((tag) => {
    const f = alle.find((x) => x.wochentag === tag);
    const eintrag = zeiten.find((z) => z.wochentag === tag);
    if (!f) {
      const geschlossen = Boolean(eintrag?.geschlossen);
      return {
        wochentag: tag,
        eintrag,
        start: 0,
        laenge: 0,
        stunden: 0,
        geschlossen,
        unbekannt: !geschlossen,
        text: eintrag?.zeiten || (geschlossen ? "Geschlossen" : "Keine Angabe"),
      };
    }
    return {
      wochentag: tag,
      eintrag,
      start: (f.von - von) / spanne,
      laenge: (f.bis - f.von) / spanne,
      stunden: (f.bis - f.von) / 60,
      geschlossen: false,
      unbekannt: false,
      text: eintrag?.zeiten || `${hhmm(f.von)} – ${hhmm(f.bis)}`,
    };
  });
  return { zeilen, von, bis, hatFenster: alle.length > 0 };
}

/**
 * Beschriftung der Zeitachse. Liefert zu jeder Marke ihren Anteil 0–1 an der Spanne –
 * bei 15:00–02:00 liegt 18:00 also bei 0.27 und nicht in der Mitte.
 */
export function skala(von: number, bis: number, schritt = 180): { text: string; anteil: number }[] {
  const spanne = Math.max(bis - von, 1);
  const start = Math.ceil(von / schritt) * schritt;
  const marken: { text: string; anteil: number }[] = [];
  for (let m = start; m <= bis; m += schritt) marken.push({ text: hhmm(m), anteil: (m - von) / spanne });
  return marken;
}
