# Inhalte der Demo pflegen

Solange die Website auf GitHub Pages läuft, stehen alle Inhalte in `data/`.
Das sind normale Textdateien im JSON-Format – Texte ändern, speichern, committen,
fertig. Beim nächsten Push baut GitHub die Seite neu.

Nach jeder Änderung:

```bash
npm run inhalt:pruefen     # findet Tippfehler in der Struktur, tote Links, fehlende Pflichtfelder
npm run build:pages
npm run export:pruefen
```

## Wo steht was

| Datei | Inhalt |
|---|---|
| `data/einstellungen.json` | Name, Adresse, Telefon, Öffnungszeiten, Navigation, Footer-Links, Demo-Hinweis, Suchmaschinen-Grundtext |
| `data/seiten/start.json` | Startseite: Schriftzug, Text, Knöpfe, Abschnitte |
| `data/seiten/getraenke.json` | Getränkeseite |
| `data/seiten/besuch.json` | Besuch & Kontakt |
| `data/seiten/impressum.json`, `datenschutz.json` | verweisen nur auf den Rechtstext |
| `data/rechtstexte/impressum.json`, `datenschutz.json` | die eigentlichen Rechtstexte |
| `data/getraenkekategorien.json`, `data/getraenke.json` | die Getränkekarte (derzeit leer) |

## Öffnungszeiten ändern

In `data/einstellungen.json` unter `oeffnungszeiten`. Wichtig: **alle sieben Tage**
einzeln eintragen, sonst fehlen Zeilen in der Wochengrafik und der Hinweis
«jetzt geöffnet» stimmt nicht.

```json
{ "_key": "fr", "tage": "Freitag", "zeiten": "15:30 – 02:00",
  "wochentag": "Freitag", "von": "15:30", "bis": "02:00" }
```

- `tage` und `zeiten` sind der sichtbare Text.
- `wochentag`, `von`, `bis` sind die technische Fassung für Grafik, Status und
  Suchmaschinen. Eine Endzeit, die kleiner ist als die Startzeit, gilt als
  «nach Mitternacht» – `02:00` heisst also Sperrstunde am Folgetag.
- Geschlossene Tage: `"geschlossen": true` statt `von`/`bis`.

Sobald der Betrieb die Zeiten bestätigt hat, `oeffnungszeitenHinweis` leeren –
dann verschwindet der Herkunftshinweis unter der Grafik.

## Getränkekarte eintragen

Sobald eine echte Karte vorliegt: zuerst die Kategorien, dann die Getränke.

`data/getraenkekategorien.json`:

```json
[
  { "id": "kat-signature", "titel": "Signature Drinks", "reihenfolge": 1 },
  { "id": "kat-alkoholfrei", "titel": "Alkoholfrei", "reihenfolge": 2 }
]
```

`data/getraenke.json`:

```json
[
  { "id": "drink-beispiel", "name": "Bezeichnung laut Karte",
    "beschreibung": "Zutaten laut Karte", "preis": 18.5, "menge": "4 cl",
    "kategorie": "kat-signature", "reihenfolge": 1 }
]
```

- `preis` ist eine **Zahl**, kein Text: `18` wird zu «18.–», `18.5` zu «18.50».
- Alles ausser `name`, `kategorie` und `reihenfolge` ist freiwillig.
- Sobald mindestens ein Getränk erfasst ist, verschwindet der Hinweistext auf der
  Getränkeseite von selbst. Den Hinweis in `data/seiten/getraenke.json` dann löschen.

Bezeichnungen, Mengen und Preise **exakt** aus der Karte des Betriebs übernehmen.

## Abweichende Öffnungszeiten

In `data/einstellungen.json` unter `sonderoeffnungszeiten`:

```json
{ "id": "sonder-1august", "bezeichnung": "1. August", "datum": "2026-08-01",
  "geschlossen": true }
```

Sie erscheinen auf der Besuchsseite und schalten am betreffenden Tag den
Geöffnet-Hinweis auf «geschlossen».

## Texte mit Formatierung

Die Rechtstexte und die Textabschnitte sind im Format «Portable Text» gespeichert –
dasselbe Format, das Sanity später verwendet. Von Hand ist das mühsam; bequemer ist
der Umweg über Markdown:

```bash
npm run text:konvertieren -- pfad/zum/text.md
```

Das gibt den fertigen Block auf der Konsole aus, der dann in das Feld `inhalt`
kopiert wird. Unterstützt werden Absätze, `##`-Zwischentitel, Aufzählungen,
**fett**, *kursiv* und Links.

## Fotos ergänzen

Erst wenn die Nutzungsrechte geklärt sind (siehe `CLAUDE.md`, Abschnitt 5):

1. Originaldatei nach `assets/originale/` legen.
2. Herkunft und Freigabe in `assets/originale/HERKUNFT.md` festhalten.
3. Bild in `scripts/bilder-optimieren.mjs` unter `BILDER` eintragen.
4. `npm run bilder` – erzeugt `public/images/` und `data/bilder.json`.
5. Im gewünschten Abschnitt einen `bildBaustein` ergänzen, mit Alt-Text.

## Was nicht ohne Rücksprache geändert wird

- Der Demo-Hinweis (`demoHinweis`) – er muss stehen bleiben, solange der Betrieb
  der Vorschau nicht zugestimmt hat.
- Das Impressum, das den Betreiber der Vorschau vom dargestellten Betrieb trennt.
- Die Datenschutzerklärung, wenn gleichzeitig etwas eingebaut wird, das eine
  Verbindung nach aussen aufbaut.
