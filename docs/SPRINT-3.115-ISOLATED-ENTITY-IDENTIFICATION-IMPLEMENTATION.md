# **Sprint 3.115 — Isolated Entity Identification Implementation**

**Status:** Specification  
**Sprint Type:** Isolated Governed Entity Identification Implementation  
**Governing Contracts:** Sprint 3.112 and Sprint 3.113  
**Source Prerequisite:** Sprint 3.114 — Gmail Display Identity Implementation  
**Production Integration:** Prohibited  
**Model Participation:** Prohibited  
**Output Path:** `docs/SPRINT-3.115-ISOLATED-ENTITY-IDENTIFICATION-IMPLEMENTATION.md`

---

## **1\. Purpose**

Sprint 3.115 implements the deterministic, exchange-scoped Entity Identification stage governed by Sprint 3.112 and completed semantically by Sprint 3.113.

This is the implementation originally attempted before the source and alias prerequisites were real.

That attempt correctly returned:

> **Implementation Incomplete**

rather than inventing either:

1. structured sender display identity that did not exist in governed communication evidence; or  
2. an ungoverned rule by which the extracted reference `"Cassie"` could match the governed display name `"Cassie Kozyrkov"`.

Both blockers are now closed.

Sprint 3.114 has implemented the real source path:

Gmail From header  
    ↓  
canonical Gmail normalization  
    ↓  
NormalizedGmailObservation.senderDisplayName  
    ↓  
governed Gmail evidence publication  
    ↓  
GovernedCommunicationEvidenceInput.senderDisplayName  
    ↓  
assembleGovernedSourceEvidence

Sprint 3.113 has separately governed the exact deterministic alias mechanism:

governed\_first\_token\_display\_name\_alias\_match

Sprint 3.115 shall therefore implement the missing stage:

real Claim Boundary recognition  
    ↓  
ExtractedParameter  
    \+  
real assembled governed communication evidence  
    ↓  
Governed Entity Identification  
    ↓  
resolved  
OR ambiguous\_multiple\_matches  
OR unresolved\_no\_match  
OR entity\_source\_unavailable

This sprint remains isolated.

It shall not integrate Entity Identification into Claim Boundary, Evidence-to-Claim Enrichment, the projection composer, model invocation, or `/api/chat`.

---

# **Part I — Binding Architecture**

## **2\. Exact Upstream Parameter**

The real input from Sprint 3.91 is:

export interface ExtractedParameter {  
  readonly segmentId: string;  
  readonly name: "personName" | "entityId";  
  readonly value: string;  
}

Sprint 3.115 shall consume this real type.

For the currently governed implementation target, the engine accepts:

{  
  segmentId: "\<real recognised segment\>",  
  name: "personName",  
  value: "Cassie"  
}

The engine shall not independently parse `"Cassie"` from operator prose.

It shall not recognise the claim type.

It shall not reproduce Claim Boundary grammar.

Recognition remains upstream.

---

## **3\. Exact Evidence Input**

The relevant real governed evidence type is:

export interface GovernedCommunicationEvidenceInput {  
  readonly communicationReference: string;  
  readonly recipientEvidenceReference: string;  
  readonly sourceReference: GovernedSourceReference;  
  readonly provenanceReference: string;  
  readonly retrievalTime: string;  
  readonly available: boolean;  
  readonly contentDigest?: string;  
  readonly contentKind: string;  
  readonly compatibilityBoundary: string;  
  readonly policyReference: string;  
  readonly senderDisplayName?: string;  
}

Sprint 3.115 shall consume real:

readonly GovernedCommunicationEvidenceInput\[\]

from the existing assembled evidence path.

It shall not construct a parallel Gmail evidence type.

It shall not parse Gmail headers.

It shall not reconstruct `senderDisplayName`.

---

## **4\. Source Availability Input**

The current real source assembly publishes:

export type AssemblySourceStatus \=  
  | "available"  
  | "unavailable"  
  | "failed";

and:

sourceResults.gmail

inside `GovernedSourceEvidenceAssemblyResult`.

The implementation shall use the real governed source-availability result necessary to distinguish:

no matching candidate exists in inspectable admitted evidence

from:

the admitted source could not be inspected

This distinction is binding.

An unavailable or failed admitted Gmail source shall not silently become:

unresolved\_no\_match

when the absence of candidates is caused by inability to inspect the source.

---

## **5\. Closed Outcome Vocabulary**

The Entity Identification Evaluation shall produce exactly one of:

resolved  
ambiguous\_multiple\_matches  
unresolved\_no\_match  
entity\_source\_unavailable

No fifth outcome shall be introduced.

In particular, Sprint 3.112's separately discussed insufficient-identity-evidence condition shall not become a fifth principal evaluation outcome in this implementation.

Where inspectable admitted evidence contains no qualifying structured candidate, the result remains governed through the closed four-outcome architecture according to the actual source state and candidate count.

---

# **Part II — Exact Matching Rule**

## **6\. Governed First-Token Display-Name Alias Match**

Implement exactly:

governed\_first\_token\_display\_name\_alias\_match

For unresolved reference `R` and governed display name `D`:

NR \= normalize(R)  
ND \= normalize(D)  
T1 \= first lexical token of ND

The candidate qualifies under this basis if and only if:

NR \=== T1

and every other Sprint 3.112 source, evidence, availability, provenance, and candidate requirement is satisfied.

Example:

R  \= "Cassie"  
D  \= "Cassie Kozyrkov"

NR \= "cassie"  
ND \= "cassie kozyrkov"  
T1 \= "cassie"

NR \=== T1

Result:

qualifies

Matching basis:

governed\_first\_token\_display\_name\_alias\_match

---

## **7\. Exact Display-Name Precedence**

Preserve Sprint 3.113's matching-basis attribution precedence:

1. `exact_governed_display_name_match` where the complete normalized unresolved reference equals the complete normalized display name;  
2. otherwise `governed_first_token_display_name_alias_match` where the complete normalized unresolved reference equals the complete first lexical token of the normalized display name.

This precedence determines the matching basis attributed to one candidate.

It shall not rank candidates against each other.

It shall not make one candidate preferred over another.

---

## **8\. Representation-Neutral Normalization**

Normalization may perform only the representation-neutral operations governed by Sprints 3.112/3.113:

* case normalization;  
* surrounding-whitespace normalization;  
* Unicode normalization.

