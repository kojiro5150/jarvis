# Sprint 3.111 — Governed Conversational Production Integration Readiness Review

Status: Complete  
Sprint Type: Governance Review / Production Integration Readiness Assessment  
Recommendation: Review Complete — Not Ready

## 1. Repository precondition result

The Section 6 repository precondition was completed before this review began. This was a real Git working tree with `.git` metadata and repository history, not an archive or generated snapshot.

| Item | Recorded starting state |
| --- | --- |
| Repository URL | No remote URL is configured in this review environment; `git remote -v` returned no entries. The repository identity available from Git metadata is the `/workspace/jarvis` working tree. |
| Branch | `work` |
| Commit | `f8ee351a497ce6ef670073476e878c895a435ed3` (`Merge pull request #195 from kojiro5150/docs/sprint-3.111-spec`) |
| Clean state | Clean: `git status --short` returned no entries before analysis. |
| Git metadata | Present at `.git`; `git rev-parse --git-dir` returned `.git`. |
| Required documents | All 32 Section 6 paths were present and read completely before source review. This includes both `docs/SPRINT-3.80-GOVERNED-CONVERSATIONAL-RUNTIME-INTEGRATION.md` and `docs/reports/SPRINT-3.80-INTEGRATION-INCOMPLETE.md`. |
| Required source and tests | Every Section 7 source path and Section 8 minimum test path was present. Production connector construction/status functions were also inspected. |
| Validation environment | Node.js v24.15.0, npm/Vitest/Next/TypeScript dependencies installed locally; no network service or live provider invocation was needed. |
| Real clone | Yes: complete Git metadata and history were used. Absence of a configured remote is recorded rather than replaced with an invented URL. |
| Route hash | Git blob hash `c10eb65234c37c8696cb7d2d285ef90e6efcf3e3`; direct source inspection, not the hash alone, established route ground truth. |
| Governed core hashes | SHA-256 inventory was recorded before analysis for every non-test `lib/governed-conversation/*.ts` file. Representative boundary hashes: source assembly `01eacdbabdded56745820d0e09ca1ed1ed332ae4061ee09f4cbef2fa765fa8b7`; Claim Boundary engine `9ab35f47190e803468003a9accd34e0cc613e9438c8077a882d0b108d22f827a`; enrichment engine `5c60fff548a152533fa1634daa1096ca6144eb2c72c70998c544b25010129454`; conflict engine `ea0835339911d9a3d40af38333e0f0c39295477d70e1ebc63145375c47ff6064`; projection composer `a3e2df360828c3756c19283d14b03b33134236e52cee2e37718d1990473ae47`; input `15cc1689ee9234259b1ef52a1e8c6c38f1dd37aa808e3edc86cdd5e82342102f`; model invocation `beebd3cfb14c220c2249879661e225d3b2330cb766515c6bcac533aff5e8`. |
| Starting test status | Targeted governed-conversation suite: 51 files and 221 tests passed. Full suite later reconfirmed 163 files passed, 776 passed and 1 skipped. |
| Roadmap wording | Phase III is “Conversational Runtime Migration — Identity Architecture Proven, Production Integration Blocked on a Named Evidence Gap”; it says `/api/chat` remains legacy. Its older immediate-next-step prose predates Sprints 3.96–3.110 and is evidence, not a substitute for this review. |
| Existing production integration/selector | No conversational production integration file and no `CONVERSATIONAL_RUNTIME_MODE` selector exist. Dashboard/DAWNWATCH selectors are separate and irrelevant. |
| Current lineage repository | The port and `InMemoryConversationalLineageRepository` exist; no durable or authorised production implementation exists or is imported by `/api/chat`. |

The exact seven-stage exported signatures recorded at the start were:

```text
assembleGovernedSourceEvidence(input: GovernedSourceEvidenceAssemblyInput): Promise<GovernedSourceEvidenceAssemblyResult>
evaluateClaimBoundary(input: BoundaryEngineInput): BoundaryEngineResult
enrichGovernedClaims(input: ClaimEnrichmentEngineInput): ClaimEnrichmentEngineResult
evaluateGovernedConversationalConflicts(input: ConflictEngineInput): ConflictEngineResult
composeGovernedConversationalProjection(input: GovernedConversationalProjectionInput): GovernedConversationalProjection
constructGovernedConversationalInput(value: GovernedInputConstruction): GovernedConversationalInput
invokeGovernedConversationModel(input: GovernedConversationalInput, adapter: GovernedConversationModelAdapter, ids: GovernedModelInvocationIdentifiers): Promise<GovernedModelInvocationResult>
```

