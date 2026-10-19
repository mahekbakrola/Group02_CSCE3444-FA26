import { env } from "cloudflare:workers";
import { z } from "zod";
import { identity, checkOrigin, json, database } from "@/lib/server";
import { loadWorkspace } from "@/lib/store";
import { OpenAIProvider, RulesProvider } from "@/lib/providers/ai";
export async function POST(request: Request) {
  try {
    const user = await identity();
    if (!user) return json({ error: "Sign in first." }, 401);
    checkOrigin(request);
    const { mode, entityId } = z
      .object({
        mode: z.enum(["demo", "personal"]),
        entityId: z.string().max(200),
      })
      .parse(await request.json());
    const w = await loadWorkspace(user, mode);
    if (!w.entities.some((e) => e.id === entityId))
      return json({ error: "Choose an experience first." }, 400);
    const config = env as unknown as Record<string, string | undefined>;
    if (!config.OPENAI_API_KEY || !config.OPENAI_MODEL)
      return json({
        provider: "rules",
        suggestions: await new RulesProvider().generateFollowUps(w, entityId),
      });
    if (!w.profile.aiConsent)
      return json(
        {
          error:
            "Enable optional AI suggestions in Settings before sending experience answers to the provider.",
        },
        403,
      );
    const now = Date.now(),
      db = database();
    const result = await db
      .prepare(
        "INSERT INTO ai_operations(id,user_id,operation,created_at) SELECT ?,?,'followups',? WHERE (SELECT count(*) FROM ai_operations WHERE user_id=? AND created_at>?)<10",
      )
      .bind(crypto.randomUUID(), user, now, user, now - 3600000)
      .run();
    if (!result.meta.changes)
      return json(
        {
          error:
            "You have reached the 10 requests per hour limit. Try again later.",
        },
        429,
      );
    return json({
      provider: "openai",
      suggestions: await new OpenAIProvider(
        config.OPENAI_API_KEY,
        config.OPENAI_MODEL,
      ).generateFollowUps(w, entityId),
    });
  } catch (e) {
    return json(
      { error: e instanceof Error ? e.message : "AI suggestions unavailable" },
      400,
    );
  }
}
