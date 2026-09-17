# Übergabe: offene Punkte

Stand: 17. September 2026.

## 1. Was der Betrieb liefern muss, bevor die Website echt werden kann

Diese Punkte sind in `docs/QUELLEN.md` hergeleitet. Gebündelt für ein Gespräch:

1. **Öffnungszeiten bestätigen.** Auf der Website steht derzeit sichtbar, dass sie
   aus dem Google-Profil stammen und nicht bestätigt sind. Nach der Bestätigung
   entfällt dieser Hinweis.
2. **Firmenangaben fürs Impressum:** rechtlicher Firmenname, Rechtsform, UID,
   verantwortliche Person. Im Handelsregister war dazu nichts auffindbar.
3. **E-Mail-Adresse**, die tatsächlich gelesen wird. In einem Verzeichniseintrag von
   2021 steht `mbf@baryton.ch` – ungeprüft und deshalb nicht verwendet. Erst mit
   einer bestätigten Adresse erscheint auf der Kontaktseite «E-Mail vorbereiten».
4. **Vollständige, aktuelle Getränke- und Speisekarte.** Ein Ausschnitt ist seit dem
   17.09.2026 fotografisch belegt und auf der Website eingetragen (Bier, Aperitif,
   ein paar Cocktailnamen, Salate, Burger, Flammkuchen, Pizza – siehe
   `docs/QUELLEN.md`). Offen: die vollständige Cocktailkarte mit Preisen, ob die
   „Käferwiesn"-Angebote (Bierbrezn, Weisswürste, Wiesn-Pizza) dauerhaft oder nur
   saisonal erhältlich sind, der fehlende Family-Preis der Pizza «Nebraska», und ob
   das Appenzeller-Ginger-Beer tatsächlich im Sortiment ist.
5. **Fotos und Originallogo:** Für die Vorschau ist ein von Nick freigegebener,
   per KI nach dem Leuchtschild erstellter Wortmarken-Nachbau eingebaut. Er ist
   nicht das Originallogo und muss vom Betrieb selbst freigegeben oder durch eine
   freigegebene Originaldatei ersetzt werden, sobald der Betrieb die Demo sieht.
   Weitere Fotos fehlen weiterhin und benötigen ebenfalls eine ausdrückliche
   Freigabe zur Nutzung auf der Website.
   **Neu entdeckt:** Auf der gedruckten Speisekarte ist ein zweites, eigenständiges
   offizielles Logo zu sehen (Eule mit Fliege, «Baryton & MUSIC-BAR») – anders als
   die Fassadenbeschriftung, nach der die aktuelle Wortmarke gestaltet ist. Zu klären:
   welches Logo massgeblich ist, bzw. ob eine saubere Originaldatei des Eulen-Logos
   existiert. Details in `docs/QUELLEN.md`.
6. **Reservationen:** Werden sie entgegengenommen, und wie? Ohne bestätigten Prozess
   bleibt die Website ohne Reservationsfunktion.
7. **Anlässe und abweichende Öffnungszeiten**, die regelmässig anfallen.
8. **Domain `baryton.ch`:** Sie ist registriert, liefert aber keine Website aus. Wer
   hat Zugang zum Domainkonto?

## 2. Was der Betreiber der Vorschau noch erledigen muss

- **Postadresse fürs Impressum.** Dort stehen bisher nur Name und E-Mail. Für eine
  dauerhaft öffentliche Seite gehört eine erreichbare Adresse dazu.
  Nachzutragen in `data/rechtstexte/impressum.json`.
- **Entscheiden, ob die Vorschau aktiv zugestellt wird.** Der Betrieb weiss nichts
  davon. Die Seite ist als unverbindliches Konzept gekennzeichnet und `noindex`.
- **Rechtstexte prüfen lassen.** Impressum und Datenschutzerklärung sind auf die
  tatsächliche Technik geschrieben, aber nicht anwaltlich geprüft.

## 3. Was nur vorbereitet und noch nicht überprüfbar ist

| Funktion | Status |
|---|---|
| Sanity-Schemas, Studio, Abfragen | geschrieben und typgeprüft; **nie gegen ein echtes Projekt gelaufen** |
| Inhaltsimport `npm run seed` | trocken geprüft (`--probe`, 8 Dokumente); echt nie ausgeführt |
| Entwurfsvorschau und Visual Editing | vorbereitet; erst nach der Einrichtung prüfbar |
| Webhook «veröffentlichen wirkt sofort» | vorbereitet; erst nach der Einrichtung prüfbar |
| Vercel-Deployment | vorbereitet; kein Projekt angelegt |
| Mehrsprachigkeit | **nicht** eingebaut. Das Inhaltsmodell liesse sich erweitern, aber es gibt keinen halbfertigen Sprachumschalter |

Anleitung: `docs/SANITY-VERCEL-EINRICHTUNG.md`, Checkliste für den Hosting-Wechsel:
`docs/UMSTELLUNG-VERCEL.md`.

## 4. Spätere Übergabe an den Kunden

Wenn der Betrieb die Website übernimmt:

- **Repository:** entweder in ein Konto des Betriebs übertragen (GitHub: Settings →
  Transfer ownership) oder als Archiv übergeben. Der Quellcode gehört dann zum
  bezahlten Werk – das vorher schriftlich festhalten.
- **Sanity:** Der Betrieb wird Administrator des Projekts, der bisherige Betreuer
  kann Mitglied bleiben. Ein Inhaltsexport geht mit
  `npx sanity@latest dataset export production` – das sichert Texte **und** Bilder
  in einer Datei.
- **Vercel:** Projekt in ein Konto des Betriebs übertragen oder neu importieren.
  Danach Umgebungsvariablen neu setzen.
- **Domain:** bleibt beim Betrieb, nur die DNS-Einträge zeigen auf das Hosting.
- **Sicherung:** Die lokalen Inhaltsdateien in `data/` nicht löschen – sie sind der
  dokumentierte Anfangsbestand und der Rückweg, falls das CMS ausfällt.

## 5. Technische Wartung

- Abhängigkeiten sind auf feste Hauptversionen gesetzt (Next 16, React 19).
  Aktualisieren, dann `lint`, `typecheck`, `build:pages`, `export:pruefen` laufen
  lassen – und die Seite im Browser durchsehen.
- Öffnungszeiten veralten am schnellsten. Ein- bis zweimal jährlich mit dem Betrieb
  abgleichen.
- `npm run export:pruefen` läuft auch in der GitHub-Action und schlägt an, sobald
  eine externe Ressource, ein toter interner Link oder ein fehlendes `noindex`
  hineingerät.
