import { NextResponse, type NextRequest } from "next/server";
import { one, run } from "@/lib/db";
import { id, normalizePhone } from "@/lib/id";
import type { MembershipPlan } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Cerere de abonament. Nu exista flux de plata: cererea se salveaza cu status
 * `pending`, iar echipa confirma telefonic si activeaza abonamentul in salon.
 */
export async function POST(req: NextRequest) {
  let body: {
    planId?: string;
    name?: string;
    phone?: string;
    email?: string;
    locationId?: string;
    preferredService?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Cerere invalidă." }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const phone = normalizePhone(body.phone ?? "");
  if (name.length < 2) return NextResponse.json({ ok: false, error: "Spune-ne cum te cheamă." }, { status: 400 });
  if (!phone) return NextResponse.json({ ok: false, error: "Număr de telefon invalid." }, { status: 400 });

  const plan = await one<MembershipPlan>(
    "SELECT * FROM membership_plans WHERE id = ? AND active = 1",
    [body.planId ?? ""],
  );
  if (!plan) return NextResponse.json({ ok: false, error: "Abonamentul nu există." }, { status: 400 });

  const existing = await one<{ id: string }>(
    "SELECT id FROM memberships WHERE phone = ? AND plan_id = ? AND status = 'pending'",
    [phone, plan.id],
  );
  if (existing) {
    return NextResponse.json({ ok: true, alreadyRequested: true, membershipId: existing.id, plan: plan.name });
  }

  const membershipId = id("mem");
  await run(
    `INSERT INTO memberships (id, plan_id, customer_id, customer_name, phone, email, location_id, preferred_service, status)
     VALUES (?,?,(SELECT id FROM customers WHERE phone = ?),?,?,?,?,?, 'pending')`,
    [
      membershipId, plan.id, phone, name, phone,
      (body.email ?? "").trim() || null,
      body.locationId || null,
      body.preferredService || null,
    ],
  );

  return NextResponse.json({ ok: true, membershipId, plan: plan.name, sessions: plan.sessions, discount: plan.discount_pct });
}
