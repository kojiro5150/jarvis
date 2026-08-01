# Sprint 3.92 — Isolated Governed Conflicts Boundary Implementation

## Part 1: Source-Value Contradiction

**Status:** Specification
**Sprint Type:** Isolated Governance-Authorized Implementation
**Governing Authority:** Sprint 3.90 — Governed Conversational Conflicts Boundary Contract
**Production Integration:** Prohibited
**Output Path:** `docs/SPRINT-3.92-ISOLATED-GOVERNED-CONFLICTS-BOUNDARY-IMPLEMENTATION.md`

---

## 1. Purpose

Sprint 3.92 implements the first bounded portion of the conversational conflicts architecture authorized by Sprint 3.90.

Sprint 3.90 selected:

> **Conversational Conflict Architecture: Option B**

This establishes a closed three-class taxonomy:

1. `source_value_contradiction`;
2. `policy_incompatibility`;
3. `temporal_commitment_incompatibility`.

Sprint 3.90 also established:

* **Conflict Claim-Linkage Decision: Option A** — every conversational conflict is strictly linked to at least one existing claim in one Governed Claim Set;
* **Projection Composer Conflict Role: Option A** — the composer validates and aggregates supplied conflict publications but never derives them;
* **Conflict Evaluation Owner: Option A** — a dedicated Governed Conversational Conflict Engine owns deterministic evaluation;
* **EOS Structural Conflict Reuse: Option C** — direct reuse is prohibited; only a future separately governed mapping may transform named EOS classes;
* **Conflict Evaluation-State Architecture: Option A** — explicit evaluation publications distinguish no conflict, conflict found, unavailable, unsupported, and failed outcomes.

Sprint 3.90's stated next step was:

> "an isolated governed conversational conflict implementation sprint for the root ruleset, source-value contradiction module, evaluation publication, Governed Conflict Set, canonical conflict identity, and explicit no-conflict/unevaluated structure."

Sprint 3.92 shall implement exactly that scope.

It shall implement only:

```text
source_value_contradiction
```

It shall not implement:

```text
policy_incompatibility
temporal_commitment_incompatibility
```

Those classes remain admitted by the closed Sprint 3.90 taxonomy but are explicitly deferred to later implementation sprints.

The central implementation objective is:

> **Build a deterministic, immutable, claim-linked conflict-evaluation pipeline that detects genuine source-value contradictions, publishes explicit conflict-evaluation and conflict-set records, and structurally distinguishes "evaluated and no conflict found" from "evaluation did not run or could not complete."**

The central proof is:

> **Two admissible source-owned observations making genuinely incompatible factual assertions about the same `contact_address_lookup` claim produce one real governed source-value conflict, while the same claim with non-contradictory evidence produces an explicit `evaluated_no_conflict` result rather than a merely empty array.**

---

## 2. Sprint Character

This is an isolated implementation sprint.

It may:

* add conflict-boundary modules under `lib/governed-conversation/`;
* add immutable conflict ruleset, evaluation, set, and conflict publication types;
* add a dedicated deterministic conflict engine;
* add a source-value contradiction evaluator;
* add immutable identity constructors;
* add explicit evaluation-outcome handling;
* add synthetic fixtures and tests;
* add pure-Node isolation checks.

It is not:

* a governance sprint;
* a policy-conflict implementation;
* a temporal-commitment-conflict implementation;
* a source-acquisition sprint;
* a Gmail integration sprint;
* a Calendar integration sprint;
* a memory or priority integration sprint;
* a connector-availability implementation;
* a projection-composer redesign;
* a claims-boundary redesign;
* a claims/conflicts composition sprint;
* an EOS mapping sprint;
* an `/api/chat` integration sprint;
* a selector sprint;
* an operator-verification sprint;
* a promotion sprint.

No model call shall exist anywhere in the new conflict-boundary architecture.

---

## 3. Governing Hierarchy

The sprint shall apply the repository's established hierarchy:

1. JARVIS Engineering Constitution
2. JARVIS North Star
3. JARVIS Engineering Specification Standard
4. Constitutional Publication Principles
5. `docs/architecture/ROADMAP.md`
6. Sprint 3.90 — Governed Conversational Conflicts Boundary Contract
7. Sprint 3.89 — Governed Conversational Claims Boundary Contract
8. Sprint 3.91 — Isolated Governed Claims Boundary Implementation
9. Sprint 3.82 — Governed Conversational Lineage Identity Contract
10. Sprint 3.76 — Governed Conversational Runtime Contract
11. Sprint 3.85 — Governed Conversational Identity Correction Contract
12. Sprint 3.77 — Isolated Governed Conversational Runtime Implementation
13. Sprint 3.83 — Isolated Conversational Lineage and Projection Implementation
14. current governed-conversation claim, conflict, projection, and evidence types
15. this Sprint specification

Sprint 3.90 is binding for:

* the closed three-class taxonomy;
* strict claim linkage;
* admissible source ownership;
* the dedicated conflict engine;
* composer validate/aggregate-only behavior;
* EOS non-reuse without a later mapping contract;
* conflict publication identity;
* the evaluation-state architecture;
* no-conflict proof;
* source-value contradiction semantics;
* conflict status restriction;
* source-value preservation;
* prohibition on empty-array inference.

Sprint 3.92 shall not reopen any of those decisions.

---

## 4. Repository Precondition

Before writing code:

1. Confirm the intended repository and branch.
2. Record the starting commit.
3. Confirm the working-tree state.
4. Confirm the following governing artefacts exist:

