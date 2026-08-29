# JARVIS Golden Scenario 001 — Calendar Conflict

**Status:** Design / proving scenario. Not an implementation claim.

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

> `Yes. The invitation creates a scheduling conflict with work you had already protected.`

### Acceptance criteria

- Private evidence exposure is permitted only under the approved private-evidence reasoning contract.
- The model may interpret the relationship between governed facts.
- The overlap fact itself remains grounded in deterministic evidence.
- The response must distinguish factual observation from semantic interpretation.
- No recommendation about what to do is made.

## Level 3 — Advise

Example user question:

> `What would you do?`

Example recommendation:

> `I would keep the invitation and move the remaining JARVIS work block later, assuming that work has no fixed deadline.`

### Acceptance criteria

- Recommendation is explicitly distinguishable from fact.
- Advice is grounded in the governed current situation plus approved goals, plans and constraints.
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

- The model may propose the Calendar mutation but may not grant permission to perform it.
- The exact proposed mutation must be represented independently of model prose.
- The target slot must be checked against **current Calendar state immediately before execution**.
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
