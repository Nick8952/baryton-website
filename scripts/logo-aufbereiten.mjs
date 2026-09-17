// Bereitet die Wortmarke aus assets/originale/ für die Website auf.
//
// Die Vorlage ist weiss auf Schwarz. Daraus entstehen zwei freigestellte Fassungen
// (Helligkeit wird zur Transparenz), damit dieselbe Marke auf Nacht- und auf
// Papierflächen sauber sitzt – ohne schwarzen Kasten drumherum.
//
// Aufruf: npm run logo   (nach einem Wechsel der Vorlage erneut ausführen)
import sharp from "sharp";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const WURZEL = path.resolve(import.meta.dirname, "..");
const VORLAGE = path.join(WURZEL, "assets/originale/logo-baryton.png");
const ZIEL = path.join(WURZEL, "public/images");

// id → Farbe der fertigen Marke. Die Deckung kommt aus der Helligkeit der Vorlage.
const FASSUNGEN = {
  "logo-hell": { r: 247, g: 242, b: 234 }, // --papier, für Nachtflächen
  "logo-dunkel": { r: 34, g: 27, b: 41 }, // --tinte, für Papierflächen
};
const BREITEN = [420, 840];

await mkdir(ZIEL, { recursive: true });

// Rand abschneiden, damit die Marke im Layout nicht auf unsichtbarem Schwarz schwimmt.
const beschnitten = await sharp(await readFile(VORLAGE))
  .removeAlpha()
  .trim({ background: "#000000", threshold: 12 })
  .toBuffer();

const verzeichnis = {};
for (const [id, farbe] of Object.entries(FASSUNGEN)) {
  const quellen = [];
  for (const breite of BREITEN) {
    const basis = sharp(beschnitten).resize({ width: breite, withoutEnlargement: false });
    const { data, info } = await basis.clone().greyscale().raw().toBuffer({ resolveWithObject: true });

    const bild = await sharp({
      create: { width: info.width, height: info.height, channels: 3, background: farbe },
    })
      // Die Graustufen der Vorlage werden zum Alphakanal: Weiss bleibt stehen, Schwarz verschwindet.
      .joinChannel(data, { raw: { width: info.width, height: info.height, channels: 1 } })
      .webp({ quality: 92, alphaQuality: 100 })
      .toBuffer();

    const hash = createHash("sha1").update(bild).digest("hex").slice(0, 8);
    const dateiname = `${id}-${info.width}-${hash}.webp`;
    await writeFile(path.join(ZIEL, dateiname), bild);
    quellen.push({ breite: info.width, url: `/images/${dateiname}` });
    if (breite === BREITEN[BREITEN.length - 1]) {
      verzeichnis[id] = { id, original: "assets/originale/logo-baryton.png", breite: info.width, hoehe: info.height, quellen: [] };
    }
  }
  quellen.sort((a, b) => a.breite - b.breite);
  verzeichnis[id].quellen = quellen;
  console.log(id, `${verzeichnis[id].breite}x${verzeichnis[id].hoehe}`, quellen.map((q) => q.breite).join("/"));
}

await mkdir(path.join(WURZEL, "data"), { recursive: true });
await writeFile(path.join(WURZEL, "data/bilder.json"), JSON.stringify(verzeichnis, null, 2) + "\n");
console.log(`\n${Object.keys(verzeichnis).length} Fassung(en) → data/bilder.json`);
