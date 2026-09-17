import type { Einstellungen } from "@/lib/content/types";
import { telefonInternational } from "@/lib/seo";
import { Wortmarke } from "./Wortmarke";
import { SmartLink } from "./SmartLink";

export function Fusszeile({ einstellungen: e }: { einstellungen: Einstellungen }) {
  const jahr = new Date().getFullYear();
  const geoeffnet = e.oeffnungszeiten.filter((z) => !z.geschlossen);

  return (
    <footer className="fuss">
      <div className="bahn">
        <div className="fuss-raster">
          <div>
            <Wortmarke name={e.firmenname} fassung="hell" breite="186px" />
            {e.claim ? <p style={{ marginTop: "0.9rem" }}>{e.claim}</p> : null}
          </div>

          <div>
            <h2>Adresse</h2>
            <address>
              {e.adresse.strasse}
              <br />
              {e.adresse.plz} {e.adresse.ort}
              <br />
              <a href={`tel:${telefonInternational(e.telefon)}`}>{e.telefon}</a>
              {e.email ? (
                <>
                  <br />
                  <a href={`mailto:${e.email}`}>{e.email}</a>
                </>
              ) : null}
            </address>
            {e.routenlink ? (
              <p style={{ marginTop: "0.9rem" }}>
                <SmartLink ziel={e.routenlink} className="textlink">
                  Route planen
                </SmartLink>
              </p>
            ) : null}
          </div>

          <div>
            <h2>Geöffnet</h2>
            <ul>
              {geoeffnet.map((z) => (
                <li key={z._key}>
                  <span style={{ display: "inline-block", minWidth: "6.5rem" }}>{z.tage}</span>
                  {z.zeiten}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2>Seiten</h2>
            <ul>
              {[...e.navigation, ...e.rechtslinks].map((link) => (
                <li key={link.ziel}>
                  <SmartLink ziel={link.ziel}>{link.titel}</SmartLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="fuss-unten">
          {/*
            Solange ein Demo-Hinweis gesetzt ist, steht hier bewusst KEIN «© Baryton
            Cocktail Lounge»: Der Betrieb hat diese Seite weder beauftragt noch betreibt
            er sie. Die Zeile erscheint erst, wenn er die Website übernimmt.
          */}
          <p style={{ margin: 0 }}>
            {e.demoHinweis ? `Gestaltungskonzept ${jahr}` : `© ${jahr} ${e.firmenname}`}
          </p>
          <nav aria-label="Rechtliches">
            {e.rechtslinks.map((link) => (
              <SmartLink key={link.ziel} ziel={link.ziel}>
                {link.titel}
              </SmartLink>
            ))}
          </nav>
        </div>

        {e.demoHinweis ? (
          <p style={{ marginTop: "1.25rem", fontSize: "0.8rem", maxWidth: "46rem" }}>{e.demoHinweis}</p>
        ) : null}
      </div>
    </footer>
  );
}
