# Sprint 3.87 — Governed Conversational Runtime Integration

**Status:** Integration incomplete at the fail-closed Projection Ownership Integration Gate  
**Sprint type:** Production integration investigation  
**Repository evidence date:** 2026-08-01 UTC

## Repository Precondition

- Repository: `/workspace/jarvis`.
- Intended checked-out branch: `work`. No local or remote `main` ref was present; the binding specification was nevertheless present in the clean checked-out snapshot at `docs/SPRINT-3.87-SPECIFICATION.md` and was read completely before any repository file was changed.
- Starting commit: `7491972c2807d1c0fe8833904720d73ee2cc2133`.
- Starting working tree: clean (`git status --short --branch` returned only `## work`).
- All five constitutional/architectural artefacts and all nine prior-sprint artefacts required by Section 4 existed and were read completely.
- Every implementation/source path listed in Section 4 existed. `EosReferenceVerifier` was confirmed in `lib/governed-conversation/input.ts`, not in a separate file.
- Sprint 3.86 is present. The checked-out implementation has mandatory `threadId`, `requestId`, and `exchangeId`, optional EOS references, fail-closed EOS verification, and `ConversationalExecutionRecord` as terminal authority.
- The complete route, selector precedents, governed-conversation core, production Gmail evidence bridge, Gmail content connector, legacy context builder, client caller, and audited chat boundary were inspected before this report was created.
- The production request trace is `lib/useAgentConversation.ts` → `POST /api/chat` → `app/api/chat/route.ts` → `buildOperationalState` → `buildContextBlock`/`assembleAgentSystemPrompt` → `executeAuditedChat`, with the model injected as `callModel: callClaude`.
- Production source acquisition currently enters chat through `buildOperationalState`. It acquires calendar events, Gmail messages plus `ProductionGmailRecipientEvidence`, priorities/projects/signals from legacy memory, Drive files, and legacy connector statuses. The capability branch separately uses `GoogleGmailContentConnector` for an identified single-message retrieval.
- Ordinary chat request/body, client, route, and audited execution types contain no genuine EOS run, EOS session, or EOS interaction-contract reference.

### Pre-sprint protected blob hashes

| File | Starting blob hash |
| :---- | :---- |
| `app/api/chat/route.ts` | `c10eb65234c37c8696cb7d2d285ef90e6efcf3e3` |
| `lib/context-builder.ts` | `8d22c39fc473e9267f1157f0c55fa2a6c85d578d` |
| `lib/useAgentConversation.ts` | `ceec0b3690d33bfc456563f1c75083a2e61af80c` |
| `lib/agents/chat-execution.ts` | `091b37128f8525d2056c2f6e340e777bc55a3d3c` |
| `lib/governed-conversation/types.ts` | `54dff52de7ca17ef0d652c45cdcc8a386d2d9fc1` |
| `lib/governed-conversation/input.ts` | `d59cf2a47f8edb89e435ebd77cbd1f40201bf8f8` |
| `lib/governed-conversation/evidence-status.ts` | `3c4249af334b16a60f68d7cb7e7df585ad74c871` |
| `lib/governed-conversation/model-request.ts` | `75d167f558a74a1042df82776e5bfebc7e727480` |
| `lib/governed-conversation/model-output.ts` | `2f1ae23c6c9043f28acb4356db8b93943b066157` |
| `lib/governed-conversation/model-invocation.ts` | `315296804c17d341dbea390ab3b76b706354da18` |
| `lib/governed-conversation/response-envelope.ts` | `f339e8fbd9fe80627f7ffea47567e9adb1a142d4` |
| `lib/governed-conversation/validator.ts` | `1b1c1f2512629ab8189ec76d4510e6bfd47f9f1c` |
| `lib/governed-conversation/lineage-types.ts` | `dd9b9806b4ba0bb1fb97e5c67a1492e80d0c1ecb` |
| `lib/governed-conversation/projection-composer.ts` | `c9872a9dd859414c7451b6cca48f2d8ad3f89bcc` |
| `lib/governed-conversation/exchange-lifecycle.ts` | `6eb0a719d82c9b51b530c5472e5ff156bf362600` |
| `lib/governed-conversation/lineage-repository.ts` | `6d8c3ecbacb7d8266f3fa8d7f6eb47ad69c17853` |
| `lib/governed-conversation/lineage-orchestrator.ts` | `b24c020d6dede0fd5c3dc627114929ae70b1625c` |

