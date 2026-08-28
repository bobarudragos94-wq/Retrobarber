import type { Metadata } from "next";
import { getBarbers, getLocations, getServices } from "@/lib/queries";
import { BookingFlow } from "@/components/BookingFlow";
import { Wrap } from "@/components/Section";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rezervare",
  description:
    "Rezervă în câteva secunde la Retro Barbershop. Alege serviciul, locația, frizerul și ora — fără plată online.",
};

export default async function RezervarePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [params, locations, barbers, services] = await Promise.all([
    searchParams,
    getLocations(),
    getBarbers(),
    getServices(),
  ]);

  const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

  const initial = {
    serviceId: services.find((s) => s.slug === str(params.serviciu))?.id,
    locationId: locations.find((l) => l.slug === str(params.locatie))?.id,
    barberId: barbers.find((b) => b.id === str(params.frizer))?.id,
  };

  return (
    <Wrap className="pb-16 pt-8">
      <header className="mb-6">
        <p className="eyebrow">Rezervare</p>
        <h1 className="display mt-2 text-[42px] leading-none text-cream sm:text-6xl">
          Alege-ți ora
        </h1>
        <p className="mt-2.5 max-w-lg text-sm leading-relaxed text-muted">
          Cinci pași scurți — și îi sărim pe cei pe care îi știm deja despre tine.
          Nu se plătește nimic online.
        </p>
      </header>

      <BookingFlow
        locations={locations}
        barbers={barbers}
        services={services}
        initial={initial}
      />
    </Wrap>
  );
}