No file was changed after this record except this review document.

## 2. Governing artefacts reviewed

The following required artefacts were read completely:

- `docs/ENGINEERING_CONSTITUTION.md`; `docs/architecture/NORTH_STAR.md`; `docs/architecture/JARVIS-Engineering-Specification-Standard.md`; `docs/CONSTITUTIONAL-PUBLICATION-PRINCIPLES.md`; `docs/architecture/ROADMAP.md`.
- Sprints 3.80 (specification and incomplete report), 3.87, 3.82, 3.85, and 3.86.
- Sprints 3.89, 3.90, 3.94, and 3.95.
- Sprints 3.96, 3.97, 3.98, 3.99, 3.100, and 3.101.
- Sprints 3.103, 3.104, 3.106, 3.107, 3.108, 3.109, and 3.110.
- Evaluation reports for Sprints 3.84, 3.93, 3.102, and 3.105.
- This Sprint 3.111 specification in full before it was replaced by this completion record.

The current implementation and real tests, rather than the completion prose or sprint count, determine every conclusion below.

## 3. Prior blocker resolution table

| Prior blocker | Origin sprint | Binding correction | Current code evidence | Resolution |
| --- | --- | --- | --- | --- |
| False EOS identity requirement | 3.80/3.84 | 3.85/3.86 | `input.ts` requires thread/request/exchange/projection lineage; EOS references are optional and verified. Identity composition tests cover an ordinary EOS-free exchange. | Resolved |
| Competing execution records | 3.84 | 3.85/3.86 | Repository search finds the live `ConversationalExecutionRecord` only; neither `GovernedExecutionRecordPayload` nor `constructExecutionRecordPayload` is live. Model invocation returns the canonical record. | Resolved |
| Missing source-evidence publishers | 3.87/3.88 | 3.96–3.101 | Four independent publisher modules and four acquisition adapters feed `assembleGovernedSourceEvidence`; publisher, adapter, and assembly tests call the real exports. | Resolved |
| No deterministic claims | 3.75/3.88 | 3.89/3.91 | `evaluateClaimBoundary` applies explicit typed intent, then the closed ruleset, then clarification/unsupported outcomes without a model. | Resolved |
| No governed conflicts | 3.88 | 3.90/3.92 | Conflict ruleset, publications, engine, typed outcomes, and tests exist. | Resolved |
| Whole-set rejection | 3.93 | 3.94/3.95 | The engine evaluates eligible claim/class cells while retaining ineligible claims; searches for `claims.length !== 1` and `claims[0].claimType !== "contact_address_lookup"` found no live rejection. | Resolved |
| Claim-set field mismatch | 3.105 | 3.106/3.107 | Base/enriched discriminants and publication references are consumed directly by the conflict engine. | Resolved |
| Lost enrichment lineage | 3.105 | 3.106/3.107 | Projection composer conditionally validates and retains the base set, enrichment evaluation/ruleset, enriched set, and base-claim references. | Resolved |
| Mutation integrity | 3.105/3.107 | 3.108/3.109 | SHA-256 policy `governed-enriched-claim-integrity.v1` is recomputed before conflict evaluation; both required mutations fail with `published_claim_digest_mismatch`. | Resolved |

## 4. Current code verification

### 4.1 Identity separation — Resolved

`GovernedInputConstruction` makes `threadId`, `requestId`, `exchangeId`, `projectionId`, and matching `projectionLineage` mandatory. `runId`, `sessionId`, and `interfaceContractId` are optional contextual EOS references. `constructGovernedConversationalInput` rejects aliases (`threadId` as `sessionId`, `exchangeId` as `runId`, or conversational IDs as `interfaceContractId`), requires an `EosReferenceVerifier` whenever an EOS reference is supplied, fails closed when verification fails, and accepts all three absent. `input.test.ts` and `identity-correction-composition.test.ts` exercise the real constructor and EOS-free model/record path.

### 4.2 Execution-record authority — Resolved

Repository-wide source search establishes one terminal authority: `ConversationalExecutionRecord`. `invokeGovernedConversationModel` constructs the validated response envelope and canonical execution record; the lineage repository commits that record as the terminal object. No live competing payload constructor or equal-authority compatibility object exists. EOS references remain contextual.

