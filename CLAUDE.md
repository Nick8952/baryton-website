# Baryton Cocktail Lounge – Projektanweisungen

Verkaufs-Demo für die **Baryton Cocktail Lounge**, Schweizergasse 8, 8001 Zürich.
Der Betrieb hat keine eigene Website und weiss nichts von dieser Vorschau.

Diese Datei gilt zusätzlich zur übergeordneten `CLAUDE.md` im Ordner
`03_Websiten_hustle` (Obsidian-Brain, Kontextregeln) und zur globalen
`~/.claude/CLAUDE.md` (Codex-Zusammenarbeit).

---

## 1. Grundregeln für Inhalte

**Nichts erfinden.** Die Quellenlage steht in `docs/QUELLEN.md`. Belegt sind:
Name, Adresse, Telefonnummer, Kategorie «Loungebar», die Öffnungszeiten aus dem
Google-Unternehmensprofil (mit sichtbarem Herkunftshinweis) sowie ein fotografisch
belegter **Ausschnitt** der Getränke- und Speisekarte (Bier, Aperitif, ein paar
Klassiker-Cocktailnamen, Salate, Burger, Flammkuchen, Pizza – Details und Herkunft
in `docs/QUELLEN.md`). Dieser Ausschnitt ist erkennbar als Fotobeleg gekennzeichnet,
nicht als aktuelle, vollständige oder amtliche Karte.

Ausdrücklich **nicht** belegt und deshalb nirgends auf der Website:
Veranstaltungen, Live-Musik, Terrasse, WLAN, Bewertungen, Betreiberangaben,
Rechtsform, UID, Gründungsjahr, E-Mail-Adresse. Auch innerhalb der Karte gilt:
keine Preise oder Positionen ergänzen, die auf keinem Foto zu sehen sind – lieber
ein Eintrag ohne Preis (mit `hinweis`) als ein geschätzter Preis.

Wer Inhalte ergänzt, trägt die Quelle in `docs/QUELLEN.md` nach.

**Keine Reservationsfunktion.** Es gibt kein Buchungssystem und keinen bestätigten
Anfrageprozess. Die Website darf nie den Eindruck erwecken, dass über sie ein Tisch
gebucht oder eine Anfrage zugestellt wird.

**Demo-Kennzeichnung bleibt.** Das Band ganz oben und der Hinweis im Footer
(`demoHinweis` in `data/einstellungen.json`) dürfen nicht entfernt werden, solange
der Betrieb der Vorschau nicht zugestimmt hat.

---

## 2. Architektur

Eine Codebasis, zwei Betriebsarten – gesteuert über `DEPLOY_TARGET`:

| | jetzt | später |
|---|---|---|
| Ziel | GitHub Pages | Vercel |
| `DEPLOY_TARGET` | `pages` (Standard) | `vercel` |
| Next-Modus | `output: "export"` | Server-Build mit ISR |
| Unterpfad | `/baryton-website` | keiner |
| Inhalte | `data/*.json` | Sanity |

Zentrale Dateien:

- `lib/deploy-ziel.ts` – **einzige** Stelle für Betriebsart, `basePath` und `siteUrl`.
- `lib/content/` – die Inhaltsschnittstelle. `types.ts` definiert das Modell,
  `local.ts` liest `data/`, `sanity.ts` liest Sanity, `index.ts` wählt anhand von
  `CONTENT_SOURCE`. **Seitenkomponenten importieren nie direkt aus `local.ts` oder
  `sanity.ts`.**
- `lib/oeffnung.ts` – reine Auswertung der Öffnungszeiten (Wochengrafik, Status,
  JSON-LD). Kennt Fenster über Mitternacht und rechnet in `Europe/Zurich`.
- `lib/assets.ts` – setzt den Unterpfad vor Datei-URLs. Für Seitenlinks macht das
  `next/link` selbst; Bilder und Downloads brauchen `assetUrl()`.
- `server-routes/` – Studio, Webhook und Vorschau-Routen. Liegen **ausserhalb** von
  `app/`, weil der statische Export sie nicht bauen könnte. `scripts/vercel-routen.mjs`
  kopiert sie beim Vercel-Build nach `app/` und entfernt sie beim Pages-Build.

Regeln:

