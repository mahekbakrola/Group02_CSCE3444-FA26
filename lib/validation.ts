import { z } from "zod";
const short = z.string().max(250);
const id = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[a-zA-Z0-9._:-]+$/);
export const ProfileSchema = z
  .object({
    name: short,
    email: z.union([z.literal(""), z.string().email().max(254)]),
    phone: short,
    location: short,
    linkedin: short,
    github: short,
    website: short,
    school: short,
    degree: short,
    graduation: short,
    gpa: short,
    target: short,
    year: short,
    workMode: short,
    interests: z.array(short).max(20),
    aiConsent: z.boolean(),
    theme: z.enum(["dark", "light"]),
    motion: z.boolean(),
  })
  .strict();
export const EntitySchema = z
  .object({
    id,
    kind: z.enum(["experience", "project", "activity", "education"]),
    title: z.string().trim().min(1).max(150),
    subtitle: short,
    dates: short,
  })
  .strict();
const BulletSchema = z
  .object({
    id,
    entityId: id,
    text: z.string().min(2).max(2500),
    original: z.string().max(2500),
    evidenceIds: z.array(id).max(30),
    sourceRevisions: z.record(z.number().int()),
    approved: z.boolean(),
  })
  .strict();
export const ResumeSchema = z
  .object({
    id,
    name: z.string().min(1).max(120),
    target: short,
    template: z.enum(["classic", "modern", "technical"]),
    bullets: z.array(BulletSchema).max(50),
    createdAt: short,
    revision: z.number().int(),
    profileSnapshot: ProfileSchema,
    entitySnapshot: z.array(EntitySchema).max(30),
    skillsSnapshot: z.array(short).max(60),
    educationExtras: z.array(z.string().max(1800)).max(10),
    certificationsSnapshot: z.array(z.string().max(1800)).max(10).optional(),
    jobDescription: z.string().max(18000),
    sectionOrder: z
      .array(z.enum(["education", "experience", "project", "activity"]))
      .length(4),
  })
  .strict();
export const ActionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("profile"), profile: ProfileSchema }),
  z.object({
    type: z.literal("answer"),
    entityId: id,
    questionId: id,
    value: z.string().max(1800),
    confirmed: z.boolean(),
  }),
  z.object({ type: z.literal("entity"), entity: EntitySchema }),
  z.object({ type: z.literal("capture"), entity: EntitySchema, text: z.string().trim().min(2).max(1800) }),
  z.object({ type: z.literal("deleteEntity"), id }),
  z.object({ type: z.literal("deleteFact"), id }),
  z.object({ type: z.literal("confirmImport"), id }),
  z.object({
    type: z.literal("generate"),
    name: z.string().min(1).max(120),
    target: short,
    template: z.enum(["classic", "modern", "technical"]),
    jobDescription: z.string().max(18000).optional(),
  }),
  z.object({ type: z.literal("resume"), resume: ResumeSchema }),
  z.object({ type: z.literal("deleteResume"), id }),
  z.object({ type: z.literal("restore"), id }),
  z.object({ type: z.literal("saveJob"), id }),
  z.object({
    type: z.literal("import"),
    entityId: id,
    text: z.string().trim().min(2).max(1800),
  }),
  z.object({ type: z.literal("reset") }),
]);
export type Action = z.infer<typeof ActionSchema>;
export const RequestSchema = z
  .object({
    mode: z.enum(["demo", "personal"]),
    revision: z.number().int().nonnegative(),
    action: ActionSchema,
  })
  .strict();
