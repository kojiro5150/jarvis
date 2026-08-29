import { randomUUID } from "node:crypto";

export const CALENDAR_ADVICE_PREFERENCE_KIND = "prefer_keep_invitation_if_full_deep_work_preserved_later" as const;
export type CalendarAdvicePreferenceKind = typeof CALENDAR_ADVICE_PREFERENCE_KIND;

export type CalendarAdvicePreferenceReference = Readonly<{
  calendarAdvicePreferenceReferenceId: string;
}>;

type StoredPreference = Readonly<{
  id: string;
  reference: CalendarAdvicePreferenceReference;
  kind: CalendarAdvicePreferenceKind;
  createdAt: string;
}>;

const preferences = new Map<string, StoredPreference>();

function isReference(value: unknown): value is CalendarAdvicePreferenceReference {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const descriptor = Object.getOwnPropertyDescriptor(value, "calendarAdvicePreferenceReferenceId");
  return Boolean(descriptor && "value" in descriptor && typeof descriptor.value === "string" && descriptor.value.trim().length > 0);
}

export function isSupportedCalendarAdvicePreferenceUtterance(utterance: string): boolean {
  const normalized = utterance.normalize("NFKC").toLowerCase().replace(/[‘’]/g, "'").replace(/[^a-z0-9]+/g, " ").trim();
  return normalized === "i d rather keep the invitation if i can still get the full deep work block in afterwards"
    || normalized === "keep the invitation if you can preserve all the deep work later";
}

export function createCalendarAdvicePreferenceReference(now: Date = new Date()): CalendarAdvicePreferenceReference | null {
  if (Number.isNaN(now.getTime())) return null;
  const id = randomUUID();
  const reference = Object.freeze({ calendarAdvicePreferenceReferenceId: id });
  preferences.set(id, Object.freeze({ id, reference, kind: CALENDAR_ADVICE_PREFERENCE_KIND, createdAt: now.toISOString() }));
  return reference;
}

export function resolveCalendarAdvicePreferenceReference(reference: unknown): Readonly<{ kind: CalendarAdvicePreferenceKind; createdAt: string }> | null {
  if (!isReference(reference)) return null;
  const stored = preferences.get(reference.calendarAdvicePreferenceReferenceId);
  return stored ? Object.freeze({ kind: stored.kind, createdAt: stored.createdAt }) : null;
}