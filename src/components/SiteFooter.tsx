import Link from "next/link";
import { Logo } from "./Logo";
import { getLocations } from "@/lib/queries";

export async function SiteFooter() {
  const locations = await getLocations();

  return (
    <footer className="mt-16 border-t border-line-soft bg-ink-2/60">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Din 2018, una dintre cele mai apreciate frizerii din București.
              Perfecțiune. Pasiune. Tradiție.
            </p>
            <div className="mt-5 flex gap-2">
              <a href="https://www.instagram.com/retro_barbershop_inc/" target="_blank" rel="noreferrer" className="chip">Instagram</a>
              <a href="https://www.tiktok.com/@retro_barbershop_inc" target="_blank" rel="noreferrer" className="chip">TikTok</a>
              <a href="https://www.facebook.com/retrobarbershop1" target="_blank" rel="noreferrer" className="chip">Facebook</a>
            </div>
          </div>

          <div>
            <h3 className="eyebrow">Locații</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {locations.map((l) => (
                <li key={l.id}>
                  <Link href={`/locatii/${l.slug}`} className="font-medium text-cream hover:text-brass">
                    {l.short_name}
                  </Link>
                  <p className="text-muted">{l.address}</p>
                  <a href={`tel:${l.phone}`} className="text-brass">
                    {l.phone.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3")}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="eyebrow">Navigare</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              <li><Link href="/rezervare" className="hover:text-brass">Rezervare rapidă</Link></li>
              <li><Link href="/servicii" className="hover:text-brass">Servicii & prețuri</Link></li>
              <li><Link href="/abonamente" className="hover:text-brass">Abonamente</Link></li>
              <li><Link href="/echipa" className="hover:text-brass">Echipa</Link></li>
              <li><Link href="/despre" className="hover:text-brass">Despre noi</Link></li>
              <li><Link href="/contact" className="hover:text-brass">Contact</Link></li>
            </ul>

            <h3 className="eyebrow mt-8">Program</h3>
            <p className="mt-3 text-sm text-muted">
              Luni – Sâmbătă: <span className="text-cream">10:00 – 21:00</span>
              <br />
              Duminică: <span className="text-cream">Închis</span>
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line-soft pt-6 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Retro Barbershop. Toate drepturile rezervate.</p>
          <p>
            <a href="mailto:retrobsh@gmail.com" className="hover:text-brass">retrobsh@gmail.com</a>
          </p>
        </div>
      </div>
      <div className="pole h-1 w-full opacity-70" />
      {/* spatiu pentru bara mobila fixa */}
      <div className="h-20 md:hidden" />
    </footer>
  );
}
