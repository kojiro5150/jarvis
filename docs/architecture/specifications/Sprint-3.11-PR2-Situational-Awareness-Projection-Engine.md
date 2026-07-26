# JARVIS Engineering Specification

**Title:** Sprint 3.11 PR2 — Situational Awareness Projection Engine  
**Specification Version:** 1.0 Draft  
**JESS Version:** 1.0  
**Architecture Phase:** Executive Operating System  
**Sprint:** 3.11  
**Pull Request:** PR2  
**Specification Part:** Part 1 — Foundations  
**Status:** Engineering Specification

---

> **PR2.1 conformance note (2026-07-26):** The remediation recorded in
> `Sprint-3.11-PR2.1-Projection-Validation-Completion-Report.md` is authoritative
> where the original PR2 wording implies per-entity provenance, preservation of
> incompatible same-ID entities, diagnostic merge result contracts, or validation
> through snapshot construction. Artifacts retain full provenance; snapshots retain
> bounded source-level provenance; irreconcilable conflicts reject deterministically;
> validation constructs no snapshot; and successful projection invokes the canonical
> constructor exactly once. Full reordering of this document to JESS v1.0 remains
> recorded process debt rather than code-remediation scope.

---

> **This specification conforms to the JARVIS Engineering Specification Standard (JESS) v1.0.**

This document defines the architectural requirements, constraints, implementation boundaries and engineering expectations for Sprint 3.11 Pull Request 2.

This specification is normative.

Where the words **SHALL**, **MUST**, **SHALL NOT**, **MUST NOT**, **SHOULD**, and **MAY** appear, they are to be interpreted according to RFC 2119.

This document defines architecture.

It does not redefine repository governance.

---

# Architecture Summary

JARVIS is engineered as two complementary operating systems.

The Behavioural Operating System defines **how JARVIS behaves**.

The Executive Operating System defines **what JARVIS knows about the user's operational world.**

These systems are intentionally orthogonal.

Neither substitutes for the other.

Behaviour without operational awareness cannot produce contextually appropriate assistance.

Operational awareness without behavioural governance cannot produce safe or predictable behaviour.

The complete architecture therefore consists of both systems operating together while remaining independently evolvable.

```
                    JARVIS

        ┌──────────────────────────────┐
        │ Behavioural Operating System │
        │                              │
        │ Identity                     │
        │ Constitutions                │
        │ Capability                   │
        │ Collaboration                │
        │ Diagnostics                  │
        └──────────────┬───────────────┘
                       │
                       │
        ┌──────────────▼───────────────┐
        │ Executive Operating System   │
        │                              │
        │ Situational Awareness        │
        │ Decision Surface             │
        │ Attention Engine             │
        │ Behavioural Router           │
        │ Execution                    │
        │ Continuity                   │
        └──────────────────────────────┘
```

Sprint 3.11 establishes the Executive Operating System.

PR1 established the immutable operational model.

PR2 establishes the deterministic mechanism by which authoritative operational reality enters that model.

Future pull requests shall reason exclusively over the resulting projection rather than over heterogeneous operational systems.

---

# 1. Architectural Context

## 1.1 Background

Sprint 3.10 completed the foundational Behavioural Operating System.

The repository now contains stable architectural definitions governing:

- behavioural identity
- specialist behaviour
- engineering constitutions
- capability registration
- collaboration
- validation
- diagnostics

These components define **how JARVIS behaves**.

They intentionally do not attempt to represent the operational state of the user.

As the repository evolved, an architectural distinction became increasingly clear.

Behaviour and operational context represent fundamentally different concerns.

Attempting to represent both concerns within a single architectural model would create unnecessary coupling between behavioural reasoning and operational state.

Such coupling would weaken determinism, increase implementation complexity, and make future architectural evolution significantly more difficult.

The Executive Operating System therefore introduces a second architectural axis dedicated exclusively to operational awareness.

This separation is deliberate.

It is expected to remain a permanent architectural property of JARVIS.

---

## 1.2 Executive Operating System

The Executive Operating System represents the current operational truth available to JARVIS.

Operational truth is defined as:

> The deterministic projection of authoritative operational facts describing the current state of the user's work.

Operational truth is **not** conversational history.

Operational truth is **not** behavioural memory.

Operational truth is **not** language model context.

Operational truth is **not** inferred intent.

Operational truth consists exclusively of operational facts obtained from authoritative sources and projected into a single immutable representation.

Examples include:

- active projects
- current commitments
- organisational roles
- scheduled work
- operational priorities
- waiting items
- current responsibilities
- contextual metadata

These operational facts form the substrate upon which future reasoning systems operate.

The Executive Operating System therefore becomes the canonical representation of the user's current operational world.

---

## 1.3 Sprint 3.11

Sprint 3.11 establishes the Executive Operating System in progressive architectural layers.

Each pull request introduces one deterministic architectural capability.

Each capability becomes the sole input to the next architectural layer.

```
PR1
Situational Awareness Model
        │
        ▼
PR2
Projection Engine
        │
        ▼
PR3
Decision Surface
        │
        ▼
PR4
Attention Engine
        │
        ▼
PR5
Behavioural Router
```

No later pull request shall bypass an earlier architectural layer.

This preserves architectural determinism.

It also guarantees that reasoning always occurs over stable architectural abstractions rather than heterogeneous runtime systems.

---

## 1.4 Relationship to PR1

Sprint 3.11 PR1 introduced the immutable Situational Awareness domain model.

That pull request deliberately avoided introducing any mechanism for constructing that model.

The model was intentionally passive.

Its responsibilities are limited to representing operational state.

Construction responsibilities were deferred.

This separation follows the Engineering Constitution principle:

> Architecture before implementation.

PR2 now introduces the deterministic construction mechanism.

The model remains unchanged.

PR2 exists solely to populate that model from authoritative operational sources.

Accordingly, PR2 SHALL NOT redesign the Situational Awareness model.

Any modification to the PR1 domain model falls outside the scope of this specification unless required to correct a demonstrable architectural defect.

---

## 1.5 Architectural Responsibility

The Projection Engine has one responsibility.

To project operational facts.

It does not decide.

It does not prioritise.

It does not infer.

It does not recommend.

It does not execute.

It does not reason.

Its sole architectural responsibility is to transform heterogeneous operational information into a deterministic Situational Awareness projection.

Nothing more.

Nothing less.

This strict separation is expected to remain a defining architectural property of the Executive Operating System throughout its evolution.

---

## 1.6 Architectural Boundary

The Projection Engine represents the boundary between external operational systems and internal architectural reasoning.

Everything before this boundary belongs to external operational reality.

Everything after this boundary belongs to JARVIS.

```
Authoritative Sources
        │
        ▼
Projection Engine
══════════════════════════════
Architectural Boundary
══════════════════════════════
Situational Awareness
        │
        ▼
Future Reasoning Layers
```

No future reasoning layer shall consume operational systems directly.

All reasoning SHALL consume Situational Awareness.

This rule preserves deterministic architecture and prevents future architectural drift.

---

# 2. Repository State

## 2.1 Current Repository Status

At the commencement of Sprint 3.11 PR2, the JARVIS repository has completed the foundational architectural work required to support the Executive Operating System.

The Behavioural Operating System has been established and provides deterministic behavioural governance for all future runtime capabilities.

The Executive Operating System has been initiated through the completion of Sprint 3.11 PR1.

Specifically, the repository now contains:

- immutable Situational Awareness domain model
- deterministic construction API
- operational identity model
- operational role model
- project model
- commitment model
- waiting item model
- priority model
- active work model
- contextual metadata model
- source provenance model
- validation framework
- defensive copying
- deep immutability
- deterministic ordering

These components establish the canonical operational representation used throughout the remainder of the Executive Operating System.

No construction logic currently exists.

No operational sources are currently consumed.

No projection behaviour currently exists.

This omission is intentional.

It preserves the separation between architectural modelling and architectural construction.

---

## 2.2 Architectural Position

PR2 represents the first active component of the Executive Operating System.

PR1 introduced an immutable representation.

PR2 introduces deterministic construction.

The repository therefore progresses from:

```
Representation
```

to

```
Representation
+
Construction
```

without introducing interpretation.

This distinction is fundamental.

Construction and interpretation represent separate architectural responsibilities.

Maintaining this separation reduces coupling, improves determinism, and allows future reasoning layers to evolve independently from operational source integration.

---

## 2.3 Existing Public Contracts

The following public architectural contracts are considered stable.

