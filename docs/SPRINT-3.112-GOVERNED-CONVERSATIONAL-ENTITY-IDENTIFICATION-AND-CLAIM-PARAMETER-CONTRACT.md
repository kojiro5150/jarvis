# **Sprint 3.112 — Governed Conversational Entity Identification and Claim Parameter Contract**

**Status:** Specification  
**Sprint Type:** Governance Decision / Entity Identification and Claim Parameter Contract  
**Implementation Authority:** None  
**Production Integration:** Prohibited  
**Governing Trigger:** Sprint 3.111 — Governed Conversational Production Integration Readiness Review  
**Direct Structural Precedents:** Sprints 3.89, 3.103, and the Constitutional Publication Principles  
**Output Path:** `docs/SPRINT-3.112-GOVERNED-CONVERSATIONAL-ENTITY-IDENTIFICATION-AND-CLAIM-PARAMETER-CONTRACT.md`

---

## **1\. Recommendation**

**Decision:** Approve this Governed Conversational Entity Identification and Claim Parameter Contract.

Sprint 3.111 established the first and narrowest unresolved semantic owner remaining between the isolated governed conversational architecture and production integration:

> deterministic production entity identification and claim-parameter resolution.

The existing architecture can already:

* acquire governed source evidence;  
* recognise a bounded claim deterministically;  
* enrich a claim from admissible governed evidence;  
* evaluate conflicts;  
* preserve lineage;  
* integrity-couple enriched claims to observations;  
* compose the projection;  
* construct governed model input;  
* validate model output.

It cannot yet truthfully answer the prior question:

> When the operator asks about “Cassie”, which real entity does “Cassie” mean?

Every successful Cassie fixture through Sprint 3.110 received the answer to that question as pre-supplied fixture input.

Production has no equivalent owner.

This contract resolves that gap by selecting:

> **Entity Identification Option A — per-exchange deterministic matching against already-assembled governed evidence, with no durable cross-exchange person identity created by this contract.**

The result is a new immutable, exchange-scoped entity-identification publication that either:

1. uniquely identifies exactly one evidence-backed candidate and supplies the resolved claim parameter;  
2. records that no candidate matched; or  
3. records that multiple candidates matched and therefore disambiguation is required.

An unverified match shall never be represented as a verified one.

This contract authorizes no implementation.

---

# **Part I — Purpose and Motivation**

## **2\. Purpose**

This contract governs one question:

> **How may a recognised conversational claim obtain a truthful, deterministic entity identity and required claim parameter from already-governed evidence before evidence-to-claim enrichment occurs?**

It governs:

* entity candidate construction;  
* deterministic matching;  
* unique-match requirements;  
* zero-match handling;  
* multiple-match handling;  
* evidence citations for entity identification;  
* claim-parameter publication;  
* entity-identification identity;  
* placement relative to Sprint 3.89 Claim Boundary recognition;  
* the boundary between exchange-scoped identification and future durable identity.

It does not govern:

* source acquisition;  
* Gmail publication;  
* Calendar publication;  
* Memory publication;  
* connector availability;  
* claim-type recognition;  
* model classification;  
* evidence-to-claim enrichment;  
* conflict evaluation;  
* projection composition;  
* durable contact graphs;  
* automatic directory search;  
* arbitrary web search;  
* model-assisted entity matching;  
* production integration.

---

## **3\. Motivating Production Case — Cassie**

The motivating case is concrete.

The operator receives an AI-commentary newsletter through Substack whose byline author is Cassie Kozyrkov.

The conversational request:

> “What’s Cassie’s email?”

can therefore encounter Gmail evidence containing text associated with “Cassie”.

That does not, by itself, prove that:

* Cassie is a personal contact;  
* a sender address belongs personally to Cassie Kozyrkov;  
* a newsletter envelope sender is equivalent to the byline author;  
* the first message containing “Cassie” is the intended entity;  
* another sender or communication source does not contain another Cassie.

The legacy conversational path could produce a plausible-looking email address from such data without publishing:

* which entity was identified;  
* which evidence established that identity;  
* whether exactly one candidate existed;  
* whether the returned address belonged to the named person rather than a newsletter or sending service;  
* whether another candidate also matched.

That behaviour is not governed identification.

It is an unverified match.

The fact that such a result may happen to be correct does not make its epistemic status equivalent to a verified result.

The governing distinction is therefore:

> **A plausible text match is not a verified entity identification.**

This contract exists so that the architecture can never make those two states indistinguishable.

---

# **Part II — Repository Precondition**

## **4\. Standard Repository Precondition**

Before completing this governance sprint:

1. Confirm the intended JARVIS repository.  
2. Confirm the current branch.  
3. Record the starting commit.  
4. Record the working-tree state.  
5. Confirm Sprint 3.111 exists and is complete.  
6. Confirm its final recommendation is:

> **Review Complete — Not Ready**

7. Confirm its Production Claim Parameter Gate is:

> **Failed**

8. Confirm directly that no production entity-identification or claim-parameter resolver exists.  
9. Confirm directly that fixture-provided identities such as:

person:cassie

occur only in fixture/evaluation construction rather than production resolution.  
10\. Confirm `resolverForAddress()` is fixture/evaluation code rather than a production entity resolver.  
11\. Confirm the current Claim Boundary accepts or consumes resolved entity information rather than producing a production-backed identity itself.  
12\. Confirm the current enrichment stage requires an already-resolved entity/claim parameter.  
13\. Confirm assembled governed evidence exists before enrichment.  
14\. Confirm no durable governed contact/entity graph currently exists.

Read completely:

docs/SPRINT-3.111-GOVERNED-CONVERSATIONAL-PRODUCTION-INTEGRATION-READINESS-REVIEW.md  
docs/SPRINT-3.89-GOVERNED-CONVERSATIONAL-CLAIMS-BOUNDARY-CONTRACT.md  
docs/SPRINT-3.103-GOVERNED-EVIDENCE-TO-CLAIM-ENRICHMENT-CONTRACT.md  
docs/CONSTITUTIONAL-PUBLICATION-PRINCIPLES.md

Also inspect the current real implementations of:

lib/governed-conversation/claim-boundary-types.ts  
lib/governed-conversation/claim-boundary-ruleset.ts  
lib/governed-conversation/claim-boundary-engine.ts  
lib/governed-conversation/claim-boundary-publications.ts

lib/governed-conversation/claim-enrichment-types.ts  
lib/governed-conversation/claim-enrichment-engine.ts  
lib/governed-conversation/source-evidence-assembly.ts

