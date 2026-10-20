"use client";
import { newId } from "@/lib/engine/id";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Plus,
  Compass,
  Grid2X2,
  Orbit,
  ShieldCheck,
  BookOpen,
  Lightbulb,
  Search,
} from "lucide-react";
import { useWorkspace } from "./workspace";
import { PageHeading, Panel, PanelTitle, Tag, Primary, Empty } from "./shared";
import { Constellation } from "./constellation";
import { matchCareers } from "@/lib/providers/careers";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { fetchJson } from "@/lib/client-request";
export function CareerExplorer({ id }: { id?: string }) {
  const { w, mutate, busy } = useWorkspace();
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<{
    source: string;
    occupation: unknown;
  } | null>(null);
  const [fetching, setFetching] = useState(false);
  if (!w) return null;
  const careers = matchCareers(w);
  const career = id ? careers.find((c) => c.id === id) : null;
  async function sourceDetails() {
    if (!career) return;
    setFetching(true);
    try {
      setSource(await fetchJson(`/api/occupation?code=${encodeURIComponent(career.code)}`));
    } catch {
      toast.error(
        "Occupation information is unavailable. Try the source link.",
      );
    } finally {
      setFetching(false);
    }
  }
  return (
    <>
      {!id ? (
        <>
          <PageHeading
            eyebrow="FOLLOW YOUR CURIOSITY"
            title="A world of possible directions."
            description="Explore how your interests and evidence connect to the work people actually do."
            action={
              <a className="subtle-button" href="/interview">
                <Compass size={16} />
                Refine my direction
                <ArrowRight size={16} />
              </a>
            }
          />
          <Tabs defaultValue="map" className="career-tabs">
            <div className="career-view-tools">
              <div>
                <Tag tone="mint">{careers.length} PATHWAYS</Tag>
                <span>Connections, not predictions.</span>
              </div>
              <TabsList>
                <TabsTrigger value="map">
                  <Orbit size={15} />
                  Constellation
                </TabsTrigger>
                <TabsTrigger value="list">
                  <Grid2X2 size={15} />
                  List view
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="map">
              <Panel className="career-universe">
                <div className="universe-text">
                  <div className="eyebrow">YOUR POSSIBILITIES, CONNECTED</div>
                  <h2>
                    Find the work <br />
                    that makes you <br />
                    <em>look closer.</em>
                  </h2>
                  <p>
                    Select a path to see the work, your connections, and a place
                    to begin.
                  </p>
                  <div className="universe-legend">
                    <span>
                      <i style={{ background: "#9ae8c3" }} />
                      Build
                    </span>
                    <span>
                      <i style={{ background: "#91bdf3" }} />
                      Discover
                    </span>
                    <span>
                      <i style={{ background: "#cab0ee" }} />
                      Protect
                    </span>
                    <span>
                      <i style={{ background: "#efc58e" }} />
                      Connect
                    </span>
                  </div>
                </div>
                <div className="universe-canvas">
                  <Constellation
                    interactive
                    motion={w.profile.motion}
                    onSelect={(id) => window.location.assign(`/career/${id}`)}
                  />
                  <span className="graph-instruction">
                    Drag to explore · select a labeled path
                  </span>
                </div>
              </Panel>
            </TabsContent>
            <TabsContent value="list">
              <div className="career-list-note">
                <Compass size={21} />
                <p>
                  Every path is available below. Your strongest evidence
                  connections appear first.
                </p>
              </div>
            </TabsContent>
          </Tabs>
          <div className="section-caption">
            <h2>Paths worth exploring</h2>
            <div className="input-with-icon">
              <Search size={16} />
              <Input
                placeholder="Find a field..."
                aria-label="Search career paths"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="career-grid">
            {careers
              .filter((c) =>
                `${c.title} ${c.skills.join(" ")}`
                  .toLowerCase()
                  .includes(query.toLowerCase()),
              )
              .map((c) => (
                <a
                  href={`/career/${c.id}`}
                  className="career-card"
                  key={c.id}
                >
                  <div className="career-card-top">
                    <span
                      className="career-orb"
                      style={{ background: c.color }}
                    />
                    <span>{c.cluster.toUpperCase()}</span>
                    <ArrowUpRight size={18} />
                  </div>
                  <h2>{c.title}</h2>
                  <p>{c.description}</p>
                  <Tag tone={c.matched.length >= 2 ? "mint" : ""}>
                    {c.label}
                  </Tag>
                  <div className="career-skill-tags">
                    {c.matched.length ? (
                      c.matched.slice(0, 3).map((s) => (
                        <span key={s}>
                          <Check size={11} />
                          {s}
                        </span>
                      ))
                    ) : (
                      <span>Start with curiosity and a small project</span>
                    )}
                  </div>
                  <div className="career-card-bottom">
                    {c.matched.length} of {c.skills.length} skill areas
                    connected
                    <ArrowRight size={15} />
                  </div>
                </a>
              ))}
          </div>
          <div className="method-note">
            <ShieldCheck size={18} />
            <p>
              Folio combines demonstrated skill overlap, interests, and the work
              you enjoyed. Labels are an application heuristic, not a scientific
              assessment or hiring prediction. Pathways link to recognized O*NET
              occupations.
            </p>
          </div>
        </>
      ) : !career ? (
        <Empty
          title="Path not found"
          description="Choose a field from the career explorer."
          action="Explore careers"
          onClick={() => window.location.assign("/career")}
        />
      ) : (
        <>
          <a className="back-link" href="/career">
            <ArrowLeft size={15} />
            All career paths
          </a>
          <PageHeading
            eyebrow={`${career.cluster.toUpperCase()} · O*NET ${career.code}`}
            title={career.title}
            description={career.description}
            action={<Tag tone="mint">{career.label}</Tag>}
          />
          <div className="career-detail-grid">
            <div>
              <Panel className="career-reasons">
                <PanelTitle>Why this could connect with you</PanelTitle>
                {career.reasons.length ? (
                  career.reasons.map((reason) => (
                    <div className="reason-row" key={reason}>
                      <Check size={17} />
                      {reason}
                    </div>
                  ))
                ) : (
                  <p className="muted">
                    There is not enough information to recommend this path yet.
                    Explore the tasks, then add your interests and examples.
                  </p>
                )}
                <div className="panel-footnote">
                  Evidence overlap {career.matched.length}/
                  {career.skills.length} · Interests{" "}
                  {career.interestsMatched.length}/{career.interests.length}
                </div>
              </Panel>
              <Panel>
                <PanelTitle>What the work can look like</PanelTitle>
                {career.tasks.map((t, i) => (
                  <div className="task-row" key={t}>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <p>{t}</p>
                  </div>
                ))}
                <a
                  className="text-link"
                  href={`https://www.onetonline.org/link/summary/${career.code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Explore the full O*NET occupation
                  <ArrowUpRight size={15} />
                </a>
              </Panel>
              <Panel>
                <PanelTitle>Map your next steps</PanelTitle>
                <div className="skills-comparison">
                  <div>
                    <h3>
                      <Check size={16} />
                      Already connected
                    </h3>
                    {career.matched.length ? (
                      career.matched.map((s) => <p key={s}>{s}</p>)
                    ) : (
                      <p className="muted">No work evidence yet</p>
                    )}
                  </div>
                  <div>
                    <h3>
                      <Plus size={16} />
                      Develop next
                    </h3>
                    {career.gaps.map((s) => (
                      <p key={s}>
                        {s}
                        {career.partial.includes(s) && <Tag>Self-reported</Tag>}
                      </p>
                    ))}
                  </div>
                </div>
              </Panel>
            </div>
            <aside>
              <Panel className="project-roadmap">
                <div className="eyebrow mint-text">
                  <Lightbulb size={16} /> A SMALL NEXT STEP
                </div>
                <h2>
                  Build something <br />
                  <em>you can point to.</em>
                </h2>
                <p>{career.project}</p>
                <Primary
                  disabled={busy}
                  onClick={() =>
                    void mutate({
                      type: "entity",
                      entity: {
                        id: newId(),
                        kind: "project",
                        title: `${career.title} learning project`,
                        subtitle: "Planned — add facts after completing work",
                        dates: "",
                      },
                    })
                      .then(() =>
                        toast.success(
                          "Project added. Describe only work you actually complete.",
                        ),
                      )
                      .catch(() => {})
                  }
                >
                  <Plus size={16} />
                  Add to my projects
                </Primary>
                <small>A planned project is not résumé evidence.</small>
              </Panel>
              <Panel>
                <PanelTitle>Areas to learn</PanelTitle>
                {career.learn.map((l) => (
                  <div className="learning-row" key={l}>
                    <BookOpen size={17} />
                    {l}
                  </div>
                ))}
                <p className="panel-footnote">
                  Folio-authored learning suggestions. Check your degree
                  requirements with your university.
                </p>
              </Panel>
              <Panel>
                <PanelTitle>About this occupation</PanelTitle>
                <p className="muted">
                  This pathway maps to O*NET {career.code}. Pathway titles and
                  project suggestions are curated by Folio.
                </p>
                <button
                  className="subtle-button"
                  disabled={fetching}
                  onClick={() => void sourceDetails()}
                >
                  {fetching ? "Loading..." : "Check data source"}
                  <ArrowRight size={14} />
                </button>
                {source && (
                  <div className="source-status">
                    <Tag>{source.source}</Tag>
                    <p>
                      Use the official occupation link for complete tasks,
                      skills, and details.
                    </p>
                  </div>
                )}
              </Panel>
            </aside>
          </div>
        </>
      )}
    </>
  );
}
