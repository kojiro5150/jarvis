import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(process.cwd(), "supabase/migrations/202608300001_governed_operating_picture.sql"),
  "utf8",
);

describe("Operating Picture Supabase schema", () => {
  it("keeps versions append-only and heads exact-record bound", () => {
    expect(migration).toContain("create table if not exists public.operating_picture_versions");
    expect(migration).toContain("constraint operating_picture_previous_same_record");
    expect(migration).toContain("foreign key (record_id, previous_version_id)");
    expect(migration).toContain("create unique index if not exists operating_picture_one_initial_version_per_record");
    expect(migration).toContain("create table if not exists public.operating_picture_heads");
    expect(migration).toContain("constraint operating_picture_head_exact_version");
    expect(migration).toContain("operating_picture_versions_no_update");
    expect(migration).toContain("operating_picture_versions_no_delete");
    expect(migration).toContain("operating_picture_versions is append-only");
  });

  it("keeps the database server-owned rather than browser writable", () => {
    expect(migration).toContain("alter table public.operating_picture_versions enable row level security");
    expect(migration).toContain("alter table public.operating_picture_heads enable row level security");
    expect(migration).toContain("revoke all on public.operating_picture_versions from anon, authenticated");
    expect(migration).toContain("revoke all on public.operating_picture_heads from anon, authenticated");
    expect(migration).not.toMatch(/create\s+policy/i);
  });

  it("uses one atomic exact-head append function and exposes it only to service_role", () => {
    expect(migration).toContain("create or replace function public.append_operating_picture_version");
    expect(migration).toContain("pg_advisory_xact_lock");
    expect(migration).toContain("previous_version_not_current_head");
    expect(migration).toContain("previous_version_not_found");
    expect(migration).toContain("record_already_exists");
    expect(migration).toContain("version_already_exists");
    expect(migration).toContain("grant execute on function public.append_operating_picture_version");
    expect(migration).toContain("to service_role");
    expect(migration).toContain("from public, anon, authenticated");
  });

  it("stores semantic data and provenance metadata without authority/proof columns", () => {
    expect(migration).toContain("semantic_class text not null");
    expect(migration).toContain("payload jsonb not null");
    expect(migration).toContain("provenance_source text null");
    expect(migration).toContain("provenance_observed_at timestamptz null");

    expect(migration).not.toMatch(/authority_evidence/i);
    expect(migration).not.toMatch(/policy_proof/i);
    expect(migration).not.toMatch(/verification_proof/i);
    expect(migration).not.toMatch(/completion_proof/i);
  });
});
