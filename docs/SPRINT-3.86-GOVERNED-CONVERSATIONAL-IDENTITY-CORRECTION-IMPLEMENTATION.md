# Sprint 3.86 — Governed Conversational Identity Correction Implementation

**Status:** Correction implementation incomplete
**Sprint Type:** Isolated architectural correction implementation
**Repository:** `/workspace/jarvis`
**Branch:** `work`
**Starting commit:** `5031844f0b261f104d020f77d6f4ba145635bd46`
**Starting working tree:** clean

## Repository Precondition

The intended repository and branch were confirmed, the starting commit and clean working tree were recorded, and every artefact required by the Sprint 3.86 specification was present. The current implementation still has the architecture governed by Sprint 3.85: `GovernedConversationalInput` requires EOS-shaped identity and model invocation constructs the competing legacy terminal payload.

Protected starting blob hashes were recorded:

| Protected scope | Starting hash |
| --- | --- |
| `app/api/chat/route.ts` | `c10eb65234c37c8696cb7d2d285ef90e6efcf3e3` |
| `lib/context-builder.ts` | `8d22c39fc473e9267f1157f0c55fa2a6c85d578d` |
| `lib/useAgentConversation.ts` | `ceec0b3690d33bfc456563f1c75083a2e61af80c` |
| `lib/agents/chat-execution.ts` | `091b37128f8525d2056c2f6e340e777bc55a3d3c` |
| `lib/executive-operating-system/` aggregate | `4a884a2ddf67719f9379709f59755dea8107e90f2fdb29a273bfbef47eb96c26` |

## Governing Artefacts Reviewed

The implementation precondition review covered:

1. `docs/SPRINT-3.85-GOVERNED-CONVERSATIONAL-IDENTITY-CORRECTION-CONTRACT.md`, including Section 8's complete cross-field coherence decision;
2. `docs/SPRINT-3.83-ISOLATED-CONVERSATIONAL-LINEAGE-AND-PROJECTION-IMPLEMENTATION.md`;
3. `docs/SPRINT-3.77-ISOLATED-GOVERNED-CONVERSATIONAL-RUNTIME-IMPLEMENTATION.md`;
4. the Sprint 3.84 composition finding in `docs/SPRINT-3.84-CONVERSATIONAL-LINEAGE-AND-PROJECTION-EVALUATION.md`;
5. the required Sprint 3.82, Sprint 3.79, Sprint 3.76, and Roadmap artefacts, whose presence was confirmed.

The governed-conversation implementation files and repository-wide live-symbol consumers were inspected before any implementation edit.

## Sprint 3.85 Decisions

The binding decisions are unambiguous and were not reopened:

```text
Run Identity Decision: Option B
Session Identity Decision: Option B
Interface Contract Identity Decision: Option B
Execution Record Decision: Record Option 1
```

The required corrected shape would make `threadId`, `requestId`, `exchangeId`, `projectionId`, and governed input identity mandatory conversational lineage, while `runId`, `sessionId`, and `interfaceContractId` would be optional, verified genuine EOS context.

## Blocking Specification Conflict

Implementation stopped because the Sprint 3.86 requirements cannot all be satisfied simultaneously without violating Sprint 3.85.

The protected historical test `lib/governed-conversation/lineage-projection-evaluation.test.ts` is required to remain byte/content unchanged, compile, and pass. Its third test constructs `GovernedConversationalInput` with all three explicitly fabricated EOS values:

```text
runId: "evaluation-run-not-conversational-lineage"
sessionId: "evaluation-session-not-conversational-lineage"
interfaceContractId: "evaluation-contract/1"
```

It supplies no EOS verifier and asserts that model invocation succeeds. In addition, `projectionCompatibleInputFields` in the other frozen file deliberately returns a `Pick<GovernedInputConstruction, ...>` that excludes `threadId`, `requestId`, and `exchangeId`. Therefore the unchanged call cannot meet the newly mandatory conversational-lineage construction type.

Sprint 3.85 and Sprint 3.86 Sections 5–9 require the opposite runtime behavior: every supplied EOS reference must be independently verified as a genuine existing publication, unverifiable references must fail closed, and mandatory conversational lineage must always be present. Accepting the unchanged test's fabricated values, silently dropping them, treating syntax as verification, or exempting that caller would each directly violate the binding correction contract. Weakening the construction type to keep that call compiling would likewise make mandatory conversational identity optional.

No lawful implementation can both:

1. leave that entire frozen test unchanged and passing; and
2. reject its fabricated EOS references while requiring its absent conversational lineage.

The specification expressly says not to work around such a conflict and to return **Correction Implementation Incomplete** if a frozen Sprint 3.84 file would need modification to make the corrected architecture pass. Accordingly, no core implementation or test fixture was changed.

## Exhaustive Consumer and Historical Reference Result

Live consumers requiring later migration were found in `types.ts`, `execution-record.ts`, `execution-record.test.ts`, `model-invocation.ts`, fixtures, and parallel evaluation. The retired symbols remain live because an atomic truthful migration cannot be completed under the frozen-test contradiction.

The historical four-row finding remains intact:

1. `runId`;
2. `sessionId`;
3. `interfaceContractId`;
4. `GovernedExecutionRecordPayload` / `ConversationalExecutionRecord`.

Neither frozen file was modified. The companion single `toEqual` assertion over all four conflicts remains unchanged.

## Files Changed or Explicitly Reviewed

| File | Reason |
| --- | --- |
| `docs/SPRINT-3.86-GOVERNED-CONVERSATIONAL-IDENTITY-CORRECTION-IMPLEMENTATION.md` | records the blocking evidence and incomplete correction result |
| `lib/governed-conversation/lineage-projection-evaluation.ts` | found during exhaustive search, deliberately left unchanged |
| `lib/governed-conversation/lineage-projection-evaluation.test.ts` | found during exhaustive search, deliberately left unchanged |

## Protected Files and Isolation

No production conversational file, production component, model-provider wiring, EOS runtime file, selector, or route was changed. The four individually protected files and the EOS runtime aggregate remain byte-identical to their starting state. No `/api/chat` or production integration occurred.

## Validation

Full validation was not run after discovering the pre-implementation semantic blocker because no corrected implementation exists to validate. Reporting the existing suite as Sprint 3.86 validation would be misleading. The repository-precondition, symbol-search, frozen-file inspection, and protected-hash recording commands completed successfully.

## Outstanding Findings

The Sprint 3.86 specification must be formally reopened to resolve the frozen-test conflict. A minimal truthful resolution would permit migration of only the third test case in `lineage-projection-evaluation.test.ts` while preserving the historical `FIELD_COMPATIBILITY` table and its four-row assertion byte-for-byte at the assertion level. Alternatively, the obsolete pipeline test could be moved into a new Sprint 3.86 composition test and removed from the frozen historical test. Either choice requires explicit authorization because the current specification protects the entire file.

## Production Effect

Sprint 3.86 changes no live conversational behavior and performs no production integration.

## Next Step

Formally clarify the frozen historical test boundary, then rerun Sprint 3.86 as an isolated correction implementation. The corrected architecture is not yet ready for a future production integration sprint.

**Correction Implementation Incomplete**