```text
docs/ENGINEERING_CONSTITUTION.md
docs/architecture/NORTH_STAR.md
docs/architecture/JARVIS-Engineering-Specification-Standard.md
docs/CONSTITUTIONAL-PUBLICATION-PRINCIPLES.md
docs/architecture/ROADMAP.md

docs/SPRINT-3.90-GOVERNED-CONVERSATIONAL-CONFLICTS-BOUNDARY-CONTRACT.md
docs/SPRINT-3.89-GOVERNED-CONVERSATIONAL-CLAIMS-BOUNDARY-CONTRACT.md
docs/SPRINT-3.91-ISOLATED-GOVERNED-CLAIMS-BOUNDARY-IMPLEMENTATION.md
docs/SPRINT-3.77-ISOLATED-GOVERNED-CONVERSATIONAL-RUNTIME-IMPLEMENTATION.md
docs/SPRINT-3.83-ISOLATED-CONVERSATIONAL-LINEAGE-AND-PROJECTION-IMPLEMENTATION.md
docs/SPRINT-3.76-GOVERNED-CONVERSATIONAL-RUNTIME-CONTRACT.md
docs/SPRINT-3.82-GOVERNED-CONVERSATIONAL-LINEAGE-IDENTITY-CONTRACT.md
docs/SPRINT-3.85-GOVERNED-CONVERSATIONAL-IDENTITY-CORRECTION-CONTRACT.md
```

5. Read Sprint 3.90 completely before modifying code.
6. Confirm directly that it contains:

   * **Conversational Conflict Architecture: Option B**;
   * the closed three-class taxonomy;
   * **Conflict Claim-Linkage Decision: Option A**;
   * **Projection Composer Conflict Role: Option A**;
   * **Conflict Evaluation Owner: Option A**;
   * **EOS Structural Conflict Reuse: Option C**;
   * **Conflict Evaluation-State Architecture: Option A**;
   * the six-state closed evaluation-outcome vocabulary (`evaluated_no_conflict`, `evaluated_conflict_found`, `partially_evaluated`, `evaluation_unavailable`, `evaluation_unsupported`, `evaluation_failed`) — confirmed present in Sprint 3.90's Decision 9. See Section 18 for exactly how this sprint's narrow scope relates to `partially_evaluated`;
   * the source-value contradiction rule;
   * the immutable publication chain;
   * the no-conflict proof rule;
   * the explicit next-step statement limiting the first implementation to source-value contradiction.
7. Read Sprint 3.91 completely as the direct structural and file-organization precedent. Confirm directly the exact shape of `GovernedClaimSet` and `constructGovernedClaimSet` in `lib/governed-conversation/claim-boundary-types.ts` and `claim-boundary-publications.ts` — both are real, implemented, and exported; this sprint's central fixture must be constructed through the real public constructor, not a hand-rolled equivalent.
8. Inspect the current implementation of:

```text
lib/governed-conversation/types.ts
lib/governed-conversation/projection-composer.ts
lib/governed-conversation/claim-boundary-types.ts
lib/governed-conversation/claim-boundary-ruleset.ts
lib/governed-conversation/claim-boundary-engine.ts
lib/governed-conversation/claim-boundary-publications.ts
lib/governed-conversation/claim-boundary-fixtures.ts
```

9. Confirm the current definitions and usage of:

```text
GovernedConflict
GovernedConflictInput
GovernedClaimInput
GovernedClaimSet
contact_address_lookup
claimId
affectedClaimIds
sourceOwners
statusRestriction
descriptionReference
```

10. Confirm whether `GovernedConflictInput` is defined in `projection-composer.ts` or another current file and record its exact shape.
11. Confirm the current older claim-local `GovernedConflict` remains structurally distinct.
12. Locate all synthetic conversational conflict fixtures and tests.
13. Locate all EOS `structural_conflict` types, constructors, and algorithms solely to establish the prohibited import boundary.
14. Confirm no production conversational conflict engine currently exists.
15. Record pre-sprint blob hashes for the four protected files:

```text
app/api/chat/route.ts
lib/context-builder.ts
lib/useAgentConversation.ts
lib/agents/chat-execution.ts
```

16. Record blob hashes for:

* `lib/governed-conversation/projection-composer.ts`;
* all Sprint 3.91 claim-boundary core modules;
* any EOS runtime files inspected for reuse-boundary proof.

17. Confirm the expected changes are limited to:

* new conflict-boundary modules;
* new tests and fixtures;
* this Sprint 3.92 document.

If Sprint 3.90 is absent, stop.

If the existing claim or projection types materially contradict Sprint 3.90's assumptions, stop rather than redefining them.

If implementing source-value contradiction requires implementing either deferred class, modifying the composer's semantic ownership, or importing EOS conflict meaning, return:

> **Implementation Incomplete**

---

## 5. Binding Scope

Sprint 3.92 implements only:

```text
source_value_contradiction
```

The ruleset shall acknowledge that the root taxonomy is closed to:

```text
source_value_contradiction
policy_incompatibility
temporal_commitment_incompatibility
```

but this Part 1 implementation shall admit only the first class for executable evaluation.

The new implementation shall not contain executable rules, placeholder handlers, or partially active code paths for:

```text
policy_incompatibility
temporal_commitment_incompatibility
```

Those classes may appear only in:

* contract references;
* explicit deferred metadata;
* closed root-taxonomy declarations that clearly mark them unimplemented and unsupported in this ruleset version.

No open extension map shall allow runtime registration of additional conflict classes.

---

## 6. Required Architecture

The implementation shall follow this exact architecture:

```text
Governed Claim Set
        ↓
admissible source-owned governed observations
        ↓
immutable ConflictEvaluationRuleset
        ↓
dedicated Governed Conversational Conflict Engine
        ↓
ConflictEvaluation
        ↓
GovernedConflictSet
        ↓
individual canonical governed conflicts
        ↓
future projection-composer validation/aggregation
```

The engine sits upstream of the projection composer.

The projection composer shall not be modified to derive conflicts.

This sprint shall not integrate the new engine into the composer.

It shall prove the upstream publication architecture in isolation.

---

## 7. Expected New Modules

Create modules under:

```text
lib/governed-conversation/
```

Recommended exact paths:

```text
lib/governed-conversation/conflict-boundary-types.ts
lib/governed-conversation/conflict-boundary-ruleset.ts
lib/governed-conversation/conflict-boundary-engine.ts
lib/governed-conversation/conflict-boundary-publications.ts
lib/governed-conversation/conflict-boundary-fixtures.ts
```

Tests:

```text
lib/governed-conversation/conflict-boundary-ruleset.test.ts
lib/governed-conversation/conflict-boundary-engine.test.ts
lib/governed-conversation/conflict-boundary-publications.test.ts
lib/governed-conversation/conflict-boundary-isolation.test.ts
```

