import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { inhaltsquelle } from "@/lib/content";
import { seitenMetadata } from "@/lib/seo";
import { Bausteine } from "@/components/bausteine/Bausteine";

/**
 * Im statischen Export gibt es nur die gebauten Seiten – alles andere ist 404.
 *
 * Next verlangt hier ein festes true/false und lehnt jeden berechneten Wert ab, deshalb
 * lässt sich das nicht je Betriebsart umschalten. Beim Wechsel auf Vercel muss dieser
 * Wert von Hand auf `true` gesetzt werden, sonst bleibt eine nach dem Build im CMS neu
 * angelegte Seite bis zum nächsten Deployment dauerhaft 404
 * (siehe docs/UMSTELLUNG-VERCEL.md).
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  const quelle = await inhaltsquelle();
  const slugs = await quelle.getAlleSeitenSlugs();
  return slugs.filter((slug) => slug !== "start").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const quelle = await inhaltsquelle();
  const [seite, e] = await Promise.all([quelle.getSeite(slug), quelle.getEinstellungen()]);
  if (!seite) return {};
  return seitenMetadata(seite, e);
}

export default async function Unterseite({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const quelle = await inhaltsquelle();
  const [seite, e] = await Promise.all([quelle.getSeite(slug), quelle.getEinstellungen()]);
  if (!seite || slug === "start") notFound();

  return (
    <>
      <div className="seitenkopf">
        <div className="bahn">
          <h1>{seite.titel}</h1>
          {seite.einleitung ? <p className="einleitung">{seite.einleitung}</p> : null}
        </div>
      </div>

      <Bausteine bausteine={seite.bausteine} einstellungen={e} />
    </>
  );
}
