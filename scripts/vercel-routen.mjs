// Kopiert die serverabhängigen Routen (Sanity Studio, Webhook, Vorschau) aus server-routes/app
// nach app/ – nur für Vercel. Für den statischen GitHub-Pages-Export werden sie entfernt.
// Kopieren ist idempotent; app/studio und app/api stehen in .gitignore.
import { cp, rm, access } from "node:fs/promises";
import path from "node:path";

const wurzel = path.resolve(import.meta.dirname, "..");
const ziele = ["studio", "api"];
const entfernen = process.argv.includes("--entfernen");

for (const ordner of ziele) {
  const ziel = path.join(wurzel, "app", ordner);
  await rm(ziel, { recursive: true, force: true });
  if (entfernen) continue;
  const quelle = path.join(wurzel, "server-routes/app", ordner);
  await access(quelle);
  await cp(quelle, ziel, { recursive: true });
}
// Nach einem Vercel-Build verweist .next/types noch auf die kopierten Routen und bricht `tsc` – deshalb mit entfernen.
if (entfernen) for (const t of [".next/types", ".next/dev/types"]) await rm(path.join(wurzel, t), { recursive: true, force: true });
console.log(entfernen ? "Server-Routen entfernt (statischer Export)." : "Server-Routen nach app/ kopiert (Vercel).");
