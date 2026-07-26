import { describe, expect, it, vi } from "vitest";

import {
  SupabaseExecutionAuditStore,
  fromExecutionAuditRow,
  toExecutionAuditRow,
} from "./supabase-execution-audit-store";
import type { ExecutionAuditRecord } from "./execution-audit";
import type { FetchLike } from "./supabase-execution-audit-store";

const RECORD: ExecutionAuditRecord = {
  id: "11111111-1111-4111-8111-111111111111",
  timestamp: "2026-07-26T03:00:00.000Z",
  selectedAgentId: "oracle",
  stepNumber: 1,
  requestedAuthority: "advise",
  grantedAuthority: "advise",
  task: "Assess the evidence",
  constraints: ["Use confirmed sources"],
  expectedOutput: "Brief",
  humanApproved: false,
  preparationStatus: "prepared",
  executionStatus: "completed",
  model: "claude-test",
  inputTokens: 10,
  outputTokens: 20,
};

describe("SupabaseExecutionAuditStore", () => {
  it("maps records to database rows and back without changing meaning", () => {
    expect(fromExecutionAuditRow(toExecutionAuditRow(RECORD))).toEqual(RECORD);
  });

  it("appends one record with server-only authentication headers", async () => {
    const fetcher = vi.fn(async () => new Response(null, { status: 201 })) as unknown as FetchLike;
    const store = new SupabaseExecutionAuditStore(
      { url: "https://example.supabase.co", secretKey: "secret" },
      fetcher
    );

    await store.append(RECORD);

    expect(fetcher).toHaveBeenCalledOnce();
    const [url, init] = vi.mocked(fetcher).mock.calls[0];
    expect(url).toBe("https://example.supabase.co/rest/v1/execution_audit");
    expect(init?.method).toBe("POST");
    expect(init?.headers).toMatchObject({
      apikey: "secret",
      Authorization: "Bearer secret",
      Prefer: "return=minimal",
    });
    expect(JSON.parse(String(init?.body))).toEqual(toExecutionAuditRow(RECORD));
  });

  it("returns newest database rows in the order supplied by Supabase", async () => {
    const row = toExecutionAuditRow(RECORD);
    const fetcher = vi.fn(async () => Response.json([row])) as unknown as FetchLike;
    const store = new SupabaseExecutionAuditStore(
      { url: "https://example.supabase.co", secretKey: "secret" },
      fetcher
    );

    expect(await store.list(25)).toEqual([RECORD]);
    expect(String(vi.mocked(fetcher).mock.calls[0][0])).toContain(
      "order=created_at.desc"
    );
  });

  it("rejects unsuccessful Data API responses without exposing response content", async () => {
    const fetcher = vi.fn(async () => new Response("sensitive", { status: 401 })) as unknown as FetchLike;
    const store = new SupabaseExecutionAuditStore(
      { url: "https://example.supabase.co", secretKey: "secret" },
      fetcher
    );

    await expect(store.append(RECORD)).rejects.toThrow(
      "Supabase execution audit append failed (401)"
    );
  });
});
