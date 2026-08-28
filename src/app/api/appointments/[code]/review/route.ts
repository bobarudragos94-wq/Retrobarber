import { NextResponse, type NextRequest } from "next/server";
import { run } from "@/lib/db";
import { getAppointmentByCode } from "@/lib/queries";

export const dynamic = "force-dynamic";

/** Marcheaza ca s-a apasat butonul de recenzie Google (pentru statistici). */
export async function POST(_req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const appt = await getAppointmentByCode(code);
  if (!appt) return NextResponse.json({ ok: false }, { status: 404 });
  if (!appt.reviewed_at) {
    await run("UPDATE appointments SET reviewed_at = datetime('now') WHERE id = ?", [appt.id]);
  }
  return NextResponse.json({ ok: true });
}
