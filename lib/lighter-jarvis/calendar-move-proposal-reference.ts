import { randomUUID } from "node:crypto";

export type CalendarMoveProposalReference = Readonly<{ calendarMoveProposalReferenceId: string }>;

export type CalendarMoveProposalSnapshot = Readonly<{
  commitmentReference: string;
  calendarId: string;
  eventId: string;
  expectedStart: string;
  expectedEnd: string;
  targetStart: string;
  targetEnd: string;
  durationMinutes: number;
  observedAt: string;
}>;

const proposals = new Map<string, CalendarMoveProposalSnapshot>();

function refId(value: unknown): string | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const d = Object.getOwnPropertyDescriptor(value, "calendarMoveProposalReferenceId");
  return d && "value" in d && typeof d.value === "string" && d.value.trim() ? d.value : null;
}

export function createCalendarMoveProposalReference(snapshot: CalendarMoveProposalSnapshot): CalendarMoveProposalReference {
  const id = randomUUID();
  proposals.set(id, Object.freeze({ ...snapshot }));
  return Object.freeze({ calendarMoveProposalReferenceId: id });
}

export function resolveCalendarMoveProposalReference(reference: unknown): CalendarMoveProposalSnapshot | null {
  const id = refId(reference);
  const snapshot = id ? proposals.get(id) : null;
  return snapshot ? Object.freeze({ ...snapshot }) : null;
}