import { all, one } from "./db";
import type { Appointment, Barber, Location, MembershipPlan, Service } from "./types";

export const getLocations = () =>
  all<Location>("SELECT * FROM locations WHERE active = 1 ORDER BY sort_order");

export const getBarbers = () =>
  all<Barber>("SELECT * FROM barbers WHERE active = 1 ORDER BY sort_order, name");

export const getServices = () =>
  all<Service>(
    "SELECT * FROM services WHERE active = 1 ORDER BY CASE category WHEN 'pachete' THEN 1 ELSE 0 END, sort_order",
  );

export const getPlans = () =>
  all<MembershipPlan>("SELECT * FROM membership_plans WHERE active = 1 ORDER BY sort_order");

export const getLocationBySlug = (slug: string) =>
  one<Location>("SELECT * FROM locations WHERE slug = ? AND active = 1", [slug]);

export const getAppointmentByCode = (code: string) =>
  one<Appointment>("SELECT * FROM appointments WHERE public_code = ?", [code.toUpperCase()]);

export async function getAppointmentDetail(code: string) {
  const appt = await getAppointmentByCode(code);
  if (!appt) return null;
  const [location, barber, service] = await Promise.all([
    one<Location>("SELECT * FROM locations WHERE id = ?", [appt.location_id]),
    one<Barber>("SELECT * FROM barbers WHERE id = ?", [appt.barber_id]),
    one<Service>("SELECT * FROM services WHERE id = ?", [appt.service_id]),
  ]);
  if (!location || !barber || !service) return null;
  return { appt, location, barber, service };
}

/** Ultimele rezervari ale unui numar de telefon — folosit pentru „la fel ca data trecută”. */
export const getHistoryByPhone = (phone: string, limit = 10) =>
  all<Appointment>(
    `SELECT * FROM appointments WHERE phone = ? AND source != 'seed'
     ORDER BY date DESC, start_min DESC LIMIT ?`,
    [phone, limit],
  );
