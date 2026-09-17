/**
 * Prüft lib/oeffnung.ts an den Grenzfällen: Fenster über Mitternacht, Wochengrenze,
 * Sonderöffnungszeiten, leere und unvollständige Daten, Position der Skalenmarken.
 *
 * Diese Logik trägt die Wochengrafik und den Hinweis «jetzt geöffnet» – Fehler darin
 * fallen im Browser erst zu einer bestimmten Uhrzeit auf. Deshalb hier fest verdrahtet.
 *
 *   npm run oeffnung:pruefen
 */
import { status, woche, skala, ortszeit } from "../lib/oeffnung";
import type { Oeffnungszeit, Sonderoeffnungszeit } from "../lib/content/types";
import { readFileSync } from "node:fs";

const e = JSON.parse(readFileSync(new URL("../data/einstellungen.json", import.meta.url), "utf8"));
const zeiten: Oeffnungszeit[] = e.oeffnungszeiten;

let fehler = 0;
const pruefe = (name: string, ist: unknown, soll: unknown) => {
  const ok = JSON.stringify(ist) === JSON.stringify(soll);
  if (!ok) fehler++;
  console.log(`${ok ? "✓" : "✗"} ${name}`);
  if (!ok) console.log(`    ist:  ${JSON.stringify(ist)}\n    soll: ${JSON.stringify(soll)}`);
};

// Zürcher Zeit: die Eingaben sind UTC, die Erwartung ist Ortszeit (Sommerzeit = UTC+2).
const z = (iso: string) => new Date(iso);

console.log("— Ortszeit —");
pruefe("2026-09-19T14:00Z → Samstag 16:00", ortszeit(z("2026-09-19T14:00:00Z")), { wochentag: "Samstag", minute: 960, datum: "2026-09-19" });
pruefe("2026-09-19T22:30Z → Sonntag 00:30", ortszeit(z("2026-09-19T22:30:00Z")), { wochentag: "Sonntag", minute: 30, datum: "2026-09-20" });

console.log("\n— Status ohne Ausnahmen —");
// Samstag 15:00–02:00
pruefe("Sa 16:00 → offen bis 02:00", status(zeiten, z("2026-09-19T14:00:00Z")), { art: "geoeffnet", bis: "02:00" });
pruefe("So 00:30 → noch offen (Samstagsfenster)", status(zeiten, z("2026-09-19T22:30:00Z")), { art: "geoeffnet", bis: "02:00" });
pruefe("So 03:00 → geschlossen, öffnet Dienstag", status(zeiten, z("2026-09-20T01:00:00Z")), { art: "geschlossen", naechsterTag: "Dienstag", naechsteZeit: "15:30", heuteNoch: false });
pruefe("Mo 12:00 → geschlossen, öffnet Dienstag", status(zeiten, z("2026-09-21T10:00:00Z")), { art: "geschlossen", naechsterTag: "Dienstag", naechsteZeit: "15:30", heuteNoch: false });
pruefe("Di 12:00 → öffnet heute 15:30", status(zeiten, z("2026-09-22T10:00:00Z")), { art: "geschlossen", naechsterTag: "Dienstag", naechsteZeit: "15:30", heuteNoch: true });
pruefe("Di 15:30 → gerade offen", status(zeiten, z("2026-09-22T13:30:00Z")), { art: "geoeffnet", bis: "23:00" });
pruefe("Di 23:00 → gerade zu, öffnet Mittwoch", status(zeiten, z("2026-09-22T21:00:00Z")), { art: "geschlossen", naechsterTag: "Mittwoch", naechsteZeit: "15:30", heuteNoch: false });
pruefe("Do 23:30 → offen bis 00:00", status(zeiten, z("2026-09-24T21:30:00Z")), { art: "geoeffnet", bis: "00:00" });
pruefe("Fr 00:30 → zu (Do endet 00:00), öffnet heute", status(zeiten, z("2026-09-24T22:30:00Z")), { art: "geschlossen", naechsterTag: "Freitag", naechsteZeit: "15:30", heuteNoch: true });

console.log("\n— Status mit Ausnahmen —");
const geschlossenSo: Sonderoeffnungszeit[] = [{ id: "x", bezeichnung: "Ruhetag", datum: "2026-09-20", geschlossen: true }];
pruefe("So 00:30, Sonntag als geschlossen gepflegt → geschlossen", status(zeiten, z("2026-09-19T22:30:00Z"), geschlossenSo).art, "geschlossen");
const offenMo: Sonderoeffnungszeit[] = [{ id: "y", bezeichnung: "Sonderabend", datum: "2026-09-21", zeiten: "18:00 – 20:00", von: "18:00", bis: "20:00" }];
pruefe("Mo 19:00 mit Sonderöffnung → offen bis 20:00", status(zeiten, z("2026-09-21T17:00:00Z"), offenMo), { art: "geoeffnet", bis: "20:00" });
pruefe("Mo 12:00 mit Sonderöffnung → öffnet heute 18:00", status(zeiten, z("2026-09-21T10:00:00Z"), offenMo), { art: "geschlossen", naechsterTag: "Montag", naechsteZeit: "18:00", heuteNoch: true });
const geschlossenDi: Sonderoeffnungszeit[] = [{ id: "z", bezeichnung: "Ferien", datum: "2026-09-22", geschlossen: true }];
pruefe("Mo 12:00, Dienstag geschlossen → nächste Öffnung Mittwoch", status(zeiten, z("2026-09-21T10:00:00Z"), geschlossenDi), { art: "geschlossen", naechsterTag: "Mittwoch", naechsteZeit: "15:30", heuteNoch: false });

console.log("\n— Leere und unvollständige Daten —");
pruefe("keine Zeiten → unbekannt", status([], z("2026-09-21T10:00:00Z")), { art: "unbekannt" });
pruefe("woche([]) zeichnet keine Grafik", woche([]).hatFenster, false);
pruefe("woche([]) behauptet nicht «geschlossen»", woche([]).zeilen.every((z) => z.unbekannt && !z.geschlossen), true);
const halb: Oeffnungszeit[] = [{ _key: "a", tage: "Montag", zeiten: "15:00 – 23:00", wochentag: "Montag", von: "15:00" }];
pruefe("Eintrag ohne «bis» gilt als unbekannt, nicht geschlossen", woche(halb).zeilen[0].unbekannt, true);

console.log("\n— Skala —");
const w = woche(zeiten);
const marken = skala(w.von, w.bis);
console.log("   ", marken.map((m) => `${m.text}@${Math.round(m.anteil * 100)}%`).join("  "));
pruefe("erste Marke bei 0 %", Math.round(marken[0].anteil * 100), 0);
pruefe("18:00 liegt bei 27 %, nicht in der Mitte", Math.round(marken[1].anteil * 100), 27);

console.log(`\n${fehler === 0 ? "Alle Prüfungen bestanden." : `${fehler} Prüfung(en) fehlgeschlagen.`}`);
process.exit(fehler === 0 ? 0 : 1);
