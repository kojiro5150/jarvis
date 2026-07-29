# Sprint 3.42 — Projection Generality Validation (Email)

**Status:** Halted at mandatory pre-implementation review  
**Outcome:** Architectural hypothesis falsified  
**Data used:** Repository contracts and synthetic examples only; no inbox was accessed

## Objective

Sprint 3.42 was intended to test whether a second, materially different connector domain could
follow the existing path without changing any architectural layer:

```text
Email connector output
        ↓
EmailProjectionAdapter
        ↓
ProjectionArtifact
        ↓
ProjectionEngine
        ↓
Situational Awareness snapshot
```

The sprint expressly required implementation to stop if Email could not preserve its deterministic
observations through that path without changing `ProjectionArtifact`, `ProjectionEngine`, or
Situational Awareness; introducing a generic metadata bag; reconstructing connector records; or
inferring meaning.

## Mandatory review result

The pre-implementation review found a blocking representational mismatch. The current
`ProjectionEntities` contract can publish only identity, roles, projects, commitments, waiting
items, priorities, active work, and context. The resulting `SituationalAwareness` contract exposes
the same operational categories plus source state. It has no canonical communication or message
observation.

Consequently, a deterministic Email observation cannot retain message identity, thread identity,
sender, recipients, sent/received timestamps, labels, read state, attachment presence, or reply
relationship in the canonical snapshot. Only source availability can survive. Treating a message
as a commitment or waiting item would infer commitment, required action, or reply requirement.
Putting Email fields in `ProjectionArtifact.metadata` would use a generic metadata bag and would
still discard those fields when `ProjectionEngine` constructs Situational Awareness. Reconstructing
the Email record downstream would violate the publication and replay boundaries.

This is direct falsification evidence under the sprint stop conditions. No adapter, fixture, test,
export, connector invocation, or architectural modification was implemented.

## Connector contract finding

The repository's existing `EmailMessage` is not sufficient as the strict deterministic observation
contract required by this sprint. It omits thread identifier, recipients, sent timestamp,
attachments, reply relationship, and connector labels as labels. It also includes `needsReply`,
which the contract itself describes as a heuristic, and normalization can fall back to the current
time. Sprint 3.42 forbids reply-requirement inference and non-deterministic replay inputs.

Using that contract would therefore trigger the additional stop condition concerning assumptions
not represented in the connector contract. Changing the connector contract would be separate
architectural work and is not silently included in this validation sprint.

## Decision

Implementation is halted. The existing architecture successfully represents Calendar's explicit
commitments, but it does not presently provide a source-neutral canonical representation for
deterministic communications. Architecture owners must make an explicit, separately approved
decision before Email projection is attempted. That decision must not be smuggled into an adapter.

See the [Projection Generality Report](./architecture/specifications/Sprint-3.42-Projection-Generality-Report.md)
for the comparison, falsification evidence, and publication responsibility audits.

## Scope explicitly not performed

- No live Gmail, Outlook, personal, organisational, Governance Engineering, Barwon Health, LLEGC,
  or research correspondence was accessed.
- No synthetic message fixture was passed through production connectors.
- No priority, urgency, importance, intent, commitment, action, task, sentiment, project,
  attention, specialist, or reply-requirement inference was introduced.
- No projection or Situational Awareness contract was changed.
- No Calendar behaviour was changed.

