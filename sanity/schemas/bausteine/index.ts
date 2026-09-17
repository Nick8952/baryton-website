import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Seitenbausteine – ein begrenzter, aufeinander abgestimmter Satz, mit dem später
 * Seiten zusammengestellt und umgeordnet werden. Jeder Baustein hat optional
 * Kurzzeile und Titel. Gestalterische Werte (Farben, Abstände, Schriftgrössen)
 * sind bewusst nicht editierbar – die Seite bleibt dadurch immer stimmig.
 */
const kopf = [
  defineField({ name: "kurzzeile", title: "Kurzzeile", type: "string", description: "Kleine Zeile über dem Titel, z. B. «Die Woche»." }),
  defineField({ name: "titel", title: "Titel", type: "string" }),
];

export const textBaustein = defineType({
  name: "textBaustein",
  title: "Text",
  type: "object",
  fields: [
    ...kopf,
    defineField({ name: "inhalt", title: "Inhalt", type: "richText", validation: (r) => r.required() }),
    defineField({
      name: "breite",
      title: "Breite",
      type: "string",
      options: {
        list: [
          { title: "Schmal (gut lesbar)", value: "schmal" },
          { title: "Normal", value: "normal" },
        ],
        layout: "radio",
      },
      initialValue: "schmal",
    }),
    defineField({
      name: "dunkel",
      title: "Auf dunklem Grund",
      type: "boolean",
      initialValue: false,
      description: "Hebt den Abschnitt als Nachtfläche hervor. Sparsam einsetzen – höchstens ein bis zwei Abschnitte pro Seite.",
    }),
  ],
  preview: { select: { title: "titel", subtitle: "kurzzeile" }, prepare: ({ title, subtitle }) => ({ title: title || "Text", subtitle }) },
});

export const karteBaustein = defineType({
  name: "karteBaustein",
  title: "Getränkekarte",
  type: "object",
  description: "Zeigt Kategorien und Getränke. Solange keine Getränke erfasst sind, erscheint der Hinweistext – nie erfundene Beispiele.",
  fields: [
    ...kopf,
    defineField({ name: "einleitung", title: "Einleitung", type: "text", rows: 2 }),
    defineField({
      name: "kategorien",
      title: "Auswahl der Kategorien",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "getraenkekategorie" }] })],
      description: "Leer lassen = alle Kategorien in ihrer Reihenfolge.",
    }),
    defineField({
      name: "hinweis",
      title: "Hinweis, solange keine Karte erfasst ist",
      type: "text",
      rows: 3,
      description: "Erscheint anstelle der Karte, wenn noch keine Getränke hinterlegt sind.",
    }),
    defineField({
      name: "mitSprungmarken",
      title: "Sprungliste über der Karte",
      type: "boolean",
      initialValue: false,
      description: "Blendet über der Karte eine Zeile mit Links zu den einzelnen Abschnitten ein. Sinnvoll ab drei Kategorien.",
    }),
    defineField({ name: "weiterLink", title: "Link am Ende", type: "link", description: "z. B. «Zur ganzen Karte» → /speisekarte" }),
  ],
  preview: { select: { title: "titel" }, prepare: ({ title }) => ({ title: title || "Getränkekarte" }) },
});

export const speisenBaustein = defineType({
  name: "speisenBaustein",
  title: "Speisekarte",
  type: "object",
  description: "Zeigt Kategorien und Speisen. Solange keine Speisen erfasst sind, erscheint der Hinweistext – nie erfundene Beispiele.",
  fields: [
    ...kopf,
    defineField({ name: "einleitung", title: "Einleitung", type: "text", rows: 2 }),
    defineField({
      name: "kategorien",
      title: "Auswahl der Kategorien",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "speisekategorie" }] })],
      description: "Leer lassen = alle Kategorien in ihrer Reihenfolge.",
    }),
    defineField({
      name: "hinweis",
      title: "Hinweis, solange keine Karte erfasst ist",
      type: "text",
      rows: 3,
      description: "Erscheint anstelle der Karte, wenn noch keine Speisen hinterlegt sind.",
    }),
    defineField({
      name: "mitSprungmarken",
      title: "Sprungliste über der Karte",
      type: "boolean",
      initialValue: false,
      description: "Blendet über der Karte eine Zeile mit Links zu den einzelnen Abschnitten ein. Sinnvoll ab drei Kategorien.",
    }),
    defineField({ name: "weiterLink", title: "Link am Ende", type: "link" }),
  ],
  preview: { select: { title: "titel" }, prepare: ({ title }) => ({ title: title || "Speisekarte" }) },
});

export const oeffnungszeitenBaustein = defineType({
  name: "oeffnungszeitenBaustein",
  title: "Öffnungszeiten",
  type: "object",
  description: "Nimmt die Zeiten aus den Website-Einstellungen. Als Wochengrafik zeigt die Länge jeder Linie die Öffnungsdauer.",
  fields: [
    ...kopf,
    defineField({ name: "einleitung", title: "Einleitung", type: "text", rows: 2 }),
    defineField({
      name: "darstellung",
      title: "Darstellung",
      type: "string",
      options: {
        list: [
          { title: "Wochengrafik", value: "resonanz" },
          { title: "Einfache Liste", value: "liste" },
        ],
        layout: "radio",
      },
      initialValue: "resonanz",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "mitSonderzeiten",
      title: "Abweichende Zeiten mitzeigen",
      type: "boolean",
      initialValue: false,
      description: "Zeigt zusätzlich die erfassten abweichenden Öffnungszeiten (Feiertage, Ferien).",
    }),
  ],
  preview: { select: { title: "titel", darstellung: "darstellung" }, prepare: ({ title, darstellung }) => ({ title: title || "Öffnungszeiten", subtitle: darstellung === "liste" ? "Liste" : "Wochengrafik" }) },
});

