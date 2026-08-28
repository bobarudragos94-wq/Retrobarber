"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Randează conținutul direct în <body>.
 * Necesar pentru dialoguri: un părinte cu animație pe `transform` devine
 * containing block și ar ancora greșit elementele `position: fixed`.
 */
export function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}
