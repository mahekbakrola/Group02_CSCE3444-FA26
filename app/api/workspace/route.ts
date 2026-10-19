import { identity, checkOrigin, json } from "@/lib/server";
import { loadWorkspace, saveWorkspace, deleteAccount } from "@/lib/store";
import { RequestSchema } from "@/lib/validation";
import { applyAction } from "@/lib/engine/actions";
import { currentUser } from "@/lib/auth/server";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const account = await currentUser();
    const user = account ? `supabase:${account.id}` : null;
    if (!user)
      return json({ error: "Sign in to save and access your workspace." }, 401);
    const mode =
      new URL(request.url).searchParams.get("mode") === "personal"
        ? "personal"
        : "demo";
    return json(await loadWorkspace(user, mode, account ?? undefined));
  } catch (e) {
    return json(
      {
        error: import.meta.env.DEV
          ? e instanceof Error
            ? e.message
            : "Unknown local error"
          : "Your workspace could not be loaded. Please try again.",
      },
      503,
    );
  }
}
export async function POST(request: Request) {
  try {
    const user = await identity();
    if (!user) return json({ error: "Sign in to save your workspace." }, 401);
    checkOrigin(request);
    if (Number(request.headers.get("content-length") ?? 0) > 200000)
      return json({ error: "Request too large" }, 413);
    const raw = await request.text();
    if (raw.length > 200000) return json({ error: "Request too large" }, 413);
    const parsed = RequestSchema.safeParse(JSON.parse(raw));
    if (!parsed.success)
      return json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request" },
        400,
      );
    const { mode, revision, action } = parsed.data;
    const current = await loadWorkspace(user, mode);
    if (current.revision !== revision)
      return json(
        {
          error:
            "This workspace changed in another tab. Refresh before saving again.",
        },
        409,
      );
    const next = applyAction(current, action);
    await saveWorkspace(user, next, revision);
    return json(next);
  } catch (e) {
    return json(
      {
        error:
          e instanceof Error
            ? e.message
            : "Unable to save. Your input has been preserved.",
      },
      400,
    );
  }
}
export async function DELETE(request: Request) {
  try {
    const user = await identity();
    if (!user) return json({ error: "Sign in first." }, 401);
    checkOrigin(request);
    const body = (await request.json()) as { confirm?: string };
    if (body.confirm !== "DELETE")
      return json({ error: "Confirm deletion first." }, 400);
    await deleteAccount(user);
    return json({ deleted: true });
  } catch {
    return json({ error: "Deletion failed. Please try again." }, 503);
  }
}
