import type { Metadata } from "next";
import Link from "next/link";
import { getServices } from "@/lib/queries";
import { findLastMinute } from "@/lib/availability";
import { LastMinutePage } from "@/components/LastMinute";
import { Wrap } from "@/components/Section";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Locuri libere azi",
  description: "Sloturile rămase libere azi la Retro Barbershop, cu reducere dacă le ocupi azi.",
};

export default async function LastMinuteRoute() {
  const [services, { discountPct }] = await Promise.all([getServices(), findLastMinute({ limit: 1 })]);

  return (
    <Wrap className="pb-16 pt-8">
      <header className="mb-6">
        <p className="eyebrow !text-barber-red">−{discountPct || 20}% azi</p>
        <h1 className="display mt-2 text-[42px] leading-none text-cream sm:text-6xl">
          Locuri rămase libere
        </h1>
        <p className="mt-2.5 max-w-lg text-sm leading-relaxed text-muted">
          Sloturi neocupate din programul de azi. Reducerea se aplică automat la confirmare
          și e valabilă doar pentru ziua curentă.
        </p>
      </header>

      <LastMinutePage services={services} />

      <p className="mt-6 text-sm text-muted">
        Nu găsești ora potrivită?{" "}
        <Link href="/rezervare" className="text-brass underline">
          Vezi programul complet
        </Link>
      </p>
    </Wrap>
  );
}
