/**
 * Datele de referință ale salonului: locații, echipă, servicii, abonamente.
 *
 * Sursa unică pentru scriptul de seed, pentru inițializarea automată la prima
 * pornire și pentru db/setup.sql. Sunt informațiile reale de pe retrobarbershop.ro.
 *
 * Notă: `rating` și `reviews_count` pornesc de la zero, intenționat. Sunt afișate
 * clienților, așa că nu au voie să conțină cifre inventate — se completează când
 * există recenzii reale, iar până atunci interfața nu le arată deloc.
 */

export type SeedLocation = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  address: string;
  district: string;
  phone: string;
  lat: number;
  lng: number;
  sortOrder: number;
};

export const LOCATIONS: SeedLocation[] = [
  {
    id: "loc_pallady", slug: "pallady", name: "Retro Barbershop Pallady", shortName: "Pallady",
    address: "Str. Mizil nr. 2A, Sector 3", district: "Sector 3", phone: "0771717299",
    lat: 44.4188, lng: 26.1729, sortOrder: 1,
  },
  {
    id: "loc_iancului", slug: "iancului", name: "Retro Barbershop Iancului", shortName: "Iancului",
    address: "Str. Avrig nr. 63, Sector 2", district: "Sector 2", phone: "0770249525",
    lat: 44.4468, lng: 26.1354, sortOrder: 2,
  },
  {
    id: "loc_titan", slug: "titan", name: "Retro Barbershop Titan", shortName: "Titan",
    address: "Str. Liviu Rebreanu nr. 27A, Sector 3", district: "Sector 3", phone: "0773704038",
    lat: 44.4181, lng: 26.15, sortOrder: 3,
  },
  {
    id: "loc_dristor", slug: "dristor", name: "Retro Barbershop Dristor", shortName: "Dristor",
    address: "Str. Dristorului nr. 96, Sector 3", district: "Sector 3", phone: "0768922430",
    lat: 44.4211, lng: 26.1355, sortOrder: 4,
  },
];

/** Echipa, pe locații, în ordinea afișării. */
export const TEAM: Record<string, string[]> = {
  loc_pallady: ["Marius", "Angel", "Valeriu", "Emanuel", "Cătălin", "Mihai", "Loredana", "Florin", "Matei", "Nick"],
  loc_iancului: ["Marian", "Gabriel", "Andu", "Bogdan", "Giuliano"],
  loc_titan: ["Vlad", "Edward", "Alexandru", "Diana", "Andy", "Daniel", "Cristi"],
  loc_dristor: ["Paul", "Laura", "Alin"],
};

export type SeedBarber = {
  id: string;
  locationId: string;
  name: string;
  sortOrder: number;
};

export const BARBERS: SeedBarber[] = Object.entries(TEAM).flatMap(([locationId, names]) =>
  names.map((name, i) => ({
    id: `brb_${locationId.replace("loc_", "")}_${i + 1}`,
    locationId,
    name,
    sortOrder: i + 1,
  })),
);

export type SeedService = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  durationMin: number;
  category: "servicii" | "pachete";
  popular: 0 | 1;
  sortOrder: number;
};

