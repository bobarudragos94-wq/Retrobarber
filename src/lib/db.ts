import { createClient, type Client } from "@libsql/client";
import { bootstrap } from "./bootstrap";

declare global {
  // eslint-disable-next-line no-var
  var __retroDb: Client | undefined;
  // eslint-disable-next-line no-var
  var __retroReady: Promise<void> | undefined;
}

function build(): Client {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (url) return createClient({ url, authToken });

  // Fallback local pentru dev / build fara Turso configurat.
  return createClient({ url: "file:local.db" });
}

export const db: Client = globalThis.__retroDb ?? build();
if (process.env.NODE_ENV !== "production") globalThis.__retroDb = db;

/**
 * Se asigură că schema există înainte de prima interogare.
 * Promisiunea e memorată, deci verificarea se face o singură dată per instanță;
 * apelurile următoare așteaptă o promisiune deja rezolvată, fără cost.
 */
export function ready(): Promise<void> {
  if (process.env.RETRO_SKIP_BOOTSTRAP === "1") return Promise.resolve();
  if (!globalThis.__retroReady) {
    globalThis.__retroReady = bootstrap(db).catch((err) => {
      // O pornire eșuată nu trebuie memorată: următoarea cerere reîncearcă.
      globalThis.__retroReady = undefined;
      throw err;
    });
  }
  return globalThis.__retroReady;
}

export type Row = Record<string, unknown>;

export async function all<T = Row>(sql: string, args: unknown[] = []): Promise<T[]> {
  await ready();
  const rs = await db.execute({ sql, args: args as never });
  return rs.rows as unknown as T[];
}

export async function one<T = Row>(sql: string, args: unknown[] = []): Promise<T | null> {
  const rows = await all<T>(sql, args);
  return rows[0] ?? null;
}

export async function run(sql: string, args: unknown[] = []) {
  await ready();
  return db.execute({ sql, args: args as never });
}
