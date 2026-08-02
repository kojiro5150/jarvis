# Sprint 3.96 — Governed Gmail Conversational Evidence Publication Contract

**Status:** Specification

**Sprint Type:** Governance Decision / Publication Contract

**Implementation Authority:** None

**Production Integration:** Prohibited

**Governing Trigger:** Sprint 3.88 — Governed Conversational Production Evidence Audit

## 1. Recommendation

**Decision:** Approve this governed Gmail conversational evidence publication contract.

This contract resolves the bounded second-stage mapping from the existing canonical production Gmail recipient-evidence path into `GovernedCommunicationEvidenceInput`. It does not redesign Gmail acquisition, reopen recipient normalization, modify production, or authorize implementation.

## 2. Repository Precondition

| Record | Result |
| --- | --- |
| Repository | `/workspace/jarvis` |
| Branch | `work` |
| Starting commit | `8d86d73cb3f7e1c313e4dfaa9643058108c4c1d6` |
| Starting working tree | Clean |
| Sprint 3.95 | Present and merged by the starting commit |
| Required artefacts | Present |
| `/api/chat` | Unchanged by the claims/conflicts track and by this sprint |

Repository inspection confirms that `projectProductionGmailEvidence` remains the production canonical normalizer boundary. No production publisher resolves the complete `GovernedCommunicationEvidenceInput` contract. Existing governed-conversation fixture values are test data, not a production publisher or authority for this mapping. The new reference and policy identifiers do not collide with an existing governed identifier.

## 3. Governing Artefacts Reviewed

The following artefacts were read completely, in governing order:

1. `docs/ENGINEERING_CONSTITUTION.md` and `CONSTITUTION.md`;
2. `docs/architecture/NORTH_STAR.md`;
3. `docs/architecture/JARVIS-Engineering-Specification-Standard.md`;
4. `docs/CONSTITUTIONAL-PUBLICATION-PRINCIPLES.md`;
5. `docs/architecture/ROADMAP.md`;
6. `docs/SPRINT-3.69-GOVERNED-GMAIL-RECIPIENT-CONTRACT.md`;
7. `docs/SPRINT-3.70-GMAIL-RECIPIENT-PRODUCTION-INTEGRATION.md`;
8. `docs/SPRINT-3.76-GOVERNED-CONVERSATIONAL-RUNTIME-CONTRACT.md`;
9. `docs/SPRINT-3.82-GOVERNED-CONVERSATIONAL-LINEAGE-IDENTITY-CONTRACT.md`;
10. `docs/SPRINT-3.89-GOVERNED-CONVERSATIONAL-CLAIMS-BOUNDARY-CONTRACT.md`;
11. `docs/SPRINT-3.90-GOVERNED-CONVERSATIONAL-CONFLICTS-BOUNDARY-CONTRACT.md`;
12. `docs/SPRINT-3.94-GOVERNED-CLAIMS-AND-CONFLICTS-COMPOSITION-CORRECTION-CONTRACT.md`;
13. `docs/SPRINT-3.95-CLAIMS-AND-CONFLICTS-COMPOSITION-CORRECTION-IMPLEMENTATION.md`;
14. `docs/audits/SPRINT-3.88-GOVERNED-CONVERSATIONAL-PRODUCTION-EVIDENCE-AUDIT.md`; and
15. current definitions and implementations in `lib/executive-context/gmail-production-evidence.ts`, `lib/executive-operating-system/situational-awareness/projection/adapters/gmail/types.ts`, `lib/executive-operating-system/situational-awareness/projection/adapters/gmail/normalizer.ts`, `lib/governed-conversation/types.ts`, and `lib/governed-conversation/projection-composer.ts`.

## 4. Sprint 3.88 Finding Reconfirmed

**Confirmed:**

* the production Gmail acquisition and canonical `normalizeGmailObservation` path are real and production-wired;
* `ProductionGmailRecipientEvidence` contains canonical `NormalizedGmailObservation[]` recipient evidence;
* no second-stage production publisher maps those observations into `GovernedCommunicationEvidenceInput`; and
* `compatibilityBoundary` and `policyReference` are not mechanically derivable from upstream evidence.

The gap is governance-shaped. This contract closes the policy decision without implementing the publisher.

