import type { Oeffnungszeit } from "@/lib/content/types";
import { woche } from "@/lib/oeffnung";

/**
 * Sieben Saiten hinter dem Schriftzug – eine je Wochentag.
 * Der hellere Abschnitt einer Saite entspricht dem Öffnungsfenster dieses Tages,
 * es ist also dasselbe Motiv wie in der Wochengrafik, nur als Atmosphäre.
 * Rein dekorativ und darum für Screenreader ausgeblendet.
 */
export function Saiten({ zeiten }: { zeiten: Oeffnungszeit[] }) {
  const { zeilen } = woche(zeiten);
  return (
    <svg className="saiten" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      {zeilen.map((zeile, i) => {
        const y = 8 + i * 14;
        return (
          <g key={zeile.wochentag}>
            <line x1="0" y1={y} x2="100" y2={y} opacity="0.14" vectorEffect="non-scaling-stroke" />
            {zeile.geschlossen ? null : (
              <line
                x1={zeile.start * 100}
                y1={y}
                x2={(zeile.start + zeile.laenge) * 100}
                y2={y}
                opacity="0.5"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
