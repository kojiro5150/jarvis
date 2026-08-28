# Sprint 3.175 — Deterministic Weekly Allocation Renderer

**Status:** Implemented  
**Sprint type:** Governed conversational rendering  
**Baseline:** merged Sprint 3.174

## Purpose

Sprint 3.174 established a governed `calendar_weekly_time_allocation` publication that can exist only when:

```text
period = this_week
coverage = bounded_complete_request
arithmetic reconciles
```

Sprint 3.175 makes that governed artefact conversationally useful without allowing a model to reinterpret it.

The user-facing question is intentionally narrow:

> How is my week allocated?

## Proposal and authority

The weekly-allocation question proposes:

```text
calendar.read
window.period = this_week
purpose = calendar_weekly_allocation
```

The proposal does not grant authority.

The existing Calendar authority boundary remains unchanged:

```text
weekly allocation question
        ↓
ASK for explicit Calendar confirmation
        ↓
user confirms
        ↓
authorised bounded this-week read
```

The purpose is retained in the server-owned pending operation so a later bare `Yes` cannot manufacture or widen the original request.

## Deterministic renderer

The renderer consumes only the governed Sprint 3.174 publication.

It outputs the closed mode vocabulary in a fixed order:

```text
Routine / Transactional
Deep Work / Discovery
Reflection
Development
Self-Care
Unclassified
```

It also reports semantic-classification-unavailable time when non-zero and the resolved occupied timed-event total.

No model participates.

## Arithmetic truth

The renderer re-checks the publication before displaying it:

```text
sum(minutesByMode)
+ semanticUnavailableMinutes
= totalTimedMinutes
```

If reconciliation fails, the renderer returns no allocation.

`precedenceTieMinutes` is already contained inside `Unclassified` and is never added to the total again.

## Coverage truth

A successful response states:

```text
Coverage: complete for this bounded weekly Calendar read.
```

If the live Calendar result is partial or legacy-bounded without completeness proof, JARVIS does not render category totals and instead reports that a truthful full-week allocation cannot be given from that read.

## Diagnostic facts

When applicable, the renderer may state deterministic factual exclusions:

- equal-duration overlap tie time contained within `Unclassified`;
- all-day event count excluded from timed allocation;
- invalid timed-event count that could not be safely allocated.

These are descriptive diagnostics only.

## Frozen invariants

1. The weekly-allocation question never grants Calendar authority.
2. Fresh explicit confirmation is required before acquisition.
3. Only `this_week` may produce this renderer path.
4. Only the Sprint 3.174 governed publication may be rendered.
5. Partial coverage never produces full-week mode totals.
6. Arithmetic is independently reconciled before rendering.
7. Mode order and labels are deterministic.
8. Tie minutes are not double-counted.
9. No event titles are displayed or used for mode inference.
10. No model participates in the weekly allocation reply.
11. No percentages are introduced.
12. No adequacy judgment is introduced.
13. No targets are introduced.
14. No recommendations are introduced.
15. No Calendar writes are introduced.

## Regression proof

Tests prove:

- `How is my week allocated?` proposes a bounded `this_week` Calendar read with `calendar_weekly_allocation` purpose;
- the proposal remains ASK without current explicit read authority;
- the renderer produces fixed deterministic mode rows;
- arithmetic mismatch fails closed;
- tie minutes are not counted twice;
- judgment/recommendation wording is absent;
- the live chat path asks for fresh Calendar confirmation;
- after confirmation, the Barwon-style 7-hour routine block with a one-hour self-care carve-out renders as 6h routine + 1h self-care = 7h total;
- the model is not called;
- partial weekly acquisition withholds category totals.

## Authority

Unchanged.

This sprint does not create, reuse, or expand Calendar authority.

It adds no write capability.

## Non-goals

Sprint 3.175 does not implement:

- percentages;
- balance scores;
- ideal weekly mix;
- working-hours assumptions;
- protected-time adequacy;
- fragmentation analysis;
- recommendations;
- schedule proposals;
- Calendar writes;
- model interpretation of the allocation.

## Next step

Only after live UI acceptance of this factual weekly allocation should a later sprint consider a new policy question:

> Is my week protecting enough time for deep work, reflection, development and self-care?

That is not a rendering problem. It would introduce explicit adequacy policy and therefore requires its own governed contract.

## Exit condition

```text
"How is my week allocated?"
        ↓
fresh Calendar authority
        ↓
complete bounded this-week acquisition
        ↓
Sprint 3.173 resolved allocation
        ↓
Sprint 3.174 governed publication
        ↓
Sprint 3.175 deterministic renderer
        ↓
factual weekly allocation only
```

with partial coverage and arithmetic mismatch failing closed.
