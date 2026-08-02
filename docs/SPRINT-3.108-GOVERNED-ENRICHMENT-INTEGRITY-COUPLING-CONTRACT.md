# **Sprint 3.108 — Governed Enrichment Integrity-Coupling Contract**

**Status:** Specification  
**Sprint Type:** Governance Decision / Integrity Correction Contract  
**Implementation Authority:** None  
**Production Integration:** Prohibited  
**Governing Trigger:** Sprint 3.105 mutation finding, reconfirmed by Sprint 3.107  
**Direct Structural Precedents:** Sprints 3.85 and 3.94  
**Output Path:** `docs/SPRINT-3.108-GOVERNED-ENRICHMENT-INTEGRITY-COUPLING-CONTRACT.md`

---

## **1\. Recommendation**

**Decision:** Approve this Governed Enrichment Integrity-Coupling Contract.

Sprint 3.105 discovered, and Sprint 3.107 independently reconfirmed, that an enriched claim may be changed after publication without conflict evaluation detecting the change.

The real mutation proof reports:

statusMutationSilentlyAccepted \= true  
factualValueMutationSilentlyAccepted \= true

The root cause is structural:

ConflictEngineInput  
    ├── claimSet  
    └── observations

The supplied claim publication and supplied source observations are separately constructed inputs.

The conflict engine currently verifies:

* that an observation’s `affectedClaimId` exists;  
* that source observations satisfy the conflict ruleset;  
* that observations are available and sufficiently covered;  
* that comparison keys, entities, and scopes match.

It does not verify that:

* the enriched claim body is still the body published by enrichment;  
* the observations were prepared for that exact enriched claim body;  
* the claim’s status, factual values, source references, and evidence state remain unchanged.

This contract selects:

> **Integrity-Coupling Option A — Canonical enriched-claim state identity, carried by the enriched claim and every observation targeting it, and recomputed and verified inside the conflict engine before evaluation.**

The selected architecture introduces a deterministic:

claimIntegrityDigest

derived from the immutable canonical enriched-claim state.

Every conflict observation targeting an enriched claim shall carry:

evaluatedClaimIntegrityDigest

equal to that claim’s published digest.

Before per-cell conflict evaluation, the conflict engine shall:

1. recompute the claim digest from the claim body actually supplied;  
2. compare it with the published `claimIntegrityDigest`;  
3. compare the observation’s `evaluatedClaimIntegrityDigest` with the same digest;  
4. fail closed before evaluation if any comparison fails.

A mismatch is a malformed or tampered publication chain.

It is not a valid conflict-evaluation outcome.

The existing six-state conflict-evaluation vocabulary remains closed and unchanged.

No implementation is authorized.

---

## **2\. Purpose**

This contract governs one question:

> **How shall conflict evaluation prove that its observations refer to the exact immutable enriched-claim state being evaluated, rather than merely to a matching claim ID?**

The contract resolves:

* the integrity-coupling mechanism;  
* the canonical digest body;  
* digest ownership;  
* where verification occurs;  
* mismatch behaviour;  
* observation requirements;  
* identity and publication implications;  
* compatibility with all settled claims, conflicts, enrichment, and projection decisions.

It does not govern:

* conflict taxonomy;  
* evidence acquisition;  
* claim recognition;  
* evidence-to-claim enrichment rules;  
* source-value adjudication;  
* projection derivation;  
* source ranking;  
* production integration.

---

## **3\. Sprint Character**

This is a governance-decision sprint.

It shall:

* independently evaluate the named integrity options;  
* select one closed architecture;  
* define the exact claim state protected;  
* define the digest ownership and algorithm requirements;  
* define observation coupling;  
* define mismatch handling;  
* assign verification responsibility;  
* preserve prior contracts;  
* define future implementation requirements.

It shall not:

* change code;  
* add fields;  
* implement hashing;  
* change the conflict engine;  
* alter observations;  
* modify the projection composer;  
* update tests;  
* integrate `/api/chat`;  
* claim the gap is already fixed.

---

## **4\. Governing Hierarchy**

Apply:

1. JARVIS Engineering Constitution;  
2. JARVIS North Star;  
3. JARVIS Engineering Specification Standard;  
4. Constitutional Publication Principles;  
5. Roadmap;  
6. Sprint 3.82 — Governed Conversational Lineage Identity Contract;  
7. Sprint 3.85 — Governed Conversational Identity Correction Contract;  
8. Sprint 3.89 — Governed Conversational Claims Boundary Contract;  
9. Sprint 3.90 — Governed Conversational Conflicts Boundary Contract;  
10. Sprint 3.94 — Governed Claims and Conflicts Composition Correction Contract;  
11. Sprint 3.103 — Governed Evidence-to-Claim Enrichment Contract;  
12. Sprint 3.106 — Governed Enrichment Composition Correction Contract;  
13. Sprint 3.107 — Enrichment Composition Correction Implementation;  
14. the reproducible mutation evidence;  
15. current repository implementation;  
16. this contract.

Sprint 3.106 governs publication identity and lineage.

Sprint 3.108 governs integrity coupling between the enriched claim publication and conflict observations.

---

# **Part I — Repository Precondition**

## **5\. Required Documents**

Before drafting any binding decision, confirm and read completely:

docs/SPRINT-3.85-GOVERNED-CONVERSATIONAL-IDENTITY-CORRECTION-CONTRACT.md  
docs/SPRINT-3.89-GOVERNED-CONVERSATIONAL-CLAIMS-BOUNDARY-CONTRACT.md  
docs/SPRINT-3.90-GOVERNED-CONVERSATIONAL-CONFLICTS-BOUNDARY-CONTRACT.md  
docs/SPRINT-3.94-GOVERNED-CLAIMS-AND-CONFLICTS-COMPOSITION-CORRECTION-CONTRACT.md  
docs/SPRINT-3.103-GOVERNED-EVIDENCE-TO-CLAIM-ENRICHMENT-CONTRACT.md  
docs/SPRINT-3.105-FULL-ASSEMBLY-COMPOSITION-RECHECK-WITH-ENRICHMENT.md  
docs/SPRINT-3.106-GOVERNED-ENRICHMENT-COMPOSITION-CORRECTION-CONTRACT.md  
docs/SPRINT-3.107-ENRICHMENT-COMPOSITION-CORRECTION-IMPLEMENTATION.md  
docs/CONSTITUTIONAL-PUBLICATION-PRINCIPLES.md  
docs/architecture/ROADMAP.md

