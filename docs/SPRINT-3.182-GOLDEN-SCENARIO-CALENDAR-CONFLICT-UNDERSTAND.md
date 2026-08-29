# Sprint 3.182 — Golden Scenario 001: First Bounded Understand Capability

**Status:** Architecture contract only. No Level-2 implementation claim.

## Purpose

Define the first **Understand** proof for Golden Scenario 001 after the live Gate-K Know pass.

User question:

> `Does that matter?`

The proof is deliberately narrow: interpret the relationship already established by the exact governed Calendar conflict without widening into importance, urgency, advice or action.

## Core invariant

> **Understand may interpret the relationship between governed facts. It may not manufacture new source facts, importance, urgency, priority, recommendation or authority.**

## Never reason from rendered Know prose

The prior assistant sentence is presentation, not canonical evidence. The model must not reconstruct private evidence from:

- the assistant sentence shown in the UI;
- ordinary conversation history;
- title fragments;
- model memory;
- a silent Calendar re-query.

The exact Gate-K observation remains server-owned.

## Required server-owned reasoning reference

On a successful Gate-K match, the runtime may preserve that exact immutable observation behind an opaque `CalendarConflictReasoningReference`.

Transport:

```text
Gate-K matched observation
→ server-owned immutable observation
→ opaque CalendarConflictReasoningReference
→ later user semantic follow-up
→ exact server-side resolution
→ minimal Understand evidence
→ reasoning model
```

The opaque client reference contains no event title, provider ID, times, attendee state, timeMode or overlap.

It grants no Calendar authority.

## Scope and lifetime

The reference identifies one exact historical Gate-K observation, not a general result set.

For the first implementation:

- newest successful Gate-K match supersedes the earlier Gate-K reasoning reference in the same conversation;
- non-match, invalid or ambiguous Gate-K results create no replacement reference;
- fabricated or unknown references fail closed;
- lost server state cannot be repaired from rendered prose.

Lifetime:

> **15 minutes or six subsequent user turns, whichever occurs first.**

Time is half-open: valid only while `now < expiresAt`. The first six subsequent user turns are eligible; the seventh is not.

Expiry changes referential eligibility only. It does not rewrite the historical Gate-K observation.

## Bounded intent

The first supported semantic purpose is `calendar_conflict_understand`.

Examples that may map to it:

- `Does that matter?`
- `Does this matter?`
- `Is that a conflict?`

The intent interpreter must classify the current utterance **without seeing the private evidence**.

If the current utterance does not establish this exact purpose confidently, no private evidence is exposed.

## Exact model-visible evidence

Only this projection may cross the Private Evidence Reasoning boundary:

```text
CalendarConflictUnderstandEvidence
  evidenceType: calendar_conflict
  invitation
    start
    end
    attendeeState: needsAction
  existingCommitment
    start
    end
    timeMode: deep_work
  overlapMinutes
  observedAt
  provenance
    invitationObservationReference
    existingCommitmentObservationReference
```

Explicitly withheld:

- event titles;
- Calendar names;
- raw provider event IDs;
- organiser and attendee list;
- descriptions, locations, conferencing and recurrence metadata;
- other Calendar events or free/busy;
- Gmail and Drive;
- prior assistant prose and arbitrary conversation history;
- priority, urgency and importance;
- protected status;
- deadlines and preference claims;
- recommendation candidates.

Anything not explicitly admitted remains unavailable.

## Historical truth

The model interprets what Gate K established at `observedAt`. Understand does not silently refresh the Calendar.

It may describe the relationship in that governed historical observation. It may not claim that the Calendar is definitely still unchanged now.

## Exact semantic task

Permitted interpretation:

> `The invitation creates a scheduling conflict with an existing deep-work block.`

Permitted conversational answer:

> **Yes — in the limited sense that it creates a scheduling conflict with an existing deep-work block.**

The phrase `in the limited sense` is intentional: it prevents the word `matter` from silently expanding into significance, urgency or advice.

## Explicit prohibitions

