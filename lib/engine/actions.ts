import { QUESTION_BANK } from "./questions.ts";
import { validateAnswer } from "./interview.ts";
import { factKey, type Workspace, type Fact } from "./model.ts";
import type { Action } from "../validation.ts";
import { demoWorkspace } from "./demo.ts";
import { emptyWorkspace } from "./model.ts";
import { newResume, evidenceIssues } from "./evidence.ts";
export function applyAction(original: Workspace, a: Action): Workspace {
  let w = structuredClone(original);
  const now = new Date().toISOString();
  const invalidate = (ids: string[]) =>
    w.resumes.forEach((r) =>
      r.bullets.forEach((b) => {
        if (b.evidenceIds.some((id) => ids.includes(id))) b.approved = false;
      }),
    );
  const put = (f: Fact) => {
    w.facts = w.facts.filter((x) => x.id !== f.id);
    w.facts.push(f);
    invalidate([f.id]);
  };
  const snapshot = (id: string) => {
    const r = w.resumes.find((r) => r.id === id);
    if (r) {
      w.history.push({
        id: crypto.randomUUID(),
        resumeId: id,
        label: `Revision ${r.revision}`,
        createdAt: now,
        resume: structuredClone(r),
      });
      w.history = w.history.slice(-40);
    }
  };
  switch (a.type) {
    case "capture": {
      w = applyAction(w, { type: "entity", entity: a.entity });
      w = applyAction(w, { type: "answer", entityId: a.entity.id,
        questionId: `${a.entity.kind}.summary`, value: a.text, confirmed: true });
      break;
    }
    case "profile": {
      for (const key of ["website", "linkedin", "github"] as const) {
        if (a.profile[key]) {
          let u: URL;
          try {
            u = new URL(a.profile[key]);
          } catch {
            throw Error("Use complete https:// profile links.");
          }
          if (!["https:", "http:"].includes(u.protocol))
            throw Error("Use http or https links.");
        }
      }
      w.profile = a.profile;
      for (const q of QUESTION_BANK.filter(
        (q) => q.scope === "profile" && q.destination in w.profile,
      )) {
        const value = w.profile[q.destination as keyof typeof w.profile];
        const s = Array.isArray(value)
          ? value.join(" | ")
          : typeof value === "string"
            ? value
            : "";
        const id = factKey("profile", q.id);
        const old = w.facts.find((f) => f.id === id);
        if (!s) {
          if (old) {
            w.facts = w.facts.filter((f) => f.id !== id);
            invalidate([id]);
          }
          continue;
        }
        if (old?.value === s) continue;
        put({
          id,
          questionId: q.id,
          entityId: "profile",
          value: s,
          confirmed: true,
          revision: (old?.revision ?? 0) + 1,
          updatedAt: now,
        });
      }
      break;
    }
    case "answer": {
      const q = QUESTION_BANK.find((q) => q.id === a.questionId);
      if (!q) throw Error("Unknown question");
      const e = w.entities.find((e) => e.id === a.entityId);
      if (
        (q.scope === "profile" && a.entityId !== "profile") ||
        (q.scope !== "profile" && e?.kind !== q.scope)
      )
        throw Error("This question does not belong to that experience");
      const error = validateAnswer(q, a.value);
      if (error) throw Error(error);
      if (q.metric && a.value !== "__skipped__" && !a.confirmed)
        throw Error("Confirm the number or range, or skip it.");
      const id = factKey(a.entityId, a.questionId);
      const old = w.facts.find((f) => f.id === id);
      put({
        id,
        questionId: q.id,
        entityId: a.entityId,
        value: a.value.trim(),
        confirmed: a.confirmed && a.value !== "__skipped__",
        revision: (old?.revision ?? 0) + 1,
        updatedAt: now,
      });
      if (
        q.scope === "profile" &&
        q.destination in w.profile &&
        a.value !== "__skipped__"
      ) {
        const field = q.destination;
        if (field === "interests") w.profile.interests = a.value.split(" | ");
        else if (typeof w.profile[field as keyof typeof w.profile] === "string")
          Object.assign(w.profile, { [field]: a.value.trim() });
      }
      break;
    }
    case "entity": {
      if (
        w.entities.length >= 30 &&
        !w.entities.some((e) => e.id === a.entity.id)
      )
        throw Error("Keep this profile under 30 experiences.");
      w.entities = w.entities.filter((e) => e.id !== a.entity.id);
      w.entities.push(a.entity);
      break;
    }
    case "deleteEntity": {
      const ids = w.facts.filter((f) => f.entityId === a.id).map((f) => f.id);
      invalidate(ids);
      w.entities = w.entities.filter((e) => e.id !== a.id);
      w.facts = w.facts.filter((f) => f.entityId !== a.id);
      break;
    }
    case "deleteFact": {
      invalidate([a.id]);
      w.facts = w.facts.filter((f) => f.id !== a.id);
      break;
    }
    case "confirmImport": {
      const imported = w.facts.find((f) => f.id === a.id && f.questionId === "import.resume");
      if (!imported || imported.confirmed) throw Error("Choose an unconfirmed imported contribution.");
      const entity = w.entities.find((e) => e.id === imported.entityId);
      if (!entity) throw Error("Experience not found.");
      const questionId = `${entity.kind}.action`;
      const existing = w.facts.find((f) => f.entityId === entity.id && f.questionId === questionId);
      const value = [existing?.value !== "__skipped__" ? existing?.value : "", imported.value].filter(Boolean).join("\n");
      w = applyAction(w, { type: "answer", entityId: entity.id, questionId, value, confirmed: true });
      const source = w.facts.find((f) => f.id === imported.id)!;
      source.confirmed = true;
      source.revision += 1;
      source.updatedAt = now;
      break;
    }
    case "generate": {
      if (w.resumes.length >= 15)
        throw Error(
          "Remove an older draft before creating more than 15 versions.",
        );
      const r = newResume(w, a.name, a.target, a.template, a.jobDescription);
      if (!r.bullets.length)
        throw Error("Add at least one confirmed personal contribution first.");
      w.resumes.unshift(r);
      break;
    }
    case "resume": {
      const old = w.resumes.find((r) => r.id === a.resume.id);
      if (!old) throw Error("Résumé not found");
      if (
        new Set(a.resume.bullets.map((b) => b.id)).size !==
        a.resume.bullets.length
      )
        throw Error("Duplicate bullet IDs");
      if (new Set(a.resume.sectionOrder).size !== 4)
        throw Error("Each section must appear once");
      snapshot(old.id);
      const next = {
        ...a.resume,
        revision: old.revision + 1,
        createdAt: old.createdAt,
        profileSnapshot: old.profileSnapshot,
        entitySnapshot: old.entitySnapshot,
        skillsSnapshot: old.skillsSnapshot,
        educationExtras: old.educationExtras,
        certificationsSnapshot: old.certificationsSnapshot,
      };
      for (const b of next.bullets) {
        const prev = old.bullets.find((x) => x.id === b.id);
        if (!prev) throw Error("Regenerate to add a new bullet.");
        b.entityId = prev.entityId;
        b.original = prev.original;
        if (b.text !== prev.text) {
          const id = `edit:${crypto.randomUUID()}`;
          w.facts.push({
            id,
            entityId: b.entityId,
            questionId: "bullet.edit",
            value: b.text,
            confirmed: true,
            revision: 1,
            updatedAt: now,
          });
          b.evidenceIds = [id];
          b.sourceRevisions = { [id]: 1 };
          b.approved = false;
        } else {
          b.evidenceIds = prev.evidenceIds;
          b.sourceRevisions = prev.sourceRevisions;
          if (
            b.approved &&
            evidenceIssues({ ...b, approved: true }, w.facts).length
          )
            throw Error(
              "Regenerate this bullet from current facts before approving it.",
            );
        }
      }
      w.resumes = w.resumes.map((r) => (r.id === next.id ? next : r));
      break;
    }
    case "deleteResume":
      w.resumes = w.resumes.filter((r) => r.id !== a.id);
      w.history = w.history.filter((h) => h.resumeId !== a.id);
      break;
    case "restore": {
      const h = w.history.find((h) => h.id === a.id);
      if (!h) throw Error("Snapshot not found");
      snapshot(h.resumeId);
      const r = structuredClone(h.resume);
      r.revision = (w.resumes.find((x) => x.id === r.id)?.revision ?? 0) + 1;
      r.bullets.forEach((b) => {
        if (evidenceIssues({ ...b, approved: true }, w.facts).length)
          b.approved = false;
      });
      w.resumes = w.resumes.map((x) => (x.id === r.id ? r : x));
      break;
    }
    case "saveJob":
      w.savedJobs = w.savedJobs.includes(a.id)
        ? w.savedJobs.filter((id) => id !== a.id)
        : [...w.savedJobs, a.id];
      break;
    case "import": {
      if (!w.entities.some((e) => e.id === a.entityId))
        throw Error("Select an experience for this imported fact.");
      w.facts.push({
        id: crypto.randomUUID(),
        entityId: a.entityId,
        questionId: "import.resume",
        value: a.text,
        confirmed: false,
        revision: 1,
        updatedAt: now,
      });
      break;
    }
    case "reset":
      w = original.mode === "demo" ? demoWorkspace() : emptyWorkspace();
      break;
  }
  if (w.facts.length > 350) throw Error("Keep this profile under 350 facts.");
  w.mode = original.mode;
  w.revision = original.revision + 1;
  return w;
}
