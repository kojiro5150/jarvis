import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const foundation = readFileSync(
  join(process.cwd(), "supabase/migrations/20260919144222_durable_governance_ephemeral_state.sql"),
  "utf8",
);
const repair = readFileSync(
  join(process.cwd(), "supabase/migrations/20260919145413_fix_governance_ephemeral_consume_qualification.sql"),
  "utf8",
);

describe("durable governance ephemeral-state schema", () => {
  it("keeps authority state server-only behind RLS", () => {
    expect(foundation).toContain("alter table public.governance_ephemeral_state enable row level security");
    expect(foundation).toContain("revoke all on public.governance_ephemeral_state from anon, authenticated");
    expect(foundation).toContain("grant select, insert, update, delete on public.governance_ephemeral_state to service_role");
  });

  it("uses a security-invoker atomic consume RPC available only to service_role", () => {
    expect(repair).toContain("security invoker");
    expect(repair).toContain("set search_path = pg_catalog");
    expect(repair).toContain("and s.status = 'active'");
    expect(repair).toContain("and s.expires_at > p_now");
    expect(repair).toContain("set status = 'consumed'");
    expect(repair).toContain("revoke all on function public.consume_governance_ephemeral_state");
    expect(repair).toContain("grant execute on function public.consume_governance_ephemeral_state");
    expect(repair).toContain("to service_role");
  });

  it("records terminal consumed and revoked state explicitly", () => {
    expect(foundation).toContain("status in ('active','consumed','revoked')");
    expect(foundation).toContain("consumed_at is not null");
    expect(foundation).toContain("revoked_at is not null");
  });
});
