# Sprint 3.90 — Governed Conversational Conflicts Boundary Contract

**Status:** Specification
**Sprint Type:** Governance Decision / Conflicts Boundary Contract
**Implementation Authority:** None
**Output Path:** `docs/SPRINT-3.90-GOVERNED-CONVERSATIONAL-CONFLICTS-BOUNDARY-CONTRACT.md`
**Document Convention:** Single-file specification and completed contract

---

## 1. Purpose

Sprint 3.90 establishes the binding deterministic boundary for conflicts in the governed conversational runtime.

Sprint 3.88 found that the existing projection architecture accepts structured conflicts but does not derive them. It also found no production owner capable of constructing claim-aware conversational conflicts.

Sprint 3.89 subsequently established:

* **Claims-Boundary Architecture: Option C** — explicit typed intent, followed by closed deterministic recognition, deterministic clarification, and fail-closed unsupported;
* claims exist before model invocation;
* claims are independently identified, typed, materiality-scored, source-scoped, coverage-bounded, and published through a versioned Governed Claim Set;
* the answering model cannot create, merge, classify, or redefine claims;
* conflicts require a separate dependent contract;
* the next permitted sprint is the dependent conflicts contract.

Sprint 3.90 executes that governance step.

Its purpose is to answer the ten conflict questions scoped by Sprint 3.88 as binding decisions.

The central objective is:

> **Define when a governed conversational conflict exists, how it is deterministically evaluated and published, how it restricts affected claims, and how the system proves the difference between "no conflict found" and "conflict evaluation did not run."**

This sprint does not implement conflict detection.

It creates the contract a future isolated implementation sprint must follow.

---

## 2. Sprint Character

This is a governance-decision sprint.

It is not:

* an implementation sprint;
* a conflict-engine implementation;
* a source-normalisation sprint;
* a projection-composer modification;
* a claims-boundary revision;
* an EOS integration sprint;
* a route-integration sprint;
* an operator-verification sprint;
* a promotion sprint.

No code changes are authorised.

The only authorised output is:

```text
docs/SPRINT-3.90-GOVERNED-CONVERSATIONAL-CONFLICTS-BOUNDARY-CONTRACT.md
```

Following the Sprint 3.89 convention, this file shall be used for both:

1. the submitted specification; and
2. the completed governed contract.

On completion, the same file shall be replaced in place and shall begin with:

```text
**Status:** Complete
```

No separate completion-report document shall be created.

---

## 3. Governing Hierarchy

The governance review shall apply the repository's established hierarchy:

1. JARVIS Engineering Constitution
2. JARVIS North Star
3. JARVIS Engineering Specification Standard
4. Constitutional Publication Principles
5. `docs/architecture/ROADMAP.md`
6. Sprint 3.89 — Governed Conversational Claims Boundary Contract
7. Sprint 3.82 — Governed Conversational Lineage Identity Contract
8. Sprint 3.76 — Governed Conversational Runtime Contract
9. Sprint 3.85 — Governed Conversational Identity Correction Contract
10. Sprint 3.88 — Governed Conversational Production Evidence Audit
11. accepted responsibility statements and ADRs
12. current governed-conversation conflict types, composer behavior, fixtures, evaluation code, and validators
13. this Sprint specification

Sprint 3.89 is binding for:

* claim identity;
* claim type;
* claim materiality;
* source and coverage requirements;
* polarity;
* unsupported outcomes;
* claim-set publication;
* `claimClassificationRulesetId`;
* the pre-model ownership boundary.

Sprint 3.90 shall not reopen any Sprint 3.89 decision.

Sprint 3.82 remains binding for:

* exclusive ownership of projection composition;
* immutable publication identity;
* source/reference minimisation;
* claim-linked conflict requirements;
* the prohibition on route, model, prompt builder, context builder, or legacy state becoming canonical projection owners.

Sprint 3.76 remains binding for:

* deterministic evidence status;
* governed-over-legacy precedence;
* uncertainty preservation;
* model-owned interpretation;
* non-authoritative recommendations;
* validation before response release.

---

## 4. Repository Precondition

Before drafting any governance decision:

1. Confirm the intended repository and branch.
2. Record the current commit.
3. Confirm the working-tree state.
4. Confirm the following governing artefacts exist:

```text
docs/ENGINEERING_CONSTITUTION.md
docs/architecture/NORTH_STAR.md
docs/architecture/JARVIS-Engineering-Specification-Standard.md
docs/CONSTITUTIONAL-PUBLICATION-PRINCIPLES.md
docs/architecture/ROADMAP.md

docs/audits/SPRINT-3.88-GOVERNED-CONVERSATIONAL-PRODUCTION-EVIDENCE-AUDIT.md
docs/SPRINT-3.89-GOVERNED-CONVERSATIONAL-CLAIMS-BOUNDARY-CONTRACT.md
docs/SPRINT-3.76-GOVERNED-CONVERSATIONAL-RUNTIME-CONTRACT.md
docs/SPRINT-3.82-GOVERNED-CONVERSATIONAL-LINEAGE-IDENTITY-CONTRACT.md
docs/SPRINT-3.85-GOVERNED-CONVERSATIONAL-IDENTITY-CORRECTION-CONTRACT.md
```

5. Read Sprint 3.89 completely.
6. Confirm directly that Sprint 3.89 records:

   * **Claims-Boundary Architecture: Option C**;
   * **Conflicts Contract Decision: Option A**;
   * the Governed Claim Set publication;
   * the Claim Boundary Ruleset publication;
   * the Claim Boundary Evaluation publication;
   * the closed claim vocabulary and ownership rules;
   * the exact next-step statement identifying the dependent conflicts contract.
7. Read Sprint 3.88 completely.
8. Read its **Conflicts Finding** in full.
9. Trace and record answers to all ten scoped conflict questions, even though Sprint 3.88 presents them through prose rather than a numbered list.
10. Read Sprint 3.76, Sprint 3.82, Sprint 3.85, and the Roadmap completely.
11. Inspect the current definitions and tests for:

```text
GovernedConflictInput
GovernedConflict
GovernedClaimInput
GovernedClaimSet
claimClassificationRulesetId
affectedClaimIds
sourceOwners
statusRestriction
descriptionReference
claim-local conflicts
```

12. Inspect the projection composer to determine whether it:

* derives conflicts;
* validates supplied conflicts;
* aggregates supplied conflicts;
* checks affected claim IDs;
* modifies claim status based on conflicts.

13. Inspect fixtures and evaluation modules that construct conversational conflicts.
14. Inspect EOS structural-conflict types and their production construction path.
15. Confirm whether any production conversational conflict engine currently exists.
16. Confirm only the Sprint 3.90 contract file may change.

