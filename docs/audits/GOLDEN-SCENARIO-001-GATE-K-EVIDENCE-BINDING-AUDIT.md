# Golden Scenario 001 — Gate K Evidence Binding Audit

**Status:** Audit only. No new Calendar semantics, model exposure, recommendation or write capability is implemented here.

## Question

Can the current repository already prove the full Level-1 statement:

> A new Calendar invitation from 1:00–2:00 PM overlaps the existing JARVIS deep-work block from 1:30–3:00 PM by 30 minutes.

## Conclusion

**Not yet as one end-to-end governed observation.** The repository proves the ingredients separately, but there is no single governed projection with a shared identity that joins membership-change truth, invitation state, deep-work mode and deterministic overlap.

That missing work is narrow and directly required by Golden Scenario 001.

## What already exists

- `calendar-attention-observation-comparison.ts` emits an exact `added` change only from compatible complete bounded observation sets.
- Governed Calendar evidence owns the stable commitment identity `google-calendar:calendar:<calendarId>:event:<eventId>`.
- `CalendarEvent.timeMode` is derived only from explicit event-label identity plus the closed label-name mapping; title and color are excluded.
- `CalendarEvent.selfAttendeeResponse` preserves the provider response for the authenticated attendee.
- `calendar-conflict-observation.ts` computes overlap deterministically as `max(start) -> min(end)` and proves the exact 30-minute scenario.

## Gap 1 — identity mismatch

The canonical attention observation uses the stable governed commitment reference as its `id`. The new conflict projection currently uses raw `CalendarEvent.id`.

Therefore the two paths cannot yet be joined safely by identity. The commitment-reference formula should exist in one server-owned helper and be reused by both paths.

## Gap 2 — invitation evidence is not yet governed for this purpose

`selfAttendeeResponse` exists on the canonical connector event but does not enter the attention observation or current conflict projection.

For the first Golden Scenario proof, use the narrow criterion:

> A structurally added event may be called a **pending invitation** only when its purpose-specific governed projection contains `selfAttendeeResponse === "needsAction"`.

Do not infer invitation status from title, Calendar name, appearance alone, or conversation history.

## Gap 3 — deep-work mode is present but not joined

`timeMode === "deep_work"` is already legitimate provider-backed governed classification. But it is not carried by the attention observation used for membership-change identity.

Gate K may say **deep-work block** only when the purpose-specific projection carries `timeMode === "deep_work"`.

`deep_work` does not mean `protected`. Protection remains a separate future user/policy rule.

## Why not widen the general factual projection

`GovernedCalendarFactualEvent` currently contains title/start/end/calendarName for the closed factual-query renderer. It lacks stable commitment identity, timeMode and self attendee response.

Do not widen that general projection merely because Golden Scenario 001 needs more fields. Add one purpose-bounded conflict projection instead.

## Required purpose-specific projection

Minimum shape:

```text
GovernedCalendarConflictEvent
  commitmentReference
  title
  start
  end
  calendarName
  timeMode
  selfAttendeeResponse
  observedAt
  provenanceReference
```

Rules:

- `commitmentReference`: exactly the same canonical identity used by attention observations.
- `title`: provider title admitted only for this deterministic publication.
- `start/end`: provider-backed timed interval.
- `timeMode`: preserve only an already-governed mode.
- `selfAttendeeResponse`: preserve only provider-backed authenticated-user response.
- `observedAt`: acquisition timestamp.
- `provenanceReference`: same commitment provenance family as governed Calendar evidence.

## Required deterministic binding

```text
previous complete observation set
+ current complete observation set
-> CalendarAttentionObservationChangeSet
-> change.type === added
-> exact commitmentReference join
-> selfAttendeeResponse === needsAction
-> pending invitation
-> overlapping current event with timeMode === deep_work
-> deterministic overlap
-> Gate-K observation
```

No title matching, fuzzy matching, semantic similarity or model selection is permitted.

## Meaning of 'new'

For this scenario, `new` means only:

> structurally added between two compatible complete bounded governed Calendar observations.

It does not mean provider-created recently, newly important, newly accepted, or newly noticed.

Thus `new invitation` is the conjunction of:

```text
structurally added
AND
selfAttendeeResponse === needsAction
```

## Completeness

The 'new' claim requires both previous and current observation sets to be `bounded_complete_request`. If either is partial, overlap may still be computed for two observed events, but the system must not call one newly added from bounded membership comparison.

## No attention-policy dependency

This scenario does not need an `attention.commitment.added` policy. The repository can observe `added` structurally without claiming the event independently 'needs attention'. Gate K needs only added + pending-invitation evidence + deep-work evidence + overlap. Whether that matters belongs to Gate U.

## Single-invitation scope

Golden Scenario 001 contains exactly one newly added pending invitation.

For this first Gate-K implementation:

- zero added events with `selfAttendeeResponse === "needsAction"` → `not_found`;
- exactly one → continue deterministic overlap binding;
- more than one → `ambiguous_pending_invitation` and emit no Gate-K conflict observation.

Do not choose among multiple pending invitations by recency, title, provider order, duration, overlap size or model judgement.

This is a scenario-scope boundary, not a claim that future JARVIS cannot handle multiple simultaneous invitations.

## Multiplicity

If more than one deep-work event overlaps the same added pending invitation, do not silently select one. Emit all exact overlapping conflicts in this total order:

1. existing deep-work commitment start time ascending;
2. if start times are equal, canonical `commitmentReference` ascending.

Do not use provider iteration order, array insertion order, title, priority, duration or model judgement as a tie-breaker.

The executable Gate-K test must construct at least two overlapping deep-work commitments in non-sorted input order and assert this exact output order.

## Exact next implementation

1. Centralize the canonical Calendar commitment-reference helper and reuse it in governed evidence plus conflict projection.
2. Extend the purpose-specific conflict projection with `observedAt`, `provenanceReference`, and provider-backed `selfAttendeeResponse`.
3. Add a deterministic adapter that consumes an already-valid change set plus current conflict events, selects exact `added` identities, requires `needsAction`, finds overlapping `deep_work` events, and emits immutable typed Gate-K observations.
4. Regress the exact 30-minute case, absent mode, absent `needsAction`, identity mismatch, multiplicity with start-time/commitment-reference ordering, and no model/authority/connector use in the binding adapter.

## Verdict

**Gate K is feasible with one narrow evidence-binding slice.**

No new general Calendar architecture is required. No Gmail referential machinery is required. No private semantic reasoning is required. No recommendation or write work should begin until this Level-1 trace is executable end to end.