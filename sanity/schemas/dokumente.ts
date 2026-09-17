import { defineField, defineType, defineArrayMember } from "sanity";
import { bausteinMitglieder } from "./bausteine";

const RESERVIERTE_SLUGS = ["studio", "api", "images", "fonts", "_next", "start"];
// "lounge" ist ein regulärer, frei vergebener Slug – keine Sonderbehandlung nötig.

export const einstellungenTyp = defineType({
  name: "einstellungen",
  title: "Website-Einstellungen",
  type: "document",
  groups: [
    { name: "betrieb", title: "Betrieb", default: true },
    { name: "kontakt", title: "Kontakt & Öffnungszeiten" },
    { name: "navigation", title: "Navigation & Footer" },
    { name: "seo", title: "Suchmaschinen" },
  ],
  fields: [
    defineField({
      name: "firmenname",
      title: "Name des Betriebs",
      type: "string",
      group: "betrieb",
      description: "So, wie der Betrieb nach aussen auftritt, z. B. «Baryton Cocktail Lounge».",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "kurzname",
      title: "Kurzname",
      type: "string",
      group: "betrieb",
      description: "Für Kopfzeile und Browser-Tab, z. B. «Baryton».",
      validation: (r) => r.required().max(40),
    }),
    defineField({
      name: "claim",
      title: "Kurzbeschreibung",
      type: "string",
      group: "betrieb",
      description: "Ein kurzer Satz unter dem Namen, z. B. «Loungebar an der Schweizergasse».",
      validation: (r) => r.max(80),
    }),
    defineField({
      name: "rechtsname",
      title: "Rechtlicher Firmenname",
      type: "string",
      group: "betrieb",
      description: "Nur ausfüllen, wenn bekannt und belegt – erscheint im Impressum und in den strukturierten Daten. Der Gastroname ist nicht automatisch der Firmenname.",
    }),
    defineField({
      name: "uid",
      title: "UID",
      type: "string",
      group: "betrieb",
      description: "z. B. CHE-123.456.789. Nur eintragen, wenn im Handelsregister belegt.",
      validation: (r) => r.regex(/^CHE-\d{3}\.\d{3}\.\d{3}$/, { name: "UID", invert: false }).warning("Format: CHE-123.456.789"),
    }),
    defineField({ name: "adresse", title: "Adresse", type: "adresse", group: "kontakt", validation: (r) => r.required() }),
    defineField({ name: "telefon", title: "Telefon", type: "string", group: "kontakt", validation: (r) => r.required() }),
    defineField({
      name: "email",
      title: "E-Mail",
      type: "string",
      group: "kontakt",
      description: "Nur eintragen, wenn die Adresse wirklich gelesen wird – erst dann erscheint auf der Kontaktseite «E-Mail vorbereiten».",
      validation: (r) => r.email(),
    }),
    defineField({
      name: "routenlink",
      title: "Routenlink",
      type: "url",
      group: "kontakt",
      description: "Link zu einem Kartendienst. Die Karte wird nur verlinkt, nie in die Seite eingebettet – so werden keine fremden Daten geladen.",
    }),
    defineField({
      name: "oeffnungszeiten",
      title: "Öffnungszeiten",
      type: "array",
      group: "kontakt",
      of: [defineArrayMember({ type: "oeffnungszeit" })],
      description: "Am besten alle sieben Wochentage einzeln erfassen – nur dann kann die Website die Wochengrafik und den Hinweis «jetzt geöffnet» anzeigen.",
      validation: (r) => r.max(7),
    }),
    defineField({
      name: "oeffnungszeitenHinweis",
      title: "Herkunft der Öffnungszeiten",
      type: "text",
      rows: 2,
      group: "kontakt",
      description: "Nur ausfüllen, solange die Zeiten NICHT vom Betrieb selbst bestätigt sind. Leer lassen, sobald der Betrieb sie bestätigt hat.",
    }),
    defineField({ name: "navigation", title: "Hauptnavigation", type: "array", group: "navigation", of: [defineArrayMember({ type: "link" })], validation: (r) => r.required().min(1).max(6) }),
    defineField({ name: "rechtslinks", title: "Links im Footer (Rechtliches)", type: "array", group: "navigation", of: [defineArrayMember({ type: "link" })] }),
    defineField({
      name: "demoHinweis",
      title: "Hinweis auf jeder Seite",
      type: "text",
      rows: 2,
      group: "navigation",
      description: "Erscheint als schmales Band ganz oben und im Footer. Solange die Website eine unverbindliche Vorschau ist, muss dieser Hinweis stehen bleiben. Leer = kein Band.",
    }),
    defineField({
      name: "seo",
      title: "Suchmaschinen",
      type: "object",
      group: "seo",
      fields: [
        defineField({ name: "titelZusatz", title: "Zusatz im Browser-Titel", type: "string", validation: (r) => r.required() }),
        defineField({ name: "beschreibung", title: "Standard-Beschreibung", type: "text", rows: 3, validation: (r) => r.required().max(160) }),
        defineField({ name: "bild", title: "Vorschaubild (Teilen in sozialen Medien)", type: "bild" }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Website-Einstellungen" }) },
});

export const seiteTyp = defineType({
  name: "seite",
  title: "Seite",
  type: "document",
  groups: [
    { name: "inhalt", title: "Inhalt", default: true },
    { name: "kopf", title: "Seitenanfang" },
    { name: "seo", title: "Suchmaschinen" },
  ],
  fields: [
    defineField({ name: "titel", title: "Titel", type: "string", group: "inhalt", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "URL-Segment",
      type: "slug",
      group: "inhalt",
      description: "Der Teil hinter der Adresse, z. B. «getraenke» → /getraenke/. Die Startseite hat das feste Segment «start».",
      options: { source: "titel", maxLength: 60 },
      validation: (r) =>
        r.required().custom((slug) => {
          const wert = slug?.current ?? "";
          if (wert === "start") return true;
          if (RESERVIERTE_SLUGS.includes(wert)) return `«${wert}» ist reserviert.`;
          if (!/^[a-z0-9-]+$/.test(wert)) return "Nur Kleinbuchstaben, Ziffern und Bindestriche.";
          return true;
        }),
    }),
    defineField({ name: "einleitung", title: "Einleitung", type: "text", rows: 3, group: "kopf", description: "Kurzer Text unter dem Seitentitel (nur Unterseiten)." }),
    defineField({
      name: "hero",
      title: "Seitenanfang der Startseite",
      type: "object",
      group: "kopf",
      description: "Nur die Startseite braucht diesen Block.",
      fields: [
        defineField({ name: "kurzzeile", title: "Kurzzeile", type: "string", description: "Kleine Zeile über dem Schriftzug, z. B. «Schweizergasse 8 · Zürich Kreis 1»." }),
        defineField({ name: "titel", title: "Schriftzug, erste Zeile", type: "string", validation: (r) => r.required().max(24) }),
        defineField({ name: "untertitel", title: "Schriftzug, zweite Zeile", type: "string", description: "Wird gesperrt und in Grossbuchstaben gesetzt.", validation: (r) => r.max(30) }),
        defineField({ name: "text", title: "Text darunter", type: "text", rows: 3 }),
        defineField({ name: "knopf", title: "Knopf", type: "link" }),
        defineField({ name: "zweiterKnopf", title: "Zweiter Knopf", type: "link" }),
      ],
    }),
    defineField({ name: "bausteine", title: "Bausteine", type: "array", group: "inhalt", of: bausteinMitglieder }),
    defineField({ name: "seoTitel", title: "Seitentitel (Browser-Tab)", type: "string", group: "seo", validation: (r) => r.max(70).warning("Suchmaschinen kürzen Titel über ~70 Zeichen.") }),
    defineField({ name: "seoBeschreibung", title: "Beschreibung (Suchergebnis)", type: "text", rows: 3, group: "seo", validation: (r) => r.max(160).warning("Suchmaschinen zeigen meist nur ~160 Zeichen.") }),
  ],
  preview: { select: { title: "titel", subtitle: "slug.current" } },
});

export const getraenkekategorieTyp = defineType({
  name: "getraenkekategorie",
  title: "Getränkekategorie",
  type: "document",
  description: "Ein Abschnitt der Karte, z. B. «Signature Drinks» oder «Alkoholfrei».",
  fields: [
    defineField({ name: "titel", title: "Titel", type: "string", validation: (r) => r.required() }),
    defineField({ name: "beschreibung", title: "Beschreibung", type: "text", rows: 2, description: "Optionaler Satz unter dem Kategorietitel.", validation: (r) => r.max(200) }),
    defineField({ name: "reihenfolge", title: "Reihenfolge", type: "number", description: "Kleinere Zahl steht weiter oben.", validation: (r) => r.required().integer() }),
  ],
  orderings: [{ title: "Reihenfolge", name: "reihenfolge", by: [{ field: "reihenfolge", direction: "asc" }] }],
  preview: { select: { title: "titel", subtitle: "beschreibung" } },
});

export const getraenkTyp = defineType({
  name: "getraenk",
  title: "Getränk",
  type: "document",
  description: "Ein Eintrag der Karte. Nur eintragen, was der Betrieb tatsächlich führt – nichts schätzen.",
  fields: [
    defineField({ name: "name", title: "Bezeichnung", type: "string", validation: (r) => r.required() }),
    defineField({ name: "beschreibung", title: "Beschreibung", type: "text", rows: 2, description: "Zutaten oder ein kurzer Satz. Optional.", validation: (r) => r.max(220) }),
    defineField({
      name: "preis",
      title: "Preis in Franken",
      type: "number",
      description: "Nur die Zahl, z. B. 18 oder 18.5. Leer lassen, wenn kein fixer Preis gilt.",
      validation: (r) => r.min(0).max(1000).precision(2),
    }),
    defineField({ name: "menge", title: "Menge", type: "string", description: "z. B. «4 cl» oder «3 dl». Optional." }),
    defineField({ name: "hinweis", title: "Hinweis", type: "string", description: "Kurzer Zusatz, z. B. «alkoholfrei». Optional.", validation: (r) => r.max(40) }),
    defineField({ name: "kategorie", title: "Kategorie", type: "reference", to: [{ type: "getraenkekategorie" }], validation: (r) => r.required() }),
    defineField({ name: "reihenfolge", title: "Reihenfolge", type: "number", description: "Reihenfolge innerhalb der Kategorie.", validation: (r) => r.required().integer() }),
  ],
  orderings: [{ title: "Reihenfolge", name: "reihenfolge", by: [{ field: "reihenfolge", direction: "asc" }] }],
  preview: { select: { title: "name", subtitle: "kategorie.titel" } },
});

export const sonderoeffnungszeitTyp = defineType({
  name: "sonderoeffnungszeit",
  title: "Abweichende Öffnungszeit",
  type: "document",
  description: "Einzelner Tag, an dem etwas anderes gilt als im Wochenrhythmus – Feiertag, Betriebsferien, verlängerte Öffnung.",
  fields: [
    defineField({ name: "bezeichnung", title: "Anlass", type: "string", description: "z. B. «1. August» oder «Betriebsferien».", validation: (r) => r.required() }),
    defineField({ name: "datum", title: "Datum", type: "date", validation: (r) => r.required() }),
    defineField({ name: "geschlossen", title: "An diesem Tag geschlossen", type: "boolean", initialValue: false }),
    defineField({
      name: "zeiten",
      title: "Zeiten",
      type: "string",
      description: "z. B. «18:00 – 03:00». Leer lassen, wenn «geschlossen» aktiviert ist.",
      hidden: ({ document }) => Boolean(document?.geschlossen),
    }),
    defineField({
      name: "von",
      title: "Öffnet um",
      type: "string",
      description: "Format HH:MM. Nur zusammen mit «Schliesst um» ausfüllen – erst dann kennt die Website die Ausnahme auch für den Hinweis «jetzt geöffnet».",
      hidden: ({ document }) => Boolean(document?.geschlossen),
      validation: (r) => r.regex(/^([01]\d|2[0-3]):[0-5]\d$/, { name: "Uhrzeit", invert: false }).warning("Format: HH:MM"),
    }),
    defineField({
      name: "bis",
      title: "Schliesst um",
      type: "string",
      description: "Format HH:MM. Eine kleinere Zeit als «Öffnet um» bedeutet nach Mitternacht, z. B. 03:00.",
      hidden: ({ document }) => Boolean(document?.geschlossen),
      validation: (r) => r.regex(/^([01]\d|2[0-3]):[0-5]\d$/, { name: "Uhrzeit", invert: false }).warning("Format: HH:MM"),
    }),
    defineField({ name: "hinweis", title: "Hinweis", type: "string", description: "Optionaler Zusatz, z. B. «nur mit Voranmeldung»." }),
  ],
  orderings: [{ title: "Datum", name: "datum", by: [{ field: "datum", direction: "asc" }] }],
  preview: { select: { title: "bezeichnung", subtitle: "datum" } },
});

export const rechtstextTyp = defineType({
  name: "rechtstext",
  title: "Rechtstext",
  type: "document",
  fields: [
    defineField({ name: "titel", title: "Titel", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "art",
      title: "Art",
      type: "string",
      options: {
        list: [
          { title: "Impressum", value: "impressum" },
          { title: "Datenschutzerklärung", value: "datenschutz" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: "stand", title: "Stand (Datum)", type: "string", description: "Wird über dem Text angezeigt, z. B. «17. September 2026»." }),
    defineField({ name: "inhalt", title: "Inhalt", type: "richText", validation: (r) => r.required() }),
  ],
  preview: { select: { title: "titel", subtitle: "stand" } },
});
