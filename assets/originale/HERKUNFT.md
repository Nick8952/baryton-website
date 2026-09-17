# Herkunft der Originaldateien

Dieser Ordner ist **leer**. Die Website enthält bewusst keine Fotos.

## Warum

Für die Baryton Cocktail Lounge liess sich kein Bildmaterial mit geklärten
Nutzungsrechten finden (Stand 17. September 2026):

- Die Fotos im Google-Kartenprofil weist Google selbst als möglicherweise
  urheberrechtlich geschützt aus. Ohne Anmeldung ist zudem nicht erkennbar, welche
  Bilder vom Betrieb stammen und welche von Gästen.
- Die Facebook-Seite `facebook.com/barytonZH` ist ohne Anmeldung nicht abrufbar.
- Ein Instagram-Profil war nicht auffindbar.
- Ein Logo existiert öffentlich nicht. Der Schriftzug auf der Website ist deshalb
  eine eigene typografische Wortmarke und ausdrücklich nicht das Logo des Betriebs.

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
