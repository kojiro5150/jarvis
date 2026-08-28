export type CalendarTimeMode =
  | "routine"
  | "deep_work"
  | "reflection"
  | "development"
  | "self_care"
  | "unclassified";

export type ClassifiedCalendarTimeMode = Exclude<CalendarTimeMode, "unclassified">;

export type CalendarEventLabelDefinition = Readonly<{
  id: string;
  name?: string;
  backgroundColor?: string;
}>;

/**
 * Human-governed semantic vocabulary.
 *
 * Google label IDs remain the event's stable native reference. This table
 * defines which exact user-created label names are allowed to confer a time
 * mode when their label definitions are available. Colors and event titles
 * are deliberately excluded from classification.
 */
export const CALENDAR_EVENT_LABEL_NAME_MODE_MAP = Object.freeze({
  "Routine / Transactional": "routine",
  "Deep Work / Discovery": "deep_work",
  Reflection: "reflection",
  Development: "development",
  "Self-Care": "self_care",
} satisfies Readonly<Record<string, ClassifiedCalendarTimeMode>>);

export type CalendarEventLabelModeMap = Readonly<Record<string, ClassifiedCalendarTimeMode>>;

function configuredModeForLabelName(name: string | undefined): ClassifiedCalendarTimeMode | undefined {
  if (!name) return undefined;
  return CALENDAR_EVENT_LABEL_NAME_MODE_MAP[
    name as keyof typeof CALENDAR_EVENT_LABEL_NAME_MODE_MAP
  ];
}

/**
 * Materializes the actual provider label IDs into an inspectable deterministic
 * mapping for one calendar. Unknown label names are ignored rather than
 * assigned a semantic fallback.
 */
export function resolveCalendarEventLabelModeMap(
  definitions: readonly CalendarEventLabelDefinition[],
): CalendarEventLabelModeMap {
  const entries = definitions.flatMap((definition) => {
    const mode = configuredModeForLabelName(definition.name);
    return mode ? [[definition.id, mode] as const] : [];
  });

  return Object.freeze(Object.fromEntries(entries));
}

/**
 * Classifies only from the event's explicit native label identity plus the
 * resolved human-governed label definition.
 *
 * Invariants:
 * - no eventLabelId => unclassified
 * - unknown/unmapped eventLabelId => unclassified
 * - calendar color never substitutes for mode
 * - event title never substitutes for mode
 */
export function classifyCalendarEventTimeMode(
  event: Readonly<{ eventLabelId?: string }>,
  modeMap: CalendarEventLabelModeMap,
): CalendarTimeMode {
  if (!event.eventLabelId) return "unclassified";
  return modeMap[event.eventLabelId] ?? "unclassified";
}
