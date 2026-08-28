# Sprint 3.173 — Bounded Weekly Time Allocation

**Status:** Implemented  
**Sprint type:** Deterministic descriptive aggregation  
**Baseline:** merged Sprint 3.172

## Purpose

Sprint 3.172 proved that authorised Google Calendar events can carry deterministic governed `timeMode` values derived from native `eventLabelId` plus the provider's real label definitions.

Sprint 3.173 moves one level up:

> deterministically aggregate scheduled timed-event duration across a bounded weekly window by governed time mode.

This sprint is descriptive only.

It does **not** judge whether the balance is good or bad, compare it with a target, rank modes, recommend changes, or write to Calendar.

## Output vocabulary

The aggregator reports minute totals for the closed mode vocabulary:

```text
routine
deep_work
reflection
development
self_care
unclassified
```

It also reports separately:

```text
semanticUnavailableMinutes
```

That distinction is required because:

```text
timeMode = "unclassified"
```

means the governed semantic resolver ran and explicitly found no supported mode, while:

```text
timeMode = undefined
```

means the semantic evidence required for classification was unavailable.

Those states must not be collapsed.

## Bounded duration semantics

For each timed event, the aggregator clips its interval to the authorised allocation window:

```text
clippedStart = max(event.start, window.start)
clippedEnd   = min(event.end, window.end)
duration     = clippedEnd - clippedStart
```

Events wholly outside the window contribute nothing.

Malformed, zero-duration, or reversed timed events are excluded and counted as invalid rather than assigned duration.

## Overlap semantics

The output is explicitly **scheduled event-duration**, not unique occupied wall-clock time.

If two events overlap for one hour, each event contributes its own hour to its governed mode.

Therefore:

```text
sum(mode minutes)
```

may exceed the number of unique clock minutes occupied in the week.

That is deliberate. This sprint does not yet perform overlap reconciliation, double-booking analysis, fragmentation analysis, or capacity judgments.

## All-day events

Date-only all-day events are excluded from minute totals and reported separately by count.

Reason:

A date-only Calendar event does not itself evidence a cognitive-capacity duration.

Treating an all-day event as 24 hours of routine, deep work, self-care, or any other mode would manufacture a duration that Google has not supplied.

## Deterministic output

The new `CalendarTimeAllocation` contains:

```ts
{
  windowStart,
  windowEnd,
  minutesByMode,
  semanticUnavailableMinutes,
  totalTimedMinutes,
  timedEventCount,
  allDayEventCount,
  invalidEventCount
}
```

No percentages, targets, scores, recommendations, or qualitative labels are added.

## Frozen invariants

1. The window must be valid and bounded.
2. Duration is clipped to that window.
3. Only timed-event intervals contribute minutes.
4. All-day events do not manufacture 24-hour duration.
5. `unclassified` and semantic unavailability remain distinct.
6. Missing `timeMode` never becomes routine.
7. Overlapping events are counted independently as scheduled event-duration.
8. No title inference.
9. No color inference.
10. No model inference.
11. No ranking.
12. No adequacy judgment.
13. No Calendar write authority.

## Regression proof

Tests prove:

- deterministic minute aggregation by mode;
- semantic unavailability remains separate from explicit `unclassified`;
- intervals are clipped to the bounded window;
- overlapping events are counted separately;
- all-day events are counted but excluded from duration totals;
- malformed and zero-duration events contribute no duration;
- an invalid allocation window fails closed.

## Authority

No authority changes.

This sprint does not acquire Calendar data and does not create or reuse permission.

It consumes already-authorised canonical Calendar events.

## Non-goals

Sprint 3.173 does not implement:

- conversational publication;
- weekly UI;
- percentages;
- targets or thresholds;
- protected-time adequacy;
- fragmentation;
- double-booking analysis;
- working-hours assumptions;
- recommendations;
- automatic schedule proposals;
- Calendar writes;
- model interpretation.

## Next step

The next bounded sprint should publish this deterministic allocation through the existing governed Calendar evidence boundary for an explicitly authorised `this week` request.

Only after the descriptive allocation is safely published should JARVIS answer a user-facing question such as:

> How is my week allocated?

A later sprint may ask whether the mix is protecting enough deep work, reflection, development, and self-care. That would be a new policy layer and must not be smuggled into this descriptive primitive.

## Exit condition

Sprint 3.173 exits when:

```text
already-authorised canonical timed Calendar events
        ↓
bounded weekly window
        ↓
deterministic clipped event-duration
        ↓
minutes by governed time mode
        +
semantic-unavailable minutes
        +
all-day / invalid counts
```

with no adequacy judgment or recommendation.
