# Checkliste: von GitHub Pages auf Vercel

Der Unterschied ist klein, aber an vier Stellen fehleranfällig: **Unterpfad,
absolute URLs, Indexierung und Inhaltsquelle.**

Heute liegt die Seite unter `nick8952.github.io/baryton-website/`, später unter einer
Domain-Wurzel. Alles, was den Unterpfad hart eingetragen hat, bricht dabei.

## Was sich technisch ändert

| | GitHub Pages (jetzt) | Vercel (später) |
|---|---|---|
| `DEPLOY_TARGET` | nicht gesetzt (= `pages`) | `vercel` |
| Next-Modus | `output: "export"`, Dateien in `out/` | Server-Build mit ISR |
| `basePath` | `/baryton-website` | leer |
| `SITE_URL` | `https://nick8952.github.io/baryton-website` | Vercel- bzw. Kundendomain |
| Inhalte | `data/*.json` | Sanity (`CONTENT_SOURCE=sanity`) |
| Bilder | fertige Varianten aus `public/images` | Sanity-CDN, optimiert |
| Studio, Webhook, Vorschau | nicht enthalten | aus `server-routes/` nach `app/` kopiert |
| Indexierung | überall `noindex` | erst nach Freigabe |

Die Umschaltung selbst passiert in `lib/deploy-ziel.ts` und `next.config.ts` –
im Seitencode ändert sich nichts.

## Checkliste

### Vorbereitung

- [ ] Sanity eingerichtet und Inhalte importiert (`docs/SANITY-VERCEL-EINRICHTUNG.md`)
- [ ] Vercel-Projekt angelegt, Build Command `npm run build:vercel`
- [ ] Umgebungsvariablen für Production **und** Preview gesetzt
- [ ] `SITE_URL` auf die tatsächliche Domain gesetzt (ohne Schrägstrich am Ende)
- [ ] In `app/[slug]/page.tsx` `dynamicParams` von `false` auf `true` setzen. Next
      verlangt dort ein festes true/false und akzeptiert keinen berechneten Wert, darum
      ist das ein Handgriff. Ohne ihn bleibt eine im CMS neu angelegte Seite bis zum
      nächsten Deployment 404.

### Pfade und Links

- [ ] Keine hart eingetragenen `/baryton-website/…` im Code oder in den Inhalten
      (`grep -rn "baryton-website" data app components lib` – Treffer dürfen nur in
      `lib/deploy-ziel.ts`, den Skripten und der Dokumentation stehen)
- [ ] Interne Links laufen über `SmartLink` bzw. `next/link`, nicht über rohes `<a href="/…">`
- [ ] Datei-URLs laufen über `assetUrl()`
- [ ] Im CMS keine Links mit Unterpfad speichern, nur `/besuch` statt `/baryton-website/besuch`

### Domain

- [ ] Domain in Vercel hinterlegen und DNS umstellen
      (`baryton.ch` ist registriert, liefert derzeit keine Website aus – der Zugang
      zum Domainkonto ist beim Betrieb zu klären)
- [ ] `www` und Wurzel auf dieselbe Variante umleiten
- [ ] HTTPS-Zertifikat aktiv (das alte Zertifikat von `baryton.ch` ist seit 2022 abgelaufen)

### SEO

- [ ] `INDEXIERUNG=1` **erst** setzen, wenn der Betrieb die Website freigegeben hat
- [ ] Danach prüfen: `noindex` ist auf allen Seiten verschwunden
- [ ] Canonical-Links zeigen auf die neue Domain (kommen automatisch aus `SITE_URL`)
- [ ] Open-Graph-URLs prüfen
- [ ] Sitemap ergänzen (heute bewusst nicht vorhanden, weil alles `noindex` ist)
- [ ] `public/robots.txt` prüfen – kein pauschales `Disallow: /`
- [ ] Strukturierte Daten gegenprüfen; Bewertungen und Preisklassen nur mit
      bestätigten Angaben ergänzen

### Rechtstexte und Datenschutz

- [ ] Impressum auf den Betrieb umstellen, sobald er die Website übernimmt:
      rechtlicher Firmenname, Rechtsform, UID, verantwortliche Person
- [ ] Demo-Hinweis (`demoHinweis`) entfernen – aber erst nach Zustimmung des Betriebs
- [ ] Datenschutzerklärung anpassen: **GitHub Pages streichen**, Vercel als Hoster
      aufnehmen (Server-Protokolle, Standorte, Auslandsbekanntgabe), Sanity als
      Auftragsbearbeiter für Inhalte aufnehmen
- [ ] Prüfen, ob durch Vercel Analytics, Speed Insights oder ähnliche Zusatzdienste
      etwas aktiviert wurde. Falls ja: entweder abschalten oder eine echte
      Einwilligungslösung einbauen und die Erklärung ergänzen
- [ ] Solange nichts Einwilligungspflichtiges dazukommt, bleibt es bei der
      Datenschutzerklärung ohne Banner

### Inhalte

- [ ] Öffnungszeiten vom Betrieb bestätigen lassen und `oeffnungszeitenHinweis` leeren
- [ ] Getränkekarte eintragen und den Hinweistext entfernen
- [ ] Freigegebene Fotos einbauen, Alt-Texte setzen
- [ ] Kontaktweg klären: E-Mail-Adresse eintragen oder Reservationslink ergänzen

### Abnahme

- [ ] Alle Seiten direkt aufrufen und neu laden
- [ ] 404-Seite prüfen
- [ ] Telefon-, Routen- und Rechtslinks prüfen
- [ ] Auf Mobilgerät und Desktop durchgehen
- [ ] Im Studio etwas ändern, veröffentlichen, live gegenprüfen
- [ ] Netzwerk-Protokoll des Browsers prüfen: keine unerwarteten fremden Verbindungen

## Rückweg

Die GitHub-Pages-Fassung bleibt lauffähig: Ohne gesetzte Umgebungsvariablen baut
`npm run build:pages` weiterhin den statischen Export aus `data/`. Die lokalen
Inhaltsdateien sollten deshalb nicht gelöscht werden – sie sind zugleich die
Sicherung des Anfangsbestands.
