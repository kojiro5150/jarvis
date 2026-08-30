import { describe, expect, it, vi } from "vitest";

import {
  createSupabaseOperatingPicturePersistence,
} from "./supabase-persistence";

function persistence(
  fetchImpl: (input: string | URL | Request, init?: RequestInit) => Promise<Response>,
) {
  return createSupabaseOperatingPicturePersistence({
    url: "https://example.supabase.co",
    secretKey: "server-secret",
  }, fetchImpl);
}

function metadataRow(overrides: Readonly<Record<string, unknown>> = {}) {
  return {
    version_id: "11111111-1111-4111-8111-111111111111",
    record_id: "record:preflight:1",
    semantic_class: "user_assertion",
    lifecycle: "current",
    visibility_purposes: ["conversation"],
    authorship_source: "user",
    authorship_at: "2026-08-30T09:00:00Z",
    provenance_source: null,
    provenance_observed_at: null,
    ...overrides,
  };
}

describe("Supabase Operating Picture purpose preflight metadata", () => {
  it("reads only projection metadata and never selects semantic payload", async () => {
    const fetchImpl = vi.fn(async (
      _input: string | URL | Request,
      _init?: RequestInit,
    ) => new Response(JSON.stringify([metadataRow()]), { status: 200 }));

    const result = await persistence(fetchImpl).durableStore
      .getVersionProjectionMetadata("11111111-1111-4111-8111-111111111111");

    expect(result).toEqual({
      status: "found",
      metadata: {
        versionId: "11111111-1111-4111-8111-111111111111",
        recordId: "record:preflight:1",
        semanticClass: "user_assertion",
        lifecycle: "current",
        visibilityPurposes: ["conversation"],
        authorshipSource: "user",
        authorshipAt: "2026-08-30T09:00:00Z",
        provenanceSource: null,
        provenanceObservedAt: null,
      },
    });

    expect(fetchImpl).toHaveBeenCalledOnce();
    const firstCall = fetchImpl.mock.calls[0];
    const url = String(firstCall?.[0]);
    expect(url).toContain("/rest/v1/operating_picture_versions?version_id=eq.");
    expect(url).toContain("visibility_purposes");
    expect(url).toContain("semantic_class");
    expect(url).not.toContain("payload");
    expect(url).not.toContain("subject_namespace");
    expect(url).not.toContain("valid_from");
  });

  it("fails closed on malformed semantic/source metadata", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify([
      metadataRow({
        semantic_class: "fact",
        authorship_source: "user",
        authorship_at: "2026-08-30T09:00:00Z",
        provenance_source: null,
        provenance_observed_at: null,
      }),
    ]), { status: 200 }));

    await expect(
      persistence(fetchImpl).durableStore.getVersionProjectionMetadata(
        "11111111-1111-4111-8111-111111111111",
      ),
    ).resolves.toEqual({
      status: "rejected",
      reason: "persistence_integrity_failure",
    });
  });

  it("fails closed on malformed visibility metadata", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify([
      metadataRow({ visibility_purposes: "conversation" }),
    ]), { status: 200 }));

    await expect(
      persistence(fetchImpl).durableStore.getVersionProjectionMetadata(
        "11111111-1111-4111-8111-111111111111",
      ),
    ).resolves.toEqual({
      status: "rejected",
      reason: "persistence_integrity_failure",
    });
  });

  it("returns not_found only for an empty exact-version result", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify([]), { status: 200 }));

    await expect(
      persistence(fetchImpl).durableStore.getVersionProjectionMetadata("missing-version"),
    ).resolves.toEqual({ status: "not_found" });
  });

  it("fails closed on duplicate or mismatched exact-version metadata", async () => {
    const duplicateFetch = vi.fn(async () => new Response(JSON.stringify([
      metadataRow(),
      metadataRow(),
    ]), { status: 200 }));

    await expect(
      persistence(duplicateFetch).durableStore.getVersionProjectionMetadata(
        "11111111-1111-4111-8111-111111111111",
      ),
    ).resolves.toEqual({
      status: "rejected",
      reason: "persistence_integrity_failure",
    });

    const mismatchedFetch = vi.fn(async () => new Response(JSON.stringify([
      metadataRow({ version_id: "22222222-2222-4222-8222-222222222222" }),
    ]), { status: 200 }));

    await expect(
      persistence(mismatchedFetch).durableStore.getVersionProjectionMetadata(
        "11111111-1111-4111-8111-111111111111",
      ),
    ).resolves.toEqual({
      status: "rejected",
      reason: "persistence_integrity_failure",
    });
  });

  it("propagates provider failure without returning metadata", async () => {
    const fetchImpl = vi.fn(async () => new Response("unavailable", { status: 503 }));

    await expect(
      persistence(fetchImpl).durableStore.getVersionProjectionMetadata(
        "11111111-1111-4111-8111-111111111111",
      ),
    ).resolves.toEqual({
      status: "rejected",
      reason: "persistence_unavailable",
    });
  });
});
