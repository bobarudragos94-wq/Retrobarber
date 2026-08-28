import { NextResponse, type NextRequest } from "next/server";
import { findSlots } from "@/lib/availability";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const slots = await findSlots({
    locationId: p.get("locationId") ?? undefined,
    barberId: p.get("barberId") ?? undefined,
    serviceId: p.get("serviceId") ?? undefined,
    from: p.get("from") ?? undefined,
    days: p.get("days") ? Number(p.get("days")) : 1,
  });
  return NextResponse.json({ slots });
}
