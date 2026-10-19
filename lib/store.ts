import { database } from "./server";
import * as repository from "./repository";
import type { Workspace } from "./engine/model";
import type { AuthUser } from "./auth/core";
import { accountProfile } from "./auth/profile";
export const loadWorkspace = async (user: string, mode: "demo" | "personal", account?: AuthUser) => {
  const db = database();
  if (mode === "personal" && account) await repository.seedAccountProfile(db, user, accountProfile(account));
  return repository.loadWorkspace(db, user, mode);
};
export const saveWorkspace = (user: string, w: Workspace, expected: number) =>
  repository.saveWorkspace(database(), user, w, expected);
export const deleteAccount = (user: string) =>
  repository.deleteAccount(database(), user);