- Keine zweite Website, keine doppelten Seitenkomponenten pro Betriebsart.
- `assetPrefix` nicht zusätzlich zu `basePath` setzen (löst Pfade aus `public/` nicht auf).
- Keine rohen `<a href="/…">`, kein `src="/…"`, kein `url("/…")` in CSS – sonst bricht
  der Unterpfad. Intern immer `SmartLink` bzw. `assetUrl()`.
- `CONTENT_SOURCE` bleibt serverseitig (kein `NEXT_PUBLIC_`).
- Dynamische Routen brauchen vollständige `generateStaticParams()` und
  `dynamicParams = false`.
- `useSearchParams` nur in einer Client-Komponente unter einer `Suspense`-Grenze.

---

## 3. Befehle

```bash
npm install
npm run dev              # Entwicklung (Pages-Modus, Unterpfad aktiv)
npm run build:pages      # statischer Export nach out/
npm run vorschau:pages   # out/ so ausliefern wie GitHub Pages (Unterpfad, 404.html)
npm run inhalt:pruefen   # data/*.json auf Vollständigkeit prüfen
npm run export:pruefen   # out/ prüfen: Unterpfade, tote Ziele, externe Requests, noindex
npm run typecheck
npm run lint
npm run schriften        # Schriftdateien aus node_modules nach app/fonts kopieren
npm run bilder           # Bildvarianten erzeugen (erst wenn es freigegebene Fotos gibt)
npm run seed -- --probe  # Sanity-Import trocken durchspielen (schreibt nichts)
```

Vor jedem Commit mindestens: `inhalt:pruefen`, `lint`, `typecheck`, `build:pages`,
`export:pruefen`. Genau diese Schritte laufen auch im GitHub-Actions-Workflow.

---

## 4. Gestaltungskonzept «Resonanz»

Ein Baryton ist ein Streichinstrument mit mitschwingenden Resonanzsaiten. Daraus
kommt das durchgehende Motiv: **waagrechte Linien**.

Das Erkennungszeichen ist die **Wochengrafik**: eine Linie je Wochentag, deren Länge
der tatsächlichen Öffnungsdauer entspricht. Sie ist Information, keine Dekoration –
Tag und Zeit stehen zusätzlich als Text, die Balken sind `aria-hidden`.

- **Farben** (`app/globals.css`, alle als CSS-Variablen):
  Nacht `#17111F`, Tiefe `#0D0912`, Papier `#F7F2EA`, Tinte `#221B29`,
  Akzent Amarena `#B3355C` (auf dunkel: `#E68AA6`), Flieder `#C4B3DE`.
  Bewusst **kein Schwarz-Gold**. Helle Papierflächen tragen die Inhalte, dunkle
  Nachtflächen rahmen sie (Hero, Aufruf, Footer, einzelne Abschnitte).
- **Schriften**: Fraunces (variabel, Anzeige – `SOFT`/`WONK`-Achsen) und
  Schibsted Grotesk (variabel, Text). Beide OFL, liegen als `.woff2` in `app/fonts/`
  und werden über `next/font/local` eingebunden. **Nie** Google Fonts per URL laden.
- **Bewegung**: nur Einblenden beim Scrollen und wachsende Unterstreichungen.
  Die CSS-Regeln greifen erst, wenn `components/Reveal.tsx` `data-anim="an"` setzt –
  ohne JavaScript und bei `prefers-reduced-motion: reduce` ist alles sofort sichtbar.
  Kein Audio, kein Scroll-Hijacking, kein Parallax.
- **Bedienung**: Tippflächen mindestens 44 × 44 px (Ausnahme: Links mitten im
  Fliesstext), sichtbarer Fokus, Kontraste mindestens 4.5:1.
- Farbwerte und Abstände sind **nicht** über das CMS editierbar.

Dieses Konzept gehört zu diesem Kunden. Es wird nicht in andere Projekte übernommen,
und es wird hier kein Design aus einem anderen Projekt eingesetzt. Als
**Architektur**-Vorlage (nicht Design) diente `vm-garage-website`.

---

## 5. Bilder

Derzeit enthält die Website **ein Bildmotiv**: eine per KI nach dem Leuchtschild am
Lokal nachgezeichnete Wortmarke. Sie ist nicht die Originaldatei oder das offizielle
Logo des Betriebs. Sonst enthält die Website weiterhin keine Fotos. Für die Lounge
existiert öffentlich kein weiteres Bildmaterial mit geklärten Nutzungsrechten:
Google weist die Fotos im Kartenprofil selbst als möglicherweise urheberrechtlich
geschützt aus, die Facebook-Seite ist ohne Anmeldung nicht abrufbar.