---

## **6\. Required Source Inspection**

Read completely:

lib/governed-conversation/claim-enrichment-types.ts  
lib/governed-conversation/claim-enrichment-publications.ts  
lib/governed-conversation/claim-enrichment-engine.ts

lib/governed-conversation/conflict-boundary-types.ts  
lib/governed-conversation/conflict-boundary-engine.ts  
lib/governed-conversation/conflict-boundary-publications.ts

lib/governed-conversation/full-assembly-enrichment-composition-recheck.ts  
lib/governed-conversation/full-assembly-enrichment-composition-recheck.test.ts

lib/governed-conversation/projection-composer.ts  
lib/governed-conversation/lineage-types.ts

Confirm directly:

1. `ConflictEngineInput` receives `claimSet` and `observations` independently.  
2. `GovernedSourceObservation` currently has `affectedClaimId` but no enriched-claim state digest.  
3. enriched claims currently have no separately exposed integrity digest governed for conflict coupling.  
4. the conflict engine checks claim existence but not claim-body integrity.  
5. `runEnrichedClaimMutationProof()` mutates claim status and factual values while leaving observations unchanged.  
6. both mutations currently produce the same evaluation outcome as the baseline.  
7. Sprint 3.107’s discriminated claim-set architecture is present.  
8. the projection’s enriched-lineage architecture is present.  
9. no existing validator already owns this exact coupling responsibility.

If any central premise is materially false, stop.

Return:

> **Governance Review Incomplete**

---

## **7\. Repository State Recording**

The completion report shall record:

* repository;  
* branch;  
* starting commit;  
* working-tree state;  
* required documents;  
* required source files;  
* current enriched-claim fields;  
* current observation fields;  
* current mutation result;  
* current conflict-engine validation behaviour;  
* files changed.

Expected file changed:

docs/SPRINT-3.108-GOVERNED-ENRICHMENT-INTEGRITY-COUPLING-CONTRACT.md

only.

---

# **Part II — Finding Reconfirmed**

## **8\. Existing Input Architecture**

The conflict engine receives:

interface ConflictEngineInput {  
  readonly claimSet?: ConflictEvaluableClaimSet;  
  readonly observations:  
    readonly GovernedSourceObservation\[\];  
  ...  
}

The claim set and observations are two independently supplied publications.

Their only direct coupling is currently:

observation.affectedClaimId  
    ∈  
claimSet.claimIds

This proves identity membership.

It does not prove body integrity.

---

## **9\. Mutation Scenario**

The current proof:

1. constructs a real base Claim Set;  
2. constructs a real enrichment evaluation;  
3. constructs a real Enriched Governed Claim Set;  
4. obtains the enriched contact claim;  
5. constructs real conflict observations targeting that claim ID;  
6. runs conflict evaluation successfully;  
7. creates a copy of the enriched set with only the claim status changed;  
8. reruns conflict evaluation with unchanged observations;  
9. creates another copy with only `factualValues` changed;  
10. reruns conflict evaluation with unchanged observations.

Observed:

baseline outcome  
    \=  
status-mutation outcome  
    \=  
factual-value-mutation outcome

The conflict engine cannot distinguish the original enriched claim from either mutated body.

---

## **10\. Constitutional Defect**

The enriched claim’s immutable identity and enrichment lineage imply that its canonical body is fixed.

Permitting a changed body to be evaluated under the same:

claimId  
enrichmentEvaluationId  
enrichedGovernedClaimSetId

creates one of two invalid states:

1. the identity aliases two distinguishable canonical objects; or  
2. the supplied body no longer corresponds to the identity it claims.

Both violate Identity Integrity.

---

# **Part III — Integrity-Coupling Options**

## **11\. Option A — Canonical Claim-State Digest**

At enrichment publication time:

1. canonicalize the integrity-relevant enriched-claim body;  
2. compute a deterministic digest;  
3. publish that digest on the enriched claim;  
4. require every conflict observation targeting the enriched claim to carry the same digest;  
5. recompute and compare inside the conflict engine before evaluation.

### **Decision**

**Selected.**

---

## **12\. Option A — Binding Fields**

The enriched claim shall publish:

readonly claimIntegrityDigest: string;

Every governed source observation targeting an enriched claim shall publish:

readonly evaluatedClaimIntegrityDigest: string;

The conflict-evaluable enriched Claim Set shall preserve each enriched claim’s:

claimIntegrityDigest

without alteration.

---

## **13\. Why Option A Is Selected**

### **Reason 1 — It binds identity to body**

The digest represents the canonical state of the exact enriched claim.

A status or factual-value mutation changes the recomputed digest.

### **Reason 2 — It binds observations to the evaluated state**

An observation does not merely name a claim ID.

It declares which immutable claim state it was prepared to evaluate.

### **Reason 3 — It preserves existing responsibilities**

* enrichment owns enriched claim publication;  
* observation construction owns source-observation publication;  
* conflict evaluation owns verification and comparison;  
* projection remains downstream.

### **Reason 4 — It does not collapse evidence into claims**

Observations remain source-owned publications.

The conflict engine does not reconstruct evidence from claim summaries.

### **Reason 5 — It supports deterministic replay**

Identical claim bodies produce identical digests.

Changed bodies produce different digests.

### **Reason 6 — It is narrowly bounded**

The correction adds integrity coupling.

It does not redesign conflict semantics.

---

## **14\. Option B — Derive Observations Internally From Claim Set**

Remove independently supplied observations and require the conflict engine to reconstruct its observations from the enriched Claim Set.

### **Decision**

**Rejected.**

---

## **15\. Why Option B Is Rejected**

### **Reason 1 — Claims are not source publications**

An enriched claim contains bounded factual summaries and references.

It is not the canonical source observation publication.

