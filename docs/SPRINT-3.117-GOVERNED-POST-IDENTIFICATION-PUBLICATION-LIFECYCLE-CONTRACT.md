# **Sprint 3.117 — Governed Post-Identification Publication Lifecycle Contract**

**Status:** Complete
**Sprint Type:** Governance Decision / Composition Correction Contract  
**Implementation Authority:** None  
**Production Integration:** Prohibited  
**Governing Trigger:** Sprint 3.116 — Entity Identification to Claim/Enrichment Composition Check  
**Direct Structural Precedents:** Sprints 3.85, 3.94, 3.106, and 3.108  
**Preserved Governing Contracts:** Sprints 3.89, 3.90, 3.103, and 3.112  
**Output Path:** `docs/SPRINT-3.117-GOVERNED-POST-IDENTIFICATION-PUBLICATION-LIFECYCLE-CONTRACT.md`

---

## **1\. Recommendation**

**Decision:** Approve this Governed Post-Identification Publication Lifecycle Contract.

Sprint 3.116 established, through real composition execution rather than architectural inference, that isolated Entity Identification and Evidence-to-Claim Enrichment are not presently composition-compatible.

The finding is not one missing field.

The evaluation identified seven `semantic_incompatibility` seams:

1. Entity Identification → claim parameter;  
2. Entity Identification → Governed Claim Set;  
3. Entity Identification → Enrichment;  
4. ambiguity → downstream chain;  
5. zero match → downstream chain;  
6. Entity lineage → projection;  
7. Entity result → conflict evaluation / full validated result.

It separately identified:

> `Entity identity → resolver = bounded_adapter_needed`

That eighth seam is structurally different.

The resolver can already correlate evidence against the real runtime `resolvedEntityReference`.

What is missing is authoritative ownership of that correlation.

Sprint 3.116 also proved a concrete publication-order defect:

governed-claim-set:2ae62f...

was published before:

entity-identification-evaluation:0ab153...

even though Sprint 3.112 already requires Entity Identification to occur before a fully parameterised Governed Claim Set is published.

The current architecture therefore cannot prove:

> this governed claim is the claim produced after this governed entity resolution.

It can only prove:

> this claim existed, and a later entity resolution also existed.

Those are not equivalent.

Sprint 3.116 further proved that the current Enrichment interface reduces the Entity Identification result to a bare:

entityId

inside:

claimParametersByClaimId

and loses:

entityIdentificationEvaluationId  
resolvedCandidateReference  
matchingBasis  
evidenceReference  
entity-identification provenance

The mutation proof demonstrated the consequence directly: a fabricated entity reference was silently accepted as an Enrichment parameter and merely produced insufficient coverage rather than a lineage-integrity rejection.

This contract closes those gaps by selecting:

> **Post-Identification Lifecycle Option A — defer parameter-dependent Governed Claim Set publication until Entity Identification has produced a governed terminal parameter-resolution result.**

For a unique resolution:

Claim Recognition  
    ↓  
Entity Identification  
    ↓  
Claim–Entity Association  
    ↓  
fully parameterised Governed Claim Set  
    ↓  
lineage-bearing Evidence-to-Claim Enrichment

For ambiguity, zero match, or unavailable entity evidence:

Claim Recognition  
    ↓  
Entity Identification  
    ↓  
governed Parameter Resolution Stop publication  
    ↓  
NO Governed Claim Set for the unresolved parameter-dependent claim  
    ↓  
NO Enrichment  
    ↓  
NO Conflict Evaluation for that claim

This contract authorizes no implementation.

---

# **Part I — Purpose**

## **2\. Purpose**

This contract governs one composition question:

> **After deterministic claim recognition establishes that a governed intent requires an entity parameter, how must Entity Identification, claim publication, Enrichment, and downstream lineage compose so that a claim cannot appear post-resolution unless the publication chain proves the resolution that produced it?**

It governs:

* publication ordering;  
* post-recognition/pre-Claim-Set lifecycle;  
* claim-to-entity association ownership;  
* unique-resolution progression;  
* ambiguity control flow;  
* zero-match control flow;  
* source-unavailable control flow;  
* Entity Identification lineage into Enrichment;  
* Entity Identification lineage into the Enriched Governed Claim Set;  
* Entity Identification lineage into projection;  
* conflict provenance compatibility;  
* validator-visible provenance;  
* resolver ownership;  
* fail-closed handoff integrity.

It does not govern:

* claim recognition grammar;  
* claim-type admission;  
* Entity Identification matching;  
* Entity Identification candidate construction;  
* first-token alias matching;  
* evidence acquisition;  
* Gmail parsing;  
* evidence publication;  
* Enrichment materiality rules;  
* conflict semantics;  
* conflict outcome vocabulary;  
* Composer Option A;  
* durable cross-exchange identity;  
* model reasoning;  
* production integration.

---

# **Part II — Repository Precondition**

## **3\. Standard Repository Precondition**

Before completing this governance sprint:

1. confirm the intended JARVIS repository;  
2. confirm the current branch;  
3. record the starting commit;  
4. record the working-tree state;  
5. confirm Sprint 3.116 exists and is complete;  
6. confirm its recommendation is:

> **Evaluation Complete**

7. confirm directly that its seam matrix contains the seven required `semantic_incompatibility` findings;  
8. confirm `Entity identity → resolver` is separately classified `bounded_adapter_needed`;  
9. confirm the current `GovernedClaimSet` contains no Entity Identification reference;  
10. confirm `ClaimEnrichmentEngineInput` contains no Entity Identification evaluation publication;  
11. confirm `claimParametersByClaimId` currently carries only:

Readonly\<Record\<string, {  
  readonly entityId: string;  
}\>\>

12. confirm the current Claim Boundary publishes its Claim Set before Entity Identification;  
13. confirm no authoritative production function currently owns the mapping from an Entity Identification result to a claim;  
14. confirm no governed stop publication currently prevents Claim Set publication after `ambiguous_multiple_matches`;  
15. confirm no governed stop publication currently prevents Claim Set publication after `unresolved_no_match`;  
16. confirm the existing resolver can mechanically correlate assertions against a runtime `resolvedEntityReference`;  
17. confirm no implementation of the decisions in this contract already exists.

Read completely:

docs/SPRINT-3.116-ENTITY-IDENTIFICATION-TO-CLAIM-ENRICHMENT-COMPOSITION-CHECK.md

docs/SPRINT-3.85-GOVERNED-CONVERSATIONAL-IDENTITY-CORRECTION-CONTRACT.md  
docs/SPRINT-3.94-GOVERNED-CLAIMS-AND-CONFLICTS-COMPOSITION-CORRECTION-CONTRACT.md  
docs/SPRINT-3.106-GOVERNED-ENRICHMENT-COMPOSITION-CORRECTION-CONTRACT.md  
docs/SPRINT-3.108-GOVERNED-ENRICHMENT-INTEGRITY-COUPLING-CONTRACT.md

docs/SPRINT-3.89-GOVERNED-CONVERSATIONAL-CLAIMS-BOUNDARY-CONTRACT.md  
docs/SPRINT-3.90-GOVERNED-CONVERSATIONAL-CONFLICTS-BOUNDARY-CONTRACT.md  
docs/SPRINT-3.103-GOVERNED-EVIDENCE-TO-CLAIM-ENRICHMENT-CONTRACT.md  
docs/SPRINT-3.112-GOVERNED-CONVERSATIONAL-ENTITY-IDENTIFICATION-AND-CLAIM-PARAMETER-CONTRACT.md

