# Sprint 3.95 — Claims and Conflicts Composition Correction Implementation

**Status:** Correction implementation complete
**Sprint Type:** Isolated architectural correction implementation
**Production Integration:** Prohibited

## Repository Precondition

* Repository: `/workspace/jarvis`.
* Branch: `work`.
* Starting commit: `80b18330f7bece06eb03c614a33e9351293f0976`.
* Starting working tree: clean.
* All Section 4 governing artefacts existed. The complete Sprint 3.94, Sprint 3.93, Sprint 3.86, specified implementation modules, composition-evaluation modules/tests, and all symbol consumers were inspected before editing.
* The exact whole-set rejection and five-field `GovernedConflictInput` were reconfirmed. The expected-change list was recorded before editing.

## Governing Artefacts Reviewed

The Engineering Constitution, North Star, JARVIS Engineering Specification Standard, Constitutional Publication Principles, Roadmap, Sprints 3.94, 3.93, 3.92, 3.91, 3.90, 3.89, and 3.86 were reviewed and applied. Sprint 3.93 remained historical evidence; only its live fixture/test integration was migrated, while its frozen finding vocabulary and pre-correction findings remain unchanged.

## Sprint 3.94 Decisions Implemented

```text
Compound Claim-Set Conflict Evaluation Decision: Option A
Canonical Conflict Projection Decision: Option B
Projection Conflict Evaluation-State Decision: Option B
Post-Conflict Effective Status Decision: Option B
Composer Option A remains binding
```

No Sprint 3.89 or Sprint 3.90 decision was reopened.

## Starting Defects Reconfirmed

The engine contained `if (input.claimSet.claims.length !== 1 || input.claimSet.claims[0].claimType !== "contact_address_lookup")`, the projection accepted a five-field conflict with `sourceOwners`, claim/conflict publication lineage was absent, all evaluation states collapsed into `conflicts`, and no projection-owned effective-status aggregator existed.

## Compound Claim-Set Correction

The whole-set guard was removed. The engine now iterates the authoritative claim set, scopes observations by `affectedClaimId`, evaluates every eligible contact-address cell, records `claim_type_outside_ruleset` for every ineligible cell, and uses the single exported `deriveConflictEvaluationOutcome` aggregator. A mixture of evaluated and unevaluated cells is always `partially_evaluated`, even when an evaluated cell matches. Evaluation and conflict-set publications preserve the original claim-set identity; no subset is constructed.

## Cassie Central Proof

Operator input: **What's Cassie's email? Anything important?**

The real Claim Boundary Engine published two ordered claims: contact address (`governed-claim:7c276ab86cf27e8d495404de0a870c658730553dbc88eb744ea0b882d63d5605`) and unsupported importance (`governed-claim:950fda67747a0912be5f975cbb7efadc00c8fb3dac485efabd2536b5676670de`). The contact cell evaluated to `match`; importance was unevaluated with `claim_type_outside_ruleset`; one canonical contradiction was published; overall outcome was `partially_evaluated`; the original `governedClaimSetId`, claim order, and both claim IDs remained unchanged.

## Conflict Lineage Correction

Conversational `ConflictEvaluation` now structurally requires `threadId`, `requestId`, `exchangeId`, and `governedClaimSetId`, all derived from the consumed set. Constructors require those fields. `GovernedConflictSet` requires canonical evaluation/ruleset/claim-set links and represents complete or partial coverage. Projection validation rejects mismatched exchange lineage, evaluation-to-set links, set-to-claim links, and unknown affected claims.

## Projection Claim Lineage

The input accepts the canonical `ClaimBoundaryEvaluation` and `GovernedClaimSet`; output retains `claimBoundaryRulesetId`, `claimBoundaryEvaluationId`, and `governedClaimSetId`. The composer verifies ruleset identity, evaluation/set linkage, exchange lineage, and exact claim-summary membership.

## Projection Conflict Lineage

The input accepts canonical `ConflictEvaluation` and conditionally `GovernedConflictSet`; output retains `conflictEvaluationRulesetId`, `conflictEvaluationId`, exact `conflictEvaluationOutcome`, and conditionally `governedConflictSetId`. Evaluated/no-conflict, conflict-found, and partial outcomes require a set; unavailable, unsupported, and failed outcomes prohibit one.

## Nine-Identifier Proof

