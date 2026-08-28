/**
 * Generator de iconițe PNG pentru PWA — fără dependențe externe.
 * Desenează un pătrat rotunjit închis, cu inel auriu și banda barber pole.
 */
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

type RGBA = [number, number, number, number];

const INK: RGBA = [10, 10, 11, 255];
const GOLD: RGBA = [217, 171, 85, 255];
const GOLD_HI: RGBA = [242, 215, 154, 255];
const CREAM: RGBA = [245, 241, 232, 255];
const RED: RGBA = [200, 64, 47, 255];
const BLUE: RGBA = [47, 95, 200, 255];

function crc32(buf: Buffer): number {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function png(width: number, height: number, pixels: Uint8Array): Buffer {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter: none
    Buffer.from(pixels.buffer, y * width * 4, width * 4).copy(raw, y * (width * 4 + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/** Distanta semnata fata de un dreptunghi rotunjit centrat. */
function sdRoundRect(px: number, py: number, half: number, r: number): number {
  const qx = Math.abs(px) - half + r;
  const qy = Math.abs(py) - half + r;
  const ax = Math.max(qx, 0);
  const ay = Math.max(qy, 0);
  return Math.hypot(ax, ay) + Math.min(Math.max(qx, qy), 0) - r;
}

function mix(a: RGBA, b: RGBA, t: number): RGBA {
  const k = Math.min(Math.max(t, 0), 1);
  return [
    Math.round(a[0] + (b[0] - a[0]) * k),
    Math.round(a[1] + (b[1] - a[1]) * k),
    Math.round(a[2] + (b[2] - a[2]) * k),
    Math.round(a[3] + (b[3] - a[3]) * k),
  ];
}

function draw(size: number, maskable: boolean): Uint8Array {
  const px = new Uint8Array(size * size * 4);
  const c = size / 2;
  const pad = maskable ? size * 0.19 : size * 0.045;
  const half = c - pad;
  const radius = maskable ? half : half * 0.28;
  const ringOuter = half * 0.995;
  const ringInner = half * 0.90;
  const poleHalfW = half * 0.30;
  const poleHalfH = half * 0.60;
  const stripe = size * 0.085;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x + 0.5 - c;
      const dy = y + 0.5 - c;
      let color: RGBA = [0, 0, 0, 0];

      // fundalul aplicatiei (maskable umple tot)
      const bgHalf = maskable ? c : half;
      const bgRadius = maskable ? 0 : radius;
      const dBg = sdRoundRect(dx, dy, bgHalf, bgRadius);
      if (dBg < 1) {
        const grad = mix(INK, [24, 24, 30, 255], (y / size) * 0.9);
        color = blend(color, grad, clamp01(0.5 - dBg));
      }

      // inel auriu
      const dOuter = sdRoundRect(dx, dy, ringOuter, radius * 0.95);
      const dInner = sdRoundRect(dx, dy, ringInner, radius * 0.86);
      const ring = Math.min(clamp01(0.5 - dOuter), clamp01(0.5 + dInner));
      if (ring > 0) {
        const g = mix(GOLD_HI, GOLD, (x + y) / (size * 2));
        color = blend(color, g, ring);
      }

      // banda barber pole in centru
      const dPole = sdRoundRectXY(dx, dy, poleHalfW, poleHalfH, poleHalfW * 0.42);
      const poleMask = clamp01(0.5 - dPole);
      if (poleMask > 0) {
        const band = Math.floor((((x + y) % (stripe * 4)) + stripe * 4) % (stripe * 4) / stripe);
        const col: RGBA = band === 0 ? RED : band === 2 ? BLUE : CREAM;
        color = blend(color, col, poleMask);
      }

      const o = (y * size + x) * 4;
      px[o] = color[0]; px[o + 1] = color[1]; px[o + 2] = color[2]; px[o + 3] = color[3];
    }
  }
  return px;
}

function sdRoundRectXY(px: number, py: number, hx: number, hy: number, r: number): number {
  const qx = Math.abs(px) - hx + r;
  const qy = Math.abs(py) - hy + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}

function clamp01(v: number) { return Math.min(Math.max(v, 0), 1); }

function blend(dst: RGBA, src: RGBA, alpha: number): RGBA {
  const a = clamp01(alpha) * (src[3] / 255);
  const outA = a + (dst[3] / 255) * (1 - a);
  if (outA === 0) return [0, 0, 0, 0];
  return [
    Math.round((src[0] * a + dst[0] * (dst[3] / 255) * (1 - a)) / outA),
    Math.round((src[1] * a + dst[1] * (dst[3] / 255) * (1 - a)) / outA),
    Math.round((src[2] * a + dst[2] * (dst[3] / 255) * (1 - a)) / outA),
    Math.round(outA * 255),
  ];
}

const out = join(process.cwd(), "public", "icons");
mkdirSync(out, { recursive: true });

const targets: Array<[string, number, boolean]> = [
  ["icon-192.png", 192, false],
  ["icon-512.png", 512, false],
  ["maskable-192.png", 192, true],
  ["maskable-512.png", 512, true],
  ["apple-touch-icon.png", 180, true],
  ["favicon-32.png", 32, false],
];

for (const [name, size, maskable] of targets) {
  writeFileSync(join(out, name), png(size, size, draw(size, maskable)));
  console.log(`✓ icons/${name} (${size}px)`);
}
