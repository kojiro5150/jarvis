# Executive Session

`ExecutiveSession` is the immutable Interaction Layer context built on the completed Operational
Layer.

```text
ExecutiveOperationalState
        ↓
ExecutiveSession
```

Each operational state produces exactly one deeply immutable, deterministic session. The session
identity is derived only from the operational-state identity and session schema version. Its
canonical creation time is the referenced runtime completion time, so replay introduces neither a
clock nor any other hidden input.

The session carries only identities and references for the current executive, active objective,
interaction mode, optional specialist context, active capabilities, operational health, and runtime
completion. It does not contain operational payloads, runtime publications, conversation, prompts,
memory, reasoning, planning, routing, execution, or UI state. Specialist fields establish inert
context only; they never select, invoke, or execute a specialist.

The initial deterministic modes are `EXECUTIVE`, `SPECIALIST`, `OBSERVATION`, and `IDLE`. A failed
operational state is observed, a healthy state without an objective is idle, and a healthy state
with an objective is executive. `SPECIALIST` is reserved for an operational state that can supply
an explicit specialist selection; Sprint 3.38 does not fabricate one.

The dependency is one way: the session composer accepts `ExecutiveOperationalState`, never a run
record or runtime publication, and imports no runtime engine.
