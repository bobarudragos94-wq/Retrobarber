export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-lg border border-brass/40 bg-ink-2">
        <span className="pole absolute inset-y-0 left-0 w-[3px] opacity-80" />
        <span className="display text-[15px] leading-none text-brass">RB</span>
      </span>
      <span className="leading-none">
        <span className="display block text-[19px] tracking-wide text-cream">Retro</span>
        <span className="block text-[9px] font-semibold uppercase tracking-[0.28em] text-faint">
          Barbershop
        </span>
      </span>
    </span>
  );
}