A different file split is permitted only where the same responsibilities remain explicit and independently testable.

The completion report shall state the exact final paths.

---

## 8. Module Responsibilities

### `conflict-boundary-types.ts`

Own only the new immutable conflict-boundary and publication types authorized by Sprint 3.90.

It shall not redefine:

* `GovernedClaimInput`;
* `GovernedClaimSet`;
* `GovernedConflictInput`;
* `GovernedConflict`;
* conversational evidence statuses;
* source-reference types;
* claim types.

### `conflict-boundary-ruleset.ts`

Own:

* the immutable root ruleset;
* the one executable admitted class;
* eligible claim types;
* eligible source publication types;
* comparison keys;
* canonical value normalization;
* claim-linkage rules;
* admissibility rules;
* coverage requirements;
* source-owner requirements;
* conflict restriction mapping;
* deterministic description template;
* no-conflict proof rule;
* unsupported/unavailable/failure rules;
* prohibited relation definitions.

### `conflict-boundary-engine.ts`

Own:

* ruleset validation;
* claim-set validation;
* source admissibility checks;
* claim linkage;
* source-value comparison;
* conflict derivation;
* duplicate relation normalization;
* evaluation outcome derivation;
* conflict-set construction;
* failure and unavailable outcomes.

### `conflict-boundary-publications.ts`

Own constructors and identity validation for:

* `ConflictEvaluationRuleset`;
* `ConflictEvaluation`;
* `GovernedConflictSet`;
* canonical individual governed conflict publications.

### `conflict-boundary-fixtures.ts`

Own synthetic test fixtures only.

It shall not become a production source registry.

---

## 9. `ConflictEvaluationRuleset`

Implement a real immutable:

```text
ConflictEvaluationRuleset
```

It shall contain at minimum:

* `conflictEvaluationRulesetId`;
* schema version;
* ruleset version;
* root taxonomy version;
* executable admitted classes;
* explicitly deferred classes;
* eligible claim types;
* eligible source publication types;
* comparison keys;
* canonical normalization rules;
* entity and scope matching rules;
* source-owner requirements;
* source publication admissibility rules;
* source-availability requirements;
* source-coverage requirements;
* claim-linkage rules;
* conflict restriction mapping;
* deterministic description template;
* no-conflict proof requirements;
* evaluation outcome rules;
* failure rules;
* prohibited relation set.

The executable admitted-class set shall be exactly:

```text
source_value_contradiction
```

The deferred-class set shall be exactly:

```text
policy_incompatibility
temporal_commitment_incompatibility
```

No runtime extension API shall permit additional classes.

---

## 10. Eligible Claim Types

For Part 1, the ruleset shall admit only the already-implemented communication claim needed for the central proof:

```text
contact_address_lookup
```

Do not admit all `CommunicationClaimType` members automatically.

The ruleset may reject or report unsupported evaluation for:

```text
message_importance
```

and all other claim types.

The existence of those types in the broader vocabulary does not authorize conflict evaluation rules for them.

The eligible claim type shall be fixed in the ruleset and not caller-selectable.

---

## 11. Eligible Source Publications

Define a narrow synthetic governed source-observation shape sufficient to evaluate source-value contradiction.

It shall contain at minimum:

* immutable source publication ID;
* source owner ID;
* source type;
* resource/entity identity;
* affected claim ID;
* claim property or comparison key;
* canonical factual value;
* original factual value or reference;
* observation time;
* publication time;
* provenance;
* comparison scope;
* availability;
* coverage;
* supersession status;
* content kind;
* schema version.

This new source-observation fixture/publication shape shall be:

* immutable;
* provenance-bearing;
* claim-scoped;
* sufficient for isolated tests;
* explicitly not a replacement for the future production source-evidence registry.

Do not use:

* raw connector payloads;
* legacy `OperationalState`;
* compatibility context;
* prior assistant output;
* model output;
* EOS conflicts;
* source-unavailable markers as factual values.

---

## 12. Source Admissibility

A source publication shall be admissible only when:

* immutable identity is present;
* source owner is present;
* provenance is present;
* observation time is present;
* publication type is ruleset-eligible;
* source is available;
* coverage is sufficient for the comparison;
* claim ID exists in the supplied Governed Claim Set;
* source scope is compatible with that claim;
* comparison key is eligible;
* source publication is not superseded by a governed precedence record;
* factual value is present and normalizable.

An inadmissible source publication shall not be silently ignored when it is required for evaluation.

Its effect shall be represented through one of the explicit evaluation outcomes or unevaluated reasons.

---

## 13. Source-Value Contradiction Definition

A `source_value_contradiction` exists only where at least two admissible source-owned observations:

1. reference the same existing affected claim;
2. refer to the same resolved entity or resource;
3. refer to the same claim property/comparison key;
4. share the same relevant temporal and comparison scope;
5. are both available and sufficiently covered;
6. are not related through a governed supersession or precedence rule;
7. normalize to genuinely incompatible values.

For the Part 1 contact-address rule:

```text
claimType = contact_address_lookup
comparisonKey = resolved_contact_address
```

Two observations conflict only if they describe the same resolved person/contact identity and normalize to different deliverable address values under the declared normalization rule.

Unequal values concerning:

* different people;
* different address types;
* different time scopes;
* superseded records;
* aliases declared equivalent by the ruleset;
* non-deliverable identifiers;
* incomplete values;

shall not automatically produce a conflict.

---

## 14. Canonical Value Normalization

Implement one deterministic normalization rule for the central contact-address comparison.

At minimum it shall define:

* whitespace trimming;
* case treatment;
* angle-address extraction where already structured;
* whether display names participate;
* whether Unicode normalization applies;
* whether aliases are treated as equivalent.

Do not implement alias identity resolution.

Do not infer mailbox equivalence.

For this sprint, case-normalized exact address comparison is permitted where explicitly fixed by the ruleset.

The implementation shall not use fuzzy matching or model interpretation.

---

## 15. Strict Claim Linkage

Every conflict must reference at least one existing claim ID from the supplied Governed Claim Set.

For Part 1:

* exactly one `contact_address_lookup` claim is sufficient;
* one source-value contradiction may affect that one claim;
* multi-claim conflicts are not required;
* cross-claim-set conflicts are prohibited;
* cross-exchange conflicts are prohibited;
* no-claim evaluation produces no conflict evaluation.

