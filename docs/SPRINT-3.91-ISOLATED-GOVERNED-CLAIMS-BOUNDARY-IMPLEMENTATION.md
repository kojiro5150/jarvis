# Sprint 3.91 — Isolated Governed Claims Boundary Implementation

## Part 1: Recognition and Publication

**Status:** Specification
**Sprint Type:** Isolated Governance-Authorized Implementation
**Governing Authority:** Sprint 3.89 — Governed Conversational Claims Boundary Contract
**Production Integration:** Prohibited
**Output Path:** `docs/SPRINT-3.91-ISOLATED-GOVERNED-CLAIMS-BOUNDARY-IMPLEMENTATION.md`

---

## 1. Purpose

Sprint 3.91 implements the first bounded portion of the claims architecture authorised by Sprint 3.89.

Sprint 3.89 selected:

> **Claims-Boundary Architecture: Option C**

Option C establishes one fixed, ordered, pre-model mechanism:

1. explicit typed capability or typed UI intent;
2. closed deterministic recognition against a versioned vocabulary;
3. deterministic clarification where a recognised intent lacks required parameters or has a governed ambiguity;
4. fail-closed unsupported for anything unmatched, unresolved after permitted clarification, or outside the governed vocabulary.

No model-based classification is permitted at any stage.

Sprint 3.91 shall implement only the core recognition-to-publication chain for the existing communication claim family needed by the proven Cassie scenario:

* `contact_address_lookup`;
* `message_importance`.

This sprint does not implement a general conversational claim parser.

It does not admit new cross-domain claim types.

It does not implement source acquisition, evidence evaluation, conflict evaluation, route integration, operator verification, or promotion.

The central implementation objective is:

> **Build a deterministic, versioned, isolated engine that converts an authorised typed intent or bounded communication-language pattern into real existing `GovernedClaimInput[]`, a deterministic clarification-required publication, or a fail-closed unsupported publication.**

The central proof is:

> **"What's Cassie's email? Anything important?" deterministically becomes two separate governed communication claims—one `contact_address_lookup` claim and one unsupported `message_importance` claim—without any model classification or heuristic influence.**

---

## 2. Sprint Character

This is an isolated implementation sprint.

It may:

* add claims-boundary modules under `lib/governed-conversation/`;
* add immutable publication types specific to the Sprint 3.89 claim-boundary chain;
* add a versioned communication ruleset;
* add deterministic typed-intent validation;
* add deterministic exact-command, alias, lexical-pattern, and bounded-grammar matching;
* add deterministic parameter extraction for the two governed claim types;
* add deterministic clarification and unsupported outcomes;
* construct real existing `GovernedClaimInput` values;
* add fixtures and tests;
* add pure-Node isolation checks.

It is not:

* a claims contract;
* a general-purpose natural-language parser;
* a model-assisted intent classifier;
* a cross-domain claims implementation;
* a Calendar claims implementation;
* a memory or priority claims implementation;
* a source-evidence implementation;
* a conflict implementation;
* a source acquisition sprint;
* a projection-composer modification;
* a model-invocation modification;
* an `/api/chat` integration sprint;
* a selector sprint;
* an operator-verification sprint;
* a promotion sprint.

---

## 3. Governing Hierarchy

The sprint shall apply the repository's established hierarchy:

1. JARVIS Engineering Constitution
2. JARVIS North Star
3. JARVIS Engineering Specification Standard
4. Constitutional Publication Principles
5. `docs/architecture/ROADMAP.md`
6. Sprint 3.89 — Governed Conversational Claims Boundary Contract
7. Sprint 3.82 — Governed Conversational Lineage Identity Contract
8. Sprint 3.76 — Governed Conversational Runtime Contract
9. Sprint 3.85 — Governed Conversational Identity Correction Contract
10. Sprint 3.77 — Isolated Governed Conversational Runtime Implementation
11. Sprint 3.83 — Isolated Conversational Lineage and Projection Implementation
12. existing `GovernedClaimInput` and governed-conversation types
13. this Sprint specification

Sprint 3.89 is binding for:

* Option C's four-stage order;
* the claim unit;
* typed intent precedence;
* deterministic recognition;
* deterministic clarification;
* fail-closed unsupported;
* the closed communication vocabulary;
* claim ownership;
* materiality ownership;
* source and coverage rule ownership;
* unsupported importance;
* model exclusion;
* publication identity;
* mixed-message segmentation;
* claim-set publication.

Sprint 3.91 shall not reopen any of those decisions.

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

