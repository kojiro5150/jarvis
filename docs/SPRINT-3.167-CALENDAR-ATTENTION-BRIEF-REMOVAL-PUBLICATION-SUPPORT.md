# Sprint 3.167 — Calendar Attention Brief Removal Publication Support

**Status:** Implemented  
**Sprint type:** Publication contract extension  
**Production integration:** Prohibited  
**Baseline:** merged main after Sprint 3.166 (`90dbbd4c896eb3b0169f9b9380bba8751ab137d4`)

## 1. Purpose

Sprint 3.166 established that the existing Calendar Attention Brief is already the correct structured publication artefact for both:

- start-time attention matches;
- removal attention matches.

The blocker was only a start-time-specific TypeScript narrowing.

Sprint 3.167 widens that publication contract to the smallest closed governed union.

It does not modify rendering or live wiring.

## 2. Closed publishable match union

The publisher now accepts:

```ts
type PublishableCalendarAttentionPolicyMatch =
  | CalendarAttentionPolicyMatch
  | CalendarRemovalAttentionPolicyMatch
```

The brief item change type is now:

```ts
"modified" | "removed"
```

No `"added"` type is admitted.

That is deliberate: added Calendar membership is structurally observable but has not earned an Attention Policy.

## 3. Existing semantics preserved

The brief kind remains:

`calendar_attention_brief`

The semantics marker remains:

`deterministic_policy_match_not_priority`

That means publication still asserts only:

> a bounded deterministic policy matched.

It does not assert:

- importance;
- priority;
- urgency;
- severity;
- cause;
- recommendation;
- action;
- ranking.

## 4. Evidence remains policy-specific

The publisher still copies reason evidence exactly as supplied by each policy match.

Start-time matches publish:

- commitment id;
- previous start;
- current start.

Removal matches publish:

- commitment id;
- previous start.

The publisher does not normalize these into a common shape.

In particular it does not invent:

- current start for a removed entity;
- previous status;
- cancellation;
- deletion;
- completion;
- resolution.

## 5. Mixed-policy publication

A single Calendar Attention Brief can now contain both:

```text
attention.commitment.start-time-changed
attention.commitment.removed
```

Items remain deterministically sorted by `matchId`, not by policy importance or change type.

Mixed publication is therefore replay-stable without introducing ranking semantics.

## 6. Existing validation preserved

The publisher still enforces:

- valid previous/current observation timestamps;
- current observation not before previous;
- exact observation-window match for every policy match;
- non-empty match identity;
- duplicate match rejection;
- deterministic ordering;
- deep copy/freeze of published structures.

No provider or source access is added.

## 7. Renderer boundary unchanged

The conversational renderer is intentionally unchanged.

It still supports only:

```text
attention.commitment.start-time-changed@1.0.0
```

and remains fail-closed for removal items.

This is expected.

Publication support does not imply conversational support.

## 8. Live path unchanged

The live path remains:

```text
compare
→ selectCalendarStartTimeAttention()
→ publishCalendarAttentionBrief()
→ renderCalendarAttentionBrief()
```

The isolated removal selector is not yet combined with the live start-time selector.

No chat, API, UI, voice or authority path changes in this sprint.

## 9. Tests

Tests prove:

1. existing start-time publication remains unchanged;
2. a removal match publishes as `changeType: "removed"`;
3. removal evidence is preserved without current state invention;
4. removal publication does not inflate absence into cancellation or deletion;
5. mixed start-time/removal publication is deterministic regardless of input order;
6. no ranking/priority/urgency/recommendation/action semantics appear;
7. the publishable change-type contract remains closed to `modified | removed`.

## 10. Non-goals

Do not add:

- removal conversational rendering;
- mixed-policy prose;
- revised zero-match wording;
- live removal selection;
- added-event attention;
- cancellation semantics;
- ranking;
- priority;
- recommendation;
- action;
- UI;
- voice.

## 11. Resulting architecture

```text
Calendar start-time policy match ─┐
                                  ├→ CalendarAttentionBrief
Calendar removal policy match ────┘
                                         ↓
                           deterministic publisher
                                         ↓
                    start-time-only renderer  ← still narrow
                                         ↓
                         live removal wiring   ← not yet
```

## 12. Next sprint

Exactly one next sprint:

> **Sprint 3.168 — Calendar Removal and Mixed-Policy Conversational Rendering Audit**

That sprint should govern:

- one removal template;
- multiple removal template;
- mixed start-time + removal output;
- zero-match wording when more than one policy family is selected;
- fail-closed policy/reason/evidence validation.

It should decide the deterministic renderer contract before any live wiring.

## 13. Exit condition

Sprint 3.167 exits when the existing Calendar Attention Brief can publish the complete currently-governed Calendar policy-match set — start-time and removal — without generalizing to ungoverned change types and without changing renderer or live behavior.
