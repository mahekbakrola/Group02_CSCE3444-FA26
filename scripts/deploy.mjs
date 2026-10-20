import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
const config = JSON.parse(readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8"));
if (config.d1_databases[0].database_id === "00000000-0000-4000-8000-000000000000") throw Error("Configure your actual Cloudflare D1 database first: npm run configure:db");
const result = spawnSync(process.execPath, [fileURLToPath(new URL("../node_modules/wrangler/bin/wrangler.js", import.meta.url)), "deploy", "--config", "dist/server/wrangler.json"], { stdio: "inherit" });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
