# Sprint 3.157 — Bounded Calendar Attention Brief Publication

**Status:** Contract + isolated implementation  
**Sprint type:** Next bounded seam after Sprint 3.156  
**Production integration:** Prohibited  
**Baseline:** merged main after Sprint 3.156 (`d5b4ef943028667e56666f1ae4968b9a33691b1b`)

## 1. Purpose

Sprint 3.156 established a bounded deterministic policy-match artefact:

```text
CalendarAttentionObservationChangeSet
→ CalendarAttentionPolicyMatch
```

The next question is:

> What is the minimum bounded Attention Brief publication that can make those deterministic policy matches available to conversation without allowing priority, urgency, cause, recommendation or action to appear?

This sprint answers only the publication question.

It does not wire conversation.

## 2. Scope-discipline decision

The brief is a **structured publication artefact**, not prose and not an executive judgement.

It contains only:

- publication kind;
- explicit semantics marker;
- previous observation time;
- current observation time;
- deterministic policy-match items.

Each item contains only:

- match identity;
- governed entity identity;
- structural change type;
- deterministic policy id/version;
- deterministic reason code/message;
- exact policy evidence.

No other semantic layer is added.

## 3. Explicit semantics marker

Every brief carries:

`deterministic_policy_match_not_priority`

This is not decorative metadata.

It establishes that presence in the brief means only:

> a bounded structural change matched a deterministic attention policy.

It does **not** mean:

- high priority;
- urgent;
- severe;
- important;
- causal;
- recommended;
- actionable;
- ranked above another item.

## 4. Contract

Implemented in:

`lib/governed-conversation/calendar-attention-brief-publisher.ts`

```ts
interface CalendarAttentionBrief {
  kind: "calendar_attention_brief"
  semantics: "deterministic_policy_match_not_priority"
  previousObservedAt: string
  currentObservedAt: string
  items: readonly CalendarAttentionBriefItem[]
}
```

The publication input carries the same explicit observation window plus the existing `CalendarAttentionPolicyMatch[]`.

The publisher validates that every match belongs to that exact observation window.

## 5. Empty brief semantics

A zero-match result is represented as:

```ts
{
  kind: "calendar_attention_brief",
  semantics: "deterministic_policy_match_not_priority",
  previousObservedAt,
  currentObservedAt,
  items: []
}
```

The publisher does not convert an empty item list into prose such as:

- "nothing needs your attention";
- "you are all clear";
- "there is nothing important";
- "no action is required".

Those statements would exceed the evidence.

The only fact established is that this bounded policy-selection path produced zero matches for the supplied observation window.

## 6. Publication rule

`publishCalendarAttentionBrief()`:

- reads no clock;
- performs no acquisition;
- invokes no model;
- invokes no EOS runtime;
- invokes no Attention Engine;
- performs no persistence;
- validates observation-window consistency;
- rejects duplicate match identity;
- sorts items deterministically by match identity;
- deep-copies the allowed publication fields;
- freezes the resulting artefact.

## 7. Forbidden semantics

The publication contract has no fields for:

- priority;
- urgency;
- severity;
- cause;
- recommendation;
- ranking;
- action.

The test suite explicitly verifies that those field names do not appear in the serialized publication.

This does not yet protect future free-form model prose. Conversational rendering requires its own bounded rendering/validation seam.

## 8. Why this is not conversational integration

A structured brief may now be safely handed to a later renderer, but Sprint 3.157 does not decide:

- whether rendering is deterministic or model-assisted;
- how the user asks for the brief;
- how previous/current observation sets are retained in production;
- when Calendar should be reacquired;
- how an empty brief should be worded;
- how reply fidelity is validated;
- whether the brief appears proactively or only on request.

Those are separate production integration decisions.

## 9. Acceptance proof

Tests prove:

1. one start-time policy match publishes exactly one bounded item;
2. policy identity, reason and evidence survive unchanged;
3. publication semantics explicitly say policy match is not priority;
4. no priority/urgency/severity/cause/recommendation/ranking/action fields appear;
5. zero matches produce an empty brief without invented content;
6. mismatched observation windows fail closed;
7. duplicate match identities fail closed;
8. replay-equivalent input order produces identical output;
9. reversed observation windows fail closed;
10. nested publication structures are immutable.

## 10. Non-goals

Do not add:

- `/api/lighter/chat` wiring;
- model invocation;
- reply validation;
- deterministic prose rendering;
- snapshot/session persistence;
- source reacquisition;
- full EOS runtime;
- full Executive Attention Queue;
- priority or urgency;
- recommendation;
- action;
- voice;
- UI.

## 11. Resulting architecture

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
CalendarAttentionBrief
        ↓
bounded conversational rendering      ← still missing
        ↓
"What needs my attention?"            ← not yet production-live
```

## 12. Next question

The next sprint should determine the smallest safe rendering seam:

> How may a `CalendarAttentionBrief` become a concise conversational answer while preserving exact policy-match facts and preventing the renderer from adding priority, urgency, cause, recommendation or action?

That sprint should first decide whether a deterministic renderer alone is sufficient before introducing a model.
