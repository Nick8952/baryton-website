import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { RichText as RichTextTyp } from "@/lib/content/types";
import { SmartLink } from "./SmartLink";

const komponenten: PortableTextComponents = {
  marks: {
    link: ({ value, children }) => (
      <SmartLink ziel={String(value?.href ?? "#")} className="textlink">
        {children}
      </SmartLink>
    ),
  },
};

export function RichText({ inhalt }: { inhalt: RichTextTyp | undefined }) {
  if (!inhalt?.length) return null;
  return <PortableText value={inhalt} components={komponenten} />;
}
