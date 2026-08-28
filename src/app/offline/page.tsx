import Link from "next/link";
import { Wrap } from "@/components/Section";

export const metadata = {
  title: "Fără conexiune",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <Wrap className="pb-16 pt-20">
      <div className="mx-auto max-w-md text-center">
        <span className="pole mx-auto block h-1.5 w-24 rounded-full opacity-80" />
        <h1 className="display mt-6 text-[42px] leading-none text-cream sm:text-5xl">
          Ești offline
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Nu avem conexiune la internet chiar acum. Poți suna direct la salon
          sau poți încerca din nou peste câteva momente.
        </p>
        <div className="mt-6 flex flex-col gap-2.5">
          <a href="tel:0771717299" className="btn btn-gold btn-lg">
            Sună la 0771 717 299
          </a>
          <Link href="/" className="btn btn-ghost btn-md">
            Încearcă din nou
          </Link>
        </div>
      </div>
    </Wrap>
  );
}
