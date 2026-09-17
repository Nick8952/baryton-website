import type { Einstellungen, KontaktBaustein } from "@/lib/content/types";
import { telefonInternational } from "@/lib/seo";
import { SmartLink } from "./SmartLink";

/**
 * Kontaktbereich. Es gibt bewusst kein sendendes Formular und keine Reservationsfunktion:
 * Für den Betrieb ist nur die Telefonnummer belegt. Sobald in den Einstellungen eine
 * geprüfte E-Mail-Adresse steht, erscheint zusätzlich ein «E-Mail vorbereiten»-Link,
 * der eine vorausgefüllte Nachricht im E-Mail-Programm öffnet – gesendet wird nichts
 * durch diese Website.
 */
export function Kontakt({ baustein, einstellungen: e }: { baustein: KontaktBaustein; einstellungen: Einstellungen }) {
  const tel = telefonInternational(e.telefon);
  // Auch die Adresse selbst kodieren: ein «?» oder «&» darin könnte sonst weitere
  // Kopfzeilen (bcc, cc) in die vorbereitete Nachricht schmuggeln.
  const mailto = e.email
    ? `mailto:${encodeURIComponent(e.email)}?subject=${encodeURIComponent("Anfrage")}&body=${encodeURIComponent(
        "Guten Tag\n\nIch habe folgende Frage:\n\n\nFreundliche Grüsse\n",
      )}`
    : null;

  return (
    <div className="kontakt">
      <div className="kontakt-karte">
        <h3>Adresse</h3>
        <address>
          {e.firmenname}
          <br />
          {e.adresse.strasse}
          <br />
          {e.adresse.plz} {e.adresse.ort}
        </address>
        {e.routenlink ? (
          <div className="knopf-reihe" style={{ marginTop: "1.35rem" }}>
            <SmartLink ziel={e.routenlink} className="knopf leise">
              Route planen
            </SmartLink>
          </div>
        ) : null}
      </div>

      <div className="kontakt-karte">
        <h3>Erreichbar</h3>
        {baustein.einleitung ? <p>{baustein.einleitung}</p> : null}
        <p style={{ fontSize: "1.15rem", marginTop: "0.9rem" }}>
          <a href={`tel:${tel}`} className="textlink">
            {e.telefon}
          </a>
        </p>
        <div className="knopf-reihe">
          <a href={`tel:${tel}`} className="knopf">
            Anrufen
          </a>
          {mailto ? (
            <a href={mailto} className="knopf leise">
              E-Mail vorbereiten
            </a>
          ) : null}
        </div>
        {baustein.formularHinweis ? (
          <p style={{ marginTop: "1.1rem", fontSize: "0.88rem", color: "var(--tinte-leise)" }}>
            {baustein.formularHinweis}
          </p>
        ) : null}
      </div>
    </div>
  );
}
