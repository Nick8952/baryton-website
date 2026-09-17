import type { KarteBaustein } from "@/lib/content/types";
import { Preisliste } from "./Preisliste";

/**
 * Getränkekarte. Liegt keine Karte vor, erscheint der hinterlegte Hinweis –
 * es werden nie Beispielgetränke oder Preise erfunden.
 */
export function Karte({ baustein }: { baustein: KarteBaustein }) {
  return (
    <Preisliste
      kategorien={baustein.kategorien}
      eintraege={baustein.getraenke}
      hinweis={baustein.hinweis}
      mitSprungmarken={baustein.mitSprungmarken}
    />
  );
}
