import type { AuthUser } from "./core.ts";

export function accountProfile(user: AuthUser) {
  const metadata = user.user_metadata;
  const name = [metadata?.full_name, metadata?.name]
    .find(value => typeof value === "string" && value.trim());
  return {
    name: typeof name === "string" ? name.trim().slice(0, 100) : "",
    email: typeof user.email === "string" ? user.email.trim().slice(0, 254) : "",
  };
}
