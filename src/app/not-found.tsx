import Link from "next/link";
import { Wrap } from "@/components/Section";

export default function NotFound() {
  return (
    <Wrap className="pb-16 pt-20">
      <div className="mx-auto max-w-md text-center">
        <p className="display text-[84px] leading-none text-brass">404</p>
        <h1 className="display mt-2 text-[34px] leading-none text-cream">
          Pagina nu există
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Link-ul e greșit sau pagina a fost mutată. Hai înapoi la scaun.
        </p>
        <div className="mt-6 flex flex-col gap-2.5">
          <Link href="/rezervare" className="btn btn-gold btn-lg">
            Rezervă o vizită
          </Link>
          <Link href="/" className="btn btn-ghost btn-md">
            Pagina principală
          </Link>
        </div>
      </div>
    </Wrap>
  );
}
