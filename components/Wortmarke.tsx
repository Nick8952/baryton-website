import Link from "next/link";

/**
 * Typografische Wortmarke. Der Betrieb hat kein öffentlich auffindbares Logo –
 * dies ist ein eigener Gestaltungsvorschlag, kein bestehendes offizielles Logo.
 */
export function Wortmarke({ name, zusatz, alsLink = true }: { name: string; zusatz?: string; alsLink?: boolean }) {
  const inhalt = (
    <>
      <span className="name">{name}</span>
      {zusatz ? <span className="zusatz">{zusatz}</span> : null}
    </>
  );
  if (!alsLink) return <span className="wortmarke">{inhalt}</span>;
  return (
    <Link href="/" className="wortmarke" aria-label={`${name} – zur Startseite`}>
      {inhalt}
    </Link>
  );
}