### 4.3 Four publishers — Resolved in the isolated architecture

| Publisher | Direct implementation finding | Real test evidence |
| --- | --- | --- |
| `publishGmailEvidence` | Maps canonical `ProductionGmailRecipientEvidence` deterministically under fixed compatibility/disclosure policies; preserves recipient/provenance references and does not invent a digest. | `gmail-evidence-publisher.test.ts`; `gmail-evidence-acquisition-adapter.test.ts` |
| `publishCalendarEvidence` | Maps real `CalendarEvent` values with bounded coverage, explicit timezone and policy reference; it makes no private-data inference. | `calendar-evidence-publisher.test.ts`; `calendar-evidence-acquisition-adapter.test.ts` |
| `publishMemoryPriorityEvidence` | Publishes unattested legacy priorities as zero; only explicitly attested publications pass; `urgent` is not attestation; ownership/freshness are explicit. | `memory-priority-evidence-publisher.test.ts`; `memory-priority-acquisition-adapter.test.ts` |
| `publishConnectorAvailability` | Emits exactly Calendar, Gmail, and Drive; rejects local-as-connected; preserves honest fallback state and explicit observation time. | `connector-availability-publisher.test.ts`; `connector-availability-acquisition-adapter.test.ts` |

Each publisher is independent, has its own contract constants and test, has no route import or cross-source dependency, and does not modify the composer.

### 4.4 Source assembly — Resolved in isolation

`assembleGovernedSourceEvidence` invokes all four real acquisition adapters concurrently with `Promise.allSettled`, freezes each evidence collection and its source-status record, and returns `communicationEvidence`, `calendarEvidence`, `memoryPriorityReferences`, `connectorAvailability`, and independently distinguishable `sourceResults`. A source failure becomes that source's empty, failed result and does not erase other sources. It does not consume `OperationalState`. `source-evidence-assembly.test.ts` verifies real adapter calls, failure isolation, honest empty output, and immutability.

Four-source assembly: **Resolved**.

### 4.5 Claim Boundary — Resolved

`evaluateClaimBoundary` is evidence-blind and model-free. It prioritises explicit typed intent, applies the closed deterministic recognition rules second, emits deterministic clarification when parameters are missing, and otherwise returns unsupported. It admits only the governed communication claim vocabulary, decomposes the Cassie compound question, and never uses unread/important/needsReply/labels/ranking as evidence. Its publications preserve ruleset, evaluation, claim-set, claim, and conversational lineage identities. Real engine/ruleset/publication tests prove behaviour rather than merely restating fixture names.

Claim Boundary: **Resolved**.

### 4.6 Evidence-to-claim enrichment — Resolved in isolation

`enrichGovernedClaims` receives the already-published base Claim Set and assembly separately. Its closed materiality matrix admits communication and connector-availability evidence only for `contact_address_lookup`; importance remains unsupported. Enrichment creates new claim IDs with `baseClaimId`, creates a distinct enriched Claim Set, freezes results, preserves the base set, and carries governed factual values/source references. `claim-enrichment-engine.test.ts`, publications/ruleset tests, and composition tests cover the real engine.

Evidence-to-claim enrichment: **Resolved**.

### 4.7 Per-cell conflicts — Resolved

The engine consumes a complete discriminated Claim Set, verifies integrity before evaluation, and evaluates each eligible claim/conflict-class cell. Compound sets are not rejected: contact-address lookup is evaluated while message importance is retained as outside the conflict ruleset. The complete Claim Set publication identity remains referenced and ineligible claims are not silently removed. The former whole-set rejection expressions are absent from live logic.

Per-cell claim-set composition: **Resolved**.

### 4.8 Discriminated Claim Sets — Resolved

`claimSetKind: "base" | "enriched"` is a real type and runtime discriminant. Each kind retains its true publication ID/type; `evaluatedClaimSetReference` records kind, publication type, and canonical ID. Both variants are accepted. Base observations require no enriched digest; enriched observations require the matching digest. No evaluation-only alias is live.

Claim-set identity discrimination: **Resolved**.

### 4.9 Projection lineage — Resolved

The projection composer validates rather than blindly copying:

- base ruleset/evaluation/Claim Set and `baseGovernedClaimSetId`;
- complete enrichment ruleset/evaluation/enriched-set/base-claim references when enriched, while prohibiting those publications at the base stage;
- conflict ruleset/evaluation/outcome/set and the evaluated Claim Set's correct publication;
- thread/request/exchange/projection lineage;
- canonical conflicts, known source references, and matching conflict-set presence/outcome.

Conversation history is forced non-canonical and synthetic EOS references remain prohibited. `projection-composer.test.ts` and the three full-composition suites exercise the real composer.

Projection lineage: **Resolved**.

### 4.10 Effective status — Resolved

The composer computes effective status once. Conflict restrictions can reduce `available` to `insufficient_coverage` but cannot adjudicate; unsupported and unavailable remain terminal; incompatible restrictions throw rather than guess. There is no live `selectedSourceOwnerId` and no source owner is selected.

Restrict-don't-adjudicate: **Resolved**.

### 4.11 Enrichment integrity — Resolved

`claim-integrity.ts` fixes policy `governed-enriched-claim-integrity.v1` and SHA-256 canonicalisation. Enriched claims carry policy/digest; observations carry `evaluatedClaimIntegrityDigest`. The conflict engine recomputes and compares published claims, observations, and mixed digests before per-cell evaluation. Mismatches throw `EnrichedClaimIntegrityError`, are not translated to `evaluation_failed`, and publish neither evaluation nor Conflict Set. The real mutation proof returned `published_claim_digest_mismatch` for status and factual-value changes before evaluation.

Enrichment integrity coupling: **Resolved**.

### 4.12 Model authority — Resolved in isolation

The model request exposes governed facts, statuses, conflicts, uncertainty, and ownership boundaries. The fixed instruction limits the provider to model-owned interpretation/advisory next steps and forbids deterministic-status or source-authority changes. The validator rejects authority violations and invocation records the validation outcome. `model-invocation.test.ts`, `model-request.test.ts`, `model-output.test.ts`, `validator.test.ts`, and execution-record tests call the real implementation.

### 4.13 Seven-stage isolated composition — Resolved

The Sprint 3.110 harness calls all seven real stages in order. No stage is stubbed and no intermediate publication is hand-built between stages. Acquisition inputs and conflict observations are deliberately fixture/harness dependencies, the model adapter is deterministic and injected, the validator is unchanged, an execution record is produced without EOS identity, and Cassie reaches the expected governed result. This establishes internal coherence only; it does not establish production reachability.

## 5. Full-assembly result

Direct execution without modification produced:

- `runIntegrityCouplingRegressionMatrix()`: all ten scenario IDs existed and all ten completed with expected outcomes and integrity checks. Outcomes included `partially_evaluated`, `evaluated_no_conflict`, all three genuine non-success results, and `evaluated_conflict_found`.
- `runIntegrityReplayDeterminismCheck()`: three runs; claim digests and observation digests were byte-identical, and governed identities/outcome were preserved.
- `runIntegrityNonSuccessOutcomeChecks()`: `evaluation_unavailable` / `required_source_unavailable`, `evaluation_unsupported` / `conflict_class_unsupported`, and `evaluation_failed` / `evaluator_failure`; integrity verification passed and `falsePositiveDetected` was `false` for all three.
- `runEnrichedClaimMutationProof()`: baseline `evaluated_no_conflict`; status and factual-value mutations were both rejected with `published_claim_digest_mismatch`; neither published a Conflict Evaluation or Conflict Set; neither was silently accepted or converted to `evaluation_failed`.

The ten scenarios were: `cassie-compound-contact-conflict`, `single-contact-no-conflict`, `legacy-memory-unattested`, `connector-disconnected-local-fallback`, `gmail-conflict-plus-unsupported-claim`, `conflict-evaluation-unavailable`, `conflict-evaluation-unsupported`, `conflict-evaluation-failed`, `partial-source-failure`, and `deterministic-replay`.

## 6. Current production route ground truth

`app/api/chat/route.ts` was read completely. It remains entirely legacy.