If Sprint 3.88 or Sprint 3.89 is absent:

* do not reconstruct the missing governance from conversation history;
* do not infer the ten conflict questions;
* do not proceed.

Return:

> **Governance Review Incomplete — Required Predecessor Unavailable**

If repository evidence materially contradicts the governing contracts, stop and report the contradiction rather than silently resolving it through implementation assumptions.

---

## 5. Governing Question

Sprint 3.90 must answer:

> **What deterministic, versioned relation constitutes a governed conversational conflict, how is that relation evaluated against an existing Governed Claim Set, and what immutable publications prove whether conflict evaluation ran and what it found?**

The answer must ensure that:

* conflicts are not merely unequal strings;
* source failure is not automatically a conflict;
* model disagreement is not automatically a conflict;
* calendar overlap is not automatically a conversational conflict;
* legacy output does not acquire canonical authority;
* an empty conflict array does not falsely prove conflict-free evidence;
* the answering model cannot decide whether a conflict exists.

---

## 6. Conflict-Boundary Principles

The completed contract shall preserve the following principles.

### 6.1 Claims precede conflicts

Conflict evaluation occurs only after a valid Governed Claim Set exists.

### 6.2 Conflicts are deterministic

Conflict evaluation is performed by an identified, versioned deterministic owner before model invocation.

### 6.3 Conflicts restrict; they do not adjudicate

A conflict may restrict claim status, confidence, completeness, or permissible model phrasing.

It shall not decide which source is substantively "correct" unless a separate governed precedence rule already establishes that result.

### 6.4 Source ownership remains intact

The conflict engine compares source-owned governed observations.

It does not recreate, normalise, or alter source publications.

### 6.5 No model-owned conflict creation

The model may explain a published conflict.

It may not:

* detect an unpublished conflict;
* decide source precedence;
* invent affected claims;
* convert uncertainty into contradiction;
* declare evidence conflict-free without a completed evaluation.

### 6.6 No mechanism-to-meaning transfer

A reusable algorithm, type, or storage mechanism does not transfer the semantic meaning of EOS structural conflict into conversational evidentiary conflict.

### 6.7 Evaluation absence is explicit

"No conflict detected" and "conflict evaluation did not run" are different structural outcomes.

### 6.8 Identity integrity

One immutable identity shall correspond to one immutable canonical object.

Ruleset, evaluation, conflict-set, conflict, claim-set, claim, exchange, and projection identities shall not alias one another.

---

## 7. Independent Decision Requirement

Sprint 3.88 identified evidence and questions.

Sprint 3.90 must independently decide them.

For each of the ten questions, the completed contract shall:

1. state the precise decision problem;
2. identify applicable governing principles;
3. define named options;
4. explain each option's consequences;
5. select one binding option or one fixed named combination;
6. reject the alternatives;
7. identify the architectural owner;
8. identify implementation consequences;
9. state what is prohibited.

Restating Sprint 3.88's prose is not an independent decision.

---

## 8. Prohibited Hedge Language

The completed contract shall not use any of the following as a final decision:

* "reuse where practical";
* "where appropriate";
* "as needed";
* "depending on the situation";
* "implementation may decide";
* "may vary" without a closed rule;
* "potentially";
* "prefer";
* "generally";
* "could include";
* "one or more mechanisms" without deterministic precedence;
* "future work will determine" for any of the ten required questions;
* "use EOS conflicts where useful";
* "an empty list usually means no conflict."

A fixed architecture may contain multiple conflict classes only where:

* the taxonomy is closed;
* each class has a precise test;
* precedence is deterministic;
* non-membership is explicit;
* implementation cannot invent additional classes.

---

# Part I — Central Conflict Architecture

## 9. Named Conflict-Taxonomy Options

The completed contract shall select exactly one central taxonomy architecture.

### Option A — Source-Value Contradiction Only

A conflict exists only where two or more admissible source-owned governed observations make mutually incompatible factual assertions about the same affected claim and comparison scope.

Other restrictions—availability failure, status inconsistency, calendar incompatibility, or prior assistant disagreement—are represented outside the conflict system.

#### Consequences

* narrowest semantic boundary;
* strong auditability;
* risks excluding materially relevant structural incompatibilities;
* requires separate treatment of non-value restrictions.

---

### Option B — Closed Multi-Class Claim Restriction Taxonomy

A conflict exists only where one of a closed set of deterministic claim-linked relations is satisfied.

The taxonomy may include:

* source-value contradiction;
* source-coverage incompatibility;
* source-policy incompatibility;
* temporal/commitment incompatibility;
* claim-status coherence failure;
* prior-output contradiction after current governed revalidation.

Each class must have:

* a fixed meaning;
* eligible source classes;
* comparison requirements;
* restricting status;
* coverage rule;
* versioned evaluator.

Relations outside the closed taxonomy are not conflicts.

#### Consequences

* captures multiple genuine restriction types;
* remains deterministic;
* requires careful distinction between conflict and mere unavailability;
* requires a versioned ruleset covering all admitted classes.

---

### Option C — Domain-Specific Conflict Taxonomies Only

No cross-domain conflict taxonomy exists.

Each claim family defines its own conflict classes and evaluator.

The common architecture provides only identity, claim linkage, and publication envelopes.

#### Consequences

* preserves domain specificity;
* delays cross-domain conflict handling;
* risks duplicated semantics and inconsistent no-conflict proof;
* requires separate contracts for every claim family.

---

### Option D — No Automated Conversational Conflict Evaluation

The governed conversation runtime accepts only externally supplied conflicts from independently governed source systems.

It performs no conversational conflict evaluation.

If no external governed conflict publication exists, conflict evaluation remains unavailable.

#### Consequences

* avoids premature inference;
* prevents cross-source conflict support in ordinary chat;
* leaves a major projection category unavailable;
* makes production integration dependent on future source-level conflict publishers.

---

## 10. Required Central Decision

The completed contract shall state exactly:

> **Conversational Conflict Architecture: Option A / Option B / Option C / Option D**

Exactly one option shall be selected.

The reasoning shall explain:

* what constitutes a conflict;
* what does not;
* how the taxonomy remains closed;
* how claim identity constrains evaluation;
* why rejected options are not selected;
* whether a common ruleset or domain-specific ruleset owns each class.

---

# Part II — The Ten Binding Conflict Questions

## 11. Question 1 — Can a Conflict Exist Without an Affected Claim?

Sprint 3.88 asked whether a conflict can exist without an affected claim.

The contract shall select exactly one:

