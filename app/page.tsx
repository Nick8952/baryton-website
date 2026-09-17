import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { inhaltsquelle } from "@/lib/content";
import { seitenMetadata } from "@/lib/seo";
import { Bausteine } from "@/components/bausteine/Bausteine";
import { SmartLink } from "@/components/SmartLink";
import { Saiten } from "@/components/Saiten";

export async function generateMetadata(): Promise<Metadata> {
  const quelle = await inhaltsquelle();
  const [seite, e] = await Promise.all([quelle.getSeite("start"), quelle.getEinstellungen()]);
  if (!seite) return {};
  return seitenMetadata(seite, e);
}

export default async function Startseite() {
  const quelle = await inhaltsquelle();
  const [seite, e] = await Promise.all([quelle.getSeite("start"), quelle.getEinstellungen()]);
  if (!seite) notFound();

  const hero = seite.hero;

  return (
    <>
      {hero ? (
        <section className="hero">
          <Saiten zeiten={e.oeffnungszeiten} />
          <div className="bahn">
            {hero.kurzzeile ? <p className="kurzzeile">{hero.kurzzeile}</p> : null}
            <h1 className="hero-marke">
              {hero.titel}
              {hero.untertitel ? <span className="zeile2">{hero.untertitel}</span> : null}
            </h1>
            {hero.text ? <p className="hero-text">{hero.text}</p> : null}
            <div className="knopf-reihe">
              {hero.knopf ? (
                <SmartLink ziel={hero.knopf.ziel} className="knopf">
                  {hero.knopf.titel}
                </SmartLink>
              ) : null}
              {hero.zweiterKnopf ? (
                <SmartLink ziel={hero.zweiterKnopf.ziel} className="knopf leise">
                  {hero.zweiterKnopf.titel}
                </SmartLink>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <Bausteine bausteine={seite.bausteine} einstellungen={e} />
    </>
  );
}
