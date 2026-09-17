/**
 * Sanity-Verbindungsdaten aus den Umgebungsvariablen (siehe .env.example).
 * Projekt-ID und Dataset sind keine Geheimnisse; Tokens bleiben serverseitig.
 */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-09-15";
export const studioUrl = "/studio";

export const sanityKonfiguriert = projectId.length > 0 && dataset.length > 0;

/** Wirft eine verständliche Meldung, wenn Sanity gewählt, aber nicht konfiguriert ist. */
export function sanityPruefen(): void {
  if (!sanityKonfiguriert) {
    throw new Error(
      "CONTENT_SOURCE=sanity ist gesetzt, aber NEXT_PUBLIC_SANITY_PROJECT_ID / NEXT_PUBLIC_SANITY_DATASET fehlen. " +
        "Werte in .env.local bzw. in den Vercel-Umgebungsvariablen eintragen (siehe .env.example) oder CONTENT_SOURCE leer lassen.",
    );
  }
}
