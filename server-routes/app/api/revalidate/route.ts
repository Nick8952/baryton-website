import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { INHALT_TAG } from "@/lib/content/sanity";

/**
 * Sanity-Webhook: nach jedem Publish/Unpublish/Delete den Inhalts-Cache leeren.
 * Einrichtung: sanity.io/manage → API → Webhooks → URL https://<domain>/api/revalidate,
 * Trigger create/update/delete, Secret = SANITY_REVALIDATE_SECRET (Vercel-Env).
 * Ohne gültige Signatur wird nichts invalidiert.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) return NextResponse.json({ fehler: "SANITY_REVALIDATE_SECRET nicht gesetzt" }, { status: 500 });
  const { isValidSignature, body } = await parseBody<{ _type?: string }>(req, secret);
  if (!isValidSignature) return NextResponse.json({ fehler: "Ungültige Signatur" }, { status: 401 });
  if (!body?._type) return NextResponse.json({ fehler: "Leerer Body" }, { status: 400 });
  // Ein Tag für alles: Listen (z. B. Referenzen auf der Startseite) hängen von Einzeldokumenten ab.
  revalidateTag(INHALT_TAG, "max");
  return NextResponse.json({ ok: true, typ: body._type, zeit: new Date().toISOString() });
}
