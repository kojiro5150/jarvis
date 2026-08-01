# Sprint 3.93 — Claims and Conflicts Composition Evaluation

**Status:** Specification
**Sprint Type:** Isolated Composition Evaluation
**Implementation Authority:** Evaluation/Test Code Only
**Production Integration:** Prohibited
**Output Path:** `docs/SPRINT-3.93-CLAIMS-AND-CONFLICTS-COMPOSITION-EVALUATION.md`

---

## 1. Purpose

Sprint 3.93 evaluates whether the independently implemented governed claims and governed conflicts tracks actually compose with each other and with the existing governed conversational projection, evidence-status, model-invocation, and lineage pipeline.

This sprint exists because isolated correctness does not establish compositional correctness.

Sprint 3.84 already proved this directly.

Sprint 3.83's lineage/projection implementation and Sprint 3.77/3.79's evidence/model implementation were individually correct and independently tested, yet Sprint 3.84 found a real semantic identity incompatibility when they were connected:

```text
GovernedConversationalProjection
    threadId
    requestId
    exchangeId
    projectionId

did not truthfully satisfy

constructGovernedConversationalInput
    runId
    sessionId
    interfaceContractId
    projectionId
```

Sprint 3.84 correctly refused to manufacture a compatibility shim or relabel identifiers merely to make the test pass.

That precedent is binding on the discipline of Sprint 3.93.

Sprint 3.91 and Sprint 3.92 are now independently complete:

```text
Sprint 3.91
Governed Claims Boundary
        ↓
ClaimBoundaryRuleset
        ↓
ClaimBoundaryEvaluation
        ↓
GovernedClaimSet
        ↓
GovernedClaimInput[]

Sprint 3.92
Governed Conflicts Boundary
        ↓
ConflictEvaluationRuleset
        ↓
ConflictEvaluation
        ↓
GovernedConflictSet
        ↓
CanonicalGovernedConflict[]
```

Both have been proven in isolation.

That does not prove that:

* their lineage identities agree;
* their publication identities coexist correctly;
* their claim linkage survives composition;
* their output shapes satisfy the projection composer;
* their conflict representation satisfies `GovernedConflictInput`;
* their claim representation satisfies the composer without republishing;
* their statuses survive projection;
* the resulting projection can enter the existing evidence/model track;
* the existing model track preserves conflict restrictions;
* the complete exchange retains one coherent identity chain.

Sprint 3.93 shall determine those facts empirically.

The central evaluation question is:

> **Can the real Sprint 3.91 claims publication and real Sprint 3.92 conflict publication be composed, without semantic reinterpretation, into the existing governed conversational projection and then carried truthfully through the existing evidence-status/model-invocation pipeline?**

The expected posture is investigative.

Do not begin from an assumption that composition succeeds.

A discovered incompatibility is a successful evaluation result.

---

## 2. Sprint Character

This is an evaluation-only sprint.

It may:

* add composition-evaluation modules;
* add composition fixtures;
* add diagnostic types local to the evaluation;
* add evaluation tests;
* add mutation-sensitivity tests;
* add pure-Node isolation checks;
* invoke existing public constructors and functions;
* construct synthetic source observations required by the real engines;
* record compatibility findings;
* stop a composed chain at the first truthful incompatibility.

It shall not:

* change claims semantics;
* change conflict semantics;
* change evidence-status semantics;
* change projection-composer semantics;
* change model-invocation semantics;
* change lineage semantics;
* add production adapters;
* add compatibility shims;
* relabel identifiers;
* widen existing types;
* weaken validators;
* modify `/api/chat`;
* integrate anything into production.

The evaluation must observe the repository as it exists.

It shall not repair the repository while evaluating it.

---

## 3. Governing Hierarchy

Apply the established repository hierarchy:

1. JARVIS Engineering Constitution
2. JARVIS North Star
3. JARVIS Engineering Specification Standard
4. Constitutional Publication Principles
5. `docs/architecture/ROADMAP.md`
6. Sprint 3.89 — Governed Conversational Claims Boundary Contract
7. Sprint 3.90 — Governed Conversational Conflicts Boundary Contract
8. Sprint 3.91 — Isolated Governed Claims Boundary Implementation
9. Sprint 3.92 — Isolated Governed Conflicts Boundary Implementation
10. Sprint 3.82 — Governed Conversational Lineage Identity Contract
11. Sprint 3.85 — Governed Conversational Identity Correction Contract
12. Sprint 3.83 — Isolated Conversational Lineage and Projection Implementation
13. Sprint 3.77 — Isolated Governed Conversational Runtime Implementation
14. Sprint 3.79 — applicable governed model/evidence implementation
15. Sprint 3.84 — Conversational Lineage and Projection Evaluation
16. current repository implementation
17. this Sprint specification

Sprint 3.84 is the direct composition-evaluation precedent.

Its discipline is binding:

> **Do not manufacture compatibility.**

Where two independently valid modules assign different semantics to apparently similar fields, record the incompatibility.

Where an explicit, mechanical, semantics-preserving transformation is missing, record an adapter gap.

Where a transformation would require a new governance decision, record semantic incompatibility rather than adapter need.

---

## 4. Repository Precondition

Before adding evaluation code:

1. Confirm repository.
2. Confirm branch.
3. Record starting commit.
4. Confirm working-tree state.
5. Confirm these artefacts exist:

```text
docs/SPRINT-3.84-CONVERSATIONAL-LINEAGE-AND-PROJECTION-EVALUATION.md
docs/SPRINT-3.89-GOVERNED-CONVERSATIONAL-CLAIMS-BOUNDARY-CONTRACT.md
docs/SPRINT-3.90-GOVERNED-CONVERSATIONAL-CONFLICTS-BOUNDARY-CONTRACT.md
docs/SPRINT-3.91-ISOLATED-GOVERNED-CLAIMS-BOUNDARY-IMPLEMENTATION.md
docs/SPRINT-3.92-ISOLATED-GOVERNED-CONFLICTS-BOUNDARY-IMPLEMENTATION.md

docs/SPRINT-3.77-ISOLATED-GOVERNED-CONVERSATIONAL-RUNTIME-IMPLEMENTATION.md
docs/SPRINT-3.83-ISOLATED-CONVERSATIONAL-LINEAGE-AND-PROJECTION-IMPLEMENTATION.md
docs/SPRINT-3.82-GOVERNED-CONVERSATIONAL-LINEAGE-IDENTITY-CONTRACT.md
docs/SPRINT-3.85-GOVERNED-CONVERSATIONAL-IDENTITY-CORRECTION-CONTRACT.md

docs/ENGINEERING_CONSTITUTION.md
docs/CONSTITUTIONAL-PUBLICATION-PRINCIPLES.md
docs/architecture/NORTH_STAR.md
docs/architecture/JARVIS-Engineering-Specification-Standard.md
docs/architecture/ROADMAP.md
```

