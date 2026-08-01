# Sprint 3.89 — Governed Conversational Claims Boundary Contract

**Status:** Specification
**Sprint Type:** Governance Decision / Claims Boundary Contract
**Implementation Authority:** None
**Output Path:** `docs/SPRINT-3.89-GOVERNED-CONVERSATIONAL-CLAIMS-BOUNDARY-CONTRACT.md`

---

## 1. Purpose

Sprint 3.89 establishes the binding deterministic boundary for claims in the governed conversational runtime.

Sprint 3.88 found that production ordinary chat accepts arbitrary free-form language, but no production owner currently transforms that language into:

```text
GovernedClaimInput[]
```

The existing governed runtime can:

* compute evidence status after a claim exists;
* validate claim-local evidence and conflicts;
* preserve unsupported and unavailable states;
* constrain model output;
* prevent model-owned status upgrades.

It cannot yet determine, before model invocation:

* what claims an operator's question contains;
* how compound questions are divided;
* what closed claim type applies;
* which evidence categories are required;
* whether the claim is material;
* what constitutes sufficient coverage;
* whether unsupported language should be rejected, clarified, or represented through another bounded mechanism.

Sprint 3.88 classified this as a **design-shaped governance gap**, not a missing adapter.

Sprint 3.89 shall answer the nine bounded claims questions identified by Sprint 3.88.

It shall not add new questions, broaden the governed claim vocabulary by implication, or implement the selected architecture.

The central objective is:

> **Define a deterministic, pre-model mechanism by which an operator request becomes a bounded set of governed claims—or is explicitly classified as unsupported—without allowing the answering model to define the claims by which its own output will later be judged.**

---

## 2. Sprint Character

This is a governance-decision sprint.

It is not:

* an implementation sprint;
* a parser sprint;
* a route-integration sprint;
* an interface-design sprint;
* a claim-classifier implementation;
* a conflicts implementation;
* a source-evidence implementation;
* an operator-verification sprint;
* a promotion sprint.

No code changes are authorised.

The sole deliverable is:

```text
docs/SPRINT-3.89-GOVERNED-CONVERSATIONAL-CLAIMS-BOUNDARY-CONTRACT.md
```

A future isolated implementation sprint may execute only the decisions made by the completed contract.

---

## 3. Governing Hierarchy

The review shall apply the repository's established governing hierarchy, including:

1. JARVIS Engineering Constitution
2. JARVIS North Star
3. JARVIS Engineering Specification Standard
4. Constitutional Publication Principles
5. `docs/architecture/ROADMAP.md`
6. Sprint 3.82 — Governed Conversational Lineage Identity Contract
7. Sprint 3.76 — Governed Conversational Runtime Contract
8. Sprint 3.85 — Governed Conversational Identity Correction Contract
9. Sprint 3.88 — Governed Conversational Production Evidence Audit
10. accepted responsibility statements and ADRs
11. current governed-conversation types, fixtures, evaluation code, and validators
12. this Sprint Specification

Sprint 3.88 is the authoritative evidence base for the nine open claims questions.

It is not the authority for their answers.

Sprint 3.76 remains binding for:

* the closed evidence-status vocabulary;
* governed-over-legacy precedence;
* deterministic evidence status before model invocation;
* model-owned interpretation;
* non-authoritative advisory recommendations;
* the prohibition on heuristic laundering.

Sprint 3.82 remains binding for:

* the Dedicated Conversational Projection Composer's exclusive ownership;
* deterministic and versioned claims;
* claim-linked conflicts;
* non-canonical conversation history;
* source/reference minimisation.

Sprint 3.85 remains binding for truthful conversational identity.

---

## 4. Repository Precondition

