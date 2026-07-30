# Sprint 3.42 — Projection Generality Report

**Review stage:** Pre-implementation architectural validation  
**Conclusion:** The source-neutrality hypothesis is falsified for deterministic Email observations
under the current canonical contracts.

## Review basis

The review followed the required hierarchy and examined the Engineering Constitution, North Star,
Design Constitution, Constitutional Publication Principles, canonical runtime ADR-0024,
ADR-0021, ADR-0022, the available Sprint 3.31–3.41 package documentation, the Projection Engine,
`ProjectionArtifact`, Situational Awareness model and assembly, Calendar adapter and connector
contracts, and existing projection, replay, provenance, identity, immutability, integration, and
package-boundary tests.

Sprint 3.31 and Sprint 3.32 specifications are not present in this repository. Their implemented
package boundaries and tests were reviewed where available. This absence does not cause the
falsification; the blocking mismatch is explicit in the current published TypeScript contracts.

## Canonical fit analysis

### Calendar

The Calendar adapter can deterministically translate an event into an
`OperationalCommitment`. The event identifier becomes a stable, source-qualified commitment
identifier; title and bounded timestamps have canonical fields; and explicit cancellation maps to
a supported commitment state. Source identity, kind, availability, adapter identity, and
observation time remain in provenance and become canonical source state.

This mapping is intentionally lossy for fields outside the commitment contract, but the fields
needed to represent the supported Calendar observation have canonical destinations.

### Email

Email is an observation of communication, not inherently a role, project, commitment, waiting
item, priority, active-work item, or operational context. The current canonical contracts have no
communication collection and no entity capable of retaining the required deterministic Email
facts.

| Required deterministic observation | Existing canonical destination | Result |
| --- | --- | --- |
| Message identifier | None | Lost |
| Thread identifier | None | Lost |
| Sender | None | Lost |
| Recipients | None | Lost |
| Sent timestamp | None | Lost |
| Received timestamp | None | Lost |
| Connector labels | None | Lost |
| Read/unread state | None | Lost |
| Attachment presence | None | Lost |
| Reply relationship | None | Lost |
| Connector provenance | `Provenance`, then `OperationalSourceState` | Representable only at source level |
| Stable deterministic reference | None for a message entity | Lost |

The architecture can report that an Email source was observed. It cannot publish what deterministic
messages were observed.

## Required comparison

| Concern | Calendar | Email | Shared invariant / difference |
| --- | --- | --- | --- |
| Identity | Stable calendar-qualified event ID becomes commitment ID | Message/thread IDs have no canonical entity | Stable identity is required; only Calendar has a destination |
| Provenance | Source provenance survives as source state | Source provenance can survive as source state | Shared envelope works, but does not represent Email observations |
| Timestamps | Start/end map to commitment timestamps | Sent/received have no communication timestamps | RFC 3339 validation is shared; semantic destinations are not |
| State | Explicit cancellation maps to canonical commitment state | Read state and labels have no canonical state | Email state cannot be mapped without loss or invention |
| Projection | Event becomes an explicit commitment | Message cannot truthfully become an existing entity | Existing projection is category-bound, not source-neutral |
| Canonical representation | `OperationalCommitment` | None | Architectural difference is blocking |
| Connector-specific behaviour | Google source validation and event mapping remain in adapter | Provider validation could remain in adapter, but message facts cannot leave it | Adapter isolation alone is insufficient |
| Replay | Artifact and snapshot retain the projected commitment | Artifact metadata could replay, but the snapshot would discard message facts | End-to-end canonical replay fails for Email content |

## Falsification attempts

### Map Email to `OperationalCommitment`

Rejected. Receipt of a communication is not objective evidence of a commitment. This would infer
intent or commitment and would manufacture a commitment kind and status.

### Map Email to `OperationalWaitingItem`

Rejected. A message does not deterministically establish that the user is waiting, needs to reply,
or requires action. This would infer reply requirement and a waiting relationship.

