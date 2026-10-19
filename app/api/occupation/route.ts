import { env } from "cloudflare:workers";
import { json } from "@/lib/server";
import { CAREERS, OnetProvider } from "@/lib/providers/careers";
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code") ?? "";
  const local = CAREERS.find((c) => c.code === code);
  if (!local) return json({ error: "Occupation not found" }, 404);
  const config = env as unknown as Record<string, string | undefined>;
  if (!config.ONET_API_KEY)
    return json({
      source: "Curated summary",
      occupation: local,
      url: `https://www.onetonline.org/link/summary/${code}`,
    });
  try {
    return json({
      source: "O*NET Web Services",
      occupation: await new OnetProvider(config.ONET_API_KEY).getOccupation(
        code,
      ),
      url: `https://www.onetonline.org/link/summary/${code}`,
    });
  } catch {
    return json({
      source: "Curated summary — live service unavailable",
      occupation: local,
      url: `https://www.onetonline.org/link/summary/${code}`,
    });
  }
}
