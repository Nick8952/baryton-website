"use client";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { VisualEditing } from "next-sanity/visual-editing";

/**
 * Visual-Editing-Overlay mit Aktualisierung nach jeder Änderung im Studio.
 * Ohne Live Content API: bei jeder Mutation (und beim manuellen Refresh) rendert die Seite neu –
 * die Entwurfsabfragen sind ungecacht (lib/content/sanity.ts), also aktuell.
 * Nur auf Vercel im Draft Mode eingebunden (VorschauWerkzeuge.tsx). Nicht gegen ein echtes Projekt getestet.
 */
export function VorschauClient() {
  const router = useRouter();
  const aktualisieren = useCallback(
    (payload: { source: "manual" | "mutation"; livePreviewEnabled?: boolean }) => {
      if (payload.source === "mutation" && payload.livePreviewEnabled) return false;
      router.refresh();
      return new Promise<void>((resolve) => setTimeout(resolve, 800));
    },
    [router],
  );
  return <VisualEditing refresh={aktualisieren} />;
}
