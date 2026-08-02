# Sprint 3.94 — Governed Claims and Conflicts Composition Correction Contract

**Status:** Complete specification
**Sprint Type:** Governance Decision / Architectural Correction Contract
**Implementation Authority:** None
**Production Integration:** Prohibited
**Governing Trigger:** Sprint 3.93 — Claims and Conflicts Composition Evaluation
**Starting Commit:** `9e0f358fedd4a7d6424f6fc0cfa980f00c58a6b6`
**Branch:** `work`

## 1. Recommendation

**Decision:** Approve this binding correction architecture. Every mandatory architectural question has one answer. This approval establishes meaning only; it authorizes no implementation or production integration.

## 2. Repository Precondition

The intended repository is `/workspace/jarvis` on branch `work`. Sprint 3.93 exists, was read completely, and ends with `Evaluation Complete`. The current source still exhibits every central incompatibility that triggers this contract. The repository precondition is satisfied.

## 3. Starting Commit

The starting commit is:

```text
9e0f358fedd4a7d6424f6fc0cfa980f00c58a6b6
```

## 4. Working-Tree State

The working tree was clean at the start of Sprint 3.94. No pre-existing tracked or untracked changes were present.

## 5. Governing Artefacts Reviewed

The following artefacts were read completely and applied in descending authority:

1. `docs/ENGINEERING_CONSTITUTION.md`;
2. `docs/architecture/NORTH_STAR.md`;
3. `docs/architecture/JARVIS-Engineering-Specification-Standard.md`;
4. `docs/CONSTITUTIONAL-PUBLICATION-PRINCIPLES.md`;
5. `docs/architecture/ROADMAP.md`;
6. Sprint 3.89 — Claims Boundary Contract;
7. Sprint 3.90 — Conflicts Boundary Contract;
8. Sprint 3.85 — Identity Correction Contract;
9. Sprint 3.91 — Claims implementation evidence;
10. Sprint 3.92 — Conflicts implementation evidence; and
11. Sprint 3.93 — Composition evaluation evidence.

The current definitions, constructors, conflict-engine guard, projection composer, evidence-status boundary, and model-invocation boundary were also inspected. Sprint 3.93 supplies evidence; this contract supplies the binding corrective architecture.

## 6. Sprint 3.93 Findings Reconfirmed

| Finding | Reconfirmed current state | Classification |
| --- | --- | --- |
| Compound claim set | `conflict-boundary-engine.ts` rejects every set whose length is not one or whose sole claim is not `contact_address_lookup` | Semantic incompatibility |
| Conflict shape | `CanonicalGovernedConflict` contains governed fields that cannot enter the five-field `GovernedConflictInput` without loss | Semantic incompatibility |
| Claim publication lineage | The composer accepts claim values, not claim ruleset/evaluation/set identities | Semantic incompatibility |
| Conflict publication lineage | The composer accepts conflict values, not conflict ruleset/evaluation/set identities | Semantic incompatibility |
| Evaluation state | The projection has no representation of the six outcomes or never-run state | Semantic incompatibility |
| Exchange lineage | `ConflictEvaluation` lineage is optional and `GovernedConflictSet` omits direct conversational lineage | Bounded correction required |
| Effective post-conflict status | No downstream canonical owner aggregates published conflict restrictions | Semantic incompatibility |
| Claim classification ruleset | Sprint 3.89 already requires reference to the selected Claim Boundary Ruleset | Governed meaning already exists |
| Projection-to-input identity | Sprint 3.85/3.86 resolved the incompatibility | Compatible and closed |

The current source therefore remains the architecture Sprint 3.93 evaluated. This contract is not governing stale evidence.

## 7. Constitutional Principles Applied

The correction applies these binding principles:

* **Identity Integrity:** one immutable identity identifies one immutable canonical publication.
* **Projection Principle:** the projection validates, selects, summarizes, and transforms only for its bounded responsibility; it does not acquire source-publication responsibility.
* **Single Responsibility:** the claims engine classifies claims, the conflict engine evaluates conflicts, and the composer validates and aggregates supplied publications.
* **Non-Reconstruction:** bounded summaries preserve canonical references and never masquerade as reconstructed canonical publications.
* **Immediate-Upstream Dependency:** composition preserves the governed publication chain and does not bypass it for earlier state.