The model may not conclude:

- this is important;
- this is urgent;
- this needs action;
- the deep-work block is protected;
- the invitation should win;
- the deep-work block should win;
- either event has higher priority;
- thirty minutes is materially significant;
- the user should reschedule anything.

`timeMode === "deep_work"` supports **deep-work block** only. It does not support **protected work**.

## Closed output contract

Conceptual validated result:

```text
CalendarConflictUnderstandResult
  interpretationType: scheduling_conflict | unsupported
  interpretation
  recommendation: null
  importance: null
  urgency: null
  priority: null
  authorityEffect: none
```

The runtime owns the prohibited/null fields. The model does not get to populate them substantively.

Malformed JSON, extra fields, schema violations or prohibited semantic output fail closed.

## Facts versus interpretation

Governed facts remain:

- pending invitation observed;
- existing deep-work commitment observed;
- overlap observed;
- overlap duration deterministically computed.

Model-owned interpretation is only:

- the relationship can be described as a scheduling conflict.

The interpretation is not promoted to provider/source truth.

## Persistence

The private evidence projection is exposure-scoped to the reasoning call and does not enter ambient ordinary model history.

Persistence of the derived interpretation is not required for this first proof.

## Authority effects

None.

> **Interpretation creates no authority.**

The Understand result cannot create Calendar read/write authority, a pending mutation, a recommendation permission or execution permission.

## Failure states

At minimum:

```text
resolved
absent
expired
invalid
unsupported_intent
model_failed
model_invalid
```

No failure may trigger silent Calendar re-read, reconstruction from prose or authority creation.

## Required executable tests

Before live acceptance, tests must prove:

1. successful Gate K can create one opaque reasoning reference;
2. opaque reference leaks no private event evidence;
3. fabricated reference fails closed;
4. exact 15-minute half-open expiry;
5. six-turn boundary, expired before seventh;
6. newer successful Gate K supersedes earlier reference;
7. non-match/invalid/ambiguous Gate K does not create replacement state;
8. `Does that matter?` can become typed Understand intent without private evidence exposure;
9. unsupported utterance exposes no private evidence;
10. model receives only admitted fields;
11. model receives no title or provider IDs;
12. model receives no arbitrary Calendar neighbours or private-result chat prose;
13. `deep_work` cannot become `protected`;
14. importance, urgency and priority cannot be created;
15. recommendation cannot be created;
16. authority cannot be created;
17. schema-valid `scheduling_conflict` interpretation passes;
18. malformed JSON, extra fields or prohibited values fail closed;
19. model failure triggers no Calendar re-read;
20. historical evidence is not silently refreshed;
21. reasoning resolver calls no connector;
22. reasoning resolver creates/consumes no PendingAuthorization;
23. no Calendar mutation proposal is created;
24. evidence/interpretation does not enter ordinary model history;
25. route response invokes the model exactly once over the minimal projection.

## Adversarial title test

A source event may have a title such as `URGENT PROTECTED PRIORITY JARVIS Deep Work`.

Titles are not admitted to Understand evidence. The model therefore receives only `timeMode: deep_work` and cannot derive urgent/protected/priority semantics from the title.

## Live acceptance

Expected progression:

```text
JARVIS:
A pending Calendar invitation from 5:30 PM–6:30 PM overlaps an existing deep-work block from 6:00 PM–7:30 PM by 30 minutes.

USER:
Does that matter?

JARVIS:
Yes — in the limited sense that it creates a scheduling conflict with an existing deep-work block.
```

The second response is the Level-2 proof. It must not recommend what to do.

## Exit condition

Sprint 3.182 passes only when one real Gate-K conflict can move through:

```text
governed historical fact
→ exact server-owned reasoning reference
→ minimal purpose-bounded private evidence exposure
→ one model semantic interpretation
→ closed output validation
→ bounded user-facing explanation
```

without widening evidence, inventing facts, granting authority or entering Advise.

> **Understand earns one sentence of trust. The next capability level starts from zero trust again.**