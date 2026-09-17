/**
 * Wandelt einfaches Markdown in Portable Text um – das Rich-Text-Format, das die
 * lokalen Inhaltsdateien (data/) und Sanity gemeinsam verwenden.
 *
 * Unterstützt: Absätze, ## / ### Zwischentitel, - Aufzählungen, 1. Nummerierungen,
 * **fett**, *kursiv*, [Link](https://…). Mehr braucht die Website nicht.
 *
 * Aufruf:  npm run text:konvertieren -- pfad/zur/datei.md   → Portable Text als JSON auf stdout
 * Import:  import { markdownZuPortableText } from "./md-zu-portabletext"
 */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

interface Span { _type: "span"; _key: string; text: string; marks: string[] }
interface Block {
  _type: "block"; _key: string; style: string; children: Span[];
  markDefs: { _type: "link"; _key: string; href: string; extern?: boolean }[];
  listItem?: "bullet" | "number"; level?: number;
}

function schluessel(seed: string): string {
  return createHash("sha1").update(seed).digest("hex").slice(0, 12);
}

function inline(text: string, blockKey: string): { children: Span[]; markDefs: Block["markDefs"] } {
  const children: Span[] = [];
  const markDefs: Block["markDefs"] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  const rest = text;
  let m: RegExpExecArray | null, i = 0;
  const push = (t: string, marks: string[]) => { if (t) children.push({ _type: "span", _key: schluessel(`${blockKey}-${i++}`), text: t, marks }); };
  let last = 0;
  while ((m = re.exec(rest))) {
    push(rest.slice(last, m.index), []);
    if (m[1]) {
      const href = m[2];
      const key = schluessel(`${blockKey}-link-${href}-${i}`);
      markDefs.push({ _type: "link", _key: key, href, extern: /^https?:/.test(href) });
      push(m[1], [key]);
    } else if (m[3]) push(m[3], ["strong"]);
    else if (m[4]) push(m[4], ["em"]);
    last = m.index + m[0].length;
  }
  push(rest.slice(last), []);
  return { children, markDefs };
}

export function markdownZuPortableText(md: string, seed = "pt"): Block[] {
  const blocks: Block[] = [];
  const zeilen = md.replace(/\r\n/g, "\n").split("\n");
  let absatz: string[] = [];
  let n = 0;
  const block = (style: string, text: string, listItem?: Block["listItem"]) => {
    const key = schluessel(`${seed}-${n++}-${text}`);
    const { children, markDefs } = inline(text.trim(), key);
    blocks.push({ _type: "block", _key: key, style, children, markDefs, ...(listItem ? { listItem, level: 1 } : {}) });
  };
  const absatzSchliessen = () => { if (absatz.length) { block("normal", absatz.join("\n")); absatz = []; } };
  for (const zeile of zeilen) {
    const t = zeile.trim();
    if (!t) { absatzSchliessen(); continue; }
    let m: RegExpMatchArray | null;
    if ((m = t.match(/^(#{2,3})\s+(.*)$/))) { absatzSchliessen(); block(m[1].length === 2 ? "h2" : "h3", m[2]); }
    else if ((m = t.match(/^[-*]\s+(.*)$/))) { absatzSchliessen(); block("normal", m[1], "bullet"); }
    else if ((m = t.match(/^\d+[.)]\s+(.*)$/))) { absatzSchliessen(); block("normal", m[1], "number"); }
    else absatz.push(t);
  }
  absatzSchliessen();
  return blocks;
}

if (process.argv[1]?.endsWith("md-zu-portabletext.mts")) {
  const datei = process.argv[2];
  if (!datei) { console.error("Aufruf: npm run text:konvertieren -- datei.md"); process.exit(1); }
  process.stdout.write(JSON.stringify(markdownZuPortableText(readFileSync(datei, "utf8"), datei), null, 2) + "\n");
}
