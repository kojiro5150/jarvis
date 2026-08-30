import { describe, expect, it, vi } from "vitest";

import {
  createSupabaseOperatingPicturePersistence,
} from "./supabase-persistence";

type RowOverrides = Partial<{
  version_id: string;
  record_id: string;
  previous_version_id: string | null;
  recorded_at: string;
  semantic_class: string;
  lifecycle: string;
  subject_namespace: string;
  subject_entity: string;
  subject_attribute: string;
  revision_semantics: string;
  visibility_purposes: string[];
  valid_from: string | null;
  valid_until: string | null;
  stale_after: string | null;
  superseded_by: string | null;
  payload: unknown;
  authorship_source: string | null;
  authorship_at: string | null;
  provenance_source: string | null;
  provenance_observed_at: string | null;
}>;

function row(overrides: RowOverrides = {}) {
  return {
    version_id: "11111111-1111-4111-8111-111111111111",
    record_id: "record:durable:1",
    previous_version_id: null,
    recorded_at: "2026-08-30T08:00:00Z",
    semantic_class: "user_assertion",
    lifecycle: "current",
    subject_namespace: "user",
    subject_entity: "project",
    subject_attribute: "role",
    revision_semantics: "explicit_replacement",
    visibility_purposes: ["conversation"],
    valid_from: null,
    valid_until: null,
    stale_after: "2026-09-01T00:00:00Z",
    superseded_by: null,
    payload: { text: "Project lead" },
    authorship_source: "user",
    authorship_at: "2026-08-30T07:59:00Z",
    provenance_source: null,
    provenance_observed_at: null,
    ...overrides,
  };
}

function persistence(
  fetchImpl: (input: string | URL | Request, init?: RequestInit) => Promise<Response>,
) {
  return createSupabaseOperatingPicturePersistence({
    url: "https://example.supabase.co",
    secretKey: "server-secret",
  }, fetchImpl);
}

describe("Supabase durable Operating Picture reads", () => {
  it("returns an exact low-trust persisted version without trust rehydration", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify([row()]), {
      status: 200,
      headers: { "content-type": "application/json" },
    }));

    const result = await persistence(fetchImpl).durableStore.getVersion(
      "11111111-1111-4111-8111-111111111111",
    );

    expect(result).toEqual({
      status: "found",
      version: {
        versionId: "11111111-1111-4111-8111-111111111111",
        recordId: "record:durable:1",
        previousVersionId: null,
        recordedAt: "2026-08-30T08:00:00Z",
        semanticClass: "user_assertion",
        lifecycle: "current",
        subjectNamespace: "user",
        subjectEntity: "project",
        subjectAttribute: "role",
        revisionSemantics: "explicit_replacement",
        visibilityPurposes: ["conversation"],
        validFrom: null,
        validUntil: null,
        staleAfter: "2026-09-01T00:00:00Z",
        supersededBy: null,
        payload: { text: "Project lead" },
        authorshipSource: "user",
        authorshipAt: "2026-08-30T07:59:00Z",
        provenanceSource: null,
        provenanceObservedAt: null,
      },
    });
    expect(fetchImpl).toHaveBeenCalledOnce();
    expect(String(fetchImpl.mock.calls[0][0])).toContain(
      "/rest/v1/operating_picture_versions?version_id=eq.",
    );
  });

  it("reconstructs exact history from the durable head rather than response order", async () => {
    const first = row();
    const second = row({
      version_id: "22222222-2222-4222-8222-222222222222",
      previous_version_id: first.version_id,
      recorded_at: "2026-09-01T00:00:01Z",
      lifecycle: "stale",
    });

    const fetchImpl = vi.fn(async input => {
      const url = String(input);
      if (url.includes("operating_picture_heads")) {
        return new Response(JSON.stringify([{
          record_id: "record:durable:1",
          version_id: second.version_id,
        }]), { status: 200 });
      }
      return new Response(JSON.stringify([second, first]), { status: 200 });
    });

    const store = persistence(fetchImpl).durableStore;
    const history = await store.listRecordVersions("record:durable:1");

    expect(history).toEqual({
      status: "found",
      headVersionId: second.version_id,
      versions: [
        expect.objectContaining({
          versionId: first.version_id,
          lifecycle: "current",
          previousVersionId: null,
        }),
        expect.objectContaining({
          versionId: second.version_id,
          lifecycle: "stale",
          previousVersionId: first.version_id,
        }),
      ],
    });

    const head = await store.getHeadVersion("record:durable:1");
    expect(head).toEqual({
      status: "found",
      version: expect.objectContaining({
        versionId: second.version_id,
        lifecycle: "stale",
      }),
    });
  });

  it("returns not_found only when both head and durable history are absent", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify([]), { status: 200 }));

    await expect(
      persistence(fetchImpl).durableStore.listRecordVersions("missing"),
    ).resolves.toEqual({ status: "not_found" });
  });

  it.each([
    {
      name: "history without a head",
      head: [],
      versions: [row()],
    },
    {
      name: "head without history",
      head: [{ record_id: "record:durable:1", version_id: row().version_id }],
      versions: [],
    },
    {
      name: "head points outside returned history",
      head: [{
        record_id: "record:durable:1",
        version_id: "99999999-9999-4999-8999-999999999999",
      }],
      versions: [row()],
    },
    {
      name: "broken previous-version chain",
      head: [{
        record_id: "record:durable:1",
        version_id: "22222222-2222-4222-8222-222222222222",
      }],
      versions: [
        row(),
        row({
          version_id: "22222222-2222-4222-8222-222222222222",
          previous_version_id: "33333333-3333-4333-8333-333333333333",
          lifecycle: "stale",
        }),
      ],
    },
    {
      name: "disconnected branch",
      head: [{
        record_id: "record:durable:1",
        version_id: "22222222-2222-4222-8222-222222222222",
      }],
      versions: [
        row(),
        row({
          version_id: "22222222-2222-4222-8222-222222222222",
          previous_version_id: row().version_id,
          lifecycle: "stale",
        }),
        row({
          version_id: "33333333-3333-4333-8333-333333333333",
          previous_version_id: row().version_id,
          lifecycle: "stale",
        }),
      ],
    },
  ])("fails closed on durable integrity error: $name", async fixture => {
    const fetchImpl = vi.fn(async input => {
      const url = String(input);
      return new Response(JSON.stringify(
        url.includes("operating_picture_heads") ? fixture.head : fixture.versions,
      ), { status: 200 });
    });

    await expect(
      persistence(fetchImpl).durableStore.listRecordVersions("record:durable:1"),
    ).resolves.toEqual({
      status: "rejected",
      reason: "persistence_integrity_failure",
    });
  });

  it("fails closed on malformed semantic/source shape instead of trusting stored JSON", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify([
      row({
        semantic_class: "fact",
        authorship_source: "user",
        provenance_source: null,
        provenance_observed_at: null,
      }),
    ]), { status: 200 }));

    await expect(
      persistence(fetchImpl).durableStore.getVersion(
        "11111111-1111-4111-8111-111111111111",
      ),
    ).resolves.toEqual({
      status: "rejected",
      reason: "persistence_integrity_failure",
    });
  });

  it("fails closed on provider failure", async () => {
    const fetchImpl = vi.fn(async () => new Response("unavailable", { status: 503 }));

    await expect(
      persistence(fetchImpl).durableStore.getVersion(
        "11111111-1111-4111-8111-111111111111",
      ),
    ).resolves.toEqual({
      status: "rejected",
      reason: "persistence_unavailable",
    });
  });
});
