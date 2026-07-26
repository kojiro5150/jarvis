import { describe, expect, it } from "vitest";

import { createExecutionAuditStore } from "./execution-audit-store-factory";
import { JsonlExecutionAuditStore } from "./execution-audit-store";
import { SupabaseExecutionAuditStore } from "./supabase-execution-audit-store";

describe("createExecutionAuditStore", () => {
  it("uses JSONL when Supabase is not configured", () => {
    expect(createExecutionAuditStore({})).toBeInstanceOf(JsonlExecutionAuditStore);
  });

  it("uses Supabase when URL and current secret key are configured", () => {
    expect(
      createExecutionAuditStore({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co/",
        SUPABASE_SECRET_KEY: "secret",
      })
    ).toBeInstanceOf(SupabaseExecutionAuditStore);
  });

  it("accepts the legacy service-role variable as a compatibility alias", () => {
    expect(
      createExecutionAuditStore({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "legacy-secret",
      })
    ).toBeInstanceOf(SupabaseExecutionAuditStore);
  });

  it("fails loudly when only part of the Supabase configuration is present", () => {
    expect(() =>
      createExecutionAuditStore({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      })
    ).toThrow("requires both NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY");
  });
});