6. Read Sprint 3.84 completely before writing evaluation code.
7. Read Sprint 3.91 completely.
8. Read Sprint 3.92 completely.
9. Read Sprint 3.89 completely.
10. Read Sprint 3.90 completely.
11. Inspect all current Sprint 3.91 modules:

```text
lib/governed-conversation/claim-boundary-types.ts
lib/governed-conversation/claim-boundary-ruleset.ts
lib/governed-conversation/claim-boundary-engine.ts
lib/governed-conversation/claim-boundary-publications.ts
lib/governed-conversation/claim-boundary-fixtures.ts
```

12. Inspect all current Sprint 3.92 modules:

```text
lib/governed-conversation/conflict-boundary-types.ts
lib/governed-conversation/conflict-boundary-ruleset.ts
lib/governed-conversation/conflict-boundary-engine.ts
lib/governed-conversation/conflict-boundary-publications.ts
lib/governed-conversation/conflict-boundary-fixtures.ts
lib/governed-conversation/claim-boundary-conflict-fixture-adapter.ts
```

13. Inspect the existing projection and downstream governed runtime:

```text
lib/governed-conversation/projection-composer.ts
lib/governed-conversation/types.ts
lib/governed-conversation/evidence-status.ts
lib/governed-conversation/model-invocation.ts
```

14. Locate the exact current functions implementing the Sprint 3.77/3.79 model path, including:

* governed input construction;
* model-request construction;
* model invocation boundary;
* response parsing;
* response-envelope construction;
* validation;
* execution-record construction.

15. Locate the current Sprint 3.83 lineage constructors and repository functions.

16. Record pre-sprint blob hashes for:

```text
app/api/chat/route.ts
lib/context-builder.ts
lib/useAgentConversation.ts
lib/agents/chat-execution.ts
```

17. Record pre-sprint hashes for all core modules being evaluated:

```text
claim-boundary-types.ts
claim-boundary-ruleset.ts
claim-boundary-engine.ts
claim-boundary-publications.ts

conflict-boundary-types.ts
conflict-boundary-ruleset.ts
conflict-boundary-engine.ts
conflict-boundary-publications.ts

projection-composer.ts
evidence-status.ts
model-invocation.ts
```

and all applicable Sprint 3.77/3.79/3.83 runtime modules.

18. Confirm the only expected changes are:

* new composition-evaluation code;
* new composition-evaluation fixtures;
* new tests;
* this Sprint document.

If Sprint 3.91 or Sprint 3.92 is absent, stop.

If either implementation is incomplete, stop.

If composition requires modifying an existing module merely to conduct the test, stop and report the seam instead.

---

## 5. Composition Finding Vocabulary

Use exactly this finding vocabulary for every evaluated seam:

```text
compatible
bounded-adapter-needed
semantic-incompatibility
unresolved
```

### `compatible`

Use only when existing outputs can enter the next existing boundary directly without:

* changing meaning;
* inventing fields;
* relabelling identity;
* dropping governed information;
* widening authority;
* weakening validation.

### `bounded-adapter-needed`

Use only when:

* both source and destination semantics are already governed;
* the transformation is deterministic;
* no new semantic decision is required;
* no authority changes;
* no information relevant to the destination is invented;
* the mapping can be exhaustively specified from existing contracts.

This finding does **not** authorize implementation of the adapter in this sprint.

### `semantic-incompatibility`

Use when successful composition would require:

* relabelling one identity as another;
* inventing missing governed meaning;
* choosing between competing authoritative publications;
* weakening a contract;
* dropping required governance information;
* changing claim/conflict status semantics;
* changing publication ownership;
* introducing an ungoverned precedence rule;
* reopening a settled governance decision.

### `unresolved`

Use only where the repository evidence is genuinely insufficient to classify the seam.

Do not use `unresolved` merely to avoid a negative finding.

---

## 6. Evaluation Architecture

The intended chain to test is:

```text
Operator question
"What's Cassie's email? Anything important?"
        ↓
real Sprint 3.91 ClaimBoundaryEngine
        ↓
ClaimBoundaryEvaluation
        ↓
GovernedClaimSet
        ↓
real Sprint 3.92 ConflictEvaluationEngine
        ↓
ConflictEvaluation
        ↓
GovernedConflictSet
        ↓
claims + conflicts
        ↓
real Sprint 3.83
composeGovernedConversationalProjection(...)
        ↓
GovernedConversationalProjection
        ↓
existing Sprint 3.77/3.79
governed evidence/model-invocation chain
        ↓
existing validation / governed response path
```

Every arrow is an evaluation seam.

No arrow is presumed valid.

The evaluator shall attempt each seam in order.

At the first blocking semantic incompatibility, the full end-to-end chain shall stop truthfully.

Independent downstream compatibility tests may still be performed with separately constructed equivalent inputs where useful, but they must be labelled as independent seam evaluations rather than evidence that the blocked end-to-end chain completed.

This mirrors Sprint 3.84.

---

## 7. Expected Evaluation Files

Recommended paths:

```text
lib/governed-conversation/claims-conflicts-composition-evaluation.ts
lib/governed-conversation/claims-conflicts-composition-evaluation-fixtures.ts
lib/governed-conversation/claims-conflicts-composition-evaluation.test.ts
lib/governed-conversation/claims-conflicts-composition-evaluation-isolation.test.ts
```

The exact split may differ only if the same responsibilities remain explicit.

No evaluation helper shall become a production adapter.

No evaluation helper shall be imported by production code.

---

## 8. Real-Function Requirement

The central composition test must invoke real repository functions.

Do not hand-assemble:

* `GovernedClaimInput[]`;
* `GovernedClaimSet`;
* `ConflictEvaluation`;
* `GovernedConflictSet`;
* `GovernedConversationalProjection`;
* governed model request;
* parsed model response;
* governed response envelope.

Synthetic primitive inputs are permitted.

For example:

* operator text;
* deterministic Cassie entity fixture;
* deterministic source-owned contradiction observations;
* deterministic connector/evidence fixtures;
* deterministic model adapter response;
* deterministic clock;
* deterministic identifiers/discriminators.

But every governed intermediate publication that has an existing public constructor or engine must be produced by that real implementation.

---

## 9. Cassie Central Scenario

Use exactly:

> **What's Cassie's email? Anything important?**

The real Sprint 3.91 engine must process the question.