docs/CONSTITUTIONAL-PUBLICATION-PRINCIPLES.md  
docs/architecture/ROADMAP.md

Also inspect the current real implementations of:

claim-boundary-types.ts  
claim-boundary-engine.ts  
claim-boundary-publications.ts

entity-identification-types.ts  
entity-identification-engine.ts  
entity-identification-publications.ts

claim-enrichment-types.ts  
claim-enrichment-engine.ts  
claim-enrichment-publications.ts

conflict-boundary-types.ts  
conflict-boundary-engine.ts

projection-composer.ts  
input.ts  
validator.ts

If any premise materially differs from Sprint 3.116's evidence, stop.

Return:

> **Governance Review Incomplete**

Do not silently redesign the contract around a changed repository.

---

# **Part III — Governing Hierarchy**

## **4\. Governing Authority**

Apply:

1. JARVIS Engineering Constitution;  
2. JARVIS North Star;  
3. JARVIS Engineering Specification Standard;  
4. Constitutional Publication Principles;  
5. Roadmap;  
6. Sprint 3.89 — Claims Boundary;  
7. Sprint 3.90 — Conflicts Boundary;  
8. Sprint 3.103 — Evidence-to-Claim Enrichment;  
9. Sprint 3.112 — Entity Identification and Claim Parameter;  
10. Sprint 3.116 — composition evidence;  
11. current repository implementation;  
12. this contract.

This contract resolves composition responsibilities that the earlier contracts did not jointly specify.

It does not repeal their core decisions.

---

# **Part IV — Binding Finding**

## **5\. Sprint 3.116 Finding**

The current sequence is effectively:

recognition  
    ↓  
Claim Boundary Evaluation  
    ↓  
Governed Claim Set published  
    ↓  
Entity Identification  
    ↓  
resolvedEntityReference  
    ↓  
non-authoritative mapping probe  
    ↓  
claimParametersByClaimId.entityId  
    ↓  
Enrichment

That ordering is incompatible with Sprint 3.112.

Sprint 3.112 requires:

recognised governed intent  
    ↓  
Entity Identification  
    ↓  
resolved entity parameter  
    ↓  
Claim Boundary completes publication  
    ↓  
fully parameterised Governed Claim Set  
    ↓  
Enrichment

The correction therefore cannot be:

> add another optional entity ID field to Enrichment.

The publication lifecycle itself must be corrected.

---

## **6\. Immutable Historical Publications Remain Immutable**

No already-published:

ClaimBoundaryEvaluation  
EntityIdentificationEvaluation  
GovernedClaimSet  
EvidenceToClaimEnrichmentEvaluation  
EnrichedGovernedClaimSet

may be mutated in place.

The correction governs the order in which future publications are constructed.

It does not authorize rewriting historical publications.

---

# **Part V — Central Decision 1: Publication Ordering**

## **7\. Mutually Exclusive Options**

### **Option A — Deferred Governed Claim Set Publication**

Claim recognition may publish its recognition evaluation before Entity Identification.

For a parameter-dependent claim, however, the `GovernedClaimSet` is not published until required Entity Identification has reached a governed terminal result.

Where Entity Identification uniquely resolves:

recognition  
    ↓  
ClaimBoundaryEvaluation  
    ↓  
EntityIdentificationEvaluation(resolved)  
    ↓  
ClaimEntityAssociation  
    ↓  
GovernedClaimSet

Where it does not uniquely resolve:

recognition  
    ↓  
ClaimBoundaryEvaluation  
    ↓  
EntityIdentificationEvaluation(non-resolved)  
    ↓  
ParameterResolutionStop

No parameter-dependent `GovernedClaimSet` is published.

### **Decision**

> **Selected.**

---

### **Option B — Preserve Existing Base Claim Set and Add Post-Resolution Wrapper**

Continue publishing the existing pre-resolution `GovernedClaimSet`.

After Entity Identification, publish a new object wrapping:

baseGovernedClaimSetId  
\+  
EntityIdentificationEvaluation  
\+  
resolved parameter

and treat that wrapper as the post-resolution claim input.

### **Decision**

> **Rejected.**

### **Structural Reason 1 — It preserves the defect Sprint 3.116 proved**

The pre-resolution object would still be named and typed as a `GovernedClaimSet` despite lacking a required governed parameter.

The architecture would therefore contain two competing notions of a claim set:

GovernedClaimSet

and:

actually-complete-post-resolution-GovernedClaimSet-wrapper

That weakens rather than clarifies publication meaning.

### **Structural Reason 2 — It contradicts Sprint 3.112's ordering**

Sprint 3.112 already defines Entity Identification as occurring:

> before a fully parameterised Governed Claim Set is published.

A wrapper would preserve publication before resolution and then compensate for it later.

### **Structural Reason 3 — It creates permanent dual lineage**

Every downstream stage would need to distinguish:

base claim-set identity

from:

post-resolution wrapper identity

even though the former never represented a complete parameterised claim.

### **Structural Reason 4 — It increases alias risk**

A downstream consumer could accidentally consume the pre-resolution set.

Deferred publication removes that invalid state from the admissible downstream lifecycle.

---

## **8\. Binding Publication Ordering**

For claims requiring Entity Identification:

ClaimBoundaryEvaluation

may exist before resolution.

The parameter-dependent:

GovernedClaimSet

shall not.

The binding order is:

ClaimBoundaryEvaluation  
    ↓  
EntityIdentificationEvaluation  
    ↓  
ClaimEntityAssociation  
    ↓  
GovernedClaimSet

for successful resolution.

This is a sequencing correction.

It does not change Sprint 3.89's recognition logic.

---

# **Part VI — Recognition Publication vs Claim Set Publication**

## **9\. Claim Boundary Evaluation Remains Valid Before Resolution**

Sprint 3.89 recognition remains responsible for determining:

* recognised intent;  
* claim type;  
* extracted parameter;  
* segment;  
* parameter requirement;  
* recognition outcome.

Its evaluation may therefore be published before Entity Identification.

This publication means:

> the operator's request has been deterministically recognised.

It does not mean:

> every required claim parameter has been resolved.

---

## **10\. Parameter-Dependent Claim Set Gate**

Where a recognised claim requires Entity Identification, Claim Set publication is gated by the Entity Identification terminal result.

The gate is:

resolved  
    → Claim Set publication permitted

ambiguous\_multiple\_matches  
    → Claim Set publication prohibited

unresolved\_no\_match  
    → Claim Set publication prohibited

entity\_source\_unavailable  
    → Claim Set publication prohibited

No fifth Entity Identification outcome is created.

---

# **Part VII — Central Decision 2: Claim Association Ownership**

## **11\. Mutually Exclusive Owners**

Possible owners are:

### **Option A — Entity Identification owns claim association**

Rejected.

Entity Identification determines:

> which evidence-backed entity candidate satisfies the unresolved entity reference.

It does not determine:

> which governed claim publication should consume that result.

Giving it claim ownership would couple entity matching to Claim Boundary publication semantics.

---

### **Option B — Enrichment owns claim association**

Rejected.

Enrichment occurs after the fully parameterised Governed Claim Set.

