import type { Client } from "@libsql/client";
import { SCHEMA_STATEMENTS } from "./schema";
import { BARBERS, LAST_MINUTE_RULE, LOCATIONS, PLANS, SERVICES, mapsQueryUrl } from "./seed-data";

/**
 * Creează tabelele și, dacă baza e goală, pune datele de referință.
 *
 * Rulează o singură dată per instanță de server, la prima interogare, ca
 * aplicația să funcționeze pe o bază Turso proaspătă fără niciun pas manual.
 * Toate instrucțiunile sunt idempotente: `CREATE TABLE IF NOT EXISTS` pentru
 * schemă și `INSERT OR IGNORE` pentru date, deci două porniri simultane nu pot
 * produce dubluri și nicio rulare nu suprascrie ce e deja în bază.
 *
 * Se poate opri complet cu RETRO_SKIP_BOOTSTRAP=1.
 */
export async function bootstrap(db: Client): Promise<void> {
  for (const statement of SCHEMA_STATEMENTS) {
    await db.execute(statement);
  }

  const existing = await db.execute("SELECT COUNT(*) AS c FROM locations");
  if (Number(existing.rows[0]?.c ?? 0) > 0) return;

  await db.batch(
    [
      ...LOCATIONS.map((l) => ({
        sql: `INSERT OR IGNORE INTO locations
                (id, slug, name, short_name, address, district, phone, lat, lng,
                 maps_url, review_url, opens_at, closes_at, closed_days, sort_order, active)
              VALUES (?,?,?,?,?,?,?,?,?,?,?,600,1260,'0',?,1)`,
        args: [
          l.id, l.slug, l.name, l.shortName, l.address, l.district, l.phone,
          l.lat, l.lng, mapsQueryUrl(l), mapsQueryUrl(l), l.sortOrder,
        ],
      })),
      ...BARBERS.map((b) => ({
        sql: `INSERT OR IGNORE INTO barbers (id, location_id, name, role, sort_order, active)
              VALUES (?,?,?,'Barber',?,1)`,
        args: [b.id, b.locationId, b.name, b.sortOrder],
      })),
      ...SERVICES.map((s) => ({
        sql: `INSERT OR IGNORE INTO services
                (id, slug, name, description, price, duration_min, category, popular, sort_order, active)
              VALUES (?,?,?,?,?,?,?,?,?,1)`,
        args: [s.id, s.slug, s.name, s.description, s.price, s.durationMin, s.category, s.popular, s.sortOrder],
      })),
      ...PLANS.map((p) => ({
        sql: `INSERT OR IGNORE INTO membership_plans
                (id, slug, name, tagline, sessions, period_months, discount_pct, perks, popular, sort_order, active)
              VALUES (?,?,?,?,?,12,?,?,?,?,1)`,
        args: [p.id, p.slug, p.name, p.tagline, p.sessions, p.discountPct, JSON.stringify(p.perks), p.popular, p.sortOrder],
      })),
      {
        sql: `INSERT OR IGNORE INTO last_minute_rules
                (id, location_id, discount_pct, min_lead_min, max_lead_min, active)
              VALUES (?, NULL, ?, ?, ?, 1)`,
        args: [
          LAST_MINUTE_RULE.id, LAST_MINUTE_RULE.discountPct,
          LAST_MINUTE_RULE.minLeadMin, LAST_MINUTE_RULE.maxLeadMin,
        ],
      },
    ],
    "write",
  );
}
