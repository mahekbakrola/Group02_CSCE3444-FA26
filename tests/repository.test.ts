import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import {
  loadWorkspace,
  saveWorkspace,
  deleteAccount,
  seedAccountProfile,
} from "../lib/repository.ts";
import { applyAction } from "../lib/engine/actions.ts";

// Executes the actual repository SQL and generated migration against SQLite.
// D1's batch contract is represented by one all-or-nothing transaction.
function fixture() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec("PRAGMA foreign_keys = ON");
  sqlite.exec(
    readFileSync(
      new URL("../drizzle/0000_friendly_fenris.sql", import.meta.url),
      "utf8",
    ),
  );
  class Statement {
    sql: string;
    values: (string | number | null)[] = [];
    constructor(sql: string) {
      this.sql = sql;
    }
    bind(...values: (string | number | null)[]) {
      this.values = values;
      return this;
    }
    async first() {
      return sqlite.prepare(this.sql).get(...this.values) ?? null;
    }
    execute() {
      const q = sqlite.prepare(this.sql);
      if (/^SELECT/i.test(this.sql))
        return { results: q.all(...this.values), meta: { changes: 0 } };
      const result = q.run(...this.values);
      return { results: [], meta: { changes: Number(result.changes) } };
    }
  }
  const db = {
    prepare: (sql: string) => new Statement(sql),
    batch: async (statements: Statement[]) => {
      sqlite.exec("BEGIN");
      try {
        const r = statements.map((s) => s.execute());
        sqlite.exec("COMMIT");
        return r;
      } catch (e) {
        sqlite.exec("ROLLBACK");
        throw e;
      }
    },
  } as unknown as D1Database;
  return { db, sqlite };
}
test("account contact defaults persist once, preserve custom values, and stay private", async () => {
  const { db, sqlite } = fixture();
  await seedAccountProfile(db, "alice", { name: "Google Name", email: "a@example.com" });
  let w = await loadWorkspace(db, "alice", "personal");
  assert.equal(w.profile.name, "Google Name");
  assert.equal(w.revision, 1);
  await seedAccountProfile(db, "alice", { name: "Changed Provider Name", email: "changed@example.com" });
  w = await loadWorkspace(db, "alice", "personal");
  assert.equal(w.profile.name, "Google Name");
  assert.equal(w.revision, 1);
  const next = applyAction(w, { type: "profile", profile: { ...w.profile, name: "Custom Name" } });
  await saveWorkspace(db, "alice", next, w.revision);
  await seedAccountProfile(db, "alice", { name: "Provider", email: "a@example.com" });
  assert.equal((await loadWorkspace(db, "alice", "personal")).profile.name, "Custom Name");
  assert.equal((await loadWorkspace(db, "bob", "personal")).profile.name, "");
  assert.equal((await loadWorkspace(db, "alice", "demo")).profile.name, "Maya Chen");
  sqlite.close();
});
test("repository round-trips profile, evidence, snapshots, revisions and saved jobs", async () => {
  const { db, sqlite } = fixture();
  const w = await loadWorkspace(db, "alice", "demo");
  let edited = applyAction(w, {
    type: "resume",
    resume: { ...w.resumes[0], name: "Reviewed sample" },
  });
  edited = applyAction(edited, { type: "saveJob", id: "j6" });
  await saveWorkspace(db, "alice", edited, 0);
  const loaded = await loadWorkspace(db, "alice", "demo");
  assert.equal(loaded.revision, 1);
  assert.deepEqual(loaded.profile, edited.profile);
  const normalize = (resumes: typeof loaded.resumes) =>
    resumes.map((r) => ({
      ...r,
      bullets: r.bullets.map((b) => ({
        ...b,
        evidenceIds: [...b.evidenceIds].sort(),
      })),
    }));
  assert.deepEqual(normalize(loaded.resumes), normalize(edited.resumes));
  assert.deepEqual(loaded.history, edited.history);
  assert.deepEqual(new Set(loaded.savedJobs), new Set(edited.savedJobs));
  assert.equal(loaded.facts.length, edited.facts.length);
  sqlite.close();
});
test("user and demo/personal ownership are enforced by every repository scope", async () => {
  const { db, sqlite } = fixture();
  const w = await loadWorkspace(db, "alice", "demo");
  await saveWorkspace(
    db,
    "alice",
    applyAction(w, {
      type: "profile",
      profile: { ...w.profile, name: "Alice only" },
    }),
    0,
  );
  assert.equal(
    (await loadWorkspace(db, "alice", "demo")).profile.name,
    "Alice only",
  );
  assert.equal(
    (await loadWorkspace(db, "bob", "demo")).profile.name,
    "Maya Chen",
  );
  assert.equal((await loadWorkspace(db, "alice", "personal")).facts.length, 0);
  sqlite.close();
});
test("stale concurrent saves fail without overwriting any child records", async () => {
  const { db, sqlite } = fixture();
  const initial = await loadWorkspace(db, "alice", "demo");
  const a = applyAction(initial, {
    type: "answer",
    entityId: "repair",
    questionId: "experience.outcome",
    value: "First writer result",
    confirmed: true,
  });
  const b = applyAction(initial, {
    type: "answer",
    entityId: "repair",
    questionId: "experience.outcome",
    value: "Stale second writer",
    confirmed: true,
  });
  await saveWorkspace(db, "alice", a, 0);
  await assert.rejects(() => saveWorkspace(db, "alice", b, 0), /another tab/);
  const saved = await loadWorkspace(db, "alice", "demo");
  assert.equal(
    saved.facts.find((f) => f.questionId === "experience.outcome")?.value,
    "First writer result",
  );
  assert.equal(saved.revision, 1);
  sqlite.close();
});
test("account deletion cascades only the selected user and removes AI operation metadata", async () => {
  const { db, sqlite } = fixture();
  for (const user of ["alice", "bob"]) {
    const w = await loadWorkspace(db, user, "demo");
    await saveWorkspace(
      db,
      user,
      applyAction(w, { type: "saveJob", id: "j6" }),
      0,
    );
  }
  sqlite
    .prepare("INSERT INTO ai_operations VALUES(?,?,?,?)")
    .run("op", "alice", "followups", Date.now());
  await deleteAccount(db, "alice");
  assert.equal(
    sqlite
      .prepare("SELECT COUNT(*) AS n FROM profiles WHERE user_id=?")
      .get("alice")!.n,
    0,
  );
  assert.equal(
    sqlite.prepare("SELECT COUNT(*) AS n FROM ai_operations").get()!.n,
    0,
  );
  assert.equal((await loadWorkspace(db, "bob", "demo")).revision, 1);
  sqlite.close();
});
