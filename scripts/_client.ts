import "dotenv/config";
import { createClient } from "@libsql/client";

export function client() {
  const url = process.env.TURSO_DATABASE_URL || "file:local.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  console.log(`→ DB: ${url.startsWith("file:") ? url : url.replace(/\/\/.*@/, "//")}`);
  return createClient({ url, authToken });
}
