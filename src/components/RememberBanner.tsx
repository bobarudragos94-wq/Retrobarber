"use client";

import { usePrefs } from "@/lib/prefs";
import { hhmm } from "@/lib/time";
import { Sparkle } from "./Icons";

/** Confirmă vizual că preferințele au fost reținute pentru data viitoare. */
export function RememberBanner({
  barberName,
  locationName,
  serviceName,
  startMin,
}: {
  barberName: string;
  locationName: string;
  serviceName: string;
  startMin: number;
}) {
  const { prefs, ready, reset } = usePrefs();
  if (!ready || !prefs.barberId) return null;

  return (
    <div className="card flex items-start gap-3 p-4">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-brass/30 bg-brass/10 text-brass">
        <Sparkle width={16} height={16} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-cream">Am reținut preferințele tale</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          {serviceName} · {barberName} · Retro {locationName} · în jur de {hhmm(startMin)}.
          Data viitoare rezervi dintr-un singur tap.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-2 text-xs font-medium text-faint underline hover:text-cream"
        >
          Șterge preferințele de pe acest dispozitiv
        </button>
      </div>
    </div>
  );
}
