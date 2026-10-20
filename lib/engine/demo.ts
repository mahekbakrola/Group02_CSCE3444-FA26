import { emptyWorkspace, factKey, type Workspace, type Fact } from "./model.ts";
import { newResume } from "./evidence.ts";
export function demoWorkspace(): Workspace {
  const w = emptyWorkspace();
  w.mode = "demo";
  w.profile = {
    ...w.profile,
    name: "Maya Chen",
    email: "maya.chen@example.com",
    phone: "",
    location: "Austin, TX",
    github: "https://github.com",
    school: "Northbridge University",
    degree: "B.S. in Computer Science",
    graduation: "May 2028",
    gpa: "3.8 / 4.0",
    target: "Software engineering",
    year: "Third year",
    interests: ["Building software", "Exploring AI", "Connecting systems"],
    workMode: "Hybrid",
  };
  w.entities = [
    {
      id: "repair",
      kind: "experience",
      title: "Repair Technician",
      subtitle: "Circuit Care · Part-time",
      dates: "Aug 2024 – Present",
    },
    {
      id: "campus",
      kind: "project",
      title: "Campus Connect",
      subtitle: "Student community platform",
      dates: "Jan – May 2026",
    },
    {
      id: "pipeline",
      kind: "project",
      title: "Open Data Pipeline",
      subtitle: "Personal project",
      dates: "Jun 2026",
    },
    {
      id: "club",
      kind: "activity",
      title: "CS Peer Mentoring",
      subtitle: "Computing Society",
      dates: "Sep 2025 – May 2026",
    },
  ];
  const add = (e: string, q: string, v: string) =>
    w.facts.push({
      id: factKey(e, q),
      entityId: e,
      questionId: q,
      value: v,
      confirmed: true,
      revision: 1,
      updatedAt: "2026-09-09T12:00:00.000Z",
    } as Fact);
  for (const [id, v] of Object.entries({
    "identity.name": w.profile.name,
    "identity.email": w.profile.email,
    "education.school": w.profile.school,
    "education.degree": w.profile.degree,
    "education.graduation": w.profile.graduation,
    "education.year": w.profile.year,
    "career.target": w.profile.target,
    "career.interests": w.profile.interests.join(" | "),
    "career.workMode": "Hybrid",
    "discovery.work": "Yes, in a different field",
    "discovery.sources":
      "Course or personal projects | Repairing devices | Tutoring or helping classmates",
    "education.coursework":
      "Data Structures, Database Systems, Computer Networks",
    "education.honors": "Dean’s List, Fall 2025",
    "skills.claimed": "Python, JavaScript, React, SQL, Git, Docker",
  }))
    add("profile", id, v);
  const entries: Record<string, Record<string, string>> = {
    repair: {
      summary: "I fixed phones and helped customers.",
      problem:
        "Customers needed help diagnosing devices and understanding repair options.",
      action:
        "Diagnosed smartphone and laptop hardware and software issues and explained repair options to customers",
      tools: "Diagnostic utilities, Linux, and device repair tools",
      repair:
        "Smartphones and laptops, including battery, display, and operating-system problems",
    },
    campus: {
      summary: "Our class team built a website for campus clubs.",
      problem: "Students had trouble finding club events in one place.",
      action:
        "Built a React event dashboard and implemented SQL queries for a campus club platform",
      tools: "React, JavaScript, SQL, Git",
      outcome:
        "Enabled students in our class demonstration to browse and filter club events",
      team: "Worked with a team of 3; I owned the event dashboard and database queries",
      testing: "Tested event creation, filtering, and empty states",
      metric: "3-person student team",
    },
    pipeline: {
      summary: "I built a small pipeline for public transport data.",
      action:
        "Wrote Python scripts to clean public transit data and load validated records into SQL tables",
      tools: "Python, Pandas, SQL, Git",
      problem: "The public dataset contained missing and inconsistent values",
    },
    club: {
      summary: "I helped students learn programming in our computing club.",
      action:
        "Tutored classmates in Python and explained debugging strategies during weekly study sessions",
      tools: "Python and Git",
      outcome: "Created reusable example exercises for future study sessions",
    },
  };
  for (const [entity, fields] of Object.entries(entries)) {
    const e = w.entities.find((x) => x.id === entity)!;
    for (const [key, val] of Object.entries(fields))
      add(entity, `${e.kind}.${key}`, val);
  }
  const r = newResume(
    w,
    "Software engineering internship",
    "Software engineering",
    "technical",
  );
  r.id = "demo-resume";
  r.createdAt = "2026-09-09T12:00:00.000Z";
  r.bullets.forEach((b) => {
    b.id = `demo-bullet-${b.entityId}`;
    b.approved = true;
  });
  w.resumes = [r];
  w.savedJobs = ["j1", "j3"];
  return w;
}