### Map Email to `OperationalWorkItem`, `OperationalPriority`, or project/role

Rejected. Each option performs explicitly forbidden semantic classification or inference.

### Store messages in `ProjectionArtifact.metadata`

Rejected. `metadata` accepts only string values, so structured records would require encoding and
downstream reconstruction. More importantly, the Projection Engine does not carry artifact
metadata into Situational Awareness. This would introduce the prohibited generic metadata-bag
escape hatch without achieving canonical projection.

### Publish only source availability

Rejected as validation of Email projection. Although structurally valid, it drops every message
observation and therefore cannot prove projection correctness, message identity, or message-level
provenance.

## Stop-condition determination

Continuing requires at least one prohibited action:

1. modify `ProjectionEntities` / `ProjectionArtifact` to add a communication category;
2. modify Situational Awareness to publish communications;
3. encode Email records in generic metadata and reconstruct them downstream;
4. misclassify messages as existing canonical entities through inference; or
5. weaken projection correctness, identity, provenance, or replay to source-availability-only
   assertions.

The mandatory response is therefore to stop and report, not to choose among these changes.

## Publication Responsibility Audit

### Pre-implementation audit

| Question | Answer | Evidence |
| --- | --- | --- |
| Has any immutable publication changed responsibility? | No | No implementation or contract was changed. |
| Has any publication acquired another layer's responsibility? | No | The proposed adapter was not created. |
| Has connector behaviour leaked into canonical publications? | No | Email fields were not added or encoded. |
| Has reconstruction appeared? | No | Metadata encoding/reconstruction was considered and rejected. |
| Has identity changed? | No | Existing identity contracts remain untouched. |
| Have dependency boundaries widened? | No | No imports or exports were added. |
| Could any change instead exist entirely inside the adapter? | No | Adapter-local translation cannot create a truthful canonical destination. |

### Pre-merge audit

| Question | Answer | Evidence |
| --- | --- | --- |
| Has any immutable publication changed responsibility? | No | The change is documentation only. |
| Has any publication acquired another layer's responsibility? | No | No publication changed. |
| Has connector behaviour leaked into canonical publications? | No | No production code changed. |
| Has reconstruction appeared? | No | No encoded connector object or reconstruction path exists. |
| Has identity changed? | No | No identity code or contract changed. |
| Have dependency boundaries widened? | No | Documentation introduces no runtime dependency. |
| Could any change instead exist entirely inside the adapter? | No | The report records why that alternative fails. |

## Constitutional assessment

- **Responsibility remains separated.** Connectors acquire observations; adapters translate only
  where a canonical destination exists; the engine integrates canonical observations; Situational
  Awareness publishes canonical reality.
- **Projection remains before interpretation.** No Email meaning was inferred to force a fit.
- **Publications remain non-reconstructive.** No connector record was embedded or recreated.
- **Identity and provenance remain strict.** The sprint did not redefine correctness downward.
- **Calendar compatibility is preserved.** Calendar code and behaviour are unchanged.
- **Synthetic-only constraint is preserved.** No external service or correspondence was used.

## Validation disposition

The requested Email adapter tests (projection correctness, message identity, message provenance,
Email replay, invalid Email source handling, and cross-domain Email integration) cannot be written
honestly against a non-existent canonical destination. Tests that assert only source availability
would create false assurance and would not satisfy the sprint objective.

Repository-wide tests and static checks remain appropriate to confirm that the documentation-only
halt did not disturb the existing architecture.

## Conclusion and required next decision

Calendar proved that the architecture supports a connector whose observations are explicit
commitments. Email proves that the current canonical entity union is not general across observation
domains. The envelope and engine mechanics are connector-independent, but the canonical
publication is not general enough to represent deterministic communications.

Architecture owners should decide, through a separate constitutional specification and ADR if
approved, whether communications belong in Situational Awareness and what minimal immutable,
non-interpretive canonical contract owns them. Until that decision is made, an
`EmailProjectionAdapter` would be architecturally misleading and must not be implemented.