lib/governed-conversation/claim-boundary-fixtures.ts  
lib/governed-conversation/claim-enrichment-fixtures.ts

If any repository premise materially differs from the finding this contract is intended to govern, stop.

Return:

> **Governance Review Incomplete**

Do not rewrite the contract around an unverified repository assumption.

---

# **Part III — Governing Hierarchy**

## **5\. Governing Authority**

Apply:

1. JARVIS Engineering Constitution;  
2. JARVIS North Star;  
3. JARVIS Engineering Specification Standard;  
4. Constitutional Publication Principles;  
5. Roadmap;  
6. Sprint 3.89 — Governed Conversational Claims Boundary Contract;  
7. Sprint 3.103 — Governed Evidence-to-Claim Enrichment Contract;  
8. Sprint 3.111 — Production Integration Readiness Review;  
9. current repository source;  
10. this contract.

This contract closes an implementation-governance gap already visible in Sprint 3.89.

It does not repeal Sprint 3.89.

Sprint 3.89 already established identity resolution as a deterministic prerequisite and permitted exact, source-qualified entity resolution with unique-match criteria.

The missing decision was the exact production mechanism, evidence boundary, publication identity, and zero/multiple-match semantics.

This contract supplies those decisions.

---

# **Part IV — Existing Boundary Preserved**

## **6\. Sprint 3.89 Option C Remains Binding**

Sprint 3.89 established the closed recognition sequence:

1\. validated typed intent  
2\. governed deterministic recognition  
3\. deterministic clarification  
4\. fail-closed unsupported

This contract shall not:

* add probabilistic recognition;  
* add model classification;  
* add embedding matching;  
* let source evidence determine the claim type;  
* let entity candidates determine whether a governed intent exists;  
* allow the answering model to select an entity;  
* bypass clarification;  
* broaden the admitted claim vocabulary.

Claim recognition and entity identification remain separate constitutional responsibilities.

---

## **7\. Precise Placement**

Entity identification is:

> **a separate deterministic parameter-resolution stage after governed intent recognition has established that a supported claim requires an entity parameter, and before a fully parameterised Governed Claim Set is published for downstream enrichment.**

Conceptually:

operator text / typed intent  
        ↓  
Sprint 3.89 deterministic intent recognition  
        ↓  
recognised governed intent requiring entity parameter  
        ↓  
Governed Entity Identification  
        \+  
already-assembled governed evidence  
        ↓  
resolved entity parameter  
        OR  
zero-match result  
        OR  
multiple-match / clarification-required result  
        ↓  
Claim Boundary completes publication  
        ↓  
Base Governed Claim Set  
        ↓  
Sprint 3.103 Evidence-to-Claim Enrichment

Entity identification is therefore **not a fifth claim-recognition mechanism**.

It is a deterministic prerequisite-resolution stage invoked only after one of Sprint 3.89’s permitted recognition mechanisms has established the governed intent and its required parameter schema.

This distinction is binding.

Evidence may answer:

> Which Cassie does the recognised contact-address claim refer to?

Evidence shall not answer:

> Is this text a contact-address claim?

The latter remains exclusively owned by Sprint 3.89.

---

# **Part V — Architectural Options**

## **8\. Option A — Per-Exchange Deterministic Evidence Matching**

For each exchange:

1. the supported claim intent is recognised deterministically;  
2. the unresolved entity reference is extracted under the existing bounded grammar;  
3. already-assembled governed evidence is searched only through this contract’s admitted deterministic candidate rules;  
4. candidates are constructed from source-qualified governed evidence;  
5. exactly one qualifying candidate produces a resolved entity parameter;  
6. zero candidates produce an explicit unresolved result;  
7. multiple candidates produce an explicit ambiguity result;  
8. the result exists only within the current conversational lineage unless a future contract explicitly promotes it into durable identity.

No persistent person graph is created.

### **Decision**

**Selected.**

### **Reason 1 — It solves the proven production gap directly**

Sprint 3.111 did not find that JARVIS lacked a durable CRM.

It found that the governed runtime could not truthfully transform:

"Cassie"

into:

entityId

for the current claim.

Per-exchange resolution closes exactly that gap.

### **Reason 2 — Evidence is already governed**

Sprints 3.96–3.101 already created governed source publications.

Entity identification can therefore operate against evidence that already has:

* source identity;  
* provenance;  
* availability;  
* policy;  
* coverage;  
* source ownership.

No parallel evidence architecture is required.

### **Reason 3 — It minimises identity claims**

A single email exchange may establish:

> this source-qualified candidate uniquely matched the current reference for this exchange.

It does not necessarily establish:

> this is the permanent canonical identity of this human across JARVIS forever.

Option A preserves that distinction.

### **Reason 4 — It supports deterministic replay**

Given:

* identical recognised reference;  
* identical governed evidence;  
* identical matching ruleset;  
* identical reference time;

the result is replayable.

### **Reason 5 — It preserves future architecture**

Nothing in Option A prevents a future durable governed entity graph.

That capability simply requires its own contract.

---

## **9\. Option B — Durable Governed Contact / Entity Graph**

Create persistent canonical person identities that survive exchanges.

Evidence from Gmail, Calendar, contacts, memory, and future sources would attach to durable entities.

Claims would reference those canonical identities.

### **Decision**

**Rejected for Sprint 3.112.**

### **Structural Reason 1 — It solves a larger problem than the proven gap**

Sprint 3.111 established a conversational parameter-resolution gap.

It did not establish that the architecture requires permanent cross-source identity resolution.

### **Structural Reason 2 — Identity fusion requires separate governance**

A durable graph must decide:

* entity creation;  
* identity merge;  
* identity split;  
* aliases;  
* source precedence;  
* corrections;  
* stale identifiers;  
* human confirmation;  
* deletion;  
* cross-source linkage;  
* email changes;  
* organisation/person distinctions;  
* potentially sensitive relationship metadata.

Those are not mechanical consequences of the current evidence contracts.

### **Structural Reason 3 — A wrong durable merge is materially worse**

A per-exchange ambiguous match can fail closed.

An incorrectly merged durable entity can contaminate future exchanges.

### **Structural Reason 4 — It would create a new foundational publication responsibility**

Under the Constitutional Publication Principles, a durable canonical entity publication requires its own responsibility, identity scheme, upstream boundary, replay rules, immutability rules, and governance.

It shall not be introduced implicitly as a side effect of conversational parameter resolution.

---

## **10\. Option C — Hybrid Default Plus Durable Promotion**

Resolve per exchange by default, but allow selected entities to be promoted immediately into durable governed identity.

### **Decision**

**Rejected for this contract.**

