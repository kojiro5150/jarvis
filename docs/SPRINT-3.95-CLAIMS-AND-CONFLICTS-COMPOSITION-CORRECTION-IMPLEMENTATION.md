# Sprint 3.95 — Claims and Conflicts Composition Correction Implementation

**Status:** Specification
**Sprint Type:** Isolated Architectural Correction Implementation
**Governing Authority:** Sprint 3.94 — Governed Claims and Conflicts Composition Correction Contract
**Production Integration:** Prohibited
**Output Path:** `docs/SPRINT-3.95-CLAIMS-AND-CONFLICTS-COMPOSITION-CORRECTION-IMPLEMENTATION.md`

---

## 1. Purpose

Sprint 3.95 implements the binding correction architecture established by Sprint 3.94.

Sprint 3.93 proved that the independently correct Sprint 3.91 claims implementation and Sprint 3.92 conflicts implementation did not compose:

1. the Conflict Engine rejected the real compound Cassie `GovernedClaimSet`;
2. the canonical fifteen-field governed conflict could not truthfully satisfy the projection composer's five-field `GovernedConflictInput`;
3. claim/conflict publication lineage and the six-state conflict-evaluation vocabulary disappeared at the projection boundary;
4. no deterministic projection-owned point applied published conflict restrictions to an effective downstream claim status.

Sprint 3.94 resolved those findings through four binding decisions:

* the Conflict Engine consumes the complete authoritative `GovernedClaimSet` and evaluates each eligible `claimId × conflictClass` cell independently;
* the current whole-set rejection is architecturally incorrect and must be removed;
* projection uses a canonical-reference-plus-bounded-summary model, not a complete copied conflict publication and not a second authoritative conflict identity;
* full claim/conflict publication lineage and all six conflict-evaluation outcomes survive into the projection;
* the projection composer owns exactly one deterministic effective-status aggregation point while continuing to validate and aggregate rather than derive conflicts.

Sprint 3.95 executes those decisions in isolated code.

The central implementation objective is:

> **Correct the claims/conflicts composition boundary so the real compound Cassie claim set is evaluated without filtering or republishing, canonical conflict and evaluation publications remain traceable through projection, all six evaluation states remain structurally distinct, and published conflict restrictions produce a deterministic projection-owned effective claim status without source adjudication.**

This sprint does not integrate the corrected architecture into `/api/chat`.

---

## 2. Sprint Character

This is an isolated correction-implementation sprint.

It is authorised to modify existing governed-conversation core files where Sprint 3.94 requires correction.

It may:

* modify `conflict-boundary-engine.ts`;
* modify conflict-boundary publication/type files where lineage or cell evaluation must be corrected;
* modify `projection-composer.ts`;
* introduce bounded projection-summary and lineage structures;
* introduce deterministic effective-status aggregation;
* migrate affected isolated fixtures and tests;
* add a new correction-composition re-proof harness;
* preserve completed historical evaluation findings;
* add pure-Node protected-file checks.

It shall not:

* modify `/api/chat`;
* modify production chat execution;
* implement production source acquisition;
* implement either deferred conflict class;
* change claim-boundary recognition semantics;
* derive conflicts in the projection composer;
* choose a winning source;
* modify model authority;
* promote any runtime;
* claim operator verification.

---

## 3. Governing Hierarchy

Apply the repository's established hierarchy:

1. JARVIS Engineering Constitution
2. JARVIS North Star
3. JARVIS Engineering Specification Standard
4. Constitutional Publication Principles
5. `docs/architecture/ROADMAP.md`
6. Sprint 3.94 — Governed Claims and Conflicts Composition Correction Contract
7. Sprint 3.90 — Governed Conversational Conflicts Boundary Contract
8. Sprint 3.89 — Governed Conversational Claims Boundary Contract
9. Sprint 3.93 — Claims and Conflicts Composition Evaluation
10. Sprint 3.92 — Isolated Governed Conflicts Boundary Implementation
11. Sprint 3.91 — Isolated Governed Claims Boundary Implementation
12. Sprint 3.86 — Governed Conversational Identity Correction Implementation, as correction-discipline precedent
13. Sprint 3.83 — Isolated Conversational Lineage and Projection Implementation
14. Sprint 3.77/3.79 — governed evidence/model pipeline
15. current repository implementation
16. this Sprint specification

Sprint 3.94 is binding.

This sprint shall not reopen or reinterpret its decisions.

---

## 4. Repository Precondition

Before changing code:

1. Confirm the intended repository and branch.
2. Record the starting commit.
3. Confirm the starting working-tree state.
4. Confirm the following artefacts exist:

```text
docs/SPRINT-3.94-GOVERNED-CLAIMS-AND-CONFLICTS-COMPOSITION-CORRECTION-CONTRACT.md
docs/SPRINT-3.93-CLAIMS-AND-CONFLICTS-COMPOSITION-EVALUATION.md
docs/SPRINT-3.92-ISOLATED-GOVERNED-CONFLICTS-BOUNDARY-IMPLEMENTATION.md
docs/SPRINT-3.91-ISOLATED-GOVERNED-CLAIMS-BOUNDARY-IMPLEMENTATION.md
docs/SPRINT-3.90-GOVERNED-CONVERSATIONAL-CONFLICTS-BOUNDARY-CONTRACT.md
docs/SPRINT-3.89-GOVERNED-CONVERSATIONAL-CLAIMS-BOUNDARY-CONTRACT.md
docs/SPRINT-3.86-GOVERNED-CONVERSATIONAL-IDENTITY-CORRECTION-IMPLEMENTATION.md
docs/CONSTITUTIONAL-PUBLICATION-PRINCIPLES.md
docs/architecture/ROADMAP.md
```

5. Read Sprint 3.94 completely before changing code.
6. Confirm directly that it records:

```text
Compound Claim-Set Conflict Evaluation Decision: Option A
Canonical Conflict Projection Decision: Option B
Projection Conflict Evaluation-State Decision: Option B
Post-Conflict Effective Status Decision: Option B
Composer Option A remains binding
No Sprint 3.89 or Sprint 3.90 decision is reopened
```

7. Read Sprint 3.93 completely.
8. Read Sprint 3.86 completely as the correction-implementation precedent.
9. Inspect in full:

