/**
 * WCAG contrast for every parish palette, in the roles the pages use.
 *
 *   node tools/palette-check.mjs
 *
 * The roles come from the table at the top of app/globals.css, which was
 * computed by hand for St. Mary's navy and gold. A parish theme has to
 * clear the same bars or its small text fails where St. Mary's passes.
 * Exits 1 on any failure.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const ts = (await import(pathToFileURL(path.join(ROOT, "node_modules/typescript/lib/typescript.js")).href)).default;
const tmp = path.join(ROOT, ".next-logic-tests");
fs.mkdirSync(tmp, { recursive: true });

const DEFAULT = {
  navy: "#0e1a2b",
  navySoft: "#152540",
  navyLine: "#26395a",
  marian: "#1f3c7f",
  gold: "#d6b25a",
  goldLight: "#e6c97e",
  goldDeep: "#6f5618",
  cream: "#f4eddf",
  dim: "#cdc3ad",
  paper: "#f7f2e8",
  paperDim: "#ece4d4",
  ink: "#1a2233",
  inkSoft: "#4a5368",
};

/** [text, ground, minimum ratio, where it is used] */
const ROLES = [
  ["cream", "navy", 7, "body text on the dark ground"],
  ["dim", "navy", 4.5, "secondary text on the dark ground"],
  ["dim", "navySoft", 4.5, "secondary text on cards"],
  ["cream", "navySoft", 7, "text on cards"],
  ["gold", "navy", 4.5, "small gold labels on the dark ground"],
  ["gold", "navySoft", 4.5, "small gold labels on cards"],
  ["goldLight", "navy", 4.5, "times and links on the dark ground"],
  ["navy", "gold", 4.5, "text on gold buttons"],
  ["ink", "paper", 7, "body text on paper"],
  ["inkSoft", "paper", 4.5, "secondary text on paper"],
  ["marian", "paper", 4.5, "links and labels on paper"],
  ["paper", "marian", 4.5, "text on filled buttons"],
  ["ink", "paperDim", 7, "text in the note boxes"],
  ["marian", "paperDim", 4.5, "links in the note boxes"],
  ["goldDeep", "paper", 3, "large gold headings on paper"],
];

function lum(hex) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const ratio = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

let fails = 0;
for (const slug of fs.readdirSync(path.join(ROOT, "parishes")).filter((d) => fs.existsSync(path.join(ROOT, "parishes", d, "data.ts")))) {
  const src = fs.readFileSync(path.join(ROOT, "parishes", slug, "data.ts"), "utf8").replace(/from "@\/lib\/(\w+)"/g, 'from "./$1.mjs"');
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  const file = path.join(tmp, `palette-${slug}.mjs`);
  fs.writeFileSync(file, js);
  const theme = (await import(pathToFileURL(file).href)).default.theme ?? DEFAULT;
  console.log(`\n${slug}${theme === DEFAULT ? " (default palette)" : ""}`);
  for (const [fg, bg, min, where] of ROLES) {
    const r = ratio(theme[fg], theme[bg]);
    const ok = r >= min;
    if (!ok) fails++;
    console.log(`  ${ok ? "ok  " : "FAIL"} ${r.toFixed(2).padStart(6)}  ${fg} on ${bg} (min ${min}) ${where}`);
  }
}
console.log(fails ? `\n${fails} FAILED` : "\nevery palette clears its roles");
process.exit(fails ? 1 : 0);
