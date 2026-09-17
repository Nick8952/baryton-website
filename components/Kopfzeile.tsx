"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type { Einstellungen } from "@/lib/content/types";
import { Wortmarke } from "./Wortmarke";
import { SmartLink } from "./SmartLink";
import { StatusAnzeige } from "./StatusAnzeige";

/** «/getraenke/» und «/getraenke» sollen beide als aktiv gelten. */
const normiert = (pfad: string) => (pfad !== "/" ? pfad.replace(/\/$/, "") : "/");

export function Kopfzeile({ einstellungen }: { einstellungen: Einstellungen }) {
  const pfad = normiert(usePathname() ?? "/");
  const menue = useRef<HTMLDetailsElement>(null);

  // Menü schliessen, sobald die Seite gewechselt hat.
  useEffect(() => {
    if (menue.current) menue.current.open = false;
  }, [pfad]);

  const aktiv = (ziel: string) => normiert(ziel) === pfad;

  return (
    <header className="kopf">
      <div className="bahn">
        <Wortmarke name={einstellungen.kurzname} zusatz="Cocktail Lounge" />

        <nav className="kopf-nav" aria-label="Hauptnavigation">
          {einstellungen.navigation.map((link) => (
            <SmartLink key={link.ziel} ziel={link.ziel} aria-current={aktiv(link.ziel) ? "page" : undefined}>
              {link.titel}
            </SmartLink>
          ))}
          <StatusAnzeige zeiten={einstellungen.oeffnungszeiten} sonderzeiten={einstellungen.sonderoeffnungszeiten} />
        </nav>

        <details className="menue" ref={menue}>
          <summary>
            <svg width="16" height="12" viewBox="0 0 16 12" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M0 1h16M0 6h16M0 11h16" />
            </svg>
            Menü
          </summary>
          <div className="menue-inhalt">
            {einstellungen.navigation.map((link) => (
              <SmartLink key={link.ziel} ziel={link.ziel} aria-current={aktiv(link.ziel) ? "page" : undefined}>
                {link.titel}
              </SmartLink>
            ))}
            <StatusAnzeige zeiten={einstellungen.oeffnungszeiten} sonderzeiten={einstellungen.sonderoeffnungszeiten} />
          </div>
        </details>
      </div>
    </header>
  );
}