The implementation shall use one deterministic normalization function owned by the Entity Identification ruleset/engine boundary.

It shall not perform semantic normalization.

---

## **9\. Explicitly Prohibited Matching**

The following are prohibited:

substring matching  
prefix matching shorter than the complete lexical token  
partial-token matching  
surname matching  
last-token matching  
nickname inference  
initial expansion  
edit distance  
fuzzy matching  
phonetic matching  
stemming  
embedding similarity  
semantic similarity  
model reasoning  
model entity linking  
popularity ranking  
recency ranking  
sender-frequency ranking  
topic relevance  
conversation-history inference  
external search  
directory search  
contact lookup  
first-result selection

Therefore:

"Cassie" vs "Cassandra Kozyrkov" → no match  
"Cassie" vs "Cass Kozyrkov"      → no match  
"Cassie" vs "C. Kozyrkov"        → no match

All three shall produce `unresolved_no_match` where the admitted source is available and no other qualifying candidate exists.

---

# **Part III — Repository Precondition**

## **10\. Required Documents**

Before writing code, read completely:

docs/SPRINT-3.112-GOVERNED-CONVERSATIONAL-ENTITY-IDENTIFICATION-AND-CLAIM-PARAMETER-CONTRACT.md  
docs/SPRINT-3.113-GOVERNED-GMAIL-DISPLAY-IDENTITY-AND-ENTITY-ALIAS-CONTRACT.md  
docs/SPRINT-3.114-GMAIL-DISPLAY-IDENTITY-IMPLEMENTATION.md

docs/SPRINT-3.91-...  
docs/SPRINT-3.103-...  
docs/SPRINT-3.104-...  
docs/CONSTITUTIONAL-PUBLICATION-PRINCIPLES.md  
docs/architecture/ROADMAP.md

Do not implement from this specification alone where an exact binding field or rule exists in 3.112/3.113.

---

## **11\. Required Source Inspection**

Read completely:

lib/governed-conversation/claim-boundary-types.ts  
lib/governed-conversation/claim-boundary-engine.ts  
lib/governed-conversation/claim-boundary-publications.ts  
lib/governed-conversation/claim-boundary-fixtures.ts

lib/governed-conversation/projection-composer.ts  
lib/governed-conversation/source-evidence-assembly.ts

lib/governed-conversation/gmail-evidence-publisher.ts  
lib/governed-conversation/gmail-evidence-acquisition-adapter.ts

lib/governed-conversation/claim-enrichment-types.ts  
lib/governed-conversation/claim-enrichment-engine.ts  
lib/governed-conversation/claim-enrichment-publications.ts  
lib/governed-conversation/claim-enrichment-fixtures.ts

lib/governed-conversation/lineage-types.ts

Search the repository for:

ExtractedParameter  
senderDisplayName  
GovernedCommunicationEvidenceInput  
GovernedSourceEvidenceAssemblyResult  
sourceResults  
lineageIdentity  
canonicalise  
person:cassie  
resolverForAddress

---

## **12\. Starting-State Confirmation**

Confirm directly:

`ExtractedParameter` remains:  
{  
  readonly segmentId: string;  
  readonly name: "personName" | "entityId";  
  readonly value: string;  
}

1. 

`GovernedCommunicationEvidenceInput` contains:  
readonly senderDisplayName?: string;

2. 

real assembled Gmail evidence can contain:  
senderDisplayName: "Cassie Kozyrkov"

3. 

Gmail disclosure policy is:  
governed-gmail-conversational-metadata-disclosure.v2

4.   
5. no production Entity Identification module currently exists;  
6. no production entity resolver currently creates `person:cassie`;  
7. Claim Boundary remains unchanged since the relevant prior sprint;  
8. Enrichment remains unchanged;  
9. `/api/chat` remains unintegrated with this stage.

If any prerequisite materially differs, stop.

Return:

> **Implementation Incomplete**

Do not invent a compatibility workaround.

---

## **13\. Repository Record**

Record:

Repository:  
Branch:  
Starting commit:  
Working-tree state:  
Real clone:  
Sprint 3.112 present:  
Sprint 3.113 present:  
Sprint 3.114 complete:  
senderDisplayName present:  
Existing Entity Identification implementation:  
Protected-file hashes:

Use a real Git clone if implementation occurs in a sandbox.

---

# **Part IV — Required Module Architecture**

## **14\. New Isolated Modules**

Create:

lib/governed-conversation/entity-identification-types.ts  
lib/governed-conversation/entity-identification-ruleset.ts  
lib/governed-conversation/entity-identification-engine.ts  
lib/governed-conversation/entity-identification-publications.ts  
lib/governed-conversation/entity-identification-fixtures.ts

Add corresponding tests following the repository's established test layout.

This file-per-responsibility pattern is binding unless an existing repository convention requires test files to sit separately.

Do not collapse the implementation into one file.

---

## **15\. Responsibility Separation**

### **`entity-identification-types.ts`**

Owns:

* outcome type;  
* candidate type;  
* engine input;  
* ruleset body/publication type;  
* evaluation type;  
* resolved entity reference type/shape;  
* clarification candidate reference shape where required.

It owns no matching implementation.

### **`entity-identification-ruleset.ts`**

Owns:

* immutable ruleset body;  
* admitted parameter names;  
* admitted entity kinds;  
* admitted evidence categories;  
* normalization rules;  
* matching bases;  
* cardinality rules;  
* source-availability rules;  
* prohibited mechanisms;  
* ruleset publication.

### **`entity-identification-engine.ts`**

Owns:

* input validation;  
* admitted evidence filtering;  
* deterministic normalization;  
* candidate construction;  
* matching;  
* canonical candidate ordering;  
* cardinality evaluation;  
* source-unavailable distinction;  
* result construction.

It owns no LLM/model dependency.

### **`entity-identification-publications.ts`**

Owns:

* deterministic publication identity;  
* canonical publication body construction;  
* exchange-scoped resolved entity reference construction;  
* immutable publication output.

It shall use the repository's approved canonical identity mechanism.

### **`entity-identification-fixtures.ts`**

Owns:

* real-shaped deterministic test fixtures;  
* Cassie single-match fixture;  
* adversarial non-match fixtures;  
* two-Cassie fixture;  
* zero-match fixture;  
* unavailable-source fixture;  
* deterministic replay fixture.