If Enrichment decided which claim the entity belonged to, Claim Set publication would again occur without a governed parameter association.

This reproduces the Sprint 3.116 defect.

---

### **Option C — Explicit Claim–Entity Association Step**

Selected.

A separate deterministic linking step owns the statement:

> this Entity Identification evaluation resolves this extracted parameter for this recognised claim.

---

## **12\. Selected Association Architecture**

> **Claim Association Option C — explicit deterministic Claim–Entity Association publication.**

This is not another entity resolver.

It performs no matching.

It consumes only already-governed publications.

Conceptually:

ClaimBoundaryEvaluation  
    \+  
EntityIdentificationEvaluation(resolved)  
    ↓  
Claim–Entity Association

---

## **13\. Required Claim–Entity Association Publication**

The future implementation shall create a distinct immutable publication equivalent to:

interface GovernedClaimEntityAssociation {  
  readonly claimEntityAssociationId: string;

  readonly schemaVersion: "1";

  readonly threadId: string;  
  readonly requestId: string;  
  readonly exchangeId: string;

  readonly claimBoundaryEvaluationId: string;  
  readonly recognizedIntentReference: string;

  readonly segmentId: string;  
  readonly parameterName: "personName";  
  readonly unresolvedParameterValue: string;

  readonly entityIdentificationRulesetId: string;  
  readonly entityIdentificationEvaluationId: string;

  readonly resolvedEntityReference: string;  
  readonly resolvedCandidateReference: string;  
  readonly matchingBasis:  
    | "exact\_governed\_display\_name\_match"  
    | "governed\_first\_token\_display\_name\_alias\_match";

  readonly evidenceReference: string;  
  readonly provenanceReference: string;

  readonly createdAt: string;  
}

Exact implementation naming may vary.

The semantic fields may not.

---

## **14\. Association Preconditions**

A Claim–Entity Association may be published only where:

EntityIdentificationEvaluation.outcome \=== "resolved"

and all of the following agree:

threadId  
requestId  
exchangeId  
claimBoundaryEvaluationReference  
recognizedIntentReference  
segmentId / extracted parameter

Any mismatch fails closed.

No association is published for:

ambiguous\_multiple\_matches  
unresolved\_no\_match  
entity\_source\_unavailable

---

## **15\. Association Identity**

`claimEntityAssociationId` shall be a distinct content-derived publication identity.

It shall not equal or alias:

claimBoundaryEvaluationId  
entityIdentificationEvaluationId  
resolvedEntityReference  
resolvedCandidateReference  
governedClaimSetId  
claimId  
enrichmentEvaluationId

The association publication records a relationship.

It is not an entity.

It is not a claim.

It is not evidence.

---

# **Part VIII — Central Decision 3: Non-Resolved Control Flow**

## **16\. Mutually Exclusive Options**

### **Option A — Publish the Claim Set anyway with unsupported status**

Rejected.

This would create a parameter-dependent claim publication despite the required parameter not being truthfully resolved.

It would also make:

unsupported because claim recognition failed

indistinguishable from:

recognition succeeded but required entity resolution did not

Those are different governance facts.

---

### **Option B — Stop Claim Set publication and publish a governed lifecycle-stop result**

Selected.

The recognised intent remains recorded.

The Entity Identification result remains recorded.

But the parameter-dependent Claim Set does not yet exist.

---

### **Option C — Publish a special unresolved Claim Set subtype**

Rejected.

This would reopen the Claim Boundary publication vocabulary and require every downstream consumer to understand partially parameterised claims.

The existing architecture does not need that complexity.

The failure occurs before Claim Set publication and should remain there.

---

## **17\. Selected Non-Resolved Control Flow**

> **Parameter Resolution Stop Option B — no parameter-dependent Governed Claim Set is published unless Entity Identification resolves uniquely.**

A new governed control publication shall record why progression stopped.

---

## **18\. Governed Parameter Resolution Stop Publication**

The future implementation shall define a publication equivalent to:

interface GovernedParameterResolutionStop {  
  readonly parameterResolutionStopId: string;

  readonly schemaVersion: "1";

  readonly threadId: string;  
  readonly requestId: string;  
  readonly exchangeId: string;

  readonly claimBoundaryEvaluationId: string;  
  readonly recognizedIntentReference: string;

  readonly segmentId: string;  
  readonly parameterName: "personName";  
  readonly unresolvedParameterValue: string;

  readonly entityIdentificationRulesetId: string;  
  readonly entityIdentificationEvaluationId: string;

  readonly reason:  
    | "clarification\_required"  
    | "unsupported\_no\_match"  
    | "entity\_source\_unavailable";

  readonly candidateReferences: readonly string\[\];  
  readonly evidenceReferences: readonly string\[\];

  readonly claimSetPublicationPermitted: false;

  readonly createdAt: string;  
}

---

## **19\. Outcome Mapping**

The mapping is closed:

ambiguous\_multiple\_matches  
    → clarification\_required

unresolved\_no\_match  
    → unsupported\_no\_match

entity\_source\_unavailable  
    → entity\_source\_unavailable

No model determines this mapping.

No ranking determines this mapping.

No fallback identity determines this mapping.

---

# **Part IX — Compatibility With Sprint 3.89 Unsupported Vocabulary**

## **20\. Claim Unsupported Is Not Reopened**

Sprint 3.89's:

unsupported

remains a Claim Boundary outcome/state.

This contract does not add a new Claim status.

Instead:

unsupported\_no\_match

is a pre-Claim-Set lifecycle-stop reason.

The distinction is:

Sprint 3.89 unsupported:  
    the claim cannot be admitted under the Claim Boundary.

Sprint 3.117 unsupported\_no\_match:  
    the claim intent was recognised,  
    but its required entity parameter could not be resolved  
    from admitted governed evidence.

Therefore no Claim Boundary status vocabulary is extended.

---

## **21\. Ambiguity Is Clarification, Not Unsupported Claim Evidence**

`ambiguous_multiple_matches` maps to:

clarification\_required

because the claim itself is recognised and potentially supportable.

What is missing is a unique entity selection.

No candidate may be selected automatically.

---

# **Part X — Fully Parameterised Governed Claim Set**

## **22\. Publication Preconditions**

A parameter-dependent `GovernedClaimSet` may be constructed only from:

ClaimBoundaryEvaluation  
\+  
GovernedClaimEntityAssociation

where all lineage fields agree.

---

## **23\. Required New Claim-Set Lineage**

A parameterised `GovernedClaimSet` shall carry a reference to the association that authorised its resolved parameter.

At minimum:

claimEntityAssociationReferences

shall be present as a deterministic collection.

For a single contact-address claim:

claimEntityAssociationReferences:  
  \[\<claimEntityAssociationId\>\]

Where a Claim Set contains claims that require no entity resolution, no artificial association is created.

---

## **24\. Claim Parameter Publication**

The resolved parameter shall be attached to the claim through the association lineage rather than reconstructed independently later.

The Claim Set must make it possible to prove:

claim  
    ↓  
claimEntityAssociationId  
    ↓  
entityIdentificationEvaluationId  
    ↓  
resolvedCandidateReference  
    ↓  
evidenceReference

---

# **Part XI — Central Decision 4: Lineage-Bearing Enrichment Handoff**

## **25\. Current Defect**

Sprint 3.116 proved that:

claimParametersByClaimId:  
  Record\<string, { entityId: string }\>

