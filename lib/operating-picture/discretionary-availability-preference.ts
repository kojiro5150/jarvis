import type { DurablePurposeProjectionResult } from "./purpose-projection-retrieval";
import { retrieveDurableOperatingPictureForPurpose } from "./purpose-projection-retrieval";
import { createSupabaseOperatingPicturePersistence, loadSupabaseOperatingPictureConfig } from "./supabase-persistence";
import { MODEL_CONTINUITY_PURPOSE } from "./model-continuity-contract";

export const DISCRETIONARY_AVAILABILITY_STATEMENT =
  "my discretionary work-availability window is Monday to Friday, 6:00 PM to 9:00 PM. Weekends are excluded by default and included only when I explicitly request them.";
export const DISCRETIONARY_WEEKEND_AVAILABILITY_STATEMENT =
  "my discretionary weekend work-availability window is Saturday and Sunday, 8:00 AM to 6:00 PM.";

export type DiscretionaryAvailabilityPreference = Readonly<{
  timeZone: "Australia/Melbourne";
  weekdays: readonly [1, 2, 3, 4, 5];
  startHour: 18;
  endHour: 21;
  weekendPolicy: "explicit_only";
  weekendStartHour: 8 | null;
  weekendEndHour: 18 | null;
}>;

export type DiscretionaryAvailabilityPreferenceResult =
  | Readonly<{ status: "resolved"; preference: DiscretionaryAvailabilityPreference }>
  | Readonly<{ status: "missing" | "conflicting" | "unavailable" }>;

export type ProductionDiscretionaryAvailabilityPreferenceDependencies = Readonly<{
  retrieveProjection: () => Promise<DurablePurposeProjectionResult>;
}>;

const preference: DiscretionaryAvailabilityPreference = Object.freeze({
  timeZone: "Australia/Melbourne",
  weekdays: Object.freeze([1, 2, 3, 4, 5]) as readonly [1, 2, 3, 4, 5],
  startHour: 18,
  endHour: 21,
  weekendPolicy: "explicit_only",
  weekendStartHour: null,
  weekendEndHour: null,
});

function normalized(value: string): string {
  return value.normalize("NFKC").replace(/\s+/g, " ").trim().toLowerCase();
}

function statementPayload(value: unknown): string | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const entries = Object.entries(value);
  return entries.length === 1 && entries[0]?.[0] === "statement" && typeof entries[0][1] === "string"
    ? entries[0][1]
    : null;
}

export function resolveDiscretionaryAvailabilityPreference(
  projection: DurablePurposeProjectionResult,
): DiscretionaryAvailabilityPreferenceResult {
  if (projection.status === "rejected") return Object.freeze({ status: "unavailable" });
  if (projection.status === "empty") return Object.freeze({ status: "missing" });

  const candidates = projection.items.filter(item =>
    item.recoveryDisposition === "recoverable_user_continuity"
    && item.authorshipSource === "user"
    && item.semanticClass === "preference",
  );
  let conflicting = false;
  let weekendEstablished = false;
  const parsed = candidates.flatMap(item => {
    const statement = statementPayload(item.payload);
    if (statement === null) return [];
    if (normalized(statement) === normalized(DISCRETIONARY_AVAILABILITY_STATEMENT)) return [preference];
    if (normalized(statement) === normalized(DISCRETIONARY_WEEKEND_AVAILABILITY_STATEMENT)) {
      weekendEstablished = true;
      return [];
    }
    if (/\bdiscretionary\s+work-availability\s+window\b/i.test(normalized(statement))) conflicting = true;
    if (/\bdiscretionary\s+weekend\s+work-availability\s+window\b/i.test(normalized(statement))) conflicting = true;
    return [];
  });
  if (conflicting) return Object.freeze({ status: "conflicting" });
  if (parsed.length === 0) return Object.freeze({ status: "missing" });
  // V1 has one admitted envelope. Identical append-only captures agree; no
  // latest-wins inference is made over durable history.
  return Object.freeze({ status: "resolved", preference: weekendEstablished
    ? Object.freeze({ ...preference, weekendStartHour: 8 as const, weekendEndHour: 18 as const })
    : preference });
}

async function defaultProjection(): Promise<DurablePurposeProjectionResult> {
  const config = loadSupabaseOperatingPictureConfig();
  if (!config) return Object.freeze({ status: "rejected", purpose: MODEL_CONTINUITY_PURPOSE, reason: "persistence_unavailable" });
  const { durableStore } = createSupabaseOperatingPicturePersistence(config);
  return retrieveDurableOperatingPictureForPurpose(durableStore, MODEL_CONTINUITY_PURPOSE);
}

export async function resolveProductionDiscretionaryAvailabilityPreference(
  dependencies: ProductionDiscretionaryAvailabilityPreferenceDependencies = Object.freeze({ retrieveProjection: defaultProjection }),
): Promise<DiscretionaryAvailabilityPreferenceResult> {
  try {
    return resolveDiscretionaryAvailabilityPreference(await dependencies.retrieveProjection());
  } catch {
    return Object.freeze({ status: "unavailable" });
  }
}