```text
lib/governed-conversation/conflict-boundary-engine.ts
lib/governed-conversation/conflict-boundary-types.ts
lib/governed-conversation/conflict-boundary-publications.ts
lib/governed-conversation/conflict-boundary-ruleset.ts
lib/governed-conversation/conflict-boundary-fixtures.ts

lib/governed-conversation/claim-boundary-types.ts
lib/governed-conversation/claim-boundary-engine.ts
lib/governed-conversation/claim-boundary-publications.ts
lib/governed-conversation/claim-boundary-fixtures.ts

lib/governed-conversation/projection-composer.ts
lib/governed-conversation/types.ts
lib/governed-conversation/evidence-status.ts
lib/governed-conversation/input.ts
lib/governed-conversation/model-request.ts
lib/governed-conversation/model-invocation.ts
lib/governed-conversation/validator.ts
```

10. Inspect all existing claims/conflicts composition-evaluation modules and tests.
11. Locate every consumer of:

```text
GovernedConflictInput
GovernedConversationalProjectionInput
GovernedConversationalProjection
ConflictEvaluation
GovernedConflictSet
CanonicalGovernedConflict
```

12. Confirm the current exact whole-set rejection exists in `conflict-boundary-engine.ts`.
13. Confirm the current five-field `GovernedConflictInput` exists in `projection-composer.ts`.
14. Record pre-sprint blob hashes for the four protected production files:

```text
app/api/chat/route.ts
lib/context-builder.ts
lib/useAgentConversation.ts
lib/agents/chat-execution.ts
```

15. Record pre-sprint hashes for:

* all Sprint 3.91 core modules;
* all Sprint 3.92 core modules;
* `projection-composer.ts`;
* evidence/model/lineage core modules not authorised for semantic change;
* the completed Sprint 3.93 evaluation module and tests.

16. Run a repository-wide search for all fields and symbols affected by the correction.
17. Produce an expected-change list before editing.

If the current source no longer matches Sprint 3.94's binding assumptions, stop and report.

If implementation requires reopening a Sprint 3.94 decision, stop.

If implementation requires changing `/api/chat` or production acquisition, stop.

Return:

> **Correction Implementation Incomplete**

---

## 5. Binding Decisions to Implement

Sprint 3.95 shall implement exactly:

### Decision 1 — Whole claim set remains authoritative

The Conflict Engine receives and preserves the complete `GovernedClaimSet`.

### Decision 2 — Claim-local eligibility

Each:

```text
claimId × requested executable conflictClass
```

cell is evaluated independently.

### Decision 3 — Ineligibility is explicit

An ineligible claim receives:

```text
claim_type_outside_ruleset
```

for its cell.

It does not invalidate another claim.

### Decision 4 — Canonical reference plus bounded summary

The projection references canonical conflict/evaluation/set publications and carries only the bounded conflict summary required by downstream projection responsibility.

### Decision 5 — All six states survive

The projection preserves:

```text
evaluated_no_conflict
evaluated_conflict_found
partially_evaluated
evaluation_unavailable
evaluation_unsupported
evaluation_failed
```

### Decision 6 — Full lineage survives

The projection preserves:

```text
claimBoundaryRulesetId
claimBoundaryEvaluationId
governedClaimSetId
conflictEvaluationRulesetId
conflictEvaluationId
governedConflictSetId
threadId
requestId
exchangeId
```

where structurally applicable.

### Decision 7 — One effective-status aggregation point

The projection composer aggregates canonical claim status and canonical published restrictions into a projection-owned effective status.

### Decision 8 — Restrict, do not adjudicate

No corrected layer selects a source owner or factual winner.

---

# Part I — Compound Claim-Set Correction

## 6. Remove the Whole-Set Rejection

Modify:

```text
lib/governed-conversation/conflict-boundary-engine.ts
```

Remove the current logic equivalent to:

```ts
if (
  input.claimSet.claims.length !== 1 ||
  input.claimSet.claims[0].claimType !== "contact_address_lookup"
) {
  return unevaluated(
    input,
    "evaluation_unsupported",
    "claim_type_outside_ruleset",
    requested,
    input.claimSet.claimIds[0],
  );
}
```

Do not replace it with another whole-set guard.

Do not pre-filter the claim set before the engine receives it.

Do not publish a replacement claim set.

---

## 7. Per-Cell Evaluation Model

The Conflict Engine shall iterate over the complete authoritative claim set.

For the current Sprint 3.92 Part 1 ruleset:

```text
requested class:
source_value_contradiction

eligible claim type:
contact_address_lookup
```

For every claim, create one deterministic cell result for the requested class.

### Eligible claim

For:

```text
claimType = contact_address_lookup
```

the engine shall run the existing real source-value contradiction evaluation.

### Ineligible claim

For any other claim type, including:

```text
message_importance
```

the engine shall create an explicit unevaluated cell carrying:

```text
reason = claim_type_outside_ruleset
```

It shall not:

* mark the claim as evaluated;
* create a conflict;
* drop the claim;
* reject the set;
* alter the claim;
* create another claim-set identity.

---

## 8. Cell Evaluation Structure

Inspect the existing `ConflictEvaluation.cellEvaluations` and `unevaluatedReasons` structures.

Modify them only as needed to truthfully represent the Sprint 3.90/Sprint 3.94 cell model.

Each claim/class cell must be deterministically classifiable as one of:

```text
evaluated match
evaluated no_match
unevaluated conflict_class_unsupported
unevaluated required_source_unavailable
unevaluated insufficient_source_coverage
unevaluated ruleset_unavailable
unevaluated evaluator_failure
unevaluated claim_type_outside_ruleset
unevaluated evaluation_deferred
```

Do not invent an open-ended reason vocabulary.

---

## 9. Overall Outcome Derivation

Implement one deterministic aggregation function for overall conflict-evaluation outcome.

It must derive exactly one of:

```text
evaluated_no_conflict
evaluated_conflict_found
partially_evaluated
evaluation_unavailable
evaluation_unsupported
evaluation_failed
```

The implementation shall follow Sprint 3.90's existing definitions.

At minimum:

### `evaluated_no_conflict`

Use only when every applicable cell was evaluated and no conflict matched.

### `evaluated_conflict_found`

Use only when every applicable cell was evaluated and at least one conflict matched.

### `partially_evaluated`

Use where:

* at least one applicable cell was evaluated; and
* at least one cell remained unevaluated.

This includes the corrected compound Cassie case where:

```text
contact_address_lookup
→ evaluated

message_importance
→ claim_type_outside_ruleset
```

If a real source-value conflict is found for the contact claim, the overall result remains:

```text
partially_evaluated
```

because the complete compound set was not fully evaluated.

The conflict set may contain the conflict found in the evaluated cell.

### `evaluation_unavailable`

Use only where no applicable cell was evaluated because required governed material was unavailable.

### `evaluation_unsupported`

Use only where no applicable cell was evaluated because all claims/classes were outside the executable ruleset.

### `evaluation_failed`

Use where no authoritative result can be published due to validation, evaluator, persistence, or identity failure.

---

## 10. Source Observation Scoping

The corrected engine shall evaluate source observations only against the claim IDs they reference.

For each eligible claim:

* select observations whose `affectedClaimId` matches that claim;
* validate source admissibility;
* evaluate coverage;
* perform canonical value comparison;
* publish conflicts linked to that exact claim.

Observations for one claim shall not:

* satisfy another claim;
* cause another claim's cell to fail;
* widen another claim's evidence scope.

A malformed observation referencing an unknown claim remains fail-closed.

---

## 11. Preserve the Original Claim-Set Identity

The resulting `ConflictEvaluation` and `GovernedConflictSet` shall reference the exact:

```text
governedClaimSetId
```

from the Sprint 3.91 publication.

Required proof:

* same claim-set ID before evaluation;
* same claim-set ID in `ConflictEvaluation`;
* same claim-set ID in `GovernedConflictSet`;
* both original claims remain present in the canonical claim set;
* no filtered-set or subset identity exists.

---

# Part II — Conflict Lineage Correction

## 12. Required Conversational Lineage

Modify conflict-boundary types and constructors so a conversational `ConflictEvaluation` produced from a governed conversational claim set structurally requires:

```text
threadId
requestId
exchangeId
```

These fields shall not remain optional for this path.

They must be derived from the authoritative `GovernedClaimSet`.

Do not accept independently supplied conflicting lineage where the claim set already owns it.

---

## 13. Governed Conflict-Set Lineage

`GovernedConflictSet` shall preserve canonical links to:

```text
conflictEvaluationId
conflictEvaluationRulesetId
governedClaimSetId
```

and sufficient lineage to prove same-exchange composition.

Preferred implementation:

* preserve canonical publication references;
* derive exchange coherence through the claim set and evaluation;
* avoid independently duplicated exchange fields unless Sprint 3.94 requires them directly.

If direct fields are retained or added for bounded validation, they must exactly match the canonical upstream publications and participate in identity construction.

No lineage field may be filled with a convenient placeholder.

---

## 14. Lineage Coherence Validation

Add deterministic validation proving:

```text
ClaimBoundaryEvaluation
GovernedClaimSet
ConflictEvaluation
GovernedConflictSet
projection
```

all belong to one:

```text
threadId
requestId
exchangeId
```

The projection composer shall fail closed when:

* claim-set lineage and conflict-evaluation lineage differ;
* the conflict set references another evaluation;
* the evaluation references another claim set;
* any affected claim is absent from the referenced claim set.

---

# Part III — Corrected Projection Input

## 15. Governed Claim Publication References

Extend `GovernedConversationalProjectionInput` and `GovernedConversationalProjection` to preserve:

```text
claimBoundaryRulesetId
claimBoundaryEvaluationId
governedClaimSetId
```

when governed claims are supplied.

These are canonical upstream references.

They are not projection-owned identities.

The corrected composer shall validate:

* `claimClassificationRulesetId === claimBoundaryRulesetId` for Claim Boundary Engine claims;
* the claim evaluation references the claim ruleset;
* the claim set references the same evaluation and ruleset;
* supplied claim summaries belong to the referenced claim set.

Do not generate a second claim-set identity.

---

## 16. Conflict Evaluation Publication References

Extend the projection input/output to preserve:

```text
conflictEvaluationRulesetId
conflictEvaluationId
conflictEvaluationOutcome
governedConflictSetId?
```

Rules:

* `conflictEvaluationId` and ruleset ID are required whenever conflict evaluation ran;
* `governedConflictSetId` is required only for outcomes that permit a set;
* `governedConflictSetId` must be absent for outcomes that do not permit a set;
* the referenced evaluation must belong to the supplied `governedClaimSetId`;
* the supplied conflict summaries must belong to the referenced conflict set.

---

## 17. Exact Six-State Type

Use the existing canonical conflict-evaluation outcome type where possible.

Do not create a second string vocabulary in the projection package.

If a bounded projection alias is required, it shall be a direct type reuse or closed exact union matching:

```text
evaluated_no_conflict
evaluated_conflict_found
partially_evaluated
evaluation_unavailable
evaluation_unsupported
evaluation_failed
```

No seventh evaluation outcome is permitted.

---

## 18. Never-Evaluated Representation

For a nonempty `GovernedClaimSet`, missing conflict evaluation is invalid.

The projection composer shall reject:

```text
claims.length > 0
```

with absent:

```text
conflictEvaluationId
conflictEvaluationRulesetId
conflictEvaluationOutcome
```

Do not represent "never evaluated" as:

* an empty conflict list;
* `evaluation_unsupported`;
* `evaluation_unavailable`;
* `evaluated_no_conflict`.

For a valid empty `GovernedClaimSet`, conflict evaluation may be not applicable according to existing governance.

That non-applicable case is not one of the six evaluation outcomes.

It shall be represented through the structural absence permitted only when the canonical claim-set rules prove there are no governed factual claims.

---

## 19. Conflict-Set Presence Rules

Enforce:

### Conflict set required

```text
evaluated_no_conflict
evaluated_conflict_found
partially_evaluated
```

must carry:

```text
governedConflictSetId
```

and the corresponding canonical conflict set.

### Conflict set prohibited

```text
evaluation_unavailable
evaluation_unsupported
evaluation_failed
```

must not claim a canonical `GovernedConflictSet`.

The composer shall reject mismatched combinations.

---

# Part IV — Bounded Conflict Summary

## 20. Implement Option B Precisely

Sprint 3.94 selected:

> canonical reference plus bounded projection summary.

The projection shall not copy the complete fifteen-field canonical conflict.

It shall not create another conflict publication.

It shall carry a summary that references the canonical:

```text
conflictId
```

and contains only the fields required for projection/model/validation responsibility.

---