### **Structural Reason 1 — The durable branch is still ungoverned**

A hybrid architecture cannot truthfully include a durable promotion path until the rules governing durable identity exist.

### **Structural Reason 2 — Optional persistence still creates permanent authority**

Making durable identity optional does not make its governance optional.

### **Structural Reason 3 — It would make one sprint own two identity systems**

The contract would simultaneously govern:

* ephemeral exchange-scoped resolution; and  
* persistent cross-exchange identity.

Those are distinguishable constitutional responsibilities.

### **Future compatibility**

A future contract may add:

> explicit promotion from exchange-scoped entity identification into a separately governed durable entity publication.

Sprint 3.112 neither prohibits nor authorises that future capability.

---

## **11\. Selected Architecture**

> **Entity Identification Option A — Per-exchange deterministic matching against currently assembled governed evidence.**

The binding sequence is:

recognised governed intent  
    \+  
unresolved bounded entity reference  
    \+  
assembled governed evidence  
    \+  
entity-identification ruleset  
        ↓  
candidate construction  
        ↓  
deterministic exact qualification  
        ↓  
ZERO | ONE | MULTIPLE qualifying candidates  
        ↓  
zero → unresolved / unsupported  
one  → resolved entity parameter  
many → disambiguation required

No ranking stage exists.

No “best candidate” stage exists.

No confidence threshold exists.

No model selection exists.

---

# **Part VI — Scope of Entity Matching**

## **12\. Entity Identification Is Claim-Local**

Entity identification occurs only where the recognised governed intent declares an entity parameter.

For Sprint 3.112’s currently admitted production target:

contact\_address\_lookup

the required entity parameter identifies the entity whose contact address is being requested.

The entity resolver shall not independently create:

* importance claims;  
* relationship claims;  
* identity-confidence claims;  
* inferred-contact claims;  
* organisational-role claims;  
* person-profile claims.

Its sole responsibility is parameter resolution for the already-recognised claim.

---

## **13\. Admitted Evidence Categories**

For `contact_address_lookup`, entity candidate construction may consult only source categories that contain governed identity-bearing metadata relevant to the target parameter.

Under the currently governed source architecture:

> **Governed Communication Evidence is admitted.**

Other evidence categories are not automatically admitted merely because they exist in `assembleGovernedSourceEvidence`.

Specifically:

### **Communication Evidence**

Admitted where its governed publication exposes source-qualified identity-bearing metadata sufficient for deterministic candidate construction.

### **Calendar Evidence**

Not admitted for `contact_address_lookup` entity identification by this contract.

Calendar evidence may contain attendee or title information, but Sprint 3.97 did not establish a person-identity publication contract for conversational claim resolution.

### **Memory Priority Evidence**

Not admitted.

A priority title/detail is not an identity authority.

### **Connector Availability**

Not admitted as identity evidence.

It may determine whether a source was available, but it cannot identify a person.

A future claim family may establish a different materiality matrix.

Sprint 3.112 does not create an open source × entity cross-product.

---

# **Part VII — Candidate Construction**

## **14\. Source-Qualified Candidates**

Every entity candidate shall be constructed from a specific governed source publication.

A candidate shall never exist solely because a string occurred somewhere in ungoverned text.

Each candidate shall carry, at minimum:

candidateId  
entityKind  
displayReference  
normalizedMatchValue  
sourceReference  
sourceOwner  
provenanceReference  
evidenceReference  
matchingBasis

Implementation may add fields only where required by this contract’s responsibility.

---

## **15\. Matching Basis**

The initial governed matching mechanisms are closed:

1. exact normalized display-name match from admitted governed metadata;  
2. exact governed alias where the source publication itself supplies that alias;  
3. exact source-qualified identifier match where the operator supplied the identifier;  
4. operator selection from an engine-published disambiguation choice.

Prohibited matching mechanisms include:

* embedding similarity;  
* fuzzy person ranking;  
* edit-distance “closest” person selection;  
* model reasoning;  
* language-model entity linking;  
* guessed nicknames;  
* guessed initials;  
* social-profile search;  
* automatic web search;  
* arbitrary directory search;  
* popularity;  
* recency ranking;  
* sender-frequency ranking;  
* first-result selection.

Normalization may perform only representation-neutral operations defined by the ruleset, such as:

* case normalization;  
* surrounding whitespace normalization;  
* Unicode normalization.

Normalization shall not invent semantic aliases.

---

## **16\. Candidate Equality**

Two source records do not become one candidate merely because they share a display name.

Candidate deduplication requires an exact, ruleset-authorised source-qualified identity key.

If two evidence publications both say:

Cassie

but no governed identifier proves they represent the same entity, they remain two candidates.

This rule prevents accidental identity fusion.

---

# **Part VIII — Cardinality Governance**

## **17\. Exactly One Match**

A resolved entity may be published only where:

qualifyingCandidateCount \=== 1

The result is:

resolved

The resolver shall publish:

* the resolved exchange-scoped entity reference;  
* the original unresolved reference;  
* the exact candidate selected;  
* the evidence reference supporting that candidate;  
* provenance;  
* matching basis;  
* ruleset identity;  
* evaluation identity.

The resolved claim parameter may then be supplied to the Claim Boundary for completion of the governed claim publication.

---

## **18\. Zero Matches**

Where:

qualifyingCandidateCount \=== 0

the system shall not:

* invent an entity;  
* select a partial match;  
* ask the model to infer one;  
* search outside admitted evidence;  
* manufacture `person:<name>`;  
* treat the raw name as a stable entity identity.

### **Binding outcome**

The Entity Identification Evaluation shall publish:

outcome: "unresolved\_no\_match"

The Claim Boundary shall not publish a parameterised factual claim from that unresolved entity.

For the current exchange, the governed segment shall resolve to the existing Sprint 3.89 unsupported path unless a deterministic clarification permitted by Sprint 3.89 can obtain a source-qualified identifier from the operator.

Where no such bounded identifier choice exists:

unsupportedReason: "entity\_not\_found\_in\_governed\_evidence"

This does **not** add a new evidence-status value.

`available`, `insufficient_coverage`, `unavailable`, and `unsupported` remain the claim evidence-status vocabulary.

Entity-identification failure occurs before a valid parameterised claim exists.

Therefore it belongs to the Claim Boundary evaluation/parameter-resolution outcome, not to post-claim evidence status.

---

## **19\. Multiple Matches**

Where:

qualifyingCandidateCount \> 1

the resolver shall not rank, score, or select a candidate.

### **Binding outcome**

The Entity Identification Evaluation shall publish:

outcome: "ambiguous\_multiple\_matches"