Expected claim decomposition under the binding Sprint 3.89 contract:

```text
contact_address_lookup
message_importance
```

Expected claim semantics:

### Contact address

The contact-address claim remains the supported/available-eligible claim family according to the real engine's pre-evidence construction and existing evidence-status logic.

### Importance

The importance claim remains unsupported.

Do not reopen:

```text
unread
important
needsReply
labels
```

as importance evidence.

Do not modify the claims engine if its actual output differs from expectations.

Record the actual output.

---

## 10. Real Claim Publication Proof

The evaluation shall prove that the Cassie claims are produced through:

```text
ClaimBoundaryRuleset
        ↓
real ClaimBoundaryEngine
        ↓
computeEvidenceStatus
        ↓
ClaimBoundaryEvaluation
        ↓
constructGovernedClaimSet
```

Record:

* claim boundary ruleset ID;
* claim boundary evaluation ID;
* governed claim-set ID;
* thread ID;
* request ID;
* exchange ID;
* claim IDs;
* claim types;
* statuses;
* ownership;
* materiality;
* source references;
* reference time.

Do not recreate those values in the evaluation layer.

---

## 11. Real Conflict Evaluation

Take the real `GovernedClaimSet` from Section 10 and supply it to the real Sprint 3.92 conflict engine.

Construct the contradiction scenario using two admissible source-owned observations for the real `contact_address_lookup` claim.

The observations shall:

* reference the actual generated claim ID;
* reference the same Cassie entity;
* use the same comparison scope;
* use `resolved_contact_address`;
* be available;
* have complete coverage;
* be unsuperseded;
* have distinct source owners;
* contain incompatible normalized addresses.

For example:

```text
cassie.primary@example.com
cassie.hayward@example.org
```

The actual fixture values may differ.

The real conflict engine must produce:

```text
ConflictEvaluation
GovernedConflictSet
CanonicalGovernedConflict
```

Expected evaluation outcome:

```text
evaluated_conflict_found
```

Do not manually create a conflict.

---

## 12. Claims → Conflicts Seam

Evaluate whether the real claims publication can truthfully enter the real conflict engine.

Check:

### Type compatibility

Does the conflict engine consume the actual `GovernedClaimSet` type directly?

If an existing adapter is involved, inspect it.

Specifically inspect:

```text
lib/governed-conversation/claim-boundary-conflict-fixture-adapter.ts
```

Determine:

* whether it merely re-exports the real type/constructor;
* whether it transforms data;
* whether it changes semantics;
* whether it exists only because of isolated implementation organization;
* whether production composition would require it.

Classify the seam.

### Claim identity

Confirm:

```text
CanonicalGovernedConflict.affectedClaimIds
```

references the exact claim ID generated by Sprint 3.91.

No claim recreation is permitted.

### Claim-set identity

Confirm:

```text
ConflictEvaluation.governedClaimSetId
GovernedConflictSet.governedClaimSetId
```

reference the exact Sprint 3.91 publication.

### Lineage

Compare:

```text
GovernedClaimSet.threadId
GovernedClaimSet.requestId
GovernedClaimSet.exchangeId
```

against any corresponding fields published by:

```text
ConflictEvaluation
GovernedConflictSet
```

Determine whether the conflict publication:

* preserves them;
* makes them optional;
* omits them;
* reconstructs them;
* requires an adapter.

Do not assume optional fields are semantically equivalent to required lineage.

---

## 13. Claims/Conflicts Publication Identity Composition

Evaluate the full identity chain:

```text
ClaimBoundaryRuleset ID
        ↓
ClaimBoundaryEvaluation ID
        ↓
GovernedClaimSet ID
        ↓
Claim IDs
        ↓
ConflictEvaluationRuleset ID
        ↓
ConflictEvaluation ID
        ↓
GovernedConflictSet ID
        ↓
Conflict IDs
```

Confirm all identities are distinct.

Specifically prove:

```text
claimBoundaryRulesetId
≠ claimBoundaryEvaluationId
≠ governedClaimSetId
≠ claimId
≠ conflictEvaluationRulesetId
≠ conflictEvaluationId
≠ governedConflictSetId
≠ conflictId
≠ threadId
≠ requestId
≠ exchangeId
```

where applicable.

Also verify that one publication does not accidentally derive an identity using semantically incompatible lineage from the other track.

Classify:

```text
claims/conflicts identity chain
```

using the composition finding vocabulary.

---

## 14. Exchange Identity Consistency

The central Cassie run must use one intentional:

```text
threadId
requestId
exchangeId
```

through the claims evaluation.

Then inspect the conflict evaluation.

Determine:

* whether the same exchange identity is structurally preserved;
* whether it is optional;
* whether omission changes publication meaning;
* whether the conflict set itself carries sufficient exchange lineage;
* whether the projection composer can later prove that claims and conflicts belong to the same exchange.

Do not populate optional conflict lineage fields merely because doing so makes the test pass unless the real conflict-engine API itself authorizes and derives those fields from the consumed claim set.

If the evaluator must manually copy lineage from the claim set into the conflict evaluation, classify that seam rather than concealing it.

---

## 15. GovernedClaimSet → Projection Claims Seam

The existing projection composer expects:

```text
claims: readonly GovernedClaimInput[]
```

The Sprint 3.91 publication provides:

```text
GovernedClaimSet
    claims: readonly GovernedClaimInput[]
```

Evaluate whether passing:

```text
governedClaimSet.claims
```

to the projection is:

* direct authorized composition;
* a bounded projection/publication adapter;
* an impermissible loss of claim-set publication identity.

Specifically inspect whether the projection retains:

```text
governedClaimSetId
claimBoundaryEvaluationId
claimBoundaryRulesetId
```

anywhere in:

```text
GovernedConversationalProjectionInput
GovernedConversationalProjection
upstreamPublicationReferences
```

Do not assume that retaining claim values is equivalent to retaining the governed claim publication.

This seam must receive an explicit finding.

---

## 16. GovernedConflictSet → Projection Conflicts Seam

This is a mandatory high-risk seam.

Sprint 3.92 produces:

```text
CanonicalGovernedConflict
```

The projection composer expects:

```text
GovernedConflictInput
```

Compare them field by field.

At minimum inspect:

### Sprint 3.92 canonical conflict

```text
conflictId
conflictClass
affectedClaimIds
sourcePublicationReferences
sourceOwnerIds
comparisonKey
comparisonScope
normalizedValues
originalValues
statusRestriction
descriptionReference
rulesetRuleId
evidenceCoverageReferences
evaluatedAt
selectedSourceOwnerId
```

### Projection conflict input

