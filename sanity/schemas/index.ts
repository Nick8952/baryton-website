import { adresseTyp, bildTyp, linkTyp, oeffnungszeitTyp, preisvarianteTyp, richTextTyp } from "./objekte";
import { bausteine } from "./bausteine";
import {
  einstellungenTyp,
  getraenkTyp,
  getraenkekategorieTyp,
  rechtstextTyp,
  seiteTyp,
  sonderoeffnungszeitTyp,
  speiseTyp,
  speisekategorieTyp,
} from "./dokumente";

export const schemaTypes = [
  // Objekte
  bildTyp,
  linkTyp,
  richTextTyp,
  adresseTyp,
  oeffnungszeitTyp,
  preisvarianteTyp,
  ...bausteine,
  // Dokumente
  einstellungenTyp,
  seiteTyp,
  getraenkekategorieTyp,
  getraenkTyp,
  speisekategorieTyp,
  speiseTyp,
  sonderoeffnungszeitTyp,
  rechtstextTyp,
];