## 8. Compound Claim-Set Options

### Option A — Claim-local eligibility within the authoritative set

The Conflict Engine receives the complete `GovernedClaimSet`, evaluates eligible claim/class cells, and records `claim_type_outside_ruleset` for ineligible cells. This preserves the authoritative set, claim-set-wide evaluation, mixed eligibility, and publication identity.

### Option B — Pre-filter into a conflict-specific subset

This option moves eligibility outside the Conflict Engine, breaks the ruleset owner's responsibility, and introduces an ambiguous non-authoritative or separately identified subset.

### Option C — One Conflict Evaluation per claim

This option replaces Sprint 3.90's single claim-set-wide evaluation with claim-local evaluations and requires ungoverned aggregation semantics.

### Option D — Reject the whole set on any ineligible claim

This option suppresses eligible evaluation and defeats Sprint 3.90's explicit partial cell-evaluation model.

## 9. Compound Claim-Set Conflict Evaluation Decision

**Decision: Option A.**

The Conflict Engine shall consume the complete authoritative `GovernedClaimSet`. It shall neither filter, split, republish, nor replace that set. It shall evaluate each applicable `claimId × executable conflict class` cell admitted by the selected `ConflictEvaluationRuleset`.

An ineligible claim shall receive the existing explicit reason `claim_type_outside_ruleset`; it shall not invalidate an eligible claim. The overall outcome shall be derived under Sprint 3.90's existing six-state rules.

For `contact_address_lookup` plus `message_importance`, the contact-address contradiction cell is evaluated and the importance contradiction cell is explicitly unevaluated. The original set, both claims, and its identity remain intact.

## 10. Explicit Ruling on Current Whole-Set Rejection

**Decision:** The current `claims.length !== 1` or non-contact sole-claim rejection is architecturally incorrect. It is a Sprint 3.92 isolated-implementation defect, not an authorized consequence of Sprint 3.90. The future correction shall remove it.

## 11. Canonical Conflict Projection Options

### Option A — Copy the complete canonical conflict into the projection

This duplicates canonical content, blurs ownership, and risks a second representation claiming authority over the same conflict.

### Option B — Canonical reference plus bounded projection summary

The projection preserves canonical conflict, evaluation, and set identities and carries only the fields required by its downstream responsibility. The summary references the canonical `conflictId` and is not an authoritative conflict publication.

### Option C — Separate conflict-adapter publication

This adds an immutable publication without a distinct constitutional responsibility and risks two authoritative representations of one event.

### Option D — Retain the five-field input

This loses conflict class, publication lineage, evaluation state, and other governed meaning.

## 12. Canonical Conflict Projection Decision

**Decision: Option B.**

`GovernedConflictSet` remains the exclusive owner of canonical governed conflicts. The corrected projection shall carry canonical identity references and a bounded summary required for projection, model, and validation responsibilities. The bounded summary shall include `conflictId`, `conflictClass`, `affectedClaimIds`, `sourceOwnerIds`, `statusRestriction`, and `descriptionReference`, plus only fields justified by the correction sprint's responsibility audit.

`conflictId` remains a reference to the canonical identity. The projection shall generate no second conflict identity. Canonical `sourceOwnerIds` meaning shall not be renamed into a semantically distinct owner concept. A construction helper shall construct only the projection summary and shall publish no adapter object.

## 13. Identity Integrity Analysis

There shall be one canonical conflict and one canonical `conflictId`. The projection has its own `projectionId`, but its conflict summaries refer to upstream canonical conflicts. It shall not create `canonical conflict A` and `projection conflict B` as competing authoritative representations.

The same rule applies to the Claim Boundary Ruleset, Claim Boundary Evaluation, Governed Claim Set, Conflict Evaluation Ruleset, Conflict Evaluation, and Governed Conflict Set. Their identities survive as references; none becomes a projection-owned identity.