If a source observation references an unknown claim ID:

* do not fabricate a claim;
* do not remap by claim type;
* do not create a conflict;
* return `evaluation_failed` or another exact contract-authorized failure path.

---

## 16. Conflict Evaluation Owner

Implement one dedicated:

```text
Governed Conversational Conflict Engine
```

or equivalent named pure deterministic function/module.

The engine shall consume:

* one immutable ruleset;
* one Governed Claim Set or exact current equivalent;
* admissible source publications;
* source availability and coverage metadata;
* comparison/reference time;
* lineage references required by the contract.

The engine shall produce:

* one `ConflictEvaluation`;
* and, for evaluated outcomes, one `GovernedConflictSet`.

It shall not:

* acquire source data;
* normalize raw connector payloads;
* construct claims;
* modify claims;
* choose claim materiality;
* widen claim source scope;
* invoke the projection composer;
* invoke a model;
* persist to production storage.

---

## 17. Composer Option A Boundary

The projection composer remains validate/aggregate-only.

Sprint 3.92 shall not:

* move conflict rules into `projection-composer.ts`;
* call the conflict engine from inside the composer;
* alter composer conflict semantics;
* make the composer infer no conflict;
* make the composer merge or rewrite conflicts;
* add status-restriction derivation to the composer.

Required proof:

* the new engine produces complete conflict publications before any hypothetical composer call;
* `projection-composer.ts` remains byte-identical unless a compile-only import change is genuinely unavoidable;
* no new conflict derivation function is added to the composer.

The expected result is no change to the composer.

---

## 18. Closed Evaluation Outcome Vocabulary

Sprint 3.90's binding Decision 9 defines a **six-state** vocabulary, confirmed directly against the merged contract:

```text
evaluated_no_conflict
evaluated_conflict_found
partially_evaluated
evaluation_unavailable
evaluation_unsupported
evaluation_failed
```

This is not optional. `ConflictEvaluation`'s outcome type must declare all six states as its closed enum, for type-level fidelity to the binding vocabulary Sprint 3.90 established — even though, per the reasoning below, Part 1's narrow scope makes one of them structurally unreachable in practice.

### `partially_evaluated` is structurally unreachable in Part 1, and this must be proven, not merely asserted

Per Sprint 3.90, `partially_evaluated` applies when "at least one cell evaluated and at least one applicable cell unevaluated" within one evaluation run, where a cell is one (claim × conflict class) pair. Part 1 evaluates exactly one such cell per run: `contact_address_lookup × source_value_contradiction`. With only one cell, there is no meaningful partition into "some evaluated, some not" — the outcome for that single cell is always either fully evaluated or not evaluated at all.

This is a real, checkable structural fact, not a convenience omission. It must be proven, not silently assumed:

* Add one required test (see Section 40) that constructs a Part 1 scenario and asserts the resulting outcome is never `partially_evaluated`, with an explanatory comment tracing back to this single-cell reasoning.
* The completion report's outcome-vocabulary section must state this reasoning explicitly — not merely list five implemented states without accounting for the sixth, and not claim `partially_evaluated` was "omitted" when the correct characterization is "structurally unreachable given this scope, proven by test."
* If a future sprint expands the eligible claim types or admits a second conflict class within one evaluation run, `partially_evaluated` becomes reachable and must be implemented for real at that point — this sprint does not need to build that path now, only avoid contradicting it.

For the five states this sprint does actively exercise:

### `evaluated_no_conflict`

Use only when:

* the ruleset applies;
* every required source comparison ran;
* source availability and coverage were sufficient;
* no contradiction matched;
* a zero-conflict `GovernedConflictSet` is published.

### `evaluated_conflict_found`

Use only when:

* the ruleset applies;
* evaluation ran;
* at least one contradiction matched;
* a non-empty `GovernedConflictSet` is published.

### `evaluation_unavailable`

Use where evaluation cannot run because required source publications, availability records, or ruleset infrastructure are unavailable.

No conflict set is published unless Sprint 3.90 explicitly requires one for this state.

### `evaluation_unsupported`

Use where:

* the claim type is outside the implemented ruleset;
* the requested conflict class is deferred or unsupported;
* no applicable executable rule exists.

No conflict is fabricated.

### `evaluation_failed`

Use where:

* claim linkage is invalid;
* source publication is malformed;
* identity publication fails;
* deterministic evaluator throws;
* canonicalization fails;
* publication construction cannot complete truthfully.

---

## 19. Unevaluated Reason Vocabulary

Where the evaluation does not produce an evaluated outcome, use a closed reason vocabulary consistent with Sprint 3.90.

At minimum:

```text
conflict_class_unsupported
required_source_unavailable
insufficient_source_coverage
ruleset_unavailable
evaluator_failure
claim_type_outside_ruleset
```

Include `evaluation_deferred` only where it is required to represent the two deferred taxonomy classes.

Every unavailable, unsupported, or failed outcome shall contain:

* claim ID where applicable;
* conflict class;
* source requirement;
* comparison scope;
* one exact reason;
* deterministic explanation reference.

Do not use free-form reason strings as the only structural signal.

---

## 20. `ConflictEvaluation`

Implement one immutable:

```text
ConflictEvaluation
```

At minimum it shall contain:

* `conflictEvaluationId`;
* schema version;
* `conflictEvaluationRulesetId`;
* governed claim-set ID;
* evaluated claim IDs;
* requested conflict classes;
* executable conflict classes;
* source publication references;
* source owner IDs;
* source availability references;
* source coverage references;
* comparison/reference time;
* per-claim/per-class evaluation records;
* overall outcome;
* unevaluated reasons;
* created-at time;
* optional prior evaluation ID;
* thread ID;
* request ID;
* exchange ID where supplied by the claim set;
* conflict-set ID where one is published.

The evaluation ID shall identify one immutable evaluation event.

A retry shall receive a new evaluation identity.

---

## 21. `GovernedConflictSet`

Implement one immutable:

```text
GovernedConflictSet
```

At minimum it shall contain:

* `governedConflictSetId`;
* schema version;
* `conflictEvaluationId`;
* `conflictEvaluationRulesetId`;
* governed claim-set ID;
* evaluated claim IDs;
* evaluated classes;
* source publication references;
* evaluation coverage;
* ordered immutable conflicts;
* created-at time.

For:

```text
evaluated_no_conflict
```

publish a real conflict set with:

```text
conflicts.length = 0
```

This zero-conflict set is authoritative only because it is linked to a complete successful evaluation.

For:

```text
evaluated_conflict_found
```

publish a non-empty conflict set.

Do not infer evaluation state from the array length alone.

---

## 22. Canonical Individual Conflict

Implement a canonical individual conflict publication compatible with Sprint 3.90's required semantics.

At minimum it shall contain:

* conflict ID;
* conflict class:

  * `source_value_contradiction`;
* affected claim IDs;
* source publication references;
* source owner IDs;
* comparison key;
* comparison scope;
* normalized values or immutable value references;
* status restriction;
* deterministic description reference;
* ruleset rule ID;
* evidence/coverage references;
* evaluation time;
* schema version.

The new canonical conflict shall be structurally capable of being mapped later to the composer's existing `GovernedConflictInput`.

Do not modify `GovernedConflictInput` in this sprint merely to make mapping convenient.

---

## 23. Status Restriction

For `source_value_contradiction`, the ruleset shall define one fixed restriction.

The implementation shall inspect Sprint 3.90's completed restriction decision and apply it exactly.

The conflict may preserve or restrict claim status.

It shall never upgrade status.

At minimum:

* a claim that would otherwise be `available` cannot remain unqualified `available` where admissible source values conflict;
* the conflict shall restrict the claim according to the contract's exact mapping;
* conflicting values remain preserved;
* the engine shall not choose a winner absent a separate precedence rule.

The central test shall assert the exact required `statusRestriction`.

Do not invent a new status vocabulary.

---

## 24. Conflicting-Value Preservation

The conflict publication shall preserve both incompatible source-owned values or immutable references to them.

It shall not:

* suppress one;
* select one as correct;
* merge them;
* create a synthesized address;
* rank sources without a governed precedence rule.

The deterministic description may state that the values differ.

It shall not adjudicate.

---

## 25. Deterministic Description

Conflict existence shall be determined structurally, not from prose.

Implement a deterministic ruleset-owned description template or description reference.

For example, the structured publication may refer to a fixed rule such as:

```text
source_value_contradiction.contact_address.v1
```

The description shall identify:

* affected claim;
* comparison key;
* source references;
* bounded contradiction type.

No model-generated description is permitted.

---

## 26. Central Contradiction Test

Construct one synthetic scenario using the real Sprint 3.91 claim-publication architecture or a faithful fixture produced by its public constructors.

Required claim:

```text
claimType = contact_address_lookup
```

Required scenario:

Two admissible source-owned publications refer to the same resolved Cassie identity and same comparison key but provide genuinely incompatible values, for example:

```text
cassie.primary@example.com
cassie.hayward@example.org
```

Run the real conflict engine.

Required outcome:

```text
ConflictEvaluation.outcome = evaluated_conflict_found
GovernedConflictSet.conflicts.length = 1
```

The resulting conflict must prove:

* `conflictClass = source_value_contradiction`;
* correct claim linkage;
* correct `affectedClaimIds`;
* both source publications referenced;
* both source owners referenced;
* correct comparison key;
* correct status restriction;
* deterministic rule ID;
* canonical conflict ID;
* no source selected as correct;
* no model call;
* no composer derivation.

The test shall not directly instantiate the expected conflict after bypassing the engine.

---

## 27. No-Conflict Test

Construct the same claim with admissible observations that:

* normalize to the same value; or
* contain only one sufficient authoritative value where the ruleset defines that as evaluable no contradiction.

Run the real engine.

Required outcome:

```text
ConflictEvaluation.outcome = evaluated_no_conflict
GovernedConflictSet.conflicts.length = 0
```

The test must prove:

* evaluation ID exists;
* ruleset ID exists;
* claim set was evaluated;
* required source coverage was sufficient;
* applicable class was evaluated;
* deterministic `no_match` result exists;
* zero-conflict set exists;
* this is structurally different from no engine invocation.

Do not satisfy this test by merely asserting an empty array.

---

## 28. Evaluation-Unavailable Test

Construct a supported `contact_address_lookup` claim where required source evidence cannot be evaluated because:

* a required source publication is unavailable; or
* the source-availability publication is unavailable.

Required outcome:

```text
evaluation_unavailable
```

The test must prove:

* no conflict is created;
* no zero-conflict claim is made;
* no `evaluated_no_conflict` outcome appears;
* one exact unevaluated reason is present;
* no model call occurs.

---

## 29. Evaluation-Unsupported Test

Construct a claim outside the Part 1 eligible claim vocabulary, such as:

```text
message_importance
```

or explicitly request a deferred conflict class.

Required outcome:

```text
evaluation_unsupported
```

The test must prove:

* no conflict is created;
* no zero-conflict set is misrepresented as evaluated;
* exact unsupported reason is present;
* the engine does not fall back to generic value comparison;
* deferred classes remain unimplemented.

---

## 30. Evaluation-Failed Test

Construct at least one malformed or incoherent case, such as:

* source observation references an unknown claim ID;
* ruleset identity does not match its body;
* canonical value normalization fails;
* source publication lacks immutable identity;
* conflict publication identity cannot be constructed.

Required outcome:

```text
evaluation_failed
```

The test must prove:

* no authoritative conflict set is released;
* no `evaluated_no_conflict` result appears;
* failure reason is structural;
* the engine fails closed.

---

## 31. Identity Integrity

Implement distinct identities for:

```text
ConflictEvaluationRuleset
ConflictEvaluation
GovernedConflictSet
individual governed conflict
```

Required tests shall prove none equals:

* governed claim ID;
* governed claim-set ID;
* thread ID;
* request ID;
* exchange ID;
* projection ID;
* any other publication identity.

Changing any material immutable body field must produce a new identity or fail construction.

At minimum test changes to:

### Ruleset

* comparison rule;
* eligible claim type;
* eligible source type;
* status restriction;
* normalization rule.

