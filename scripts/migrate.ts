import { SCHEMA_STATEMENTS } from "../src/lib/schema";
import { client } from "./_client";

async function main() {
  const db = client();
  for (const statement of SCHEMA_STATEMENTS) {
    await db.execute(statement);
  }
  console.log(`✓ ${SCHEMA_STATEMENTS.length} instrucțiuni aplicate.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