docs/SPRINT-3.89-GOVERNED-CONVERSATIONAL-CLAIMS-BOUNDARY-CONTRACT.md
docs/SPRINT-3.77-ISOLATED-GOVERNED-CONVERSATIONAL-RUNTIME-IMPLEMENTATION.md
docs/SPRINT-3.83-ISOLATED-CONVERSATIONAL-LINEAGE-AND-PROJECTION-IMPLEMENTATION.md
docs/SPRINT-3.76-GOVERNED-CONVERSATIONAL-RUNTIME-CONTRACT.md
docs/SPRINT-3.82-GOVERNED-CONVERSATIONAL-LINEAGE-IDENTITY-CONTRACT.md
docs/SPRINT-3.85-GOVERNED-CONVERSATIONAL-IDENTITY-CORRECTION-CONTRACT.md
```

5. Read Sprint 3.89 completely before modifying code.
6. Confirm directly that it contains:

   * **Claims-Boundary Architecture: Option C**;
   * the fixed precedence order;
   * the permitted mechanisms;
   * the prohibited mechanisms;
   * the unsupported and clarification rules;
   * the claim-family separation model;
   * the Cassie decomposition;
   * the immutable publication chain;
   * the source-category independence finding;
   * **Conflicts Contract Decision: Option A**.
7. Read Sprint 3.77 and Sprint 3.83 completely as isolation precedents.
8. Inspect the current implementation of:

```text
lib/governed-conversation/types.ts
lib/governed-conversation/evidence-status.ts
lib/governed-conversation/input.ts
lib/governed-conversation/projection-composer.ts
lib/governed-conversation/fixtures.ts
lib/governed-conversation/lineage-test-fixtures.ts
```

9. Confirm the exact existing `GovernedClaimInput` shape.

At the current repository state, it includes:

```ts
interface GovernedClaimInput {
  readonly claimId: string;
  readonly claimType: CommunicationClaimType;
  readonly material: boolean;
  readonly status: ConversationalEvidenceStatus;
  readonly ownership:
    | "deterministic_observation"
    | "deterministic_status"
    | "unsupported";
  readonly sourceReferences: readonly GovernedSourceReference[];
  readonly factualValues: readonly unknown[];
  readonly sourceAvailable: boolean;
  readonly provenance: string;
  readonly observedAt: string;
  readonly contentKind: ContentKind;
  readonly boundedComplete: boolean;
  readonly conflicts: readonly GovernedConflict[];
}
```

10. Confirm the current `CommunicationClaimType` vocabulary and do not redefine it.
11. Locate all Cassie fixtures and tests.
12. Locate every existing construction of:

* `contact_address_lookup`;
* `message_importance`.

13. Confirm whether current fixtures assign:

* materiality;
* unsupported status;
* ownership;
* provenance;
* content kind;
* bounded completeness;
* empty conflict arrays.

**Note confirmed directly against the repository:** the existing fixtures in `lib/governed-conversation/fixtures.ts` (e.g. `cassieFixture`, `unsupportedImportanceFixture`) construct `contact_address_lookup` claims with `status: "available"`, `ownership: "deterministic_observation"`, and populated `sourceReferences`/`factualValues`. These are **post-evidence** fixtures — built for downstream evidence-status and validator tests, representing a claim after evidence has already been evaluated. They are not examples of what this sprint's recognition/publication engine should itself produce, since the boundary engine runs *before* any evidence acquisition. Do not copy this pattern directly; see Section 18's exact pre-evidence status requirement, which must be internally consistent with the real `computeEvidenceStatus` function in `evidence-status.ts`, not merely plausible in isolation.

14. Search the repository for existing claim-boundary, intent, capability, command, alias, grammar, or entity-resolution mechanisms.
15. Record pre-sprint blob hashes for all protected production files listed in Section 24.
16. Confirm only the new isolated modules, their tests, and the Sprint 3.91 document are expected to change.

If Sprint 3.89 is absent, stop.

If the existing `GovernedClaimInput` has materially changed from the contract's assumptions, stop and report rather than redefining it.

If implementing the two communication claims requires a general cross-domain vocabulary or an ungoverned semantic parser, stop and return:

> **Implementation Incomplete**

---

## 5. Binding Scope

Sprint 3.91 implements only:

```text
communication claim family
├── contact_address_lookup
└── message_importance
```

It may recognise and publish those two types only.

The sprint shall not admit:

* `recipient_membership`;
* `message_identity`;
* `message_subject`;
* `message_excerpt`;
* `message_full_content`;
* `message_absence`;
* `message_urgency`;
* `message_actionability`;
* Calendar claims;
* memory claims;
* priority claims;
* generic source claims;
* significance rules;
* conflicts.

The fact that other claim types already exist in `CommunicationClaimType` does not authorise recognition rules for them in Sprint 3.91.

---

## 6. Required Architecture

The implementation shall follow this fixed architecture:

```text
Operator interaction
        ↓
Stage 1 — typed capability/UI intent validation
        ↓ if no typed publication exists
Stage 2 — closed deterministic recognition
        ↓
Stage 3 — deterministic clarification, where permitted
        ↓
Stage 4 — fail-closed unsupported
        ↓
ClaimBoundaryEvaluation
        ↓ when recognised
GovernedClaimSet
        ↓
