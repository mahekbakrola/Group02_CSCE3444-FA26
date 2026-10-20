"use client";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Pencil,
  Trash2,
  ShieldCheck,
  GitBranch,
  Check,
  Upload,
  ArrowRight,
  ArrowUpRight,
  GraduationCap,
  FolderGit2,
  BriefcaseBusiness,
  Users,
} from "lucide-react";
import { useWorkspace } from "./workspace";
import {
  PageHeading,
  Panel,
  PanelTitle,
  Tag,
  Primary,
  Empty,
  Pick,
} from "./shared";
import { EntityEditor } from "./entity-editor";
import { AnswerForm } from "./interview";
import { QUESTION_BANK } from "@/lib/engine/questions";
import { factLabel } from "@/lib/engine/interview";
import { skillEvidence } from "@/lib/engine/evidence";
import { ProfileSchema } from "@/lib/validation";
import type { Profile, Entity, Fact } from "@/lib/engine/model";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
export function ProfileForm({
  initial,
  onSave,
  onboarding = false,
}: {
  initial: Profile;
  onSave: (p: Profile) => Promise<void>;
  onboarding?: boolean;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Profile>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: initial,
  });
  const target = useWatch({ control, name: "target" });
  const [saveError, setSaveError] = useState("");
  const year = useWatch({ control, name: "year" });
  const fields: {
    key: keyof Profile;
    label: string;
    placeholder: string;
    type?: string;
    required?: boolean;
  }[] = [
    {
      key: "name",
      label: "Professional name",
      placeholder: "Your name",
      required: true,
    },
    {
      key: "email",
      label: "Contact email",
      placeholder: "you@example.com",
      type: "email",
      required: true,
    },
    {
      key: "school",
      label: "University or school",
      placeholder: "Your school",
      required: true,
    },
    {
      key: "degree",
      label: "Degree and major",
      placeholder: "B.S. in Computer Science",
      required: true,
    },
    {
      key: "graduation",
      label: "Expected graduation",
      placeholder: "May 2028",
    },
    { key: "location", label: "City or region", placeholder: "Austin, TX" },
  ];
  if (!onboarding)
    fields.push(
      {
        key: "gpa",
        label: "GPA with scale (optional)",
        placeholder: "3.8 / 4.0",
      },
      {
        key: "phone",
        label: "Phone (optional)",
        placeholder: "A number employers can use",
      },
      {
        key: "linkedin",
        label: "LinkedIn (optional)",
        placeholder: "https://linkedin.com/in/...",
      },
      {
        key: "github",
        label: "GitHub (optional)",
        placeholder: "https://github.com/...",
      },
      {
        key: "website",
        label: "Website (optional)",
        placeholder: "https://...",
      },
    );
  return (
    <form onSubmit={handleSubmit(async (p) => {
      setSaveError("");
      const profile = { ...p, name: p.name.trim(), email: p.email.trim(), school: p.school.trim(), degree: p.degree.trim() };
      if (!profile.name || !profile.email || !profile.school || !profile.degree) {
        setSaveError("Enter your name, email, school, and degree. Spaces alone are not enough.");
        return;
      }
      try { await onSave(profile); }
      catch (error) { setSaveError(error instanceof Error ? error.message : "Unable to save your profile."); }
    })} className="form-stack">
      <div className="form-grid">
        {fields.map((f) => (
          <div key={f.key}>
            <Label htmlFor={`p-${f.key}`}>{f.label}</Label>
            <Input
              id={`p-${f.key}`}
              {...register(f.key)}
              placeholder={f.placeholder}
              type={f.type ?? "text"}
              required={f.required}
              maxLength={f.key === "email" ? 254 : 250}
            />
            {errors[f.key] && (
              <p className="form-error">{errors[f.key]?.message}</p>
            )}
          </div>
        ))}
        <div>
          <Label>Career direction</Label>
          <Pick
            label="Career direction"
            value={target || "Still exploring"}
            onChange={(v) => setValue("target", v)}
            options={[
              "Software engineering",
              "Data & AI",
              "Cybersecurity",
              "Cloud & systems",
              "Hardware & engineering",
              "Still exploring",
            ]}
          />
        </div>
        <div>
          <Label>Year of study</Label>
          <Pick
            label="Year of study"
            value={year || "First year"}
            onChange={(v) => setValue("year", v)}
            options={[
              "First year",
              "Second year",
              "Third year",
              "Final year",
              "Graduate student",
              "Recently graduated",
            ]}
          />
        </div>
      </div>
      <div className="privacy-note">
        <ShieldCheck size={17} />
        <p>
          You choose what to share. No street address, age, or sensitive
          background information is needed.
        </p>
      </div>
      {saveError && <p className="form-error" role="alert">{saveError}</p>}
      <Primary type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? "Saving..."
          : onboarding
            ? "Save & start my interview"
            : "Save profile"}
        <ArrowRight size={16} />
      </Primary>
    </form>
  );
}
export function MasterProfile() {
  const { w, mutate, busy } = useWorkspace();
  const [editing, setEditing] = useState(false);
  const [entity, setEntity] = useState<Entity | undefined>();
  const [add, setAdd] = useState(false);
  const [fact, setFact] = useState<Fact | null>(null);
  const [remove, setRemove] = useState<{
    kind: "deleteEntity" | "deleteFact";
    id: string;
  } | null>(null);
  const [importing, setImporting] = useState(false);
  const [importText, setImportText] = useState("");
  const [importEntity, setImportEntity] = useState("");
  if (!w) return null;
  const skills = skillEvidence(w);
  const factQ = fact
    ? QUESTION_BANK.find((q) => q.id === fact.questionId)
    : undefined;
  async function importFact() {
    try {
      await mutate({
        type: "import",
        entityId: importEntity || w!.entities[0]?.id || "",
        text: importText,
      });
      toast.success("Imported as unverified text. Review it before using it.");
      setImporting(false);
      setImportText("");
    } catch {}
  }
  return (
    <>
      <PageHeading
        eyebrow="THE SOURCE OF YOUR STORY"
        title="Your master profile."
        description="Your original facts stay here. Every résumé starts with what you actually did."
        action={
          <div className="button-row">
            <button
              className="subtle-button"
              onClick={() => setImporting(true)}
            >
              <Upload size={16} />
              Import text
            </button>
            <Primary
              onClick={() => {
                setEntity(undefined);
                setAdd(true);
              }}
            >
              <Plus size={16} />
              Add experience
            </Primary>
          </div>
        }
      />
      <div className="profile-layout">
        <div>
          <Panel className="identity-card">
            <div className="identity-head">
              <div className="big-avatar">
                {w.profile.name
                  ? w.profile.name
                      .split(" ")
                      .map((v) => v[0])
                      .slice(0, 2)
                      .join("")
                  : "Y"}
              </div>
              <div>
                <h2>{w.profile.name || "Your name belongs here"}</h2>
                <p>{w.profile.degree || "Add your education"}</p>
                <span>{w.profile.location}</span>
              </div>
              <button
                className="icon-button"
                aria-label="Edit personal profile"
                onClick={() => setEditing(true)}
              >
                <Pencil size={17} />
              </button>
            </div>
            <div className="identity-details">
              <span>{w.profile.email || "Add a contact email"}</span>
              <span>{w.profile.school || "Add your university"}</span>
              <span>
                {w.profile.graduation && `Graduating ${w.profile.graduation}`}
              </span>
            </div>
            {[w.profile.github, w.profile.linkedin, w.profile.website].some(
              Boolean,
            ) && (
              <div className="profile-links">
                {[
                  ["GitHub", w.profile.github],
                  ["LinkedIn", w.profile.linkedin],
                  ["Portfolio", w.profile.website],
                ]
                  .filter(([, url]) => url)
                  .map(([label, url]) => (
                    <a
                      key={label}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {label}
                      <ArrowUpRight size={14} />
                    </a>
                  ))}
              </div>
            )}
          </Panel>
          <div className="section-caption">
            <h2>The experiences behind your skills</h2>
            <span>{w.entities.length} captured</span>
          </div>
          {w.entities.length === 0 ? (
            <Panel>
              <Empty
                title="You don’t need a job title to begin."
                description="Add a class project, a club responsibility, or a time you helped someone."
                action="Add your first experience"
                onClick={() => setAdd(true)}
              />
            </Panel>
          ) : (
            w.entities.map((e) => (
              <Panel className="experience-card" key={e.id}>
                <div className="experience-card-head">
                  <div className="experience-icon">
                    {e.kind === "project" ? (
                      <FolderGit2 size={21} />
                    ) : e.kind === "experience" ? (
                      <BriefcaseBusiness size={21} />
                    ) : e.kind === "education" ? (
                      <GraduationCap size={21} />
                    ) : (
                      <Users size={21} />
                    )}
                  </div>
                  <div>
                    <Tag>
                      {e.kind === "project"
                        ? "PROJECT"
                        : e.kind === "activity"
                          ? "ACTIVITY"
                          : e.kind.toUpperCase()}
                    </Tag>
                    <h3>{e.title}</h3>
                    <p>
                      {e.subtitle}
                      {e.dates && ` · ${e.dates}`}
                    </p>
                  </div>
                  <div className="button-row">
                    <button
                      className="icon-button"
                      aria-label={`Edit ${e.title}`}
                      onClick={() => {
                        setEntity(e);
                        setAdd(true);
                      }}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="icon-button"
                      aria-label={`Delete ${e.title}`}
                      onClick={() =>
                        setRemove({ kind: "deleteEntity", id: e.id })
                      }
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <div className="fact-list">
                  {w.facts
                    .filter(
                      (f) => f.entityId === e.id && f.value !== "__skipped__",
                    )
                    .map((f) => (
                      <div className="fact-row" key={f.id}>
                        <div
                          className={
                            f.confirmed ? "fact-check" : "fact-pending"
                          }
                        >
                          {f.confirmed ? <Check size={14} /> : <span>?</span>}
                        </div>
                        <div>
                          <span className="fact-label">{factLabel(f)}</span>
                          <p>{f.value}</p>
                          {!f.confirmed && (
                            <button
                              className="text-link"
                              disabled={busy}
                              onClick={() =>
                                void mutate(f.questionId === "import.resume" ? { type: "confirmImport", id: f.id } : {
                                  type: "answer",
                                  entityId: e.id,
                                  questionId: `${e.kind}.action`,
                                  value: f.value,
                                  confirmed: true,
                                })
                                  .then(() =>
                                    toast.success(
                                      "Saved as your confirmed contribution.",
                                    ),
                                  )
                                  .catch(() => {})
                              }
                            >
                              I confirm this is my contribution
                              <Check size={13} />
                            </button>
                          )}
                        </div>
                        {QUESTION_BANK.some(
                          (q) => q.id === f.questionId && q.scope === e.kind,
                        ) && (
                          <button
                            className="icon-button"
                            aria-label="Edit answer"
                            onClick={() => setFact(f)}
                          >
                            <Pencil size={13} />
                          </button>
                        )}
                        <button
                          className="icon-button"
                          aria-label="Delete fact"
                          onClick={() =>
                            setRemove({ kind: "deleteFact", id: f.id })
                          }
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                </div>
                {!w.facts.some((f) => f.entityId === e.id) && (
                  <p className="muted">
                    Ready for its first story. Open the interview to add
                    details.
                  </p>
                )}
                <a
                  className="text-link experience-followup"
                  href={`/interview?entity=${encodeURIComponent(e.id)}`}
                >
                  Develop this experience
                  <ArrowRight size={15} />
                </a>
              </Panel>
            ))
          )}
        </div>
        <aside>
          <Panel>
            <PanelTitle aside={<GitBranch size={18} />}>
              Your evidence ledger
            </PanelTitle>
            <p className="panel-description">
              Skills become meaningful when they connect to something you did.
            </p>
            <div className="skill-evidence-list">
              {skills.length ? (
                skills.map((s) => (
                  <div key={s.skill}>
                    <div>
                      <strong>{s.skill}</strong>
                      <Tag tone={s.facts.length ? "mint" : "amber"}>
                        {s.facts.length ? "Evidence found" : "Self-reported"}
                      </Tag>
                    </div>
                    <p>
                      {s.facts.length
                        ? `${new Set(s.facts.map((f) => f.entityId)).size} experience${new Set(s.facts.map((f) => f.entityId)).size === 1 ? "" : "s"} connected`
                        : "Add a concrete example in the interview"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="muted">
                  Skills will appear as you describe your actions and tools.
                </p>
              )}
            </div>
            <div className="panel-footnote">
              Evidence labels are Folio heuristics, not proficiency
              certifications.
            </div>
          </Panel>
          <div className="side-note">
            <ShieldCheck size={20} />
            <h3>Facts and wording stay separate.</h3>
            <p>
              Changing a fact flags any linked résumé bullet for review. Your
              résumé versions never silently rewrite your history.
            </p>
          </div>
        </aside>
      </div>
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="folio-dialog wide-dialog">
          <DialogHeader>
            <DialogTitle>Your profile</DialogTitle>
            <DialogDescription>
              Your contact and education details for future résumé drafts.
            </DialogDescription>
          </DialogHeader>
          <ProfileForm
            key={editing ? String(w.revision) : "closed"}
            initial={w.profile}
            onSave={async (p) => {
              await mutate({ type: "profile", profile: p });
              setEditing(false);
              toast.success("Profile saved");
            }}
          />
        </DialogContent>
      </Dialog>
      <EntityEditor
        key={`${add}:${entity?.id ?? "new"}`}
        open={add}
        entity={entity}
        onClose={() => setAdd(false)}
      />
      <Dialog
        open={!!fact && !!factQ}
        onOpenChange={(v) => !v && setFact(null)}
      >
        <DialogContent className="folio-dialog wide-dialog">
          <DialogHeader>
            <DialogTitle>Edit your answer</DialogTitle>
            <DialogDescription>
              Linked résumé bullets will need review after this change.
            </DialogDescription>
          </DialogHeader>
          {fact && factQ && (
            <AnswerForm
              key={fact.id}
              q={factQ}
              entityId={fact.entityId}
              fact={fact}
              onSaved={() => setFact(null)}
            />
          )}
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!remove} onOpenChange={(v) => !v && !busy && setRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remove this{" "}
              {remove?.kind === "deleteEntity" ? "experience" : "fact"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Linked résumé bullets will be marked for review and blocked from
              export until fixed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Keep it</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={(event) => {
                event.preventDefault();
                if (remove) void mutate({ type: remove.kind, id: remove.id })
                  .then(() => setRemove(null)).catch(() => {});
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={importing} onOpenChange={setImporting}>
        <DialogContent className="folio-dialog">
          <DialogHeader>
            <DialogTitle>Bring an existing story</DialogTitle>
            <DialogDescription>
              Paste one contribution or upload a TXT résumé. Imported text stays
              unverified until you confirm it. For PDFs, copy the relevant text.
            </DialogDescription>
          </DialogHeader>
          <Label>Attach to an experience</Label>
          <Pick
            value={importEntity || w.entities[0]?.id || ""}
            onChange={setImportEntity}
            label="Experience for imported text"
            options={w.entities.map((e) => ({ value: e.id, label: e.title }))}
          />
          <Input
            type="file"
            accept=".txt,text/plain"
            aria-label="Upload text résumé"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                if (file.size > 50000) {
                  toast.error("Choose a text file under 50 KB.");
                  return;
                }
                try { setImportText((await file.text()).slice(0, 1800)); }
                catch { toast.error("That file could not be read. Try another TXT file or paste the text."); }
              }
            }}
          />
          <Textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            aria-label="Résumé text to review"
            maxLength={1800}
            placeholder="Paste one relevant contribution (up to 1,800 characters)."
          />
          <Primary
            disabled={!w.entities.length || importText.trim().length < 2 || busy}
            onClick={() => void importFact()}
          >
            Import for review
            <Upload size={16} />
          </Primary>
          {!w.entities.length && (
            <p className="muted">
              Add an experience first so the text has a clear source.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
