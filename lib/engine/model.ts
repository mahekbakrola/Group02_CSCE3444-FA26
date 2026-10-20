export type Category =
  | "identity"
  | "career"
  | "education"
  | "experience"
  | "projects"
  | "skills"
  | "discovery"
  | "activities";
export type EntityKind = "experience" | "project" | "activity" | "education";
export type InputType =
  "text" | "textarea" | "email" | "url" | "choice" | "multi";
export interface Condition {
  questionId: string;
  operator: "equals" | "includes" | "exists" | "notEquals";
  value?: string;
}
export interface Question {
  id: string;
  category: Category;
  text: string;
  why: string;
  inputType: InputType;
  required: boolean;
  priority: number;
  destination: string;
  options?: string[];
  example?: string;
  conditions: Condition[];
  followUps: string[];
  resumeSections: string[];
  careerDimensions: string[];
  aiFollowUp: boolean;
  validation: { maxLength: number; minLength: number };
  scope: "profile" | EntityKind;
  metric?: boolean;
}
export interface Fact {
  id: string;
  questionId: string;
  entityId: string;
  value: string;
  confirmed: boolean;
  revision: number;
  updatedAt: string;
}
export interface Entity {
  id: string;
  kind: EntityKind;
  title: string;
  subtitle: string;
  dates: string;
}
export interface Profile {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
  school: string;
  degree: string;
  graduation: string;
  gpa: string;
  target: string;
  year: string;
  workMode: string;
  interests: string[];
  aiConsent: boolean;
  theme: "dark" | "light";
  motion: boolean;
}
export interface Bullet {
  id: string;
  entityId: string;
  text: string;
  original: string;
  evidenceIds: string[];
  sourceRevisions: Record<string, number>;
  approved: boolean;
}
export type Template = "classic" | "modern" | "technical";
export interface Resume {
  id: string;
  name: string;
  target: string;
  template: Template;
  bullets: Bullet[];
  createdAt: string;
  revision: number;
  profileSnapshot: Profile;
  entitySnapshot: Entity[];
  skillsSnapshot: string[];
  educationExtras: string[];
  certificationsSnapshot?: string[];
  jobDescription: string;
  sectionOrder: EntityKind[];
}
export interface ResumeSnapshot {
  id: string;
  resumeId: string;
  label: string;
  createdAt: string;
  resume: Resume;
}
export interface Workspace {
  profile: Profile;
  facts: Fact[];
  entities: Entity[];
  resumes: Resume[];
  history: ResumeSnapshot[];
  savedJobs: string[];
  mode: "demo" | "personal";
  revision: number;
}
export const blankProfile = (): Profile => ({
  name: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  github: "",
  website: "",
  school: "",
  degree: "",
  graduation: "",
  gpa: "",
  target: "",
  year: "",
  workMode: "Any",
  interests: [],
  aiConsent: false,
  theme: "dark",
  motion: true,
});
export const emptyWorkspace = (): Workspace => ({
  profile: blankProfile(),
  facts: [],
  entities: [],
  resumes: [],
  history: [],
  savedJobs: [],
  mode: "personal",
  revision: 0,
});
export const factKey = (entityId: string, questionId: string) =>
  `${entityId}:${questionId}`;
export function valueOf(
  w: Workspace,
  id: string,
  entityId = "profile",
): string {
  return (
    w.facts.find((f) => f.questionId === id && f.entityId === entityId)
      ?.value ?? ""
  );
}
