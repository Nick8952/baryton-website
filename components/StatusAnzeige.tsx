"use client";

import { useSyncExternalStore } from "react";
import type { Oeffnungszeit, Sonderoeffnungszeit } from "@/lib/content/types";
import { status } from "@/lib/oeffnung";

/**
 * «Jetzt geöffnet» / «Öffnet Dienstag um 15:30».
 *
 * Die Auswertung passiert im Browser, weil die Seite statisch ausgeliefert wird und
 * eine im Voraus gebaute Aussage nach Minuten falsch wäre. Über `useSyncExternalStore`
 * rendert der Server nichts und der Browser übernimmt nach dem Laden – das vermeidet
 * abweichendes Markup bei der Hydration. Danach wird minütlich aktualisiert.
 */
const minutenStore = {
  subscribe(melden: () => void) {
    const id = setInterval(melden, 60_000);
    return () => clearInterval(id);
  },
  jetzt: () => Math.floor(Date.now() / 60_000),
  aufServer: () => null,
};

export function StatusAnzeige({
  zeiten,
  sonderzeiten = [],
  className,
}: {
  zeiten: Oeffnungszeit[];
  sonderzeiten?: Sonderoeffnungszeit[];
  className?: string;
}) {
  const minute = useSyncExternalStore(minutenStore.subscribe, minutenStore.jetzt, minutenStore.aufServer);
  if (minute === null) return null;

  const ergebnis = status(zeiten, new Date(minute * 60_000), sonderzeiten);
  if (ergebnis.art === "unbekannt") return null;

  const offen = ergebnis.art === "geoeffnet";
  const text = offen
    ? `Jetzt geöffnet, bis ${ergebnis.bis}`
    : ergebnis.heuteNoch
      ? `Öffnet heute um ${ergebnis.naechsteZeit}`
      : `Geschlossen, öffnet ${ergebnis.naechsterTag} ${ergebnis.naechsteZeit}`;

  return (
    <p className={`status${offen ? " offen" : ""}${className ? ` ${className}` : ""}`}>
      <span className="leuchte" aria-hidden="true" />
      {text}
    </p>
  );
}
