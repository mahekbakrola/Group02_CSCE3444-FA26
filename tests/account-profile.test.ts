import { test } from "node:test";
import assert from "node:assert/strict";
import { accountProfile } from "../lib/auth/profile.ts";
test("Google and email signup names populate contact defaults", () => {
  assert.deepEqual(accountProfile({ id: "a", email: "a@example.com", user_metadata: { full_name: " Maya Chen " } }), { name: "Maya Chen", email: "a@example.com" });
  assert.equal(accountProfile({ id: "a", user_metadata: { full_name: " ", name: "Maya" } }).name, "Maya");
  assert.deepEqual(accountProfile({ id: "a" }), { name: "", email: "" });
});