## 5. Sprint 3.69 and Sprint 3.70 Non-Reopening

**Decision:** Sprint 3.69 is not reopened. Sprint 3.70 remains the implementation authority for production acquisition and normalization.

This contract changes no Gmail route, query scope, fetch, parser, `To`/`Cc`/`Bcc` handling, normalization, ordering, duplicate treatment, alias semantics, group semantics, delegation semantics, routing semantics, hidden-recipient semantics, malformed-input handling, availability semantics, retrieval-time meaning, or provenance meaning. The closed recipient evidence vocabulary remains:

```text
available
not_fetched
not_authorised
unknown
```

`none` remains reserved. The conversational publisher shall consume these values without reinterpretation. It shall not reacquire Gmail data, reconstruct evidence from `OperationalState`, prompt text, DAWNWATCH state, local fallback data, or legacy `EmailMessage`, or introduce another recipient parser or normalizer.

## 6. Constitutional Responsibility and Architecture Decision

The mapping has exactly one responsibility:

> Produce the bounded, referential Gmail communication-evidence shape required by governed conversational projection from an already canonical production Gmail observation under an explicit disclosure policy.

It does not own acquisition, recipient truth, parsing, semantic relevance, claim classification, conflict evaluation, evidence-status aggregation, conversation history, model reasoning, or source adjudication.

### Options

* **Option A — Pure mechanical mapper:** Rejected because the upstream object does not establish disclosure or compatibility policy.
* **Option B — Mutable runtime policy registry:** Rejected because this contract establishes one fixed policy and runtime selection would add configuration and identity complexity.
* **Option C — Governed deterministic mapper under a fixed versioned Gmail conversational publication policy:** **Selected.**
* **Option D — New canonical Gmail publication:** Rejected because it would duplicate the authority and identity of the existing canonical observation.

**Architecture Decision:** Option C — Governed deterministic mapper under a fixed versioned Gmail conversational publication policy.

The future mapper shall be deterministic, stateless, replayable, independent of model state and conversation text, and independent of `/api/chat` and mutable policy state.

## 7. Identity Integrity Decision

`GovernedCommunicationEvidenceInput` is a bounded downstream reference to existing canonical evidence. It is not a second Gmail observation or publication. It shall not receive a new publication ID, replacement recipient ID, message identity, or acquisition identity.

For one source-qualified upstream observation, the underlying evidence event remains:

```text
google-gmail + Gmail provider message ID + canonical normalized observation
```

The deterministic reference namespace is:

```text
google-gmail:message:<gmailMessageId>
```

`gmailMessageId` is `NormalizedGmailObservation.provenance.gmailMessageId`. This value is a source-qualified resource reference, not a new immutable publication identity. The RFC `NormalizedGmailObservation.messageId` remains canonical protocol metadata and does not replace the Gmail provider resource identity.

## 8. Binding Ten-Field Mapping

| Field | Exact binding | Decision |
| --- | --- | --- |
| `communicationReference` | `"google-gmail:message:" + O.provenance.gmailMessageId` | Deterministic |
| `recipientEvidenceReference` | `communicationReference + "#recipient-evidence"` | Deterministic subordinate reference |
| `sourceReference` | `{ sourceId: "google-gmail", resourceId: O.provenance.gmailMessageId, field: "communication_metadata", observedAt: O.provenance.retrievedAt }` | Deterministic |
| `provenanceReference` | `communicationReference + "#provenance"` | Deterministic subordinate reference |
| `retrievalTime` | `O.provenance.retrievedAt` | Deterministic connector retrieval time |
| `available` | `true` only for an eligible observation contained by an available canonical production bundle | Deterministic |
| `contentDigest` | Absent | Explicit non-population |
| `contentKind` | `gmail_communication_metadata` | Fixed governed metadata kind |
| `compatibilityBoundary` | `gmail_metadata_non_authoritative_conversation_context.v1` | Fixed governed policy |
| `policyReference` | `governed-gmail-conversational-metadata-disclosure.v1` | Fixed governed policy |

Here `O` is a `NormalizedGmailObservation` contained in `P.communications`, and `P` is its authoritative `ProductionGmailRecipientEvidence` bundle.

