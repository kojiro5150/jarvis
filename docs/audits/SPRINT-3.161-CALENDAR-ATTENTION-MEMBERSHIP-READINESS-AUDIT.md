# Sprint 3.161 — Calendar Attention Membership-Change Readiness Audit

**Status:** Audit only  
**Sprint type:** Discover / govern-next-step  
**Baseline:** merged main after Sprint 3.160 (`273b1629f08213b53246c03e90533a599fc26990`)

## 1. Question

Sprint 3.160 proved a live, authority-gated end-to-end answer for one bounded attention condition:

> an existing Calendar commitment changed start time.

The next useful expansion of “What needs my attention?” would be a membership change such as:

- an existing commitment disappeared from the same bounded Calendar window;
- a new commitment appeared in the same bounded Calendar window.

This audit asks only:

> **Can current production Calendar acquisition honestly establish the complete bounded membership needed to distinguish “added” or “removed” from “not returned because the request was incomplete”?**

No implementation is authorised in this sprint.

## 2. Executive conclusion

**Outcome B — one named missing seam.**

The comparison layer already supports `added` and `removed` changes, but correctly fails closed unless both observation sets are marked:

`bounded_complete_request`

The current production Calendar acquisition path always publishes:

`coverageState: "bounded"`

That is not merely conservative metadata that can be upgraded locally from the returned array length.

The real Google connector currently loses information needed to prove completeness:

1. each visible calendar is queried separately;
2. each per-calendar request uses `maxResults = requestedLimit`;
3. Google pagination metadata such as `nextPageToken` is not retained;
4. non-401 failures for an individual visible calendar are swallowed and represented as an empty result;
5. all per-calendar arrays are flattened, globally sorted and sliced to the requested limit;
6. the caller receives only `CalendarEvent[]`, with no per-calendar completeness/failure envelope.

Therefore the current acquisition caller cannot know whether:

- fewer than the requested limit means complete coverage;
- one visible calendar failed and was silently omitted;
- a calendar had additional pages;
- the global slice removed valid events from other calendars.

The named missing seam is:

> **Calendar acquisition completeness envelope**

Until that exists, JARVIS must not infer cancellation/removal or newly-added membership from absence/presence across bounded Calendar observations.

This is an **implementation/policy seam**, not a failure of the frozen authority architecture.

## 3. Files inspected

Current merged production path:

- `lib/connectors/google/calendar.ts`
- `lib/governed-conversation/scoped-calendar-evidence-acquisition-adapter.ts`
- `lib/governed-conversation/calendar-evidence-publisher.ts`
- `lib/governed-conversation/calendar-attention-observation.ts`
- `lib/governed-conversation/calendar-attention-observation-comparison.ts`
- `lib/governed-conversation/calendar-attention-observation-comparison.test.ts`
- `lib/lighter-jarvis/live-calendar-attention.ts`
- `docs/SPRINT-3.160-LIVE-CALENDAR-ATTENTION-WIRING.md`

## 4. What is already proven

The comparison contract already contains the correct safety rule.

For stable identity changes, it can compare same-entity schedule fields under `bounded` coverage.

For membership changes, it requires:

```text
previous.coverageState === "bounded_complete_request"
AND
current.coverageState === "bounded_complete_request"
```

Otherwise it throws:

```text
Calendar attention observation membership comparison requires bounded_complete_request coverage
```

That rule should remain.

The missing capability is not comparison logic.

## 5. Current acquisition map

```text
authorised Calendar window
        ↓
GoogleCalendarConnector.listBetween(start, end, limit)
        ↓
calendarList.list
        ↓
for each visible non-hidden calendar:
    events.list(
      timeMin = start,
      timeMax = end,
      singleEvents = true,
      orderBy = startTime,
      maxResults = limit
    )
        ↓
per-calendar CalendarEvent[]
        ↓
flatten
        ↓
global chronological sort
        ↓
slice(0, limit)
        ↓
CalendarEvent[]
        ↓
scoped acquisition adapter
        ↓
publish Calendar evidence
        ↓
coverageState = "bounded"
```

The output type crossing the connector boundary contains event records only.

It contains no proof that the bounded request is complete.

## 6. Why returned count is insufficient

A tempting shortcut would be:

> if fewer than five events were returned, mark the request complete.

That is not proven by current code.

### 6.1 Per-calendar failure can look like an empty calendar

For non-401 errors, `listEventsForCalendar` logs a warning and returns:

