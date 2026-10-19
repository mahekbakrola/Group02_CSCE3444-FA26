import { SUPABASE_URL, SUPABASE_KEY } from "./config.ts";

export const COOKIE_PREFIX = "fluxcv";
export const SESSION_AGE = 60 * 60 * 24 * 30;
export interface AuthUser { id: string; email?: string; user_metadata?: { full_name?: string; name?: string } }
export interface Session { access_token: string; refresh_token: string; expires_in: number; user: AuthUser }
export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 400) { super(message); this.status = status; }
}
export async function authRequest<T>(path: string, body?: unknown, token?: string, fetcher: typeof fetch = fetch): Promise<T> {
  const response = await fetcher(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    cache: "no-store", signal: AbortSignal.timeout(12000),
  });
  const data = await response.json() as T;
  if (!response.ok) throw new AuthError("Authentication was unsuccessful.", response.status);
  return data;
}
export function readCookie(header: string | null, name: string): string | undefined {
  const found = header?.split(";").map(p => p.trim()).find(p => p.startsWith(`${name}=`));
  if (!found) return;
  try { return decodeURIComponent(found.slice(name.length + 1)); } catch { return; }
}
export function cookieName(kind: "access" | "refresh" | "verifier", secure: boolean) {
  return `${secure ? "__Host-" : ""}${COOKIE_PREFIX}-${kind}`;
}
export function tokenExpiring(token: string | undefined, now = Date.now()) {
  if (!token) return true;
  try {
    const segment = token.split(".")[1];
    const claims = JSON.parse(atob(segment.replace(/-/g, "+").replace(/_/g, "/"))) as { exp?: number };
    return !claims.exp || claims.exp * 1000 <= now + 60000;
  } catch { return true; }
}
export function sessionValid(value: unknown): value is Session {
  const s = value as Partial<Session> | null;
  return Boolean(s && typeof s.access_token === "string" && s.access_token && typeof s.refresh_token === "string" && s.refresh_token && typeof s.expires_in === "number" && s.expires_in > 0 && s.user?.id);
}
export function assertOrigin(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin || request.headers.get("sec-fetch-site") === "cross-site")
    throw new AuthError("Request origin is not allowed.", 403);
}
export function callbackOrigin(request: Request) {
  const url = new URL(request.url);
  // Never trust forwarded host headers to choose the OAuth return address.
  if (url.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(url.hostname))
    throw new AuthError("Use HTTPS to sign in.", 400);
  return url.origin;
}
export function randomVerifier() {
  const bytes = crypto.getRandomValues(new Uint8Array(48));
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}
export async function pkceChallenge(verifier: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export async function verifiedUser(token: string | undefined, fetcher: typeof fetch = fetch): Promise<AuthUser | null> {
  if (!token) return null;
  try {
    const user = await authRequest<AuthUser>("user", undefined, token, fetcher);
    return user?.id ? user : null;
  } catch { return null; }
}
