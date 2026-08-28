import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { SCHEMA_STATEMENTS } from "../src/lib/schema";
import {
  BARBERS, LAST_MINUTE_RULE, LOCATIONS, PLANS, SERVICES, mapsQueryUrl,
} from "../src/lib/seed-data";

/**
 * Regenerează db/setup.sql din aceleași surse pe care le folosește aplicația,
 * ca fișierul să nu poată rămâne în urmă față de cod.
 *
 * Fiecare instrucțiune e numerotată și separată, fiindcă unele console SQL
 * (inclusiv cea din dashboard-ul Turso) rulează o singură instrucțiune odată.
 */

const q = (v: string | number | null) =>
  v === null ? "NULL" : typeof v === "number" ? String(v) : `'${v.replace(/'/g, "''")}'`;

const statements: string[] = [...SCHEMA_STATEMENTS];

statements.push(
  "INSERT OR REPLACE INTO locations (id, slug, name, short_name, address, district, phone, lat, lng, maps_url, review_url, opens_at, closes_at, closed_days, sort_order, active) VALUES\n" +
    LOCATIONS.map((l) =>
      `  (${[q(l.id), q(l.slug), q(l.name), q(l.shortName), q(l.address), q(l.district), q(l.phone),
        q(l.lat), q(l.lng), q(mapsQueryUrl(l)), q(mapsQueryUrl(l)), "600", "1260", "'0'", q(l.sortOrder), "1"].join(", ")})`,
    ).join(",\n"),
);

statements.push(
  "INSERT OR REPLACE INTO barbers (id, location_id, name, role, sort_order, active) VALUES\n" +
    BARBERS.map((b) => `  (${[q(b.id), q(b.locationId), q(b.name), "'Barber'", q(b.sortOrder), "1"].join(", ")})`).join(",\n"),
);

statements.push(
  "INSERT OR REPLACE INTO services (id, slug, name, description, price, duration_min, category, popular, sort_order, active) VALUES\n" +
    SERVICES.map((s) =>
      `  (${[q(s.id), q(s.slug), q(s.name), q(s.description), q(s.price), q(s.durationMin),
        q(s.category), q(s.popular), q(s.sortOrder), "1"].join(", ")})`,
    ).join(",\n"),
);

statements.push(
  "INSERT OR REPLACE INTO membership_plans (id, slug, name, tagline, sessions, period_months, discount_pct, perks, popular, sort_order, active) VALUES\n" +
    PLANS.map((p) =>
      `  (${[q(p.id), q(p.slug), q(p.name), q(p.tagline), q(p.sessions), "12", q(p.discountPct),
        q(JSON.stringify(p.perks)), q(p.popular), q(p.sortOrder), "1"].join(", ")})`,
    ).join(",\n"),
);

statements.push(
  "INSERT OR REPLACE INTO last_minute_rules (id, location_id, discount_pct, min_lead_min, max_lead_min, active) VALUES\n" +
    `  (${[q(LAST_MINUTE_RULE.id), "NULL", q(LAST_MINUTE_RULE.discountPct),
      q(LAST_MINUTE_RULE.minLeadMin), q(LAST_MINUTE_RULE.maxLeadMin), "1"].join(", ")})`,
);

const header = `-- ============================================================
--  Retro Barbershop — creare bază de date
--
--  De obicei nu ai nevoie de acest fișier: aplicația își creează
--  singură tabelele și datele la prima pornire, dacă baza e goală.
--  Îl folosești doar dacă vrei să faci pasul manual.
--
--  ATENȚIE: unele console SQL rulează o singură instrucțiune odată.
--  Dacă primești "no such table", înseamnă că blocul cu tabele nu a
--  fost aplicat — rulează instrucțiunile una câte una, în ordine.
--
--  Se poate rula de mai multe ori: tabelele se creează doar dacă
--  lipsesc, iar datele de referință se suprascriu. Programările,
--  clienții și abonamentele nu sunt atinse.
--
--  Generat de: npx tsx scripts/gen-sql.ts — nu edita manual.
-- ============================================================
`;

const body = statements
  .map((s, i) => `\n-- ---------- ${i + 1} / ${statements.length} ----------\n${s};`)
  .join("\n");

const footer = `

-- ---------- verificare ----------
SELECT 'locatii' AS tabel, COUNT(*) AS randuri FROM locations
UNION ALL SELECT 'frizeri',    COUNT(*) FROM barbers
UNION ALL SELECT 'servicii',   COUNT(*) FROM services
UNION ALL SELECT 'abonamente', COUNT(*) FROM membership_plans
UNION ALL SELECT 'reguli',     COUNT(*) FROM last_minute_rules;
`;

writeFileSync(join(process.cwd(), "db", "setup.sql"), header + body + footer);
console.log(`✓ db/setup.sql regenerat — ${statements.length} instrucțiuni.`);
