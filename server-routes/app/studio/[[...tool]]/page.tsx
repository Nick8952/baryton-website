/**
 * Sanity Studio unter /studio – nur im Vercel-Betrieb (wird von scripts/vercel-routen.mjs nach app/ kopiert).
 * Anmeldung: Sanity-Konto mit Zugriff auf das Projekt.
 */
import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";

export const dynamic = "force-static";
export { metadata, viewport } from "next-sanity/studio";

export default function StudioSeite() {
  return <NextStudio config={config} />;
}
