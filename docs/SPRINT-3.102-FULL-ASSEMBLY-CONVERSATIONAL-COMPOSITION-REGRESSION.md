# Sprint 3.102 — Full-Assembly Conversational Composition Regression

## Repository precondition

- Repository: `/workspace/jarvis`; branch: `work`; starting commit: `34908c4277eef75706b5eece9473e0731297304d`.
- The starting working tree was clean.
- Sprints 3.89–3.101 and precedents 3.78, 3.84, and 3.93 were present and reviewed. The eight required fixture files were present and reviewed.
- The current entry points are `evaluateClaimBoundary`, `evaluateGovernedConversationalConflicts`, `assembleGovernedSourceEvidence`, `composeGovernedConversationalProjection`, `computeEvidenceStatus`, `constructGovernedConversationalInput`, `invokeGovernedConversationModel`, and `validateResponseEnvelope`.
- No pre-existing full-assembly scenario matrix was found.

### Protected starting hashes

| File | SHA-256 |
| --- | --- |
| `app/api/chat/route.ts` | `503840ffa6c17f52a049c1aaaad4e8402c000904dd3b7ce868104a10c6ba08a3` |
| `lib/context-builder.ts` | `8e689bf0880375ef2539c37cac8f8891669e66f4eb6ca72602fe97137438894d` |
| `lib/useAgentConversation.ts` | `55274931370b78e0ea6cf0fd144b4fba88400be0f9a14361682428846eea9c97` |
| `lib/agents/chat-execution.ts` | `da387b401acd4cc87609112e7b110451254af16bb33d8dd5224c4fb9aa210a88` |
| `source-evidence-assembly.ts` | `01eacdbabdded56745820d0e09ca1ed1ed332ae4061ee09f4cbef2fa765fa8b7` |
| Gmail, Calendar, Memory, Connector acquisition adapters | `00f60c…055`, `4631cf…ee0`, `09eda3…84a`, `f6f7f7…8db` |
| Gmail, Calendar, Memory, Connector publishers | `8ccaaf…190`, `5a7ad2…f70`, `8579ea…176`, `107842…345` |
| Claim and conflict engines | `9ab35f…27a`, `5b6229…27d` |
| Projection, evidence status, input, invocation, validator | `d66c9d…355`, `c83ada…039`, `15cc16…102`, `beebd3…4f5`, `1bd969…9ef` |

The test contains the complete, unabridged digest register and verifies every digest with pure Node.

## Governing artefacts reviewed

The Engineering Constitution, North Star/roadmap materials, Engineering Specification Standard, Constitutional Publication Principles, Sprints 3.89, 3.90, 3.91, 3.92, 3.93, 3.94, 3.95, 3.96, 3.97, 3.98, 3.99, 3.100, and 3.101 were reviewed. Historical evaluation precedents 3.78, 3.84, and 3.93 were retained unchanged.

## Fixture reuse register

| Scenario | Reused evidence |
| --- | --- |
| Cassie compound/contact conflict | Cassie text/entity and conflict observation pattern from `claim-boundary-conflict-boundary-composition-evaluation-fixtures.ts`; Sprint 3.101 acquisition shape |
| Single claim/no conflict | Existing contact-only and normalized-address observation pattern |
| Legacy Memory unattested | Sprint 3.101 realistic unattested `MemoryStore` priority |
| Connector local fallback | Sprint 3.101 disconnected local connector result |
| Gmail conflict + unsupported | Gmail acquisition record plus existing compound Cassie/importance and contradiction patterns |
| Three non-success states | Existing conflict-engine ruleset-unavailable/unsupported/failure semantics |
| Partial source failure | Sprint 3.101 injected connector failure shape |
| Replay | The same contact conflict inputs, fixed clock and fixed mock output |

New data is limited to scenario-local stable discriminators and the missing Gmail contact header/value needed to join real Gmail publication evidence to the already governed Cassie conflict condition. It does not create a competing semantic fixture.

## Runtime chain confirmed

The evaluator calls, in order: `assembleGovernedSourceEvidence` (therefore the four real acquisition adapters and publishers), `evaluateClaimBoundary`, `evaluateGovernedConversationalConflicts`, `constructGovernedConflictSummary`, `composeGovernedConversationalProjection`, `constructGovernedConversationalInput` (which performs real aggregate evidence-status computation), `invokeGovernedConversationModel`, and the unchanged validator reached by invocation. The deterministic adapter implements only the injected model port. No core semantics are duplicated.

## Scenario matrix

| Scenario | Assembly | Claims | Conflicts | Projection | Model/Validator | Overall |
| --- | --- | --- | --- | --- | --- | --- |
| Cassie compound/contact conflict | Passed | Passed | Passed | Passed | Passed | Passed |
| Single claim/no conflict | Passed | **Failed** | Passed | Passed | Passed | **Failed** |
| Legacy Memory unattested | Passed | Passed | Passed | Passed | Passed | Passed |
| Connector local fallback | Passed | Passed | Passed | Passed | Passed | Passed |
| Gmail conflict + unsupported | Passed | Passed | Passed | Passed | Passed | Passed |
| Evaluation unavailable | Passed | Passed | Passed | Passed | Passed | Passed |
| Evaluation unsupported | Passed | Passed | Passed | Passed | Passed | Passed |
| Evaluation failed | Passed | Passed | Passed | Passed | Passed | Passed |
| Partial source failure | Passed | Passed | Passed | Passed | Passed | Passed |
| Deterministic replay | Passed | Passed | Passed | Passed | Passed | Passed |

### Finding register

