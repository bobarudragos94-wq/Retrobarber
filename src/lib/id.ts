import { randomUUID, randomInt } from "node:crypto";

export function id(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 20)}`;
}

const ALPHABET = "ACDEFGHJKLMNPQRTUVWXY3479";

/** Cod scurt, usor de citit la telefon: RB-7KQ4X */
export function publicCode(): string {
  let out = "";
  for (let i = 0; i < 5; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return `RB-${out}`;
}

export function normalizePhone(input: string): string | null {
  const digits = input.replace(/[^\d+]/g, "");
  const local = digits.replace(/^(\+4|0040|40)/, "");
  const n = local.startsWith("0") ? local : `0${local}`;
  return /^07\d{8}$/.test(n) ? n : null;
}
