# Sanity und Vercel einrichten

**Status: vorbereitet, nicht eingerichtet.** Es existiert kein Sanity-Projekt und
kein Vercel-Projekt. Nichts in dieser Anleitung wurde gegen echte Dienste getestet.

Geprüft ist bisher nur:

- Die Demo baut und läuft **ohne** jede Sanity- oder Vercel-Variable.
- `npm run seed -- --probe` läuft fehlerfrei durch und listet die 8 Dokumente, die
  angelegt würden.
- Schemas, Studio-Konfiguration, Abfragen, Webhook- und Vorschau-Routen sind
  geschrieben und typgeprüft.

Alles, was erst nach der Einrichtung überprüfbar ist, ist unten mit **(erst danach
prüfbar)** markiert.

---

## Was schon fertig im Repository liegt

| Teil | Datei | Zweck |
|---|---|---|
| Inhaltsmodell | `sanity/schemas/dokumente.ts` | Einstellungen, Seiten, Getränkekategorien, Getränke, abweichende Öffnungszeiten, Rechtstexte |
| Bausteine | `sanity/schemas/bausteine/index.ts` | die neun Abschnittstypen für den Seitenaufbau |
| Grundtypen | `sanity/schemas/objekte.ts` | Bild (mit Pflicht-Alt-Text), Link, Text, Adresse, Öffnungszeit |
| Studio | `sanity.config.ts` | deutschsprachiges Studio, sortierte Übersicht, Vorschau |
| Abfragen | `lib/content/sanity.ts` | liefert exakt dieselbe Struktur wie die lokalen Dateien |
| Studio-Seite, Webhook, Vorschau | `server-routes/app/` | werden beim Vercel-Build nach `app/` kopiert |
| Import | `scripts/seed.mts` | überträgt die heutigen Inhalte nach Sanity |

Die Feldnamen sind deutsch, jedes Feld hat einen Hilfstext, Pflichtfelder sind
geprüft. Farben, Abstände und technische Kennungen sind nicht editierbar.

---

## Schritt 1 – Sanity-Projekt anlegen

```bash
npx sanity@latest login
npx sanity@latest projects create "Baryton Cocktail Lounge"
```

Projekt-ID notieren. Dataset: `production`, öffentlich lesbar (die Inhalte der
Website sind ohnehin öffentlich).

**Wichtig:** ein **eigenes** Projekt anlegen. Nicht die Projekt-ID eines anderen
Kunden wiederverwenden.

## Schritt 2 – Zugänge eintragen

`.env.example` nach `.env.local` kopieren und ausfüllen:

```
CONTENT_SOURCE=sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=<Projekt-ID>
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_WRITE_TOKEN=<Token mit Rolle «Editor», nur lokal>
SANITY_API_READ_TOKEN=<Token mit Rolle «Viewer», für die Entwurfsvorschau>
SANITY_REVALIDATE_SECRET=<frei gewähltes Geheimnis>
```

Tokens entstehen unter sanity.io/manage → API → Tokens. `.env.local` wird nicht
committet; Tokens gehören nie ins Repository.

## Schritt 3 – Inhalte importieren

Zuerst trocken:

```bash
npm run seed -- --probe
```

Das schreibt nichts und zeigt nur, welche Dokumente entstehen würden. Dann echt:

```bash
npm run seed
```

`npm run seed` legt **nur fehlende** Dokumente an und überschreibt nichts
Vorhandenes. Erst `npm run seed -- --force` ersetzt die vom Skript verwalteten
Dokumente – das löscht im Studio gemachte Änderungen und wird nur bewusst benutzt.

Die Dokument-IDs sind fest (`einstellungen`, `seite-start`, `rechtstext-impressum` …),
das Skript ist also wiederholbar. Bilder würde Sanity anhand des Dateiinhalts
erkennen; derzeit gibt es keine.

## Schritt 4 – Studio starten

```bash
npm run dev:vercel
```

Das kopiert die Server-Routen nach `app/` und startet im Vercel-Modus. Das Studio
liegt dann unter `http://localhost:3000/studio`. **(erst danach prüfbar)**

## Schritt 5 – Vercel

1. Auf vercel.com das GitHub-Repository importieren.
2. Build Command: `npm run build:vercel`. Output: Standard (kein statischer Export).
3. Umgebungsvariablen setzen – für Production **und** Preview:
   `DEPLOY_TARGET=vercel`, `CONTENT_SOURCE=sanity`, `SITE_URL=<Vercel-URL>`,
   `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`,
   `SANITY_API_READ_TOKEN`, `SANITY_REVALIDATE_SECRET`.
   `INDEXIERUNG` bleibt leer, solange es eine Vorschau ist.
4. Deployen. **(erst danach prüfbar)**

## Schritt 6 – Veröffentlichen wirkt sofort

In Sanity unter API → Webhooks einen Webhook anlegen:

- URL: `https://<vercel-domain>/api/revalidate`
- Trigger: Create, Update, Delete
- Secret: derselbe Wert wie `SANITY_REVALIDATE_SECRET`

Danach im Studio etwas ändern und veröffentlichen – die Website sollte innert
Sekunden nachziehen. **(erst danach prüfbar)**

## Schritt 7 – CORS und Vorschau

In sanity.io/manage → API → CORS Origins die Vercel-Domain eintragen
(mit «Allow credentials»), sonst lädt das Studio nicht.

Die Entwurfsvorschau läuft über `/api/vorschau/aktivieren` und
`/api/vorschau/beenden`. **(erst danach prüfbar)**

## Schritt 8 – Zugang für den Kunden

In sanity.io/manage → Members einladen. Rolle «Editor» genügt zum Pflegen;
«Administrator» ist nicht nötig. Der Kunde meldet sich unter `/studio` mit E-Mail an
und braucht **kein** GitHub-Konto.

---

## Stolpersteine

- **Falsche Projekt-ID.** Beim Anlegen darauf achten, nicht das Projekt eines anderen
  Kunden zu erwischen. Die ID steht in `.env.local` und in den Vercel-Variablen.
- **Branch.** Vercel baut standardmässig `main`. Ein Umbau auf einem anderen Branch
  geht nicht live, solange er nicht gemergt ist.
- **`CONTENT_SOURCE=sanity` ohne Projekt-ID** bricht den Build mit einer klaren
  Meldung ab. Das ist Absicht – ein stiller Rückfall auf die Demo-Inhalte wäre
  schlimmer als ein Fehler.
- **Studio-Routen im Pages-Build.** `npm run build:pages` entfernt sie automatisch.
  Wer sie von Hand nach `app/` kopiert, bricht den statischen Export.
- **Neuer Inhaltstyp.** Er muss an allen acht Stellen nachgezogen werden – die Liste
  steht in `CLAUDE.md`, Abschnitt 8.