## 14. Claim Publication Lineage Decision

**Decision:** When a governed claim set exists, the corrected projection shall preserve canonical references to:

```text
claimBoundaryRulesetId
claimBoundaryEvaluationId
governedClaimSetId
```

The projection shall retain bounded claim summaries for downstream responsibility. The claims remain canonical members of the referenced `GovernedClaimSet`; the projection does not own or republish that set.

## 15. Claim Classification Ruleset Identity Decision

**Decision:** Existing Sprint 3.89 meaning controls. For claims produced by the Claim Boundary Engine, `claimClassificationRulesetId` shall reference the canonical `claimBoundaryRulesetId` selected for their classification.

This reference does not alias identity domains and does not create another ruleset identity.

## 16. Conflict Publication Lineage Decision

**Decision:** Whenever conflict evaluation has run, the corrected projection shall preserve:

```text
conflictEvaluationRulesetId
conflictEvaluationId
```

It shall also preserve `governedConflictSetId` when the evaluation outcome permits a conflict set. The projection shall preserve and validate the evaluated `governedClaimSetId` relationship. All are canonical references, not projection-owned identities.

## 17. Exchange Lineage Decision

**Decision:** A conversational `ConflictEvaluation` produced from a governed conversational claim set shall structurally require `threadId`, `requestId`, and `exchangeId`. `GovernedConflictSet` shall preserve canonical linkage to its `ConflictEvaluation` and `GovernedClaimSet`, thereby proving the same exchange.

The conflict set shall derive exchange coherence through canonical upstream relationships, not independently synthesized lineage. Projection composition shall fail closed unless claim and conflict publication lineage proves one coherent exchange.

## 18. Evaluation-State Options

### Option A — Conflict/no-conflict boolean

Rejected because it collapses partial, unavailable, unsupported, failed, and fully evaluated meanings.

### Option B — All six closed outcomes

The projection references the canonical evaluation and carries its exact outcome without copying the full evaluation.

### Option C — Evaluation identity only

Rejected because bounded downstream fail-closed handling would require every consumer to resolve the full publication.

### Option D — Conflict-set identity only

Rejected because unavailable, unsupported, and failed outcomes have no conflict set.

## 19. Projection Conflict Evaluation-State Decision

**Decision: Option B.**

The corrected projection shall preserve `conflictEvaluationId`, `conflictEvaluationRulesetId`, and the exact `conflictEvaluationOutcome` for every supplied evaluation. Its closed vocabulary is:

```text
evaluated_no_conflict
evaluated_conflict_found
partially_evaluated
evaluation_unavailable
evaluation_unsupported
evaluation_failed
```

It shall preserve `governedConflictSetId` exactly when the outcome permits a conflict set. It shall never infer evaluation state from `conflicts.length`.

## 20. Six-State Preservation Rationale

Each state changes the truthful meaning of an apparent absence of conflict summaries:

* `evaluated_no_conflict`: complete admitted evaluation proved no conflict;
* `evaluated_conflict_found`: complete admitted evaluation found at least one conflict;
* `partially_evaluated`: some scope was evaluated and some was not;
* `evaluation_unavailable`: required governed evaluation material was unavailable;
* `evaluation_unsupported`: the ruleset does not govern the requested scope; and
* `evaluation_failed`: evaluation or publication failed, leaving no authoritative result.

These distinctions constrain safe downstream reasoning and therefore belong in the bounded projection. Cell details, normalization operations, original values, comparison records, and explanation bodies remain owned upstream and are resolvable through canonical references.

## 21. No-Conflict Representation

**Decision:** The projection shall represent no conflict only by referencing a real `ConflictEvaluation` whose outcome is `evaluated_no_conflict` and its linked zero-conflict `GovernedConflictSet`. An empty bounded summary alone proves nothing.

## 22. Never-Run Representation

**Decision:** `conflict evaluation not applicable / not required` is structurally distinct from all six evaluation outcomes. For every nonempty `GovernedClaimSet`, Sprint 3.90 requires evaluation; missing `ConflictEvaluation` is therefore invalid composition, not a seventh outcome. The composer shall fail closed.

