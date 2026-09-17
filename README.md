# Baryton Cocktail Lounge – Website-Vorschau

Unverbindliches Gestaltungskonzept für die Baryton Cocktail Lounge,
Schweizergasse 8, 8001 Zürich. **Nicht vom Betrieb beauftragt.**

Live: <https://nick8952.github.io/baryton-website/>

Next.js 16 mit App Router und TypeScript, als statischer Export auf GitHub Pages.
Sanity (CMS) und Vercel (Hosting) sind vorbereitet, aber **nicht eingerichtet** –
die Website läuft vollständig ohne beides.

## Schnellstart

```bash
npm install
npm run dev          # http://localhost:3000/baryton-website
```

## Wichtige Befehle

```bash
npm run build:pages      # statischer Export nach out/
npm run vorschau:pages   # out/ so ausliefern wie GitHub Pages
npm run inhalt:pruefen   # Inhaltsdateien prüfen
npm run export:pruefen   # Export prüfen: Unterpfade, tote Ziele, externe Requests, noindex
npm run lint && npm run typecheck
```

## Dokumentation

| Datei | Inhalt |
|---|---|
| `CLAUDE.md` | Architektur, Designregeln, Inhaltsregeln, Deployment |
| `docs/QUELLEN.md` | Woher jede Angabe stammt und was bewusst fehlt |
| `docs/INHALTE-PFLEGEN.md` | Texte, Öffnungszeiten und Getränkekarte ändern |
| `docs/SANITY-VERCEL-EINRICHTUNG.md` | CMS und Hosting später einrichten |
| `docs/UMSTELLUNG-VERCEL.md` | Checkliste für den Wechsel von GitHub Pages zu Vercel |
| `docs/UEBERGABE.md` | Offene Fragen, fehlende Unterlagen, nächste Schritte |
| `docs/PRUEFBERICHT.md` | Was tatsächlich geprüft wurde – und was nicht |

## Eigenheiten

- **Keine externen Verbindungen.** Schriften liegen lokal, keine Karten-Einbettung,
  kein Tracking, keine Cookies. Deshalb gibt es bewusst kein Einwilligungsbanner,
  sondern eine Datenschutzerklärung, die genau diesen Zustand beschreibt.
- **Ein Bild, keine Fotos.** Verwendet wird nur eine per KI nach dem Leuchtschild
  nachgezeichnete Wortmarke; sie ist nicht das Originallogo des Betriebs. Fotos von
  Räumen, Personen, Getränken oder Speisen sind weiterhin nicht enthalten.
- **Getränke- und Speisekarte: fotografisch belegter Ausschnitt, nicht erfunden.**
  Bier, Aperitif, ein paar Klassiker-Cocktailnamen, Salate, Burger, Flammkuchen und
  Pizza stammen von Fotos der Karte im Lokal (siehe `docs/QUELLEN.md`). Fehlt für
  einen Bereich jedes Foto, erscheint ein Hinweis statt ausgedachter Produkte.
- **Alle Seiten tragen `noindex`**, solange `INDEXIERUNG` nicht gesetzt ist.
