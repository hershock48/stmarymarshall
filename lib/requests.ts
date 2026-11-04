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
export type RequestKind = "mass-intention" | "prayer-request" | "enroll";

const GRADES = ["", "Pre-K", "Kindergarten", "1st grade", "2nd grade", "3rd grade", "4th grade", "5th grade", "6th grade", "7th grade", "8th grade", "9th grade", "10th grade", "11th grade", "12th grade"];
const SACRAMENTS = ["", "None yet", "Baptism", "Baptism and First Communion", "Baptism, First Communion and Confirmation"];

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
  // Religious education enrollment: the household once, each child once,
  // sent to the office, which answers with the class and the fee. The
  // on-ramp to the household account in docs/narthex-plan.md; until then
  // the office keys nothing, it reads one email per family.
  enroll: {
    title: "Religious education enrollment",
    subject: "Religious education enrollment",
    fields: [
      { name: "parent", label: "Parent or guardian", required: true, wide: true },
      { name: "phone", label: "Your phone", type: "tel", required: true },
      { name: "email", label: "Your email", type: "email" },
      { name: "registered", label: "Registered with the parish?", type: "yesno" },
      { name: "child_1", label: "Child’s name", required: true },
      { name: "grade_1", label: "Grade this year", type: "select", options: GRADES },
      { name: "sacraments_1", label: "Sacraments received", type: "select", options: SACRAMENTS, wide: true },
      { name: "child_2", label: "Second child’s name" },
      { name: "grade_2", label: "Grade this year", type: "select", options: GRADES },
      { name: "child_3", label: "Third child’s name" },
      { name: "grade_3", label: "Grade this year", type: "select", options: GRADES },
      { name: "needs", label: "Allergies, learning needs, or anything the catechist should know", wide: true },
      { name: "notes", label: "Anything else for the office", wide: true },
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
  "Parent or guardian": "Padre, madre o tutor",
  "Registered with the parish?": "¿Están registrados en la parroquia?",
  "Child’s name": "Nombre del niño o niña",
  "Grade this year": "Grado este año",
  "Sacraments received": "Sacramentos recibidos",
  "Second child’s name": "Nombre del segundo hijo",
  "Third child’s name": "Nombre del tercer hijo",
  "Allergies, learning needs, or anything the catechist should know": "Alergias, necesidades de aprendizaje o algo que el catequista deba saber",
  "Anything else for the office": "Algo más para la oficina",
  "Pre-K": "Preescolar",
  Kindergarten: "Kínder",
  "1st grade": "1.º grado",
  "2nd grade": "2.º grado",
  "3rd grade": "3.º grado",
  "4th grade": "4.º grado",
  "5th grade": "5.º grado",
  "6th grade": "6.º grado",
  "7th grade": "7.º grado",
  "8th grade": "8.º grado",
  "9th grade": "9.º grado",
  "10th grade": "10.º grado",
  "11th grade": "11.º grado",
  "12th grade": "12.º grado",
  "None yet": "Ninguno todavía",
  Baptism: "Bautismo",
  "Baptism and First Communion": "Bautismo y Primera Comunión",
  "Baptism, First Communion and Confirmation": "Bautismo, Primera Comunión y Confirmación",
};

export function trRequest(label: string, lang: Lang): string {
  return lang === "es" ? (ES[label] ?? label) : label;
}

export function isRequestKind(k: string): k is RequestKind {
  return k === "mass-intention" || k === "prayer-request" || k === "enroll";
}

export function summarizeRequest(kind: RequestKind, data: Record<string, string>): string {
  const rows = REQUESTS[kind].fields.map((f) => [f.label, (data[f.name] ?? "").trim()] as const).filter(([, v]) => v);
  return rows.map(([k, v]) => `${k}: ${v}`).join("\n");
}