Fixtures shall not pre-supply the entity resolution being tested.

---

# **Part V — Entity Identification Types**

## **16\. Outcome Type**

Define exactly:

export type EntityIdentificationOutcome \=  
  | "resolved"  
  | "ambiguous\_multiple\_matches"  
  | "unresolved\_no\_match"  
  | "entity\_source\_unavailable";

No additional member is permitted.

---

## **17\. Candidate Minimum Shape**

Every candidate shall preserve at minimum the binding Sprint 3.112 responsibilities:

candidateId  
entityKind  
displayReference  
normalizedMatchValue  
sourceReference  
sourceOwner  
provenanceReference  
evidenceReference  
matchingBasis

The implementation may add only fields required for deterministic lineage or source qualification.

`entityKind` for the current implementation shall remain bounded to the governed person-name parameter responsibility.

Do not introduce a general-purpose entity ontology.

---

## **18\. Matching Basis Vocabulary**

The ruleset shall include the currently applicable governed bases, including exactly:

exact\_governed\_display\_name\_match  
governed\_first\_token\_display\_name\_alias\_match

Do not silently rename the first-token basis.

Do not implement fuzzy or semantic bases.

---

## **19\. Evaluation Minimum Shape**

The immutable Entity Identification Evaluation shall include at minimum the fields governed by Sprint 3.112:

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

Bounded additional fields are permitted only where required to preserve:

* source availability;  
* candidate count;  
* exact evidence citation;  
* deterministic replay;  
* publication identity.

Do not add model state, conflict state, enrichment state, projection state, or durable identity state.

---

# **Part VI — Engine Input**

## **20\. Real Parameter Consumption**

The engine shall consume a real:

ExtractedParameter

rather than a copied local equivalent.

The central supported parameter is:

{  
  name: "personName",  
  value: "Cassie",  
  segmentId: "..."  
}

If the parameter is not admitted by the Entity Identification ruleset, fail closed according to the module's input contract.

Do not reinterpret arbitrary parameters.

---

## **21\. Real Evidence Consumption**

The engine shall consume real:

readonly GovernedCommunicationEvidenceInput\[\]

from governed source assembly.

Candidate construction may use only evidence satisfying the Sprint 3.112/3.113 source-qualified requirements, including:

* admitted communication evidence;  
* evidence available;  
* `senderDisplayName` structurally present;  
* governed source reference present;  
* provenance reference present;  
* evidence/communication reference present;  
* applicable disclosure policy/boundary requirements satisfied.

A bare string from unrelated context shall never become a candidate.

---

## **22\. Source Status**

The engine input shall contain the real source-status information necessary to distinguish:

available source \+ zero qualifying candidates

from:

source unavailable or failed

Do not infer source availability merely from:

communicationEvidence.length \=== 0

because the real assembly architecture intentionally separates evidence collections from `sourceResults`.

---

# **Part VII — Candidate Construction**

## **23\. Evidence-Bound Candidate**

For each admitted communication evidence item containing a governed `senderDisplayName`, construct a candidate bound to that specific evidence publication.

Conceptually:

communication evidence  
    ↓  
senderDisplayName  
    ↓  
normalized governed display name  
    ↓  
matching predicate  
    ↓  
source-qualified candidate

The candidate shall preserve the evidence citation.

---

## **24\. Evidence Reference**

For governed communication evidence, the candidate's `evidenceReference` shall identify the specific communication evidence record that justified candidate construction.

Use the real governed identity already available from the upstream publication.

Do not fabricate a parallel Gmail message identity.

Do not copy the upstream publication and assign it a new evidence identity.

---

## **25\. Source and Provenance**

A candidate shall preserve the actual:

sourceReference  
provenanceReference  
sourceOwner

necessary to trace it back to the governed upstream source.

A display-name match without these required governed references shall not qualify.

---

## **26\. Candidate Equality**

Two evidence records shall not become one candidate merely because both contain:

Cassie Kozyrkov

Candidate deduplication requires an exact ruleset-authorised source-qualified identity key.

Absent such an upstream identity relationship, distinct evidence publications remain distinct candidates.

This means two separately source-qualified matching candidates may create:

ambiguous\_multiple\_matches

even where their display strings are identical.

Do not perform implicit person fusion.

---

# **Part VIII — Cardinality**

## **27\. Exactly One Candidate**

Where:

qualifyingCandidateCount \=== 1

publish:

outcome: "resolved"

and:

disambiguationRequired: false

The evaluation shall preserve:

* original unresolved reference;  
* normalized reference;  
* selected candidate;  
* matching basis;  
* evidence citation;  
* source;  
* provenance;  
* ruleset identity;  
* evaluation identity;  
* exchange-scoped resolved entity reference.

---

## **28\. Zero Candidates**

Where:

qualifyingCandidateCount \=== 0

and the admitted source was genuinely available and inspectable, publish:

outcome: "unresolved\_no\_match"

Do not create:

person:cassie

Do not use the raw parameter as an entity identity.

Do not search outside admitted evidence.

Do not invoke a model.

Do not create a resolved entity reference.

Expected:

resolvedEntityReference: absent  
resolvedCandidateReference: absent  
disambiguationRequired: false

---

## **29\. Multiple Candidates**

Where:

qualifyingCandidateCount \> 1

publish:

outcome: "ambiguous\_multiple\_matches"  
disambiguationRequired: true

All qualifying candidates shall be recorded under canonical ordering.

No candidate shall be selected.

Expected:

resolvedEntityReference: absent  
resolvedCandidateReference: absent

`clarificationCandidateReferences` shall contain the bounded evidence-backed candidate choices needed by a future Claim Boundary handoff.

This sprint does not implement that handoff.

---

## **30\. Source Unavailable**

Where the admitted Gmail evidence source is unavailable or failed such that candidate inspection cannot truthfully establish absence, publish:

outcome: "entity\_source\_unavailable"

Do not convert this to:

unresolved\_no\_match

Expected:

resolvedEntityReference: absent  
resolvedCandidateReference: absent  
disambiguationRequired: false

Source unavailability and zero match remain different facts.

---

# **Part IX — Identity Integrity**

## **31\. Ruleset Identity**

Publish a deterministic immutable:

entityIdentificationRulesetId

It shall not alias:

* source identity;  
* communication identity;  
* Claim Boundary ruleset identity;  
* Claim Boundary evaluation identity;  
* claim identity;  
* enrichment identity.

