# Sprint 3.166 — Calendar Removal Attention Publication Readiness Audit

**Status:** Audit only  
**Sprint type:** Discover / govern-next-step  
**Baseline:** merged main after Sprint 3.165 (`0d2e560eb6627675fe2a2249ba5a60110753dc22`)

## 1. Question

Sprint 3.165 proved an isolated deterministic Calendar removal policy match:

```text
CalendarAttentionObservationChangeSet
→ selectCalendarRemovalAttention()
→ CalendarRemovalAttentionPolicyMatch
```

The next question is:

> **Can the existing Calendar Attention Brief and conversational renderer safely admit removal matches, or does removal require a separate publication artefact?**

This sprint audits that seam only.

No production/live wiring is authorised.

## 2. Executive conclusion

**Outcome A for publication; Outcome B for rendering.**

The existing `CalendarAttentionBrief` is already semantically general enough to carry both start-time and removal policy matches.

Its governing semantics marker is:

`deterministic_policy_match_not_priority`

That means an item exists because a deterministic bounded policy matched. It does not assert priority, urgency, cause, recommendation, action, or a particular change type.

Therefore **removal does not require a separate publication artefact**.

However, the current TypeScript contract is artificially narrowed to the first proving case:

```ts
changeType: "modified"
matches: readonly CalendarAttentionPolicyMatch[]
```

and `CalendarAttentionPolicyMatch` itself is the start-time match type.

That type boundary now blocks the already-governed removal match.

The renderer is more constrained. It is explicitly and correctly start-time-specific:

- it supports only `attention.commitment.start-time-changed@1.0.0`;
- it requires `changeType === "modified"`;
- it requires previous/current start evidence;
- its zero-match response says:
  `No Calendar start-time changes matched this bounded check.`

Therefore the current renderer **must not** simply receive removal items through a widened brief contract.

The next sprint should broaden the publication contract only. Rendering should remain a separate subsequent seam.

## 3. Files inspected

- `lib/governed-conversation/calendar-attention-policy-adapter.ts`
- `lib/governed-conversation/calendar-attention-policy-adapter.test.ts`
- `lib/governed-conversation/calendar-attention-brief-publisher.ts`
- `lib/governed-conversation/calendar-attention-brief-publisher.test.ts`
- `lib/governed-conversation/calendar-attention-conversational-renderer.ts`
- `lib/governed-conversation/calendar-attention-conversational-renderer.test.ts`
- `lib/lighter-jarvis/live-calendar-attention.ts`
- `docs/SPRINT-3.157-BOUNDED-CALENDAR-ATTENTION-BRIEF-PUBLICATION.md`
- `docs/SPRINT-3.158-BOUNDED-CALENDAR-ATTENTION-CONVERSATIONAL-RENDERER.md`
- `docs/SPRINT-3.165-BOUNDED-CALENDAR-REMOVAL-ATTENTION-POLICY-ADAPTER.md`

## 4. Publication contract audit

### OBSERVED

The brief contract is:

```ts
interface CalendarAttentionBrief {
  kind: "calendar_attention_brief"
  semantics: "deterministic_policy_match_not_priority"
  previousObservedAt: string
  currentObservedAt: string
  items: readonly CalendarAttentionBriefItem[]
}
```

The semantics marker is not start-time-specific.

### OBSERVED

Each item carries only:

- match id;
- entity id;
- structural change type;
- policy id/version;
- reason code/message;
- reason evidence.

No title, ranking, urgency, recommendation, or action semantics are present.

### OBSERVED

The current item type is narrowed to:

```ts
changeType: "modified"
```

and publication input accepts only:

```ts
readonly CalendarAttentionPolicyMatch[]
```

where that type is the original start-time-specific match.

### INFERRED

The publication artefact itself does not need to split by policy.

Its semantics are already:

> deterministic policy match, not priority.

A removal policy match satisfies exactly that statement.

The current type narrowing is an implementation residue from the first proving case, not a semantic invariant.

### Classification

**Existing publication artefact is reusable.**

The minimum required change is a closed union of supported Calendar policy-match types.

## 5. Minimum publication type change

A future publication sprint should introduce one bounded union equivalent in meaning to:

```ts
type PublishableCalendarAttentionPolicyMatch =
  | CalendarAttentionPolicyMatch
  | CalendarRemovalAttentionPolicyMatch
```

Then:

```ts
CalendarAttentionBriefPublicationInput.matches:
  readonly PublishableCalendarAttentionPolicyMatch[]

CalendarAttentionBriefItem.changeType:
  "modified" | "removed"
```

No `"added"` member should be admitted because no added-event Attention Policy exists.

This keeps the publication boundary policy-governed rather than structurally generic.

## 6. Why not generalise to every change type

A tempting implementation would be:

```ts
changeType: "added" | "modified" | "removed"
```

or even:

```ts
changeType: string
```

That would be incorrect.

The brief publishes **policy matches**, not arbitrary observed changes.

At present the only governed Calendar policy matches are:

- start-time changed → `modified`;
- removed → `removed`.

An added structural change is observable but has not earned an Attention Policy.

