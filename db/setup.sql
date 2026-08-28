-- ============================================================
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

-- ---------- 1 / 20 ----------
CREATE TABLE IF NOT EXISTS locations (
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
);

-- ---------- 2 / 20 ----------
CREATE TABLE IF NOT EXISTS barbers (
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
);

-- ---------- 3 / 20 ----------
CREATE INDEX IF NOT EXISTS idx_barbers_location ON barbers(location_id);

-- ---------- 4 / 20 ----------
CREATE TABLE IF NOT EXISTS services (
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
);

-- ---------- 5 / 20 ----------
CREATE TABLE IF NOT EXISTS time_off (
  id            TEXT PRIMARY KEY,
  barber_id     TEXT REFERENCES barbers(id) ON DELETE CASCADE,
  location_id   TEXT REFERENCES locations(id) ON DELETE CASCADE,
  date          TEXT NOT NULL,
  start_min     INTEGER NOT NULL DEFAULT 0,
  end_min       INTEGER NOT NULL DEFAULT 1440,
  reason        TEXT
);

-- ---------- 6 / 20 ----------
CREATE INDEX IF NOT EXISTS idx_timeoff_date ON time_off(date);

-- ---------- 7 / 20 ----------
CREATE TABLE IF NOT EXISTS customers (
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
);

-- ---------- 8 / 20 ----------
CREATE TABLE IF NOT EXISTS appointments (
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
);

-- ---------- 9 / 20 ----------
CREATE INDEX IF NOT EXISTS idx_appt_slot ON appointments(barber_id, date, status);

-- ---------- 10 / 20 ----------
CREATE INDEX IF NOT EXISTS idx_appt_date ON appointments(date, location_id);

-- ---------- 11 / 20 ----------
CREATE INDEX IF NOT EXISTS idx_appt_phone ON appointments(phone);

-- ---------- 12 / 20 ----------
CREATE TABLE IF NOT EXISTS membership_plans (
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
);

-- ---------- 13 / 20 ----------
CREATE TABLE IF NOT EXISTS memberships (
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
);

-- ---------- 14 / 20 ----------
CREATE INDEX IF NOT EXISTS idx_memberships_phone ON memberships(phone);

-- ---------- 15 / 20 ----------
CREATE TABLE IF NOT EXISTS last_minute_rules (
  id            TEXT PRIMARY KEY,
  location_id   TEXT REFERENCES locations(id) ON DELETE CASCADE,
  discount_pct  INTEGER NOT NULL DEFAULT 20,
  min_lead_min  INTEGER NOT NULL DEFAULT 60,
  max_lead_min  INTEGER NOT NULL DEFAULT 600,
  active        INTEGER NOT NULL DEFAULT 1
);

-- ---------- 16 / 20 ----------
INSERT OR REPLACE INTO locations (id, slug, name, short_name, address, district, phone, lat, lng, maps_url, review_url, opens_at, closes_at, closed_days, sort_order, active) VALUES
  ('loc_pallady', 'pallady', 'Retro Barbershop Pallady', 'Pallady', 'Str. Mizil nr. 2A, Sector 3', 'Sector 3', '0771717299', 44.4188, 26.1729, 'https://www.google.com/maps/search/?api=1&query=Retro%20Barbershop%20Pallady%20Str.%20Mizil%20nr.%202A%2C%20Sector%203', 'https://www.google.com/maps/search/?api=1&query=Retro%20Barbershop%20Pallady%20Str.%20Mizil%20nr.%202A%2C%20Sector%203', 600, 1260, '0', 1, 1),
  ('loc_iancului', 'iancului', 'Retro Barbershop Iancului', 'Iancului', 'Str. Avrig nr. 63, Sector 2', 'Sector 2', '0770249525', 44.4468, 26.1354, 'https://www.google.com/maps/search/?api=1&query=Retro%20Barbershop%20Iancului%20Str.%20Avrig%20nr.%2063%2C%20Sector%202', 'https://www.google.com/maps/search/?api=1&query=Retro%20Barbershop%20Iancului%20Str.%20Avrig%20nr.%2063%2C%20Sector%202', 600, 1260, '0', 2, 1),
  ('loc_titan', 'titan', 'Retro Barbershop Titan', 'Titan', 'Str. Liviu Rebreanu nr. 27A, Sector 3', 'Sector 3', '0773704038', 44.4181, 26.15, 'https://www.google.com/maps/search/?api=1&query=Retro%20Barbershop%20Titan%20Str.%20Liviu%20Rebreanu%20nr.%2027A%2C%20Sector%203', 'https://www.google.com/maps/search/?api=1&query=Retro%20Barbershop%20Titan%20Str.%20Liviu%20Rebreanu%20nr.%2027A%2C%20Sector%203', 600, 1260, '0', 3, 1),
  ('loc_dristor', 'dristor', 'Retro Barbershop Dristor', 'Dristor', 'Str. Dristorului nr. 96, Sector 3', 'Sector 3', '0768922430', 44.4211, 26.1355, 'https://www.google.com/maps/search/?api=1&query=Retro%20Barbershop%20Dristor%20Str.%20Dristorului%20nr.%2096%2C%20Sector%203', 'https://www.google.com/maps/search/?api=1&query=Retro%20Barbershop%20Dristor%20Str.%20Dristorului%20nr.%2096%2C%20Sector%203', 600, 1260, '0', 4, 1);