and:

disambiguationRequired: true

The Claim Boundary shall use Sprint 3.89’s existing deterministic clarification mechanism.

The clarification publication shall expose only bounded, evidence-backed candidate choices sufficient for the operator to distinguish them.

No claim shall be published until the operator selects exactly one candidate.

If the operator does not resolve the ambiguity within the clarification rules already governed by Sprint 3.89, the segment becomes unsupported.

Required unsupported reason after unresolved clarification:

unsupportedReason: "entity\_ambiguity\_unresolved"

Again, no new claim evidence-status value is created.

This is pre-claim ambiguity.

---

## **20\. No Silent Selection Rule**

The following invariant is binding:

zero candidates    → never invent  
one candidate      → may resolve  
multiple candidates → never choose

No ordering of evidence can alter this rule.

The first candidate is not preferred.

The most recent candidate is not preferred.

The most frequent candidate is not preferred.

The candidate whose address “looks right” is not preferred.

The model's preferred candidate is irrelevant.

---

# **Part IX — Evidence Citation**

## **21\. Evidence Citation Is Mandatory**

Every successful entity resolution shall cite the exact governed evidence that justified it.

A successful result without an evidence reference is invalid.

At minimum, the Entity Identification Evaluation shall preserve:

sourceReference  
evidenceReference  
provenanceReference  
sourceOwner  
matchingBasis

The citation shall reference the canonical upstream governed publication.

It shall not copy that publication and claim new authority over it.

---

## **22\. Evidence Citation Semantics**

The entity-identification publication claims only:

> Under ruleset R, for exchange E, this candidate was the unique qualifying match for unresolved reference X, based on governed evidence publication Y.

It does not claim:

> Y permanently establishes the universal identity of this human.

It does not claim:

> Y's contact address is necessarily personally controlled by the human named in every textual field.

Those later factual questions remain the responsibility of evidence-to-claim enrichment and the governed evidence itself.

This distinction is particularly important for newsletters and mailing platforms.

A newsletter may establish that:

* the evidence contains a unique candidate labelled Cassie;

without automatically establishing that:

* the newsletter envelope sender is Cassie Kozyrkov's personal email address.

Entity identification identifies the target candidate.

Enrichment determines whether the governed evidence actually supports the requested contact-address factual value.

---

# **Part X — Publication Architecture**

## **23\. Entity Identification Ruleset**

This contract requires an immutable:

> **Entity Identification Ruleset**

It shall own:

entityIdentificationRulesetId  
schemaVersion  
rulesetVersion  
admitted claim types  
admitted entity kinds  
admitted evidence categories  
normalization rules  
candidate-construction rules  
candidate-equality rules  
unique-match rule  
zero-match rule  
multiple-match rule  
clarification handoff rule

The ruleset shall be deterministic and immutable.

---

## **24\. Entity Identification Evaluation**

Every attempted resolution shall create an immutable:

> **Entity Identification Evaluation**

with its own identity:

entityIdentificationEvaluationId

The publication shall include, at minimum:

entityIdentificationEvaluationId  
entityIdentificationRulesetId  
schemaVersion

threadId  
requestId  
exchangeId

claimBoundaryEvaluationReference  
recognizedIntentReference

unresolvedEntityReference  
normalizedEntityReference

admittedEvidenceReferences  
candidateReferences

outcome

resolvedEntityReference?  
resolvedCandidateReference?

disambiguationRequired  
clarificationCandidateReferences

createdAt

The exact implementation schema may include bounded additional fields required to satisfy these responsibilities.

It shall not contain unrelated evidence, model output, conflict results, or projection state.

---

## **25\. Exchange-Scoped Resolved Entity Identity**

A successful resolution shall produce an exchange-scoped resolved entity reference.

It shall have its own identity:

resolvedEntityReference

This identity shall represent:

> the unique entity candidate resolved for this entity reference under this ruleset and evaluation in this conversational exchange.

It shall not be a durable universal person ID.

It shall not use a fabricated identity such as:

person:cassie

unless that exact identifier already exists as an upstream governed source-qualified identity.

Where no durable upstream identifier exists, the exchange-scoped identity shall be derived under the repository's approved canonical identity mechanism from the resolution publication's canonical identity-bearing body.

---

## **26\. Claim Parameter**

For a successful resolution, the required claim parameter shall reference:

resolvedEntityReference

rather than an unverified raw text name.

The claim may also preserve the operator-facing reference:

"Cassie"

as non-authoritative input context.

The parameter authority comes from the Entity Identification Evaluation.

---

# **Part XI — Identity Integrity**

## **27\. Separate Publication Identities**

The following identities are constitutionally distinct:

source evidence publication identity  
entityIdentificationRulesetId  
entityIdentificationEvaluationId  
resolvedEntityReference  
claimBoundaryEvaluationId  
governedClaimSetId  
claimId  
enrichmentEvaluationId  
enrichedGovernedClaimSetId  
enriched claimId  
conflictEvaluationId  
governedConflictSetId  
projectionId

None may alias another.

---

## **28\. No Evidence Identity Replacement**

The entity-identification publication shall reference the evidence that supported the resolution.

It shall not republish the Gmail or other evidence under a new identity.

This preserves the Constitutional Publication Principles:

* Identity Integrity;  
* Projection Principle;  
* Single Responsibility;  
* Non-Reconstruction;  
* Immediate-Upstream Dependency.

---

## **29\. No Claim Identity Replacement**

A resolved entity is not a claim.

The entity-identification identity shall not become:

claimId

or:

governedClaimSetId

The Claim Boundary remains responsible for claim publication.

---

## **30\. No Durable Identity Claim**

An exchange-scoped resolution shall not be silently reused as permanent identity in another exchange.

A later exchange may independently resolve the same evidence to a structurally equivalent candidate.

That does not create a durable cross-exchange identity relationship unless a future governed entity-graph contract explicitly authorises it.

---

# **Part XII — Relationship to Sprint 3.89**

## **31\. Option C Is Not Reopened**

Sprint 3.89 Option C remains fully binding.

This contract does not alter:

typed intent  
    ↓  
deterministic recognition  
    ↓  
deterministic clarification  
    ↓  
fail-closed unsupported

It supplies a deterministic parameter-resolution publication used after the recognised intent establishes that an entity parameter is required.

---

## **32\. Existing Clarification Semantics Are Reused**

Sprint 3.89 already permits clarification for:

* unresolved entities;  
* multiple exact entity candidates;  
* missing required parameters.

Sprint 3.112 does not create a second clarification architecture.

Instead:

Entity Identification Evaluation  
        ↓  
