# OperationalCommunication Constitutional Responsibility Statement

**Status:** Governing  
**Sprint:** 3.43  
**Method:** ADR-0023 evidence-driven canonical evolution

## Constitutional purpose

`OperationalCommunication` publishes the smallest source-neutral canonical record needed to state
that an authoritative communication protocol observed a communication. It preserves intrinsic
addressing and timestamp observations and protocol-asserted reply references without interpreting
their executive meaning.

## Constitutional ownership

The publication exclusively owns canonical communication identity, asserted sender and recipients,
sent and optionally received timestamps, optional subject text, and the protocol-defined
`In-Reply-To` and `References` values actually present at observation. Identity is stable and
source-qualified at projection. Arrays retain observed order and values.

## Explicit non-responsibilities

The publication does not own priority, urgency, workflow, tasks, projects, labels, categories,
commitments, waiting state, required action, read state, attachments, connector organisation,
threads, conversations, grouping, intent, sentiment, interpretation, or evidence storage. It does
not establish relationships to `OperationalCommitment` or any other canonical publication.

## Relationship to OperationalCommitment

`OperationalCommunication` and `OperationalCommitment` are constitutionally independent. A
communication is not evidence that a commitment exists. Projection MUST NOT create, modify, link,
or imply an `OperationalCommitment` from communication content or receipt.

## Publication invariants

1. Every publication has a non-empty, source-qualified canonical identifier.
2. Sender, recipients, and timestamps are recorded only as asserted by the authoritative source.
3. `In-Reply-To` is absent when the protocol value is absent.
4. `References` contains exactly the ordered, protocol-asserted values; absence is represented by
   an empty collection.
5. Protocol references may remain sparse or refer to communications outside the current snapshot.
6. No missing relationship is reconstructed and no conversation grouping is formed.
7. Publication values are JSON-replayable, defensively copied, immutable, and deterministic.
8. Canonical state contains no connector thread or conversation identifier and no metadata bag.

## Constitutional admissibility methodology

Admission follows ADR-0023: classify the observation; apply the intrinsic-property, export, and
constitutional-responsibility tests; then faithfully record only admitted observations. A value is
admissible only when an authoritative protocol asserts it, it describes the communication rather
than a connector's organisational model, and this statement assigns ownership. Absence remains
absence. Subject similarity, timestamp proximity, participant overlap, connector identifiers,
heuristics, machine learning, probability, and reasoning are never admissibility mechanisms.

## Publication boundaries

Projection adapters translate bounded observations into this canonical publication. The
Projection Engine validates and merges the publication but does not inspect preserved source
evidence. Situational Awareness publishes the canonical values. Evidence preservation remains an
independent responsibility and neither enters `ProjectionArtifact.metadata` nor flows through the
Projection Engine. This sprint creates no evidence service, store, query interface, or runtime
consumer.

## Implementation constraints

The implementation adds exactly this one publication, its deterministic projection path,
validation, lifecycle carriage, and tests. Existing publication responsibilities and schemas are
otherwise unchanged. No adapter field or future use case may broaden this statement implicitly;
amendment requires the constitutional evolution method in ADR-0023.
