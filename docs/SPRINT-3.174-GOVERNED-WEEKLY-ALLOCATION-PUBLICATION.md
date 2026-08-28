# Sprint 3.174 — Governed Weekly Allocation Publication

**Status:** Implemented  
**Sprint type:** Governed publication  
**Baseline:** merged Sprint 3.173

## Purpose

Sprint 3.173 established a deterministic non-overlapping weekly allocation primitive. Its key invariant is that resolved mode minutes cannot overcount real occupied elapsed time.

Sprint 3.174 adds the publication boundary:

> publish a weekly allocation only when both arithmetic truth and Calendar coverage truth are proven.

This sprint does not yet add a user-facing weekly allocation renderer.

## Publication artefact

The governed publication is:

```text
calendar_weekly_time_allocation
schema 1.0.0
```

It carries:

```text
windowStart
windowEnd
minutesByMode
semanticUnavailableMinutes
precedenceTieMinutes
totalTimedMinutes
timedEventCount
allDayEventCount
invalidEventCount
coverageState
observedAt
```

## Arithmetic truth

The publisher independently checks:

```text
sum(minutesByMode)
+ semanticUnavailableMinutes
= totalTimedMinutes
```

within floating-point tolerance.

`precedenceTieMinutes` is already a diagnostic subset of `unclassified` and is not added again.

If the allocation does not reconcile, publication is withheld.

## Coverage truth

A weekly allocation may be published only when all of these are true:

```text
period = this_week
coverageState = bounded_complete_request
underlying completeness = complete
```

Partial acquisition, legacy bounded acquisition without completeness proof, and unavailable acquisition do not produce a weekly allocation publication.

This prevents a partial event set from being presented as "the week".

## Governed acquisition boundary

The publication is created inside the existing scoped Calendar evidence-acquisition adapter, after:

```text
authorised bounded Calendar read
        ↓
provider completeness proof
        ↓
canonical in-window Calendar events
        ↓
Sprint 3.173 allocation
        ↓
Sprint 3.174 governed publication gate
```

The production Calendar read result now preserves the optional governed weekly allocation publication for later deterministic rendering.

## Frozen invariants

1. No weekly publication without an explicitly bounded `this_week` operation.
2. No weekly publication from partial coverage.
3. No weekly publication from legacy bounded coverage without completeness proof.
4. No weekly publication if arithmetic does not reconcile.
5. `semanticUnavailableMinutes` remains distinct from `unclassified`.
6. `precedenceTieMinutes` remains inspectable and is not double-counted.
7. Sprint 3.173 overlap precedence remains unchanged.
8. No model inference.
9. No targets or adequacy judgments.
10. No recommendations.
11. No Calendar writes.

## Regression proof

Tests prove:

- complete weekly acquisition produces a governed allocation publication;
- the Barwon-style 7-hour routine block plus 1-hour self-care carve-out publishes as 6h + 1h = 7h;
- partial weekly coverage withholds publication;
- legacy bounded coverage withholds publication;
- non-weekly periods do not publish;
- arithmetic mismatch fails closed;
- tie minutes do not get counted twice;
- the publication survives the real production Calendar authority/acquisition path.

## Authority

Unchanged.

The publication consumes only already-authorised Calendar evidence.

It creates no permission, performs no write, and does not reuse authority.

## Non-goals

Sprint 3.174 does not add:

- a conversational weekly allocation response;
- percentages;
- targets;
- schedule-quality scoring;
- protected-time adequacy;
- recommendations;
- schedule proposals;
- Calendar writes;
- model interpretation.

## Next step

The next bounded sprint may add a deterministic renderer for an explicitly authorised weekly-allocation question such as:

> How is my week allocated?

The renderer must publish only the governed artefact produced here and must preserve both arithmetic and coverage truth.

## Exit condition

```text
complete authorised this-week Calendar acquisition
        ↓
Sprint 3.173 resolved allocation
        ↓
arithmetic reconciliation passes
        +
coverage completeness passes
        ↓
governed weekly allocation publication

anything partial / unreconciled
        ↓
no weekly allocation publication
```
