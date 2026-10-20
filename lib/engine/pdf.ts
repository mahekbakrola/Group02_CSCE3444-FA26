import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import type { Workspace, Resume } from "./model.ts";
import { confirmedCertifications, evidenceIssues, skillEvidence } from "./evidence.ts";
export function exportChecks(w: Workspace, r: Resume) {
  const errors: string[] = [];
  if (!r.profileSnapshot.name)
    errors.push("Add your professional name and generate a fresh draft.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.profileSnapshot.email))
    errors.push("Add a valid contact email and generate a fresh draft.");
  if (!r.bullets.length) errors.push("Add at least one contribution.");
  for (const b of r.bullets) {
    const issues = evidenceIssues(b, w.facts);
    if (issues.length)
      errors.push(
        `${r.entitySnapshot.find((e) => e.id === b.entityId)?.title ?? "Bullet"}: ${issues.join("; ")}`,
      );
  }
  const supportedSkills = new Set(
    skillEvidence(w)
      .filter((s) => s.facts.length)
      .map((s) => s.skill),
  );
  const currentCertifications = new Set(confirmedCertifications(w));
  if (r.certificationsSnapshot?.some((value) => !currentCertifications.has(value)))
    errors.push("Certifications have changed or are no longer confirmed. Generate a fresh draft from your current facts.");
  const staleSkills = r.skillsSnapshot.filter((s) => !supportedSkills.has(s));
  if (staleSkills.length)
    errors.push(
      `Skills no longer supported: ${staleSkills.join(", ")}. Generate a fresh draft from your current facts.`,
    );
  return errors;
}
export async function createResumePdf(
  w: Workspace,
  r: Resume,
  loadFont: (name: string) => Promise<Uint8Array> = async (name) => {
    const response = await fetch(`/fonts/${name}.ttf`, { signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw Error("The export font could not be loaded.");
    return new Uint8Array(await response.arrayBuffer());
  },
) {
  const checks = exportChecks(w, r);
  if (checks.length) throw Error(checks[0]);
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setTitle(r.name);
  doc.setAuthor(r.profileSnapshot.name);
  doc.setSubject("Professional résumé");
  doc.setCreator("Folio");
  doc.setCreationDate(new Date("2026-01-01T00:00:00Z"));
  doc.setModificationDate(new Date("2026-01-01T00:00:00Z"));
  const [regularBytes, boldBytes] = await Promise.all([
    loadFont(r.template === "classic" ? "FolioSerif" : "FolioSans"),
    loadFont("FolioSans-Bold"),
  ]);
  const regular = await doc.embedFont(regularBytes, { subset: true });
  const bold = await doc.embedFont(boldBytes, { subset: true });
  const margin = 48,
    width = 612,
    height = 792,
    lineHeight = 14;
  let page: PDFPage = doc.addPage([width, height]),
    y = height - margin;
  const maxWidth = width - margin * 2;
  const clean = (s: string) =>
    s.replace(/\t/g, " ").replace(/[\u0000-\u0008\u000B-\u001F]/g, "");
  function wrapped(text: string, font: PDFFont, size: number, max: number) {
    const lines: string[] = [];
    for (const paragraph of clean(text).split("\n")) {
      let line = "";
      for (const word of paragraph.split(/\s+/)) {
        if (!word) continue;
        if (font.widthOfTextAtSize(word, size) > max) {
          if (line) {
            lines.push(line);
            line = "";
          }
          let part = "";
          for (const ch of word) {
            if (font.widthOfTextAtSize(part + ch, size) > max) {
              lines.push(part);
              part = ch;
            } else part += ch;
          }
          line = part;
        } else if (
          font.widthOfTextAtSize(line ? line + " " + word : word, size) > max
        ) {
          lines.push(line);
          line = word;
        } else line = line ? line + " " + word : word;
      }
      if (line) lines.push(line);
    }
    return lines;
  }
  function ensure(space: number) {
    if (y - space < margin) {
      page = doc.addPage([width, height]);
      y = height - margin;
    }
  }
  function text(s: string, size = 10, font: PDFFont = regular, indent = 0) {
    const lines = wrapped(s, font, size, maxWidth - indent);
    for (const line of lines) {
      const supported = new Set(font.getCharacterSet());
      if ([...line].some((c) => !supported.has(c.codePointAt(0)!)))
        throw Error(
          "The export font cannot represent some characters. Update the text or configure a font that supports your writing system.",
        );
      const leading = Math.max(lineHeight, size * 1.2);
      ensure(leading);
      page.drawText(line, {
        x: margin + indent,
        y: y - size,
        font,
        size,
        color: rgb(0.1, 0.12, 0.13),
      });
      y -= leading;
    }
  }
  function heading(s: string) {
    ensure(54);
    y -= 14;
    text(s.toUpperCase(), 10, bold);
    page.drawLine({
      start: { x: margin, y: y - 3 },
      end: { x: width - margin, y: y - 3 },
      thickness: 0.55,
      color: rgb(0.3, 0.34, 0.34),
    });
    y -= 12;
  }
  const p = r.profileSnapshot;
  text(p.name, 23, bold);
  y -= 12;
  text([p.email, p.phone, p.location].filter(Boolean).join("  |  "), 9);
  const links = [p.linkedin, p.github, p.website].filter(Boolean);
  if (links.length) text(links.join("  |  "), 8.5);
  for (const section of r.sectionOrder) {
    if (section === "education") {
      if (p.school) {
        heading("Education");
        text(p.school, 11, bold);
        text(
          [p.degree, p.graduation && `Expected ${p.graduation}`]
            .filter(Boolean)
            .join(" | "),
        );
        if (p.gpa) text(`GPA: ${p.gpa}`);
        for (const extra of r.educationExtras) text(extra, 9.5);
      }
      if (r.certificationsSnapshot?.length) {
        heading("Certifications");
        for (const certification of r.certificationsSnapshot) text(certification, 9.5);
      }
    }
    const entities = r.entitySnapshot.filter(
      (e) => e.kind === section && r.bullets.some((b) => b.entityId === e.id),
    );
    if (!entities.length) continue;
    heading(
      section === "experience"
        ? "Experience"
        : section === "project"
          ? "Projects"
          : section === "education"
            ? "Additional education"
            : "Activities & leadership",
    );
    for (const entity of entities) {
      ensure(48);
      text(entity.title, 11, bold);
      text([entity.subtitle, entity.dates].filter(Boolean).join(" | "), 9);
      y -= 4;
      for (const b of r.bullets.filter((b) => b.entityId === entity.id)) {
        text(`• ${b.text}`, 10, regular, 5);
        y -= 5;
      }
      y -= 5;
    }
  }
  if (r.skillsSnapshot.length) {
    heading("Technical & demonstrated skills");
    text(r.skillsSnapshot.join(" · "), 9.5);
  }
  return {
    bytes: await doc.save({ useObjectStreams: false }),
    pages: doc.getPageCount(),
  };
}
