"use client";

import { useEffect, useState } from "react";
import type { Service, Slot } from "@/lib/types";
import { hhmm } from "@/lib/time";
import { lei } from "@/lib/format";
import { usePrefs } from "@/lib/prefs";
import { ConfirmSheet } from "./ConfirmSheet";
import { ArrowRight, Bolt, Close, Pin, User } from "./Icons";
import { Portal } from "./Portal";

type Data = { slots: Slot[]; discountPct: number; count: number };

function useLastMinute(locationId?: string) {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    let alive = true;
    const params = new URLSearchParams();
    if (locationId) params.set("locationId", locationId);
    fetch(`/api/last-minute?${params}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d: Data) => alive && setData(d))
      .catch(() => alive && setData({ slots: [], discountPct: 0, count: 0 }));
    return () => {
      alive = false;
    };
  }, [locationId]);

  return data;
}

/** Butonul din prima pagină pentru locurile rămase libere azi. */
export function LastMinuteBanner({ services }: { services: Service[] }) {
  const { prefs } = usePrefs();
  const data = useLastMinute(prefs.locationId);
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<Slot | null>(null);

  if (!data || data.count === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rise group flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-barber-red/45 bg-gradient-to-r from-barber-red/18 via-barber-red/8 to-transparent p-3.5 text-left transition-all hover:border-barber-red/70 active:scale-[0.99]"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-barber-red/20 text-barber-red">
          <Bolt width={20} height={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-barber-red pulse-dot" />
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-barber-red">
              Locuri libere azi
            </span>
          </span>
          <span className="mt-0.5 block truncate text-[15px] font-semibold text-cream">
            {data.count} {data.count === 1 ? "loc rămas" : "locuri rămase"}
            <span className="text-faint"> · </span>
            <span className="text-barber-red">−{data.discountPct}% azi</span>
          </span>
        </span>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-barber-red/20 text-barber-red transition-colors group-hover:bg-barber-red group-hover:text-cream">
          <ArrowRight width={17} height={17} />
        </span>
      </button>

      {open && (
        <Portal>
          <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
          <button
            type="button"
            aria-label="Închide"
            className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Locuri libere azi"
            className="sheet-in relative flex max-h-[85vh] w-full max-w-md flex-col rounded-t-3xl border border-line bg-ink-2 p-5 pb-safe sm:rounded-3xl sm:pb-5"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line sm:hidden" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-faint hover:text-cream"
              aria-label="Închide"
            >
              <Close width={18} height={18} />
            </button>

            <p className="eyebrow !text-barber-red">−{data.discountPct}% azi</p>
            <h2 className="display mt-1.5 text-3xl text-cream">Locuri rămase libere</h2>
            <p className="mt-1.5 text-sm text-muted">
              Sloturi neocupate în programul de azi. Reducerea se aplică automat, doar pentru azi.
            </p>

            <div className="mt-4 -mx-1 flex-1 space-y-2 overflow-y-auto px-1">
              <LastMinuteList slots={data.slots} onPick={(s) => { setOpen(false); setPicked(s); }} />
            </div>
            </div>
          </div>
        </Portal>
      )}

      <ConfirmSheet
        slot={picked}
        service={services.find((s) => s.id === picked?.serviceId)}
        source="last_minute"
        onClose={() => setPicked(null)}
      />
    </>
  );
}

export function LastMinuteList({
  slots,
  onPick,
}: {
  slots: Slot[];
  onPick: (slot: Slot) => void;
}) {
  if (!slots.length) {
    return (
      <p className="rounded-2xl border border-line bg-white/[0.02] p-5 text-center text-sm text-muted">
        Toate locurile de azi sunt ocupate. Revino mâine sau rezervă din calendar.
      </p>
    );
  }

  return (
    <>
      {slots.map((slot) => (
        <button
          key={`${slot.barberId}-${slot.startMin}`}
          type="button"
          onClick={() => onPick(slot)}
          className="flex w-full items-center gap-3 rounded-2xl border border-line bg-white/[0.025] p-3.5 text-left transition-all hover:border-barber-red/60 hover:bg-barber-red/[0.08] active:scale-[0.99]"
        >
          <span className="grid h-11 w-[62px] shrink-0 place-items-center rounded-xl border border-barber-red/35 bg-barber-red/10">
            <span className="display text-xl leading-none text-cream">{hhmm(slot.startMin)}</span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5 truncate text-sm font-semibold text-cream">
              <User width={13} height={13} className="text-faint" />
              {slot.barberName}
            </span>
            <span className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted">
              <Pin width={12} height={12} />
              Retro {slot.locationName}
            </span>
          </span>
          <span className="shrink-0 text-right">
            <span className="block text-xs text-faint line-through">{lei(slot.basePrice)}</span>
            <span className="block text-sm font-bold text-barber-red">{lei(slot.price)}</span>
          </span>
        </button>
      ))}
    </>
  );
}

/** Varianta de pagină completă. */
export function LastMinutePage({ services }: { services: Service[] }) {
  const data = useLastMinute();
  const [picked, setPicked] = useState<Slot | null>(null);

  return (
    <>
      {!data ? (
        <div className="space-y-2">
          <div className="skeleton h-[70px]" />
          <div className="skeleton h-[70px]" />
          <div className="skeleton h-[70px]" />
        </div>
      ) : (
        <div className="space-y-2">
          <LastMinuteList slots={data.slots} onPick={setPicked} />
        </div>
      )}
      <ConfirmSheet
        slot={picked}
        service={services.find((s) => s.id === picked?.serviceId)}
        source="last_minute"
        onClose={() => setPicked(null)}
      />
    </>
  );
}