export const faktenBaustein = defineType({
  name: "faktenBaustein",
  title: "Fakten",
  type: "object",
  description: "Kurze Angaben nebeneinander, z. B. Adresse, Quartier, Telefon.",
  fields: [
    ...kopf,
    defineField({
      name: "fakten",
      title: "Angaben",
      type: "array",
      validation: (r) => r.required().min(1).max(6),
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "bezeichnung", title: "Bezeichnung", type: "string", validation: (r) => r.required() }),
            defineField({ name: "wert", title: "Wert", type: "string", validation: (r) => r.required() }),
          ],
          preview: { select: { title: "bezeichnung", subtitle: "wert" } },
        }),
      ],
    }),
  ],
  preview: { select: { title: "titel" }, prepare: ({ title }) => ({ title: title || "Fakten" }) },
});

export const spaltenBaustein = defineType({
  name: "spaltenBaustein",
  title: "Spalten",
  type: "object",
  description: "Zwei bis drei Textspalten nebeneinander.",
  fields: [
    ...kopf,
    defineField({
      name: "spalten",
      title: "Spalten",
      type: "array",
      validation: (r) => r.required().min(1).max(3),
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "titel", title: "Titel", type: "string", validation: (r) => r.required() }),
            defineField({ name: "inhalt", title: "Inhalt", type: "richText", validation: (r) => r.required() }),
          ],
          preview: { select: { title: "titel" } },
        }),
      ],
    }),
  ],
  preview: { select: { title: "titel" }, prepare: ({ title }) => ({ title: title || "Spalten" }) },
});

export const bildBaustein = defineType({
  name: "bildBaustein",
  title: "Bild",
  type: "object",
  description: "Nur Bilder verwenden, für die die Nutzungsrechte geklärt sind.",
  fields: [
    ...kopf,
    defineField({ name: "bild", title: "Bild", type: "bild", validation: (r) => r.required() }),
    defineField({ name: "text", title: "Text darunter", type: "text", rows: 2 }),
  ],
  preview: { select: { title: "titel", media: "bild" }, prepare: ({ title, media }) => ({ title: title || "Bild", media }) },
});

export const kontaktBaustein = defineType({
  name: "kontaktBaustein",
  title: "Kontakt",
  type: "object",
  description: "Adresse, Telefon und Routenlink aus den Website-Einstellungen.",
  fields: [
    ...kopf,
    defineField({ name: "einleitung", title: "Einleitung", type: "text", rows: 2 }),
    defineField({
      name: "mitFormular",
      title: "E-Mail-Vorlage anbieten",
      type: "boolean",
      initialValue: false,
      description: "Setzt einen Knopf «E-Mail vorbereiten», der eine vorausgefüllte Nachricht im E-Mail-Programm öffnet. Wirkt nur, wenn in den Einstellungen eine E-Mail-Adresse steht. Es wird nie automatisch etwas versendet.",
    }),
    defineField({ name: "formularHinweis", title: "Hinweis unter dem Kontakt", type: "text", rows: 2 }),
  ],
  preview: { select: { title: "titel" }, prepare: ({ title }) => ({ title: title || "Kontakt" }) },
});

export const aufrufBaustein = defineType({
  name: "aufrufBaustein",
  title: "Aufruf (dunkle Fläche mit Knöpfen)",
  type: "object",
  fields: [
    ...kopf,
    defineField({ name: "text", title: "Text", type: "text", rows: 2 }),
    defineField({ name: "knopf", title: "Knopf", type: "link", validation: (r) => r.required() }),
    defineField({ name: "zweiterKnopf", title: "Zweiter Knopf", type: "link" }),
  ],
  preview: { select: { title: "titel", subtitle: "knopf.titel" }, prepare: ({ title, subtitle }) => ({ title: title || "Aufruf", subtitle }) },
});

export const rechtstextBaustein = defineType({
  name: "rechtstextBaustein",
  title: "Rechtstext",
  type: "object",
  fields: [
    ...kopf,
    defineField({ name: "rechtstext", title: "Welcher Text", type: "reference", to: [{ type: "rechtstext" }], validation: (r) => r.required() }),
  ],
  preview: { select: { title: "rechtstext.titel" }, prepare: ({ title }) => ({ title: title || "Rechtstext" }) },
});

export const bausteine = [
  textBaustein,
  karteBaustein,
  speisenBaustein,
  oeffnungszeitenBaustein,
  faktenBaustein,
  spaltenBaustein,
  bildBaustein,
  kontaktBaustein,
  aufrufBaustein,
  rechtstextBaustein,
];

export const bausteinMitglieder = bausteine.map((b) => defineArrayMember({ type: b.name }));