---

## **32\. Evaluation Identity**

Every evaluation receives:

entityIdentificationEvaluationId

derived through the repository's canonical identity mechanism from its canonical identity-bearing body.

It shall be sensitive to at least:

* ruleset;  
* conversational lineage;  
* unresolved/normalized reference;  
* admitted evidence references;  
* candidate set;  
* outcome;  
* resolved candidate where applicable;  
* source availability state where material.

---

## **33\. One Candidate vs Two Candidates**

Required invariant:

> A one-candidate evaluation and a two-candidate evaluation shall never share `entityIdentificationEvaluationId`.

Required test:

Run otherwise identical inputs where:

### **Input A**

Cassie Kozyrkov

is the sole candidate.

### **Input B**

Cassie Kozyrkov  
Cassie Chen

are both candidates.

Assert:

oneCandidate.entityIdentificationEvaluationId  
  \!==  
twoCandidate.entityIdentificationEvaluationId

This is a required Identity Integrity proof.

---

## **34\. Candidate Identity**

Each candidate shall have:

candidateId

derived from its canonical source-qualified candidate body.

A candidate ID shall not alias:

* `communicationReference`;  
* `recipientEvidenceReference`;  
* `provenanceReference`;  
* `entityIdentificationEvaluationId`;  
* `resolvedEntityReference`.

The candidate references its evidence.

It does not replace it.

---

## **35\. Resolved Entity Reference**

A successful unique resolution shall produce an exchange-scoped:

resolvedEntityReference

representing:

> the unique entity candidate resolved for this unresolved entity reference under this ruleset and evaluation in this exchange.

It shall not be:

person:cassie

unless that exact durable identifier was already supplied by a governed upstream identity authority.

For the Cassie Gmail case, no such durable identity exists.

Therefore the resolved reference shall be content-derived under the repository's approved canonical identity mechanism.

---

## **36\. No Cross-Exchange Identity**

Changing:

exchangeId

shall produce a separately scoped evaluation/resolution identity as required by the contract.

Do not create a persistent contact graph.

Do not cache a resolved person for reuse in later exchanges.

---

# **Part X — Required Central Proof**

## **37\. Real Cassie Scenario**

Construct the central test using real pipeline outputs.

The Claim Boundary recognition fixture shall produce a real:

ExtractedParameter

equivalent to:

{  
  segmentId: "\<recognised segment\>",  
  name: "personName",  
  value: "Cassie"  
}

Do not handcraft a fake entity ID.

---

## **38\. Real Assembled Communication Evidence**

Use the real Sprint 3.114 source/publication/assembly path to obtain communication evidence containing exactly one admitted item with:

senderDisplayName: "Cassie Kozyrkov"

The test shall consume the resulting real:

GovernedCommunicationEvidenceInput

rather than constructing a bespoke Entity Identification evidence type.

---

## **39\. Matching Proof**

The engine shall calculate:

R  \= Cassie  
NR \= cassie

D  \= Cassie Kozyrkov  
ND \= cassie kozyrkov  
T1 \= cassie

Therefore:

NR \=== T1

and matching basis shall be exactly:

governed\_first\_token\_display\_name\_alias\_match

---

## **40\. Required Cassie Result**

Assert:

outcome: resolved  
qualifyingCandidateCount: 1  
disambiguationRequired: false  
resolvedEntityReference: present  
resolvedCandidateReference: present

The selected candidate shall preserve:

displayReference: Cassie Kozyrkov  
matchingBasis: governed\_first\_token\_display\_name\_alias\_match

and the exact real evidence citation to the communication record from which `senderDisplayName` was obtained.

---

## **41\. What the Cassie Proof Does Not Establish**

The test shall not assert that:

decision@substack.com

is Cassie Kozyrkov's personal email address.

Entity Identification proves only:

> the currently assembled governed evidence contained exactly one source-qualified candidate whose governed display name deterministically matched the unresolved `"Cassie"` parameter.

Whether a contact-address factual value is actually supported remains downstream Evidence-to-Claim Enrichment responsibility.

This distinction shall appear explicitly in the test/report.

---

# **Part XI — Required Adversarial Tests**

## **42\. Cassandra Must Not Match**

Input:

parameter: Cassie  
senderDisplayName: Cassandra Kozyrkov

Calculation:

NR \= cassie  
T1 \= cassandra

Assert:

NR \!== T1  
outcome \=== "unresolved\_no\_match"

No candidate shall qualify.

---

## **43\. Cass Must Not Match**

Input:

parameter: Cassie  
senderDisplayName: Cass Kozyrkov

Assert:

NR \= cassie  
T1 \= cass

outcome \=== "unresolved\_no\_match"

---

## **44\. Initial Must Not Match**

Input:

parameter: Cassie  
senderDisplayName: C. Kozyrkov

Assert:

NR \= cassie  
T1 \= c.

outcome \=== "unresolved\_no\_match"

No initial expansion is permitted.

---

## **45\. Partial String Must Not Match**

Add a bounded negative proof that:

Cass

does not qualify against:

Cassie Kozyrkov

under the first-token rule.

The implementation shall not accidentally reduce:

NR \=== T1

to:

T1.startsWith(NR)

or any equivalent partial comparison.

---

# **Part XII — Multiple-Match Proof**

## **46\. Two Cassies**

Use real-shaped governed communication evidence containing:

Cassie Kozyrkov  
Cassie Chen

with distinct upstream communication/evidence identities.

Parameter:

Cassie

Both candidates independently satisfy:

governed\_first\_token\_display\_name\_alias\_match

Expected:

qualifyingCandidateCount: 2  
outcome: ambiguous\_multiple\_matches  
disambiguationRequired: true

---

## **47\. No Winner**

Assert:

resolvedEntityReference: absent  
resolvedCandidateReference: absent

Both candidate references shall be preserved.

No candidate shall be marked preferred.

No ranking value shall exist.

No confidence score shall exist.

Evidence ordering shall not affect the result.

---

## **48\. Canonical Candidate Ordering**

Reverse the input evidence ordering and rerun.

Expected:

* same candidate set;  
* same canonical candidate ordering;  
* same outcome;  
* same canonical evaluation body;  
* same `entityIdentificationEvaluationId`.

This proves evidence arrival order does not become a hidden ranking mechanism.

---