- Request body: optional `agentId`, optional `messages`, optional `capability`; ordinary messages must be non-empty `{ role: "user" | "assistant", content }`, each under 8,000 characters, with at most 40 turns. There is no thread ID or governed mode.
- Capability branch: parses and routes a capability request using `GoogleGmailContentConnector` and content-retrieval policy; responds `{ capability }`. It is independent of governed conversation.
- Ordinary branch: resolves an agent, calls `buildOperationalState()`, converts that legacy state to a text context block, assembles the agent prompt, and calls `executeAuditedChat` with `callClaude` and the legacy audit store.
- Response: `{ reply, agentId }`; errors are JSON 400 or legacy 502 messages. No discriminant, conversational IDs, or governed envelope are returned.
- Connector access: indirect through `buildOperationalState`; source acquisition and fallback happen before the route receives one merged legacy object. No governed assembly input is constructed.
- Provider injection: `callClaude` is injected only into the legacy audited execution boundary; it is not a `GovernedConversationModelAdapter`.
- Audit: the legacy execution audit store records legacy audited chat; it is not the conversational lineage repository.
- Selector: none. There is no `CONVERSATIONAL_RUNTIME_MODE`, GOVERNED branch, history mapper, lineage owner, governed persistence owner, or response-envelope renderer.

## 7. Production route readiness table

| Production boundary | Current owner | Real route can supply it | New semantic mapping required | Readiness |
| --- | --- | --- | --- | --- |
| Gmail acquisition | `GoogleGmailConnector.acquireRecent` already satisfies `GmailProductionAcquisitionPort`; adapter/publisher are real. | Mechanically yes, but the route currently receives only merged `OperationalState`. | No new Gmail evidence semantics; dependency wiring is mechanical. | Mechanical adapter required and already governed |
| Calendar acquisition | Current Calendar connectors expose `source` and `listUpcoming`, matching the port. | Connector can be constructed, but route does not own governed `requestedLimit`/`horizonDays`. | Production coverage parameters need an explicit governed owner/value; integration must not invent them. | New semantic decision required |
| Memory acquisition | `readMemory` matches `read()` and the adapter truthfully emits zero for unattested legacy priorities. | Mechanically yes. | No route attestation is permitted or needed; absence stays honest. | Mechanical adapter required and already governed |
| Connector status | `getConnectorStatuses` plus live load results exists in legacy `buildOperationalState`; governed adapter requires exactly three `ConnectorLiveResult`s at the live-fetch boundary. | Not from the route's current post-assembly object without reconstructing timing/ownership. | A thin upstream acquisition owner must carry live result and fallback truth; configuration alone is insufficient. | Mechanical adapter required and already governed |
| Conversation history | Current `ChatMessage[]`; `input.ts` forces every mapped turn non-canonical. | Content/role mapping is available; stable turn IDs and thread continuity are not present. | Role classification is governed; deterministic ID/continuity ownership is missing with lineage. | New governance required |
| Thread/request/exchange lineage | Constructors and lifecycle/orchestrator exist only in isolated code. | No: request body/client has no thread identity and route constructs none. | Thread continuity, retry/lifecycle ownership, and production identifier issuance must be authorised. | New governance required |
| Claim parameters/entity identity | Claim Boundary accepts a supplied entity catalogue and produces extracted parameters; harness supplies `person:cassie`. | No production entity catalogue/resolver exists. | Yes: mapping free-text “Cassie” to a truthful stable entity ID is not governed by fixture success or clarification alone. | New semantic decision required |
| Enrichment resolver | `GovernedEvidenceResolver` interface; only `resolverForAddress()` in fixture code. | No. | A production evidence-to-entity/address resolution owner is absent. Its evidence mechanics are bounded by 3.103, but entity identity depends on the preceding unresolved decision. | Unavailable |
| Conflict observations | Typed engine input; constructors occur in fixtures/full-assembly harnesses. | No. | A production publisher/owner must bind governed source publications to the real enriched claim ID and digest. Publication ownership is not supplied by the route. | Unavailable |
| Projection composition | Real, validated isolated composer. | Only after missing upstream publications exist. | No new composer semantics. | Mechanical integration after blockers |
| Governed input | Real constructor and validator. | Only after projection/history/lineage exist. | No new input semantics. | Mechanical integration after blockers |
| Model adapter | `callClaude(messages, systemPrompt)` versus `invoke(GovernedModelRequest)`. | A thin injected wrapper is feasible. | Request translation/raw return is mechanical; validation remains downstream. | Mechanical adapter required and already governed |
| Lineage persistence | Repository port plus in-memory reference adapter. | No route import/owner; no durable production adapter. | Storage technology, durability, uniqueness, process-boundary retry, and authorisation remain undecided. | New governance required |
| Governed HTTP response | Required shape is specified; current route/client require `{ reply, agentId }`. | No current branch/rendering/thread preservation. | Basic discrimination is mechanical, but exposing envelope/lineage and continuity depend on unresolved lineage governance. | New governance required |

