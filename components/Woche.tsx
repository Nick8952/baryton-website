"use client";

import { useSyncExternalStore } from "react";
import type { Oeffnungszeit, Sonderoeffnungszeit } from "@/lib/content/types";
import { ortszeit, skala, woche } from "@/lib/oeffnung";

/**
 * Wochengrafik «Resonanz» – das Erkennungszeichen dieser Website.
 *
 * Jede Zeile ist eine Saite. Der farbige Balken beginnt dort, wo die Lounge öffnet,
 * und endet an der Sperrstunde; seine Länge ist also die tatsächliche Öffnungsdauer.
 * Die Skala läuft vom frühesten Öffnen bis zur spätesten Sperrstunde der Woche.
 *
 * Die Grafik ist eine Zugabe: Tag und Zeit stehen in jeder Zeile als Text und sind
 * für Screenreader die eigentliche Information – die Balken sind `aria-hidden`.
 */
const heuteStore = {
  subscribe(melden: () => void) {
    const id = setInterval(melden, 60_000);
    return () => clearInterval(id);
  },
  jetzt: () => Math.floor(Date.now() / 60_000),
  aufServer: () => null,
};

export function Woche({
  zeiten,
  hinweis,
  sonderzeiten = [],
  mitSonderzeiten = false,
  nurListe = false,
}: {
  zeiten: Oeffnungszeit[];
  hinweis?: string;
  sonderzeiten?: Sonderoeffnungszeit[];
  mitSonderzeiten?: boolean;
  nurListe?: boolean;
}) {
  const minute = useSyncExternalStore(heuteStore.subscribe, heuteStore.jetzt, heuteStore.aufServer);
  const heute = minute === null ? null : ortszeit(new Date(minute * 60_000)).wochentag;

  const { zeilen, von, bis, hatFenster } = woche(zeiten);
  // Ohne strukturierte Zeiten wird keine Grafik gezeichnet – sonst sähe es aus,
  // als wäre die ganze Woche geschlossen.
  const grafik = hatFenster && !nurListe;
  const marken = grafik ? skala(von, bis) : [];

  return (
    <div className={grafik ? "woche-block" : "woche-block ist-liste"} style={{ ["--tagbreite" as string]: "6.5rem" }}>
      {marken.length > 1 ? (
        <div className="woche-skala" aria-hidden="true">
          {marken.map((m) => (
            <span key={m.text} style={{ left: `${m.anteil * 100}%` }}>
              {m.text}
            </span>
          ))}
        </div>
      ) : null}

      <div className="woche">
        {zeilen.map((zeile) => (
          <div
            key={zeile.wochentag}
            className={`woche-zeile reveal${zeile.wochentag === heute ? " heute" : ""}`}
          >
            <p className="woche-tag">
              {zeile.wochentag}
              {zeile.wochentag === heute ? <span className="nur-fuer-screenreader"> (heute)</span> : null}
            </p>

            {grafik ? (
              <div className="woche-spur" aria-hidden="true">
                {zeile.laenge > 0 ? (
                  <span
                    className="woche-balken"
                    style={{ left: `${zeile.start * 100}%`, width: `${Math.max(zeile.laenge * 100, 2)}%` }}
                  />
                ) : null}
              </div>
            ) : (
              <span />
            )}

            <p className="woche-zeit">
              {zeile.text}
              {zeile.laenge > 0 ? <span className="nur-fuer-screenreader"> Uhr</span> : null}
            </p>
          </div>
        ))}
      </div>

      {mitSonderzeiten && sonderzeiten.length ? (
        <div style={{ marginTop: "1.5rem" }}>
          <p className="woche-marke">Abweichende Zeiten</p>
          <ul style={{ listStyle: "none", padding: 0, margin: "0.5rem 0 0" }}>
            {sonderzeiten.map((s) => (
              <li key={s.id} style={{ marginBottom: "0.35rem" }}>
                <strong>{s.bezeichnung}</strong>, {s.datum}: {s.geschlossen ? "geschlossen" : s.zeiten}
                {s.hinweis ? ` – ${s.hinweis}` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {hinweis ? <p className="quellhinweis">{hinweis}</p> : null}
    </div>
  );
}