# **Part XIII — Zero-Match Proof**

## **49\. Available Source, No Candidate**

Provide real-shaped assembled evidence where Gmail is available but no communication has a qualifying display name for:

Cassie

Expected:

outcome: unresolved\_no\_match

Assert:

candidateReferences: \[\]  
resolvedEntityReference: absent  
resolvedCandidateReference: absent

No fabricated identity shall appear anywhere in the result.

---

# **Part XIV — Source-Unavailable Proof**

## **50\. Unavailable Gmail**

Use a real-shaped assembly source result where Gmail is unavailable.

Expected:

outcome: entity\_source\_unavailable

Assert it is not:

unresolved\_no\_match

No candidate shall be fabricated.

---

## **51\. Failed Gmail Acquisition**

Where the real assembly reports Gmail:

status: "failed"

and therefore the admitted source cannot be inspected, the Entity Identification implementation shall preserve the fail-closed source-unavailable semantics required by Sprint 3.112.

The exact mapping from assembly diagnostic state into the closed entity outcome shall be deterministic and tested.

Do not invent a fifth entity outcome for adapter failure.

---

# **Part XV — Model Non-Participation**

## **52\. Pure Deterministic Engine**

The matching function shall have no model/LLM dependency.

Its signature shall be equivalent in responsibility to:

identifyGovernedEntity(input: EntityIdentificationEngineInput):  
  EntityIdentificationEvaluation

or a deterministic result wrapper containing that publication.

It shall not accept:

model  
llm  
callClaude  
prompt  
completion  
embedding  
classifier  
ranker  
agent

as an input.

---

## **53\. Import Proof**

Search the new Entity Identification modules for imports of:

callClaude  
model-invocation  
anthropic  
openai  
embedding  
agent

Expected:

none

The test shall prove structural non-participation, not merely assert that the model was not called during one fixture.

---

# **Part XVI — Relationship to Claim Boundary**

## **54\. Claim Boundary Remains Upstream**

Do not modify:

lib/governed-conversation/claim-boundary-engine.ts

Entity Identification consumes:

ClaimBoundaryEvaluation.extractedParameters

It does not change how those parameters are extracted.

---

## **55\. No Recognition Duplication**

Entity Identification shall not:

* inspect raw operator prose to infer claim type;  
* decide `contact_address_lookup`;  
* decide `message_importance`;  
* implement Claim Boundary lexical patterns;  
* implement typed intent;  
* create Claim Boundary clarification publications.

Sprint 3.89/3.91 remain the sole recognition owners.

---

## **56\. No Claim Publication Integration Yet**

Although Sprint 3.112 governs eventual use of:

resolvedEntityReference

as the verified entity parameter supplied for Claim Boundary completion, Sprint 3.115 remains isolated.

It shall not modify Claim Boundary to consume the new publication.

It proves the deterministic publication exists and is correct.

A later composition/integration sprint shall connect the stages.

---

# **Part XVII — Relationship to Enrichment**

## **57\. Enrichment Remains Downstream**

Do not modify:

lib/governed-conversation/claim-enrichment-engine.ts

Do not modify:

lib/governed-conversation/claim-enrichment-types.ts

Sprint 3.115 does not determine:

* contact-address factual value;  
* evidence sufficiency;  
* factual value freshness;  
* claim status;  
* claim integrity digest.

It identifies the entity parameter only.

---

## **58\. No Evidence-to-Fact Laundering**

A successful:

Cassie → Cassie Kozyrkov

entity resolution shall not automatically produce:

decision@substack.com

as a supported contact-address fact.

The Entity Identification publication shall not contain a field whose semantics imply:

personalEmailAddress  
verifiedContactAddress

unless such a field is explicitly upstream evidence metadata required only for source citation—which the current contract does not require.

---

# **Part XVIII — Gmail Boundary**

## **59\. Sprint 3.114 Is Read-Only**

Do not modify:

lib/executive-operating-system/situational-awareness/projection/adapters/gmail/types.ts  
lib/executive-operating-system/situational-awareness/projection/adapters/gmail/normalizer.ts  
lib/governed-conversation/gmail-evidence-publisher.ts  
lib/governed-conversation/gmail-evidence-acquisition-adapter.ts

Sprint 3.114's source/publication prerequisite is complete.

Entity Identification consumes it.

It does not extend it.

---

## **60\. No Reparsing**

Entity Identification shall use:

communicationEvidence.senderDisplayName

directly.

It shall not inspect a raw Gmail `From` header.

It shall not reconstruct the display name from an email address.

It shall not infer a display name from the mailbox local part.

The Gmail normalizer remains the sole parsing authority.

---

# **Part XIX — Determinism**

## **61\. Replay**

Identical canonical inputs shall produce identical:

* normalized unresolved reference;  
* candidate set;  
* candidate ordering;  
* matching bases;  
* evidence references;  
* outcome;  
* disambiguation state;  
* canonical publication body;  
* `entityIdentificationEvaluationId`;  
* `resolvedEntityReference` where resolved.

Run the Cassie scenario repeatedly.

Assert byte-identical canonical results.

---

## **62\. No Clock Dependence**

The engine shall not call the local clock.

Where `createdAt` or reference time is required, it shall be supplied explicitly in input.

The same supplied temporal values shall produce the same publication identity.

---

## **63\. No Random Identity**

Do not use:

Math.random()  
crypto.randomUUID()  
Date.now()

for publication identity.

Use the repository's approved canonical content-derived identity mechanism.

---

# **Part XX — Publication Responsibility Audit**

## **64\. Ruleset Responsibility**

`EntityIdentificationRuleset` owns only:

> the deterministic rules under which evidence-backed entity candidates may qualify for conversational claim-parameter resolution.

It does not own:

* evidence acquisition;  
* Gmail parsing;  
* claims;  
* enrichment;  
* conflicts;  
* model interpretation.

---

## **65\. Evaluation Responsibility**

`EntityIdentificationEvaluation` owns only:

> the deterministic result of resolving one recognised entity reference against admitted governed evidence for one conversational exchange.

It does not own:

* upstream evidence;  
* durable person identity;  
* claim status;  
* contact-address factual truth;  
* conflict evaluation.

---

## **66\. Resolved Entity Responsibility**

`resolvedEntityReference` owns only:

> the exchange-scoped canonical reference to the unique candidate established by one Entity Identification Evaluation.