ambiguous\_multiple\_matches  
        ↓  
existing Claim Boundary clarification publication

The Claim Boundary remains the owner of conversational clarification.

Entity Identification owns only the deterministic candidate result that caused it.

---

## **33\. Existing Unsupported Semantics Are Reused**

This contract does not add a seventh claim evidence status or a new post-claim failure vocabulary.

Zero-match and unresolved ambiguity occur before a valid parameterised claim exists.

They therefore terminate through Sprint 3.89's existing unsupported/clarification governance.

This preserves the distinction between:

* claim recognition uncertainty;  
* entity parameter uncertainty;  
* evidence availability;  
* evidence sufficiency.

---

# **Part XIII — Relationship to Sprint 3.103**

## **34\. Entity Identification Precedes Enrichment**

Sprint 3.103 asks:

> Does governed evidence satisfy this already-recognised, already-parameterised claim?

Sprint 3.112 asks the earlier question:

> Which evidence-backed entity does this recognised claim refer to?

The sequence is binding:

recognition  
    ↓  
entity identification / parameter resolution  
    ↓  
base Governed Claim Set  
    ↓  
evidence-to-claim enrichment

Enrichment shall not resolve entity identity.

---

## **35\. Enrichment Remains Evidence-to-Fact Correlation**

After successful entity identification:

resolvedEntityReference

becomes the entity parameter against which Sprint 3.103 may correlate admissible evidence.

For `contact_address_lookup`, enrichment may then determine whether evidence establishes:

* a contact address;  
* adequate provenance;  
* sufficient freshness;  
* required coverage;  
* a factual value.

The entity resolver shall not perform that later evidentiary sufficiency decision.

---

# **Part XIV — Worked Example A: Cassie Newsletter**

## **36\. Input**

Operator:

> “What’s Cassie’s email?”

Claim Boundary deterministically recognises:

claimType: contact\_address\_lookup  
unresolvedEntityReference: "Cassie"

No claim is yet permitted to pretend that:

"Cassie" \=== "person:cassie"

---

## **37\. Assembled Governed Evidence**

Assume the current exchange contains one qualifying governed Gmail identity-bearing publication:

Evidence G-17

display identity:  
    Cassie Kozyrkov

governed source:  
    Gmail

sourceReference:  
    gmail-source:...

evidenceReference:  
    governed-communication-evidence:...

provenanceReference:  
    gmail-recipient-evidence:...

associated communication:  
    Substack AI-commentary newsletter

No other admitted governed communication evidence produces a candidate matching normalized:

cassie

under the ruleset.

---

## **38\. Candidate Construction**

The Entity Identification Ruleset constructs:

Candidate C-1

displayReference:  
    Cassie Kozyrkov

normalizedMatchValue:  
    cassie

matchingBasis:  
    exact\_governed\_display\_name\_match

evidenceReference:  
    governed-communication-evidence:...

Qualifying candidate count:

1

---

## **39\. Entity Identification Result**

Publish:

outcome:  
    resolved

unresolvedEntityReference:  
    Cassie

resolvedEntityReference:  
    \<exchange-scoped canonical reference\>

resolvedCandidateReference:  
    C-1

evidenceReference:  
    governed-communication-evidence:...

provenanceReference:  
    gmail-recipient-evidence:...

The Claim Boundary may now complete the parameter:

entityId:  
    \<resolvedEntityReference\>

---

## **40\. What This Does Not Yet Prove**

The resolution does **not** itself prove:

> the newsletter's visible sender address is Cassie Kozyrkov's personal email address.

That is the subsequent enrichment question.

If the governed Gmail publication establishes only a newsletter/service address without sufficient identity-qualified contact metadata, enrichment shall remain insufficient rather than laundering the entity match into a contact-address fact.

This is the precise distinction the legacy path lacked.

---

# **Part XV — Worked Example B: Two Cassies**

## **41\. Input**

Operator:

> “What’s Cassie’s email?”

Recognition again establishes:

claimType:  
    contact\_address\_lookup

unresolvedEntityReference:  
    Cassie

---

## **42\. Governed Evidence**

Assume admitted communication evidence contains:

Candidate C-1  
displayReference: Cassie Kozyrkov  
sourceReference: Gmail publication G-17  
matchingBasis: exact governed name match

and:

Candidate C-2  
displayReference: Cassie Morgan  
sourceReference: Gmail publication G-29  
matchingBasis: exact governed name match

Both qualify under the closed ruleset for the unresolved reference:

Cassie

Candidate count:

2

---

## **43\. Required Result**

The resolver shall not choose C-1 because:

* it appeared first;  
* it is newer;  
* it occurs more often;  
* it looks more relevant;  
* the model knows Cassie Kozyrkov;  
* the previous conversation happened to discuss AI;  
* one email address looks more personal.

Publish:

outcome:  
    ambiguous\_multiple\_matches

disambiguationRequired:  
    true

candidateReferences:  
    \[C-1, C-2\]

The Claim Boundary publishes deterministic clarification using the evidence-backed candidate distinctions.

Conceptually:

Which Cassie do you mean?

\- Cassie Kozyrkov — source-qualified Gmail candidate  
\- Cassie Morgan — source-qualified Gmail candidate

No `GovernedClaimSet` for the contact-address lookup is published until the operator resolves the ambiguity.

If ambiguity remains unresolved under Sprint 3.89’s permitted clarification sequence:

unsupportedReason:  
    entity\_ambiguity\_unresolved

The system shall not guess.

---

# **Part XVI — Worked Example C: No Cassie**

## **44\. Governed Evidence**

Assume no admitted governed communication evidence contains a qualifying Cassie candidate.

Candidate count:

0

---

## **45\. Required Result**

Publish:

outcome:  
    unresolved\_no\_match

No entity ID is fabricated.

No:

person:cassie

is generated from the string.

No model is asked to identify Cassie.

No automatic external search occurs.

Where the existing deterministic clarification contract can request a source-qualified identifier, it may do so.

Otherwise:

unsupportedReason:  
    entity\_not\_found\_in\_governed\_evidence

The answer shall not contain an evidence-derived email address attributed to Cassie.

---

# **Part XVII — Determinism and Replay**

## **46\. Deterministic Inputs**

Entity identification shall depend only on:

recognized governed intent  
unresolved entity reference  
entity-identification ruleset  
admitted governed evidence publications  
explicit reference time where required  
operator clarification selection where applicable

It shall not depend on:

* model state;  
* hidden memory;  
* network search;  
* evidence ordering;  
* random IDs;  
* local clock not supplied explicitly;  
* prior ungoverned chat inference;  
* popularity;  
* heuristic ranking.

