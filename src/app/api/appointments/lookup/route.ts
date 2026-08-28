import { NextResponse, type NextRequest } from "next/server";
import { normalizePhone } from "@/lib/id";
import { getHistoryByPhone } from "@/lib/queries";
import { all } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Istoricul unui numar de telefon — recunoaste clientul pe un dispozitiv nou. */
export async function GET(req: NextRequest) {
  const phone = normalizePhone(req.nextUrl.searchParams.get("phone") ?? "");
  if (!phone) return NextResponse.json({ ok: false, error: "Număr invalid." }, { status: 400 });

  const [history, customer] = await Promise.all([
    getHistoryByPhone(phone, 5),
    all<{ pref_location_id: string; pref_barber_id: string; pref_service_id: string; pref_time_min: number; name: string; visits_count: number }>(
      "SELECT name, pref_location_id, pref_barber_id, pref_service_id, pref_time_min, visits_count FROM customers WHERE phone = ?",
      [phone],
    ),
  ]);

  return NextResponse.json({ ok: true, history, customer: customer[0] ?? null });
}
