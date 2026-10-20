import { createInterface } from "node:readline/promises";
import { readFileSync, writeFileSync } from "node:fs";
const prompt = createInterface({ input: process.stdin, output: process.stdout });
try {
  const id = (await prompt.question("Paste the database_id from wrangler d1 create fluxcv-db: ")).trim();
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id) || id === "00000000-0000-4000-8000-000000000000") throw Error("Enter the actual database UUID returned by Cloudflare.");
  const file = new URL("../wrangler.jsonc", import.meta.url);
  const config = JSON.parse(readFileSync(file, "utf8"));
  config.d1_databases[0].database_id = id;
  writeFileSync(file, JSON.stringify(config, null, 2) + "\n");
  console.log("Database configured. Continue with npm run db:migrate:remote, npm run build, and npm run deploy.");
} finally { prompt.close(); }
