import { demoWorkspace } from "./engine/demo.ts";
import {
  emptyWorkspace,
  type Workspace,
  type Bullet,
  type Resume,
  type Entity,
  type Fact,
} from "./engine/model.ts";
export const profileId = (user: string, mode: string) => `${user}:${mode}`;
// Seed only missing personal contact fields. SQL guards against concurrent edits
// and keeps every other profile field, resume, and fact intact.
export async function seedAccountProfile(
  db: D1Database, user: string, contact: { name: string; email: string },
) {
  if (!contact.name && !contact.email) return;
  const pid = profileId(user, "personal");
  const profile = emptyWorkspace().profile;
  const now = new Date().toISOString();
  await db.batch([
    db.prepare("INSERT INTO profiles(id,user_id,mode,data,revision,write_token,updated_at) VALUES(?,?,?,?,0,?,?) ON CONFLICT(id) DO NOTHING")
      .bind(pid, user, "personal", JSON.stringify(profile), "", now),
    db.prepare(`UPDATE profiles SET data=json_set(data,
      '$.name', CASE WHEN trim(coalesce(json_extract(data,'$.name'),''))='' THEN ? ELSE json_extract(data,'$.name') END,
      '$.email', CASE WHEN trim(coalesce(json_extract(data,'$.email'),''))='' THEN ? ELSE json_extract(data,'$.email') END),
      revision=revision+1,updated_at=? WHERE id=? AND
      ((trim(coalesce(json_extract(data,'$.name'),''))='' AND ?!='') OR
       (trim(coalesce(json_extract(data,'$.email'),''))='' AND ?!=''))`)
      .bind(contact.name, contact.email, now, pid, contact.name, contact.email),
  ]);
}
export async function loadWorkspace(
  db: D1Database,
  user: string,
  mode: "demo" | "personal",
): Promise<Workspace> {
  const pid = profileId(user, mode);
  const p = await db
    .prepare("SELECT data, revision FROM profiles WHERE id=?")
    .bind(pid)
    .first<{ data: string; revision: number }>();
  if (!p) return mode === "demo" ? demoWorkspace() : emptyWorkspace();
  const [entities, facts, resumes, bullets, sources, history, jobs] =
    await db.batch<Record<string, unknown>>([
      db
        .prepare(
          "SELECT id,kind,title,subtitle,dates FROM entities WHERE profile_id=? ORDER BY rowid",
        )
        .bind(pid),
      db
        .prepare(
          "SELECT id,entity_id AS entityId,question_id AS questionId,value,confirmed,revision,updated_at AS updatedAt FROM facts WHERE profile_id=? ORDER BY rowid",
        )
        .bind(pid),
      db.prepare("SELECT data FROM resumes WHERE profile_id=?").bind(pid),
      db
        .prepare(
          "SELECT resume_id AS resumeId,data FROM bullets WHERE profile_id=? ORDER BY position",
        )
        .bind(pid),
      db
        .prepare(
          "SELECT bullet_id AS bulletId,fact_id AS factId,source_revision AS sourceRevision FROM bullet_sources WHERE profile_id=?",
        )
        .bind(pid),
      db
        .prepare(
          "SELECT data FROM resume_history WHERE profile_id=? ORDER BY rowid",
        )
        .bind(pid),
      db
        .prepare("SELECT job_id AS jobId FROM saved_jobs WHERE profile_id=?")
        .bind(pid),
    ]);
  const rs = resumes.results.map(
    (row) => JSON.parse(row.data as string) as Resume,
  );
  for (const r of rs)
    r.bullets = bullets.results
      .filter((b) => b.resumeId === r.id)
      .map((row) => {
        const b = JSON.parse(row.data as string) as Bullet;
        const src = sources.results.filter((s) => s.bulletId === b.id);
        return {
          ...b,
          evidenceIds: src.map((s) => s.factId as string),
          sourceRevisions: Object.fromEntries(
            src.map((s) => [s.factId, s.sourceRevision]),
          ),
        };
      });
  rs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return {
    profile: JSON.parse(p.data),
    revision: p.revision,
    mode,
    entities: entities.results as unknown as Entity[],
    facts: facts.results.map((f) => ({
      ...f,
      confirmed: !!f.confirmed,
    })) as unknown as Fact[],
    resumes: rs,
    history: history.results.map((h) => JSON.parse(h.data as string)),
    savedJobs: jobs.results.map((j) => j.jobId as string),
  };
}
export async function saveWorkspace(
  db: D1Database,
  user: string,
  w: Workspace,
  expected: number,
) {
  const pid = profileId(user, w.mode),
    token = crypto.randomUUID(),
    now = new Date().toISOString();
  const exists = "EXISTS (SELECT 1 FROM profiles WHERE id=? AND write_token=?)";
  const statements = [
    db
      .prepare(
        "INSERT INTO profiles(id,user_id,mode,data,revision,write_token,updated_at) VALUES(?,?,?,?,0,?,?) ON CONFLICT(id) DO NOTHING",
      )
      .bind(pid, user, w.mode, JSON.stringify(w.profile), "", now),
    db
      .prepare(
        "UPDATE profiles SET data=?,revision=?,write_token=?,updated_at=? WHERE id=? AND revision=?",
      )
      .bind(JSON.stringify(w.profile), expected + 1, token, now, pid, expected),
  ];
  for (const table of [
    "bullet_sources",
    "bullets",
    "resumes",
    "entities",
    "facts",
    "resume_history",
    "saved_jobs",
  ])
    statements.push(
      db
        .prepare(`DELETE FROM ${table} WHERE profile_id=? AND ${exists}`)
        .bind(pid, pid, token),
    );
  const insert = (sql: string, rows: unknown[]) =>
    statements.push(
      db
        .prepare(sql + ` WHERE ${exists}`)
        .bind(pid, JSON.stringify(rows), pid, token),
    );
  insert(
    "INSERT INTO entities(profile_id,id,kind,title,subtitle,dates) SELECT ?,json_extract(value,'$.id'),json_extract(value,'$.kind'),json_extract(value,'$.title'),json_extract(value,'$.subtitle'),json_extract(value,'$.dates') FROM json_each(?)",
    w.entities,
  );
  insert(
    "INSERT INTO facts(profile_id,id,entity_id,question_id,value,confirmed,revision,updated_at) SELECT ?,json_extract(value,'$.id'),json_extract(value,'$.entityId'),json_extract(value,'$.questionId'),json_extract(value,'$.value'),json_extract(value,'$.confirmed'),json_extract(value,'$.revision'),json_extract(value,'$.updatedAt') FROM json_each(?)",
    w.facts,
  );
  insert(
    "INSERT INTO resumes(profile_id,id,data) SELECT ?,json_extract(value,'$.id'),value FROM json_each(?)",
    w.resumes.map((r) => ({ ...r, bullets: [] })),
  );
  const bullets = w.resumes.flatMap((r) =>
    r.bullets.map((b, i) => ({
      id: b.id,
      resumeId: r.id,
      position: i,
      data: JSON.stringify({ ...b, evidenceIds: [], sourceRevisions: {} }),
    })),
  );
  insert(
    "INSERT INTO bullets(profile_id,id,resume_id,position,data) SELECT ?,json_extract(value,'$.id'),json_extract(value,'$.resumeId'),json_extract(value,'$.position'),json_extract(value,'$.data') FROM json_each(?)",
    bullets,
  );
  const sources = w.resumes.flatMap((r) =>
    r.bullets.flatMap((b) =>
      b.evidenceIds.map((factId) => ({
        bulletId: b.id,
        factId,
        revision: b.sourceRevisions[factId],
      })),
    ),
  );
  insert(
    "INSERT INTO bullet_sources(profile_id,bullet_id,fact_id,source_revision) SELECT ?,json_extract(value,'$.bulletId'),json_extract(value,'$.factId'),json_extract(value,'$.revision') FROM json_each(?)",
    sources,
  );
  insert(
    "INSERT INTO resume_history(profile_id,id,resume_id,data) SELECT ?,json_extract(value,'$.id'),json_extract(value,'$.resumeId'),value FROM json_each(?)",
    w.history,
  );
  insert(
    "INSERT INTO saved_jobs(profile_id,job_id) SELECT ?,value FROM json_each(?)",
    w.savedJobs,
  );
  const result = await db.batch(statements);
  if (result[1].meta.changes !== 1)
    throw Error(
      "This workspace changed in another tab. Refresh before saving again.",
    );
}
export async function deleteAccount(db: D1Database, user: string) {
  await db.batch<Record<string, unknown>>([
    db.prepare("DELETE FROM profiles WHERE user_id=?").bind(user),
    db.prepare("DELETE FROM ai_operations WHERE user_id=?").bind(user),
  ]);
}
