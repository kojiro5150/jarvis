# Sprint 3.165 — Bounded Calendar Removal Attention Policy Adapter

**Status:** Contract + isolated implementation  
**Sprint type:** Implement isolated policy seam  
**Production integration:** Prohibited  
**Baseline:** merged main after Sprint 3.164 (`ab70ceafe606d6141240f82d089507fcbd2da8ba`)

## 1. Purpose

Sprint 3.164 audited three Calendar membership-change candidates:

- added commitment;
- removed commitment;
- explicit provider cancellation.

Only **removed commitment** was found ready for bounded policy activation.

Sprint 3.165 implements exactly that policy seam and no further integration.

The governed semantic is:

> a commitment was present in the previous complete bounded Calendar observation and is absent from the current complete bounded Calendar observation.

It does not mean cancelled, deleted, completed, declined, resolved, unimportant, or no longer happening.

## 2. Existing policy parity

The adapter preserves the accepted EOS policy identity and reason semantics:

```text
policy id:      attention.commitment.removed
policy version: 1.0.0
reason code:    commitment.absent-from-current-snapshot
reason message: The commitment was present in the previous snapshot and is absent from the current snapshot.
```

The historical EOS policy operates on a richer `OperationalCommitment` and includes `previous.status` in its reason evidence.

The governed Calendar attention path does not carry status.

Sprint 3.165 therefore preserves semantic parity without manufacturing an unsupported status value.

The Calendar removal match evidence is limited to:

- governed commitment id;
- previous start timestamp.

The match also preserves previous/current observation timestamps and policy identity/version.

## 3. Implementation

Implemented in:

`lib/governed-conversation/calendar-attention-policy-adapter.ts`

New constant:

```text
CALENDAR_REMOVAL_ATTENTION_POLICY
```

New isolated output type:

```ts
interface CalendarRemovalAttentionPolicyMatch {
  matchId: string
  entityId: string
  changeType: "removed"
  previousObservedAt: string
  currentObservedAt: string
  policy: {
    id: string
    version: string
  }
  reason: AttentionReason
}
```

New selector:

```text
selectCalendarRemovalAttention(changeSet)
```

The separate match type is intentional.

Sprint 3.165 does not broaden the existing start-time `CalendarAttentionPolicyMatch` publication/live contract.

## 4. Selection rule

The adapter selects exactly:

```text
change.type === "removed"
```

It does not select:

- `added`;
- `modified`;
- start-time changes;
- end-time changes;
- timezone changes.

It performs no second completeness check.

That boundary already belongs to `compareCalendarAttentionObservationSets()`, which refuses to emit membership changes unless both previous and current observation sets are `bounded_complete_request`.

The policy adapter therefore consumes an already-valid structural change; it does not weaken or duplicate the acquisition/comparison invariant.

## 5. Removal is not cancellation

The returned reason remains deliberately factual:

```text
The commitment was present in the previous snapshot and is absent from the current snapshot.
```

The adapter does not use or emit:

- cancelled;
- deleted;
- completed;
- declined;
- resolved.

This follows ADR-0009 exactly: removal means snapshot absence, not lifecycle cause.

## 6. Determinism and immutability

The selector:

- performs no acquisition;
- reads no clock;
- invokes no model;
- performs no persistence;
- performs no ranking;
- creates no priority or severity;
- sorts matches deterministically by governed entity identity;
- freezes the output list;
- freezes each match;
- freezes policy and reason structures.

## 7. Match identity

Removal match identity follows the existing isolated Calendar attention pattern:

```text
calendar-attention
:<current observedAt>
:<governed entity id>
:attention.commitment.removed
:1.0.0
```

Each dynamic component is URI encoded before joining.

This is a deterministic label, not an integrity signature.

## 8. Acceptance proof

Tests prove:

1. a removed change produces exactly one removal policy match;
2. policy id/version match the accepted EOS removal policy;
3. reason code/message match the accepted EOS removal policy;
4. the Calendar adapter does not synthesize `previous.status`;
5. evidence contains only governed id and previous start;
6. added changes do not match;
7. modified changes do not match;
8. output ordering is deterministic;
9. output and nested reason structures are immutable;
10. serialized removal matches do not inflate absence into cancellation/deletion/completion/decline/resolution semantics.

## 9. Production boundary

Sprint 3.165 deliberately does **not** modify:

- `calendar-attention-brief-publisher.ts`;
- `calendar-attention-conversational-renderer.ts`;
- `live-calendar-attention.ts`;
- chat handler;
- API routes;
- UI;
- voice.

The current live “What needs my attention?” path therefore continues to select only the already-live start-time policy.

This sprint proves the removal selector in isolation.

## 10. Authority unchanged

The selector accepts an already-computed change set.

It cannot:

- acquire Calendar data;
- grant Calendar authority;
- confirm PendingAuthorization;
- resolve observation references;
- widen the bounded window;
- make a background request.

## 11. Non-goals

Do not add:

- live removal reporting;
- Attention Brief support for `removed`;
- conversational rendering for removal;
- added-event attention;
- cancellation evidence/status;
- cancellation policy adapter;
- automatic pagination;
- ranking;
- priority;
- urgency;
- recommendation;
- action;
- persistence;
- notification.

## 12. Resulting architecture

The removal path is now proven through deterministic selection only:

```text
authorised Calendar acquisition
        ↓
complete governed bounded observation
        ↓
previous/current complete comparison
        ↓
Calendar change: removed
        ↓
selectCalendarRemovalAttention()
        ↓
CalendarRemovalAttentionPolicyMatch
        ↓
publication / rendering            ← not yet wired
```

## 13. Next sprint

Exactly one next sprint:

> **Sprint 3.166 — Calendar Removal Attention Publication Readiness Audit**

That audit should inspect the existing Attention Brief and renderer contracts and determine the minimum truthful publication/rendering change needed to carry a `removed` match without disturbing the proven start-time path.

It must decide whether the existing general brief semantics can safely admit `changeType: "removed"` or whether removal needs a narrower separate publication artefact.

No live wiring should be assumed before that audit.

## 14. Exit condition

Sprint 3.165 exits when the repository contains an isolated, deterministic Calendar removal selector that preserves the accepted EOS removal semantics without inventing status, cause, priority, or action and without changing the live conversational path.
