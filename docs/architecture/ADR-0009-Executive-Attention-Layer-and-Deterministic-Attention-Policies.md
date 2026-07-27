# ADR-0009 — Executive Attention Layer and Deterministic Attention Policies

**Status:** Accepted  
**Date:** 27 July 2026

## Context

The Observation Layer constructs and compares canonical Situational Awareness snapshots. Change sets can contain more information than downstream systems should inspect, but selection cannot be embedded in connectors, Projection Adapters, ProjectionEngine, or snapshot comparison. Opaque model-generated salience would undermine determinism and inspectability. Future briefing, specialist, and planning systems therefore need a governed boundary that remains separate from interpretation and action.

## Decision

The Executive Operating System contains an Executive Attention Layer after snapshot comparison. It consumes canonical `SituationalAwarenessChangeSet` values only. Explicit, synchronous, provider-independent Attention Policies are registered through a bounded registry and evaluated by `ExecutiveAttentionEngine`. The result is an immutable, JSON-replay-safe Executive Attention Queue. Every record identifies its policy and version, preserves its canonical change, and contains a structured factual reason.

Policy identity is a stable non-empty identifier plus an explicit version. One registry permits one active version for each identifier and rejects duplicates without replacement. Registry order is identifier code-unit ascending, independently of registration order.

An Attention Record identifier is the URI-encoded compound:

```text
attention:<current snapshot>:<domain>:<entity id or scalar domain>:<change type>:<policy id>:<version>
```

The queue identifier is the URI-encoded previous and current snapshot identifiers followed by the sorted `policy-id@version` policy set (or `none`). These identifiers are deterministic labels, not cryptographic integrity proofs. There is one record per canonical change and policy. Multiple policies matching one change remain separate. Any exception, malformed result, or malformed reason fails the entire evaluation; no partial queue is returned.

Records use canonical model domain order, entity/scalar key, `added`–`modified`–`removed`, policy identifier, and version. This structural order is neither priority nor severity. Queue inclusion means only that a deterministic policy matched. The summary counts all evaluated lifecycle changes, unique matched changes, records, distinct matched policies, and record counts by domain and change type.

Initial policies select only explicit commitment cancellation, commitment start-time change, commitment removal, and an available-to-unavailable source transition. Removal means **present previously and absent currently**. It does not mean deleted, cancelled, completed, or resolved.

The layer prohibits LLM evaluation, numerical scoring, planning, persistence, runtime orchestration, specialist invocation, notification, and execution.

## Consequences

The system gains governed, provider-independent selection, inspectable reasons, deterministic replay, and a common future downstream boundary. Policies can be added without rewriting the engine. In exchange, there is no adaptive prioritisation or preference learning, multiple matches create multiple records, policy rules require explicit governance, structural order communicates no importance, and no persistence or acknowledgement lifecycle exists.

## Rejected alternatives

- Rules in Snapshot Lifecycle or ProjectionEngine: conflate observation with selection.
- Connector alerts or adapter prioritisation: violate provider independence.
- LLM salience or hidden numerical scoring: are opaque and non-deterministic.
- Direct change-set-to-planning or match-to-execution transitions: transfer authority beyond attention.
- A mutable runtime queue: weakens replay and introduces lifecycle behaviour.
- Persistence in this sprint: combines unrelated architecture.