### Claim-Linkage Option A — Strict Claim Linkage

Every governed conversational conflict must reference at least one existing claim ID from the Governed Claim Set under evaluation.

No claim means no conversational conflict.

Unrelated source inconsistencies may exist elsewhere but are not conversational conflict publications.

### Claim-Linkage Option B — Independent Environmental Conflicts

A conflict may exist independently and later become associated with claims.

This requires a separate environmental-conflict publication and identity domain.

### Required decision

State exactly:

> **Conflict Claim-Linkage Decision: Option A / Option B**

The decision shall address:

* whether affected claims are mandatory;
* whether one conflict may affect multiple claims;
* whether a conflict may reference claims from different claim sets;
* whether unsupported segments can have conflicts;
* whether no-claim evaluations can produce conflicts.

No implicit exception is permitted.

---

## 12. Question 2 — What Identities Link Conflict, Claim, and Sources?

Sprint 3.88 asked what identities link conflict to claims and source-owned observations.

The contract shall define the complete identity chain.

At minimum evaluate:

```text
Claim Boundary Ruleset
        ↓
Claim Boundary Evaluation
        ↓
Governed Claim Set
        ↓
Claim
        ↓
Conflict Evaluation
        ↓
Governed Conflict Set
        ↓
Governed Conflict
        ↓
Source Publication References
```

The contract shall define:

* conflict ruleset identity;
* conflict evaluation identity;
* conflict-set identity;
* individual conflict identity;
* affected claim IDs;
* source publication references;
* source owner IDs;
* projection identity relationship;
* exchange/request/thread references;
* retry behavior;
* content-derived versus event-derived identity.

The contract shall prohibit:

* using a claim ID as a conflict ID;
* using a conflict-set ID as an evaluation ID;
* using the projection ID as the conflict-set identity;
* using an exchange ID as an individual conflict identity;
* mutable conflict bodies under one identity.

### Required decision format

> **Conflict Identity Chain:** [binding chain]

> **Conflict Identity Rule:** [binding immutable-object rule]

---

## 13. Question 3 — Which Owners Establish the Underlying Observations?

Sprint 3.88 asked which source owners establish the observations being compared.

The contract shall distinguish:

* source-specific evidence publishers;
* cross-source evidence registry;
* claim ruleset;
* conflict ruleset;
* conflict evaluator;
* projection composer.

The conflict evaluator shall not become a source owner.

The contract shall decide:

* what qualifies as an admissible source publication;
* whether legacy compatibility data may participate;
* whether prior assistant output may participate;
* whether operator assertions may participate;
* whether unavailable sources may be conflict participants;
* whether one-source contradictions are possible through multiple observations;
* whether policy version differences are source observations or conflict metadata.

### Required decision format

> **Admissible Conflict Source Owners:** [closed list or closed rule]

> **Prohibited Conflict Inputs:** [closed list]

---

## 14. Question 4 — Does the Projection Composer Derive or Aggregate Conflicts?

Sprint 3.88 asked whether the composer derives conflicts or merely aggregates them.

The contract shall select exactly one:

### Composer Option A — Aggregate and Validate Only

The conflict owner runs before projection and publishes a Governed Conflict Set.

The composer:

* validates claim/source references;
* includes the publication;
* preserves status restrictions;
* does not derive new conflicts.

### Composer Option B — Composer-Owned Derivation

The composer evaluates evidence and creates conflicts while composing the projection.

### Required decision

State exactly:

> **Projection Composer Conflict Role: Option A / Option B**

The decision shall address:

* whether the composer may merge duplicate conflicts;
* whether it may alter restricting status;
* whether it may drop conflicts;
* whether it may infer no-conflict;
* whether it may validate but not derive.

---

## 15. Question 5 — What Deterministic and Versioned Rules Govern Conflict Evaluation?

Sprint 3.88 asked whether deterministic/versioned conflict rules already exist and what must govern them.

The contract shall define:

* ruleset owner;
* schema version;
* ruleset version;
* admitted conflict classes;
* eligible claim types;
* eligible evidence classes;
* comparison keys;
* temporal and coverage requirements;
* precedence rules;
* restricting-status mapping;
* conflict-description references;
* no-conflict proof requirements;
* unknown/unevaluated behavior.

The completed contract shall decide whether:

* one cross-domain ruleset exists;
* domain modules exist under one root ruleset;
* every claim family requires a separately versioned child ruleset;
* another fixed architecture applies.

### Required decision format

> **Conflict Ruleset Architecture:** [binding architecture]

> **Conflict Ruleset Owner:** [named owner]

---

## 16. Question 6 — Does a Production Conflict Engine Already Exist?

Sprint 3.88 asked whether any production engine exists under another package.

The completed contract shall record the repository finding as one of:

* no production conversational conflict engine exists;
* an existing engine can be reused without changing meaning;
* an existing engine supplies only mechanism and requires a new semantic owner.

This is a governance contract, not an audit repetition.

The decision must state whether future implementation shall:

* create a dedicated Governed Conversational Conflict Engine;
* adapt an existing engine under a new governed ruleset;
* consume source-produced conflict publications only;
* use another named architecture.

### Required decision format

> **Conflict Evaluation Owner:** [named owner]

> **Existing Engine Reuse Decision:** [binding decision]

---

## 17. Question 7 — May EOS Structural Conflicts Be Reused?

Sprint 3.88 asked whether EOS structural conflicts can be honestly reused.

The contract shall select exactly one:

### EOS Reuse Option A — Semantic Reuse Prohibited

EOS structural conflicts and conversational evidentiary conflicts are separate publication domains.

Existing EOS conflict records may not be copied or retyped into conversational conflicts.

They may be referenced only as source publications where a future governed claim type explicitly admits them as evidence.

### EOS Reuse Option B — Direct Reuse Permitted

EOS structural conflicts may directly satisfy conversational conflict input where identifiers can be mapped.

### EOS Reuse Option C — Governed Mapping Permitted

A future mapping contract may transform narrowly defined EOS conflict classes into conversational conflicts where semantic equivalence is proven.

No mapping is allowed until that separate contract exists.

### Required decision

State exactly:

> **EOS Structural Conflict Reuse: Option A / Option B / Option C**

The reasoning shall apply:

> **Mechanism reuse cannot transfer meaning.**

It shall explain why shared fields, types, or algorithms do or do not establish semantic equivalence.

---

## 18. Question 8 — What Constitutes Cross-Domain Conflation?

Sprint 3.88 asked what would constitute cross-domain conflation.

The contract shall define prohibited conflation explicitly.

At minimum address:

* EOS structural conflict treated as conversational evidence contradiction;
* Calendar overlap treated as communication conflict;
* source unavailability treated as value contradiction;
* model disagreement treated as source conflict;
* prior assistant error treated as canonical conflict without revalidation;
* policy disagreement treated as factual contradiction;
* one claim family's conflict rule applied to another without authorization;
* shared identifier formats treated as shared meaning.

### Required decision format

> **Cross-Domain Conflict Boundary:** [binding rule]

The contract shall define what evidence is required before a relation may cross claim families or domains.

---

## 19. Question 9 — Does an Empty Conflict Array Prove No Conflict?

Sprint 3.88 asked whether empty conflicts are valid only when evaluation actually ran.

The contract shall select exactly one structural architecture.

### Evaluation-State Option A — Explicit Evaluation Publication

Every Governed Claim Set receives a Conflict Evaluation publication with a closed outcome:

```text
evaluated_no_conflict
evaluated_conflict_found
evaluation_unavailable
evaluation_unsupported
evaluation_failed
```

A conflict set exists only for evaluated outcomes.

An empty set is authoritative only under `evaluated_no_conflict`.

### Evaluation-State Option B — Optional Marker on Projection

The projection includes a Boolean or enum saying whether conflict evaluation ran.

No separate evaluation publication is required.

### Evaluation-State Option C — Empty Array Convention

An empty array means no conflict.

Absence of the field means evaluation did not run.

### Required decision

State exactly:

> **Conflict Evaluation-State Architecture: Option A / Option B / Option C**

The decision shall define:

* whether every claim is evaluated;
* whether evaluation is claim-set-wide or claim-local;
* how partial evaluation is represented;
* whether one claim can be evaluated while another is unevaluated;
* whether evaluation failure restricts claim status;
* whether an unsupported conflict class differs from unavailable sources.

---

## 20. Question 10 — What Proves "No Conflict" Versus "Unevaluated"?

Sprint 3.88 asked what evidence proves no conflict rather than unavailable evaluation.

The contract shall define the minimum proof required for:

### Evaluated — no conflict

At minimum consider:

* ruleset ID;
* evaluation ID;
* claim-set ID;
* evaluated claim IDs;
* evaluated conflict classes;
* admissible source references;
* source coverage;
* source availability;
* comparison scope;
* evaluation time;
* deterministic result;
* conflict-set identity.

### Unevaluated

At minimum distinguish:

* conflict class unsupported;
* required source unavailable;
* insufficient source coverage;
* ruleset absent;
* evaluator failure;
* claim type outside ruleset;
* evaluation intentionally deferred.

The contract shall prohibit inferring no conflict from:

* no supplied conflicts;
* one available source;
* source silence;
* no model objection;
* empty compatibility context;
* an empty array without evaluation proof.

### Required decision format

> **No-Conflict Proof Rule:** [binding rule]

> **Unevaluated Representation:** [binding representation]

---

# Part III — Closed Conflict Taxonomy

## 21. Required Taxonomy

The completed contract shall define one closed taxonomy corresponding to the selected architecture.

It must explicitly decide the status of each candidate relation below.

### 21.1 Source-value contradiction

Two or more admissible source publications make mutually incompatible factual assertions about the same claim property, entity, and comparison scope.

### 21.2 Source-availability disagreement

Sources differ in availability or authorization state.

The contract shall decide whether this is:

* a conflict;
* an availability restriction;
* a coverage condition;
* another governed relation.

### 21.3 Claim-status inconsistency

Different evaluators or evidence paths produce incompatible statuses for one claim.

The contract shall decide whether this is:

* a conflict;
* a validation defect;
* a publication-coherence failure;
* another category.

### 21.4 Temporal or commitment incompatibility

Two or more governed commitments cannot all be satisfied under their temporal or resource constraints.

The contract shall decide whether this belongs in:

* conversational conflict;
* Calendar claim-family conflict;
* EOS reasoning;
* another future domain.

### 21.5 Prior assistant-output contradiction

A prior assistant statement conflicts with current governed evidence.

The contract shall decide whether prior output is:

* a conflict participant;
* non-canonical dialogue requiring correction;
* admissible only after current revalidation;
* never source evidence.

### 21.6 Policy incompatibility

Two applicable policies impose incompatible treatment.

The contract shall distinguish policy conflict from factual contradiction.

### 21.7 Coverage incompatibility

Available evidence sources cover different scopes such that a claim cannot be resolved coherently.

The contract shall decide whether this is conflict, insufficient coverage, or both under a closed rule.

### 21.8 Operator assertion contradiction

An operator-provided statement conflicts with current governed evidence.

The contract shall decide whether operator assertions are:

* source evidence;
* non-canonical context;
* clarification input;
* conflict participants under a special class.

### 21.9 Model-output contradiction

The current model output contradicts the Governed Claim Set or source facts.

The contract shall state whether this is:

* a conflict publication;
* a validation failure;
* an invented-fact violation;
* another model-governance result.

### 21.10 Other relations

The completed contract shall state:

> Relations not explicitly admitted by the closed taxonomy are not governed conversational conflicts.

Implementation shall not add an "other" conflict class.

---

## 22. Required Taxonomy Matrix

The completed contract shall include:

| Candidate relation                   | Conflict class? | Governing owner | Required claim linkage | Required evidence | Result if not a conflict |
| ------------------------------------- | ---------------: | ---------------- | ------------------------ | ------------------- | --------------------------- |
| Source-value contradiction           |          Yes/No | ...              | ...                      | ...                 | ...                          |
| Source-availability disagreement     |          Yes/No | ...              | ...                      | ...                 | ...                          |
| Claim-status inconsistency           |          Yes/No | ...              | ...                      | ...                 | ...                          |
| Temporal/commitment incompatibility  |          Yes/No | ...              | ...                      | ...                 | ...                          |
| Prior assistant-output contradiction |          Yes/No | ...              | ...                      | ...                 | ...                          |
| Policy incompatibility               |          Yes/No | ...              | ...                      | ...                 | ...                          |
| Coverage incompatibility             |          Yes/No | ...              | ...                      | ...                 | ...                          |
| Operator assertion contradiction     |          Yes/No | ...              | ...                      | ...                 | ...                          |
| Model-output contradiction           |          Yes/No | ...              | ...                      | ...                 | ...                          |

No row may remain open.

---

# Part IV — Conflict Ownership and Publications

## 23. Conflict Evaluation Owner

The contract shall name one deterministic owner.

Candidate options shall include:

### Owner Option A — Governed Conversational Conflict Engine

A dedicated engine applies the versioned conflict ruleset to:

* one Governed Claim Set;
* admissible source publications;
* source availability;
* coverage records;
* permitted prior-context references.

It publishes the evaluation and conflict set.

### Owner Option B — Claim Boundary Engine

The Claim Boundary Engine additionally evaluates conflicts after source evidence is available.

### Owner Option C — Projection Composer

The projection composer evaluates and publishes conflicts.

### Owner Option D — Source Publishers

Each source publisher emits conflicts directly.

### Required decision

State exactly:

> **Conflict Evaluation Owner: Option A / Option B / Option C / Option D**

Exactly one owner shall have canonical evaluation authority.

Other components may validate or consume but not recreate the decision.

---

## 24. Conflict Ruleset Publication

The completed contract shall define:

```text
ConflictEvaluationRuleset
```

or an equivalent binding publication name.

It shall include at minimum:

* immutable ruleset ID;
* schema version;
* ruleset version;
* admitted conflict classes;
* eligible claim types or families;
* eligible source publication types;
* comparison keys;
* claim-linkage rules;
* source-owner requirements;
* temporal/scope rules;
* coverage requirements;
* source-availability treatment;
* restricting-status mapping;
* no-conflict proof rules;
* partial-evaluation rules;
* prohibited relations;
* domain-module references where applicable.

The contract shall define:

* owner;
* publication boundary;
* identity method;
* change/version rule;
* relationship to the Claim Boundary Ruleset.

The claim ruleset and conflict ruleset shall not share one identity.

---

## 25. Conflict Evaluation Publication

The completed contract shall define:

```text
ConflictEvaluation
```

or an equivalent binding name.

It shall represent one immutable evaluation event over:

* one Governed Claim Set;
* one conflict ruleset;
* one identified source-evidence set;
* one comparison/reference time;
* one evaluation policy.

It shall contain at minimum:

* conflict evaluation ID;
* schema version;
* conflict ruleset ID;
* governed claim-set ID;
* claim IDs in scope;
* source publication references;
* availability/coverage references;
* evaluated conflict classes;
* excluded or unsupported classes;
* comparison/reference time;
* evaluation outcome;
* failure/unevaluated reason;
* created-at time;
* optional prior-evaluation reference;
* thread/request/exchange/projection references where governed.

The contract shall define whether retries produce:

* new evaluation identities;
* new conflict-set identities;
* links to prior attempts.

---

## 26. Governed Conflict Set Publication

The completed contract shall define:

```text
GovernedConflictSet
```

or an equivalent binding publication name.

It shall contain at minimum:

* governed conflict-set ID;
* schema version;
* conflict evaluation ID;
* conflict ruleset ID;
* governed claim-set ID;
* ordered immutable conflicts;
* evaluated claim IDs;
* evaluation coverage;
* no-conflict result where applicable.

The contract shall decide:

* whether a zero-conflict set is published;
* whether unavailable/failed evaluations produce a conflict set;
* whether one conflict set may combine multiple claim families;
* whether conflict order is semantic or canonical only;
* whether duplicate relations are merged and by whom.

---

## 27. Individual Governed Conflict Publication

Each conflict shall be one immutable canonical object.

At minimum define:

* conflict ID;
* conflict class;
* affected claim IDs;
* source publication references;
* source owners;
* comparison key;
* comparison scope;
* restricting status;
* description reference;
* detected-at/evaluated-at relationship;
* ruleset rule ID;
* evidence/coverage references;
* optional domain metadata allowed by the closed taxonomy.

The contract shall determine whether the existing `GovernedConflictInput` shape is:

* sufficient as the canonical conflict;
* a composer input requiring a richer upstream conflict publication;
* a projection view of the canonical conflict;
* another explicitly selected role.

Implementation shall not decide that later.

---

## 28. Identity Integrity Compliance

The completed contract shall apply Constitutional Publication Principles explicitly.

For each publication:

* Conflict Evaluation Ruleset;
* Conflict Evaluation;
* Governed Conflict Set;
* individual Governed Conflict;

state:

1. what immutable body or event it represents;
2. what its ID identifies;
3. what cannot share that ID;
4. what changes require a new identity;
5. how retries relate;
6. how content-addressing or event identity applies.

The contract shall cite the **Identity Integrity** principle by name.

It shall explicitly prohibit:

* one conflict-set identity representing different conflict bodies;
* one evaluation identity reused after source coverage changes;
* one conflict identity reused after affected claim IDs change;
* one ruleset identity reused after rule semantics change;
* one claim identity standing in for a conflict identity.

---

# Part V — Claim Status and Restriction

## 29. Restricting-Status Rule

The contract shall define how each admitted conflict class affects claim status.

At minimum distinguish:

* available evidence with a source-value contradiction;
* insufficient coverage;
* unavailable required source;
* unsupported conflict class;
* policy incompatibility;
* temporal incompatibility;
* validation defect.

The conflict engine shall not arbitrarily select:

```text
available
insufficient_coverage
unavailable
unsupported
```

The ruleset shall own the mapping.

The contract shall decide whether a conflict may:

* only preserve or restrict status;
* ever upgrade status;
* convert `available` to `insufficient_coverage`;
* convert `available` to `unavailable`;
* convert a supported claim to `unsupported`;
* trigger validation failure rather than a claim status.

A conflict shall never upgrade evidence sufficiency.

---

## 30. Conflict and Factual-Value Preservation

The contract shall state whether conflicting factual values remain visible.

At minimum decide:

* whether both source-owned values are preserved;
* whether one may be suppressed;
* whether precedence rules may select one;
* whether the model may describe both;
* whether the model may recommend verification;
* whether a conflict-free synthesized value may be created.

Absent a separately governed precedence rule, the system shall not silently collapse incompatible values into one fact.

---

## 31. Conflict Descriptions

The existing conflict shape includes a description reference.

The contract shall define who owns that description.

Named options include:

* deterministic ruleset template;
* source publisher;
* model-generated description;
* human-authored policy text.

The description shall not become the canonical basis for conflict existence.

The conflict exists because the deterministic structured rule matched.

Natural-language text may explain the match.

The model may render the description but shall not replace or reinterpret the structured class.

---

# Part VI — No Conflict, Partial Evaluation, and Failure

## 32. Conflict Evaluation Outcome Vocabulary

The contract shall define a closed vocabulary.

At minimum evaluate:

```text
evaluated_no_conflict
evaluated_conflict_found
partially_evaluated
evaluation_unavailable
evaluation_unsupported
evaluation_failed
```

The completed contract shall select the final vocabulary and define each state.

No implementation-defined extra states are permitted.

---

## 33. Partial Evaluation

The contract shall decide whether partial evaluation is allowed.

