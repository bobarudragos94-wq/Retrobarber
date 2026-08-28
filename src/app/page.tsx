import Link from "next/link";
import { getBarbers, getLocations, getPlans, getServices } from "@/lib/queries";
import { QuickBook } from "@/components/QuickBook";
import { LastMinuteBanner } from "@/components/LastMinute";
import { SectionHead, Wrap } from "@/components/Section";
import { ServiceCard } from "@/components/ServiceCard";
import { ArrowRight, Bolt, Check, Pin, Repeat, Scissors, Star } from "@/components/Icons";
import { avatarTint, initials } from "@/lib/format";
import { WordCycle } from "@/components/WordCycle";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [locations, barbers, services, plans] = await Promise.all([
    getLocations(),
    getBarbers(),
    getServices(),
    getPlans(),
  ]);

  const popular = services.filter((s) => s.popular === 1).slice(0, 3);
  const hero = plans.find((p) => p.popular === 1) ?? plans[0];
  const perks: string[] = hero?.perks ? JSON.parse(hero.perks) : [];

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="aurora pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(900px 520px at 78% -8%, rgba(217,171,85,0.16), transparent 62%), radial-gradient(680px 420px at 6% 8%, rgba(200,64,47,0.09), transparent 60%)",
          }}
        />
        <Wrap className="pb-10 pt-8 sm:pt-14">
          {/* Pe mobil cardul de rezervare urca imediat sub titlu; pe desktop sta in dreapta. */}
          <div className="grid items-start gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-x-12 lg:gap-y-7">
            <div className="rise order-1 min-w-0 lg:col-start-1 lg:row-start-1">
              <p className="eyebrow flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <span>București</span>
                <span className="text-line">·</span>
                <span>{locations.length} locații</span>
                <span className="text-line">·</span>
                <span>din 2018</span>
              </p>

              <h1 className="display mt-3 text-[40px] leading-[0.96] text-cream sm:text-[58px] lg:text-[70px]">
                Barbershop autentic
                <br />
                <span className="gold-text">Experiența Retro</span>
              </h1>

              <p className="mt-5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 text-[15px] text-muted sm:text-lg">
                <span>Aici înseamnă</span>
                <WordCycle className="display text-[26px] leading-none sm:text-[34px]" />
              </p>
            </div>

            <div
              className="rise order-2 min-w-0 space-y-3 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:sticky lg:top-24"
              style={{ animationDelay: "90ms" }}
            >
              <LastMinuteBanner services={services} />
              <QuickBook locations={locations} barbers={barbers} services={services} />
            </div>

            <div className="rise order-3 min-w-0 lg:col-start-1 lg:row-start-2" style={{ animationDelay: "60ms" }}>
              <p className="max-w-md text-[15px] leading-relaxed text-muted sm:text-base">
                Din 2018, în patru saloane din București. Aplicația ține minte frizerul,
                locația și ora ta preferată — și îți propune direct cele mai bune trei intervale.
              </p>

              <div className="mt-5 flex flex-wrap gap-2.5">
                <Link href="/rezervare" className="btn btn-gold btn-lg">
                  <Bolt width={18} height={18} />
                  Rezervă acum
                </Link>
                <Link href="/abonamente" className="btn btn-ghost btn-lg">
                  <Repeat width={18} height={18} />
                  Abonament −{hero?.discount_pct ?? 15}%
                </Link>
              </div>

              <dl className="mt-7 grid max-w-md grid-cols-3 gap-3">
                {[
                  { k: "2018", v: "de când tundem" },
                  { k: `${barbers.length}`, v: "frizeri" },
                  { k: "10–21", v: "Luni – Sâmbătă" },
                ].map((s) => (
                  <div key={s.v} className="rounded-2xl border border-line-soft bg-white/[0.025] p-3.5">
                    <dt className="display text-[26px] leading-none text-brass">{s.k}</dt>
                    <dd className="mt-1.5 text-[11px] leading-tight text-faint">{s.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Wrap>
      </section>

      {/* ---------------- CUM FUNCȚIONEAZĂ ---------------- */}
      <Wrap className="py-14">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: <Bolt width={18} height={18} />,
              title: "Un tap, gata",
              text: "Îți ținem minte frizerul, locația și ora preferată. La a doua vizită rezervi dintr-un singur tap.",
            },
            {
              icon: <Star width={18} height={18} />,
              title: "Cele mai bune 3 ore",
              text: "Nu îți dăm un calendar gol. Îți propunem exact trei intervale potrivite pentru tine.",
            },
            {
              icon: <Scissors width={18} height={18} />,
              title: "Fără plată online",
              text: "Rezervi în aplicație, achiți în salon. Reprogramezi oricând, cu un telefon.",
            },
          ].map((f, i) => (
            <div key={f.title} className="card p-5" style={{ animationDelay: `${i * 60}ms` }}>
              <span className="grid h-10 w-10 place-items-center rounded-xl border border-brass/30 bg-brass/10 text-brass">
                {f.icon}
              </span>
              <h3 className="mt-3.5 text-base font-semibold text-cream">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.text}</p>
            </div>
          ))}
        </div>
      </Wrap>

      {/* ---------------- SERVICII ---------------- */}
      <Wrap className="py-6">
        <SectionHead
          eyebrow="Servicii"
          title="Ce ți se potrivește"
          sub="Tuns clasic, skin fade și îngrijirea bărbii cu prosop cald. Styling inclus la fiecare tunsoare."
          action={
            <Link href="/servicii" className="btn btn-ghost btn-md">
              Toate prețurile <ArrowRight width={16} height={16} />
            </Link>
          }
        />
        <div className="grid gap-3 sm:grid-cols-3">
          {popular.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
        <Link href="/servicii" className="btn btn-ghost btn-md mt-4 w-full sm:hidden">
          Toate prețurile <ArrowRight width={16} height={16} />
        </Link>
      </Wrap>

      {/* ---------------- ABONAMENT ---------------- */}
      {hero && (
        <Wrap className="py-14">
          <div className="card card-hi grain relative overflow-hidden p-6 sm:p-10">
            <div className="pole absolute inset-y-0 left-0 w-[3px] opacity-70" />
            <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-center">
              <div>
                <p className="eyebrow">Abonamente Retro</p>
                <h2 className="display mt-2 text-[38px] leading-none text-cream sm:text-5xl">
                  {hero.sessions} de ședințe pe an,
                  <br />
                  <span className="gold-text">−{hero.discount_pct}% la fiecare</span>
                </h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
                  {hero.tagline}. Slot garantat cu frizerul tău, reprogramare gratuită
                  și ședințe transferabile. Fără plată online — abonamentul se activează în salon.
                </p>
                <div className="mt-6 flex flex-wrap gap-2.5">
                  <Link href="/abonamente" className="btn btn-gold btn-md">
                    Vezi abonamentele
                  </Link>
                  <Link href="/abonamente#compara" className="btn btn-ghost btn-md">
                    Compară planurile
                  </Link>
                </div>
              </div>
              <ul className="grid gap-2.5">
                {perks.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 rounded-xl border border-line-soft bg-white/[0.025] p-3 text-sm text-cream">
                    <Check width={16} height={16} className="mt-0.5 shrink-0 text-brass" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Wrap>
      )}

      {/* ---------------- ECHIPA ---------------- */}
      <Wrap className="py-6">
        <SectionHead
          eyebrow="Echipa"
          title={`${barbers.length} frizeri, patru locații`}
          sub="Alege-ți omul. Aplicația îl va ține minte și îți va propune orele lui libere la fiecare vizită."
          action={
            <Link href="/echipa" className="btn btn-ghost btn-md">
              Toată echipa <ArrowRight width={16} height={16} />
            </Link>
          }
        />
        <div className="hscroll">
          {barbers.slice(0, 12).map((b) => {
            const loc = locations.find((l) => l.id === b.location_id);
            return (
              <Link
                key={b.id}
                href={`/rezervare?frizer=${b.id}`}
                className="card w-[148px] p-3.5 transition-all hover:border-brass/45"
              >
                <span
                  className="grid h-14 w-14 place-items-center rounded-2xl text-lg font-bold text-brass-2"
                  style={{ background: avatarTint(b.name) }}
                >
                  {initials(b.name)}
                </span>
                <h3 className="mt-3 text-sm font-semibold text-cream">{b.name}</h3>
                <p className="text-[11px] text-faint">{b.role}</p>
                <p className="mt-2 flex items-center gap-1 text-[11px] text-muted">
                  <Pin width={11} height={11} className="text-brass" />
                  {loc?.short_name}
                </p>
                {b.reviews_count > 0 && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-brass">
                    <Star width={11} height={11} />
                    {b.rating.toFixed(1)}
                    <span className="text-faint">({b.reviews_count})</span>
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </Wrap>

      {/* ---------------- LOCAȚII ---------------- */}
      <Wrap className="py-14">
        <SectionHead
          eyebrow="Locații"
          title="Aproape de tine"
          sub="Patru saloane în București. Luni – Sâmbătă, 10:00 – 21:00."
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {locations.map((l) => (
            <div key={l.id} className="card flex items-center gap-4 p-5">
              <span className="pole h-14 w-1.5 shrink-0 rounded-full opacity-80" />
              <div className="min-w-0 flex-1">
                <h3 className="display text-2xl leading-none text-cream">Retro {l.short_name}</h3>
                <p className="mt-1.5 text-sm text-muted">{l.address}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={`/rezervare?locatie=${l.slug}`} className="btn btn-gold btn-sm">
                    Rezervă
                  </Link>
                  <a href={`tel:${l.phone}`} className="btn btn-ghost btn-sm">
                    {l.phone.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3")}
                  </a>
                  {l.maps_url && (
                    <a href={l.maps_url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                      Hartă
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Wrap>

      {/* ---------------- CTA FINAL ---------------- */}
      <Wrap className="pb-6">
        <div className="card grain relative overflow-hidden p-8 text-center sm:p-12">
          <p className="eyebrow">Perfecțiune. Pasiune. Tradiție.</p>
          <h2 className="display mx-auto mt-3 max-w-xl text-[40px] leading-[0.96] text-cream sm:text-6xl">
            Scaunul tău te așteaptă
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted">
            Alege ora, confirmă cu un tap. Restul îl rezolvăm noi.
          </p>
          <Link href="/rezervare" className="btn btn-gold btn-lg mx-auto mt-6">
            <Bolt width={18} height={18} />
            Rezervă în două tapuri
          </Link>
        </div>
      </Wrap>
    </>
  );
}
