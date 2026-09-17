import NextImage from "next/image";
import type { Bild as BildTyp } from "@/lib/content/types";
import { assetUrl } from "@/lib/assets";

/**
 * Bildausgabe für beide Betriebsarten: im statischen Export liegen die fertigen
 * Varianten in public/images (kein Bild-Optimierer), bei Sanity kommen sie vom CDN.
 * `assetUrl` setzt für lokale Dateien den GitHub-Pages-Unterpfad davor.
 */
export function Bild({
  bild,
  sizes = "(min-width: 60rem) 60rem, 100vw",
  prioritaet = false,
}: {
  bild: BildTyp;
  sizes?: string;
  prioritaet?: boolean;
}) {
  const groesste = bild.quellen[bild.quellen.length - 1];
  if (!groesste) return null;

  return (
    <figure style={{ margin: 0 }}>
      <NextImage
        src={assetUrl(groesste.url)}
        alt={bild.alt}
        width={bild.breite}
        height={bild.hoehe}
        sizes={sizes}
        priority={prioritaet}
        style={{ width: "100%", height: "auto" }}
      />
      {bild.bildunterschrift ? (
        <figcaption style={{ marginTop: "0.6rem", fontSize: "0.83rem", color: "var(--tinte-leise)" }}>
          {bild.bildunterschrift}
        </figcaption>
      ) : null}
    </figure>
  );
}
