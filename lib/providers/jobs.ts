import { SKILLS, containsSkill, skillEvidence } from "../engine/evidence.ts";
import type { Workspace } from "../engine/model.ts";
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  mode: string;
  type: string;
  description: string;
  tags: string[];
  color: string;
  fictional: true;
}
export const DEMO_JOBS: Job[] = [
  {
    id: "j1",
    title: "Software Engineering Intern",
    company: "Northstar Labs",
    location: "Austin, TX",
    mode: "Hybrid",
    type: "Internship",
    description:
      "Required: JavaScript, React, Git, and testing. Build user-facing applications with a collaborative team. Preferred: SQL and TypeScript. Open to students pursuing a computer science degree.",
    tags: ["React", "JavaScript", "Git", "Testing"],
    color: "#9ae8c3",
    fictional: true,
  },
  {
    id: "j2",
    title: "Data Analyst Intern",
    company: "Meridian Research",
    location: "Remote, US",
    mode: "Remote",
    type: "Internship",
    description:
      "Required: Python, SQL, and Excel. Analyze datasets and explain findings. Preferred: Pandas and statistics. Student internship.",
    tags: ["Python", "SQL", "Excel"],
    color: "#91bdf3",
    fictional: true,
  },
  {
    id: "j3",
    title: "Security Operations Intern",
    company: "Arc Systems",
    location: "Dallas, TX",
    mode: "On-site",
    type: "Internship",
    description:
      "Required: Linux, networking, and troubleshooting. Assist with security monitoring and document findings. Preferred: Python and security coursework.",
    tags: ["Linux", "Networking", "Troubleshooting"],
    color: "#cab0ee",
    fictional: true,
  },
  {
    id: "j4",
    title: "Cloud Engineering Intern",
    company: "Orbit Infrastructure",
    location: "Remote, US",
    mode: "Remote",
    type: "Internship",
    description:
      "Required: Linux, Docker, and Git. Build deployment automation. Preferred: AWS and Terraform. Work alongside infrastructure engineers.",
    tags: ["Linux", "Docker", "Git"],
    color: "#efc58e",
    fictional: true,
  },
  {
    id: "j5",
    title: "Product Engineering Intern",
    company: "Forma Studio",
    location: "Seattle, WA",
    mode: "Hybrid",
    type: "Internship",
    description:
      "Required: TypeScript, React, CSS, and Git. Build thoughtful, accessible interfaces. Preferred: Figma and testing. Student internship.",
    tags: ["TypeScript", "React", "CSS"],
    color: "#edacba",
    fictional: true,
  },
  {
    id: "j6",
    title: "Data Platform Intern",
    company: "Current Data",
    location: "Chicago, IL",
    mode: "Hybrid",
    type: "Internship",
    description:
      "Required: Python, SQL, and data pipelines. Build reliable data ingestion. Preferred: Docker and AWS. Work with a small engineering team.",
    tags: ["Python", "SQL", "Data pipelines"],
    color: "#7ad9df",
    fictional: true,
  },
];
export function analyzeJob(description: string, w: Workspace) {
  const evidence = skillEvidence(w);
  const required = new Set<string>();
  const preferred = new Set<string>();
  const snippets: Record<string, string> = {};
  let section: "required" | "preferred" = "required";
  for (const line of description.split(/\n|(?<=[.;])\s+/)) {
    if (/preferred|nice.to.have|bonus/i.test(line)) section = "preferred";
    else if (/required|must.have|minimum|requirements/i.test(line))
      section = "required";
    for (const skill of Object.keys(SKILLS)) {
      if (
        containsSkill(line, skill) &&
        !/(not required|no .{0,35}required|not necessary)/i.test(line)
      ) {
        (section === "required" ? required : preferred).add(skill);
        snippets[skill] = line.trim();
      }
    }
  }
  for (const skill of required) preferred.delete(skill);
  const requirements = [...required, ...preferred].map((skill) => {
    const e = evidence.find((e) => e.skill === skill);
    return {
      skill,
      priority: required.has(skill) ? "Required / mentioned" : "Preferred",
      status: e?.facts.length ? "matched" : e ? "partial" : "missing",
      evidenceIds: e?.facts.map((f) => f.id) ?? [],
      source: snippets[skill],
    };
  });
  return {
    requirements,
    matched: requirements.filter((r) => r.status === "matched"),
    partial: requirements.filter((r) => r.status === "partial"),
    missing: requirements.filter((r) => r.status === "missing"),
    experience: description.match(/\b\d+\+?\s*(?:years|yrs)\b/gi) ?? [],
    note: "Folio keyword comparison. Review the original description: context and requirements can be ambiguous.",
  };
}
export interface JobProvider {
  searchJobs(query: string): Promise<Job[]>;
  getJob(id: string): Promise<Job | null>;
}
export class SeedJobProvider implements JobProvider {
  async searchJobs(q: string) {
    return DEMO_JOBS.filter((j) =>
      `${j.title} ${j.tags.join(" ")} ${j.location}`
        .toLowerCase()
        .includes(q.toLowerCase()),
    );
  }
  async getJob(id: string) {
    return DEMO_JOBS.find((j) => j.id === id) ?? null;
  }
}
export function rankJobs(w: Workspace, jobs = DEMO_JOBS) {
  return jobs
    .map((j) => {
      const match = analyzeJob(j.description, w);
      const preferred =
        w.profile.workMode === "Any" || w.profile.workMode === j.mode;
      const targetWords = w.profile.target
        .toLowerCase()
        .split(/[^a-z]+/)
        .filter(
          (t) =>
            t.length > 3 &&
            !["engineering", "systems", "exploring", "still"].includes(t),
        );
      const roleMatch = targetWords.some((t) =>
        j.title.toLowerCase().includes(t),
      );
      const city = w.profile.location.split(",")[0].trim().toLowerCase();
      const locationMatch = !!city && j.location.toLowerCase().includes(city);
      const reasons = [
        `${match.matched.length} skill areas have supporting work evidence`,
        ...(roleMatch ? ["Title connects to your target role"] : []),
        ...(locationMatch ? ["Location connects to your profile city"] : []),
        ...(preferred && w.profile.workMode !== "Any"
          ? [`Matches your ${j.mode.toLowerCase()} work preference`]
          : []),
      ];
      return {
        ...j,
        match,
        preferred,
        roleMatch,
        locationMatch,
        reasons,
        rank:
          match.matched.length +
          Number(preferred) * 0.3 +
          Number(roleMatch) * 0.5 +
          Number(locationMatch) * 0.2,
      };
    })
    .sort((a, b) => b.rank - a.rank);
}