## 21. Corrected `GovernedConflictInput`

Modify:

```text
lib/governed-conversation/projection-composer.ts
```

or extract an adjacent projection-summary type if that materially improves responsibility clarity.

The bounded summary shall contain at minimum:

```ts
interface GovernedConflictInput {
  readonly conflictId: string;
  readonly conflictClass:
    | "source_value_contradiction"
    | "policy_incompatibility"
    | "temporal_commitment_incompatibility";
  readonly sourceOwnerIds: readonly string[];
  readonly affectedClaimIds: readonly string[];
  readonly statusRestriction:
    | "insufficient_coverage"
    | "unavailable"
    | "unsupported";
  readonly descriptionReference: string;
}
```

The exact location may be:

* an expanded `GovernedConflictInput`; or
* a renamed adjacent bounded-summary type used by the projection.

The implementation must follow Sprint 3.94's meaning:

* it is a bounded summary;
* its `conflictId` references the canonical conflict;
* it has no independent publication identity;
* it does not become canonical conflict authority.

Do not retain both:

```text
sourceOwners
sourceOwnerIds
```

with ambiguous meanings.

Use canonical source-owner semantics consistently.

---

## 22. Bounded Summary Construction

Add a deterministic helper that constructs a projection summary from a canonical conflict.

The helper may copy only the authorised bounded fields.

It shall:

* retain the canonical `conflictId`;
* retain conflict class;
* retain affected claim IDs;
* retain source owner IDs;
* retain status restriction;
* retain deterministic description reference.

It shall not:

* generate a new conflict ID;
* select a source owner;
* include or mutate full canonical source values;
* publish a new immutable conflict publication;
* change the conflict class;
* change status restriction;
* drop affected claims.

The helper is part of projection composition.

It is not a separate publication layer.

---

## 23. Canonical Reference Validation

The composer shall validate that every bounded summary corresponds to a canonical conflict in the referenced `GovernedConflictSet`.

At minimum verify:

* same `conflictId`;
* same `conflictClass`;
* same affected claim IDs;
* same source owner IDs;
* same restriction;
* same description reference.

A summary with changed or missing governed meaning must fail composition.

Do not permit caller-authored summaries without canonical conflict input or a canonical conflict-set verification boundary.

---

# Part V — Effective Claim Status

## 24. Single Aggregation Function

Implement one pure deterministic function in the projection-composition layer, for example:

```text
computeEffectiveClaimStatus
```

Its inputs shall be limited to:

* canonical claim status;
* applicable canonical conflict restrictions.

Its output shall be the projection-owned effective status.

It shall not inspect:

* raw source values;
* source ranking;
* model output;
* compatibility context;
* legacy heuristics;
* EOS conflicts.

---

## 25. Restriction Ordering

Define one closed deterministic restriction order consistent with existing evidence statuses.

The implementation shall inspect current status semantics and establish a monotonic restriction rule.

A safe expected ordering is:

```text
available
    ↓
insufficient_coverage
    ↓
unavailable / unsupported
```

However, `unavailable` and `unsupported` represent different causes and shall not be arbitrarily ordered unless the governing contracts already define precedence.

The aggregation must therefore use an explicit closed matrix rather than an undocumented numeric ranking.

At minimum:

* no conflict restriction → preserve canonical claim status;
* `insufficient_coverage` may restrict `available` to `insufficient_coverage`;
* no restriction may upgrade a claim;
* an unsupported canonical claim remains unsupported;
* an unavailable canonical claim remains unavailable unless an already-governed rule explicitly requires another equally restrictive status;
* multiple restrictions resolve through one deterministic table.

If current governance does not define an unambiguous combination for a pair, stop rather than inventing one.

---

## 26. Projection Claim Summary

The projection must expose the effective status without mutating the canonical `GovernedClaimInput`.

Preferred architecture:

* retain canonical claim summaries/references;
* add an adjacent projection-owned claim-status summary keyed by `claimId`.

For example:

```ts
interface GovernedEffectiveClaimStatus {
  readonly claimId: string;
  readonly canonicalStatus: ConversationalEvidenceStatus;
  readonly effectiveStatus: ConversationalEvidenceStatus;
  readonly appliedConflictIds: readonly string[];
}
```

The exact name may vary.

Do not rewrite the canonical claim object in place.

Do not create a second authoritative claim publication.

The effective summary belongs only to the projection.

---

## 27. Restrict-Don't-Adjudicate

The aggregation function shall never produce:

```text
selectedSourceOwnerId
selectedSourcePublicationId
winningValue
resolvedConflictValue
```

The canonical conflict's absent selected source must remain absent.

The projection may say:

```text
effective status = insufficient_coverage
```

It may not say:

```text
source A is correct
```

unless a separately governed source-precedence publication exists.

No such precedence is authorised in Sprint 3.95.

---

# Part VI — Six Evaluation-State Projection Tests

## 28. `evaluated_no_conflict`

Construct a real conflict evaluation and linked zero-conflict set.

The final projection must contain:

```text
conflictEvaluationOutcome = evaluated_no_conflict
governedConflictSetId = real zero-conflict set ID
conflicts = []
```

The test must prove this differs structurally from never evaluated.

---

## 29. `evaluated_conflict_found`

Construct a real fully evaluated single-eligible-claim scenario with a contradiction.

The projection must contain:

```text
conflictEvaluationOutcome = evaluated_conflict_found
governedConflictSetId = real non-empty set ID
conflicts.length > 0
```

---

## 30. `partially_evaluated`

Use the real compound Cassie set.

Required:

```text
contact_address_lookup
→ evaluated conflict/no-conflict cell

message_importance
→ claim_type_outside_ruleset
```

The projection must contain:

```text
conflictEvaluationOutcome = partially_evaluated
governedConflictSetId = real set ID
```

If the contact claim has contradictory values, the conflict summary must be present.

---

## 31. `evaluation_unavailable`

Construct a real unavailable evaluation.

The projection must contain:

```text
conflictEvaluationOutcome = evaluation_unavailable
governedConflictSetId = absent
conflicts = []
```

It must not imply no conflict.

---

## 32. `evaluation_unsupported`

Construct a real evaluation in which no applicable cell can be evaluated because the selected rule does not support the claims/classes.

The projection must contain:

```text
conflictEvaluationOutcome = evaluation_unsupported
governedConflictSetId = absent
conflicts = []
```