```ts
[]
```

The merged caller cannot distinguish:

- a calendar with zero events;
- a calendar whose event request failed.

Therefore an overall result of three events does not prove that only three events exist in the authorised window.

### 6.2 Pagination evidence is discarded

The Google Calendar events response is currently parsed only for:

```ts
items
```

The connector does not retain a pagination/completeness signal.

A request that returns exactly the per-calendar limit may have more events, but the caller receives no evidence about that.

### 6.3 Global slicing can hide otherwise successful results

Each visible calendar is independently allowed to return up to the full requested limit.

Those arrays are then merged and globally sliced back to the same limit.

Even when every individual request succeeds, the final `CalendarEvent[]` is deliberately a bounded subset once total membership exceeds the global limit.

That subset is suitable for bounded presentation.

It is not sufficient evidence of complete membership.

## 7. Why this matters for attention

A start-time change is a same-identity comparison:

```text
event evt-1 existed before
event evt-1 exists now
startsAt changed
```

This does not require complete membership of the entire window.

A removal claim is different:

```text
event evt-1 existed before
event evt-1 is absent now
therefore evt-1 was removed
```

That final inference is only valid if the current observation is known to contain the complete relevant membership.

Without complete coverage, “absent” could mean:

- beyond the limit;
- omitted after global slicing;
- hidden behind pagination;
- unavailable because one calendar failed.

The existing comparison contract correctly refuses that inference.

## 8. Authority impact

None.

A completeness envelope must describe what happened during an already-authorised Calendar read.

It must not:

- widen the authorised time window;
- query additional dates;
- grant Calendar authority;
- reuse prior authority;
- turn an observation reference into authority;
- make background reads.

The existing North Star remains unchanged.

## 9. Minimum next contract

The next sprint should govern one connector/acquisition result envelope able to distinguish, at minimum:

```text
complete
partial
unavailable
```

for the exact authorised bounded request.

The contract needs enough evidence to determine completeness across the set of visible calendars actually attempted.

It will likely need to preserve facts such as:

- which visible calendars were targeted;
- whether each target request succeeded;
- whether any target result was truncated/paginated;
- whether the final cross-calendar merge was truncated;
- requested global limit;
- exact authorised window.

The audit deliberately does **not** specify the final field names or implementation shape.

Those belong to the governed contract sprint.

## 10. What must not happen

Do not implement membership attention by:

- treating `events.length < requestedLimit` as automatic completeness;
- changing `bounded` to `bounded_complete_request` without connector evidence;
- inferring removal from a missing event under partial coverage;
- using prior conversational prose to reconstruct membership;
- asking the model whether an event “looks cancelled”;
- increasing the limit and calling that completeness;
- silently querying additional windows.

## 11. First future proving scenario

Once the completeness seam is implemented and verified:

1. establish a complete authorised `today` Calendar baseline;
2. remove one existing event from that same bounded window;
3. perform a fresh explicitly authorised read;
4. prove the current bounded membership is complete;
5. compare the two canonical sets;
6. produce one deterministic `removed` change;
7. only then govern a policy deciding whether that removal belongs in the attention brief.

This sprint does not add that policy.

## 12. Scope classification

### Load-bearing now

- governed Calendar authority/acquisition;
- stable canonical Calendar identity;
- prior/current observation ownership;
- deterministic comparison;
- coverage-state fail-closed rule.

### Missing seam

- **truthful bounded request completeness across multi-calendar acquisition**

### Not required yet

- cancellation semantics from provider-specific status;
- event titles;
- ranking;
- priority;
- severity;
- recommendations;
- model reasoning;
- durable history;
- background monitoring;
- notifications.

## 13. Next sprint recommendation

Exactly one next sprint:

> **Sprint 3.162 — Governed Calendar Acquisition Completeness Contract**

It should define the minimum typed result and invariants required for the connector/acquisition boundary to prove `bounded_complete_request` without broadening source authority.

No membership attention policy should be added until that seam is implemented and verified.

## 14. Exit condition

Sprint 3.161 is complete when we can state, from repository evidence:

> Current JARVIS can safely detect same-identity Calendar schedule changes under bounded coverage, but cannot yet infer event addition/removal because the production Google Calendar connector does not preserve enough retrieval-completeness evidence across multiple calendars to support `bounded_complete_request`.

That is the smallest truthful next architectural gap after the live Sprint 3.160 proof.
