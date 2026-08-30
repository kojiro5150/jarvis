import { describe, expect, it } from "vitest";
import { createUserAssertionRecord } from "./record-core";
import {
  canTransitionOperatingPictureLifecycle,
  evaluateOperatingPictureStaleness,
} from "./lifecycle-core";

describe("Governed Operating Picture lifecycle core", () => {
  it("derives staleness only from an explicit staleAfter boundary", () => {
    const record = createUserAssertionRecord({
      id: "user:preference",
      subject: { namespace: "user", entity: "preferences", attribute: "time_of_day" },
      value: "I prefer mornings.",
      statedAt: "2026-08-30T04:30:00Z",
      visibility: ["planning"],
      staleAfter: "2026-09-30T00:00:00Z",
    });

    const before = evaluateOperatingPictureStaleness(record, "2026-09-29T23:59:59Z");
    expect(before).toEqual({
      status: "unchanged",
      reason: "before_stale_after",
      record,
    });

    const after = evaluateOperatingPictureStaleness(record, "2026-09-30T00:00:00Z");
    expect(after.status).toBe("transitioned");
    if (after.status !== "transitioned") throw new Error("expected stale transition");
    expect(after.record.lifecycle).toBe("stale");
    expect(after.record.id).toBe(record.id);
    expect(after.record.class).toBe(record.class);
    expect(after.transition).toEqual({
      from: "current",
      to: "stale",
      basis: "explicit_stale_after_elapsed",
      evaluatedAt: "2026-09-30T00:00:00Z",
      staleAfter: "2026-09-30T00:00:00Z",
    });
    expect(record.lifecycle).toBe("current");
    expect(Object.isFrozen(after.record)).toBe(true);
    expect(Object.isFrozen(after.transition)).toBe(true);
  });

  it("does not invent a staleness rule when staleAfter is absent", () => {
    const record = createUserAssertionRecord({
      id: "user:role",
      subject: { namespace: "user", entity: "project", attribute: "role" },
      value: "I am leading this project.",
      statedAt: "2026-08-30T04:30:00Z",
      visibility: ["conversation"],
    });

    expect(evaluateOperatingPictureStaleness(record, "2030-01-01T00:00:00Z")).toEqual({
      status: "unchanged",
      reason: "no_stale_after",
      record,
    });
  });

  it("fails closed on invalid temporal boundaries", () => {
    const record = createUserAssertionRecord({
      id: "user:invalid-stale-after",
      subject: { namespace: "user", entity: "preferences", attribute: "temporary" },
      value: "Temporary preference.",
      statedAt: "2026-08-30T04:30:00Z",
      visibility: ["planning"],
      staleAfter: "not-a-date",
    });

    expect(evaluateOperatingPictureStaleness(record, "2026-09-30T00:00:00Z")).toEqual({
      status: "invalid",
      reason: "invalid_stale_after",
      record,
    });
    expect(evaluateOperatingPictureStaleness(record, "also-not-a-date")).toEqual({
      status: "invalid",
      reason: "invalid_evaluated_at",
      record,
    });
  });

  it("keeps superseded and withdrawn terminal and forbids generic revival", () => {
    expect(canTransitionOperatingPictureLifecycle("current", "stale")).toBe(true);
    expect(canTransitionOperatingPictureLifecycle("current", "superseded")).toBe(true);
    expect(canTransitionOperatingPictureLifecycle("current", "withdrawn")).toBe(true);
    expect(canTransitionOperatingPictureLifecycle("stale", "superseded")).toBe(true);
    expect(canTransitionOperatingPictureLifecycle("stale", "withdrawn")).toBe(true);

    expect(canTransitionOperatingPictureLifecycle("stale", "current")).toBe(false);
    expect(canTransitionOperatingPictureLifecycle("superseded", "current")).toBe(false);
    expect(canTransitionOperatingPictureLifecycle("withdrawn", "current")).toBe(false);
    expect(canTransitionOperatingPictureLifecycle("superseded", "withdrawn")).toBe(false);
    expect(canTransitionOperatingPictureLifecycle("withdrawn", "superseded")).toBe(false);
  });
});
