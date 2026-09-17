import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import { client } from "./client";
import type { Bild } from "@/lib/content/types";

const builder = createImageUrlBuilder(client);
const BREITEN = [480, 960, 1600];

/** Rohform, wie sie die GROQ-Projektion `BILD_PROJEKTION` liefert. */
export interface SanityBildRoh {
  asset?: { _id: string; url: string; metadata?: { dimensions?: { width: number; height: number } } };
  hotspot?: Record<string, number>;
  crop?: Record<string, number>;
  alt?: string;
  bildunterschrift?: string;
}

export const BILD_PROJEKTION = `{
  asset->{ _id, url, metadata { dimensions { width, height } } },
  hotspot, crop, alt, bildunterschrift
}`;

/** Wandelt ein Sanity-Bild in die gemeinsame `Bild`-Form um (Hotspot/Crop bleiben erhalten). */
export function sanityBild(roh: SanityBildRoh | null | undefined, fallbackAlt = ""): Bild | undefined {
  if (!roh?.asset) return undefined;
  const dims = roh.asset.metadata?.dimensions ?? { width: 1600, height: 1000 };
  const quelle = { asset: roh.asset, hotspot: roh.hotspot, crop: roh.crop } as SanityImageSource;
  return {
    id: roh.asset._id,
    alt: roh.alt ?? fallbackAlt,
    breite: dims.width,
    hoehe: dims.height,
    bildunterschrift: roh.bildunterschrift,
    quellen: BREITEN.filter((b) => b <= dims.width || b === BREITEN[0]).map((b) => ({
      breite: Math.min(b, dims.width),
      url: builder.image(quelle).width(Math.min(b, dims.width)).auto("format").fit("max").url(),
    })),
  };
}
