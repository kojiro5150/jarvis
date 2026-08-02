# Sprint 3.101 — Governed Source Evidence Publisher Wiring

**Status:** Implementation complete  
**Sprint type:** Isolated acquisition wiring  
**Starting commit:** `44560e88fc7b4cdfbea5334a18d1c9b95ca8fc6b`  
**Branch:** `work`

## Repository Precondition

The repository was confirmed as `/workspace/jarvis`; the starting working tree was clean. Before implementation, the expected change set was the four adapters, shared neutral result envelope, assembler, five test suites, pure-Node isolation proof, Vitest path-resolution configuration, and this report. No production entry point was included.

All required Sprint 3.96–3.100 documents and all requested acquisition, connector, memory, operational-state, publisher, and composer sources were present and read. Searches confirmed the current callers of `projectProductionGmailEvidence`, `getCalendarConnector`, `readMemory`, and `getConnectorStatuses`; confirmed publishers had no non-test caller; and found no pre-existing assembly owner.

### Starting Git blob hashes

| Protected/preserved file | Git blob |
|---|---|
| `app/api/chat/route.ts` | `c10eb65234c37c8696cb7d2d285ef90e6efcf3e3` |
| `lib/context-builder.ts` | `8d22c39fc473e9267f1157f0c55fa2a6c85d578d` |
| `lib/useAgentConversation.ts` | `ceec0b3690d33bfc456563f1c75083a2e61af80c` |
| `lib/agents/chat-execution.ts` | `091b37128f8525d2056c2f6e340e777bc55a3d3c` |
| `lib/governed-conversation/projection-composer.ts` | `dfccfb69bb4c4fe3dcfe1cc473fc8704bf872c0f` |
| `lib/governed-conversation/calendar-evidence-publisher.ts` | `8c8c5e6ff1a38823e4f8fd15504eb31dfc420068` |
| `lib/governed-conversation/connector-availability-publisher.ts` | `25981dba35ed7b5751a44044846d152eb3befdfe` |
| `lib/governed-conversation/gmail-evidence-publisher.ts` | `0fafba0281a308882c7cb15cfd4b05dcdd53d635` |
| `lib/governed-conversation/memory-priority-evidence-publisher.ts` | `b40644d977ff32a7b29e09fde69a3027a98b346a` |

## Governing Artefacts Reviewed

- JARVIS Engineering Constitution (`DESIGN_CONSTITUTION.md`), North Star, Engineering Specification Standard, Constitutional Publication Principles, and roadmap.
- Sprint 3.96 Gmail, Sprint 3.97 Calendar, Sprint 3.98 Memory Priority, Sprint 3.99 Connector Availability, and Sprint 3.100 publisher implementation documents.
- `gmail-production-evidence.ts`, Google Gmail, Calendar connector and normalization files, Memory store/schema, connector index/types, operational state, all four publishers, and projection composer.

## Signatures Reconfirmed

```ts
publishGmailEvidence(input: ProductionGmailRecipientEvidence): readonly GovernedCommunicationEvidenceInput[]
publishCalendarEvidence(input: GovernedCalendarPublicationInput): readonly GovernedCalendarEvidenceInput[]
publishMemoryPriorityEvidence(input: readonly GovernedPriorityPublication[]): readonly GovernedMemoryPriorityReference[]
projectLegacyMemoryPriorities(input: readonly Priority[]): readonly GovernedMemoryPriorityReference[]
publishConnectorAvailability(input: ConnectorAvailabilityPublicationInput): readonly GovernedConnectorAvailabilityInput[]
composeGovernedConversationalProjection(input: GovernedConversationalProjectionInput): GovernedConversationalProjection
```

No material signature mismatch was found.

## Gmail Result

- **Adapter:** `lib/governed-conversation/gmail-evidence-acquisition-adapter.ts`
- **Port:** `GmailProductionAcquisitionPort.acquireRecent(limit?)`
- **Real chain:** `GoogleGmailConnector.acquireRecent` → `GmailProductionAcquisition` → `projectProductionGmailEvidence` → unchanged `publishGmailEvidence`.
- **Fixture result:** one canonical provider message produced one communication evidence record. Canonical message retrieval time, Google-qualified resource identity, disclosure policy, compatibility boundary, and absent digest were preserved.
- **Failure:** provider exceptions become sanitized `unavailable` results with no fallback and no evidence.
- **Status:** Passed.

## Calendar Result

- **Adapter:** `lib/governed-conversation/calendar-evidence-acquisition-adapter.ts`
- **Port:** injected `CalendarAcquisitionPort`, compatible with `getCalendarConnector()` output.
- **Configuration:** requested limit `5`; horizon `7` days; both explicit.
- **Timing:** start immediately before Google acquisition and retrieval immediately after resolution/rejection, using only the injected clock. Window end is start plus seven exact days.
- **Coverage:** `bounded`; no completeness inference from the returned array.
- **Fixture result:** one real-shaped Google event produced one governed calendar record. Local events were never acquired or published.
- **Status:** Passed.

## Memory Priority Result