```text
conflictId
sourceOwners
affectedClaimIds
statusRestriction
descriptionReference
```

Determine whether the transformation is:

```text
compatible
bounded-adapter-needed
semantic-incompatibility
unresolved
```

Explicitly evaluate:

* `sourceOwnerIds` → `sourceOwners`;
* preservation or loss of `conflictClass`;
* preservation or loss of source publication references;
* preservation or loss of comparison key/scope;
* preservation or loss of both conflicting values;
* preservation or loss of ruleset rule ID;
* preservation or loss of evidence coverage;
* preservation or loss of evaluated time;
* preservation of `statusRestriction`;
* preservation of "restrict, don't adjudicate" semantics;
* preservation of `selectedSourceOwnerId === undefined`.

Do not create the adapter in this sprint.

If an adapter is needed, specify its exact bounded responsibility in the finding only.

---

## 17. Conflict-Set Publication Identity → Projection Seam

Separately from individual conflict shape, evaluate whether the projection can preserve:

```text
conflictEvaluationRulesetId
conflictEvaluationId
governedConflictSetId
governedClaimSetId
```

The projection currently accepts conflict values rather than necessarily the complete conflict-set publication.

Determine whether dropping the publication wrapper would lose governed lineage required by Sprint 3.90.

This is a separate seam from Section 16.

A field-level mapping of individual conflicts does not automatically solve publication-lineage preservation.

---

## 18. Projection Lineage Seam

Attempt to compose the real claims/conflicts result into the existing:

```text
composeGovernedConversationalProjection(...)
```

Use the same:

```text
threadId
requestId
exchangeId
```

from the real claim run.

Do not invent replacements.

Check:

* claim IDs;
* conflict affected claim IDs;
* source references;
* reference time;
* claim classification ruleset ID;
* upstream publication references;
* conversation history classification;
* compatibility context;
* source evidence;
* connector availability;
* communication evidence;
* Calendar evidence;
* memory priority references.

Where evidence categories unrelated to the central claims/conflicts composition require synthetic governed fixtures, use the existing valid fixture/construction approach from Sprint 3.84.

Do not treat those synthetic categories as production integration.

---

## 19. Projection Publication Preservation

If projection composition succeeds, inspect the resulting:

```text
GovernedConversationalProjection
```

Determine whether it truthfully preserves enough information to reconstruct the governed claims/conflicts lineage.

At minimum ask:

Can the projection prove:

* which Claim Boundary Ruleset produced the claims?
* which Claim Boundary Evaluation produced them?
* which Governed Claim Set contained them?
* which Conflict Evaluation Ruleset evaluated them?
* which Conflict Evaluation ran?
* which Governed Conflict Set was published?
* which source publications produced the conflict?
* that no source winner was selected?

If not, classify each missing publication seam.

Do not infer lineage from IDs embedded only in test fixtures.

---

## 20. Projection → Existing Governed Input Seam

Sprint 3.84 found a semantic incompatibility here.

Re-evaluate the current repository rather than assuming that finding still applies unchanged.

Determine whether subsequent work, including Sprint 3.85/3.86, resolved the previous:

```text
threadId/requestId/exchangeId
vs.
runId/sessionId/interfaceContractId
```

problem.

Use real current functions.

If the incompatibility remains, record it.

If it has been corrected, prove the corrected path using current repository code.

Do not recreate the old finding merely because Sprint 3.84 found it previously.

Do not manufacture a new compatibility shim.

---

## 21. Evidence-Status Seam

Determine whether the claim statuses produced by Sprint 3.91 and the conflict restriction produced by Sprint 3.92 remain semantically coherent when entering the existing governed evidence/model pipeline.

Central questions:

1. Does the supported contact-address claim retain its evidence status?
2. Does the unsupported importance claim remain unsupported?
3. Does the source-value conflict restrict rather than adjudicate?
4. Can the downstream evidence/model layer represent that restriction?
5. Does any downstream function accidentally choose one conflicting source?
6. Does any downstream function upgrade a restricted claim to `available`?
7. Does any downstream function collapse conflicting values into one?
8. Does any downstream function ignore conflict restriction entirely?

Use real functions.

If the existing downstream track cannot consume conflict restrictions at all, classify that seam.

---

## 22. Model-Request Seam

If the chain truthfully reaches model-request construction, inspect the real request.

Determine whether it preserves:

* contact-address claim;
* unsupported importance claim;
* conflict restriction;
* conflicting source values or governed references;
* claim identity;
* conflict identity;
* projection identity;
* exchange identity.

The model request shall not:

* silently present one conflicting address as authoritative;
* suppress the conflict;
* convert unsupported importance into a supported question;
* expose raw connector payload;
* create new evidence authority.

If model-request construction cannot represent the conflict state, record the finding.

---

## 23. Deterministic Model Adapter

Use a deterministic test model adapter only if the truthful composed chain reaches the model boundary.

The adapter shall not perform reasoning needed to make composition work.

It may return a controlled response designed to test:

* evidence preservation;
* unsupported claim handling;
* conflict handling;
* validation;
* release restrictions.

The deterministic model adapter is not evidence that production model behavior is correct.

It is only a controlled boundary instrument.

---

## 24. Response Parsing and Envelope Seam

If reached, use the real:

* parser;
* envelope constructor;
* validator;
* execution-record path.

Check whether:

* claim identities survive;
* unsupported importance survives;
* conflict restriction survives;
* one source is not silently selected;
* malformed/invented output remains fail-closed;
* exchange/projection identity remains coherent.

If an existing response type has no way to represent the conflict, record that.

Do not widen it.

---

## 25. Composition Seam Matrix

The evaluation must produce a central matrix containing at least:

| Seam                                   | Upstream publication/type        | Downstream requirement         | Status | Evidence | Blocking? |
| --------------------------------------- | ---------------------------------- | --------------------------------- | ------ | -------- | --------- |
| Claim engine → Claim Set               | real Sprint 3.91 output          | GovernedClaimSet               |        |          |           |
| Claim Set → Conflict engine            | GovernedClaimSet                 | conflict input                 |        |          |           |
| Claim identity → Conflict linkage      | claimId                          | affectedClaimIds               |        |          |           |
| Claim lineage → Conflict lineage       | thread/request/exchange          | conflict evaluation lineage    |        |          |           |
| Claim publication IDs → Conflict chain | claim-set/ruleset/evaluation IDs | conflict publications          |        |          |           |
| Claim Set → Projection claims          | GovernedClaimSet                 | GovernedClaimInput[]           |        |          |           |
| Conflict → Projection conflict         | CanonicalGovernedConflict        | GovernedConflictInput          |        |          |           |
| Conflict Set → Projection lineage      | GovernedConflictSet              | projection publication lineage |        |          |           |
| Exchange lineage → Projection          | thread/request/exchange          | same                           |        |          |           |
| Projection → Governed Input            | projection identity              | runtime input identity         |        |          |           |
| Claims/conflicts → evidence status     | statuses/restrictions            | downstream evidence semantics  |        |          |           |
| Projection → model request             | governed projection              | model request                  |        |          |           |
| Model result → envelope                | governed output                  | validated envelope             |        |          |           |
| Envelope → execution record            | terminal governed result         | execution lineage              |        |          |           |

