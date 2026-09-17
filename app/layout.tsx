import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { inhaltsquelle } from "@/lib/content";
import { siteUrl } from "@/lib/deploy-ziel";
import { betriebJsonLd, indexierungErlaubt, jsonLdSicher } from "@/lib/seo";
import { Kopfzeile } from "@/components/Kopfzeile";
import { Fusszeile } from "@/components/Fusszeile";
import { Reveal } from "@/components/Reveal";

/**
 * Schriften liegen im Repository (app/fonts) und werden vom eigenen Server ausgeliefert.
 * Dadurch entsteht keine Verbindung zu Google Fonts – das hält die Seite frei von
 * externen Requests und damit vom Einwilligungsthema.
 *
 * Fraunces trägt als Anzeigeschrift die Persönlichkeit (weiche Serifen, «WONK»-Achse),
 * Schibsted Grotesk bleibt für Fliesstext und Zahlen ruhig und gut lesbar.
 */
const anzeige = localFont({
  src: "./fonts/Fraunces-Variable.woff2",
  variable: "--schrift-anzeige",
  display: "swap",
  weight: "100 900",
  fallback: ["Georgia", "serif"],
});

const text = localFont({
  src: "./fonts/SchibstedGrotesk-Variable.woff2",
  variable: "--schrift-text",
  display: "swap",
  weight: "400 900",
  fallback: ["system-ui", "sans-serif"],
});

export async function generateMetadata(): Promise<Metadata> {
  const quelle = await inhaltsquelle();
  const e = await quelle.getEinstellungen();
  return {
    metadataBase: new URL(siteUrl),
    title: { default: `${e.firmenname} – ${e.claim ?? ""}`.trim(), template: `%s – ${e.kurzname}` },
    description: e.seo.beschreibung,
    robots: indexierungErlaubt ? { index: true, follow: true } : { index: false, follow: false },
    alternates: { canonical: "/" },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const quelle = await inhaltsquelle();
  const e = await quelle.getEinstellungen();

  return (
    <html lang="de-CH" className={`${anzeige.variable} ${text.variable}`}>
      <body>
        <a className="sprung" href="#inhalt">
          Zum Inhalt springen
        </a>

        {e.demoHinweis ? (
          <div className="demoband">
            <div className="bahn">
              <span className="punkt" aria-hidden="true" />
              <p style={{ margin: 0 }}>{e.demoHinweis}</p>
            </div>
          </div>
        ) : null}

        <Kopfzeile einstellungen={e} />

        <main id="inhalt">{children}</main>

        <Fusszeile einstellungen={e} />
        <Reveal />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdSicher(betriebJsonLd(e)) }}
        />
      </body>
    </html>
  );
}
