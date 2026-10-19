"use client";
import { SignoutButton } from "./signout-button";
import { useState, useRef } from "react";
import {
  Download,
  ShieldCheck,
  Sparkles,
  Sun,
  Orbit,
  Trash2,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import { useWorkspace } from "./workspace";
import { PageHeading, Panel, PanelTitle, Tag } from "./shared";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { fetchJson } from "@/lib/client-request";
export function Settings() {
  const { w, mutate, busy, setMode } = useWorkspace();
  const [remove, setRemove] = useState<"profile" | "account" | null>(null);
  const [confirm, setConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const deletion = useRef(false);
  if (!w) return null;
  function exportData() {
    const blob = new Blob([JSON.stringify(w, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "folio-profile-export.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    toast.success("Your profile data has been downloaded.");
  }
  async function deleteData() {
    if (deletion.current || busy || confirm !== "DELETE") return;
    deletion.current = true;
    try {
      setDeleting(true);
      if (remove === "account") {
        await fetchJson("/api/workspace", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ confirm }),
        });
        setMode("personal");
        // Discard both account workspace caches after deleting both workspaces.
        window.location.assign("/profile?workspace=personal");
        return;
      } else await mutate({ type: "reset" });
      toast.success(
        w!.mode === "demo"
            ? "Demo restored"
            : "Profile cleared",
      );
      setRemove(null);
      setConfirm("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Deletion failed.");
    } finally {
      setDeleting(false);
      deletion.current = false;
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="MAKE YOURSELF AT HOME"
        title="Your workspace. Your rules."
        description="Choose how Folio looks, what you share, and what you keep."
      />
      <div className="settings-layout">
        <div>
          <Panel>
            <PanelTitle>Appearance</PanelTitle>
            <div className="setting-row">
              <Sun size={20} />
              <div>
                <Label htmlFor="light-theme">Light theme</Label>
                <p>A brighter workspace with the same clear hierarchy.</p>
              </div>
              <Switch
                id="light-theme"
                checked={w.profile.theme === "light"}
                disabled={busy}
                onCheckedChange={(v) =>
                  void mutate({
                    type: "profile",
                    profile: { ...w.profile, theme: v ? "light" : "dark" },
                  }).catch(() => {})
                }
              />
            </div>
            <div className="setting-row">
              <Orbit size={20} />
              <div>
                <Label htmlFor="motion">Motion & 3D animation</Label>
                <p>System reduced-motion settings are always respected.</p>
              </div>
              <Switch
                id="motion"
                checked={w.profile.motion}
                disabled={busy}
                onCheckedChange={(v) =>
                  void mutate({
                    type: "profile",
                    profile: { ...w.profile, motion: v },
                  }).catch(() => {})
                }
              />
            </div>
          </Panel>
          <Panel>
            <PanelTitle aside={<Tag>OPTIONAL</Tag>}>AI suggestions</PanelTitle>
            <div className="setting-row">
              <Sparkles size={20} />
              <div>
                <Label htmlFor="ai-consent">
                  Allow external AI follow-up suggestions
                </Label>
                <p>
                  When configured, send selected experience answers to the AI
                  provider only when you request suggestions.
                </p>
              </div>
              <Switch
                id="ai-consent"
                checked={w.profile.aiConsent}
                disabled={busy}
                onCheckedChange={(v) =>
                  void mutate({
                    type: "profile",
                    profile: { ...w.profile, aiConsent: v },
                  }).catch(() => {})
                }
              />
            </div>
            <div className="privacy-description">
              <p>
                Your contact fields are excluded. Experience text can still
                contain personal information you typed. Remove details you do
                not want processed externally.
              </p>
              <p>
                Core interviews, résumé creation, and matching work with
                deterministic rules. External AI requires server credentials. No
                API key is entered in this browser.
              </p>
              <p>
                With OpenAI enabled, Folio sets <code>store: false</code>. That
                does not guarantee zero provider retention. Review the
                provider’s current data policy.
              </p>
              <a
                href="https://platform.openai.com/docs/guides/your-data"
                target="_blank"
                rel="noopener noreferrer"
                className="text-link"
              >
                OpenAI data controls
                <ExternalLink size={14} />
              </a>
            </div>
          </Panel>
          <Panel>
            <PanelTitle>Your data</PanelTitle>
            <div className="setting-row">
              <Download size={20} />
              <div>
                <h3>Take your story with you</h3>
                <p>
                  Download your facts, settings, résumé versions, and history as
                  JSON.
                </p>
              </div>
              <button className="subtle-button" onClick={exportData}>
                Export data
              </button>
            </div>
            <div className="setting-row">
              <RotateCcw size={20} />
              <div>
                <h3>
                  {w.mode === "demo"
                    ? "Restore the original demo"
                    : "Clear this profile"}
                </h3>
                <p>
                  {w.mode === "demo"
                    ? "Reset Maya’s sample workspace to its starting point."
                    : "Remove this profile’s facts, résumés, history, and saved jobs."}
                </p>
              </div>
              <button
                className="subtle-button danger-text"
                onClick={() => {
                  setRemove("profile");
                  setConfirm("");
                }}
              >
                {w.mode === "demo" ? "Reset demo" : "Clear profile"}
              </button>
            </div>
            <div className="setting-row">
              <Trash2 size={20} />
              <div>
                <h3>Delete all Folio account data</h3>
                <p>
                  Remove both workspaces and AI operation records. This does not
                  delete your sign-in account.
                </p>
              </div>
              <button
                className="subtle-button danger-text"
                onClick={() => {
                  setRemove("account");
                  setConfirm("");
                }}
              >
                Delete data
              </button>
            </div>
          </Panel>
        </div>
        <aside>
          <Panel>
            <div className="privacy-shield">
              <ShieldCheck size={31} />
            </div>
            <h2>
              Trust is built <br />
              <em>into the details.</em>
            </h2>
            <p>
              Your account owns your records. Every save checks your identity.
              No facts are shared with other users.
            </p>
            <ul className="trust-list">
              <li>Original answers stay inspectable</li>
              <li>Generated claims require review</li>
              <li>No fabricated résumé metrics</li>
              <li>No background job applications</li>
              <li>No automatic external AI calls</li>
            </ul>
            <SignoutButton />
          </Panel>
        </aside>
      </div>
      <AlertDialog
        open={remove !== null}
        onOpenChange={(v) => !v && !deleting && !busy && setRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {remove === "account"
                ? "Delete all your Folio data?"
                : w.mode === "demo"
                  ? "Restore the demo?"
                  : "Clear your personal profile?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {remove === "account"
                ? "Both demo and personal records, including résumé history, will be permanently removed."
                : w.mode === "demo"
                  ? "Your changes to the fictional demo will be replaced with its original sample data."
                  : "Your facts, résumé versions, and history in this workspace will be removed."}{" "}
              Type DELETE to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            aria-label="Type DELETE to confirm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="off"
          />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting || busy}>Keep my data</AlertDialogCancel>
            <AlertDialogAction
              disabled={confirm !== "DELETE" || deleting || busy}
              onClick={(e) => {
                e.preventDefault();
                void deleteData();
              }}
            >
              {deleting ? "Removing..." : "Confirm deletion"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
