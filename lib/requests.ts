import type { Lang } from "@/lib/i18n";
import type { Field } from "@/lib/register";

/**
 * The two short request forms, as data. Same shape as the registration
 * form so the page and the API share one renderer and one summarizer.
 *
 * Mass intentions are a REQUEST the office confirms, never a booking: the
 * website does not know which Masses are already taken, and it should not
 * pretend to (glaze.md on availability). The stipend is paid at the office
 * or by mail; no amount is printed because no parish has published one.
 */
export type RequestKind = "mass-intention" | "prayer-request";

export const REQUESTS: Record<RequestKind, { title: string; subject: string; fields: Field[] }> = {
  "mass-intention": {
    title: "Mass intention",
    subject: "Mass intention request",
    fields: [
      { name: "requester", label: "Your name", required: true, wide: true },
      { name: "phone", label: "Your phone", type: "tel" },
      { name: "email", label: "Your email", type: "email" },
      { name: "intention_for", label: "The Mass is for", required: true, wide: true },
      { name: "status", label: "Living or deceased", type: "select", options: ["", "Deceased", "Living", "Special intention"] },
      // The Mass intentions page swaps this for a select of the parish's actual Masses for six weeks.
      { name: "preferred", label: "Preferred Mass, if any", wide: true },
      { name: "card", label: "Would you like a Mass card to give?", type: "yesno" },
      { name: "notes", label: "Anything else the office should know", wide: true },
    ],
  },
  "prayer-request": {
    title: "Prayer request",
    subject: "Prayer request",
    fields: [
      { name: "requester", label: "Your name", wide: true },
      { name: "phone", label: "Your phone", type: "tel" },
      { name: "email", label: "Your email", type: "email" },
      { name: "pray_for", label: "Who or what to pray for", required: true, wide: true },
      { name: "publish", label: "May we print the name in the bulletin?", type: "yesno" },
      { name: "notes", label: "Anything you want the parish to know", wide: true },
    ],
  },
};

const ES: Record<string, string> = {
  "Your name": "Tu nombre",
  "Your phone": "Tu teléfono",
  "Your email": "Tu correo electrónico",
  "The Mass is for": "La Misa es por",
  "Living or deceased": "Vivo o difunto",
  Deceased: "Difunto",
  Living: "Vivo",
  "Special intention": "Intención especial",
  "Preferred Mass, if any": "Misa preferida, si la hay",
  "Would you like a Mass card to give?": "¿Quieres una tarjeta de Misa para regalar?",
  "Anything else the office should know": "Algo más que la oficina deba saber",
  "Who or what to pray for": "Por quién o por qué orar",
  "May we print the name in the bulletin?": "¿Podemos publicar el nombre en el boletín?",
  "Anything you want the parish to know": "Algo que quieras que la parroquia sepa",
};

export function trRequest(label: string, lang: Lang): string {
  return lang === "es" ? (ES[label] ?? label) : label;
}

export function isRequestKind(k: string): k is RequestKind {
  return k === "mass-intention" || k === "prayer-request";
}

export function summarizeRequest(kind: RequestKind, data: Record<string, string>): string {
  const rows = REQUESTS[kind].fields.map((f) => [f.label, (data[f.name] ?? "").trim()] as const).filter(([, v]) => v);
  return rows.map(([k, v]) => `${k}: ${v}`).join("\n");
}