---

## 33. `evaluation_failed`

Construct a real failed evaluation publication where permitted by current architecture, or a deterministic failure fixture using the real constructor.

The projection must contain:

```text
conflictEvaluationOutcome = evaluation_failed
governedConflictSetId = absent
conflicts = []
```

The composer must not transform failure into a no-conflict result.

---

## 34. Never-Evaluated Negative Test

Attempt projection construction with:

* a nonempty real governed claim set;
* no conflict evaluation publication;
* no conflict evaluation outcome.

Required:

```text
projection composition fails closed
```

This test is the central proof that no-conflict and never-evaluated remain distinct.

---

# Part VII — Full Nine-Identifier Lineage Proof

## 35. Required Identifiers

Construct one real claim/conflict chain and prove the final projection carries or truthfully references:

```text
claimBoundaryRulesetId
claimBoundaryEvaluationId
governedClaimSetId
conflictEvaluationRulesetId
conflictEvaluationId
governedConflictSetId
threadId
requestId
exchangeId
```

Every value must be:

* non-empty;
* sourced from the actual upstream publication;
* unchanged;
* traceable;
* distinct where identity domains differ.

No identifier may be recreated from display text.

No identifier may be copied into another field with different meaning.

---

## 36. Identity Mutation Tests

Mutate each of the following independently and prove composition fails:

```text
claimBoundaryRulesetId
claimBoundaryEvaluationId
governedClaimSetId
conflictEvaluationRulesetId
conflictEvaluationId
governedConflictSetId
threadId
requestId
exchangeId
```

Where a field is legitimately absent for an evaluation state, mutation tests apply only to structurally present identifiers.

The tests shall prove the projection verifies the publication chain rather than merely serialising arbitrary IDs.

---

# Part VIII — Central Cassie Correction Proof

## 37. Exact Operator Input

Use:

> **What's Cassie's email? Anything important?**

Run through the real Sprint 3.91 engine.

Required real claim set:

```text
contact_address_lookup
message_importance
```

Do not hand-assemble the claim set.

---

## 38. Real Conflict Evaluation

Supply two real admissible contradictory source observations for the actual generated contact claim.

Run the complete real claim set through the corrected Conflict Engine.

Required cell results:

```text
contact_address_lookup × source_value_contradiction
→ evaluated
→ conflict match

message_importance × source_value_contradiction
→ unevaluated
→ claim_type_outside_ruleset
```

Required overall result:

```text
partially_evaluated
```

Required conflict-set result:

```text
real GovernedConflictSet
one real CanonicalGovernedConflict
```

Required original-set proof:

```text
same governedClaimSetId
same two claim IDs
same claim order
no filtered claim set
no subset publication
```

---

## 39. Real Projection Composition

Compose the corrected projection using the real publications.

Required output:

* all nine lineage identifiers;
* exact partially evaluated outcome;
* canonical conflict reference;
* bounded conflict summary;
* no second conflict ID;
* projection effective-status summary;
* contact claim restricted according to the canonical conflict;
* importance claim remains unsupported;
* no source selected.

---

# Part IX — Sprint 3.93 Re-Proof

## 40. Historical Evaluation Preservation

The completed Sprint 3.93 document is historical evidence and shall not be rewritten.

Any existing evaluation table or string-literal finding that records the pre-correction incompatibility shall remain truthful.

Do not modify historical findings merely because the architecture has now been corrected.

Apply the same discipline Sprint 3.86 used for Sprint 3.84's frozen historical findings.

---

## 41. New Correction Composition Harness

Create a new correction-specific composition test or evaluation module, for example:

```text
lib/governed-conversation/claims-conflicts-correction-composition.test.ts
```

or:

```text
lib/governed-conversation/claims-conflicts-composition-re-evaluation.ts
lib/governed-conversation/claims-conflicts-composition-re-evaluation.test.ts
```

The new harness shall apply Sprint 3.93's seam criteria to the corrected code.

It shall not loosen the vocabulary or acceptance standard.

---

## 42. Required Seam Reclassification

At minimum rerun and reclassify:

| Seam                                   | Pre-correction finding   | Required corrected proof                               |
| --------------------------------------- | -------------------------- | ---------------------------------------------------------- |
| Claim Set → Conflict engine            | semantic-incompatibility | compatible                                             |
| Claim identity → Conflict linkage      | compatible               | remains compatible                                     |
| Claim lineage → Conflict lineage       | bounded-adapter-needed   | compatible                                             |
| Claim publication IDs → Conflict chain | semantic-incompatibility | compatible                                             |
| Claim Set → Projection claims          | semantic-incompatibility | compatible or governed bounded-reference composition   |
| Conflict → Projection conflict         | semantic-incompatibility | compatible through bounded canonical-reference summary |
| Conflict Set → Projection lineage      | semantic-incompatibility | compatible                                             |
| Claim classification ruleset           | unresolved               | compatible under Sprint 3.89 reference rule            |
| Conflict ruleset representation        | semantic-incompatibility | compatible                                             |
| Evaluation-state preservation          | semantic-incompatibility | compatible                                             |
| Claims/conflicts → effective status    | semantic-incompatibility | compatible                                             |
| Projection → Governed Input            | compatible               | remains compatible                                     |

No seam may be reclassified merely because a test fixture bypasses the corrected publication chain.

---

## 43. Permitted Corrected Status

The re-evaluation may report:

```text
compatible
```

where composition is direct and truthful.

It may report a non-blocking bounded adapter only if:

* the adapter is exactly the projection-owned bounded-summary construction authorised by Sprint 3.94;
* it creates no publication;
* it introduces no new identity;
* all semantics are already governed.

It shall not report a remaining semantic incompatibility as successful correction.

If one remains, the sprint is incomplete.

---

# Part X — Composer Option A Proof

## 44. No Conflict Derivation in Composer

Required tests shall prove `projection-composer.ts` does not:

* inspect raw source values to discover contradictions;
* create conflict IDs;
* assign conflict classes;
* assign status restrictions;
* determine source eligibility;
* run conflict rules;
* produce a `ConflictEvaluation`;
* produce a `GovernedConflictSet`.

The composer receives already published conflict/evaluation material.

It validates, references, summarizes, and aggregates.

---

## 45. Conflict Engine Remains Sole Derivation Owner

Required tests shall prove:

