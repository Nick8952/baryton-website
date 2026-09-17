# Prüfbericht

Stand: 17. September 2026. Alle Angaben beziehen sich auf den fertigen statischen
Export, ausgeliefert wie auf GitHub Pages (`npm run vorschau:pages`, Unterpfad
`/baryton-website`). Geprüft mit Chrome 1xx über Puppeteer auf macOS.

**Geräteemulation, keine echten Geräte.** Auf einem physischen Telefon oder mit
einem echten Screenreader (VoiceOver, NVDA) wurde nicht getestet.

## Automatische Prüfungen

Alle laufen auch im GitHub-Actions-Workflow:

| Prüfung | Ergebnis |
|---|---|
| `npm run inhalt:pruefen` | ✓ 5 Seiten, 0 Getränkekategorien, 0 Getränke, 8 interne Links |
| `npm run oeffnung:pruefen` | ✓ 20 von 20 Grenzfällen bestanden |
| `npm run lint` | ✓ keine Meldungen |
| `npm run typecheck` | ✓ keine Fehler |
| `npm run build:pages` | ✓ 8 Seiten erzeugt |
| `npm run export:pruefen` | ✓ 8 HTML- und 1 CSS-Datei, 221 interne Verweise korrekt unter dem Unterpfad, keine externen Ressourcen, `noindex` auf allen Seiten |
| `npm run seed -- --probe` | ✓ 8 Dokumente, keine doppelten IDs (schreibt nichts) |

## Öffnungszeiten-Logik

Die Wochengrafik und der Hinweis «jetzt geöffnet» rechnen selbst. Geprüft mit festen
Zeitpunkten in `scripts/oeffnung-pruefen.mts`, unter anderem:

- Samstag 16:00 → offen bis 02:00
- Sonntag 00:30 → noch offen, weil das Samstagsfenster über Mitternacht läuft
- Sonntag 03:00 und Montag → geschlossen, nächste Öffnung Dienstag 15:30
- Donnerstag 23:30 → offen bis 00:00; Freitag 00:30 → geschlossen (Donnerstag endet um Mitternacht)
- Sonntag als abweichend geschlossen gepflegt → auch das hineinragende Samstagsfenster gilt nicht mehr
- Montag mit Sonderöffnung 18:00–20:00 → um 19:00 offen, um 12:00 «öffnet heute um 18:00»
- Dienstag als geschlossen gepflegt → nächste Öffnung springt auf Mittwoch
- Keine Zeiten hinterlegt → Status «unbekannt», **keine** Grafik, und es wird nirgends
  «geschlossen» behauptet
- Skalenmarken sitzen an der richtigen Stelle: bei der Spanne 15:00–02:00 liegt 18:00
  bei 27 %, nicht in der Mitte

## Darstellung

Geprüft bei 360, 390, 768 und 1440 Pixeln Breite, jede Seite als Vollbild-Aufnahme
angesehen.

- Kein horizontales Scrollen, keine über den Rand ragenden Elemente (`scrollWidth`
  gegen `clientWidth` und jede Elementkante gemessen).
- Tippflächen mindestens 44 × 44 px bei allen Knöpfen, Navigationspunkten,
  Fusszeilen-Links und der Wortmarke. **Ausnahme:** Links mitten im Fliesstext der
  Rechtstexte (E-Mail-Adresse, Telefonnummer, Quellenlink) sind rund 30 px hoch. Sie
  fallen unter die Ausnahme für Links innerhalb eines Textblocks und liegen über dem
  Mindestmass von 24 px.
- Kontraste gemessen (WCAG-Formel, 16 Textproben): niedrigster Wert 5.26:1
  (Textlink auf Papier), höchster 16.58:1. Alle über der Anforderung.
- Dunkle Flächen: Hero-Fliesstext 10.4:1, Aufruf-Text 10.4:1, Demo-Band 11.1:1.

### Dabei gefunden und behoben

1. Der zweite Knopf («Anrufen», «Besuch planen») stand mit dunkler Schrift auf
   dunklem Grund und war praktisch unsichtbar – die Aufhellungsregel griff nur für
   Abschnitte mit der Klasse `nacht`, nicht für Hero, Aufruf und 404-Seite.
2. Die Wochengrafik brach auf schmalen Geräten ungünstig um; Tag, Balken und Zeit
   standen versetzt. Jetzt stehen Tag und Zeit in einer Zeile, die Saite darunter.
3. Wortmarke und Fusszeilen-Links waren unter 44 px hoch.
4. Die Wochenliste auf der Besuchsseite lief bei 1440 px über die ganze Breite
   auseinander; sie ist jetzt auf 32 rem begrenzt.

## Bedienung

- **Tastatur:** Der erste Tabulatorschritt erreicht den sichtbaren Sprunglink «Zum
  Inhalt springen». Fokusrahmen 3 px, auf dunklen Flächen in einer helleren Farbe.
  Das mobile Menü lässt sich mit Enter öffnen und mit Escape schliessen; alle drei
  Navigationspunkte sind darin erreichbar. Es schliesst beim Seitenwechsel.
- **Reduzierte Bewegung:** Mit `prefers-reduced-motion: reduce` wird `data-anim` gar
  nicht erst gesetzt. Kein Abschnitt ist ausgeblendet, kein Balken zusammengefaltet.
  Dasselbe gilt ohne JavaScript.
