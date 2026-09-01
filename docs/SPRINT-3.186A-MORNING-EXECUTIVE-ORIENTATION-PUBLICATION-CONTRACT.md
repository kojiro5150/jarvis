# Sprint 3.186A — Morning Executive Orientation Publication Contract

**Status:** Contract implementation for review  
**Baseline:** merged Sprint 3.186 audit / PR #505 (`51fc51a533bbfa975ae1128f44377e3c58dddcc7`)  
**Production acquisition changed:** No  
**Chat/runtime wiring changed:** No

## Purpose

Freeze the first typed publication boundary for:

> **Give me my morning brief.**

This sprint does not build the brief, read Calendar, ask for authority, render prose, call a model, or wire the chat route.

It defines the exact Level-1 object that later code is allowed to construct.

## Capability level

Morning Brief v1 remains **Level 1 — Know**.

The publication may contain only factual orientation already supported by governed Calendar surfaces:

- today’s timed commitments from the closed factual Calendar projection;
- this week’s already-governed descriptive allocation publication;
- exact source/window/observation coverage metadata;
- explicit limitations describing capabilities deliberately not performed.

It may not contain ranking, importance, urgency, schedule adequacy, recommendation, advice, remembered context, Gmail/Drive synthesis, action proposals, or model-authored narrative.

## Typed publication

`lib/governed-conversation/morning-executive-orientation-contract.ts` defines:

~~~text
MorningExecutiveOrientationBrief
  kind = morning_executive_orientation_brief
  schemaVersion = 1.0.0
  semantics = factual_orientation_not_priority_or_advice
  observedAt
  timeZone = Australia/Melbourne
  coverage
    sourceId = google-calendar
    state = bounded_complete_request
    windowStart
    windowEnd
    observedAt
  today
    period = today
    windowStart
    windowEnd
    timedCommitments[] = GovernedCalendarFactualEvent
  weeklyCapacity
    period = this_week
    allocation = GovernedWeeklyCalendarAllocationPublication(this_week)
  limitations[]
~~~

The contract reuses existing governed publications rather than creating alternative Calendar fact or allocation types.

## Exact admitted factual day fields

Each `today.timedCommitments[]` item is exactly the existing `GovernedCalendarFactualEvent` shape:

- `title`
- `start`
- `end`
- `calendarName`

Provider IDs, labels, `timeMode`, attendee state, recurrence metadata, status and raw provider objects are not admitted into this section.

The weekly allocation remains the existing governed allocation artefact rather than being copied into a weaker summary shape.

## Coverage rule

The first complete Morning Brief publication has one source coverage state only:

> `bounded_complete_request`

This does not mean every Calendar fact exists in the brief. It means the later assembler may claim this bounded orientation only when the acquisition that supports it satisfies the existing completeness contract.

Partial, legacy-bounded, unavailable or malformed acquisition must not be coerced into this publication. The fail-closed construction behaviour belongs to Sprint 3.186B.

## Supported-change decision

The audit allowed attention/change composition only after the factual brief is live, unless reuse can be proven safe.

Sprint 3.186A therefore **does not include a `supportedChanges` field**.

The limitation vocabulary includes:

`supported_change_comparison_not_included`

This prevents a later renderer from turning absence of a comparison into “no changes”. Sprint 3.186D may widen the publication only through an explicit versioned contract.

## Explicit limitation vocabulary

The first publication may declare only:

- `supported_change_comparison_not_included`
- `priority_not_assessed`
- `schedule_adequacy_not_assessed`
- `recommendation_not_produced`
- `continuity_not_included`
- `cross_source_synthesis_not_included`

These are scope statements, not hidden recommendations or evaluations.

## Compile-time containment

`morning-executive-orientation-contract.typecheck.ts` proves that the publication has no type slots named for:

- priority;
- urgency;
- recommendation;
- continuity;
- Gmail;
- Drive;
- supported changes.

It also proves that provider identity, `timeMode`, and attendee state cannot inhabit the factual day-item surface.

The purpose is not to claim TypeScript alone guarantees behaviour. It prevents later implementation from accidentally treating these excluded concepts as ordinary fields of the v1 contract.

## Authority

None added.

This contract is non-authoritative. It creates no Calendar read permission and contains no authority evidence.

Sprint 3.186C must separately bind `calendar_morning_brief` to the existing server-owned Calendar authority path.

## Model boundary

No model-facing type or model context is introduced.

Calendar titles remain admissible only through the existing deterministic factual projection. This sprint creates no route by which they enter ordinary model history or model reasoning.

## Non-goals

- no assembler;
- no renderer;
- no Calendar acquisition;
- no pending authorization;
- no `/api/lighter/chat` integration;
- no attention comparison;
- no continuity retrieval;
- no Gmail or Drive;
- no recommendation;
- no adequacy policy;
- no full EOS activation;
- no voice-specific behaviour.

## Next step

**Sprint 3.186B — deterministic assembler and renderer.**

It may construct this exact publication only from synthetic/already-governed inputs, validate timestamp/window/arithmetic/coverage consistency, and render fixed factual prose. It must still make no production acquisition or authority changes.

## Exit condition

> The repository has one closed, typed, Level-1 Morning Executive Orientation publication whose admitted fields cannot silently widen factual Calendar orientation into priority, advice, ambient memory, cross-source synthesis, or action.
