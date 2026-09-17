import type { Getraenk, Getraenkekategorie, Speise, Speisekategorie } from "@/lib/content/types";
import { preisText } from "@/lib/preis";

type Kategorie = Getraenkekategorie | Speisekategorie;
type Eintrag = Getraenk | Speise;

/**
 * Gemeinsame Darstellung für Getränke- und Speisekarte – beide Inhaltstypen haben
 * denselben Aufbau (Kategorien mit Einträgen, die entweder einen Preis oder mehrere
 * Preisvarianten haben). `Karte.tsx` und `Speisen.tsx` reichen hier nur ihre jeweiligen
 * Typen durch.
 */

/**
 * Haben alle Einträge einer Kategorie dieselben Grössen (z. B. jede Pizza in Standard,
 * Medium und Family), werden die Grössennamen einmal als Spaltenkopf gesetzt statt bei
 * jedem der 16 Einträge wiederholt. Das macht eine lange Karte deutlich ruhiger.
 *
 * Einträge, denen eine Grösse fehlt (bei uns: eine Pizza, deren Family-Preis auf dem
 * Originalfoto verdeckt war), dürfen dabei mitlaufen – ihre Lücke bleibt sichtbar leer.
 * Zurückgegeben werden die Spaltennamen, sonst `null`.
 */
function gemeinsameGroessen(eintraege: Eintrag[]): string[] | null {
  const mitVarianten = eintraege.filter((e) => e.varianten?.length);
  // Lohnt sich erst ab zwei Einträgen und nur, wenn die ganze Kategorie Grössen hat.
  if (mitVarianten.length < 2 || mitVarianten.length !== eintraege.length) return null;

  // Der Eintrag mit den meisten Grössen gibt die Spalten vor.
  const spalten = mitVarianten
    .reduce((a, b) => ((b.varianten?.length ?? 0) > (a.varianten?.length ?? 0) ? b : a), mitVarianten[0])
    .varianten!.map((v) => v.bezeichnung);

  // Jeder Eintrag muss die Spalten in derselben Reihenfolge verwenden (Lücken erlaubt).
  const passt = mitVarianten.every((e) => {
    let i = 0;
    return e.varianten!.every((v) => {
      while (i < spalten.length && spalten[i] !== v.bezeichnung) i++;
      return i++ < spalten.length;
    });
  });
  return passt ? spalten : null;
}

function Preis({ eintrag, spalten }: { eintrag: Eintrag; spalten: string[] | null }) {
  if (eintrag.varianten?.length) {
    // Mit gemeinsamem Spaltenkopf: nur die Zahlen, die Grösse steht oben. Für
    // Screenreader bleibt sie an jedem Preis stehen, weil der Spaltenkopf für sie
    // nicht mit der Zeile verknüpft ist.
    if (spalten) {
      return (
        <p className="karte-preise" style={{ margin: 0 }}>
          {spalten.map((spalte) => {
            const treffer = eintrag.varianten!.find((v) => v.bezeichnung === spalte);
            return (
              <span key={spalte}>
                <span className="nur-fuer-screenreader">{spalte}: </span>
                {treffer ? preisText(treffer.preis) : <span aria-hidden="true">–</span>}
              </span>
            );
          })}
        </p>
      );
    }
    return (
      <p className="preis varianten" style={{ margin: 0 }}>
        {eintrag.varianten.map((v) => (
          <span key={v._key}>
            {v.bezeichnung} {preisText(v.preis)}
          </span>
        ))}
      </p>
    );
  }
  if (typeof eintrag.preis === "number") {
    return (
      <p className="preis" style={{ margin: 0 }}>
        {preisText(eintrag.preis)}
      </p>
    );
  }
  return null;
}

export function Preisliste({
  kategorien,
  eintraege,
  hinweis,
  mitSprungmarken = false,
}: {
  kategorien: Kategorie[];
  eintraege: Eintrag[];
  hinweis?: string;
  /** Kurze Sprungliste über der Karte – hilft, wenn es viele Kategorien gibt. */
  mitSprungmarken?: boolean;
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
      {mitSprungmarken && gefuellt.length > 2 ? (
        <nav className="karte-sprung" aria-label="Abschnitte dieser Karte">
          {gefuellt.map((k) => (
            <a key={k.id} href={`#karte-${k.id}`}>
              {k.titel}
            </a>
          ))}
        </nav>
      ) : null}

      {gefuellt.map((kategorie) => {
        const dieser = eintraege.filter((e) => e.kategorie === kategorie.id);
        const spalten = gemeinsameGroessen(dieser);
        return (
          <section className="karte-kategorie reveal" id={`karte-${kategorie.id}`} key={kategorie.id}>
            <h3>{kategorie.titel}</h3>
            {kategorie.beschreibung ? <p className="beschreibung">{kategorie.beschreibung}</p> : null}

            {spalten ? (
              <p className="karte-spaltenkopf karte-preise" aria-hidden="true">
                {spalten.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </p>
            ) : null}

            <ul className="karte-liste">
              {dieser.map((e) => (
                <li className="karte-eintrag" key={e.id}>
                  <p className="name" style={{ margin: 0 }}>
                    {e.name}
                    {"menge" in e && e.menge ? <span className="zusatz"> {e.menge}</span> : null}
                    {e.hinweis ? <span className="zusatz"> · {e.hinweis}</span> : null}
                  </p>
                  <Preis eintrag={e} spalten={spalten} />
                  {e.beschreibung ? (
                    <p className="beschreibung" style={{ margin: 0 }}>
                      {e.beschreibung}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