If permitted, define:

* whether it applies by claim;
* by conflict class;
* by source;
* by domain;
* how evaluated and unevaluated scope is recorded;
* how claim status is restricted;
* whether the model may say "no conflict" for evaluated scope only;
* how overall conflict status is aggregated.

If partial evaluation is prohibited, any missing required scope must produce a whole-evaluation unavailable or insufficient result.

State one binding rule.

---

## 34. No-Conflict Statement Boundary

The completed contract shall define exactly what the model may say.

Examples requiring decisions:

* "No conflict was found."
* "No conflict exists."
* "The sources agree."
* "I could not evaluate conflicts."
* "No conflict was detected within the available sources and evaluated scope."

The model shall not convert scoped no-conflict evidence into universal absence.

A no-conflict statement must include the bounded scope required by the contract.

---

## 35. Evaluation Failure

The contract shall define handling for:

* ruleset unavailable;
* malformed source publication;
* unknown claim ID;
* unsupported claim family;
* insufficient source coverage;
* source unavailable;
* deterministic evaluator exception;
* persistence failure;
* publication-identity failure.

The answering model shall not receive a false empty conflict set after failure.

---

# Part VII — EOS and Cross-Domain Boundaries

## 36. EOS Structural Conflict Decision

The completed contract shall apply the selected EOS reuse option.

It shall explicitly state whether:

* EOS structural conflicts remain EOS-only;
* a future mapping contract is permitted;
* current direct reuse is prohibited;
* shared storage/algorithms may be reused without sharing publication semantics.

The reasoning shall compare:

| Property             | EOS structural conflict | Conversational evidentiary conflict |
| --------------------- | ------------------------ | -------------------------------------- |
| Trigger               | ...                       | ...                                     |
| Affected object       | ...                       | ...                                     |
| Source owners         | ...                       | ...                                     |
| Lifecycle             | ...                       | ...                                     |
| Ruleset               | ...                       | ...                                     |
| Status effect         | ...                       | ...                                     |
| Publication identity  | ...                       | ...                                     |
| Model role            | ...                       | ...                                     |

The conclusion must be binding.

---

## 37. Mechanism Reuse Boundary

The contract shall state:

> Shared implementation mechanisms do not establish shared semantic authority.

A future implementation may reuse:

* generic comparison utilities;
* immutable-record helpers;
* ID constructors;
* storage ports;
* validation scaffolding;

only where the conversational conflict ruleset remains the semantic owner.

It may not reuse an EOS result merely because both systems use the word "conflict."

---

## 38. Cross-Claim and Cross-Domain Conflicts

The contract shall define whether one conflict may affect:

* multiple claims of one type;
* multiple claim types in one family;
* claims across different families;
* claims from different Governed Claim Sets;
* claims from different exchanges.

Each permitted relation must have:

* one governing ruleset;
* shared comparison scope;
* admissible source classes;
* explicit affected claim IDs.

If cross-exchange conflict is not required for current production integration, it shall be explicitly Deferred rather than implicitly allowed.

---

# Part VIII — Relationship to Source Categories and Claims

## 39. Four Narrow Source Categories

Sprint 3.89 decided the independence boundary for:

* Gmail publication;
* Calendar publication;
* memory/priority publication;
* connector availability publication.

Sprint 3.90 shall explicitly confirm or correct whether conflict governance changes that conclusion.

The contract shall provide:

| Category               | Source contract remains independent? | Publisher implementation remains independent? | Conflict-aware claim wiring waits? | Binding reason |
| ------------------------ | --------------------------------------: | -----------------------------------------------: | -------------------------------------: | ---------------- |
| Gmail                    |                                  Yes/No |                                            Yes/No |                                 Yes/No | ...               |
| Calendar                 |                                  Yes/No |                                            Yes/No |                                 Yes/No | ...               |
| Memory/priorities        |                                  Yes/No |                                            Yes/No |                                 Yes/No | ...               |
| Connector availability   |                                  Yes/No |                                            Yes/No |                                 Yes/No | ...               |

No row may remain ambiguous.

The default assumption shall not be that conflicts block source publication.

Source-specific governed publications and conflict evaluation are different responsibilities.

---

## 40. Claims Contract Preservation

The completed contract shall confirm that Sprint 3.90 does not modify:

* Option C recognition precedence;
* claim unit;
* claim identity;
* claim materiality;
* source/coverage ownership;
* negative polarity;
* unsupported and clarification rules;
* claim-family separation;
* Governed Claim Set publication;
* claim ruleset identity;
* mixed-message segmentation;
* Cassie importance exclusion.

Conflicts consume claims.

They do not redefine them.

---

## 41. Source-Evidence Registry Relationship

The contract shall state whether conflict evaluation consumes:

* source-specific publications directly;
* the cross-source governed evidence registry;
* both under a fixed rule.

It shall define:

* whether all compared observations must already be admitted to the registry;
* whether a conflict may introduce a source not referenced by the claim;
* whether conflict evaluation may widen claim source scope;
* whether a source unavailable record participates as evidence or coverage metadata.

The conflict evaluator shall not become a backdoor source-admission authority.

---

# Part IX — Final Matrices and Registers

## 42. Ten-Question Decision Matrix

The completed contract shall include:

| Sprint 3.88 question                                | Binding decision | Architectural owner | Publication affected | Rejected alternatives | Implementation consequence |
| ----------------------------------------------------- | ------------------ | ---------------------- | ----------------------- | ------------------------- | ------------------------------ |
| Can conflict exist without a claim?                  | ...                 | ...                     | ...                      | ...                         | ...                              |
| What identities link conflict, claims, and sources?  | ...                 | ...                     | ...                      | ...                         | ...                              |
| Who owns underlying observations?                    | ...                 | ...                     | ...                      | ...                         | ...                              |
| Does composer derive or aggregate?                   | ...                 | ...                     | ...                      | ...                         | ...                              |
| What rules govern evaluation?                        | ...                 | ...                     | ...                      | ...                         | ...                              |
| Does an engine exist/reuse?                          | ...                 | ...                     | ...                      | ...                         | ...                              |
| May EOS conflicts be reused?                         | ...                 | ...                     | ...                      | ...                         | ...                              |
| What is cross-domain conflation?                     | ...                 | ...                     | ...                      | ...                         | ...                              |
| Does empty array prove no conflict?                  | ...                 | ...                     | ...                      | ...                         | ...                              |
| What proves no conflict versus unevaluated?          | ...                 | ...                     | ...                      | ...                         | ...                              |

Every row must contain a final decision.

---

## 43. Final Classification Matrix

