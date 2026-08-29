import { acquireScopedCalendarEvidence, type ScopedCalendarAcquisitionPort } from "../governed-conversation/scoped-calendar-evidence-acquisition-adapter";
import type { CalendarEventWritePort } from "../connectors/google/calendar-write";
import { resolveCalendarMoveAuthorization } from "./calendar-move-authorization";
import { resolveCalendarReadWindow } from "./calendar-read-window";
import { validateCalendarMoveProposalAgainstEvidence } from "./calendar-conflict-act";

export type CalendarMoveExecutionResult = Readonly<{
  status:
    | "resolved"
    | "declined"
    | "invalid_authorization"
    | "prewrite_diverged"
    | "write_scope_missing"
    | "write_failed"
    | "verification_failed";
  reply: string;
}>;

const melbourneTime = new Intl.DateTimeFormat("en-AU", {
  timeZone: "Australia/Melbourne",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

function formatTime(value: string): string {
  return melbourneTime
    .format(new Date(value))
    .replace(/\b(am|pm)\b/gi, value => value.toUpperCase());
}

export async function executeConfirmedCalendarMove(input: {
  readonly authorizationReference: unknown;
  readonly currentUserUtterance: string;
  readonly readConnector: ScopedCalendarAcquisitionPort;
  readonly writeConnector: CalendarEventWritePort;
  readonly clock: () => Date;
}): Promise<CalendarMoveExecutionResult> {
  const authority = resolveCalendarMoveAuthorization({
    reference: input.authorizationReference,
    utterance: input.currentUserUtterance,
  });

  if (authority.status === "declined") {
    return Object.freeze({
      status: "declined",
      reply: "Understood. I won't change your Calendar.",
    });
  }
  if (authority.status !== "confirmed" || !authority.proposal) {
    return Object.freeze({
      status: "invalid_authorization",
      reply:
        "I don't have a valid unconsumed confirmation for that exact Calendar change.",
    });
  }

  if (!(await input.writeConnector.hasWriteScope())) {
    return Object.freeze({
      status: "write_scope_missing",
      reply:
        "Calendar write access is not active in the stored Google grant. Please reconnect Google before I can make this change.",
    });
  }

  const window = resolveCalendarReadWindow("today", input.clock());
  const prewrite = await acquireScopedCalendarEvidence({
    connector: input.readConnector,
    clock: input.clock,
    requestedLimit: 100,
    window,
  });
  const validation = validateCalendarMoveProposalAgainstEvidence({
    proposal: authority.proposal,
    evidence: prewrite,
    window,
  });

  if (validation.status !== "resolved") {
    return Object.freeze({
      status: "prewrite_diverged",
      reply:
        "The Calendar changed after your confirmation, so I did not perform the move. A fresh recommendation is required.",
    });
  }

  let writeResult;
  try {
    writeResult = await input.writeConnector.moveEvent(
      authority.proposal.calendarId,
      authority.proposal.eventId,
      authority.proposal.targetStart,
      authority.proposal.targetEnd,
    );
  } catch {
    return Object.freeze({
      status: "write_failed",
      reply: "The exact Calendar change was not completed.",
    });
  }

  if (!writeResult.ok) {
    return Object.freeze({
      status: "write_failed",
      reply: "The exact Calendar change was not completed.",
    });
  }

  let verified;
  try {
    verified = await input.writeConnector.readEvent(
      authority.proposal.calendarId,
      authority.proposal.eventId,
    );
  } catch {
    verified = null;
  }

  const durationMs = authority.proposal.durationMinutes * 60_000;
  const verificationPassed = Boolean(
    verified &&
      verified.source === "google" &&
      verified.calendarId === authority.proposal.calendarId &&
      verified.id === authority.proposal.eventId &&
      Date.parse(verified.start) === Date.parse(authority.proposal.targetStart) &&
      Date.parse(verified.end) === Date.parse(authority.proposal.targetEnd) &&
      Date.parse(verified.end) - Date.parse(verified.start) === durationMs,
  );

  if (!verificationPassed) {
    return Object.freeze({
      status: "verification_failed",
      reply:
        "The Calendar write was attempted, but I could not verify the exact final state, so I won't claim completion.",
    });
  }

  return Object.freeze({
    status: "resolved",
    reply: `Done — the deep-work block is now ${formatTime(
      authority.proposal.targetStart,
    )}–${formatTime(
      authority.proposal.targetEnd,
    )}, verified against Google Calendar.`,
  });
}