## 8. Nine production ground-truth conditions

The final boundary question was checked independently, not inferred from Sprint 3.110:

1. **Real source acquisition — Not fully present.** Gmail and Memory have reachable real inputs; Calendar lacks production-owned governed coverage values; connector live-result ownership is not exposed at the assembly boundary.
2. **Truthful conversation lineage — Absent in production.** The route/request/client do not own thread, request, exchange, attempt, envelope, or terminal identities.
3. **Governed history — Not production-ready.** Role-to-classification is mechanical and all turns can be non-canonical, but stable turn IDs and thread continuity depend on missing lineage ownership.
4. **Deterministic claim parameters — Absent in production.** Recognition is deterministic, but the entity catalogue and the mapping of “Cassie” to `person:cassie` are fixture inputs.
5. **Production enrichment resolution — Absent.** Only the resolver interface and fixtures exist.
6. **Governed conflict observations — Absent.** Observation construction occurs in fixture/evaluation code, not a production publisher.
7. **Authorised lineage persistence — Absent.** Only an in-memory reference adapter exists and it is not authorised or wired for production durability.
8. **Thin provider adapter — Mechanically feasible but absent.** `callClaude` can be wrapped without moving validation/model authority, but no wrapper is live.
9. **Discriminated governed response — Absent.** The client and route speak only legacy `{ reply, agentId }`; lineage and safe-envelope disclosure are not implemented.

## 9. Production gates

### 9.1 Production Source Assembly Gate

**Failed**

- Gmail: real `GoogleGmailConnector.acquireRecent` is a direct port match and publication is governed.
- Calendar: connector shape matches, but `requestedLimit` and `horizonDays` have no governed production owner/value at `/api/chat`; choosing them in integration would establish coverage semantics.
- Memory: `readMemory` is mechanically reachable; unattested legacy priority output correctly remains empty.
- Connector availability: the governed adapter's exact three-result shape is constructible only where live fetch result and fallback truth are simultaneously owned. The legacy route sees a merged post-fetch state and cannot guess connectedness from configuration.

The failure is narrow: production acquisition exists for much of the data, but the exact assembly input is not fully owned at the route boundary under existing production governance.

### 9.2 Production Claim Parameter Gate

**Failed**

Deterministic recognition of `contact_address_lookup` is implemented. It is distinct from entity identification: the engine recognises text against an externally supplied entity catalogue, while full-assembly code supplies Cassie and `person:cassie` as fixture data. Production has no deterministic person-identity catalogue/resolver and no governed rule for creating or confirming `GovernedClaimParameters.entityId`. Evidence resolution is a later, separately missing step. Clarification can fail closed but cannot manufacture a stable identity; automatic directory search/arbitrary person resolution remains deferred.

The exact narrowest missing capability is a governed production conversational entity-identification and claim-parameter owner for the currently admitted `contact_address_lookup` claim.

### 9.3 Production Enrichment Resolver Gate

**Failed**

No production implementation of `GovernedEvidenceResolver` exists outside fixtures. `resolverForAddress()` consumes synthetic/harness data. Sprint 3.103 closes evidence admission, provenance, freshness, factual-value, and non-inference semantics, so much of a resolver is mechanical; however, a real resolver cannot truthfully target an entity until the Production Claim Parameter Gate supplies a governed stable entity identity.

### 9.4 Production Conflict Observation Gate

**Failed**

No production owner produces `GovernedSourceObservation[]`. Full-assembly/evaluation fixtures hand-construct source publication/owner/type, entity, enriched claim ID, integrity digest, comparison values/scope, timestamps, provenance, availability, coverage, supersession, content kind, and schema version. The engine correctly consumes those observations but does not own their production publication. A narrow future contract/implementation must assign this upstream publication owner without deriving conclusions or selecting authority.

### 9.5 Production Lineage Persistence Gate

**Failed**

- Repository type: `ConversationalLineageRepository` port.
- Production adapter: none; only `InMemoryConversationalLineageRepository` reference implementation.
- Durability: none; the in-memory adapter cannot survive process boundaries and is not authorised for production.
- Commit ordering: the isolated orchestrator enforces creation/projection before model invocation and envelope/terminal commit before release, but `/api/chat` does not invoke it.
- Response-release ordering: absent in production; the current route returns after legacy audit execution.

