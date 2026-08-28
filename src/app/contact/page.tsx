import type { Metadata } from "next";
import Link from "next/link";
import { getLocations } from "@/lib/queries";
import { Wrap } from "@/components/Section";
import { prettyPhone } from "@/lib/format";
import { Bolt, Clock, Phone, Pin } from "@/components/Icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactează Retro Barbershop: telefon pentru fiecare din cele patru locații din București, email și program.",
};

export default async function ContactPage() {
  const locations = await getLocations();

  return (
    <Wrap className="pb-16 pt-8">
      <header className="mb-8 max-w-2xl">
        <p className="eyebrow">Contact</p>
        <h1 className="display mt-2 text-[46px] leading-[0.96] text-cream sm:text-6xl">
          Hai să vorbim
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
          Cel mai rapid rezervi din aplicație. Dacă preferi telefonul, sună direct la
          locația care îți e mai aproape.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {locations.map((l) => (
          <div key={l.id} className="card p-5">
            <h2 className="display text-2xl leading-none text-cream">Retro {l.short_name}</h2>
            <p className="mt-2 flex items-start gap-2 text-sm text-muted">
              <Pin width={15} height={15} className="mt-0.5 shrink-0 text-brass" />
              {l.address}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={`tel:${l.phone}`} className="btn btn-gold btn-sm">
                <Phone width={15} height={15} />
                {prettyPhone(l.phone)}
              </a>
              <Link href={`/rezervare?locatie=${l.slug}`} className="btn btn-ghost btn-sm">
                Rezervă
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-6 p-6">
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <p className="eyebrow">Program</p>
            <p className="mt-2 flex items-start gap-2 text-sm text-muted">
              <Clock width={15} height={15} className="mt-0.5 shrink-0 text-brass" />
              <span>
                Luni – Sâmbătă: <span className="text-cream">10:00 – 21:00</span>
                <br />
                Duminică: <span className="text-cream">Închis</span>
              </span>
            </p>
          </div>
          <div>
            <p className="eyebrow">Email</p>
            <a href="mailto:retrobsh@gmail.com" className="mt-2 block text-sm text-cream hover:text-brass">
              retrobsh@gmail.com
            </a>
          </div>
          <div>
            <p className="eyebrow">Social</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <a href="https://www.instagram.com/retro_barbershop_inc/" target="_blank" rel="noreferrer" className="chip">Instagram</a>
              <a href="https://www.tiktok.com/@retro_barbershop_inc" target="_blank" rel="noreferrer" className="chip">TikTok</a>
            </div>
          </div>
        </div>
      </div>

      <div className="card grain relative mt-6 overflow-hidden p-8 text-center">
        <h2 className="display text-[32px] leading-none text-cream sm:text-4xl">
          Mai rapid decât un telefon
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          Alegi ora, confirmi cu un tap. Fără așteptare, fără plată online.
        </p>
        <Link href="/rezervare" className="btn btn-gold btn-lg mx-auto mt-5">
          <Bolt width={18} height={18} />
          Rezervă acum
        </Link>
      </div>
    </Wrap>
  );
}
