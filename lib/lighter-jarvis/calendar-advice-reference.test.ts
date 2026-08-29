import { describe, expect, it } from "vitest";
import {
  CALENDAR_ADVICE_REFERENCE_MAX_SUBSEQUENT_USER_TURNS,
  CALENDAR_ADVICE_REFERENCE_TTL_MS,
  advanceCalendarAdviceReferenceUserTurn,
  createCalendarAdviceReference,
  resolveCalendarAdviceReference,
} from "./calendar-advice-reference";

function make(now = new Date("2026-08-29T07:00:00.000Z")) {
  return createCalendarAdviceReference({
    sourceCommitmentReference: "google-calendar:calendar:primary:event:secret-deep",
    candidateStart: "2026-08-29T09:30:00.000Z",
    candidateEnd: "2026-08-29T11:00:00.000Z",
    durationMinutes: 90,
    observedAt: "2026-08-29T06:59:00.000Z",
    now,
  })!;
}

describe("opaque Calendar advice reference", () => {
  it("keeps recommendation detail and source identity server-side", () => {
    const ref = make();
    expect(Object.keys(ref)).toEqual(["calendarAdviceReferenceId"]);
    expect(JSON.stringify(ref)).not.toMatch(/google-calendar|secret-deep|09:30|11:00|90|keep_invitation/);
    expect(resolveCalendarAdviceReference({ reference: ref, now: new Date("2026-08-29T07:01:00.000Z") })).toMatchObject({
      sourceCommitmentReference: "google-calendar:calendar:primary:event:secret-deep",
      candidateStart: "2026-08-29T09:30:00.000Z",
      candidateEnd: "2026-08-29T11:00:00.000Z",
      durationMinutes: 90,
      preferenceKind: "prefer_keep_invitation_if_full_deep_work_preserved_later",
    });
  });

  it("uses the 15-minute half-open lifetime", () => {
    const start = new Date("2026-08-29T07:00:00.000Z");
    const ref = make(start);
    expect(resolveCalendarAdviceReference({ reference: ref, now: new Date(start.getTime() + CALENDAR_ADVICE_REFERENCE_TTL_MS - 1) })).not.toBeNull();
    expect(resolveCalendarAdviceReference({ reference: ref, now: new Date(start.getTime() + CALENDAR_ADVICE_REFERENCE_TTL_MS) })).toBeNull();
  });

  it("allows six subsequent turns and expires before the seventh", () => {
    const ref = make();
    for (let index = 0; index < CALENDAR_ADVICE_REFERENCE_MAX_SUBSEQUENT_USER_TURNS; index += 1) {
      expect(advanceCalendarAdviceReferenceUserTurn(ref)).toBe(true);
      expect(resolveCalendarAdviceReference({ reference: ref, now: new Date("2026-08-29T07:01:00.000Z") })).not.toBeNull();
    }
    expect(advanceCalendarAdviceReferenceUserTurn(ref)).toBe(true);
    expect(resolveCalendarAdviceReference({ reference: ref, now: new Date("2026-08-29T07:01:00.000Z") })).toBeNull();
  });

  it("ignores forged client-carried fields", () => {
    const ref = make();
    const forged = { ...ref, candidateStart: "2099-01-01T00:00:00Z", sourceCommitmentReference: "forged" };
    const resolved = resolveCalendarAdviceReference({ reference: forged, now: new Date("2026-08-29T07:01:00.000Z") });
    expect(resolved?.candidateStart).toBe("2026-08-29T09:30:00.000Z");
    expect(resolved?.sourceCommitmentReference).toBe("google-calendar:calendar:primary:event:secret-deep");
  });
});