Resolve all conflict-boundary items using:

* **Accepted**
* **Modified**
* **Deferred**
* **Rejected**

Required columns:

| Item | Sprint 3.88 finding | Final outcome | Architectural class | Binding decision | Owner | Implementation consequence |
| ---- | -------------------- | --------------- | --------------------- | ------------------- | ------ | ----------------------------- |

At minimum include:

* central conflict taxonomy;
* claim linkage;
* multi-claim linkage;
* cross-claim linkage;
* source ownership;
* source eligibility;
* composer role;
* conflict ruleset;
* conflict evaluator;
* evaluation publication;
* conflict-set publication;
* individual conflict identity;
* source-value contradiction;
* source availability;
* claim-status inconsistency;
* temporal incompatibility;
* prior assistant contradiction;
* policy incompatibility;
* coverage incompatibility;
* operator assertion contradiction;
* model-output contradiction;
* no-conflict proof;
* partial evaluation;
* empty conflict arrays;
* EOS conflict reuse;
* cross-domain mapping;
* source-category independence.

---

## 44. Rejected Register

The completed contract shall explicitly consider and classify at least:

* model-generated conflicts;
* route-owned conflict detection;
* projection-composer-owned derivation where not selected;
* conflict without an affected claim where not selected;
* empty-array-as-no-conflict;
* source unavailability automatically treated as contradiction;
* two unequal strings automatically treated as conflict;
* prior assistant output treated as canonical evidence;
* current model disagreement treated as evidence conflict;
* EOS structural conflict copied directly into conversational conflict;
* shared type names treated as semantic equivalence;
* one mutable conflict record under a stable ID;
* conflict rules without version identity;
* conflict evaluation without source coverage;
* implementation-defined conflict classes;
* "other" conflict class;
* model-selected source precedence;
* conflict status upgrade;
* silent suppression of one conflicting source value.

Every rejection shall identify the false claim, authority error, or audit ambiguity prevented.

---

## 45. Deferred Register

Any Deferred item shall state:

* why it is unnecessary to close the present contract;
* what governance or evidence is missing;
* whether it blocks isolated conflict implementation;
* whether it blocks source-category work;
* whether it blocks projection integration;
* the expected future sprint.

Potential deferred matters include:

* new domain conflict classes;
* Calendar commitment conflict rules;
* significance conflicts;
* cross-exchange conflicts;
* cross-thread conflicts;
* human-authored conflict resolution;
* source-precedence policy;
* EOS-to-conversation mapping;
* durable persistence implementation;
* operator verification;
* promotion.

Deferral shall not be used to avoid answering any of the ten required questions.

---

# Part X — No Implementation Authority

## 46. No Implementation Authority

The completed contract shall state:

> Sprint 3.90 establishes conflict-boundary governance only. It does not implement conflict evaluation, source comparison, conflict publications, status restriction, source precedence, route behavior, projection behavior, model behavior, persistence, or production integration.

Do not modify:

```text
app/api/chat/route.ts
lib/context-builder.ts
lib/useAgentConversation.ts
lib/governed-conversation/
lib/executive-context/
lib/executive-operating-system/
lib/memory/
lib/operational-state.ts
```

No test changes are authorised.

No prompt changes are authorised.

No selector changes are authorised.

No Roadmap change is authorised.

---

## 47. Future Implementation Boundary

A future isolated implementation sprint may implement only the completed contract's decisions.

It may include:

* conflict ruleset types;
* conflict evaluation publication;
* Governed Conflict Set publication;
* individual conflict identity;
* deterministic evaluator;
* no-conflict/unevaluated structure;
* claim-linked restrictions;
* test fixtures;
* Cassie-style source contradiction scenarios;
* isolated composition with the existing claim-set architecture.

It shall not integrate into `/api/chat` in the same sprint.

It shall remain isolated, tested, evaluated, then integrated through the established staged sequence.

---

## 48. Expected Follow-On

The completed contract shall identify the next permitted sprint.

Potential outcomes include:

* isolated governed conversational conflict implementation;
* source-specific publication contracts proceeding in parallel;
* source-evidence admission contract;
* another governance sprint only if a required source-precedence decision remains intentionally outside this contract.

The next-step decision must reflect the completed dependency matrix.

---

## 49. Output Location and Single-File Convention

Create exactly:

```text
docs/SPRINT-3.90-GOVERNED-CONVERSATIONAL-CONFLICTS-BOUNDARY-CONTRACT.md
```

This file initially contains the specification.

On completion, replace its contents in place with the completed contract.

The completed file shall begin:

```text
# Sprint 3.90 — Governed Conversational Conflicts Boundary Contract

**Status:** Complete
```

Do not create:

```text
docs/reports/SPRINT-3.90-...
```

Do not preserve a separate submitted-specification file.

The repository history preserves the specification.

The current file becomes the binding completed contract.

No other file shall change.

---

## 50. Validation

Full repository validation is mandatory.

There is no governance-only exception.

Run:

```text
npm test
npm run build
npm run lint
npm run typecheck
git diff --check
```

Use current repository-defined equivalents where materially different.

Validation shall additionally confirm:

1. only the Sprint 3.90 contract document changed;
2. no source code changed;
3. no tests changed;
4. all ten Sprint 3.88 conflict questions received binding decisions;
5. exactly one Conversational Conflict Architecture was selected;
6. exactly one conflict claim-linkage option was selected;
7. exactly one composer-role option was selected;
8. exactly one EOS reuse option was selected;
9. exactly one evaluation-state architecture was selected;
10. one deterministic conflict owner was named;
11. one closed taxonomy was defined;
12. every candidate relation received an explicit classification;
13. no-conflict and unevaluated are structurally distinct;
14. required publication identities were defined;
15. Identity Integrity was explicitly applied;
16. source-category independence was confirmed or corrected;
17. Sprint 3.89 claim decisions remain unchanged;
18. Prohibited Hedge Language does not appear in final decisions;
19. Rejected and Deferred registers are present;
20. implementation is explicitly unauthorized;
21. the final recommendation uses the exact permitted wording.

Any pre-existing validation failure must be distinguished from a sprint-created failure.

Do not report incomplete validation as passing.

---

## 51. Completion Report Structure

Because Sprint 3.90 uses the single-file convention, the completed contract itself shall contain the following sections.

### Repository Precondition

Report:

* repository;
* branch;
* commit;
* working-tree state;
* required governing artefacts;
* relevant implementation files inspected.

### Governing Artefacts Reviewed

List every governing document read.

### Sprint 3.88 Conflicts Finding

Confirm the full Conflicts Finding was reviewed and the ten questions were traced from prose.