Therefore the publication contract should admit only the closed set of currently supported match outputs.

## 7. Existing publisher validation remains valid

The current publisher already enforces useful general invariants:

- exact previous/current observation-window consistency;
- non-empty deterministic match id;
- duplicate match rejection;
- deterministic sorting by match id;
- deep copy/freeze of allowed publication fields;
- no ranking/priority/urgency/action fields.

None of those rules conflict with removal.

No separate removal publisher is required.

## 8. Evidence preservation

The publisher should continue to copy policy evidence without interpreting it.

For start-time matches, that evidence is:

- commitment id;
- previous start;
- current start.

For removal matches, that evidence is:

- commitment id;
- previous start.

The publisher must not try to “normalise” these into one common evidence shape.

Doing so would risk manufacturing:

- current start for an absent entity;
- previous status;
- cancellation cause.

The publisher should remain semantically transparent.

## 9. Renderer audit

### OBSERVED

The renderer contains one hard-coded policy path:

```text
attention.commitment.start-time-changed@1.0.0
+
commitment.start-time.changed
```

It rejects unsupported policy ids and reason codes.

### OBSERVED

It requires:

- `changeType === "modified"`;
- one `commitment.id`;
- one `previous.startsAt`;
- one `current.startsAt`;
- both timestamps valid and different.

### OBSERVED

Its fixed prose is:

```text
A Calendar commitment changed start time from <previous> to <current>.
```

and zero-match prose is:

```text
No Calendar start-time changes matched this bounded check.
```

### INFERRED

Those constraints are correct for the first proving policy.

They are not a generic renderer contract.

If removal matches were simply passed into the widened brief today, the renderer would fail closed, which is preferable to semantic overreach.

### Classification

**Renderer requires a separate governed extension.**

Do not broaden it in the publication sprint.

## 10. Why publication and rendering should remain separate

Combining both changes in one sprint would obscure two different questions:

1. **Can a structured artefact truthfully carry the removal policy match?**
   - Yes, with a closed type union.

2. **What exact conversational wording safely represents removal, including mixed-policy and zero-match cases?**
   - Not yet governed.

The existing build history already established this separation:

```text
3.156 policy
→ 3.157 publication
→ 3.158 renderer
```

Removal should follow the same proven sequencing.

## 11. Future removal rendering question

The subsequent renderer audit/implementation will need to govern at least:

### One removal

A fixed statement equivalent to:

```text
A Calendar commitment is no longer present in this bounded Calendar window.
```

or the exact accepted policy wording adapted for conversation.

It must not say “cancelled” or “deleted”.

### Multiple removals

A deterministic count/list form without ranking.

### Mixed start-time + removal matches

The current start-time-only group heading cannot represent a mixed brief.

The renderer must choose a deterministic structure that preserves each policy fact without implying common cause or relative importance.

### Zero matches

If the live selection eventually includes both start-time and removal policies, this text becomes too narrow:

`No Calendar start-time changes matched this bounded check.`

A future zero-match template must identify the actual bounded policy set without overclaiming that nothing needs attention generally.

Those are rendering questions, not publication questions.

## 12. Live path impact

None in this sprint.

The current live path remains:

```text
compare
→ selectCalendarStartTimeAttention()
→ publishCalendarAttentionBrief()
→ renderCalendarAttentionBrief()
```

Sprint 3.165's removal selector remains isolated.

A publication-contract extension alone must not cause the live path to start selecting removal.

Live integration should occur only after publication and rendering both support removal and are independently verified.

## 13. Authority impact

None.

Publication and rendering consume already-authorised, already-compared deterministic policy matches.

They cannot:

- acquire Calendar data;
- grant authority;
- reuse prior authority;
- widen a source window;
- trigger background reads;
- reinterpret an observation reference as authority.

## 14. Readiness outcome

### Publication

**Ready.**

Use the existing `calendar_attention_brief` artefact.

Widen only its closed supported match union from start-time-only to start-time-or-removal.

### Rendering

**Not yet ready for direct implementation inside the same sprint.**

The existing renderer is intentionally policy-specific and its multi-item/zero-match wording assumes only start-time matches.

It needs its own governed extension after publication support exists.

## 15. Next sprint recommendation

Exactly one next sprint:

> **Sprint 3.167 — Calendar Attention Brief Removal Publication Support**

That sprint should:

- introduce a closed publishable match union of start-time and removal matches;
- admit `changeType: "modified" | "removed"`;
- preserve existing brief kind and semantics marker;
- preserve evidence unchanged by policy;
- prove mixed-policy publication is deterministic;
- prove added changes cannot enter without a policy match type;
- make no renderer changes;
- make no live wiring changes.

After that, and only after that, a separate renderer sprint should govern conversational removal and mixed-policy rendering.

## 16. Exit condition

Sprint 3.166 exits when the repository records this distinction:

> **The existing Calendar Attention Brief is already the correct publication artefact for removal matches; only its start-time-specific type narrowing must be widened to a closed governed union. The existing renderer is not generic and must remain fail-closed until a separate rendering contract governs removal, mixed-policy output, and revised zero-match wording.**

That is the smallest truthful next step.
