import Link from "next/link";
import NextImage from "next/image";
import bilder from "@/data/bilder.json";
import { assetUrl } from "@/lib/assets";

/**
 * Die Wortmarke der Lounge – per KI nach dem Leuchtschild am Lokal nachgezeichnet
 * (siehe docs/QUELLEN.md; es ist nicht die Originaldatei des
 * Betriebs). Zwei Fassungen, damit sie auf Papier- wie auf Nachtflächen sauber sitzt.
 *
 * Erzeugt von `npm run logo` aus assets/originale/logo-baryton.png.
 */
type Fassung = "hell" | "dunkel";

const QUELLE: Record<Fassung, (typeof bilder)["logo-hell"]> = {
  hell: bilder["logo-hell"],
  dunkel: bilder["logo-dunkel"],
};

export function Wortmarke({
  name,
  fassung = "dunkel",
  breite = "168px",
  alt,
  alsLink = true,
}: {
  name: string;
  fassung?: Fassung;
  /** Anzeigebreite als CSS-Länge, z. B. "168px" oder "clamp(15rem, 50vw, 32rem)". */
  breite?: string;
  /** Eigener Alternativtext; sonst «<name> – Schriftzug». */
  alt?: string;
  alsLink?: boolean;
}) {
  const bild = QUELLE[fassung];
  const gross = bild.quellen[bild.quellen.length - 1];

  const inhalt = (
    <NextImage
      src={assetUrl(gross.url)}
      alt={alt ?? `${name} – Schriftzug`}
      width={bild.breite}
      height={bild.hoehe}
      sizes={breite}
      style={{ width: breite, height: "auto", display: "block" }}
    />
  );

  if (!alsLink) return <span className="wortmarke">{inhalt}</span>;
  return (
    <Link href="/" className="wortmarke" aria-label={`${name} – zur Startseite`}>
      {inhalt}
    </Link>
  );
}
