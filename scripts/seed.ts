import { client } from "./_client";

const LOCATIONS = [
  {
    id: "loc_pallady", slug: "pallady", name: "Retro Barbershop Pallady", short_name: "Pallady",
    address: "Str. Mizil nr. 2A, Sector 3", district: "Sector 3", phone: "0771717299",
    lat: 44.4188, lng: 26.1729, sort_order: 1,
  },
  {
    id: "loc_iancului", slug: "iancului", name: "Retro Barbershop Iancului", short_name: "Iancului",
    address: "Str. Avrig nr. 63, Sector 2", district: "Sector 2", phone: "0770249525",
    lat: 44.4468, lng: 26.1354, sort_order: 2,
  },
  {
    id: "loc_titan", slug: "titan", name: "Retro Barbershop Titan", short_name: "Titan",
    address: "Str. Liviu Rebreanu nr. 27A, Sector 3", district: "Sector 3", phone: "0773704038",
    lat: 44.4181, lng: 26.1500, sort_order: 3,
  },
  {
    id: "loc_dristor", slug: "dristor", name: "Retro Barbershop Dristor", short_name: "Dristor",
    address: "Str. Dristorului nr. 96, Sector 3", district: "Sector 3", phone: "0768922430",
    lat: 44.4211, lng: 26.1355, sort_order: 4,
  },
];

const TEAM: Record<string, string[]> = {
  loc_pallady: ["Marius", "Angel", "Valeriu", "Emanuel", "Cătălin", "Mihai", "Loredana", "Florin", "Matei", "Nick"],
  loc_iancului: ["Marian", "Gabriel", "Andu", "Bogdan", "Giuliano"],
  loc_titan: ["Vlad", "Edward", "Alexandru", "Diana", "Andy", "Daniel", "Cristi"],
  loc_dristor: ["Paul", "Laura", "Alin"],
};

const ROLES = ["Master Barber", "Senior Barber", "Barber", "Barber Stylist"];

const SERVICES = [
  { id: "svc_tuns_clasic", slug: "tuns-clasic", name: "Tuns Clasic",
    description: "Styling inclus (laterale de la 0,5 în sus)", price: 55, duration_min: 40,
    category: "servicii", popular: 1, sort_order: 1 },
  { id: "svc_skin_fade", slug: "skin-fade", name: "Skin Fade",
    description: "Styling inclus (0 în laterale)", price: 70, duration_min: 45,
    category: "servicii", popular: 1, sort_order: 2 },
  { id: "svc_tuns_barba", slug: "tuns-barba", name: "Tuns Barbă",
    description: "Prosop cald + contur + tratament + styling", price: 50, duration_min: 30,
    category: "servicii", popular: 1, sort_order: 3 },
  { id: "svc_spalat", slug: "spalat-masaj", name: "Spălat + Masaj",
    description: "Spălat cu masaj și styling inclus", price: 25, duration_min: 20,
    category: "servicii", popular: 0, sort_order: 4 },
  { id: "svc_vopsit_barba", slug: "vopsit-barba", name: "Vopsit Barbă",
    description: "Nuanțe închise (negru, șaten)", price: 40, duration_min: 30,
    category: "servicii", popular: 0, sort_order: 5 },
  { id: "svc_cosmetica", slug: "cosmetica", name: "Cosmetică",
    description: "Îndepărtare păr pomeți + pensat cu ceară", price: 30, duration_min: 15,
    category: "servicii", popular: 0, sort_order: 6 },
  { id: "svc_masaj", slug: "masaj-capilar", name: "Masaj Capilar & Cervical",
    description: "10 minute de masaj realizat la scaun", price: 30, duration_min: 15,
    category: "servicii", popular: 0, sort_order: 7 },

  { id: "pkg_clasic", slug: "pachet-clasic", name: "Pachet Clasic",
    description: "Tuns clasic + tuns barbă + contur barbă + prosop cald", price: 105, duration_min: 60,
    category: "pachete", popular: 0, sort_order: 1 },
  { id: "pkg_premium", slug: "pachet-premium", name: "Pachet Premium",
    description: "Tuns clasic/skin + tuns barbă + contur + prosop cald + spălat + styling", price: 110, duration_min: 70,
    category: "pachete", popular: 1, sort_order: 2 },
  { id: "pkg_retro", slug: "pachet-retro", name: "Pachet Retro",
    description: "Tuns clasic/skin + barbă + contur + prosop cald + pensat cu ceară + pomeți + spălat + styling",
    price: 130, duration_min: 90, category: "pachete", popular: 0, sort_order: 3 },
];

