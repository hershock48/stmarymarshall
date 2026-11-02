import type { Lang } from "@/lib/i18n";

/**
 * The parish registration form as data: the fields, in the order the office's
 * paper form and the old online form asked them. The page renders from this
 * and the API formats the email from it, so adding a question is one edit.
 *
 * The St. Mary form asked for education level, occupation and employer.
 * Those are kept because that office asked them; nothing was added. The
 * Spanish labels are the same questions, not a second form.
 */
export type Field = { name: string; label: string; type?: "text" | "tel" | "email" | "date" | "yesno" | "select"; options?: string[]; required?: boolean; wide?: boolean };

export const FAMILY: Field[] = [
  { name: "family_name", label: "Family name", required: true, wide: true },
  { name: "street", label: "Street address", wide: true },
  { name: "city_zip", label: "City and ZIP" },
  { name: "home_phone", label: "Home phone", type: "tel" },
  { name: "home_phone_unlisted", label: "Home phone unlisted?", type: "yesno" },
  { name: "cell_phone", label: "Cell phone", type: "tel" },
  { name: "email", label: "Email", type: "email" },
];

export const ADULT: Field[] = [
  { name: "name", label: "Name", wide: true },
  { name: "maiden", label: "Maiden name, if any" },
  { name: "gender", label: "Gender", type: "select", options: ["", "Female", "Male"] },
  { name: "birthdate", label: "Birthdate", type: "date" },
  { name: "home_phone", label: "Home phone", type: "tel" },
  { name: "work_phone", label: "Work phone", type: "tel" },
  { name: "cell_phone", label: "Cell phone", type: "tel" },
  { name: "education", label: "Education level" },
  { name: "occupation", label: "Occupation" },
  { name: "employer", label: "Employer" },
  { name: "baptism_date", label: "Baptism date (approximate)" },
  { name: "baptized_at", label: "Baptized at" },
  { name: "baptized_catholic", label: "Was that a Catholic church?", type: "yesno" },
  { name: "first_communion", label: "First Communion", type: "yesno" },
  { name: "confirmed", label: "Confirmed", type: "yesno" },
  { name: "marital_status", label: "Marital status", type: "select", options: ["", "Married", "Not married"] },
  { name: "marriage_date", label: "If married, date of marriage" },
  { name: "marriage_accepted", label: "Is the marriage accepted by the Catholic Church?", type: "yesno" },
  { name: "denomination", label: "Religious denomination" },
  { name: "convert", label: "If Catholic, a convert?", type: "yesno" },
  { name: "receiving_communion", label: "Receiving Communion?", type: "yesno" },
  { name: "housebound", label: "Housebound or in a nursing home?", type: "yesno" },
];

export const CHILD: Field[] = [
  { name: "name", label: "Name", wide: true },
  { name: "gender", label: "Gender", type: "select", options: ["", "Female", "Male"] },
  { name: "birthdate", label: "Birth date", type: "date" },
  { name: "grade", label: "Grade" },
  { name: "school", label: "School" },
  { name: "baptism_date", label: "Baptism date (approximate)" },
  { name: "baptized_at", label: "Baptized at" },
  { name: "first_communion", label: "First Communion", type: "yesno" },
  { name: "confirmed", label: "Confirmed", type: "yesno" },
  { name: "religious_ed", label: "Enrolled in parish Religious Education?", type: "yesno" },
];

export const INTERESTS = ["Usher or greeter", "Women’s groups and guilds", "Choir", "Funeral dinners", "Bible study", "Knights of Columbus"] as const;

/** Spanish for every label, option and interest above. Same questions, one dictionary. */
const ES: Record<string, string> = {
  "Family name": "Apellido de la familia",
  "Street address": "Dirección",
  "City and ZIP": "Ciudad y código postal",
  "Home phone": "Teléfono de casa",
  "Home phone unlisted?": "¿Teléfono de casa no publicado?",
  "Cell phone": "Celular",
  Email: "Correo electrónico",
  Name: "Nombre",
  "Maiden name, if any": "Apellido de soltera, si aplica",
  Gender: "Sexo",
  Female: "Mujer",
  Male: "Hombre",
  Birthdate: "Fecha de nacimiento",
  "Birth date": "Fecha de nacimiento",
  "Work phone": "Teléfono del trabajo",
  "Education level": "Nivel de estudios",
  Occupation: "Ocupación",
  Employer: "Empleador",
  "Baptism date (approximate)": "Fecha de bautizo (aproximada)",
  "Baptized at": "Bautizado en",
  "Was that a Catholic church?": "¿Fue una iglesia católica?",
  "First Communion": "Primera Comunión",
  Confirmed: "Confirmado",
  "Marital status": "Estado civil",
  Married: "Casado",
  "Not married": "No casado",
  "If married, date of marriage": "Si está casado, fecha del matrimonio",
  "Is the marriage accepted by the Catholic Church?": "¿El matrimonio es reconocido por la Iglesia católica?",
  "Religious denomination": "Religión",
  "If Catholic, a convert?": "Si es católico, ¿es converso?",
  "Receiving Communion?": "¿Recibe la Comunión?",
  "Housebound or in a nursing home?": "¿En casa sin poder salir, o en un asilo?",
  Grade: "Grado",
  School: "Escuela",
  "Enrolled in parish Religious Education?": "¿Inscrito en la catequesis de la parroquia?",
  "Usher or greeter": "Ujier o bienvenida",
  "Women’s groups and guilds": "Grupos de mujeres",
  Choir: "Coro",
  "Funeral dinners": "Comidas de funeral",
  "Bible study": "Estudio bíblico",
  "Knights of Columbus": "Caballeros de Colón",
};

/** A label in the page's language. English is the key, so the API's email keeps the English label. */
export function tr(label: string, lang: Lang): string {
  return lang === "es" ? (ES[label] ?? label) : label;
}

export const ADULTS = 2;
export const CHILDREN = 4;

/** Group prefixes used in the form's input names: adult1_name, child3_grade. */
export function groups() {
  return {
    adults: Array.from({ length: ADULTS }, (_, i) => ({ prefix: `adult${i + 1}_`, n: i })),
    children: Array.from({ length: CHILDREN }, (_, i) => ({ prefix: `child${i + 1}_`, n: i + 1 })),
  };
}

/** Plain-text summary of a submission for the office email and the log. */
export function summarize(data: Record<string, string>): string {
  const lines: string[] = [];
  const block = (title: string, fields: Field[], prefix = "") => {
    const rows = fields.map((f) => [f.label, (data[prefix + f.name] ?? "").trim()] as const).filter(([, v]) => v);
    if (rows.length === 0) return;
    lines.push("", title.toUpperCase());
    for (const [k, v] of rows) lines.push(`  ${k}: ${v}`);
  };
  block("Family", FAMILY);
  const g = groups();
  for (const a of g.adults) block(a.n === 0 ? "Adult" : "Spouse", ADULT, a.prefix);
  for (const c of g.children) block(`Child ${c.n}`, CHILD, c.prefix);
  const interests = Object.keys(data).filter((k) => k.startsWith("interest_") && data[k]);
  if (interests.length) {
    lines.push("", "PARISH PARTICIPATION");
    for (const k of interests) lines.push(`  ${data[k]}`);
  }
  if (data.notes?.trim()) lines.push("", "NOTES", `  ${data.notes.trim()}`);
  return lines.join("\n").trim();
}