### Evaluation

* source publication set;
* claim set;
* reference time;
* outcome;
* ruleset.

### Conflict set

* conflict body;
* evaluated class;
* evaluated claim;
* source references.

### Individual conflict

* affected claim;
* source publication;
* normalized value;
* comparison key;
* status restriction.

Apply the Constitutional Publication Principles **Identity Integrity** rule explicitly.

---

## 32. EOS Reuse Option C Boundary

No new conflict-boundary module may import from:

```text
lib/executive-operating-system/
```

or any EOS structural-conflict package.

No new code may reference:

```text
structural_conflict
ExecutiveConflict
EOS conflict
```

except in:

* isolation tests;
* prohibited-import search targets;
* documentation explaining the boundary.

Do not reuse:

* EOS conflict types;
* EOS conflict constructors;
* EOS conflict evaluators;
* EOS conflict algorithms;
* EOS conflict identifiers;
* EOS status mappings.

Generic platform utilities may be reused only where they have no EOS semantic ownership, such as:

* hashing;
* immutable-object helpers;
* canonical sorting;
* generic validation.

Required test:

* pure-Node repository search confirms zero EOS semantic imports or references in all new runtime modules.

---

## 33. Deferred Taxonomy Classes

The ruleset shall explicitly represent:

```text
policy_incompatibility
temporal_commitment_incompatibility
```

as admitted by the root Sprint 3.90 taxonomy but unavailable in this implementation version.

A request to evaluate either shall produce:

```text
evaluation_unsupported
```

with a reason equivalent to:

```text
conflict_class_unsupported
```

or the contract's exact required reason.

Do not create placeholder evaluators returning no conflict.

A placeholder that always produces no conflict would falsely claim evaluation ran.

---

## 34. Claims-Engine Composition Boundary

Sprint 3.92 may consume:

* a Governed Claim Set fixture produced through the real Sprint 3.91 public constructor; or
* a faithful immutable claim-set fixture if direct use is technically impractical.

It shall not implement the full end-to-end claims-to-conflicts composition proof.

That proof belongs to the next sprint.

Do not:

* modify Sprint 3.91's engine;
* invoke free-text claim recognition as part of every conflict test;
* add route-level orchestration;
* claim the two systems are production-composed.

The central test must nevertheless use a real claim type and real claim identity shape from the Sprint 3.91 architecture.

---

## 35. Older Conflict Types

The repository currently contains at least two distinct conflict shapes:

* older claim-local `GovernedConflict`;
* projection-facing `GovernedConflictInput`.

Sprint 3.92 shall not silently collapse or replace them.

The new canonical conflict publication shall be defined according to Sprint 3.90.

The completion report shall state:

* how it differs from the older `GovernedConflict`;
* how it differs from `GovernedConflictInput`;
* whether a later adapter will be required;
* why no existing type was falsely relabeled as canonical.

Do not modify those existing types in this sprint unless Sprint 3.90 explicitly requires replacement and the change remains isolated.

The expected outcome is additive isolated publication types.

---

## 36. Isolation Boundary

Sprint 3.92 must remain fully isolated from production conversational execution.

Do not modify:

```text
app/api/chat/route.ts
lib/context-builder.ts
lib/useAgentConversation.ts
lib/agents/chat-execution.ts
```

Do not import the new modules into those files.

Do not modify production components.

Do not modify:

```text
lib/governed-conversation/projection-composer.ts
lib/governed-conversation/model-invocation.ts
lib/governed-conversation/validator.ts
```

Do not modify Sprint 3.91 core semantics.

Do not modify EOS runtime files.

Do not add a selector.

Do not change live behavior.

---

## 37. Isolation Proof

Use pure Node-based checks.

Do not depend on:

* `rg`;
* `execFileSync`;
* shell-only utilities unavailable in CI.

### Forward search

Search:

```text
app/api/chat/route.ts
lib/context-builder.ts
lib/useAgentConversation.ts
lib/agents/chat-execution.ts
```

for imports of:

```text
conflict-boundary-types
conflict-boundary-ruleset
conflict-boundary-engine
conflict-boundary-publications
conflict-boundary-fixtures
```

Expected:

```text
zero imports
```

### Reverse search

Search the new conflict-boundary runtime modules for imports from:

```text
app/api/chat/
lib/context-builder.ts
lib/useAgentConversation.ts
lib/agents/
production components
lib/executive-operating-system/
EOS structural-conflict modules
```

Expected:

```text
zero imports
```

### Blob-hash proof

Record pre/post hashes for:

```text
app/api/chat/route.ts
lib/context-builder.ts
lib/useAgentConversation.ts
lib/agents/chat-execution.ts
lib/governed-conversation/projection-composer.ts
```

Expected:

```text
byte-identical
```

Also confirm the Sprint 3.91 core modules remain unchanged unless a test-only fixture import is added without semantic modification.

---

## 38. Expected Change Surface

### New modules

Expected:

```text
lib/governed-conversation/conflict-boundary-types.ts
lib/governed-conversation/conflict-boundary-ruleset.ts
lib/governed-conversation/conflict-boundary-engine.ts
lib/governed-conversation/conflict-boundary-publications.ts
lib/governed-conversation/conflict-boundary-fixtures.ts
```

### New tests

Expected:

```text
lib/governed-conversation/conflict-boundary-ruleset.test.ts
lib/governed-conversation/conflict-boundary-engine.test.ts
lib/governed-conversation/conflict-boundary-publications.test.ts
lib/governed-conversation/conflict-boundary-isolation.test.ts
```

### Specification

```text
docs/SPRINT-3.92-ISOLATED-GOVERNED-CONFLICTS-BOUNDARY-IMPLEMENTATION.md
```

### Existing files

Existing isolated fixture files may be extended only where necessary to construct real claims or source observations.

Any existing file modification must be explicitly justified.

### Protected files

Expected unchanged:

```text
app/api/chat/route.ts
lib/context-builder.ts
lib/useAgentConversation.ts
lib/agents/chat-execution.ts
lib/governed-conversation/projection-composer.ts
lib/governed-conversation/model-invocation.ts
lib/governed-conversation/validator.ts
lib/governed-conversation/types.ts
lib/governed-conversation/claim-boundary-types.ts
lib/governed-conversation/claim-boundary-ruleset.ts
lib/governed-conversation/claim-boundary-engine.ts
lib/governed-conversation/claim-boundary-publications.ts
```

