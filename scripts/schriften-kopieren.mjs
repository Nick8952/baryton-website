// Kopiert die benötigten Schriftdateien aus den fontsource-Paketen nach app/fonts/.
// So liegen die Schriften im Repository und werden vom eigenen Server ausgeliefert –
// keine Verbindung zu Google Fonts, kein externer Request, kein Einwilligungsthema.
// Aufruf: npm run schriften   (nur nötig, wenn die Schriftversion aktualisiert wird)
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

const wurzel = path.resolve(import.meta.dirname, "..");
const ziel = path.join(wurzel, "app/fonts");

// Fraunces: variable Achsen opsz/wght/SOFT/WONK (Variante «full»), Lizenz OFL.
// Schibsted Grotesk: variable Achse wght, Lizenz OFL.
const DATEIEN = [
  ["@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2", "Fraunces-Variable.woff2"],
  ["@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-wght-normal.woff2", "SchibstedGrotesk-Variable.woff2"],
];

await mkdir(ziel, { recursive: true });
for (const [quelle, name] of DATEIEN) {
  await copyFile(path.join(wurzel, "node_modules", quelle), path.join(ziel, name));
  console.log("→ app/fonts/" + name);
}
