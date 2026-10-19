import { newId } from "./id.ts";
import type { Workspace, Bullet, Fact, Resume, Template } from "./model.ts";
export const SKILLS: Record<string, string[]> = {
  Python: ["python"],
  JavaScript: ["javascript", "js"],
  TypeScript: ["typescript"],
  React: ["react"],
  SQL: ["sql", "postgresql", "mysql", "sqlite"],
  Git: ["git", "github"],
  Linux: ["linux", "ubuntu"],
  Docker: ["docker"],
  "C++": ["c++"],
  C: ["c programming"],
  Java: ["java"],
  HTML: ["html"],
  CSS: ["css"],
  AWS: ["aws", "amazon web services"],
  Azure: ["azure"],
  Networking: ["networking", "tcp/ip", "wireshark"],
  Security: ["security", "firewall", "vulnerability"],
  Troubleshooting: ["diagnos", "troubleshoot", "repair"],
  Communication: ["explain", "communicat", "customer"],
  Leadership: ["train", "led ", "organized"],
  Testing: ["test", "pytest", "jest"],
  Pandas: ["pandas"],
  Excel: ["excel", "spreadsheet"],
  Kubernetes: ["kubernetes"],
  Terraform: ["terraform"],
  TensorFlow: ["tensorflow"],
  PyTorch: ["pytorch"],
  Statistics: ["statistics", "statistical"],
  "Machine learning": ["machine learning"],
  Figma: ["figma"],
  Rust: ["rust"],
  Swift: ["swift"],
  Kotlin: ["kotlin"],
  Embedded: ["embedded", "arduino", "microcontroller"],
  "Data pipelines": ["pipeline", "etl"],
};
function escaped(v: string) {
  return v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
export function containsSkill(text: string, skill: string) {
  return (SKILLS[skill] ?? [skill.toLowerCase()]).some((a) =>
    new RegExp(
      `(^|[^a-z0-9])${escaped(a)}${["diagnos", "troubleshoot", "communicat", "explain", "test", "repair"].includes(a) ? "[a-z]*" : ""}($|[^a-z0-9])`,
      "i",
    ).test(text),
  );
}
function positiveMention(text: string, skill: string) {
  return text
    .split(/[.!?;\n]/)
    .some(
      (sentence) =>
        containsSkill(sentence, skill) &&
        !/(\bno\b|\bnot\b|never|haven.t|without|don.t|want to learn|plan to learn)/i.test(
          sentence,
        ),
    );
}
export function skillEvidence(w: Workspace) {
  return Object.keys(SKILLS)
    .map((skill) => {
      const facts = w.facts.filter(
        (f) =>
          f.confirmed &&
          f.value !== "__skipped__" &&
          f.entityId !== "profile" &&
          positiveMention(f.value, skill) &&
          w.facts.some(
            (a) =>
              a.entityId === f.entityId &&
              a.questionId.endsWith(".action") &&
              a.confirmed,
          ),
      );
      return {
        skill,
        facts,
        level: facts.length ? "Demonstrated" : "Self-reported",
      };
    })
    .filter(
      (s) =>
        s.facts.length ||
        positiveMention(
          w.facts.find((f) => f.questionId === "skills.claimed")?.value ?? "",
          s.skill,
        ),
    );
}
const numbers = (s: string): string[] =>
  s.match(/\d+(?:[,.]\d+)*(?:\s*[-–]\s*\d+(?:\.\d+)?)?\+?%?/g) ?? [];
export function evidenceIssues(b: Bullet, facts: Fact[]) {
  const sources = b.evidenceIds.map((id) => facts.find((f) => f.id === id));
  const issues: string[] = [];
  if (
    !sources.length ||
    sources.some((f) => !f || !f.confirmed || f.value === "__skipped__")
  )
    issues.push("Missing or unconfirmed source");
  if (sources.some((f) => f && b.sourceRevisions[f.id] !== f.revision))
    issues.push("A source changed — review this bullet again");
  const tokens = numbers(sources.map((f) => f?.value ?? "").join(" "));
  if (numbers(b.text).some((n) => !tokens.includes(n)))
    issues.push("A number is not present in the cited evidence");
  if (!b.approved) issues.push("Needs your approval");
  return issues;
}
function sentence(s: string) {
  const clean = s
    .trim()
    .replace(/^I\s+/i, "")
    .replace(/^we\s+/i, "")
    .replace(/[.\s]+$/, "");
  return clean ? clean[0].toUpperCase() + clean.slice(1) : "";
}
export function buildBullets(w: Workspace): Bullet[] {
  return w.entities.flatMap((e) => {
    const get = (suffix: string) =>
      w.facts.find(
        (f) =>
          f.entityId === e.id &&
          f.questionId === `${e.kind}.${suffix}` &&
          f.confirmed &&
          f.value !== "__skipped__",
      );
    const action = get("action");
    if (!action) return [];
    const outcome = get("outcome"),
      tools = get("tools"),
      metric = get("metric");
    const chosen = [action, outcome, tools, metric].filter(
      (f): f is Fact => !!f,
    );
    const text =
      [
        sentence(action.value),
        outcome ? sentence(outcome.value) : "",
        tools ? `Tools: ${tools.value.replace(/[.\s]+$/, "")}` : "",
        metric ? `Scope: ${metric.value.replace(/[.\s]+$/, "")}` : "",
      ]
        .filter(Boolean)
        .join(". ") + ".";
    return [
      {
        id: newId(),
        entityId: e.id,
        text,
        original: text,
        evidenceIds: chosen.map((f) => f.id),
        sourceRevisions: Object.fromEntries(
          chosen.map((f) => [f.id, f.revision]),
        ),
        approved: false,
      },
    ];
  });
}
export function confirmedCertifications(w: Workspace): string[] {
  return w.facts
    .filter((f) => f.entityId === "profile" && f.confirmed && f.questionId === "skills.certifications")
    .map((f) => f.value.trim())
    .filter((value) => value && !/^(no|none|n\/a|not applicable|not yet|none yet)[.!]?$/i.test(value));
}
export function newResume(
  w: Workspace,
  name: string,
  target: string,
  template: Template = "classic",
  jobDescription = "",
): Resume {
  let bullets = buildBullets(w);
  if (jobDescription)
    bullets = bullets.sort(
      (a, b) =>
        Object.keys(SKILLS).filter(
          (s) => containsSkill(jobDescription, s) && containsSkill(b.text, s),
        ).length -
        Object.keys(SKILLS).filter(
          (s) => containsSkill(jobDescription, s) && containsSkill(a.text, s),
        ).length,
    );
  return {
    id: newId(),
    name,
    target,
    template,
    bullets,
    createdAt: new Date().toISOString(),
    revision: 1,
    profileSnapshot: { ...w.profile },
    entitySnapshot: structuredClone(w.entities),
    skillsSnapshot: skillEvidence(w)
      .filter((s) => s.facts.length)
      .map((s) => s.skill),
    educationExtras: w.facts
      .filter(
        (f) =>
          f.confirmed &&
          ["education.coursework", "education.honors"].includes(f.questionId),
      )
      .map((f) => f.value),
    certificationsSnapshot: confirmedCertifications(w),
    jobDescription,
    sectionOrder:
      template === "technical"
        ? ["education", "project", "experience", "activity"]
        : ["education", "experience", "project", "activity"],
  };
}
export function resumeHealth(w: Workspace, r?: Resume) {
  const bullets = r?.bullets ?? buildBullets(w);
  const findings: {
    title: string;
    detail: string;
    kind: "warning" | "good";
    action: string;
  }[] = [];
  const missing = w.entities.filter(
    (e) =>
      !w.facts.some(
        (f) =>
          f.entityId === e.id &&
          f.questionId.endsWith(".outcome") &&
          f.confirmed,
      ),
  );
  if (missing.length)
    findings.push({
      title: `Add an outcome to ${missing.length} experience${missing.length === 1 ? "" : "s"}`,
      detail:
        "Describe what changed because of your work. A number is optional.",
      kind: "warning",
      action: "interview",
    });
  const claims = skillEvidence(w).filter((s) => !s.facts.length);
  if (claims.length)
    findings.push({
      title: `Give ${claims.map((s) => s.skill).join(", ")} an example`,
      detail:
        "These skills are self-reported and are not yet supported by your work.",
      kind: "warning",
      action: "profile",
    });
  const review = bullets.filter((b) => evidenceIssues(b, w.facts).length);
  if (review.length)
    findings.push({
      title: `Review ${review.length} résumé bullet${review.length === 1 ? "" : "s"}`,
      detail:
        "Check the wording and linked evidence before approving your draft.",
      kind: "warning",
      action: "resume",
    });
  if (!w.profile.email)
    findings.push({
      title: "Add your contact email",
      detail: "Give employers a reliable way to contact you.",
      kind: "warning",
      action: "profile",
    });
  const long = bullets.filter((b) => b.text.split(/\s+/).length > 65);
  if (long.length)
    findings.push({
      title: `Shorten ${long.length} long bullet${long.length === 1 ? "" : "s"}`,
      detail: "Aim for a concise statement with one main contribution.",
      kind: "warning",
      action: "resume",
    });
  if (!findings.length)
    findings.push({
      title: "Your evidence is connected",
      detail:
        "Review the exported PDF and the employer’s instructions before applying.",
      kind: "good",
      action: "resume",
    });
  return {
    findings,
    approved: bullets.filter((b) => !evidenceIssues(b, w.facts).length).length,
    total: bullets.length,
    withMetrics: bullets.filter((b) => numbers(b.text).length).length,
  };
}

export function bulletSuggestions(w: Workspace, entityId: string) {
  const entity = w.entities.find((e) => e.id === entityId);
  if (!entity) return [];
  const get = (suffix: string) =>
    w.facts.find(
      (f) =>
        f.entityId === entityId &&
        f.questionId === `${entity.kind}.${suffix}` &&
        f.confirmed &&
        f.value !== "__skipped__",
    );
  const raw = get("summary"),
    action = get("action");
  const full = buildBullets(w).find((b) => b.entityId === entityId);
  return [
    raw
      ? {
          level: "Weak · raw description",
          text: raw.value,
          why: "A starting point. A broad description may leave your own contribution unclear.",
        }
      : null,
    action
      ? {
          level: "Good · a clear action",
          text: sentence(action.value) + ".",
          why: "Names the work you personally did. Review the verb tense and wording for accuracy.",
        }
      : null,
    full
      ? {
          level: "Strong · supported detail",
          text: full.text,
          why: get("outcome")
            ? "Connects your action to the outcome you reported, with only tools and scale you supplied."
            : "Adds the context you supplied. An outcome would strengthen it further; no result or number is invented.",
        }
      : null,
  ].filter(
    (s): s is { level: string; text: string; why: string } => s !== null,
  );
}