Every row must use exactly:

```text
compatible
bounded-adapter-needed
semantic-incompatibility
unresolved
```

---

## 26. No Compatibility Shim Rule

The evaluation code shall not introduce any object whose purpose is to make two incompatible governed meanings appear compatible.

Prohibited examples include:

```ts
{
  runId: projection.exchangeId,
  sessionId: projection.threadId,
  interfaceContractId: "test-contract"
}
```

where no contract authorizes those meanings.

Also prohibited:

```ts
{
  sourceOwners: conflict.sourceOwnerIds,
  affectedClaimIds: conflict.affectedClaimIds,
  statusRestriction: conflict.statusRestriction,
  descriptionReference: conflict.descriptionReference
}
```

if doing so silently discards governed conflict meaning that the destination is required to preserve.

Such a transformation may be described as a candidate bounded adapter only after the evaluation proves that all omitted fields are legitimately represented elsewhere or are not required at that boundary.

The test itself shall not use the adapter to force end-to-end success.

---

## 27. Existing Fixture Adapter Evaluation

Sprint 3.92 currently contains:

```text
claim-boundary-conflict-fixture-adapter.ts
```

Inspect it explicitly.

Determine whether it is:

1. a pure type/constructor re-export with no semantic transformation;
2. a genuine adapter;
3. an isolation-only convenience;
4. evidence of an unresolved production composition boundary.

The evaluation report must state which.

Do not remove or expand it.

---

## 28. Restrict-Don't-Adjudicate Proof

The central contradiction scenario must preserve Sprint 3.92's established rule:

> **Restrict, do not adjudicate.**

At the conflict-engine boundary prove:

```text
selectedSourceOwnerId === undefined
```

Then trace the scenario as far downstream as truthful composition permits.

At every reached stage determine whether:

* source A remains unselected;
* source B remains unselected;
* both remain represented or referencable;
* claim status remains restricted;
* no downstream helper introduces precedence.

A downstream source selection is a semantic defect unless governed by an already-existing explicit precedence rule.

---

## 29. Unsupported Importance Preservation

The Cassie importance claim must remain unsupported throughout every reached stage.

Specifically prove that none of:

```text
unread
important
needsReply
labels
message ordering
legacy attention metadata
```

changes:

```text
message_importance
```

into a supported claim.

This remains binding from Sprint 3.89 and Sprint 3.91.

If the projection/model path lacks a way to preserve unsupported status, classify the seam.

Do not weaken the exclusion boundary.

---

## 30. Mutation-Sensitivity Requirement

The composition evaluation itself must be proven capable of detecting a real incompatibility.

At least one mutation must deliberately corrupt a meaningful seam.

Required primary mutation:

Take the valid baseline claims/conflicts composition fixture and mutate:

```text
conflict affectedClaimId
```

to a different/nonexistent claim ID.

Expected:

* conflict/claim linkage check fails;
* projection validation fails where applicable;
* diagnostic status changes from baseline;
* the evaluation records a blocking composition finding.

This proves the test is data-sensitive.

---

## 31. Identity Mutation

Also mutate at least one lineage identity.

Preferred mutation:

```text
exchangeId
```

between the claim publication and the downstream composition boundary.

Expected:

* mismatch is detected;
* no response release occurs;
* diagnostic classification changes.

If conflict publications do not structurally preserve exchange identity, that fact itself must be recorded and the mutation adapted to the nearest real identity seam.

Do not add an exchange field merely to enable the test.

---

## 32. Conflict-Meaning Mutation

Perform one mutation that demonstrates the evaluator detects loss of conflict meaning.

For example, deliberately construct a test-only candidate mapping that omits:

```text
statusRestriction
```

or substitutes:

```text
available
```

for the real restriction.

The evaluation must reject or flag this as incompatible.

The mutation shall remain local to evaluation code.

No production type is modified.

---

## 33. Publication-Identity Mutation

Mutate one publication identity while keeping its body otherwise unchanged.

Candidates:

```text
governedClaimSetId
conflictEvaluationId
governedConflictSetId
conflictId
```

Expected:

* identity/body mismatch is detected by existing constructors/validators where supported; or
* the evaluation identifies that no current boundary verifies it.

Either outcome is useful evidence.

Do not invent a validator solely to make the mutation fail.

If no existing verification exists, report the gap.

---

## 34. Baseline vs Mutation Matrix

Report:

| Test                   | Baseline      | Mutation                  | Expected detection | Actual detection | Finding |
| ----------------------- | -------------- | ---------------------------- | -------------------- | ------------------- | --------- |
| Claim/conflict linkage | valid         | unknown claim ID          | reject             |                  |         |
| Exchange lineage       | same exchange | changed exchange          | reject             |                  |         |
| Conflict restriction   | restricted    | restriction lost/upgraded | reject/diagnose    |                  |         |
| Publication identity   | canonical     | mutated ID                | reject/diagnose    |                  |         |

The evaluation succeeds only if it demonstrates that its own checks are capable of changing result when meaningful semantics change.

---

## 35. Claims/Conflicts Status Interaction

Evaluate whether Sprint 3.91 and Sprint 3.92 assign mutually coherent meanings to:

```text
claim.status
conflict.statusRestriction
```

Specifically inspect the contact-address case where:

* the claim may have sufficient source evidence;
* the conflict engine detects incompatible values;
* the conflict restricts status to `insufficient_coverage`.

Determine where the authoritative post-conflict effective status is represented.

Possible findings include:

* directly represented;
* derivable by an existing governed rule;
* requires bounded adapter/aggregation;
* semantic ownership is unclear.

Do not implement a new effective-status reducer.

If no existing owner computes the post-conflict effective claim status, report that precisely.

---

## 36. Publication Ownership

For every object in the central chain identify its owner:

```text
ClaimBoundaryRuleset
ClaimBoundaryEvaluation
GovernedClaimSet
GovernedClaimInput
ConflictEvaluationRuleset
ConflictEvaluation
GovernedConflictSet
CanonicalGovernedConflict
GovernedConversationalProjection
governed model request
response envelope
execution record
```