GovernedClaimInput[]
```

No stage may be skipped.

No later stage may override a valid result from an earlier stage.

No model call may occur anywhere in this chain.

---

## 7. Expected New Modules

Create the following modules under:

```text
lib/governed-conversation/
```

Recommended exact paths:

```text
lib/governed-conversation/claim-boundary-types.ts
lib/governed-conversation/claim-boundary-ruleset.ts
lib/governed-conversation/claim-boundary-engine.ts
lib/governed-conversation/claim-boundary-publications.ts
lib/governed-conversation/claim-boundary-fixtures.ts
```

Tests:

```text
lib/governed-conversation/claim-boundary-ruleset.test.ts
lib/governed-conversation/claim-boundary-engine.test.ts
lib/governed-conversation/claim-boundary-publications.test.ts
lib/governed-conversation/claim-boundary-isolation.test.ts
```

A different split is permitted only where it preserves the same explicit responsibilities.

The completion report shall state the exact final paths.

---

## 8. Module Responsibilities

### `claim-boundary-types.ts`

Own only the new boundary/publication types authorised by Sprint 3.89.

It shall not redefine:

* `GovernedClaimInput`;
* `CommunicationClaimType`;
* evidence statuses;
* source references;
* conflict types.

### `claim-boundary-ruleset.ts`

Own:

* the immutable versioned ruleset;
* typed intent definitions;
* exact commands;
* declared aliases;
* bounded lexical patterns;
* deterministic grammar rules;
* claim templates;
* materiality;
* permitted parameters;
* source requirement references;
* completeness-rule references;
* clarification rules;
* unsupported rules.

### `claim-boundary-engine.ts`

Own:

* the fixed Option C execution order;
* typed-intent validation;
* rule matching;
* deterministic segmentation;
* parameter extraction;
* clarification outcomes;
* unsupported outcomes;
* claim construction;
* evaluation publication;
* claim-set publication.

### `claim-boundary-publications.ts`

Own constructors and validation for:

* `ClaimBoundaryRuleset`;
* `ClaimBoundaryEvaluation`;
* `GovernedClaimSet`.

It shall enforce identity integrity.

### `claim-boundary-fixtures.ts`

Own deterministic test fixtures only.

It shall not become a production registry.

---

## 9. Versioned `ClaimBoundaryRuleset`

Implement a real immutable:

```text
ClaimBoundaryRuleset
```

The ruleset shall contain at minimum:

* `claimBoundaryRulesetId`;
* schema version;
* ruleset version;
* publication digest or content-derived identity material;
* closed communication claim intents;
* precedence;
* typed capability definitions;
* typed UI intent definitions where represented;
* exact commands;
* declared aliases;
* lexical patterns;
* deterministic grammar;
* parameter definitions;
* claim templates;
* materiality;
* source requirement references;
* bounded completeness references;
* clarification rules;
* unsupported rules;
* prohibited heuristic fields.

The ruleset shall contain exactly two claim templates for this sprint:

```text
contact_address_lookup
message_importance
```

No open extension map such as:

```ts
Record<string, unknown>
```

may permit implementation-defined claim types.

---

## 10. Ruleset Identity

The ruleset identity shall represent one immutable ruleset body.

Changing any of the following must require a new identity:

* command;
* alias;
* lexical pattern;
* grammar rule;
* claim template;
* materiality;
* source requirement;
* completeness rule;
* clarification rule;
* unsupported rule;
* prohibited field set;
* precedence.

The ruleset ID shall not be:

* a mutable constant reused after rule changes;
* an exchange ID;
* a claim-set ID;
* an evaluation ID;
* a route name.

Tests shall prove that a material ruleset-body change produces a different identity or is rejected under the existing identity policy.

---

## 11. Stage 1 — Typed Intent

Implement typed-intent handling as the first stage.

The typed input shape shall be closed and schema validated.

At minimum support typed forms equivalent to:

```ts
type CommunicationTypedIntent =
  | {
      readonly type: "contact_address_lookup";
      readonly personName?: string;
    }
  | {
      readonly type: "message_importance";
      readonly personName?: string;
    };
