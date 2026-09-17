import "server-only";
import { deployZiel } from "@/lib/deploy-ziel";

/**
 * Ist die Entwurfsvorschau (Draft Mode) aktiv?
 * Im statischen Export gibt es keine Cookies/Draft Mode – dort immer `false`,
 * ohne `draftMode()` überhaupt aufzurufen (das würde den Export brechen).
 */
export async function istVorschau(): Promise<boolean> {
  if (deployZiel !== "vercel") return false;
  const { draftMode } = await import("next/headers");
  return (await draftMode()).isEnabled;
}