The missing work is a storage-technology governance decision followed by a production persistence adapter, uniqueness/idempotency enforcement, and route lifecycle wiring. Object construction and the legacy audit record do not satisfy persistence.

## 10. Additional boundary classifications

- Governed conversation-history mapping: **New governance required** for stable turn/thread identity; classification and non-canonical status are already governed.
- Production model adapter: **Mechanical adapter required and already governed**. `callClaude` accepts legacy messages/system prompt and returns provider text; a thin adapter can translate `GovernedModelRequest`, return raw output, remain injectable/mockable, and leave all validation to `invokeGovernedConversationModel`.
- Governed HTTP response: **New governance required** as a complete production boundary. A discriminated branch is mechanically specified, but thread continuity and the exact safe exposure of envelope/lineage cannot be completed ahead of lineage ownership/persistence. LEGACY bytes must remain unchanged.

## 11. Cross-contract consistency result

| Cross-contract seam | Governing decisions | Current code evidence | Status | Finding |
| --- | --- | --- | --- | --- |
| Conversational identity ↔ governed input | 3.82, 3.85, 3.86 | Mandatory matching lineage; optional verified EOS context in `input.ts`. | Consistent | Ordinary exchange runs without EOS identities. |
| Source assembly ↔ enrichment | 3.96–3.104 | Assembly result is the enrichment engine's typed input. | Consistent | Isolated types/publications compose; production resolver is absent. |
| Enriched claims ↔ conflict engine | 3.106–3.109 | Enriched discriminator, real publication reference, IDs, and digests. | Consistent | Integrity verified before per-cell evaluation. |
| Conflict output ↔ projection | 3.94–3.107 | Composer validates evaluation reference/outcome/set/summaries. | Consistent | Restriction is applied exactly once. |
| Projection ↔ governed input | 3.82, 3.85 | Matching lineage and governed projection claims/statuses. | Consistent | No identity alias or synthetic EOS dependency. |
| Governed input ↔ model request | 3.76, 3.79 | `constructGovernedModelRequest` preserves governed boundaries. | Consistent | Model receives facts/status/uncertainty without new authority. |
| Model output ↔ validator | 3.76, 3.79 | Closed output parser and unchanged validator. | Consistent | Authority violations fail closed. |
| Validator ↔ execution record | 3.82, 3.85, 3.86 | Invocation creates one envelope/record chain with validation result. | Consistent | One terminal authority. |
| Lineage repository ↔ response release | 3.82, 3.83 | Orchestrator requires successful terminal commit before release; only in-memory repository exists. | Not yet production-connected | Semantics compose in isolation, but no authorised durable production adapter exists. |
| Production route ↔ seven-stage chain | 3.80, 3.87, current review | Route imports none of the governed stages and exposes only legacy request/response. | Not yet production-connected | Entity parameters, resolver, observations, lineage/persistence, and response boundary are missing. |

The review **did not identify a governance decision that remained individually valid but mutually inconsistent with another binding decision inside the isolated architecture**. It did identify multiple explicit, narrow production owners that do not exist. “Not yet production-connected” is not an internal contradiction and must not be misreported as one.

Identity/evidence, claim/conflict, evidence/integrity, outcome, model-authority, and immutable-publication consistency all remain intact: source identities are retained; enriched claims have new identities; evaluated publications/digests match; unsupported is not converted to unavailable; integrity mismatch is not evaluation failure; model prose cannot overwrite deterministic status; retries use attempt identity; response objects are not persistence.

## 12. Readiness decision

The isolated governed conversational architecture is internally coherent, but production integration ground truth remains incomplete at the following specific boundary.

The first and narrowest unresolved semantic owner in the execution chain is the **production conversational entity-identification and claim-parameter owner** for `contact_address_lookup`: current Claim Boundary calls require an entity catalogue, current enrichment requires `GovernedClaimParameters.entityId`, and only fixture code maps “Cassie” to `person:cassie`. Files inspected include `claim-boundary-engine.ts`, `claim-boundary-types.ts`, `claim-enrichment-types.ts`, `claim-enrichment-engine.ts`, `claim-enrichment-fixtures.ts`, both full-assembly harnesses, the real Gmail production-evidence projection, and `/api/chat`. Existing contracts govern recognition, clarification, evidence admission, and enrichment after an entity ID is supplied; they do not authorise production to create, infer, search for, or confirm a stable person identity from arbitrary free text.