### **Reason 2 — Source ownership would be lost**

Conflict evaluation requires:

* distinct source owners;  
* source publication identities;  
* observation times;  
* provenance;  
* comparison scope;  
* supersession state;  
* coverage.

Those properties belong to observations.

### **Reason 3 — It would conflate enrichment and conflict evidence**

The enrichment stage determines whether evidence supports a claim.

The conflict stage compares independently owned source assertions.

Those are related but distinct responsibilities.

### **Reason 4 — It would encourage derivation from summaries**

Reconstructing source observations from claim `factualValues` would risk treating a bounded claim summary as if it were the original source evidence.

### **Reason 5 — It reopens Sprint 3.90**

Sprint 3.90 explicitly established a dedicated conflict engine operating over claims plus admissible source-owned observations.

Removing observations would materially reopen that architecture.

---

## **16\. Option C — Evaluated Claim Snapshot Only**

Add an `evaluatedClaimSnapshot` to the conflict evaluation or Conflict Set, recording the claim state after evaluation for later comparison.

### **Decision**

**Rejected as the primary correction.**

---

## **17\. Why Option C Is Rejected**

### **Reason 1 — It records after acceptance**

A snapshot added to the output can show what was evaluated.

It does not prove the supplied claim matched its enrichment publication before evaluation began.

### **Reason 2 — It does not bind observations**

The same observations could still be supplied against a mutated claim.

The engine would merely record the mutated state.

### **Reason 3 — Detection would be deferred**

The architecture requires fail-closed prevention, not retrospective forensic discovery.

### **Reason 4 — It may be supplementary, not sufficient**

A future implementation may include an evaluated-claim snapshot for auditability.

It cannot replace the selected digest check.

---

## **18\. Option D — Projection Composer Integrity Check**

Allow the projection composer to compare enriched claims and conflict observations after conflict evaluation.

### **Decision**

**Rejected.**

---

## **19\. Why Option D Is Rejected**

### **Reason 1 — Too late**

Conflict evaluation would already have run against unverified inputs.

### **Reason 2 — Wrong owner**

The conflict engine owns the evaluation boundary.

It must reject malformed evaluation inputs before evaluating them.

### **Reason 3 — Composer Option A**

The composer validates and aggregates canonical upstream publications.

It shall not repair or retroactively legitimize a malformed conflict evaluation.

### **Reason 4 — Invalid publications could escape**

Conflict evaluations may be consumed independently of projection.

Integrity cannot depend on the projection composer always being invoked.

---

## **20\. Selected Architecture**

> **Integrity-Coupling Option A — Canonical Claim-State Digest is binding.**

The governed chain becomes:

Enrichment Engine  
    ↓  
canonical enriched claim body  
    ↓  
claimIntegrityDigest  
    ↓  
EnrichedGovernedClaimSet

Source Observation Publication  
    ↓  
affectedClaimId  
evaluatedClaimIntegrityDigest  
    ↓  
GovernedSourceObservation

Conflict Engine  
    ↓  
recompute claim digest  
compare:  
    recomputed digest  
    published claim digest  
    observation digest  
    ↓  
match → evaluate  
mismatch → fail closed

---

# **Part IV — Digest Ownership**

## **21\. Enrichment Owns Claim Digest Publication**

The Evidence-to-Claim Enrichment Stage owns creation of:

claimIntegrityDigest

because it owns publication of the enriched claim body.

The Claim Boundary shall not create it.

The conflict engine shall not author it.

The projection composer shall not author it.

---

## **22\. Observation Publisher Owns Observation Coupling Field**

The function or module that constructs a `GovernedSourceObservation` for conflict evaluation shall copy the target enriched claim’s published:

claimIntegrityDigest

into:

evaluatedClaimIntegrityDigest

The observation publisher shall not recompute or reinterpret claim semantics.

It shall bind the observation to the supplied canonical claim publication.

---

## **23\. Conflict Engine Owns Verification**

The conflict engine owns the mandatory pre-evaluation check.

The check shall occur:

after input structural validation  
before per-cell eligibility  
before source comparison  
before conflict derivation  
before any ConflictEvaluation publication

No other layer may substitute for this check.

---

# **Part V — Canonical Digest Body**

## **24\. Digest Scope Principle**

The digest shall cover every field whose mutation could change:

* the claim’s canonical truth;  
* evidence sufficiency;  
* conflict eligibility;  
* source interpretation;  
* downstream model meaning.

It shall exclude fields that are not part of the enriched claim’s canonical body.

---

## **25\. Required Digest Fields**

For an enriched claim, the canonical digest body shall include at minimum:

claimId  
baseClaimId  
claimType  
materiality  
status  
ownership  
sourceReferences  
factualValues  
sourceAvailable  
provenance  
observedAt  
contentKind  
boundedComplete  
conflicts  
enrichmentEvaluationId  
threadId  
requestId  
exchangeId  
segmentId or canonical segment linkage

Use the exact real field names from the current enriched claim type during implementation.

Where a listed semantic property is represented under a different current field name, use the real field.

---

## **26\. Collection Canonicalization**

The digest construction shall define deterministic treatment for every collection.

### **Order-semantic collections**

Preserve governed order where order has meaning.

### **Set-semantic collections**

Canonicalize by stable sorting using their immutable publication or source identity.

The implementation contract shall not permit ambient object iteration order to determine the digest.

---

## **27\. Undefined and Absent Fields**

Canonicalization shall distinguish only where the governing type distinguishes.

The implementation shall use one stable rule:

* prohibited optional field → omitted;  
* optional field absent → canonical omission;  
* empty governed collection → canonical empty collection;  
* empty string where prohibited → input invalid, not canonicalized.

Do not allow:

undefined

and:

\[\]

to become interchangeable where they express different governed states.

---

## **28\. String Canonicalization**

Canonical strings shall use:

* exact Unicode normalization rule already used by the repository, or NFC if no common canonicalizer exists;  
* exact case preservation unless the field’s governing contract defines case normalization;  
* no whitespace trimming unless the governing field already requires it.

The integrity digest protects the published body.

It shall not silently normalize a changed body into equivalence unless that equivalence is already governed.

