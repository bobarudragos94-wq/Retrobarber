export const TZ = "Europe/Bucharest";

const dateFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const timeFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** YYYY-MM-DD in fusul orar al Bucurestiului */
export function todayISO(now: Date = new Date()): string {
  return dateFmt.format(now);
}

/** Minute de la miezul noptii, ora Bucurestiului */
export function nowMinutes(now: Date = new Date()): number {
  const [h, m] = timeFmt.format(now).split(":").map(Number);
  return h * 60 + m;
}

/** Adauga zile peste un ISO date, fara drift de fus orar */
export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

/** 0 = duminica … 6 = sambata */
export function weekday(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function diffDays(fromISO: string, toISO: string): number {
  const a = Date.parse(`${fromISO}T00:00:00Z`);
  const b = Date.parse(`${toISO}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

export function hhmm(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function parseHHMM(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + (m || 0);
}

const RO_DAYS = ["Duminică", "Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă"];
const RO_DAYS_SHORT = ["Dum", "Lun", "Mar", "Mie", "Joi", "Vin", "Sâm"];
const RO_MONTHS = [
  "ianuarie", "februarie", "martie", "aprilie", "mai", "iunie",
  "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie",
];

export function dayName(iso: string, short = false): string {
  return (short ? RO_DAYS_SHORT : RO_DAYS)[weekday(iso)];
}

export function dayNumber(iso: string): number {
  return Number(iso.slice(8, 10));
}

/** „azi” / „mâine” / „Joi, 4 septembrie” */
export function relativeDay(iso: string, today = todayISO()): string {
  const d = diffDays(today, iso);
  if (d === 0) return "azi";
  if (d === 1) return "mâine";
  if (d === 2) return "poimâine";
  return `${dayName(iso)}, ${dayNumber(iso)} ${RO_MONTHS[Number(iso.slice(5, 7)) - 1]}`;
}

export function longDate(iso: string): string {
  return `${dayName(iso)}, ${dayNumber(iso)} ${RO_MONTHS[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`;
}

/** Date-ul UTC corespunzator unui slot local (pentru .ics / calendar) */
export function toUTCDate(iso: string, minutes: number): Date {
  const [y, m, d] = iso.split("-").map(Number);
  // Offset-ul Bucurestiului pentru ziua respectiva (EET/EEST)
  const guess = new Date(Date.UTC(y, m - 1, d, Math.floor(minutes / 60), minutes % 60));
  const offset = tzOffsetMinutes(guess);
  return new Date(guess.getTime() - offset * 60_000);
}

function tzOffsetMinutes(at: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const parts = Object.fromEntries(
    dtf.formatToParts(at).filter((p) => p.type !== "literal").map((p) => [p.type, p.value]),
  ) as Record<string, string>;
  const asUTC = Date.UTC(
    Number(parts.year), Number(parts.month) - 1, Number(parts.day),
    Number(parts.hour) % 24, Number(parts.minute), Number(parts.second),
  );
  return (asUTC - at.getTime()) / 60_000;
}
