import { NextResponse, type NextRequest } from "next/server";
import { suggestSlots } from "@/lib/availability";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const time = p.get("time");
  const count = Number(p.get("count") ?? 3);

  const slots = await suggestSlots({
    locationId: p.get("locationId") ?? undefined,
    barberId: p.get("barberId") ?? undefined,
    serviceId: p.get("serviceId") ?? undefined,
    preferredTimeMin: time ? Number(time) : undefined,
    count: Number.isFinite(count) ? Math.min(Math.max(count, 1), 6) : 3,
  });

  return NextResponse.json({ slots });
}
