import { defineField, defineType, defineArrayMember } from "sanity";

/** Bild mit Pflicht-Alt-Text und optionaler Bildunterschrift (z. B. «Archivbild 2013»). */
export const bildTyp = defineType({
  name: "bild",
  title: "Bild",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Alternativtext",
      type: "string",
      description: "Beschreibt das Bild für Screenreader und wenn es nicht geladen werden kann. Pflichtfeld.",
      validation: (r) => r.required().max(160),
    }),
    defineField({ name: "bildunterschrift", title: "Bildunterschrift", type: "string", description: "Wird sichtbar unter dem Bild angezeigt (optional)." }),
  ],
});

export const linkTyp = defineType({
  name: "link",
  title: "Link",
  type: "object",
  fields: [
    defineField({ name: "titel", title: "Beschriftung", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "ziel",
      title: "Ziel",
      type: "string",
      description: "Interner Pfad (z. B. /kontakt), externe Adresse (https://…), tel:… oder mailto:…",
      validation: (r) =>
        r.required().custom((wert) => {
          if (typeof wert !== "string") return true;
          // Gleiche Regel wie lib/assets.ts#istErlaubtesLinkziel
          const ok = /^\/(?!\/)/.test(wert) || /^(https?:\/\/[^\s]+|mailto:[^\s]+|tel:\+?[\d\s()-]+)$/.test(wert);
          return ok || "Erlaubt sind interne Pfade (/…), https://…, mailto:… und tel:…";
        }),
    }),
    defineField({ name: "extern", title: "In neuem Tab öffnen", type: "boolean", initialValue: false }),
  ],
  preview: { select: { title: "titel", subtitle: "ziel" } },
});

/** Formatierter Text – bewusst kleiner Umfang: Absätze, Zwischentitel, Listen, Links, fett/kursiv. */
export const richTextTyp = defineType({
  name: "richText",
  title: "Text",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Absatz", value: "normal" },
        { title: "Zwischentitel", value: "h2" },
        { title: "Untertitel", value: "h3" },
      ],
      lists: [
        { title: "Aufzählung", value: "bullet" },
        { title: "Nummerierung", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Fett", value: "strong" },
          { title: "Kursiv", value: "em" },
        ],
        annotations: [
          {
            name: "link",
            title: "Link",
            type: "object",
            fields: [
              defineField({ name: "href", title: "Adresse", type: "string", validation: (r) => r.required() }),
              defineField({ name: "extern", title: "In neuem Tab öffnen", type: "boolean", initialValue: false }),
            ],
          },
        ],
      },
    }),
  ],
});

export const adresseTyp = defineType({
  name: "adresse",
  title: "Adresse",
  type: "object",
  fields: [
    defineField({ name: "strasse", title: "Strasse und Nr.", type: "string", validation: (r) => r.required() }),
    defineField({ name: "plz", title: "PLZ", type: "string", validation: (r) => r.required() }),
    defineField({ name: "ort", title: "Ort", type: "string", validation: (r) => r.required() }),
    defineField({ name: "land", title: "Land", type: "string", initialValue: "Schweiz" }),
  ],
});

const WOCHENTAGE = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];

export const oeffnungszeitTyp = defineType({
  name: "oeffnungszeit",
  title: "Öffnungszeit",
  type: "object",
  description: "«Tage»/«Zeiten» sind der sichtbare Text. Die drei Felder darunter sind optional und werden nur für die strukturierten Daten (Suchmaschinen) gebraucht – ohne sie erscheint der Eintrag trotzdem auf der Website.",
  fields: [
    defineField({ name: "tage", title: "Tage", type: "string", description: "z. B. «Montag – Freitag»", validation: (r) => r.required() }),
    defineField({ name: "zeiten", title: "Zeiten", type: "string", description: "z. B. «07.30 – 12.00 und 13.00 – 17.30 Uhr» oder «geschlossen»", validation: (r) => r.required() }),
    defineField({
      name: "wochentag",
      title: "Einzelner Wochentag (für Suchmaschinen)",
      type: "string",
      options: { list: WOCHENTAGE },
      description: "Nur bei einem einzelnen Tag ausfüllen (nicht bei «Montag – Freitag»). Zusammen mit «Öffnet um»/«Schliesst um» nötig, damit der Tag in den strukturierten Daten erscheint.",
    }),
    defineField({ name: "von", title: "Öffnet um", type: "string", description: "Format HH:MM, z. B. 07:30", validation: (r) => r.regex(/^([01]\d|2[0-3]):[0-5]\d$/, { name: "Uhrzeit", invert: false }).warning("Format: HH:MM") }),
    defineField({ name: "bis", title: "Schliesst um", type: "string", description: "Format HH:MM, z. B. 17:30", validation: (r) => r.regex(/^([01]\d|2[0-3]):[0-5]\d$/, { name: "Uhrzeit", invert: false }).warning("Format: HH:MM") }),
    defineField({ name: "geschlossen", title: "An diesem Tag geschlossen", type: "boolean", initialValue: false, description: "Aktivieren statt Öffnungszeiten einzutragen – der Tag erscheint dann nicht in den strukturierten Daten." }),
  ],
  preview: { select: { title: "tage", subtitle: "zeiten" } },
});