### Fixed legacy baseline responses

The deterministic pre-source-acquisition fixtures captured the complete status, relevant header, and raw body bytes from the unmodified handler:

| Fixture | Status/header | Raw body SHA-256 |
| :---- | :---- | :---- |
| malformed JSON `{` | `400`, `content-type: application/json` | `6f9d2f46d0cd125ed5f2e599446efa59f62cadb82f788864a91503dedde99492` |
| empty messages `{"agentId":"jarvis","messages":[]}` | `400`, `content-type: application/json` | `ec79f7a76308d0bfb2546b6ca2627211bdbffac15c10bece5d75fbb82220b624` |
| 41 fixed messages | `400`, `content-type: application/json` | `0ed7b847664118e3994c7f6e80dc8711039d8e88eab2a175419387e9456e5283` |

No successful provider-backed baseline was represented as deterministic evidence: the live route has no handler dependency injection for `buildOperationalState`, `callClaude`, or the audit store. Because the gate failed before route modification, no post-change byte-identity claim is made.

## Governing Artefacts Reviewed

The following were read completely before changing the repository:

1. `docs/ENGINEERING_CONSTITUTION.md`
2. `docs/architecture/NORTH_STAR.md`
3. `docs/architecture/JARVIS-Engineering-Specification-Standard.md`
4. `docs/CONSTITUTIONAL-PUBLICATION-PRINCIPLES.md`
5. `docs/architecture/ROADMAP.md`
6. `docs/SPRINT-3.61-GOVERNED-DASHBOARD-INTEGRATION.md`
7. `docs/SPRINT-3.67-GOVERNED-DAWNWATCH-INTEGRATION.md`
8. `docs/SPRINT-3.76-GOVERNED-CONVERSATIONAL-RUNTIME-CONTRACT.md`
9. `docs/SPRINT-3.79-ISOLATED-GOVERNED-CONVERSATIONAL-MODEL-INVOCATION.md`
10. `docs/SPRINT-3.80-GOVERNED-CONVERSATIONAL-RUNTIME-INTEGRATION.md`
11. `docs/SPRINT-3.82-GOVERNED-CONVERSATIONAL-LINEAGE-IDENTITY-CONTRACT.md`
12. `docs/SPRINT-3.83-ISOLATED-CONVERSATIONAL-LINEAGE-AND-PROJECTION-IMPLEMENTATION.md`
13. `docs/SPRINT-3.85-GOVERNED-CONVERSATIONAL-IDENTITY-CORRECTION-CONTRACT.md`
14. `docs/SPRINT-3.86-GOVERNED-CONVERSATIONAL-IDENTITY-CORRECTION-IMPLEMENTATION.md`
15. `docs/SPRINT-3.87-SPECIFICATION.md`

## Sprint 3.80 Blocker Resolution

Sprint 3.80 found that ordinary chat lacked truthful lineage and that the then-current governed input required EOS-shaped `runId`, `sessionId`, and `interfaceContractId`; filling those fields would have fabricated EOS execution. Sprints 3.82, 3.85, and 3.86 resolved that identity blocker by making conversational `threadId`, `requestId`, and `exchangeId` mandatory, making genuine EOS references optional and verified, and assigning sole terminal authority to `ConversationalExecutionRecord`.

That identity blocker no longer remains. The other original blocker—no complete governed production projection for the live route—does remain. It is independently confirmed below rather than inferred from Sprint 3.80.

## Projection Ownership Integration Gate

**Failed**

The gate stopped implementation before selector, adapters, route integration, or client changes. Production does not expose the complete already-authorised composer input. Supplying it would require new semantic mappings for publication identity, source/provenance and retrieval-policy references, coverage, connector availability, conversation-turn identity/classification, arbitrary question claims, and claim-linked conflicts.

### Required category assessment

