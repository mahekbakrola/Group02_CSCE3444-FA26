import type { Category, Condition, EntityKind, Question } from "./model.ts";
const bank: Question[] = [];
type Config = Partial<Omit<Question, "id" | "text" | "why">>;
function q(
  id: string,
  category: Category,
  text: string,
  why: string,
  c: Config = {},
) {
  bank.push({
    id,
    category,
    text,
    why,
    inputType: "textarea",
    required: false,
    priority: 40,
    destination: id,
    conditions: [],
    followUps: [],
    resumeSections: [category],
    careerDimensions: ["evidence"],
    aiFollowUp: true,
    validation: { maxLength: 1800, minLength: 2 },
    scope: "profile",
    ...c,
  });
}
const when = (
  questionId: string,
  operator: Condition["operator"],
  value?: string,
): Condition => ({ questionId, operator, value });
q(
  "identity.name",
  "identity",
  "What name should appear on your résumé?",
  "Use the professional name you want employers to see.",
  {
    inputType: "text",
    required: true,
    priority: 100,
    destination: "name",
    aiFollowUp: false,
  },
);
q(
  "identity.email",
  "identity",
  "Which email can employers use to contact you?",
  "A reliable contact method is part of a usable résumé.",
  {
    inputType: "email",
    required: true,
    priority: 99,
    destination: "email",
    aiFollowUp: false,
  },
);
q(
  "career.target",
  "career",
  "What are you looking for next?",
  "Your target determines which real experiences to emphasize.",
  {
    inputType: "choice",
    required: true,
    priority: 98,
    destination: "target",
    options: [
      "Software engineering",
      "Data & AI",
      "Cybersecurity",
      "Cloud & systems",
      "Hardware & engineering",
      "Still exploring",
    ],
  },
);
q(
  "education.year",
  "education",
  "Where are you in your studies?",
  "A first-year student should get prompts about labs and projects, even with no employment.",
  {
    inputType: "choice",
    priority: 97,
    destination: "year",
    options: [
      "First year",
      "Second year",
      "Third year",
      "Final year",
      "Graduate student",
      "Recently graduated",
    ],
  },
);
q(
  "education.school",
  "education",
  "Where do you study?",
  "Your school provides context for your education.",
  { inputType: "text", required: true, priority: 96, destination: "school" },
);
q(
  "education.degree",
  "education",
  "What degree and major are you working toward?",
  "State the degree accurately, including a minor if relevant.",
  {
    inputType: "text",
    required: true,
    priority: 95,
    destination: "degree",
    example: "B.S. in Computer Science",
  },
);
q(
  "education.graduation",
  "education",
  "When do you expect to graduate?",
  "Expected graduation helps recruiters assess internship timing.",
  {
    inputType: "text",
    required: true,
    priority: 94,
    destination: "graduation",
    example: "May 2028",
  },
);
q(
  "discovery.work",
  "discovery",
  "Have you had a job, internship, or paid responsibility?",
  "Work outside your major can still demonstrate useful skills.",
  {
    inputType: "choice",
    priority: 93,
    options: [
      "Yes, related to my field",
      "Yes, in a different field",
      "Not yet",
    ],
    followUps: ["experience.action", "discovery.sources"],
  },
);
q(
  "discovery.sources",
  "discovery",
  "Which of these have you tried?",
  "Small responsibilities can contain strong evidence. Choose anything that applies.",
  {
    inputType: "multi",
    priority: 92,
    options: [
      "Course or personal projects",
      "Repairing devices",
      "Tutoring or helping classmates",
      "A club or student organization",
      "A family business",
      "Volunteering",
      "Hackathons or competitions",
      "Content or community management",
      "Research",
      "Open source",
      "None yet",
    ],
    followUps: ["discovery.story"],
  },
);
q(
  "discovery.story",
  "discovery",
  "Tell me about one thing you did that someone relied on.",
  "Start with a real event. It does not need to have been a job.",
  {
    priority: 91,
    example: "I helped our club keep track of expenses in a spreadsheet.",
  },
);
q(
  "identity.phone",
  "identity",
  "Would you like to include a phone number?",
  "Optional. Include a number you are comfortable sharing with employers.",
  { inputType: "text", priority: 24, destination: "phone", aiFollowUp: false },
);
q(
  "identity.location",
  "identity",
  "What city or region are you based in?",
  "City and region are sufficient; your street address is unnecessary.",
  {
    inputType: "text",
    priority: 35,
    destination: "location",
    aiFollowUp: false,
  },
);
for (const [id, text, why] of [
  [
    "linkedin",
    "What is your LinkedIn URL?",
    "Link to a profile you have reviewed.",
  ],
  [
    "github",
    "What is your GitHub URL?",
    "Repositories can give recruiters concrete examples of your work.",
  ],
  [
    "website",
    "Do you have a portfolio or personal website?",
    "A working project link can help demonstrate what you built.",
  ],
])
  q(`identity.${id}`, "identity", text, why, {
    inputType: "url",
    priority: 23,
    destination: id,
    aiFollowUp: false,
  });