---

## 39. Explicitly Out of Scope

Do not implement:

* `policy_incompatibility`;
* `temporal_commitment_incompatibility`;
* generic multi-class dispatch beyond explicit unsupported handling;
* Gmail evidence production;
* Calendar evidence production;
* memory or priority production;
* connector availability;
* source-evidence registry;
* source precedence;
* alias identity resolution;
* cross-claim conflicts;
* cross-claim-set conflicts;
* cross-exchange conflicts;
* cross-thread conflicts;
* EOS mapping;
* composer integration;
* claim-engine/conflict-engine composition proof;
* model invocation;
* response-envelope changes;
* `/api/chat` integration;
* selector;
* client rendering;
* persistence;
* operator verification;
* promotion.

Do not reopen Sprint 3.90.

---

## 40. Required Tests

At minimum, provide tests for:

### Ruleset

1. immutable ruleset publication;
2. stable identity for identical body;
3. changed identity or construction rejection for changed body;
4. exactly one executable conflict class;
5. exactly two deferred classes;
6. exactly one eligible claim type;
7. no open extension map;
8. fixed source-value comparison rule;
9. fixed status restriction;
10. fixed no-conflict proof rule.

### Engine

11. claim set is mandatory;
12. no claim set means no conflict evaluation;
13. unknown claim ID fails closed;
14. inadmissible source is not treated as evidence;
15. same claim/property/scope with incompatible values produces conflict;
16. different entity does not produce conflict;
17. different comparison key does not produce conflict;
18. superseded value does not automatically produce conflict;
19. equivalent normalized values do not produce conflict;
20. source silence does not produce conflict;
21. unavailable marker is not a factual conflict value.

### Outcomes

22. real `evaluated_conflict_found`;
23. real `evaluated_no_conflict`;
24. real `evaluation_unavailable`;
25. real `evaluation_unsupported`;
26. real `evaluation_failed`;
27. `partially_evaluated` is present in the closed outcome type but never produced by any Part 1 scenario — assert this directly with a test that runs a representative Part 1 case and confirms the outcome is never `partially_evaluated`, with a comment tracing the single-cell reasoning from Section 18;
28. no-conflict outcome has a zero-conflict set;
29. unavailable outcome is structurally distinct from no conflict;
30. unsupported outcome is structurally distinct from unavailable;
31. failed outcome releases no authoritative set.

### Conflict publication

32. correct conflict class;
33. correct affected claim IDs;
34. correct source references;
35. correct source-owner IDs;
36. correct comparison key;
37. correct status restriction;
38. both incompatible values preserved;
39. deterministic description reference;
40. no source winner selected.

### Identity

41. ruleset ID distinct from evaluation ID;
42. evaluation ID distinct from conflict-set ID;
43. conflict-set ID distinct from conflict ID;
44. no conflict identity aliases claim ID;
45. no publication identity aliases exchange ID;
46. body changes produce new identity or rejection.

### Deferred classes

47. policy incompatibility request produces unsupported;
48. temporal incompatibility request produces unsupported;
49. neither produces an empty evaluated-no-conflict result.

### EOS boundary

50. no EOS runtime import;
51. no EOS conflict type import;
52. no EOS conflict algorithm reference;
53. pure-Node search passes.

### Isolation

54. zero forward imports into production chat files;
55. zero reverse imports from prohibited production files;
56. protected file hashes remain identical;
57. full test suite passes.

---

## 41. Full Validation

Run the full repository validation suite:

```text
npm test
npm run build
npm run lint
npm run typecheck
git diff --check
```

Use current repository-defined equivalents if materially different.

Also run targeted suites for:

* conflict ruleset;
* source-value contradiction engine;
* evaluation outcomes;
* no-conflict proof;
* publication identity;
* deferred-class behavior;
* EOS non-reuse;
* isolation proof.

Record exact commands and results.

No proportionality exception applies.

---

## 42. Completion Report

The completion report shall contain the following sections.

### Repository Precondition

Report:

* repository;
* branch;
* starting commit;
* working-tree state;
* required documents;
* inspected claim/conflict/composer/EOS files.

### Governing Artefacts Reviewed

List every governing document read.

### Sprint 3.90 Decisions Implemented

Confirm:

```text
Conversational Conflict Architecture: Option B
Conflict Claim-Linkage Decision: Option A
Projection Composer Conflict Role: Option A
Conflict Evaluation Owner: Option A
EOS Structural Conflict Reuse: Option C
Conflict Evaluation-State Architecture: Option A
```

Confirm no decision was reopened.

### Scope

State:

```text
Implemented conflict class:
- source_value_contradiction

Deferred:
- policy_incompatibility
- temporal_commitment_incompatibility
```

### Modules Added

List every new module and responsibility.

### Ruleset

Report:

* ruleset ID;
* schema version;
* ruleset version;
* root taxonomy;
* executable class;
* deferred classes;
* eligible claim type;
* eligible source types;
* comparison key;
* normalization;
* status restriction;
* no-conflict rule.

### Engine

Describe:

* input;
* admissibility;
* claim linkage;
* comparison;
* canonical relation key;
* evaluation outcome derivation;
* conflict-set publication.

### Central Contradiction Proof

Report:

* real claim;
* source publications;
* values;
* engine execution;
* evaluation outcome;
* conflict set;
* conflict identity;
* affected claim IDs;
* status restriction;
* preserved values.

### No-Conflict Proof

Report:

* claim;
* source evidence;
* complete evaluation evidence;
* `evaluated_no_conflict`;
* zero-conflict set;
* structural distinction from no execution.

### Other Evaluation Outcomes

Report real tests for:

* `evaluation_unavailable`;
* `evaluation_unsupported`;
* `evaluation_failed`.

### Six-State Vocabulary and `partially_evaluated` Reachability

State explicitly:

* the `ConflictEvaluation` outcome type declares all six states from Sprint 3.90's binding vocabulary;
* `partially_evaluated` is structurally unreachable in Part 1's single-cell scope (one claim type × one conflict class), per the reasoning in Section 18;
* the required test proving this unreachability, and its result.

Do not describe `partially_evaluated` as merely "not implemented" or "deferred" — it is present in the type, proven unreachable in this scope by test.

### Identity Integrity

Report identity-distinction and mutation evidence.

### EOS Boundary

State:

* no EOS semantic import;
* no EOS type reuse;
* no EOS algorithm reuse;
* pure-Node search result.

### Composer Boundary

State explicitly:

> Sprint 3.92's engine runs upstream of the projection composer. The composer was not modified and does not derive conflicts.

### Existing Conflict Types

Explain the relationship among:

* new canonical conflict publication;
* older `GovernedConflict`;
* existing `GovernedConflictInput`.

### Deferred-Class Proof

Show that deferred classes return unsupported and are not treated as evaluated-no-conflict.

### Isolation Proof

Report:

* forward search;
* reverse search;
* blob hashes;
* pure-Node implementation.

### Files Changed

List every added or modified file with one-line reason.

### Protected Files

List pre/post hashes for protected files.

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

> Sprint 3.92 changes no live conversational behavior and performs no production integration.

### Outstanding Findings

List real limitations, including deferred classes and unimplemented composition.

### Next Step

Identify the next permitted sprint.

Expected candidate:

```text
Sprint 3.93 — Governed Claims and Conflicts Composition Evaluation
```

or another narrowly scoped evaluation sprint based on the actual implementation result.

Do not claim production readiness.

---

## 43. Recommendation Gate

The completion report must end with exactly one:

> **Implementation Complete**

or:

> **Implementation Incomplete**

No other wording is permitted.

### Implementation Complete

Use only if:

* Sprint 3.90 was available and followed;
* only `source_value_contradiction` was implemented;
* the ruleset is immutable and versioned;
* the dedicated engine exists;
* strict claim linkage is enforced;
* source admissibility is enforced;
* the outcome type declares all six Sprint 3.90 states, with `partially_evaluated` proven structurally unreachable in this scope by a real test, not merely omitted;
* all five actively-exercised outcome paths are real;
* conflict found is computed by the engine;
* no conflict is proven through an explicit evaluation and zero-conflict set;
* unavailable is distinct from no conflict;
* unsupported is distinct from unavailable;
* failure is fail-closed;
* canonical conflict identity exists;
* ruleset, evaluation, set, and conflict IDs are distinct;
* no ID aliases a claim or exchange ID;
* status restriction is deterministic;
* conflicting values are preserved;
* no source winner is invented;
* deferred classes remain unimplemented and return unsupported;
* composer semantics remain unchanged;
* no EOS semantic import or reuse exists;
* isolation proof passes;
* protected files remain byte-identical;
* full validation passes;
* no production integration occurred.

### Implementation Incomplete

Use if:

* implementing source-value contradiction requires either deferred class;
* the composer must derive conflicts;
* the existing claim type must be changed;
* claim linkage cannot be enforced;
* no-conflict cannot be distinguished structurally from no evaluation;
* only some required outcome states are implemented, or `partially_evaluated` is silently dropped from the type rather than proven unreachable;
* a conflict is produced from source unavailability alone;
* an EOS conflict type or algorithm is required;
* publication identities alias other identities;
* conflicting values cannot be preserved;
* source precedence must be invented;
* a protected production file must change;
* isolation fails;
* sprint-created validation failure remains;
* Sprint 3.90 must be reopened.

Stop and report the exact evidence.

Do not work around it.

---

## 44. Return Format

Return:

1. Repository Precondition result.
2. Governing artefacts reviewed.
3. Starting repository state.
4. Sprint 3.90 decisions implemented.
5. Exact implemented and deferred conflict classes.
6. Modules and tests added.
7. Ruleset publication and identity.
8. Eligible claim and source boundaries.
9. Conflict-engine implementation.
10. Central contradiction proof.
11. No-conflict proof.
12. Evaluation-unavailable proof.
13. Evaluation-unsupported proof.
14. Evaluation-failed proof.
15. Six-state vocabulary and `partially_evaluated` reachability proof.
16. Canonical conflict publication.
17. Status-restriction result.
18. Conflicting-value preservation.
19. Identity Integrity tests.
20. Deferred-class proof.
21. EOS non-reuse proof.
22. Composer upstream-boundary proof.
23. Existing conflict-type relationship.
24. Isolation forward-search result.
25. Isolation reverse-search result.
26. Protected-file hash comparison.
27. Every changed file with one-line reason.
28. Targeted test results.
29. Full validation results.
30. Explicit statement that no production integration occurred.
31. Outstanding findings.
32. Recommended next sprint.
33. Final recommendation gate.

The final line must be exactly:

> **Implementation Complete**

or:

> **Implementation Incomplete**

---

## 45. Success Criteria

Sprint 3.92 succeeds when the following isolated chain exists as real code:

```text
Governed contact-address claim
        ↓
admissible source-owned observations
        ↓
immutable source-value conflict ruleset
        ↓
dedicated deterministic conflict engine
        ↓
ConflictEvaluation
        ↓
GovernedConflictSet
        ↓
canonical source-value conflict or proved no-conflict
```

For contradictory source values:

```text
source A → cassie.primary@example.com
source B → cassie.hayward@example.org
```

the engine must publish:

```text
evaluated_conflict_found
→ one source_value_contradiction
→ correct affected claim
→ both source values preserved
→ deterministic status restriction
```

For non-contradictory evidence, the engine must publish:

```text
evaluated_no_conflict
→ real evaluation publication
→ complete evaluated scope
→ zero-conflict GovernedConflictSet
```

For unavailable, unsupported, or failed evaluation, the system must publish an explicit structurally different outcome.

The outcome type declares all six states from Sprint 3.90's binding vocabulary; `partially_evaluated` is proven, not assumed, to be unreachable given this sprint's single-cell scope.

An empty array shall never carry the meaning of "evaluation ran."

The projection composer remains a later consumer.

EOS conflict meaning remains separate.

Sprint 3.92 does not make conflict evaluation live.

It creates the first real, deterministic, versioned conflict class in isolation.
