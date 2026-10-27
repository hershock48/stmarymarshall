/**
 * The icon set and the link card, rendered from one source rather than drawn
 * beside it (glaze/standards.md).
 *
 * The mark is the parish's own: the ring-and-M from its eCatholic favicon
 * (components/Mark.tsx), in gold on navy, full bleed, no corner radius,
 * corners in the icon's own background. The ring stroke is 7 units of 100,
 * so at 16px it is just over a pixel; at 48 and up it is comfortable.
 *
 *   node tools/icons.mjs
 *
 * Writes app/favicon.ico (48/32/16 as 32-bit DIBs, the format Next 16's
 * build accepts), app/apple-icon.png (180), public/icon-192.png,
 * public/icon-512.png, public/icon-512-maskable.png (mark in the middle
 * 68%), and public/og.jpg (1200x630: the nave photo with the parish name).
 *
 * sharp only, no browser: the mark is an SVG string, so sharp rasterizes it
 * directly and the ICO is packed from the raw pixels.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const NAVY = "#0e1a2b";
const GOLD = "#d6b25a";

function markSvg(size, inset = 0) {
  // inset: fraction of the canvas left empty on each side (0.16 for maskable).
  const s = size * (1 - inset * 2);
  const o = size * inset;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${NAVY}"/>
  <g transform="translate(${o} ${o}) scale(${s / 100})" fill="none" stroke="${GOLD}" stroke-linejoin="miter">
    <g transform="translate(5 5) scale(0.9)">
      <circle cx="50" cy="50" r="45" stroke-width="7"/>
      <path d="M22 79V21L50 60L78 21V79" stroke-width="8"/>
    </g>
  </g>
</svg>`);
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
    const raw = await sharp(markSvg(s)).ensureAlpha().raw().toBuffer();
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

async function og() {
  // The nave photo, cropped to 1200x630, darkened at the foot, with the
  // parish name set in the display face sharp can find on this machine.
  const src = path.join(ROOT, "public/img/nave-easter.jpg");
  const photo = await sharp(src).resize(1200, 630, { fit: "cover", position: "attention" }).toBuffer();
  const overlay = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0.35" stop-color="${NAVY}" stop-opacity="0"/><stop offset="1" stop-color="${NAVY}" stop-opacity="0.95"/></linearGradient></defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <text x="72" y="500" font-family="Georgia, 'Times New Roman', serif" font-size="72" font-weight="600" fill="#f4eddf">St. Mary Catholic Church</text>
  <text x="72" y="556" font-family="Helvetica, Arial, sans-serif" font-size="30" letter-spacing="4" fill="${GOLD}">MARSHALL, MICHIGAN · SINCE 1852</text>
</svg>`);
  await sharp(photo).composite([{ input: overlay }]).jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(ROOT, "public/og.jpg"));
}

fs.writeFileSync(path.join(ROOT, "app/favicon.ico"), await ico([48, 32, 16]));
await sharp(markSvg(180)).png().toFile(path.join(ROOT, "app/apple-icon.png"));
await sharp(markSvg(192)).png().toFile(path.join(ROOT, "public/icon-192.png"));
await sharp(markSvg(512)).png().toFile(path.join(ROOT, "public/icon-512.png"));
await sharp(markSvg(512, 0.16)).png().toFile(path.join(ROOT, "public/icon-512-maskable.png"));
fs.writeFileSync(path.join(ROOT, "public/icon.svg"), markSvg(100));
await og();
console.log("icons and og written");
