# ADR-0023 — Evidence-Driven Canonical Evolution

- **Status:** Accepted
- **Date:** 29 July 2026
- **Owner:** JARVIS Architecture
- **Scope:** Constitutional evolution of the canonical ontology

## Constitutional basis

This decision is subordinate to the Engineering Constitution, North Star, Design Constitution,
Constitutional Publication Principles, and previously accepted architectural decisions. Those
authorities continue to govern human authority, deterministic engineering, architectural
ownership, publication behaviour, identity, provenance, replay, immutability, and bounded
responsibility. This ADR may not be used to reconcile or override a conflict with a higher
constitutional authority; any such conflict requires work to stop and the conflict to be
documented for explicit constitutional review.

In particular:

- ADR-0001 establishes a single constitutional execution lineage, one owner and one authority per
  publication, stable identity, deterministic replay, and non-reconstruction.
- ADR-0021 preserves the bounded responsibility of interaction processing and prevents application
  pressure from transferring conversation, reasoning, execution, or foundation authority into its
  publication.
- ADR-0022 establishes one responsibility per immutable publication and requires new projections,
  rather than responsibility expansion, when application needs exceed an existing boundary.
- The Constitutional Publication Principles define the permanent behavioural obligations of every
  canonical publication, including its responsibility audit, deterministic construction, identity
  integrity, provenance, deep immutability, non-reconstruction, and boundary compliance.

## Context

Earlier sprints established Identity Integrity, the Projection Principle, Publication
Responsibility, Deep Immutability, and Constitutional Publications. Together, these decisions make
canonical publications durable architectural authorities rather than convenient data containers.

Sprint 3.42 attempted to validate source-neutrality by introducing Email as a second,
fundamentally different observation domain. The projection architecture remained valid. Identity,
provenance, deterministic replay, and publication boundaries generalised successfully. The
architectural failure was instead ontological: deterministic communication observations had no
constitutionally valid canonical destination.

The sprint deliberately stopped rather than placing communication facts into a publication with a
different responsibility, adding inferred meaning to make them fit, or allowing connector or
application concerns to reshape the canonical model. That result demonstrates why the repository
requires a permanent constitutional rule for ontology evolution.

## Architectural problem

A canonical publication confers durable meaning, ownership, and authority. Introducing one too
early expands the Executive Operating System around an imagined need; forcing new observations
into an existing publication expands or corrupts that publication's responsibility. Either course
creates architectural drift.

Canonical publications therefore must not grow through anticipated requirements, future
speculation, convenience, adapter pressure, application pressure, or incremental feature requests.
Evolution is justified only after existing publications have been rigorously evaluated and shown
to be constitutionally insufficient for deterministic observations.

## Decision

**The canonical ontology of the Executive Operating System shall evolve only through
evidence-driven constitutional evolution.**

New canonical publications shall be introduced only when rigorous, documented architectural
analysis demonstrates that deterministic observations cannot be represented by any existing
canonical publication without violating constitutional principles or introducing semantic
inference.

This ADR governs ontology evolution. It does not govern implementation techniques, select an
implementation, or authorise production work.

## Constitutional principles

### 1. Evidence Before Ontology

Canonical concepts shall be introduced only in response to demonstrated architectural
insufficiency. Potential future domains, plausible use cases, roadmaps, and anticipated capability
are not sufficient evidence.

### 2. Exhaust Existing Canonical Publications

Before a new canonical publication is proposed, every existing canonical publication shall be
evaluated as a possible destination. The analysis shall identify each publication, its
constitutional responsibility, the attempted mapping, and the precise reason for rejection.

It is insufficient to state that a publication “does not fit.” Each rejection must explain which
responsibility, authority, identity, provenance, replay, immutability, non-reconstruction,
publication-boundary, or other constitutional rule the mapping would violate.

### 3. Deterministic Evidence Only

Architectural insufficiency must arise from deterministic, externally observable facts. A new
canonical publication shall not be justified by reasoning, semantic inference, LLM interpretation,
anticipated workflows, future application behaviour, or executive convenience.

Reasoning may later consume a canonical publication within its own authorised boundary. Reasoning
cannot supply the observational evidence required to create that publication.

