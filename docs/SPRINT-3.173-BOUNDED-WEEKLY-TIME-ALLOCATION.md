# Sprint 3.173 — Bounded Weekly Time Allocation

**Status:** Implemented  
**Sprint type:** Deterministic descriptive aggregation  
**Baseline:** merged Sprint 3.172

## Purpose

Sprint 3.172 proved that authorised Google Calendar events can carry deterministic governed `timeMode` values derived from native `eventLabelId` plus the provider's real label definitions.

Sprint 3.173 moves one level up:

> deterministically resolve overlapping timed Calendar events into one bounded weekly allocation by governed time mode.

This sprint is descriptive only.

It does **not** judge whether the balance is good or bad, compare it with a target, rank modes, recommend changes, or write to Calendar.

## Real-use requirement

The operator may deliberately represent a broad day-job block, for example:

```text
Barwon Health
09:00–16:00
routine
```

while also recording more specific use of time inside that block:

```text
Lunch break
12:00–13:00
self_care
```

Naively summing both events would report eight scheduled hours across a seven-hour real interval.

That is not an honest cognitive-capacity allocation.

Sprint 3.173 therefore resolves overlaps before assigning minutes.

## Most-specific-wins policy

"Most specific wins" is defined operationally as:

> For every atomic interval covered by one or more timed events, the active event with the shortest total event duration receives that interval.

Shorter total duration is an explicit deterministic proxy for specificity. It is not treated as a universal truth about calendars.

The algorithm forms atomic intervals from every clipped event start/end boundary, then resolves each interval independently.

```text
all event boundaries
        ↓
atomic non-overlapping intervals
        ↓
active events in each interval
        ↓
minimum total event duration
        ↓
one shortest event? → its mode wins
equal shortest tie? → unclassified
```

## Worked example

```text
Barwon Health (routine), 09:00–16:00, 7 hours
Lunch break (self_care), 12:00–13:00, 1 hour

Result:
  routine:   09:00–12:00 and 13:00–16:00 → 6 hours
  self_care: 12:00–13:00                 → 1 hour
```

The result sums to the seven real occupied hours, not eight scheduled-event hours.

## Partial overlap

Full containment is not required.

Example:

```text
routine:   09:00–12:00, 3 hours
deep_work: 11:00–13:00, 2 hours
```

The two-hour event wins the overlapping 11:00–12:00 slice.

Result:

```text
routine:   09:00–11:00 → 2 hours
deep_work: 11:00–13:00 → 2 hours
```

## Equal-duration ties

If two or more active events share the same shortest total duration, the overlapping slice fails closed to:

```text
unclassified
```

The implementation also reports:

```text
precedenceTieMinutes
```

so this ambiguity remains inspectable rather than disappearing into the broader unclassified bucket.

No iteration-order winner is permitted.

## Three or more overlapping events

The atomic-interval algorithm generalizes directly.

For each interval, the unique shortest active event wins.

If multiple active events tie for shortest duration, that interval becomes `unclassified` regardless of how many longer events are also present.

No pairwise cascading or arbitrary ordering is used.

## Output vocabulary

The aggregator reports minute totals for:

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
precedenceTieMinutes
```

That distinction matters because:

```text
timeMode = "unclassified"
```

means the governed semantic resolver produced the explicit fallback, while:

```text
timeMode = undefined
```

means semantic evidence required for classification was unavailable.

Those states must not be collapsed.

## Bounded duration semantics

Timed events are clipped to the authorised allocation window before interval resolution.

```text
clippedStart = max(event.start, window.start)
clippedEnd   = min(event.end, window.end)
```

An event wholly outside the window contributes nothing.

Specificity precedence still uses the event's original total duration, not its clipped duration. A broad event crossing a weekly boundary does not become artificially "specific" merely because only a short portion lies inside the requested window.

Malformed, zero-duration, or reversed timed events are excluded and counted as invalid.

## All-day events

Date-only all-day events are excluded from minute totals and reported separately by count.

A date-only Calendar event does not itself evidence a cognitive-capacity duration.

Treating an all-day event as 24 hours of routine, deep work, self-care, or any other mode would manufacture duration the provider did not supply.

## Deterministic output

`CalendarTimeAllocation` contains:

```ts
{
  windowStart,
  windowEnd,
  minutesByMode,
  semanticUnavailableMinutes,
  precedenceTieMinutes,
  totalTimedMinutes,
  timedEventCount,
  allDayEventCount,
  invalidEventCount
}
```

`totalTimedMinutes` is resolved occupied timed-event duration after overlap precedence, not the sum of raw event durations.

## Frozen invariants

1. The window must be valid and bounded.
2. Timed intervals are clipped to that window.
3. Only timed-event intervals contribute minutes.
4. All-day events do not manufacture 24-hour duration.
5. `unclassified` and semantic unavailability remain distinct.
6. Missing `timeMode` never becomes routine.
7. For any atomic interval, at most one mode receives the elapsed time.
8. The unique shortest-duration active event wins the interval.
9. Equal-shortest ties become `unclassified`.
10. Tie minutes remain separately inspectable.
11. Partial overlaps and three-way overlaps use the same atomic rule.
12. Reported resolved duration cannot exceed real occupied elapsed time.
13. No title inference.
14. No color inference.
15. No model inference.
16. No ranking.
17. No adequacy judgment.
18. No Calendar write authority.

## Regression proof

Tests prove:

- deterministic minute aggregation by mode;
- semantic unavailability remains separate from explicit `unclassified`;
- intervals are clipped to the bounded window;
- a one-hour self-care event carves one hour out of a seven-hour routine Barwon block;
- partial overlaps use shorter-duration precedence;
- equal-shortest overlaps fail closed to `unclassified`;
- tie duration is separately surfaced;
- three-way overlaps resolve from the unique shortest active event;
- resolved mode minutes plus semantic-unavailable minutes equal real occupied timed duration;
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
- working-hours assumptions;
- recommendations;
- automatic schedule proposals;
- Calendar writes;
- model interpretation.

Overlap precedence is allocation semantics, not a recommendation about how the operator should schedule time.

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
atomic interval resolution
        ↓
unique shortest-duration active event wins
equal-shortest tie → unclassified
        ↓
one non-overlapping allocation
        ↓
minutes by governed time mode
        +
semantic-unavailable minutes
        +
precedence-tie minutes
        +
all-day / invalid counts
```

with no double counting, adequacy judgment, or recommendation.
