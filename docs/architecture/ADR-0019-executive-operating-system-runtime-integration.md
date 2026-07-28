# ADR-0019: Executive Operating System runtime integration

- **Status:** Accepted
- **Date:** 2026-07-28

## Context

The deterministic Executive Operating System pipeline exists as independently validated packages, but was not composed into a production-accessible runtime. Composition must not transfer domain reasoning or connector responsibilities into orchestration.

## Decision

Introduce a deterministic orchestration layer beginning at a validated `ProjectionArtifactSet` and ending at a `GovernedActionProposalSet`. The runtime sequences each existing engine once, retains canonical stage products, validates the orchestration boundary, emits an immutable ordered trace, and fails atomically with a typed stage error.

## Runtime boundary

The runtime accepts projected observations plus explicit deterministic snapshot and existing-engine configuration. Connectors, source queries, authentication, and projection adapters remain outside it. The explicit previous snapshot is the immutable baseline required by the established snapshot lifecycle; the runtime does not invent one.

## API boundary

`POST /api/eos/run` accepts the serialisable `ExecutiveOperatingSystemInput`, whose `projectionArtifacts.artifacts` are validated projection artifacts. It returns the canonical runtime result. It does not invoke Calendar or any other connector, an adapter, an LLM, persistence, approval, or execution.

## Testing strategy

### Frozen golden runtime test

A hand-constructed immutable `ProjectionArtifactSet` models a fictional Aurora governance review using fixed identifiers and timestamps. It provides deterministic replay, regression protection, stage-order verification, immutability checks, and complete-pipeline validation.

### Calendar adapter compatibility test

A separate frozen fictional Calendar fixture, fixed observation boundary, and in-memory connector are passed through the existing Calendar Projection Adapter and then into the runtime. This proves adapter/runtime compatibility without a live connector or credentials.

Neither path calls a live connector.

## Time determinism

Fixtures and snapshot boundaries use fixed timestamps. The runtime does not read the system clock, and tests do not depend on today, a moving seven-day window, randomness, or network state.

## Consequences

The architecture gains its first deterministic end-to-end runtime without coupling connector behaviour to orchestration. Callers must supply the prior snapshot and deterministic configurations required by the existing packages. Complete stage products and the trace increase response size in exchange for auditability and replay comparison.

## Deferred work

- human approval
- authorised execution
- chat integration
- PHDSS integration
- live connector invocation
- persistence
- multi-source runtime assembly