PR2 SHALL consume these contracts.

PR2 SHALL NOT redesign these contracts.

Examples include:

- Situational Awareness
- Operational Identity
- Operational Role
- Operational Project
- Operational Commitment
- Waiting Item
- Active Work
- Operational Context
- Source Provenance
- createSituationalAwareness()

Where additional functionality is required, it SHALL be introduced through new architectural components rather than modification of stable domain contracts.

---

## 2.4 Architectural Assumptions

This specification assumes the repository satisfies the following conditions before implementation commences.

Repository builds successfully.

All tests pass.

Lint passes.

TypeScript compilation succeeds.

Public APIs are considered stable.

Architectural Decision Records are current.

Engineering Constitution remains authoritative.

North Star remains unchanged.

JESS v1.0 governs this specification.

Should any of these assumptions become invalid, implementation SHALL pause until architectural consistency has been restored.

---

# 3. Sprint Objective

## 3.1 Objective

The objective of Sprint 3.11 PR2 is to introduce a deterministic Projection Engine capable of constructing immutable Situational Awareness snapshots from one or more authoritative operational sources.

This objective shall be achieved without introducing interpretation, prioritisation, behavioural reasoning, execution, or adaptive behaviour.

The resulting architecture SHALL provide a deterministic projection of operational truth.

---

## 3.2 Deliverable

At completion of this pull request the repository SHALL possess:

- Projection Engine
- Projection Adapter framework
- Projection contracts
- deterministic merge pipeline
- provenance preservation
- source availability model
- projection validation
- immutable construction pathway

No additional behavioural capability is introduced.

---

## 3.3 Success Criteria

This sprint is considered successful when:

authoritative operational information can be projected into an immutable Situational Awareness instance through a deterministic construction pipeline while preserving provenance and architectural boundaries.

No downstream reasoning shall be introduced.

---

# 4. Architectural Relationships

## 4.1 Consumes

Sprint 3.11 PR2 consumes the following architectural capabilities.

✓ Situational Awareness Model

✓ Operational Domain Types

✓ Validation Framework

✓ Deep Freeze Utilities

✓ Construction API

These components remain authoritative.

The Projection Engine SHALL build upon them.

It SHALL NOT replace them.

---

## 4.2 Produces

Sprint 3.11 PR2 produces:

✓ Projection Engine

✓ Projection Adapter Interface

✓ Projection Contracts

✓ Projection Artifact

✓ Deterministic Merge Pipeline

✓ Source Availability Model

✓ Provenance Preservation

These become stable architectural capabilities.

Future pull requests SHALL consume these abstractions rather than introducing alternative construction pathways.

---

## 4.3 Future Consumers

The following architectural layers SHALL consume the Projection Engine.

```
Decision Surface

Attention Engine

Behavioural Router

Execution

Continuity
```

No future architectural layer shall consume operational systems directly.

Operational systems SHALL remain isolated behind the Projection Engine.

---

## 4.4 Dependency Direction

Architectural dependencies SHALL flow in one direction only.

```
Operational Sources

↓

Projection Engine

↓

Situational Awareness

↓

Decision Surface

↓

Attention Engine

↓

Behavioural Router

↓

Execution
```

Reverse dependencies SHALL NOT exist.

Reasoning layers SHALL remain unaware of operational connectors.

Operational connectors SHALL remain unaware of behavioural reasoning.

---

# 5. Architectural Integrity

## 5.1 Principle

Architectural integrity takes precedence over implementation convenience.

Where implementation options conflict with established architectural boundaries, the architecture SHALL prevail.

---

## 5.2 Components Explicitly Out of Scope

Sprint 3.11 PR2 SHALL NOT redesign:

Behavioural Operating System

Engineering Constitution

North Star

Capability Matrix

Collaboration Graph

Diagnostics

Specialist Architecture

Operational Domain Model

Decision Surface

Attention Engine

Behavioural Router

Execution Engine

Continuity

These components are considered architecturally independent.

---

## 5.3 Construction Boundary

PR2 introduces one—and only one—construction pathway into Situational Awareness.

Multiple construction pathways SHALL NOT exist.

Future adapters SHALL utilise the Projection Engine.

They SHALL NOT construct Situational Awareness directly.

This guarantees:

- deterministic behaviour
- consistent validation
- provenance preservation
- invariant enforcement

---

## 5.4 No Architectural Drift

Implementation SHALL NOT introduce:

hidden mutable state

runtime inference

priority calculation

decision making

recommendation logic

behavioural routing

connector-specific reasoning

adaptive merge behaviour

probabilistic conflict resolution

If any implementation requires these capabilities, it belongs to a future architectural layer and SHALL NOT be introduced in this pull request.

---

# 6. Purpose

## 6.1 Architectural Purpose

The Projection Engine exists to create a deterministic representation of operational reality.

It does not attempt to understand operational reality.

It does not attempt to evaluate operational reality.

It simply projects it.

Projection is intentionally narrower than interpretation.

Projection answers one question.

"What operational facts are currently known?"

It deliberately avoids answering questions such as:

"What is most important?"

"What should happen next?"

"What deserves attention?"

"What decision should be made?"

Those questions belong to future architectural layers.

---

## 6.2 Why Projection Exists

Without a Projection Engine, every downstream architectural layer would require direct knowledge of external systems.

Calendar logic would appear inside reasoning systems.

GitHub logic would appear inside routing systems.

Email logic would appear inside behavioural reasoning.

This creates architectural coupling.

Coupling increases complexity.

Complexity reduces determinism.

Reduced determinism weakens governance.

The Projection Engine eliminates this coupling by establishing a single operational representation shared by every downstream architectural layer.

Operational systems become interchangeable.

Reasoning systems remain stable.

The architecture becomes easier to evolve, easier to test, and easier to validate.

This separation is expected to remain a permanent architectural characteristic of JARVIS.

---

# 7. Core Architectural Principles

The Projection Engine SHALL be implemented according to the following architectural principles.

These principles are normative.

Every implementation decision SHALL be evaluated against them.

If an implementation conflicts with these principles, the implementation SHALL be considered incorrect.

---

## 7.1 Projection Before Interpretation

Projection SHALL always precede interpretation.

Operational information SHALL first be transformed into a deterministic representation before any reasoning system evaluates its significance.

The Projection Engine therefore exists solely to answer the question:

> **What operational facts currently exist?**

It SHALL NOT answer:

- What should happen?
- What deserves attention?
- What is most important?
- What decision should be made?
- What recommendation should be produced?

Those responsibilities belong to future architectural layers.

Maintaining this separation preserves determinism and prevents reasoning concerns from leaking into operational integration.

---

## 7.2 Single Operational Representation

The Executive Operating System SHALL maintain one canonical operational representation.

Regardless of the number or diversity of operational sources, downstream architectural components SHALL consume a single immutable Situational Awareness model.

Future architectural layers SHALL remain unaware of:

- connector implementations
- external APIs
- authentication mechanisms
- transport protocols
- operational system semantics

They SHALL reason exclusively over the projected operational model.

This architectural abstraction significantly reduces coupling throughout the repository.

---

## 7.3 Explicit Provenance

Every projected operational fact SHALL retain explicit provenance.

Provenance SHALL remain attached throughout the entire projection lifecycle.

At minimum provenance SHALL identify:

- originating source
- projection timestamp
- availability state
- source identifier

Future architectural layers MAY inspect provenance.

They SHALL NOT require knowledge of connector implementation.

---

## 7.4 Deterministic Projection

Given identical operational inputs, the Projection Engine SHALL always produce identical Situational Awareness.

Projection SHALL NOT depend upon:

- execution timing
- connector ordering
- thread scheduling
- randomisation
- language model behaviour
- environmental state

Projection SHALL therefore be deterministic.

---

## 7.5 Construction Before Reasoning

Reasoning SHALL never occur during construction.

Projection SHALL complete before any downstream reasoning system executes.

Construction therefore forms a completed architectural stage.

Subsequent architectural layers SHALL consume completed Situational Awareness snapshots.

Incomplete projections SHALL NOT be exposed.

---

## 7.6 Validation Before Construction

Operational data SHALL be validated before incorporation into Situational Awareness.

Invalid operational information SHALL NOT silently enter the Executive Operating System.

Validation SHALL occur before merge.

Construction SHALL assume validated input.

---

## 7.7 Deep Immutability

Every Situational Awareness snapshot produced by the Projection Engine SHALL be deeply immutable.

After construction:

- operational entities SHALL NOT change
- provenance SHALL NOT change
- ordering SHALL NOT change
- collections SHALL NOT mutate

Subsequent reasoning layers SHALL consume immutable state.

---

## 7.8 Runtime Neutrality

Projection SHALL NOT influence runtime behaviour.

The Projection Engine provides operational state.

It does not alter behavioural state.

Behavioural routing remains outside the scope of this sprint.

---

## 7.9 Explicit Architectural Boundaries

Each architectural layer SHALL possess a single clearly defined responsibility.

Projection SHALL NOT perform:

- reasoning
- execution
- orchestration
- routing
- prioritisation
- adaptation

Future architectural layers SHALL build upon this boundary rather than expanding it.

---

# 8. Executive Operating System Overview

## 8.1 Purpose

The Executive Operating System represents the operational awareness architecture of JARVIS.

It exists to provide an accurate, deterministic and auditable representation of the user's operational world.

Unlike conversational memory, which reflects previous interactions, the Executive Operating System reflects current operational reality.

Operational reality is continually projected from authoritative systems.

Future reasoning operates over this projection.

---

## 8.2 Architectural Evolution

Sprint 3.11 establishes the Executive Operating System through progressive refinement.

```
PR1

Operational Representation

↓

PR2

Operational Projection

↓

PR3

Decision Surface

↓

PR4

Attention Engine

↓

PR5

Behavioural Router

↓

Execution

↓

Continuity
```

Each pull request introduces one architectural capability.

Each capability becomes the exclusive dependency of the next.

This sequential architecture reduces coupling while improving testability and long-term maintainability.

---

## 8.3 Operational Knowledge

The Executive Operating System represents knowledge about work.

Examples include:

Current projects

Current responsibilities

Current commitments

Waiting work

Scheduled work

Operational context

Organisational roles

Relevant metadata

It deliberately excludes:

conversation history

reasoning history

prompt context

language model memory

generated recommendations

behavioural state

Those concerns belong elsewhere within the architecture.

---

## 8.4 Operational Truth

Operational truth is defined as:

> The deterministic projection of authoritative operational facts observed at a specific point in time.

Operational truth is therefore:

observable

auditable

repeatable

immutable

Operational truth is not subjective.

Operational truth is not inferred.

Operational truth is not predicted.

Projection therefore represents observation rather than interpretation.

---

# 9. Projection Architecture

## 9.1 Definition

The Projection Engine transforms heterogeneous operational systems into one canonical operational representation.

It provides a stable architectural boundary separating external systems from internal reasoning.

```
Operational Systems

↓

Projection Adapters

↓

Projection Artifacts

↓

Projection Engine

↓

Merge Pipeline

↓

Situational Awareness
```

This architecture intentionally isolates operational complexity from reasoning complexity.

---

## 9.2 Architectural Layers

Projection consists of five deterministic stages.

```
Observe

↓

Normalise

↓

Project

↓

Merge

↓

Construct
```

Each stage possesses one responsibility.

Stages SHALL remain independently testable.

---

## 9.3 Architectural Responsibility

Projection Adapters observe.

Projection Artifacts describe.

Projection Engine merges.

Situational Awareness represents.

Future reasoning layers evaluate.

Execution layers act.

These responsibilities SHALL remain independent.

---

## 9.4 Projection Artifact

Projection Artifacts form the canonical exchange contract between adapters and the Projection Engine.

Rather than returning arbitrary objects, every adapter SHALL return a Projection Artifact.

This standardisation allows:

consistent validation

deterministic merge

future adapter independence

connector interchangeability

uniform provenance

The Projection Artifact therefore becomes the standard operational exchange format of the Executive Operating System.

---

# 10. Projection Without Interpretation

Projection and interpretation are intentionally different architectural activities.

Projection answers:

"What currently exists?"

Interpretation answers:

"What does it mean?"

The Projection Engine SHALL perform only the former.

Examples:

Calendar event

Projection:

Meeting exists.

Interpretation:

Meeting is important.

---

GitHub issue

Projection:

Issue assigned.

Interpretation:

Issue blocks Sprint completion.

---

Unread email

Projection:

Unread email exists.

Interpretation:

Reply required immediately.

---

Interpretation requires reasoning.

Projection requires observation.

Mixing these responsibilities would weaken architectural determinism.

Accordingly, interpretation SHALL remain outside the scope of PR2.

---

# 11. Source-of-Truth Architecture

## 11.1 Principle

Every operational fact SHALL originate from an authoritative source.

The Projection Engine SHALL NOT invent operational information.

Projection is observational.

It is never generative.

---

## 11.2 Authoritative Sources

Examples include:

Configuration

Calendar

GitHub

Gmail

Drive

PHDSS

Future registered operational systems

Each source remains authoritative for its own operational domain.

The Projection Engine SHALL respect source ownership.

---

## 11.3 Source Ownership

Ownership SHALL remain external.

Projection SHALL NOT become the system of record.

The Executive Operating System reflects operational state.

It does not replace operational systems.

Operational changes SHALL continue to occur within their originating systems.

---

## 11.4 Canonical Representation

Although operational systems differ considerably, they SHALL project into one canonical representation.

Future reasoning therefore operates over consistent operational concepts rather than connector-specific data structures.

This abstraction is one of the principal architectural goals of the Projection Engine.

---

## 11.5 Architectural Outcome

After implementation of Sprint 3.11 PR2, JARVIS SHALL possess a deterministic architectural boundary separating operational observation from institutional reasoning.

Future architectural layers SHALL consume operational truth through immutable Situational Awareness snapshots rather than through direct interaction with heterogeneous operational systems.

This establishes the Projection Engine as the permanent gateway through which operational reality enters the Executive Operating System.
---

# 12. Projection Lifecycle

## 12.1 Overview

The Projection Lifecycle defines the deterministic sequence through which operational information becomes Situational Awareness.

Every operational fact SHALL pass through each lifecycle stage exactly once.

Stages SHALL execute sequentially.

Stages SHALL remain independently testable.

Stages SHALL NOT perform the responsibilities of adjacent stages.

The lifecycle is illustrated below.

```
Authoritative Source
        │
        ▼
Projection Adapter
        │
        ▼
Projection Artifact
        │
        ▼
Projection Validation
        │
        ▼
Deterministic Merge
        │
        ▼
Situational Awareness Construction
        │
        ▼
Immutable Snapshot
```

Each stage performs one architectural responsibility.

No stage SHALL be skipped.

---

## 12.2 Observation Stage

The Observation Stage is responsible for retrieving operational information from authoritative systems.

Observation SHALL NOT modify retrieved information.

Observation SHALL NOT infer additional information.

Observation SHALL NOT discard information except where required by connector failure or validation constraints.

The Observation Stage terminates once raw operational information has been retrieved.

---

## 12.3 Normalisation Stage

Operational systems differ significantly.

Examples include:

- Calendar events
- GitHub repositories
- Email messages
- Configuration files
- Future enterprise systems

Each system exposes different data structures.

Normalisation converts connector-specific structures into canonical operational entities.

Normalisation SHALL NOT interpret meaning.

Its responsibility is structural consistency.

Examples include:

```
GitHub Repository
↓

Operational Project
```

```
Calendar Event
↓

Operational Commitment
```

```
Configuration Role
↓

Operational Role
```

After normalisation, connector-specific semantics SHALL NOT be required by downstream architecture.

---

## 12.4 Projection Stage

Projection transforms canonical operational entities into a Projection Artifact.

Projection SHALL attach:

- provenance
- availability
- projection timestamp
- connector identity

Projection SHALL preserve operational fidelity.

Projection SHALL NOT introduce behavioural metadata.

Projection SHALL NOT calculate priority.

Projection SHALL NOT evaluate urgency.

Projection SHALL remain observational.

---

## 12.5 Validation Stage

Every Projection Artifact SHALL undergo validation.

Validation SHALL confirm:

required fields

valid identifiers

supported entity types

deterministic ordering

provenance completeness

availability state

Violation of mandatory validation SHALL prevent construction.

Validation SHALL fail explicitly.

Silent correction SHALL NOT occur.

---

## 12.6 Merge Stage

Validated Projection Artifacts SHALL enter the Merge Engine.

Merge combines multiple Projection Artifacts into one operational representation.

Merge SHALL preserve:

ordering

provenance

entity identity

deterministic behaviour

Merge SHALL NOT perform conflict resolution through inference.

Conflicts SHALL remain explicit.

---

## 12.7 Construction Stage

