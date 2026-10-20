import { test } from "node:test";
import assert from "node:assert/strict";
import { applyAction } from "../lib/engine/actions.ts";
import { emptyWorkspace } from "../lib/engine/model.ts";
import { ActionSchema } from "../lib/validation.ts";
import { fetchJson } from "../lib/client-request.ts";

const entity = { id: "project-a", kind: "project" as const, title: "Project", subtitle: "", dates: "" };
test("experience capture commits the entity and answer as one revision or neither", () => {
  const original = emptyWorkspace();
  const w = applyAction(original, { type: "capture", entity, text: "I built an application." });
  assert.equal(w.revision, original.revision + 1);
  assert.equal(w.entities.length, 1);
  assert.equal(w.facts[0].questionId, "project.summary");
  assert.throws(() => applyAction(original, { type: "capture", entity, text: "" }));
  assert.equal(original.entities.length, 0);
  assert.equal(original.facts.length, 0);
});
test("confirming imports preserves existing contributions and cannot append twice", () => {
  let w = applyAction(emptyWorkspace(), { type: "entity", entity });
  w = applyAction(w, { type: "answer", entityId: entity.id, questionId: "project.action", value: "I built the interface.", confirmed: true });
  w = applyAction(w, { type: "import", entityId: entity.id, text: "I wrote integration tests." });
  const id = w.facts.find(f => f.questionId === "import.resume")!.id;
  w = applyAction(w, { type: "confirmImport", id });
  const action = w.facts.find(f => f.questionId === "project.action")!;
  assert.ok(action.value.includes("built the interface"));
  assert.ok(action.value.includes("integration tests"));
  assert.equal(w.facts.find(f => f.id === id)!.confirmed, true);
  assert.throws(() => applyAction(w, { type: "confirmImport", id }));
});
test("blank experience titles and whitespace imports are rejected", () => {
  assert.equal(ActionSchema.safeParse({ type: "entity", entity: { ...entity, title: "   " } }).success, false);
  assert.equal(ActionSchema.safeParse({ type: "import", entityId: entity.id, text: "  " }).success, false);
});
test("network, HTML proxy failures, timeouts, and API errors give readable feedback", async () => {
  const realFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response("Bad gateway", { status: 502 });
    await assert.rejects(fetchJson("/api/workspace"), /unexpected response \(502\)/);
    globalThis.fetch = async () => Response.json({ error: "Sign in first." }, { status: 401 });
    await assert.rejects(fetchJson("/api/workspace"), /Sign in first/);
    globalThis.fetch = async () => { throw new DOMException("timeout", "TimeoutError"); };
    await assert.rejects(fetchJson("/api/workspace"), /timed out/);
    globalThis.fetch = async () => { throw Error("offline"); };
    await assert.rejects(fetchJson("/api/workspace"), /Unable to connect/);
    globalThis.fetch = async () => Response.json({ ok: true });
    assert.deepEqual(await fetchJson("/api/workspace"), { ok: true });
  } finally { globalThis.fetch = realFetch; }
});
