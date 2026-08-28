import {
  BARBERS, LAST_MINUTE_RULE, LOCATIONS, PLANS, SERVICES, mapsQueryUrl,
} from "../src/lib/seed-data";
import { client } from "./_client";

/**
 * Populează baza cu datele de referință și, în plus, cu rezervări demo,
 * ca disponibilitatea să arate realist în dezvoltare.
 * Rezervările demo au source='seed' și nu au ce căuta în producție.
 */
async function main() {
  const db = client();
  const demo = !process.argv.includes("--no-demo");

  for (const sql of [
    "DELETE FROM appointments", "DELETE FROM memberships", "DELETE FROM customers",
    "DELETE FROM time_off", "DELETE FROM barbers", "DELETE FROM services",
    "DELETE FROM membership_plans", "DELETE FROM last_minute_rules", "DELETE FROM locations",
  ]) {
    await db.execute(sql);
  }

  for (const l of LOCATIONS) {
    await db.execute({
      sql: `INSERT INTO locations
              (id, slug, name, short_name, address, district, phone, lat, lng,
               maps_url, review_url, opens_at, closes_at, closed_days, sort_order, active)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,600,1260,'0',?,1)`,
      args: [l.id, l.slug, l.name, l.shortName, l.address, l.district, l.phone,
        l.lat, l.lng, mapsQueryUrl(l), mapsQueryUrl(l), l.sortOrder],
    });
  }

  for (const b of BARBERS) {
    await db.execute({
      sql: `INSERT INTO barbers (id, location_id, name, role, sort_order, active)
            VALUES (?,?,?,'Barber',?,1)`,
      args: [b.id, b.locationId, b.name, b.sortOrder],
    });
  }

  for (const s of SERVICES) {
    await db.execute({
      sql: `INSERT INTO services
              (id, slug, name, description, price, duration_min, category, popular, sort_order, active)
            VALUES (?,?,?,?,?,?,?,?,?,1)`,
      args: [s.id, s.slug, s.name, s.description, s.price, s.durationMin, s.category, s.popular, s.sortOrder],
    });
  }

  for (const p of PLANS) {
    await db.execute({
      sql: `INSERT INTO membership_plans
              (id, slug, name, tagline, sessions, period_months, discount_pct, perks, popular, sort_order, active)
            VALUES (?,?,?,?,?,12,?,?,?,?,1)`,
      args: [p.id, p.slug, p.name, p.tagline, p.sessions, p.discountPct,
        JSON.stringify(p.perks), p.popular, p.sortOrder],
    });
  }

  await db.execute({
    sql: `INSERT INTO last_minute_rules (id, location_id, discount_pct, min_lead_min, max_lead_min, active)
          VALUES (?, NULL, ?, ?, ?, 1)`,
    args: [LAST_MINUTE_RULE.id, LAST_MINUTE_RULE.discountPct,
      LAST_MINUTE_RULE.minLeadMin, LAST_MINUTE_RULE.maxLeadMin],
  });

  let demoCount = 0;
  if (demo) {
    const today = new Date();
    const iso = (offset: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offset);
      return d.toISOString().slice(0, 10);
    };
    for (let day = 0; day < 7; day++) {
      const date = iso(day);
      if (new Date(`${date}T00:00:00Z`).getUTCDay() === 0) continue;
      for (const b of BARBERS) {
        const seed = (b.id.length * 31 + day * 17 + demoCount) % 11;
        for (const start of [600 + seed * 30, 780 + ((seed * 7) % 5) * 45, 1020 + ((seed * 3) % 4) * 30]) {
          if (start + 45 > 1260) continue;
          demoCount++;
          if (demoCount % 3 === 0) continue;
          await db.execute({
            sql: `INSERT INTO appointments
                    (id, public_code, customer_name, phone, location_id, barber_id, service_id,
                     date, start_min, end_min, price, base_price, discount_pct, source, status)
                  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,0,'seed','confirmed')`,
            args: [`apt_seed_${demoCount}`, `RB${10000 + demoCount}`, "Rezervare existentă",
              "0700000000", b.locationId, b.id, "svc_tuns_clasic", date, start, start + 40, 55, 55],
          });
        }
      }
    }
  }

  console.log(
    `✓ ${LOCATIONS.length} locații, ${BARBERS.length} frizeri, ${SERVICES.length} servicii, ` +
    `${PLANS.length} abonamente` + (demo ? `, ${demoCount} rezervări demo.` : "."),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