Before beginning the governance review:

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
docs/SPRINT-3.76-GOVERNED-CONVERSATIONAL-RUNTIME-CONTRACT.md
docs/SPRINT-3.82-GOVERNED-CONVERSATIONAL-LINEAGE-IDENTITY-CONTRACT.md
docs/SPRINT-3.85-GOVERNED-CONVERSATIONAL-IDENTITY-CORRECTION-CONTRACT.md
```

5. Read Sprint 3.88 completely.
6. Read its **Claims Finding** in full, including:

   * composer requirements;
   * current production analogue;
   * deterministic-design gap;
   * required Cassie decomposition;
   * classification;
   * reasoning;
   * all nine bounded governance questions.
7. Read Sprint 3.76, Sprint 3.82, Sprint 3.85, and the Roadmap completely.
8. Confirm the following current files exist and inspect their relevant types and tests:

```text
lib/governed-conversation/types.ts
lib/governed-conversation/projection-composer.ts
lib/governed-conversation/evidence-status.ts
lib/governed-conversation/input.ts
lib/governed-conversation/model-request.ts
lib/governed-conversation/validator.ts
lib/governed-conversation/fixtures.ts
lib/governed-conversation/lineage-test-fixtures.ts
lib/governed-conversation/parallel-evaluation.ts
```

Use the actual current paths where names have changed.

9. Locate and inspect:

   * `GovernedClaimInput`;
   * the closed claim-type vocabulary (`CommunicationClaimType`);
   * claim materiality;
   * claim ownership fields;
   * source-reference requirements;
   * bounded-completeness fields;
   * claim-local conflicts;
   * `claimClassificationRulesetId`;
   * `computeCommunicationClaimStatus`;
   * `aggregateEvidenceStatus`;
   * all Cassie fixtures, including `cassie-fixture.test.ts`;
   * all tests constructing compound claims.
10. Confirm that no production route, registry, parser, or adapter currently constructs `GovernedClaimInput[]` from ordinary free-form chat.
11. Confirm that typed capability payloads are currently the only deterministic production request parsing mechanism identified by Sprint 3.88.
12. Confirm only the Sprint 3.89 contract document may change.

If Sprint 3.88 is absent:

* do not reconstruct its nine questions from chat;
* do not infer the Cassie decomposition;
* do not proceed.

Return:

> **Governance Review Incomplete — Required Audit Unavailable**

If one of the other required governing artefacts is absent and its absence prevents a binding decision, stop rather than improvising authority.

---

## 5. Governing Question

Sprint 3.89 must answer:

> **How shall JARVIS deterministically convert an operator interaction into a versioned set of governed claims—or an explicit unsupported result—before any answering model is invoked?**

The answer must preserve both:

* ordinary conversational usefulness; and
* deterministic governance of factual claims.

It must not solve one by quietly abandoning the other.

---

## 6. Claims Boundary Principles

The completed contract shall preserve the following principles.

### 6.1 Pre-model ownership

Claims must exist before the answering model is invoked.

The answering model shall not:

* define the claims it will answer;
* split the question into claims;
* assign claim types;
* select claim materiality;
* choose required sources;
* declare its own coverage;
* determine whether an unknown request is supported.

### 6.2 Deterministic publication

Every claim set shall be the output of an identified, versioned deterministic ruleset.

### 6.3 Fail-closed recognition

Failure to recognise an operator request shall not be converted into a guessed claim.

### 6.4 Claim-local status

Compound questions shall not receive one blended status where different claim components have materially different evidence conditions.

### 6.5 No heuristic laundering

The settled exclusions remain binding:

```text
unread
Gmail important
needsReply
labels
legacy attention ranking
```

These fields shall not become evidence of operator importance, urgency, significance, or priority.

### 6.6 Model breadth does not create claim authority

The model may discuss, interpret, explain, or advise only within the evidence and authority exposed by the governed claim set.

Natural-language fluency does not grant claim-classification authority.

---

## 7. Independent Decision Requirement

Sprint 3.88 posed questions.

Sprint 3.89 must answer them independently.

For each of the nine questions, the completed contract shall:

1. restate the precise decision problem;
2. identify the relevant governing principles;
3. identify the named options considered;
4. explain the material benefit and cost of each;
5. select one binding option or one explicitly named fixed combination;
6. reject all non-selected options;
7. state the implementation consequence;
8. state what the decision prohibits.

The contract shall not merely convert:

> "whether typed UI, capability, pattern, confirmation, or fail-closed mechanisms are permitted"

into:

> "typed UI, capability, pattern, confirmation, or fail-closed mechanisms are governed."

That would repeat the question rather than answer it.

---

## 8. Prohibited Hedge Language

The following are not valid final decisions:

* "reuse where practical";
* "a combination as needed";
* "depending on context";
* "implementation may decide";
* "where appropriate";
* "may vary by claim" without a binding closed rule;
* "prefer";
* "generally";
* "support multiple approaches";
* "future work may determine";
* "use the best available method."

A fixed architecture may contain more than one mechanism only where:

* the combination is named as one architectural option;
* each mechanism has a closed responsibility;
* precedence is deterministic;
* fallback behavior is explicit;
* implementation has no discretion to substitute another mechanism.

---

# Part I — Primary Claims-Boundary Decision

## 9. Deterministic Claim-Bounding Options

The single most consequential decision shall select exactly one of the following named architectural options.

---

### Option A — Explicit Typed Interaction Only

Governed claims may be created only from explicit typed operator inputs, including:

* structured capability payloads;
* dedicated UI controls;
* predefined commands;
* forms with explicit claim types and parameters.

Ordinary free-text conversation does not produce governed factual claims.

Free-text requests that would require claims return `unsupported` or prompt the operator to use the appropriate typed interaction.

#### Consequences

* strongest determinism;
* simplest auditability;
* narrowest conversational breadth;
* no deterministic free-text recognition;
* every supported claim requires an explicit interaction surface.

---

### Option B — Closed Deterministic Intent Vocabulary

Governed claims may be created from free text only when a deterministic, versioned recogniser matches the request to a closed claim-intent vocabulary.

The recogniser may use only contract-authorised deterministic mechanisms such as:

* exact commands;
* declared aliases;
* bounded lexical patterns;
* deterministic entity slots;
* explicit grammar rules.

Unmatched or ambiguous text resolves to `unsupported` or clarification.

No model classification is permitted.

#### Consequences

* preserves some free-text utility;
* requires a closed vocabulary and grammar;
* risks brittle recognition;
* requires explicit ambiguity and clarification rules;
* every recognised pattern is part of the governed ruleset.

---

### Option C — Explicit-First Governed Hybrid

Governed claims may be created through a fixed, ordered mechanism:

1. explicit typed capability or UI intent;
2. closed deterministic pattern recognition for a governed vocabulary;
3. deterministic clarification where required fields or identity resolution are missing;
4. fail-closed `unsupported` for anything unmatched or ambiguous.

This option is one fixed architecture, not "a combination as needed."

The order is binding.

No model-based intent classification is permitted.

#### Consequences

* typed interactions remain authoritative where available;
* bounded free text remains possible for governed known intents;
* clarification preserves conversational usability;
* unmatched open-ended language remains outside factual claim execution;
* ruleset versioning and deterministic precedence are mandatory.

---

### Option D — Free-Text Conversation Does Not Produce Governed Claims

Ordinary free text remains model-mediated conversation only.

Governed claim execution occurs exclusively through separately invoked governed capabilities.

The conversational model may discuss a free-text request but cannot make governed factual assertions from connected sources unless the operator transitions into a governed capability.

#### Consequences

* clean separation between conversation and factual execution;
* strongest boundary between chat and governed retrieval;
* material friction in everyday assistant use;
* requires explicit transition into governed capabilities.

---

## 10. Required Primary Decision

The completed contract shall state exactly:

> **Claims-Boundary Architecture: Option A / Option B / Option C / Option D**

Exactly one option shall be selected.

The reasoning shall explain:

* why the selected option is deterministic;
* how it preserves or limits ordinary conversational breadth;
* how it prevents model-owned classification;
* how unmatched language is handled;
* why each rejected option is not selected.

No implementation may choose a different option later.

---

# Part II — The Nine Binding Claims Questions

## 11. Question 1 — What Is One Claim, and What Input Is Authoritative?

Sprint 3.88 asked:

> What is one claim, and what deterministic input is authoritative?

The contract shall define one claim as a bounded unit that can independently receive:

* one claim type;
* materiality;
* required source classes;
* bounded completeness rules;
* an evidence status;
* factual values;
* conflicts;
* ownership;
* unsupported reason.

The contract must decide what authoritative deterministic input establishes that claim.

Named options shall include, as applicable:

* explicit typed intent publication;
* matched governed intent rule;
* clarified and operator-confirmed intent;
* another specifically defined deterministic publication.

The contract shall decide whether raw free-text content itself is authoritative or merely input to the selected recogniser.

It shall state whether one operator sentence may yield:

* zero claims;
* one claim;
* multiple claims.

It shall prohibit one claim from combining independently answerable assertions with different evidence rules.

### Required decision format

> **Claim Unit Decision:** [binding definition]

> **Authoritative Claim Input:** [binding publication or recogniser output]

---

## 12. Question 2 — Claim Vocabulary, Compound Questions, and Negative Questions

Sprint 3.88 asked:

> Which claim vocabulary applies beyond communication, and how are compound and negative questions represented?

The contract shall decide whether Sprint 3.89 governs:

* only the currently closed communication claim vocabulary; or
* a cross-domain claim-family framework with domain vocabularies governed separately.

It shall not invent unreviewed Calendar, memory, or source claim types merely because those evidence categories exist.

The contract shall specify:

### Compound questions

Whether every independently answerable request becomes a separate claim.

The default shall not be left implicit.

### Negative questions

How requests such as:

* "Is there nothing scheduled?";
* "Did nobody reply?";
* "Are there no important messages?";
* "Is Cassie not included?";

are represented.

The contract shall decide whether negative claims require:

* explicit negative-scope types;
* a polarity field;
* bounded absence claims;
* another closed representation.

It shall preserve the distinction between:

* observed absence within governed coverage;
* source unavailable;
* insufficient coverage;
* unsupported claim.

### Required decision format

> **Claim Vocabulary Scope:** [binding scope]

> **Compound Question Rule:** [binding rule]

> **Negative Claim Representation:** [binding rule]

---

## 13. Question 3 — Who Assigns Type, Materiality, Sources, and Coverage?

Sprint 3.88 asked:

> Who assigns type/materiality and the required source/coverage rules?

The contract shall identify one deterministic owner.

The owner shall not be:

* `/api/chat`;
* the answering LLM;
* the prompt builder;
* `context-builder.ts`;
* legacy `OperationalState`;
* a connector.

Named owner options may include:

* a dedicated Governed Claim Boundary Engine;
* a versioned claim-rules registry plus pure construction function;
* another explicitly named deterministic publication owner.

The completed contract shall define which responsibilities belong to:

* the claim recogniser;
* the claim ruleset;
* source-specific publishers;
* the projection composer;
* evidence-status computation.

Materiality shall not be model-assigned.

Source requirements shall not be connector-assigned.

Coverage rules shall not be inferred ad hoc from whatever data happens to be available.

### Required decision format

> **Claim Classification Owner:** [named owner]

> **Materiality Owner:** [named owner]

> **Source and Coverage Rule Owner:** [named owner]

---

## 14. Question 4 — Which Recognition and Clarification Mechanisms Are Permitted?

Sprint 3.88 asked:

> Which typed UI/capability/pattern/confirmation/fail-closed mechanisms are permitted?

This decision shall follow the selected Claims-Boundary Architecture.

The contract must define a closed list of permitted mechanisms.

For each permitted mechanism, define:

* responsibility;
* precedence;
* allowed input;
* output publication;
* ambiguity behavior;
* whether operator confirmation is required;
* failure behavior.

The contract shall explicitly decide the status of:

* typed capability payloads;
* typed UI actions;
* exact commands;
* deterministic lexical patterns;
* deterministic grammar;
* entity resolution;
* operator clarification;
* operator confirmation;
* LLM intent classification;
* probabilistic classifiers;
* embedding similarity;
* unrestricted semantic parsing.

No mechanism shall remain implicitly permitted.

### Required decision format

> **Permitted Claim-Bounding Mechanisms:** [closed list]

> **Prohibited Mechanisms:** [closed list]

> **Precedence Rule:** [binding order]

---

## 15. Question 5 — How Is Uncertainty Surfaced Without Model-Owned Classification?

Sprint 3.88 asked:

> How is uncertainty surfaced without model-owned classification?

The contract shall define deterministic states for claim-boundary uncertainty.

At minimum distinguish:

* recognised;
* recognised but missing required parameter;
* ambiguous between governed claim types;
* unresolved entity;
* unsupported language;
* unsupported claim type;
* supported claim with unavailable source;
* supported claim with insufficient coverage.

These states shall not be collapsed into one generic error.

The contract shall decide:

* whether ambiguity produces clarification;
* whether clarification creates a new request or continues the same request;
* whether an unresolved claim receives an identity;
* whether unsupported requests enter the governed projection;
* whether the model may phrase the clarification;
* who owns the clarification choices.

The model may articulate a deterministic clarification result.

It may not decide what the ambiguity was.

### Required decision format

> **Claim-Boundary Uncertainty Vocabulary:** [closed vocabulary]

> **Clarification Ownership:** [binding owner]

> **Model Role in Clarification:** [binding limit]

---

## 16. Question 6 — When Is Language Unsupported, and May the Operator Clarify It?

Sprint 3.88 asked:

> When is unknown language `unsupported`, and may the operator clarify it?

The contract shall define exactly when unsupported occurs.

At minimum consider:

* no matching governed intent;
* multiple equal matches;
* missing required entity;
* entity resolution below the governed certainty threshold;
* claim type not governed;
* required evidence category not governed;
* prohibited significance or authority request;
* request requiring an LLM to classify its meaning.

The contract shall decide whether clarification is permitted for each class.

Clarification shall not be used to make an ungoverned claim type appear governed.

The contract must distinguish:

* clarification of a governed claim's parameters;
* transition into a typed capability;
* rejection of an unsupported claim family.

### Required decision format

> **Unsupported Trigger Rule:** [binding rule]

> **Clarification-Permitted Cases:** [closed list]

> **Clarification-Prohibited Cases:** [closed list]

---

## 17. Question 7 — How Are Claim Families Separated?

Sprint 3.88 asked:

> How are identity, contact, importance, schedule, absence and retrieval separated?

The contract shall define the architectural separation among at least:

* identity resolution;
* contact-address lookup;
* communication retrieval;
* message-content retrieval;
* importance/significance;
* schedule/commitment;
* absence/completeness;
* source retrieval.

It shall decide whether these are:

* claim types;
* claim families;
* capabilities that produce claims;
* preconditions to claims;
* unsupported until separately governed.

The contract shall prohibit one broad type such as:

```text
communication_question
```

from hiding materially different evidence rules.

It shall also distinguish:

* identity resolution as a prerequisite;
* retrieval as an action/capability boundary;
* factual claim evaluation;
* interpretive significance.

### Required decision format

> **Claim-Family Separation Model:** [binding model]

The completed contract shall include a table:

| Claim family | Governed now? | Deterministic owner | Required evidence class | Status rule owner | Notes |
| ------------ | ------------: | ------------------- | ----------------------- | ----------------- | ----- |

---

## 18. Question 8 — How Is Everyday Conversational Breadth Preserved?

Sprint 3.88 asked:

> How is everyday conversational breadth preserved without weakening determinism?

The contract shall state plainly that not every conversational utterance must become a governed factual claim.

It shall distinguish:

### Governed factual claim execution

Questions whose answers depend on:

* connected data;
* source evidence;
* current state;
* absence/completeness;
* identity;
* retrieved content;
* other verifiable application facts.

### Open-ended conversation

Requests involving:

* brainstorming;
* reflection;
* writing;
* explanation;
* general reasoning;
* personal collaboration;
* non-source-dependent advice.

The contract shall decide what happens when one operator message contains both.

Named options shall include:

* split into governed and non-governed segments;
* require clarification before either proceeds;
* reject mixed requests;
* another explicitly governed rule.

The contract shall ensure that model-owned conversation cannot smuggle factual connected-data claims around the governed boundary.

### Required decision format

> **Conversational Breadth Rule:** [binding rule]

> **Mixed Governed/Non-Governed Message Rule:** [binding rule]

---

## 19. Question 9 — Which Ruleset and Publication Prove Evaluation Ran?

Sprint 3.88 asked:

> Which versioned ruleset and publication identity prove that evaluation ran?

The contract shall define the authoritative publications created by claim-boundary evaluation.

At minimum decide whether the architecture requires:

* a Claim Boundary Ruleset publication;
* a Claim Classification Run publication;
* a Governed Claim Set publication;
* unsupported/clarification outcome publication;
* references to thread/request/exchange/projection identity.

For each publication, define:

* represented event or immutable body;
* owner;
* schema version;
* ruleset version;
* identity;
* creation boundary;
* input references;
* output references;
* whether it is canonical;
* relationship to retries;
* relationship to one exchange;
* whether empty claim sets are valid.

The contract shall comply with Constitutional Publication Principles:

> One immutable identity shall correspond to one immutable canonical object.

A ruleset ID shall not be used as the identity of one evaluation run.

An exchange ID shall not be used as the identity of a distinct claim-set publication unless governance explicitly defines them as the same immutable object—which this sprint shall not assume.

### Required decision format

> **Claim Ruleset Publication:** [binding publication]

> **Claim Evaluation Publication:** [binding publication]

> **Governed Claim Set Publication:** [binding publication]

---

# Part III — Required Cassie Constitutional Test

## 20. Cassie Test Case

The completed contract shall apply every material decision to:

> **"What's Cassie's email? Anything important?"**

The analysis shall not treat the sentence as one claim.

The required minimum decomposition remains:

1. a material `contact_address_lookup` claim; and
2. a material `message_importance` claim.

The contract shall show the complete deterministic path from operator input to both claims under the selected architecture.

At minimum show:

```text
operator text or typed interaction
        ↓
