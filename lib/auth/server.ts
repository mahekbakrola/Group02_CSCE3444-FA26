import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { AuthError, cookieName, SESSION_AGE, type Session, verifiedUser } from "./core";
import { env } from "cloudflare:workers";

export function secureRequest(request: Request) { return new URL(request.url).protocol === "https:"; }
export function sessionCookies(response: NextResponse, request: Request, session?: Session) {
  const secure = secureRequest(request);
  for (const kind of ["access", "refresh"] as const) response.cookies.set(cookieName(kind, secure), session?.[`${kind}_token`] ?? "", {
    httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: session ? SESSION_AGE : 0,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
export function verifierCookie(response: NextResponse, request: Request, verifier?: string) {
  response.cookies.set(cookieName("verifier", secureRequest(request)), verifier ?? "", {
    httpOnly: true, secure: secureRequest(request), sameSite: "lax", path: "/", maxAge: verifier ? 600 : 0,
  });
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
export async function currentUser() {
  const jar = await cookies();
  // __Host- cookies cannot be set by a sibling subdomain. The unprefixed
  // development cookie is accepted only on loopback hosts, never in production.
  const h = await headers();
  const host = (h.get("host") ?? "").split(":")[0];
  const local = ["localhost", "127.0.0.1"].includes(host);
  return verifiedUser(jar.get(cookieName("access", !local))?.value);
}
export async function rateLimit(request: Request) {
  if (!env.DB) throw new AuthError("Account services are not configured yet.", 503);
  const ip = request.headers.get("cf-connecting-ip") ?? "local";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
  const key = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
  const bucket = Math.floor(Date.now() / 60000);
  const row = await env.DB.prepare(`INSERT INTO auth_rate_limits (key, bucket, attempts) VALUES (?, ?, 1)
    ON CONFLICT (key) DO UPDATE SET attempts = CASE WHEN bucket = excluded.bucket THEN attempts + 1 ELSE 1 END, bucket = excluded.bucket
    RETURNING attempts`).bind(key, bucket).first<{ attempts: number }>();
  if (!row || row.attempts > 20) throw new AuthError("Too many attempts. Wait a minute and try again.", 429);
  // Bounded by distinct visitor IPs per day; remove inactive entries.
  await env.DB.prepare("DELETE FROM auth_rate_limits WHERE bucket < ?").bind(bucket - 1440).run();
}
export function authFailure(error: unknown) {
  const status = error instanceof AuthError ? error.status : 503;
  let message = error instanceof AuthError ? error.message : "Sign-in service is unavailable. Please try again.";
  if (message === "Authentication was unsuccessful.") message = status === 429 ? "Too many attempts. Please try again later." : "Unable to sign in. Check your details and account settings.";
  return NextResponse.json({ error: message }, { status: status >= 500 ? 503 : status, headers: { "Cache-Control": "no-store" } });
}