| Identifier | Actual central value | Source |
|---|---|---|
| `claimBoundaryRulesetId` | `claim-boundary-ruleset:0d327b4ed3b53f439e53606ff833266f281e31f5498cab0a83babbb8ee5aece3` | Claim Boundary Ruleset |
| `claimBoundaryEvaluationId` | `claim-boundary-evaluation:ed62bb00f59c7b9285dc0ccc5c6eedfad1f80c71bef2978c5b8256e430a57754` | Claim Boundary Evaluation |
| `governedClaimSetId` | `governed-claim-set:edb5370c9d3bbcb5e45efe926c308232dd38e09c53968e86d313ca2e36f9e58c` | Governed Claim Set |
| `conflictEvaluationRulesetId` | `conflict-evaluation-ruleset:daeba1245e51a71b2bf733493681ef66f9b9246880949d33162b5cfcda5dbae6` | Conflict Evaluation Ruleset |
| `conflictEvaluationId` | `conflict-evaluation:ff5a95f3f0b50a0dd490bd1e846a8088217315d51eb683bef3c64df671422d1a` | Conflict Evaluation |
| `governedConflictSetId` | `governed-conflict-set:13a699bef1d79c3e0814a7c34de62253beb7e4f19007b33dfc8008cdf4c584be` | Governed Conflict Set |
| `threadId` | `thread:3.95:cassie` | Governed Claim Set / evaluation |
| `requestId` | `request:3.95:cassie` | Governed Claim Set / evaluation |
| `exchangeId` | `exchange:3.95:cassie` | Governed Claim Set / evaluation |

## Bounded Conflict Summary and Identity Integrity

`constructGovernedConflictSummary` copies only canonical `conflictId`, `conflictClass`, `sourceOwnerIds`, `affectedClaimIds`, `statusRestriction`, and `descriptionReference`. The central conflict remains `governed-conflict:52fe87fa99996d23bb0fc323962bd04922ad276f82120bc7fc1a030016412431`; no second identity is created. Every summary is compared with the canonical conflict in the referenced set and any mutation fails.

## Six Evaluation Outcomes

The canonical closed `ConflictEvaluationOutcome` type is reused by projection. Engine/publication tests exercise `evaluated_no_conflict`, `evaluated_conflict_found`, `partially_evaluated`, `evaluation_unavailable`, `evaluation_unsupported`, and `evaluation_failed`, and projection preserves the exact supplied value. Permitted outcomes require a linked set; prohibited outcomes reject one.

## No-Conflict vs Never-Evaluated

A real `evaluated_no_conflict` evaluation requires and references a real zero-conflict set. A nonempty governed claim set with no conflict evaluation throws `nonempty claim set requires conflict evaluation`; it cannot serialize as empty conflicts or any of the six states.

## Effective Claim Status

`computeEffectiveClaimStatus` is the single pure aggregation point. No restriction preserves status; available plus insufficient coverage becomes insufficient coverage; unavailable and unsupported canonical statuses remain unchanged; a conflict never upgrades a claim. The projection publishes `canonicalStatus`, `effectiveStatus`, and sorted `appliedConflictIds` without mutating the canonical claim. The unsupported/unavailable dual-cause pair is rejected as ambiguous rather than assigned invented precedence; it does not occur in the currently executable canonical conflict vocabulary.

## Restrict-Don't-Adjudicate

`selectedSourceOwnerId` remains absent from the canonical conflict and projection. Both source-owner IDs and the canonical conflict identity remain traceable. No winner, winning value, preferred source, or resolved value is produced.

## Composer Option A

The composer accepts published claim/conflict material, validates it, constructs the bounded summary, and aggregates published restrictions. It does not inspect raw values, run conflict rules, assign conflict identities/classes/restrictions, or publish evaluations/sets. The Conflict Engine remains the sole conflict derivation owner.

## Sprint 3.93 Re-Proof

| Seam | Pre-correction | Corrected proof |
|---|---|---|
| Claim Set → Conflict Engine | semantic-incompatibility | compatible |
| Claim identity → Conflict linkage | compatible | remains compatible |
| Claim lineage → Conflict lineage | bounded-adapter-needed | compatible |
| Claim publication IDs → conflict chain | semantic-incompatibility | compatible |
| Claim Set → projection | semantic-incompatibility | compatible canonical references |
| Conflict → projection | semantic-incompatibility | compatible bounded canonical-reference summary |
| Conflict Set → projection lineage | semantic-incompatibility | compatible |
| Claim classification ruleset | unresolved | compatible under Sprint 3.89 reference rule |
| Conflict ruleset representation | semantic-incompatibility | compatible |
| Evaluation-state preservation | semantic-incompatibility | compatible |
| Claims/conflicts → effective status | semantic-incompatibility | compatible |
| Projection → Governed Input | compatible | remains compatible |

