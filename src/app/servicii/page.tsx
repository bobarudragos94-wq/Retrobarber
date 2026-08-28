import type { Metadata } from "next";
import Link from "next/link";
import { getServices } from "@/lib/queries";
import { ServiceCard } from "@/components/ServiceCard";
import { SectionHead, Wrap } from "@/components/Section";
import { Bolt } from "@/components/Icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Servicii & prețuri",
  description:
    "Lista completă de servicii și prețuri Retro Barbershop: tuns clasic 55 lei, skin fade 70 lei, tuns barbă 50 lei și pachete de la 105 lei.",
};

export default async function ServiciiPage() {
  const services = await getServices();
  const simple = services.filter((s) => s.category === "servicii");
  const packages = services.filter((s) => s.category === "pachete");

  return (
    <Wrap className="pb-16 pt-8">
      <header className="mb-8 max-w-2xl">
        <p className="eyebrow">Servicii & prețuri</p>
        <h1 className="display mt-2 text-[46px] leading-[0.9] text-cream sm:text-6xl">
          Lista de prețuri
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
          Styling inclus la fiecare tunsoare. Prosop cald la fiecare serviciu de barbă.
          Prețurile sunt aceleași în toate cele patru locații.
        </p>
      </header>

      <SectionHead eyebrow="Individual" title="Servicii" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {simple.map((s) => (
          <ServiceCard key={s.id} service={s} />
        ))}
      </div>

      <div className="mt-14">
        <SectionHead
          eyebrow="Recomandate"
          title="Pachete"
          sub="Combinațiile cerute cel mai des — mai avantajoase decât serviciile luate separat."
        />
        <div className="grid gap-3 sm:grid-cols-3">
          {packages.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      </div>

      <div className="card grain relative mt-14 overflow-hidden p-8 text-center">
        <h2 className="display text-[34px] leading-none text-cream sm:text-5xl">
          Gata să alegi ora?
        </h2>
        <p className="mx-auto mt-2.5 max-w-md text-sm text-muted">
          Îți propunem cele mai bune trei intervale, în funcție de frizerul și ora ta preferată.
        </p>
        <Link href="/rezervare" className="btn btn-gold btn-lg mx-auto mt-5">
          <Bolt width={18} height={18} />
          Rezervă acum
        </Link>
      </div>
    </Wrap>
  );
}