---

## **29\. Status Is Mandatory**

The canonical digest body shall include:

status

Therefore:

available  
    ↓ mutation  
unsupported

must produce a different digest.

---

## **30\. Factual Values Are Mandatory**

The canonical digest body shall include the complete canonical:

factualValues

collection.

Therefore:

\["cassie@example.com"\]  
    ↓ mutation  
\["corrupt@example.invalid"\]

must produce a different digest.

---

## **31\. Source References Are Mandatory**

The canonical digest body shall include all admitted:

sourceReferences

A claim whose factual values are unchanged but whose source support changes is a different canonical enriched claim state.

---

## **32\. Provenance and Observation State**

The digest shall include the claim’s governed provenance and observation state, including the exact current fields representing:

* provenance;  
* observation time;  
* source availability;  
* coverage;  
* bounded completeness;  
* content kind.

A claim cannot retain the same integrity digest after those fields materially change.

---

# **Part VI — Digest Algorithm**

## **33\. Versioned Digest Policy**

Define a versioned policy identifier:

governed-enriched-claim-integrity.v1

The enriched claim or owning enrichment publication shall record:

claimIntegrityPolicyId

with that exact value unless repository naming conventions require a syntactically equivalent fixed constant.

The policy name and version are binding.

---

## **34\. Canonical Serialization**

The implementation shall use a single deterministic canonical serialization function.

It shall not use raw:

JSON.stringify(object)

on arbitrary object insertion order unless the object is first reconstructed in a fixed governed key order and every nested collection is canonicalized.

The canonical serializer shall:

1. emit a fixed schema;  
2. emit keys in fixed order;  
3. apply the governed collection-order rules;  
4. omit only governed-absent optional fields;  
5. encode UTF-8 deterministically.

---

## **35\. Hash Algorithm**

Use:

SHA-256

over the canonical UTF-8 serialized claim-integrity body.

Output encoding:

sha256:\<lowercase hexadecimal digest\>

Example shape:

sha256:6f5c...

The prefix is mandatory.

---

## **36\. Why SHA-256**

SHA-256 is selected because this field provides deterministic integrity coupling, not a digital signature or long-term non-repudiation guarantee.

This contract does not claim:

* signer identity;  
* cryptographic publication attestation;  
* resistance to a malicious party able to rewrite both body and digest;  
* post-quantum signature integrity.

Those concerns remain governed elsewhere.

---

## **37\. Digest Versioning**

A future change to the canonical body or algorithm requires:

governed-enriched-claim-integrity.v2

or another incremented version.

Do not silently change v1 construction while retaining the v1 policy ID.

---

# **Part VII — Observation Coupling**

## **38\. Required Observation Field**

Extend governed observations that target enriched claims with:

readonly evaluatedClaimIntegrityDigest: string;

For the current conflict engine, all observations supplied with:

claimSetKind \= "enriched"

shall carry this field.

---

## **39\. Base Claim Set Behaviour**

For:

claimSetKind \= "base"

`evaluatedClaimIntegrityDigest` shall be absent unless a future contract introduces base-claim integrity coupling.

Sprint 3.108 governs enriched claims only.

Do not fabricate an enriched digest for a base claim.

---

## **40\. Observation-to-Claim Equality**

For every observation targeting an enriched claim:

observation.evaluatedClaimIntegrityDigest  
    \=  
enrichedClaim.claimIntegrityDigest

This comparison is mandatory.

---

## **41\. Observation Group Consistency**

All observations targeting the same enriched claim in one evaluation shall carry the same:

evaluatedClaimIntegrityDigest

Observations carrying different digests for the same claim shall fail closed.

They shall not be split into separate comparison groups.

---

## **42\. Claim ID Remains Required**

The digest does not replace:

affectedClaimId

Both are required.

The pair means:

affectedClaimId  
    \= which canonical claim publication

evaluatedClaimIntegrityDigest  
    \= which exact immutable body of that claim

---

## **43\. Observation Identity**

The observation’s immutable identity body shall include:

affectedClaimId  
evaluatedClaimIntegrityDigest

Changing the target claim state shall change the observation publication identity.

A source observation cannot claim to target a new claim state while retaining an identity derived from the old coupling.

---

# **Part VIII — Verification Location**

## **44\. Named Decision**

> **Verification Location Option A — Inside the conflict engine, before per-cell evaluation.**

This is binding.

---

## **45\. Why the Conflict Engine Owns the Check**

### **Reason 1 — It is the trust boundary**

The conflict engine is the first component that consumes both:

* the canonical claim publication;  
* the observations that purport to evaluate it.

### **Reason 2 — Independent use**

Conflict evaluation may occur without projection.

The integrity guarantee must travel with the conflict engine.

### **Reason 3 — Fail-closed timing**

Malformed inputs must be rejected before any conflict evaluation publication is created.

### **Reason 4 — Responsibility clarity**

* enrichment publishes claim integrity;  
* observation construction binds observations;  
* conflict engine verifies;  
* projection validates resulting publications.

---

## **46\. Separate Pre-Validator Option**

A separate helper function may implement the reusable comparison logic.

However:

* the conflict engine must invoke it mandatorily;  
* callers cannot bypass it;  
* it is not an optional orchestration step;  
* successful conflict evaluation proves the check ran.

The constitutional owner remains the conflict engine.

---

## **47\. Projection Composer**

The projection composer may validate that a completed conflict evaluation references the correct enriched claim IDs and publication lineage.

It shall not recompute observation coupling as the primary control.

Composer Option A remains intact.

---

# **Part IX — Mismatch Definition**

## **48\. Closed Mismatch Taxonomy**

An enrichment-integrity mismatch exists when any of these conditions occurs:

published\_claim\_digest\_mismatch  
observation\_claim\_digest\_mismatch  
observation\_digest\_missing  
claim\_digest\_missing  
mixed\_observation\_claim\_digests  
claim\_integrity\_policy\_mismatch  
claim\_integrity\_digest\_malformed

No open-ended mismatch string is permitted.

---

## **49\. Published Claim Digest Mismatch**

Occurs when:

recomputeDigest(actual supplied enriched claim body)  
    ≠  
enrichedClaim.claimIntegrityDigest

This means the claim body has changed or the published digest is corrupt.

---

## **50\. Observation Claim Digest Mismatch**

Occurs when:

observation.evaluatedClaimIntegrityDigest  
    ≠  
enrichedClaim.claimIntegrityDigest

This means the observation was prepared for a different claim state.

---

## **51\. Observation Digest Missing**

Occurs when an enriched claim evaluation receives an observation without:

evaluatedClaimIntegrityDigest

---

## **52\. Claim Digest Missing**

Occurs when an enriched claim lacks:

claimIntegrityDigest

or its required integrity-policy identifier.

---

## **53\. Mixed Observation Digests**

Occurs when observations targeting the same enriched claim carry different digests.

---

## **54\. Policy Mismatch**

Occurs when the claim or observation declares an unsupported integrity-policy version.

The v1 engine shall accept only:

governed-enriched-claim-integrity.v1

---

## **55\. Malformed Digest**

Occurs when the digest does not match:

^sha256:\[0-9a-f\]{64}$

---

# **Part X — Mismatch Behaviour**

## **56\. Behaviour Options**

### **Behaviour Option A — Throw and publish no evaluation**

Fail closed with a deterministic integrity error.

### **Behaviour Option B — Add a seventh evaluation outcome**

Extend the closed conflict-evaluation vocabulary with an integrity-failure outcome.

### **Behaviour Option C — Publish `evaluation_failed`**

Map integrity mismatch into the existing general failure state.

---

## **57\. Behaviour Decision**

> **Behaviour Option A — Throw and publish no Conflict Evaluation is selected.**

---

## **58\. Why Throw Is Selected**

### **Reason 1 — The input is not a valid evaluation candidate**

A changed claim body under an unchanged publication identity is malformed canonical input.

It is not a real-world conflict-evaluation state.

### **Reason 2 — No evaluation occurred**

Publishing:

evaluation\_failed

would imply a valid evaluation was attempted and failed operationally.

Here, the engine refuses to begin because its inputs are internally inconsistent.

### **Reason 3 — Existing fail-closed precedent**

The architecture already rejects structural inconsistencies such as:

* unknown claim references;  
* mismatched publication lineage;  
* malformed projection inputs.

Integrity mismatch belongs to the same class.

### **Reason 4 — Preserve the six-state contract**

Sprint 3.90’s six states describe valid evaluation-process outcomes.

No seventh state is needed.

### **Reason 5 — Prevent invalid publication**

No `ConflictEvaluation` or `GovernedConflictSet` identity should be minted for inputs that fail precondition integrity.

---

## **59\. No Vocabulary Reopening**

Sprint 3.90’s six-state vocabulary remains:

evaluated\_no\_conflict  
evaluated\_conflict\_found  
partially\_evaluated  
evaluation\_unavailable  
evaluation\_unsupported  
evaluation\_failed

Sprint 3.108 does not add an outcome.

The mismatch occurs before this vocabulary applies.

---

## **60\. Required Error Type**

A future implementation shall use a deterministic error type or error code equivalent to:

class EnrichedClaimIntegrityError extends Error {  
  readonly code: EnrichedClaimIntegrityMismatchCode;  
  readonly claimId: string;  
  readonly expectedDigest?: string;  
  readonly observedDigest?: string;  
}

The exact class name may follow repository conventions.

The closed error codes in Section 48 are binding.

---

## **61\. No Partial Evaluation**

If one enriched claim fails integrity verification:

* no per-cell evaluation runs for that claim;  
* no partial Conflict Evaluation is published for the same engine invocation;  
* no Conflict Set is published;  
* the caller receives the deterministic error.

The engine invocation is rejected as malformed in full.

---

# **Part XI — Worked Cassie Mutation Example**

## **62\. Baseline Enriched Claim**

Assume the real enriched contact claim contains:

claimId \=  
    claim:enriched:cassie-contact:001

baseClaimId \=  
    claim:base:cassie-contact:001

claimType \=  
    contact\_address\_lookup

status \=  
    available

factualValues \=  
    \["cassie@example.com"\]

sourceReferences \=  
    \["gmail:message:\<abc@example\>"\]

sourceAvailable \=  
    true

boundedComplete \=  
    true

enrichmentEvaluationId \=  
    enrichment-evaluation:cassie:001

The canonical v1 serialization produces, illustratively:

{  
  "policy":"governed-enriched-claim-integrity.v1",  
  "claimId":"claim:enriched:cassie-contact:001",  
  "baseClaimId":"claim:base:cassie-contact:001",  
  "claimType":"contact\_address\_lookup",  
  "status":"available",  
  "factualValues":\["cassie@example.com"\],  
  "sourceReferences":\["gmail:message:\<abc@example\>"\],  
  "sourceAvailable":true,  
  "boundedComplete":true,  
  "enrichmentEvaluationId":"enrichment-evaluation:cassie:001"  
}

Computed:

claimIntegrityDigest \=  
    sha256:\<baseline-digest\>

Each observation targeting this claim carries:

affectedClaimId \=  
    claim:enriched:cassie-contact:001

evaluatedClaimIntegrityDigest \=  
    sha256:\<baseline-digest\>

---

## **63\. Status Mutation**

The existing mutation proof changes:

status:  
    available  
        ↓  
    unsupported

while retaining:

claimId  
claimIntegrityDigest  
observations

The conflict engine recomputes:

sha256:\<status-mutated-digest\>

Comparison:

recomputed:  
    sha256:\<status-mutated-digest\>

published:  
    sha256:\<baseline-digest\>

Result:

published\_claim\_digest\_mismatch

The engine throws before per-cell evaluation.

No Conflict Evaluation is published.

---

## **64\. Factual-Value Mutation**

The existing mutation proof changes:

factualValues:  
    \["cassie@example.com"\]  
        ↓  
    \["corrupt@example.invalid"\]

while retaining:

claimId  
claimIntegrityDigest  
observations

The conflict engine recomputes:

sha256:\<factual-value-mutated-digest\>

Comparison:

