# Sprint 3.84 — Conversational Lineage and Projection Evaluation

**Status:** Evaluation complete; integration blocked by semantic identity incompatibility.

## Scope and method

This isolated evaluation connects, but does not modify, the Sprint 3.83 lineage/projection track and the Sprint 3.77/3.79 evidence/model track. It uses synthetic evidence, deterministic clocks and identifiers, the real constructors/composer/repository/model request/parser/envelope/validator functions, and a deterministic model adapter. No production route, retrieval, persistence, model, selector, operator verification, or promotion is involved.

## Governing artefacts reviewed

The Engineering Constitution, North Star, JESS, Roadmap, Constitutional Publication Principles, Sprints 3.76, 3.77, 3.78, 3.79, 3.82, and 3.83, and all current `lib/governed-conversation` source and tests were read completely. Repository precondition: branch `work`, start `b7e7d02cbbf9d0f2fc6dc54f158e810506b09aeb`, clean tree, and all required artefacts present.

## Central composition result

**Semantic incompatibility.** `GovernedConversationalProjection` supplies `threadId`, `requestId`, `exchangeId`, and `projectionId`. `constructGovernedConversationalInput` instead requires `runId`, `sessionId`, `interfaceContractId`, and `projectionId`. Sprint 3.82 does not authorise relabelling conversational IDs as EOS-style IDs, and no projection value supplies an interface contract identity. Therefore the complete chain truthfully stops at the handoff; the evaluator deliberately does not manufacture a governed input identity or claim response release.

## Field compatibility matrix

| Existing field/publication | Proposed conversational meaning | Directly authorised | Adapter-only | Semantic conflict | Finding |
|---|---|---:|---:|---:|---|
| `projectionId` | `projectionId` | yes | no | no | Compatible |
| `runId` | `exchangeId` | no | no | yes | Semantic Defect |
| `sessionId` | `threadId` | no | no | yes | Semantic Defect |
| `interfaceContractId` | none | no | no | yes | Semantic Defect |
| model `requestId` | conversational `requestId` | yes | yes | no | Adapter Gap |
| `GovernedExecutionRecordPayload` / `ConversationalExecutionRecord` | same terminal event under incompatible identities | no | no | yes | Semantic Defect |

The two terminal record types are not silently reconciled: one owns run/session/interface-contract lineage; the other owns thread/request/exchange lineage. A future governance/correction sprint must designate or redesign the publication boundary before integration.

## Cassie and projection sufficiency

The synthetic “What’s Cassie’s email? Anything important?” projection contains source-qualified sender-address evidence, person-match reference, connector state, provenance/retrieval reference, classified non-canonical history, calendar and memory references, and authority-free compatibility heuristics. `cassie-address` is `available`; `cassie-importance` is `unsupported`. It is sufficient for contact lookup, source identity, person match, sender evidence, unsupported significance determination, connector availability, history classification, references, model-request content, and response validation without raw Gmail payload, `gmailThreads`, message body, transcript, `OperationalState`, or context builder.

The unchanged evidence/model track separately accepts equivalent synthetic input and preserves both statuses through request, parsing, envelope construction, validation, and execution payload. This is not represented as end-to-end conversational completion because populating the three incompatible identity fields would conceal the blocker.

## Identity, lifecycle, and stress findings

The existing repository tests plus Sprint 3.84 diagnostics establish idempotency lookup, one-request/one-exchange uniqueness, ordered same-exchange attempts, retry parentage, one accepted envelope, one terminal record, rejection after terminal completion, projection mismatch detection, and fail-closed release ordering. Material changes (question event, evidence, availability, claims/materiality, reference time, compatibility context, policies/provider configuration, resubmission, and replay discriminator) feed identity construction and require new identities rather than content collapse.

Stress review outcomes:

| Scenario | Truthful result |
|---|---|
| unavailable source, complete projection | representable safe path |
| incomplete projection | projection failure; no model call/release |
| provider failure then success | stable exchange and next attempt supported |
| repeated provider failure | attempts can be retained; explicit terminal orchestration is not supplied by the current happy-path orchestrator |
| malformed/invented output | real pipeline produces safe envelope |
| envelope commit then terminal failure | no release; recoverable persistence gap |
| terminal commit then callback failure | terminal completion survives, but delivery disposition is unrepresentable |
| duplicate completion | rejected; original authoritative |
| retry after completion | rejected under exchange; new request/exchange required |

## Persistence-port evaluation

| Guarantee | Relational primitive | Classification |
|---|---|---|
| one request/one exchange | unique foreign key | Directly Mappable |
| idempotency reuse | unique index + transaction | Directly Mappable |
| attempt ordinal | composite unique constraint | Directly Mappable |
| one envelope | constrained publication | Directly Mappable |
| one terminal record | unique exchange constraint | Directly Mappable |
| lifecycle transition | versioned compare-and-set | Mappable with Transactional Adapter |
| pre-invocation commits | durable acknowledgement | Mappable with Transactional Adapter |
| pre-release terminal commit | durable acknowledgement | Mappable with Transactional Adapter |
| immutable history | append-only rows | Mappable with Transactional Adapter |
| recovery | journal/outbox + indeterminate result | Requires Additional Repository Method |

Creation and projection are truthful staged commits; attempt start can precede the external side effect; envelope and terminal commits enforce release ordering. The port has no multi-operation transaction method, outbox/lease, provider idempotency/recovery token, persisted uncertain-result concept, or `CommitResult` outcome for “unknown.” Crash-safe duplicate invocation prevention and safe continuation therefore remain persistence boundaries. These do not justify production persistence in this sprint.

## Runtime findings and mutation evidence

Runtime diagnostic counts: Compatible 1; Adapter Gap 1; Semantic Defect 4; Lifecycle Defect 0; Lineage Defect 0 baseline; Projection Defect 0; Evidence Defect 0; Validation Defect 0; Persistence Boundary 1; Evaluation Boundary 1. Blocking findings are the three identity-field conflicts and dual terminal-publication responsibility. They violate Sprint 3.82’s distinct conversational identity and this sprint’s no-mislabel rule; they were recorded, not fixed, for a future governance/correction sprint.

Baseline projection/exchange lineage passes. Mutating `projection.exchangeId` across the boundary produces blocking `PROJECTION_EXCHANGE_MISMATCH` / Lineage Defect, proving the outcome is data-sensitive rather than fixture-labelled.

## Isolation and blob proof

The isolation test recursively reads files with `node:fs`/`node:path`; it uses no shell or child-process API. Forward and reverse prohibited-import scans pass. Pre-sprint blobs: route `c10eb65234c37c8696cb7d2d285ef90e6efcf3e3`, context builder `8d22c39fc473e9267f1157f0c55fa2a6c85d578d`, client hook `ceec0b3690d33bfc456563f1c75083a2e61af80c`; protected EOS aggregate `a4c0543dbfe58dda8dc1580f84154e7e20f982c28db62f33268fb77aaa9acf22`. Post-sprint values must match and are checked before completion. Core Sprint 3.77/3.79/3.83 files are unmodified.

## Files and validation

Created this report/specification, `lineage-projection-evaluation.ts` (typed diagnostic and durability matrix), `lineage-projection-evaluation-fixtures.ts` (Cassie fixture), `lineage-projection-evaluation.test.ts` (composition/sensitivity checks), and `lineage-projection-evaluation-isolation.test.ts` (pure-Node isolation).

Targeted tests cover the handoff, Cassie statuses and minimisation, unchanged model validation, projection integrity, mutation sensitivity, idempotency, uniqueness, persistence classification, and isolation. Full commands and exact outcomes are recorded in the completion message.

## Change confirmation and outstanding issues

Changes are evaluation-only. There is no route, context builder, client hook, EOS, core governed semantics, production persistence, selector, integration, live call, operator verification, or promotion change. Outstanding work: govern conversational meanings for input identity; resolve the competing execution-record publications; add durable indeterminate-commit and external-side-effect recovery semantics; decide delivery disposition; then re-attempt integration only in a separately authorised sprint.

## Recommendation

**Evaluation Complete**