Deshalb:

- Die Wortmarke ist ein freigegebener Nachbau für diese Vorschau, **nicht** das
  offizielle Logo des Betriebs. Das steht so auch im Impressum.
- Fotos erst einbauen, wenn der Betrieb sie freigibt. Ablage der Originale in
  `assets/originale/`, Herkunft und Freigabe in `assets/originale/HERKUNFT.md`,
  danach `npm run bilder`.
- Keine Gäste- oder Nutzerfotos aus Kartendiensten.
- Stock- oder generierte Bilder nie als Innenräume, Mitarbeitende, Gäste oder
  Getränke dieser Lounge ausgeben.

---

## 6. Datenschutz und Recht

Die Website stellt **keine externen Verbindungen** her: Schriften lokal, keine
Karten-Einbettung, kein Video, keine Social-Media-Widgets, keine Analyse.
Sie setzt **keine Cookies** und nutzt weder `localStorage` noch `sessionStorage`.

Daraus folgt bewusst: **kein Einwilligungsbanner**, sondern eine
Datenschutzerklärung, die genau diesen Zustand beschreibt (GitHub Pages als Hoster,
Server-Protokolle mit IP-Adresse, Auslandsbekanntgabe). Ein Zustimmungsfenster ohne
zustimmungspflichtige Dienste wäre irreführend.

**Wer etwas hinzufügt, das eine Verbindung nach aussen aufbaut** (eingebettete Karte,
Video, Schriftdienst, Analyse, Formulardienst), muss zwingend:

1. die Datenschutzerklärung anpassen,
2. eine echte Einwilligungslösung mit gleichwertigem Ablehnen, Einstellungen und
   Widerruf einbauen, und den Dienst vor der Einwilligung **nicht** laden,
3. `npm run export:pruefen` läuft sonst ohnehin auf einen Fehler – der Prüfer
   meldet jede externe Ressource.

Im Impressum ist der Betreiber der Vorschau (Nick Holzbecher) klar vom dargestellten
Betrieb getrennt. Die Lounge darf nicht als Verantwortliche dieser Website erscheinen.

Die Rechtstexte sind sorgfältig auf die tatsächliche Technik geschrieben, aber
**nicht anwaltlich geprüft**. Das darf auch nicht behauptet werden.

---

## 7. SEO

- Alle Seiten tragen `noindex`, solange `INDEXIERUNG` nicht auf `1` steht.
- `robots.txt` sperrt bewusst **nicht** pauschal – sonst könnten Suchmaschinen das
  `noindex` gar nicht lesen.
- Strukturierte Daten: `BarOrPub` mit Name, Adresse, Telefon und Öffnungszeiten.
  **Keine** `aggregateRating`, `review`, `priceRange`, `servesCuisine` oder `menu` –
  dafür fehlen geprüfte Angaben.
- Canonical-Links und Open Graph kommen aus `siteUrl`; nie eine Domain hart eintragen.

---

## 8. Sanity und Vercel

Beides ist **vorbereitet, aber nicht eingerichtet**. Es existiert kein Sanity-Projekt
und kein Vercel-Projekt. Was vorbereitet ist, steht in
`docs/SANITY-VERCEL-EINRICHTUNG.md`; die Umstellung des Hostings in
`docs/UMSTELLUNG-VERCEL.md`.

Nicht behaupten, das CMS sei angebunden oder getestet. Geprüft ist bisher nur:
Die Demo baut und läuft ohne jede Sanity-/Vercel-Variable, und `npm run seed -- --probe`
läuft fehlerfrei durch.

Kommt ein neuer Inhaltstyp dazu, muss er an **allen** Stellen nachgezogen werden:
`lib/content/types.ts` → `local.ts` → `sanity.ts` → `sanity/schemas/` →
`sanity.config.ts` (Studio-Struktur) → `scripts/seed.mts` →
`scripts/inhalt-pruefen.mts` → Komponente.

---

## 9. Deployment

`.github/workflows/pages.yml` baut bei jedem Push auf `main`:
`npm ci` → `inhalt:pruefen` → `lint` → `typecheck` → `build:pages` →
`export:pruefen` → `touch out/.nojekyll` → Upload → Deploy auf GitHub Pages.

Der Workflow braucht **keine Geheimnisse**. Es gehören auch keine ins Repository.

Live: `https://nick8952.github.io/baryton-website/`
