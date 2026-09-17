import { adresseTyp, bildTyp, linkTyp, oeffnungszeitTyp, richTextTyp } from "./objekte";
import { bausteine } from "./bausteine";
import {
  einstellungenTyp,
  getraenkTyp,
  getraenkekategorieTyp,
  rechtstextTyp,
  seiteTyp,
  sonderoeffnungszeitTyp,
} from "./dokumente";

export const schemaTypes = [
  // Objekte
  bildTyp,
  linkTyp,
  richTextTyp,
  adresseTyp,
  oeffnungszeitTyp,
  ...bausteine,
  // Dokumente
  einstellungenTyp,
  seiteTyp,
  getraenkekategorieTyp,
  getraenkTyp,
  sonderoeffnungszeitTyp,
  rechtstextTyp,
];
