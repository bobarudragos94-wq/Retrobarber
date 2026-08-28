"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePrefs } from "@/lib/prefs";
import { Bolt, Phone } from "./Icons";

/** Bara fixa de actiune pe mobil — rezervarea e mereu la un deget distanta. */
export function MobileBar() {
  const pathname = usePathname();
  const { prefs, ready } = usePrefs();

  if (pathname.startsWith("/rezervare") || pathname.startsWith("/confirmare")) return null;

  const returning = ready && Boolean(prefs.barberId || prefs.phone);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line-soft bg-ink/92 px-3 pt-3 backdrop-blur-xl pb-safe md:hidden">
      <div className="flex items-center gap-2">
        <a href="tel:0771717299" className="btn btn-ghost btn-md !px-4" aria-label="Sună la salon">
          <Phone width={18} height={18} />
        </a>
        <Link href="/rezervare" className="btn btn-gold btn-md flex-1">
          <Bolt width={17} height={17} />
          {returning ? "Rezervă în 1 clic" : "Rezervă acum"}
        </Link>
      </div>
    </div>
  );
}
