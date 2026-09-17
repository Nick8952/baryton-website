import { VorschauClient } from "./VorschauClient";
import { istVorschau } from "./status";
import { deployZiel } from "@/lib/deploy-ziel";

/**
 * Rendert die Sanity-Vorschauwerkzeuge (Overlay + Verlassen-Knopf), aber nur
 * auf Vercel und nur im aktiven Draft Mode. In der Demo: nichts.
 */
export async function VorschauWerkzeuge() {
  if (deployZiel !== "vercel" || !(await istVorschau())) return null;
  return (
    <>
      <VorschauClient />
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- API-Route, kein Seitenwechsel per Router */}
      <a
        href="/api/vorschau/beenden"
        className="fixed bottom-4 left-4 z-50 rounded-full bg-tinte px-4 py-2 text-sm font-semibold text-white shadow-lg"
      >
        Vorschau beenden
      </a>
    </>
  );
}