Determine whether composition creates any:

* duplicate owner;
* missing owner;
* competing owner;
* ownership transition without an explicit publication boundary.

Sprint 3.84 found competing terminal publication semantics.

Sprint 3.93 shall actively look for an equivalent defect rather than assume none exists.

---

## 37. Publication Loss Test

At each transition identify which upstream governed publication identities remain available downstream.

Produce a lineage table:

| Publication                      | Created by | ID | Referenced by next stage? | Preserved in projection? | Preserved downstream? |
| ---------------------------------- | ------------ | ---- | ---------------------------: | ---------------------------: | -----------------------: |
| ClaimBoundaryRuleset             | 3.91       |    |                           |                          |                       |
| ClaimBoundaryEvaluation          | 3.91       |    |                           |                          |                       |
| GovernedClaimSet                 | 3.91       |    |                           |                          |                       |
| ConflictEvaluationRuleset        | 3.92       |    |                           |                          |                       |
| ConflictEvaluation               | 3.92       |    |                           |                          |                       |
| GovernedConflictSet              | 3.92       |    |                           |                          |                       |
| CanonicalGovernedConflict        | 3.92       |    |                           |                          |                       |
| GovernedConversationalProjection | 3.83       |    |                           |                          |                       |

A publication disappearing from the next stage is not automatically a defect.

But its loss must be classified against the governing contracts.

---

## 38. Source Reference Compatibility

The projection composer validates that claim source references correspond to known governed source evidence.

The central test shall determine whether the real Sprint 3.91 claim output carries source references compatible with:

```text
GovernedSourceEvidenceInput
```

as required by the composer.

Do not fabricate matching source evidence solely from claim references unless that transformation is already governed.

Determine whether:

* the claim engine already publishes compatible source references;
* a real source publication exists;
* a bounded second-stage mapping is required;
* semantics are missing.

This is explicitly analogous to the Gmail second-stage mapping issue found in Sprint 3.87/3.88.

---

## 39. Conflict Source Compatibility

Similarly determine whether Sprint 3.92:

```text
GovernedSourceObservation
sourcePublicationReferences
sourceOwnerIds
```

can be reconciled truthfully with the projection's:

```text
GovernedSourceEvidenceInput
GovernedConflictInput.sourceOwners
```

Do not assume shared strings imply shared source semantics.

Check:

* source owner identity;
* source publication identity;
* source reference identity;
* resource identity;
* observed time;
* provenance;
* coverage;
* content kind.

Classify the seam.

---

## 40. Claim Classification Ruleset Identity

The projection requires:

```text
claimClassificationRulesetId
```

Sprint 3.91 publishes:

```text
claimBoundaryRulesetId
```

Determine whether these are governed as the same identity domain.

Do not automatically set:

```text
claimClassificationRulesetId = claimBoundaryRulesetId
```

unless the contracts and implementation explicitly establish semantic equivalence.

If they are different concepts, classify the seam.

If Sprint 3.89 intended the Claim Boundary Ruleset to satisfy this projection field, prove it from the contract and implementation.

This is a mandatory seam check.

---

## 41. Conflict Ruleset Representation

Determine whether:

```text
conflictEvaluationRulesetId
```

has any explicit home in the existing projection.

If not, determine whether:

* omission is authorized;
* it belongs in upstream publication references;
* a bounded publication adapter is needed;
* the projection contract is semantically incomplete for governed conflicts.

Do not add a field.

Record the finding.

---

## 42. Evaluation-State Preservation

Sprint 3.92 distinguishes:

```text
evaluated_no_conflict
evaluated_conflict_found
partially_evaluated
evaluation_unavailable
evaluation_unsupported
evaluation_failed
```

The projection currently consumes conflict values.

Determine whether it can distinguish:

```text
evaluated_no_conflict
```

from:

```text
conflict evaluation never supplied
```

This was a central Sprint 3.90 governance requirement.

If projection composition of:

```text
conflicts: []
```

loses that distinction, record it as a composition finding.

Do not solve it by adding a test-only boolean.

This seam is mandatory even though the central Cassie scenario uses `evaluated_conflict_found`.

---

## 43. Negative No-Conflict Composition Case

In addition to the contradiction case, run the real conflict engine on the same real claim set with compatible source observations.

Produce:

```text
evaluated_no_conflict
GovernedConflictSet with zero conflicts
```

Attempt to represent that result at the projection boundary.

Determine whether the projection can truthfully preserve:

> evaluation ran and found no conflict

rather than merely:

> no conflicts were supplied.

Classify this seam independently.

---

## 44. Unavailable/Unsupported Evaluation Representation

Use existing Sprint 3.92 real engine paths to produce at least:

```text
evaluation_unavailable
evaluation_unsupported
```

Determine whether the projection architecture has a truthful representation for those evaluation states.

Do not force them into `conflicts: []` and call that equivalent.

If the projection has no representation, record the gap.

No new projection field is authorized.

---

## 45. Model Invocation With Conflict State

If the chain reaches the existing model invocation boundary, determine whether the model receives enough governed information to distinguish:

1. one supported address with no conflict;
2. two contradictory addresses with restriction;
3. no conflict evaluation;
4. conflict evaluation unavailable;
5. unsupported importance claim.

The test need not solve all cases end to end if an earlier seam blocks them.

Independent downstream evaluation may be used, clearly labelled.

---

## 46. Fail-Closed Requirement

Any blocking composition finding must prevent the evaluator from claiming successful end-to-end composition.

Do not:

* fill missing fields;
* choose source precedence;
* reinterpret identity;
* drop publication wrappers;
* weaken validators;
* convert unsupported to unavailable;
* convert unavailable to no-conflict;
* convert conflict restriction into claim status without authority.

The evaluator shall stop truthfully.

---

## 47. Expected Diagnostic Structure

Implement a typed local evaluation finding such as:

```ts
type CompositionStatus =
  | "compatible"
  | "bounded-adapter-needed"
  | "semantic-incompatibility"
  | "unresolved";
```

A finding should contain at minimum:

```text
seam
upstreamType
downstreamType
compositionStatus
blocking
evidence
requiredMeaning
actualMeaning
reason
```

This type is evaluation-only.

It shall not become a production governance type.

---

## 48. Central Evaluation Result

The final evaluation shall produce one overall result based on the seam findings.

Possible overall results:

### Composition compatible

Only if every required seam is either:

```text
compatible
```

or a non-blocking:

```text
bounded-adapter-needed
```

whose transformation is already completely governed.

### Composition blocked by bounded adapter gap

