# Executive Interaction Processing

`ExecutiveInteractionProcessor` is the first executable component after the Executive Interface
Layer. It consumes exactly one immutable `ExecutiveInteractionContract` and publishes exactly one
deeply immutable `ExecutiveInteractionResult`.

The processor owns contract validation, readiness determination, and bounded deterministic
summaries. It does not converse, prompt, reason, route, plan, execute, render, reconstruct a
session, or access runtime or operational state. The result references its source contract by
`interactionContractId`; it does not embed contract or foundation payloads.

## Validation and readiness

Validation checks the supported schema, content-addressed contract integrity, ownership metadata,
authority boundaries, interaction constraints, and required lineage references. Failure never
throws, repairs, or recovers the input. Instead, ordered immutable findings identify a code,
`ERROR` severity, message, and affected field, and readiness is `UNAVAILABLE`.

For a valid contract, `EXECUTIVE` and `SPECIALIST` modes are `READY`; `OBSERVATION` and `IDLE` are
`READ_ONLY`. These explicit rules use no heuristic or inferred data. `READ_ONLY` describes an
interaction mode; it does not weaken the contract's universal prohibition on execution. Available
channels, capability counts, specialist presence, and authority flags are deterministic summaries.

## Immutable publication

The published result body contains the result schema and processor versions, contract reference,
readiness, summaries, status, findings, and ownership metadata. SHA-256 over that exact canonical
body produces `interactionResultId`. Processing has no clock, randomness, locale-sensitive sort,
external access, or input mutation, so replay is deterministic.

```text
Constitutional Runtime
        ↓
ExecutiveRunRecord
══════════════════════
Operational Layer
        ↓
ExecutiveOperationalState
══════════════════════
Executive Session Layer
        ↓
ExecutiveSession
══════════════════════
Executive Interface Layer
        ↓
ExecutiveInteractionContract
══════════════════════
Executive Interaction Processing
        ↓
ExecutiveInteractionResult
══════════════════════
Applications

DAWNWATCH
MARCUS
Chat
Voice
Dashboard
Automation
API
Testing
```

Future validation rules and result schema versions may be added explicitly without importing an
earlier foundation layer or changing the contract. Future chat, voice, dashboards, automation,
APIs and executive applications consume `ExecutiveInteractionResult` rather than
`ExecutiveInteractionContract` directly.
