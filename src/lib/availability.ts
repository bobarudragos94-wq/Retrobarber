import { all } from "./db";
import type { Barber, Location, Service, Slot } from "./types";
import { addDays, diffDays, nowMinutes, todayISO, weekday } from "./time";
import { MIN_LEAD_MIN, SLOT_STEP } from "./config";

export { MIN_LEAD_MIN, SLOT_STEP } from "./config";

type Busy = { barber_id: string; date: string; start_min: number; end_min: number };
type Off = { barber_id: string | null; location_id: string | null; date: string; start_min: number; end_min: number };

export type SlotQuery = {
  locationId?: string;
  barberId?: string;
  serviceId?: string;
  from?: string;
  days?: number;
  /** filtreaza slot-urile la un interval orar */
  minTime?: number;
  maxTime?: number;
  limitPerDay?: number;
};

export type Catalog = {
  locations: Location[];
  barbers: Barber[];
  services: Service[];
};

export async function loadCatalog(): Promise<Catalog> {
  const [locations, barbers, services] = await Promise.all([
    all<Location>("SELECT * FROM locations WHERE active = 1 ORDER BY sort_order, name"),
    all<Barber>("SELECT * FROM barbers WHERE active = 1 ORDER BY sort_order, name"),
    all<Service>("SELECT * FROM services WHERE active = 1 ORDER BY category DESC, sort_order, price"),
  ]);
  return { locations, barbers, services };
}

