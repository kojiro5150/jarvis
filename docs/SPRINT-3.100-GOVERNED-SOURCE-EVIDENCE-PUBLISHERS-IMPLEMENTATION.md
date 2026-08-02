# Sprint 3.100 — Governed Source Evidence Publishers Implementation

**Status:** Implementation complete  
**Production integration:** None

## Repository Precondition

- Repository: `/workspace/jarvis`; branch: `work`.
- Starting commit: `1fbb55a863e25e7df01d7d76638bc94d9227a9e8`.
- Starting working tree: clean.
- All four binding contracts and all required source/target files were present. Repository search confirmed that no production publisher already owned any mapping.
- Expected files before editing were the four publisher modules, their four independent tests, and this report; those are the only files changed.
- Starting contract blob hashes: Sprint 3.96 `3e8313d731067190b492f18a488ee26a5f97153a`; 3.97 `d72f0ba9cd5c351941b251043f173b34e4c296c1`; 3.98 `e4f3a5a65a202c0049e65084102f08a9b05999c4`; 3.99 `827ce62f5c8a030cdefb5d4b0151c238e944110f`.

## Governing Artefacts Reviewed

The complete Sprint 3.96 Gmail, Sprint 3.97 Calendar, Sprint 3.98 Memory Priority, and Sprint 3.99 Connector Availability contracts were reviewed, together with `docs/ENGINEERING_CONSTITUTION.md`, `docs/CONSTITUTIONAL-PUBLICATION-PRINCIPLES.md`, the existing canonical source types and implementations, and the existing projection-composer target types. No separately named North Star, Engineering Specification Standard, or Roadmap file exists in the repository root or `docs/`; no governing document was modified.

## Source Contract Summary

- **Gmail:** canonical `ProductionGmailRecipientEvidence` metadata only, exact Gmail namespace and disclosure constants, no digest, and no unavailable/local synthesis.
- **Calendar:** explicit acquisition bundle, provider identity, source-observed interval/offset, exact coverage expression, and nine-field minimised disclosure.
- **Memory Priority:** stable governed identity and item provenance only; attestation for operator entries, derivation lineage for derived entries, and complete exclusion of unattested legacy data.
- **Connector Availability:** explicit overrides passed to `getConnectorStatuses`, explicit observation time, three-connector/two-source closed scope, and exact unavailable fallback semantics.

## Gmail Result

- Module: `lib/governed-conversation/gmail-evidence-publisher.ts`; test: `lib/governed-conversation/gmail-evidence-publisher.test.ts`.
- Input/output: `ProductionGmailRecipientEvidence` to immutable `readonly GovernedCommunicationEvidenceInput[]`.
- Mapping uses provider message identity for communication, recipient, source and provenance references; canonical retrieval time for both observation fields; `available: true`; exact `gmail_communication_metadata` kind, `gmail_metadata_non_authoritative_conversation_context.v1` boundary, and `governed-gmail-conversational-metadata-disclosure.v1` policy. `contentDigest` is absent.
- Fails closed for unavailable/non-Gmail bundles and observations missing canonical identity, message identity, recipient evidence, or valid retrieval time. Recipient evidence is neither parsed nor altered.
- Independent command: `npx vitest run lib/governed-conversation/gmail-evidence-publisher.test.ts` — passed (2 tests).
- **Status: Passed.**

## Calendar Result

- Module: `lib/governed-conversation/calendar-evidence-publisher.ts`; test: `lib/governed-conversation/calendar-evidence-publisher.test.ts`.
- The governed bundle explicitly carries source, availability, retrieval time, request window/limit, coverage state, and `CalendarEvent[]`.
- Only Google events with nonempty provider ID/calendar ID/start/end pass. Known local and synthesized compatibility IDs fail closed.
- A date-only start maps to `floating-date`; a timed start must end in and preserves `Z` or `±HH:MM`. No clock or environmental timezone is used.
- Coverage is exactly `window=<start>/<end>;max_events=<limit>;scope=visible_non_hidden_calendars;completeness=<state>` from bundle fields.
- Output excludes title, calendar presentation data, attendee/response data, location, conference, description, and provider objects; exactly nine target fields are emitted.
- Independent command: `npx vitest run lib/governed-conversation/calendar-evidence-publisher.test.ts` — passed (2 tests).
- **Status: Passed.**

## Memory Priority Result

- Module: `lib/governed-conversation/memory-priority-evidence-publisher.ts`; test: `lib/governed-conversation/memory-priority-evidence-publisher.test.ts`.
- Governed input carries stable ID, existing `Priority`, lifecycle, and item-level ownership/classification/timestamps plus attestation or derivation lineage.
- A store containing only unattested legacy `Priority` entries produced zero `GovernedMemoryPriorityReference` records.
- An attested operator publication produced one exact reference. A derived interpretation with a non-operator governed owner, derivation reference, and source publication references produced one derived reference.
- Toggling only `urgent` left every output field identical. Rank/title/store freshness never supply identity, provenance, or freshness; `contentDigest` is absent.
- Missing stable ID, owner, valid item freshness, attestation, derivation lineage, source references, or availability fails closed.
- Independent command: `npx vitest run lib/governed-conversation/memory-priority-evidence-publisher.test.ts` — passed (3 tests).
- **Status: Passed.**

