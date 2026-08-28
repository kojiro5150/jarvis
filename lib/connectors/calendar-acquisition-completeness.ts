import type { CalendarEvent } from "./calendar-event";

export type CalendarAcquisitionCompleteness =
  | "complete"
  | "partial"
  | "unavailable";

export type CalendarTargetAcquisitionStatus =
  | "complete"
  | "partial"
  | "unavailable";

export type CalendarAcquisitionContinuation =
  | "none"
  | "present"
  | "unknown";

export type CalendarTargetDiscovery =
  | "calendar_list"
  | "primary_fallback";

export type CalendarAcquisitionTargetRecord = Readonly<{
  calendarId: string;
  status: CalendarTargetAcquisitionStatus;
  returnedCount: number;
  continuation: CalendarAcquisitionContinuation;
}>;

export type CalendarAcquisitionCompletenessEnvelope = Readonly<{
  sourceId: "google-calendar";
  windowStart: string;
  windowEnd: string;
  requestedLimit: number;
  targetDiscovery: CalendarTargetDiscovery;
  targetCount: number;
  targets: readonly CalendarAcquisitionTargetRecord[];
  mergedReturnedCount: number;
  mergeTruncated: boolean;
  completeness: CalendarAcquisitionCompleteness;
  observedAt: string;
}>;

export type CalendarAcquisitionResult = Readonly<{
  events: readonly CalendarEvent[];
  completeness: CalendarAcquisitionCompletenessEnvelope;
}>;

export function deriveCalendarAcquisitionCompleteness(input: {
  readonly targetDiscovery: CalendarTargetDiscovery;
  readonly targets: readonly CalendarAcquisitionTargetRecord[];
  readonly mergeTruncated: boolean;
}): CalendarAcquisitionCompleteness {
  if (input.targets.length === 0) return "unavailable";

  const anyTrustworthyTarget = input.targets.some(target =>
    target.status === "complete" || target.status === "partial");

  if (!anyTrustworthyTarget) return "unavailable";

  const complete =
    input.targetDiscovery === "calendar_list" &&
    input.targets.every(target =>
      target.status === "complete" && target.continuation === "none") &&
    input.mergeTruncated === false;

  return complete ? "complete" : "partial";
}
