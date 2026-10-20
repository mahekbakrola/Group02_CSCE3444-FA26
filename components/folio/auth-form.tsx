"use client";
import { useEffect, useState, useRef, type FormEvent } from "react";
import { fetchJson } from "@/lib/client-request";
import { Orbit } from "lucide-react";

export function AuthForm({ signup = false }: { signup?: boolean }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  useEffect(() => {
    let active = true;
    if (new URLSearchParams(window.location.search).get("error") === "google")
      queueMicrotask(() => { if (active) setError("Google sign-in did not finish. Please try again or sign in with email."); });
    const restored = () => { submitting.current = false; setBusy(false); };
    window.addEventListener("pageshow", restored);
    return () => { active = false; window.removeEventListener("pageshow", restored); };
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    const data = new FormData(event.currentTarget);
    setBusy(true); setError("");
    try {
      await fetchJson(`/api/auth/${signup ? "signup" : "signin"}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: String(data.get("email") ?? "").trim(), password: data.get("password"), ...(signup ? { name: String(data.get("name") ?? "").trim() } : {}) }),
      });
      // A document navigation discards all cached data from any previous account.
      window.location.assign("/dashboard?workspace=personal");
    } catch (e) { setError(e instanceof Error ? e.message : "Please try again."); setBusy(false); submitting.current = false; }
  }
  return <main className="auth-page">
    <div className="auth-card">
      <a className="brand auth-brand" href="/"><Orbit size={28} /> folio<span className="brand-period">.</span></a>
      <h1>{signup ? "Create your account" : "Welcome back"}</h1>
      <p>{signup ? "Save your experience and build your next résumé." : "Sign in to continue your career workspace."}</p>
      <a className="auth-google" href="/api/auth/google" aria-disabled={busy} onClick={(e) => {
        if (submitting.current) { e.preventDefault(); return; }
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        submitting.current = true; setBusy(true);
      }}>
        <span aria-hidden="true">G</span> Continue with Google
      </a>
      <div className="auth-divider"><span>or use email</span></div>
      <form onSubmit={submit}>
        {signup && <label htmlFor="auth-name">Name<input id="auth-name" name="name" autoComplete="name" required maxLength={100} disabled={busy} /></label>}
        <label htmlFor="auth-email">Email<input id="auth-email" name="email" type="email" autoComplete="email" required maxLength={254} disabled={busy} /></label>
        <label htmlFor="auth-password">Password<input id="auth-password" name="password" type="password" autoComplete={signup ? "new-password" : "current-password"} required minLength={8} maxLength={128} disabled={busy} aria-describedby={signup ? "password-help" : undefined} /></label>
        {signup && <p id="password-help" className="auth-hint">Use at least 8 characters.</p>}
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="auth-submit" type="submit" disabled={busy}>{busy ? "Please wait…" : signup ? "Sign up" : "Sign in"}</button>
      </form>
      <p className="auth-switch">{signup ? "Already have an account? " : "New to Folio? "}<a href={signup ? "/signin" : "/signup"}>{signup ? "Sign in" : "Create an account"}</a></p>
      <p className="auth-hint">You’ll stay signed in on this browser until you sign out or your session ends.</p>
    </div>
  </main>;
}
