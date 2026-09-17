import type { Getraenk, Getraenkekategorie, Speise, Speisekategorie } from "@/lib/content/types";
import { preisText } from "@/lib/preis";

/**
 * Gemeinsame Darstellung für Getränke- und Speisekarte – beide Inhaltstypen haben
 * denselben Aufbau (Kategorien mit Einträgen, die entweder einen Preis oder mehrere
 * Preisvarianten haben). `Karte.tsx` und `Speisen.tsx` reichen hier nur ihre jeweiligen
 * Typen durch.
 */
export function Preisliste({
  kategorien,
  eintraege,
  hinweis,
}: {
  kategorien: (Getraenkekategorie | Speisekategorie)[];
  eintraege: (Getraenk | Speise)[];
  hinweis?: string;
}) {
  const gefuellt = kategorien.filter((k) => eintraege.some((e) => e.kategorie === k.id));

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
            {eintraege
              .filter((e) => e.kategorie === kategorie.id)
              .map((e) => (
                <li className="karte-eintrag" key={e.id}>
                  <p className="name" style={{ margin: 0 }}>
                    {e.name}
                    {"menge" in e && e.menge ? <span className="zusatz"> {e.menge}</span> : null}
                    {e.hinweis ? <span className="zusatz"> · {e.hinweis}</span> : null}
                  </p>
                  {e.varianten?.length ? (
                    <p className="preis varianten" style={{ margin: 0 }}>
                      {e.varianten.map((v) => (
                        <span key={v._key}>
                          {v.bezeichnung} {preisText(v.preis)}
                        </span>
                      ))}
                    </p>
                  ) : typeof e.preis === "number" ? (
                    <p className="preis" style={{ margin: 0 }}>
                      {preisText(e.preis)}
                    </p>
                  ) : null}
                  {e.beschreibung ? (
                    <p className="beschreibung" style={{ margin: 0 }}>
                      {e.beschreibung}
                    </p>
                  ) : null}
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
