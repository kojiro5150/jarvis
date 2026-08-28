# Sprint 3.169 — Live Calendar Removal Attention Wiring

**Status:** Implemented  
**Sprint type:** Production composition wiring  
**Baseline:** merged main after Sprint 3.168 (`4ac43fc24890e3f23a8c7e2da34e31d80bb78037`)

## 1. Purpose

Sprints 3.165–3.168 established every isolated seam required for bounded Calendar removal attention:

```text
complete bounded Calendar comparison
→ removal Attention Policy selector
→ removal-capable Calendar Attention Brief
→ removal-capable deterministic renderer
```

Sprint 3.169 connects those already-governed seams inside the existing live `What needs my attention?` composition path.

No new attention policy is introduced.

## 2. Live selector composition

The live path now computes the existing bounded comparison once and applies both currently-supported Calendar attention selectors:

```ts
[
  ...selectCalendarStartTimeAttention(changeSet),
  ...selectCalendarRemovalAttention(changeSet),
]
```

The combined matches are then passed through the already-proven Calendar Attention Brief publisher.

The publisher retains responsibility for deterministic ordering by `matchId`.

No policy ranking is introduced by selector order.

## 3. Completeness remains fail-closed

Removal is only possible when the comparison layer emits a `removed` change.

The comparison layer already requires:

```text
previous.coverageState === "bounded_complete_request"
AND
current.coverageState === "bounded_complete_request"
```

for membership changes.

Sprint 3.169 does not duplicate, weaken, or bypass that gate.

If a commitment disappears while either observation lacks complete bounded membership, comparison fails closed before removal selection.

Start-time comparison remains available under the existing bounded observation semantics because it does not depend on complete membership.

## 4. Live removal wording

When one complete-bounded commitment disappears, the live path can now return:

```text
A Calendar commitment previously scheduled for <previous> is no longer present in this bounded Calendar window.
```

This wording remains factual and does not assert:

- cancelled;
- deleted;
- completed;
- declined;
- resolved;
- no longer happening;
- priority;
- urgency;
- recommendation;
- action.

## 5. Mixed live output

When the same complete bounded comparison contains both:

- a start-time change; and
- a removal;

the live path now publishes and renders both through the same deterministic brief.

Example shape:

```text
2 Calendar attention changes matched this bounded check:
- changed start time from <previous> to <current>.
- previously scheduled for <previous> is no longer present in this bounded Calendar window.
```

The order is deterministic publication order, not ranking.

## 6. Baseline wording

The baseline-establishment reply is widened from:

```text
...can compare against it for start-time changes.
```

to:

```text
...can compare against it for supported attention changes.
```

This reflects the now-live supported policy set without claiming that every structural Calendar change is governed as attention.

Added commitments remain outside the policy set.

Cancellation remains outside the governed Calendar evidence path.

## 7. Authority unchanged

The existing authority sequence is unchanged:

```text
user asks "What needs my attention?"
→ explicit Calendar read proposal
→ user authorises
→ bounded authorised Calendar acquisition
→ governed evidence
→ live attention composition
```

`resolveLiveCalendarAttention()` still performs no source acquisition and grants no authority.

The previous observation reference remains server-owned evidence state, not reusable authority.

## 8. Regression coverage

Tests prove:

1. existing start-time live behavior remains deterministic;
2. complete previous/current observations can produce one live removal;
3. live removal wording does not inflate absence into lifecycle cause;
4. complete observations can produce mixed start-time + removal output;
5. membership disappearance fails closed when current coverage is not complete;
6. bounded zero-match output remains narrow;
7. incompatible prior windows still rotate the baseline rather than compare;
8. unavailable evidence remains rejected.

## 9. Non-goals

Sprint 3.169 does not add:

- added-event attention;
- cancellation attention;
- Calendar status evidence;
- priority or ranking;
- proactive notification;
- background acquisition;
- persistence changes;
- model interpretation;
- title disclosure;
- UI-specific rendering;
- voice-specific behavior.

## 10. Resulting live architecture

```text
explicit Calendar authority
        ↓
bounded authorised acquisition
        ↓
governed Calendar evidence
        ↓
server-owned previous/current observations
        ↓
deterministic comparison
        ↓
┌───────────────────────────────┐
│ start-time selector           │
│ bounded removal selector      │
└───────────────────────────────┘
        ↓
CalendarAttentionBrief
        ↓
deterministic mixed-policy renderer
        ↓
live "What needs my attention?" reply
```

## 11. Next step

The bounded removal path is now complete end to end.

The next sprint should **not** continue extending Calendar membership semantics by default.

A sensible next step is to return to the product-level question:

> What is the next highest-value everyday executive question whose missing deterministic seam is now worth building?

That should be chosen against the frozen JARVIS North Star and scope-discipline rule, rather than continuing Calendar work merely because adjacent seams exist.

## 12. Exit condition

Sprint 3.169 exits when the live authorised Calendar attention path can truthfully report both governed start-time changes and complete-bounded removals, including mixed output, while incomplete membership still fails closed and no new authority or attention semantics are manufactured.
