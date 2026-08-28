import { NextResponse, type NextRequest } from "next/server";
import { findLastMinute } from "@/lib/availability";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const { slots, discountPct } = await findLastMinute({
    locationId: p.get("locationId") ?? undefined,
    serviceId: p.get("serviceId") ?? undefined,
    limit: 12,
  });
  return NextResponse.json({ slots, discountPct, count: slots.length });
}
