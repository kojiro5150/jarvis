import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/20260908035129_harden_operating_picture_schema.sql",
  ),
  "utf8",
);

describe("governed Operating Picture schema hardening", () => {
  it("pins the append-only trigger function search path", () => {
    expect(migration).toContain(
      "alter function public.reject_operating_picture_version_mutation()",
    );
    expect(migration).toContain("set search_path = pg_catalog");
  });

  it("covers both composite foreign keys in their declared column order", () => {
    expect(migration).toContain(
      "on public.operating_picture_versions (record_id, previous_version_id)",
    );
    expect(migration).toContain(
      "on public.operating_picture_heads (record_id, version_id)",
    );
  });

  it("contains no stored-data mutation", () => {
    expect(migration).not.toMatch(/\b(?:insert|update|delete|truncate)\b/i);
  });
});
