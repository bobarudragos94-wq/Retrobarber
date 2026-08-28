import { NextResponse, type NextRequest } from "next/server";
import { all, db, one, run } from "@/lib/db";
import { id, normalizePhone, publicCode } from "@/lib/id";
import type { LastMinuteRule } from "@/lib/availability";
import { MIN_LEAD_MIN } from "@/lib/config";
import { nowMinutes, todayISO, weekday } from "@/lib/time";
import type { Barber, Location, Service } from "@/lib/types";

export const dynamic = "force-dynamic";

type Body = {
  name?: string;
  phone?: string;
  locationId?: string;
  barberId?: string;
  serviceId?: string;
  date?: string;
  startMin?: number;
  source?: string;
  notes?: string;
  preferredTimeMin?: number;
  remember?: boolean;
};

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return bad("Cerere invalidă.");
  }

  const name = (body.name ?? "").trim();
  if (name.length < 2) return bad("Spune-ne cum te cheamă.");
  if (name.length > 80) return bad("Numele este prea lung.");

  const phone = normalizePhone(body.phone ?? "");
  if (!phone) return bad("Numărul de telefon nu pare valid (ex: 07xx xxx xxx).");

  const date = body.date ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return bad("Dată invalidă.");

  const startMin = Number(body.startMin);
  if (!Number.isInteger(startMin) || startMin < 0 || startMin > 1440) return bad("Oră invalidă.");

  const [service, barber] = await Promise.all([
    one<Service>("SELECT * FROM services WHERE id = ? AND active = 1", [body.serviceId ?? ""]),
    one<Barber>("SELECT * FROM barbers WHERE id = ? AND active = 1", [body.barberId ?? ""]),
  ]);
  if (!service) return bad("Serviciul selectat nu mai este disponibil.");
  if (!barber) return bad("Frizerul selectat nu mai este disponibil.");

  const location = await one<Location>("SELECT * FROM locations WHERE id = ? AND active = 1", [
    barber.location_id,
  ]);
  if (!location) return bad("Locația nu mai este disponibilă.");

  const endMin = startMin + service.duration_min;
  const today = todayISO();

  if (date < today) return bad("Nu poți rezerva în trecut.");
  if (location.closed_days.split(",").filter(Boolean).map(Number).includes(weekday(date))) {
    return bad("Salonul este închis în ziua selectată.");
  }
  if (startMin < location.opens_at || endMin > location.closes_at) {
    return bad("Intervalul ales este în afara programului.");
  }
  if (date === today && startMin < nowMinutes() + MIN_LEAD_MIN) {
    return bad("Slotul ales a trecut. Alege altul, te rugăm.");
  }

  // Blocare temporala punctuala (concediu / pauza)
  const off = await all<{ c: number }>(
    `SELECT COUNT(*) AS c FROM time_off
     WHERE date = ? AND (barber_id = ? OR (barber_id IS NULL AND location_id = ?))
       AND start_min < ? AND ? < end_min`,
    [date, barber.id, location.id, endMin, startMin],
  );
  if (Number(off[0]?.c ?? 0) > 0) return bad("Frizerul nu este disponibil în acel interval.");

  // Pretul se recalculeaza mereu pe server.
  const basePrice = service.price;
  let discountPct = 0;
  if (body.source === "last_minute") {
    const rule = await one<LastMinuteRule>(
      `SELECT * FROM last_minute_rules WHERE active = 1 AND (location_id = ? OR location_id IS NULL)
       ORDER BY location_id IS NULL LIMIT 1`,
      [location.id],
    );
    const now = nowMinutes();
    if (
      rule &&
      date === today &&
      startMin >= now + rule.min_lead_min &&
      startMin <= now + rule.max_lead_min
    ) {
      discountPct = rule.discount_pct;
    }
  }
  const price = Math.round((basePrice * (100 - discountPct)) / 100);

  const apptId = id("apt");
  const code = publicCode();
  const source = ["web", "quick", "last_minute", "subscription"].includes(body.source ?? "")
    ? (body.source as string)
    : "web";

  // Verificare + inserare in aceeasi tranzactie, ca sa nu se dubleze slotul.
  const tx = await db.transaction("write");
  try {
    const clash = await tx.execute({
      sql: `SELECT COUNT(*) AS c FROM appointments
            WHERE barber_id = ? AND date = ? AND status = 'confirmed'
              AND start_min < ? AND ? < end_min`,
      args: [barber.id, date, endMin, startMin],
    });
    if (Number(clash.rows[0]?.c ?? 0) > 0) {
      await tx.rollback();
      return NextResponse.json(
        { ok: false, error: "Cineva tocmai a ocupat acest interval. Alege alt slot.", code: "SLOT_TAKEN" },
        { status: 409 },
      );
    }

    await tx.execute({
      sql: `INSERT INTO appointments
        (id, public_code, customer_name, phone, location_id, barber_id, service_id, date,
         start_min, end_min, price, base_price, discount_pct, source, status, notes)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?, 'confirmed', ?)`,
      args: [
        apptId, code, name, phone, location.id, barber.id, service.id, date,
        startMin, endMin, price, basePrice, discountPct, source,
        (body.notes ?? "").slice(0, 400) || null,
      ],
    });
    await tx.commit();
  } catch (err) {
    try { await tx.rollback(); } catch { /* deja inchisa */ }
    console.error("book failed", err);
    return bad("Nu am putut salva rezervarea. Încearcă din nou.", 500);
  }

  // Profil + preferinte (fara cont, cheia e numarul de telefon).
  if (body.remember !== false) {
    const prefTime = Number.isInteger(body.preferredTimeMin) ? body.preferredTimeMin : startMin;
    const existing = await one<{ id: string }>("SELECT id FROM customers WHERE phone = ?", [phone]);
    if (existing) {
      await run(
        `UPDATE customers SET name = ?, pref_location_id = ?, pref_barber_id = ?, pref_service_id = ?,
           pref_time_min = ?, visits_count = visits_count + 1, updated_at = datetime('now')
         WHERE id = ?`,
        [name, location.id, barber.id, service.id, prefTime, existing.id],
      );
      await run("UPDATE appointments SET customer_id = ? WHERE id = ?", [existing.id, apptId]);
    } else {
      const custId = id("cus");
      await run(
        `INSERT INTO customers (id, phone, name, pref_location_id, pref_barber_id, pref_service_id, pref_time_min, visits_count)
         VALUES (?,?,?,?,?,?,?,1)`,
        [custId, phone, name, location.id, barber.id, service.id, prefTime],
      );
      await run("UPDATE appointments SET customer_id = ? WHERE id = ?", [custId, apptId]);
    }
  }

  return NextResponse.json({
    ok: true,
    code,
    appointment: {
      code, date, startMin, endMin, price, basePrice, discountPct,
      locationName: location.short_name,
      barberName: barber.name,
      serviceName: service.name,
    },
  });
}