---

## **47\. Replay Requirement**

Identical canonical inputs shall produce:

* identical normalized reference;  
* identical candidate set;  
* identical candidate ordering under canonical ordering rules;  
* identical outcome;  
* identical evidence references;  
* identical canonical publication body;  
* identical content-derived identities where content-addressed identity is used.

Changing the candidate set shall produce a different evaluation publication.

A one-candidate result and a two-candidate result shall never share publication identity.

---

# **Part XVIII — Failure and Honesty Rules**

## **48\. Source Unavailable**

If the admitted evidence source is unavailable, entity identification shall not reinterpret that condition as:

zero matching entities exist

Source unavailability and zero-match are different facts.

Where required evidence cannot be inspected because the source is unavailable, the Entity Identification Evaluation shall publish an explicit source-unavailable resolution outcome rather than `unresolved_no_match`.

Required outcome:

entity\_source\_unavailable

The Claim Boundary shall not publish a resolved entity.

---

## **49\. Insufficient Identity Metadata**

If governed communication evidence exists but does not expose the metadata required by the Entity Identification Ruleset to establish a candidate, the resolver shall not inspect unrelated content to compensate.

Required outcome:

entity\_identity\_evidence\_insufficient

This remains a parameter-resolution failure, not a successful match.

---

## **50\. Provenance Failure**

A candidate lacking the required governed source/provenance references shall not qualify.

No candidate may become valid merely because its display name matches.

---

# **Part XIX — Publication Responsibility Audit**

## **51\. Entity Identification Ruleset**

**Responsibility:**

> define the deterministic rules under which evidence-backed entity candidates may qualify for conversational claim-parameter resolution.

It does not own:

* evidence acquisition;  
* claims;  
* contact facts;  
* conflicts;  
* model interpretation.

**Pre-implementation audit result:** conformant.

---

## **52\. Entity Identification Evaluation**

**Responsibility:**

> publish the deterministic result of resolving one recognised entity reference against the admitted governed evidence for one conversational exchange.

It does not own:

* upstream evidence;  
* durable person identity;  
* claim status;  
* contact-address factual truth;  
* conflict adjudication.

**Pre-implementation audit result:** conformant.

---

## **53\. Resolved Entity Reference**

**Responsibility:**

> provide an exchange-scoped canonical reference to the unique candidate established by one Entity Identification Evaluation.

It shall not become a general-purpose person profile.

**Pre-implementation audit result:** conformant.

---

# **Part XX — Explicit Non-Reopening Decisions**

## **54\. Sprint 3.89**

**Not reopened.**

Claim Boundary Option C remains fully binding.

Entity identification is deterministic prerequisite resolution after intent recognition, not an alternative recognition mechanism.

---

## **55\. Sprint 3.103**

**Not reopened.**

Evidence-to-Claim Enrichment remains downstream.

Entity identification supplies the entity parameter enrichment evaluates against.

It does not replace enrichment.

---

## **56\. Source Contracts 3.96–3.99**

**Not reopened.**

This contract consumes already-governed evidence.

It does not alter:

* Gmail acquisition;  
* Gmail disclosure policy;  
* Calendar evidence;  
* Memory attestation;  
* connector availability.

---

## **57\. Composer Option A**

**Not reopened.**

The projection composer receives already-governed claims and lineage.

It does not resolve entities.

No entity-matching logic belongs in the composer.

---

## **58\. Conflict Architecture**

**Not reopened.**

Conflict evaluation occurs after enrichment.

It receives the claim identity already resulting from the recognition → entity identification → enrichment chain.

It does not resolve entities.

---

# **Part XXI — Explicitly Out of Scope**

## **59\. Out of Scope**

Sprint 3.112 does not govern or authorise:

* durable person/contact graph;  
* Google Contacts integration;  
* external directory search;  
* web person search;  
* automatic LinkedIn lookup;  
* fuzzy identity resolution;  
* embedding similarity;  
* model-assisted matching;  
* arbitrary aliases;  
* inferred nicknames;  
* identity merging;  
* identity splitting;  
* long-term entity memory;  
* cross-exchange entity reuse;  
* contact creation;  
* contact modification;  
* new claim types;  
* importance/significance reasoning;  
* conflict-observation production;  
* lineage persistence;  
* production runtime integration.

Each requires separate authority where needed.

---

# **Part XXII — Prohibited Hedge Language**

## **60\. Prohibited Hedge Language**

The completed contract shall not use unresolved language such as:

may use the best match  
could select a likely candidate  
prefer a unique match where possible  
generally require disambiguation  
usually fail closed  
perhaps persist the entity  
implementation may decide  
use an appropriate identity  
derive the parameter as needed  
matching strategy to be determined  
future implementation can choose

The following decisions are closed:

architecture:  
    per-exchange deterministic matching

durable identity:  
    not created

zero match:  
    explicit unresolved result; never invent

one match:  
    resolve with evidence citation

multiple matches:  
    deterministic clarification; never select

evidence citation:  
    mandatory

model participation:  
    prohibited

claim recognition:  
    unchanged

enrichment:  
    downstream and unchanged

publication identity:  
    distinct and exchange-scoped

If repository evidence prevents any of those decisions from being stated truthfully, return:

> **Governance Review Incomplete**

Do not weaken the contract with hedge language.

---

# **Part XXIII — Future Implementation Requirements**

## **61\. Future Implementation Shape**

A future implementation sprint shall be expected to introduce isolated responsibilities under:

lib/governed-conversation/

Conceptually:

entity-identification-types.ts  
entity-identification-ruleset.ts  
entity-identification-engine.ts  
entity-identification-publications.ts  
entity-identification-fixtures.ts

Exact filenames are not authorised by this contract.

The implementation shall remain isolated before production wiring, following the established pattern of:

contract  
    ↓  
isolated implementation  
    ↓  
composition evaluation  
    ↓  
production readiness

---

## **62\. Required Future Proofs**

Any implementation shall prove at minimum:

### **Unique match**

Cassie  
\+  
one qualifying governed candidate  
→ resolved

with exact evidence citation.

### **Zero match**

Cassie  
\+  
zero qualifying candidates  
→ unresolved\_no\_match

with no fabricated identity.

### **Multiple match**

Cassie  
\+  
two qualifying candidates  
→ ambiguous\_multiple\_matches

with no selected candidate.

### **Source unavailable**

Gmail unavailable  
→ entity\_source\_unavailable

not zero-match.

### **Insufficient identity metadata**