-- ---------- 17 / 20 ----------
INSERT OR REPLACE INTO barbers (id, location_id, name, role, sort_order, active) VALUES
  ('brb_pallady_1', 'loc_pallady', 'Marius', 'Barber', 1, 1),
  ('brb_pallady_2', 'loc_pallady', 'Angel', 'Barber', 2, 1),
  ('brb_pallady_3', 'loc_pallady', 'Valeriu', 'Barber', 3, 1),
  ('brb_pallady_4', 'loc_pallady', 'Emanuel', 'Barber', 4, 1),
  ('brb_pallady_5', 'loc_pallady', 'Cătălin', 'Barber', 5, 1),
  ('brb_pallady_6', 'loc_pallady', 'Mihai', 'Barber', 6, 1),
  ('brb_pallady_7', 'loc_pallady', 'Loredana', 'Barber', 7, 1),
  ('brb_pallady_8', 'loc_pallady', 'Florin', 'Barber', 8, 1),
  ('brb_pallady_9', 'loc_pallady', 'Matei', 'Barber', 9, 1),
  ('brb_pallady_10', 'loc_pallady', 'Nick', 'Barber', 10, 1),
  ('brb_iancului_1', 'loc_iancului', 'Marian', 'Barber', 1, 1),
  ('brb_iancului_2', 'loc_iancului', 'Gabriel', 'Barber', 2, 1),
  ('brb_iancului_3', 'loc_iancului', 'Andu', 'Barber', 3, 1),
  ('brb_iancului_4', 'loc_iancului', 'Bogdan', 'Barber', 4, 1),
  ('brb_iancului_5', 'loc_iancului', 'Giuliano', 'Barber', 5, 1),
  ('brb_titan_1', 'loc_titan', 'Vlad', 'Barber', 1, 1),
  ('brb_titan_2', 'loc_titan', 'Edward', 'Barber', 2, 1),
  ('brb_titan_3', 'loc_titan', 'Alexandru', 'Barber', 3, 1),
  ('brb_titan_4', 'loc_titan', 'Diana', 'Barber', 4, 1),
  ('brb_titan_5', 'loc_titan', 'Andy', 'Barber', 5, 1),
  ('brb_titan_6', 'loc_titan', 'Daniel', 'Barber', 6, 1),
  ('brb_titan_7', 'loc_titan', 'Cristi', 'Barber', 7, 1),
  ('brb_dristor_1', 'loc_dristor', 'Paul', 'Barber', 1, 1),
  ('brb_dristor_2', 'loc_dristor', 'Laura', 'Barber', 2, 1),
  ('brb_dristor_3', 'loc_dristor', 'Alin', 'Barber', 3, 1);