is insufficient.

It transmits only the resolved value.

It does not transmit the authority for that value.

The distinction is constitutional:

entityId

is data.

the governed publication proving why this entityId belongs to this claim

is lineage.

Both are required.

---

## **26\. Selected Enrichment Handoff**

Sprint 3.103's existing lineage architecture shall be extended.

It shall not be replaced.

The future `ClaimEnrichmentEngineInput` shall consume the parameter through a lineage-bearing governed parameter object.

The binding shape is equivalent to:

interface GovernedClaimParameterBinding {  
  readonly claimId: string;  
  readonly claimEntityAssociationId: string;

  readonly entityIdentificationRulesetId: string;  
  readonly entityIdentificationEvaluationId: string;

  readonly resolvedEntityReference: string;  
  readonly resolvedCandidateReference: string;

  readonly matchingBasis:  
    | "exact\_governed\_display\_name\_match"  
    | "governed\_first\_token\_display\_name\_alias\_match";

  readonly evidenceReference: string;  
  readonly provenanceReference: string;  
}

---

## **27\. ClaimEnrichmentEngineInput Change**

The existing bare:

claimParametersByClaimId

shall not remain an independently trusted entity-ID map for parameter-dependent claims.

It shall be replaced or structurally upgraded into:

claimParameterBindingsByClaimId

whose values carry the governed binding above.

Exact implementation naming may follow repository conventions.

The semantics are binding.

---

## **28\. Required Enrichment Validation**

Before Enrichment evaluates evidence for a parameter-dependent claim, it shall verify:

1. the claim exists in `baseClaimSet`;  
2. the Claim Set references the supplied `claimEntityAssociationId`;  
3. the association targets that claim's recognised segment/parameter;  
4. the association references the supplied `entityIdentificationEvaluationId`;  
5. the Entity Identification evaluation outcome was `resolved`;  
6. `resolvedEntityReference` matches the association;  
7. `resolvedCandidateReference` matches the association;  
8. `matchingBasis` matches the association;  
9. `evidenceReference` matches the association;  
10. `provenanceReference` matches the association;  
11. thread/request/exchange lineage agrees.

Any mismatch fails closed.

---

## **29\. Fail-Closed Behaviour**

A lineage mismatch shall throw before claim enrichment is evaluated.

It shall not become:

retained\_insufficient\_coverage

and shall not be converted into an ordinary evidence outcome.

This directly closes Sprint 3.116's mutation finding.

A fabricated entity reference is not:

> insufficient evidence.

It is:

> invalid governed lineage.

Those states shall never be conflated.

---

# **Part XII — Enrichment Publication Lineage**

## **30\. Evidence-to-Claim Enrichment Evaluation**

Sprint 3.103's existing publication shall be extended to retain Entity Identification lineage.

At minimum it shall carry:

claimEntityAssociationReferences  
entityIdentificationEvaluationReferences

as deterministic collections covering the parameter-dependent claims it evaluated.

---

## **31\. Per-Claim Enrichment Record**

For each parameter-dependent claim, the enrichment record shall retain:

claimEntityAssociationId  
entityIdentificationEvaluationId  
resolvedEntityReference  
resolvedCandidateReference  
matchingBasis  
entityIdentificationEvidenceReference  
entityIdentificationProvenanceReference

These fields record parameter provenance.

They do not replace the existing:

consultedSourceReferences  
admittedSourceReferences  
rejectedSourceReferences

which continue to record evidence-to-claim enrichment activity.

---

## **32\. Distinct Evidence Responsibilities**

The architecture shall preserve:

Entity Identification evidence:  
    evidence proving which entity the unresolved name refers to.

Enrichment evidence:  
    evidence proving the factual value requested about that entity.

For Cassie:

"this source-qualified candidate uniquely matches Cassie"

is not the same proposition as:

"this email address is a governed contact-address fact for the resolved entity"

The two evidence lineages shall remain distinguishable.

---

# **Part XIII — Enriched Governed Claim Set**

## **33\. Required Lineage**

The `EnrichedGovernedClaimSet` shall extend its existing lineage with:

claimEntityAssociationReferences  
entityIdentificationEvaluationReferences

for all applicable parameter-dependent claims.

This extends Sprint 3.103.

It does not create a parallel enrichment architecture.

---

## **34\. Enriched Claim Integrity**

Sprint 3.108 remains binding.

The new Entity Identification lineage shall not be smuggled into mutable metadata outside the integrity boundary.

Where Entity Identification-derived parameter fields become part of the enriched claim's canonical governed state, the implementation sprint shall include them in the appropriate integrity-coupled canonical body or explicitly prove that the lineage is set-level rather than claim-state material.

That decision shall follow Sprint 3.108's existing content-integrity discipline.

It shall not weaken it.

---

# **Part XIV — Projection Lineage**

## **35\. Projection Requirement**

Sprint 3.116 proved the projection cannot recover Entity Identification lineage once Enrichment discards it.

The correction is upstream preservation plus projection aggregation.

The composer shall not derive entity identity.

It shall only carry already-governed references.

---

## **36\. Required Projection References**

The governed conversational projection shall include deterministic references equivalent to:

claimEntityAssociationReferences  
entityIdentificationEvaluationReferences

derived exclusively from the validated Enrichment/Claim Set lineage.

No candidate matching occurs in the composer.

No evidence interpretation occurs in the composer.

No entity parameter is created in the composer.

This remains compatible with Composer Option A.

---

# **Part XV — Conflict Evaluation**

## **37\. Sprint 3.90 Remains Binding**

Conflict evaluation continues to evaluate claims.

It does not perform Entity Identification.

It does not select candidates.

It does not repair parameter lineage.

---

## **38\. Entity Lineage Before Conflict Evaluation**

The enriched claims entering conflict evaluation shall already be backed by valid Entity Identification lineage where their parameters require it.

Conflict integrity remains responsible for:

> the enriched claim state evaluated is the state actually published.

Entity lineage is responsible for:

> the parameter inside that claim was supplied by the governed Entity Identification lifecycle.

Neither substitutes for the other.

---

## **39\. Conflict Finding Resolution**

This explicitly resolves Sprint 3.116's:

Entity result → conflict evaluation

`semantic_incompatibility`.

The conflict engine need not become an Entity Identification consumer.

The incompatibility is resolved by making valid parameter lineage a precondition of the enriched publication it receives.

---

# **Part XVI — Validator and Final Result**

## **40\. Validator Visibility**

The governed input supplied to model invocation shall preserve references sufficient for the deterministic validator to establish that a parameter-dependent factual claim originated from:

recognised intent  
    ↓  
Entity Identification  
    ↓  
Claim–Entity Association  
    ↓  
Governed Claim Set  
    ↓  
Enrichment  
    ↓  
Conflict Evaluation  
    ↓  
Projection

---

## **41\. Validator Responsibility**

The validator shall not redo Entity Identification.

It shall validate structural presence and consistency of the governed lineage presented to it.

A model response shall never be treated as validated where the factual claim depends on a parameter whose governed association is missing or inconsistent.

---

# **Part XVII — Resolver Ownership**

## **42\. Sprint 3.116 Bounded-Adapter Finding**

Sprint 3.116 proved separately:

Entity identity → resolver:  
    bounded\_adapter\_needed

A resolver parameterised with the runtime:

resolvedEntityReference

successfully correlated evidence without:

person:cassie

or another fixture-hardcoded identity.

Therefore the correlation mechanism itself is not a semantic incompatibility.

---

## **43\. Authoritative Resolver Owner**

> **Evidence-to-Claim Enrichment owns resolver invocation.**

The resolver is an Enrichment dependency.

It answers:

> Which governed factual assertions in the assembled evidence correspond to this already-governed resolved entity parameter?

It does not own:

* entity matching;  
* candidate selection;  
* claim association;  
* publication ordering.

---

## **44\. Resolver Input Authority**

The resolver shall receive its entity reference only from the validated:

GovernedClaimParameterBinding

associated with the claim being enriched.

It shall not receive an independently constructed entity ID.

Therefore:

Entity Identification  
    ↓  
Claim–Entity Association  
    ↓  
GovernedClaimParameterBinding  
    ↓  
Enrichment-owned resolver

is the only authorised path.

This resolves the `bounded_adapter_needed` finding separately from the seven semantic incompatibilities.

---

# **Part XVIII — Seam-by-Seam Resolution**

## **45\. Binding Resolution Matrix**

| Sprint 3.116 seam | Finding | Sprint 3.117 decision | Independently resolved? |
| ----- | ----- | ----- | ----- |
| Extracted parameter → Entity Identification | compatible | unchanged | Already compatible |
| Entity Identification → claim parameter | semantic\_incompatibility | explicit Claim–Entity Association publication | Yes |
| Entity Identification → Governed Claim Set | semantic\_incompatibility | defer Claim Set publication until unique resolution | Yes |
| Entity Identification → Enrichment | semantic\_incompatibility | lineage-bearing `GovernedClaimParameterBinding` | Yes |
| Ambiguity → downstream chain | semantic\_incompatibility | `ParameterResolutionStop: clarification_required`; no Claim Set | Yes |
| Zero match → downstream chain | semantic\_incompatibility | `ParameterResolutionStop: unsupported_no_match`; no Claim Set | Yes |
| Entity lineage → projection | semantic\_incompatibility | Enrichment \+ Enriched Set \+ projection references | Yes |
| Entity identity → resolver | bounded\_adapter\_needed | Enrichment owns resolver; binding supplies entity reference | Yes, separately |
| Entity result → conflict evaluation | semantic\_incompatibility | valid Entity lineage becomes precondition of enriched claim publication | Yes |
| Full result → validator | semantic\_incompatibility | lineage propagated through projection/governed input | Yes |

No Sprint 3.116 finding is left implicit.

---

# **Part XIX — Worked Example: Cassie Unique Match**

## **46\. Input**

Operator asks:

> What's Cassie's email?

Claim recognition produces:

ClaimBoundaryEvaluation  
outcome: recognised

ExtractedParameter:  
    segmentId: segment:1  
    name: personName  
    value: Cassie

No parameter-dependent `GovernedClaimSet` exists yet.

---

## **47\. Entity Identification**

Assembled Gmail evidence contains:

senderDisplayName: Cassie Kozyrkov

Entity Identification produces:

EntityIdentificationEvaluation  
outcome: resolved

entityIdentificationEvaluationId:  
    entity-identification-evaluation:\<digest\>

resolvedEntityReference:  
    exchange-scoped-resolved-entity:\<digest\>

resolvedCandidateReference:  
    entity-identification-candidate:\<digest\>

matchingBasis:  
    governed\_first\_token\_display\_name\_alias\_match

evidenceReference:  
    google-gmail:message:\<resource\>

provenanceReference:  
    google-gmail:message:\<resource\>\#provenance

---

## **48\. Claim–Entity Association**

The linking stage verifies:

ClaimBoundaryEvaluation  
    ↔ same exchange  
EntityIdentificationEvaluation  
    ↔ same claim-boundary evaluation  
ExtractedParameter  
    ↔ same segment/personName/Cassie

It publishes:

GovernedClaimEntityAssociation

claimEntityAssociationId:  
    claim-entity-association:\<digest\>

claimBoundaryEvaluationId:  
    claim-boundary-evaluation:\<digest\>

entityIdentificationEvaluationId:  
    entity-identification-evaluation:\<digest\>

resolvedEntityReference:  
    exchange-scoped-resolved-entity:\<digest\>

resolvedCandidateReference:  
    entity-identification-candidate:\<digest\>

matchingBasis:  
    governed\_first\_token\_display\_name\_alias\_match

evidenceReference:  
    google-gmail:message:\<resource\>

provenanceReference:  
    google-gmail:message:\<resource\>\#provenance

---

## **49\. Governed Claim Set**

Only now may the parameter-dependent Claim Set be published:

GovernedClaimSet

claimBoundaryEvaluationId:  
    claim-boundary-evaluation:\<digest\>

claimEntityAssociationReferences:  
    \[claim-entity-association:\<digest\>\]

claims:  
    contact\_address\_lookup claim

The Claim Set publication is therefore demonstrably later than and dependent upon the entity resolution.

---

## **50\. Enrichment Handoff**

Enrichment receives:

baseClaimSet:  
    governed-claim-set:\<digest\>

claimParameterBindingsByClaimId:  
    {  
      \<claimId\>: {  
        claimId: \<claimId\>,  
        claimEntityAssociationId:  
          claim-entity-association:\<digest\>,  
        entityIdentificationRulesetId:  
          entity-identification-ruleset:\<digest\>,  
        entityIdentificationEvaluationId:  
          entity-identification-evaluation:\<digest\>,  
        resolvedEntityReference:  
          exchange-scoped-resolved-entity:\<digest\>,  
        resolvedCandidateReference:  
          entity-identification-candidate:\<digest\>,  
        matchingBasis:  
          governed\_first\_token\_display\_name\_alias\_match,  
        evidenceReference:  
          google-gmail:message:\<resource\>,  
        provenanceReference:  
          google-gmail:message:\<resource\>\#provenance  
      }  
    }

Enrichment validates the binding before invoking its resolver.

---

## **51\. Enrichment**

The Enrichment-owned resolver uses:

resolvedEntityReference

from the validated binding.

If governed address evidence satisfies Sprint 3.103's existing requirements:

Enrichment outcome:  
    enriched\_available

The Enrichment Evaluation records both:

Entity Identification lineage

and:

factual enrichment evidence lineage

without conflating them.

---

## **52\. Conflict, Projection, Validation**

The enriched claim proceeds through:

integrity-coupled conflict evaluation  
    ↓  
projection  
    ↓  
governed input  
    ↓  
model  
    ↓  
validator

The projection retains:

claimEntityAssociationReferences  
entityIdentificationEvaluationReferences

The validator can therefore prove which governed entity resolution supplied the claim parameter.

---

# **Part XX — Worked Example: Two Cassies**

## **53\. Evidence**

Assembled evidence contains:

Cassie Kozyrkov  
Cassie Chen

Both qualify under the governed alias rule.

Entity Identification produces:

outcome:  
    ambiguous\_multiple\_matches

qualifyingCandidateCount:  
    2

resolvedEntityReference:  
    absent

resolvedCandidateReference:  
    absent

disambiguationRequired:  
    true

---

## **54\. Lifecycle**

No Claim–Entity Association is published.

Instead:

GovernedParameterResolutionStop

reason:  
    clarification\_required

entityIdentificationEvaluationId:  
    entity-identification-evaluation:\<digest\>