Following successful merge, the Projection Engine SHALL invoke:

```
createSituationalAwareness()
```

Construction SHALL remain the exclusive mechanism through which Situational Awareness instances are created.

Alternative construction pathways SHALL NOT exist.

Construction SHALL enforce:

deep immutability

validation

ordering

invariants

Construction concludes when an immutable Situational Awareness snapshot has been produced.

---

# 13. Projection Adapter Architecture

## 13.1 Purpose

Projection Adapters isolate operational systems from the Executive Operating System.

Every external operational system SHALL communicate with the Projection Engine exclusively through a Projection Adapter.

Adapters prevent connector-specific behaviour from propagating into architectural reasoning.

---

## 13.2 Architectural Responsibility

Projection Adapters SHALL:

observe operational systems

retrieve operational information

normalise connector-specific structures

construct Projection Artifacts

return deterministic results

Projection Adapters SHALL NOT:

perform reasoning

perform prioritisation

merge projections

modify Situational Awareness

execute behavioural logic

Adapters remain observational components.

---

## 13.3 Connector Independence

The Projection Engine SHALL possess no knowledge of connector implementation.

Examples include:

authentication

REST APIs

GraphQL

OAuth

SDK behaviour

pagination

retry policies

transport protocols

These concerns remain entirely within adapters.

Replacing one connector implementation SHALL NOT require modification of the Projection Engine.

---

## 13.4 Adapter Interface

Every adapter SHALL expose a common projection contract.

Conceptually:

```
Authoritative Source

↓

Projection Adapter

↓

Projection Artifact
```

The Projection Engine SHALL consume Projection Artifacts exclusively.

This creates connector interchangeability.

---

## 13.5 Adapter Registration

Projection Adapters SHALL be explicitly registered.

Implicit discovery SHALL NOT occur.

Registration SHALL be deterministic.

Future adapter registration SHALL remain additive.

Existing adapters SHALL NOT require modification when new operational sources are introduced.

This preserves the Open/Closed Principle at the architectural level.

---

# 14. Projection Artifact

## 14.1 Definition

The Projection Artifact is the canonical exchange contract between Projection Adapters and the Projection Engine.

Every adapter SHALL return exactly one Projection Artifact.

No alternative exchange formats SHALL be supported.

---

## 14.2 Purpose

Projection Artifacts standardise operational integration.

Rather than exposing connector-specific objects, adapters expose one consistent architectural contract.

This allows:

uniform validation

deterministic merge

consistent provenance

future extensibility

connector independence

---

## 14.3 Required Components

Every Projection Artifact SHALL contain:

projected entities

source provenance

availability

projection timestamp

adapter identity

package metadata

Future versions MAY extend the Projection Artifact.

Mandatory fields SHALL remain backwards compatible.

---

## 14.4 Immutability

Projection Artifacts SHALL themselves be immutable.

Projection SHALL therefore be immutable before merge begins.

This prevents connector behaviour from modifying projection state during construction.

---

# 15. Projection Result Model

## 15.1 Objective

The Projection Engine SHALL produce one—and only one—result.

```
Situational Awareness
```

No intermediate architectural representation shall be exposed publicly.

Temporary merge state remains internal.

Only completed Situational Awareness snapshots become public architectural artefacts.

---

## 15.2 Snapshot Semantics

Every projection represents a snapshot.

Snapshots describe operational truth at one observed point in time.

Snapshots SHALL NOT update automatically.

Subsequent operational changes require construction of a new snapshot.

This guarantees repeatability.

---

## 15.3 Snapshot Identity

Each Situational Awareness snapshot SHALL represent:

the complete operational state

at a defined projection instant

constructed from known authoritative sources

validated

immutable

auditable

This makes snapshots suitable for deterministic reasoning and future audit.

---

## 15.4 Architectural Consequences

Future reasoning layers SHALL treat Situational Awareness snapshots as immutable facts.

Reasoning SHALL never mutate operational truth.

Instead, new operational observations SHALL produce new snapshots.

This preserves historical integrity while maintaining deterministic architecture.

---

# 16. Architectural Outcome

Upon completion of this stage of the specification, the architecture of the Projection Engine has been established.

The repository now possesses a formally defined mechanism by which heterogeneous operational systems become a single immutable operational representation.

Subsequent sections of this specification define how deterministic merge, validation, conflict handling, ordering and runtime guarantees SHALL be implemented without violating the architectural principles established in Part 1.

══════════════════════════════════════════════════════════════

**End of Part 1**

Continue with:

**Sprint 3.11 PR2 – Part 2 – Merge Architecture & Deterministic Construction**

**Conforms to JESS v1.0**

══════════════════════════════════════════════════════════════
# JARVIS Engineering Specification

**Title:** Sprint 3.11 PR2 — Situational Awareness Projection Engine

**Part 2 — Merge Architecture & Deterministic Construction**

---

> This specification conforms to JESS v1.0.

---

# 17. Merge Architecture

## 17.1 Purpose

The Merge Engine is responsible for constructing a single coherent operational representation from one or more Projection Artifacts.

Merge is a deterministic construction activity.

Merge is **not** an interpretation activity.

The Merge Engine SHALL:

- combine Projection Artifacts
- preserve provenance
- preserve ordering
- enforce invariants
- construct canonical operational state

The Merge Engine SHALL NOT:

- infer operational meaning
- prioritise operational entities
- remove ambiguity through heuristic reasoning
- perform behavioural evaluation
- perform decision making

The Merge Engine therefore remains entirely deterministic.

---

## 17.2 Architectural Position

The Merge Engine occupies the final stage prior to Situational Awareness construction.

Projection Artifact is defined as an immutable, deterministic representation of the operational observations produced by a Projection Adapter, preserving provenance, availability, validation state, and canonical operational entities for deterministic merge into Situational Awareness.
```
Projection Artifacts

        │

        ▼

Merge Engine

        │

        ▼

Validated Operational Representation

        │

        ▼

createSituationalAwareness()

        │

        ▼

Immutable Snapshot
```

No architectural layer shall bypass the Merge Engine.

---

## 17.3 Responsibilities

The Merge Engine SHALL:

✓ merge operational entities

✓ preserve provenance

✓ preserve source ownership

✓ enforce deterministic ordering

✓ validate merged collections

✓ expose explicit conflicts

✓ prepare construction inputs

The Merge Engine SHALL NOT:

✗ perform runtime reasoning

✗ calculate importance

✗ predict user behaviour

✗ evaluate urgency

✗ resolve ambiguity through inference

---

# 18. Merge Strategy

## 18.1 Canonical Merge

Every Projection Artifact contributes operational entities to a single canonical operational representation.

Merge SHALL occur by entity type.

Conceptually:

```
Projects

↓

merge()

↓

Canonical Projects

──────────────

Commitments

↓

merge()

↓

Canonical Commitments

──────────────

Roles

↓

merge()

↓

Canonical Roles
```

Entity categories SHALL remain independent.

Cross-category merge SHALL NOT occur.

---

## 18.2 Merge Order

Merge SHALL execute using a deterministic sequence.

The recommended sequence is:

```
Identity

↓

Roles

↓

Projects

↓

Commitments

↓

Waiting Items

↓

Active Work

↓

Operational Context

↓

Metadata

↓

Provenance
```

This ordering SHALL remain stable.

Connector registration order SHALL NOT influence merge order.

---

## 18.3 Stable Ordering

Within each entity collection:

ordering SHALL be deterministic.

Recommended ordering:

Primary key

↓

Stable identifier

↓

Alphabetical fallback

↓

Creation timestamp (only where deterministic)

Implementation SHALL document ordering strategy.

---

# 19. Duplicate Detection

## 19.1 Objective

Duplicate operational entities SHALL be identified explicitly.

Duplicate detection prevents multiple representations of the same operational fact.

---

## 19.2 Duplicate Definition

Two entities are duplicates when:

their identity represents the same operational object

and

their originating source indicates identical ownership.

Duplicate detection SHALL NOT rely upon display names alone.

Stable identifiers SHALL be preferred.

---

## 19.3 Duplicate Behaviour

Duplicate entities SHALL produce one of three outcomes.

### Identical

Duplicate removed.

---

### Compatible

Merge into one canonical entity.

---

### Conflicting

Conflict recorded.

Entity retained.

No silent correction occurs.

---

# 20. Conflict Architecture

## 20.1 Philosophy

Conflicts are operational observations.

Conflicts are not errors.

The Projection Engine SHALL expose operational disagreement.

