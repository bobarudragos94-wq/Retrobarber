"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Barber, Location, Service, Slot } from "@/lib/types";
import { usePrefs } from "@/lib/prefs";
import { addDays, dayName, dayNumber, hhmm, nowMinutes, todayISO, weekday } from "@/lib/time";
import { BOOKING_HORIZON_DAYS, MIN_LEAD_MIN } from "@/lib/config";
import { avatarTint, initials, lei } from "@/lib/format";
import { ConfirmSheet } from "./ConfirmSheet";
import { Check, Clock, Pin, Scissors, Sparkle, User } from "./Icons";

type Props = {
  locations: Location[];
  barbers: Barber[];
  services: Service[];
  /** Preselecție din URL (?serviciu=, ?locatie=, ?frizer=) — bate preferințele salvate. */
  initial?: { serviceId?: string; locationId?: string; barberId?: string };
};

const ANY = "any";

function Section({
  step, title, value, children, done,
}: {
  step: number;
  title: string;
  value?: string;
  done?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-4 sm:p-5">
      <header className="mb-3 flex items-center gap-2.5">
        <span
          className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
            done ? "bg-brass text-ink" : "border border-line text-faint"
          }`}
        >
          {done ? <Check width={13} height={13} /> : step}
        </span>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-cream">{title}</h2>
        {value && <span className="ml-auto truncate text-xs text-brass">{value}</span>}
      </header>
      {children}
    </section>
  );
}

export function BookingFlow({ locations, barbers, services, initial }: Props) {
  const { prefs, ready, save } = usePrefs();

  const [serviceId, setServiceId] = useState<string>("");
  const [locationId, setLocationId] = useState<string>("");
  const [barberId, setBarberId] = useState<string>(ANY);
  const [date, setDate] = useState<string>(todayISO());
  const [slots, setSlots] = useState<Slot[] | null>(null);
  // se seteaza dupa hidratare: ora curenta nu poate fi randata pe server
  const [nowMin, setNowMin] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState<Slot | null>(null);

  useEffect(() => setNowMin(nowMinutes()), []);

  // Preselectie: intai URL-ul, apoi preferintele salvate, apoi valori implicite.
  useEffect(() => {
    if (!ready) return;
    const chosenBarberId = initial?.barberId ?? prefs.barberId;
    const chosenBarber = barbers.find((b) => b.id === chosenBarberId);
    setServiceId(
      initial?.serviceId ??
        prefs.serviceId ??
        services.find((s) => s.slug === "tuns-clasic")?.id ??
        services[0]?.id ??
        "",
    );
    setLocationId(
      chosenBarber?.location_id ?? initial?.locationId ?? prefs.locationId ?? locations[0]?.id ?? "",
    );
    setBarberId(chosenBarber?.id ?? ANY);
  }, [
    ready, prefs.serviceId, prefs.locationId, prefs.barberId,
    initial?.serviceId, initial?.locationId, initial?.barberId,
    barbers, services, locations,
  ]);

  const service = services.find((s) => s.id === serviceId);
  const location = locations.find((l) => l.id === locationId);
  const locationBarbers = useMemo(
    () => barbers.filter((b) => b.location_id === locationId),
    [barbers, locationId],
  );

  // Daca frizerul ales nu apartine locatiei selectate, revenim la „oricine”.
  useEffect(() => {
    if (barberId !== ANY && !locationBarbers.some((b) => b.id === barberId)) setBarberId(ANY);
  }, [barberId, locationBarbers]);

  const days = useMemo(() => {
    const today = todayISO();
    const out: string[] = [];
    for (let i = 0; i < BOOKING_HORIZON_DAYS && out.length < 14; i++) {
      const iso = addDays(today, i);
      if (location && location.closed_days.split(",").filter(Boolean).map(Number).includes(weekday(iso))) continue;
      // Ziua curenta dispare din selector cand nu mai incape nicio programare.
      if (i === 0 && nowMin !== null && location) {
        const lastStart = location.closes_at - (service?.duration_min ?? 40);
        if (nowMin + MIN_LEAD_MIN > lastStart) continue;
      }
      out.push(iso);
    }
    return out;
  }, [location, nowMin, service?.duration_min]);

  useEffect(() => {
    if (days.length && !days.includes(date)) setDate(days[0]);
  }, [days, date]);

  const loadSlots = useCallback(async () => {
    if (!serviceId || !locationId || !date) return;
    setLoading(true);
    const params = new URLSearchParams({ serviceId, locationId, from: date, days: "1" });
    if (barberId !== ANY) params.set("barberId", barberId);
    try {
      const res = await fetch(`/api/availability?${params}`, { cache: "no-store" });
      const data = await res.json();
      setSlots(data.slots ?? []);
    } catch {
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [serviceId, locationId, barberId, date]);

  useEffect(() => {
    void loadSlots();
  }, [loadSlots]);

  // Pentru „oricine”, pastram un singur frizer pe fiecare oră.
  const timeSlots = useMemo(() => {
    if (!slots) return [];
    const byTime = new Map<number, Slot>();
    for (const s of slots) if (!byTime.has(s.startMin)) byTime.set(s.startMin, s);
    return [...byTime.values()].sort((a, b) => a.startMin - b.startMin);
  }, [slots]);

  const groups = useMemo(
    () => [
      { label: "Dimineața", items: timeSlots.filter((s) => s.startMin < 780) },
      { label: "După-amiaza", items: timeSlots.filter((s) => s.startMin >= 780 && s.startMin < 1020) },
      { label: "Seara", items: timeSlots.filter((s) => s.startMin >= 1020) },
    ],
    [timeSlots],
  );

  const grouped = useMemo(
    () => ({
      servicii: services.filter((s) => s.category === "servicii"),
      pachete: services.filter((s) => s.category === "pachete"),
    }),
    [services],
  );

  return (
    <div className="space-y-3">
      <Section step={1} title="Serviciu" value={service?.name} done={Boolean(service)}>
        <div className="space-y-3">
          {(["servicii", "pachete"] as const).map((cat) => (
            <div key={cat}>
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-faint">
                {cat === "servicii" ? "Servicii" : "Pachete"}
              </p>
              <div className="flex flex-wrap gap-2">
                {grouped[cat].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    data-on={s.id === serviceId}
                    className="chip"
                    onClick={() => {
                      setServiceId(s.id);
                      save({ serviceId: s.id });
                    }}
                  >
                    <Scissors width={13} height={13} />
                    {s.name}
                    <span className="text-[11px] text-faint">{s.price} lei</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section step={2} title="Locație" value={location ? `Retro ${location.short_name}` : undefined} done={Boolean(location)}>
        <div className="grid grid-cols-2 gap-2">
          {locations.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => {
                setLocationId(l.id);
                save({ locationId: l.id });
              }}
              className={`rounded-xl border p-3 text-left transition-all ${
                l.id === locationId
                  ? "border-brass bg-brass/10"
                  : "border-line bg-white/[0.02] hover:border-brass/40"
              }`}
            >
              <span className="flex items-center gap-1.5 text-sm font-semibold text-cream">
                <Pin width={13} height={13} className="text-brass" />
                {l.short_name}
              </span>
              <span className="mt-0.5 block text-[11px] leading-snug text-muted">{l.address}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section
        step={3}
        title="Frizer"
        value={barberId === ANY ? "Oricine e liber" : barbers.find((b) => b.id === barberId)?.name}
        done
      >
        <div className="hscroll">
          <button
            type="button"
            data-on={barberId === ANY}
            className="chip !py-2.5"
            onClick={() => {
              setBarberId(ANY);
              save({ barberId: undefined });
            }}
          >
            <Sparkle width={14} height={14} />
            Oricine e liber
          </button>
          {locationBarbers.map((b) => (
            <button
              key={b.id}
              type="button"
              data-on={b.id === barberId}
              className="chip !py-1.5 !pl-1.5"
              onClick={() => {
                setBarberId(b.id);
                save({ barberId: b.id, locationId: b.location_id });
              }}
            >
              <span
                className="grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold text-brass-2"
                style={{ background: avatarTint(b.name) }}
              >
                {initials(b.name)}
              </span>
              {b.name}
            </button>
          ))}
        </div>
      </Section>

      <Section step={4} title="Ziua" value={`${dayName(date)} ${dayNumber(date)}`} done>
        <div className="hscroll">
          {days.map((iso) => {
            const on = iso === date;
            return (
              <button
                key={iso}
                type="button"
                onClick={() => setDate(iso)}
                className={`w-[62px] rounded-xl border py-2.5 text-center transition-all ${
                  on ? "border-brass bg-brass/12" : "border-line bg-white/[0.02] hover:border-brass/40"
                }`}
              >
                <span className={`block text-[10px] uppercase tracking-wide ${on ? "text-brass" : "text-faint"}`}>
                  {dayName(iso, true)}
                </span>
                <span className={`display block text-xl leading-tight ${on ? "text-brass-2" : "text-cream"}`}>
                  {dayNumber(iso)}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section step={5} title="Ora" done={false}>
        {loading ? (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skeleton h-11" />
            ))}
          </div>
        ) : timeSlots.length === 0 ? (
          <p className="rounded-xl border border-line bg-white/[0.02] p-4 text-center text-sm text-muted">
            Nicio oră liberă în această zi. Încearcă altă zi sau alt frizer.
          </p>
        ) : (
          <div className="space-y-4">
            {groups.map((g) =>
              g.items.length === 0 ? null : (
                <div key={g.label}>
                  <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-faint">
                    <Clock width={12} height={12} />
                    {g.label}
                  </p>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {g.items.map((s) => (
                      <button
                        key={`${s.startMin}-${s.barberId}`}
                        type="button"
                        onClick={() => setPicked(s)}
                        className="h-11 rounded-xl border border-line bg-white/[0.03] text-sm font-semibold text-cream transition-all hover:border-brass hover:bg-brass/12 hover:text-brass-2 active:scale-95"
                      >
                        {hhmm(s.startMin)}
                      </button>
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
        )}

        {service && (
          <p className="mt-4 flex items-center justify-between border-t border-line-soft pt-3 text-sm">
            <span className="flex items-center gap-1.5 text-muted">
              <User width={14} height={14} />
              {service.name} · {service.duration_min} min
            </span>
            <span className="font-semibold text-brass">{lei(service.price)}</span>
          </p>
        )}
      </Section>

      <ConfirmSheet
        slot={picked}
        service={service}
        source="web"
        onClose={() => setPicked(null)}
      />
    </div>
  );
}
