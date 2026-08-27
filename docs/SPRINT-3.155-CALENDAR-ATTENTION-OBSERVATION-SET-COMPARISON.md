# Sprint 3.155 — Calendar Attention Observation Set Ownership and Comparison

**Status:** Contract + isolated implementation  
**Sprint type:** Next missing seam after Sprint 3.154  
**Production integration:** Prohibited  
**Baseline:** merged main after Sprint 3.154 (`287126c15e0f8f71ae678ec637ee492b3e19778c`)

## 1. Purpose

Sprint 3.154 established a minimal event-level observation:

```text
governed Calendar evidence
→ CanonicalCalendarAttentionObservation
```

The next question is:

> Who owns previous/current observations, and under what rules may two observation sets be compared?

This sprint answers that without introducing persistence or the full EOS runtime.

## 2. Important finding before comparison

An event-only array is insufficient to represent an authoritative empty Calendar result.

If a governed read returns zero commitments, `[]` alone cannot distinguish:

- an available, bounded, empty Calendar result;
- unavailable evidence;
- no acquisition;
- an incomplete publication.

That means membership changes such as removal cannot be compared honestly unless coverage metadata survives even when there are zero events.

Sprint 3.155 therefore adds a set-level evidence envelope before implementing comparison.

## 3. Ownership rule

The comparison layer does **not** own history.

The caller owns and supplies two immutable observation sets:

```text
previous observation set
current observation set
```

The comparison layer:

- validates compatibility;
- compares them deterministically;
- returns bounded structural changes;
- persists nothing;
- acquires nothing;
- infers no priority, urgency, cancellation or cause.

A future production history owner remains a separate decision.

## 4. Set-level ownership contract

The existing protected Calendar evidence publisher remains unchanged.

Because event evidence alone cannot carry empty-set coverage semantics, the **caller that already owns the authorised acquisition window** must supply the set envelope alongside the published event evidence. The envelope preserves:

- source identity;
- availability;
- observation time;
- requested window;
- event limit;
- coverage state;
- canonical coverage string;
- disclosure policy identity;
- event evidence, including an empty array.

This keeps the new comparison seam from modifying or coupling to the protected publisher and makes set-level ownership explicit.

## 5. Canonical observation-set contract

`projectGovernedCalendarAttentionObservationSet()` creates:

```ts
interface CanonicalCalendarAttentionObservationSet {
  sourceId: "google-calendar"
  observedAt: string
  windowStart: string
  windowEnd: string
  requestedLimit: number
  coverageState: "bounded_complete_request" | "bounded_partial_request" | "bounded"
  coverageLimit: string
  policyReference: string
  observations: readonly CanonicalCalendarAttentionObservation[]
}
```

This preserves an authoritative empty set without inventing an event.

## 6. Compatibility rules

Two sets may be compared only when:

- source identity matches;
- coverage boundary matches exactly;
- disclosure policy identity matches;
- current observation time does not precede previous observation time.

For a stable shared commitment id, the comparison may detect changes to:

- `startsAt`;
- `endsAt`;
- `timezone`.

Observation time alone is not a schedule change.

Stable source/resource/provenance identity must remain consistent for a shared commitment id.

## 7. Membership-change rule

Added/removed claims require both sets to declare:

`bounded_complete_request`

If the set membership differs under merely `bounded` or `bounded_partial_request` coverage, comparison fails closed.

This is necessary because absence under incomplete coverage does not establish removal.

A start-time change for the same stable id may still be compared under bounded coverage because the same entity is observed in both sets.

## 8. Output

`compareCalendarAttentionObservationSets()` produces only:

- added;
- removed;
- modified;

with previous/current observation values where applicable.

It does not call the Executive Attention layer.

## 9. Non-goals

Do not add:

- persistence;
- session history;
- database storage;
- source reacquisition;
- `OperationalCommitment` synthesis;
- full Situational Awareness;
- full EOS runtime;
- Attention Policies;
- Attention Brief;
- conversational rendering;
- ranking;
- recommendation;
- action.

## 10. Acceptance proof

Tests cover:

- same-id start-time modification;
- observation-time-only no-op;
- incompatible coverage rejection;
- reversed observation-time rejection;
- fail-closed membership change under incomplete coverage;
- permitted removal under complete coverage;
- preservation of an authoritative empty observation set when the caller supplies its acquisition envelope.

## 11. Resulting architecture

```text
governed Calendar acquisition + caller-owned coverage envelope
        ↓
published governed Calendar event evidence
        ↓
CanonicalCalendarAttentionObservationSet
        ↓
caller-owned previous/current sets
        ↓
bounded deterministic comparison
        ↓
CalendarAttentionObservationChangeSet
        ↓
Attention policy adaptation       ← still missing
        ↓
Attention Brief                   ← still missing
```

## 12. Next question

The next sprint should ask:

> What is the smallest adapter from this bounded Calendar change set into the existing deterministic Attention Policy semantics, without reconstructing the full historical EOS pipeline?

That adapter must earn its fields from the actual start-time-change proving case.