* removing the conflict engine's canonical conflict causes no projection conflict to appear;
* the composer cannot produce a conflict from contradictory source evidence alone;
* all bounded conflict summaries reference real canonical conflict IDs;
* summary construction rejects a non-canonical or mismatched conflict.

---

# Part XI — Restrict-Don't-Adjudicate Proof

## 46. Source Selection Must Remain Absent

The real source-value contradiction must preserve:

```text
selectedSourceOwnerId === undefined
```

or the exact canonical equivalent.

The corrected projection must not add:

* selected owner;
* winning source;
* preferred source;
* resolved value.

Tests shall search the resulting projection for any adjudication field or value.

---

## 47. Effective Status Without Adjudication

The projection may produce:

```text
effectiveClaimStatus = insufficient_coverage
```

for the contact-address claim.

It must retain:

* both source owners through canonical conflict reference or bounded summary;
* the canonical conflict identity;
* no winner.

This proves:

```text
restrict
≠
adjudicate
```

---

# Part XII — Existing Consumer Migration

## 48. Exhaustive Search

Search repository-wide for all consumers of:

```text
GovernedConflictInput
GovernedConversationalProjectionInput
GovernedConversationalProjection
conflicts
claimClassificationRulesetId
```

Migrate every live consumer affected by the corrected shape.

Do not assume the change surface is limited to tests.

List every result and its disposition.

---

## 49. Fixtures and Tests

Update synthetic fixtures only where necessary to supply:

* real claim publication lineage;
* real conflict publication lineage;
* exact evaluation outcome;
* conflict-set identity where required;
* bounded conflict summaries;
* effective claim-status summaries.

Do not weaken fixture validation by inserting arbitrary placeholder IDs.

All new identities must be truthful within the fixture's synthetic lineage.

---

## 50. Historical Findings

If repository search finds completed evaluation fixtures or string-literal tables documenting the former incompatibility:

* leave historical evidence unchanged;
* confirm it has no live import/type dependency on retired shapes;
* list it in the completion report as:

  * found during exhaustive search;
  * deliberately left unchanged;
  * retained as truthful pre-correction evidence.

If a historical file also contains live executable tests of current behavior, modify only the live portion and explicitly identify the frozen portion.

---

# Part XIII — Expected Change Surface

## 51. Expected Modified Files

Expected core modifications include:

```text
lib/governed-conversation/conflict-boundary-engine.ts
lib/governed-conversation/conflict-boundary-types.ts
lib/governed-conversation/conflict-boundary-publications.ts
lib/governed-conversation/conflict-boundary-engine.test.ts
lib/governed-conversation/conflict-boundary-publications.test.ts

lib/governed-conversation/projection-composer.ts
lib/governed-conversation/projection-composer.test.ts
```

Exact current test filenames must be confirmed from the repository.

Additional live fixtures/tests may require migration.

---

## 52. Expected New Files

Likely new proof files:

```text
lib/governed-conversation/claims-conflicts-correction-composition.test.ts
lib/governed-conversation/claims-conflicts-correction-isolation.test.ts
```

or an equivalent new re-evaluation module/test pair.

Specification:

```text
docs/SPRINT-3.95-CLAIMS-AND-CONFLICTS-COMPOSITION-CORRECTION-IMPLEMENTATION.md
```

---

## 53. Expected Unchanged Files

Expected unchanged unless a discovered live consumer requires a narrowly justified migration:

```text
lib/governed-conversation/claim-boundary-engine.ts
lib/governed-conversation/claim-boundary-ruleset.ts
lib/governed-conversation/claim-boundary-publications.ts
lib/governed-conversation/evidence-status.ts
lib/governed-conversation/input.ts
lib/governed-conversation/model-invocation.ts
lib/governed-conversation/validator.ts
```

No Sprint 3.91 recognition semantic change is authorised.

No Sprint 3.77/3.79 validator or model semantic change is authorised.

---

## 54. Protected Production Files

These four files must remain byte-identical:

```text
app/api/chat/route.ts
lib/context-builder.ts
lib/useAgentConversation.ts
lib/agents/chat-execution.ts
```

This sprint is authorised to modify governed-conversation implementation files.

It is not authorised to modify live conversational routing or execution.

---

# Part XIV — Isolation and Scope Proof

## 55. Protected-File Hash Proof

Record pre/post blob hashes for all four protected production files.

Expected:

```text
identical
```

Use the same independently verifiable discipline as Sprint 3.86.

---

## 56. Pure-Node Search

Use pure Node-based repository checks.

Do not rely on:

```text
rg
execFileSync
shell-only search utilities
```

Required checks:

* no new import into `/api/chat`;
* no new import into `context-builder.ts`;
* no new import into `useAgentConversation.ts`;
* no new import into `lib/agents/chat-execution.ts`;
* no production component imports the correction re-evaluation harness;
* no EOS structural-conflict import enters the corrected modules.

---

## 57. No Production Integration

The completion report shall state:

> Sprint 3.95 changes no live conversational behavior and performs no production integration.

Do not claim:

* production readiness;
* operator verification;
* selector readiness;
* promotion readiness.

---

# Part XV — Stop-and-Report Conditions

## 58. Governance Contradiction

Stop if implementing the correction requires:

* changing Sprint 3.94's Option A compound-set decision;
* creating a filtered claim set;
* changing canonical conflict ownership;
* making the composer derive conflicts;
* dropping one of the six outcomes;
* inventing another outcome;
* selecting source precedence;
* altering Sprint 3.89 claim semantics;
* altering Sprint 3.90 conflict taxonomy.

Return:

> **Correction Implementation Incomplete**

---

## 59. Effective-Status Ambiguity

If the existing evidence-status vocabulary does not provide a deterministic, constitutionally supported result for a combination of canonical status and conflict restriction:

* stop;
* identify the exact pair;
* do not invent a precedence rule;
* return incomplete.

Do not hide the ambiguity with a numeric severity order.

---

## 60. Projection Responsibility Drift

Stop if the only apparent solution requires the projection to:

* run source-value comparison;
* create canonical conflicts;
* recreate complete upstream publications;
* become a conflict evaluator;
* become a claim classifier;
* mutate canonical claims.

---

## 61. Historical Evidence Conflict

If a completed historical evaluation test must be rewritten to make the corrected architecture pass:

* stop;
* determine whether a new re-evaluation test can prove the corrected state;
* preserve the historical test where it truthfully represents the former repository.

