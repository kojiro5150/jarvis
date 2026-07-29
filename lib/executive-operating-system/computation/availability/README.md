# Deterministic availability computation

`AvailabilityEngine` is a derived Executive Computation. It accepts a completed
`SituationalAwarenessSnapshot`; it is not a projection adapter, publication,
Situational Awareness collection, assembly component, or runtime stage.

## Constitutional semantics

- Every interval is **half-open `[start, end)`**. Adjacent intervals do not overlap.
- Comparisons use RFC 3339 instants normalized to UTC. Source timezone strings remain
  unchanged on their canonical commitments; derived intervals use `Z` timestamps.
- Occupancy is exactly the supplied positive-duration bounds (`startsAt`, `dueAt`).
  No travel, preparation, transition, workload, or other buffer is added.
- Overlap means interval intersection only. It is not called a conflict and carries
  no recommendation, priority, or attendance interpretation.
- A zero-duration commitment is explicitly non-computable and does not occupy time.
- Missing, invalid, or reversed bounds are explicit `nonComputableCommitments`; the
  engine neither invents a bound nor uses the item to assert occupancy or availability.
- The canonical `OperationalCommitment` currently has no all-day marker. Therefore an
  all-day observation cannot constitutionally be distinguished or made blocking here.
  A date-only value is not a normalized canonical timestamp and is reported as invalid.
- Cancelled/completed statuses do not change observed bounds: interpreting attendance
  or blocking meaning from status is outside this computation's constitutional remit.

The caller supplies the current instant and computation window. The same snapshot and
window always produce structurally identical output; the engine never reads system time.
Available intervals are the complement of the union of occupied intervals clipped to
the requested window. `computationTimestamp` deliberately equals `currentInstant`.

This package is deliberately not wired into Executive Runtime. Future consumers should
reuse this engine rather than independently implementing temporal semantics.