No former semantic incompatibility remains in the authorized corrected scope.

## Mutation Sensitivity

Tests independently reject changed claim ruleset identity, exchange identity, conflict-evaluation/set links, affected claim, conflict class, restriction, source-owner set, and absent evaluation. Canonical summary mutation and never-evaluated mutation both fail closed.

## Historical Evaluation Preservation

`docs/SPRINT-3.93-CLAIMS-AND-CONFLICTS-COMPOSITION-EVALUATION.md` was deliberately left unchanged as truthful pre-correction evidence. Its evaluation module retains frozen finding strings/tables; only its live projection fixture was migrated to supply truthful publication inputs. Its live tests now recognize corrected runtime behavior without rewriting recorded historical findings. Historical isolation baselines continue protecting files not expressly authorized by Sprint 3.95.

## Exhaustive Consumer Search

Live consumers were found in projection composer tests, lineage fixtures/orchestrator tests, lineage evaluation fixtures/tests, in-memory lineage repository types, and Sprint 3.93 evaluation code/tests. Fixtures now construct truthful claim/evaluation/set chains; direct `sourceOwners` consumers use canonical `sourceOwnerIds`; repository/orchestrator consumers required no semantic change. Historical string literals remain unchanged.

## Files Changed

* Conflict engine/types/publications and tests: per-cell evaluation, mandatory lineage, partial coverage, and regression proofs.
* Projection composer and tests: canonical publication references, bounded summaries, exact outcome, coherence checks, and effective statuses.
* Claim/conflict/lineage fixtures and live historical tests: truthful publication-shape migration.
* Isolation tests: preserve historical baselines while exempting the files expressly authorized by Sprint 3.95; add new pure-Node correction proof.
* `governed-publication-test-fixtures.ts`: truthful synthetic publication chains for existing isolated projection tests.
* `claims-conflicts-correction-composition.test.ts`: central Cassie, identity, mutation, status, and non-adjudication proof.
* This document: completion report.

## Protected Files

| File | Starting blob hash | Ending blob hash |
|---|---|---|
| `app/api/chat/route.ts` | `c10eb65234c37c8696cb7d2d285ef90e6efcf3e3` | `c10eb65234c37c8696cb7d2d285ef90e6efcf3e3` |
| `lib/context-builder.ts` | `8d22c39fc473e9267f1157f0c55fa2a6c85d578d` | `8d22c39fc473e9267f1157f0c55fa2a6c85d578d` |
| `lib/useAgentConversation.ts` | `ceec0b3690d33bfc456563f1c75083a2e61af80c` | `ceec0b3690d33bfc456563f1c75083a2e61af80c` |
| `lib/agents/chat-execution.ts` | `091b37128f8525d2056c2f6e340e777bc55a3d3c` | `091b37128f8525d2056c2f6e340e777bc55a3d3c` |

## Targeted Tests

* `npm test -- --run lib/governed-conversation/conflict-boundary-engine.test.ts lib/governed-conversation/conflict-boundary-publications.test.ts lib/governed-conversation/projection-composer.test.ts lib/governed-conversation/claims-conflicts-correction-composition.test.ts` — passed.
* `npm test -- --run lib/governed-conversation/claim-boundary-isolation.test.ts lib/governed-conversation/conflict-boundary-isolation.test.ts lib/governed-conversation/claim-boundary-conflict-boundary-composition-evaluation-isolation.test.ts lib/governed-conversation/lineage-projection-evaluation.test.ts lib/governed-conversation/claims-conflicts-correction-isolation.test.ts` — passed.

## Full Validation

* `npm test` — passed: 145 files; 710 tests passed and 1 skipped (711 total).
* `npm run build` — passed.
* `npm run lint` — passed with no warnings or errors.
* `npm run typecheck` — passed.
* `git diff --check` — passed.

## Production Effect

Sprint 3.95 changes no live conversational behavior and performs no production integration.

No production readiness, promotion readiness, selector readiness, or operator verification is claimed.

## Outstanding Findings

No blocking incompatibility remains in the authorized isolated scope. The projection-owned bounded summary is the one authorized non-publication adapter. Distinct simultaneous `unavailable` and `unsupported` restrictions are deliberately fail-closed because current governance does not order those causes; the executable conflict class emits only `insufficient_coverage`, so this is not a live canonical-status/conflict-restriction combination and no precedence was invented.

## Next Step

**Claims and Conflicts Composition Re-evaluation** is the next permitted sprint. It must remain separate from production integration.

**Correction Implementation Complete**
