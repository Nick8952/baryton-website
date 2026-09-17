import type { NextConfig } from "next";
import { deployZiel, basePath, siteUrl } from "./lib/deploy-ziel";

// Zwei Betriebsarten aus einem Code (siehe CLAUDE.md, Abschnitt «Architektur»):
// - "pages"  (Standard, JETZT):   statischer Export für GitHub Pages unter dem Unterpfad
//                                  nick8952.github.io/baryton-website/. Baut ohne jede Env-Variable.
// - "vercel" (SPÄTER):            Server-Build für Vercel mit Sanity (ISR, Vorschau, Studio).
//                                  Wird nur aktiv, wenn DEPLOY_TARGET=vercel gesetzt ist.
const istExport = deployZiel === "pages";

const nextConfig: NextConfig = {
  ...(istExport
    ? {
        output: "export",
        basePath,
        trailingSlash: true,
        // Diese next-sanity-Module bringen Server Actions mit, die ein statischer Export nicht kennt.
        turbopack: {
          resolveAlias: {
            "next-sanity/visual-editing": "./lib/vorschau/stub-visual-editing.tsx",
          },
        },
      }
    : {}),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_DEPLOY_TARGET: deployZiel,
    NEXT_PUBLIC_SITE_URL: siteUrl,
  },
  images: {
    // Im Export gibt es keinen Bild-Optimierer; die Varianten liegen fertig in public/images.
    unoptimized: istExport,
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
};

export default nextConfig;
