"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Barber, Location, Service, Slot } from "@/lib/types";
import { usePrefs } from "@/lib/prefs";
import { hhmm, relativeDay } from "@/lib/time";
import { lei } from "@/lib/format";
import { ConfirmSheet } from "./ConfirmSheet";
import { ArrowRight, Bolt, Clock, Pin, Sparkle, User } from "./Icons";

const TIME_BANDS = [
  { label: "Dimineața", hint: "10 – 13", value: 690 },
  { label: "Prânz", hint: "13 – 17", value: 900 },
  { label: "Seara", hint: "17 – 21", value: 1140 },
];

type Props = {
  locations: Location[];
  barbers: Barber[];
  services: Service[];
};

/**
 * Motorul de rezervare rapidă din prima pagină.
 * Client cunoscut → 3 sloturi propuse + un tap. Client nou → locație, apoi un tap.
 */
export function QuickBook({ locations, barbers, services }: Props) {
  const { prefs, ready, save } = usePrefs();
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [picked, setPicked] = useState<Slot | null>(null);
  const [band, setBand] = useState<number | null>(null);

  const defaultService = useMemo(
    () => services.find((s) => s.slug === "tuns-clasic") ?? services[0],
    [services],
  );
  const service = useMemo(
    () => services.find((s) => s.id === prefs.serviceId) ?? defaultService,
    [services, prefs.serviceId, defaultService],
  );
  const barber = barbers.find((b) => b.id === prefs.barberId);
  const location =
    locations.find((l) => l.id === (barber?.location_id ?? prefs.locationId)) ?? null;

  const effectiveTime = band ?? prefs.preferredTimeMin ?? null;

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (prefs.barberId) params.set("barberId", prefs.barberId);
    if (location?.id) params.set("locationId", location.id);
    if (service?.id) params.set("serviceId", service.id);
    if (effectiveTime !== null) params.set("time", String(effectiveTime));
    try {
      const res = await fetch(`/api/suggest?${params}`, { cache: "no-store" });
      const data = await res.json();
      setSlots(data.slots ?? []);
    } catch {
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [prefs.barberId, location?.id, service?.id, effectiveTime]);

  useEffect(() => {
    if (!ready) return;
    void load();
  }, [ready, load]);

  const returning = ready && Boolean(prefs.name && prefs.phone);

  return (
    <>
      <div className="card card-hi grain relative overflow-hidden p-5 sm:p-6">
        <div className="pole absolute inset-y-0 left-0 w-[3px] opacity-70" />

        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow flex items-center gap-1.5">
              <Bolt width={13} height={13} />
              {returning ? "Rezervare în 1 tap" : "Rezervare rapidă"}
            </p>
            <h2 className="display mt-1 text-[24px] leading-none text-cream sm:text-3xl">
              {returning ? (
                <>Bine ai revenit{prefs.name ? `, ${prefs.name.split(" ")[0]}` : ""}</>
              ) : (
                <>Alege ora. Restul e gata.</>
              )}
            </h2>
            <p className="mt-1.5 text-[13px] leading-snug text-muted sm:text-sm">
              {returning && barber && location ? (
                <>
                  Ultima dată: <span className="text-cream">{barber.name}</span> la{" "}
                  <span className="text-cream">Retro {location.short_name}</span> ·{" "}
                  {service?.name}
                </>
              ) : (
                <>Îți propunem cele mai bune 3 intervale, în funcție de ce alegi.</>
              )}
            </p>
          </div>
        </div>

        {/* Locatia — filtru, nu pas obligatoriu */}
        <div className="mt-4">
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-faint">
            Unde vrei să vii?
          </p>
          <div className="hscroll">
            <button
              type="button"
              data-on={!location}
              className="chip"
              onClick={() => save({ locationId: undefined, barberId: undefined })}
            >
              Oriunde
            </button>
            {locations.map((l) => (
              <button
                key={l.id}
                type="button"
                data-on={location?.id === l.id}
                className="chip"
                onClick={() =>
                  save({
                    locationId: l.id,
                    serviceId: service?.id,
                    barberId: barber?.location_id === l.id ? barber.id : undefined,
                  })
                }
              >
                <Pin width={14} height={14} className="text-brass" />
                {l.short_name}
              </button>
            ))}
          </div>
        </div>

        {/* Preferinta de ora */}
        <div className="mt-3.5">
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-faint">
            Când preferi?
          </p>
          <div className="hscroll">
            {TIME_BANDS.map((b) => {
              const on =
                effectiveTime !== null &&
                Math.abs(effectiveTime - b.value) <= 120;
              return (
                <button
                  key={b.value}
                  type="button"
                  data-on={on}
                  className="chip"
                  onClick={() => {
                    setBand(b.value);
                    save({ preferredTimeMin: b.value });
                  }}
                >
                  <Clock width={14} height={14} />
                  {b.label}
                  <span className="text-[11px] text-faint">{b.hint}</span>
                </button>
              );
            })}
            <Link href="/rezervare" className="chip text-muted">
              Toate orele
            </Link>
          </div>
        </div>

        {/* Sloturile propuse */}
        <div className="mt-4 space-y-2">
          {loading || !ready ? (
            <>
              <div className="skeleton h-[70px]" />
              <div className="skeleton h-[70px]" />
              <div className="skeleton h-[70px]" />
            </>
          ) : slots && slots.length > 0 ? (
            slots.map((slot, i) => (
              <button
                key={`${slot.date}-${slot.startMin}-${slot.barberId}`}
                type="button"
                onClick={() => setPicked(slot)}
                style={{ animationDelay: `${i * 60}ms` }}
                className="rise group block w-full rounded-2xl border border-line bg-white/[0.025] p-3 text-left transition-all hover:border-brass/50 hover:bg-brass/[0.07] active:scale-[0.99]"
              >
                {i === 0 && slot.reason && (
                  <span className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-brass">
                    <Sparkle width={11} height={11} />
                    {slot.reason}
                  </span>
                )}
                <span className="flex items-center gap-3">
                  <span className="grid h-12 w-[62px] shrink-0 place-items-center rounded-xl border border-brass/30 bg-brass/10">
                    <span className="display text-xl leading-none text-brass-2">
                      {hhmm(slot.startMin)}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold capitalize text-cream">
                      {relativeDay(slot.date)}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted">
                      <User width={12} height={12} className="shrink-0" />
                      {slot.barberName}
                      <span className="text-faint">·</span>
                      {slot.locationName}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-cream">
                    {lei(slot.price)}
                  </span>
                  <ArrowRight
                    width={18}
                    height={18}
                    className="shrink-0 text-faint transition-colors group-hover:text-brass"
                  />
                </span>
              </button>
            ))
          ) : (
            <div className="rounded-2xl border border-line bg-white/[0.02] p-5 text-center text-sm text-muted">
              Nu am găsit sloturi în intervalul ales.
              <Link href="/rezervare" className="ml-1 text-brass underline">
                Vezi toate orele
              </Link>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-line-soft pt-4">
          <p className="flex items-center gap-1.5 text-xs text-faint">
          <Sparkle width={13} height={13} className="text-brass" />
          {returning
            ? "Preferințele tale sunt salvate pe acest dispozitiv."
            : "Ținem minte alegerea ta pentru data viitoare."}
          </p>
          <Link href="/rezervare" className="text-xs font-semibold text-brass hover:underline">
            Alt frizer →
          </Link>
        </div>
      </div>

      <ConfirmSheet
        slot={picked}
        service={services.find((s) => s.id === picked?.serviceId)}
        source="quick"
        onClose={() => setPicked(null)}
      />
    </>
  );
}
