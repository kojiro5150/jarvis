# Sprint 3.152d — Calendar Projection Fidelity and Residual Truthfulness Closure

**Status:** Corrective implementation  
**Sprint type:** Bounded implementation implication  
**Baseline:** merged main after Sprint 3.153 roadmap reconciliation  
**Architecture status:** frozen; no redesign authorized

## Trigger

Live validation exposed a Calendar truthfulness regression after the prior 3.152c closure.

Observed transcript:

- user supplied: `My 9 a.m. meeting tomorrow is a finance review.`
- governed Calendar acquisition was explicitly confirmed;
- the provider projection contained 10:00–11:00 and 15:00–16:00;
- JARVIS presented 09:00–10:00 and 15:00–16:00, dropping the real 10:00 commitment;
- later recall used current-possession wording such as `calendar data I can access`.

This is an implementation failure inside the frozen architecture, not a policy or architecture gap.

## Frozen invariants

1. User-supplied Calendar detail is ordinary conversation, not authority.
2. Calendar acquisition requires current explicit authority or valid server-owned pending authorization.
3. The governed Calendar projection is authoritative for Calendar-derived commitment times.
4. User detail may bind only by exact commitment start time.
5. An unmatched user time must remain unbound.
6. A model may not create, delete, substitute, shift or reorder projected commitments.
7. Projection omission does not prove source/provider metadata absence.
8. Recall of a prior visible Calendar result is not current Calendar access.

## Root causes

### Natural fact grammar gap

The bounded timed-detail recognizer accepted:

`My 9 a.m. meeting is the finance review.`

but not the equally bounded variant:

`My 9 a.m. meeting tomorrow is a finance review.`

The ordinary-fact deterministic acknowledgement therefore did not run.

### Recall grammar gap

`What are those meetings about?` was not included in the narrow Calendar recall grammar, even though the detail-follow-up grammar already accepted `those`.

### Projection-fidelity gap

The current authorized Calendar result was passed into GovernedContext and the final schedule prose was model-generated. Existing guards protected exact user-detail binding and provenance wording but did not independently prove that the model preserved the complete projected commitment interval set.

### Residual current-possession wording

The recall guard did not include the observed family:

`calendar data I can access`

within the whole-response unsafe source-possession detector.

## Bounded correction

### Timed user fact

The deliberately narrow grammar now accepts optional `today` / `tomorrow` immediately after `meeting` or `commitment`, while preserving exact clock extraction and ordinary user provenance.

Optional leading articles `a`, `an`, and `the` are representation-neutral label syntax and are not retained as part of the label.

### Recall

The bounded recall grammar now accepts:

`What are those meetings about?`

and the existing exact detail follow-up remains presentation-only evidence.

### Deterministic projection fidelity

For a current governed Calendar read, the server now computes the exact expected projected interval set from the governed commitments.

The model response is accepted only if its reported commitment intervals exactly equal that set.

Any:

- missing interval;
- extra interval;
- substituted interval;
- shifted interval;

fails closed to the deterministic server Calendar formatter.

The deterministic formatter also attaches only exact server-derived user bindings and emits an explicit unbound note for unmatched user-supplied clocks.

Model output cannot replace a 10:00 commitment with a user-supplied 09:00 statement.

### Residual truthfulness

The recall source-possession detector now covers `calendar data I can access` alongside the existing bounded unsafe wording families.

## Exact regression

A route-level regression reproduces the live failure:

1. user says the 9 a.m. meeting tomorrow is a finance review;
2. ordinary model attempts a false Calendar capability denial;
3. user asks what is on tomorrow;
4. governed path asks for explicit confirmation;
5. connector returns 10:00–11:00 and 15:00–16:00;
6. model attempts to present 09:00–10:00 and 15:00–16:00;
7. final response is deterministically corrected to 10:00–11:00 and 15:00–16:00;
8. the 09:00 finance-review detail is shown only as unmatched user-supplied information;
9. `What are those meetings about?` is treated as recall;
10. no current Calendar-possession wording survives.

A second regression proves the projection-fidelity backstop independently of user binding: a model substitution from 10:00 to 09:00 fails closed to the deterministic projected schedule.

## Non-goals

This sprint does not change:

- Calendar authority;
- PendingAuthorization;
- connector acquisition;
- Calendar read windows;
- provider projection fields;
- Gmail;
- Drive;
- Memory;
- specialist routing;
- role inference;
- Executive Cognition;
- voice authority semantics;
- legacy runtime architecture.

## Classification

**IMPLEMENTATION IMPLICATION.**

The existing architecture already requires exact binding and governed projection truthfulness. This sprint makes those constraints deterministically enforceable at final current-read presentation.

## Acceptance

Before merge:

- focused Calendar regressions pass;
- full test suite passes;
- lint passes;
- typecheck passes;
- build passes;
- exact-head CI passes.

After merge, repeat the live failing scenario with a hard JARVIS conversation/session reset.

Expected invariant:

```text
provider projection: 10:00 + 15:00
user statement: 09:00 finance review

final current Calendar presentation:
10:00 + 15:00
09:00 remains explicitly unbound

never:
09:00 substitutes for 10:00
```
