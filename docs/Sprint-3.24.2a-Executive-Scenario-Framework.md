# Sprint 3.24.2 — Executive Scenario Framework

# JARVIS Engineering

## Codex Implementation Instruction

This specification is normative and JESS-compliant.

Before implementation review the Engineering Constitution, North Star, JESS, Sprint Specifications through 3.24.1, and existing ADRs. This sprint extends the architecture and shall not redesign prior architectural decisions.

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

The remaining architectural gap is a permanent framework for canonical executive scenarios.

---

## Relationship to the North Star

The North Star defines JARVIS as an Executive Operating System.

The runtime now reasons deterministically.

This sprint establishes deterministic executive environments against which the runtime is validated.

It does not introduce new reasoning.

---

## Sprint Objective

Implement a deterministic Executive Scenario Framework that provides immutable, replay-safe executive scenarios capable of exercising the Executive Operating System end-to-end.

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

Scenarios shall not contain:

- runtime code
- reasoning
- specialist behaviour
- LLM prompts
- adaptive logic
- connector implementations

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

---

## Loader

The loader shall:

- validate
- load
- execute runtime
- compare assertions

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