const PLANS = [
  {
    id: "plan_esential", slug: "esential", name: "Retro Esențial",
    tagline: "O tunsoare pe lună, tot anul", sessions: 12, period_months: 12, discount_pct: 10,
    perks: JSON.stringify([
      "12 ședințe pe an (una pe lună)",
      "10% reducere la fiecare ședință",
      "Rezervare prioritară cu 30 de zile înainte",
      "Reprogramare gratuită",
    ]),
    popular: 0, sort_order: 1,
  },
  {
    id: "plan_retro24", slug: "retro-24", name: "Retro 24",
    tagline: "La două săptămâni, mereu impecabil", sessions: 24, period_months: 12, discount_pct: 15,
    perks: JSON.stringify([
      "24 de ședințe pe an (una la două săptămâni)",
      "15% reducere la fiecare ședință",
      "Slot garantat cu frizerul tău preferat",
      "Prosop cald și băutură din partea casei",
      "Reprogramare gratuită, ședințe transferabile",
    ]),
    popular: 1, sort_order: 2,
  },
  {
    id: "plan_full", slug: "full-retro", name: "Full Retro",
    tagline: "Pachet complet, la două săptămâni", sessions: 24, period_months: 12, discount_pct: 20,
    perks: JSON.stringify([
      "24 de Pachete Premium pe an",
      "20% reducere la fiecare ședință",
      "Acces la sloturi rezervate membrilor",
      "10% la produsele de îngrijire din shop",
      "Invitații la evenimentele Retro",
    ]),
    popular: 0, sort_order: 3,
  },
];

function reviewUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function mapsUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

async function main() {
  const db = client();

  const wipe = [
    "DELETE FROM appointments", "DELETE FROM memberships", "DELETE FROM customers",
    "DELETE FROM time_off", "DELETE FROM barbers", "DELETE FROM services",
    "DELETE FROM membership_plans", "DELETE FROM last_minute_rules", "DELETE FROM locations",
  ];
  for (const sql of wipe) await db.execute(sql);

  for (const l of LOCATIONS) {
    const q = `Retro Barbershop ${l.short_name} ${l.address}`;
    await db.execute({
      sql: `INSERT INTO locations
        (id, slug, name, short_name, address, district, phone, lat, lng, maps_url, review_url,
         opens_at, closes_at, closed_days, sort_order, active)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,600,1260,'0',?,1)`,
      args: [l.id, l.slug, l.name, l.short_name, l.address, l.district, l.phone,
        l.lat, l.lng, mapsUrl(q), reviewUrl(q), l.sort_order],
    });
  }

  let bi = 0;
  for (const [locId, names] of Object.entries(TEAM)) {
    for (const [i, name] of names.entries()) {
      bi++;
      await db.execute({
        sql: `INSERT INTO barbers (id, location_id, name, role, bio, rating, reviews_count, sort_order, active)
              VALUES (?,?,?,?,?,?,?,?,1)`,
        args: [
          `brb_${locId.replace("loc_", "")}_${i + 1}`, locId, name,
          ROLES[i % ROLES.length],
          `${name} lucrează la Retro ${locId.replace("loc_", "")} și e specializat pe fade-uri curate și contur de barbă cu brici.`,
          Number((4.7 + ((bi * 7) % 4) / 10).toFixed(1)),
          40 + ((bi * 37) % 260),
          i + 1,
        ],
      });
    }
  }

  for (const s of SERVICES) {
    await db.execute({
      sql: `INSERT INTO services (id, slug, name, description, price, duration_min, category, popular, sort_order, active)
            VALUES (?,?,?,?,?,?,?,?,?,1)`,
      args: [s.id, s.slug, s.name, s.description, s.price, s.duration_min, s.category, s.popular, s.sort_order],
    });
  }

  for (const p of PLANS) {
    await db.execute({
      sql: `INSERT INTO membership_plans (id, slug, name, tagline, sessions, period_months, discount_pct, perks, popular, sort_order, active)
            VALUES (?,?,?,?,?,?,?,?,?,?,1)`,
      args: [p.id, p.slug, p.name, p.tagline, p.sessions, p.period_months, p.discount_pct, p.perks, p.popular, p.sort_order],
    });
  }

  await db.execute({
    sql: `INSERT INTO last_minute_rules (id, location_id, discount_pct, min_lead_min, max_lead_min, active)
          VALUES ('lmr_default', NULL, 20, 45, 660, 1)`,
  });

  // Rezervari demo, ca disponibilitatea sa arate realist.
  const barbers = await db.execute("SELECT id, location_id FROM barbers");
  const today = new Date();
  const iso = (offset: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  };

  let n = 0;
  for (let day = 0; day < 7; day++) {
    const date = iso(day);
    if (new Date(`${date}T00:00:00Z`).getUTCDay() === 0) continue;
    for (const row of barbers.rows) {
      const barberId = String(row.id);
      // ocupare pseudo-aleatoare, deterministica
      const seed = (barberId.length * 31 + day * 17 + n) % 11;
      const busySlots = [600 + seed * 30, 780 + ((seed * 7) % 5) * 45, 1020 + ((seed * 3) % 4) * 30];
      for (const start of busySlots) {
        if (start + 45 > 1260) continue;
        n++;
        if (n % 3 === 0) continue; // lasam goluri
        await db.execute({
          sql: `INSERT INTO appointments
            (id, public_code, customer_name, phone, location_id, barber_id, service_id, date,
             start_min, end_min, price, base_price, discount_pct, source, status)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,0,'seed','confirmed')`,
          args: [
            `apt_seed_${n}`, `RB${String(10000 + n)}`, "Rezervare existentă", "0700000000",
            String(row.location_id), barberId, "svc_tuns_clasic", date,
            start, start + 40, 55, 55,
          ],
        });
      }
    }
  }

  console.log(`✓ ${LOCATIONS.length} locații, ${bi} frizeri, ${SERVICES.length} servicii, ${PLANS.length} abonamente, ${n} rezervări demo.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
