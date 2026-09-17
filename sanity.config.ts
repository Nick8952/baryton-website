"use client";
/**
 * Sanity Studio – wird unter /studio eingebettet, sobald DEPLOY_TARGET=vercel gesetzt ist
 * (siehe server-routes/app/studio). In der GitHub-Pages-Demo ist das Studio nicht enthalten.
 * Status: vorbereitet, noch nicht gegen ein echtes Sanity-Projekt getestet.
 */
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { presentationTool, defineLocations } from "sanity/presentation";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemas";
import { apiVersion, dataset, projectId, studioUrl } from "./sanity/env";
import { deDELocale } from "@sanity/locale-de-de";

export default defineConfig({
  name: "baryton",
  title: "Baryton Cocktail Lounge – Inhalte",
  basePath: studioUrl,
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [
    deDELocale(),
    structureTool({
      structure: (S) =>
        S.list()
          .title("Inhalte")
          .items([
            S.listItem()
              .title("Website-Einstellungen")
              .id("einstellungen")
              .child(S.document().schemaType("einstellungen").documentId("einstellungen")),
            S.divider(),
            S.documentTypeListItem("seite").title("Seiten"),
            S.divider(),
            S.documentTypeListItem("getraenkekategorie").title("Getränkekategorien"),
            S.documentTypeListItem("getraenk").title("Getränke"),
            S.documentTypeListItem("speisekategorie").title("Speisekategorien"),
            S.documentTypeListItem("speise").title("Speisen"),
            S.documentTypeListItem("sonderoeffnungszeit").title("Abweichende Öffnungszeiten"),
            S.divider(),
            S.documentTypeListItem("rechtstext").title("Rechtstexte"),
          ]),
    }),
    presentationTool({
      previewUrl: {
        previewMode: { enable: "/api/vorschau/aktivieren", disable: "/api/vorschau/beenden" },
      },
      resolve: {
        mainDocuments: [
          { route: "/:slug", filter: `_type == "seite" && slug.current == $slug` },
          { route: "/", filter: `_type == "seite" && slug.current == "start"` },
        ],
        locations: {
          seite: defineLocations({
            select: { titel: "titel", slug: "slug.current" },
            resolve: (doc) => ({
              locations: [{ title: doc?.titel ?? "Seite", href: doc?.slug === "start" ? "/" : `/${doc?.slug ?? ""}` }],
            }),
          }),
          getraenk: defineLocations({
            select: { name: "name" },
            resolve: (doc) => ({
              locations: [
                { title: `${doc?.name ?? "Getränk"} – Getränke`, href: "/getraenke" },
                { title: "Startseite", href: "/" },
              ],
            }),
          }),
          getraenkekategorie: defineLocations({
            select: { titel: "titel" },
            resolve: (doc) => ({ locations: [{ title: `${doc?.titel ?? "Kategorie"} – Getränke`, href: "/getraenke" }] }),
          }),
          speise: defineLocations({
            select: { name: "name" },
            resolve: (doc) => ({
              locations: [
                { title: `${doc?.name ?? "Speise"} – Getränke & Speisen`, href: "/getraenke" },
                { title: "Startseite", href: "/" },
              ],
            }),
          }),
          speisekategorie: defineLocations({
            select: { titel: "titel" },
            resolve: (doc) => ({ locations: [{ title: `${doc?.titel ?? "Kategorie"} – Getränke & Speisen`, href: "/getraenke" }] }),
          }),
          sonderoeffnungszeit: defineLocations({
            message: "Abweichende Zeiten erscheinen auf der Besuchsseite.",
            locations: [{ title: "Besuch & Kontakt", href: "/besuch" }],
          }),
          rechtstext: defineLocations({
            select: { art: "art", titel: "titel" },
            resolve: (doc) => ({ locations: [{ title: doc?.titel ?? "Rechtstext", href: `/${doc?.art ?? "impressum"}` }] }),
          }),
          einstellungen: defineLocations({
            message: "Einstellungen wirken auf allen Seiten.",
            locations: [
              { title: "Startseite", href: "/" },
              { title: "Besuch & Kontakt", href: "/besuch" },
            ],
          }),
        },
      },
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
  document: {
    // Einstellungen sind ein Einzeldokument: nicht duplizieren/löschen.
    actions: (prev, ctx) =>
      ctx.schemaType === "einstellungen"
        ? prev.filter((a) => !["duplicate", "delete", "unpublish"].includes(a.action ?? ""))
        : prev,
  },
});