### 4. Rigorous Documented Mapping

A new canonical publication may be introduced only after rigorous, documented attempts to map
deterministic observations onto every existing canonical publication demonstrate that no existing
publication can represent those observations without violating constitutional principles or
introducing semantic inference.

This evidentiary requirement does not require throwaway production code. Documented architectural
mapping and falsification analysis are sufficient where they conclusively demonstrate
incompatibility.

### 5. Isomorphic Initial Publication

The first version of a newly introduced canonical publication shall be isomorphic to the
deterministic observations that justified its existence. Its fields, distinctions, and identity
inputs must be traceable to that evidence and the approved publication responsibility.

It shall not anticipate future domains, future connectors, future capabilities, future
applications, or future reasoning. The initial publication shall contain only deterministic
evidence supported by the architectural record.

### 6. Falsification Before Expansion

Canonical ontology evolves by falsifying the sufficiency of the existing model. It does not evolve
by anticipating future abstractions. A demonstrated failure to represent deterministic
observations is evidence. Speculation is not.

## Required architectural process

The following lifecycle is mandatory:

```text
Observed deterministic domain
  ↓
Attempt mapping onto every existing canonical publication
  ↓
Document every rejection
  ↓
Publication Responsibility Audit
  ↓
Constitutional review
  ↓
Determine whether a genuine ontological gap exists
  ├─ No gap → do not introduce a new publication
  └─ Gap demonstrated
       ↓
     Propose new canonical publication
       ↓
     New ADR (where required)
       ↓
     Implementation
```

The record presented for constitutional review shall contain:

1. the deterministic observations and their external source;
2. the repeatability and provenance of those observations;
3. the complete existing-publication mapping analysis and explicit rejections;
4. the Publication Responsibility Audit outcome;
5. the constitutional principles that would be violated by every rejected mapping;
6. the minimal proposed responsibility and isomorphic initial boundary, if a gap exists; and
7. the architectural approval required before implementation begins.

A finding of no gap terminates the ontology proposal. Connector, adapter, application, or delivery
pressure may not bypass the process. A finding of a gap authorises a proposal for review, not the
publication or its implementation. Where the proposed publication establishes or changes a
constitutional boundary, a separate ADR is required before implementation.

## Relationship to the Constitutional Publication Principles

The Constitutional Publication Principles define **how canonical publications behave**. They
govern publication responsibility, construction, identity, provenance, replay, deep immutability,
consumption, non-reconstruction, failure behaviour, auditing, and amendment.

This ADR defines **when new canonical publications may come into existence**. It governs the
evidence and review needed to establish that the existing ontology is insufficient.

The documents complement one another. They do not overlap: satisfaction of this ADR does not waive
publication conformance, and conformance with the Publication Principles does not establish the
need for a new publication.

## Relationship to Sprint 3.42

The Sprint 3.42 Projection Generality Validation and Sprint 3.42 Projection Generality Report
provide the motivating evidence for this ADR and should be read as the bounded experiment and its
architectural finding; their contents are not reproduced here.

The Email experiment demonstrated a genuine ontological gap, not a connector-specific failure of
the projection architecture. It showed that source identity, provenance, deterministic replay, and
publication boundaries could generalise while deterministic communication observations still
lacked an authorised canonical destination. The decision to stop is the precedent formalised by
this ADR; it is not, by itself, approval to introduce a communication publication.

## Consequences

### Positive

- Ontology grows only through evidence.
- Architectural drift is reduced.
- Future abstractions require explicit justification.
- The canonical model remains minimal.
- The projection architecture remains stable when source-specific pressure emerges.

### Negative

- New ontology requires additional analysis.
- Architecture evolves more deliberately.
- Mapping, audit, and constitutional-review documentation add work before implementation.

These trade-offs are intentional. Deliberate analysis is preferred to premature authority,
semantic ambiguity, and long-lived canonical debt.

## Implementation impact

This ADR introduces no implementation changes. It makes no runtime behaviour changes, schema
changes, package changes, or production code changes. It does not introduce a new canonical
publication.

Future implementation work remains subject to separate architectural approval and to all existing
constitutional, publication, package, contract, and validation requirements.