candidateReferences:  
    \[  
      entity-identification-candidate:\<digest-A\>,  
      entity-identification-candidate:\<digest-B\>  
    \]

claimSetPublicationPermitted:  
    false

Then:

GovernedClaimSet:  
    NOT PUBLISHED for this parameter-dependent claim

Enrichment:  
    NOT RUN

Conflict Evaluation:  
    NOT RUN for this claim

Projection:  
    contains clarification/stop lifecycle publication,  
    not a fabricated factual claim

No candidate wins.

No rank exists.

No confidence score exists.

No factual email address is attributed to either candidate.

---

# **Part XXI — Worked Example: Zero Cassies**

## **55\. Entity Identification**

No admitted governed evidence matches:

Cassie

Entity Identification produces:

outcome:  
    unresolved\_no\_match

qualifyingCandidateCount:  
    0

resolvedEntityReference:  
    absent

---

## **56\. Lifecycle**

No Claim–Entity Association is published.

Publish:

GovernedParameterResolutionStop

reason:  
    unsupported\_no\_match

entityIdentificationEvaluationId:  
    entity-identification-evaluation:\<digest\>

candidateReferences:  
    \[\]

claimSetPublicationPermitted:  
    false

Then:

GovernedClaimSet:  
    NOT PUBLISHED for the unresolved parameter-dependent claim

Enrichment:  
    NOT RUN

Conflict Evaluation:  
    NOT RUN for this claim

Factual answer:  
    NOT PRODUCED

The system may truthfully communicate that the requested entity could not be established from currently admitted governed evidence.

It may not invent one.

---

# **Part XXII — Source-Unavailable Lifecycle**

## **57\. Entity Evidence Unavailable**

Where Entity Identification produces:

entity\_source\_unavailable

publish:

GovernedParameterResolutionStop

reason:  
    entity\_source\_unavailable

claimSetPublicationPermitted:  
    false

This remains distinct from:

unresolved\_no\_match

because:

no qualifying candidate was found

and:

the governed source required to perform identification was unavailable

are epistemically different states.

---

# **Part XXIII — Compatibility With Existing Contracts**

## **58\. Sprint 3.89 — Claims Boundary**

Not reopened.

Preserved:

typed intent  
deterministic recognition  
deterministic clarification  
fail-closed unsupported  
closed claim vocabulary  
model non-participation

Change:

> publication sequencing after recognition for claims whose required parameters need Entity Identification.

Recognition itself is unchanged.

---

## **59\. Sprint 3.90 — Conflicts Boundary**

Not reopened.

Preserved:

six-state conflict outcome vocabulary  
per-cell evaluation  
Composer Option A  
restrict-don't-adjudicate

No Entity Identification outcome is added to the conflict vocabulary.

---

## **60\. Sprint 3.103 — Evidence-to-Claim Enrichment**

Not reopened.

Preserved:

separate deterministic Enrichment stage  
base Claim Set → Enriched Claim Set  
materiality matrix  
source evidence responsibilities  
Enrichment outcomes  
immutable Enrichment publications

Extension:

> Enrichment now receives and preserves the governed lineage proving the entity parameter it already requires.

---

## **61\. Sprint 3.112 — Entity Identification**

Not reopened.

Preserved:

per-exchange deterministic resolution  
no durable identity  
exact four-outcome vocabulary  
unique-match requirement  
zero-match honesty  
multiple-match honesty  
source-unavailable distinction  
evidence citation  
model non-participation

Extension:

> this contract defines what happens after each of those four outcomes.

---

## **62\. Sprints 3.106 and 3.108**

Not reopened.

The discriminated claim-set architecture remains.

Enriched-claim integrity coupling remains.

Future implementation must extend their identity/integrity discipline where new lineage becomes material.

It shall not bypass either.

---

# **Part XXIV — Prohibited Hedge Language**

## **63\. Prohibited Language**

The implementation sprint and all completion reports shall not use:

probably  
likely  
should work  
appears compatible  
seems compatible  
essentially  
effectively equivalent  
close enough  
best effort  
fallback identity  
reasonable match  
probably the same person  
presumably  
implicitly linked  
can be inferred

to substitute for governed proof.

Do not state:

> the Claim Set effectively refers to the Entity Identification result.

Require an explicit reference.

Do not state:

> the entity ID probably came from the resolver.

Require the binding.

Do not state:

> ambiguity can be handled upstream.

Require the stop publication.

Do not state:

> projection lineage is implicit through the claim.

Require explicit governed references.

---

# **Part XXV — Implementation Prohibition**

## **64\. No Implementation Authority**

This contract authorizes no code changes.

It shall not:

* modify Claim Boundary;  
* modify Entity Identification;  
* modify Enrichment;  
* modify conflict evaluation;  
* modify the projection;  
* add the association publication;  
* add the stop publication;  
* add new fields;  
* alter resolver ownership in code;  
* alter the validator;  
* alter `/api/chat`.

Those changes require a future implementation sprint.

---

# **Part XXVI — Required Future Implementation**

## **65\. Implementation Scope**

The immediate implementation sprint shall implement only the lifecycle governed here.

It shall include:

1. deferred parameter-dependent Claim Set publication;  
2. Claim–Entity Association publication;  
3. Parameter Resolution Stop publication;  
4. unique-resolution gate;  
5. ambiguity stop;  
6. zero-match stop;  
7. source-unavailable stop;  
8. lineage-bearing Claim Set;  
9. lineage-bearing Enrichment handoff;  
10. fail-closed Enrichment parameter validation;  
11. Enrichment-owned resolver correlation;  
12. Enrichment publication lineage;  
13. Enriched Claim Set lineage;  
14. projection lineage;  
15. validator-visible lineage;  
16. mutation proof.

It shall not integrate `/api/chat`.

---

# **Part XXVII — Required Implementation Proofs**

## **66\. Unique Cassie Proof**

Prove:

recognition  
→ entity resolution  
→ claim association  
→ Claim Set  
→ Enrichment  
→ conflict  
→ projection  
→ governed input  
→ validation

using the real runtime `resolvedEntityReference`.

No fixture identity.

---

## **67\. Publication Ordering Proof**

Prove:

ClaimBoundaryEvaluation.createdAt  
≤ EntityIdentificationEvaluation.createdAt  
≤ ClaimEntityAssociation.createdAt  
≤ GovernedClaimSet.createdAt

and, more importantly, prove identity dependency rather than relying on timestamps alone.

The Claim Set's canonical body shall reference the association.

---

## **68\. Ambiguity Proof**

Prove:

ambiguous\_multiple\_matches

produces:

clarification\_required

and:

no Claim–Entity Association  
no parameter-dependent GovernedClaimSet  
no Enrichment  
no factual claim

---

## **69\. Zero-Match Proof**

Prove:

unresolved\_no\_match

produces:

unsupported\_no\_match

and:

no Claim–Entity Association  
no parameter-dependent GovernedClaimSet  
no Enrichment  
no fabricated entity

---

## **70\. Source-Unavailable Proof**

Prove:

entity\_source\_unavailable

remains distinct from zero match and prevents Claim Set publication.

---

## **71\. Mutation Proof**

Replace:

resolvedEntityReference

between association and Enrichment.

Expected:

fail closed before enrichment evaluation

not:

retained\_insufficient\_coverage

This directly reverses Sprint 3.116's mutation result.