Do not falsify earlier evidence.

---

# Part XVI — Required Test Matrix

## 62. Compound Claim-Set Tests

1. real Cassie compound set accepted;
2. original claim-set ID preserved;
3. both claims remain present;
4. contact claim cell evaluated;
5. importance claim cell explicitly unevaluated;
6. importance reason is `claim_type_outside_ruleset`;
7. contact contradiction still detected;
8. overall result is `partially_evaluated`;
9. no replacement claim set exists;
10. no pre-filter occurs.

---

## 63. Single-Claim Regression Tests

11. one supported contact claim with contradiction still produces `evaluated_conflict_found`;
12. one supported contact claim without contradiction produces `evaluated_no_conflict`;
13. one unsupported claim produces `evaluation_unsupported`;
14. unavailable source produces `evaluation_unavailable`;
15. malformed input produces `evaluation_failed`.

---

## 64. Publication Lineage Tests

16. claim ruleset ID preserved;
17. claim evaluation ID preserved;
18. claim-set ID preserved;
19. conflict ruleset ID preserved;
20. conflict evaluation ID preserved;
21. conflict-set ID preserved when permitted;
22. thread ID preserved;
23. request ID preserved;
24. exchange ID preserved;
25. every relationship validates;
26. each mismatched mutation fails.

---

## 65. Conflict Summary Tests

27. summary references canonical conflict ID;
28. conflict class preserved;
29. affected claim IDs preserved;
30. source owner IDs preserved;
31. status restriction preserved;
32. description reference preserved;
33. no second conflict ID created;
34. mismatched summary rejected;
35. full canonical conflict not duplicated into projection;
36. selected source remains absent.

---

## 66. Six-State Tests

37. `evaluated_no_conflict` preserved;
38. `evaluated_conflict_found` preserved;
39. `partially_evaluated` preserved;
40. `evaluation_unavailable` preserved;
41. `evaluation_unsupported` preserved;
42. `evaluation_failed` preserved;
43. permitted outcomes require conflict-set ID;
44. prohibited outcomes reject conflict-set ID;
45. nonempty claim set without evaluation fails;
46. no-conflict differs structurally from never evaluated.

---

## 67. Effective-Status Tests

47. no restriction preserves canonical status;
48. available plus `insufficient_coverage` becomes effective `insufficient_coverage`;
49. unsupported importance remains unsupported;
50. no restriction upgrades a status;
51. applied conflict IDs are traceable;
52. canonical claim status remains unchanged;
53. no source owner is selected;
54. conflicting value is not resolved.

---

## 68. Composer Option A Tests

55. composer cannot derive conflict from raw contradictory evidence;
56. composer cannot create a conflict ID;
57. composer accepts only published canonical conflict references;
58. composer validates and summarizes;
59. composer aggregates status restriction only;
60. conflict engine remains sole derivation owner.

---

## 69. Sprint 3.93 Re-Proof Tests

61. Claim Set → Conflict Engine seam becomes compatible;
62. claim lineage → conflict lineage becomes compatible;
63. claim publication IDs → conflict chain becomes compatible;
64. Claim Set → projection becomes compatible under canonical references;
65. canonical conflict → bounded projection summary is non-incompatible;
66. conflict-set lineage → projection becomes compatible;
67. claim classification ruleset identity becomes compatible;
68. conflict ruleset representation becomes compatible;
69. evaluation-state preservation becomes compatible;
70. effective-status seam becomes compatible;
71. projection → governed input remains compatible;
72. no former semantic incompatibility remains in the authorised corrected scope.

---

## 70. Mutation Sensitivity

73. wrong claim-set ID fails;
74. wrong claim-boundary evaluation ID fails;
75. wrong conflict-evaluation ID fails;
76. wrong conflict-set ID fails;
77. changed exchange ID fails;
78. changed affected claim ID fails;
79. changed conflict class fails;
80. changed restriction fails;
81. changed source owner set fails;
82. missing evaluation state fails.

---

## 71. Isolation Tests

83. four protected files unchanged;
84. no route imports added;
85. no context-builder import added;
86. no client-hook import added;
87. no production agent-execution import added;
88. no EOS conflict semantic import added;
89. correction re-evaluation harness remains test-only;
90. pure-Node checks pass.

---

# Part XVII — Full Validation

## 72. Full Repository Validation

Run:

```text
npm test
npm run build
npm run lint
npm run typecheck
git diff --check
```

Use repository-defined equivalents where materially different.

No proportionality exception applies.

Also run targeted suites for:

* conflict engine correction;
* conflict publication correction;
* projection composer correction;
* six-state preservation;
* lineage mutation;
* effective-status aggregation;
* Cassie compound composition;
* Sprint 3.93 seam re-evaluation;
* protected-file checks.

All tests must be deterministic and repeatable.

---

# Part XVIII — Completion Report

## 73. Required Structure

The completion report shall include:

### Repository Precondition

Report:

* repository;
* branch;
* starting commit;
* starting working tree;
* governing artefacts;
* inspected implementation files.

### Governing Artefacts Reviewed

List all governing documents read.

### Sprint 3.94 Decisions Implemented

Confirm:

```text
Compound Claim-Set Conflict Evaluation Decision: Option A
Canonical Conflict Projection Decision: Option B
Projection Conflict Evaluation-State Decision: Option B
Post-Conflict Effective Status Decision: Option B
Composer Option A remains binding
```

### Starting Defects Reconfirmed

Report:

* exact whole-set rejection;
* exact five-field projection conflict shape;
* publication-lineage loss;
* evaluation-state collapse;
* missing effective-status owner.

### Compound Claim-Set Correction

Describe:

* removal of whole-set guard;
* per-cell evaluation;
* ineligible-cell treatment;
* overall-outcome derivation;
* claim-set identity preservation.

### Cassie Central Proof

Report:

* operator input;
* claim ruleset/evaluation/set identities;
* two claims;
* contact evaluated;
* importance unevaluated;
* conflict result;
* partial overall result;
* original set preserved.

### Conflict Lineage Correction

Report required lineage and validation.

### Projection Claim Lineage

Report:

```text
claimBoundaryRulesetId
claimBoundaryEvaluationId
governedClaimSetId
```

### Projection Conflict Lineage

Report:

```text
conflictEvaluationRulesetId
conflictEvaluationId
governedConflictSetId
```

### Nine-Identifier Proof

