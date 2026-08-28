import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { all } from "@/lib/db";
import { getLocationBySlug, getLocations } from "@/lib/queries";
import { Wrap } from "@/components/Section";
import { avatarTint, initials, prettyPhone } from "@/lib/format";
import { Bolt, Clock, Phone, Pin, Star } from "@/components/Icons";
import type { Barber } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const locations = await getLocations().catch(() => []);
  return locations.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const loc = await getLocationBySlug(slug);
  if (!loc) return { title: "Locație" };
  return {
    title: `Frizerie ${loc.short_name}`,
    description: `Retro Barbershop ${loc.short_name} — ${loc.address}. Rezervă online, Luni – Sâmbătă 10:00 – 21:00.`,
  };
}

export default async function LocatiePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const loc = await getLocationBySlug(slug);
  if (!loc) notFound();

  const team = await all<Barber>(
    "SELECT * FROM barbers WHERE location_id = ? AND active = 1 ORDER BY sort_order",
    [loc.id],
  );

  return (
    <Wrap className="pb-16 pt-8">
      <Link href="/locatii" className="text-sm text-muted hover:text-brass">
        ← Toate locațiile
      </Link>

      <header className="card grain relative mt-4 overflow-hidden p-6 sm:p-8">
        <span className="pole absolute inset-y-0 left-0 w-[3px] opacity-70" />
        <p className="eyebrow">{loc.district}</p>
        <h1 className="display mt-2 text-[44px] leading-none text-cream sm:text-6xl">
          Retro {loc.short_name}
        </h1>

        <ul className="mt-5 grid gap-2.5 text-sm sm:grid-cols-3">
          <li className="flex items-start gap-2.5 text-muted">
            <Pin width={16} height={16} className="mt-0.5 shrink-0 text-brass" />
            {loc.address}
          </li>
          <li className="flex items-center gap-2.5 text-muted">
            <Phone width={16} height={16} className="shrink-0 text-brass" />
            <a href={`tel:${loc.phone}`} className="text-cream hover:text-brass">
              {prettyPhone(loc.phone)}
            </a>
          </li>
          <li className="flex items-center gap-2.5 text-muted">
            <Clock width={16} height={16} className="shrink-0 text-brass" />
            Luni – Sâmbătă, 10:00 – 21:00
          </li>
        </ul>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link href={`/rezervare?locatie=${loc.slug}`} className="btn btn-gold btn-md">
            <Bolt width={17} height={17} />
            Rezervă la {loc.short_name}
          </Link>
          {loc.maps_url && (
            <a href={loc.maps_url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-md">
              Indicații rutiere
            </a>
          )}
          <a href={`tel:${loc.phone}`} className="btn btn-ghost btn-md">
            Sună
          </a>
        </div>
      </header>

      <section className="mt-10">
        <h2 className="display text-3xl leading-none text-cream">
          Echipa ({team.length})
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {team.map((b) => (
            <Link
              key={b.id}
              href={`/rezervare?frizer=${b.id}`}
              className="card p-4 transition-all hover:border-brass/45"
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
              </p>
            </Link>
          ))}
        </div>
      </section>
    </Wrap>
  );
}
