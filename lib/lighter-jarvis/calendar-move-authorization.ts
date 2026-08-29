import { randomUUID } from "node:crypto";
import { resolveCalendarMoveProposalReference, type CalendarMoveProposalReference, type CalendarMoveProposalSnapshot } from "./calendar-move-proposal-reference";

export type CalendarMoveAuthorizationReference = Readonly<{ calendarMoveAuthorizationReferenceId: string }>;

type Pending = Readonly<{
  id: string;
  proposalReference: CalendarMoveProposalReference;
  consumed: boolean;
}>;

const pending = new Map<string, Pending>();
const YES = /^(?:yes|yes,?\s+please|confirm|confirmed|proceed|go\s+ahead)[.!]?$/i;
const NO = /^(?:no|no,?\s+thanks|decline|cancel|never\s+mind)[.!]?$/i;

function idOf(value: unknown): string | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const d = Object.getOwnPropertyDescriptor(value, "calendarMoveAuthorizationReferenceId");
  return d && "value" in d && typeof d.value === "string" && d.value.trim() ? d.value : null;
}

export function createCalendarMoveAuthorizationReference(proposalReference: CalendarMoveProposalReference): CalendarMoveAuthorizationReference {
  const id = randomUUID();
  pending.set(id, Object.freeze({ id, proposalReference, consumed: false }));
  return Object.freeze({ calendarMoveAuthorizationReferenceId: id });
}

export type CalendarMoveAuthorizationResolution = Readonly<{
  status: "confirmed" | "declined" | "not_confirmed" | "invalid" | "consumed";
  proposal: CalendarMoveProposalSnapshot | null;
}>;

export function resolveCalendarMoveAuthorization(input: { reference: unknown; utterance: string }): CalendarMoveAuthorizationResolution {
  const id = idOf(input.reference);
  const record = id ? pending.get(id) : null;
  if (!record) return Object.freeze({ status: "invalid", proposal: null });
  if (record.consumed) return Object.freeze({ status: "consumed", proposal: null });
  if (!YES.test(input.utterance) && !NO.test(input.utterance)) return Object.freeze({ status: "not_confirmed", proposal: null });
  pending.set(id!, Object.freeze({ ...record, consumed: true }));
  if (NO.test(input.utterance)) return Object.freeze({ status: "declined", proposal: null });
  const proposal = resolveCalendarMoveProposalReference(record.proposalReference);
  return proposal
    ? Object.freeze({ status: "confirmed", proposal })
    : Object.freeze({ status: "invalid", proposal: null });
}