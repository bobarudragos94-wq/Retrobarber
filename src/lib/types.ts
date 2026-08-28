export type Location = {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  address: string;
  district: string;
  phone: string;
  lat: number | null;
  lng: number | null;
  maps_url: string | null;
  review_url: string | null;
  opens_at: number;
  closes_at: number;
  closed_days: string;
  sort_order: number;
};

export type Barber = {
  id: string;
  location_id: string;
  name: string;
  role: string;
  bio: string | null;
  avatar_url: string | null;
  rating: number;
  reviews_count: number;
  sort_order: number;
};

export type Service = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  duration_min: number;
  category: "servicii" | "pachete";
  popular: number;
  sort_order: number;
};

export type MembershipPlan = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  sessions: number;
  period_months: number;
  discount_pct: number;
  perks: string | null;
  popular: number;
  sort_order: number;
};

export type Slot = {
  date: string;
  startMin: number;
  endMin: number;
  barberId: string;
  barberName: string;
  locationId: string;
  locationName: string;
  serviceId: string;
  price: number;
  basePrice: number;
  discountPct: number;
  score?: number;
  reason?: string;
};

export type Appointment = {
  id: string;
  public_code: string;
  customer_name: string;
  phone: string;
  location_id: string;
  barber_id: string;
  service_id: string;
  date: string;
  start_min: number;
  end_min: number;
  price: number;
  base_price: number;
  discount_pct: number;
  source: string;
  status: string;
  notes: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export type Prefs = {
  name?: string;
  phone?: string;
  locationId?: string;
  barberId?: string;
  serviceId?: string;
  preferredTimeMin?: number;
  lastAppointmentId?: string;
};
