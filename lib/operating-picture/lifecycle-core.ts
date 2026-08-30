import type {
  OperatingPictureLifecycle,
  OperatingPictureRecord,
} from "./record-core";

export const OPERATING_PICTURE_ALLOWED_LIFECYCLE_TRANSITIONS = Object.freeze({
  current: Object.freeze(["stale", "superseded", "withdrawn"] as const),
  stale: Object.freeze(["superseded", "withdrawn"] as const),
  superseded: Object.freeze([] as const),
  withdrawn: Object.freeze([] as const),
});

export function canTransitionOperatingPictureLifecycle(
  from: OperatingPictureLifecycle,
  to: OperatingPictureLifecycle,
): boolean {
  return (OPERATING_PICTURE_ALLOWED_LIFECYCLE_TRANSITIONS[from] as readonly OperatingPictureLifecycle[])
    .includes(to);
}

export type StaleOperatingPictureRecord<R extends OperatingPictureRecord> =
  Omit<R, "lifecycle"> & Readonly<{ lifecycle: "stale" }>;

export type OperatingPictureStalenessResult<R extends OperatingPictureRecord> =
  | Readonly<{
      status: "transitioned";
      record: StaleOperatingPictureRecord<R>;
      transition: Readonly<{
        from: "current";
        to: "stale";
        basis: "explicit_stale_after_elapsed";
        evaluatedAt: string;
        staleAfter: string;
      }>;
    }>
  | Readonly<{
      status: "unchanged";
      reason: "not_current" | "no_stale_after" | "before_stale_after";
      record: R;
    }>
  | Readonly<{
      status: "invalid";
      reason: "invalid_evaluated_at" | "invalid_stale_after";
      record: R;
    }>;

function parseInstant(value: string): number | null {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * OPERATING-PICTURE-03 / OPERATING-PICTURE-08:
 * This is the only generic lifecycle transition currently implemented.
 * Staleness is derived solely from an explicit record-owned staleAfter boundary.
 *
 * Supersession and withdrawal intentionally have no generic mutator here:
 * they require a later source-/user-specific proof boundary establishing why
 * that semantic transition is true.
 */
export function evaluateOperatingPictureStaleness<R extends OperatingPictureRecord>(
  record: R,
  evaluatedAt: string,
): OperatingPictureStalenessResult<R> {
  if (record.lifecycle !== "current") {
    return Object.freeze({ status: "unchanged", reason: "not_current", record });
  }
  if (!record.staleAfter) {
    return Object.freeze({ status: "unchanged", reason: "no_stale_after", record });
  }

  const evaluatedAtMs = parseInstant(evaluatedAt);
  if (evaluatedAtMs === null) {
    return Object.freeze({ status: "invalid", reason: "invalid_evaluated_at", record });
  }

  const staleAfterMs = parseInstant(record.staleAfter);
  if (staleAfterMs === null) {
    return Object.freeze({ status: "invalid", reason: "invalid_stale_after", record });
  }

  if (evaluatedAtMs < staleAfterMs) {
    return Object.freeze({ status: "unchanged", reason: "before_stale_after", record });
  }

  const transitioned = Object.freeze({
    ...record,
    lifecycle: "stale" as const,
  }) as StaleOperatingPictureRecord<R>;

  return Object.freeze({
    status: "transitioned",
    record: transitioned,
    transition: Object.freeze({
      from: "current",
      to: "stale",
      basis: "explicit_stale_after_elapsed",
      evaluatedAt,
      staleAfter: record.staleAfter,
    }),
  });
}
