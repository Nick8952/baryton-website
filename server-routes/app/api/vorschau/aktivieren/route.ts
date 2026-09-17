import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { vorschauClient } from "@/sanity/client";

/**
 * Aktiviert den Draft Mode – wird vom Presentation-Tool des Studios aufgerufen.
 * next-sanity prüft dabei das Sanity-Vorschau-Geheimnis; ohne gültiges Geheimnis: 401.
 * Der Client wird erst beim Aufruf gebaut, damit der Build ohne SANITY_API_READ_TOKEN nicht scheitert.
 */
export async function GET(request: Request) {
  return defineEnableDraftMode({ client: vorschauClient() }).GET(request);
}