-- ---------- 18 / 20 ----------
INSERT OR REPLACE INTO services (id, slug, name, description, price, duration_min, category, popular, sort_order, active) VALUES
  ('svc_tuns_clasic', 'tuns-clasic', 'Tuns Clasic', 'Styling inclus (laterale de la 0,5 în sus)', 55, 40, 'servicii', 1, 1, 1),
  ('svc_skin_fade', 'skin-fade', 'Skin Fade', 'Styling inclus (0 în laterale)', 70, 45, 'servicii', 1, 2, 1),
  ('svc_tuns_barba', 'tuns-barba', 'Tuns Barbă', 'Prosop cald + contur + tratament + styling', 50, 30, 'servicii', 1, 3, 1),
  ('svc_spalat', 'spalat-masaj', 'Spălat + Masaj', 'Spălat cu masaj și styling inclus', 25, 20, 'servicii', 0, 4, 1),
  ('svc_vopsit_barba', 'vopsit-barba', 'Vopsit Barbă', 'Nuanțe închise (negru, șaten)', 40, 30, 'servicii', 0, 5, 1),
  ('svc_cosmetica', 'cosmetica', 'Cosmetică', 'Îndepărtare păr pomeți + pensat cu ceară', 30, 15, 'servicii', 0, 6, 1),
  ('svc_masaj', 'masaj-capilar', 'Masaj Capilar & Cervical', '10 minute de masaj realizat la scaun', 30, 15, 'servicii', 0, 7, 1),
  ('pkg_clasic', 'pachet-clasic', 'Pachet Clasic', 'Tuns clasic + tuns barbă + contur barbă + prosop cald', 105, 60, 'pachete', 0, 1, 1),
  ('pkg_premium', 'pachet-premium', 'Pachet Premium', 'Tuns clasic/skin + tuns barbă + contur + prosop cald + spălat + styling', 110, 70, 'pachete', 1, 2, 1),
  ('pkg_retro', 'pachet-retro', 'Pachet Retro', 'Tuns clasic/skin + barbă + contur + prosop cald + pensat cu ceară + pomeți + spălat + styling', 130, 90, 'pachete', 0, 3, 1);

-- ---------- 19 / 20 ----------
INSERT OR REPLACE INTO membership_plans (id, slug, name, tagline, sessions, period_months, discount_pct, perks, popular, sort_order, active) VALUES
  ('plan_esential', 'esential', 'Retro Esențial', 'O tunsoare pe lună, tot anul', 12, 12, 10, '["12 ședințe pe an (una pe lună)","10% reducere la fiecare ședință","Rezervare prioritară cu 30 de zile înainte","Reprogramare gratuită"]', 0, 1, 1),
  ('plan_retro24', 'retro-24', 'Retro 24', 'La două săptămâni, mereu impecabil', 24, 12, 15, '["24 de ședințe pe an (una la două săptămâni)","15% reducere la fiecare ședință","Slot garantat cu frizerul tău preferat","Prosop cald și băutură din partea casei","Reprogramare gratuită, ședințe transferabile"]', 1, 2, 1),
  ('plan_full', 'full-retro', 'Full Retro', 'Pachet complet, la două săptămâni', 24, 12, 20, '["24 de Pachete Premium pe an","20% reducere la fiecare ședință","Acces la sloturi rezervate membrilor","10% la produsele de îngrijire din shop","Invitații la evenimentele Retro"]', 0, 3, 1);

-- ---------- 20 / 20 ----------
INSERT OR REPLACE INTO last_minute_rules (id, location_id, discount_pct, min_lead_min, max_lead_min, active) VALUES
  ('lmr_default', NULL, 20, 45, 660, 1);

-- ---------- verificare ----------
SELECT 'locatii' AS tabel, COUNT(*) AS randuri FROM locations
UNION ALL SELECT 'frizeri',    COUNT(*) FROM barbers
UNION ALL SELECT 'servicii',   COUNT(*) FROM services
UNION ALL SELECT 'abonamente', COUNT(*) FROM membership_plans
UNION ALL SELECT 'reguli',     COUNT(*) FROM last_minute_rules;
