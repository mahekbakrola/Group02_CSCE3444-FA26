import { QUESTION_BANK } from "./questions.ts";
import {
  valueOf,
  type Workspace,
  type Question,
  type Category,
  type Fact,
} from "./model.ts";
export function applicable(q: Question, w: Workspace, entityId = "profile") {
  return q.conditions.every((c) => {
    const local = valueOf(w, c.questionId, entityId);
    const v = local || valueOf(w, c.questionId);
    switch (c.operator) {
      case "exists":
        return !!v && v !== "__skipped__";
      case "equals":
        return v === c.value;
      case "notEquals":
        return v !== c.value;
      case "includes":
        return (c.value ?? "")
          .toLowerCase()
          .split("|")
          .some((term) => v.toLowerCase().includes(term));
    }
  });
}
export function questionQueue(
  w: Workspace,
  category?: Category,
  entityId = "profile",
): Question[] {
  const entity = w.entities.find((e) => e.id === entityId);
  return QUESTION_BANK.filter(
    (q) =>
      q.scope === (entity?.kind ?? "profile") &&
      (!category || q.category === category) &&
      applicable(q, w, entityId) &&
      !w.facts.some((f) => f.questionId === q.id && f.entityId === entityId),
  ).sort((a, b) => b.priority - a.priority);
}
export function validateAnswer(q: Question, value: string) {
  if (value === "__skipped__")
    return q.required ? "This answer is needed before continuing." : null;
  if (value.trim().length < q.validation.minLength)
    return "Add a little more detail, or skip this optional question.";
  if (value.length > q.validation.maxLength)
    return `Keep this answer under ${q.validation.maxLength} characters.`;
  if (q.inputType === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    return "Enter a valid email address.";
  if (q.inputType === "url") {
    try {
      if (!["https:", "http:"].includes(new URL(value).protocol))
        return "Use an https:// or http:// link.";
    } catch {
      return "Enter a complete URL, including https://.";
    }
  }
  if (q.inputType === "choice" && !q.options?.includes(value))
    return "Choose one of the available options.";
  if (
    q.inputType === "multi" &&
    value.split(" | ").some((x) => !q.options?.includes(x))
  )
    return "Choose from the available options.";
  return null;
}
export function completeness(w: Workspace) {
  const confirmed = w.facts.filter(
    (f) => f.confirmed && f.value !== "__skipped__",
  );
  const groups: {
    category: Category;
    label: string;
    total: number;
    done: number;
  }[] = [
    {
      category: "education",
      label: "Education",
      total: 3,
      done: [w.profile.school, w.profile.degree, w.profile.graduation].filter(
        Boolean,
      ).length,
    },
    {
      category: "experience",
      label: "Experience",
      total:
        Math.max(1, w.entities.filter((e) => e.kind === "experience").length) *
        4,
      done: confirmed.filter(
        (f) =>
          f.questionId.startsWith("experience.") &&
          ["action", "tools", "problem", "outcome"].includes(
            f.questionId.split(".")[1],
          ),
      ).length,
    },
    {
      category: "projects",
      label: "Projects",
      total:
        Math.max(1, w.entities.filter((e) => e.kind === "project").length) * 4,
      done: confirmed.filter(
        (f) =>
          f.questionId.startsWith("project.") &&
          ["action", "tools", "problem", "outcome"].includes(
            f.questionId.split(".")[1],
          ),
      ).length,
    },
    {
      category: "skills",
      label: "Skills evidence",
      total: Math.max(1, w.entities.length),
      done: w.entities.filter(
        (e) =>
          confirmed.some(
            (f) => f.entityId === e.id && f.questionId.endsWith(".tools"),
          ) &&
          confirmed.some(
            (f) => f.entityId === e.id && f.questionId.endsWith(".action"),
          ),
      ).length,
    },
    {
      category: "career",
      label: "Career direction",
      total: 3,
      done: [
        w.profile.target,
        w.profile.interests.length > 0,
        valueOf(w, "career.enjoyed"),
      ].filter(Boolean).length,
    },
  ];
  const enough = !!(
    w.profile.name &&
    w.profile.email &&
    w.profile.school &&
    w.profile.degree &&
    confirmed.some((f) => f.questionId.endsWith(".action"))
  );
  const remaining = w.entities.reduce(
    (n, e) =>
      n +
      questionQueue(w, undefined, e.id).filter((q) => q.priority >= 80).length,
    0,
  );
  const strong =
    enough &&
    w.entities.some((e) =>
      ["action", "tools", "problem", "outcome"].every((k) =>
        confirmed.some(
          (f) => f.entityId === e.id && f.questionId === `${e.kind}.${k}`,
        ),
      ),
    );
  return {
    groups: groups.map((g) => ({
      ...g,
      percent: Math.min(100, Math.round((g.done / g.total) * 100)),
    })),
    enough,
    strong,
    remaining,
    message: enough
      ? strong
        ? "Your story is ready to become a résumé."
        : "You have enough to create a first draft."
      : "Let’s capture your education and one thing you contributed.",
  };
}
export function factLabel(f: Fact) {
  return (
    QUESTION_BANK.find((q) => q.id === f.questionId)?.text ??
    (f.questionId === "bullet.edit"
      ? "Wording you supplied and confirmed"
      : "Confirmed imported information")
  );
}