## 23. Post-Conflict Status Options

### Option A — Conflict Engine mutates or reissues claims

Rejected because the engine consumes claims and has no authority to create, classify, merge, or redefine them.

### Option B — Composer derives a bounded effective status

The composer deterministically aggregates immutable claim status and already-published conflict restrictions without evaluating conflicts.

### Option C — New post-conflict claim-evaluation publication

Rejected because deterministic aggregation does not establish a distinct publication responsibility warranting another immutable publication.

### Option D — Model applies restrictions

Rejected because status authority is deterministic and pre-model.

## 24. Post-Conflict Effective Status Decision

**Decision: Option B.**

The projection composer shall deterministically aggregate canonical pre-conflict claim status and canonical published conflict restrictions into projection-owned `effectiveClaimStatus`, or an exactly equivalent bounded status summary.

The canonical claim retains its pre-conflict status. The canonical conflict retains its restriction. The composer shall not discover, compare, classify, select, mutate, or adjudicate. It validates and aggregates supplied immutable publications and preserves their status effects.

## 25. Restrict-Don't-Adjudicate Preservation

**Decision:** Restrict-don't-adjudicate remains binding. A contradiction shall retain `selectedSourceOwnerId` as absent. The projection shall apply the published restriction to its effective summary and shall never select a factual winner.

## 26. Composer Option A Review

**Decision:** Sprint 3.90 Composer Option A remains binding and is not reopened. The composer validates, aggregates, and preserves supplied conflict publications; it never derives conflicts.

Compound eligibility remains with the Conflict Engine. Canonical conflict publication remains with the Conflict Engine and `GovernedConflictSet`. Lineage, evaluation outcome, summaries, and published restrictions are preserved or aggregated by the projection. None of these corrections transfers conflict derivation.

## 27. Sprint 3.89 Reopening Review

**Decision:** Sprint 3.89 is not reopened. Claims-Boundary Architecture Option C, compound semantics, claim unit and vocabulary, classification ownership, materiality, source/coverage ownership, unsupported importance, clarification, segmentation, and canonical Claim Boundary publications remain binding.

This contract enforces Sprint 3.89's established compound-set semantics.

## 28. Sprint 3.90 Reopening Review

**Decision:** Sprint 3.90 is not reopened. Conversational Conflict Architecture Option B, strict linkage, identity chain, source ownership, Composer Option A, evaluation ownership, EOS Reuse Option C, cross-domain boundaries, six outcomes, and no-conflict proof remain binding.

This correction realizes Decision 9's claim-set-wide cells, Decision 4's publication/status preservation, Decision 2's identity chain, and Decisions 9–10's state architecture.

## 29. Explicit Prior-Governance Conclusion

**Decision:** No binding Sprint 3.89 or Sprint 3.90 governance decision requires reopening or amendment. Sprint 3.93 demonstrated composition defects in the isolated implementations and current projection, not unsoundness in the governing contracts.

## 30. Corrected Canonical Composition Model

```text
Operator input
    ↓
ClaimBoundaryRuleset
    ↓
ClaimBoundaryEvaluation
    ↓
GovernedClaimSet (complete authoritative set)
    ↓
ConflictEvaluationRuleset
    ↓
ConflictEvaluation
    ├── applicable claim × class cells evaluated
    ├── ineligible cells explicitly unevaluated
    └── exact six-state outcome
    ↓
GovernedConflictSet (when outcome permits one)
    ↓
Canonical Governed Conflicts
    ↓
GovernedConversationalProjection
    ├── canonical Claim Boundary references
    ├── canonical Conflict Evaluation references
    ├── bounded claim and conflict summaries
    ├── exact conflict-evaluation outcome
    ├── published restriction aggregation
    └── one distinct projection identity
    ↓
Governed conversational input/model pipeline
```

No intermediate step creates another authoritative claim set or conflict set.

## 31. Corrected Identity Chain

