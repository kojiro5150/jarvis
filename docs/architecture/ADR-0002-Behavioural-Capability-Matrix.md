# ADR-0002: Behavioural Capability Matrix

**Status:** Accepted  
**Date:** 2026-07-26  
**Authors:** Governance Engineering Project

## Context

Behavioural Constitutions are JARVIS's authoritative descriptions of specialist behaviour. Future compilers, runtime components, diagnostics, documentation and governance tools need a single typed capability representation, but allowing each consumer to interpret constitutional documents independently would produce inconsistent meanings and duplicate behavioural policy.

## Decision

JARVIS introduces the **Behavioural Capability Matrix** after constitutional compliance validation. The matrix is a deterministic, read-only projection of a supplied constitution registry. Each entry preserves the specialist identifier, mission, behavioural obligations as responsibilities, declared authority boundaries, explicitly named collaboration partners and output contract.

The lifecycle is:

```text
Behavioural Constitutions
        ↓
Compliance Validation
        ↓
Behavioural Capability Matrix
        ↓
Future Compiler
        ↓
Future Runtime
```

The Behavioural Capability Matrix is descriptive, not operational.

## Constitutions remain the source of truth

The matrix contains no independently authored behavioural content. It neither infers new capability nor rewrites constitutional language. A behavioural change must be made in a Behavioural Constitution, validated there, and then reproduced by rebuilding the projection. The matrix must never be modified or persisted as a competing source of truth.

## Why capabilities are projections

A projection gives downstream consumers one stable, typed shape while retaining traceability to the existing constitutional fields. Deterministic registry ordering, copied values and frozen result objects make equivalent constitutional inputs reproducible and prevent consumers from mutating either the source or its projection.

## Why future runtime must not inspect constitutions directly

Constitutions are governance artefacts, not an execution interface. If future runtime code independently parses constitutional prose, each consumer could reinterpret obligations, bypass validation or derive undeclared behaviour. A future constitutional compiler may consume this validated matrix and define operational contracts deliberately; runtime should consume those compiler products rather than inspect constitutions directly.

The current runtime does not consume the matrix. This decision therefore changes no runtime behaviour.

## No orchestration

The matrix contains no prompts, tasks, routes, model selection, hand-off decisions or execution instructions. Collaboration partners describe relationships already declared by constitutions; they do not schedule or dispatch work. Routing, compilation, enforcement and orchestration remain future concerns.

## Consequences

- Every registered constitution can be represented uniformly for future tooling.
- Consumers receive deterministic and immutable capability data.
- Behavioural ownership remains exclusively in the constitutional layer.
- Constitutional validation can fail before a projection is exposed.
- Runtime execution and orchestration remain unchanged.

## Non-goals

This decision does not introduce runtime execution, orchestration, routing, prompts, a compiler, persistence, caching, telemetry or startup behaviour changes.
