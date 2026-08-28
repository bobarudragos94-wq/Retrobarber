export const lei = (n: number) => `${n} lei`;

export const prettyPhone = (p: string) =>
  p.replace(/^(\d{4})(\d{3})(\d{3})$/, "$1 $2 $3");

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Culoare de avatar derivata determinist din nume. */
export function avatarTint(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return `hsl(${(h % 60) + 20} 42% 22%)`;
}

export const partOfDay = (min: number) =>
  min < 12 * 60 ? "dimineața" : min < 17 * 60 ? "după-amiaza" : "seara";
