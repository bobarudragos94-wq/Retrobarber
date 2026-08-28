"use client";

import { useCallback, useEffect, useState } from "react";
import type { Prefs } from "./types";

const KEY = "retro.prefs.v1";
const EVT = "retro:prefs";

export function readPrefs(): Prefs {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Prefs) : {};
  } catch {
    return {};
  }
}

export function writePrefs(patch: Prefs): Prefs {
  if (typeof window === "undefined") return {};
  const next = { ...readPrefs(), ...patch };
  for (const k of Object.keys(next) as (keyof Prefs)[]) {
    if (next[k] === undefined || next[k] === "") delete next[k];
  }
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(EVT, { detail: next }));
  } catch {
    /* quota / private mode */
  }
  return next;
}

export function clearPrefs() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
    window.dispatchEvent(new CustomEvent(EVT, { detail: {} }));
  } catch {
    /* ignore */
  }
}

/**
 * Preferintele clientului (frizer, locatie, serviciu, ora preferata).
 * `ready` devine true dupa hidratare, ca sa nu apara nepotriviri server/client.
 */
export function usePrefs(): {
  prefs: Prefs;
  ready: boolean;
  save: (patch: Prefs) => void;
  reset: () => void;
} {
  const [prefs, setPrefs] = useState<Prefs>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPrefs(readPrefs());
    setReady(true);
    const onChange = (e: Event) => setPrefs((e as CustomEvent<Prefs>).detail ?? readPrefs());
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setPrefs(readPrefs());
    };
    window.addEventListener(EVT, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVT, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const save = useCallback((patch: Prefs) => setPrefs(writePrefs(patch)), []);
  const reset = useCallback(() => {
    clearPrefs();
    setPrefs({});
  }, []);

  return { prefs, ready, save, reset };
}
