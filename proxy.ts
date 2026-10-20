import { NextRequest, NextResponse } from "next/server";
import { authRequest, AuthError, cookieName, tokenExpiring, sessionValid, SESSION_AGE, type Session } from "./lib/auth/core";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path.startsWith("/_next/") || path.startsWith("/assets/") || path.startsWith("/fonts/") || /\.(?:svg|png|jpg|jpeg|css|js|ttf|woff2?)$/.test(path)) return NextResponse.next();
  // Auth routes issue their own cookies and must not race a session refresh.
  if (request.nextUrl.pathname.startsWith("/api/auth/") || request.nextUrl.pathname === "/auth/callback") return NextResponse.next();
  const secure = request.nextUrl.protocol === "https:";
  const access = request.cookies.get(cookieName("access", secure))?.value;
  const refresh = request.cookies.get(cookieName("refresh", secure))?.value;
  const next = () => {
    const response = NextResponse.next({ request: { headers: request.headers } });
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  };
  if (!refresh || !tokenExpiring(access)) return next();
  try {
    const session = await authRequest<Session>("token?grant_type=refresh_token", { refresh_token: refresh });
    if (!sessionValid(session)) throw new AuthError("Invalid session", 401);
    for (const kind of ["access", "refresh"] as const) request.cookies.set(cookieName(kind, secure), session[`${kind}_token`]);
    const response = next();
    for (const kind of ["access", "refresh"] as const) response.cookies.set(cookieName(kind, secure), session[`${kind}_token`], {
      httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: SESSION_AGE,
    });
    return response;
  } catch (error) {
    // Do not erase a valid refresh token on a temporary network/provider failure.
    if (!(error instanceof AuthError) || ![400, 401, 403].includes(error.status)) return next();
    for (const kind of ["access", "refresh"] as const) request.cookies.delete(cookieName(kind, secure));
    const response = next();
    for (const kind of ["access", "refresh"] as const) response.cookies.set(cookieName(kind, secure), "", { path: "/", httpOnly: true, secure, sameSite: "lax", maxAge: 0 });
    return response;
  }
}
export const config = { matcher: ["/:path*"] };
