import type { Baustein, Einstellungen } from "@/lib/content/types";
import { RichText } from "../RichText";
import { SmartLink } from "../SmartLink";
import { Woche } from "../Woche";
import { Karte } from "../Karte";
import { Kontakt } from "../Kontakt";
import { Bild } from "../Bild";

/**
 * Rahmen für jeden Abschnitt: Kurzzeile, Titel, Einleitung – überall gleich gesetzt,
 * damit der Kunde im CMS nur Text pflegt und nie über Abstände nachdenken muss.
 */
function Kopf({ kurzzeile, titel, einleitung }: { kurzzeile?: string; titel?: string; einleitung?: string }) {
  if (!kurzzeile && !titel && !einleitung) return null;
  return (
    <div className="abschnitt-kopf">
      {kurzzeile ? <p className="kurzzeile">{kurzzeile}</p> : null}
      {titel ? <h2>{titel}</h2> : null}
      {einleitung ? <p className="einleitung">{einleitung}</p> : null}
    </div>
  );
}

function EinBaustein({ baustein: b, einstellungen: e }: { baustein: Baustein; einstellungen: Einstellungen }) {
  switch (b._type) {
    case "textBaustein":
      return (
        <section className={`abschnitt reveal${b.dunkel ? " nacht" : ""}`}>
          <div className="bahn">
            <div className={b.breite === "schmal" ? "schmal" : undefined}>
              <Kopf kurzzeile={b.kurzzeile} titel={b.titel} />
              <RichText inhalt={b.inhalt} />
            </div>
          </div>
        </section>
      );

    case "oeffnungszeitenBaustein":
      return (
        <section className="abschnitt">
          <div className="bahn">
            <Kopf kurzzeile={b.kurzzeile} titel={b.titel} einleitung={b.einleitung} />
            <Woche
              zeiten={e.oeffnungszeiten}
              hinweis={e.oeffnungszeitenHinweis}
              sonderzeiten={e.sonderoeffnungszeiten}
              mitSonderzeiten={b.mitSonderzeiten}
              nurListe={b.darstellung === "liste"}
            />
          </div>
        </section>
      );

    case "karteBaustein":
      return (
        <section className="abschnitt reveal">
          <div className="bahn">
            <Kopf kurzzeile={b.kurzzeile} titel={b.titel} einleitung={b.einleitung} />
            <Karte baustein={b} />
            {b.weiterLink ? (
              <p style={{ marginTop: "1.5rem" }}>
                <SmartLink ziel={b.weiterLink.ziel} className="textlink frei">
                  {b.weiterLink.titel}
                </SmartLink>
              </p>
            ) : null}
          </div>
        </section>
      );

    case "faktenBaustein":
      return (
        <section className="abschnitt reveal">
          <div className="bahn">
            <Kopf kurzzeile={b.kurzzeile} titel={b.titel} />
            <dl className="fakten">
              {b.fakten.map((f) => (
                <div className="fakt" key={f._key}>
                  <dt>{f.bezeichnung}</dt>
                  <dd>{f.wert}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      );

    case "spaltenBaustein":
      return (
        <section className="abschnitt reveal">
          <div className="bahn">
            <Kopf kurzzeile={b.kurzzeile} titel={b.titel} />
            <div className="spalten">
              {b.spalten.map((s) => (
                <div className="spalte" key={s._key}>
                  <h3>{s.titel}</h3>
                  <RichText inhalt={s.inhalt} />
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "bildBaustein":
      return (
        <section className="abschnitt reveal">
          <div className="bahn">
            <Kopf kurzzeile={b.kurzzeile} titel={b.titel} />
            <Bild bild={b.bild} />
            {b.text ? <p style={{ marginTop: "1rem", maxWidth: "var(--text-max)" }}>{b.text}</p> : null}
          </div>
        </section>
      );

    case "kontaktBaustein":
      return (
        <section className="abschnitt reveal">
          <div className="bahn">
            <Kopf kurzzeile={b.kurzzeile} titel={b.titel} />
            <Kontakt baustein={b} einstellungen={e} />
          </div>
        </section>
      );

    case "aufrufBaustein":
      return (
        <section className="abschnitt">
          <div className="bahn">
            <div className="aufruf reveal">
              {b.kurzzeile ? <p className="kurzzeile">{b.kurzzeile}</p> : null}
              {b.titel ? <h2>{b.titel}</h2> : null}
              {b.text ? <p>{b.text}</p> : null}
              <div className="knopf-reihe">
                <SmartLink ziel={b.knopf.ziel} className="knopf">
                  {b.knopf.titel}
                </SmartLink>
                {b.zweiterKnopf ? (
                  <SmartLink ziel={b.zweiterKnopf.ziel} className="knopf leise">
                    {b.zweiterKnopf.titel}
                  </SmartLink>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      );

    case "rechtstextBaustein":
      return (
        <section className="abschnitt">
          <div className="bahn">
            <div className="rechtstext">
              {b.rechtstext.stand ? <p className="stand">Stand: {b.rechtstext.stand}</p> : null}
              <RichText inhalt={b.rechtstext.inhalt} />
            </div>
          </div>
        </section>
      );
  }
}

export function Bausteine({ bausteine, einstellungen }: { bausteine: Baustein[]; einstellungen: Einstellungen }) {
  return (
    <>
      {bausteine.map((b) => (
        <EinBaustein key={b._key} baustein={b} einstellungen={einstellungen} />
      ))}
    </>
  );
}
