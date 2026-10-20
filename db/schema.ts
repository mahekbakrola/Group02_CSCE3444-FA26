import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  index,
} from "drizzle-orm/sqlite-core";
export const profiles = sqliteTable(
  "profiles",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    mode: text("mode").notNull(),
    data: text("data").notNull(),
    revision: integer("revision").notNull().default(0),
    writeToken: text("write_token").notNull().default(""),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [index("idx_profiles_user").on(t.userId)],
);
export const entities = sqliteTable(
  "entities",
  {
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    id: text("id").notNull(),
    kind: text("kind").notNull(),
    title: text("title").notNull(),
    subtitle: text("subtitle").notNull(),
    dates: text("dates").notNull(),
  },
  (t) => [primaryKey({ columns: [t.profileId, t.id] })],
);
export const facts = sqliteTable(
  "facts",
  {
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    id: text("id").notNull(),
    entityId: text("entity_id").notNull(),
    questionId: text("question_id").notNull(),
    value: text("value").notNull(),
    confirmed: integer("confirmed").notNull(),
    revision: integer("revision").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [primaryKey({ columns: [t.profileId, t.id] })],
);
export const resumes = sqliteTable(
  "resumes",
  {
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    id: text("id").notNull(),
    data: text("data").notNull(),
  },
  (t) => [primaryKey({ columns: [t.profileId, t.id] })],
);
export const bullets = sqliteTable(
  "bullets",
  {
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    id: text("id").notNull(),
    resumeId: text("resume_id").notNull(),
    position: integer("position").notNull(),
    data: text("data").notNull(),
  },
  (t) => [primaryKey({ columns: [t.profileId, t.id] })],
);
export const bulletSources = sqliteTable(
  "bullet_sources",
  {
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    bulletId: text("bullet_id").notNull(),
    factId: text("fact_id").notNull(),
    sourceRevision: integer("source_revision").notNull(),
  },
  (t) => [primaryKey({ columns: [t.profileId, t.bulletId, t.factId] })],
);
export const history = sqliteTable(
  "resume_history",
  {
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    id: text("id").notNull(),
    resumeId: text("resume_id").notNull(),
    data: text("data").notNull(),
  },
  (t) => [primaryKey({ columns: [t.profileId, t.id] })],
);
export const savedJobs = sqliteTable(
  "saved_jobs",
  {
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    jobId: text("job_id").notNull(),
  },
  (t) => [primaryKey({ columns: [t.profileId, t.jobId] })],
);
export const aiOperations = sqliteTable(
  "ai_operations",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    operation: text("operation").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (t) => [index("idx_ai_user_time").on(t.userId, t.createdAt)],
);