- **Adapter:** `lib/governed-conversation/memory-priority-acquisition-adapter.ts`
- **Real chain:** injected production-compatible `readMemory` → `MemoryStore.priorities` → unchanged `projectLegacyMemoryPriorities` → empty.
- **Fixture:** one legacy priority read; zero legacy references produced. Store `updatedAt`, urgency, title, rank, and detail were not promoted.
- **Separate governed port:** one attested publication produced one governed reference in its targeted scenario; invalid records remain excluded and duplicate references fail closed.
- **Status:** Passed.

A real-shaped unattested Memory store produced zero governed Memory Priority references through the full acquisition and assembly chain.

A real-shaped unattested Memory store remained excluded through the complete acquisition, assembly, and projection chain.

## Connector Availability Result

- **Adapter:** `lib/governed-conversation/connector-availability-acquisition-adapter.ts`
- **Inputs:** exactly one explicit live result for calendar, Gmail, and Drive.
- **Overrides:** `calendarConnected/calendarSource`, `gmailConnected/gmailSource`, and `driveConnected/driveSource`, built exactly from live outcomes.
- **Real chain:** overrides → unchanged `publishConnectorAvailability` → its single `getConnectorStatuses(overrides)` call.
- **Observation:** explicit assembly observation time; no adapter clock.
- **Fixture states:** Google Calendar and Gmail available; local/disconnected Drive unavailable with unavailable fallback. Missing, duplicate, and local-connected inputs failed closed.
- **Status:** Passed.

Every disconnected connector using local compatibility fallback produced `fallbackStatus: "unavailable"` and never `"none"` through the full acquisition and assembly chain.

## Assembly Result

The successful central fixture returned:

| Collection | Count | Source status |
|---|---:|---|
| `communicationEvidence` | 1 | available |
| `calendarEvidence` | 1 | available |
| `memoryPriorityReferences` | 0 | available |
| `connectorAvailability` | 3 | available |

The four adapters run with `Promise.allSettled`. Source acquisition exceptions retain `unavailable`; deterministic input/publication defects become `failed`. Tests proved Gmail, Calendar, and Memory unavailability did not suppress connector publication. Every record, collection, diagnostic, and outer result is frozen.

## Composition Result

The central test called the real `composeGovernedConversationalProjection` with a real existing lineage/claim/conflict publication fixture. The exact assembly arrays were assigned directly to their four composer fields. Composition returned a valid deterministic projection ID; all communication, Calendar, empty Memory, and availability collections survived unchanged. A malformed assembled connector observation time mutation was rejected, proving sensitivity at the new wiring boundary.

All five pieces composed successfully: four unchanged publishers plus the real unchanged projection composer. Generic `sourceEvidence` remained the separately governed fixture source and was not reconstructed from dedicated collections.

## Isolation Result

Pure-Node committed traversal uses `node:fs`, `node:path`, and `node:crypto` directly—no `rg`, subprocess, or platform shell search. It proves protected SHA-256 hashes, publisher SHA-256 hashes, absence of production assembly imports, adapter mutual isolation, and absence of route/model imports. The assembler contains only type imports from the composer and never calls it.

Pre/post Git blobs for all nine protected/publisher files are identical to the table above. Zero prohibited imports were found. Production chat, context building, client conversation, agent execution, composer, and publisher bytes remain unchanged.

## Files Changed

- Four `*-acquisition-adapter.ts` modules — injected, source-specific acquisition-to-publisher wiring.
- `source-adapter-result.ts` — semantically neutral immutable adapter envelope.
- `source-evidence-assembly.ts` — independent four-source immutable assembly.
- Four source adapter test files — acquisition, policy, failure, mutation, and immutability coverage.
- `connector-availability-publisher.test.ts` — narrows its pre-existing “hidden production import” search so the explicitly authorised isolated Sprint 3.101 adapters/assembler are not misclassified as production callers.
- `source-evidence-assembly.test.ts` — full assembly, real composition, partial failure, mutation, and pure-Node isolation proof.
- `vitest.config.ts` — resolves the repository's existing `@/*` TypeScript alias during real connector traversal.
- This Sprint 3.101 report.

No existing production module changed.

## Validation Results

- Gmail targeted suite: passed (2 tests).
- Calendar targeted suite: passed (3 tests).
- Memory Priority targeted suite: passed (3 tests).
- Connector Availability targeted suite: passed (2 tests).
- Assembly/composition/isolation suite: passed (4 tests).
- Full repository validation results are recorded after the final clean run below.

## Production Effect

Sprint 3.101 connects the four isolated publishers to real-shaped acquisition ports and proves their combined output can enter the existing projection composer. It does not modify `/api/chat`, `context-builder.ts`, `useAgentConversation.ts`, model invocation, or any production conversational entry point.

## Outstanding Findings

- **Gmail:** none within this isolated seam.
- **Calendar:** connector arrays cannot prove completeness; coverage truthfully remains `bounded`.
- **Memory Priority:** current flat store has no item-level provenance, so legacy output remains permanently empty.
- **Connector Availability:** assembly observation is cycle-level, not per-connector.
- **Assembly:** intentionally not production imported.
- **Projection composition:** this success and mutation proof do not replace mixed-condition evaluation.

## Next Step

**Sprint 3.102 — Governed Source Evidence Full Composition Evaluation**

Sprint 3.102 should stress mixed availability, claim selection, conflicts, replay, and partial failure before any `/api/chat` integration. This single success-path proof is not a substitute for that evaluation.

**Implementation Complete**