```

Exact names may vary.

Required rules:

* a valid typed intent stops further recognition;
* typed intent takes precedence over free-text matching;
* a malformed but recognised typed intent may produce clarification only where Sprint 3.89 permits it;
* an unknown typed claim type produces unsupported;
* an invalid typed intent does not fall through into text matching;
* typed input must not carry heuristic evidence into claim construction.

---

## 12. Stage 2 — Closed Deterministic Recognition

Implement bounded deterministic recognition for ordinary text.

Permitted mechanisms:

* exact commands;
* declared aliases;
* bounded lexical patterns;
* deterministic grammar rules;
* deterministic span extraction;
* exact parameter extraction supported by the ruleset.

Prohibited:

* LLM classification;
* embeddings;
* vector similarity;
* probabilistic classification;
* unrestricted NLP parsing;
* semantic similarity services;
* model-generated entities;
* fuzzy intent assignment;
* route-provided classification;
* connector-provided classification.

The recogniser must be a pure deterministic function of:

* operator input;
* typed intent, if supplied;
* immutable ruleset;
* explicitly authorised deterministic entity context, if present.

---

## 13. Communication Recognition Vocabulary

The ruleset shall support bounded language for the two claim types.

### Contact-address lookup

Recognisable bounded forms may include explicitly declared patterns equivalent to:

* "What's Cassie's email?"
* "What is Cassie's email address?"
* "Give me Cassie's email."
* "Do you have Cassie's email?"
* an exact typed `contact_address_lookup` intent.

The implementation shall not create a general possessive-language parser.

Each supported form must be represented by an explicit rule or bounded grammar.

### Message importance

Recognisable bounded forms may include explicitly declared patterns equivalent to:

* "Anything important?"
* "Are any of Cassie's messages important?"
* "Is there anything important from Cassie?"
* an exact typed `message_importance` intent.

Recognition of `message_importance` does not make it supported.

The claim must be constructed with:

```text
status = unsupported
ownership = unsupported
```

under the current contract.

---

## 14. Compound-Question Segmentation

The engine must deterministically segment compound input.

Required central fixture:

> "What's Cassie's email? Anything important?"

The engine shall identify two bounded spans:

1. contact-address span;
2. importance span.

It shall produce two independently identified claims.

It shall not:

* merge them into one claim;
* assign one blended status;
* let the importance segment inherit address evidence;
* let the contact-address segment inherit unsupported importance semantics;
* ask a model to split the sentence.

The segment map shall be preserved in `ClaimBoundaryEvaluation`.

---

## 15. Stage 3 — Deterministic Clarification

Implement only the clarification conditions required for this narrow scope.

At minimum:

### Missing contact person

Example:

> "What's their email?"

where no explicit deterministic person identity is supplied.

Outcome:

```text
missing_required_parameter
```

or the exact Sprint 3.89-authorised equivalent.

### Ambiguous bounded rule match

If one span matches both governed rules equally under the declared grammar, produce:

```text
ambiguous_governed_intent
```

with closed choices.

Do not select one.

### Unresolved entity

Where the recognised contact claim contains a person name but the supplied deterministic entity context contains:

* multiple exact matches; or
* no exact match where typed clarification is permitted,

produce:

```text
unresolved_entity
```

Clarification output shall contain only engine-owned:

* reason;
* required field;
* closed options, where available;
* continuation token;
* prior evaluation reference where applicable.

No model-generated clarification options are permitted.

---

## 16. Clarification Limit in Part 1

Sprint 3.91 shall implement the publication and deterministic result for clarification.

It does not need to implement:

* multi-turn route continuation;
* UI rendering;
* persistence;
* operator response handling through `/api/chat`;
* production entity lookup.

A deterministic continuation input may be tested in isolation if required to prove the ruleset, but production continuation is outside scope.

---

## 17. Stage 4 — Fail-Closed Unsupported

Unmatched, prohibited, or unresolved input shall never produce a guessed claim.

Required unsupported cases include:

* no governed pattern match;
* unknown typed claim type;
* language requiring model interpretation;
* cross-domain request;
* unsupported claim family;
* prohibited significance request outside the admitted `message_importance` template;
* repeated unresolved clarification where represented in fixtures;
* ambiguous input with no permitted closed clarification;
* general language that superficially resembles email or importance without satisfying a rule.

Outcome must be an explicit:

```text
unsupported
```

evaluation publication.

Unsupported input shall not produce a `GovernedClaimSet` unless Sprint 3.89's exact publication rule authorises a recognised unsupported claim type.

For the recognised existing `message_importance` type:

* the engine shall publish a real claim;
* the claim status shall be `unsupported`;
* the evaluation itself remains recognised.

For unknown claim families:

* no fabricated claim is created;
* the evaluation records unsupported language or unsupported claim type.

---

## 18. Claim Construction

The engine shall construct actual existing:

```text
GovernedClaimInput
```

instances.

It shall not create a parallel claim DTO and defer mapping.

Every constructed claim must populate all required existing fields truthfully.

### Contact-address claim

Expected properties, **verified against the real `computeEvidenceStatus` function in `evidence-status.ts`** rather than chosen independently:

```text
claimType: "contact_address_lookup"
material: true
ownership: "deterministic_status"
sourceReferences: []
factualValues: []
provenance: deterministic boundary publication reference
observedAt: evaluation/reference time
contentKind: "metadata"
boundedComplete: false
conflicts: []
```

**`sourceAvailable` and `status` must be set as an internally consistent pair, not chosen independently.** The real function is:

```ts
function computeEvidenceStatus(c: ClaimStatusConditions): ConversationalEvidenceStatus {
  if (!c.supported) return "unsupported";
  if (!c.sourceAvailable) return "unavailable";
  return (all conditions met) ? "available" : "insufficient_coverage";
}
```

At recognition time, the boundary engine has not yet queried any source — it has not determined the source is unavailable, only that it has not yet been checked. The honest, function-consistent pair is therefore:

```text
sourceAvailable: true
status: "insufficient_coverage"
```

`sourceAvailable: true` reflects that nothing has established unavailability; `insufficient_coverage` is the only status `computeEvidenceStatus` can return when `sourceAvailable` is true but identity/provenance/coverage/freshness conditions are not yet established — which is truthfully this claim's state before evidence acquisition runs. Do **not** pair `sourceAvailable: false` with `status: "insufficient_coverage"` — that combination cannot be produced by the real function (`sourceAvailable: false` routes to `"unavailable"`) and would leave this claim's pre-evidence state internally inconsistent with the governed status-computation logic it will later flow through.

Do not falsely mark the claim `available`. The engine performs recognition and publication, not source evidence acquisition. The central requirement is that this claim is **available-eligible**, not already available.

### Message-importance claim

Expected properties include:

```text
claimType: "message_importance"
material: true
status: "unsupported"
ownership: "unsupported"
sourceReferences: []
factualValues: []
sourceAvailable: false
provenance: deterministic boundary publication reference
observedAt: evaluation/reference time
contentKind: "metadata"
boundedComplete: false
conflicts: []
```

Note this claim's `status: "unsupported"` takes precedence in `computeEvidenceStatus`'s own branch order (`if (!c.supported) return "unsupported"` is checked first) — so `sourceAvailable: false` here does not create the same inconsistency as it would for the contact-address claim, since `unsupported` is reached before `sourceAvailable` is ever examined.

Do not treat any Gmail heuristic as source evidence.

---

## 19. Materiality

Materiality shall come only from the immutable ruleset.

For the Cassie fixture:

```text
contact_address_lookup → material
message_importance → material
```

Input fields shall not override materiality.

The following shall not influence materiality:

* unread;
* important;
* `needsReply`;
* labels;
* ordering;
* sender frequency;
* message count;
* snippet content;
* model judgment.

Tests shall mutate those fields and prove the constructed claims remain identical in:

* claim type;
* materiality;
* status;
* ownership;
* source requirements.

---

## 20. Heuristic Exclusion Boundary

The ruleset shall explicitly record the prohibited heuristic fields:

```text
unread
important
needsReply
labels
legacy attention ranking
message ordering
```

The engine shall not accept these fields as recognition inputs.

If the boundary input includes compatibility metadata containing them:

* they must be ignored for recognition;
* they must be ignored for materiality;
* they must be ignored for status;
* they must not appear in provenance as claim evidence;
* they must not create an importance claim unless the operator's request independently matches the governed intent.

Required test:

Two otherwise identical recognition requests—one with heuristic flags and one without—must produce structurally identical claim-boundary results, apart from explicitly excluded compatibility references where such references are preserved non-canonically.

---

## 21. `ClaimBoundaryEvaluation`

Implement a real immutable evaluation publication.

At minimum it shall contain:

* `claimBoundaryEvaluationId`;
* schema version;
* `claimBoundaryRulesetId`;
* thread ID;
* request ID;
* exchange ID;
* input digest;
* reference time;
* typed-intent result;
* matched rule IDs;
* matched spans;
* extracted parameters;
* segmentation;
* outcome;
* uncertainty reason where applicable;
* clarification publication where applicable;
* unsupported reason where applicable;
* optional prior evaluation ID;
* created-at time.

Required outcome vocabulary for this sprint shall be a closed subset of Sprint 3.89's vocabulary sufficient to represent:

```text
recognised
missing_required_parameter
ambiguous_governed_intent
unresolved_entity
unsupported_language
unsupported_claim_type
no_governed_factual_claim
```

Do not add implementation-defined outcomes.

---

## 22. `GovernedClaimSet`

Implement a real immutable claim-set publication.

At minimum it shall contain:

* `governedClaimSetId`;
* schema version;
* `claimBoundaryEvaluationId`;
* `claimBoundaryRulesetId`;
* thread ID;
* request ID;
* exchange ID;
* reference time;
* ordered `GovernedClaimInput[]`;
* segment links;
* claim IDs;
* created-at time.

A claim set shall be created only for outcomes authorised by Sprint 3.89.

At minimum:

* `recognised` → claim set;
* `no_governed_factual_claim` → valid empty claim set;
* clarification → no claim set;
* unsupported unknown family → no claim set.

The recognised `message_importance` claim remains a valid claim-set entry with unsupported evidence status.

---

## 23. Claim Identity

Each claim ID shall identify one immutable claim body.

Changing any of the following requires a new claim identity:

* claim type;
* materiality;
* polarity, if represented;
* parameters;
* source requirements;
* completeness rule;
* status;
* ownership;
* segment link;
* provenance;
* bounded completeness;
* conflicts.

Claim IDs shall not reuse:

* evaluation IDs;
* claim-set IDs;
* exchange IDs;
* ruleset IDs;
* typed-intent IDs.

Tests shall prove distinct Cassie claims have distinct IDs.

---

## 24. Isolation Boundary

Sprint 3.91 must remain completely isolated from production conversational execution.

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
lib/governed-conversation/model-invocation.ts
lib/governed-conversation/validator.ts
lib/governed-conversation/projection-composer.ts
```

