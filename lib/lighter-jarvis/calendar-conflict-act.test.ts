import { describe, expect, it } from "vitest";
import { sourceResult } from "../governed-conversation/source-adapter-result";
import type { ScopedCalendarEvidenceResult } from "../governed-conversation/scoped-calendar-evidence-acquisition-adapter";
import type { GovernedCalendarConflictEvent } from "../governed-conversation/calendar-conflict-observation";
import { createCalendarAdviceReference } from "./calendar-advice-reference";
import { resolveCalendarMoveProposalReference } from "./calendar-move-proposal-reference";
import {
  isCalendarActInstruction,
  validateCalendarAdviceForAct,
  validateCalendarMoveProposalAgainstEvidence,
} from "./calendar-conflict-act";

const observedAt = "2026-08-29T08:00:00.000Z";
const window = Object.freeze({
  start: "2026-08-28T14:00:00.000Z",
  end: "2026-08-29T14:00:00.000Z",
  timeZone: "Australia/Melbourne",
  period: "today" as const,
});

function advice() {
  return createCalendarAdviceReference({
    sourceCommitmentReference:
      "google-calendar:calendar:primary:event:deep",
    candidateStart: "2026-08-29T10:30:00.000Z",
    candidateEnd: "2026-08-29T12:00:00.000Z",
    durationMinutes: 90,
    observedAt: "2026-08-29T07:30:00.000Z",
    now: new Date("2026-08-29T07:31:00.000Z"),
  })!;
}

function evidence(extra: readonly GovernedCalendarConflictEvent[] = []): ScopedCalendarEvidenceResult {
  return Object.freeze({
    ...sourceResult("available", [], { observedAt }),
    coverageState: "bounded_complete_request",
    conflictEvents: Object.freeze([
      Object.freeze({
        commitmentReference:
          "google-calendar:calendar:primary:event:deep",
        title: "SECRET title",
        start: "2026-08-29T09:00:00.000Z",
        end: "2026-08-29T10:30:00.000Z",
        calendarName: "Private",
        timeMode: "deep_work" as const,
        selfAttendeeResponse: null,
        observedAt,
        provenanceReference: "secret#provenance",
      }),
      ...extra,
    ]),
  });
}

describe("first bounded Calendar Act validation", () => {
  it("recognizes only the closed natural Act instruction", () => {
    expect(isCalendarActInstruction("Okay, do it.")).toBe(true);
    expect(isCalendarActInstruction("OK do it")).toBe(true);
    expect(isCalendarActInstruction("Move it")).toBe(false);
  });

  it("creates one exact opaque proposal only after current-state validation", () => {
    const result = validateCalendarAdviceForAct({
      adviceReference: advice(),
      evidence: evidence(),
      window,
      now: new Date("2026-08-29T07:32:00.000Z"),
    });

    expect(result).toMatchObject({
      status: "resolved",
      reply:
        "I can move the deep-work block from 7:00 PM–8:30 PM to 8:30 PM–10:00 PM. Please explicitly confirm this exact Calendar change.",
      calendarMoveProposalReference: {
        calendarMoveProposalReferenceId: expect.any(String),
      },
      calendarMoveAuthorizationReference: {
        calendarMoveAuthorizationReferenceId: expect.any(String),
      },
    });
    expect(JSON.stringify(result.calendarMoveProposalReference)).not.toMatch(
      /primary|deep|07:00|08:30|10:00|google-calendar/,
    );
    const proposal = resolveCalendarMoveProposalReference(
      result.calendarMoveProposalReference,
    );
    expect(proposal).toEqual({
      commitmentReference:
        "google-calendar:calendar:primary:event:deep",
      calendarId: "primary",
      eventId: "deep",
      expectedStart: "2026-08-29T09:00:00.000Z",
      expectedEnd: "2026-08-29T10:30:00.000Z",
      targetStart: "2026-08-29T10:30:00.000Z",
      targetEnd: "2026-08-29T12:00:00.000Z",
      durationMinutes: 90,
      observedAt,
    });
  });

  it("fails closed when the source changed or target is newly occupied", () => {
    const valid = validateCalendarAdviceForAct({
      adviceReference: advice(),
      evidence: evidence(),
      window,
      now: new Date("2026-08-29T07:32:00.000Z"),
    });
    if (!valid.calendarMoveProposalReference) throw new Error("proposal");

    const proposal = resolveCalendarMoveProposalReference(
      valid.calendarMoveProposalReference,
    )!;

    const changedSource = evidence();
    const changed = Object.freeze({
      ...changedSource,
      conflictEvents: Object.freeze(
        changedSource.conflictEvents!.map(event =>
          event.commitmentReference.endsWith(":deep")
            ? Object.freeze({
                ...event,
                end: "2026-08-29T10:45:00.000Z",
              })
            : event,
        ),
      ),
    });
    expect(
      validateCalendarMoveProposalAgainstEvidence({
        proposal,
        evidence: changed,
        window,
      }).status,
    ).toBe("current_situation_changed");

    const occupied = evidence([
      Object.freeze({
        commitmentReference:
          "google-calendar:calendar:primary:event:blocker",
        title: "hidden",
        start: "2026-08-29T11:00:00.000Z",
        end: "2026-08-29T11:30:00.000Z",
        calendarName: "Private",
        timeMode: null,
        selfAttendeeResponse: null,
        observedAt,
        provenanceReference: "blocker#provenance",
      }),
    ]);
    expect(
      validateCalendarMoveProposalAgainstEvidence({
        proposal,
        evidence: occupied,
        window,
      }).status,
    ).toBe("target_occupied");
  });
});
