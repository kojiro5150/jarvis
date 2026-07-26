# ADR-0006 — Projection Before Interpretation

**Status:** Accepted

**Date:** 2026-07-26

**Authors:** Governance Engineering Project

## Context

The Executive Operating System requires a deterministic mechanism for transforming heterogeneous authoritative observations into the one canonical operational representation established by ADR-0005. Without that boundary, later reasoning would become coupled to connectors, source ordering and transport-specific objects.

## Decision

Operational information shall first be projected into immutable `SituationalAwareness` before any reasoning layer evaluates its significance. Explicitly registered adapters produce immutable Projection Artifacts. The Projection Engine processes adapters in stable identifier order; defensively copies and freezes each observation; validates artifact structure, vocabulary, timestamps and semantics without constructing a snapshot; validates cross-artifact ownership and identity; deterministically merges and validates canonical input; and only then delegates final construction to `createSituationalAwareness()` exactly once for each successful projection.

Projection remains observational. It performs no prioritisation, recommendation, inference, behavioural routing or execution. Projection Artifacts retain full artifact-level provenance. The PR1 snapshot retains bounded source-level provenance in `sources`, not per-entity provenance. Exact duplicate observations are deduplicated; conflicting same-ID observations that cannot satisfy the PR1 model invariants fail explicitly and deterministically rather than being silently reconciled. Because failure is the complete runtime policy, no speculative `MergeResult` or `MergeConflict` public contract is exposed. The package is not activated by the current application runtime.

## Consequences

Positive consequences are deterministic and replayable construction; connector-independent downstream architecture; explicit validation and failure; stable ordering; deep immutability; bounded source provenance; and additive adapter extension.

Trade-offs are an additional architectural layer, explicit merge rules and snapshot reconstruction. The existing PR1 source availability vocabulary is retained rather than introducing a second, incompatible vocabulary. Diagnostic logging is intentionally deferred because PR2 is runtime-neutral and repository telemetry does not yet have a governed boundary; failures remain observable to callers. These variations preserve the specification's SHOULD intent without widening this PR.

## Explicit exclusions

This decision introduces no connectors, connector discovery, persistence, caches, retries, telemetry, UI, runtime activation, interpretation, attention ranking, decision surface, behavioural routing, specialist invocation or execution.
