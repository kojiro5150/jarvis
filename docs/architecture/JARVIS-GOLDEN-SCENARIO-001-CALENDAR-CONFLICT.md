# JARVIS Golden Scenario 001 — Calendar Conflict

**Status:** Historical design/proving contract. **Golden Scenario 001 achieved LIVE PASS on 29 August 2026.** See `docs/GOLDEN-SCENARIO-001-LIVE-PASS.md` for the frozen completion record.

> This document is retained as the historical proving contract. Its earlier planning language is not rewritten to make the past resemble the completed state.

## Purpose

This scenario is the first end-to-end proving case for the JARVIS capability progression:

```text
Know → Understand → Advise → Act
```

It is deliberately narrow: one new Calendar invite and one existing commitment. The purpose is to test whether the same governed architecture can preserve truth, inference boundaries, recommendation boundaries, authority and execution integrity as consequence increases.

This is a **destination scenario**. It spans all four capability levels and must not be read as evidence that Sprint 3.181 or 3.182 alone makes the full interaction reachable.

## Initial state

- Existing commitment: `JARVIS deep work`, Tuesday 1:30–3:00 PM.
- New invitation: Tuesday 1:00–2:00 PM.
- The two commitments overlap by 30 minutes.
- No Calendar write authority has been granted.

## Temporal truth invariant

Know does not freeze the external world.

Know produces a **timestamped, immutable observation** of what was true when the governed read occurred. That observation is never rewritten later merely because the external Calendar changes.

A later divergence therefore has two possible meanings that must remain distinguishable:

1. the original observation was wrong; or
2. the observation was correct when made, but the world changed afterwards.

The system must not collapse those cases.

> **A historical governed observation remains true as a record of what was observed at that time. Current execution decisions must use current state, not assume the earlier observation is still live.**

## Level 1 — Know

Example user question:

> `Anything I need to know about Tuesday?`

Expected factual result:

> A new invitation exists from 1:00–2:00 PM and overlaps the existing JARVIS work block from 1:30–3:00 PM by 30 minutes.

### Acceptance criteria

- Both commitments come from governed Calendar evidence.
- The overlap is computed deterministically.
- The observation records the time at which it was established.
- The observation is immutable as historical evidence.
- No model may manufacture the existence, timing, identity or overlap of either event.
- No recommendation is made.

## Level 2 — Understand

Example user question:

> `Does that matter?`

Example bounded interpretation:

> `Yes — in the limited sense that it creates a scheduling conflict with an existing deep-work block.`

### Acceptance criteria

- Private evidence exposure is permitted only under the approved private-evidence reasoning contract.
- The model may interpret the relationship between governed facts.
- The overlap fact itself remains grounded in deterministic evidence.
- The response must distinguish factual observation from semantic interpretation.
- `deep_work` must not be silently upgraded to `protected`.
- “matters” is bounded here to the existence of a scheduling conflict; it does not imply importance, urgency or priority.
- No recommendation about what to do is made.

## Level 3 — Advise

Example user question:

> `What would you do?`

Example recommendation after an explicit user preference and fresh current availability check:

> `Given your preference to keep the invitation when the full deep-work block can be preserved, I'd keep the invitation and move the deep-work block to 3:00–4:30 PM.`

### Acceptance criteria

- Recommendation is explicitly distinguishable from fact.
- Advice is grounded in the governed current situation plus an explicit user goal/preference sufficient to justify the trade-off.
- A fresh authorised Calendar read is required before claiming candidate availability.
- The first proof evaluates exactly one deterministic candidate: immediately after the current deep-work block, preserving its full duration.
- Factual availability and recommendation remain separate epistemic types.
- Uncertainty and assumptions are surfaced where material.
- The recommendation creates no authority to change the Calendar.
- Level 2 success is not treated as inherited proof that Level 3 advice is legitimate.

## Level 4 — Act

Example user instruction:

> `Okay, move the work block.`

Conceptual execution flow:

```text
natural-language instruction
→ typed Calendar mutation proposal
→ deterministic validation
→ current-state re-verification
→ exact pending authorization
→ explicit human confirmation
→ current-state re-verification if required by elapsed time / changed state
→ Calendar write
→ external-state verification
→ truthful completion response
```

### Acceptance criteria

- The model may not originate the Calendar mutation proposal or grant permission to perform it; the first Act proposal is derived deterministically from the successful server-owned advice record.
- The exact proposed mutation must be represented independently of model prose.
- The first Act proof requires a write-capable Google Calendar grant; the current read-only OAuth grant is insufficient and requires explicit scope migration/re-consent.
- Current Calendar state must be checked once before exact write confirmation and again immediately before execution.
- If the proposed slot or relevant source event has changed since the proposal was formed, execution must fail closed and a new proposal must be generated from current state.
- A stale Know-time snapshot must never be treated as sufficient authority or sufficient execution state.
- A changed world must not be misclassified as a false historical observation.
- Human confirmation applies only to the exact current proposal.
- The Calendar write must be verified against external state after execution.
- `Done` may be returned only after the write has been externally verified.

## State-change example

At 1:47 PM, JARVIS observes:

- invite: 1:00–2:00 PM;
- JARVIS work block: 1:30–3:00 PM;
- proposed replacement slot: 3:00–4:30 PM is free.

At 1:52 PM, before execution, another event appears at 3:30–4:00 PM.

Correct behaviour:

1. preserve the 1:47 PM observation as historically valid;
2. re-read current Calendar state;
3. detect that the proposed 3:00–4:30 PM slot is no longer free;
4. do **not** execute the stale proposal;
5. fail closed;
6. generate a new proposal from current state;
7. require fresh confirmation for the new exact mutation.

Incorrect behaviour:

- executing the 1:47 PM proposal against stale availability;
- rewriting the 1:47 PM observation as though it had never been true;
- treating the user's earlier confirmation as permission for a materially different slot.

## Overarching invariant

> **No later capability level may rewrite the historical truth of an earlier governed observation. Later levels must re-check current state whenever current state is required for safe reasoning or execution.**

## Active vertical proving thread

This scenario is now the active vertical proving thread for the next capability work. Adjacent discoveries may still be recorded, but they do not become implementation work automatically.

### Scope-discipline rule

Before starting any adjacent task, ask:

> **Does this task answer a question Golden Scenario 001 actually needs answered to advance its current capability level?**

If **yes**, it may enter the active thread.

If **no**, it must be either:

1. explicitly named as a deliberate detour, with a bounded stop condition; or
2. deferred to the backlog without implementation.

A locally valuable adjacent problem is not sufficient reason to displace the active proving case.

### Reuse-before-redesign rule

Where the repository already contains a proven pattern that satisfies the scenario's requirement, reuse that pattern before inventing a new one.

For Level 4, the historical/current-state rule is already established:

> **Later operations may discover that the world has changed. They may not rewrite what was previously observed.**

Calendar execution therefore reuses the same separation already established elsewhere:

- historical observation remains historically true;
- current execution state is checked independently;
- divergence is reported as changed current state, not rewritten history;
- stale proposals fail closed.

### Fixed scenario

The first vertical proof uses exactly these governed facts:

- existing Calendar event: `JARVIS deep work`, Tuesday 1:30–3:00 PM;
- its governed `timeMode` is `deep_work` only if supplied by the existing explicit event-label mapping;
- new invitation: Tuesday 1:00–2:00 PM;
- overlap: 30 minutes;
- no Calendar write authority exists initially.

The event title must never be used to infer `deep_work`, protection, priority, urgency or importance.

If an eventual Level-2 statement uses the word **protected**, that property must come from an explicit approved user/policy rule. `deep_work` alone does not silently imply `protected`.

### Vertical proof gates

#### Gate K — Know

Required output:

> A 1:00–2:00 PM invitation overlaps the 1:30–3:00 PM JARVIS deep-work block by 30 minutes.

Required proof:

