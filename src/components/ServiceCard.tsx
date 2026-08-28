import Link from "next/link";
import type { Service } from "@/lib/types";
import { lei } from "@/lib/format";
import { Clock } from "./Icons";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/rezervare?serviciu=${service.slug}`}
      className="card group flex flex-col p-5 transition-all hover:border-brass/45 hover:bg-white/[0.045]"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="display text-2xl leading-none text-cream">{service.name}</h3>
        {service.popular === 1 && (
          <span className="shrink-0 rounded-full bg-brass/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-brass">
            Popular
          </span>
        )}
      </div>
      {service.description && (
        <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted">{service.description}</p>
      )}
      <div className="mt-5 flex items-center justify-between border-t border-line-soft pt-4">
        <span className="flex items-center gap-1.5 text-xs text-faint">
          <Clock width={13} height={13} />
          {service.duration_min} min
        </span>
        <span className="display text-2xl text-brass">{lei(service.price)}</span>
      </div>
    </Link>
  );
}