Future reasoning layers determine significance.

---

## 20.2 Examples

Calendar:

Meeting exists.

GitHub:

Deployment scheduled.

No conflict.

---

Calendar:

Project complete.

GitHub:

Project active.

Conflict.

Projection SHALL expose both observations.

---

## 20.3 Conflict Preservation

Conflicts SHALL NOT disappear during merge.

Every detected conflict SHALL remain observable.

Future reasoning systems MAY evaluate conflict significance.

Projection SHALL remain neutral.

---

# 21. Conflict Severity

Projection SHALL classify conflicts structurally.

Suggested classifications:

```
Information

Warning

Error
```

These classifications describe merge quality.

They SHALL NOT describe business importance.

---

## 21.1 Informational

Minor inconsistency.

Construction continues.

---

## 21.2 Warning

Significant inconsistency.

Construction continues.

Conflict exposed.

---

## 21.3 Error

Invariant violation.

Construction terminates.

No Situational Awareness snapshot produced.

---

# 22. Cross-Source Invariants

The Merge Engine SHALL enforce repository-wide invariants.

Examples include:

Operational Identity SHALL exist.

Role identifiers SHALL be unique.

Project identifiers SHALL be unique.

Commitment identifiers SHALL be unique.

Source provenance SHALL exist.

Ordering SHALL remain deterministic.

Collections SHALL remain immutable.

Invariant violations SHALL prevent construction.

---

# 23. Provenance Preservation

## 23.1 Principle

Merge SHALL preserve provenance.

Merge SHALL NOT rewrite provenance.

Merge SHALL NOT discard provenance.

Every operational entity SHALL remain traceable to its originating operational source.

---

## 23.2 Minimum Provenance

Every entity SHALL expose:

origin

projection timestamp

availability

source identifier

Future metadata MAY extend provenance.

Mandatory provenance SHALL remain backwards compatible.

---

# 24. Source Availability Model

Projection SHALL explicitly represent source availability.

Availability SHALL NOT be inferred.

Suggested model:

```
Available

Unavailable

Degraded

Unknown
```

Availability describes observation quality.

It SHALL NOT indicate operational importance.

---

# 25. Construction Boundary

The Projection Engine SHALL terminate immediately before Situational Awareness construction.

Construction SHALL occur exclusively through:

```
createSituationalAwareness()
```

No adapter.

No merge component.

No validation component.

No downstream reasoning layer.

...may instantiate Situational Awareness directly.

This preserves a single deterministic construction pathway.

---

# 26. Interaction with createSituationalAwareness()

The Projection Engine SHALL prepare construction inputs.

The constructor SHALL enforce:

validation

deep immutability

ordering

invariants

The Projection Engine SHALL assume construction responsibility ends once validated inputs have been supplied.

Construction responsibility SHALL remain delegated.

This separation preserves architectural cohesion.

---

# 27. Architectural Outcome

Following implementation of the Merge Architecture, the Executive Operating System SHALL possess a deterministic mechanism capable of combining heterogeneous operational observations into one coherent operational representation without introducing behavioural reasoning or architectural coupling.

Merge therefore becomes the final observational stage before immutable Situational Awareness construction.

══════════════════════════════════════════════════════════════

**End of Part 2A**

Continue:

**Part 2B — Determinism, Validation, Runtime Guarantees & Engineering Contracts**

══════════════════════════════════════════════════════════════
# JARVIS Engineering Specification

**Title:** Sprint 3.11 PR2 — Situational Awareness Projection Engine

**Part 2B — Determinism, Validation & Architectural Guarantees**

---

> This specification conforms to JARVIS Engineering Specification Standard (JESS) v1.0.

---

# 28. Deterministic Construction

## 28.1 Principle

Determinism is a foundational property of the Projection Engine.

Given an identical set of Projection Artifacts, the Projection Engine SHALL always construct an identical Situational Awareness snapshot.

Determinism is considered an architectural guarantee rather than an implementation detail.

Accordingly, implementation decisions that weaken determinism SHALL be considered architecturally incorrect.

---

## 28.2 Deterministic Inputs

Projection SHALL depend exclusively upon:

- Projection Artifacts
- deterministic configuration
- stable merge rules
- explicit construction contracts

Projection SHALL NOT depend upon:

- execution timing
- thread scheduling
- connector registration order
- runtime randomness
- language model output
- process state
- cache ordering

---

## 28.3 Deterministic Outputs

Construction SHALL produce:

- identical entities
- identical ordering
- identical provenance
- identical validation state
- identical availability state

No observable differences SHALL exist between repeated executions using identical Projection Artifacts.

---

## 28.4 Deterministic Failure

Failure SHALL also be deterministic.

Given identical invalid Projection Artifacts, identical validation failures SHALL occur.

The Projection Engine SHALL NOT fail differently between executions.

---

# 29. Validation Architecture

## 29.1 Philosophy

Validation protects the integrity of the Executive Operating System.

Validation SHALL reject malformed operational observations before they become operational truth.

Validation SHALL precede merge.

Validation SHALL precede construction.

Validation SHALL precede reasoning.

---

## 29.2 Validation Layers

Validation SHALL occur progressively.

```
Projection Artifact

↓

Structural Validation

↓

Semantic Validation

↓

Cross-Artifact Validation

↓

Merge Validation

↓

Construction Validation
```

Each layer SHALL possess one responsibility.

---

## 29.3 Structural Validation

Structural validation confirms that a Projection Artifact is well formed.

Examples include:

- mandatory identifiers
- required entity collections
- provenance presence
- timestamp validity
- availability state
- schema compliance

Structural validation SHALL NOT inspect business meaning.

---

## 29.4 Semantic Validation

Semantic validation confirms operational consistency.

Examples include:

- valid role identifiers
- supported entity classifications
- canonical operational vocabulary
- recognised source identifiers

Semantic validation SHALL remain deterministic.

---

## 29.5 Cross-Artifact Validation

Cross-Artifact Validation examines relationships between Projection Artifacts.

Examples include:

duplicate operational identities

duplicate commitments

duplicate projects

conflicting ownership

missing mandatory identity

Cross-Artifact Validation SHALL expose disagreement rather than silently repairing it.

---

## 29.6 Construction Validation

Immediately before Situational Awareness construction the Projection Engine SHALL confirm:

✓ deterministic ordering

✓ invariant compliance

✓ provenance completeness

✓ availability completeness

✓ immutable collections

Only then may construction proceed.

---

# 30. Invariant Enforcement

## 30.1 Principle

Architectural invariants define properties that shall always remain true.

Violation of an invariant represents architectural failure.

Construction SHALL terminate.

---

## 30.2 Mandatory Invariants

At minimum the Executive Operating System SHALL guarantee:

One Operational Identity

Unique entity identifiers

Deterministic ordering

Immutable collections

Valid provenance

Known availability state

Canonical entity ownership

Construction through one pathway

Future invariants MAY be added.

Existing invariants SHALL remain backwards compatible wherever practical.

---

## 30.3 Invariant Visibility

Invariant failures SHALL remain observable.

Silent invariant repair SHALL NOT occur.

Automatic reconstruction SHALL NOT occur.

The architecture values transparency over convenience.

---

# 31. Runtime Immutability

## 31.1 Principle

Operational truth is immutable.

Mutation creates ambiguity.

Ambiguity weakens auditability.

Accordingly, every Situational Awareness snapshot SHALL remain immutable throughout its lifetime.

---

## 31.2 Snapshot Behaviour

After construction:

no entity SHALL mutate

no provenance SHALL mutate

no ordering SHALL mutate

no availability SHALL mutate

Snapshots represent completed observations.

New observations produce new snapshots.

---

## 31.3 Defensive Copying

Projection Artifacts SHALL be defensively copied where appropriate.

External connector objects SHALL NOT remain referenced inside Situational Awareness.

This prevents external mutation from influencing operational truth.

---

## 31.4 Deep Freeze

Every public collection SHALL be deeply immutable.

Mutation attempts SHALL fail immediately.

Immutability SHALL be enforced consistently across all entity collections.

---

# 32. Ordering Guarantees

## 32.1 Stable Ordering

Ordering SHALL remain deterministic.

The same operational observations SHALL always produce the same collection ordering.

Stable ordering enables:

repeatable testing

consistent serialisation

auditable snapshots

predictable comparison

---

## 32.2 Ordering Independence

Ordering SHALL NOT depend upon:

connector execution order

network latency

operating system

runtime scheduling

API response sequence