permitted deterministic boundary mechanism
        ↓
recognised intent(s)
        ↓
entity/parameter handling
        ↓
claim type assignment
        ↓
materiality
        ↓
source and coverage requirements
        ↓
GovernedClaimInput[]
```

---

## 21. Cassie Contact-Address Claim

The contract shall state how the contact-address claim is recognised.

It shall define:

* claim type;
* entity parameter;
* identity-resolution requirement;
* source classes;
* materiality;
* bounded completeness;
* status possibilities;
* clarification behavior if multiple Cassies exist;
* unsupported behavior if no governed identity/contact source exists.

The claim may become `available` only where:

* Cassie's identity is sufficiently resolved;
* a source-qualified address is present;
* the source is available;
* provenance and observation time are present;
* the required coverage rule is satisfied.

The model shall not infer an address from conversational memory or an unqualified snippet.

---

## 22. Cassie Importance Claim

The importance claim shall remain distinct.

The contract shall state explicitly:

> The importance claim remains `unsupported` under current governance.

The completed contract shall preserve the settled exclusion boundary.

None of the following establishes operator significance:

```text
unread
Gmail important
needsReply
labels
legacy attention ranking
message ordering
```

The contract shall not:

* define importance through those fields;
* permit the model to infer importance from them;
* allow a connector-provided importance marker to become operator significance;
* weaken `unsupported` to `insufficient_coverage` merely because heuristic fields exist;
* silently defer the importance definition to implementation.

If a future significance contract is possible, it remains separate future work.

Sprint 3.89 shall not create it.

---

## 23. Cassie Compound-Question Outcome

The contract shall show why the two claims receive separate statuses.

Expected structure:

| Claim                  | Governed type            | Evidence condition                                        | Current status          |
| ----------------------- | ------------------------- | ----------------------------------------------------------- | ------------------------ |
| Cassie contact address  | `contact_address_lookup`  | identity-sufficient source-qualified address evidence       | potentially `available`  |
| Anything important      | `message_importance`      | separately governed significance definition and evidence    | `unsupported`            |

The claim-set overall status shall follow the existing deterministic materiality-aware aggregation rule (`aggregateEvidenceStatus`).

The contract shall not invent a new aggregation rule unless Sprint 3.76 explicitly left it open and the nine claims questions require it.

---

# Part IV — Relationship to Other Production Evidence Categories

## 24. Four Narrow Source Categories

Sprint 3.88 proposed that four bounded evidence-category governance tracks could proceed independently of claims governance:

* Gmail communication publication;
* Calendar evidence publication;
* memory/priority publication;
* connector availability publication.

Sprint 3.89 shall explicitly confirm or correct that finding.

For each category, decide whether:

* its source-specific publication contract can proceed before claims;
* its implementation can proceed before claims;
* claim-linked selection must wait;
* source-evidence registry admission must wait;
* production conversational integration must wait.

The contract shall distinguish:

```text
publishing governed source evidence
```

from:

```text
selecting evidence as relevant to a governed claim
```

A source publisher may be independently governed even where claim relevance remains unresolved.

### Required decision format

Provide:

| Category               | Contract independent of claims? | Publisher implementation independent of claims? | Claim-linked wiring waits? | Binding reason |
| ----------------------- | -------------------------------: | -------------------------------------------------: | ---------------------------: | --------------- |
| Gmail                   |                           Yes/No |                                             Yes/No |                       Yes/No | ...              |
| Calendar                |                           Yes/No |                                             Yes/No |                       Yes/No | ...              |
| Memory/priorities       |                           Yes/No |                                             Yes/No |                       Yes/No | ...              |
| Connector availability  |                           Yes/No |                                             Yes/No |                       Yes/No | ...              |

No row may remain ambiguous.

---

## 25. Source Evidence Relationship

The contract shall state whether the cross-source evidence registry can be governed or implemented independently of claims.

At minimum distinguish:

* source-specific publication admission rules;
* claim-linked evidence selection;
* claim-reference validation;
* model-exposure policy.

If only part is independent, the boundary must be explicit.

"Partly independent" without naming the independent publication and dependent function is not sufficient.

---

## 26. Conversation History Relationship

The contract shall state whether governed conversation-history classification is independent of claims.

It shall distinguish:

* classifying operator and assistant turns;
* retaining non-canonical dialogue;
* representing retrieval references;
* deriving new claims from prior turns;
* carrying unresolved claims across turns.

The contract must not silently authorize history to create claims merely because it contains operator text.

---

# Part V — Conflicts Boundary

## 27. Required Conflicts Decision

Sprint 3.88 proposed a dependent conflict contract after the claims boundary.

Sprint 3.89 must select exactly one:

### Conflicts Option A — Separate Dependent Contract

Sprint 3.89 governs claims only.

A later conflicts contract shall define:

* eligible source owners;
* contradiction categories;
* affected-claim linkage;
* status restrictions;
* description references;
* sufficient conflict-evaluation coverage;
* unevaluated representation;
* ruleset and publication identity;
* admissibility of any EOS mapping.

This option recognises that conflict meaning depends on the claim boundary being settled first.

### Conflicts Option B — Minimal Conflicts Boundary Included Here

Sprint 3.89 additionally governs only the minimum conflict rules necessary to make claims structurally valid.

Any included rules must be complete enough for implementation and may not defer material semantics.

A later contract may govern advanced conflict classes only.

### Required decision

The completed contract shall state:

> **Conflicts Contract Decision: Option A / Option B**

Exactly one option shall be selected.

"Some conflicts now, some later" is invalid unless Option B defines a closed present scope and a closed deferred scope.

If Option A is selected, Sprint 3.89 shall not make implicit conflict decisions elsewhere.

---

# Part VI — Governed Output Architecture

## 28. Required Claim-Boundary Publications

The completed contract shall define the final publication chain.

A candidate structure to evaluate is:

```text
Claim Boundary Ruleset
        ↓ applied to
