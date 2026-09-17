import type { Metadata } from "next";
import { stegaClean } from "@sanity/client/stega";
import type { Einstellungen, Seite } from "./content/types";
import { siteUrl } from "./deploy-ziel";
import { fenster } from "./oeffnung";

/** Indexierung nur, wenn ausdrücklich freigegeben (nach Go-Live auf der Kundendomain). */
export const indexierungErlaubt = process.env.INDEXIERUNG === "1";

/** Entfernt Stega-Markierungen (Visual Editing) aus Strings, bevor sie in Metadaten/JSON-LD landen. */
const sauber = (s: string | undefined) => (s ? stegaClean(s) : undefined);

export function seitenMetadata(seite: Seite, e: Einstellungen): Metadata {
  const titel = sauber(seite.seoTitel) ?? sauber(seite.titel) ?? "";
  const beschreibung = sauber(seite.seoBeschreibung) ?? sauber(e.seo.beschreibung);
  const pfad = seite.slug === "start" ? "/" : `/${seite.slug}/`;
  const bild = e.seo.bild;
  const bildUrl = bild ? bild.quellen[bild.quellen.length - 1]?.url : undefined;
  return {
    title: seite.slug === "start" ? `${sauber(e.kurzname)} – ${titel}` : titel,
    description: beschreibung,
    alternates: { canonical: pfad },
    openGraph: {
      title: `${titel} | ${sauber(e.seo.titelZusatz)}`,
      description: beschreibung,
      url: pfad,
      siteName: sauber(e.firmenname),
      locale: "de_CH",
      type: "website",
      images: bildUrl
        ? [
            {
              url: bildUrl.startsWith("http") ? bildUrl : `${siteUrl}${bildUrl}`,
              width: bild?.breite,
              height: bild?.hoehe,
              alt: sauber(bild?.alt),
            },
          ]
        : undefined,
    },
    robots: indexierungErlaubt ? { index: true, follow: true } : { index: false, follow: false },
  };
}

const SCHEMA_WOCHENTAG: Record<string, string> = {
  Montag: "https://schema.org/Monday",
  Dienstag: "https://schema.org/Tuesday",
  Mittwoch: "https://schema.org/Wednesday",
  Donnerstag: "https://schema.org/Thursday",
  Freitag: "https://schema.org/Friday",
  Samstag: "https://schema.org/Saturday",
  Sonntag: "https://schema.org/Sunday",
};

/**
 * Strukturierte Öffnungszeiten für die Tage, die strukturiert gepflegt sind.
 * Geschlossene Tage werden ausgelassen (kein «geöffnet 00:00–00:00»).
 * Zeiten über Mitternacht bleiben als Endzeit stehen («15:00» bis «02:00»), wie schema.org es vorsieht.
 */
function oeffnungszeitenJsonLd(zeiten: Einstellungen["oeffnungszeiten"]): Record<string, unknown>[] | undefined {
  const eintraege = fenster(zeiten).map((f) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: SCHEMA_WOCHENTAG[f.wochentag],
    opens: f.eintrag.von,
    closes: f.eintrag.bis,
  }));
  return eintraege.length ? eintraege : undefined;
}

/**
 * Strukturierte Daten für den Betrieb – ausschliesslich belegte Angaben (Name, Adresse,
 * Telefon, Öffnungszeiten). Bewusst OHNE `aggregateRating`, `review`, `priceRange`,
 * `servesCuisine` oder `menu`: dafür liegen keine geprüften Angaben des Betriebs vor.
 */
export function betriebJsonLd(e: Einstellungen): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BarOrPub",
    name: sauber(e.firmenname),
    legalName: sauber(e.rechtsname),
    url: siteUrl,
    telephone: telefonInternational(e.telefon),
    email: sauber(e.email),
    address: {
      "@type": "PostalAddress",
      streetAddress: sauber(e.adresse.strasse),
      postalCode: sauber(e.adresse.plz),
      addressLocality: sauber(e.adresse.ort),
      addressCountry: "CH",
    },
    vatID: sauber(e.uid),
    openingHoursSpecification: oeffnungszeitenJsonLd(e.oeffnungszeiten),
    areaServed: { "@type": "City", name: "Zürich" },
  };
}

/** «043 344 80 30», «+41 43 …», «0041 43 …» → «+41433448030» (E.164 für tel:-Links und JSON-LD). */
export function telefonInternational(tel: string): string {
  const ziffern = tel.replace(/\D/g, "");
  if (ziffern.startsWith("00")) return `+${ziffern.slice(2)}`;
  if (ziffern.startsWith("0")) return `+41${ziffern.slice(1)}`;
  return `+${ziffern}`;
}

/** JSON-LD sicher in ein <script> einbetten: «<» wird escaped, damit kein HTML entsteht. */
export function jsonLdSicher(daten: unknown): string {
  return JSON.stringify(daten).replace(/</g, "\\u003c");
}