---

## **72\. Lineage Proof**

Prove the final projection can trace:

projection  
→ Enriched Governed Claim Set  
→ Enrichment Evaluation  
→ Governed Claim Set  
→ Claim–Entity Association  
→ Entity Identification Evaluation  
→ resolved candidate  
→ entity-identification evidence

---

# **Part XXVIII — Validation**

## **73\. Governance-Sprint Validation**

Although this sprint makes no code changes, full repository validation is mandatory.

Run from a real Git clone:

npm test  
npm run build  
npm run lint  
npm run typecheck  
git diff \--check

Do not substitute targeted validation.

Do not rely on tarball extraction.

---

## **74\. Validation Failure**

If full validation fails and the failure cannot be shown to be an unrelated pre-existing repository condition:

> **Governance Review Incomplete**

Do not declare the contract complete over an unvalidated repository.

---

# **Part XXIX — Return Format**

## **75\. Required Opening**

The completion report shall begin:

Status: Governed Contract Complete  
Sprint Type: Governance Decision / Composition Correction Contract  
Recommendation: Governed Contract Complete

or:

Status: Governance Review Incomplete  
Sprint Type: Governance Decision / Composition Correction Contract  
Recommendation: Governance Review Incomplete

---

## **76\. Repository Precondition Result**

Report:

Repository:  
Branch:  
Starting commit:  
Ending commit:  
Working-tree state:  
Real clone:  
Required documents:  
Required source:  
Sprint 3.116 seam matrix confirmed:  
Current Claim Set ordering confirmed:  
Current Enrichment lineage gap confirmed:  
Resolver bounded-adapter finding confirmed:

---

## **77\. Binding Decisions**

Report explicitly:

Publication lifecycle:  
    Deferred Governed Claim Set publication

Claim association owner:  
    Explicit Claim–Entity Association step

Non-resolved control flow:  
    Governed Parameter Resolution Stop

Enrichment handoff:  
    Lineage-bearing GovernedClaimParameterBinding

Resolver owner:  
    Evidence-to-Claim Enrichment

Projection lineage:  
    Explicit association and Entity Identification references

Conflict architecture:  
    Unchanged

Entity Identification outcomes:  
    Unchanged

Claim Boundary vocabulary:  
    Unchanged

---

## **78\. Seam Closure Matrix**

Report every Sprint 3.116 seam and its exact governed resolution.

No semantic incompatibility may be omitted.

---

## **79\. Worked Examples**

Report all three:

Cassie — unique match  
Cassie — two matches  
Cassie — zero match

Also report the source-unavailable control path.

---

## **80\. Compatibility Statement**

Explicitly state:

Sprint 3.89 reopened: No  
Sprint 3.90 reopened: No  
Sprint 3.103 reopened: No  
Sprint 3.112 reopened: No  
Sprint 3.106 reopened: No  
Sprint 3.108 reopened: No

For each, state the preserved binding decision.

---

## **81\. Validation Results**

Report exact results for:

npm test  
npm run build  
npm run lint  
npm run typecheck  
git diff \--check

---

# **Part XXX — Recommendation Gate**

## **82\. Governed Contract Complete**

Use:

> **Governed Contract Complete**

only where:

* every Sprint 3.116 semantic incompatibility is explicitly resolved;  
* the bounded resolver finding is separately resolved;  
* publication ordering is unambiguous;  
* claim association ownership is unambiguous;  
* ambiguity lifecycle is unambiguous;  
* zero-match lifecycle is unambiguous;  
* source-unavailable lifecycle is unambiguous;  
* Enrichment lineage requirements are explicit;  
* projection lineage requirements are explicit;  
* fail-closed mutation behaviour is explicit;  
* compatibility with prior contracts is explicit;  
* no implementation was performed;  
* full validation passed.

---

## **83\. Governance Review Incomplete**

Use:

> **Governance Review Incomplete**

where any binding decision remains unresolved, including:

* both publication-order options remain permissible;  
* claim association ownership is not assigned;  
* ambiguity has no explicit stop behaviour;  
* zero match has no explicit stop behaviour;  
* Enrichment still accepts an independently trusted bare entity ID;  
* Entity Identification lineage may be discarded;  
* resolver ownership remains unspecified;  
* projection lineage remains implicit;  
* a prior contract must actually be reopened but the conflict is not resolved;  
* full validation fails.

---

# **Binding Summary**

Sprint:  
    3.117 — Governed Post-Identification Publication Lifecycle Contract

Trigger:  
    Sprint 3.116

Finding:  
    seven semantic incompatibilities  
    \+  
    one bounded adapter requirement

Publication lifecycle:  
    DEFER parameter-dependent GovernedClaimSet  
    until unique Entity Identification resolution

Recognition publication:  
    may occur before Entity Identification

Fully parameterised Claim Set:  
    may not

Claim association:  
    explicit deterministic  
    GovernedClaimEntityAssociation

Unique resolution:  
    EntityIdentificationEvaluation(resolved)  
    → ClaimEntityAssociation  
    → GovernedClaimSet  
    → Enrichment

Ambiguous:  
    ambiguous\_multiple\_matches  
    → ParameterResolutionStop(clarification\_required)  
    → no Claim Set  
    → no Enrichment

Zero match:  
    unresolved\_no\_match  
    → ParameterResolutionStop(unsupported\_no\_match)  
    → no Claim Set  
    → no Enrichment

Source unavailable:  
    entity\_source\_unavailable  
    → ParameterResolutionStop(entity\_source\_unavailable)  
    → no Claim Set  
    → no Enrichment

Enrichment handoff:  
    lineage-bearing GovernedClaimParameterBinding

Bare independently trusted entityId:  
    prohibited

Required Entity lineage:  
    claimEntityAssociationId  
    entityIdentificationRulesetId  
    entityIdentificationEvaluationId  
    resolvedEntityReference  
    resolvedCandidateReference  
    matchingBasis  
    evidenceReference  
    provenanceReference

Resolver:  
    owned by Evidence-to-Claim Enrichment  
    receives entity only from validated parameter binding

Conflict evaluation:  
    unchanged

Projection:  
    aggregates validated Entity Identification references  
    derives no entity identity

Validator:  
    validates supplied lineage  
    performs no Entity Identification

Sprint 3.89:  
    not reopened

Sprint 3.90:  
    not reopened

Sprint 3.103:  
    not reopened

Sprint 3.112:  
    not reopened

Sprint 3.106:  
    not reopened

Sprint 3.108:  
    not reopened

Implementation:  
    NOT AUTHORIZED

Production integration:  
    PROHIBITED

Next step:  
    isolated implementation of this contract,  
    followed by composition re-check

Output:  
    docs/SPRINT-3.117-GOVERNED-POST-IDENTIFICATION-PUBLICATION-LIFECYCLE-CONTRACT.md

The final recommendation shall be exactly:

> **Governed Contract Complete**

or:

> **Governance Review Incomplete**

---

# **Completion Record**

Status: Governed Contract Complete
Sprint Type: Governance Decision / Composition Correction Contract
Recommendation: Governed Contract Complete

## **Repository Precondition Result**

