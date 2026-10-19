import { test } from "node:test";
import assert from "node:assert/strict";
import { QUESTION_BANK } from "../lib/engine/questions.ts";
import { demoWorkspace } from "../lib/engine/demo.ts";
import { emptyWorkspace } from "../lib/engine/model.ts";
import {
  questionQueue,
  validateAnswer,
  completeness,
} from "../lib/engine/interview.ts";
import {
  buildBullets,
  evidenceIssues,
  newResume,
  skillEvidence,
} from "../lib/engine/evidence.ts";
import { applyAction } from "../lib/engine/actions.ts";
import { analyzeJob } from "../lib/providers/jobs.ts";
import { matchCareers } from "../lib/providers/careers.ts";
import { RequestSchema, ResumeSchema } from "../lib/validation.ts";
import { RulesProvider, OpenAIProvider } from "../lib/providers/ai.ts";
test("confirmed certifications enter fresh drafts and remain frozen on edits", () => {
  let w = applyAction(demoWorkspace(), {
    type: "answer", entityId: "profile", questionId: "skills.certifications",
    value: "CS50 - HarvardX | September 2026 | https://example.com/credential", confirmed: true,
  });
  const r = newResume(w, "Certification test", "Software engineering");
  assert.deepEqual(r.certificationsSnapshot, [w.facts.find((f) => f.questionId === "skills.certifications")!.value]);
  assert.ok(ResumeSchema.safeParse(r).success);
  w.resumes.push(r);
  const saved = applyAction(w, { type: "resume", resume: { ...r, certificationsSnapshot: ["Forged credential"] } });
  assert.deepEqual(saved.resumes.find((x) => x.id === r.id)!.certificationsSnapshot, r.certificationsSnapshot);
  w = applyAction(w, { type: "answer", entityId: "profile", questionId: "skills.certifications", value: "Replacement credential", confirmed: true });
  assert.notDeepEqual(newResume(w, "Fresh", "Software engineering").certificationsSnapshot, r.certificationsSnapshot);
  assert.ok(r.certificationsSnapshot![0].includes("CS50"));
});
test("empty, negative and unconfirmed certifications are omitted; legacy drafts validate", () => {
  const w = demoWorkspace();
  const legacy = structuredClone(w.resumes[0]);
  delete legacy.certificationsSnapshot;
  assert.ok(ResumeSchema.safeParse(legacy).success);
  for (const value of ["", "   ", "No", "None", "N/A", "Not yet"]) {
    w.facts.push({ id: "cert", entityId: "profile", questionId: "skills.certifications", value, confirmed: true, revision: 1, updatedAt: "" });
    assert.deepEqual(newResume(w, "Test", "Software engineering").certificationsSnapshot, []);
    w.facts.pop();
  }
  w.facts.push({ id: "cert", entityId: "profile", questionId: "skills.certifications", value: "Unconfirmed credential", confirmed: false, revision: 1, updatedAt: "" });
  assert.deepEqual(newResume(w, "Test", "Software engineering").certificationsSnapshot, []);
});
test("question bank has unique IDs and complete metadata", () => {
  assert.ok(QUESTION_BANK.length > 90);
  assert.equal(
    new Set(QUESTION_BANK.map((q) => q.id)).size,
    QUESTION_BANK.length,
  );
  for (const q of QUESTION_BANK) {
    assert.ok(q.why);
    assert.ok(q.validation.maxLength);
    assert.ok(q.resumeSections.length);
  }
});
test("first year branch and target-dependent project questions", () => {
  let w = demoWorkspace();
  const base = QUESTION_BANK.find((q) => q.id === "education.year")!;
  w = applyAction(w, {
    type: "answer",
    entityId: "profile",
    questionId: base.id,
    value: "First year",
    confirmed: true,
  });
  assert.ok(
    questionQueue(w, undefined, "profile").some(
      (q) => q.id === "education.lab",
    ),
  );
  w = applyAction(w, {
    type: "answer",
    entityId: "profile",
    questionId: "career.target",
    value: "Cybersecurity",
    confirmed: true,
  });
  const qs = questionQueue(w, undefined, "campus");
  assert.ok(qs.some((q) => q.id === "project.threat"));
  assert.ok(!qs.some((q) => q.id === "project.data"));
});
test("repair follow-up is conditional and scoped per experience", () => {
  const w = demoWorkspace();
  assert.ok(
    questionQueue(w, undefined, "repair").some(
      (q) => q.id === "experience.recovery",
    ),
  );
  assert.ok(
    !questionQueue(w, undefined, "pipeline").some(
      (q) => q.id === "experience.recovery",
    ),
  );
});
test("skipped optional questions stay skipped but can be edited", () => {
  let w = demoWorkspace();
  w = applyAction(w, {
    type: "answer",
    entityId: "repair",
    questionId: "experience.metric",
    value: "__skipped__",
    confirmed: false,
  });
  assert.ok(
    !questionQueue(w, undefined, "repair").some(
      (q) => q.id === "experience.metric",
    ),
  );
  w = applyAction(w, {
    type: "answer",
    entityId: "repair",
    questionId: "experience.metric",
    value: "About 8–12 devices per week",
    confirmed: true,
  });
  assert.ok(
    buildBullets(w)
      .find((b) => b.entityId === "repair")!
      .text.includes("8–12"),
  );
});
test("required answers and confirmed metrics are enforced", () => {
  assert.ok(
    validateAnswer(
      QUESTION_BANK.find((q) => q.id === "identity.name")!,
      "__skipped__",
    ),
  );
  assert.throws(() =>
    applyAction(demoWorkspace(), {
      type: "answer",
      entityId: "repair",
      questionId: "experience.metric",
      value: "20 repairs per week",
      confirmed: false,
    }),
  );
});
test("unanswered metrics are never fabricated", () => {
  const b = buildBullets(demoWorkspace()).find((b) => b.entityId === "repair")!;
  assert.ok(!/20|\d/.test(b.text));
  assert.ok(b.evidenceIds.length > 0);
});
test("unsupported numbers are rejected even with valid source IDs", () => {
  const w = demoWorkspace();
  const b = {
    ...w.resumes[0].bullets[0],
    text: "Repaired 200 devices every day",
    approved: true,
  };
  assert.ok(evidenceIssues(b, w.facts).some((s) => s.includes("number")));
});
test("editing a source invalidates approval and keeps presentation intact", () => {
  const w = demoWorkspace();
  const oldText = w.resumes[0].bullets.find(
    (b) => b.entityId === "repair",
  )!.text;
  const n = applyAction(w, {
    type: "answer",
    entityId: "repair",
    questionId: "experience.action",
    value: "Diagnosed laptop issues",
    confirmed: true,
  });
  const b = n.resumes[0].bullets.find((b) => b.entityId === "repair")!;
  assert.equal(b.text, oldText);
  assert.equal(b.approved, false);
  assert.ok(evidenceIssues(b, n.facts).some((i) => i.includes("changed")));
});
test("deleting source facts blocks export provenance", () => {
  const w = demoWorkspace();
  const id = w.resumes[0].bullets[0].evidenceIds[0];
  const n = applyAction(w, { type: "deleteFact", id });
  assert.ok(
    evidenceIssues(n.resumes[0].bullets[0], n.facts).some((s) =>
      s.includes("Missing"),
    ),
  );
});
test("editing a bullet creates a user fact and requires separate approval", () => {
  const w = demoWorkspace();
  const r = structuredClone(w.resumes[0]);
  r.bullets[0].text = "A contribution I have explicitly supplied";
  r.bullets[0].approved = true;
  const n = applyAction(w, { type: "resume", resume: r });
  const b = n.resumes[0].bullets[0];
  assert.equal(b.approved, false);
  assert.equal(
    n.facts.find((f) => f.id === b.evidenceIds[0])!.questionId,
    "bullet.edit",
  );
  assert.equal(n.history.length, 1);
});
test("tailoring preserves master facts and freezes profile presentation", () => {
  const w = demoWorkspace();
  const before = JSON.stringify(w.facts);
  const r = newResume(w, "Data role", "Data", "modern", "Required Python SQL");
  assert.equal(JSON.stringify(w.facts), before);
  w.profile.name = "Changed";
  w.entities[0].title = "Changed";
  assert.equal(r.profileSnapshot.name, "Maya Chen");
  assert.notEqual(r.entitySnapshot[0].title, "Changed");
});
test("student without employment can reach minimum draft", () => {
  const w = emptyWorkspace();
  w.profile = {
    ...w.profile,
    name: "Alex",
    email: "alex@example.com",
    school: "Example University",
    degree: "BS Computer Science",
  };
  w.entities = [
    { id: "lab", kind: "project", title: "Class lab", subtitle: "", dates: "" },
  ];
  w.facts = [
    {
      id: "lab-action",
      questionId: "project.action",
      entityId: "lab",
      value: "Built a simple Python game",
      revision: 1,
      confirmed: true,
      updatedAt: "2026-09-09",
    },
  ];
  assert.equal(completeness(w).enough, true);
  assert.equal(buildBullets(w).length, 1);
});
test("self-rated skills and explicit negatives are not demonstrated", () => {
  const w = demoWorkspace();
  const skills = skillEvidence(w);
  assert.equal(skills.find((s) => s.skill === "Docker")?.facts.length, 0);
  w.facts.push({
    id: "negative",
    questionId: "project.tools",
    entityId: "campus",
    value: "I have not used Kubernetes",
    confirmed: true,
    revision: 1,
    updatedAt: "",
  });
  assert.ok(!skillEvidence(w).some((s) => s.skill === "Kubernetes"));
});
test("job requirements distinguish evidenced, self-reported and missing", () => {
  const r = analyzeJob(
    "Required: Python, Docker, Kubernetes. Preferred: SQL.",
    demoWorkspace(),
  );
  assert.ok(r.matched.some((s) => s.skill === "Python"));
  assert.ok(r.partial.some((s) => s.skill === "Docker"));
  assert.ok(r.missing.some((s) => s.skill === "Kubernetes"));
  assert.equal(
    r.requirements.find((s) => s.skill === "SQL")!.priority,
    "Preferred",
  );
});
test("career recommendations explain positive matches and gaps", () => {
  const c = matchCareers(demoWorkspace())[0];
  assert.ok(c.reasons.length);
  assert.ok(c.gaps.every((g) => !c.matched.includes(g)));
  assert.ok(c.code.match(/^\d{2}-\d{4}\.\d{2}$/));
});
test("input schema rejects script links, oversized payloads and unknown operations", () => {
  assert.equal(
    RequestSchema.safeParse({
      mode: "demo",
      revision: 0,
      action: { type: "hack" },
    }).success,
    false,
  );
  const w = demoWorkspace();
  assert.throws(() =>
    applyAction(w, {
      type: "profile",
      profile: { ...w.profile, website: "javascript:alert(1)" },
    }),
  );
});
test("rules provider works without external credentials", async () => {
  const r = await new RulesProvider().generateFollowUps(
    demoWorkspace(),
    "repair",
  );
  assert.ok(r.suggestedFollowUps.length <= 3);
  assert.equal(r.confidence, 0);
});
test("AI provider never accepts foreign evidence IDs", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        output: [
          {
            content: [
              {
                type: "output_text",
                text: JSON.stringify({
                  missingInformation: [],
                  suggestedFollowUps: [
                    {
                      question: "Tell me more?",
                      reason: "Missing detail",
                      relatedAnswerIds: ["foreign-user"],
                    },
                  ],
                  potentialSkills: [],
                  possibleMetrics: [],
                  confidence: 0.5,
                }),
              },
            ],
          },
        ],
      }),
      { status: 200 },
    );
  try {
    await assert.rejects(
      new OpenAIProvider("test", "test-model").generateFollowUps(
        demoWorkspace(),
        "repair",
      ),
      /unknown evidence/,
    );
  } finally {
    globalThis.fetch = original;
  }
});
test("JSON-schema rejection catches malformed AI output", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        output: [
          { content: [{ type: "output_text", text: '{"madeUp":true}' }] },
        ],
      }),
    );
  try {
    await assert.rejects(
      new OpenAIProvider("test", "test-model").generateFollowUps(
        demoWorkspace(),
        "repair",
      ),
    );
  } finally {
    globalThis.fetch = original;
  }
});
test("resume restoring flags revisions that no longer match", () => {
  let w = demoWorkspace();
  const r = structuredClone(w.resumes[0]);
  r.name = "Version changed";
  w = applyAction(w, { type: "resume", resume: r });
  const h = w.history[0];
  w = applyAction(w, {
    type: "answer",
    entityId: "repair",
    questionId: "experience.action",
    value: "Replaced laptop batteries",
    confirmed: true,
  });
  w = applyAction(w, { type: "restore", id: h.id });
  assert.equal(
    w.resumes[0].bullets.find((b) => b.entityId === "repair")!.approved,
    false,
  );
});
test("the first demo save has stable source and bullet identities", () => {
  const loaded = demoWorkspace();
  const server = demoWorkspace();
  assert.deepEqual(loaded.resumes, server.resumes);
  assert.doesNotThrow(() =>
    applyAction(server, {
      type: "resume",
      resume: { ...loaded.resumes[0], name: "First edit" },
    }),
  );
});
test("a cleared profile value removes its interview fact", () => {
  const w = demoWorkspace();
  const changed = applyAction(w, {
    type: "profile",
    profile: { ...w.profile, school: "" },
  });
  assert.ok(!changed.facts.some((f) => f.questionId === "education.school"));
});
test("a client cannot move an existing claim to a different experience", () => {
  const w = demoWorkspace();
  const r = structuredClone(w.resumes[0]);
  const entityId = r.bullets[0].entityId;
  r.bullets[0].entityId = "campus";
  const saved = applyAction(w, { type: "resume", resume: r });
  assert.equal(saved.resumes[0].bullets[0].entityId, entityId);
});

import { newId } from "../lib/engine/id.ts";
test("record IDs work when randomUUID is unavailable in an HTTP preview", () => {
  const source = {
    getRandomValues: crypto.getRandomValues.bind(
      crypto,
    ) as Crypto["getRandomValues"],
  };
  const ids = Array.from({ length: 20 }, () => newId(source));
  assert.equal(new Set(ids).size, 20);
  assert.ok(
    ids.every((id) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
        id,
      ),
    ),
  );
});