| Projection input category | Existing producer found? | Governed shape confirmed? | Gate status for category | Precise evidence |
| :---- | ----: | ----: | :---- | :---- |
| `communicationEvidence` | Yes | No, not the composer shape | Fail | `projectProductionGmailEvidence` genuinely calls canonical `normalizeGmailObservation` and returns immutable `NormalizedGmailObservation[]`. This is a governed upstream normalization partial pass, but it does not provide `GovernedCommunicationEvidenceInput`: recipient-evidence reference, composer source reference, provenance reference, retrieval policy reference, compatibility boundary, and governed content classification are absent. No existing owner performs that second governed publication/mapping. |
| `calendarEvidence` | Yes | No | Fail | `buildOperationalState` obtains normalized legacy `CalendarEvent[]`, but no non-test producer emits `GovernedCalendarEvidenceInput` with governed source/provenance, coverage-limit, and policy references. |
| `memoryPriorityReferences` | Yes | No | Fail | Legacy memory supplies `OperationalState.priorities`; no authorised producer emits `GovernedMemoryPriorityReference` or governs freshness, ownership classification, policy, and digest. |
| `sourceEvidence` | No | No | Fail | No production producer emits `GovernedSourceEvidenceInput` or the required governed publication reference, source-field reference, provenance, retrieval policy, bounded content kind, and availability status. |
| `connectorAvailability` | Yes | No | Fail | `OperationalState.connectorStatuses` is the current legacy source, but no governed owner emits `GovernedConnectorAvailabilityInput`, including cause and governed fallback status. |
| conversation history | Yes | No | Fail | The client submits raw `ChatMessage[]`. Neither client nor route assigns governed turn identities and authorised `operator_provided`/`assistant_prior_output`/`retrieval_reference` classifications. |
| governed claim set | No | No | Fail | No production deterministic claim-construction owner converts an arbitrary operator question, including the Cassie address/significance pair, into bounded `GovernedClaimInput[]`. Existing construction exists only in isolated fixtures/evaluations. |
| conflicts | No | No | Fail | EOS snapshot structural conflicts are a different domain shape; no production owner maps claim-linked conversational conflicts to `GovernedConflictInput[]` without inventing claim association and status restriction. |

`GoogleGmailContentConnector` does not close any row. It performs an authorised fetch only for one identified Gmail message and returns raw decoded `GmailRetrievedMessage` content (`subject`, `snippet`, `plainTextBody`, attachments). It neither normalizes that result to a projection-composer input nor establishes governed publication, policy, claim, availability, or conflict semantics.

The exact stop condition is the absence of production owners for every complete composer category. In particular, even the genuine Gmail normalization cannot be passed directly into `communicationEvidence`; treating it as the final composer shape would require a new mapping and invented policy/publication semantics. Raw `OperationalState`, `gmailThreads`, prompt context, empty arrays, fixture values, or route-authored claims cannot truthfully fill the gaps.

## Selector

No `lib/conversational-runtime-selection.ts` was created. Section 9 expressly forbids completing only selector/model-adapter work after the gate fails. Consequently there is no Sprint 3.87 selector or independence proof. Existing Dashboard and DAWNWATCH selectors were inspected and left unchanged. LEGACY remains the only production chat behavior and therefore remains the default.

## Production Chain

No governed production chain was implemented. The current legacy chain remains structurally and byte-for-byte source unchanged. The route still owns request validation/orchestration and calls the existing legacy source/context/model/audit chain. It does not derive governed projection evidence.

The specified governed chain cannot begin honestly at “authorised source acquisition → Dedicated Conversational Projection Composer” until the missing governed publications and deterministic claim/conflict owners exist.

## Source Acquisition Mapping