```text
claimBoundaryRulesetId
        ↓
claimBoundaryEvaluationId
        ↓
governedClaimSetId
        ↓
claimId(s)
        ↓
conflictEvaluationRulesetId
        ↓
conflictEvaluationId
        ↓
governedConflictSetId (when applicable)
        ↓
conflictId(s)
        ↓
projectionId
```

`threadId`, `requestId`, and `exchangeId` provide conversational lineage alongside this publication chain. No identity substitutes for another, and no bounded summary receives an upstream publication's authority.

## 32. Projection Publication Responsibility Audit

| Audit question | Binding answer |
| --- | --- |
| Has projection purpose changed? | No |
| Has it acquired claim classification? | No |
| Has it acquired conflict derivation? | No |
| Has it acquired source adjudication? | No |
| Does it reference rather than reconstruct canonical publications? | Yes |
| Does one canonical conflict retain one identity? | Yes |
| Are all six outcomes preserved without full evaluation duplication? | Yes |
| Does it aggregate only published status effects? | Yes |

The projection's sole responsibility remains publishing bounded, validated, immutable conversational evidence and governance state required by downstream governed processing for one exchange. Any future implementation that changes an answer in this audit is blocked.

## 33. No-Implementation-Authority Statement

**Decision:** Sprint 3.94 authorizes no code changes and no production integration. It does not authorize changes to claim, conflict, projection, evidence-status, model-invocation, `/api/chat`, or any other production module. A separately authorized isolated correction sprint is mandatory.

## 34. Future Correction-Implementation Scope

Sprint 3.95 is limited to:

* removing whole-set single-claim rejection;
* evaluating eligible claims within the unchanged authoritative set;
* emitting explicit cells for ineligible claims and deriving existing six-state outcomes;
* making conversational conflict lineage structural;
* preserving canonical claim and conflict publication references and evaluation state;
* constructing bounded summaries with canonical conflict identity;
* validating set, claim, conflict, and exchange coherence;
* aggregating published restrictions into projection-owned effective status; and
* setting `claimClassificationRulesetId` to reference the selected `claimBoundaryRulesetId`.

This scope excludes `/api/chat` integration, connector wiring, model authority changes, and taxonomy extension.

## 35. Required Future Correction Tests

Sprint 3.95 shall prove:

1. **Compound Cassie:** `What's Cassie's email? Anything important?` creates one real compound set that enters the real Conflict Engine unchanged; contact address is evaluated and importance is explicitly ineligible.
2. **Publication lineage:** every applicable claim ruleset/evaluation/set and conflict ruleset/evaluation/set identity survives, and identity mutation fails coherence validation.
3. **Six states:** each closed outcome has a distinct projection representation, and evaluated no-conflict differs from missing evaluation.
4. **Identity Integrity:** projection conflict summaries retain the canonical `conflictId` and generate no second conflict identity.
5. **Restrict-don't-adjudicate:** contradiction preserves absent `selectedSourceOwnerId`; effective restriction is aggregated without winner selection.
6. **Isolation:** protected production modules remain byte-identical and no production import path is introduced.

After implementation, a separate composition evaluation shall rerun the real Cassie chain. Isolated tests alone do not authorize integration.

## 36. Deferred Taxonomy Statement

**Decision:** `policy_incompatibility` and `temporal_commitment_incompatibility` remain admitted by Sprint 3.90's closed taxonomy and remain deferred. Sprint 3.94 neither implements nor redesigns them. The corrected architecture shall carry them after separately authorized activation; no runtime extension mechanism is authorized.

## 37. Prohibited Hedge Language Compliance

**Decision:** Every mandatory question in this contract has an unequivocal binding answer. State-dependent use of “when” expresses deterministic schema conditions only. Implementation receives no discretion to select among architectural alternatives.

## 38. Protected-File and Hash Proof

The pre-sprint SHA-256 baseline is:

| Protected/core file | SHA-256 |
| --- | --- |
| `app/api/chat/route.ts` | `503840ffa6c17f52a049c1aaaad4e8402c000904dd3b7ce868104a10c6ba08a3` |
| `lib/context-builder.ts` | `8e689bf0880375ef2539c37cac8f8891669e66f4eb6ca72602fe97137438894d` |
| `lib/useAgentConversation.ts` | `55274931370b78e0ea6cf0fd144b4fba88400be0f9a14361682428846eea9c97` |
| `lib/agents/chat-execution.ts` | `da387b401acd4cc87609112e7b110451254af16bb33d8dd5224c4fb9aa210a88` |
| `claim-boundary-types.ts` | `cd5446f7f6bedb567be4b1bc7195c96f94b6b23bec82864102a090db49d6436a` |
| `claim-boundary-ruleset.ts` | `afe7fce7814b2d02da8e6ebecfbff2c721abf418bdfd426cf689340d898a8e83` |
| `claim-boundary-engine.ts` | `9ab35f47190e803468003a9accd34e0cc613e9438c8077a882d0b108d22f827a` |
| `claim-boundary-publications.ts` | `ccd7caa39316eb2fce1c7c8c8eda3741d0182eb12a123de9f7860e8225aa7c95` |
| `conflict-boundary-types.ts` | `4d9bfa49fa1469c1d3150fe7fc9c721e64f9d80d05cca983533e2d9f0e53b4c4` |
| `conflict-boundary-ruleset.ts` | `bc89fb06e3c867fc14538cbd0690bef9ac65b88751573883b81ed934809ce91e` |
| `conflict-boundary-engine.ts` | `b1740dd5d2e978314cecea02fa1f7f44ab19f2a2e164c0d5d8df8037d885de74` |
| `conflict-boundary-publications.ts` | `9a370046f0b4c3b5c1caae74cdccfc12b6eb006a08db2287d573b5c21690e100` |
| `projection-composer.ts` | `b3fd03097cf8c4ff88fe3a07679566a72cd1e8aaa8bf0bf2cb4ea9948064dc76` |
| `evidence-status.ts` | `c83ada16f09a7f5e04b4c82d937c05115ef432c9e50a860ad0b30250b3a3039e` |
| `model-invocation.ts` | `beebd3cfb14c220c2249879661e225d3b2330cb766515c6bcac5338d2f814f5b` |

Post-drafting comparison confirmed every listed file remains byte-identical. No protected or core implementation file changed.

## 39. Files Changed

The only changed file is:

```text
docs/SPRINT-3.94-GOVERNED-CLAIMS-AND-CONFLICTS-COMPOSITION-CORRECTION-CONTRACT.md
```

No implementation file changed.

## 40. Full Validation

The standard repository validation commands and final results are recorded here after execution:

* `npm test` — passed: 143 test files; 704 tests passed and 1 skipped (705 total).
* `npm run build` — passed: optimized production build, type/lint validation, six static pages, and traces completed; Google Fonts optimization was skipped after a stylesheet download failure without failing the build.
* `npm run lint` — passed with no warnings or errors.
* `npm run typecheck` — passed.
* `git diff --check` — passed.

## 41. Outstanding Governance Questions

**Decision:** None. Every mandatory architectural question is closed. Future implementation retains only mechanical choices that preserve this contract and pass its responsibility audit.

## 42. Recommended Next Sprint

**Decision:** The next authorized step is **Sprint 3.95 — Isolated Governed Claims and Conflicts Composition Correction Implementation**. It shall implement only Section 34, run Section 35 proofs, preserve production isolation, and perform no `/api/chat` integration.

After Sprint 3.95, a separate composition re-evaluation shall rerun the real end-to-end Cassie chain. Production integration shall be considered only under later, separate authorization.

## 43. Final Recommendation Gate

All completion criteria are satisfied: the set remains whole; eligibility is claim-local; canonical identity and lineage survive; all six outcomes survive; no-conflict differs from no evaluation; effective status has one deterministic non-evaluating owner; restrict-don't-adjudicate and Composer Option A remain binding; prior governance remains closed; implementation is not authorized; validation passes; and only this contract changes.

**Correction Contract Complete**
