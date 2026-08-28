import type { Metadata } from "next";
import { getLocations, getPlans, getServices } from "@/lib/queries";
import { MembershipPlans } from "@/components/MembershipPlans";
import { Wrap } from "@/components/Section";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Abonamente",
  description:
    "24 de ședințe pe an cu 15% reducere la fiecare. Slot garantat cu frizerul tău, reprogramare gratuită. Fără plată online.",
};

const FAQ = [
  {
    q: "Cum se plătește abonamentul?",
    a: "Deocamdată nu există plată online. Trimiți cererea, te sunăm în maximum 24 de ore și activăm abonamentul la prima vizită în salon.",
  },
  {
    q: "Pot folosi abonamentul în orice locație?",
    a: "Da. Ședințele sunt valabile în toate cele patru saloane Retro din București, indiferent de locația aleasă la înscriere.",
  },
  {
    q: "Ce se întâmplă dacă nu folosesc toate ședințele?",
    a: "Ședințele rămase sunt transferabile: le poți da unui prieten sau unui membru al familiei, în aceeași perioadă de valabilitate.",
  },
  {
    q: "Pot schimba frizerul?",
    a: "Oricând. Abonamentul e legat de tine, nu de un anumit frizer. Aplicația reține ultima ta alegere și îți propune orele lui libere.",
  },
];

export default async function AbonamentePage() {
  const [plans, services, locations] = await Promise.all([
    getPlans(),
    getServices(),
    getLocations(),
  ]);

  return (
    <Wrap className="pb-16 pt-8">
      <header className="mb-7 max-w-2xl">
        <p className="eyebrow">Abonamente Retro</p>
        <h1 className="display mt-2 text-[46px] leading-[0.96] text-cream sm:text-6xl">
          Plătești mai puțin
          <br />
          <span className="gold-text">pentru fiecare tunsoare</span>
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
          Alegi câte ședințe vrei într-un an, iar reducerea se aplică automat la fiecare
          vizită. Fără plată online și fără angajamente ascunse.
        </p>
      </header>

      <div className="space-y-5">
        <MembershipPlans plans={plans} services={services} locations={locations} />
      </div>

      <section className="mt-14">
        <h2 className="display text-[32px] leading-none text-cream sm:text-4xl">Întrebări frecvente</h2>
        <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
          {FAQ.map((f) => (
            <details key={f.q} className="card group p-4">
              <summary className="cursor-pointer list-none text-sm font-semibold text-cream marker:hidden">
                <span className="flex items-center justify-between gap-3">
                  {f.q}
                  <span className="text-brass transition-transform group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </Wrap>
  );
}