Use when no semantic governance question remains but one or more required mechanical mappings are absent.

### Composition blocked by semantic incompatibility

Use where at least one seam requires a new governance decision or semantic redesign.

### Composition unresolved

Use only if repository evidence genuinely prevents classification.

Do not turn the overall result into the recommendation gate.

The recommendation gate remains:

```text
Evaluation Complete
Evaluation Incomplete
```

A completed evaluation may correctly conclude that composition is blocked.

---

## 49. Explicitly Out of Scope

Do not implement:

* `/api/chat` integration;
* production source acquisition;
* Gmail production mapping;
* Calendar production mapping;
* memory/priority production mapping;
* connector availability production mapping;
* `policy_incompatibility`;
* `temporal_commitment_incompatibility`;
* claims-engine semantic changes;
* conflicts-engine semantic changes;
* projection-composer changes;
* evidence-status changes;
* model-invocation semantic changes;
* lineage semantic changes;
* new governance contracts;
* conflict precedence;
* source adjudication;
* persistence changes;
* selectors;
* UI changes;
* operator verification;
* promotion.

---

## 50. Protected Files

The following must remain byte-identical:

```text
app/api/chat/route.ts
lib/context-builder.ts
lib/useAgentConversation.ts
lib/agents/chat-execution.ts
```

All core implementation files from Sprints:

```text
3.77
3.79
3.83
3.91
3.92
```

must also remain semantically unchanged.

Expected: byte-identical unless an evaluation-only export is absolutely required.

If a core module must change for the evaluation to compile, stop and report why.

Do not alter it.

---

## 51. Isolation Proof

Use pure Node.

Do not use `rg`.

Do not depend on shell-specific search behavior.

### Forward search

Search production files for imports of:

```text
claims-conflicts-composition-evaluation
claims-conflicts-composition-evaluation-fixtures
```

Expected:

```text
zero
```

### Reverse search

Evaluation code may import existing governed modules required for testing.

It must not import:

* production `/api/chat`;
* client hook;
* production context builder;
* production agent execution;
* production UI components.

### Semantic modification proof

Use pre/post blob hashes for all protected and evaluated core modules.

Expected:

```text
identical
```

---

## 52. Required Tests

At minimum implement the following.

### Real claims

1. Cassie question passes through real Claim Boundary Engine.
2. Real Claim Boundary Evaluation is produced.
3. Real Governed Claim Set is produced.
4. Contact-address claim is present.
5. Importance claim is present.
6. Importance remains unsupported.
7. Real claim IDs are used downstream.

### Claims → conflicts

8. Real Governed Claim Set enters real conflict engine.
9. Real claim ID becomes affected claim ID.
10. Real governed claim-set ID is preserved.
11. Conflict evaluation uses the real ruleset.
12. Real Conflict Evaluation is produced.
13. Real Governed Conflict Set is produced.
14. Real Canonical Governed Conflict is produced.
15. `selectedSourceOwnerId` remains undefined.

### Identity

16. Claim ruleset ID distinct.
17. Claim evaluation ID distinct.
18. Claim-set ID distinct.
19. Claim ID distinct.
20. Conflict ruleset ID distinct.
21. Conflict evaluation ID distinct.
22. Conflict-set ID distinct.
23. Conflict ID distinct.
24. None aliases thread/request/exchange identity.
25. Exchange lineage consistency is checked.

### Projection claims

26. Evaluate `GovernedClaimSet.claims` against projection `claims`.
27. Evaluate loss/preservation of claim-set identity.
28. Evaluate claim ruleset identity.
29. Evaluate claim evaluation identity.
30. Evaluate claim source references.

### Projection conflicts

31. Compare CanonicalGovernedConflict with GovernedConflictInput.
32. Evaluate source-owner mapping.
33. Evaluate affected claim mapping.
34. Evaluate status restriction.
35. Evaluate description reference.
36. Evaluate lost conflict class.
37. Evaluate lost source-publication references.
38. Evaluate lost conflicting values.
39. Evaluate lost ruleset rule ID.
40. Evaluate lost coverage references.
41. Evaluate lost conflict-set identity.
42. Do not implement the mapping.

### Projection

43. Attempt real projection composition.
44. Preserve same thread ID.
45. Preserve same request ID.
46. Preserve same exchange ID.
47. Projection rejects unknown affected claim.
48. Projection source-reference validation is exercised.

### Evaluation-state semantics

49. `evaluated_conflict_found` representation checked.
50. `evaluated_no_conflict` representation checked.
51. No-conflict distinguished from no evaluation.
52. `evaluation_unavailable` representation checked.
53. `evaluation_unsupported` representation checked.

### Downstream runtime

54. Re-evaluate projection → governed-input identity seam.
55. If compatible, use real model-request constructor.
56. If compatible, use deterministic model adapter.
57. If compatible, use real parser.
58. If compatible, use real envelope constructor.
59. If compatible, use real validator.
60. If compatible, use real execution-record path.
61. Unsupported importance remains unsupported.
62. Conflict restriction is not upgraded.
63. No source is adjudicated.

### Mutation sensitivity

64. Unknown affected claim mutation is detected.
65. Exchange identity mutation is detected where structurally representable.
66. Conflict restriction mutation is detected or diagnosed.
67. Publication identity mutation is detected or diagnosed.
68. Baseline and mutation results differ.

### Isolation

69. No production imports evaluation module.
70. Protected blobs remain identical.
71. Core Sprint 3.91 files remain identical.
72. Core Sprint 3.92 files remain identical.
73. Projection composer remains identical.
74. Evidence/model modules remain identical.
75. Pure-Node isolation search passes.

---

## 53. Full Validation

Run the complete repository validation suite.

At minimum:

```text
npm test
npm run build
npm run lint
npm run typecheck
git diff --check
```

Use repository-defined equivalents where names differ.

Also run targeted composition tests.

No validation exception applies.

A composition incompatibility does not excuse failing repository validation.

The tests should encode the incompatibility as an expected diagnostic result, not leave the suite red.

---

## 54. Evaluation Report — Required Structure

The completed Sprint 3.93 document shall contain the following sections.

### Repository Precondition

Report:

* repository;
* branch;
* starting commit;
* working tree;
* required artefacts;
* inspected implementation files.

### Governing Artefacts Reviewed

List every governing artefact read.

### Sprint 3.84 Precedent

State explicitly:

* what 3.84 discovered;
* why that finding requires adversarial composition testing here;
* that no compatibility shim was permitted.

### Central Cassie Scenario

Report the real operator input and deterministic fixture inputs.

### Claims Result

Report:

* ruleset ID;
* evaluation ID;
* claim-set ID;
* lineage;
* claim IDs;
* types;
* statuses;
* materiality;
* source references.

### Conflict Result

Report:

* ruleset ID;
* evaluation ID;
* conflict-set ID;
* conflict ID;
* affected claim IDs;
* source owners;
* source publications;
* status restriction;
* selected source owner;
* evaluation state.

### Claims → Conflicts Finding

State one composition status and evidence.

### Publication Identity Finding

State whether all claim/conflict publication identities compose coherently.

### Exchange Lineage Finding

State whether thread/request/exchange identity remains coherent.

### Claim Set → Projection Finding

State whether the projection can consume claims without losing required governed publication meaning.

### Conflict → Projection Finding

State whether CanonicalGovernedConflict can satisfy GovernedConflictInput directly.

### Conflict Set → Projection Finding

State whether conflict evaluation/set lineage is preserved.

### Claim Classification Ruleset Finding

State whether `claimBoundaryRulesetId` and `claimClassificationRulesetId` are semantically the same governed identity.

### Conflict Ruleset Finding

State whether conflict ruleset identity has a truthful projection representation.

### Evaluation-State Finding

State whether the projection preserves:

* evaluated conflict;
* evaluated no conflict;
* evaluation unavailable;
* evaluation unsupported;
* evaluation never ran.

### Projection Composition Result

State whether real projection composition succeeds.

### Projection → Governed Input Result

Re-evaluate Sprint 3.84's prior identity blocker against current code.

### Evidence/Status Result

State whether claim statuses and conflict restrictions survive.

### Model-Invocation Result

If reached, report the real model-request composition.

If not reached, state the exact blocker.

### Response/Validation Result

If reached, report parser/envelope/validator/execution results.

If not reached, state why.

### Restrict-Don't-Adjudicate Proof

Report whether any stage selected a source.

### Unsupported Importance Proof

Report whether importance remained unsupported.

### Composition Matrix

Include the complete seam matrix.

### Publication Lineage Matrix

Include the complete publication preservation table.

### Mutation Sensitivity

Report all baseline/mutation pairs.

### Isolation and Blob Proof

Report:

* forward search;
* reverse search;
* pre/post hashes;
* unchanged core semantics.

### Files Changed

List every new file and reason.

### Targeted Tests

Report exact commands/results.

### Full Validation

Report exact commands/results.

### Production Effect

State:

> Sprint 3.93 changes no live conversational behavior and performs no production integration.

### Outstanding Findings

List every:

```text
bounded-adapter-needed
semantic-incompatibility
unresolved
```

finding separately.

### Recommended Next Step

Recommend the smallest next sprint justified by the findings.

Do not preselect whether that sprint is:

* adapter implementation;
* implementation correction;
* governance contract;
* another evaluation.

The evidence decides.

---

## 55. Recommendation Gate

The completion report must end with exactly one:

> **Evaluation Complete**

or:

> **Evaluation Incomplete**

### Evaluation Complete

Use when:

* all required governing artefacts were reviewed;
* real 3.91 functions were exercised;
* real 3.92 functions were exercised;
* real claim/conflict publications were produced;
* all mandatory seams were evaluated;
* every seam received a permitted composition status;
* identity composition was checked;
* evaluation-state preservation was checked;
* projection composition was genuinely attempted;
* downstream runtime was exercised as far as truthfully permitted;
* no shim was introduced;
* mutation sensitivity was proven;
* isolation passed;
* protected files remained unchanged;
* full validation passed.

`Evaluation Complete` does **not** mean composition succeeded.

A result such as:

> composition blocked by semantic incompatibility

can and should still end:

> **Evaluation Complete**

if the incompatibility was rigorously established.

### Evaluation Incomplete

Use when:

* real functions could not be exercised;
* an intermediate publication was hand-assembled despite an existing constructor;
* a compatibility shim was required to continue;
* a required seam was skipped;
* mutation sensitivity was not proven;
* a protected file changed;
* validation failed;
* evidence was insufficient to make required findings.

---

## 56. Return Format

Return:

1. Repository Precondition.
2. Governing artefacts reviewed.
3. Sprint 3.84 precedent.
4. Starting commit and clean-state result.
5. Core implementation hashes.
6. Central Cassie inputs.
7. Real claims-engine output.
8. Real Governed Claim Set.
9. Real conflicts-engine input.
10. Real Conflict Evaluation.
11. Real Governed Conflict Set.
12. Real canonical conflict.
13. Claims → conflicts composition finding.
14. Claims/conflicts identity finding.
15. Exchange-lineage finding.
16. Claim Set → projection finding.
17. Conflict → projection finding.
18. Conflict Set → projection finding.
19. Claim-classification-ruleset finding.
20. Conflict-ruleset representation finding.
21. Conflict-evaluation-state finding.
22. Source-reference compatibility finding.
23. Projection composition result.
24. Projection → governed-input result.
25. Evidence-status result.
26. Model-request result.
27. Response/envelope/validation result.
28. Restrict-don't-adjudicate proof.
29. Unsupported-importance proof.
30. Complete composition seam matrix.
31. Publication lineage matrix.
32. Mutation-sensitivity results.
33. Isolation proof.
34. Protected-file hash comparison.
35. Every changed file with reason.
36. Targeted tests.
37. Full validation.
38. Explicit no-production-effect statement.
39. Outstanding findings.
40. Recommended next sprint.
41. Final recommendation gate.

The final line must be exactly:

> **Evaluation Complete**

or:

> **Evaluation Incomplete**

---

## 57. Success Criteria

Sprint 3.93 succeeds by discovering the truth of composition.

It does not succeed by making this diagram green:

```text
Claims
  ↓
Conflicts
  ↓
Projection
  ↓
Evidence/model
  ↓
Response
```

It succeeds by determining, with real executable evidence, whether every arrow is semantically valid.

The preferred outcome is not "compatible."

The preferred outcome is **accurate classification**.

If the real chain works, prove it.

If the claim set requires a bounded second-stage publication mapping, report it.

If canonical conflicts do not truthfully fit `GovernedConflictInput`, report it.

If conflict evaluation state disappears at projection, report it.

If claim/conflict publication identities are lost, report it.

If the old Sprint 3.84 identity incompatibility remains, report it.

If a new semantic incompatibility exists, stop at it.

Do not route around it.

Do not invent compatibility.

Do not optimize for a passing composition test.

Sprint 3.84 established the governing lesson:

> **Individually correct governed components are not assumed composable. Composition itself must be proven.**

Sprint 3.93 applies that discipline to the claims/conflicts boundary before any production integration is permitted.
