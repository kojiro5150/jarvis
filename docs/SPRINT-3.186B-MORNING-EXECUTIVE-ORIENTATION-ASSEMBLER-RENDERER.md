# Sprint 3.186B — Morning Executive Orientation Deterministic Assembler and Renderer

**Status:** Implementation for review  
**Baseline:** merged Sprint 3.186A / PR #506 (`49eecd1bde8f293a3409bc0c45ede4f5e2aa1cf2`)  
**Production acquisition changed:** No  
**Authority changed:** No  
**Chat/runtime wiring changed:** No

## Purpose

Implement the next bounded step after the Morning Executive Orientation publication contract:

> construct and deterministically render the exact v1 Morning Brief from synthetic/already-governed Calendar inputs.

This sprint still does not acquire Calendar data, ask for authority, create pending authorisation, wire `/api/lighter/chat`, call a model, compare attention observations, retrieve continuity, use Gmail/Drive, recommend, judge adequacy, act, or activate the full EOS.

## Assembler

`lib/governed-conversation/morning-executive-orientation-assembler.ts` constructs only the existing:

`MorningExecutiveOrientationBrief`

It fails closed unless all of the following remain true:

- `observedAt` is a valid zoned/UTC timestamp;
- source coverage is exactly `google-calendar / bounded_complete_request`;
- coverage start/end form a valid bounded window;
- coverage observation time equals the brief observation time;
- the day window is valid and lies inside the bounded weekly coverage;
- each factual event has non-empty title/calendar name, valid start/end timestamps, and overlaps the admitted day window;
- the weekly publication is exactly `calendar_weekly_time_allocation / 1.0.0`;
- the weekly policy reference remains the governed v1 policy;
- the weekly publication is `this_week`;
- weekly source and coverage remain complete;
- weekly window exactly equals Morning Brief coverage;
- weekly observation time equals the Morning Brief observation time;
- all weekly mode minutes and diagnostic values are finite/non-negative;
- precedence-tie minutes cannot exceed Unclassified minutes;
- published mode minutes plus semantic-unavailable minutes reconcile to total resolved timed minutes;
- event/count diagnostics remain non-negative integers.

The assembler deterministically sorts the already-governed factual day items chronologically. It copies only the existing `title/start/end/calendarName` surface.

## Mandatory limitation set

The assembler owns the complete v1 limitation set:

- `supported_change_comparison_not_included`
- `priority_not_assessed`
- `schedule_adequacy_not_assessed`
- `recommendation_not_produced`
- `continuity_not_included`
- `cross_source_synthesis_not_included`

Callers cannot selectively omit these limitations while still obtaining a valid v1 publication.

## Renderer

`lib/lighter-jarvis/morning-executive-orientation-renderer.ts`:

- revalidates exact v1 kind/schema/semantics/time-zone/weekly-period/limitation metadata;
- re-runs assembler consistency gates before rendering;
- reuses the existing governed weekly allocation renderer rather than duplicating its arithmetic/presentation rules;
- renders today's timed commitments in deterministic Melbourne local time;
- renders an explicit bounded no-event statement when the admitted complete day window contains no timed commitments;
- renders the full mandatory limitation set;
- returns `null` on malformed/tampered input.

No model participates.

## Deliberate semantic exclusions

The renderer does not say or imply:

- top priority / importance / urgency;
- busy/light/good/bad/balanced;
- enough/insufficient protected time;
- recommendation or advice;
- nothing changed / no changes;
- remembered context;
- Gmail/Drive synthesis;
- action or proposed schedule movement.

The weekly section remains descriptive state only.

## Tests

Added focused tests for:

- exact v1 assembly;
- deterministic chronological day ordering;
- mandatory limitation preservation;
- mixed-observation rejection;
- non-`this_week` weekly rejection;
- weekly arithmetic failure;
- day-window/coverage inconsistency;
- malformed/out-of-window factual events;
- fixed deterministic prose;
- complete bounded no-event day rendering;
- absence of priority/adequacy/advice/change claims;
- renderer rejection after publication tampering.

## Authority and model boundary

None changed.

This sprint consumes only supplied already-governed artefacts. It creates no Calendar read permission, no pending authority, no provider operation, and no model-facing private context.

## Next step

**Sprint 3.186C — production Calendar composition.**

That later bounded milestone may introduce the exact `calendar_morning_brief` proposal/pending-purpose path and bind one authorised bounded Calendar acquisition to today's factual schedule plus this week's governed allocation.

It must not be smuggled into this PR.
