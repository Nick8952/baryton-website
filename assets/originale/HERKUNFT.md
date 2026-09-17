# Herkunft der Originaldateien

Die Website enthält ein Bildmotiv: eine nachgezeichnete Wortmarke. Fotos von
Innenraum, Mitarbeitenden, Gästen, Getränken oder Speisen werden nicht verwendet.

| Datei | Herkunft | Bearbeitung | Freigabe | Verwendung |
|---|---|---|---|---|
| `logo-baryton.png` | von Nick per Foto des Leuchtschilds am Lokal bereitgestellt | per KI nachgezeichnet; **nicht das Originallogo des Betriebs** | von Nick am 17.09.2026 zur Verwendung als Wortmarken-Nachbau in dieser Vorschau freigegeben | Quelle für die hellen und dunklen WebP-Fassungen in `public/images/` |

## Warum

Für die Baryton Cocktail Lounge liess sich kein Bildmaterial mit geklärten
Nutzungsrechten finden (Stand 17. September 2026):

- Die Fotos im Google-Kartenprofil weist Google selbst als möglicherweise
  urheberrechtlich geschützt aus. Ohne Anmeldung ist zudem nicht erkennbar, welche
  Bilder vom Betrieb stammen und welche von Gästen.
- Die Facebook-Seite `facebook.com/barytonZH` ist ohne Anmeldung nicht abrufbar.
- Ein Instagram-Profil war nicht auffindbar.
- Eine Originaldatei des Logos liegt nicht vor. Die eingesetzte Wortmarke ist eine
  KI-Nachzeichnung nach dem Leuchtschild und ausdrücklich nicht das Originallogo
  des Betriebs.

## Wenn Bilder dazukommen

Für jede Datei hier festhalten:

| Datei | Woher | Wer hat die Rechte | Freigabe erteilt von / am | Verwendung |
|---|---|---|---|---|

Danach:

1. Datei in diesen Ordner legen.
2. Eintrag in `scripts/bilder-optimieren.mjs` unter `BILDER` ergänzen.
3. `npm run bilder` ausführen – das erzeugt `public/images/` und `data/bilder.json`.
4. Im gewünschten Abschnitt einen `bildBaustein` mit Alt-Text ergänzen.

Keine Gäste- oder Nutzerfotos aus Kartendiensten übernehmen. Stock- oder generierte
Bilder nie als Innenräume, Mitarbeitende, Gäste oder Getränke dieser Lounge ausgeben.