communication evidence exists  
\+  
identity metadata insufficient  
→ entity\_identity\_evidence\_insufficient

not a guessed match.

### **Deterministic replay**

Identical canonical input shall reproduce identical evaluation/publication identity.

### **Identity Integrity**

Evidence, entity evaluation, resolved entity, claim, enriched claim, conflict, and projection identities remain distinct.

### **Boundary isolation**

No model, `/api/chat`, context builder, legacy Operational State, or projection composer owns entity matching.

---

# **Part XXIV — Standard Validation**

## **63\. Required Validation**

Because this is a governance-decision sprint, no implementation code shall change.

Run the full repository validation:

npm test  
npm run build  
npm run lint  
npm run typecheck  
git diff \--check

No exception applies.

Use a real Git clone where evaluating in a sandbox.

Do not rely on an extracted archive where repository metadata or filesystem behaviour may create false failures.

---

## **64\. Working-Tree Verification**

Record before and after:

git status \--short  
git diff \--name-only  
git diff \--stat

The only permitted changed file is:

docs/SPRINT-3.112-GOVERNED-CONVERSATIONAL-ENTITY-IDENTIFICATION-AND-CLAIM-PARAMETER-CONTRACT.md

No source file, fixture, test, route, composer, engine, publisher, or adapter may change.

---

# **Part XXV — Return Format**

## **65\. Required Completion Record**

The completed Sprint 3.112 document shall report:

### **Repository Precondition**

Repository:  
Branch:  
Starting commit:  
Working-tree state:  
Required documents present:  
Required source inspected:

### **Current Ground Truth**

Production entity resolver exists:  
Production claim-parameter owner exists:  
Fixture-only person:cassie confirmed:  
Fixture-only resolverForAddress confirmed:  
Durable governed entity graph exists:

### **Architectural Decision**

Selected:  
Entity Identification Option A — Per-Exchange Deterministic Evidence Matching

Rejected:  
Option B — Durable Governed Contact / Entity Graph  
Option C — Hybrid Default Plus Durable Promotion

### **Cardinality Rules**

Zero matches:  
    unresolved\_no\_match

One match:  
    resolved

Multiple matches:  
    ambiguous\_multiple\_matches  
    disambiguationRequired: true

### **Evidence Rules**

Evidence citation required:  
Admitted evidence categories:  
Prohibited matching mechanisms:  
Source-unavailable handling:  
Insufficient-identity-evidence handling:

### **Boundary Preservation**

Sprint 3.89 Option C reopened:  
Sprint 3.103 reopened:  
Composer Option A reopened:  
Conflict architecture reopened:  
Source contracts reopened:

Every value shall be explicit.

### **Identity Decision**

Entity Identification Evaluation identity:  
Resolved entity identity:  
Cross-exchange durable identity:  
Evidence identity aliasing permitted:  
Claim identity aliasing permitted:

### **Worked Examples**

Report:

1. Cassie/newsletter unique-match case;  
2. two-Cassie ambiguity case;  
3. zero-match case.

### **Validation**

npm test:  
npm run build:  
npm run lint:  
npm run typecheck:  
git diff \--check:

### **Files Changed**

Expected:

docs/SPRINT-3.112-GOVERNED-CONVERSATIONAL-ENTITY-IDENTIFICATION-AND-CLAIM-PARAMETER-CONTRACT.md

---

# **Part XXVI — Recommendation Gate**

## **66\. Governed Contract Complete**

Return:

> **Governed Contract Complete**

only if:

* repository preconditions pass;  
* Sprint 3.111's entity-resolution finding is confirmed;  
* Option A is selected explicitly;  
* Options B and C are rejected explicitly;  
* the zero-match rule is closed;  
* the one-match rule is closed;  
* the multiple-match rule is closed;  
* evidence citation is mandatory;  
* source-unavailable is distinguished from zero-match;  
* insufficient identity metadata is distinguished from zero-match;  
* Claim Boundary Option C remains intact;  
* enrichment remains downstream;  
* publication identities are distinct;  
* no durable identity is silently created;  
* no implementation is authorised;  
* full validation passes;  
* only the contract document changes.

---

## **67\. Governance Review Incomplete**

Return:

> **Governance Review Incomplete**

if:

* repository preconditions fail;  
* Sprint 3.111's factual finding cannot be reproduced;  
* an existing production entity resolver is discovered that materially changes the problem;  
* current evidence publications cannot support the selected deterministic mechanism;  
* a required decision remains unresolved;  
* full validation fails for an unresolved reason;  
* implementation code changes.

A finding that the architecture needs a future durable entity graph does not itself make this contract incomplete.

Sprint 3.112 governs the narrower proven production gap.

---

# **Part XXVII — Binding Decision Summary**

## **68\. Closed Decisions**

Problem:  
    production has no truthful entity/claim-parameter resolver

Motivating failure:  
    an unverified textual match can look identical to a verified identity

Architecture:  
    per-exchange deterministic evidence-backed resolution

Durable identity:  
    prohibited by this contract

Recognition:  
    Sprint 3.89 Option C unchanged

Placement:  
    after governed intent recognition  
    before completed Claim Set publication and enrichment

Evidence:  
    already-governed, source-qualified evidence only

Current admitted identity source:  
    governed communication evidence

Matching:  
    closed deterministic rules only

Zero matches:  
    unresolved\_no\_match  
    never invent

One match:  
    resolved  
    mandatory evidence citation

Multiple matches:  
    ambiguous\_multiple\_matches  
    deterministic clarification  
    never rank or guess

Source unavailable:  
    entity\_source\_unavailable  
    not zero-match

Insufficient identity metadata:  
    entity\_identity\_evidence\_insufficient  
    not a guessed match

Model:  
    no entity-resolution authority

Entity publication:  
    own immutable evaluation identity

Resolved entity:  
    exchange-scoped identity

Evidence publication:  
    remains authoritative for evidence

Claim publication:  
    remains authoritative for claims

Enrichment:  
    remains authoritative for evidence-to-claim sufficiency

Composer:  
    remains validate/aggregate only

---

## **69\. Constitutional Principle**

The governing rule is:

> **A resolved entity is not merely a plausible name match. It is a deterministic, uniquely qualifying, evidence-cited identification publication.**

Therefore:

plausible ≠ verified  
text match ≠ identity  
newsletter byline ≠ personal contact  
one candidate ≠ many candidates  
zero evidence ≠ evidence of absence  
source unavailable ≠ no matching entity  
entity identification ≠ contact-address proof  
exchange resolution ≠ permanent person identity

The architecture shall preserve every one of those distinctions.

---

## **70\. Production Effect**

State exactly:

