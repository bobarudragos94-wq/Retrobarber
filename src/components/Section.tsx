export function SectionHead({
  eyebrow, title, sub, action,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="display mt-1.5 text-[32px] leading-none text-cream sm:text-[42px]">{title}</h2>
        {sub && <p className="mt-2.5 max-w-lg text-sm leading-relaxed text-muted">{sub}</p>}
      </div>
      {action && <div className="hidden shrink-0 sm:block">{action}</div>}
    </div>
  );
}

export function Wrap({
  children, className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`mx-auto max-w-6xl px-4 sm:px-6 ${className}`}>{children}</div>;
}
