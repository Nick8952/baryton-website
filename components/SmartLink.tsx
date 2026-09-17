import Link from "next/link";
import type { ReactNode } from "react";
import { istExternerLink, sichererLink } from "@/lib/assets";

/**
 * Ein Link, der interne und externe Ziele richtig behandelt.
 * Intern läuft über next/link – das setzt den GitHub-Pages-Unterpfad selbst.
 * Externe Ziele (https:, tel:, mailto:) bekommen ein <a> mit passenden rel-Attributen.
 * Nicht erlaubte Ziele (z. B. javascript:) werden von `sichererLink` abgefangen.
 */
export function SmartLink({
  ziel,
  children,
  className,
  ...rest
}: {
  ziel: string;
  children: ReactNode;
  className?: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const href = sichererLink(ziel);
  if (istExternerLink(href)) {
    const web = /^https?:/.test(href);
    return (
      <a
        href={href}
        className={className}
        {...(web ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...rest}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} {...rest}>
      {children}
    </Link>
  );
}
