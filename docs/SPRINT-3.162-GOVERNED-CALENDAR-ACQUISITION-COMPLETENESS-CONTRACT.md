# Sprint 3.162 — Governed Calendar Acquisition Completeness Contract

**Status:** Contract only  
**Sprint type:** Govern  
**Baseline:** merged main after Sprint 3.161 (`987e370fab384a3d053a0be6f890b13a997ba86f`)

## 1. Purpose

Sprint 3.161 identified one exact blocker before JARVIS may infer Calendar membership changes such as added or removed commitments:

> the production Calendar path does not preserve enough retrieval-completeness evidence to prove that an event absent from a bounded result was actually absent from the authorised Calendar window.

Sprint 3.162 governs the minimum result contract required to close that seam.

This sprint does **not** implement the connector change.

It defines what future production code must prove before it may emit:

`coverageState: "bounded_complete_request"`

## 2. Governing rule

The contract is based on one invariant:

> **Calendar membership completeness is a property of the acquisition process, not of the returned event array.**

Therefore:

- event count alone is never proof of completeness;
- absence of an event is never proof of removal under partial coverage;
- increasing a limit is not proof of completeness;
- a successful provider response for one calendar does not prove completeness across all targeted calendars;
- a model, UI, or conversation transcript may not upgrade acquisition completeness.

Only deterministic acquisition evidence may do so.

## 3. Scope

This contract applies only to an already-authorised bounded Calendar read.

It must preserve the exact operation bounds already governed by `calendar.read`:

- authorised `window.start`;
- authorised `window.end`;
- authorised Calendar source;
- requested global event limit.

It must not:

- widen the time window;
- add a second read;
- fetch additional dates;
- manufacture or reuse authority;
- treat an observation reference as authority;
- make a background request.

Completeness describes the result of the authorised acquisition. It does not grant authority.

## 4. Required conceptual result

Future connector/acquisition code must produce a typed server-side result equivalent in meaning to:

```ts
type CalendarAcquisitionCompleteness =
  | "complete"
  | "partial"
  | "unavailable";

type CalendarTargetAcquisitionStatus =
  | "complete"
  | "partial"
  | "unavailable";

type CalendarAcquisitionTargetRecord = Readonly<{
  calendarId: string;
  status: CalendarTargetAcquisitionStatus;
  returnedCount: number;
  continuation: "none" | "present" | "unknown";
}>;

type CalendarAcquisitionCompletenessEnvelope = Readonly<{
  sourceId: "google-calendar";
  windowStart: string;
  windowEnd: string;
  requestedLimit: number;
  targetDiscovery: "calendar_list" | "primary_fallback";
  targetCount: number;
  targets: readonly CalendarAcquisitionTargetRecord[];
  mergedReturnedCount: number;
  mergeTruncated: boolean;
  completeness: CalendarAcquisitionCompleteness;
  observedAt: string;
}>;
```

These names are normative for this contract unless implementation discovers a strictly smaller type that preserves every invariant below.

The contract records provider-derived retrieval facts only.

It is not a conversational artefact.

## 5. Target discovery semantics

The connector currently discovers visible non-hidden Calendars using `calendarList.list`.

The completeness contract must distinguish two cases.

### 5.1 `calendar_list`

The calendar list request succeeded and the set of target calendars came directly from that provider response after the existing hidden/deleted filtering.

This target discovery mode is eligible for `complete`, subject to every remaining rule below.

### 5.2 `primary_fallback`

The existing connector fallback was used because target discovery returned no usable calendar entries and the connector substituted `primary`.

This mode is **not eligible** for `complete`.

It may be:

- `partial`, if the fallback primary read returns usable bounded evidence;
- `unavailable`, if the fallback read does not produce usable evidence.

The fallback remains useful for ordinary Calendar display, but it is insufficient evidence that all relevant visible-calendar membership was observed.

## 6. Per-target acquisition semantics

For each targeted calendar, the future connector must retain enough result metadata to classify the target as exactly one of:

### `complete`

All of the following are true:

- the provider request succeeded;
- it used the exact authorised `windowStart` and `windowEnd`;
- returned events were successfully normalized;
- provider continuation state is known;
- provider continuation indicates no additional page/result remains.

### `partial`

At least some usable evidence was returned for the target, but the target's bounded membership is not proven complete.

Examples include:

- a continuation token indicates more provider results;
- provider continuation state cannot be determined;
- a deterministic post-fetch limit/truncation removed valid target events.

### `unavailable`

No trustworthy bounded event membership was obtained for that target.

Examples include:

- a provider request failed;
- response shape required to establish target retrieval state was unavailable;
- target retrieval could not be completed without guessing.

A failed target must never be represented as an empty complete Calendar.

## 7. Provider continuation rule

The future Google Calendar connector may inspect provider pagination metadata.

It must reduce that provider-specific metadata to the closed contract vocabulary:

```text
none
present
unknown
```

Raw page tokens must **not** be published above the connector boundary merely to prove completeness.

The only fact needed by the governed acquisition layer is whether continuation exists or is unknown.

The contract does not require automatic pagination.

A target with `continuation: "present"` is partial.

A target with `continuation: "unknown"` is partial or unavailable, never complete.

## 8. Cross-calendar merge semantics

After per-target acquisition, events may still be chronologically merged for the existing bounded conversational path.

The completeness envelope must separately record whether the cross-calendar merge itself truncated valid events.

`mergeTruncated` is:

- `false` only when no valid event was discarded by the global requested limit;
- `true` when the merged result contained more valid events than the bounded output retained.

A globally truncated result cannot be `complete`.

This is true even when every individual target was complete.

## 9. Overall completeness derivation

Overall `completeness` must be deterministic.

### 9.1 `complete`

May be emitted only when **all** are true:

1. `targetDiscovery === "calendar_list"`;
2. target discovery succeeded;
3. every targeted calendar has a target record;
4. every target record is `status === "complete"`;
5. every target has `continuation === "none"`;
6. `mergeTruncated === false`;
7. exact authorised bounds were used;
8. no target failure was converted into apparent empty membership.

If any one condition is not proven, the result is not complete.

### 9.2 `partial`

Emit when:

- some trustworthy bounded Calendar evidence exists;
- but one or more completeness conditions above are not satisfied.

Examples:

- one target failed while another succeeded;
- one target has another provider page;
- primary fallback was used;
- the cross-calendar merge truncated valid events.

### 9.3 `unavailable`

Emit when no trustworthy bounded Calendar evidence set is available for the operation.

This includes target discovery failure that prevents identifying an honest bounded acquisition set, or total target acquisition failure.

## 10. Mapping to existing governed coverage vocabulary

The future scoped acquisition adapter may map the completeness envelope to existing governed publication coverage only as follows:

```text
completeness = complete
    → coverageState = bounded_complete_request

completeness = partial
    → coverageState = bounded_partial_request

completeness = unavailable
    → SourceAdapterResult.status = unavailable
```

The generic historical value:

`coverageState = "bounded"`

may remain for older/non-completeness-aware acquisition paths, but it must not be treated as membership-complete.

## 11. No inferred completeness from event count

The following logic is prohibited:

```ts
if (events.length < requestedLimit) {
  coverageState = "bounded_complete_request";
}
```

It is invalid because:

- one target may have failed;
- a target may have hidden additional provider pages;
- target discovery may have fallen back;
- the connector may have discarded cross-calendar events.

Completeness must derive from the envelope, never from the final array in isolation.

## 12. Empty-result semantics

An empty event array may be complete, partial, or unavailable.

Examples:

### Complete empty

Eligible only when:

- calendar-list target discovery is authoritative;
- every target request succeeds;
- every target has no continuation;
- no merge truncation occurs;
- zero events exist in the authorised bounded window.

### Partial empty

Examples:

- primary fallback succeeds with no events;
- at least one target failed and the remaining successful targets contain no events.

### Unavailable empty

Examples:

- target discovery fails;
- all target requests fail.

Therefore:

> **empty is data; completeness is acquisition evidence.**

## 13. Publication boundary

The existing Calendar evidence publisher may continue to receive only normalized `CalendarEvent` values plus a governed coverage state.

The provider-specific completeness derivation should occur **before** publication.

The publisher must not:

- inspect provider response objects;
- infer pagination;
- call connectors;
- inspect logs;
- derive completeness from titles, statuses, or event counts.

This preserves the existing publisher-isolation boundary.

## 14. Identity and privacy

The completeness envelope is server-side acquisition metadata.

It may preserve `calendarId` because the production connector already requires stable target identity for multi-calendar retrieval and event provenance.

However:

