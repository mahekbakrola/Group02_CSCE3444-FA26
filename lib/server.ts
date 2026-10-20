import { env } from "cloudflare:workers";
import { currentUser } from "@/lib/auth/server";
export function database(): D1Database {
  if (!env.DB) throw Error("Your saved workspace is temporarily unavailable.");
  return env.DB;
}
export async function identity() {
  const u = await currentUser();
  return u ? `supabase:${u.id}` : null;
}
export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const site = new URL(request.url).origin;
  if (origin && origin !== site) throw Error("Request origin is not allowed");
  if (request.headers.get("sec-fetch-site") === "cross-site")
    throw Error("Cross-site requests are not allowed");
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw Error("Use application/json");
}
export function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
