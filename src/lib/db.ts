import { createClient, type Client } from "@libsql/client";

declare global {
  // eslint-disable-next-line no-var
  var __retroDb: Client | undefined;
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

export type Row = Record<string, unknown>;

export async function all<T = Row>(sql: string, args: unknown[] = []): Promise<T[]> {
  const rs = await db.execute({ sql, args: args as never });
  return rs.rows as unknown as T[];
}

export async function one<T = Row>(sql: string, args: unknown[] = []): Promise<T | null> {
  const rows = await all<T>(sql, args);
  return rows[0] ?? null;
}

export async function run(sql: string, args: unknown[] = []) {
  return db.execute({ sql, args: args as never });
}
