# Constitutional Publication Principles

## Status and authority

This is a permanent constitutional architecture document for the Executive Operating System. It
applies to every existing and future immutable Executive Operating System publication. It is
subordinate to the Engineering Constitution, North Star, and Design Constitution, including their
preservation of human judgment, authority, and constitutional ownership.

These principles are authoritative across sprint specifications unless a later explicit
constitutional amendment supersedes them. This document is not an architectural decision record
(ADR), is not a sprint specification, and is not tied to a single implementation decision.

In this document, **must**, **must not**, **shall**, and **shall not** state normative requirements.
Text expressly introduced as a note is explanatory and does not create an additional requirement.

## Purpose

An Executive Operating System publication is an immutable, deterministic, validated architectural
object that communicates the result of one bounded constitutional responsibility to an authorised
downstream consumer.

Publications are not generic data-transfer objects, mutable application models, reconstruction
containers, orchestration state, or convenience aggregates. A publication may expose only the
content and references necessary to discharge its declared responsibility while preserving the
authority and ownership of its source publications.

## Constitutional principles

### 1. Identity Integrity

One immutable identity shall correspond to one immutable canonical object. A publication identity
must not alias multiple distinguishable published bodies. Any change to identity-bearing canonical
content must produce a different identity. References to upstream publications must use their
canonical identities.

### 2. Projection Principle

Each publication shall be produced as a bounded projection from its authorised immediate upstream
publication or from a constitutionally defined input set. A projector may validate, select,
summarise, or transform only the information required for its own responsibility. It must not
acquire the responsibilities of its source or its consumers.

A constitutionally authorised input set may contain more than one input where the publication's
established contract requires it. That authorisation does not permit the projector to reach beyond
the declared boundary, and it does not weaken the immediate-boundary rule for publications whose
contract names one upstream source.

### 3. Single Responsibility of Publications

Every immutable publication shall have exactly one constitutional responsibility. Its schema may
contain several fields only where every field directly serves that responsibility. Convenience,
anticipated reuse, or downstream application demand must not justify adding an unrelated
responsibility.

New capabilities should normally be introduced through a new publication or a downstream
application or capability layer, rather than by expanding a frozen publication. Any departure from
that norm must pass the Publication Responsibility Audit and the amendment requirements below.

### 4. Non-Reconstruction

Downstream publications shall reference upstream publications and preserve their canonical
identities and any necessary bounded summaries. They must not reconstruct, duplicate, or republish
earlier canonical objects as though they owned those objects. A downstream consumer must not be
able to derive from a later publication a counterfeit replacement for an earlier publication.

Bounded summaries are permitted when they directly serve the downstream publication's own
responsibility. Such summaries must remain referential, must not claim the source publication's
authority, and must not serve as substitutes for the source publication.

### 5. Deep Immutability

Published objects must be recursively immutable after publication. No consumer may mutate the
publication, its nested arrays, its nested objects, or its publication metadata. Where publication
accepts mutable input data, it must detach the published body from mutable caller-owned references
before recursively freezing that body.

### 6. Content-Addressed Identity

A publication identity should be derived deterministically from the exact canonical,
identity-bearing published body using the repository's approved cryptographic hashing approach.
The identity field itself must be excluded from its own hash input. Non-canonical runtime
artefacts, object insertion order, mutable references, and incidental execution state must not
affect identity.

Some established publications use a constitutionally established lineage-derived identity rather
than full-body content addressing. This document does not retroactively redefine those identities.
Every identity scheme must comply with the contract governing its publication and, in all cases,
must preserve Identity Integrity.

### 7. Deterministic Replay

Identical canonical inputs, configuration, and explicit reference times must produce structurally
identical publications and identities. Hidden clocks, randomness, network state,
environment-dependent ordering, and mutable global state must not influence publication.
Unavailable and invalid-source outcomes must also be deterministic.

### 8. Immediate-Upstream Dependency Only

A publication component may depend only on its constitutionally authorised immediate upstream
contract and shared neutral utilities. It must not bypass the publication chain to import earlier
runtime, operational, session, interaction, reasoning, routing, orchestration, execution, or
application layers.

Where a publication is explicitly defined by a constitutionally authorised input set, dependencies
must remain limited to that declared boundary. Tests or package-conformance checks should enforce
forbidden imports and reverse dependencies where practical.

### 9. Publication Responsibility Audit

The Publication Responsibility Audit is mandatory for every future sprint and every proposed
change to an immutable publication. It shall occur both **before implementation** and **before
merge**. Each audit must ask:

1. Has the publication's constitutional purpose changed?
2. Has it acquired another layer's responsibility?
3. Has behavioural, conversational, prompt, memory, reasoning, routing, orchestration, execution,
   interface, or application state been added?
