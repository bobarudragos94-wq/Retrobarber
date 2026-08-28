"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Location, MembershipPlan, Service } from "@/lib/types";
import { usePrefs } from "@/lib/prefs";
import { lei } from "@/lib/format";
import { Check, Close, Repeat, Sparkle } from "./Icons";
import { Portal } from "./Portal";

type Props = {
  plans: MembershipPlan[];
  services: Service[];
  locations: Location[];
};

export function MembershipPlans({ plans, services, locations }: Props) {
  const { prefs, save } = usePrefs();
  const [serviceId, setServiceId] = useState(
    () => services.find((s) => s.slug === "tuns-clasic")?.id ?? services[0]?.id ?? "",
  );
  const [openPlan, setOpenPlan] = useState<MembershipPlan | null>(null);

  const service = services.find((s) => s.id === serviceId);

  const math = useMemo(() => {
    const price = service?.price ?? 55;
    return plans.map((p) => {
      const full = price * p.sessions;
      const withPlan = Math.round((full * (100 - p.discount_pct)) / 100);
      return {
        plan: p,
        full,
        withPlan,
        saved: full - withPlan,
        perSession: Math.round(withPlan / p.sessions),
      };
    });
  }, [plans, service?.price]);

  return (
    <>
      {/* Calculator de economie */}
      <div className="card p-5">
        <p className="eyebrow flex items-center gap-1.5">
          <Sparkle width={13} height={13} />
          Cât economisești
        </p>
        <p className="mt-2 text-sm text-muted">
          Alege serviciul pe care îl faci de obicei și îți arătăm diferența pe un an.
        </p>
        <div className="hscroll mt-3">
          {services.map((s) => (
            <button
              key={s.id}
              type="button"
              data-on={s.id === serviceId}
              className="chip"
              onClick={() => setServiceId(s.id)}
            >
              {s.name}
              <span className="text-[11px] text-faint">{s.price} lei</span>
            </button>
          ))}
        </div>
      </div>

      {/* Planurile */}
      <div id="compara" className="grid gap-3 lg:grid-cols-3">
        {math.map(({ plan, full, withPlan, saved, perSession }) => {
          const perks: string[] = plan.perks ? JSON.parse(plan.perks) : [];
          const hi = plan.popular === 1;
          return (
            <div
              key={plan.id}
              className={`card relative flex flex-col p-6 ${hi ? "card-hi grain overflow-hidden" : ""}`}
            >
              {hi && (
                <>
                  <span className="pole absolute inset-y-0 left-0 w-[3px] opacity-70" />
                  <span className="absolute right-5 top-5 rounded-full bg-brass px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink">
                    Cel mai ales
                  </span>
                </>
              )}

              <h3 className="display text-3xl leading-none text-cream">{plan.name}</h3>
              <p className="mt-1.5 text-sm text-muted">{plan.tagline}</p>

              <div className="mt-5 flex items-end gap-2">
                <span className="display text-5xl leading-none text-brass">
                  −{plan.discount_pct}%
                </span>
                <span className="pb-1 text-xs text-faint">
                  la fiecare
                  <br />
                  ședință
                </span>
              </div>

              <dl className="mt-5 space-y-1.5 rounded-2xl border border-line-soft bg-white/[0.02] p-3.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Ședințe / an</dt>
                  <dd className="font-semibold text-cream">{plan.sessions}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Preț / ședință</dt>
                  <dd className="font-semibold text-cream">{lei(perSession)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Fără abonament</dt>
                  <dd className="text-faint line-through">{lei(full)}</dd>
                </div>
                <div className="flex justify-between border-t border-line-soft pt-1.5">
                  <dt className="text-cream">Economisești</dt>
                  <dd className="font-bold text-brass">{lei(saved)}</dd>
                </div>
              </dl>

              <ul className="mt-4 flex-1 space-y-2 text-sm">
                {perks.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-muted">
                    <Check width={15} height={15} className="mt-0.5 shrink-0 text-brass" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => setOpenPlan(plan)}
                className={`btn btn-md mt-5 w-full ${hi ? "btn-gold" : "btn-ghost"}`}
              >
                <Repeat width={16} height={16} />
                Vreau {plan.name}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs leading-relaxed text-faint">
        Fără plată online. Trimiți cererea, te sunăm în maximum 24 de ore și activăm
        abonamentul la prima vizită în salon.
      </p>

      {openPlan && (
        <MembershipSheet
          plan={openPlan}
          locations={locations}
          serviceName={service?.name}
          defaults={{ name: prefs.name, phone: prefs.phone, locationId: prefs.locationId }}
          onSaved={(name, phone) => save({ name, phone })}
          onClose={() => setOpenPlan(null)}
        />
      )}
    </>
  );
}

function MembershipSheet({
  plan, locations, serviceName, defaults, onSaved, onClose,
}: {
  plan: MembershipPlan;
  locations: Location[];
  serviceName?: string;
  defaults: { name?: string; phone?: string; locationId?: string };
  onSaved: (name: string, phone: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(defaults.name ?? "");
  const [phone, setPhone] = useState(defaults.phone ?? "");
  const [email, setEmail] = useState("");
  const [locationId, setLocationId] = useState(defaults.locationId ?? locations[0]?.id ?? "");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setState("busy");
    setError(null);
    try {
      const res = await fetch("/api/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          locationId,
          preferredService: serviceName,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Ceva n-a mers. Încearcă din nou.");
        setState("idle");
        return;
      }
      onSaved(name.trim(), phone.trim());
      setState("done");
    } catch {
      setError("Conexiune întreruptă. Încearcă din nou.");
      setState("idle");
    }
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button type="button" aria-label="Închide" className="absolute inset-0 bg-ink/80 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Cerere abonament ${plan.name}`}
        className="sheet-in relative w-full max-w-md rounded-t-3xl border border-line bg-ink-2 p-5 pb-safe sm:rounded-3xl sm:pb-5"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line sm:hidden" />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-faint hover:text-cream"
          aria-label="Închide"
        >
          <Close width={18} height={18} />
        </button>

        {state === "done" ? (
          <div className="py-4 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-brass/40 bg-brass/12 text-brass">
              <Check width={26} height={26} />
            </span>
            <h2 className="display mt-4 text-3xl text-cream">Cererea a plecat</h2>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted">
              Te sunăm în maximum 24 de ore ca să confirmăm abonamentul{" "}
              <span className="text-cream">{plan.name}</span>. Nu se plătește nimic acum.
            </p>
            <Link href="/rezervare" className="btn btn-gold btn-md mt-5 w-full">
              Rezervă prima ședință
            </Link>
            <button type="button" onClick={onClose} className="btn btn-ghost btn-md mt-2 w-full">
              Închide
            </button>
          </div>
        ) : (
          <>
            <p className="eyebrow">Cerere abonament</p>
            <h2 className="display mt-1.5 text-3xl text-cream">{plan.name}</h2>
            <p className="mt-1.5 text-sm text-muted">
              {plan.sessions} de ședințe pe an, −{plan.discount_pct}% la fiecare.
              Fără plată online.
            </p>

            <div className="mt-4 grid gap-2.5">
              <input className="field" placeholder="Numele tău" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
              <input className="field" placeholder="07xx xxx xxx" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <input className="field" placeholder="Email (opțional)" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <div>
                <p className="mb-1.5 text-xs uppercase tracking-wider text-faint">Locația preferată</p>
                <div className="hscroll">
                  {locations.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      data-on={l.id === locationId}
                      className="chip"
                      onClick={() => setLocationId(l.id)}
                    >
                      {l.short_name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <p role="alert" className="mt-3 rounded-xl border border-barber-red/50 bg-barber-red/10 px-3 py-2 text-sm text-cream">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={submit}
              disabled={state === "busy" || name.trim().length < 2 || phone.trim().length < 9}
              className="btn btn-gold btn-lg mt-4 w-full"
            >
              {state === "busy" ? "Se trimite…" : "Trimite cererea"}
            </button>
            <p className="mt-3 text-center text-xs text-faint">
              Te sunăm pentru confirmare. Poți renunța oricând, fără costuri.
            </p>
          </>
        )}
      </div>
      </div>
    </Portal>
  );
}
