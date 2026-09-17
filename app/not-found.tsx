import type { Metadata } from "next";
import Link from "next/link";
import { inhaltsquelle } from "@/lib/content";
import { telefonInternational } from "@/lib/seo";
import { SmartLink } from "@/components/SmartLink";

export const metadata: Metadata = {
  title: "Seite nicht gefunden",
  robots: { index: false, follow: false },
};

export default async function NichtGefunden() {
  const quelle = await inhaltsquelle();
  const e = await quelle.getEinstellungen();

  return (
    <section className="fehler">
      <div className="bahn">
        <p className="kurzzeile">Fehler 404</p>
        <p className="nummer">404</p>
        <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)" }}>Diese Seite gibt es nicht.</h1>
        <p style={{ marginTop: "1rem", maxWidth: "34rem", color: "var(--papier-leise)" }}>
          Vielleicht wurde der Link falsch übernommen. Von der Startseite aus finden Sie alles Weitere –
          oder rufen Sie einfach kurz an.
        </p>
        <div className="knopf-reihe">
          <Link href="/" className="knopf">
            Zur Startseite
          </Link>
          <SmartLink ziel={`tel:${telefonInternational(e.telefon)}`} className="knopf leise">
            {e.telefon}
          </SmartLink>
        </div>
      </div>
    </section>
  );
}
