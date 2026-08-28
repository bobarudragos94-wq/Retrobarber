import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAppointmentDetail } from "@/lib/queries";
import { hhmm, longDate, nowMinutes, todayISO } from "@/lib/time";
import { lei, prettyPhone } from "@/lib/format";
import { Wrap } from "@/components/Section";
import { ReviewCTA } from "@/components/ReviewCTA";
import { RememberBanner } from "@/components/RememberBanner";
import { Calendar, Check, Clock, Phone, Pin, Repeat, Scissors, User } from "@/components/Icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rezervare confirmată",
  robots: { index: false, follow: false },
};

export default async function ConfirmarePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const detail = await getAppointmentDetail(decodeURIComponent(code));
  if (!detail) notFound();

  const { appt, location, barber, service } = detail;
  const today = todayISO();
  const isPast =
    appt.date < today || (appt.date === today && appt.end_min <= nowMinutes());

  const reviewUrl =
    location.review_url ??
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `Retro Barbershop ${location.short_name}`,
    )}`;

  return (
    <Wrap className="pb-16 pt-8">
      <div className="mx-auto max-w-lg space-y-3">
        <div className="card card-hi grain relative overflow-hidden p-6 text-center">
          <div className="pole absolute inset-x-0 top-0 h-1 opacity-80" />
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-brass/40 bg-brass/12 text-brass">
            <Check width={26} height={26} />
          </span>
          <p className="eyebrow mt-4">
            {isPast ? "Rezervare finalizată" : "Rezervare confirmată"}
          </p>
          <h1 className="display mt-2 text-[38px] leading-none text-cream sm:text-5xl">
            {hhmm(appt.start_min)} · {location.short_name}
          </h1>
          <p className="mt-2 text-sm text-muted">{longDate(appt.date)}</p>

          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-4 py-2 text-sm">
            <span className="text-faint">Cod</span>
            <span className="font-mono font-semibold tracking-wider text-brass">
              {appt.public_code}
            </span>
          </p>
        </div>

        <div className="card p-5">
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2.5">
              <Scissors width={16} height={16} className="shrink-0 text-brass" />
              <span className="text-cream">{service.name}</span>
              <span className="ml-auto text-faint">{service.duration_min} min</span>
            </li>
            <li className="flex items-center gap-2.5">
              <User width={16} height={16} className="shrink-0 text-brass" />
              <span className="text-cream">{barber.name}</span>
              <span className="ml-auto text-faint">{barber.role}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Pin width={16} height={16} className="mt-0.5 shrink-0 text-brass" />
              <span>
                <span className="block text-cream">Retro {location.short_name}</span>
                <span className="block text-xs text-muted">{location.address}</span>
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <Clock width={16} height={16} className="shrink-0 text-brass" />
              <span className="text-cream">
                {hhmm(appt.start_min)} – {hhmm(appt.end_min)}
              </span>
            </li>
            <li className="flex items-center gap-2.5 border-t border-line-soft pt-3">
              <span className="text-muted">De plată în salon</span>
              <span className="ml-auto flex items-baseline gap-2">
                {appt.discount_pct > 0 && (
                  <span className="text-xs text-faint line-through">{lei(appt.base_price)}</span>
                )}
                <span className="display text-2xl text-brass">{lei(appt.price)}</span>
              </span>
            </li>
          </ul>

          {appt.discount_pct > 0 && (
            <p className="mt-3 rounded-xl border border-barber-red/40 bg-barber-red/10 px-3 py-2 text-xs text-cream">
              Ai prins reducerea last-minute de {appt.discount_pct}% — ai economisit{" "}
              {appt.base_price - appt.price} lei.
            </p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2">
            <a href={`/api/appointments/${appt.public_code}/ics`} className="btn btn-ghost btn-md">
              <Calendar width={16} height={16} />
              Calendar
            </a>
            <a href={`tel:${location.phone}`} className="btn btn-ghost btn-md">
              <Phone width={16} height={16} />
              Sună
            </a>
            {location.maps_url && (
              <a
                href={location.maps_url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost btn-md col-span-2"
              >
                <Pin width={16} height={16} />
                Indicații rutiere
              </a>
            )}
          </div>

          <p className="mt-3 text-center text-xs leading-relaxed text-faint">
            Pentru reprogramare sau anulare, sună la{" "}
            <a href={`tel:${location.phone}`} className="text-brass">
              {prettyPhone(location.phone)}
            </a>
            .
          </p>
        </div>

        <RememberBanner
          barberName={barber.name}
          locationName={location.short_name}
          serviceName={service.name}
          startMin={appt.start_min}
        />

        <ReviewCTA
          code={appt.public_code}
          reviewUrl={reviewUrl}
          locationName={location.short_name}
          primary={isPast}
        />

        <div className="card p-5">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-brass/30 bg-brass/10 text-brass">
              <Repeat width={18} height={18} />
            </span>
            <div>
              <h3 className="text-base font-semibold text-cream">Vii des la noi?</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Cu abonamentul Retro 24 plătești cu 15% mai puțin la fiecare dintre
                cele 24 de ședințe din an.
              </p>
            </div>
          </div>
          <Link href="/abonamente" className="btn btn-ghost btn-md mt-4 w-full">
            Vezi abonamentele
          </Link>
        </div>

        <Link href="/" className="btn btn-ghost btn-md w-full">
          Înapoi la pagina principală
        </Link>
      </div>
    </Wrap>
  );
}