Ordering SHALL be determined solely by documented merge rules.

---

# 33. JSON Serialisation

## 33.1 Requirement

Every Situational Awareness snapshot SHALL be serialisable.

Serialisation SHALL preserve:

entity identity

ordering

provenance

availability

metadata

No operational information SHALL be lost during serialisation.

---

## 33.2 Replay

Serialised snapshots SHOULD support deterministic replay.

Replay enables:

testing

diagnostics

audit

historical comparison

future governance capabilities

Replay is considered a long-term architectural objective.

---

# 34. Architectural Guarantees

The Projection Engine SHALL permanently provide the following guarantees.

---

## Deterministic Guarantee

Identical observations SHALL produce identical Situational Awareness.

---

## Referential Guarantee

Every operational entity SHALL remain traceable to an originating authoritative source.

---

## Construction Guarantee

Situational Awareness SHALL only be created through one deterministic construction pathway.

---

## Boundary Guarantee

Operational systems SHALL never communicate directly with reasoning systems.

---

## Isolation Guarantee

Projection SHALL remain independent of behavioural reasoning.

---

## Replay Guarantee

Completed Situational Awareness snapshots SHALL remain suitable for deterministic replay.

---

## Evolution Guarantee

New operational sources SHALL be addable without redesigning downstream reasoning layers.

---

# 35. Design Rationale

## Why introduce a Projection Engine?

Several architectural alternatives were considered.

### Alternative A

Reason directly over external systems.

Rejected.

Reasoning components would become tightly coupled to operational connectors.

This would increase implementation complexity and duplicate integration logic throughout the repository.

---

### Alternative B

Construct Situational Awareness inside connectors.

Rejected.

Construction would become fragmented.

Architectural invariants could no longer be guaranteed consistently.

---

### Alternative C

Perform prioritisation during projection.

Rejected.

Projection would become coupled with behavioural reasoning.

This violates the principle of Projection Before Interpretation.

---

### Alternative D

Maintain mutable Situational Awareness.

Rejected.

Mutation weakens determinism, replayability and auditability.

Immutable snapshots provide a significantly stronger architectural foundation.

---

# 36. Architectural Trade-offs

The Projection Engine introduces an additional architectural layer.

This decision was intentional.

Benefits include:

✓ deterministic behaviour

✓ connector independence

✓ replay capability

✓ explicit provenance

✓ simplified reasoning architecture

✓ improved testability

✓ architectural stability

Costs include:

• additional implementation complexity

• snapshot reconstruction

• explicit merge rules

• greater up-front architectural investment

These trade-offs are considered acceptable because they significantly improve long-term maintainability and architectural integrity.

---

# 37. Architectural Outcome

Following implementation of the architecture defined in Parts 1 and 2, the Executive Operating System SHALL possess a deterministic, auditable and immutable mechanism for projecting heterogeneous operational observations into a single canonical representation.

From this point forward, every reasoning layer within JARVIS SHALL consume operational truth exclusively through Situational Awareness snapshots.

The Projection Engine therefore becomes the permanent architectural gateway through which operational reality enters the Executive Operating System.

══════════════════════════════════════════════════════════════

**End of Part 2**

Continue:

**Part 3 — Implementation Architecture, Public API & Testing**

**Conforms to JESS v1.0**

══════════════════════════════════════════════════════════════
# JARVIS Engineering Specification

**Title:** Sprint 3.11 PR2 — Situational Awareness Projection Engine

**Part 3 — Implementation Architecture, Public API & Engineering Contracts**

---

> This specification conforms to JARVIS Engineering Specification Standard (JESS) v1.0.

---

# 38. Implementation Architecture

## 38.1 Objective

This section defines the implementation architecture required to realise the Projection Engine while preserving the architectural guarantees established in Parts 1 and 2.

Implementation SHALL remain subordinate to architecture.

Where implementation convenience conflicts with architectural principles, the architecture SHALL prevail.

---

## 38.2 Package Structure

The Projection Engine SHALL exist as a discrete architectural package within the Executive Operating System.

Recommended package structure:

```text
lib/

  executive-operating-system/

    situational-awareness/

      projection/

        ProjectionEngine.ts

        ProjectionArtifact.ts

        ProjectionAdapter.ts

        ProjectionRegistry.ts

        ProjectionValidator.ts

        MergeEngine.ts

        MergeConflict.ts

        MergeResult.ts

        SourceAvailability.ts

        Provenance.ts

        index.ts
```

Supporting implementation SHALL remain internal unless explicitly exported.

---

## 38.3 Package Responsibilities

Projection package responsibilities SHALL include:

- projection orchestration
- adapter registration
- merge execution
- validation
- provenance preservation
- deterministic ordering

Responsibilities SHALL NOT include:

- reasoning
- prioritisation
- orchestration
- execution
- behavioural routing

---

# 39. Public API

## 39.1 Philosophy

The public API SHALL be intentionally small.

Consumers SHALL depend upon stable architectural abstractions rather than implementation details.

Internal classes SHALL remain internal wherever possible.

---

## 39.2 Public Components

The following components SHOULD be publicly exported.

```
ProjectionEngine

ProjectionAdapter

ProjectionArtifact

ProjectionRegistry

MergeResult

MergeConflict

SourceAvailability

Provenance
```

Internal merge utilities SHALL remain private.

---

## 39.3 Construction Contract

Consumers SHALL construct Situational Awareness exclusively through ProjectionEngine.

Conceptually:

```text
ProjectionEngine

↓

Situational Awareness Snapshot
```

Consumers SHALL NOT invoke merge components directly.

---

# 40. Projection Engine

## 40.1 Architectural Role

ProjectionEngine is the orchestration component responsible for executing deterministic operational projection.

ProjectionEngine SHALL coordinate:

adapter execution

validation

merge

construction

ProjectionEngine SHALL remain unaware of behavioural reasoning.

---

## 40.2 Responsibilities

ProjectionEngine SHALL:

execute registered adapters

collect Projection Artifacts

validate artifacts

execute merge

invoke createSituationalAwareness()

return immutable snapshot

ProjectionEngine SHALL NOT:

cache operational state

infer operational meaning

calculate priorities

perform behavioural routing

---

# 41. Projection Registry

## 41.1 Purpose

ProjectionRegistry maintains the set of registered Projection Adapters.

Registration SHALL be explicit.

Registration SHALL be deterministic.

Runtime discovery SHALL NOT occur.

---

## 41.2 Behaviour

ProjectionRegistry SHALL:

register adapters

remove adapters

enumerate adapters

return deterministic execution order

Registry SHALL NOT execute adapters.

Execution remains the responsibility of ProjectionEngine.

---

# 42. Projection Adapter Contract

ProjectionAdapter represents the standard integration contract for authoritative operational systems.

Every adapter SHALL implement one consistent architectural interface.

Conceptually:

```text
Observe

↓

Normalise

↓

Produce Projection Artifact
```

Adapters SHALL remain stateless wherever practical.

---

# 43. Projection Artifact

## 43.1 Definition

ProjectionArtifact is the canonical architectural representation of operational observations produced by one Projection Adapter.

ProjectionArtifact SHALL be immutable.

ProjectionArtifact SHALL be independently valid.

ProjectionArtifact SHALL be mergeable.

ProjectionArtifact SHALL be auditable.

ProjectionArtifact SHALL be replayable.

---

## 43.2 Required Contents

Every ProjectionArtifact SHALL contain:

canonical operational entities

provenance

availability

projection timestamp

adapter identity

validation state

metadata

Future versions MAY extend this structure.

---

## 43.3 Architectural Importance

ProjectionArtifact is not a transport object.

ProjectionArtifact is an architectural artifact.

It represents one complete observational contribution to operational truth.

Accordingly it SHALL remain immutable.

---

# 44. Merge Result

MergeResult represents the outcome of deterministic merge.

MergeResult SHALL expose:

merged entities

conflicts

validation state

construction readiness

MergeResult SHALL remain immutable.

---

# 45. Merge Conflict

MergeConflict represents observable disagreement.

MergeConflict SHALL expose:

affected entity

originating sources

conflict classification

diagnostic metadata

MergeConflict SHALL NOT determine operational significance.

Future reasoning layers perform that responsibility.

---

# 46. Provenance

## 46.1 Definition

Provenance represents the origin of every projected operational observation.

Provenance SHALL survive every stage of projection.

---

## 46.2 Minimum Provenance

Every operational entity SHALL retain:

source

identifier

projection timestamp

availability

