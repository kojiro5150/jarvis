# Sprint 3.38 — Executive Session Composition

## Outcome

The completed Operational Layer now has its first immutable Interaction Layer consumer:
`ExecutiveSession`.

```text
ExecutiveRunRecord
        ↓
ExecutiveOperationalState
        ↓
ExecutiveSession
```

Exactly one session is composed per operational state and exposed as `executiveSession` on the
operational result. Its deterministic identity uses only the operational-state identity and session
schema version; its canonical timestamp reuses runtime completion evidence already referenced by
the state.

## Context, not reconstruction

The session answers only which executive context currently governs interaction. It retains
references for executive identity, active objective, capabilities, operational health, completion,
and optional specialist context. It never copies an operational payload or constitutional runtime
publication and owns no conversation, prompts, memory, reasoning, planning, routing, execution,
specialist behaviour, connector, browser, or UI state.

Interaction mode is deterministic: failed health produces `OBSERVATION`, a healthy state with no
objective produces `IDLE`, and a healthy state with an objective produces `EXECUTIVE`. `SPECIALIST`
is part of the closed mode contract but requires a future explicit operational specialist selection;
this sprint neither infers nor invokes one.

## Boundaries

The constitutional runtime remains frozen and terminates at `ExecutiveRunRecord`.
`ExecutiveOperationalState` continues to consume that record. `ExecutiveSession` consumes only the
operational state, imports no runtime engine, and cannot re-enter or extend the runtime. Future
conversation and presentation systems consume the session rather than redefining this foundation.

## Canonical Executive Foundation

```text
Constitutional Runtime

Projection
      │
State
      │
Context
      │
Attention
      │
Situation
      │
Assessment
      │
Deliberation
      │
Intent
      │
Constraint
      │
Planning
      │
Evaluation
      │
Comparison
      │
Reasoning
      │
Proposal
      │
Routing
      │
Invocation
      │
Execution
      │
ExecutiveRunRecord

══════════════════════════════════════

Operational Layer

ExecutiveOperationalState

══════════════════════════════════════

Interaction Layer

ExecutiveSession
```
