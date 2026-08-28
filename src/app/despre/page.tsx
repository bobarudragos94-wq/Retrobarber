import type { Metadata } from "next";
import Link from "next/link";
import { getBarbers, getLocations } from "@/lib/queries";
import { Wrap } from "@/components/Section";
import { Bolt, Check } from "@/components/Icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Despre noi",
  description:
    "Înființat în 2018, Retro Barbershop este una dintre cele mai apreciate frizerii din București. Perfecțiune. Pasiune. Tradiție.",
};

const PRINCIPLES = [
  "Atenție la detalii în fiecare tuns și fiecare bărbierit",
  "Servicii de tuns și îngrijire a părului de înaltă calitate",
  "Experiență autentică, inspirată din anii '50 – '60",
  "Tunsori personalizate, adaptate trăsăturilor fiecăruia",
  "Tratamente pentru barbă cu prosop cald",
  "Programare online și flexibilitate orară",
];

export default async function DesprePage() {
  const [locations, barbers] = await Promise.all([getLocations(), getBarbers()]);

  return (
    <Wrap className="pb-16 pt-8">
      <header className="max-w-2xl">
        <p className="eyebrow">Din 2018</p>
        <h1 className="display mt-2 text-[46px] leading-[0.96] text-cream sm:text-6xl">
          Perfecțiune.
          <br />
          Pasiune.
          <br />
          <span className="gold-text">Tradiție.</span>
        </h1>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4 text-[15px] leading-relaxed text-muted">
          <p>
            Înființat în 2018, <span className="text-cream">Retro Barbershop</span> este
            una dintre cele mai apreciate frizerii din București. În doar trei ani s-a
            poziționat ca reper în industrie, cu o atmosferă retro în care bărbaților
            le este definit stilul și look-ul.
          </p>
          <p>
            Aici te poți relaxa și te poți bucura de o experiență în care sunt abordate
            stiluri diferite, de la cele clasice până la cele noi și creative. Echipa e
            alcătuită din profesioniști dedicați și pregătiți la cel mai înalt nivel,
            iar toate locațiile păstrează același standard ridicat al profesionalismului
            și al implicării.
          </p>
          <p>
            Astăzi suntem {barbers.length} de frizeri în {locations.length} locații din
            București — Pallady, Iancului, Titan și Dristor — deschise de luni până
            sâmbătă, între 10:00 și 21:00.
          </p>

          <div className="flex flex-wrap gap-2.5 pt-2">
            <Link href="/rezervare" className="btn btn-gold btn-md">
              <Bolt width={17} height={17} />
              Rezervă o vizită
            </Link>
            <Link href="/echipa" className="btn btn-ghost btn-md">
              Cunoaște echipa
            </Link>
          </div>
        </div>

        <div className="card grain relative overflow-hidden p-6">
          <span className="pole absolute inset-y-0 left-0 w-[3px] opacity-70" />
          <p className="eyebrow">Principiile noastre</p>
          <ul className="mt-4 space-y-2.5">
            {PRINCIPLES.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm text-cream">
                <Check width={16} height={16} className="mt-0.5 shrink-0 text-brass" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <dl className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { k: "2018", v: "anul înființării" },
          { k: `${locations.length}`, v: "locații în București" },
          { k: `${barbers.length}`, v: "frizeri în echipă" },
          { k: "10–21", v: "Luni – Sâmbătă" },
        ].map((s) => (
          <div key={s.v} className="card p-5">
            <dt className="display text-4xl leading-none text-brass">{s.k}</dt>
            <dd className="mt-2 text-xs leading-tight text-faint">{s.v}</dd>
          </div>
        ))}
      </dl>
    </Wrap>
  );
}
