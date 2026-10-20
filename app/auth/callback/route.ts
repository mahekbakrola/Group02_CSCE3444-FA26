import { NextResponse } from "next/server";
import { authRequest, cookieName, readCookie, sessionValid, type Session } from "@/lib/auth/core";
import { sessionCookies, verifierCookie, secureRequest } from "@/lib/auth/server";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const verifier = readCookie(request.headers.get("cookie"), cookieName("verifier", secureRequest(request)));
  const code = url.searchParams.get("code");
  try {
    if (!code || code.length > 2048 || !verifier || !/^[a-f0-9]{96}$/.test(verifier)) throw Error("Invalid callback");
    const session = await authRequest<Session>("token?grant_type=pkce", { auth_code: code, code_verifier: verifier });
    if (!sessionValid(session)) throw Error("Invalid session");
    return verifierCookie(sessionCookies(NextResponse.redirect(new URL("/dashboard?workspace=personal", url)), request, session), request);
  } catch {
    return verifierCookie(NextResponse.redirect(new URL("/signin?error=google", url)), request);
  }
}
