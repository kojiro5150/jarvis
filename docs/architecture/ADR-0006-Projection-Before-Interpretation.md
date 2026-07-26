# ADR-0006 — Projection Before Interpretation

**Status:** Accepted

**Date:** 2026-07-26

**Authors:** Governance Engineering Project

## Context

The Executive Operating System requires a deterministic mechanism for transforming heterogeneous authoritative observations into the one canonical operational representation established by ADR-0005. Without that boundary, later reasoning would become coupled to connectors, source ordering and transport-specific objects.

## Decision

Operational information shall first be projected into immutable `SituationalAwareness` before any reasoning layer evaluates its significance. Explicitly registered adapters produce validated, immutable Projection Artifacts. The Projection Engine processes adapters in stable identifier order, validates artifacts before merge, detects duplicate or conflicting identities, deterministically orders canonical entities, preserves bounded source provenance, and delegates final construction exclusively to `createSituationalAwareness()`.

Projection remains observational. It performs no prioritisation, recommendation, inference, behavioural routing or execution. Conflicting observations that cannot satisfy the PR1 model invariants fail explicitly rather than being silently reconciled. The package is not activated by the current application runtime.

## Consequences

Positive consequences are deterministic and replayable construction; connector-independent downstream architecture; explicit validation and failure; stable ordering; deep immutability; bounded source provenance; and additive adapter extension.

Trade-offs are an additional architectural layer, explicit merge rules and snapshot reconstruction. The existing PR1 source availability vocabulary is retained rather than introducing a second, incompatible vocabulary. Diagnostic logging is intentionally deferred because PR2 is runtime-neutral and repository telemetry does not yet have a governed boundary; failures remain observable to callers. These variations preserve the specification's SHOULD intent without widening this PR.

## Explicit exclusions

This decision introduces no connectors, connector discovery, persistence, caches, retries, telemetry, UI, runtime activation, interpretation, attention ranking, decision surface, behavioural routing, specialist invocation or execution.