- both event identities/times come from governed Calendar evidence;
- `deep_work` comes only from the existing explicit label-to-mode mapping;
- overlap is computed deterministically as `max(start) → min(end)`;
- observation carries `observedAt`;
- no model call is required;
- no recommendation or importance judgement is emitted.

#### Gate U — Understand

User question:

> Does that matter?

The first private-evidence reasoning exposure is deliberately minimal. The reasoning model may receive only a typed governed representation equivalent to:

```text
scenario: calendar_overlap
invite:
  start
  end
  status / attendee response if observed and admitted
existing_commitment:
  start
  end
  timeMode: deep_work
overlapMinutes: 30
observedAt
provenance references
```

It does **not** automatically receive:

- arbitrary surrounding Calendar events;
- descriptions;
- attendees other than an explicitly admitted self-response field;
- email;
- Drive;
- hidden conversation history;
- priority, urgency or importance labels not present in governed evidence.

Permitted Level-2 conclusion:

> The invitation creates a scheduling conflict with an existing deep-work block.

Not yet permitted without an additional explicit rule:

> The invitation conflicts with protected work.

No recommendation is allowed at this gate.

#### Gate A — Advise

User question:

> What would you do?

This gate requires facts and recommendation to remain separate.

Before a recommendation can be earned, JARVIS must establish:

- the historical conflict observation;
- an explicit user preference sufficient to choose which commitment should yield;
- a fresh authorised current Calendar observation;
- that the relevant invitation and deep-work block still support the current advice calculation;
- the duration required for the work block;
- the first deterministic candidate slot, beginning immediately after the current deep-work block and preserving its full duration;
- complete bounded evidence that the candidate slot is free.

A recommendation such as:

> Keep the invitation and move the JARVIS block to 3:00–4:30 PM.

is legitimate only when an explicit user preference supports that trade-off and a fresh complete Calendar observation proves 3:00–4:30 PM is currently free.

`3:00–4:30 PM is free` is a factual claim.

`Keep the invitation` is advice.

They must not be represented as the same epistemic type.

No Calendar write authority is created by the recommendation.

#### Gate X — Act

User instruction:

> Do it.

The execution sequence is fixed:

```text
resolved recommendation
→ exact typed Calendar mutation proposal
→ exact target event identity
→ exact proposed start/end
→ fresh read authority for Act validation
→ current-state re-read of source event and target slot
→ deterministic comparison with proposal assumptions
→ exact immutable move proposal
→ explicit human confirmation for that exact proposal
→ immediate pre-write re-verification
→ exact Calendar write
→ independent post-write external verification
→ Done
```

If current state differs materially at either re-verification point:

- do not execute the stale proposal;
- preserve the historical Know observation;
- report the current-state divergence;
- construct a new proposal from current state;
- require fresh confirmation.

No earlier confirmation transfers to a changed target slot or changed source event.

The first Act proof supports only moving the exact recommended deep-work event to the exact recommended candidate interval. It does not accept/decline the invitation, move the invitation, create/delete events, or search for a replacement target slot.

A provider write response is not completion evidence. `Done` is permitted only after an independent post-write Calendar read verifies the same event identity at the exact target start/end with unchanged duration.

### Vertical completion criterion

Golden Scenario 001 is not complete because all four components exist separately.

It is complete only when one traceable scenario can demonstrate:

```text
same governed Calendar situation
→ Know fact
→ Understand interpretation
→ Advise recommendation
→ Act exact mutation
→ current-state verification
→ post-write verification
```

with every sentence attributable to the capability level that earned it.

Until then, the project must prefer work that advances this trace over adjacent capability expansion.

## Proving discipline

This scenario is implemented incrementally:

```text
3.180c
natural intent → governed authority

3.180d
Know

3.181
private evidence reasoning contract

3.182
Understand

post-3.182 pause
did governed understanding materially reduce cognitive burden?

later Level 3 contract
Advise

later Level 4 contract
Act
```

The project must not implement all four levels in one sprint merely because they share one scenario.

Each level remains a separate proof obligation and must re-earn trust independently.