## Connector Availability Result

- Module: `lib/governed-conversation/connector-availability-publisher.ts`; test: `lib/governed-conversation/connector-availability-publisher.test.ts`.
- The sole construction path requires complete explicit overrides and passes them to `getConnectorStatuses`; it never calls acquisition. `observedAt` is mandatory, validated, preserved, and never clock-derived.
- Exact matrix: Google/connected → available/none; Google/disconnected → unavailable/unavailable; local/disconnected → unavailable/unavailable. Local/connected and unsupported runtime identities fail closed.
- Every disconnected connector using local compatibility data produced `fallbackStatus: "unavailable"` and never `"none"`.
- Three immutable records retain Calendar/Gmail/Drive order. No policy or fallback content field is emitted.
- Independent command: `npx vitest run lib/governed-conversation/connector-availability-publisher.test.ts` — passed (5 tests, including pure-Node isolation checks).
- **Status: Passed.**

## Independence Result

- Pure-Node `node:fs` repository traversal proves zero cross-publisher imports, zero protected runtime dependencies, and zero hidden production imports. It uses neither shell search nor `execFileSync`.
- Each source test owns its fixtures and runs independently. No shared fixture or common utility was added.
- The connector suite owns only generic isolation assertions; it contains no fixture shared with another source suite.

## Files Changed

- `lib/governed-conversation/gmail-evidence-publisher.ts` — canonical Gmail mapping.
- `lib/governed-conversation/gmail-evidence-publisher.test.ts` — independent Gmail contract suite.
- `lib/governed-conversation/calendar-evidence-publisher.ts` — governed Calendar mapping.
- `lib/governed-conversation/calendar-evidence-publisher.test.ts` — independent Calendar contract suite.
- `lib/governed-conversation/memory-priority-evidence-publisher.ts` — attested/derived memory mapping and legacy exclusion.
- `lib/governed-conversation/memory-priority-evidence-publisher.test.ts` — independent Memory contract suite.
- `lib/governed-conversation/connector-availability-publisher.ts` — deterministic availability mapping.
- `lib/governed-conversation/connector-availability-publisher.test.ts` — independent Connector contract and pure-Node isolation suite.
- `docs/SPRINT-3.100-GOVERNED-SOURCE-EVIDENCE-PUBLISHERS-IMPLEMENTATION.md` — implementation evidence and completion report.

## Protected Files

| File | Starting blob | Final blob | Result |
|---|---|---|---|
| `app/api/chat/route.ts` | `c10eb65234c37c8696cb7d2d285ef90e6efcf3e3` | `c10eb65234c37c8696cb7d2d285ef90e6efcf3e3` | byte-identical |
| `lib/context-builder.ts` | `8d22c39fc473e9267f1157f0c55fa2a6c85d578d` | `8d22c39fc473e9267f1157f0c55fa2a6c85d578d` | byte-identical |
| `lib/useAgentConversation.ts` | `ceec0b3690d33bfc456563f1c75083a2e61af80c` | `ceec0b3690d33bfc456563f1c75083a2e61af80c` | byte-identical |
| `lib/agents/chat-execution.ts` | `091b37128f8525d2056c2f6e340e777bc55a3d3c` | `091b37128f8525d2056c2f6e340e777bc55a3d3c` | byte-identical |
| `lib/governed-conversation/projection-composer.ts` | `dfccfb69bb4c4fe3dcfe1cc473fc8704bf872c0f` | `dfccfb69bb4c4fe3dcfe1cc473fc8704bf872c0f` | byte-identical |

## Validation Results

- `npm test` — passed: 149 files, 722 tests passed, 1 skipped.
- `npm run build` — passed; Google Fonts stylesheet optimization was skipped after an external download warning, without affecting the successful build.
- `npm run lint` — passed with no warnings or errors.
- `npm run typecheck` — passed.
- `git diff --check` — passed.
- Pure-Node committed isolation checks — passed in the Connector suite.

## Production Effect

Sprint 3.100 introduces four isolated governed source-evidence publishers. It changes no current production behavior, performs no `/api/chat` integration, and does not yet compose the four publishers into a complete governed conversational projection.

## Outstanding Findings

- Gmail: none.
- Calendar: none.
- Memory Priority: current legacy data remains intentionally ineligible pending governed upstream provenance.
- Connector Availability: local compatibility remains intentionally unavailable evidence.

## Recommended Next Step

**Sprint 3.101 — Governed Source Evidence Publishers Composition Evaluation**

That sprint should evaluate composition with the existing projection and claim/conflict architecture without assuming compatibility merely from independent success.

**Implementation Complete**
