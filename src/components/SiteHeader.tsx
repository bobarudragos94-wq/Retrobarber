"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { Close, Menu, Phone } from "./Icons";

const NAV = [
  { href: "/rezervare", label: "Rezervă" },
  { href: "/servicii", label: "Servicii" },
  { href: "/abonamente", label: "Abonamente" },
  { href: "/echipa", label: "Echipa" },
  { href: "/locatii", label: "Locații" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        solid ? "border-b border-line-soft bg-ink/85 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Retro Barbershop — acasă">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                pathname === item.href ? "text-brass" : "text-muted hover:text-cream"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a href="tel:0771717299" className="btn btn-ghost btn-sm hidden sm:inline-flex" aria-label="Sună">
            <Phone width={16} height={16} />
            <span className="hidden md:inline">Sună</span>
          </a>
          <Link href="/rezervare" className="btn btn-gold btn-sm">
            Rezervă
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Închide meniul" : "Deschide meniul"}
            aria-expanded={open}
            className="btn btn-ghost btn-sm !px-2.5 lg:hidden"
          >
            {open ? <Close width={18} height={18} /> : <Menu width={18} height={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 top-16 z-50 bg-ink/97 backdrop-blur-xl lg:hidden">
          <nav className="flex flex-col gap-1 px-4 pt-4">
            {NAV.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                style={{ animationDelay: `${i * 35}ms` }}
                className="rise flex items-center justify-between border-b border-line-soft py-4 text-lg text-cream"
              >
                {item.label}
                <span className="text-faint">→</span>
              </Link>
            ))}
            <a href="tel:0771717299" className="btn btn-ghost btn-md mt-5">
              <Phone width={17} height={17} /> 0771 717 299
            </a>
            <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost btn-md mt-2">
              <Close width={17} height={17} /> Închide
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
