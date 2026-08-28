# Sprint 3.156 — Calendar Start-Time Attention Policy Adapter

**Status:** Contract + isolated implementation  
**Sprint type:** Next bounded seam after Sprint 3.155  
**Production integration:** Prohibited  
**Baseline:** merged main after Sprint 3.155 (`2b203bde3f1f78a1ea37aabf85b90d72a76b1ad7`)

## 1. Purpose

Sprint 3.155 established a bounded, compatibility-aware Calendar change set:

```text
previous/current CanonicalCalendarAttentionObservationSet
→ CalendarAttentionObservationChangeSet
```

The next question is:

> What is the smallest adapter from this bounded Calendar change set into the existing deterministic Attention Policy semantics, without reconstructing the full historical EOS pipeline?

This sprint answers that question for exactly one proving case:

> **same stable commitment identity, changed start time**

## 2. Scope-discipline decision

Only the existing commitment start-time attention policy has earned inclusion.

The adapter does **not** support:

- added commitments;
- removed commitments;
- cancellation;
- source availability;
- end-time-only changes;
- timezone-only changes;
- ranking;
- urgency;
- recommendation;
- action.

Those semantics require separate evidence and separate justification.

## 3. Why the full Attention Engine is not used

The existing `ExecutiveAttentionEngine` consumes a full canonical `SituationalAwarenessChangeSet` whose commitment values are `OperationalCommitment`.

The governed Calendar attention path deliberately does not reconstruct `OperationalCommitment`, because that would require unsupported fields such as title, status, role ids and project ids.

Therefore this sprint does not coerce the bounded Calendar observation into the full historical EOS contract.

Instead it applies only the proven start-time attention semantics to the already-bounded Calendar change set.

## 4. Existing policy semantics preserved

The adapter is aligned to:

```text
policy id:      attention.commitment.start-time-changed
policy version: 1.0.0
reason code:    commitment.start-time.changed
message:        The commitment start time changed.
```

The evidence remains:

- commitment id;
- previous start timestamp;
- current start timestamp.

A parity test invokes the existing EOS `commitmentStartTimeChangePolicy` with a fully valid canonical fixture and proves that the isolated adapter uses the same policy identity, reason code, message and evidence semantics.

Production code does not import or invoke the full Attention Engine.

## 5. Contract

Implemented in:

`lib/governed-conversation/calendar-attention-policy-adapter.ts`

```ts
interface CalendarAttentionPolicyMatch {
  matchId: string
  entityId: string
  changeType: "modified"
  previousObservedAt: string
  currentObservedAt: string
  policy: {
    id: string
    version: string
  }
  reason: AttentionReason
}
```

The output is intentionally called a **Policy Match**, not an `AttentionRecord`.

This avoids claiming that the full EOS Attention Record contract has been produced when snapshot identity and the broader canonical change model are not present.

## 6. Selection rule

`selectCalendarStartTimeAttention()` selects a change only when:

- the comparison already classified it as `modified`;
- the stable governed entity id is preserved by Sprint 3.155;
- `previous.startsAt !== current.startsAt`.

End time or timezone may also have changed, but those fields do not themselves cause the policy match.

## 7. Determinism and immutability

The adapter:

- performs no acquisition;
- reads no clock;
- uses no model;
- creates no ranking;
- performs no persistence;
- sorts matches deterministically by governed entity id;
- freezes the match list;
- freezes each match;
- freezes policy and reason structures.

## 8. Acceptance proof

Tests prove:

1. a same-id start-time change produces one policy match;
2. policy id/version match the existing EOS policy;
3. reason code/message/evidence match the existing EOS policy;
4. end-time-only changes do not match;
5. timezone-only changes do not match;
6. added changes do not match;
7. removed changes do not match;
8. output ordering is deterministic;
9. output is immutable;
10. the adapter remains isolated from the full Attention Engine.

## 9. Non-goals

Do not add:

- full `SituationalAwarenessChangeSet`;
- `OperationalCommitment` synthesis;
- Executive Attention Queue;
- EOS runtime;
- persistence;
- conversational rendering;
- Attention Brief;
- source reacquisition;
- ranking;
- recommendation;
- action;
- voice or UI.

## 10. Resulting architecture

```text
governed Calendar evidence
        ↓
CanonicalCalendarAttentionObservationSet
        ↓
bounded previous/current comparison
        ↓
CalendarAttentionObservationChangeSet
        ↓
start-time Attention Policy semantics
        ↓
CalendarAttentionPolicyMatch
        ↓
Attention Brief publication      ← still missing
        ↓
conversation                     ← still missing
```

## 11. Next question

The next sprint should ask:

> What is the minimum bounded Attention Brief publication that can render these deterministic policy matches truthfully in conversation without allowing the model to add priority, urgency, cause, recommendation or action?

That is a publication/rendering question, not a reasoning-pipeline question.
