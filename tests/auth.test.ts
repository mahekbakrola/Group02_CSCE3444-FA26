import { test } from "node:test";
import assert from "node:assert/strict";
import { assertOrigin, authRequest, cookieName, pkceChallenge, randomVerifier, readCookie, sessionValid, tokenExpiring, verifiedUser } from "../lib/auth/core.ts";
test("forged/expired JWTs are never treated as verified users", async () => {
  const forged = `x.${btoa(JSON.stringify({ exp: 9999999999, sub: "victim" }))}.x`;
  let calls = 0;
  const fetcher = (async (_url: unknown, init?: RequestInit) => {
    calls++; assert.equal(new Headers(init?.headers).get("authorization"), `Bearer ${forged}`);
    return Response.json({ error: "invalid token" }, { status: 401 });
  }) as typeof fetch;
  assert.equal(tokenExpiring(forged), false);
  assert.equal(await verifiedUser(forged, fetcher), null);
  assert.equal(calls, 1);
});
test("missing identity does not make a provider request or provide a shared user", async () => {
  const fetcher = (async () => { throw Error("Must not fetch"); }) as typeof fetch;
  assert.equal(await verifiedUser(undefined, fetcher), null);
});
test("server uses verified Supabase user ID, not an email claim", async () => {
  const fetcher = (async () => Response.json({ id: "user-a", email: "someone@example.com" })) as typeof fetch;
  assert.equal((await verifiedUser("valid-token", fetcher))?.id, "user-a");
});
test("provider failure fails closed", async () => {
  assert.equal(await verifiedUser("token", (async () => { throw Error("offline"); }) as typeof fetch), null);
});
test("refresh detection includes expired and malformed tokens", () => {
  const jwt = (exp: number) => `x.${btoa(JSON.stringify({ exp }))}.x`;
  assert.equal(tokenExpiring(jwt(100), 100000), true);
  assert.equal(tokenExpiring(jwt(200), 100000), false);
  assert.equal(tokenExpiring("bad"), true);
});
test("PKCE matches the RFC7636 known vector and uses random distinct verifiers", async () => {
  assert.equal(await pkceChallenge("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"), "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM");
  assert.match(randomVerifier(), /^[a-f0-9]{96}$/);
  assert.notEqual(randomVerifier(), randomVerifier());
});
test("credential POSTs reject missing and cross-origin requests", () => {
  for (const origin of [undefined, "https://attacker.example"]) assert.throws(() => assertOrigin(new Request("https://fluxcv.com/api/auth/signin", { headers: origin ? { origin } : {} })));
  assert.doesNotThrow(() => assertOrigin(new Request("https://fluxcv.com/api/auth/signin", { headers: { origin: "https://fluxcv.com" } })));
});
test("production cookies have host-only prefix and cookie parser handles malformed data", () => {
  assert.equal(cookieName("refresh", true), "__Host-fluxcv-refresh");
  assert.equal(readCookie("a=1; __Host-fluxcv-refresh=value", cookieName("refresh", true)), "value");
  assert.equal(readCookie("a=%ZZ", "a"), undefined);
});
test("successful signup/login/refresh requires tokens and provider user", () => {
  assert.equal(sessionValid({ user: { id: "someone" } }), false);
  assert.equal(sessionValid({ access_token: "a", refresh_token: "r", expires_in: 3600, user: { id: "someone" } }), true);
});
test("password and refresh requests use the publishable API key and never expose results to untrusted endpoints", async () => {
  const fetcher = (async (url: unknown, init?: RequestInit) => {
    assert.equal(String(url), "https://lldojkygxibiwuhennvu.supabase.co/auth/v1/token?grant_type=refresh_token");
    assert.match(new Headers(init?.headers).get("apikey") ?? "", /^sb_publishable_/);
    assert.equal(init?.body, JSON.stringify({ refresh_token: "refresh" }));
    return Response.json({ access_token: "new-token" });
  }) as typeof fetch;
  assert.deepEqual(await authRequest("token?grant_type=refresh_token", { refresh_token: "refresh" }, undefined, fetcher), { access_token: "new-token" });
});
