import { NextResponse } from "next/server";
import { z } from "zod";
import { SUPABASE_URL } from "@/lib/auth/config";
import { authRequest, AuthError, assertOrigin, callbackOrigin, cookieName, readCookie, sessionValid, randomVerifier, pkceChallenge, tokenExpiring, type Session } from "@/lib/auth/core";
import { rateLimit, authFailure, sessionCookies, verifierCookie, secureRequest } from "@/lib/auth/server";
export const dynamic = "force-dynamic";
const form = z.object({ email: z.string().email().max(254), password: z.string().min(8).max(128), name: z.string().trim().min(1).max(100).optional() });
function action(request: Request) { return new URL(request.url).pathname.split("/").at(-1); }
export async function POST(request: Request) {
  try {
    assertOrigin(request);
    const method = action(request);
    if (method === "signout") {
      let access = readCookie(request.headers.get("cookie"), cookieName("access", secureRequest(request)));
      const refresh = readCookie(request.headers.get("cookie"), cookieName("refresh", secureRequest(request)));
      if (refresh && tokenExpiring(access)) try {
        const session = await authRequest<Session>("token?grant_type=refresh_token", { refresh_token: refresh });
        if (sessionValid(session)) access = session.access_token;
      } catch { /* Always let the visitor remove the cookies on this browser. */ }
      if (access) try { await authRequest("logout?scope=local", {}, access); } catch { /* Clear browser cookies even if the provider is unavailable. */ }
      return sessionCookies(NextResponse.json({ ok: true }), request);
    }
    if (!["signup", "signin"].includes(method ?? "")) throw new AuthError("Not found", 404);
    await rateLimit(request);
    if (!request.headers.get("content-type")?.includes("application/json")) throw new AuthError("Use application/json.");
    const raw = await request.text();
    if (raw.length > 4096) throw new AuthError("Request too large.", 413);
    let body: unknown;
    try { body = JSON.parse(raw); } catch { throw new AuthError("Enter a valid signup or sign-in request."); }
    const parsed = form.safeParse(body);
    if (!parsed.success || (method === "signup" && !parsed.data.name)) throw new AuthError("Enter a valid email, your name for signup, and a password of at least 8 characters.");
    const { email, password, name } = parsed.data;
    const session = await authRequest<Session>(method === "signup" ? "signup" : "token?grant_type=password", {
      email: email.toLowerCase(), password, ...(method === "signup" ? { data: { full_name: name } } : {}),
    });
    if (!sessionValid(session)) return NextResponse.json({ error: "Your account could not be signed in yet. If email confirmation is enabled, check your inbox; otherwise try signing in or contact support." }, { status: 400, headers: { "Cache-Control": "no-store" } });
    return sessionCookies(NextResponse.json({ ok: true }), request, session);
  } catch (error) { return authFailure(error); }
}
export async function GET(request: Request) {
  try {
    if (action(request) !== "google") throw new AuthError("Not found", 404);
    if (request.headers.get("sec-fetch-site") === "cross-site") throw new AuthError("Start sign-in from this website.", 403);
    await rateLimit(request);
    const origin = callbackOrigin(request);
    const verifier = randomVerifier();
    const url = new URL(`${SUPABASE_URL}/auth/v1/authorize`);
    url.searchParams.set("provider", "google");
    url.searchParams.set("redirect_to", `${origin}/auth/callback`);
    url.searchParams.set("code_challenge", await pkceChallenge(verifier));
    url.searchParams.set("code_challenge_method", "s256");
    return verifierCookie(NextResponse.redirect(url), request, verifier);
  } catch (error) { return authFailure(error); }
}