recomputed:  
    sha256:\<factual-value-mutated-digest\>

published:  
    sha256:\<baseline-digest\>

Result:

published\_claim\_digest\_mismatch

The engine throws.

The unchanged observations also continue to carry:

sha256:\<baseline-digest\>

That confirms they were not prepared for the mutated body.

---

## **65\. Observation Mutation**

If the claim remains unchanged but an observation’s:

evaluatedClaimIntegrityDigest

is altered, the engine compares:

observation digest  
    ≠  
claim digest

Result:

observation\_claim\_digest\_mismatch

The engine throws before evaluation.

---

## **66\. Expected Future Mutation-Proof Result**

After implementation, the existing:

runEnrichedClaimMutationProof()

shall no longer report silently accepted mutations.

Its future result shall show, directly or through equivalent deterministic assertions:

baseline completes

status mutation  
    rejected before evaluation

factual-value mutation  
    rejected before evaluation

The function should continue to use the real engine.

It shall not be replaced with a digest unit test pretending to prove end-to-end coupling.

---

# **Part XII — Publication Identity**

## **67\. Digest Is Not a New Claim Identity**

The enriched claim retains its existing:

claimId

The digest is a body-integrity commitment for that publication.

It is not a competing publication identity.

---

## **68\. Existing Claim ID Construction**

If the current enriched `claimId` is already derived from the full canonical body, the digest may be mathematically related to that identity.

It remains separately required because:

* observations need an explicit claim-state commitment;  
* the engine needs a closed integrity-policy version;  
* claim ID construction may include publication context beyond the protected evaluation body;  
* an opaque claim ID alone does not state which body fields the observation commits to.

---

## **69\. Enriched Claim Set Identity**

The `EnrichedGovernedClaimSet` identity body shall include the enriched claims, including their:

claimIntegrityDigest

Changing a claim digest shall change:

enrichedGovernedClaimSetId

under existing deterministic identity rules.

---

## **70\. Enrichment Evaluation Identity**

The enrichment evaluation shall record or reference the generated claim-integrity digests in its per-claim outcomes.

Changing a digest shall change:

enrichmentEvaluationId

if the digest is part of the evaluation publication body.

The implementation sprint shall verify this against current identity construction.

---

## **71\. Observation Identity**

A `GovernedSourceObservation` publication identity shall include:

evaluatedClaimIntegrityDigest

Changing its claim-state commitment shall change the observation identity.

---

## **72\. Conflict Evaluation Identity**

A valid Conflict Evaluation need not duplicate every claim digest as a top-level field if the evaluated Claim Set and source-observation identities already commit to them.

However, its canonical identity body shall include:

* evaluated Claim Set reference;  
* source publication references;  
* evaluated claim IDs.

The integrity checks must occur before that identity is minted.

---

# **Part XIII — Base Claim Behaviour**

## **73\. Scope of Sprint 3.108**

The selected correction applies to:

claimSetKind \= "enriched"

It does not introduce a new digest requirement for:

claimSetKind \= "base"

---

## **74\. Why Base Is Excluded**

The proven defect concerns mutation after evidence enrichment, where:

* status;  
* factual values;  
* source references;  
* evidence completeness

have been added or changed.

Base claims remain governed by their existing immutable publication identities and conflict linkage.

A future audit may determine whether the same explicit digest mechanism should be generalized.

Sprint 3.108 does not assume that result.

---

## **75\. No Synthetic Base Digest**

Do not populate:

evaluatedClaimIntegrityDigest

for base observations using:

* claim ID;  
* empty digest;  
* base Claim Set ID;  
* arbitrary placeholder.

Base and enriched observation inputs shall remain structurally distinguishable.

---

# **Part XIV — Compatibility With Prior Decisions**

## **76\. Sprint 3.90 — Conflict Architecture**

**Not reopened.**

Preserved:

* closed three-class conflict taxonomy;  
* strict claim linkage;  
* dedicated conflict engine;  
* source-owned observations;  
* six-state evaluation vocabulary;  
* restrict-don’t-adjudicate;  
* no selected source owner.

Sprint 3.108 adds a pre-evaluation integrity requirement.

It does not alter conflict meaning.

---

## **77\. Sprint 3.94 — Per-Cell Evaluation**

**Not reopened.**

Per-cell evaluation remains:

each eligible claimId  
    ×  
each requested conflict class

The digest check occurs before those cells are evaluated.

It does not change:

* eligibility;  
* conflict comparison;  
* ineligible-claim handling;  
* evaluation outcomes.

---

## **78\. Sprint 3.103 — Enrichment**

**Not reopened.**

The enrichment engine remains responsible for:

* enriched claim body;  
* enriched status;  
* factual values;  
* source references;  
* `baseClaimId`;  
* enriched Claim Set.

Sprint 3.108 adds an integrity digest over that already-governed body.

---

## **79\. Sprint 3.106/3.107 — Discriminated Claim Sets**

**Not reopened.**

The conflict engine continues to accept:

claimSetKind \= "base"  
claimSetKind \= "enriched"

under truthful identities.

The digest requirement applies conditionally to the enriched variant.

No ID alias is reintroduced.

---

## **80\. Composer Option A**

**Not reopened.**

The projection composer:

* receives only completed valid conflict publications;  
* validates lineage;  
* passes through upstream identities;  
* aggregates effective status.

It does not compute or repair claim-integrity digests.

It does not compare raw observations as the primary integrity owner.

---

# **Part XV — Responsibility Audit**

## **81\. Binding Responsibility Table**