- **Navigation ohne Neuladen:** Start → Besuch → Getränke → Zurück-Taste, jede Seite
  vollständig durchgescrollt: kein Abschnitt bleibt unsichtbar.
- **Bildschirmleser:** Die Balken der Wochengrafik sind `aria-hidden`; Tag und Zeit
  stehen als Text, der laufende Tag zusätzlich mit «(heute)». Nicht mit einem echten
  Bildschirmleser gegengeprüft.

### Dabei gefunden und behoben

5. **Kritisch:** Nach einem Klick auf einen internen Link blieben die Abschnitte der
   neuen Seite dauerhaft unsichtbar. Der Beobachter lief nur beim ersten Laden, die
   Ausblendregel galt aber weiter. Gefunden in der Codex-Review, behoben und
   anschliessend im Browser über drei Seitenwechsel und die Zurück-Taste bestätigt.
6. Das mobile Menü meldete auch im geöffneten Zustand «Menü öffnen».

## Datenschutztechnik

Gemessen im Browser auf allen Seiten:

- **Externe Verbindungen: keine.** Weder beim ersten Laden noch nach dem Scrollen
  oder Navigieren. Schriften kommen als `.woff2` vom selben Server.
- **Cookies: keine.** `document.cookie` ist leer.
- **`localStorage` und `sessionStorage`: unbenutzt** (0 Einträge).
- Der Routenlink führt erst beim Anklicken zu Google Maps; es wird keine Karte
  eingebettet. Externe Links tragen `target="_blank"` und `rel="noopener noreferrer"`.
- Der Export-Prüfer meldet jede externe Ressource in HTML und CSS als Fehler und
  läuft in der GitHub-Action mit – ein versehentlich eingebauter fremder Dienst
  bricht also den Build.

**Folge:** Kein Einwilligungsbanner, weil es nichts gibt, worin eingewilligt werden
könnte. Stattdessen beschreibt die Datenschutzerklärung genau diesen Zustand samt
GitHub Pages als Hoster, Server-Protokollen und Auslandsbekanntgabe. Die Prüfabfolge
«vor Auswahl / nach Ablehnung / nach Zustimmung / nach Widerruf» entfällt mangels
Auswahl; geprüft wurde stattdessen, dass über den gesamten Besuch hinweg nichts
gespeichert und nichts nach aussen geladen wird.

## SEO

- `noindex` auf allen acht erzeugten Seiten, maschinell geprüft.
- `robots.txt` sperrt bewusst nicht pauschal, damit das `noindex` lesbar bleibt.
- Strukturierte Daten: genau ein `BarOrPub`-Block mit Name, Adresse, Telefon und
  Öffnungszeiten. Keine Bewertungen, keine Preisklasse, keine Speisekarte.
- Jede Seite hat einen eigenen Titel und eine eigene Beschreibung; Canonical-Links
  und Open-Graph-URLs werden aus `siteUrl` gebildet.
- 404: Eine unbekannte Adresse liefert HTTP 404 und die gestaltete Fehlerseite.

## Faktentreue

Der Inhalt wurde gegen `docs/QUELLEN.md` durchgegangen. Auf der Website stehen nur
Name, Adresse, Telefonnummer, Kategorie und die Öffnungszeiten – letztere mit
sichtbarem Herkunftshinweis. Keine Getränke, Preise, Speisen, Veranstaltungen,
Bewertungen, Betreiberangaben oder Fotos.

### Dabei gefunden und behoben

7. Auf drei Seiten stand sinngemäss «für einen Tisch am besten kurz anrufen». Das
   deutet einen Reservationsweg an, der nicht bestätigt ist. Die Kontaktseite sagt
   jetzt ausdrücklich, dass diese Website keine Reservationen entgegennimmt und keine
   Anfragen weiterleitet.
8. Die vorbereitete E-Mail-Vorlage fragte Tag, Uhrzeit und Personenzahl ab – dasselbe
   Problem. Die Felder sind entfernt.
9. Die Getränkeseite beschrieb das Pflegen im CMS so, als wäre es eingerichtet. Jetzt
   steht dort, dass heute keines angebunden ist.
10. Die Fusszeile trug «© Baryton Cocktail Lounge». Damit wäre der Betrieb als
    Rechteinhaber dieser Vorschau erschienen, obwohl er sie weder beauftragt hat noch
    betreibt. Solange der Demo-Hinweis gesetzt ist, steht dort nur noch
    «Gestaltungskonzept 2026».
11. «Wenige Gehminuten vom Hauptbahnhof» war eine Schätzung und ist raus; die
    Lagebeschreibung stützt sich jetzt nur noch auf Adresse und Stadtplan.

## Nicht geprüft

- Echte Geräte und echte Bildschirmleser.
- Sanity und Vercel: nicht eingerichtet, also nichts live überprüfbar. Siehe
  `docs/UEBERGABE.md`, Abschnitt 3.
- Die Rechtstexte sind nicht anwaltlich geprüft.
- Ladezeiten unter echten Mobilfunkbedingungen (die Seite lädt eine CSS-Datei, zwei
  Schriftdateien und kein einziges Bild – gemessen wurde das aber nicht).
