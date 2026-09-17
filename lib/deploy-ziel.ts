// Einzige Stelle, an der Betriebsart, Unterpfad und öffentliche URL festgelegt werden.
// Wird von next.config.ts (Build) und von der Anwendung (Laufzeit) gelesen.
//
// Standard ohne Env-Variablen = GitHub-Pages-Demo unter dem Repository-Unterpfad.
// Für Vercel: DEPLOY_TARGET=vercel (dann kein Unterpfad, SITE_URL = Vercel-/Kundendomain).
export type DeployZiel = "pages" | "vercel";

const REPO_NAME = "baryton-website";
const GITHUB_KONTO = "nick8952";

export const deployZiel: DeployZiel = process.env.DEPLOY_TARGET === "vercel" ? "vercel" : "pages";

// BASE_PATH nicht gesetzt → Repository-Unterpfad; ausdrücklich leer ("") → Export an einer Domain-Wurzel.
export const basePath: string =
  deployZiel === "vercel" ? "" : (process.env.BASE_PATH ?? `/${REPO_NAME}`).trim().replace(/\/$/, "");

const siteUrlEnv = process.env.SITE_URL?.trim().replace(/\/$/, "");
export const siteUrl: string =
  siteUrlEnv && siteUrlEnv.length > 0
    ? siteUrlEnv
    : deployZiel === "vercel"
      ? "https://baryton-website.vercel.app"
      : `https://${GITHUB_KONTO}.github.io${basePath}`;
