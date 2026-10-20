"use client";
import { useState } from "react";
import {
  Plus,
  Download,
  FileText,
  Check,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Pencil,
  History,
  RotateCcw,
  Trash2,
  Link2,
  Eye,
  AlertCircle,
} from "lucide-react";
import { useWorkspace } from "./workspace";
import {
  PageHeading,
  Panel,
  PanelTitle,
  Primary,
  Tag,
  Pick,
  Empty,
} from "./shared";
import type { Resume, Bullet, Template } from "@/lib/engine/model";
import {
  evidenceIssues,
  resumeHealth,
  bulletSuggestions,
} from "@/lib/engine/evidence";
import { factLabel } from "@/lib/engine/interview";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
const templates = [
  { value: "classic", label: "Classic ATS" },
  { value: "modern", label: "Modern ATS" },
  { value: "technical", label: "Technical Student" },
];
export function ResumePaper({ r }: { r: Resume }) {
  const p = r.profileSnapshot;
  return (
    <div className={`resume-paper template-${r.template}`}>
      <div className="paper-contact">
        <h2>{p.name || "Your name"}</h2>
        <p>{[p.email, p.phone, p.location].filter(Boolean).join(" | ")}</p>
        <p>{[p.linkedin, p.github, p.website].filter(Boolean).join(" | ")}</p>
      </div>
      {r.sectionOrder.map((section) => (
        <div key={section}>
          {section === "education" && p.school && (
            <div className="paper-section">
              <h3>Education</h3>
              <h4>{p.school}</h4>
              <p>
                {p.degree} {p.graduation && ` | Expected ${p.graduation}`}
              </p>
              {p.gpa && <p>GPA: {p.gpa}</p>}
              {r.educationExtras.map((t) => (
                <p key={t}>{t}</p>
              ))}
            </div>
          )}
          {section === "education" && !!r.certificationsSnapshot?.length && (
            <div className="paper-section">
              <h3>Certifications</h3>
              {r.certificationsSnapshot.map((certification, i) => (
                <p key={i} style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{certification}</p>
              ))}
            </div>
          )}
          {r.entitySnapshot.some(
            (e) =>
              e.kind === section && r.bullets.some((b) => b.entityId === e.id),
          ) && (
            <div className="paper-section">
              <h3>
                {section === "project"
                  ? "Projects"
                  : section === "activity"
                    ? "Activities & leadership"
                    : section === "education"
                      ? "Additional education"
                      : "Experience"}
              </h3>
              {r.entitySnapshot
                .filter(
                  (e) =>
                    e.kind === section &&
                    r.bullets.some((b) => b.entityId === e.id),
                )
                .map((e) => (
                  <div className="paper-experience" key={e.id}>
                    <h4>{e.title}</h4>
                    <p>{[e.subtitle, e.dates].filter(Boolean).join(" | ")}</p>
                    <ul>
                      {r.bullets
                        .filter((b) => b.entityId === e.id)
                        .map((b) => (
                          <li key={b.id}>{b.text}</li>
                        ))}
                    </ul>
                  </div>
                ))}
            </div>
          )}
        </div>
      ))}
      {r.skillsSnapshot.length > 0 && (
        <div className="paper-section">
          <h3>Technical & demonstrated skills</h3>
          <p>{r.skillsSnapshot.join(" · ")}</p>
        </div>
      )}
    </div>
  );
}
export function ResumeStudio({ id }: { id?: string }) {
  const { w, mutate, busy } = useWorkspace();
  const [create, setCreate] = useState(false);
  const [name, setName] = useState("");
  const [template, setTemplate] = useState<Template>("technical");
  const [evidence, setEvidence] = useState<Bullet | null>(null);
  const [editing, setEditing] = useState<Bullet | null>(null);
  const [text, setText] = useState("");
  const [history, setHistory] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [preflight, setPreflight] = useState<string[] | null>(null);
  const [remove, setRemove] = useState(false);
  const [rename, setRename] = useState(false);
  const [newName, setNewName] = useState("");
  if (!w) return null;
  const r = id ? w.resumes.find((r) => r.id === id) : undefined;
  const health = r ? resumeHealth(w, r) : null;
  async function generate() {
    try {
      const next = await mutate({
        type: "generate",
        name: (name.trim() || `${w!.profile.target || "My"} résumé`).slice(0, 120),
        target: w!.profile.target,
        template,
      });
      setCreate(false);
      window.location.assign(`/resume/${next.resumes[0].id}`);
      toast.success("Draft created from your confirmed facts.");
    } catch {}
  }
  async function save(updated: Resume) {
    try {
      await mutate({ type: "resume", resume: updated });
      return true;
    } catch {
      return false;
    }
  }
  async function download() {
    if (!r) return;
    setExporting(true);
    try {
      const { createResumePdf, exportChecks } =
        await import("@/lib/engine/pdf");
      const issues = exportChecks(w!, r);
      if (issues.length) {
        setPreflight(issues);
        return;
      }
      const result = await createResumePdf(w!, r);
      const blob = new Blob([result.bytes as BlobPart], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${r.profileSnapshot.name.replace(/[^a-z0-9]/gi, "-") || "resume"}-${r.template}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      toast.success(
        `PDF downloaded · ${result.pages} page${result.pages === 1 ? "" : "s"}`,
      );
      if (result.pages > 1)
        toast.info(
          "Your résumé spans more than one page. Review its length before applying.",
        );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "PDF export failed.");
    } finally {
      setExporting(false);
    }
  }
  function moveBullet(i: number, d: number) {
    if (!r) return;
    const bullets = [...r.bullets];
    [bullets[i], bullets[i + d]] = [bullets[i + d], bullets[i]];
    void save({ ...r, bullets });
  }
  return (
    <>
      {!id ? (
        <>
          <PageHeading
            eyebrow="YOUR STORY, READY TO SHARE"
            title="The résumé studio."
            description="One master profile. Different versions for the opportunities that matter."
            action={
              <Primary onClick={() => setCreate(true)}>
                <Plus size={16} />
                Create a résumé
              </Primary>
            }
          />
          <div className="resume-studio-intro">
            <div>
              <Tag tone="mint">BUILT FROM YOUR EVIDENCE</Tag>
              <h2>
                Make your experience <br />
                <em>speak for itself.</em>
              </h2>
              <p>
                Start from confirmed facts. Refine the wording. Keep every claim
                connected to its source.
              </p>
            </div>
            <div className="resume-process">
              <span>
                <ShieldCheck />
                Confirmed facts
              </span>
              <ArrowRight />
              <span>
                <Pencil />
                Your review
              </span>
              <ArrowRight />
              <span>
                <FileText />A clear résumé
              </span>
            </div>
          </div>
          {w.resumes.length ? (
            <div className="resume-grid">
              {w.resumes.map((r) => (
                <a
                  className="resume-card"
                  key={r.id}
                  href={`/resume/${r.id}`}
                >
                  <div className="resume-thumbnail">
                    <ResumePaper r={r} />
                  </div>
                  <div className="resume-card-info">
                    <Tag>
                      {templates.find((t) => t.value === r.template)?.label}
                    </Tag>
                    <h3>{r.name}</h3>
                    <p>
                      {
                        r.bullets.filter(
                          (b) => !evidenceIssues(b, w.facts).length,
                        ).length
                      }{" "}
                      of {r.bullets.length} bullets approved · Revision{" "}
                      {r.revision}
                    </p>
                    <ArrowRight size={19} />
                  </div>
                </a>
              ))}
              <button
                className="new-resume-card"
                onClick={() => setCreate(true)}
              >
                <Plus size={28} />
                <h3>A new direction?</h3>
                <p>Create another version from the same real experience.</p>
                <span>
                  Create a résumé
                  <ArrowRight size={15} />
                </span>
              </button>
            </div>
          ) : (
            <Panel>
              <Empty
                title="Your story is ready for a first draft."
                description="Capture one personal contribution in the interview, then create your résumé here."
                action="Create a résumé"
                onClick={() => setCreate(true)}
              />
            </Panel>
          )}
          <div className="resume-note">
            <ShieldCheck size={18} />
            <p>
              Three single-column templates, selectable text, and no decorative
              charts. Follow the employer’s requested file format.
            </p>
          </div>
        </>
      ) : !r ? (
        <Empty
          title="This résumé isn’t here."
          description="It may have been deleted, or you may be viewing a different workspace."
          action="Back to studio"
          onClick={() => window.location.assign("/resume")}
        />
      ) : (
        <>
          <a className="back-link" href="/resume">
            <ArrowLeft size={15} />
            All résumé versions
          </a>
          <PageHeading
            eyebrow={`RÉSUMÉ STUDIO · REVISION ${r.revision}`}
            title={r.name}
            description="Review your words. Inspect the evidence. Share with confidence."
            action={
              <div className="button-row">
                <button
                  className="subtle-button"
                  onClick={() => setHistory(true)}
                >
                  <History size={16} />
                  History
                </button>
                <Primary
                  onClick={() => void download()}
                  disabled={exporting || busy}
                >
                  <Download size={16} />
                  {exporting ? "Preparing PDF..." : "Download PDF"}
                </Primary>
              </div>
            }
          />
          <div className="resume-toolbar">
            <div className="button-row">
              <Pick
                label="Résumé template"
                disabled={busy}
                value={r.template}
                onChange={(v) =>
                  void save({
                    ...r,
                    template: v as Template,
                    sectionOrder:
                      v === "technical"
                        ? ["education", "project", "experience", "activity"]
                        : ["education", "experience", "project", "activity"],
                  })
                }
                options={templates}
              />
              <Tag tone="mint">
                <ShieldCheck size={12} />
                {health?.approved}/{health?.total} approved
              </Tag>
            </div>
            <div className="button-row">
              <button
                className="subtle-button"
                onClick={() => {
                  setNewName(r.name);
                  setRename(true);
                }}
              >
                <Pencil size={14} />
                Rename
              </button>
              <button
                className="subtle-button"
                onClick={() => {
                  setName(`${r.name} · refreshed`.slice(0, 120));
                  setTemplate(r.template);
                  setCreate(true);
                }}
              >
                <RotateCcw size={14} />
                Fresh draft
              </button>
              <button
                className="icon-button"
                aria-label="Delete this résumé"
                onClick={() => setRemove(true)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <div className="resume-editor">
            <div className="bullet-editor">
              <div className="section-caption">
                <h2>Your résumé, line by line</h2>
                <span>{r.bullets.length} contributions</span>
              </div>
              {r.bullets.map((b, i) => {
                const issues = evidenceIssues(b, w.facts);
                return (
                  <Panel
                    className={`bullet-card ${!issues.length ? "approved" : ""}`}
                    key={b.id}
                  >
                    <div className="bullet-head">
                      <Tag>
                        {r.entitySnapshot.find((e) => e.id === b.entityId)
                          ?.title ?? "Experience"}
                      </Tag>
                      <span className={!issues.length ? "mint-text" : "muted"}>
                        {!issues.length ? (
                          <Check size={15} />
                        ) : (
                          <Pencil size={14} />
                        )}
                      </span>
                    </div>
                    <p className="bullet-copy">{b.text}</p>
                    <button
                      className="evidence-link"
                      onClick={() => setEvidence(b)}
                    >
                      <Link2 size={14} />
                      {b.evidenceIds.length} linked source
                      {b.evidenceIds.length === 1 ? "" : "s"}
                      <span>Why this wording?</span>
                    </button>
                    {issues
                      .filter((t) => t !== "Needs your approval")
                      .map((t) => (
                        <p className="inline-warning" key={t}>
                          <AlertCircle size={13} />
                          {t}
                        </p>
                      ))}
                    <div className="bullet-actions">
                      <div className="button-row">
                        <button
                          className="icon-button"
                          aria-label="Move bullet up"
                          disabled={i === 0 || busy}
                          onClick={() => moveBullet(i, -1)}
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          className="icon-button"
                          aria-label="Move bullet down"
                          disabled={i === r.bullets.length - 1 || busy}
                          onClick={() => moveBullet(i, 1)}
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          className="subtle-button compact"
                          onClick={() => {
                            setEditing(b);
                            setText(b.text);
                          }}
                        >
                          <Pencil size={13} />
                          Edit
                        </button>
                      </div>
                      <button
                        className={
                          !issues.length ? "approved-button" : "approve-button"
                        }
                        disabled={busy}
                        onClick={() =>
                          void save({
                            ...r,
                            bullets: r.bullets.map((x) =>
                              x.id === b.id
                                ? { ...x, approved: !b.approved }
                                : x,
                            ),
                          })
                        }
                      >
                        {!issues.length ? (
                          <>
                            <Check size={13} />
                            Approved
                          </>
                        ) : (
                          <>
                            Approve
                            <Check size={13} />
                          </>
                        )}
                      </button>
                    </div>
                  </Panel>
                );
              })}
              <div className="editor-note">
                <ShieldCheck size={18} />
                <p>
                  Edits become facts you supplied. After saving your wording,
                  approve it in a separate step. Source-linked numbers are
                  checked before export.
                </p>
              </div>
              <Panel>
                <PanelTitle>Before you share</PanelTitle>
                <ul className="preflight-list">
                  <li>
                    <Check size={14} />
                    Contact details and linked evidence are checked
                  </li>
                  <li>
                    <Check size={14} />
                    PDF text wraps and continues onto a new page
                  </li>
                  <li>
                    <Eye size={14} />
                    Read for grammar, spelling, and accuracy
                  </li>
                  <li>
                    <Eye size={14} />
                    Follow the employer’s application instructions
                  </li>
                </ul>
                <p className="panel-footnote">
                  Folio checks evidence and formatting. It does not certify ATS
                  compatibility or replace a human proofreading pass.
                </p>
              </Panel>
            </div>
            <div className="paper-preview">
              <div className="preview-label">
                <span>DOCUMENT PREVIEW</span>
                <span>US LETTER · TEXT-BASED PDF</span>
              </div>
              <ResumePaper r={r} />
              <p className="paper-caption">
                The downloaded PDF uses deterministic pagination. The editor
                preview may wrap differently.
              </p>
            </div>
          </div>
        </>
      )}
      <Dialog open={create} onOpenChange={setCreate}>
        <DialogContent className="folio-dialog">
          <DialogHeader>
            <DialogTitle>Create a résumé version</DialogTitle>
            <DialogDescription>
              Only confirmed contributions will be included. Your master profile
              stays unchanged.
            </DialogDescription>
          </DialogHeader>
          <Label htmlFor="resume-name">Version name</Label>
          <Input
            id="resume-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Software engineering internship"
            maxLength={120}
          />
          <Label>Template</Label>
          <Pick
            label="New résumé template"
            value={template}
            onChange={(v) => setTemplate(v as Template)}
            options={templates}
          />
          <Primary disabled={busy} onClick={() => void generate()}>
            {busy ? "Building draft..." : "Create my draft"}
            <ArrowRight size={16} />
          </Primary>
        </DialogContent>
      </Dialog>
      <Sheet open={!!evidence} onOpenChange={(v) => !v && setEvidence(null)}>
        <SheetContent className="evidence-sheet">
          <SheetHeader>
            <SheetTitle>Why this wording?</SheetTitle>
            <SheetDescription>
              These are the answers linked to this bullet. Source links help
              review; they do not independently prove the claim.
            </SheetDescription>
          </SheetHeader>
          {evidence && (
            <div className="evidence-sheet-body">
              <blockquote>{evidence.text}</blockquote>
              <div className="eyebrow">YOUR ORIGINAL WORDS</div>
              {evidence.evidenceIds.map((id) => {
                const f = w.facts.find((f) => f.id === id);
                return (
                  <div className="source-card" key={id}>
                    <div>
                      <ShieldCheck size={16} />
                      <Tag tone={f?.confirmed ? "mint" : "amber"}>
                        {f?.confirmed ? "User confirmed" : "Missing source"}
                      </Tag>
                    </div>
                    <h3>{f ? factLabel(f) : "Source no longer available"}</h3>
                    <p>{f?.value ?? "Regenerate from your current facts."}</p>
                    <small>
                      Source revision {evidence.sourceRevisions[id]}
                      {f && f.revision !== evidence.sourceRevisions[id]
                        ? ` · Now revision ${f.revision}`
                        : ""}
                    </small>
                  </div>
                );
              })}
              <div className="side-note">
                <h3>Compare the wording</h3>
                {bulletSuggestions(w, evidence.entityId).map((s) => (
                  <div className="bullet-variant" key={s.level}>
                    <h4>{s.level}</h4>
                    <p>{s.text}</p>
                    <small>{s.why}</small>
                    <button
                      className="subtle-button"
                      onClick={() => {
                        setEditing(evidence);
                        setText(s.text);
                        setEvidence(null);
                      }}
                    >
                      Review this wording
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ))}
                <h3>What makes a bullet useful?</h3>
                <p>
                  A clear action tells what you did. Context explains the
                  problem. An outcome explains why it mattered. A supported
                  metric adds scale; a number is optional.
                </p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="folio-dialog">
          <DialogHeader>
            <DialogTitle>Make these words yours</DialogTitle>
            <DialogDescription>
              Only add claims you can support. Your edit is recorded as a
              user-supplied source and requires a separate approval.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label="Edit résumé bullet"
            maxLength={2500}
          />
          <div className="button-row">
            <Button
              variant="outline"
              onClick={() => editing && setText(editing.original)}
            >
              <RotateCcw size={14} />
              Restore original wording
            </Button>
            <Primary
              disabled={busy || text.trim().length < 2}
              onClick={() =>
                r &&
                editing &&
                void save({
                  ...r,
                  bullets: r.bullets.map((b) =>
                    b.id === editing.id ? { ...b, text } : b,
                  ),
                }).then((ok) => ok && setEditing(null))
              }
            >
              Save wording
            </Primary>
          </div>
          {r && editing && (
            <Button
              variant="ghost"
              className="danger-text"
              disabled={busy}
              onClick={() =>
                void save({
                  ...r,
                  bullets: r.bullets.filter((b) => b.id !== editing.id),
                }).then((ok) => ok && setEditing(null))
              }
            >
              <Trash2 size={14} />
              Remove this bullet
            </Button>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={history} onOpenChange={setHistory}>
        <DialogContent className="folio-dialog">
          <DialogHeader>
            <DialogTitle>Version history</DialogTitle>
            <DialogDescription>
              Restore a previous draft. Current facts still govern whether its
              bullets can be exported.
            </DialogDescription>
          </DialogHeader>
          {w.history
            .filter((h) => h.resumeId === r?.id)
            .slice()
            .reverse()
            .map((h) => (
              <div className="history-row" key={h.id}>
                <div>
                  <strong>{h.label}</strong>
                  <span>{new Date(h.createdAt).toLocaleString()}</span>
                </div>
                <button
                  className="subtle-button"
                  disabled={busy}
                  onClick={() =>
                    void mutate({ type: "restore", id: h.id })
                      .then(() => {
                        setHistory(false);
                        toast.success("Draft restored");
                      })
                      .catch(() => {})
                  }
                >
                  <RotateCcw size={14} />
                  Restore
                </button>
              </div>
            ))}
          {!w.history.some((h) => h.resumeId === r?.id) && (
            <p className="muted">
              History appears after your first saved edit.
            </p>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={preflight !== null}
        onOpenChange={(v) => !v && setPreflight(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>A quick review before export</DialogTitle>
            <DialogDescription>
              Resolve these items, then download your résumé.
            </DialogDescription>
          </DialogHeader>
          <ul className="preflight-errors">
            {preflight?.map((e, i) => (
              <li key={i}>
                <AlertCircle size={15} />
                {e}
              </li>
            ))}
          </ul>
          <Primary onClick={() => setPreflight(null)}>Back to review</Primary>
        </DialogContent>
      </Dialog>
      <Dialog open={rename} onOpenChange={setRename}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Name this version</DialogTitle>
            <DialogDescription>
              Use a role or opportunity you can recognize later.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            aria-label="Version name"
            maxLength={120}
          />
          <Primary
            disabled={!newName.trim() || busy}
            onClick={() =>
              r &&
              void save({ ...r, name: newName.trim() }).then(
                (ok) => ok && setRename(false),
              )
            }
          >
            Save name
          </Primary>
        </DialogContent>
      </Dialog>
      <AlertDialog open={remove} onOpenChange={(v) => { if (!busy) setRemove(v); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this résumé version?</AlertDialogTitle>
            <AlertDialogDescription>
              This version and its revision history will be removed. Your master
              facts are kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Keep version</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={(event) => {
                event.preventDefault();
                if (r) void mutate({ type: "deleteResume", id: r.id })
                  .then(() => window.location.assign("/resume")).catch(() => {});
              }}
            >
              Delete version
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
