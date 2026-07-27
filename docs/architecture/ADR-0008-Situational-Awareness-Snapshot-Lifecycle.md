# ADR-0008: Situational Awareness Snapshot Lifecycle and Deterministic Change Detection

- **Status:** Accepted
- **Date:** 2026-07-27
- **Governing decisions:** ADR-0005, Situational Awareness Before Deliberation; ADR-0006, Projection Before Interpretation; ADR-0007, Calendar Projection Adapter Boundary

## Context

Canonical Situational Awareness states now exist, and production Calendar observations can populate them through the governed projection boundary. A state describes observations represented at one boundary. Future executive capabilities require a trustworthy account of how that representation changes across boundaries. Comparing raw connector payloads would couple temporal facts to providers and bypass canonical validation.

## Decision

The snapshot lifecycle belongs to the Executive Operating System and consumes only canonical `SituationalAwareness` values. A snapshot is an immutable envelope containing a caller-supplied non-empty identifier, an explicitly supplied RFC 3339 observation-boundary timestamp, and defensively reconstructed canonical state. It is a record of represented observations, not absolute truth. No schema version or metadata is introduced before persistence creates a concrete compatibility requirement.

Comparison requires previous and current snapshots in the intended order. Current observation time may equal but must not precede previous observation time; supplied snapshots are never silently reordered. Canonical identity and context are compared as whole scalar objects. Every identifier-based collection is indexed by stable canonical identifier. Structural equality ignores object key insertion order, preserves array order, and compares every canonical field. Change records are ordered by code-unit ascending identifier without locale-sensitive comparison.

The immutable change set classifies `added`, `removed`, and `modified` observations. It retains previous and current canonical records for modifications and bounded snapshot/source observation context. Unchanged records are excluded to keep output bounded, but deterministic unchanged counts include identity, context, and every collection entity. A `removed` record means only that an identifier was present previously and absent currently; it does not assert deletion, cancellation, completion, intent, or cause. Changed identifiers are an addition and a removal; no replacement is inferred.

Snapshot construction and comparison do not query connectors, invoke projection adapters, modify ProjectionEngine, persist state, interpret significance, rank attention, trigger actions, read a clock, use randomness, or call a model.

## Consequences

### Positive

- Temporal comparison is provider-independent, replayable, JSON-compatible, and deterministic.
- Future projection adapters participate automatically because comparison begins after canonical construction.
- Stable identifiers and preserved records make changes inspectable without connector coupling.
- The lifecycle provides a bounded factual foundation for future DAWNWATCH and attention systems without implementing them.

### Trade-offs

- Absence cannot distinguish external deletion from observation-window or adapter-coverage changes.
- Partial source availability can make removals ambiguous; source state is compared but does not suppress them.
- No persistence, retention, history query, schema migration, importance judgement, or natural-language summary exists.

## Rejected alternatives

- Diff raw connector payloads: violates provider independence and canonical construction boundaries.
- Embed lifecycle logic in ProjectionEngine: conflates projection with temporal comparison.
- Compare each adapter independently: fragments the canonical operational view and duplicates logic.
- Use model-generated summaries as canonical output: introduces probabilistic interpretation before deterministic facts.
- Add persistence in this sprint: expands scope into an ungoverned historical store.
- Infer replacement, importance, deletion, or cause: exceeds what canonical inequality establishes.