| Question | Binding answer |
| ----- | ----- |
| Who creates `claimIntegrityDigest`? | Evidence-to-Claim Enrichment Stage |
| What does it identify? | The immutable canonical enriched-claim state protected for conflict evaluation |
| Who creates `evaluatedClaimIntegrityDigest`? | Governed source-observation publisher |
| Where does its value come from? | The target enriched claim’s published `claimIntegrityDigest` |
| Who verifies the digest? | Conflict engine |
| When is it verified? | Before per-cell evaluation |
| Does the digest replace `claimId`? | No |
| Are both ID and digest required? | Yes, for enriched evaluation |
| Is SHA-256 binding? | Yes |
| Is the policy versioned? | Yes |
| Does status participate? | Yes |
| Do factual values participate? | Yes |
| Do source references participate? | Yes |
| Does provenance participate? | Yes |
| Does source availability participate? | Yes |
| Does bounded completeness participate? | Yes |
| Does a mismatch create a conflict outcome? | No |
| Does a mismatch throw? | Yes |
| Is a Conflict Evaluation published after mismatch? | No |
| Is the six-state vocabulary changed? | No |
| Does conflict evaluation derive observations from claims? | No |
| Does the composer own this check? | No |
| Does this reopen per-cell evaluation? | No |
| Does this reopen discriminated claim sets? | No |
| Does this authorize implementation? | No |

**Decision:** Responsibility Audit passes.

---

# **Part XVI — Prohibited Hedge Language**

## **82\. Prohibited Terms**

The completed contract shall not use unresolved language such as:

could  
might  
perhaps  
potentially  
ideally  
where appropriate  
as needed  
reuse where practical  
implementation may choose  
some kind of hash  
an appropriate digest  
wherever validation belongs  
probably  
likely  
equivalent mechanism  
TBD

for decisions governed here.

---

## **83\. Required Language**

Use:

shall  
shall not  
must  
must not  
is  
is not  
Selected  
Rejected  
Required  
Prohibited

The contract shall state:

* Option A is selected;  
* SHA-256 is selected;  
* the enrichment stage owns the claim digest;  
* observations carry the same digest;  
* the conflict engine verifies it;  
* mismatch throws before evaluation;  
* the six-state vocabulary remains unchanged;  
* the composer does not own the check;  
* implementation is not authorized.

---

# **Part XVII — Explicit Non-Decisions**

## **84\. Out of Scope**

Sprint 3.108 does not decide:

* digital signatures;  
* post-quantum signatures;  
* malicious coordinated rewriting of claim and digest;  
* persistent database verification;  
* external audit-store schema;  
* user-interface presentation;  
* base-claim digest generalization;  
* source-attestation signatures;  
* conflict-observation generation from factual values;  
* production `/api/chat` wiring;  
* promotion.

---

# **Part XVIII — No-Implementation Statement**

## **85\. No Implementation Authorized**

> **Sprint 3.108 authorizes no code change, type change, hashing implementation, observation change, conflict-engine change, projection change, integration, or production modification.**

A future sprint shall implement this contract.

The next permitted sprint is:

> **Sprint 3.109 — Enrichment Integrity-Coupling Implementation**

---

# **Part XIX — Future Implementation Requirements**

## **86\. Required Enrichment Changes**

Sprint 3.109 shall:

1. define the v1 canonical claim-integrity body;  
2. define deterministic canonical serialization;  
3. implement SHA-256 digest construction;  
4. add `claimIntegrityPolicyId`;  
5. add `claimIntegrityDigest`;  
6. incorporate them into enriched claim publication;  
7. include digest references in enrichment evaluation outcomes;  
8. update deterministic identity construction;  
9. update fixtures and tests.

---

## **87\. Required Observation Changes**

Sprint 3.109 shall:

1. add conditional `evaluatedClaimIntegrityDigest`;  
2. require it for enriched claim observations;  
3. prohibit it for base observations unless separately governed;  
4. include it in observation identity construction;  
5. update all enriched observation constructors;  
6. fail closed on malformed or unsupported digest policy.

---

## **88\. Required Conflict-Engine Changes**

Sprint 3.109 shall:

1. detect `claimSetKind`;  
2. leave base behaviour unchanged;  
3. recompute every enriched claim digest;  
4. validate the published claim digest;  
5. validate each observation digest;  
6. reject mixed observation digests;  
7. perform checks before per-cell evaluation;  
8. throw deterministic integrity errors;  
9. publish no evaluation after mismatch;  
10. preserve all existing conflict semantics.

---

## **89\. Required Mutation Proof**

Sprint 3.109 shall rerun the real:

runEnrichedClaimMutationProof()

Required:

baseline evaluation completes  
status mutation is rejected  
factual-value mutation is rejected

The proof shall call the real conflict engine.

---

## **90\. Required Negative Tests**

Test:

missing claim digest  
malformed claim digest  
wrong policy ID  
missing observation digest  
wrong observation digest  
mixed observation digests  
changed status  
changed factual values  
changed source references  
changed provenance  
changed bounded completeness

All shall fail before evaluation.

---

## **91\. Required Positive Tests**

Test:

* unchanged enriched claim;  
* correctly coupled observations;  
* multiple observations carrying the same digest;  
* no-conflict evaluation;  
* conflict-found evaluation;  
* unsupported conflict class;  
* base Claim Set evaluation unchanged;  
* deterministic replay.

---

## **92\. Required No-Outcome Test**

For every integrity mismatch prove:

ConflictEvaluation  
    not published

GovernedConflictSet  
    not published

Do not map the error to:

evaluation\_failed

---

## **93\. Required Composer Check**

Confirm the projection composer remains unchanged unless a purely mechanical type migration is required.

It shall not become the primary digest verifier.

Any proposed composer semantic change requires separate authority.

---

# **Part XX — Full Validation**

## **94\. Documentation-Sprint Validation**

Run:

npm test  
npm run build  
npm run lint  
npm run typecheck  
git diff \--check

No exception applies.

---

## **95\. Repository Search**

Confirm:

1. no existing canonical claim-integrity digest already owns this role;  
2. no current observation field already carries equivalent meaning;  
3. no current conflict-engine check recomputes claim body identity;  
4. the mutation remains reproducible before implementation;  
5. no code file changed during Sprint 3.108.

If repository evidence contradicts the contract, stop.

Return:

> **Governance Review Incomplete**

---

# **Part XXI — Completion Report**

## **96\. Repository Precondition**

Report:

* repository;  
* branch;  
* starting commit;  
* working-tree state;  
* required documents;  
* required source files;  
* current mutation outputs;  
* current input shapes;  
* current absence of integrity coupling.

---

## **97\. Options Decision**

Report:

Option A — Selected  
Option B — Rejected  
Option C — Rejected as primary correction  
Option D — Rejected

Include the specific structural reasoning for each.

---

## **98\. Selected Fields**

Report:

claimIntegrityPolicyId  
claimIntegrityDigest  
evaluatedClaimIntegrityDigest

State ownership and requiredness.

---

## **99\. Canonical Digest Body**

List every real enriched-claim field included in the v1 canonical body.

Do not use only the semantic names from this specification if current code uses different exact names.

---

## **100\. Algorithm Decision**

State:

policy \=  
governed-enriched-claim-integrity.v1

algorithm \=  
SHA-256

encoding \=  
sha256:\<64 lowercase hexadecimal characters\>

---

## **101\. Verification Decision**

State:

> Verification occurs inside the conflict engine before per-cell evaluation.

---

## **102\. Mismatch Decision**

State:

> An integrity mismatch throws a deterministic pre-evaluation error. No Conflict Evaluation or Governed Conflict Set is published. Sprint 3.90’s six-state vocabulary remains unchanged.

---

## **103\. Worked Mutation Example**

Include the complete status-mutation and factual-value-mutation walkthrough.

State exactly what is recomputed, what is compared, and why each fails.

---

## **104\. Prior-Contract Compatibility**

Report compatibility with:

Sprint 3.90  
Sprint 3.94  
Sprint 3.103  
Sprint 3.106  
Sprint 3.107  
Composer Option A

---

## **105\. Responsibility Audit**

Include the complete table from Section 81\.

---

## **106\. No-Implementation Statement**

State:

> Sprint 3.108 authorizes no implementation or production integration.

---

## **107\. Validation Results**

Report:

npm test  
npm run build  
npm run lint  
npm run typecheck  
git diff \--check

---

## **108\. Files Changed**

Expected:

docs/SPRINT-3.108-GOVERNED-ENRICHMENT-INTEGRITY-COUPLING-CONTRACT.md

only.

---

## **109\. Next Step**

Expected:

> **Sprint 3.109 — Enrichment Integrity-Coupling Implementation**

---

# **Part XXII — Recommendation Gate**

## **110\. Permitted Final Recommendation**

The final line shall be exactly one:

> **Governed Contract Complete**

or:

> **Governance Review Incomplete**

No other wording is permitted.

---

## **111\. Governed Contract Complete**

Use only if:

* the mutation gap is reconfirmed;  
* all named options are independently evaluated;  
* Option A is selected;  
* the canonical digest body is defined;  
* SHA-256 is selected;  
* digest ownership is assigned;  
* observation coupling is mandatory;  
* verification location is explicit;  
* mismatch behaviour is explicit;  
* the six-state vocabulary remains closed;  
* Composer Option A remains intact;  
* per-cell evaluation remains intact;  
* discriminated claim sets remain intact;  
* the worked example is complete;  
* no implementation is authorized;  
* full validation passes.

---

## **112\. Governance Review Incomplete**

Use if:

* observation and claim coupling remains informal;  
* the digest body remains unspecified;  
* hashing algorithm remains open;  
* verification location is ambiguous;  
* mismatch may be silently tolerated;  
* mismatch is mapped to an unspecified outcome;  
* observation derivation and claim integrity are conflated;  
* the composer is given primary ownership;  
* prior contracts are silently reopened;  
* implementation is authorized;  
* full validation fails.

---

# **Part XXIII — Binding Summary**

## **113\. Corrected Integrity Chain**

Evidence-to-Claim Enrichment  
    ↓  
canonical enriched claim body  
    ↓  
claimIntegrityPolicyId \=  
    governed-enriched-claim-integrity.v1  
    ↓  
claimIntegrityDigest \=  
    sha256:\<canonical-body-digest\>  
    ↓  
EnrichedGovernedClaimSet

Governed observation construction  
    ↓  
affectedClaimId  
evaluatedClaimIntegrityDigest  
    ↓  
GovernedSourceObservation

Conflict Engine  
    ↓  
recompute claim digest  
    ↓  
compare:  
    recomputed claim digest  
    published claim digest  
    observation claim digest  
    ↓  
all equal  
    → run per-cell evaluation

any mismatch  
    → throw deterministic integrity error  
    → publish no Conflict Evaluation  
    → publish no Conflict Set

---

## **114\. Binding Decisions**

Architecture  
    \=  
Option A — canonical enriched-claim state digest

Digest owner  
    \=  
Evidence-to-Claim Enrichment Stage

Observation coupling owner  
    \=  
Governed source-observation publisher

Verification owner  
    \=  
Conflict engine

Verification timing  
    \=  
before per-cell evaluation

Algorithm  
    \=  
SHA-256

Policy  
    \=  
governed-enriched-claim-integrity.v1

Claim field  
    \=  
claimIntegrityDigest

Observation field  
    \=  
evaluatedClaimIntegrityDigest

Mismatch handling  
    \=  
throw and publish no evaluation

Conflict outcome vocabulary  
    \=  
unchanged six-state vocabulary

Composer ownership  
    \=  
unchanged validate/aggregate-only

Per-cell conflict architecture  
    \=  
unchanged

Discriminated claim-set architecture  
    \=  
unchanged

Implementation authority  
    \=  
none

---

## **115\. Worked Mutation Result**

### **Status mutation**

published digest:  
    sha256:\<baseline\>

recomputed mutated digest:  
    sha256:\<status-mutated\>

result:  
    published\_claim\_digest\_mismatch

### **Factual-value mutation**

published digest:  
    sha256:\<baseline\>

recomputed mutated digest:  
    sha256:\<factual-value-mutated\>

result:  
    published\_claim\_digest\_mismatch

Both fail before evaluation.

---

## **116\. Governing Discipline**

bind immutable identity to immutable body  
bind observations to the exact body evaluated  
verify at the conflict trust boundary  
reject malformed publications before evaluation  
preserve source ownership  
preserve per-cell conflict semantics  
preserve closed evaluation outcomes  
keep the composer downstream  
do not infer  
do not adjudicate  
do not silently repair

The final line shall be exactly:

> **Governed Contract Complete**

or:

> **Governance Review Incomplete**