adapter identity

Additional provenance MAY be added in future versions.

---

# 47. Source Availability

SourceAvailability represents the observational health of an authoritative operational source.

Suggested values:

```text
Available

Unavailable

Degraded

Unknown
```

Availability SHALL describe observation quality only.

It SHALL NOT imply operational importance.

---

# 48. Extension Architecture

The Projection Engine SHALL remain open for future operational sources.

Future adapters SHOULD include:

Configuration

Google Calendar

GitHub

Gmail

Google Drive

PHDSS

Future enterprise systems

Addition of a new adapter SHALL NOT require modification of MergeEngine or downstream reasoning layers.

This preserves architectural extensibility.

---

# 49. Error Architecture

Projection SHALL fail explicitly.

Examples include:

unsupported source

invalid artifact

duplicate identity

missing provenance

construction failure

Failures SHALL remain observable.

Silent recovery SHALL NOT occur.

---

# 50. Logging Philosophy

Projection logging SHALL support diagnostics without becoming operational state.

Logging SHOULD include:

projection duration

adapter execution

validation failures

merge conflicts

construction success

Logging SHALL NOT influence deterministic behaviour.

---

# 51. Performance Expectations

Performance optimisation SHALL remain subordinate to determinism.

Correctness SHALL take precedence over throughput.

Future optimisation SHALL preserve:

ordering

immutability

provenance

validation

architectural guarantees

---

# 52. Architectural Outcome

Following implementation of Part 3, the Projection Engine SHALL expose a stable architectural API suitable for long-term evolution.

Consumers SHALL interact exclusively with architectural contracts.

Internal implementation SHALL remain replaceable without affecting downstream reasoning systems.

══════════════════════════════════════════════════════════════

**End of Part 3A**

Continue:

**Part 3B — Testing, ADR-0006, Documentation, Quality Gates & Definition of Done**

══════════════════════════════════════════════════════════════
# JARVIS Engineering Specification

**Title:** Sprint 3.11 PR2 — Situational Awareness Projection Engine

**Part 3B — Verification, Repository Integration & Completion**

---

> This specification conforms to JARVIS Engineering Specification Standard (JESS) v1.0.

---

# 53. Verification Philosophy

## 53.1 Purpose

Verification exists to demonstrate that the Projection Engine satisfies its architectural guarantees.

Verification SHALL validate architectural behaviour.

Verification SHALL NOT merely measure code coverage.

The objective is confidence in deterministic architecture rather than implementation completeness.

---

## 53.2 Verification Priorities

Verification SHALL prioritise:

architectural correctness

determinism

immutability

validation

construction integrity

merge correctness

provenance preservation

backwards compatibility

Performance testing is explicitly secondary.

---

# 54. Test Matrix

The Projection Engine SHALL include comprehensive automated tests.

Recommended minimum suite:

### Projection Engine

✓ empty projection

✓ single adapter

✓ multiple adapters

✓ deterministic execution

✓ repeated execution

---

### Projection Registry

✓ adapter registration

✓ duplicate registration rejection

✓ deterministic ordering

✓ removal

---

### Projection Artifact

✓ immutable artifact

✓ provenance preservation

✓ serialisation

✓ validation

---

### Merge Engine

✓ single artifact merge

✓ multiple artifact merge

✓ duplicate detection

✓ merge conflict

✓ invariant enforcement

✓ deterministic ordering

✓ merge repeatability

---

### Validation

✓ structural validation

✓ semantic validation

✓ invalid artifact rejection

✓ missing provenance

✓ invalid availability

---

### Construction

✓ createSituationalAwareness() invoked

✓ deep freeze

✓ defensive copying

✓ immutable snapshot

---

### Snapshot

✓ JSON serialisation

✓ replay compatibility

✓ stable ordering

✓ equality

---

### Runtime

✓ runtime neutrality

✓ behavioural isolation

✓ connector isolation

---

Total recommended tests:

30–40 focused unit tests.

---

# 55. Architectural Verification

Verification SHALL demonstrate the following guarantees.

---

## Deterministic Projection

Identical Projection Artifacts produce identical snapshots.

---

## Provenance Preservation

Every operational entity remains traceable.

---

## Immutable Construction

Mutation attempts fail.

---

## Stable Ordering

Ordering remains identical across executions.

---

## Explicit Failure

Invalid operational observations fail predictably.

---

## Construction Boundary

Situational Awareness cannot be constructed outside the Projection Engine.

---

# 56. Documentation Requirements

Implementation SHALL update:

Executive Operating System documentation

System Architecture

Package diagrams

Projection lifecycle diagrams

Public API documentation

Architecture dependency diagrams

Repository package maps where applicable.

Documentation SHALL describe architecture rather than implementation detail.

---

# 57. ADR-0006

Implementation SHALL introduce:

ADR-0006

Title:

**Projection Before Interpretation**

---

## Context

The Executive Operating System requires a deterministic mechanism for transforming heterogeneous operational systems into one canonical operational representation.

Without a Projection Engine, reasoning systems become tightly coupled to operational connectors.

---

## Decision

Operational information SHALL first be projected into immutable Situational Awareness before any reasoning layer evaluates its significance.

Projection SHALL remain observational.

Interpretation SHALL remain the responsibility of downstream reasoning architecture.

---

## Consequences

Positive:

✓ deterministic architecture

✓ simplified reasoning

✓ connector independence

✓ replay capability

✓ explicit provenance

✓ architectural stability

Trade-offs:

• additional abstraction layer

• explicit merge implementation

• snapshot reconstruction

These trade-offs are accepted.

---

# 58. Backwards Compatibility

PR2 SHALL preserve all existing architectural contracts introduced by Sprint 3.11 PR1.

Existing public APIs SHALL remain unchanged unless modification is required to correct an architectural defect.

Projection SHALL extend the repository.

It SHALL NOT redesign previous work.

---

# 59. Quality Gates

The following SHALL complete successfully before merge.

Focused tests

Full repository tests

TypeScript compilation

Lint

Production build

Formatting

git diff --check

git status

Architecture review

Specification review

Repository documentation review

No pull request shall merge while any quality gate remains incomplete.

---

# 60. Completion Report

The implementation completion report SHALL include:

Repository changes

Package additions

Public exports

Architectural decisions

Test summary

Documentation summary

ADR summary

Quality gate results

Build verification

Known limitations

Future extension points

The completion report becomes part of the engineering record for the sprint.

---

# 61. Acceptance Criteria

Sprint 3.11 PR2 SHALL be considered complete when:

✓ Projection Engine exists.

✓ Projection Registry exists.

✓ Projection Artifact architecture implemented.

✓ deterministic merge implemented.

✓ validation implemented.

✓ provenance preserved.

✓ source availability implemented.

✓ immutable construction implemented.

✓ createSituationalAwareness() used exclusively.

✓ public API documented.

✓ documentation updated.

✓ ADR-0006 completed.

✓ quality gates passed.

✓ tests green.

---

# 62. Definition of Done

Sprint 3.11 PR2 is complete when JARVIS possesses a deterministic Projection Engine capable of constructing immutable Situational Awareness snapshots from one or more authoritative operational sources while preserving provenance, enforcing architectural invariants, maintaining deep immutability, and exposing a stable architectural boundary between operational observation and institutional reasoning.

No downstream architectural layer shall require direct knowledge of operational systems.

The Projection Engine becomes the permanent gateway through which operational reality enters the Executive Operating System.

---

# Architectural Outcome

Completion of Sprint 3.11 PR2 fundamentally changes the Executive Operating System.

Prior to this sprint, JARVIS possessed an immutable representation of operational state but no mechanism for constructing it.

Following this sprint, JARVIS gains a deterministic, replayable, auditable and extensible projection capability that transforms heterogeneous operational observations into a single canonical representation.

This architectural capability establishes the permanent separation between operational observation and institutional reasoning.

All future reasoning layers SHALL consume Situational Awareness rather than external operational systems directly.

This separation is considered a foundational architectural property of JARVIS.

══════════════════════════════════════════════════════════════

**End of Engineering Specification**

**Sprint 3.11 PR2 — Situational Awareness Projection Engine**

**Conforms to JESS v1.0**

**Status: Ready for Implementation**

══════════════════════════════════════════════════════════════
---

# Appendices

These appendices form part of the normative engineering specification and provide repository-wide architectural guidance for future implementation, maintenance and review.

---

# Appendix A — Architectural Glossary

This glossary establishes the canonical architectural vocabulary of the JARVIS repository.

