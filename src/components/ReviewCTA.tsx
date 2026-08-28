"use client";

import { useState } from "react";
import { Google, Star } from "./Icons";

/**
 * Butonul de recenzie Google. Marchează în baza de date că a fost apăsat,
 * apoi deschide formularul Google într-un tab nou.
 */
export function ReviewCTA({
  code,
  reviewUrl,
  locationName,
  primary = false,
}: {
  code: string;
  reviewUrl: string;
  locationName: string;
  primary?: boolean;
}) {
  const [done, setDone] = useState(false);

  function go() {
    setDone(true);
    void fetch(`/api/appointments/${code}/review`, { method: "POST" }).catch(() => {});
    window.open(reviewUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className={`card p-5 ${primary ? "card-hi" : ""}`}>
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-brass/30 bg-brass/10 text-brass">
          <Star width={18} height={18} />
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-cream">
            {primary ? "Cum a fost?" : "Ai mai fost la noi?"}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            O recenzie pe Google pentru Retro {locationName} durează 20 de secunde
            și ne ajută enorm.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={go}
        className={`btn btn-lg mt-4 w-full ${primary ? "btn-gold" : "btn-ghost"}`}
      >
        <Google />
        {done ? "Mulțumim! ★★★★★" : "Lasă o recenzie pe Google"}
      </button>

      <div className="mt-3 flex items-center justify-center gap-1 text-brass">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} width={14} height={14} fill="currentColor" strokeWidth={0} />
        ))}
      </div>
    </div>
  );
}
