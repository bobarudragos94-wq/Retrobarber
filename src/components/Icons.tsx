import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = (p: P) => ({
  width: 20, height: 20, viewBox: "0 0 24 24", fill: "none",
  stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const, ...p,
});

export const Scissors = (p: P) => (
  <svg {...base(p)}>
    <circle cx="6" cy="6" r="2.6" /><circle cx="6" cy="18" r="2.6" />
    <path d="M20 4 8.6 15.4M8.6 8.6 20 20" />
  </svg>
);
export const Clock = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 2" /></svg>
);
export const Pin = (p: P) => (
  <svg {...base(p)}><path d="M12 21s7-5.4 7-10.6A7 7 0 0 0 5 10.4C5 15.6 12 21 12 21Z" /><circle cx="12" cy="10.4" r="2.6" /></svg>
);
export const User = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></svg>
);
export const Bolt = (p: P) => (
  <svg {...base(p)}><path d="M13 2 4.5 13.5H11l-.8 8.5L19.5 10.5H13l0-8.5Z" /></svg>
);
export const Star = (p: P) => (
  <svg {...base(p)}><path d="m12 3.6 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.8l5.9-.8L12 3.6Z" /></svg>
);
export const Check = (p: P) => (
  <svg {...base(p)}><path d="m4.5 12.5 5 5 10-11" /></svg>
);
export const ArrowRight = (p: P) => (
  <svg {...base(p)}><path d="M4 12h15m0 0-6-6m6 6-6 6" /></svg>
);
export const ChevronDown = (p: P) => (
  <svg {...base(p)}><path d="m6 9.5 6 6 6-6" /></svg>
);
export const ChevronLeft = (p: P) => (
  <svg {...base(p)}><path d="m14.5 6-6 6 6 6" /></svg>
);
export const Phone = (p: P) => (
  <svg {...base(p)}><path d="M4.5 5.5c0-.8.7-1.5 1.5-1.5h2.1c.6 0 1.2.4 1.4 1l.9 2.6c.2.6 0 1.2-.5 1.6l-1.2.9a12 12 0 0 0 5.2 5.2l.9-1.2c.4-.5 1-.7 1.6-.5l2.6.9c.6.2 1 .8 1 1.4V18c0 .8-.7 1.5-1.5 1.5A15 15 0 0 1 4.5 5.5Z" /></svg>
);
export const Calendar = (p: P) => (
  <svg {...base(p)}><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M3.5 10h17M8 3.5v3M16 3.5v3" /></svg>
);
export const Card = (p: P) => (
  <svg {...base(p)}><rect x="3" y="5.5" width="18" height="13" rx="2.5" /><path d="M3 10h18M7 14.8h3" /></svg>
);
export const Google = (p: P) => (
  <svg width={20} height={20} viewBox="0 0 24 24" {...p}>
    <path fill="#4285F4" d="M21.6 12.23c0-.75-.07-1.47-.19-2.16H12v4.09h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.74 2.98-4.3 2.98-7.45Z" />
    <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.42l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.75-5.59-4.11H3.06v2.58A10 10 0 0 0 12 22Z" />
    <path fill="#FBBC05" d="M6.41 13.93a6 6 0 0 1 0-3.85V7.5H3.06a10 10 0 0 0 0 9l3.35-2.57Z" />
    <path fill="#EA4335" d="M12 5.98c1.47 0 2.79.5 3.83 1.5l2.87-2.87C16.96 2.98 14.7 2 12 2A10 10 0 0 0 3.06 7.5l3.35 2.58C7.2 7.73 9.4 5.98 12 5.98Z" />
  </svg>
);
export const Sparkle = (p: P) => (
  <svg {...base(p)}><path d="M12 3.5 13.6 9 19 10.6 13.6 12.2 12 17.7 10.4 12.2 5 10.6 10.4 9 12 3.5ZM18.5 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" /></svg>
);
export const Repeat = (p: P) => (
  <svg {...base(p)}><path d="M4 9a5 5 0 0 1 5-5h8m0 0-3-3m3 3-3 3M20 15a5 5 0 0 1-5 5H7m0 0 3 3m-3-3 3-3" /></svg>
);
export const Close = (p: P) => (
  <svg {...base(p)}><path d="m6 6 12 12M18 6 6 18" /></svg>
);
export const Menu = (p: P) => (
  <svg {...base(p)}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const Share = (p: P) => (
  <svg {...base(p)}><path d="M12 15V4m0 0L8.5 7.5M12 4l3.5 3.5M5 13v5.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V13" /></svg>
);
