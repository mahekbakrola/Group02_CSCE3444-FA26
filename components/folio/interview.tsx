"use client";
import { useSearchParams } from "next/navigation";
import { useState, useRef } from "react";
import {
  ArrowRight,
  Plus,
  Lightbulb,
  ShieldCheck,
  MessagesSquare,
  BookmarkCheck,
  Sparkles,
  FileText,
  Pencil,
  ChevronRight,
} from "lucide-react";
import { useWorkspace } from "./workspace";
import { PageHeading, Panel, Tag, Primary, Pick, Empty } from "./shared";
import { EntityEditor } from "./entity-editor";
import { QUESTION_BANK } from "@/lib/engine/questions";
import {
  questionQueue,
  completeness,
  validateAnswer,
} from "@/lib/engine/interview";
import type { Question, Category, Fact } from "@/lib/engine/model";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import type { Suggestions } from "@/lib/providers/ai";
import { fetchJson } from "@/lib/client-request";
export function AnswerForm({
  q,
  entityId,
  fact,
  onSaved,
}: {
  q: Question;
  entityId: string;
  fact?: Fact;
  onSaved: () => void;
}) {
  const { mutate, busy } = useWorkspace();
  const [answer, setAnswer] = useState(
    fact?.value === "__skipped__" ? "" : (fact?.value ?? ""),
  );
  const [confirmed, setConfirmed] = useState(!q.metric || !!fact?.confirmed);
  const [error, setError] = useState<string | null>(null);
  async function save(skip = false) {
    const value = skip ? "__skipped__" : answer;
    const err = validateAnswer(q, value);
    if (err) {
      setError(err);
      return;
    }
    if (q.metric && !skip && !confirmed) {
      setError("Confirm the number or range, or skip this question.");
      return;
    }
    try {
      await mutate({
        type: "answer",
        entityId,
        questionId: q.id,
        value,
        confirmed: !skip && confirmed,
      });
      toast.success(skip ? "Skipped for now" : "Answer saved");
      onSaved();
    } catch {}
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
      className="answer-form"
    >
      <div className="question-topline">
        <Tag tone="mint">{q.category.toUpperCase()}</Tag>
        <span>{q.required ? "Core question" : "Optional · skip any time"}</span>
      </div>
      <h2 id="question-label">{q.text}</h2>
      <p className="question-why" id="question-why">
        {q.why}
      </p>
      {q.inputType === "choice" ? (
        <RadioGroup
          value={answer}
          onValueChange={setAnswer}
          aria-labelledby="question-label"
          className="choice-list"
        >
          {q.options?.map((o, i) => (
            <Label
              className={`choice-card ${answer === o ? "selected" : ""}`}
              htmlFor={`choice-${i}`}
              key={o}
            >
              <RadioGroupItem value={o} id={`choice-${i}`} />
              {o}
            </Label>
          ))}
        </RadioGroup>
      ) : q.inputType === "multi" ? (
        <div
          className="choice-list"
          role="group"
          aria-labelledby="question-label"
        >
          {q.options?.map((o, i) => (
            <Label
              className={`choice-card ${answer.split(" | ").includes(o) ? "selected" : ""}`}
              htmlFor={`multi-${i}`}
              key={o}
            >
              <Checkbox
                id={`multi-${i}`}
                checked={answer.split(" | ").includes(o)}
                onCheckedChange={(checked) => {
                  const values = answer ? answer.split(" | ") : [];
                  setAnswer(
                    (checked
                      ? [...values, o]
                      : values.filter((v) => v !== o)
                    ).join(" | "),
                  );
                }}
              />
              {o}
            </Label>
          ))}
        </div>
      ) : q.inputType === "textarea" ? (
        <Textarea
          className="interview-input"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          aria-labelledby="question-label"
          aria-describedby="question-why"
          aria-invalid={!!error}
          placeholder={
            q.example ??
            "Write it in your own words. A few sentences are enough."
          }
          maxLength={q.validation.maxLength}
        />
      ) : (
        <Input
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          aria-labelledby="question-label"
          type={
            q.inputType === "email"
              ? "email"
              : q.inputType === "url"
                ? "url"
                : "text"
          }
          placeholder={q.example ?? "Your answer"}
          maxLength={q.validation.maxLength}
        />
      )}
      <div className="answer-meta">
        <span>
          <ShieldCheck size={13} />
          Saved when you continue
        </span>
        <span>
          {answer.length}/{q.validation.maxLength}
        </span>
      </div>
      {q.metric && (
        <Label className="confirm-metric">
          <Checkbox
            checked={confirmed}
            onCheckedChange={(v) => setConfirmed(v === true)}
          />
          This is an exact figure or an estimate I can support. I have included
          its context.
        </Label>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="answer-actions">
        <button
          type="button"
          className="subtle-button"
          onClick={() => void save(true)}
          disabled={q.required || busy}
        >
          I’m not sure · skip
        </button>
        <Primary type="submit" disabled={busy}>
          {busy ? "Saving..." : fact ? "Update answer" : "Save & continue"}
          <ArrowRight size={16} />
        </Primary>
      </div>
    </form>
  );
}
export function Interview() {
  const { w, mode } = useWorkspace();
  const search = useSearchParams();
  const [entityId, setEntityId] = useState("");
  const [category, setCategory] = useState<Category | undefined>();
  const [edit, setEdit] = useState<string | null>(null);
  const [add, setAdd] = useState(false);
  const [suggestions, setSuggestions] = useState<{
    provider: string;
    suggestions: Suggestions;
  } | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const suggestionRequest = useRef(0);
  if (!w) return null;
  const requested = search.get("entity");
  const selected =
    entityId ||
    (requested === "profile" || w.entities.some((e) => e.id === requested)
      ? requested!
      : (w.entities[0]?.id ?? "profile"));
  const e = w.entities.find((e) => e.id === selected);
  const scope = e?.kind ?? "profile";
  const queue = questionQueue(
    w,
    scope === "profile" ? category : undefined,
    selected,
  );
  const editing = w.facts.find((f) => f.id === edit);
  const q = editing
    ? QUESTION_BANK.find((q) => q.id === editing.questionId)
    : queue[0];
  const answers = w.facts.filter(
    (f) =>
      f.entityId === selected &&
      QUESTION_BANK.some((q) => q.id === f.questionId),
  );
  const c = completeness(w);
  const remaining = queue.filter((q) => q.priority >= 80).length;
  async function suggest() {
    const request = ++suggestionRequest.current;
    setAiBusy(true);
    try {
      const data = await fetchJson<{ provider: string; suggestions: Suggestions }>("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, entityId: selected }),
      }, 35000);
      if (request === suggestionRequest.current) setSuggestions(data);
    } catch (e) {
      if (request === suggestionRequest.current) toast.error(
        e instanceof Error ? e.message : "Unable to suggest questions.",
      );
    } finally {
      if (request === suggestionRequest.current) setAiBusy(false);
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="YOUR EXPERIENCE, IN YOUR WORDS"
        title="Let’s connect the dots."
        description="A thoughtful conversation. A stronger story. One question at a time."
        action={
          <a className="subtle-button" href="/resume">
            <FileText size={16} />
            Build a draft
            <ArrowUpRightIcon />
          </a>
        }
      />
      <div className="interview-layout">
        <aside className="interview-outline">
          <div className="eyebrow">YOUR STORY</div>
          <button
            className={`outline-item ${selected === "profile" ? "active" : ""}`}
            onClick={() => {
              setEntityId("profile");
              setEdit(null);
              setSuggestions(null);
              suggestionRequest.current += 1;
              setAiBusy(false);
            }}
          >
            <span className="outline-number">01</span>
            <div>
              <strong>The foundations</strong>
              <span>Education, interests & contact</span>
            </div>
          </button>
          {w.entities.map((x, i) => (
            <button
              className={`outline-item ${selected === x.id ? "active" : ""}`}
              key={x.id}
              onClick={() => {
                setEntityId(x.id);
                setEdit(null);
                setSuggestions(null);
                suggestionRequest.current += 1;
                setAiBusy(false);
              }}
            >
              <span className="outline-number">
                {String(i + 2).padStart(2, "0")}
              </span>
              <div>
                <strong>{x.title}</strong>
                <span>
                  {x.kind === "project"
                    ? "Project"
                    : x.kind === "activity"
                      ? "Activity"
                      : "Experience"}
                </span>
              </div>
            </button>
          ))}
          <button className="add-outline" onClick={() => setAdd(true)}>
            <Plus size={16} />
            Add an experience
          </button>
          <div className="outline-tip">
            <Lightbulb size={19} />
            <p>
              No formal experience? A class project or helping someone counts.
            </p>
            <a href="/discover">
              Find a starting point
              <ArrowRight size={14} />
            </a>
          </div>
        </aside>
        <div className="interview-main">
          <div className="interview-status">
            <span>
              <MessagesSquare size={17} />
              {e?.title ?? "The foundations"}
            </span>
            <span>
              <BookmarkCheck size={14} />
              {answers.filter((f) => f.confirmed).length} answers saved
            </span>
          </div>
          {selected === "profile" && (
            <div className="category-picker">
              <Pick
                label="Question category"
                value={category ?? "all"}
                onChange={(v) => {
                  setCategory(v === "all" ? undefined : (v as Category));
                  setEdit(null);
                }}
                options={[
                  "all",
                  "identity",
                  "education",
                  "career",
                  "skills",
                  "discovery",
                ].map((v) => ({
                  value: v,
                  label:
                    v === "all"
                      ? "Follow the guided interview"
                      : v[0].toUpperCase() + v.slice(1),
                }))}
              />
            </div>
          )}
          <Panel className="question-panel">
            {q ? (
              <AnswerForm
                key={`${selected}:${q.id}:${edit ?? "next"}:${mode}`}
                q={q}
                entityId={selected}
                fact={editing}
                onSaved={() => { setEdit(null); setSuggestions(null); }}
              />
            ) : (
              <Empty
                title="A good place to pause."
                description="You’ve answered the available questions in this section. You can revisit any answer below, add another experience, or create your résumé."
                action="Add another experience"
                onClick={() => setAdd(true)}
              />
            )}
          </Panel>
          <div className="interview-progress">
            <Progress
              value={
                (answers.length / (answers.length + queue.length || 1)) * 100
              }
              aria-label="Section question coverage"
            />
            <p>
              {c.enough ? "You have enough for a draft. " : ""}
              {remaining
                ? `${remaining} core follow-up${remaining === 1 ? "" : "s"} could add useful detail.`
                : "Explore another section when you’re ready."}
            </p>
          </div>
          {answers.length > 0 && (
            <Panel className="answers-history">
              <div className="panel-title">
                <h2>Your saved answers</h2>
                <Tag>{answers.length}</Tag>
              </div>
              {answers
                .slice()
                .reverse()
                .map((f) => (
                  <button
                    className="answer-history-row"
                    key={f.id}
                    onClick={() => {
                      setEdit(f.id);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    <div>
                      <h3>
                        {QUESTION_BANK.find((q) => q.id === f.questionId)?.text}
                      </h3>
                      <p>
                        {f.value === "__skipped__"
                          ? "Skipped — revisit whenever you like"
                          : f.value}
                      </p>
                    </div>
                    <Pencil size={15} />
                  </button>
                ))}
            </Panel>
          )}
        </div>
        <aside className="interview-helper">
          <div className="helper-symbol">✧</div>
          <h3>Why these questions?</h3>
          <p>
            Your résumé becomes stronger when it explains your{" "}
            <strong>action</strong>, the <strong>context</strong>, and the{" "}
            <strong>outcome</strong>.
          </p>
          <div className="evidence-example">
            <span>BEFORE</span>
            <p>“I fixed phones.”</p>
            <span className="mint-text">AFTER FOLLOW-UPS</span>
            <p>
              “Diagnosed smartphone hardware issues and explained repair options
              to customers.”
            </p>
            <small>Only if those details are confirmed.</small>
          </div>
          <div className="helper-divider" />
          <h3>You’re in control.</h3>
          <p>
            Skip optional questions. Edit any answer. Numbers are never
            required.
          </p>
          {e && (
            <>
              <button
                className="subtle-button ai-suggest"
                disabled={aiBusy}
                onClick={() => void suggest()}
              >
                <Sparkles size={15} />
                {aiBusy ? "Finding questions..." : "Find useful follow-ups"}
              </button>
              {suggestions && (
                <div className="suggested-questions">
                  <Tag>
                    {suggestions.provider === "rules"
                      ? "RULE-BASED SUGGESTIONS"
                      : "AI SUGGESTIONS"}
                  </Tag>
                  {suggestions.suggestions.suggestedFollowUps.map((s) => (
                    <div key={s.question}>
                      <strong>{s.question}</strong>
                      <p>{s.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </aside>
      </div>
      <EntityEditor
        key={add ? "new" : "closed"}
        open={add}
        onClose={() => setAdd(false)}
        onCreated={(id) => {
          setEntityId(id);
          setEdit(null);
        }}
      />
    </>
  );
}
function ArrowUpRightIcon() {
  return <ChevronRight size={16} />;
}