### Sprint 3.89 Claims Foundation

Confirm:

* Option C;
* pre-model deterministic claims;
* Governed Claim Set;
* claim ruleset identity;
* claim identity and materiality;
* Conflicts Option A;
* no claim decision was reopened.

### Conversational Conflict Architecture

State exactly:

```text
Conversational Conflict Architecture: Option A
```

or:

```text
Conversational Conflict Architecture: Option B
```

or:

```text
Conversational Conflict Architecture: Option C
```

or:

```text
Conversational Conflict Architecture: Option D
```

### Decision 1 — Claim Linkage

State the selected option and binding rule.

### Decision 2 — Identity Chain

Define every publication and identity.

### Decision 3 — Source Ownership

Define admissible and prohibited sources.

### Decision 4 — Composer Role

State the selected composer option.

### Decision 5 — Conflict Ruleset

Define architecture, owner, versioning, and closed classes.

### Decision 6 — Conflict Engine

Name the evaluation owner and reuse decision.

### Decision 7 — EOS Reuse

State the selected EOS option.

### Decision 8 — Cross-Domain Boundary

State the binding conflation rule.

### Decision 9 — Evaluation-State Architecture

State the selected option.

### Decision 10 — No-Conflict Proof

Define proof and unevaluated representation.

### Closed Taxonomy

Include the required taxonomy matrix.

### Publication Architecture

Define:

* ruleset;
* evaluation;
* conflict set;
* individual conflicts.

### Identity Integrity Compliance

State how each publication satisfies Constitutional Publication Principles.

### Status Restriction

Define conflict-to-status effects.

### No-Conflict and Partial Evaluation

Define the closed outcome vocabulary and model wording boundary.

### EOS Comparison

Include the EOS/conversational comparison table.

### Four Source Categories

Include the required independence table.

### Ten-Question Decision Matrix

Include the completed matrix.

### Final Classification Matrix

Include outcomes and counts.

### Rejected Register

List every rejected architecture and assumption.

### Deferred Register

List every deferred matter and blocking effect.

### Files Changed

Expected:

```text
docs/SPRINT-3.90-GOVERNED-CONVERSATIONAL-CONFLICTS-BOUNDARY-CONTRACT.md
```

### Validation

Report exact commands and results.

### Implementation Authority

State:

> Sprint 3.90 authorizes no implementation and changes no production behavior.

### Next Step

Identify the next permitted governance or isolated implementation sprint.

### Recommendation

Return exactly one:

```text
Governed Contract Complete
```

or:

```text
Governance Review Incomplete
```

No other wording is permitted.

---

## 52. Recommendation Gate

### Governed Contract Complete

Use only when:

* all required governing artefacts were available;
* all ten conflict questions were independently answered;
* one central conflict architecture was selected;
* one closed taxonomy was established;
* claim linkage was decided;
* conflict identity and publication chains were defined;
* one deterministic owner was named;
* source admissibility was defined;
* composer responsibility was fixed;
* ruleset architecture and versioning were fixed;
* EOS reuse was decided;
* cross-domain conflation was defined;
* no-conflict and unevaluated are structurally distinct;
* evaluation-state vocabulary is closed;
* Identity Integrity was applied;
* status restrictions are deterministic;
* the four source-category independence findings were confirmed or corrected;
* Sprint 3.89 remains unchanged;
* no hedge language remains;
* no implementation occurred;
* full validation passed or unrelated pre-existing failures were clearly evidenced.

### Governance Review Incomplete

Use when:

* any of the ten questions remains unresolved;
* more than one conflict architecture remains implementation-selectable;
* the taxonomy contains an open "other" category;
* conflicts can exist without a clear identity and owner;
* no-conflict remains inferable from an empty array;
* EOS reuse remains ambiguous;
* source admissibility remains open;
* publication identity remains unresolved;
* conflict status effects remain implementation-defined;
* source-category dependency remains ambiguous;
* a Sprint 3.89 claim decision is reopened;
* required authority is unavailable;
* validation is incomplete;
* source code or tests changed.

---

## 53. Return Format

Return:

1. Repository Precondition result.
2. Governing artefacts reviewed.
3. Sprint 3.88 Conflicts Finding confirmation.
4. Sprint 3.89 claims-foundation confirmation.
5. Selected Conversational Conflict Architecture.
6. Claim-linkage decision.
7. Conflict identity chain.
8. Source-ownership decision.
9. Projection-composer role.
10. Conflict-ruleset architecture.
11. Conflict-evaluation owner.
12. EOS reuse decision.
13. Cross-domain conflation boundary.
14. Evaluation-state architecture.
15. No-conflict proof rule.
16. Closed taxonomy matrix.
17. Publication architecture.
18. Identity Integrity compliance.
19. Status-restriction rules.
20. Partial-evaluation rule.
21. Model wording boundary.
22. Four-source-category independence table.
23. Ten-question decision matrix.
24. Final classification matrix.
25. Rejected register.
26. Deferred register.
27. Files changed.
28. Full validation results.
29. Explicit confirmation that no implementation occurred.
30. Recommended next sprint.
31. Final recommendation gate.

The final line must be exactly one of:

> **Governed Contract Complete**

or:

> **Governance Review Incomplete**

---

## 54. Success Criteria

Sprint 3.90 succeeds when a future implementation sprint no longer needs to invent answers to any of the following:

* What constitutes a conflict?
* Which conflict relations are admitted?
* Can a conflict exist without a claim?
* How are claims, sources, evaluations, sets, and conflicts linked?
* Who owns the underlying observations?
* Who owns conflict evaluation?
* Does the projection composer derive or aggregate?
* Which versioned rules prove evaluation ran?
* Can EOS structural conflicts be reused?
* What constitutes cross-domain conflation?
* Does an empty conflict array prove no conflict?
* What proves evaluated-no-conflict?
* How is unevaluated represented?
* How do conflicts restrict claim status?
* Are conflicting values preserved?
* Which source-category contracts remain independent?
* What immutable publications and identities exist?

The desired architecture is:

```text
Governed Claim Set
        ↓
Admissible governed source publications
        ↓
Versioned deterministic conflict evaluation
        ↓
Conflict Evaluation publication
        ↓
Governed Conflict Set
        ↓
Dedicated Conversational Projection Composer
        ↓
Validated model explanation
```

The conflict engine determines whether a governed relation exists.

The model explains the published result.

The model does not create the relation.

An empty array does not prove that evaluation occurred.

Shared EOS mechanisms do not transfer EOS meaning into ordinary conversation.

Sprint 3.90 establishes that boundary and authorizes no implementation.