Operator Request + Lineage + Permitted Context
        ↓ produces
Claim Boundary Evaluation
        ↓ produces
Governed Claim Set
        ↓ consumed by
Dedicated Conversational Projection Composer
```

The contract may select another structure only with explicit reasoning.

It shall state which publication owns:

* recognition;
* clarification requirement;
* unsupported outcome;
* claim identities;
* claim types;
* materiality;
* source requirements;
* bounded completeness;
* ruleset identity.

The projection composer shall consume the governed claim set.

It shall not recreate it.

---

## 29. Empty, Unsupported, and Clarification Outcomes

The contract shall decide whether the claim-boundary process may produce:

### Empty claim set

Valid only where the request contains no governed factual claim.

### Unsupported outcome

Valid where the request seeks a factual claim outside the governed vocabulary or mechanism.

### Clarification-required outcome

Valid where the claim family is governed but a required parameter or identity remains unresolved.

The contract shall define whether these are:

* separate publication variants;
* one discriminated evaluation outcome;
* claim records with special status;
* another closed representation.

Implementation shall not infer this later.

---

## 30. Model Boundary

The completed contract shall state exactly what the model receives when:

* all claims are recognised;
* some claims are unsupported;
* clarification is required;
* the message contains no governed factual claims;
* the message contains mixed governed and open-ended content.

The model may:

* articulate deterministic claim statuses;
* explain evidence-supported facts;
* provide non-authoritative interpretation;
* phrase clarification choices;
* continue open-ended conversation within the governed segmentation rule.

The model may not:

* introduce a new factual claim;
* merge two claims;
* upgrade unsupported;
* answer a factual connected-data question omitted from the governed claim set;
* redefine importance;
* interpret a heuristic as significance;
* claim that classification succeeded when no evaluation publication exists.

---

# Part VII — Classification and Registers

## 31. Final Decision Matrix

The completed contract shall include at least the following matrix:

| Question                                | Final decision | Architectural owner | Binding mechanism | Rejected alternatives | Implementation consequence |
| ----------------------------------------- | --------------- | -------------------- | ------------------- | ----------------------- | ----------------------------- |
| One claim and authoritative input         | ...             | ...                  | ...                 | ...                     | ...                            |
| Vocabulary, compound, negative            | ...             | ...                  | ...                 | ...                     | ...                            |
| Type/materiality/source/coverage owner    | ...             | ...                  | ...                 | ...                     | ...                            |
| Permitted bounding mechanisms             | ...             | ...                  | ...                 | ...                     | ...                            |
| Uncertainty                               | ...             | ...                  | ...                 | ...                     | ...                            |
| Unsupported and clarification             | ...             | ...                  | ...                 | ...                     | ...                            |
| Claim-family separation                   | ...             | ...                  | ...                 | ...                     | ...                            |
| Conversational breadth                    | ...             | ...                  | ...                 | ...                     | ...                            |
| Ruleset and publication identity          | ...             | ...                  | ...                 | ...                     | ...                            |
| Source-category independence              | ...             | ...                  | ...                 | ...                     | ...                            |
| Conflicts relationship                    | ...             | ...                  | ...                 | ...                     | ...                            |

Every row must contain a binding answer.

---

## 32. Final Classification Matrix

The contract shall resolve the Sprint 3.88 claims items using:

* **Accepted**
* **Modified**
* **Deferred**
* **Rejected**

Required structure:

| Item | Sprint 3.88 finding | Final outcome | Architectural class | Binding decision | Owner | Implementation consequence |
| ---- | -------------------- | --------------- | --------------------- | ------------------- | ------ | ----------------------------- |

At minimum include:

* claim unit;
* claim vocabulary;
* compound questions;
* negative claims;
* recognition mechanism;
* type assignment;
* materiality;
* source requirements;
* coverage rules;
* unsupported language;
* clarification;
* claim-family separation;
* mixed conversational messages;
* claim ruleset;
* claim evaluation publication;
* governed claim-set publication;
* Cassie contact-address claim;
* Cassie importance claim;
* source-category independence;
* conflicts sequencing.

---

## 33. Rejected Register

The completed contract shall explicitly consider and classify at least:

* answering-model claim classification;
* LLM-based intent extraction;
* unrestricted semantic parsing;
* embedding-similarity claim assignment;
* route-owned claim construction;
* prompt-builder claim construction;
* treating every free-text sentence as a claim;
* one blended claim for compound questions;
* one blended status for the Cassie request;
* unread as importance;
* Gmail-important as operator importance;
* labels as significance;
* legacy attention ranking as evidence;
* silent unsupported-to-model fallback;
* synthetic claim identities;
* unversioned recognition rules;
* implementation-selected recognition mechanisms.

Every rejection shall state the false claim or authority problem prevented.

---

## 34. Deferred Register

Any Deferred item shall record:

* why it is not required to close the claims boundary;
* what evidence or governance is missing;
* whether it blocks isolated claims implementation;
* whether it blocks source-category contracts;
* whether it blocks production integration;
* the expected future sprint.

Potential deferred matters include:

* new claim families beyond the governed vocabulary;
* message-significance governance;
* general-purpose natural-language intent recognition;
* conflict semantics if Option A is selected;
* advanced cross-turn claim continuity;
* production UI design;
* operator verification;
* promotion.

Deferral shall not be used to avoid answering any of the nine Sprint 3.88 questions.

---

# Part VIII — Implementation Authority and Sequence

## 35. No Implementation Authority

The final contract shall state:

> Sprint 3.89 establishes claims-boundary governance only. It does not implement claim recognition, claim construction, clarification, UI affordances, route behavior, source publication, conflicts, projection integration, model changes, or production behavior.

Do not modify:

```text
app/api/chat/route.ts
lib/context-builder.ts
lib/useAgentConversation.ts
lib/governed-conversation/
lib/executive-context/
lib/memory/
lib/operational-state.ts
```

No test changes are authorised.

No prompt changes are authorised.

No selector changes are authorised.

---

## 36. Future Implementation Boundary

A future isolated implementation sprint may implement:

* the selected claim-boundary architecture;
* the closed ruleset;
* deterministic claim construction;
* clarification and unsupported outcomes;
* publication identities;
* Cassie decomposition tests;
* integration with existing evidence-status computation;
* no production route integration.

It shall remain isolated first.

Production integration remains a later sprint after:

* source-specific evidence contracts and publishers;
* source-evidence registry governance;
* history governance where required;
* conflicts governance where required;
* isolated evaluation;
* production evidence readiness.

---

## 37. Source-Category Sequence Decision

The contract shall produce a binding statement on whether the following may proceed in parallel after Sprint 3.89:

```text
Gmail publication contract
Calendar publication contract
Memory/priority publication contract
Connector-availability contract
```

The decision shall not authorize implementation merely because parallel governance is permitted.

It shall state what remains dependent on claims.

---

## 38. Expected Follow-On

The completed contract shall identify the next provisional sprint.

Possible outcomes include:

* isolated claims-boundary implementation;
* dependent conflicts contract;
* one or more source-specific contracts proceeding in parallel;
* a source-evidence admission contract.

The sequencing decision must be based on the final dependency findings.

The contract shall not automatically declare claims implementation next if required publication identities or conflict rules remain unresolved.

---

## 39. Output Location

Create exactly:

```text
docs/SPRINT-3.89-GOVERNED-CONVERSATIONAL-CLAIMS-BOUNDARY-CONTRACT.md
```

This follows the numbered-sprint convention for bounded governance decisions.

Do not place it under `docs/architecture/`.

No other file shall change.

---

## 40. Validation

Full repository validation is mandatory.

There is no documentation-only exception.

Run:

```text
npm test
npm run build
npm run lint
npm run typecheck
git diff --check
```

Use current repository-defined equivalents if materially different.

Validation shall additionally confirm:

1. only the Sprint 3.89 contract document changed;
2. no source code changed;
3. no tests changed;
4. all nine Sprint 3.88 questions received binding decisions;
5. exactly one Claims-Boundary Architecture was selected;
6. all non-selected architectural options were rejected with reasoning;
7. the Cassie request was decomposed into two claims;
8. the importance claim remains unsupported;
9. settled heuristic exclusions remain intact;
10. source-category independence was explicitly confirmed or corrected;
11. one Conflicts Option was selected;
12. required publication identities were defined;
13. prohibited hedge language does not appear in final decisions;
14. Rejected and Deferred registers are present;
15. the final decision and classification matrices are complete;
16. implementation is explicitly unauthorized.

Any pre-existing validation failure must be distinguished from a sprint-created failure.

Do not report incomplete validation as passing.

---

## 41. Completion Report

The completion report shall contain the following sections.

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

### Sprint 3.88 Claims Finding

Confirm complete review of:

* the deterministic-design gap;
* the Cassie decomposition;
* all nine governance questions.

### Claims-Boundary Architecture

State exactly:

```text
Claims-Boundary Architecture: Option A
```

or:

```text
Claims-Boundary Architecture: Option B
```

or:

```text
Claims-Boundary Architecture: Option C
```

or:

```text
Claims-Boundary Architecture: Option D
```

### Decision 1 — Claim Unit and Authoritative Input

State the binding decision and rejected alternatives.

### Decision 2 — Vocabulary, Compound, and Negative Claims

State the binding decisions.

### Decision 3 — Type, Materiality, Source, and Coverage Ownership

Name each owner.

### Decision 4 — Permitted Mechanisms

List the closed permitted and prohibited mechanisms and precedence.

### Decision 5 — Uncertainty

State the closed vocabulary and ownership.

### Decision 6 — Unsupported and Clarification

State the trigger and clarification rules.

### Decision 7 — Claim-Family Separation

Include the required table.

### Decision 8 — Conversational Breadth

State the ordinary and mixed-message rules.

### Decision 9 — Ruleset and Publications

Name the authoritative publications and identities.

### Cassie Constitutional Test

Show the deterministic decomposition and status result for:

* contact-address claim;
* importance claim.

State explicitly that importance remains unsupported.

### Source-Category Independence

Include the required four-category table.

### Source Evidence and History Relationships

State the dependent and independent boundaries.

### Conflicts Decision

State exactly:

```text
Conflicts Contract Decision: Option A
```

or:

```text
Conflicts Contract Decision: Option B
```

### Publication Architecture

Describe the final claim-boundary publication chain.

### Final Decision Matrix

Include the completed matrix.

### Final Classification Matrix

Include outcomes and counts.

### Rejected Register

List all rejected mechanisms and assumptions.

### Deferred Register

List all deferred matters and blocking effect.

### Files Changed

Expected:

```text
docs/SPRINT-3.89-GOVERNED-CONVERSATIONAL-CLAIMS-BOUNDARY-CONTRACT.md
```

### Validation

Report exact commands and results.

### Implementation Authority

State:

> Sprint 3.89 authorizes no implementation and changes no production behavior.

### Next Step

Identify the next governance or isolated implementation sprint permitted by the completed dependency decisions.

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

## 42. Recommendation Gate

### Governed Contract Complete

Use only when:

* all required governing artefacts were available;
* all nine Sprint 3.88 questions were independently answered;
* one Claims-Boundary Architecture was selected;
* no hedge language remains in final decisions;
* one deterministic pre-model claim owner is named;
* one closed mechanism and precedence model is defined;
* unsupported and clarification rules are binding;
* compound and negative claim rules are binding;
* claim families are separated;
* conversational breadth is addressed;
* ruleset and publication identities are defined;
* the Cassie request is correctly decomposed;
* contact address and importance remain separate;
* importance remains unsupported;
* heuristic exclusions remain intact;
* source-category independence is decided;
* one Conflicts Option is selected;
* no implementation occurred;
* full validation passed or any unrelated pre-existing failure was clearly evidenced.

### Governance Review Incomplete

Use when:

* any of the nine questions remains unresolved;
* more than one primary architecture remains permitted without deterministic precedence;
* implementation retains discretion to choose mechanisms;
* Cassie cannot be decomposed without model classification;
* importance is implicitly redefined;
* source-category independence remains ambiguous;
* conflicts sequencing remains ambiguous;
* publication identity is unresolved;
* required governing authority is unavailable;
* validation is incomplete;
* code or tests changed.

---

## 43. Return Format

Return:

1. Repository Precondition result.
2. Governing artefacts reviewed.
3. Sprint 3.88 Claims Finding confirmation.
4. Selected Claims-Boundary Architecture.
5. Claim-unit and authoritative-input decision.
6. Vocabulary, compound, and negative-claim decision.
7. Type/materiality/source/coverage ownership decision.
8. Permitted-mechanism and precedence decision.
9. Uncertainty vocabulary and ownership.
10. Unsupported and clarification rules.
11. Claim-family separation.
12. Conversational-breadth and mixed-message rule.
13. Ruleset and publication identity decision.
14. Cassie deterministic decomposition.
15. Cassie contact-address status rule.
16. Cassie importance unsupported confirmation.
17. Source-category independence table.
18. Source-evidence relationship.
19. Conversation-history relationship.
20. Conflicts Option.
21. Publication architecture.
22. Final decision matrix.
23. Final classification matrix.
24. Rejected register.
25. Deferred register.
26. Files changed.
27. Full validation results.
28. Explicit confirmation that no implementation occurred.
29. Recommended next sprint.
30. Final recommendation gate.

The final line must be exactly one of:

> **Governed Contract Complete**

or:

> **Governance Review Incomplete**

---

## 44. Success Criteria

Sprint 3.89 succeeds when a future implementation sprint no longer needs to invent answers to any of these questions:

* What is one claim?
* What deterministic input creates it?
* How are compound questions divided?
* How are negative claims represented?
* Who assigns type and materiality?
* Who owns source and coverage requirements?
* Which recognition mechanisms are permitted?
* What happens when language is ambiguous?
* When is a request unsupported?
* When may the operator clarify it?
* How are identity, contact, importance, schedule, absence, and retrieval separated?
* How does ordinary conversational breadth continue?
* Which ruleset proves classification ran?
* Which immutable publication contains the claim set?
* How does the Cassie request become two claims without an LLM?
* Why does the address claim potentially succeed while importance remains unsupported?
* Which source-category contracts may proceed independently?
* Does conflict governance remain separate?

The contract shall not make JARVIS less conversational by accident.

It shall not make JARVIS less governed in order to preserve conversational convenience.

The desired boundary is one in which:

```text
operator interaction
        ↓
deterministic governed claim boundary
        ↓
recognised claims / clarification / unsupported
        ↓
versioned claim-set publication
        ↓
governed evidence projection
        ↓
model-mediated explanation and collaboration
```

The model remains the conversational interface.

It does not become the authority that decides what factual claims exist.
