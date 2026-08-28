# Sprint 3.170 — Calendar Event Label Acquisition Proof

**Status:** Implemented  
**Sprint type:** Connector primitive proof  
**Baseline:** merged main after Sprint 3.169 (`a70eda66c59665a7400153f235e25fc6d9438364`)

## 1. Purpose

JARVIS needs an explicit, low-friction event-level signal for how scheduled time is intended to be used without collapsing that signal into calendar/domain identity.

The chosen product mechanism is Google Calendar's native per-event label.

Sprint 3.170 proves only the acquisition primitive required for that design:

> Can the production Google Calendar connector explicitly request label-aware event data and preserve any returned native event label identity unchanged across the connector boundary?

This sprint deliberately does **not** assign labels to executive time modes.

## 2. Problem confirmed in production code

Before this sprint, the real production request was:

```ts
const params = new URLSearchParams({
  timeMin: start,
  timeMax: end,
  singleEvents: "true",
  orderBy: "startTime",
  maxResults: String(limit),
});
```

No event-label version was requested.

Therefore the production connector had no explicit contract for native event-label acquisition.

## 3. Primitive change

The production `events.list` request now adds:

```ts
eventLabelVersion: "1"
```

No other request semantics are changed.

The existing bounded time window, limit, ordering, calendar discovery, authority and acquisition-completeness behavior remain unchanged.

## 4. Opaque connector field

The connector-normalized `CalendarEvent` now permits:

```ts
eventLabelId?: string
```

The raw Google event-like shape accepts the same optional field, and `normalizeGoogleEvent()` copies it through unchanged.

The connector does not:

- interpret the label;
- map it to a time mode;
- inspect its color for meaning;
- infer meaning from the event title;
- substitute the calendar default color;
- assign a fallback semantic value.

At this boundary, `eventLabelId` is provider evidence only.

## 5. Frozen invariants for the next stage

The later governed mode-mapping stage must preserve these constraints:

1. absent event-level label identity must remain `unclassified`;
2. unknown or unmapped label identity must remain `unclassified`;
3. absence must never silently mean routine/transactional;
4. calendar default color must never substitute for event-level mode identity;
5. event title text must not be used to infer the mode;
6. calendar identity remains the domain/context dimension;
7. event label remains the separate time-use dimension.

These invariants are recorded here but are not implemented as `TimeMode` classification in Sprint 3.170.

## 6. User-defined mode vocabulary

The selected human-facing vocabulary is:

- Routine / Transactional
- Self-Care
- Reflection
- Deep Work / Discovery
- Development

The configured visual colors are currently:

```text
Routine / Transactional  #d50000
Self-Care                #ef6c00
Reflection               #0b8043
Deep Work / Discovery    #3f51b5
Development              #8e24aa
```

These colors are **not** used by Sprint 3.170 as semantic machine identifiers.

The later mapping stage should prefer stable native label identity and retain name/color only as validation or provenance metadata where appropriate.

## 7. Regression proof

Tests now prove two distinct properties:

### Outbound primitive

The real connector request URL contains:

```text
eventLabelVersion=1
```

### Inbound primitive

When Google returns:

```json
{
  "eventLabelId": "label-native-456"
}
```

the normalized `CalendarEvent` still contains exactly:

```text
eventLabelId = "label-native-456"
```

No interpretation is performed.

## 8. Authority and governance

This sprint changes no authority semantics.

The connector is still read-only and still operates only after the existing Calendar authority path has authorised the bounded read.

A returned label is evidence from the authorised source. It grants no additional authority.

## 9. Non-goals

Sprint 3.170 does not implement:

- `TimeMode`;
- label-name lookup or label-definition retrieval;
- a label-to-mode mapping table;
- weekly allocation reporting;
- fragmentation analysis;
- absence/recovery reasoning;
- priority;
- recommendations;
- Calendar writes;
- automatic relabelling;
- event movement or rescheduling;
- model interpretation.

## 10. Next step

The next bounded step is Sprint 3.171:

> Governed Calendar Event Mode Mapping

That sprint should take native label identity that has already survived the connector boundary and map only explicitly configured identities into a closed `TimeMode` vocabulary.

The mapping must be named, inspectable and testable rather than buried inside a classifier.

Unknown or absent label identities must explicitly produce `unclassified`.

## 11. Exit condition

Sprint 3.170 exits when:

```text
authorised bounded Calendar read
        ↓
production connector explicitly requests label-aware event data
        ↓
provider eventLabelId, when returned,
survives normalization unchanged
        ↓
no semantic interpretation occurs
```

A real-account acceptance check remains valuable after merge: read one already-labelled event through JARVIS and verify that the native label identity is actually returned by Google in the production environment. That live check is separate from the deterministic connector contract proved here.
