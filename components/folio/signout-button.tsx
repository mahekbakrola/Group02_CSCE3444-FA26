"use client";
import { useState, useRef } from "react";
import { fetchJson } from "@/lib/client-request";
import { LogOut } from "lucide-react";
export function SignoutButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  async function signout() {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true); setError("");
    try {
      await fetchJson("/api/auth/signout", { method: "POST" }, 35000);
      window.location.assign("/signin");
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to sign out."); setBusy(false); submitting.current = false; }
  }
  return <><button className="subtle-button signout" onClick={signout} disabled={busy}><LogOut size={16} />{busy ? "Signing out…" : "Sign out"}</button>{error && <p role="alert">{error}</p>}</>;
}
