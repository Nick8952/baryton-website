import type { SpeisenBaustein } from "@/lib/content/types";
import { Preisliste } from "./Preisliste";

/**
 * Speisekarte. Liegt keine Karte vor, erscheint der hinterlegte Hinweis –
 * es werden nie erfundene Gerichte oder Preise gezeigt.
 */
export function Speisen({ baustein }: { baustein: SpeisenBaustein }) {
  return <Preisliste kategorien={baustein.kategorien} eintraege={baustein.speisen} hinweis={baustein.hinweis} />;
}
