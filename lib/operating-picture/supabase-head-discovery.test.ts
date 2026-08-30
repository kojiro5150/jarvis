import { describe, expect, it, vi } from "vitest";

import { createSupabaseOperatingPicturePersistence } from "./supabase-persistence";

function persistence(
  fetchImpl: (input: string | URL | Request, init?: RequestInit) => Promise<Response>,
) {
  return createSupabaseOperatingPicturePersistence({
    url: "https://example.supabase.co",
    secretKey: "server-secret",
  }, fetchImpl);
}

function head(recordId: string, versionId: string) {
  return { record_id: recordId, version_id: versionId };
}

describe("Supabase durable Operating Picture head discovery", () => {
  it("returns empty when no durable heads exist", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify([]), { status: 200 }));

    await expect(
      persistence(fetchImpl).durableStore.listRecordHeads(),
    ).resolves.toEqual({ status: "empty" });
  });

  it("discovers durable record heads in deterministic record-id order", async () => {
    const fetchImpl = vi.fn(async (
      _input: string | URL | Request,
      _init?: RequestInit,
    ) => new Response(JSON.stringify([
      head("record:a", "11111111-1111-4111-8111-111111111111"),
      head("record:b", "22222222-2222-4222-8222-222222222222"),
    ]), { status: 200 }));

    const result = await persistence(fetchImpl).durableStore.listRecordHeads();

    expect(result).toEqual({
      status: "found",
      heads: [
        {
          recordId: "record:a",
          versionId: "11111111-1111-4111-8111-111111111111",
        },
        {
          recordId: "record:b",
          versionId: "22222222-2222-4222-8222-222222222222",
        },
      ],
    });
    expect(fetchImpl).toHaveBeenCalledOnce();
    const firstCall = fetchImpl.mock.calls[0];
    expect(String(firstCall?.[0])).toContain("order=record_id.asc");
    expect(String(firstCall?.[0])).toContain("limit=250");
    expect(String(firstCall?.[0])).toContain("offset=0");
  });

  it("paginates until a short page proves discovery is complete", async () => {
    const firstPage = Array.from({ length: 250 }, (_, index) => (
      head(
        `record:${String(index).padStart(3, "0")}`,
        `${String(index).padStart(8, "0")}-1111-4111-8111-111111111111`,
      )
    ));
    const secondPage = [
      head("record:250", "25000000-1111-4111-8111-111111111111"),
    ];

    const fetchImpl = vi.fn(async input => {
      const url = String(input);
      return new Response(
        JSON.stringify(url.includes("offset=250") ? secondPage : firstPage),
        { status: 200 },
      );
    });

    const result = await persistence(fetchImpl).durableStore.listRecordHeads();

    expect(result.status).toBe("found");
    if (result.status !== "found") throw new Error("expected discovered heads");
    expect(result.heads).toHaveLength(251);
    expect(result.heads[0]).toEqual({
      recordId: "record:000",
      versionId: "00000000-1111-4111-8111-111111111111",
    });
    expect(result.heads[250]).toEqual({
      recordId: "record:250",
      versionId: "25000000-1111-4111-8111-111111111111",
    });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("fails closed on malformed or duplicate durable head rows", async () => {
    const malformed = vi.fn(async () => new Response(JSON.stringify([
      { record_id: "record:a", version_id: null },
    ]), { status: 200 }));

    await expect(
      persistence(malformed).durableStore.listRecordHeads(),
    ).resolves.toEqual({
      status: "rejected",
      reason: "persistence_integrity_failure",
    });

    const duplicate = vi.fn(async () => new Response(JSON.stringify([
      head("record:a", "11111111-1111-4111-8111-111111111111"),
      head("record:a", "22222222-2222-4222-8222-222222222222"),
    ]), { status: 200 }));

    await expect(
      persistence(duplicate).durableStore.listRecordHeads(),
    ).resolves.toEqual({
      status: "rejected",
      reason: "persistence_integrity_failure",
    });
  });

  it("fails closed on provider failure", async () => {
    const fetchImpl = vi.fn(async () => new Response("unavailable", { status: 503 }));

    await expect(
      persistence(fetchImpl).durableStore.listRecordHeads(),
    ).resolves.toEqual({
      status: "rejected",
      reason: "persistence_unavailable",
    });
  });
});
