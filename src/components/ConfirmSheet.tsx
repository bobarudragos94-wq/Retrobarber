"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Service, Slot } from "@/lib/types";
import { usePrefs } from "@/lib/prefs";
import { hhmm, relativeDay } from "@/lib/time";
import { lei } from "@/lib/format";
import { Check, Clock, Close, Pin, Scissors, User } from "./Icons";
import { Portal } from "./Portal";

export type ConfirmSheetProps = {
  slot: Slot | null;
  service: Service | undefined;
  source?: "web" | "quick" | "last_minute";
  onClose: () => void;
};

/**
 * Foaia de confirmare. Pentru clientii cunoscuti (nume + telefon salvate)
 * rezervarea se poate trimite cu un singur tap.
 */
export function ConfirmSheet({ slot, service, source = "web", onClose }: ConfirmSheetProps) {
  const router = useRouter();
  const { prefs, save } = usePrefs();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recognized, setRecognized] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slot) return;
    setName(prefs.name ?? "");
    setPhone(prefs.phone ?? "");
    setError(null);
    setNotes("");
  }, [slot, prefs.name, prefs.phone]);

  useEffect(() => {
    if (!slot) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [slot, onClose]);

  if (!slot) return null;

  const known = Boolean(prefs.name && prefs.phone);

  /** Dispozitiv nou, client vechi: completam numele din istoricul telefonului. */
  async function recognize(value: string) {
    if (name.trim().length >= 2 || value.replace(/\D/g, "").length < 10) return;
    try {
      const res = await fetch(`/api/appointments/lookup?phone=${encodeURIComponent(value)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.customer?.name) {
        setName(data.customer.name);
        setRecognized(data.customer.name.split(" ")[0]);
      }
    } catch {
      /* recunoasterea e optionala */
    }
  }

  async function submit() {
    if (!slot) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          barberId: slot.barberId,
          locationId: slot.locationId,
          serviceId: slot.serviceId,
          date: slot.date,
          startMin: slot.startMin,
          preferredTimeMin: prefs.preferredTimeMin ?? slot.startMin,
          notes: notes.trim() || undefined,
          source,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Ceva n-a mers. Încearcă din nou.");
        setBusy(false);
        return;
      }
      save({
        name: name.trim(),
        phone: phone.trim(),
        barberId: slot.barberId,
        locationId: slot.locationId,
        serviceId: slot.serviceId,
        preferredTimeMin: prefs.preferredTimeMin ?? slot.startMin,
        lastAppointmentId: data.code,
      });
      router.push(`/confirmare/${data.code}`);
    } catch {
      setError("Conexiune întreruptă. Verifică internetul și încearcă din nou.");
      setBusy(false);
    }
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Închide"
        className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Confirmă rezervarea"
        className="sheet-in relative w-full max-w-md rounded-t-3xl border border-line bg-ink-2 p-5 pb-safe sm:rounded-3xl sm:pb-5"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line sm:hidden" />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 hidden rounded-full p-1.5 text-faint hover:text-cream sm:block"
          aria-label="Închide"
        >
          <Close width={18} height={18} />
        </button>

        <p className="eyebrow">Confirmă rezervarea</p>
        <h2 className="display mt-1.5 text-3xl text-cream">
          {relativeDay(slot.date)}, {hhmm(slot.startMin)}
        </h2>

        <ul className="mt-4 space-y-2.5 rounded-2xl border border-line-soft bg-white/[0.02] p-4 text-sm">
          <li className="flex items-center gap-2.5 text-muted">
            <Scissors width={16} height={16} className="text-brass" />
            <span className="text-cream">{service?.name ?? "Serviciu"}</span>
            <span className="ml-auto text-faint">{service?.duration_min ?? 40} min</span>
          </li>
          <li className="flex items-center gap-2.5 text-muted">
            <User width={16} height={16} className="text-brass" />
            <span className="text-cream">{slot.barberName}</span>
          </li>
          <li className="flex items-center gap-2.5 text-muted">
            <Pin width={16} height={16} className="text-brass" />
            <span className="text-cream">Retro {slot.locationName}</span>
          </li>
          <li className="flex items-center gap-2.5 border-t border-line-soft pt-2.5 text-muted">
            <Clock width={16} height={16} className="text-brass" />
            <span className="text-cream">
              {hhmm(slot.startMin)} – {hhmm(slot.endMin)}
            </span>
            <span className="ml-auto flex items-baseline gap-2">
              {slot.discountPct > 0 && (
                <span className="text-xs text-faint line-through">{lei(slot.basePrice)}</span>
              )}
              <span className="text-base font-semibold text-brass">{lei(slot.price)}</span>
            </span>
          </li>
        </ul>

        {slot.discountPct > 0 && (
          <p className="mt-3 flex items-center gap-2 rounded-xl border border-barber-red/40 bg-barber-red/10 px-3 py-2 text-xs text-cream">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-barber-red pulse-dot" />
            Reducere last-minute {slot.discountPct}% — valabilă doar pentru acest slot de azi.
          </p>
        )}

        <div className="mt-4 grid gap-2.5">
          <input
            className="field"
            placeholder="Numele tău"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="field"
            placeholder="07xx xxx xxx"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={(e) => void recognize(e.target.value)}
          />
          {recognized && (
            <p className="-mt-1 px-1 text-xs text-brass">
              Bine ai revenit, {recognized}! Ți-am completat datele.
            </p>
          )}
          <input
            className="field"
            placeholder="Mențiuni (opțional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {error && (
          <p role="alert" className="mt-3 rounded-xl border border-barber-red/50 bg-barber-red/10 px-3 py-2 text-sm text-cream">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={busy || name.trim().length < 2 || phone.trim().length < 9}
          className="btn btn-gold btn-lg mt-4 w-full"
        >
          {busy ? "Se confirmă…" : (
            <>
              <Check width={18} height={18} />
              {known ? "Confirmă — un singur tap" : "Confirmă rezervarea"}
            </>
          )}
        </button>

        <p className="mt-3 text-center text-xs leading-relaxed text-faint">
          Fără plată online. Achiți în salon, la finalul ședinței.
        </p>
      </div>
      </div>
    </Portal>
  );
}
