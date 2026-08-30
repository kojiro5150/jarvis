import { describe, expect, it, vi } from "vitest";

import { createUserAssertionRecord } from "./record-core";
import {
  createInitialOperatingPictureRecordVersion,
  type OperatingPictureHistoryRecord,
  type OperatingPictureRecordVersion,
} from "./record-version-history";
import {
  createSupabaseOperatingPicturePersistence,
  loadSupabaseOperatingPictureConfig,
} from "./supabase-persistence";

function versionWith(value: unknown): OperatingPictureRecordVersion<OperatingPictureHistoryRecord> {
  const record = createUserAssertionRecord({
    id: "user:persistence:test",
    subject: {
      namespace: "user",
      entity: "persistence",
      attribute: "test",
      revision: "append_only",
    },
    value: value as never,
    statedAt: "2026-08-30T07:20:00Z",
    visibility: ["test"],
  });
  const version = createInitialOperatingPictureRecordVersion(
    record,
    "2026-08-30T07:20:01Z",
  );
  if (!version) throw new Error("fixture version not created");
  return version as OperatingPictureRecordVersion<OperatingPictureHistoryRecord>;
}

describe("Supabase Operating Picture persistence", () => {
  it("loads only the server secret configuration used by the persistence adapter", () => {
    expect(loadSupabaseOperatingPictureConfig({
      NEXT_PUBLIC_SUPABASE_URL: "https://atlnaklzbwfbsdmoqvln.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-not-used-here",
      SUPABASE_SECRET_KEY: "secret-value",
    })).toEqual({
      url: "https://atlnaklzbwfbsdmoqvln.supabase.co",
      secretKey: "secret-value",
    });

    expect(loadSupabaseOperatingPictureConfig({
      NEXT_PUBLIC_SUPABASE_URL: "https://atlnaklzbwfbsdmoqvln.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-only",
    })).toBeNull();
  });

  it("appends through the atomic server RPC and returns the exact version on success", async () => {
    const fetchImpl = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
      expect(init?.method).toBe("POST");
      expect(init?.headers).toEqual({
        apikey: "server-secret",
        authorization: "Bearer server-secret",
        "content-type": "application/json",
      });
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      expect(body).toMatchObject({
        p_record_id: "user:persistence:test",
        p_previous_version_id: null,
        p_semantic_class: "user_assertion",
        p_lifecycle: "current",
        p_subject_namespace: "user",
        p_subject_entity: "persistence",
        p_subject_attribute: "test",
        p_revision_semantics: "append_only",
        p_payload: { text: "persist me" },
        p_authorship_source: "user",
      });
      expect(body).not.toHaveProperty("authority");
      expect(body).not.toHaveProperty("evidence");
      return new Response(JSON.stringify([{ status: "appended", reason: null }]), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });

    const version = versionWith({ text: "persist me" });
    const persistence = createSupabaseOperatingPicturePersistence({
      url: "https://atlnaklzbwfbsdmoqvln.supabase.co",
      secretKey: "server-secret",
    }, fetchImpl);

    const result = await persistence.appendVersion(version);

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://atlnaklzbwfbsdmoqvln.supabase.co/rest/v1/rpc/append_operating_picture_version",
      expect.any(Object),
    );
    expect(result).toEqual({ status: "appended", version });
  });

  it.each([
    "record_already_exists",
    "previous_version_not_found",
    "previous_version_not_current_head",
    "version_already_exists",
    "transition_invalid",
  ] as const)("preserves database fail-closed rejection reason %s", async reason => {
    const fetchImpl = vi.fn(async () => new Response(
      JSON.stringify([{ status: "rejected", reason }]),
      { status: 200, headers: { "content-type": "application/json" } },
    ));
    const persistence = createSupabaseOperatingPicturePersistence({
      url: "https://example.supabase.co",
      secretKey: "server-secret",
    }, fetchImpl);

    await expect(persistence.appendVersion(versionWith("value"))).resolves.toEqual({
      status: "rejected",
      reason,
    });
  });

  it("rejects non-JSON payloads before making any network request", async () => {
    const fetchImpl = vi.fn();
    const persistence = createSupabaseOperatingPicturePersistence({
      url: "https://example.supabase.co",
      secretKey: "server-secret",
    }, fetchImpl);

    const result = await persistence.appendVersion(versionWith(new Date()));

    expect(result).toEqual({ status: "rejected", reason: "invalid_payload" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("fails closed on provider/network failure or malformed RPC output", async () => {
    const throwingFetch = vi.fn(async () => {
      throw new Error("network unavailable");
    });
    const unavailable = createSupabaseOperatingPicturePersistence({
      url: "https://example.supabase.co",
      secretKey: "server-secret",
    }, throwingFetch);

    await expect(unavailable.appendVersion(versionWith("value"))).resolves.toEqual({
      status: "rejected",
      reason: "persistence_unavailable",
    });

    const malformedFetch = vi.fn(async () => new Response(
      JSON.stringify([{ status: "something_else", reason: null }]),
      { status: 200, headers: { "content-type": "application/json" } },
    ));
    const malformed = createSupabaseOperatingPicturePersistence({
      url: "https://example.supabase.co",
      secretKey: "server-secret",
    }, malformedFetch);

    await expect(malformed.appendVersion(versionWith("value"))).resolves.toEqual({
      status: "rejected",
      reason: "unexpected_persistence_response",
    });
  });
});