> Sprint 3.112 changes no runtime behaviour. It does not implement entity identification, modify the Claim Boundary, modify evidence-to-claim enrichment, alter source acquisition, modify the projection composer, wire `/api/chat`, create a durable entity graph, enable model-based identity resolution, or authorise production integration. It establishes the binding governance contract a future isolated implementation sprint must execute.

---

## **71\. Recommended Next Step**

If this contract completes successfully, recommend:

> **Sprint 3.113 — Isolated Governed Conversational Entity Identification and Claim Parameter Implementation**

That sprint shall implement this contract in isolation.

It shall not wire the new stage into `/api/chat`.

After isolated implementation, the architecture shall be composition-tested again before production integration readiness is reconsidered.

---

# **Part XXVIII — Completion Record**

## **72\. Repository Precondition**

Repository:
`/workspace/jarvis` — JARVIS repository confirmed

Branch:
`work`

Starting commit:
`eb24c520f60a7f6b5b54faf3a39b61cf445bda3f`

Working-tree state:
Clean at the start of the review

Required documents present:
Yes — Sprint 3.111, Sprint 3.89, Sprint 3.103, and the Constitutional Publication Principles were read completely. Sprint 3.111 is complete, its final recommendation is **Review Complete — Not Ready**, and its Production Claim Parameter Gate is **Failed**.

Required source inspected:
Yes — all Claim Boundary, claim-enrichment, source-evidence-assembly, and fixture files required by Section 4 were inspected in their current real form. The Claim Boundary consumes an optional externally supplied `BoundaryEntity` catalogue and does not create a production-backed identity. The enrichment stage requires an already-resolved `GovernedClaimParameters.entityId`. `assembleGovernedSourceEvidence()` assembles governed communication, calendar, memory-priority, and connector-availability evidence before enrichment.

## **73\. Current Ground Truth**

Production entity resolver exists:
No

Production claim-parameter owner exists:
No

Fixture-only person:cassie confirmed:
Yes

Fixture-only resolverForAddress confirmed:
Yes

Durable governed entity graph exists:
No

Repository-wide inspection found no production entity-identification stage, claim-parameter resolver, or durable governed contact/entity graph. The current Claim Boundary's local `resolve()` function only consumes a caller-supplied entity catalogue or derives an unverified name-based value; it does not inspect governed source evidence or establish a production-backed identity. No repository evidence contradicts the premise governed by this contract.

## **74\. Architectural Decision**

Selected:
**Entity Identification Option A — Per-Exchange Deterministic Evidence Matching**

This is deterministic matching against already-assembled governed evidence for the current exchange. It creates no durable cross-exchange person identity.

Rejected:
**Option B — Durable Governed Contact / Entity Graph**
**Option C — Hybrid Default Plus Durable Promotion**

Neither rejected option is authorised or left open to implementation choice by this contract.

## **75\. Cardinality Rules**

Zero matches:
`unresolved_no_match`

One match:
`resolved`

Multiple matches:
`ambiguous_multiple_matches`
`disambiguationRequired: true`

Source unavailable:
`entity_source_unavailable`

The four primary resolution outcomes are therefore unique match, zero match, multiple match, and source unavailable. Insufficient identity evidence is separately published as `entity_identity_evidence_insufficient`; it is not zero-match and must never be collapsed into zero-match. Zero candidates are never invented, one qualifying candidate may resolve with evidence citation, and multiple candidates are never ranked or selected.

## **76\. Evidence Rules**

Evidence citation required:
Yes — mandatory for every successful resolution

Admitted evidence categories:
Governed Communication Evidence only for the currently admitted `contact_address_lookup` target

Prohibited matching mechanisms:
Embedding or fuzzy matching, edit-distance selection, model reasoning or entity linking, guessed aliases or identifiers, external search, popularity or recency ranking, frequency ranking, first-result selection, and any other ungoverned heuristic

Source-unavailable handling:
Publish `entity_source_unavailable`; do not reinterpret source unavailability as zero-match

Insufficient-identity-evidence handling:
Publish `entity_identity_evidence_insufficient`; do not inspect unrelated content or guess a match

## **77\. Boundary Preservation**

Sprint 3.89 Option C reopened:
No

Sprint 3.103 reopened:
No

Composer Option A reopened:
No

Conflict architecture reopened:
No

Source contracts reopened:
No

Claim recognition remains upstream and unchanged. Entity identification resolves only the required parameter of an already-recognised intent. Enrichment remains downstream and retains authority over evidence-to-fact sufficiency.

## **78\. Identity Decision**

Entity Identification Evaluation identity:
Distinct immutable `entityIdentificationEvaluationId`

Resolved entity identity:
Distinct exchange-scoped `resolvedEntityReference`

Cross-exchange durable identity:
Not created or authorised

Evidence identity aliasing permitted:
No

Claim identity aliasing permitted:
No

## **79\. Worked Examples**

1. **Cassie/newsletter unique match:** The recognised `contact_address_lookup` reference `Cassie` is evaluated against admitted governed communication evidence. One exact, source-qualified Cassie Kozyrkov candidate produces `resolved`, an exchange-scoped `resolvedEntityReference`, and mandatory evidence and provenance citations. This identifies the unique candidate only; it does not prove that a newsletter/service sender address is Cassie Kozyrkov's personal address. Enrichment must establish that later factual claim independently.
2. **Two-Cassie ambiguity:** Exact, source-qualified candidates for Cassie Kozyrkov and Cassie Morgan produce `ambiguous_multiple_matches` with `disambiguationRequired: true`. Neither candidate is ranked or selected. The existing Claim Boundary clarification mechanism presents bounded evidence-backed choices, and no claim is published unless the operator uniquely disambiguates them.
3. **Zero match:** No qualifying Cassie candidate produces `unresolved_no_match`. No `person:cassie` or other entity ID is fabricated, no model or external search is used, and the existing unsupported path records `entity_not_found_in_governed_evidence` when bounded clarification cannot obtain a source-qualified identifier.

## **80\. Validation**

npm test:
Passed

npm run build:
Passed

npm run lint:
Passed

npm run typecheck:
Passed

git diff --check:
Passed

## **81\. Files Changed**

Exactly:

`docs/SPRINT-3.112-GOVERNED-CONVERSATIONAL-ENTITY-IDENTIFICATION-AND-CLAIM-PARAMETER-CONTRACT.md`

No code, type, fixture, test, route, composer, engine, publisher, or adapter changed. Sprint 3.112 changes no runtime behaviour and authorises no implementation.

---

# **Final Recommendation**

> **Governed Contract Complete**
