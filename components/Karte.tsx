import type { KarteBaustein } from "@/lib/content/types";

/** Schweizer Preisdarstellung: 18 → «18.–», 18.5 → «18.50». */
function preisText(preis: number): string {
  return Number.isInteger(preis) ? `${preis}.–` : preis.toFixed(2);
}

/**
 * Getränkekarte. Liegt keine Karte vor, erscheint der hinterlegte Hinweis –
 * es werden nie Beispielgetränke oder Preise erfunden.
 */
export function Karte({ baustein }: { baustein: KarteBaustein }) {
  const { kategorien, getraenke, hinweis } = baustein;
  const gefuellt = kategorien.filter((k) => getraenke.some((g) => g.kategorie === k.id));

  if (!gefuellt.length) {
    return hinweis ? (
      <div className="karte-hinweis">
        <p>{hinweis}</p>
      </div>
    ) : null;
  }

  return (
    <div>
      {gefuellt.map((kategorie) => (
        <section className="karte-kategorie reveal" key={kategorie.id}>
          <h3>{kategorie.titel}</h3>
          {kategorie.beschreibung ? <p className="beschreibung">{kategorie.beschreibung}</p> : null}
          <ul className="karte-liste">
            {getraenke
              .filter((g) => g.kategorie === kategorie.id)
              .map((g) => (
                <li className="karte-eintrag" key={g.id}>
                  <p className="name" style={{ margin: 0 }}>
                    {g.name}
                    {g.menge ? <span className="zusatz"> {g.menge}</span> : null}
                    {g.hinweis ? <span className="zusatz"> · {g.hinweis}</span> : null}
                  </p>
                  {typeof g.preis === "number" ? <p className="preis" style={{ margin: 0 }}>{preisText(g.preis)}</p> : null}
                  {g.beschreibung ? <p className="beschreibung" style={{ margin: 0 }}>{g.beschreibung}</p> : null}
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
