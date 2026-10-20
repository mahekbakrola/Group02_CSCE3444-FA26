"use client";
import { useState } from "react";
import {
  Search,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  ArrowUpRight,
  ArrowLeft,
  Check,
  Plus,
  MapPin,
  BriefcaseBusiness,
  FileText,
  ShieldCheck,
  Link2,
} from "lucide-react";
import { useWorkspace } from "./workspace";
import {
  PageHeading,
  Panel,
  PanelTitle,
  Tag,
  Primary,
  Pick,
  Empty,
} from "./shared";
import { rankJobs, DEMO_JOBS, analyzeJob } from "@/lib/providers/jobs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
export function Jobs({ id }: { id?: string }) {
  const { w, mutate, busy } = useWorkspace();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("Any");
  const [savedOnly, setSavedOnly] = useState(false);
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<ReturnType<typeof analyzeJob> | null>(
    null,
  );
  const [versionName, setVersionName] = useState("");
  if (!w) return null;
  const job = id ? DEMO_JOBS.find((j) => j.id === id) : null;
  const ranked = rankJobs(w).filter(
    (j) =>
      (mode === "Any" || j.mode === mode) &&
      (!savedOnly || w.savedJobs.includes(j.id)) &&
      `${j.title} ${j.company} ${j.tags.join(" ")} ${j.location}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  async function tailor(text: string, title: string) {
    try {
      const next = await mutate({
        type: "generate",
        name: title || "Tailored résumé",
        target: title || w!.profile.target,
        template: "technical",
        jobDescription: text,
      });
      toast.success(
        "Created a tailored draft. Review and approve its evidence.",
      );
      window.location.assign(`/resume/${next.resumes[0].id}`);
    } catch {}
  }
  const match = job ? analyzeJob(job.description, w) : result;
  return (
    <>
      {!id ? (
        <>
          <PageHeading
            eyebrow="EXPLORE YOUR NEXT OPPORTUNITY"
            title="Find the connection, not just a keyword."
            description="Compare real requirements with your evidence and see where there’s room to grow."
          />
          <Tabs defaultValue="opportunities">
            <TabsList className="job-tabs">
              <TabsTrigger value="opportunities">
                <BriefcaseBusiness size={16} />
                Explore opportunities
              </TabsTrigger>
              <TabsTrigger value="analyze">
                <FileText size={16} />
                Analyze a job description
              </TabsTrigger>
            </TabsList>
            <TabsContent value="opportunities">
              <div className="job-notice">
                <ShieldCheck size={18} />
                <div>
                  <strong>
                    A practice space, with clearly labeled examples.
                  </strong>
                  <p>
                    These companies and listings are fictional. Paste an actual
                    job description in the analyzer to use your own opportunity.
                  </p>
                </div>
              </div>
              <div className="job-filter-bar">
                <div className="input-with-icon">
                  <Search size={17} />
                  <Input
                    aria-label="Search opportunities"
                    placeholder="Search roles, skills, or locations"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <Pick
                  label="Work arrangement"
                  value={mode}
                  onChange={setMode}
                  options={["Any", "Remote", "Hybrid", "On-site"]}
                />
                <button
                  className={`subtle-button ${savedOnly ? "selected" : ""}`}
                  aria-pressed={savedOnly}
                  onClick={() => setSavedOnly(!savedOnly)}
                >
                  <Bookmark size={15} />
                  Saved {w.savedJobs.length}
                </button>
              </div>
              <div className="section-caption">
                <h2>
                  {savedOnly ? "Your shortlist" : "Opportunities to explore"}
                </h2>
                <span>
                  {ranked.length} examples · ranked by evidence, role, and
                  preferences
                </span>
              </div>
              <div className="jobs-grid">
                {ranked.map((j) => (
                  <Panel className="job-card" key={j.id}>
                    <div className="job-card-head">
                      <div
                        className="company-symbol"
                        style={{ background: `${j.color}18`, color: j.color }}
                      >
                        {j.company[0]}
                      </div>
                      <div>
                        <strong>{j.company}</strong>
                        <span>Fictional company</span>
                      </div>
                      <button
                        className="icon-button"
                        aria-label={
                          w.savedJobs.includes(j.id)
                            ? `Unsave ${j.title}`
                            : `Save ${j.title}`
                        }
                        disabled={busy}
                        onClick={() =>
                          void mutate({ type: "saveJob", id: j.id }).catch(
                            () => {},
                          )
                        }
                      >
                        {w.savedJobs.includes(j.id) ? (
                          <BookmarkCheck size={19} className="mint-text" />
                        ) : (
                          <Bookmark size={19} />
                        )}
                      </button>
                    </div>
                    <a href={`/jobs/${j.id}`}>
                      <h2>{j.title}</h2>
                    </a>
                    <div className="job-location">
                      <MapPin size={14} />
                      {j.location}
                      <span>·</span>
                      {j.mode}
                    </div>
                    <div className="job-tags">
                      {j.tags.map((t) => (
                        <Tag
                          key={t}
                          tone={
                            j.match.matched.some((s) => s.skill === t)
                              ? "mint"
                              : ""
                          }
                        >
                          {j.match.matched.some((s) => s.skill === t) && (
                            <Check size={11} />
                          )}{" "}
                          {t}
                        </Tag>
                      ))}
                    </div>
                    <div className="job-fit-summary">
                      <div>
                        <GitConnection />
                        <strong>
                          {j.match.matched.length} skill areas connected
                        </strong>
                      </div>
                      <p>
                        {j.match.missing.length
                          ? `Explore next: ${j.match.missing
                              .slice(0, 2)
                              .map((s) => s.skill)
                              .join(", ")}`
                          : "Review the full description and your evidence."}
                      </p>
                    </div>
                    <details className="ranking-reasons">
                      <summary>Why this recommendation?</summary>
                      <ul>
                        {j.reasons.map((reason) => (
                          <li key={reason}>{reason}</li>
                        ))}
                      </ul>
                    </details>
                    <a className="job-card-link" href={`/jobs/${j.id}`}>
                      See the fit
                      <ArrowUpRight size={16} />
                    </a>
                  </Panel>
                ))}
              </div>
              {!ranked.length && (
                <Empty
                  title="No examples match those filters."
                  description="Try another skill, work arrangement, or your full opportunity list."
                  action="Clear filters"
                  onClick={() => {
                    setQuery("");
                    setMode("Any");
                    setSavedOnly(false);
                  }}
                />
              )}
            </TabsContent>
            <TabsContent value="analyze">
              <div className="job-analyzer">
                <Panel>
                  <PanelTitle>Bring your own opportunity</PanelTitle>
                  <p className="panel-description">
                    Paste the complete description, including required and
                    preferred qualifications.
                  </p>
                  <Label htmlFor="jd-name">
                    Role or version name (optional)
                  </Label>
                  <Input
                    id="jd-name"
                    value={versionName}
                    onChange={(e) => setVersionName(e.target.value)}
                    placeholder="e.g. Software engineering intern"
                    maxLength={120}
                  />
                  <Label htmlFor="job-description">Job description</Label>
                  <Textarea
                    id="job-description"
                    className="job-description-input"
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setResult(null);
                    }}
                    placeholder="Paste the responsibilities and qualifications here..."
                    maxLength={18000}
                  />
                  <div className="answer-meta">
                    <span>Analyzed locally using Folio’s skill vocabulary</span>
                    <span>{description.length}/18,000</span>
                  </div>
                  <Primary
                    disabled={description.trim().length < 30}
                    onClick={() => setResult(analyzeJob(description, w))}
                  >
                    Compare with my evidence
                    <ArrowRight size={16} />
                  </Primary>
                </Panel>
                <Panel>
                  <PanelTitle>Your evidence match</PanelTitle>
                  {result ? (
                    <>
                      <MatchTable result={result} />
                      {!result.requirements.length && (
                        <p className="muted">
                          No recognized skill terms were found. Read the
                          description manually; the vocabulary is intentionally
                          bounded.
                        </p>
                      )}
                      <Primary
                        disabled={busy || !result.requirements.length}
                        onClick={() => void tailor(description, versionName)}
                      >
                        Create a tailored résumé
                        <ArrowRight size={16} />
                      </Primary>
                      <p className="panel-footnote">
                        Emphasizes supported experience. Missing skills are
                        never added to your résumé.
                      </p>
                    </>
                  ) : (
                    <div className="match-empty">
                      <Link2 size={38} />
                      <h3>A useful comparison starts with the role.</h3>
                      <p>
                        You’ll see what is supported, what is self-reported, and
                        what is still missing.
                      </p>
                    </div>
                  )}
                </Panel>
              </div>
            </TabsContent>
          </Tabs>
        </>
      ) : !job ? (
        <Empty
          title="Opportunity not found"
          description="Explore the example opportunities or analyze your own job description."
          action="Back to opportunities"
          onClick={() => window.location.assign("/jobs")}
        />
      ) : (
        <>
          <a className="back-link" href="/jobs">
            <ArrowLeft size={15} />
            All opportunities
          </a>
          <PageHeading
            eyebrow={`${job.company.toUpperCase()} · FICTIONAL EXAMPLE`}
            title={job.title}
            description={`${job.location} · ${job.mode} · ${job.type}`}
            action={
              <button
                className="subtle-button"
                disabled={busy}
                onClick={() =>
                  void mutate({ type: "saveJob", id: job.id }).catch(() => {})
                }
              >
                {w.savedJobs.includes(job.id) ? (
                  <BookmarkCheck size={17} />
                ) : (
                  <Bookmark size={17} />
                )}{" "}
                {w.savedJobs.includes(job.id)
                  ? "Saved opportunity"
                  : "Save opportunity"}
              </button>
            }
          />
          <div className="job-detail-grid">
            <Panel>
              <PanelTitle>About this example role</PanelTitle>
              <p className="job-full-description">{job.description}</p>
              <div className="job-notice">
                <ShieldCheck size={20} />
                <p>
                  This is a fictional listing for testing the matching workflow.
                  There is no live vacancy or application link.
                </p>
              </div>
              <PanelTitle>How to use this match</PanelTitle>
              <ol className="steps-list">
                <li>Read every requirement in the original description.</li>
                <li>Review the facts connected to each matched skill.</li>
                <li>Use your actual work to tailor a résumé.</li>
                <li>
                  Check eligibility and application instructions with the
                  employer.
                </li>
              </ol>
            </Panel>
            <Panel>
              <PanelTitle>What connects you</PanelTitle>
              {match && <MatchTable result={match} />}
              <Primary
                disabled={busy}
                onClick={() =>
                  void tailor(job.description, `${job.title} · ${job.company}`)
                }
              >
                Create a tailored draft
                <ArrowRight size={16} />
              </Primary>
              <p className="panel-footnote">
                Your master facts stay unchanged.
              </p>
            </Panel>
          </div>
        </>
      )}
    </>
  );
}
function GitConnection() {
  return <Link2 size={15} />;
}
function MatchTable({ result }: { result: ReturnType<typeof analyzeJob> }) {
  return (
    <div className="match-result">
      {(["matched", "partial", "missing"] as const).map((status) => (
        <div className={`match-group ${status}`} key={status}>
          <div className="match-group-title">
            <span>
              {status === "matched" ? (
                <Check size={15} />
              ) : status === "partial" ? (
                <Link2 size={15} />
              ) : (
                <Plus size={15} />
              )}{" "}
              {status === "matched"
                ? "Connected evidence"
                : status === "partial"
                  ? "Self-reported · add evidence"
                  : "Not yet evidenced"}
            </span>
            <Tag>{result[status].length}</Tag>
          </div>
          {result[status].map((r) => (
            <div className="requirement-row" key={r.skill}>
              <strong>{r.skill}</strong>
              <span>{r.priority}</span>
              <details>
                <summary>See requirement</summary>
                <p>{r.source}</p>
                {r.evidenceIds.length > 0 && (
                  <small>
                    {r.evidenceIds.length} source answers connected in your
                    profile
                  </small>
                )}
              </details>
            </div>
          ))}
        </div>
      ))}
      {result.experience.length > 0 && (
        <p className="inline-warning">
          Experience mentioned: {result.experience.join(", ")}. Folio does not
          verify eligibility.
        </p>
      )}
      <p className="panel-footnote">{result.note}</p>
    </div>
  );
}