Later independent blockers also remain and must not be hidden: no production enrichment resolver, no production conflict-observation owner, and no authorised durable lineage repository/commit path. These are separate missing owners, not evidence that the entire architecture is incoherent.

### Narrowest recommended next sprint

> **Sprint 3.112 — Governed Conversational Entity Identification and Claim Parameter Contract**

That sprint should govern only the source, identity semantics, deterministic match/ambiguity/clarification behaviour, and publication/ownership of `GovernedClaimParameters.entityId` for the already admitted `contact_address_lookup` claim. It must not implement arbitrary person resolution, automatic directory search, a new claim type, enrichment, conflict observations, persistence, route integration, or selector promotion.

After that boundary is closed, evidence-led follow-on work may address the production resolver, conflict-observation publisher, and lineage persistence in their own narrow order. A broad “finish integration” sprint is not authorised.

## 13. Future integration constraints and stop conditions

No integration sprint is authorised by this Not Ready result. When all named prerequisites are independently closed, a future controlled attempt remains limited to an independent `CONVERSATIONAL_RUNTIME_MODE` selector with permanent `LEGACY` code default, thin provider and governed acquisition adapters, truthful lineage/history construction, the real seven-stage chain, explicit discriminated response, LEGACY byte-regression proof, Cassie route proof, no silent fallback, no promotion, and no operator-verification claim.

Mandatory stop conditions remain:

```text
real production source cannot satisfy port                 → Integration Incomplete
entity/claim parameter requires ungoverned inference       → Integration Incomplete
only fixture enrichment resolver exists                    → Integration Incomplete
only fixture conflict observations exist                   → Integration Incomplete
required persistence cannot be committed truthfully        → Integration Incomplete
LEGACY response bytes change                               → Integration Incomplete
core governed semantics require modification               → Integration Incomplete
GOVERNED silently falls back to LEGACY                     → Integration Incomplete
```

Any future attempt must exclude new claim types/classes, model-based claim classification, automatic directory search, arbitrary person resolution, attachment retrieval, new source contracts, Memory attestation redesign, new persistence governance inside integration, selector promotion, operator verification, default changes, Dashboard/DAWNWATCH selector changes, and EOS deliberation execution.

## 14. Validation results

| Check | Exact command/result |
| --- | --- |
| Targeted identity, input, lifecycle, repository, execution-record, all publisher/acquisition/assembly, Claim Boundary, enrichment, conflicts, projection, integrity, model invocation, validator, Sprint 3.102, Sprint 3.105, Sprint 3.110, mutation suites | `npx vitest run lib/governed-conversation` — 51 files passed; 221 tests passed. |
| Sprint 3.110 direct evaluator output | `npx tsx /tmp/sprint311-summary.ts` — 10/10 scenarios ran with expected outcomes/integrity; three replay runs byte-identical; all three non-success false-positive flags false; both mutations rejected before publication. The temporary diagnostic was outside the repository and was not a deliverable. |
| Full tests | `npm test` — 163 files passed; 776 tests passed, 1 skipped. |
| Production build | `npm run build` — passed. |
| Lint | `npm run lint` — passed with no warnings or errors. |
| Typecheck | `npm run typecheck` — passed. |
| Patch whitespace | `git diff --check` — passed after the review was written. |

## 15. Files changed

Only:

```text
docs/SPRINT-3.111-GOVERNED-CONVERSATIONAL-PRODUCTION-INTEGRATION-READINESS-REVIEW.md
```

No production code, test code, fixture, selector, route, publisher, adapter, engine, composer, model, validator, or persistence implementation was changed.

## 16. Production effect

Sprint 3.111 changes no runtime behaviour. It does not modify `/api/chat`, add a selector, integrate the governed chain, alter the LEGACY default, configure GOVERNED mode, perform operator verification, or authorise promotion. It records whether sufficient current ground truth exists for a future controlled integration attempt.

## 17. Final recommendation

The review completed every required inspection and validation. All historical isolated-architecture corrections remain resolved and mutually coherent. The production boundary is nevertheless not ready because deterministic production entity/claim-parameter identity, a production enrichment resolver, governed conflict observations, and authorised durable lineage persistence do not currently exist together. The recommendation follows current production code, not sprint count or Sprint 3.110's clean isolated result.

**Review Complete — Not Ready**