| Scenario | Seam | Status | Evidence | Required next step |
| --- | --- | --- | --- | --- |
| Single claim/no conflict | Source assembly → claim boundary | semantic-incompatibility | The real claim boundary always publishes a recognised contact lookup as `insufficient_coverage`; its input has no assembled-evidence channel, so sufficient assembled Gmail evidence cannot produce the required canonical `available` status. | Govern an evidence-to-claim enrichment/correlation contract in a later correction sprint. Do not add a test adapter or alter the engine here. |

This is a core semantic finding. It was recorded and not corrected. Other scenarios deliberately assert existing canonical claim statuses rather than laundering assembled source sufficiency into claim availability.

## Evaluation-state matrix

| Outcome | Conflict evaluation | Projection | Governed input/model constraint |
| --- | --- | --- | --- |
| `evaluated_no_conflict` | Preserved | Preserved with a zero-conflict set | Restricted canonical claim status preserved |
| `evaluated_conflict_found` | Preserved | Preserved with conflict-set identity | Conflict restriction and cautious output preserved |
| `partially_evaluated` | Preserved | Preserved with compound claim set | Unsupported importance remains independent |
| `evaluation_unavailable` | Preserved | Preserved without fabricated conflict set | Confident factual output is not introduced |
| `evaluation_unsupported` | Preserved | Preserved without fabricated conflict set | Unsupported evaluation remains distinguishable |
| `evaluation_failed` | Preserved | Preserved without fabricated conflict set | Safe constrained model path remains available |

The matrix test proves these are six distinct runtime values. Empty conflict records do not equate the three non-success states with `evaluated_no_conflict`.

## Identity trace

Every result records `threadId`, `requestId`, `exchangeId`, `projectionId`, claim ruleset/evaluation/set IDs, conflict ruleset/evaluation/set IDs where permitted, response-envelope ID, and execution-record ID. Scenario-prefixed conversational IDs remain distinct; publication IDs are constructor-derived. Non-success evaluations have no conflict-set ID. Replay compares the entire identity record and status record from two independent runs and finds them byte-for-byte structurally equal. Tests also verify claim and conflict IDs cannot be substituted through composer mutations.

## Mutation sensitivity

- Baseline: a real single-contact claim publication, conflict evaluation, canonical conflict set, and projection compose successfully.
- Mutation one: only the copied projection claim summary's `claimId` is changed. Detection stage: composer. Exact rejection: `claim summaries do not match governed claim set`.
- Mutation two: only the copied canonical conflict summary's `sourceOwnerIds` is changed after conflict publication. Detection stage: composer. Exact rejection: `conflict summary does not match canonical conflict set`.
- Both checks invoke the composer and inspect thrown runtime errors; scenario metadata is not involved.

## Isolation result

- Post-run SHA-256 hashes equal every starting hash in the complete test register.
- Pure `node:fs`, `node:path`, and `node:crypto` traversal finds no production import of the evaluator.
- The evaluator source contains no route, component, context-builder, hook, or chat-execution import.
- Acquisition uses injected deterministic ports; model invocation uses an injected deterministic adapter. No live Gmail, Calendar, OAuth, model, Memory write, or production state is used.

## Files changed

- `lib/governed-conversation/full-assembly-claim-boundary-conflict-boundary-composition-regression.ts` — isolated runtime scenario registry and evaluator.
- `lib/governed-conversation/full-assembly-claim-boundary-conflict-boundary-composition-regression.test.ts` — scenario, outcome, replay, validator, mutation, and pure-Node isolation evidence.
- `docs/SPRINT-3.102-FULL-ASSEMBLY-CONVERSATIONAL-COMPOSITION-REGRESSION.md` — completion evidence and blocking finding.

No historical fixture or core module changed.

## Validation results

The targeted full-assembly suite, source assembly, claim boundary, conflict boundary, corrected claims/conflicts composition, projection composer, governed input, model invocation, and validator suites were run. The targeted suites and typecheck passed. Repository-wide `npm test` initially exposed historical isolation allow-list assumptions; renaming the evaluation-local files removed that incompatibility. After removing `node_modules` and performing a fresh `npm install`, `npm test` passed all 155 test files with 743 tests passed and one pre-existing skip, `npm run typecheck` passed, `npm run lint` passed with no warnings or errors, and `npm run build` completed through route generation; its non-blocking Google Fonts optimization warning did not prevent a successful build. The earlier inconclusive result did not reproduce in the fresh environment, so this report retains that history while recording the conclusive validation evidence.

## Production effect

Sprint 3.102 adds isolated regression evidence only. It does not alter production behavior, source acquisition, source publication, claims, conflicts, projection composition, model invocation, validation, `/api/chat`, `context-builder.ts`, or `useAgentConversation.ts`.

## Outstanding findings

- **Source assembly:** Compatible and source-independent.
- **Claims:** Blocking semantic incompatibility between assembled sufficient evidence and the claim boundary's permanently insufficient contact publication.
- **Conflicts:** All six outcomes preserved.
- **Projection:** Compatible for contract-valid publications; mutation-sensitive.
- **Evidence status:** Closed and monotonic, but no governed assembly-to-claim enrichment seam exists.
- **Model invocation:** Deterministic injected path and safe fallback preserved.
- **Validation:** Unchanged boundary rejects/contains prohibited output shapes.
- **Identity:** Preserved without aliasing or fabricated conflict-set IDs.
- **Replay:** Deterministic.
- **Isolation:** Protected bytes and import boundaries preserved.

## Recommended next step

A governance sprint should define whether and how assembled governed source evidence may enrich canonical claims before conflict evaluation. Production integration readiness must not be recommended until that semantic incompatibility is resolved and independently re-evaluated.

**Evaluation Complete**