### Recipient evidence reference

```text
recipientEvidenceReference =
  "google-gmail:message:" + O.provenance.gmailMessageId + "#recipient-evidence"
```

It references the canonical recipient state and observations governed by Sprints 3.69 and 3.70. It is not a new publication, assertion ID, identity-resolution record, or completeness claim. Communication availability and recipient-evidence state are distinct. A communication with `available = true` and `recipientEvidence = unknown` is valid.

### Provenance reference and retrieval time

```text
provenanceReference =
  "google-gmail:message:" + O.provenance.gmailMessageId + "#provenance"
```

It references `O.provenance`; the conversational shape shall not duplicate that structure. `retrievalTime` and `sourceReference.observedAt` shall equal `O.provenance.retrievedAt`. Message date, Gmail internal date, bundle `observedAt`, snapshot time, projection time, request time, model time, and a new clock value shall not substitute.

`ProductionGmailRecipientEvidence.snapshotId` remains acquisition context. It is not communication, recipient, conversational, or provenance identity and shall not replace `gmailMessageId`.

### Content digest decision

**Decision:** absent under the metadata-only Sprint 3.96 contract.

No governed canonical body or byte serialization exists in this path as a digest subject. The publisher shall not hash the observation, recipients, provider metadata, or arbitrary JSON. `contentKind` is always `gmail_communication_metadata`; MIME structure and attachment presence do not turn metadata evidence into body evidence.

## 9. Compatibility Boundary

**Decision:**

```text
gmail_metadata_non_authoritative_conversation_context.v1
```

This boundary admits canonical Gmail metadata as source-qualified governed conversational evidence. It grants no authority to infer recipient identity, alias ownership, list membership, delivery, mailbox ownership, hidden recipients, importance, intent, urgency, commitments, policy meaning, source precedence, or factual truth beyond separately governed source assertions.

Downstream governed reasoning may reference the communication, sender observation, normalized recipient observations, sent time, thread and protocol references, and bounded provenance facts. It shall not treat those references as identity resolution, delivery proof, importance classification, commitment proof, source adjudication, or conflict resolution.

## 10. Disclosure Policy

**Decision:**

```text
governed-gmail-conversational-metadata-disclosure.v1
```

This policy authorizes only the minimum canonical metadata selected by the governed evidence pipeline for the current claim construction:

1. **Reference before duplication.** Preserve upstream references instead of copying the complete observation.
2. **Claim relevance.** The governed evidence pipeline selects relevance; the Gmail publisher shall not classify relevance.
3. **Metadata only.** Raw or decoded message bodies, HTML, attachment content, attachment bytes, and arbitrary MIME content are prohibited.
4. **No policy laundering.** Presence in a projection grants no downstream authority beyond the upstream governed evidence.

Bounded use includes the message reference, sender observation, normalized recipients, recipient state, sent time, protocol/thread references, retrieval provenance, and bounded attachment-presence, unread, and MIME-structure metadata. The publisher shall not add raw bodies, decoded text or HTML, attachment content, ungoverned attachment filenames, raw headers, credentials, tokens, Gmail queries, mailbox-wide state, legacy prompt text, or local/mock fallback content. It shall not copy the full normalized observation into a model request.

## 11. Dependency and Fail-Closed Decision

**Dependency Decision:** No mutable external policy registry is required.

The mapper requires only `ProductionGmailRecipientEvidence`, a contained `NormalizedGmailObservation`, deterministic utilities, and these fixed constants:

```text
sourceId = google-gmail
source field = communication_metadata
contentKind = gmail_communication_metadata
compatibilityBoundary = gmail_metadata_non_authoritative_conversation_context.v1
policyReference = governed-gmail-conversational-metadata-disclosure.v1
```

A future publisher shall fail closed unless:

```text
P.sourceId === "google-gmail"
P.availability === "available"
O is a member of P.communications
O.provenance.gmailMessageId is present
O.provenance.retrievedAt is present
O.messageId is present
O.recipientEvidence is present
```

An unavailable source produces no synthetic communication. Connector failure belongs to `GovernedConnectorAvailabilityInput`. An unobserved or `not_fetched` communication shall not be reconstructed from a legacy message, list ID, query membership, local fallback, DAWNWATCH state, or a structurally similar caller object. Local/mock records shall not receive `sourceId = "google-gmail"` and shall not become governed Gmail communication evidence.