Repository: `/workspace/jarvis`
Branch: `work`
Starting commit: `b00ecb915c5279ef7a95aa1d3dcd453e3231077e`
Ending commit: completion commit containing this record
Working-tree state: clean at start; only this contract document changed for completion
Real clone: Yes (`.git` is present and `git rev-parse --show-toplevel` resolved `/workspace/jarvis`)
Required documents: Present and read completely
Required source: Present and inspected directly
Sprint 3.116 status and recommendation confirmed: `Complete` / **Evaluation Complete**
Sprint 3.116 seam matrix confirmed: eight `semantic_incompatibility` rows, not the compressed seven-item summary in Section 1; all eight are independently and completely resolved by Section 45
Current Claim Set ordering confirmed: `evaluateClaimBoundary` constructs and returns the `GovernedClaimSet` during Claim Boundary evaluation, before the separately invoked Entity Identification lifecycle
Current Claim Set lineage gap confirmed: `GovernedClaimSet` contains no Entity Identification reference
Current Enrichment lineage gap confirmed: `ClaimEnrichmentEngineInput` contains no Entity Identification evaluation publication, and `claimParametersByClaimId` carries only `Readonly<Record<string, { readonly entityId: string }>>`
Resolver bounded-adapter finding confirmed: the existing resolver can mechanically correlate assertions against the runtime `resolvedEntityReference`
Authoritative mapping owner confirmed absent: no production function owns the Entity Identification-result-to-claim association
Non-resolved lifecycle stops confirmed absent: neither `ambiguous_multiple_matches` nor `unresolved_no_match` currently prevents the already-earlier Claim Set publication through a governed stop publication
Existing implementation of this contract confirmed absent: no Claim–Entity Association publication, Parameter Resolution Stop publication, lineage-bearing parameter binding, deferred parameter-dependent Claim Set gate, or Entity Identification lineage propagation exists

No repository premise materially differs from Sprint 3.116's evidence. The Repository Precondition is satisfied.

## **Binding Decisions**

Publication lifecycle:
    Deferred Governed Claim Set publication (Option A selected; Option B's post-resolution wrapper remains rejected)

Claim association owner:
    Explicit Claim–Entity Association step (Option C)

Non-resolved control flow:
    Governed Parameter Resolution Stop (Option B)

Enrichment handoff:
    Lineage-bearing GovernedClaimParameterBinding

Resolver owner:
    Evidence-to-Claim Enrichment

Projection lineage:
    Explicit association and Entity Identification references

Conflict architecture:
    Unchanged

Entity Identification outcomes:
    Unchanged

Claim Boundary vocabulary:
    Unchanged

Fail-closed lineage enforcement:
    A lineage mismatch shall throw before enrichment evaluation. It shall not degrade to `retained_insufficient_coverage` or any other ordinary evidence outcome. This is the required direct reversal of Sprint 3.116's mutation finding.

## **Seam Closure Matrix**

| Sprint 3.116 seam | Confirmed finding | Final governed resolution |
| ----- | ----- | ----- |
| Extracted parameter → Entity Identification | `compatible` | Unchanged; no correction required |
| Entity Identification → claim parameter | `semantic_incompatibility` | Explicit deterministic `GovernedClaimEntityAssociation` publication owns the mapping |
| Entity Identification → Governed Claim Set | `semantic_incompatibility` | Defer parameter-dependent Claim Set publication until unique resolution and association publication |
| Entity Identification → Enrichment | `semantic_incompatibility` | Supply and validate the lineage-bearing `GovernedClaimParameterBinding` |
| Ambiguity → downstream chain | `semantic_incompatibility` | Publish `ParameterResolutionStop(clarification_required)`; publish no Claim Set and run no Enrichment |
| Zero match → downstream chain | `semantic_incompatibility` | Publish `ParameterResolutionStop(unsupported_no_match)`; publish no Claim Set and run no Enrichment |
| Entity lineage → projection | `semantic_incompatibility` | Preserve explicit association and Entity Identification references through Enrichment, the Enriched Claim Set, and projection |
| Entity identity → resolver | `bounded_adapter_needed` | Enrichment owns resolver invocation, and the validated binding is its sole entity-reference authority |
| Entity result → conflict evaluation | `semantic_incompatibility` | Valid Entity Identification lineage is a precondition of the enriched claim publication received by unchanged conflict evaluation |
| Full result → validator | `semantic_incompatibility` | Propagate lineage through projection and governed input so the validator can validate its presence and consistency without redoing identification |

The binding count is eight `semantic_incompatibility` findings plus one separately resolved `bounded_adapter_needed` finding. Section 1's seven-item prose summary compresses the last two semantic rows into one bullet; the real Sprint 3.116 matrix and Section 45 are the authoritative complete row-level accounting.

## **Worked Examples**

### **Cassie — unique match**

Claim recognition publishes its evaluation but no parameter-dependent Claim Set. Unique Entity Identification publishes `resolved`; the explicit association step verifies common conversational, evaluation, segment, and parameter lineage and publishes `GovernedClaimEntityAssociation`. Only then is the fully parameterised `GovernedClaimSet` published. Enrichment validates its `GovernedClaimParameterBinding` before its resolver uses `resolvedEntityReference`; Enrichment and all later publications retain association and Entity Identification references. Conflict, projection, governed input, and validation may then proceed.

### **Cassie — two matches**

`ambiguous_multiple_matches` publishes `GovernedParameterResolutionStop` with `clarification_required` and the candidate references. No association or parameter-dependent Claim Set is published. Enrichment and conflict evaluation do not run for the claim, and no factual claim is projected. No candidate is ranked or selected.

### **Cassie — zero match**

`unresolved_no_match` publishes `GovernedParameterResolutionStop` with `unsupported_no_match` and an empty candidate collection. No association or parameter-dependent Claim Set is published. Enrichment and conflict evaluation do not run for the claim, and no entity or factual value is fabricated.

### **Source unavailable**

`entity_source_unavailable` publishes `GovernedParameterResolutionStop` with the distinct `entity_source_unavailable` reason. Claim Set publication remains prohibited, and Enrichment does not run. Source unavailability remains epistemically distinct from a completed search yielding zero matches.

## **Compatibility Statement**

Sprint 3.89 reopened: No — deterministic recognition, typed intent, closed claim vocabulary, clarification, unsupported handling, and model non-participation are preserved; only post-recognition publication sequencing is governed here.
Sprint 3.90 reopened: No — the six-state conflict vocabulary, per-cell evaluation, Composer Option A, and restrict-don't-adjudicate remain binding.
Sprint 3.103 reopened: No — its separate deterministic Enrichment stage, materiality rules, outcomes, evidence responsibilities, and immutable publications are preserved and extended with parameter lineage.
Sprint 3.112 reopened: No — per-exchange deterministic resolution, four outcomes, unique-match requirement, bounded identity, evidence citation, and model non-participation are preserved; this contract governs the lifecycle after each outcome.
Sprint 3.106 reopened: No — the discriminated base/enriched Claim Set composition architecture is preserved.
Sprint 3.108 reopened: No — enriched-claim integrity coupling and canonical content-integrity discipline remain mandatory and are not bypassed.

## **Validation Results**

`npm test`: Passed
`npm run build`: Passed
`npm run lint`: Passed
`npm run typecheck`: Passed
`git diff --check`: Passed

Files changed: exactly `docs/SPRINT-3.117-GOVERNED-POST-IDENTIFICATION-PUBLICATION-LIFECYCLE-CONTRACT.md`. No code, type, test, or production-integration change was made.

> **Governed Contract Complete**
