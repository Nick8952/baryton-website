import "server-only";
import type { Inhaltsquelle } from "./types";

export * from "./types";

/**
 * Auswahl der Inhaltsquelle.
 *
 * - Standard (keine Env-Variablen): lokale JSON-Dateien → GitHub-Pages-Demo.
 * - CONTENT_SOURCE=sanity: Sanity. Fehlen Projekt-ID oder Dataset, bricht der Build
 *   mit einer klaren Meldung ab – bewusst kein stiller Rückfall auf Demo-Inhalte.
 *
 * Der Sanity-Provider wird erst im gewählten Zweig geladen, damit die Demo
 * ohne Sanity-Konfiguration baut.
 */
export async function inhaltsquelle(): Promise<Inhaltsquelle> {
  if (process.env.CONTENT_SOURCE === "sanity") {
    const { sanityQuelle } = await import("./sanity");
    return sanityQuelle;
  }
  const { lokaleQuelle } = await import("./local");
  return lokaleQuelle;
}

export const inhaltsquelleName = process.env.CONTENT_SOURCE === "sanity" ? "sanity" : "lokal";
