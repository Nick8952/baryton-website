# Hinweise für Codex

Die verbindlichen Projektanweisungen stehen in [CLAUDE.md](CLAUDE.md).
Sie gelten unverändert auch für Codex – Architektur, Inhaltsregeln, Designkonzept,
Datenschutz und Deployment.

Kurzfassung:

- Nichts erfinden. Belegte Angaben stehen in `docs/QUELLEN.md`.
- Eine Codebasis, zwei Betriebsarten (`DEPLOY_TARGET=pages|vercel`).
- Inhalte nur über `lib/content`, nie direkt aus `local.ts` oder `sanity.ts`.
- Keine externen Requests – sonst schlägt `npm run export:pruefen` fehl und die
  Datenschutzerklärung stimmt nicht mehr.
- Vor jedem Commit: `inhalt:pruefen`, `lint`, `typecheck`, `build:pages`, `export:pruefen`.