| Projection area | Production source | Governed shape | Adapter behavior | Owner |
| :---- | :---- | :---- | :---- | :---- |
| Communications | Google Gmail acquisition via `buildOperationalState`; canonical `projectProductionGmailEvidence` | `NormalizedGmailObservation[]`, but not `GovernedCommunicationEvidenceInput[]` | None authorised; stop rather than add publication/policy mapping | Gmail normalizer owns normalized observations; a missing conversational evidence-publication owner must own composer mapping |
| Calendar | `getCalendarConnector().listUpcoming` → `CalendarEvent[]` | Legacy connector/application shape only | Stop; no coverage/provenance/policy invention | Calendar connector owns acquisition; missing governed calendar publication owner |
| Memory/priorities | local memory → `OperationalState.priorities` | Legacy application state only | Stop; no owner/freshness/classification invention | Memory owner plus a new governed priority-reference publisher |
| General source evidence | No production conversational publisher | Missing `GovernedSourceEvidenceInput[]` | Stop | Source-specific governed publication owners/coordinator required |
| Connector availability | `getConnectorStatuses` → legacy `ConnectorStatus[]` | Legacy status only | Stop; no cause/fallback semantics invented | Connector health owner plus governed availability publisher required |
| Conversation history | request `ChatMessage[]` from `useAgentConversation` | Raw role/content turns | Stop; no route-local identities/classification | A governed conversational-history intake owner is required |
| Claims | arbitrary user prose | No production governed claim set | Stop; no natural-language claim parser or route classification | A separately governed bounded deterministic claim-construction owner is required |
| Conflicts | no conversational claim-conflict publication | Missing `GovernedConflictInput[]` | Stop; no empty placeholder or cross-domain conversion | A claim-aware governed conflict owner is required |

## Conversational Lineage

The corrected isolated lineage constructors exist and can create thread/request/exchange/projection/attempt/envelope/terminal identities. They were not wired into `/api/chat`, because source projection stopped at the gate first. The current client sends no persistent conversation/thread token, idempotency key, request ID, or exchange ID; continuity exists only as a raw message array held in component state. A production integration must still govern how that client continuity maps to stable thread identity and retry semantics. None of these conversational identities may be substituted for EOS identity.

## EOS Context

Ordinary chat has:

```text
runId: absent
sessionId: absent
interfaceContractId: absent
```

`constructGovernedConversationalInput` accepts this absence. If any EOS reference is supplied, `input.ts` requires an injected `EosReferenceVerifier`, verifies each supplied publication independently, verifies cross-reference coherence, and fails closed for a missing verifier, fabricated publication, or incoherent combination. No EOS reference was manufactured.

## Production Governed-Input Adapter

No production input adapter was created because its required `authorisedSources` bundle does not exist. Creating the adapter now would force it to assume prohibited source normalization, policy/publication identity, evidence-status, history classification, claim semantics, and conflict semantics. The existing projection composer and governed-input constructor remain unchanged and uninvoked by production.

## Production Model Adapter

No production model adapter was created. Although the existing real provider boundary is confirmed as `callModel: callClaude`, Section 9 prohibits completing the model adapter as partial integration after a projection-gate failure. No model request, parser, validator, safe-envelope, or execution-record logic was duplicated.

## Route Integration

`app/api/chat/route.ts` was not modified. There is no GOVERNED branch, response discriminant, or silent governed-to-legacy fallback. Existing capability handling and legacy `{ reply, agentId }` behavior remain unchanged. Governed failures cannot be misrepresented because governed mode is not exposed.

## Legacy Byte-Identity Proof

The three pre-sprint deterministic fixture digests are recorded in Repository Precondition. Since the route and all legacy support files remain unchanged, their source blobs are identical. No post-integration unset/empty/explicit-LEGACY executable comparison exists because the selector and route branch were correctly not implemented after gate failure. Therefore this report does **not** claim completion of Section 19's successful-response/model-input byte-identity gate.

## Cassie Integration Result

The route-level request “What’s Cassie’s email? Anything important?” was not run through a synthetic governed path. The contact-address claim lacks a production governed claim owner and composer-ready source publication; the significance claim likewise lacks an authorised deterministic classification rule. No lineage, projection, governed input, validator result, envelope, terminal record, or governed HTTP response was manufactured. The Cassie integration condition is unmet.

## Safe-Envelope Result

No governed route exists, so an adversarial provider result could not be exercised through the required real route chain. Isolated Sprint 3.79/3.86 safe-envelope behavior remains present and unchanged, but that is not claimed as Sprint 3.87 route evidence.

## Persistence Boundary

Only `InMemoryConversationalLineageRepository` is present as the concrete conversational lineage repository. The orchestrator encodes request, exchange, projection/input, attempt, envelope, and terminal-record commit ordering before release, but no production route orchestration was exercised. The adapter is non-durable and does not survive process loss or provide cross-instance behavior. This remains an explicit production limitation; it was not disguised as durable persistence.

## Client Compatibility