Future specifications SHALL use these terms consistently.

## Model

An immutable canonical domain representation.

Models define architectural truth.

Examples:

- Situational Awareness
- Operational Identity
- Operational Project

Models SHALL remain implementation independent.

---

## Artifact

An immutable representation of an observation produced by an architectural subsystem.

Artifacts preserve provenance.

Artifacts are independently validatable.

Artifacts are mergeable.

Artifacts are replayable.

Example:

Projection Artifact

---

## Snapshot

An immutable point-in-time representation of operational state.

Snapshots represent operational truth.

Snapshots SHALL NOT mutate.

Examples:

Situational Awareness Snapshot

---

## Record

An immutable output representing institutional reasoning.

Records preserve governance decisions, reasoning and audit history.

Examples:

Governance Reasoning Record

Decision Ledger Record

---

## Observation

The deterministic retrieval of operational facts from authoritative systems.

Observation SHALL NOT include reasoning.

---

## Projection

The deterministic transformation of observations into canonical architectural objects.

Projection SHALL remain observational.

Projection SHALL NOT perform interpretation.

---

## Interpretation

Evaluation of operational significance.

Interpretation belongs to downstream reasoning architecture.

Projection SHALL NOT perform interpretation.

---

## Operational Truth

The observed operational state represented by immutable Situational Awareness.

Operational Truth is descriptive.

It is not predictive.

---

## Behavioural Truth

The behavioural identity of JARVIS.

Defined by the Behavioural Operating System.

---

## Governance Truth

Institutional reasoning recorded through governance records.

---

# Appendix B — Repository Ontology

The repository is organised around progressively richer architectural representations.

```
Reality

↓

Observation

↓

Artifact

↓

Projection

↓

Snapshot

↓

Decision Surface

↓

Attention

↓

Behaviour

↓

Reasoning

↓

Record

↓

Execution
```

Each architectural stage introduces one capability.

Each stage consumes the previous stage.

Architectural stages SHALL remain independently evolvable.

---

# Appendix C — Repository Architecture

```
                     JARVIS

          Behavioural Operating System

Identity

↓

Constitutions

↓

Capability

↓

Collaboration

↓

Diagnostics


──────────────────────────────────────────────


          Executive Operating System

Projection

↓

Situational Awareness

↓

Decision Surface

↓

Attention Engine

↓

Behavioural Router

↓

Execution

↓

Continuity
```

The Behavioural Operating System defines how JARVIS behaves.

The Executive Operating System defines what JARVIS knows.

These systems remain intentionally independent.

---

# Appendix D — Engineering Coding Conventions

Projection components SHALL:

- be immutable
- expose readonly APIs
- favour composition over inheritance
- use explicit types
- preserve provenance
- avoid mutable global state
- avoid hidden runtime behaviour
- avoid connector-specific logic outside adapters
- remain deterministic
- remain independently testable

Implementation SHOULD:

- minimise public surface area
- minimise coupling
- maximise cohesion
- preserve backwards compatibility

---

# Appendix E — Future Extension Points

The Projection Engine is intentionally extensible.

Potential future Projection Adapters include:

- Configuration
- Google Calendar
- Gmail
- GitHub
- Google Drive
- PHDSS
- Supabase
- Microsoft Teams
- Jira
- Confluence
- SharePoint
- Azure DevOps
- ServiceNow
- Salesforce

Future adapters SHALL integrate through the Projection Adapter contract.

Downstream reasoning architecture SHALL require no modification.

---

# Appendix F — Architectural Anti-Patterns

The following architectural patterns are explicitly prohibited.

---

## Anti-pattern 1

```
Decision Surface

↓

GitHub API
```

Reasoning SHALL NOT communicate directly with operational systems.

Correct architecture:

```
GitHub

↓

Projection Adapter

↓

Projection Artifact

↓

Projection Engine

↓

Situational Awareness

↓

Decision Surface
```

---

## Anti-pattern 2

```
Behaviour Router

↓

Calendar API
```

Correct:

```
Calendar

↓

Projection

↓

Snapshot

↓

Behaviour Router
```

---

## Anti-pattern 3

Projection performs prioritisation.

Rejected.

Prioritisation belongs to Attention Engine.

---

## Anti-pattern 4

Projection performs behavioural reasoning.

Rejected.

Behaviour belongs to Behavioural Router.

---

## Anti-pattern 5

Mutable Situational Awareness.

Rejected.

Operational Truth SHALL remain immutable.

---

## Anti-pattern 6

Multiple construction pathways.

Rejected.

Situational Awareness SHALL only be created through:

createSituationalAwareness()

---

# Appendix G — Engineering Review Checklist

Every Pull Request implementing this specification SHOULD be reviewed against the following checklist.

Architecture

☐ Architectural boundaries preserved

☐ No architectural drift

☐ Correct dependency direction

☐ Separation of projection and reasoning maintained

Determinism

☐ Deterministic behaviour

☐ Stable ordering

☐ Repeatable execution

Immutability

☐ Deep immutability

☐ Defensive copying

☐ Readonly interfaces

Validation

☐ Invariants enforced

☐ Explicit failures

☐ Provenance preserved

Construction

☐ Single construction pathway

☐ No bypass of createSituationalAwareness()

Testing

☐ Focused tests

☐ Full suite passes

☐ Lint

☐ TypeScript

☐ Build

Documentation

☐ ADR updated

☐ Documentation updated

☐ Public API documented

---

# Appendix H — Codex Implementation Guidance

Codex SHALL preserve repository architecture.

Implementation SHALL:

- respect Engineering Constitution
- respect North Star
- conform to JESS
- preserve backwards compatibility
- preserve deterministic behaviour
- preserve immutability
- preserve provenance
- implement small reviewable pull requests

Codex SHALL NOT:

- redesign completed architecture
- weaken deterministic guarantees
- introduce mutable operational state
- bypass createSituationalAwareness()
- mix projection with interpretation
- introduce hidden runtime behaviour

If implementation appears to require redesign of completed architecture, implementation SHALL pause pending architectural review.

---

# Appendix I — Future Sprint Context

This specification establishes architectural dependencies for future Executive Operating System development.

Current capability:

```
Situational Awareness Model

↓

Projection Engine
```

Future roadmap:

```
PR3

Decision Surface

↓

PR4

Attention Engine

↓

PR5

Behavioural Router

↓

Execution

↓

Continuity
```

Future specifications SHALL consume the Projection Engine.

They SHALL NOT communicate directly with operational systems.

---

# Appendix J — Repository Evolution

Repository capability before Sprint 3.11 PR2

✓ Behavioural Operating System

✓ Situational Awareness Model

Repository capability after Sprint 3.11 PR2

✓ Behavioural Operating System

✓ Situational Awareness Model

✓ Projection Engine

✓ Projection Artifact

✓ Deterministic Merge

✓ Provenance Preservation

✓ Immutable Operational Snapshots

Future dependencies

Sprint 3.11 PR3

Decision Surface

Sprint 3.11 PR4

Attention Engine

Sprint 3.11 PR5

Behavioural Router

These future capabilities SHALL consume the architectural abstractions introduced by this specification.

---

# Appendix K — Revision History

| Version | Date | Sprint | PR | JESS Version | Description |
|---------|------|--------|----|--------------|-------------|
| 1.0 | Initial Release | 3.11 | PR2 | 1.0 | Initial Engineering Specification |

Future revisions SHALL document:

- architectural changes
- ADR references
- backwards compatibility
- implementation impacts

Revision history forms part of the permanent engineering record.

---

# Appendix L — Engineering Philosophy

The Projection Engine represents more than a software component.

It establishes the architectural boundary through which operational reality enters the Executive Operating System.

Accordingly, the Projection Engine SHALL remain:

- deterministic
- immutable
- auditable
- replayable
- observable
- extensible
- implementation independent

Projection observes.

Reasoning interprets.

Behaviour decides.

Execution acts.

Maintaining this separation is a foundational architectural principle of JARVIS.

```

---

## One final recommendation

I would actually promote **Appendix A (Glossary)** and **Appendix B (Repository Ontology)** out of this specification and into **JESS v1.1** as repository-wide standards.

That means every future specification—PR3, PR4, PR5, and beyond—can simply reference them instead of redefining them. They become part of the architectural language of JARVIS, much like a ubiquitous language in Domain-Driven Design, ensuring every engineer (or AI coding agent) works from the same shared vocabulary. I think that's the natural next evolution of the engineering methodology you've established.
