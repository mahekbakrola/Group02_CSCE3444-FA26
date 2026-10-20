"use client";
import { useWorkspace } from "./workspace";
import { PageHeading, Panel, Tag } from "./shared";
import { ProfileForm } from "./profile";
import { ShieldCheck } from "lucide-react";
export function Onboarding() {
  const { w, mutate, mode } = useWorkspace();
  if (!w) return null;
  return (
    <>
      <PageHeading
        eyebrow="A FRESH START"
        title="Let’s begin with you."
        description="A few basics, then a conversation about what you’ve done."
      />
      <div className="onboarding-layout">
        <Panel className="onboarding-form">
          <Tag tone="mint">STEP 01 · THE FOUNDATIONS</Tag>
          <h2>Your next chapter starts here.</h2>
          <p className="muted">You can update any of these details later.</p>
          <ProfileForm
            key={mode}
            initial={{
              ...w.profile,
              target: w.profile.target || "Still exploring",
              year: w.profile.year || "First year",
            }}
            onboarding
            onSave={async (p) => {
              await mutate({ type: "profile", profile: p });
              window.location.assign("/interview");
            }}
          />
        </Panel>
        <aside className="onboarding-side">
          <div className="large-star">✧</div>
          <h2>
            Your experience is <br />
            <em>stronger than you think.</em>
          </h2>
          <p>
            You don’t need a polished résumé, the perfect answers, or a previous
            internship.
          </p>
          {[
            "Tell us what you’ve tried",
            "Uncover details you might overlook",
            "Build a résumé from your real story",
          ].map((t, i) => (
            <div className="onboarding-step" key={t}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              {t}
            </div>
          ))}
          <div className="privacy-note">
            <ShieldCheck size={18} />
            <span>
              Your answers stay private. External AI is optional and off by
              default.
            </span>
          </div>
        </aside>
      </div>
    </>
  );
}
