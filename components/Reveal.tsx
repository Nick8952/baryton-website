"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Schaltet die Einblend-Animationen ein – aber nur, wenn die Besucherin keine
 * reduzierte Bewegung eingestellt hat.
 *
 * Ohne JavaScript (und mit `prefers-reduced-motion: reduce`) bleibt alles sofort sichtbar:
 * Die CSS-Regeln greifen erst, wenn hier `data-anim="an"` gesetzt wurde.
 *
 * Wichtig: Diese Komponente sitzt im Layout und bleibt beim Seitenwechsel bestehen.
 * Der Effekt muss deshalb bei jedem Pfadwechsel neu laufen – sonst blieben die
 * Abschnitte der neu geöffneten Seite auf `opacity: 0` stehen, weil sie nie
 * beobachtet würden.
 */
export function Reveal() {
  const pfad = usePathname();

  useEffect(() => {
    const wenigerBewegung = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (wenigerBewegung.matches) return;

    document.documentElement.dataset.anim = "an";

    const beobachter = new IntersectionObserver(
      (eintraege) => {
        for (const e of eintraege) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("sichtbar");
          beobachter.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );

    const beobachten = () => {
      for (const ziel of document.querySelectorAll<HTMLElement>(".reveal:not(.sichtbar)")) {
        beobachter.observe(ziel);
      }
    };
    beobachten();

    // Nach einer Navigation tauscht React den Inhalt aus, ohne dass dieser Effekt
    // zwingend vorher neu läuft – neu eingefügte Abschnitte werden hier nachgemeldet.
    const wachhund = new MutationObserver(beobachten);
    wachhund.observe(document.body, { childList: true, subtree: true });

    return () => {
      wachhund.disconnect();
      beobachter.disconnect();
      delete document.documentElement.dataset.anim;
    };
  }, [pfad]);

  return null;
}
