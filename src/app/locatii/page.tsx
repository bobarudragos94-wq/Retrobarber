import type { Metadata } from "next";
import Link from "next/link";
import { getBarbers, getLocations } from "@/lib/queries";
import { Wrap } from "@/components/Section";
import { prettyPhone } from "@/lib/format";
import { Clock, Phone, Pin, User } from "@/components/Icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Locații",
  description:
    "Retro Barbershop are patru saloane în București: Pallady, Iancului, Titan și Dristor. Luni – Sâmbătă, 10:00 – 21:00.",
};

export default async function LocatiiPage() {
  const [locations, barbers] = await Promise.all([getLocations(), getBarbers()]);

  return (
    <Wrap className="pb-16 pt-8">
      <header className="mb-8 max-w-2xl">
        <p className="eyebrow">Locații</p>
        <h1 className="display mt-2 text-[46px] leading-[0.96] text-cream sm:text-6xl">
          Patru saloane în București
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
          Același standard, aceleași prețuri, aceeași atmosferă retro. Luni – Sâmbătă,
          10:00 – 21:00. Duminică închis.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {locations.map((l) => {
          const team = barbers.filter((b) => b.location_id === l.id);
          return (
            <article key={l.id} className="card grain relative overflow-hidden p-6">
              <span className="pole absolute inset-y-0 left-0 w-[3px] opacity-70" />
              <h2 className="display text-3xl leading-none text-cream">Retro {l.short_name}</h2>

              <ul className="mt-4 space-y-2.5 text-sm">
                <li className="flex items-start gap-2.5 text-muted">
                  <Pin width={16} height={16} className="mt-0.5 shrink-0 text-brass" />
                  {l.address}
                </li>
                <li className="flex items-center gap-2.5 text-muted">
                  <Phone width={16} height={16} className="shrink-0 text-brass" />
                  <a href={`tel:${l.phone}`} className="text-cream hover:text-brass">
                    {prettyPhone(l.phone)}
                  </a>
                </li>
                <li className="flex items-center gap-2.5 text-muted">
                  <Clock width={16} height={16} className="shrink-0 text-brass" />
                  Luni – Sâmbătă, 10:00 – 21:00
                </li>
                <li className="flex items-center gap-2.5 text-muted">
                  <User width={16} height={16} className="shrink-0 text-brass" />
                  {team.length} frizeri
                </li>
              </ul>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link href={`/rezervare?locatie=${l.slug}`} className="btn btn-gold btn-sm">
                  Rezervă
                </Link>
                <Link href={`/locatii/${l.slug}`} className="btn btn-ghost btn-sm">
                  Detalii
                </Link>
                {l.maps_url && (
                  <a href={l.maps_url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                    Hartă
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </Wrap>
  );
}