function closedOn(loc: Location, iso: string): boolean {
  const days = loc.closed_days.split(",").filter(Boolean).map(Number);
  return days.includes(weekday(iso));
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Genereaza slot-urile libere pe intervalul cerut.
 * Un singur query pentru rezervari + un singur query pentru excluderi.
 */
export async function findSlots(q: SlotQuery, catalog?: Catalog): Promise<Slot[]> {
  const cat = catalog ?? (await loadCatalog());
  const from = q.from ?? todayISO();
  const days = Math.min(Math.max(q.days ?? 14, 1), 60);
  const to = addDays(from, days - 1);

  const service =
    cat.services.find((s) => s.id === q.serviceId) ??
    cat.services.find((s) => s.popular === 1) ??
    cat.services[0];
  if (!service) return [];

  let barbers = cat.barbers;
  if (q.barberId) barbers = barbers.filter((b) => b.id === q.barberId);
  if (q.locationId) barbers = barbers.filter((b) => b.location_id === q.locationId);
  if (!barbers.length) return [];

  const barberIds = barbers.map((b) => b.id);
  const placeholders = barberIds.map(() => "?").join(",");

  const [busy, offs] = await Promise.all([
    all<Busy>(
      `SELECT barber_id, date, start_min, end_min FROM appointments
       WHERE status = 'confirmed' AND date BETWEEN ? AND ? AND barber_id IN (${placeholders})`,
      [from, to, ...barberIds],
    ),
    all<Off>(
      `SELECT barber_id, location_id, date, start_min, end_min FROM time_off
       WHERE date BETWEEN ? AND ?`,
      [from, to],
    ),
  ]);

  const busyByBarberDay = new Map<string, Busy[]>();
  for (const b of busy) {
    const k = `${b.barber_id}|${b.date}`;
    const list = busyByBarberDay.get(k);
    if (list) list.push(b);
    else busyByBarberDay.set(k, [b]);
  }

  const today = todayISO();
  const nowMin = nowMinutes();
  const locById = new Map(cat.locations.map((l) => [l.id, l]));
  const out: Slot[] = [];

  for (let d = 0; d < days; d++) {
    const date = addDays(from, d);
    let perDay = 0;

    for (const barber of barbers) {
      const loc = locById.get(barber.location_id);
      if (!loc || closedOn(loc, date)) continue;

      const dayBusy = busyByBarberDay.get(`${barber.id}|${date}`) ?? [];
      const dayOff = offs.filter(
        (o) =>
          o.date === date &&
          (o.barber_id === barber.id || (!o.barber_id && o.location_id === barber.location_id)),
      );

      const earliest =
        date === today ? Math.max(loc.opens_at, nowMin + MIN_LEAD_MIN) : loc.opens_at;
      const start = Math.ceil(earliest / SLOT_STEP) * SLOT_STEP;

      for (let t = start; t + service.duration_min <= loc.closes_at; t += SLOT_STEP) {
        const end = t + service.duration_min;
        if (q.minTime !== undefined && t < q.minTime) continue;
        if (q.maxTime !== undefined && t > q.maxTime) continue;
        if (dayBusy.some((b) => overlaps(t, end, b.start_min, b.end_min))) continue;
        if (dayOff.some((o) => overlaps(t, end, o.start_min, o.end_min))) continue;

        out.push({
          date,
          startMin: t,
          endMin: end,
          barberId: barber.id,
          barberName: barber.name,
          locationId: loc.id,
          locationName: loc.short_name,
          serviceId: service.id,
          price: service.price,
          basePrice: service.price,
          discountPct: 0,
        });
        perDay++;
        if (q.limitPerDay && perDay >= q.limitPerDay) break;
      }
    }
  }

  out.sort((a, b) => (a.date === b.date ? a.startMin - b.startMin : a.date < b.date ? -1 : 1));
  return out;
}

export type SuggestInput = {
  locationId?: string;
  barberId?: string;
  serviceId?: string;
  preferredTimeMin?: number;
  count?: number;
};

/**
 * Cele mai bune N slot-uri pentru un client, in functie de preferinte.
 * Scor = apropiere de ora preferata + cat de curand + potrivire frizer/locatie.
 */
export async function suggestSlots(input: SuggestInput, catalog?: Catalog): Promise<Slot[]> {
  const cat = catalog ?? (await loadCatalog());
  const count = input.count ?? 3;
  const prefTime = input.preferredTimeMin;

  // Cautam intai strict pe preferinte; daca nu iese nimic, relaxam progresiv.
  const attempts: SlotQuery[] = [
    { barberId: input.barberId, locationId: input.locationId, serviceId: input.serviceId, days: 10 },
    { locationId: input.locationId, serviceId: input.serviceId, days: 14 },
    { serviceId: input.serviceId, days: 14 },
  ];

  let pool: Slot[] = [];
  let relaxed = 0;
  for (const [i, attempt] of attempts.entries()) {
    if (i > 0 && !input.barberId && !input.locationId) break;
    pool = await findSlots(attempt, cat);
    relaxed = i;
    if (pool.length >= count) break;
  }
  if (!pool.length) return [];

  const today = todayISO();
  const scored = pool.map((slot) => {
    let score = 100;

    // 1. Apropierea de ora preferata (max -40)
    if (prefTime !== undefined) {
      const delta = Math.abs(slot.startMin - prefTime);
      score -= Math.min(delta / 15, 40);
    }

    // 2. Cat de curand (max -30)
    const dayGap = diffDays(today, slot.date);
    score -= Math.min(dayGap * 4, 30);

    // 3. Potrivirea preferintelor
    if (input.barberId && slot.barberId === input.barberId) score += 18;
    if (input.locationId && slot.locationId === input.locationId) score += 10;

    // 4. Orele rotunde sunt mai usor de retinut
    if (slot.startMin % 60 === 0) score += 2;

    return { ...slot, score, reason: buildReason(slot, input, prefTime, dayGap) };
  });

  scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  // Diversitate: trei propuneri care chiar difera intre ele.
  const picked: Slot[] = [];
  const same = (a: Slot, b: Slot) =>
    a.date === b.date && a.startMin === b.startMin && a.barberId === b.barberId;

  const addPass = (strict: boolean) => {
    for (const slot of scored) {
      if (picked.length >= count) return;
      if (picked.some((p) => same(p, slot))) continue;
      const tooClose = picked.some(
        (p) => p.date === slot.date && Math.abs(p.startMin - slot.startMin) < 60,
      );
      if (tooClose) continue;
      // Prima trecere: cel mult o propunere per frizer, ca lista sa nu fie monotona.
      if (strict && !input.barberId && picked.some((p) => p.barberId === slot.barberId)) continue;
      picked.push(slot);
    }
  };

  addPass(true);   // sloturi variate ca frizer si ora
  addPass(false);  // relaxam frizerul unic daca nu s-au strans destule
  if (picked.length < count) {
    for (const slot of scored) {
      if (picked.length >= count) break;
      if (!picked.some((p) => same(p, slot))) picked.push(slot);
    }
  }

  if (relaxed > 0) {
    for (const p of picked) p.reason = p.reason ?? "Cea mai apropiată variantă disponibilă";
  }
  return picked.slice(0, count);
}

function buildReason(slot: Slot, input: SuggestInput, prefTime?: number, dayGap = 0): string {
  if (input.barberId && slot.barberId === input.barberId && dayGap === 0) {
    return `${slot.barberName} e liber azi`;
  }
  if (prefTime !== undefined && Math.abs(slot.startMin - prefTime) <= 30) {
    return "Fix la ora ta preferată";
  }
  if (dayGap === 0) return "Cel mai devreme azi";
  if (dayGap === 1) return prefTime !== undefined ? "Aproape de ora ta" : "Cea mai apropiată oră";
  if (input.barberId && slot.barberId === input.barberId) return `Cu ${slot.barberName}`;
  return `Cu ${slot.barberName}, la ${slot.locationName}`;
}

export type LastMinuteRule = {
  id: string;
  location_id: string | null;
  discount_pct: number;
  min_lead_min: number;
  max_lead_min: number;
};

/** Slot-uri ramase libere AZI, cu reducere. */
export async function findLastMinute(
  opts: { locationId?: string; serviceId?: string; limit?: number } = {},
  catalog?: Catalog,
): Promise<{ slots: Slot[]; discountPct: number }> {
  const cat = catalog ?? (await loadCatalog());
  const rules = await all<LastMinuteRule>(
    "SELECT * FROM last_minute_rules WHERE active = 1",
  );
  const rule =
    rules.find((r) => r.location_id && r.location_id === opts.locationId) ??
    rules.find((r) => !r.location_id) ??
    null;
  if (!rule) return { slots: [], discountPct: 0 };

  const today = todayISO();
  const now = nowMinutes();

  const slots = await findSlots(
    {
      locationId: opts.locationId,
      serviceId: opts.serviceId,
      from: today,
      days: 1,
      minTime: now + rule.min_lead_min,
      maxTime: now + rule.max_lead_min,
    },
    cat,
  );

  // Un singur slot pe frizer, ca lista sa arate variat.
  const seen = new Set<string>();
  const unique: Slot[] = [];
  for (const s of slots) {
    if (seen.has(s.barberId)) continue;
    seen.add(s.barberId);
    unique.push({
      ...s,
      discountPct: rule.discount_pct,
      price: Math.round((s.basePrice * (100 - rule.discount_pct)) / 100),
      reason: `-${rule.discount_pct}% azi`,
    });
    if (opts.limit && unique.length >= opts.limit) break;
  }

  unique.sort((a, b) => a.startMin - b.startMin);
  return { slots: unique, discountPct: rule.discount_pct };
}
