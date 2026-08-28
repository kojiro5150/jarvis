# Sprint 3.163 — Implement Calendar Acquisition Completeness Envelope

**Status:** Implemented  
**Sprint type:** Implement  
**Baseline:** merged main after Sprint 3.162 (`832b9a1a039aa907b68204cc1c256120a979928d`)

## 1. Purpose

Sprint 3.162 governed one narrow contract:

> JARVIS may emit `bounded_complete_request` only when deterministic acquisition evidence proves that the exact authorised Calendar window was successfully covered across the authoritative target-calendar set, with no unresolved provider continuation, target failure, fallback ambiguity, or global truncation.

Sprint 3.163 implements that contract at the minimum connector/acquisition seams.

It does **not** add Calendar membership attention policy.

## 2. Implemented seam

The production Google Calendar connector now exposes a completeness-aware bounded read alongside its existing compatibility method:

```text
listBetweenWithCompleteness(start, end, limit)
```

The existing:

```text
listBetween(start, end, limit)
```

remains available and returns the same bounded chronological `CalendarEvent[]` surface for existing callers.

The new method returns:

```text
normalized bounded events
+
CalendarAcquisitionCompletenessEnvelope
```

## 3. Completeness envelope

The implementation records only retrieval facts needed by the governed contract:

- exact bounded window;
- requested global limit;
- target discovery mode;
- target count;
- per-target stable Calendar id;
- per-target acquisition status;
- per-target returned count;
- closed continuation state;
- merged returned count;
- merge truncation;
- overall completeness;
- observation time.

Raw provider page tokens are reduced to:

```text
none
present
unknown
```

and are not propagated above the connector boundary.

## 4. Target failure visibility

A non-authentication failure for one target Calendar no longer becomes indistinguishable from an empty successful Calendar for completeness purposes.

The connector may still preserve usable events from other successful calendars.

The failed target is recorded as:

```text
status = unavailable
continuation = unknown
```

and overall completeness becomes partial when another trustworthy target succeeded.

If no trustworthy target succeeds, overall completeness is unavailable.

Authentication failure remains fail-closed through the existing typed Google authentication path.

## 5. Provider continuation

A successful Calendar events response with no continuation metadata is eligible for target status:

`complete`

A response with a non-empty continuation token becomes:

```text
status = partial
continuation = present
```

A malformed/indeterminate continuation value becomes:

```text
status = partial
continuation = unknown
```

The implementation does not automatically paginate.

## 6. Primary fallback

The existing primary-Calendar fallback remains available for compatibility when calendar-list discovery yields no visible targets.

The completeness result records:

`targetDiscovery = primary_fallback`

This is never eligible for overall `complete`.

A successful fallback can produce partial bounded evidence.

## 7. Cross-calendar truncation

Each target may still return up to the existing requested limit.

The merged result is still globally ordered and bounded to that same limit.

The connector now records whether valid merged events were discarded:

`mergeTruncated = true | false`

Any global truncation forces overall completeness to partial even if every target was individually complete.

## 8. Governed acquisition mapping

The scoped Calendar acquisition adapter now consumes the completeness-aware method when the connector provides it.

The deterministic mapping is:

```text
complete
→ coverageState = bounded_complete_request

partial
→ coverageState = bounded_partial_request

unavailable
→ SourceAdapterResult.status = unavailable
```

A connector that does not yet implement the completeness-aware method retains the historical:

`coverageState = bounded`

This preserves test/mocked/compatibility callers without manufacturing completeness.

## 9. Publisher isolation

The Calendar evidence publisher remains provider-independent.

It receives:

- normalized events;
- exact bounded window;
- requested limit;
- already-derived governed coverage state.

It does not receive:

- Google response objects;
- raw page tokens;
- target-request failures;
- provider pagination logic.

Completeness is resolved before publication.

## 10. Live attention propagation

The live Calendar attention composer no longer hard-codes `bounded`.

When the governed acquisition result carries a proven coverage state, that state is preserved in the canonical observation set and its coverage limit.

When no completeness-aware state is present, the existing `bounded` fallback remains.

This does not add a new attention policy.

It only preserves acquisition truth into the existing comparison boundary.

## 11. Authority unchanged

No authority semantics changed.

The production ordering remains:

```text
Calendar proposal
→ existing authority evaluation / PendingAuthorization
→ ALLOW
→ connector construction
→ exact bounded acquisition
→ completeness derivation
→ governed evidence publication
```

Completeness metadata cannot create, confirm, reuse, or widen authority.

## 12. Tests

The sprint adds regression coverage for:

- complete multi-calendar acquisition;
- exact target records;
- provider continuation → partial;
- raw page token non-propagation;
- one target failure → partial;
- total target failure → unavailable;
- global merge truncation → partial;
- primary fallback never complete;
- complete → `bounded_complete_request`;
- partial → `bounded_partial_request`;
- unavailable → governed unavailable result;
- legacy connector fallback → `bounded`;
- existing exact authorised Calendar bounds remain intact.

The full existing suite remains the final integration gate.

## 13. What this now proves

For completeness-aware production Google Calendar reads, JARVIS can distinguish:

```text
complete bounded membership
partial bounded membership
unavailable bounded membership
```

without inferring that state from event count alone.

This closes the missing acquisition seam identified in Sprint 3.161.

## 14. What it does not yet prove

JARVIS still does not claim that an added or removed Calendar commitment “needs attention”.

The comparison layer can structurally represent membership changes when both observation sets are complete, but no governed membership-change attention policy has yet been selected.

Therefore this sprint stops before conversational meaning is added.

## 15. Next sprint

Exactly one next sprint:

> **Sprint 3.164 — Calendar Membership-Change Attention Policy Audit**

That audit should determine which structural membership change, if any, earns a deterministic attention policy under the everyday proving question.

It should inspect current canonical/provider semantics before choosing between:

- added commitment;
- removed commitment;
- explicit provider cancellation.

It must not assume all three mean the same thing.

## 16. Exit condition

Sprint 3.163 exits when production Calendar acquisition can truthfully preserve and publish complete/partial/unavailable bounded coverage without changing Calendar authority, provider-independent evidence publication, or attention-policy semantics.
