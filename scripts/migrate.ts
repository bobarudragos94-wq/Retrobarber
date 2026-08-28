import { readFileSync } from "node:fs";
import { join } from "node:path";
import { client } from "./_client";

async function main() {
  const db = client();
  const sql = readFileSync(join(process.cwd(), "db", "schema.sql"), "utf8");
  const statements = sql
    .split(";")
    .map((chunk) =>
      chunk
        .split("\n")
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n")
        .trim(),
    )
    .filter(Boolean);

  for (const stmt of statements) {
    await db.execute(stmt);
  }
  console.log(`✓ ${statements.length} instrucțiuni aplicate.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