`lib/useAgentConversation.ts` is the real client consumer. It sends `{ agentId, messages }`, parses JSON, and appends `data.reply` as plain assistant content. It only understands the legacy `{ reply, agentId }` success shape. It has no governed discriminant/envelope renderer, no preservation of per-claim statuses/uncertainties/ownership, and no thread identifier. It was not modified because there is no authorised governed response to consume. A future integration will require a bounded, governed presentation contract or a precise separate blocker decision before operator verification.

## Files Changed

| File | Reason |
| :---- | :---- |
| `docs/SPRINT-3.87-GOVERNED-CONVERSATIONAL-RUNTIME-INTEGRATION.md` | Records the required repository precondition, independent per-category projection-gate investigation, precise fail-closed blocker, validation, and next sprint. |

No other repository file changed. `docs/SPRINT-3.87-SPECIFICATION.md` was not modified.

## Protected Files

All protected pre/post hashes are identical because only this completion report was added:

| File | Pre hash | Post hash | Equal |
| :---- | :---- | :---- | :----: |
| `lib/context-builder.ts` | `8d22c39fc473e9267f1157f0c55fa2a6c85d578d` | `8d22c39fc473e9267f1157f0c55fa2a6c85d578d` | Yes |
| `lib/useAgentConversation.ts` | `ceec0b3690d33bfc456563f1c75083a2e61af80c` | `ceec0b3690d33bfc456563f1c75083a2e61af80c` | Yes |
| `lib/agents/chat-execution.ts` | `091b37128f8525d2056c2f6e340e777bc55a3d3c` | `091b37128f8525d2056c2f6e340e777bc55a3d3c` | Yes |
| `lib/governed-conversation/types.ts` | `54dff52de7ca17ef0d652c45cdcc8a386d2d9fc1` | `54dff52de7ca17ef0d652c45cdcc8a386d2d9fc1` | Yes |
| `lib/governed-conversation/input.ts` | `d59cf2a47f8edb89e435ebd77cbd1f40201bf8f8` | `d59cf2a47f8edb89e435ebd77cbd1f40201bf8f8` | Yes |
| `lib/governed-conversation/evidence-status.ts` | `3c4249af334b16a60f68d7cb7e7df585ad74c871` | `3c4249af334b16a60f68d7cb7e7df585ad74c871` | Yes |
| `lib/governed-conversation/model-request.ts` | `75d167f558a74a1042df82776e5bfebc7e727480` | `75d167f558a74a1042df82776e5bfebc7e727480` | Yes |
| `lib/governed-conversation/model-output.ts` | `2f1ae23c6c9043f28acb4356db8b93943b066157` | `2f1ae23c6c9043f28acb4356db8b93943b066157` | Yes |
| `lib/governed-conversation/model-invocation.ts` | `315296804c17d341dbea390ab3b76b706354da18` | `315296804c17d341dbea390ab3b76b706354da18` | Yes |
| `lib/governed-conversation/response-envelope.ts` | `f339e8fbd9fe80627f7ffea47567e9adb1a142d4` | `f339e8fbd9fe80627f7ffea47567e9adb1a142d4` | Yes |
| `lib/governed-conversation/validator.ts` | `1b1c1f2512629ab8189ec76d4510e6bfd47f9f1c` | `1b1c1f2512629ab8189ec76d4510e6bfd47f9f1c` | Yes |
| `lib/governed-conversation/lineage-types.ts` | `dd9b9806b4ba0bb1fb97e5c67a1492e80d0c1ecb` | `dd9b9806b4ba0bb1fb97e5c67a1492e80d0c1ecb` | Yes |
| `lib/governed-conversation/projection-composer.ts` | `c9872a9dd859414c7451b6cca48f2d8ad3f89bcc` | `c9872a9dd859414c7451b6cca48f2d8ad3f89bcc` | Yes |
| `lib/governed-conversation/exchange-lifecycle.ts` | `6eb0a719d82c9b51b530c5472e5ff156bf362600` | `6eb0a719d82c9b51b530c5472e5ff156bf362600` | Yes |
| `lib/governed-conversation/lineage-repository.ts` | `6d8c3ecbacb7d8266f3fa8d7f6eb47ad69c17853` | `6d8c3ecbacb7d8266f3fa8d7f6eb47ad69c17853` | Yes |
| `lib/governed-conversation/lineage-orchestrator.ts` | `b24c020d6dede0fd5c3dc627114929ae70b1625c` | `b24c020d6dede0fd5c3dc627114929ae70b1625c` | Yes |

