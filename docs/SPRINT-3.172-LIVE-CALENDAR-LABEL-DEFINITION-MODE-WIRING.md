# Sprint 3.172 — Live Calendar Label Definition Mode Wiring

**Status:** Implemented  
**Sprint type:** Live semantic connector wiring  
**Baseline:** merged Sprint 3.171

## Purpose

Sprint 3.170 proved native `eventLabelId` acquisition against the real Google account.

Sprint 3.171 implemented the deterministic governed mapping contract:

```text
explicit supported label definition
        ↓
native provider label id
        ↓
closed CalendarTimeMode
```

Sprint 3.172 connects those two already-proven seams in the production Google Calendar read path.

The proving question is:

> Can an authorised real Calendar read resolve a provider label definition and deterministically classify a labelled event without inferring semantics from title, color, or silence?

## Google primitive

Google exposes custom event-label definitions on the Calendar resource:

```text
GET /calendar/v3/calendars/{calendarId}
        ↓
labelProperties.eventLabels[]
        ↓
{id, name, backgroundColor}
```

Events continue to carry only the stable provider identity:

```text
event.eventLabelId
```

The live connector now uses both facts together.

## Production flow

For each calendar target:

```text
authorised bounded events.list
        ↓
eventLabelVersion=1
        ↓
normalized events
        ↓
any event has eventLabelId?
   no  → retain existing event path
   yes → read that calendar's label definitions
        ↓
resolveCalendarEventLabelModeMap()
        ↓
classifyCalendarEventTimeMode()
        ↓
CalendarEvent.timeMode
```

No label-definition fetch is performed for a calendar whose returned bounded events carry no `eventLabelId`.

## Canonical event field

`CalendarEvent` now permits:

```ts
timeMode?: CalendarTimeMode;
```

The optionality is deliberate.

### Successful label-definition acquisition

When provider label definitions are available, every returned event in that calendar batch receives a deterministic `timeMode`:

- supported explicit label → governed mode;
- absent event label → `unclassified`;
- unknown/unmapped event label → `unclassified`.

### Label-definition acquisition unavailable

If labelled events are observed but the Calendar resource cannot be read, the connector preserves `eventLabelId` but does **not** manufacture a semantic result:

```text
eventLabelId = present
timeMode = undefined
```

This is intentionally distinct from:

```text
timeMode = "unclassified"
```

The latter means the semantic resolver ran with real label definitions and found no supported classification. The former means the semantic evidence required to classify was unavailable.

A 401 remains an authentication failure and propagates through the existing typed Google auth boundary.

## Frozen invariants

1. Calendar authority is unchanged.
2. The bounded Calendar window is unchanged.
3. `eventLabelVersion=1` remains explicit on the event request.
4. Event label identity remains provider evidence.
5. Calendar label names are the human-governed semantic vocabulary.
6. Provider label IDs are the event-level machine identity.
7. Event titles never determine mode.
8. Calendar default colors never determine mode.
9. Event-label colors never determine mode.
10. Absence of `eventLabelId` becomes `unclassified` only when label definitions were successfully resolved for that calendar batch.
11. Label-definition acquisition failure must remain visibly distinct from `unclassified`.
12. No model reasoning participates in classification.

## Tests

Connector tests prove:

- the label-aware event request still sends `eventLabelVersion=1`;
- a native `eventLabelId` is preserved;
- the real Calendar resource endpoint is called when labelled events are present;
- an exact supported provider label definition resolves to the expected governed mode;
- if label-definition acquisition returns a provider error, `eventLabelId` survives but `timeMode` remains undefined.

Existing tests without event labels keep their previous request shape; the connector does not add an unnecessary Calendar-resource call to those bounded reads.

## Authority

No authority changes.

This sprint does not:

- manufacture or reuse Calendar permission;
- add Calendar writes;
- relabel events;
- move or reschedule events;
- rank modes;
- determine an optimal balance;
- make recommendations.

It enriches already-authorised read evidence only.

## Non-goals

Sprint 3.172 does not implement:

- weekly allocation reporting;
- duration aggregation by mode;
- fragmented-time analysis;
- protected-time adequacy rules;
- self-care absence alerts;
- schedule proposals;
- Calendar writes;
- automatic relabelling;
- semantic inference from event title or color;
- conversational publication of time modes.

## Live acceptance

After merge, the real-account acceptance check is intentionally no-file-change:

```bash
node --env-file=.env.local --import tsx -e '
import { GoogleCalendarConnector } from "./lib/connectors/google/calendar.ts";

const c = new GoogleCalendarConnector();
const start = new Date();
const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);

const result = await c.listBetweenWithCompleteness(
  start.toISOString(),
  end.toISOString(),
  20
);

console.log(result.events.map(e => ({
  title: e.title,
  eventLabelId: e.eventLabelId,
  timeMode: e.timeMode
})));
'
```

A labelled event with one of the governed Google label definitions should produce a non-empty `eventLabelId` and the corresponding deterministic `timeMode`.

An unlabelled event should produce `timeMode: "unclassified"` only when its calendar's label definitions were successfully resolved as part of a batch containing labelled events.

## Next step

Only after this live semantic seam is proven should the next sprint begin schedule-level cognition.

The next product question is:

> How is my week actually allocated across routine work, deep work/discovery, reflection, development, self-care and genuinely unclassified time?

That next stage should aggregate deterministic event durations. It must not yet judge whether the balance is good or bad, set targets, or recommend changes.

## Exit condition

Sprint 3.172 exits when:

```text
authorised bounded Google Calendar read
        ↓
native eventLabelId
        +
provider Calendar label definition
        ↓
deterministic CalendarTimeMode
        ↓
no title/color/silence inference
```

with missing semantic evidence remaining distinguishable from a legitimate `unclassified` result.
