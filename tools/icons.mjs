/**
 * The icon set and the link card for one parish, rendered from its data
 * rather than drawn beside it (glaze/standards.md).
 *
 *   node tools/icons.mjs <slug>
 *
 * Reads parishes/<slug>/data.ts for the mark (a ring with letters, or the
 * parish's logo image), the hero photo, the name and the city, and writes
 * under public/parishes/<slug>/: favicon.ico (48/32/16 as 32-bit DIBs, the
 * format Next 16's build accepts), apple-icon.png (180), icon-192.png,
 * icon-512.png, icon-512-maskable.png (mark in the middle 68%), icon.svg,
 * and og.jpg (1200x630: the hero photo with the parish name).
 *
 * sharp only, no browser: the ring mark is an SVG string, so sharp
 * rasterizes it directly and the ICO is packed from the raw pixels. A logo
 * image is placed on navy with a margin.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const NAVY = "#0e1a2b";
const GOLD = "#d6b25a";
const slug = process.argv[2];
if (!slug) {
  console.error("usage: node tools/icons.mjs <slug>");
  process.exit(1);
}

// The data file is TypeScript; read the few fields the icons need by regex
// rather than compiling it, since every value is a plain literal.
const src = fs.readFileSync(path.join(ROOT, "parishes", slug, "data.ts"), "utf8");
const field = (name) => (src.match(new RegExp("^\\s*" + name + ':\\s*"([^"]*)"', "m")) || [])[1];
const name = field("name");
const city = (src.match(/church:\s*\{[^}]*city:\s*"([^"]*)"/) || [])[1];
const founded = (src.match(/^\s*founded:\s*(\d{4})/m) || [])[1];
const markLetters = (src.match(/mark:\s*\{\s*type:\s*"ring",\s*letters:\s*"([^"]*)"/) || [])[1];
const markImage = (src.match(/mark:\s*\{\s*type:\s*"image",\s*src:\s*`\$\{P\}([^`]*)`/) || [])[1];
const heroRel = (src.match(/hero:\s*\{\s*src:\s*`\$\{P\}([^`]*)`/) || [])[1];
if (!name || !city || !heroRel || (!markLetters && !markImage)) {
  console.error("could not read name/city/hero/mark from the data file", { name, city, heroRel, markLetters, markImage });
  process.exit(1);
}
const OUT = path.join(ROOT, "public/parishes", slug);
fs.mkdirSync(OUT, { recursive: true });
const SERIF = "Georgia, Times New Roman, serif";

function ringSvg(size, inset = 0) {
  // inset: fraction of the canvas left empty on each side (0.16 for maskable).
  const s = size * (1 - inset * 2);
  const o = size * inset;
  const glyph =
    markLetters === "M"
      ? `<path d="M22 79V21L50 60L78 21V79" stroke-width="8"/>`
      : `<text x="50" y="50" text-anchor="middle" dominant-baseline="central" fill="${GOLD}" stroke="none" font-family="${SERIF}" font-weight="600" font-size="${markLetters.length > 1 ? 44 : 60}">${markLetters}</text>`;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${NAVY}"/>
  <g transform="translate(${o} ${o}) scale(${s / 100})" fill="none" stroke="${GOLD}" stroke-linejoin="miter">
    <g transform="translate(5 5) scale(0.9)">
      <circle cx="50" cy="50" r="45" stroke-width="7"/>
      ${glyph}
    </g>
  </g>
</svg>`);
}

/** The mark at a size: the ring SVG rasterized, or the logo on navy. */
async function markPng(size, inset = 0) {
  if (markLetters) return sharp(ringSvg(size, inset)).png().toBuffer();
  const pad = Math.round(size * (0.1 + inset));
  const logo = await sharp(path.join(OUT, markImage.replace(/^\//, ""))).resize(size - pad * 2, size - pad * 2, { fit: "inside" }).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: NAVY } }).composite([{ input: logo, gravity: "centre" }]).png().toBuffer();
}

/** 32-bit DIB for an ICO entry: header, bottom-up BGRA rows, empty AND mask. */
function dib(size, rgba) {
  const header = Buffer.alloc(40);
  header.writeUInt32LE(40, 0);
  header.writeInt32LE(size, 4);
  header.writeInt32LE(size * 2, 8);
  header.writeUInt16LE(1, 12);
  header.writeUInt16LE(32, 14);
  header.writeUInt32LE(0, 16);
  header.writeUInt32LE(size * size * 4, 20);
  const px = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    const src = (size - 1 - y) * size * 4;
    const dst = y * size * 4;
    for (let x = 0; x < size; x++) {
      px[dst + x * 4 + 0] = rgba[src + x * 4 + 2];
      px[dst + x * 4 + 1] = rgba[src + x * 4 + 1];
      px[dst + x * 4 + 2] = rgba[src + x * 4 + 0];
      px[dst + x * 4 + 3] = rgba[src + x * 4 + 3];
    }
  }
  const mask = Buffer.alloc(((size + 31) >> 5) * 4 * size);
  return Buffer.concat([header, px, mask]);
}

async function ico(sizes) {
  const entries = [];
  for (const s of sizes) {
    const raw = await sharp(await markPng(s)).ensureAlpha().raw().toBuffer();
    entries.push({ s, data: dib(s, raw) });
  }
  const head = Buffer.alloc(6);
  head.writeUInt16LE(0, 0);
  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(entries.length, 4);
  const dirs = [];
  let offset = 6 + 16 * entries.length;
  for (const e of entries) {
    const d = Buffer.alloc(16);
    d.writeUInt8(e.s === 256 ? 0 : e.s, 0);
    d.writeUInt8(e.s === 256 ? 0 : e.s, 1);
    d.writeUInt8(0, 2);
    d.writeUInt8(0, 3);
    d.writeUInt16LE(1, 4);
    d.writeUInt16LE(32, 6);
    d.writeUInt32LE(e.data.length, 8);
    d.writeUInt32LE(offset, 12);
    offset += e.data.length;
    dirs.push(d);
  }
  return Buffer.concat([head, ...dirs, ...entries.map((e) => e.data)]);
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

async function og() {
  // The hero photo, cropped to 1200x630, darkened at the foot, with the
  // parish name set in the display face sharp can find on this machine.
  const photo = await sharp(path.join(OUT, heroRel.replace(/^\//, ""))).resize(1200, 630, { fit: "cover", position: "attention" }).toBuffer();
  const line2 = `${city}, Michigan${founded ? ` · Since ${founded}` : ""}`.toUpperCase();
  const size = name.length > 28 ? 56 : 72;
  const overlay = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0.35" stop-color="${NAVY}" stop-opacity="0"/><stop offset="1" stop-color="${NAVY}" stop-opacity="0.95"/></linearGradient></defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <text x="72" y="500" font-family="${SERIF}" font-size="${size}" font-weight="600" fill="#f4eddf">${esc(name)}</text>
  <text x="72" y="556" font-family="Helvetica, Arial, sans-serif" font-size="30" letter-spacing="4" fill="${GOLD}">${esc(line2)}</text>
</svg>`);
  await sharp(photo).composite([{ input: overlay }]).jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(OUT, "og.jpg"));
}

fs.writeFileSync(path.join(OUT, "favicon.ico"), await ico([48, 32, 16]));
fs.writeFileSync(path.join(OUT, "apple-icon.png"), await markPng(180));
fs.writeFileSync(path.join(OUT, "icon-192.png"), await markPng(192));
fs.writeFileSync(path.join(OUT, "icon-512.png"), await markPng(512));
fs.writeFileSync(path.join(OUT, "icon-512-maskable.png"), await markPng(512, 0.16));
if (markLetters) fs.writeFileSync(path.join(OUT, "icon.svg"), ringSvg(100));
else fs.writeFileSync(path.join(OUT, "icon.svg"), Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><image href="data:image/png;base64,${(await markPng(100)).toString("base64")}" width="100" height="100"/></svg>`));
await og();
console.log(`icons and og written for ${slug}`);
