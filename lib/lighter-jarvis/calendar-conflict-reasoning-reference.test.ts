import { describe, expect, it } from "vitest";
import type { GoldenScenarioGateKObservation } from "../governed-conversation/golden-scenario-calendar-conflict-gate-k";
import {
  CALENDAR_CONFLICT_REASONING_MAX_SUBSEQUENT_USER_TURNS,
  CALENDAR_CONFLICT_REASONING_REFERENCE_TTL_MS,
  advanceCalendarConflictReasoningReferenceUserTurn,
  createCalendarConflictReasoningReference,
  resolveCalendarConflictReasoningReference,
} from "./calendar-conflict-reasoning-reference";

function observation(id = "a"): GoldenScenarioGateKObservation {
  return Object.freeze({
    observedAt: "2026-08-29T06:30:00.000Z",
    addedPendingInvitation: Object.freeze({
      commitmentReference: `google-calendar:calendar:primary:event:invite-${id}`,
      title: "Gate K Test Invite",
      start: "2026-08-29T07:30:00.000Z",
      end: "2026-08-29T08:30:00.000Z",
      calendarName: "Work",
      timeMode: null,
      selfAttendeeResponse: "needsAction",
      observedAt: "2026-08-29T06:30:00.000Z",
      provenanceReference: `google-calendar:calendar:primary:event:invite-${id}#provenance`,
    }),
    existingDeepWorkCommitment: Object.freeze({
      commitmentReference: `google-calendar:calendar:primary:event:deep-${id}`,
      title: "URGENT PROTECTED PRIORITY JARVIS Deep Work",
      start: "2026-08-29T08:00:00.000Z",
      end: "2026-08-29T09:30:00.000Z",
      calendarName: "Work",
      timeMode: "deep_work",
      selfAttendeeResponse: null,
      observedAt: "2026-08-29T06:30:00.000Z",
      provenanceReference: `google-calendar:calendar:primary:event:deep-${id}#provenance`,
    }),
    overlapStart: "2026-08-29T08:00:00.000Z",
    overlapEnd: "2026-08-29T08:30:00.000Z",
    overlapMinutes: 30,
  });
}

describe("Calendar conflict reasoning reference", () => {
  it("keeps the exact Gate-K observation server-side behind one opaque handle", () => {
    const ref = createCalendarConflictReasoningReference({
      observation: observation(),
      now: new Date("2026-08-29T06:31:00.000Z"),
    })!;

    expect(Object.keys(ref)).toEqual(["calendarConflictReasoningReferenceId"]);
    const serialized = JSON.stringify(ref);
    for (const privateValue of ["Gate K Test Invite", "URGENT", "07:30", "needsAction", "deep_work"]) {
      expect(serialized).not.toContain(privateValue);
    }
    expect(ref.calendarConflictReasoningReferenceId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );

    const resolved = resolveCalendarConflictReasoningReference({
      reference: ref,
      now: new Date("2026-08-29T06:31:01.000Z"),
    });
    expect(resolved.status).toBe("resolved");
    if (resolved.status !== "resolved") throw new Error("expected resolved");
    expect(resolved.observation).toEqual(observation());
    expect(Object.isFrozen(resolved.observation)).toBe(true);
    expect(Object.isFrozen(resolved.observation.addedPendingInvitation)).toBe(true);
  });

  it("distinguishes absent and fabricated references", () => {
    expect(resolveCalendarConflictReasoningReference({ reference: undefined }).status).toBe("absent");
    expect(resolveCalendarConflictReasoningReference({
      reference: { calendarConflictReasoningReferenceId: "fabricated", title: "forged" },
    }).status).toBe("invalid");
  });

  it("expires exactly at the 15-minute half-open boundary", () => {
    const start = new Date("2026-08-29T06:00:00.000Z");
    const ref = createCalendarConflictReasoningReference({ observation: observation(), now: start })!;
    const before = new Date(start.getTime() + CALENDAR_CONFLICT_REASONING_REFERENCE_TTL_MS - 1);
    const exact = new Date(start.getTime() + CALENDAR_CONFLICT_REASONING_REFERENCE_TTL_MS);

    expect(resolveCalendarConflictReasoningReference({ reference: ref, now: before }).status).toBe("resolved");
    expect(resolveCalendarConflictReasoningReference({ reference: ref, now: exact }).status).toBe("expired");
  });

  it("allows the first six subsequent user turns and expires before the seventh", () => {
    const ref = createCalendarConflictReasoningReference({
      observation: observation(),
      now: new Date("2026-08-29T06:00:00.000Z"),
    })!;

    for (let turn = 1; turn <= CALENDAR_CONFLICT_REASONING_MAX_SUBSEQUENT_USER_TURNS; turn += 1) {
      expect(advanceCalendarConflictReasoningReferenceUserTurn(ref)).toBe(true);
      expect(resolveCalendarConflictReasoningReference({
        reference: ref,
        now: new Date("2026-08-29T06:01:00.000Z"),
      }).status).toBe("resolved");
    }

    expect(advanceCalendarConflictReasoningReferenceUserTurn(ref)).toBe(true);
    expect(resolveCalendarConflictReasoningReference({
      reference: ref,
      now: new Date("2026-08-29T06:01:00.000Z"),
    }).status).toBe("expired");
  });

  it("supersedes only the explicitly supplied prior reasoning reference", () => {
    const old = createCalendarConflictReasoningReference({
      observation: observation("old"),
      now: new Date("2026-08-29T06:00:00.000Z"),
    })!;
    const unrelated = createCalendarConflictReasoningReference({
      observation: observation("unrelated"),
      now: new Date("2026-08-29T06:00:01.000Z"),
    })!;
    const newer = createCalendarConflictReasoningReference({
      observation: observation("new"),
      previousReference: old,
      now: new Date("2026-08-29T06:00:02.000Z"),
    })!;

    const checkAt = new Date("2026-08-29T06:00:03.000Z");
    expect(resolveCalendarConflictReasoningReference({ reference: old, now: checkAt }).status).toBe("absent");
    expect(resolveCalendarConflictReasoningReference({ reference: newer, now: checkAt }).status).toBe("resolved");
    expect(resolveCalendarConflictReasoningReference({ reference: unrelated, now: checkAt }).status).toBe("resolved");
  });

  it("ignores forged client-carried evidence on a genuine reference", () => {
    const ref = createCalendarConflictReasoningReference({ observation: observation() })!;
    const forged = {
      calendarConflictReasoningReferenceId: ref.calendarConflictReasoningReferenceId,
      title: "forged",
      overlapMinutes: 999,
      timeMode: "protected",
    };
    const resolved = resolveCalendarConflictReasoningReference({ reference: forged });
    expect(resolved.status).toBe("resolved");
    if (resolved.status !== "resolved") throw new Error("expected resolved");
    expect(resolved.observation.overlapMinutes).toBe(30);
    expect(resolved.observation.existingDeepWorkCommitment.timeMode).toBe("deep_work");
  });
});