It is not a person profile.

It is not a contact database entry.

It is not a durable identity graph node.

---

# **Part XXI — Isolation**

## **67\. Protected Application Files**

Zero contact with:

app/api/chat/route.ts  
lib/context-builder.ts  
lib/useAgentConversation.ts

Also preserve any established application execution boundary used by prior isolated sprints.

Record pre/post hashes.

Expected:

byte-identical

---

## **68\. Protected Governed Modules**

Record pre/post hashes for:

lib/governed-conversation/claim-boundary-engine.ts  
lib/governed-conversation/claim-boundary-types.ts  
lib/governed-conversation/claim-enrichment-engine.ts  
lib/governed-conversation/claim-enrichment-types.ts

lib/governed-conversation/gmail-evidence-publisher.ts  
lib/governed-conversation/gmail-evidence-acquisition-adapter.ts

lib/executive-operating-system/situational-awareness/projection/adapters/gmail/types.ts  
lib/executive-operating-system/situational-awareness/projection/adapters/gmail/normalizer.ts

Expected:

byte-identical

---

## **69\. Allowed Existing Imports**

The new isolated modules may import existing types/utilities required for:

* `ExtractedParameter`;  
* `GovernedCommunicationEvidenceInput`;  
* governed source references;  
* source-assembly status;  
* canonicalisation;  
* content-derived lineage identity.

They shall not import upstream engines merely to rerun their work.

---

# **Part XXII — Required Test Matrix**

## **70\. Central Test Matrix**

At minimum:

| Scenario | Parameter | Governed display evidence | Source state | Expected outcome |
| ----- | ----- | ----- | ----- | ----- |
| Cassie unique | `Cassie` | `Cassie Kozyrkov` | available | `resolved` |
| Cassandra adversarial | `Cassie` | `Cassandra Kozyrkov` | available | `unresolved_no_match` |
| Cass adversarial | `Cassie` | `Cass Kozyrkov` | available | `unresolved_no_match` |
| Initial adversarial | `Cassie` | `C. Kozyrkov` | available | `unresolved_no_match` |
| Two Cassies | `Cassie` | `Cassie Kozyrkov`, `Cassie Chen` | available | `ambiguous_multiple_matches` |
| Zero match | `Cassie` | unrelated governed names | available | `unresolved_no_match` |
| Source unavailable | `Cassie` | unavailable | unavailable | `entity_source_unavailable` |
| Source failed | `Cassie` | unavailable due acquisition failure | failed | `entity_source_unavailable` |
| Replay | `Cassie` | `Cassie Kozyrkov` | available | byte-identical repeat |

---

## **71\. Exact-Match Precedence Test**

Also prove:

parameter: Cassie  
senderDisplayName: Cassie

qualifies under:

exact\_governed\_display\_name\_match

rather than:

governed\_first\_token\_display\_name\_alias\_match

This proves Sprint 3.113's matching-basis precedence is implemented exactly.

---

## **72\. Evidence Citation Test**

For the unique Cassie result, assert that the selected candidate/evaluation preserves the exact real:

communicationReference  
sourceReference  
provenanceReference

or the contract-defined corresponding evidence-reference representation.

The evidence citation shall identify the exact communication that supplied:

senderDisplayName: "Cassie Kozyrkov"

A successful resolution without this citation shall fail the test.

---

## **73\. Missing Provenance Test**

Construct a deliberately invalid direct engine input or publication-construction input lacking required provenance.

Prove it cannot become a qualifying candidate merely because the display name matches.

The implementation shall fail closed according to its validation boundary.

---

## **74\. No Fabricated Identity Test**

Search all results for:

person:cassie

Expected:

absent

unless an explicit upstream governed identifier with that exact value was deliberately supplied in a separate identifier-match test.

The central Cassie test shall not supply one.

---

## **75\. Identity Integrity Test**

Required assertions:

rulesetId \!== evaluationId  
evaluationId \!== candidateId  
candidateId \!== resolvedEntityReference  
resolvedEntityReference \!== communicationReference  
resolvedEntityReference \!== claimBoundaryEvaluationId

and:

singleCandidateEvaluationId \!== multipleCandidateEvaluationId

---

## **76\. Model Non-Participation Test**

Prove structurally that the engine's public function accepts only deterministic governed inputs and contains no model adapter parameter.

Also perform import inspection.

Expected:

model dependencies: 0

---

# **Part XXIII — Stop-and-Report Conditions**

## **77\. Missing Real Evidence Identity**

If the current `GovernedCommunicationEvidenceInput` cannot supply a truthful `evidenceReference` under Sprint 3.112 without inventing a new identity or republishing the communication evidence, stop.

Return:

> **Implementation Incomplete**

Name the exact missing identity seam.

Do not invent a replacement.

---

## **78\. Source Availability Cannot Be Determined**

If the real assembly source status cannot be supplied to the isolated engine without reconstructing source state or altering source assembly, stop.

Return:

> **Implementation Incomplete**

Do not collapse unavailable into zero-match.

---

## **79\. Claim Boundary Modification Appears Necessary**

If implementation appears to require changing:

claim-boundary-engine.ts

to complete the isolated proof, stop.

The isolated publication must be proven first.

Integration is later.

---

## **80\. Enrichment Modification Appears Necessary**

If implementation appears to require changing:

claim-enrichment-engine.ts

stop.

This sprint ends before enrichment.

---

## **81\. Gmail Modification Appears Necessary**

If implementation reveals that `senderDisplayName` is not actually sufficient or not actually present in real assembled evidence, stop.

Do not reopen Sprint 3.114 inside this sprint.

Report the precise source prerequisite still missing.

---

## **82\. Fifth Outcome Appears Necessary**

If implementation evidence genuinely demonstrates that the closed four-outcome vocabulary cannot truthfully represent a real required condition, stop.

Do not invent a fifth outcome.

Return:

> **Implementation Incomplete**

and recommend the narrowest governance correction required.

---

# **Part XXIV — Expected File Surface**

## **83\. Expected New Files**

Expected:

lib/governed-conversation/entity-identification-types.ts  
lib/governed-conversation/entity-identification-ruleset.ts  
lib/governed-conversation/entity-identification-engine.ts  
lib/governed-conversation/entity-identification-publications.ts  
lib/governed-conversation/entity-identification-fixtures.ts

Plus corresponding test files.

And:

docs/SPRINT-3.115-ISOLATED-ENTITY-IDENTIFICATION-IMPLEMENTATION.md

---

## **84\. Existing Production Files**

No existing production module should require modification for this isolated implementation.

If a shared canonical identity utility must be imported, import it.

Do not alter it unless a real defect independently requires correction; if so, stop and report rather than expanding scope.

---

# **Part XXV — Validation**

## **85\. Targeted Validation**

Run all new Entity Identification tests.

Also run existing relevant suites covering:

Claim Boundary recognition  
Gmail display identity  
Gmail evidence publication  
source evidence assembly  
claim enrichment  
full-assembly regression  
integrity-coupling regression

The new isolated stage shall not regress existing architecture even though it is not yet integrated into it.

---

## **86\. Required Central Proof Results**

The report shall state explicitly:

Unique Cassie:  
    resolved

Cassandra Kozyrkov:  
    unresolved\_no\_match

Cass Kozyrkov:  
    unresolved\_no\_match

C. Kozyrkov:  
    unresolved\_no\_match

Cassie Kozyrkov \+ Cassie Chen:  
    ambiguous\_multiple\_matches

No matching display name:  
    unresolved\_no\_match

Gmail unavailable:  
    entity\_source\_unavailable

Any deviation requires investigation before completion.

---

## **87\. Full Validation**

Run the actual full repository validation:

npm test  
npm run build  
npm run lint  
npm run typecheck  
git diff \--check

No exception.

Use a real Git clone if evaluating in a sandbox.

Do not rely on a tarball extraction or targeted subset.

---

## **88\. Validation Failure**

Any unresolved failure in the full validation suite requires:

> **Implementation Incomplete**

Do not report completion because the new targeted tests pass.

---

# **Part XXVI — Return Format**

## **89\. Required Opening**

The completion report shall begin exactly in this pattern:

Status: Complete  
Sprint Type: Isolated Governed Entity Identification Implementation  
Recommendation: Implementation Complete

or:

Status: Incomplete  
Sprint Type: Isolated Governed Entity Identification Implementation  
Recommendation: Implementation Incomplete

---

## **90\. Repository Precondition Result**

Report:

Repository:  
Branch:  
Starting commit:  
Ending commit:  
Starting working-tree state:  
Ending working-tree state:  
Real clone:  
Required governing documents read:  
Sprint 3.114 prerequisite confirmed:

---

## **91\. Contract Extraction**

Report exactly:

Entity Identification architecture:  
Outcome vocabulary:  
Matching basis:  
Matching precedence:  
Durable identity:  
Model participation:  
Admitted current evidence category:

Expected:

Entity Identification architecture:  
    per-exchange deterministic matching against currently assembled governed evidence

Outcome vocabulary:  
    resolved  
    ambiguous\_multiple\_matches  
    unresolved\_no\_match  
    entity\_source\_unavailable

Matching basis:  
    governed\_first\_token\_display\_name\_alias\_match

Matching precedence:  
    exact\_governed\_display\_name\_match first;  
    governed\_first\_token\_display\_name\_alias\_match second

Durable identity:  
    none

Model participation:  
    prohibited

Admitted current evidence category:  
    Governed Communication Evidence

---

## **92\. Implementation Surface**

Report every new file and its responsibility.

Confirm:

Claim Boundary modified: No  
Claim Enrichment modified: No  
Gmail normalizer modified: No  
Gmail publisher modified: No  
/api/chat modified: No  
context-builder.ts modified: No  
useAgentConversation.ts modified: No

---

## **93\. Cassie Central Proof**

Report:

Extracted parameter:  
Normalized reference:  
Governed display name:  
Normalized display name:  
First lexical token:  
Matching basis:  
Qualifying candidate count:  
Outcome:  
Resolved candidate:  
Resolved entity reference:  
Evidence reference:  
Source reference:  
Provenance reference:

The result shall demonstrate the real evidence citation.

---

## **94\. Adversarial Results**

Report:

| Display name | Match? | Outcome |
| ----- | ----- | ----- |
| `Cassandra Kozyrkov` | No | `unresolved_no_match` |
| `Cass Kozyrkov` | No | `unresolved_no_match` |
| `C. Kozyrkov` | No | `unresolved_no_match` |

Also report the partial-string negative proof.

---

## **95\. Multiple-Match Result**

Report:

Candidate 1:  
Candidate 2:  
Candidate count:  
Outcome:  
Disambiguation required:  
Resolved candidate:  
Input-order reversal result:  
Evaluation identity stable across ordering:

Expected:

Candidate count: 2  
Outcome: ambiguous\_multiple\_matches  
Disambiguation required: true  
Resolved candidate: none

---

## **96\. Zero-Match and Unavailable Results**

Report separately:

Available source / zero candidate outcome:  
Unavailable source outcome:  
Failed acquisition outcome:

Do not combine them.

---

## **97\. Identity Integrity**

Report:

Ruleset identity:  
Single-candidate evaluation identity:  
Two-candidate evaluation identity:  
Candidate identity:  
Resolved entity reference:  
Single/two evaluation identities distinct:  
Cross-publication alias detected:

Expected:

Single/two evaluation identities distinct: Yes  
Cross-publication alias detected: No

---

## **98\. Determinism**

Report repeated-run results for the unique Cassie scenario.

Expected:

Normalized reference byte-identical: Yes  
Candidate set byte-identical: Yes  
Candidate ordering byte-identical: Yes  
Evaluation identity byte-identical: Yes  
Resolved entity reference byte-identical: Yes

---

## **99\. Model Non-Participation**

Report:

Model parameter in engine signature:  
Model imports:  
Embedding imports:  
Classifier imports:  
Network search:

Expected:

Model parameter in engine signature: No  
Model imports: None  
Embedding imports: None  
Classifier imports: None  
Network search: None

---

## **100\. Isolation**

Report pre/post hashes for protected files and import-search results.

State explicitly:

> Sprint 3.115 is additive and isolated. It consumes existing Claim Boundary and governed evidence publications without modifying their producers.

---

## **101\. Validation Results**

Report exact results for:

Entity Identification targeted tests:  
Claim Boundary tests:  
Gmail display identity tests:  
Gmail evidence publisher tests:  
source evidence assembly tests:  
claim enrichment tests:  
full-assembly regression tests:  
integrity-coupling regression tests:

npm test:  
npm run build:  
npm run lint:  
npm run typecheck:  
git diff \--check:

---

# **Part XXVII — Production Effect**

## **102\. Required Statement**

If complete, state:

> Sprint 3.115 adds an isolated deterministic Entity Identification capability that consumes a real recognised `ExtractedParameter` and real assembled governed communication evidence, constructs source-qualified entity candidates, applies the governed exact-display-name and `governed_first_token_display_name_alias_match` rules, and publishes one of exactly four governed outcomes. A unique `"Cassie"` → `"Cassie Kozyrkov"` match is now provable with a real evidence citation; multiple matches remain ambiguous; zero matches remain unresolved; unavailable evidence remains explicitly unavailable. The implementation creates no durable identity, uses no model, performs no fuzzy or semantic matching, modifies no upstream producer, and is not wired into production conversation handling.

---

# **Part XXVIII — Remaining Boundary**

## **103\. What This Sprint Does Not Yet Prove**

Sprint 3.115 does not prove full conversational composition.

Specifically, it does not yet prove that:

Claim Boundary  
    ↓  
Entity Identification  
    ↓  
completed parameterised Governed Claim Set  
    ↓  
Evidence-to-Claim Enrichment

compose correctly using the new real Entity Identification publication.

That seam must be tested explicitly before production integration.

Do not infer composition from isolated success.

---

## **104\. Recommended Next Step**

If Sprint 3.115 completes cleanly, recommend the narrowest composition re-check required by the architecture:

> **Sprint 3.116 — Entity Identification to Claim/Enrichment Composition Check**

That sprint should be evaluation-only unless repository evidence demonstrates that a separately governed integration contract is required first.

Its purpose should be to prove that the newly real:

resolvedEntityReference

can replace the fixture-hardcoded entity resolution previously used by the Cassie claim/enrichment path without:

* weakening Claim Boundary Option C;  
* aliasing entity and claim identities;  
* bypassing clarification;  
* changing enrichment responsibility;  
* fabricating a contact-address fact.

Production integration remains out of scope until that seam is proven.

---

# **Part XXIX — Recommendation Gate**

## **105\. Permitted Final Recommendation**

The final recommendation shall be exactly one:

> **Implementation Complete**

or:

> **Implementation Incomplete**

No third recommendation is permitted.

---

## **106\. Implementation Complete**

Use only if:

* Sprints 3.112, 3.113, and 3.114 were read completely;  
* the exact four-outcome vocabulary is implemented;  
* real `ExtractedParameter` is consumed;  
* real `GovernedCommunicationEvidenceInput.senderDisplayName` is consumed;  
* no evidence type is reconstructed;  
* exact full-name precedence works;  
* `governed_first_token_display_name_alias_match` works exactly;  
* `"Cassie"` resolves uniquely against `"Cassie Kozyrkov"`;  
* the unique result cites the real evidence;  
* `"Cassandra Kozyrkov"` does not match;  
* `"Cass Kozyrkov"` does not match;  
* `"C. Kozyrkov"` does not match;  
* partial substring matching is absent;  
* two Cassies produce `ambiguous_multiple_matches`;  
* neither multiple-match candidate is selected;  
* zero match produces `unresolved_no_match`;  
* unavailable source produces `entity_source_unavailable`;  
* one-candidate and two-candidate evaluations have different identities;  
* deterministic replay passes;  
* no durable identity is created;  
* no model participates;  
* Claim Boundary remains unchanged;  
* Enrichment remains unchanged;  
* Gmail normalizer and publisher remain unchanged;  
* `/api/chat`, `context-builder.ts`, and `useAgentConversation.ts` remain unchanged;  
* full validation passes.

---

## **107\. Implementation Incomplete**

Use if any binding requirement cannot be implemented truthfully without:

* inventing evidence identity;  
* inventing a fifth outcome;  
* changing Claim Boundary;  
* changing Enrichment;  
* reopening Gmail parsing/publication;  
* adding fuzzy or semantic matching;  
* introducing model participation;  
* collapsing source-unavailable into zero-match;  
* silently selecting among multiple candidates;  
* fabricating a durable identity;  
* weakening Identity Integrity;  
* bypassing real evidence citation;  
* violating isolation;  
* leaving full validation failing.

In that case, report the precise blocker and recommend the narrowest governance or correction sprint justified by the evidence.

Do not work around it.

---

# **Binding Summary**

Sprint:  
    3.115 — Isolated Entity Identification Implementation

Architecture:  
    per-exchange deterministic evidence matching

Input parameter:  
    real ExtractedParameter

Current admitted parameter:  
    name: "personName"

Evidence:  
    real assembled GovernedCommunicationEvidenceInput\[\]

Structured identity field:  
    senderDisplayName?: string

Closed outcomes:  
    resolved  
    ambiguous\_multiple\_matches  
    unresolved\_no\_match  
    entity\_source\_unavailable

Matching precedence:  
    exact\_governed\_display\_name\_match  
    then  
    governed\_first\_token\_display\_name\_alias\_match

First-token rule:  
    NR \= normalize(R)  
    ND \= normalize(D)  
    T1 \= first lexical token of ND  
    qualifies iff NR \=== T1

Cassie → Cassie Kozyrkov:  
    qualifies

Cassie → Cassandra Kozyrkov:  
    does not qualify

Cassie → Cass Kozyrkov:  
    does not qualify

Cassie → C. Kozyrkov:  
    does not qualify

Substring/fuzzy/semantic matching:  
    prohibited

Multiple candidates:  
    ambiguous\_multiple\_matches  
    no winner

Zero candidates with source available:  
    unresolved\_no\_match

Source unavailable:  
    entity\_source\_unavailable

Evidence citation:  
    mandatory

Resolved identity:  
    exchange-scoped only

Durable entity graph:  
    prohibited

Model participation:  
    prohibited

Claim Boundary modification:  
    prohibited

Enrichment modification:  
    prohibited

Gmail modification:  
    prohibited

Production route integration:  
    prohibited

Isolation:  
    required

Full validation:  
    required

Recommendation gate:  
    Implementation Complete  
    OR  
    Implementation Incomplete

Output:  
    docs/SPRINT-3.115-ISOLATED-ENTITY-IDENTIFICATION-IMPLEMENTATION.md

The final line shall be exactly:

> **Implementation Complete**

or:

> **Implementation Incomplete**

