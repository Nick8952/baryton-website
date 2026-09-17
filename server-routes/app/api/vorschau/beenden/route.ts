import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

/** Beendet die Entwurfsvorschau und führt zurück auf die Startseite. */
export async function GET() {
  (await draftMode()).disable();
  redirect("/");
}