q(
  "education.gpa",
  "education",
  "Would you like to include your GPA and its scale?",
  "Optional: keep the exact value and scale from your school.",
  { inputType: "text", priority: 30, destination: "gpa", example: "3.7 / 4.0" },
);
q(
  "education.coursework",
  "education",
  "Which classes have given you skills relevant to your target?",
  "Choose a few relevant courses; distinguish current from completed courses.",
  { priority: 58 },
);
q(
  "education.honors",
  "education",
  "Have you earned honors, scholarships, or academic awards?",
  "Include the award name, issuer, and date; do not infer membership from GPA.",
  { priority: 44 },
);
q(
  "education.lab",
  "education",
  "What is one lab or class assignment you can explain and demonstrate?",
  "A first-year résumé can begin with classroom evidence.",
  {
    priority: 88,
    conditions: [when("education.year", "equals", "First year")],
  },
);
q(
  "education.research",
  "education",
  "Have you worked with a professor or research group?",
  "Explain your actual role, methods, and any permitted public output.",
  { priority: 42 },
);
q(
  "career.interests",
  "career",
  "Which kinds of problems make you curious?",
  "Interests and demonstrated abilities are separate signals.",
  {
    inputType: "multi",
    priority: 85,
    destination: "interests",
    options: [
      "Building software",
      "Finding patterns in data",
      "Protecting systems",
      "Connecting systems",
      "Designing hardware",
      "Helping people",
      "Creating visual experiences",
      "Exploring AI",
    ],
  },
);
q(
  "career.workMode",
  "career",
  "What work arrangement would you prefer?",
  "A preference guides exploration and does not establish job eligibility.",
  {
    inputType: "choice",
    priority: 52,
    destination: "workMode",
    options: ["Any", "Remote", "Hybrid", "On-site"],
  },
);
q(
  "career.type",
  "career",
  "What kind of opportunity do you want?",
  "Distinguishes an internship search from full-time exploration.",
  {
    inputType: "choice",
    priority: 54,
    options: ["Internship", "Full-time", "Part-time", "Exploring"],
  },
);
q(
  "career.location",
  "career",
  "Where would you like to work, and could you relocate?",
  "Location can affect whether an opportunity is practical.",
  { priority: 41 },
);
q(
  "career.industry",
  "career",
  "Are there industries or organizations you are interested in?",
  "A sector can shape which domain knowledge matters.",
  { priority: 20 },
);
q(
  "career.enjoyed",
  "career",
  "Which project or class have you enjoyed most, and why?",
  "Specific tasks are more useful than a personality label.",
  { priority: 64 },
);
q(
  "career.people",
  "career",
  "How would you like to spend most of your working day?",
  "Work preferences help you compare daily responsibilities.",
  {
    inputType: "choice",
    priority: 50,
    options: [
      "Building independently",
      "Collaborating with a technical team",
      "Working directly with customers",
      "A mix of these",
    ],
  },
);
q(
  "career.tradeoff",
  "career",
  "Would you rather analyze an open-ended problem or build a concrete solution?",
  "Neither preference is better. Explain with an example.",
  { priority: 49 },
);
q(
  "career.unsure",
  "career",
  "What have you tried so far, and what would you like to try next?",
  "Exploration recommendations should be small experiments, not definitive judgments.",
  {
    priority: 87,
    conditions: [when("career.target", "equals", "Still exploring")],
  },
);
q(
  "career.job",
  "career",
  "Do you have a job description you want to use?",
  "Paste it in Job match to compare stated requirements with your evidence.",
  { priority: 15 },
);
q(
  "skills.claimed",
  "skills",
  "Which technical tools or languages have you used?",
  "These begin as self-reported skills until linked to an example.",
  { priority: 61, example: "Python, SQL, Git" },
);
q(
  "skills.evidence",
  "skills",
  "Pick one skill. What did you actually do with it, and where?",
  "An example is more meaningful than an arbitrary 1–10 rating.",
  { priority: 60, conditions: [when("skills.claimed", "exists")] },
);
q(
  "skills.recency",
  "skills",
  "When did you last use those skills, and what could you do independently?",
  "Recency and independence support an honest discussion of capability.",
  { priority: 39 },
);
q(
  "skills.languages",
  "skills",
  "Which languages can you communicate in, and in what contexts?",
  "Only include proficiency you can accurately describe.",
  { priority: 17 },
);
q(
  "skills.certifications",
  "skills",
  "Have you earned any certifications?",
  "List issuer, credential name, completion date, and optional verification link. Mark in-progress credentials clearly.",
  { priority: 35 },
);
q(
  "skills.evaluation",
  "skills",
  "How could someone inspect or reproduce your work?",
  "A repository, test, demonstration, or artifact is stronger than a self-rating.",
  { priority: 38 },
);
q(
  "import.resume",
  "discovery",
  "What is in your existing résumé that we have not captured?",
  "Imported text is unverified until you confirm each fact. Use Import in your profile.",
  { priority: 16 },
);
const common: [string, string, string, number][] = [
  [
    "summary",
    "How would you describe this experience in your own words?",
    "A rough description is enough to begin. We will uncover the specifics together.",
    90,
  ],
  [
    "problem",
    "What problem or need were you working on?",
    "Context helps explain why your contribution mattered.",
    87,
  ],
  [
    "action",
    "What did you personally do?",
    "Separate your own contribution from the overall team result.",
    89,
  ],
  [
    "tools",
    "What tools, technologies, or methods did you actually use?",
    "Links concrete work to skills; a mention is not an expert rating.",
    84,
  ],
  [
    "outcome",
    "What happened as a result of your work?",
    "A qualitative result is useful when there is no reliable number.",
    83,
  ],
  [
    "metric",
    "Is there a number or range you can honestly support?",
    "Include the unit and time period. A confirmed estimate or no number is fine.",
    80,
  ],
  [
    "team",
    "Who did you work with, and what was your role?",
    "Distinguishes collaboration, support, and ownership.",
    63,
  ],
  [
    "challenge",
    "What was the hardest part, and how did you solve it?",
    "Shows the thinking behind the task.",
    70,
  ],
  [
    "communication",
    "When did you explain your work to someone else?",
    "Communication should be shown through a concrete situation.",
    47,
  ],
  [
    "learning",
    "What did you learn or become able to do independently?",
    "Helps distinguish emerging skills from demonstrated independence.",
    36,
  ],
  [
    "link",
    "Is there a public link or artifact you can share?",
    "Only share work you have permission to disclose.",
    22,
  ],
];
for (const scope of [
  "experience",
  "project",
  "activity",
  "education",
] as EntityKind[]) {
  const category: Category =
    scope === "project"
      ? "projects"
      : scope === "activity"
        ? "activities"
        : scope;
  for (const [field, text, why, priority] of common)
    q(`${scope}.${field}`, category, text, why, {
      scope,
      priority,
      metric: field === "metric",
      inputType: field === "link" ? "url" : "textarea",
      required: field === "action",
      followUps:
        field === "summary"
          ? [`${scope}.action`, `${scope}.tools`, `${scope}.outcome`]
          : [],
      conditions:
        field === "summary" ? [] : [when(`${scope}.summary`, "exists")],
      example:
        field === "metric"
          ? "For example: about 8–12 customers per shift, based on the daily log."
          : undefined,
    });
}
const extra: [EntityKind, string, string, string, number, Condition[]?][] = [
  [
    "experience",
    "repair",
    "Which devices and hardware or software problems did you diagnose?",
    "Repair work can demonstrate systematic troubleshooting.",
    88,
    [
      when(
        "experience.summary",
        "includes",
        "repair|fixed phone|fixed laptop|fixed computer|diagnos",
      ),
    ],
  ],
  [
    "experience",
    "recovery",
    "Did you recover data or handle sensitive information? What precautions did you take?",
    "Describe approved methods without exposing customer data.",
    74,
    [
      when(
        "experience.summary",
        "includes",
        "repair|fixed phone|fixed laptop|fixed computer|diagnos",
      ),
    ],
  ],
  [
    "experience",
    "customers",
    "What did you help customers understand or decide?",
    "Specific customer situations provide communication evidence.",
    61,
  ],
  [
    "experience",
    "automation",
    "Did you automate or simplify any repetitive task?",
    "Capture the original process and what you changed.",
    66,
  ],
  [
    "experience",
    "ownership",
    "Were you responsible for opening, closing, inventory, or working independently?",
    "Operational responsibility can demonstrate reliability.",
    62,
  ],
  [
    "experience",
    "training",
    "Did you train someone? What did you teach and how?",
    "Training can provide leadership evidence without inflating your title.",
    59,
  ],
  [
    "experience",
    "improvement",
    "Did your work change turnaround time, errors, cost, or reliability?",
    "Ask for a baseline before describing an improvement.",
    68,
  ],
  [
    "experience",
    "frequency",
    "How often did you perform this work?",
    "Frequency gives scope even when there is no formal impact metric.",
    52,
  ],
  [
    "project",
    "architecture",
    "How did the main parts of your project fit together?",
    "Shows understanding beyond listing a technology stack.",
    74,
  ],
  [
    "project",
    "frontend",
    "What did you implement in the user interface?",
    "Identify your own design or frontend contribution.",
    59,
  ],
  [
    "project",
    "backend",
    "What happened on the server, and what did you implement?",
    "Distinguishes an API integration from building a backend.",
    62,
  ],
  [
    "project",
    "database",
    "How did you structure, query, or validate the data?",
    "Database decisions can provide concrete technical evidence.",
    67,
  ],
  [
    "project",
    "testing",
    "How did you test it, and what failure did a test catch?",
    "Specific verification is stronger than saying it was reliable.",
    76,
  ],
  [
    "project",
    "security",
    "What permissions, authentication, or security risks did you address?",
    "Name controls you implemented and verified.",
    72,
  ],
  [
    "project",
    "deployment",
    "Where did you deploy it, and what did you manage yourself?",
    "A local prototype and a deployed service are different claims.",
    55,
  ],
  [
    "project",
    "performance",
    "Did you measure speed, resource use, or reliability?",
    "State the test conditions and baseline; do not imply unmeasured gains.",
    53,
  ],
  [
    "project",
    "data",
    "Where did your data come from, and how did you check its quality?",
    "Data provenance and leakage prevention matter in data and AI projects.",
    86,
    [when("career.target", "equals", "Data & AI")],
  ],
  [
    "project",
    "evaluation",
    "How did you evaluate the model or analysis, and against what baseline?",
    "Avoid unsupported accuracy claims and test-set leakage.",
    85,
    [when("career.target", "equals", "Data & AI")],
  ],
  [
    "project",
    "threat",
    "What system were you allowed to assess, and what did you find?",
    "Security experience needs clear scope, permission, and remediation.",
    86,
    [when("career.target", "equals", "Cybersecurity")],
  ],
  [
    "project",
    "engineering",
    "Which design tradeoff or code review changed your implementation?",
    "Software engineering includes technical judgment and collaboration.",
    82,
    [when("career.target", "equals", "Software engineering")],
  ],
  [
    "project",
    "systems",
    "How did you monitor or debug the system when something failed?",
    "Systems work is demonstrated through operation and diagnosis.",
    82,
    [when("career.target", "equals", "Cloud & systems")],
  ],
  [
    "project",
    "hardware",
    "How did you design, measure, or test the physical system?",
    "Hardware claims need test conditions and your exact contribution.",
    82,
    [when("career.target", "equals", "Hardware & engineering")],
  ],
  [
    "activity",
    "leadership",
    "What decision or responsibility did you personally own?",
    "Leadership is an action, not just a club membership.",
    67,
  ],
  [
    "activity",
    "event",
    "Did you organize an event? What did you coordinate?",
    "Capture the purpose, logistics, and confirmed scope.",
    57,
  ],
  [
    "activity",
    "tutoring",
    "How did you help someone understand a difficult topic?",
    "Tutoring can demonstrate communication and subject knowledge.",
    58,
  ],
  [
    "activity",
    "community",
    "Did you maintain content, a community, or a shared service?",
    "Record actual responsibilities and a confirmed audience size if known.",
    56,
  ],
  [
    "activity",
    "award",
    "Was your work recognized, published, or awarded?",
    "Record the issuer, date, title, and your contribution.",
    49,
  ],
  [
    "education",
    "additionalCoursework",
    "Which relevant courses did you complete here?",
    "Keep current and completed classes distinguishable.",
    65,
  ],
  [
    "education",
    "additionalHonors",
    "Which honors or scholarships did you receive here?",
    "Record the exact name and date.",
    50,
  ],
];
for (const [scope, id, text, why, priority, conditions] of extra)
  q(
    `${scope}.${id}`,
    scope === "project"
      ? "projects"
      : scope === "activity"
        ? "activities"
        : scope,
    text,
    why,
    {
      scope,
      priority,
      conditions: conditions ?? [when(`${scope}.summary`, "exists")],
    },
  );
export const QUESTION_BANK: readonly Question[] = bank;
export const CATEGORIES: Category[] = [
  "identity",
  "education",
  "experience",
  "projects",
  "skills",
  "career",
  "discovery",
  "activities",
];