## Targeted Tests

The required implementation-targeted selector, adapter, route, Cassie, safe-envelope, source-failure, and selector-independence tests were not created or represented as passing, because the binding gate prohibited those implementations. The following existing targeted checks were run after documenting the failure:

| Command | Result |
| :---- | :---- |
| `npm test -- lib/governed-conversation/parallel-evaluation.test.ts lib/governed-conversation/lineage-projection-evaluation.test.ts lib/governed-conversation/identity-correction-composition.test.ts lib/governed-conversation/projection-composer.test.ts lib/governed-conversation/input.test.ts lib/governed-conversation/model-invocation.test.ts lib/governed-conversation/cassie-fixture.test.ts lib/governed-conversation/lineage-orchestrator.test.ts lib/governed-conversation/lineage-projection-evaluation-isolation.test.ts` | PASS — 9 files, 49 tests. This covers the existing Sprint 3.78 parallel evaluation, Sprint 3.84 historical evaluation, Sprint 3.86 composition, composer, EOS verification, isolated model/safe behavior, Cassie fixture, commit orchestration, and isolation checks. It is not represented as route integration. |
| `git hash-object <each protected path>` | PASS — every post hash equals its recorded pre-sprint hash. |
| Repository-wide `rg` producer search excluding tests/fixtures/evaluations | PASS as an investigation check — found no production producer of the eight exact composer categories beyond their type definitions; found the genuine Gmail upstream normalizer separately. |

## Full Validation

| Command | Result |
| :---- | :---- |
| `npm test` | PASS — 133 test files; 648 passed, 1 skipped. |
| `npm run build` | PASS — optimized production build completed. Google Fonts stylesheet download was unavailable, so font optimization was skipped with a non-blocking warning. |
| `npm run lint` | PASS — no ESLint warnings or errors. |
| `npm run typecheck` | PASS. |
| `git diff --check` | PASS. |

Full validation passing confirms that the report and fail-closed stop did not regress the repository. It cannot convert the failed Projection Ownership Integration Gate into an Integration Complete result.

## Execution Boundary

This evidence is repository-level only. It does not verify the operator's running process, `.env.local`, live Gmail/calendar behavior, real Claude output, multi-instance persistence, deployment configuration, or browser behavior. No operator verification or promotion occurred.

## Outstanding Findings

- **Projection gaps:** every required composer category lacks a complete production composer-ready publication; Gmail alone has a genuine normalized upstream observation but not the required conversational publication/policy mapping.
- **Source-shape gaps:** governed calendar evidence, memory/priority references, general source evidence, connector availability, governed history, claims, and claim conflicts have no existing production owners. Communication evidence also lacks the final governed conversational owner.
- **Persistence limitation:** only an in-memory reference adapter exists; no durable multi-instance production repository is authorised.
- **Client presentation gap:** the client only reads `data.reply` and cannot render governed claim status, uncertainty, ownership, or safe envelopes.
- **Live-provider uncertainty:** neither live connectors nor real Claude were exercised; no claim to production or operator verification is made.
- **Work before operator verification:** govern and implement the missing production source-to-composer publications and bounded claim/conflict construction, then re-attempt Sprint 3.87. Only after the integration gate and all Section 38 conditions pass may operator verification begin.

### Smallest next sprint

The next sprint should be **Governed Conversational Production Projection Inputs Contract and Implementation**. Its scope must be limited to assigning owners and producing the exact composer-ready governed shapes for calendar evidence, memory/priority references, general source evidence, connector availability, history, bounded claims, conflicts, and the final Gmail-normalized-observation-to-communication-publication boundary. It must define publication/provenance/policy/coverage semantics and a bounded deterministic Cassie claim set without changing the composer, deriving evidence in `/api/chat`, or introducing general natural-language claim extraction. After that sprint passes independently, Sprint 3.87 should be re-attempted; do not proceed directly to operator verification.

## Production Effect

Sprint 3.87 preserves LEGACY as the default and does not promote the governed conversational runtime. The live route, client, selectors, protected governed core, model boundary, and legacy behavior are unchanged. No operator verification or promotion occurred.

## Recommendation

**Integration Incomplete**
