"use client";
import {
  ArrowRight,
  ArrowUpRight,
  MessagesSquare,
  FileText,
  Check,
  GitBranch,
  Layers,
  ShieldCheck,
  BriefcaseBusiness,
  Target,
  ChevronRight,
} from "lucide-react";
import { useWorkspace } from "./workspace";
import { PageHeading, Panel, PanelTitle, Tag, Jump, Primary } from "./shared";
import { Constellation } from "./constellation";
import { completeness } from "@/lib/engine/interview";
import { skillEvidence, resumeHealth } from "@/lib/engine/evidence";
import { matchCareers } from "@/lib/providers/careers";
import { rankJobs } from "@/lib/providers/jobs";
import { Progress } from "@/components/ui/progress";
export function Dashboard() {
  const { w } = useWorkspace();
  if (!w) return null;
  const c = completeness(w),
    skills = skillEvidence(w).filter((s) => s.facts.length),
    health = resumeHealth(w, w.resumes[0]),
    careers = matchCareers(w),
    jobs = rankJobs(w).slice(0, 2);
  return (
    <>
      <PageHeading
        eyebrow="A LITTLE CLARITY GOES A LONG WAY"
        title={`${w.mode === "demo" ? "Maya" : w.profile.name.split(" ")[0] || "Your story"}, meet your next chapter.`}
        description="Connect what you’ve done with what you could do next."
        action={
          <a className="subtle-button" href="/profile">
            <Target size={16} />
            View your profile
            <ArrowUpRight size={15} />
          </a>
        }
      />
      <div className="overview-top">
        <Panel className="constellation-panel">
          <div className="feature-copy">
            <div className="eyebrow mint-text">
              <span className="tiny-star">✧</span> EVERY EXPERIENCE COUNTS
            </div>
            <h2>
              You have more <br />
              <em>to work with.</em>
            </h2>
            <p>
              Your projects, part-time jobs, and small wins are pieces of a
              bigger story.
            </p>
            <Primary onClick={() => window.location.assign("/interview")}>
              Continue your interview
              <ArrowRight size={17} />
            </Primary>
            <span className="feature-caption">
              <ShieldCheck size={13} />
              Every claim connected to your words
            </span>
          </div>
          <div className="feature-graph">
            <Constellation
              motion={w.profile.motion}
              onSelect={(id) => window.location.assign(`/career/${id}`)}
            />
          </div>
          <div className="feature-bottom">
            <span>YOUR CAREER CONSTELLATION</span>
            <span>
              {skills.length} skills connected <span className="mint-dot" />
            </span>
          </div>
        </Panel>
        <Panel className="next-step">
          <div className="panel-label">
            <MessagesSquare size={18} /> YOUR NEXT BEST STEP
          </div>
          <Tag tone="amber">
            {c.enough ? "STRENGTHEN YOUR STORY" : "START WITH THE BASICS"}
          </Tag>
          <h2>
            {c.enough
              ? "What changed because of your work?"
              : "Let’s find your first story."}
          </h2>
          <p>
            {c.enough
              ? "You’ve described what you did. Adding an outcome will help someone understand why it mattered."
              : "A class project, part-time job, or helping a friend can be a useful place to begin."}
          </p>
          <a className="next-step-link" href="/interview">
            {c.enough ? "Add the missing piece" : "Begin your interview"}
            <ArrowUpRight size={18} />
          </a>
          <div className="time-note">One focused question at a time</div>
        </Panel>
      </div>
      <div className="stats-row">
        {[
          {
            label: "Captured experiences",
            value: w.entities.length,
            detail: "The building blocks of your story",
            icon: Layers,
          },
          {
            label: "Evidence-backed skills",
            value: skills.length,
            detail: "Connected to something you did",
            icon: GitBranch,
          },
          {
            label: "Résumé versions",
            value: w.resumes.length,
            detail: "Tailored for your next opportunity",
            icon: FileText,
          },
          {
            label: "Saved opportunities",
            value: w.savedJobs.length,
            detail:
              w.mode === "demo"
                ? "Fictional examples to explore"
                : "Your shortlist, ready to review",
            icon: BriefcaseBusiness,
          },
        ].map((s) => (
          <div className="stat" key={s.label}>
            <div>
              <span>{s.label}</span>
              <s.icon size={17} />
            </div>
            <strong>{String(s.value).padStart(2, "0")}</strong>
            <p>{s.detail}</p>
          </div>
        ))}
      </div>
      <div className="overview-middle">
        <Panel>
          <PanelTitle aside={<Jump href="/profile">View profile</Jump>}>
            Your story, taking shape
          </PanelTitle>
          <p className="panel-description">{c.message}</p>
          <div className="completeness">
            {c.groups.map((g) => (
              <a
                href={g.category === "skills" ? "/profile" : "/interview"}
                key={g.label}
              >
                <span>{g.label}</span>
                <Progress
                  value={g.percent}
                  aria-label={`${g.label}: ${g.done} of ${g.total} evidence fields`}
                />
                <b>{g.percent}%</b>
              </a>
            ))}
          </div>
          <div className="panel-footnote">
            Coverage of useful information. Employment is optional.
          </div>
        </Panel>
        <Panel>
          <PanelTitle
            aside={
              <Tag tone={health.findings[0].kind === "good" ? "mint" : "amber"}>
                {health.findings.filter((f) => f.kind === "warning").length} TO
                REVIEW
              </Tag>
            }
          >
            A stronger résumé starts here
          </PanelTitle>
          <div className="insight-list">
            {health.findings.slice(0, 3).map((f, i) => (
              <a href={`/${f.action}`} key={f.title}>
                <span
                  className={`insight-icon ${f.kind === "good" ? "good" : ""}`}
                >
                  {f.kind === "good" ? (
                    <Check size={16} />
                  ) : (
                    String(i + 1).padStart(2, "0")
                  )}
                </span>
                <div>
                  <h3>{f.title}</h3>
                  <p>{f.detail}</p>
                </div>
                <ChevronRight size={16} />
              </a>
            ))}
          </div>
          <div className="panel-footnote">
            <ShieldCheck size={13} />
            Practical guidance, without an invented ATS score.
          </div>
        </Panel>
      </div>
      <div className="overview-bottom">
        <Panel>
          <PanelTitle aside={<Jump href="/career">Explore all paths</Jump>}>
            Where your strengths could take you
          </PanelTitle>
          <div className="career-mini-grid">
            {careers.slice(0, 3).map((c, i) => (
              <a href={`/career/${c.id}`} className="career-mini" key={c.id}>
                <div className="career-mini-icon" style={{ color: c.color }}>
                  {i === 0 ? (
                    <GitBranch size={25} />
                  ) : i === 1 ? (
                    <ShieldCheck size={25} />
                  ) : (
                    <Layers size={25} />
                  )}
                </div>
                <h3>{c.title}</h3>
                <Tag>{c.label}</Tag>
                <p>
                  {c.matched.length
                    ? `${c.matched.length} skills connected to your experience`
                    : "A path to learn more about"}
                </p>
                <span className="mini-arrow">
                  <ArrowUpRight size={17} />
                </span>
              </a>
            ))}
          </div>
        </Panel>
        <Panel>
          <PanelTitle aside={<Jump href="/jobs">Browse</Jump>}>
            On your horizon
          </PanelTitle>
          <div className="job-mini-list">
            {jobs.map((j) => (
              <a href={`/jobs/${j.id}`} key={j.id}>
                <div
                  className="company-symbol"
                  style={{ color: j.color, background: `${j.color}12` }}
                >
                  {j.company[0]}
                </div>
                <div>
                  <h3>{j.title}</h3>
                  <p>
                    {j.company} · {j.mode}
                  </p>
                  <small>
                    {j.match.matched.length} skills connected · Fictional
                    listing
                  </small>
                </div>
                <ArrowUpRight size={15} />
              </a>
            ))}
          </div>
        </Panel>
      </div>
      <div className="discovery-strip">
        <div className="discovery-symbol">✧</div>
        <div>
          <h3>“I don’t have any experience.” Let’s look again.</h3>
          <p>
            Helping your club, fixing a laptop, building something for fun. It
            all starts somewhere.
          </p>
        </div>
        <a href="/discover">
          Find a hidden strength
          <ArrowRight size={17} />
        </a>
      </div>
    </>
  );
}
