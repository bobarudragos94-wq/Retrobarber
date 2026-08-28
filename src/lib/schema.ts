/**
 * Schema bazei de date, ca listă de instrucțiuni separate.
 *
 * Sursa unică de adevăr: de aici pornesc și migrarea din scripturi, și
 * inițializarea automată la pornirea aplicației, și fișierul db/setup.sql.
 * Toate instrucțiunile sunt idempotente (IF NOT EXISTS), deci pot rula oricând.
 */
export const SCHEMA_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS locations (
  id            TEXT PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  short_name    TEXT NOT NULL,
  address       TEXT NOT NULL,
  district      TEXT NOT NULL,
  phone         TEXT NOT NULL,
  lat           REAL,
  lng           REAL,
  maps_url      TEXT,
  review_url    TEXT,
  opens_at      INTEGER NOT NULL DEFAULT 600,
  closes_at     INTEGER NOT NULL DEFAULT 1260,
  closed_days   TEXT NOT NULL DEFAULT '0',
  sort_order    INTEGER NOT NULL DEFAULT 0,
  active        INTEGER NOT NULL DEFAULT 1
)`,

  `CREATE TABLE IF NOT EXISTS barbers (
  id            TEXT PRIMARY KEY,
  location_id   TEXT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'Barber',
  bio           TEXT,
  avatar_url    TEXT,
  rating        REAL NOT NULL DEFAULT 0,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  active        INTEGER NOT NULL DEFAULT 1
)`,
  `CREATE INDEX IF NOT EXISTS idx_barbers_location ON barbers(location_id)`,

  `CREATE TABLE IF NOT EXISTS services (
  id            TEXT PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  description   TEXT,
  price         INTEGER NOT NULL,
  duration_min  INTEGER NOT NULL,
  category      TEXT NOT NULL DEFAULT 'servicii',
  popular       INTEGER NOT NULL DEFAULT 0,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  active        INTEGER NOT NULL DEFAULT 1
)`,

  `CREATE TABLE IF NOT EXISTS time_off (
  id            TEXT PRIMARY KEY,
  barber_id     TEXT REFERENCES barbers(id) ON DELETE CASCADE,
  location_id   TEXT REFERENCES locations(id) ON DELETE CASCADE,
  date          TEXT NOT NULL,
  start_min     INTEGER NOT NULL DEFAULT 0,
  end_min       INTEGER NOT NULL DEFAULT 1440,
  reason        TEXT
)`,
  `CREATE INDEX IF NOT EXISTS idx_timeoff_date ON time_off(date)`,

  `CREATE TABLE IF NOT EXISTS customers (
  id                TEXT PRIMARY KEY,
  phone             TEXT NOT NULL UNIQUE,
  name              TEXT NOT NULL,
  email             TEXT,
  pref_location_id  TEXT REFERENCES locations(id),
  pref_barber_id    TEXT REFERENCES barbers(id),
  pref_service_id   TEXT REFERENCES services(id),
  pref_time_min     INTEGER,
  visits_count      INTEGER NOT NULL DEFAULT 0,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
)`,

  `CREATE TABLE IF NOT EXISTS appointments (
  id            TEXT PRIMARY KEY,
  public_code   TEXT NOT NULL UNIQUE,
  customer_id   TEXT REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  phone         TEXT NOT NULL,
  location_id   TEXT NOT NULL REFERENCES locations(id),
  barber_id     TEXT NOT NULL REFERENCES barbers(id),
  service_id    TEXT NOT NULL REFERENCES services(id),
  date          TEXT NOT NULL,
  start_min     INTEGER NOT NULL,
  end_min       INTEGER NOT NULL,
  price         INTEGER NOT NULL,
  base_price    INTEGER NOT NULL,
  discount_pct  INTEGER NOT NULL DEFAULT 0,
  source        TEXT NOT NULL DEFAULT 'web',
  status        TEXT NOT NULL DEFAULT 'confirmed',
  notes         TEXT,
  reviewed_at   TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
)`,
  `CREATE INDEX IF NOT EXISTS idx_appt_slot ON appointments(barber_id, date, status)`,
  `CREATE INDEX IF NOT EXISTS idx_appt_date ON appointments(date, location_id)`,
  `CREATE INDEX IF NOT EXISTS idx_appt_phone ON appointments(phone)`,

  `CREATE TABLE IF NOT EXISTS membership_plans (
  id            TEXT PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  tagline       TEXT,
  sessions      INTEGER NOT NULL,
  period_months INTEGER NOT NULL DEFAULT 12,
  discount_pct  INTEGER NOT NULL,
  perks         TEXT,
  popular       INTEGER NOT NULL DEFAULT 0,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  active        INTEGER NOT NULL DEFAULT 1
)`,

  `CREATE TABLE IF NOT EXISTS memberships (
  id                TEXT PRIMARY KEY,
  plan_id           TEXT NOT NULL REFERENCES membership_plans(id),
  customer_id       TEXT REFERENCES customers(id) ON DELETE SET NULL,
  customer_name     TEXT NOT NULL,
  phone             TEXT NOT NULL,
  email             TEXT,
  location_id       TEXT REFERENCES locations(id),
  preferred_service TEXT,
  sessions_used     INTEGER NOT NULL DEFAULT 0,
  status            TEXT NOT NULL DEFAULT 'pending',
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
)`,
  `CREATE INDEX IF NOT EXISTS idx_memberships_phone ON memberships(phone)`,

  `CREATE TABLE IF NOT EXISTS last_minute_rules (
  id            TEXT PRIMARY KEY,
  location_id   TEXT REFERENCES locations(id) ON DELETE CASCADE,
  discount_pct  INTEGER NOT NULL DEFAULT 20,
  min_lead_min  INTEGER NOT NULL DEFAULT 60,
  max_lead_min  INTEGER NOT NULL DEFAULT 600,
  active        INTEGER NOT NULL DEFAULT 1
)`,
];