- Calendar titles/names are not required by this contract;
- event titles are not required;
- raw provider response bodies are not required;
- raw continuation/page tokens are not required;
- this envelope is not automatically user-visible.

The live attention renderer does not gain authority to disclose any of these fields.

## 15. Failure visibility

The current connector behavior of converting a non-401 per-calendar failure directly to `[]` is incompatible with proving membership completeness.

Future implementation must preserve that failure as target acquisition state.

The connector may still return usable events from successful calendars.

The difference is that the result must be classified `partial`, not falsely complete.

## 16. Compatibility requirements

Implementation must preserve existing behavior for ordinary bounded Calendar reads:

- all successful normalized events remain chronologically merged;
- existing global requested limit remains in force;
- ordinary schedule questions retain their current authority semantics;
- Calendar titles remain outside the governed attention path;
- current same-identity start-time attention remains valid under `bounded` or `bounded_partial_request` coverage where comparison invariants allow it.

A completeness implementation must not require broadening the existing `calendar.read` capability.

## 17. Required implementation tests for the next sprint

The implementation sprint must prove at least these cases.

### Complete single-calendar

- calendar-list discovery succeeds;
- one target succeeds;
- no continuation;
- merged result not truncated;
- result maps to `bounded_complete_request`.

### Complete multi-calendar

- calendar-list discovery succeeds;
- every target succeeds;
- no target continuation;
- merged result does not exceed the global requested limit;
- result maps to `bounded_complete_request`.

### Per-calendar continuation

- one target returns continuation;
- usable evidence remains;
- overall result is `partial`;
- result maps to `bounded_partial_request`.

### Per-calendar failure

- one target succeeds;
- one target fails;
- successful evidence remains;
- failure is not converted to complete empty membership;
- overall result is `partial`.

### Total failure

- no trustworthy bounded target evidence;
- result is `unavailable`.

### Global merge truncation

- all targets individually complete;
- merged valid events exceed requested global limit;
- `mergeTruncated === true`;
- overall result is `partial`.

### Primary fallback

- `primary_fallback` is used;
- even with a successful no-continuation primary read, result is not `complete`.

### Empty complete window

- calendar-list discovery succeeds;
- every target succeeds;
- all targets return zero events and no continuation;
- result is `complete`;
- publication contains an authoritative empty bounded set.

### Authority regression

- no connector construction before `ALLOW`;
- exact authorised bounds are passed unchanged;
- completeness metadata cannot create or alter authority.

### Publisher isolation regression

- the Calendar evidence publisher remains free of production connector imports and provider response dependencies.

## 18. Non-goals

Sprint 3.162 does not govern or implement:

- automatic provider pagination;
- unbounded Calendar reads;
- cancellation attention;
- added-event attention;
- removed-event attention;
- event status interpretation;
- conflict detection;
- ranking;
- priority;
- urgency;
- recommendations;
- notifications;
- persistence;
- background monitoring;
- model reasoning;
- UI changes;
- voice changes;
- durable observation state.

Completeness is the only governed subject.

## 19. Architecture result

The intended future seam is:

```text
existing authorised Calendar operation
        ↓
Google Calendar target discovery
        ↓
per-target bounded retrieval
        ↓
normalized Calendar events
      + per-target completeness facts
        ↓
cross-calendar merge/truncation fact
        ↓
CalendarAcquisitionCompletenessEnvelope
        ↓
deterministic completeness derivation
        ↓
complete  → bounded_complete_request
partial   → bounded_partial_request
unavailable → unavailable
        ↓
existing Calendar evidence publication
        ↓
existing canonical attention observation
        ↓
existing fail-closed comparison
```

No downstream attention policy changes are required to close this seam.

## 20. Next sprint

Exactly one next sprint is authorised by this contract:

> **Sprint 3.163 — Implement Calendar Acquisition Completeness Envelope**

That sprint should alter only the minimum connector/acquisition seams necessary to produce and consume this governed result.

It must not add Calendar membership attention policy or live rendering in the same sprint.

## 21. Exit condition

Sprint 3.162 exits when the repository contains one explicit, reviewable contract establishing:

> JARVIS may emit `bounded_complete_request` only when deterministic acquisition evidence proves that the exact authorised Calendar window was successfully covered across the authoritative target-calendar set, with no unresolved provider continuation, target failure, fallback ambiguity, or global truncation.

Until implementation proves that contract, current production behavior remains correctly bounded rather than complete.
