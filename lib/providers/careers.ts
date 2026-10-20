import { skillEvidence, containsSkill } from "../engine/evidence.ts";
import type { Workspace } from "../engine/model.ts";
export interface CareerPath {
  id: string;
  title: string;
  cluster: string;
  code: string;
  description: string;
  skills: string[];
  interests: string[];
  tasks: string[];
  project: string;
  learn: string[];
  color: string;
}
export const CAREERS: CareerPath[] = [
  {
    id: "software",
    title: "Software engineering",
    cluster: "Build",
    code: "15-1252.00",
    description:
      "Design, develop, and maintain software that solves real problems.",
    skills: ["JavaScript", "React", "Git", "Testing", "SQL"],
    interests: ["Building software", "Creating visual experiences"],
    tasks: [
      "Design application behavior",
      "Implement and review code",
      "Test and maintain software",
    ],
    project:
      "Build and deploy a tested full-stack application with a documented API.",
    learn: ["Data structures", "Software design", "Automated testing"],
    color: "#9ae8c3",
  },
  {
    id: "data",
    title: "Data science",
    cluster: "Discover",
    code: "15-2051.00",
    description: "Turn data into analyses, models, and useful decisions.",
    skills: ["Python", "SQL", "Statistics", "Pandas", "Machine learning"],
    interests: ["Finding patterns in data", "Exploring AI"],
    tasks: [
      "Clean and explore data",
      "Evaluate statistical models",
      "Communicate results and limitations",
    ],
    project:
      "Analyze an open dataset with a reproducible notebook, baseline, and held-out evaluation.",
    learn: ["Statistics", "Data quality", "Model evaluation"],
    color: "#91bdf3",
  },
  {
    id: "security",
    title: "Cybersecurity",
    cluster: "Protect",
    code: "15-1212.00",
    description:
      "Assess risks and help protect information and computer systems.",
    skills: ["Linux", "Networking", "Security", "Python", "Troubleshooting"],
    interests: ["Protecting systems", "Connecting systems"],
    tasks: [
      "Monitor security controls",
      "Assess authorized systems",
      "Investigate and document risks",
    ],
    project:
      "Create a permissioned home-lab monitoring project with detection rules and a remediation report.",
    learn: ["Networking", "Operating systems", "Threat modeling"],
    color: "#cab0ee",
  },
  {
    id: "cloud",
    title: "Cloud & systems",
    cluster: "Connect",
    code: "15-1244.00",
    description:
      "Configure and maintain reliable networks and computing environments.",
    skills: ["Linux", "Networking", "Docker", "AWS", "Testing"],
    interests: ["Connecting systems", "Building software"],
    tasks: [
      "Configure infrastructure",
      "Monitor availability",
      "Troubleshoot system failures",
    ],
    project:
      "Deploy a small service with infrastructure configuration, monitoring, and a recovery runbook.",
    learn: ["Linux administration", "Networking", "Cloud fundamentals"],
    color: "#efc58e",
  },
  {
    id: "data-engineering",
    title: "Data engineering",
    cluster: "Connect",
    code: "15-1243.00",
    description: "Build the structures and processes that make data usable.",
    skills: ["Python", "SQL", "Docker", "AWS", "Data pipelines"],
    interests: ["Finding patterns in data", "Connecting systems"],
    tasks: [
      "Design data architecture",
      "Integrate data sources",
      "Validate data quality",
    ],
    project:
      "Build a scheduled data pipeline with SQL transformations and data-quality checks.",
    learn: ["Database architecture", "ETL pipelines", "Data modeling"],
    color: "#7ad9df",
  },
  {
    id: "hardware",
    title: "Computer hardware",
    cluster: "Build",
    code: "17-2061.00",
    description: "Research, design, develop, and test computer hardware.",
    skills: ["C++", "Embedded", "Testing", "Troubleshooting", "Python"],
    interests: ["Designing hardware", "Connecting systems"],
    tasks: [
      "Design hardware systems",
      "Build and test prototypes",
      "Analyze system performance",
    ],
    project:
      "Build a sensor-based embedded device and document its design and measurement results.",
    learn: ["Digital logic", "Electronics", "Embedded systems"],
    color: "#edacba",
  },
  {
    id: "web",
    title: "Web development",
    cluster: "Build",
    code: "15-1254.00",
    description: "Develop and maintain websites and web applications.",
    skills: ["HTML", "CSS", "JavaScript", "React", "Testing"],
    interests: ["Building software", "Creating visual experiences"],
    tasks: [
      "Implement web interfaces",
      "Integrate services",
      "Test accessibility and behavior",
    ],
    project:
      "Build an accessible interactive web application and document keyboard and mobile testing.",
    learn: ["Web fundamentals", "Accessibility", "Web performance"],
    color: "#9ae8c3",
  },
  {
    id: "ux",
    title: "UX engineering",
    cluster: "Discover",
    code: "15-1255.00",
    description:
      "Bridge interface design and implementation; mapped to Web and Digital Interface Designers.",
    skills: ["HTML", "CSS", "JavaScript", "Figma", "Communication"],
    interests: ["Creating visual experiences", "Helping people"],
    tasks: ["Prototype interfaces", "Study user needs", "Evaluate usability"],
    project:
      "Prototype a student workflow and report findings from consented usability sessions.",
    learn: ["Interaction design", "Accessibility", "User research"],
    color: "#cab0ee",
  },
  {
    id: "support",
    title: "Technical support",
    cluster: "Connect",
    code: "15-1232.00",
    description: "Help people diagnose and resolve computer problems.",
    skills: ["Troubleshooting", "Communication", "Linux", "Networking"],
    interests: ["Helping people", "Connecting systems"],
    tasks: [
      "Diagnose user issues",
      "Explain solutions",
      "Document recurring problems",
    ],
    project:
      "Create a reproducible troubleshooting knowledge base from synthetic support cases.",
    learn: ["Operating systems", "Networking", "Technical communication"],
    color: "#efc58e",
  },
  {
    id: "ai",
    title: "AI & machine learning",
    cluster: "Discover",
    code: "15-2051.00",
    description:
      "A pathway within data science focused on building and evaluating learning systems.",
    skills: ["Python", "Statistics", "Machine learning", "PyTorch", "Testing"],
    interests: ["Exploring AI", "Finding patterns in data"],
    tasks: [
      "Prepare training data",
      "Compare models to a baseline",
      "Evaluate errors and generalization",
    ],
    project:
      "Train a small classifier with a clear baseline, error analysis, and model card.",
    learn: ["Linear algebra", "Probability", "Machine learning"],
    color: "#91bdf3",
  },
  {
    id: "mobile",
    title: "Mobile development",
    cluster: "Build",
    code: "15-1252.00",
    description:
      "A software development pathway focused on mobile applications.",
    skills: ["Kotlin", "Swift", "React", "Git", "Testing"],
    interests: ["Building software", "Creating visual experiences"],
    tasks: [
      "Build mobile interfaces",
      "Manage application state",
      "Test across device conditions",
    ],
    project:
      "Build a mobile app with offline state, tests, and an accessibility review.",
    learn: ["Mobile architecture", "Platform APIs", "Testing"],
    color: "#edacba",
  },
  {
    id: "database",
    title: "Database engineering",
    cluster: "Connect",
    code: "15-1242.00",
    description: "Administer and maintain databases and their availability.",
    skills: ["SQL", "Python", "Linux", "Testing"],
    interests: ["Connecting systems", "Finding patterns in data"],
    tasks: [
      "Maintain databases",
      "Manage access and backups",
      "Monitor performance",
    ],
    project:
      "Design a relational database, analyze query plans, and test backup restoration.",
    learn: ["Relational modeling", "Query optimization", "Access control"],
    color: "#7ad9df",
  },
];
export function matchCareers(w: Workspace) {
  const skills = skillEvidence(w);
  return CAREERS.map((c) => {
    const matched = c.skills.filter((s) =>
      skills.some((e) => e.skill === s && e.facts.length),
    );
    const partial = c.skills.filter((s) =>
      skills.some((e) => e.skill === s && !e.facts.length),
    );
    const gaps = c.skills.filter((s) => !matched.includes(s));
    const interests = c.interests.filter((i) =>
      w.profile.interests.includes(i),
    );
    const enjoyed = w.facts
      .filter((f) => f.questionId === "career.enjoyed" && f.confirmed)
      .some((f) => c.skills.some((s) => containsSkill(f.value, s)));
    const score =
      (matched.length / c.skills.length) * 0.65 +
      (interests.length / c.interests.length) * 0.25 +
      (enjoyed ? 0.1 : 0);
    return {
      ...c,
      matched,
      partial,
      gaps,
      interestsMatched: interests,
      score,
      label:
        matched.length >= 3 && interests.length
          ? "Strong connection"
          : matched.length >= 2
            ? "Worth exploring"
            : interests.length
              ? "Interest-led path"
              : "Explore this path",
      reasons: [
        ...matched.map((s) => `${s} is backed by your experience`),
        ...interests.map((s) => `You enjoy ${s.toLowerCase()}`),
        ...(enjoyed ? ["Connects to a class or project you enjoyed"] : []),
      ],
    };
  }).sort((a, b) => b.score - a.score);
}
export interface OccupationProvider {
  getOccupation(code: string): Promise<unknown>;
}
export class OnetProvider implements OccupationProvider {
  apiKey: string;
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  async getOccupation(code: string) {
    if (!/^\d{2}-\d{4}\.\d{2}$/.test(code))
      throw Error("Invalid occupation code");
    const res = await fetch(
      `https://api-v2.onetcenter.org/online/occupations/${code}/`,
      {
        headers: { "X-API-Key": this.apiKey, Accept: "application/json" },
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!res.ok) throw Error("Occupation service unavailable");
    return res.json();
  }
}