4. Could the proposed capability be implemented as a new publication or downstream application
   instead?
5. Has the publication become reconstructive rather than referential?
6. Has its identity scheme stopped uniquely representing its canonical object?
7. Has its dependency boundary widened beyond its authorised upstream source?

If any answer indicates responsibility drift, implementation must stop until an explicit
constitutional justification or amendment is documented. The applicable sprint documentation or
pull-request record must state the result of both audits.

### 10. Applications Consume Publications

Applications such as Chat, DAWNWATCH, MARCUS, Voice, dashboards, automation, and APIs shall consume
stable application-facing publications. Applications must not bypass those boundaries to read or
reconstruct foundational runtime state unless a future constitutional design explicitly authorises
a new boundary.

Application-specific conversation, prompts, memory, rendering, interaction history, orchestration,
and execution state belong in application or capability layers, not in foundational publications.
Applications remain consumers; consumption does not transfer publication ownership or grant
reasoning, routing, approval, orchestration, or execution authority.

## Frozen publication responsibilities

The following responsibilities, established through Sprint 3.41, are frozen:

| Publication | Sole constitutional responsibility | Rule for future change |
| --- | --- | --- |
| `ExecutiveRunRecord` | Runtime evidence only | Changes must remain within runtime evidence. |
| `ExecutiveOperationalState` | Operational readiness only | Changes must remain within operational readiness. |
| `ExecutiveSession` | Executive interaction context only | Changes must remain within executive interaction context. |
| `ExecutiveInteractionContract` | Interaction permissions and constitutional boundaries only | Changes must remain within interaction permissions and constitutional boundaries. |
| `ExecutiveInteractionResult` | Validated interaction readiness only | Changes must remain within validated interaction readiness. |
| `ExecutiveApplicationContext` | Stable application-facing executive context only | Changes must remain within stable application-facing executive context. |

Each future change must remain within the responsibility in this table unless a deliberate
constitutional amendment is approved. In particular, none of these publications shall acquire
conversation, prompts, memory, LLM state, reasoning ownership, routing authority, orchestration,
execution hints, execution state, rendering, or mutable application state where that content is
outside its stated responsibility. References to execution evidence in `ExecutiveRunRecord` and
bounded readiness or authority summaries in downstream projections do not transfer execution or
other upstream ownership.

## Constitutional publication lifecycle

```text
Authorised canonical input
  → validation
  → bounded deterministic projection
  → canonicalisation
  → identity derivation
  → deep immutability
  → publication
  → authorised downstream consumption
```

Publication occurs only after validation and identity construction are complete. A failure to
validate must follow the publication's deterministic failure or unavailable contract and must not
be repaired through reconstruction or hidden state.

## Conformance requirements

Before implementation, every new immutable publication must define:

- its constitutional responsibility;
- its authorised upstream input or input set;
- its authorised downstream consumers;
- its schema and contract version;
- its identity scheme;
- its canonical identity-bearing body;
- its deterministic failure or unavailable behaviour;
- its immutability mechanism, including detachment from mutable inputs;
- its non-reconstruction rule;
- its forbidden dependencies;
- tests proving deterministic replay, identity integrity, deep immutability, and boundary
  compliance; and
- the outcome of its pre-implementation Publication Responsibility Audit.

Before merge, the implementation and documentation must demonstrate conformance with those
definitions and record the pre-merge Publication Responsibility Audit outcome. A declaration of
conformance must not override a conflicting higher constitutional authority.

## Relationship to other repository authority

- The Engineering Constitution, North Star, and Design Constitution govern this document. Their
  human-authority, architectural-ownership, and behavioural rules remain controlling.
- ADRs record bounded architectural decisions. They may explain why a publication or boundary
  exists, but they do not silently amend these permanent principles.
- Sprint specifications govern scoped delivery. They must apply these principles and may not weaken
  them through sprint-local language or implementation convenience.
- Package documentation describes the contract actually implemented by a package. It must remain
  consistent with the applicable constitutions, ADRs, and these principles; it does not expand a
  package's constitutional responsibility.

**Explanatory note:** this document consolidates enduring rules visible in the architecture through
Sprint 3.41. It does not reproduce the sprint history, change existing publication contracts, or
represent unimplemented capability as present.

## Amendment rule

These principles may be changed only through an explicit constitutional amendment. A sprint
specification, ADR, package change, or implementation convenience must not silently weaken them.

Any proposed exception must, before implementation:

1. identify the affected principle;
2. explain why the existing principle is insufficient;
3. identify every affected publication;
4. document migration and compatibility consequences; and
5. receive explicit architectural approval.

An exception shall be no broader than its approved scope. Human judgment remains final, and no
amendment may transfer human authority implicitly.