export const SERVICES: SeedService[] = [
  { id: "svc_tuns_clasic", slug: "tuns-clasic", name: "Tuns Clasic",
    description: "Styling inclus (laterale de la 0,5 în sus)", price: 55, durationMin: 40,
    category: "servicii", popular: 1, sortOrder: 1 },
  { id: "svc_skin_fade", slug: "skin-fade", name: "Skin Fade",
    description: "Styling inclus (0 în laterale)", price: 70, durationMin: 45,
    category: "servicii", popular: 1, sortOrder: 2 },
  { id: "svc_tuns_barba", slug: "tuns-barba", name: "Tuns Barbă",
    description: "Prosop cald + contur + tratament + styling", price: 50, durationMin: 30,
    category: "servicii", popular: 1, sortOrder: 3 },
  { id: "svc_spalat", slug: "spalat-masaj", name: "Spălat + Masaj",
    description: "Spălat cu masaj și styling inclus", price: 25, durationMin: 20,
    category: "servicii", popular: 0, sortOrder: 4 },
  { id: "svc_vopsit_barba", slug: "vopsit-barba", name: "Vopsit Barbă",
    description: "Nuanțe închise (negru, șaten)", price: 40, durationMin: 30,
    category: "servicii", popular: 0, sortOrder: 5 },
  { id: "svc_cosmetica", slug: "cosmetica", name: "Cosmetică",
    description: "Îndepărtare păr pomeți + pensat cu ceară", price: 30, durationMin: 15,
    category: "servicii", popular: 0, sortOrder: 6 },
  { id: "svc_masaj", slug: "masaj-capilar", name: "Masaj Capilar & Cervical",
    description: "10 minute de masaj realizat la scaun", price: 30, durationMin: 15,
    category: "servicii", popular: 0, sortOrder: 7 },

  { id: "pkg_clasic", slug: "pachet-clasic", name: "Pachet Clasic",
    description: "Tuns clasic + tuns barbă + contur barbă + prosop cald", price: 105, durationMin: 60,
    category: "pachete", popular: 0, sortOrder: 1 },
  { id: "pkg_premium", slug: "pachet-premium", name: "Pachet Premium",
    description: "Tuns clasic/skin + tuns barbă + contur + prosop cald + spălat + styling",
    price: 110, durationMin: 70, category: "pachete", popular: 1, sortOrder: 2 },
  { id: "pkg_retro", slug: "pachet-retro", name: "Pachet Retro",
    description: "Tuns clasic/skin + barbă + contur + prosop cald + pensat cu ceară + pomeți + spălat + styling",
    price: 130, durationMin: 90, category: "pachete", popular: 0, sortOrder: 3 },
];

export type SeedPlan = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  sessions: number;
  discountPct: number;
  perks: string[];
  popular: 0 | 1;
  sortOrder: number;
};

export const PLANS: SeedPlan[] = [
  {
    id: "plan_esential", slug: "esential", name: "Retro Esențial",
    tagline: "O tunsoare pe lună, tot anul", sessions: 12, discountPct: 10,
    perks: [
      "12 ședințe pe an (una pe lună)",
      "10% reducere la fiecare ședință",
      "Rezervare prioritară cu 30 de zile înainte",
      "Reprogramare gratuită",
    ],
    popular: 0, sortOrder: 1,
  },
  {
    id: "plan_retro24", slug: "retro-24", name: "Retro 24",
    tagline: "La două săptămâni, mereu impecabil", sessions: 24, discountPct: 15,
    perks: [
      "24 de ședințe pe an (una la două săptămâni)",
      "15% reducere la fiecare ședință",
      "Slot garantat cu frizerul tău preferat",
      "Prosop cald și băutură din partea casei",
      "Reprogramare gratuită, ședințe transferabile",
    ],
    popular: 1, sortOrder: 2,
  },
  {
    id: "plan_full", slug: "full-retro", name: "Full Retro",
    tagline: "Pachet complet, la două săptămâni", sessions: 24, discountPct: 20,
    perks: [
      "24 de Pachete Premium pe an",
      "20% reducere la fiecare ședință",
      "Acces la sloturi rezervate membrilor",
      "10% la produsele de îngrijire din shop",
      "Invitații la evenimentele Retro",
    ],
    popular: 0, sortOrder: 3,
  },
];

/** Reducerea implicită pentru locurile rămase libere azi. */
export const LAST_MINUTE_RULE = {
  id: "lmr_default",
  discountPct: 20,
  minLeadMin: 45,
  maxLeadMin: 660,
};

/** Link de căutare Google Maps — se înlocuiește cu Place ID-ul real al locației. */
export function mapsQueryUrl(location: SeedLocation): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `Retro Barbershop ${location.shortName} ${location.address}`,
  )}`;
}
