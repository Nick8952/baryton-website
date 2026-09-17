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
| `data/seiten/lounge.json` | Die Lounge |
| `data/seiten/speisekarte.json` | Speisekarte (Speisen und Getränke) |
| `data/seiten/besuch.json` | Besuch |
| `data/seiten/kontakt.json` | Kontakt |
| `data/seiten/impressum.json`, `datenschutz.json` | verweisen nur auf den Rechtstext |
| `data/rechtstexte/impressum.json`, `datenschutz.json` | die eigentlichen Rechtstexte |
| `data/getraenkekategorien.json`, `data/getraenke.json` | die Getränke |
| `data/speisekategorien.json`, `data/speisen.json` | die Speisen |

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

## Karte pflegen (Speisen und Getränke)

Speisen und Getränke funktionieren gleich, nur in eigenen Dateien: zuerst die
Kategorien, dann die Einträge.

`data/speisekategorien.json` (bzw. `data/getraenkekategorien.json`):

```json
[
  { "id": "sp-kat-salate", "titel": "Salate", "reihenfolge": 1 },
  { "id": "sp-kat-burger", "titel": "Burger",
    "beschreibung": "Serviert mit Kartoffel-Wedges.", "reihenfolge": 2 }
]
```

`data/speisen.json` (bzw. `data/getraenke.json`) – ein einzelner Preis:

```json
[
  { "id": "sp-beispiel", "name": "Bezeichnung laut Karte",
    "beschreibung": "Zutaten laut Karte", "preis": 18.5,
    "kategorie": "sp-kat-salate", "reihenfolge": 1 }
]
```

Gibt es **mehrere Grössen** (Pizza, Bier, Glas/Flasche), statt `preis` die
`varianten` verwenden:

```json
{ "id": "sp-pizza-beispiel", "name": "Chicago",
  "beschreibung": "Tomatensauce, Mozzarella, Tomaten.",
  "varianten": [
    { "_key": "v1", "bezeichnung": "Standard", "preis": 17.9 },
    { "_key": "v2", "bezeichnung": "Medium", "preis": 26.8 },
    { "_key": "v3", "bezeichnung": "Family", "preis": 36.5 }
  ],
  "kategorie": "sp-kat-pizza", "reihenfolge": 2 }
```

- `preis` ist eine **Zahl**, kein Text: `18` wird zu «18.–», `18.5` zu «18.50».
- `preis` und `varianten` nie zusammen setzen – die Inhaltsprüfung meldet das.
- Haben **alle** Einträge einer Kategorie dieselben Grössennamen, setzt die Website
  sie automatisch einmal als Spaltenkopf und stellt die Preise bündig untereinander.
  Fehlt einem Eintrag eine Grösse, bleibt die Spalte dort leer – dafür gehört ein
  `hinweis` an den Eintrag, damit klar ist, warum.
- Ohne Preis geht auch: Name eintragen und im `hinweis` erklären, warum keiner
  dasteht. Besser als ein geschätzter Preis.
- Alles ausser `name`, `kategorie` und `reihenfolge` ist freiwillig.
- Sobald mindestens ein Eintrag erfasst ist, verschwindet der Hinweistext des
  jeweiligen Abschnitts auf der Speisekarte von selbst.
- Die Sprungliste über einer Karte schaltet `"mitSprungmarken": true` im jeweiligen
  Baustein in `data/seiten/speisekarte.json` ein (sinnvoll ab drei Kategorien).

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
