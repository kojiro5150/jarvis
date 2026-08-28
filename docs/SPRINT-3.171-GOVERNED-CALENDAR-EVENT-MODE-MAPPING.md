# Sprint 3.171 — Governed Calendar Event Mode Mapping

**Status:** Implemented  
**Sprint type:** Deterministic semantic mapping  
**Baseline:** merged Sprint 3.170

## Purpose

Sprint 3.170 proved the primitive against the real Google account:

- labelled events return native `eventLabelId` values through the production connector;
- unlabelled events return no label identity;
- the connector preserves that provider evidence unchanged.

Sprint 3.171 adds the next bounded layer:

> deterministically map only explicitly governed Google Calendar event labels into a closed executive time-mode vocabulary.

This sprint still does not calculate weekly allocation, judge the balance of the schedule, recommend changes, or write to Calendar.

## Closed time-mode vocabulary

```ts
type CalendarTimeMode =
  | "routine"
  | "deep_work"
  | "reflection"
  | "development"
  | "self_care"
  | "unclassified";
```

## Human-governed label vocabulary

Only these exact user-created label names are eligible to confer semantics:

```text
Routine / Transactional -> routine
Deep Work / Discovery   -> deep_work
Reflection              -> reflection
Development             -> development
Self-Care               -> self_care
```

The configured colors remain presentation metadata only:

```text
Routine / Transactional  #d50000
Self-Care                #ef6c00
Reflection               #0b8043
Deep Work / Discovery    #3f51b5
Development              #8e24aa
```

Color is not used as a classifier.

## Native identity and semantic resolution

Google events carry `eventLabelId`, which is the stable provider identity attached to the event.

Google calendar label definitions carry the corresponding `id`, optional `name`, and `backgroundColor`.

Sprint 3.171 separates those roles:

```text
calendar label definition
{id, exact governed name}
        ↓
resolveCalendarEventLabelModeMap()
        ↓
native label id -> governed CalendarTimeMode
        ↓
event.eventLabelId
        ↓
classifyCalendarEventTimeMode()
```

The resolver does not infer semantics from color. It materializes native label IDs only when their label definition has one of the exact human-governed names above.

This allows provider IDs to remain the event-level machine identity while keeping the semantic policy explicit, named, inspectable and testable.

## Frozen invariants

1. No `eventLabelId` means `unclassified`.
2. Unknown `eventLabelId` means `unclassified`.
3. Unknown label name is ignored.
4. No label means never silently routine.
5. Calendar default color never substitutes for event-level mode.
6. Event label background color never determines mode.
7. Event title never determines mode.
8. Calendar identity remains the domain/context dimension.
9. Event label remains the separate time-use dimension.
10. Classification is deterministic and model-free.

## Regression proof

Tests prove:

- the exact closed label-name vocabulary;
- all five supported labels resolve to their expected modes;
- a supported color with an unsupported name remains unclassified;
- a mapped native ID classifies correctly;
- absent IDs remain unclassified;
- unknown IDs remain unclassified.

The most important regression is explicit:

```text
no eventLabelId -> unclassified
```

There is no fallthrough from absence to `routine`.

## Real-account evidence inherited from Sprint 3.170

The live connector proof returned real native label identities for labelled events and `undefined` for unlabelled events.

Those observed UUIDs are intentionally **not assigned semantic modes in this sprint from event titles**. Doing so would violate the rule that titles cannot manufacture classification.

The semantic mapping instead comes from the explicit Google Calendar label definition.

## Authority

No authority changes.

This sprint:

- performs no Calendar acquisition;
- creates no Calendar authorization;
- performs no Calendar write;
- moves no event;
- changes no label;
- makes no schedule recommendation.

It classifies already-authorized provider evidence only.

## Non-goals

Sprint 3.171 does not implement:

- calendar label-definition acquisition;
- weekly allocation summaries;
- percentages or targets;
- protected-time adequacy judgments;
- fragmentation analysis;
- absence/recovery reasoning;
- ranking;
- recommendations;
- schedule proposals;
- Calendar writes;
- model inference.

## Next step

Sprint 3.172 should connect Google Calendar label definitions to this deterministic resolver in the authorised read path, then prove one real event can be classified from:

```text
eventLabelId + provider label definition -> CalendarTimeMode
```

Only after that live semantic seam is proven should JARVIS begin answering higher-level questions such as:

> How is my week looking?

The eventual product objective remains cognitive-capacity stewardship across routine work, deep work/discovery, reflection, development and self-care — not maximizing a single mode.

## Exit condition

Sprint 3.171 exits when the repository has a closed, deterministic, inspectable classification contract where:

```text
explicit supported label definition
        ↓
native provider label id
        ↓
closed CalendarTimeMode

absent / unknown / unsupported
        ↓
unclassified
```

No inference from title, color, or silence is permitted.