List all nine actual IDs and their source publications.

### Bounded Conflict Summary

Explain:

* canonical conflict ownership;
* summary fields;
* no second identity;
* validation against canonical conflict.

### Six Evaluation Outcomes

Report each real projection case.

### No-Conflict vs Never-Evaluated

Report the exact structural proof.

### Effective Claim Status

Report:

* aggregation function;
* deterministic table;
* unchanged canonical claim;
* projection-owned effective status;
* applied conflict IDs.

### Restrict-Don't-Adjudicate

Report:

```text
selectedSourceOwnerId remains absent
```

and confirm no downstream source winner.

### Composer Option A

Confirm the composer does not derive conflicts.

### Sprint 3.93 Re-Proof

Include the corrected seam matrix.

### Historical Evaluation Preservation

List every historical file found and whether it was left unchanged.

### Exhaustive Consumer Search

List every live consumer and disposition.

### Files Changed

List every changed/added file with one-line reason.

No silent scope expansion is permitted.

### Protected Files

Report starting and ending hashes for:

```text
app/api/chat/route.ts
lib/context-builder.ts
lib/useAgentConversation.ts
lib/agents/chat-execution.ts
```

### Targeted Tests

Report exact commands and results.

### Full Validation

Report exact results for:

```text
npm test
npm run build
npm run lint
npm run typecheck
git diff --check
```

### Production Effect

State:

> Sprint 3.95 changes no live conversational behavior and performs no production integration.

### Outstanding Findings

List every remaining bounded adapter, incompatibility, or unresolved item.

### Next Step

Identify the next permitted sprint based on the real corrected outcome.

Expected next step:

> **Claims and Conflicts Composition Re-evaluation**

unless the full Sprint 3.93-equivalent re-proof in this sprint is sufficiently complete under the governing Roadmap to permit the next staged integration-preparation audit.

Do not claim production readiness.

---

# Part XIX — Recommendation Gate

## 74. Permitted Recommendation

The final line must be exactly one:

> **Correction Implementation Complete**

or:

> **Correction Implementation Incomplete**

No other wording is permitted.

---

## 75. Correction Implementation Complete

Use only if:

* Sprint 3.94 was followed exactly;
* the whole-set rejection is removed;
* the complete claim set remains authoritative;
* per-cell eligibility is real;
* ineligible claims receive explicit cell reasons;
* the Cassie compound set composes through the Conflict Engine;
* the original claim-set identity survives;
* canonical conflict identity remains unique;
* bounded conflict summaries reference canonical conflicts;
* all nine lineage identifiers survive;
* all six evaluation outcomes remain distinguishable;
* no-conflict differs from never evaluated;
* effective status has exactly one deterministic projection-owned aggregation point;
* canonical claims remain unchanged;
* no source is adjudicated;
* Composer Option A remains true;
* Sprint 3.93's formerly incompatible seams are corrected under the same standard;
* historical evidence is preserved;
* all live consumers are migrated;
* protected production files remain byte-identical;
* full validation passes;
* no production integration occurs.

---

## 76. Correction Implementation Incomplete

Use if:

* the complete claim set still cannot be evaluated;
* the implementation filters or republishes claims;
* one ineligible claim still blocks an eligible claim;
* conflict summaries require a second authoritative conflict identity;
* canonical publication lineage is lost;
* any evaluation state collapses into another;
* no-conflict remains indistinguishable from never evaluated;
* effective-status aggregation requires new governance;
* the composer must derive conflicts;
* a source winner is selected;
* a historical evaluation must be falsified;
* a protected production file changes;
* a Sprint 3.93 semantic incompatibility remains in the authorised scope;
* full validation fails.

Stop and report the exact evidence.

Do not work around it.

---

# Part XX — Return Format

## 77. Required Return

Return:

1. Repository Precondition.
2. Governing artefacts reviewed.
3. Starting commit and working tree.
4. Starting protected hashes.
5. Sprint 3.94 decisions implemented.
6. Exact whole-set guard removed.
7. Per-cell evaluation architecture.
8. Overall outcome derivation.
9. Original claim-set identity proof.
10. Cassie compound claims result.
11. Contact-address cell result.
12. Importance cell result.
13. Conflict-evaluation outcome.
14. Governed conflict-set result.
15. Canonical conflict result.
16. Conflict-lineage correction.
17. Claim publication lineage in projection.
18. Conflict publication lineage in projection.
19. Nine-identifier trace.
20. Bounded conflict-summary implementation.
21. Identity Integrity proof.
22. Six-state projection proof.
23. No-conflict versus never-evaluated proof.
24. Effective-status aggregation result.
25. Restrict-don't-adjudicate proof.
26. Composer Option A proof.
27. Sprint 3.93 seam reclassification matrix.
28. Mutation-sensitivity results.
29. Historical evaluation preservation.
30. Exhaustive consumer-search disposition.
31. Files changed with reasons.
32. Protected-file ending hashes.
33. Targeted test results.
34. Full validation results.
35. Explicit no-production-integration statement.
36. Outstanding findings.
37. Recommended next sprint.
38. Final recommendation gate.

The final line must be exactly:

> **Correction Implementation Complete**

or:

> **Correction Implementation Incomplete**

---

## 78. Success Criteria

Sprint 3.95 succeeds when this real chain works without semantic substitution:

```text
"What's Cassie's email? Anything important?"
        ↓
real Claim Boundary Engine
        ↓
one complete GovernedClaimSet
    ├── contact_address_lookup
    └── message_importance
        ↓
real Conflict Engine
    ├── contact cell evaluated
    ├── importance cell explicitly unevaluated
    └── no whole-set rejection
        ↓
ConflictEvaluation
    outcome = partially_evaluated
        ↓
GovernedConflictSet
    canonical conflict preserved
        ↓
GovernedConversationalProjection
    ├── all claim publication references
    ├── all conflict publication references
    ├── exact six-state outcome
    ├── bounded conflict summary
    ├── effective claim status
    └── one coherent exchange lineage
```

The correction must preserve the architecture's core distinction:

```text
canonical claim
    remains canonical

canonical conflict
    remains canonical

projection
    references and summarizes

composer
    validates and aggregates

model
    receives bounded governed state

no layer
    invents source truth
```

Sprint 3.95 does not make the corrected architecture live.

It makes the previously incompatible governed components truthfully composable in isolation.