unless a compile-only import adjustment is proven strictly necessary and does not change semantics.

The expected result is no modification to those files.

Do not modify EOS runtime files.

Do not add a selector.

Do not change live behavior.

---

## 25. Isolation Proof

Use pure Node-based isolation checks.

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
claim-boundary-types
claim-boundary-ruleset
claim-boundary-engine
claim-boundary-publications
claim-boundary-fixtures
```

Expected:

```text
zero imports
```

### Reverse search

Search the new claims-boundary modules for imports from:

```text
app/api/chat/
lib/context-builder.ts
lib/useAgentConversation.ts
lib/agents/
production components
EOS runtime implementation
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
```

Expected:

```text
byte-identical
```

Also hash any other protected live files identified during precondition inspection.

---

## 26. Cassie Central Test

Required exact test input:

> "What's Cassie's email? Anything important?"

The test shall run through the real new engine from raw operator text.

Do not directly instantiate claims in the test.

Required outcome:

```text
ClaimBoundaryEvaluation
  outcome = recognised
  matched spans = 2
  claimBoundaryRulesetId = expected versioned ruleset

GovernedClaimSet
  claims.length = 2
```

Claim 1:

```text
claimType = contact_address_lookup
material = true
sourceAvailable = true
status = insufficient_coverage
available-eligible, not already available
ownership = deterministic_status
```

Claim 2:

```text
claimType = message_importance
material = true
status = unsupported
ownership = unsupported
```

The test must also prove:

* distinct claim IDs;
* preserved order matching the operator request;
* separate segment links;
* no model call;
* no heuristic dependency;
* no conflict construction;
* no cross-domain claim type.

---

## 27. Typed-Intent Tests

Required tests:

1. valid typed `contact_address_lookup` intent produces one contact claim;
2. valid typed `message_importance` intent produces one unsupported importance claim;
3. typed intent takes precedence over conflicting free text;
4. malformed known typed contact intent with missing person produces clarification;
5. unknown typed intent produces unsupported;
6. invalid typed intent does not fall through to text recognition.

---

## 28. Pattern-Recognition Tests

Required tests:

1. exact contact-address command;
2. declared contact alias;
3. bounded contact lexical pattern;
4. exact importance command;
5. declared importance alias;
6. compound Cassie request;
7. punctuation variation explicitly admitted by grammar;
8. case normalization explicitly admitted by grammar;
9. unregistered synonym remains unsupported;
10. broad semantic paraphrase not represented in the ruleset remains unsupported.

The tests shall prove a closed vocabulary, not broad linguistic competence.

---

## 29. Clarification Tests

Required tests:

1. missing person name for contact lookup;
2. multiple exact entity candidates;
3. unresolved entity where typed identifier clarification is permitted;
4. equal governed rule match;
5. clarification output contains only closed engine-owned choices;
6. no claim set is published before clarification resolves;
7. clarification does not create a model call;
8. a second unresolved clarification produces unsupported where Sprint 3.89 requires it.

Entity fixtures may be synthetic and isolated.

No production contact connector is authorised.

---

## 30. Fail-Closed Tests

Required tests:

1. unmatched input → unsupported;
2. ambiguous input without a permitted closed clarification → unsupported;
3. Calendar question → unsupported;
4. memory/priority question → unsupported;
5. general significance request outside the admitted message-importance template → unsupported;
6. request requiring semantic interpretation → unsupported;
7. no claim is guessed from email-like wording alone;
8. unsupported unknown family produces no `GovernedClaimSet`;
9. no fallback to model classification;
10. no generic "communication question" claim is created.

---

## 31. Heuristic Mutation Tests

Required tests shall deliberately mutate:

* `unread`;
* `important`;
* `needsReply`;
* labels;
* message ordering;
* legacy attention metadata.

For each mutation, prove no change in:

* matched intent;
* claim count;
* claim type;
* materiality;
* claim status;
* ownership;
* source requirement;
* completeness requirement.

This shall be a real sensitivity proof that the excluded fields have no decision path into the engine.

---

## 32. Publication Tests

Required tests shall prove:

### Ruleset

* immutable;
* versioned;
* stable identity for identical body;
* changed identity or rejection for changed body;
* exactly two admitted claim templates.

### Evaluation

* unique evaluation identity;
* references the correct ruleset;
* records matched spans;
* records unsupported or clarification cause;
* does not alias request or exchange identity.

### Claim set

* unique claim-set identity;
* references evaluation and ruleset;
* preserves ordered real `GovernedClaimInput[]`;
* no set for clarification;
* no set for unknown unsupported family;
* valid set for recognised unsupported `message_importance`;
* empty set only for no governed factual claim.

---

## 33. Existing-Type Compatibility

The new engine must return the existing:

```text
GovernedClaimInput[]
```

without changing its definition.

Do not:

* widen `CommunicationClaimType`;
* add optional fields to make construction easier;
* add a new parallel claim type;
* weaken readonly semantics;
* replace existing evidence status;
* change ownership vocabulary;
* change conflict shape;
* make required fields optional.

If the existing type cannot truthfully represent the Sprint 3.89 publication semantics without semantic changes, stop.

Return:

> **Implementation Incomplete**

Do not silently modify the core type.

---

## 34. Conflicts Boundary

Conflicts are explicitly out of scope.

Sprint 3.90 governs them separately.

For Sprint 3.91:

```text
conflicts: []
```

means only:

* no conflict input has been supplied to this recognition/publication stage;
* this sprint did not evaluate conflicts.

It shall not mean:

* conflict evaluation ran;
* no conflict exists;
* evidence agrees.

Tests and documentation must not make that claim.

The claims-boundary engine shall not inspect EOS conflicts or source contradictions.

---

## 35. Source and Evidence Boundary

Sprint 3.91 does not acquire evidence.

It does not make contact-address claims `available`.

It does not:

* query Gmail;
* query contacts;
* read Calendar;
* read memory;
* populate source-qualified facts;
* establish connector availability;
* evaluate source coverage.

The engine publishes source and completeness requirements from the ruleset.

Actual evidence status evaluation remains owned by the existing downstream governed architecture.

---

## 36. Cross-Domain Stop Rule

If implementation reveals that the communication ruleset cannot be built without:

* a generic cross-domain intent type;
* a general natural-language parser;
* Calendar claim templates;
* memory claim templates;
* source-specific evidence mapping;
* conflict evaluation;
* model classification;

stop.

Do not expand Sprint 3.91.

Return:

> **Implementation Incomplete**

with the exact blocking evidence.

---

## 37. Expected Change Surface

### New modules

Expected:

```text
lib/governed-conversation/claim-boundary-types.ts
lib/governed-conversation/claim-boundary-ruleset.ts
lib/governed-conversation/claim-boundary-engine.ts
lib/governed-conversation/claim-boundary-publications.ts
lib/governed-conversation/claim-boundary-fixtures.ts
```

### New tests

Expected:

```text
lib/governed-conversation/claim-boundary-ruleset.test.ts
lib/governed-conversation/claim-boundary-engine.test.ts
lib/governed-conversation/claim-boundary-publications.test.ts
lib/governed-conversation/claim-boundary-isolation.test.ts
```

### Specification

```text
docs/SPRINT-3.91-ISOLATED-GOVERNED-CLAIMS-BOUNDARY-IMPLEMENTATION.md
```

### Existing files

Existing governed-conversation fixture or evaluation tests may be extended only where necessary to prove compatibility.

Any existing file modification must be listed and justified.

### Protected files

Expected unchanged:

```text
app/api/chat/route.ts
lib/context-builder.ts
lib/useAgentConversation.ts
lib/agents/chat-execution.ts
lib/governed-conversation/types.ts
lib/governed-conversation/evidence-status.ts
lib/governed-conversation/input.ts
lib/governed-conversation/projection-composer.ts
lib/governed-conversation/model-invocation.ts
lib/governed-conversation/validator.ts
```

---

## 38. Explicitly Out of Scope

Do not implement:

* conflicts;
* Sprint 3.90 decisions;
* Gmail publication;
* Calendar publication;
* memory or priority publication;
* connector availability;
* source-evidence registry;
* conversation-history classification;
* cross-domain claim vocabulary;
* general-purpose parsing;
* probabilistic recognition;
* embeddings;
* model classification;
* production entity resolution;
* real contact lookup;
* evidence acquisition;
* evidence-status redesign;
* model invocation;
* response-envelope changes;
* `/api/chat` integration;
* selector;
* client rendering;
* persistence;
* operator verification;
* promotion.

Do not reopen Sprint 3.89.

---

## 39. Required Validation

Full repository validation is mandatory.

Run:

```text
npm test
npm run build
npm run lint
npm run typecheck
git diff --check
```

Use current repository-defined equivalents if materially different.

Also run targeted suites for:

* claim-boundary ruleset;
* engine stages;
* typed intent;
* deterministic patterns;
* Cassie compound decomposition;
* clarification;
* fail-closed unsupported;
* heuristic mutation;
* publication identity;
* existing `GovernedClaimInput` compatibility;
* isolation proof.

Record exact commands and results.

No proportionality exception applies.

---

## 40. Completion Report

The completion report shall contain the following sections.

### Repository Precondition

Report:

* repository;
* branch;
* starting commit;
* working-tree state;
* required documents;
* inspected types and fixtures.

### Governing Artefacts Reviewed

List every governing document read.

### Sprint 3.89 Decisions Implemented

Confirm:

```text
Claims-Boundary Architecture: Option C
```

and state the fixed four-stage order.

Confirm no Sprint 3.89 decision was reopened.

### Scope

State:

```text
Implemented claim types:
- contact_address_lookup
- message_importance
```

Confirm no other claim family or type was admitted.

### Modules Added

List every new module and responsibility.

### Ruleset

Report:

* ruleset ID;
* schema version;
* ruleset version;
* commands;
* aliases;
* patterns;
* grammar;
* claim templates;
* prohibited fields;
* identity behavior.

### Engine

Describe:

* Stage 1 typed intent;
* Stage 2 recognition;
* Stage 3 clarification;
* Stage 4 unsupported;
* deterministic precedence.

### Publications

Describe:

* `ClaimBoundaryRuleset`;
* `ClaimBoundaryEvaluation`;
* `GovernedClaimSet`;
* identity semantics;
* immutable references.

### Cassie Proof

Report the exact input and resulting:

* evaluation;
* segment map;
* two claim IDs;
* contact-address claim, including confirmation of the `sourceAvailable: true` / `status: "insufficient_coverage"` internally-consistent pairing;
* unsupported importance claim;
* claim set.

### Fail-Closed Proof

Report unmatched and ambiguous cases.

### Heuristic Exclusion Proof

Report every mutated heuristic and confirmation that output did not change.

### Existing-Type Compatibility

State that real existing `GovernedClaimInput[]` is produced without modifying its type.

### Conflict Boundary

State explicitly:

> Sprint 3.91 did not evaluate conflicts. Empty claim conflict arrays do not prove that no conflict exists.

### Isolation Proof

Report:

* forward search;
* reverse search;
* blob hashes;
* pure-Node implementation.

### Files Changed

List every changed or added file with one-line reason.

### Protected Files

List pre/post hashes for protected production files.

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

> Sprint 3.91 changes no live conversational behavior and performs no production integration.

### Outstanding Findings

List any real limitations.

### Next Step

Identify the next permitted isolated claims-boundary sprint or evaluation step.

Do not claim production readiness.

---

## 41. Recommendation Gate

The completion report must end with exactly one:

> **Implementation Complete**

or:

> **Implementation Incomplete**

No other wording is permitted.

### Implementation Complete

Use only if:

* Sprint 3.89 was available and followed;
* Option C's four-stage order is implemented;
* a versioned immutable ruleset exists;
* only the two authorised claim types are recognised;
* typed intent works;
* deterministic pattern recognition works;
* clarification is deterministic;
* unmatched input fails closed;
* the Cassie input produces exactly two real claims;
* contact-address is available-eligible with the internally-consistent `sourceAvailable: true` / `status: "insufficient_coverage"` pairing, not falsely available;
* importance is unsupported;
* no heuristic affects recognition, materiality, or status;
* real existing `GovernedClaimInput[]` is produced;
* no conflict evaluation occurs;
* no model classification exists;
* no cross-domain vocabulary was introduced;
* isolation proof passes;
* protected files remain byte-identical;
* full validation passes;
* no production integration occurred.

### Implementation Incomplete

Use if:

* implementing the two claims requires a general parser;
* a model classifier is required;
* the existing claim type must be redefined;
* another claim family must be admitted;
* Cassie cannot be deterministically decomposed;
* importance cannot remain unsupported;
* heuristics influence output;
* unsupported input produces a guessed claim;
* clarification requires model-owned choices;
* conflict semantics must be implemented;
* a protected production file must change;
* isolation fails;
* sprint-created validation failure remains;
* Sprint 3.89 must be reopened.

Stop and report the exact evidence.

Do not work around it.

---

## 42. Return Format

Return:

1. Repository Precondition result.
2. Governing artefacts reviewed.
3. Starting repository state.
4. Sprint 3.89 decisions implemented.
5. Exact scope and admitted claim types.
6. Modules and tests added.
7. Ruleset publication and identity.
8. Engine four-stage implementation.
9. Typed-intent result.
10. Pattern-recognition result.
11. Clarification result.
12. Unsupported result.
13. Cassie decomposition result.
14. Contact-address claim result.
15. Importance unsupported result.
16. Heuristic exclusion mutation result.
17. Publication identity tests.
18. Existing `GovernedClaimInput` compatibility.
19. Conflict-boundary confirmation.
20. Isolation forward-search result.
21. Isolation reverse-search result.
22. Protected-file hash comparison.
23. Every changed file with one-line reason.
24. Targeted test results.
25. Full validation results.
26. Explicit statement that no production integration occurred.
27. Outstanding findings.
28. Recommended next sprint.
29. Final recommendation gate.

The final line must be exactly:

> **Implementation Complete**

or:

> **Implementation Incomplete**

---

## 43. Success Criteria

Sprint 3.91 succeeds when the following chain exists as real isolated code:

```text
typed intent or bounded operator text
        ↓
immutable ClaimBoundaryRuleset
        ↓
fixed Option C recognition stages
        ↓
ClaimBoundaryEvaluation
        ↓
GovernedClaimSet
        ↓
real GovernedClaimInput[]
```

For the Cassie request:

```text
"What's Cassie's email? Anything important?"
```

the engine must publish:

```text
contact_address_lookup
→ material
→ sourceAvailable: true, status: insufficient_coverage (internally consistent, available-eligible)
→ awaiting governed evidence

message_importance
→ material
→ unsupported
→ no heuristic substitution permitted
```

The engine must not appear intelligent by guessing.

It must be useful by recognising only what has been explicitly governed, preserving ambiguity, and stopping honestly at the boundary of its authority.

Sprint 3.91 does not make the claims boundary live.

It creates the first real, deterministic, versioned implementation of that boundary in isolation.
