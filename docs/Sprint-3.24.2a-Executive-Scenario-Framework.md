# Sprint 3.24.2a — Executive Scenario Framework Constitutional Edition

# JARVIS Engineering

## Codex Implementation Instruction

This specification is normative and JESS-compliant.

Before conformance review, read the Engineering Constitution, North Star, JESS, Sprint 3.24.2, and ADR-0020. This constitutional edition verifies and, only where demonstrably necessary, corrects the completed Sprint 3.24.2. It does not authorise a redesign or new feature work.

---

## Constitutional Hierarchy

Engineering Constitution
↓
North Star
↓
JESS
↓
Sprint Specifications
↓
Behavioural Constitutions
↓
ADRs
↓
Compliance & Validation
↓
Executive Operating System Runtime

Every engineering decision shall preserve this hierarchy.

---

## Engineering Principles

- architecture before implementation
- deterministic before adaptive
- typed before dynamic
- validation before enforcement
- behaviour before orchestration
- immutable canonical state
- replay safety
- backward compatibility unless intentionally changed
- independently reviewable pull requests
- explicit architectural boundaries

---

## Current Repository Status

Completed:

- Sprint 3.10 Foundations
- Sprint 3.11 Projection Engine
- Sprint 3.12 Calendar Projection Adapter
- Sprint 3.13 Snapshot Lifecycle
- Sprint 3.14 Executive Attention
- Subsequent deterministic reasoning pipeline
- Sprint 3.24 Deterministic Runtime
- Sprint 3.24.1 EOS Demonstration Harness

The runtime is deterministic and replay safe.

Sprint 3.24.2 defines the permanent framework for canonical executive scenarios. This edition makes its enduring guarantees explicit and verifiable.

---

## Relationship to the North Star

The North Star defines JARVIS as an Executive Operating System.

The runtime now reasons deterministically.

This sprint establishes deterministic executive environments against which the runtime is validated.

It does not introduce new reasoning.

---

## Sprint Objective

Verify that the deterministic Executive Scenario Framework provides immutable, replay-safe executive scenarios capable of exercising the Executive Operating System end-to-end, correcting only genuine constitutional inconsistencies.

The framework shall:

- represent executive situations only
- remain independent of runtime logic
- remain independent of connectors
- preserve deterministic replay
- support progressive expansion
- provide a permanent architectural validation layer

The framework shall never perform reasoning.

---

## Architectural Position

ProjectionArtifacts
        ↓
Executive Scenario Framework
        ↓
Executive Operating System Runtime
        ↓
Deterministic Replay

---

## Architectural Boundaries

Scenarios may contain:

- ProjectionArtifacts
- deterministic metadata
- expected assertions
- provenance
- replay identity

Scenarios shall not contain:

- runtime code
- reasoning
- specialist behaviour
- LLM prompts
- adaptive logic
- connector implementations
- runtime configuration
- runtime stages
- planning logic
- API or persistence behaviour

---

## Repository Structure

tests/scenarios/

- README.md
- registry/
- shared/
- cancelled-commitment/

---

## Core Contracts

- ExecutiveScenario
- ExecutiveScenarioMetadata
- ExecutiveScenarioRegistry
- ExecutiveScenarioLoader
- ExecutiveScenarioAssertion
- ExecutiveScenarioResult

Public contracts remain immutable.

---

## Registry

The registry shall:

- discover scenarios
- validate metadata
- reject duplicate identifiers
- deep freeze registrations
- provide deterministic ordering

Canonical ordering uses stable code-unit comparison, never locale-sensitive comparison.

---

## Loader

The loader shall:

- validate
- load
- execute runtime
- compare assertions

Runtime configuration is supplied independently to the loader and is not part of `ExecutiveScenario`. Assertion comparison uses canonical structural equivalence and must not depend on object property serialisation order.

The loader performs no reasoning.

---

## Initial Canonical Scenario

Implement:

cancelled-commitment

using the existing deterministic golden ProjectionArtifactSet.

---

## Validation

Validation shall enforce:

- immutable contracts
- deterministic ordering
- replay safety
- duplicate prevention
- JSON compatibility
- deep freeze

Failures abort execution atomically.

---

## Required Tests

- registry discovery
- metadata validation
- deterministic replay
- duplicate rejection
- scenario loading
- runtime execution
- assertion validation
- deep freeze

---

## ADR

ADR-0020 — Executive Scenario Framework

Document:

- rationale
- replay philosophy
- runtime independence
- scenario lifecycle
- future expansion
- non-goals

---

## Explicit Non-Goals

This sprint shall not introduce:

- reasoning changes
- planning
- UI
- API
- persistence
- adaptive behaviour
- connector redesign

---

## Acceptance Criteria

✓ Framework implemented

✓ Registry implemented

✓ Loader implemented

✓ Cancelled Commitment scenario migrated

✓ Replay validated

✓ Tests pass

✓ Lint passes

✓ Typecheck passes

✓ Build passes

✓ ADR completed

---

## Completion Report

Provide:

- Summary
- Architectural Compliance
- Key Decisions
- Testing
- Files Changed
- Commit
- Pull Request
- Deferred Items

---

## Final Architectural Constraint

The Executive Scenario Framework defines executive environments.

The Executive Operating System defines executive reasoning.

These responsibilities shall remain permanently separated.