## 12. Content, Claims, and Conflicts Boundaries

The metadata publication path remains separate from the explicit, policy-gated `GmailContentRetrievalAdapter` path. The future publisher shall not join content retrieval to this evidence to fill `contentDigest`.

The publisher shall not decide the operator's request, semantic relevance, claim status, evidence support, or conflicts. A governed claim referencing this communication shall use the exact source key:

```text
google-gmail + gmailMessageId + communication_metadata + retrievedAt
```

The claim engine shall not reconstruct Gmail provenance. Existing conflict governance controls contradictions. Gmail receives no precedence; the binding rule remains: **restrict, do not adjudicate**.

## 13. Publication Responsibility Audit

| Question | Binding answer |
| --- | --- |
| Has Gmail acquisition responsibility changed? | No |
| Has recipient normalization responsibility changed? | No |
| Has the canonical Gmail observation acquired conversational responsibility? | No |
| Does the mapping create another canonical Gmail publication? | No |
| Does it reconstruct upstream Gmail evidence? | No |
| Does it reference upstream canonical identity/provenance? | Yes |
| Does it introduce a new disclosure policy? | Yes, narrowly and explicitly |
| Is that policy required by the target conversational contract? | Yes |
| Does the policy authorize message body disclosure? | No |
| Does the mapping acquire claim classification? | No |
| Does it acquire conflict derivation? | No |
| Does it require mutable runtime policy state? | No |
| Does it preserve deterministic replay? | Yes |
| Does it preserve Identity Integrity? | Yes |

**Decision:** Publication Responsibility Audit passes. The new responsibility is limited to downstream conversational metadata admission and does not modify the upstream canonical Gmail publication.

## 14. Future Implementation Boundary and Tests

Sprint 3.97 shall implement an isolated function equivalent to `projectGmailConversationalEvidence` whose only responsibility is validated deterministic conversion of canonical Gmail production evidence into `GovernedCommunicationEvidenceInput[]`.

It shall not depend on `/api/chat`, model invocation, prompt construction, conversation history, DAWNWATCH rendering, legacy `EmailMessage`, local fallback, mutable `OperationalState` interpretation, EOS orchestration, conflict resolution, or LLM output. Production wiring requires a separate integration gate.

Sprint 3.97 tests must prove every exact mapping above, fail-closed behavior for missing identity/retrieval provenance and wrong authority, absence of a digest, rejection of body evidence and unknown policies, subordinate reference integrity, non-aliasing of different provider IDs, and structurally identical deterministic replay.

## 15. No-Implementation Statement

> Sprint 3.96 authorizes no code change, production wiring, or `/api/chat` modification.

This sprint changes documentation only. It introduces no parser, canonical publication, runtime policy registry, source adjudication, or production integration.

## 16. Validation Record

The required repository validation completed after adding this contract:

| Command | Result |
| --- | --- |
| `npm test` | Pass |
| `npm run build` | Pass |
| `npm run lint` | Pass |
| `npm run typecheck` | Pass |
| `git diff --check` | Pass |

Repository-wide searches confirmed:

1. no production publisher owns the exact mapping;
2. neither fixed policy identifier conflicts with an existing identifier;
3. this document introduces no recipient parser;
4. the `google-gmail:message:<gmailMessageId>` reference namespace aliases no existing publication identity;
5. `/api/chat` is unchanged; and
6. only this Sprint 3.96 document changed.

## 17. Files Changed

```text
docs/SPRINT-3.96-GOVERNED-GMAIL-CONVERSATIONAL-EVIDENCE-PUBLICATION-CONTRACT.md
```

## 18. Next Step

> Sprint 3.97 — Governed Gmail Conversational Evidence Publisher Implementation.

## 19. Binding Summary

The architecture remains:

```text
acquire once
normalize once
publish canonically once
reference downstream
disclose minimally
reason only under governed boundaries
```

No acquisition is repeated. No recipient is re-parsed. No legacy evidence is reconstructed. No second Gmail publication is created. No body is disclosed. No source is adjudicated.

**Governed Contract Complete**
