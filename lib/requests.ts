import type { Field } from "@/lib/register";

/**
 * The two short request forms, as data. Same shape as the registration
 * form so the page and the API share one renderer and one summarizer.
 *
 * Mass intentions are a REQUEST the office confirms, never a booking: the
 * website does not know which Masses are already taken, and it should not
 * pretend to (glaze.md on availability). The stipend is paid at the office
 * or by mail; no amount is printed because the parish has not published
 * one.
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
      { name: "preferred", label: "Preferred date or Mass, if any", wide: true },
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

export function isRequestKind(k: string): k is RequestKind {
  return k === "mass-intention" || k === "prayer-request";
}

export function summarizeRequest(kind: RequestKind, data: Record<string, string>): string {
  const rows = REQUESTS[kind].fields.map((f) => [f.label, (data[f.name] ?? "").trim()] as const).filter(([, v]) => v);
  return rows.map(([k, v]) => `${k}: ${v}`).join("\n");
}
