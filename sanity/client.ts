import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, studioUrl } from "./env";

/**
 * Lese-Client für veröffentlichte Inhalte (CDN, gecacht).
 * Für die Entwurfsvorschau liefert `vorschauClient()` einen Client mit Token,
 * Perspektive «drafts» und Stega-Kodierung (Visual Editing).
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
  stega: { enabled: false, studioUrl },
});

export function vorschauClient() {
  const token = process.env.SANITY_API_READ_TOKEN;
  if (!token) throw new Error("SANITY_API_READ_TOKEN fehlt – nötig für die Entwurfsvorschau.");
  return client.withConfig({
    useCdn: false,
    token,
    perspective: "drafts",
    stega: { enabled: true, studioUrl },
  });
}
