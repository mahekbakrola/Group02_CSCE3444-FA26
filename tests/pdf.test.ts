import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PDFDocument } from "pdf-lib";
import { demoWorkspace } from "../lib/engine/demo.ts";
import { createResumePdf, exportChecks } from "../lib/engine/pdf.ts";
import { newResume } from "../lib/engine/evidence.ts";
test("certifications export in every template and stale credentials block export", async () => {
  const w = demoWorkspace();
  w.facts.push({ id: "cert", entityId: "profile", questionId: "skills.certifications", value: "CS50 - HarvardX | September 2026\nCloud certificate - in progress | https://example.com/credential", confirmed: true, revision: 1, updatedAt: "" });
  for (const template of ["classic", "modern", "technical"] as const) {
    const r = newResume(w, "Certifications", "Software engineering", template);
    r.bullets.forEach((b) => { b.approved = true; });
    const result = await createResumePdf(w, r, fonts);
    assert.ok(result.bytes.length > 10000);
    w.facts.find((f) => f.id === "cert")!.confirmed = false;
    assert.ok(exportChecks(w, r).some((e) => e.includes("Certifications")));
    w.facts.find((f) => f.id === "cert")!.confirmed = true;
  }
});
const fonts = async (name: string) =>
  new Uint8Array(
    await readFile(new URL(`../public/fonts/${name}.ttf`, import.meta.url)),
  );
test("all three templates produce a real one-page PDF with embedded fonts", async () => {
  for (const template of ["classic", "modern", "technical"] as const) {
    const w = demoWorkspace();
    w.resumes[0].template = template;
    const result = await createResumePdf(w, w.resumes[0], fonts);
    const pdf = await PDFDocument.load(result.bytes);
    assert.equal(pdf.getPageCount(), 1);
    assert.equal(pdf.getAuthor(), "Maya Chen");
    assert.equal(pdf.getPage(0).getWidth(), 612);
    assert.ok(result.bytes.length > 10000);
  }
});
test("export refuses unapproved content and deleted supporting facts", async () => {
  const w = demoWorkspace();
  w.resumes[0].bullets[0].approved = false;
  assert.ok(exportChecks(w, w.resumes[0]).some((e) => e.includes("approval")));
  await assert.rejects(
    () => createResumePdf(w, w.resumes[0], fonts),
    /approval/,
  );
  w.resumes[0].bullets[0].approved = true;
  w.facts = [];
  await assert.rejects(
    () => createResumePdf(w, w.resumes[0], fonts),
    /Missing/,
  );
});
test("long statements and unbroken URLs paginate instead of being cut off", async () => {
  const w = demoWorkspace();
  const r = w.resumes[0];
  const text =
    "Described a verified contribution and its context. ".repeat(70) +
    "https://example.com/" +
    "long-path-".repeat(90);
  w.facts.push({
    id: "long-source",
    entityId: "repair",
    questionId: "bullet.edit",
    value: text,
    confirmed: true,
    revision: 1,
    updatedAt: "",
  });
  r.bullets = [
    {
      id: "long",
      entityId: "repair",
      text,
      original: text,
      evidenceIds: ["long-source"],
      sourceRevisions: { "long-source": 1 },
      approved: true,
    },
  ];
  const result = await createResumePdf(w, r, fonts);
  assert.ok(result.pages >= 2);
  const pdf = await PDFDocument.load(result.bytes);
  assert.equal(pdf.getPageCount(), result.pages);
});
test("unsupported writing systems fail clearly instead of silently losing glyphs", async () => {
  const w = demoWorkspace();
  w.resumes[0].profileSnapshot.name = "漢字";
  await assert.rejects(
    () => createResumePdf(w, w.resumes[0], fonts),
    /font cannot represent/,
  );
});
test("removing skill evidence also blocks a frozen unsupported skill list", () => {
  const w = demoWorkspace();
  w.facts = w.facts.filter((f) => f.questionId !== "project.testing");
  const issues = exportChecks(w, w.resumes[0]);
  assert.ok(
    issues.some((e) => e.includes("Skills no longer supported: Testing")),
  );
});
