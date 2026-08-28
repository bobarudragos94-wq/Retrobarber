import type { Metadata } from "next";
import Link from "next/link";
import { getBarbers, getLocations } from "@/lib/queries";
import { Wrap } from "@/components/Section";
import { avatarTint, initials } from "@/lib/format";
import { Pin, Star } from "@/components/Icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Echipa",
  description:
    "Frizerii Retro Barbershop din București — Pallady, Iancului, Titan și Dristor. Alege-ți omul și rezervă direct.",
};

export default async function EchipaPage() {
  const [barbers, locations] = await Promise.all([getBarbers(), getLocations()]);

  return (
    <Wrap className="pb-16 pt-8">
      <header className="mb-8 max-w-2xl">
        <p className="eyebrow">Echipa</p>
        <h1 className="display mt-2 text-[46px] leading-[0.9] text-cream sm:text-6xl">
          Oamenii din spatele scaunului
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
          {barbers.length} profesioniști în patru locații. Alege-ți frizerul —
          aplicația îl reține și îți propune orele lui libere la fiecare vizită.
        </p>
      </header>

      <div className="space-y-12">
        {locations.map((loc) => {
          const team = barbers.filter((b) => b.location_id === loc.id);
          if (!team.length) return null;
          return (
            <section key={loc.id}>
              <div className="mb-4 flex items-center gap-3">
                <span className="pole h-8 w-1.5 rounded-full opacity-80" />
                <div>
                  <h2 className="display text-3xl leading-none text-cream">
                    Retro {loc.short_name}
                  </h2>
                  <p className="mt-1 text-xs text-muted">{loc.address}</p>
                </div>
                <Link href={`/rezervare?locatie=${loc.slug}`} className="btn btn-ghost btn-sm ml-auto">
                  Rezervă aici
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
                {team.map((b) => (
                  <Link
                    key={b.id}
                    href={`/rezervare?frizer=${b.id}`}
                    className="card p-4 transition-all hover:border-brass/45 hover:bg-white/[0.045]"
                  >
                    <span
                      className="grid h-14 w-14 place-items-center rounded-2xl text-lg font-bold text-brass-2"
                      style={{ background: avatarTint(b.name) }}
                    >
                      {initials(b.name)}
                    </span>
                    <h3 className="mt-3 text-[15px] font-semibold text-cream">{b.name}</h3>
                    <p className="text-[11px] text-faint">{b.role}</p>
                    <p className="mt-2 flex items-center gap-1 text-[11px] text-brass">
                      <Star width={11} height={11} />
                      {b.rating.toFixed(1)}
                      <span className="text-faint">({b.reviews_count} recenzii)</span>
                    </p>
                    <p className="mt-2.5 flex items-center gap-1 text-[11px] text-muted">
                      <Pin width={11} height={11} className="text-brass" />
                      {loc.short_name}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </Wrap>
  );
}
