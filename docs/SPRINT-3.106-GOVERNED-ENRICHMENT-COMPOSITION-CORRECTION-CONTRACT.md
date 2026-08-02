# **Sprint 3.106 — Governed Enrichment Composition Correction Contract**

**Status:** Governed contract complete
**Sprint Type:** Governance Decision / Composition Correction Contract  
**Implementation Authority:** None  
**Production Integration:** Prohibited  
**Governing Trigger:** Sprint 3.105 — Full-Assembly Composition Re-Check With Enrichment  
**Direct Structural Precedents:** Sprints 3.85 and 3.94  
**Output Path:** `docs/SPRINT-3.106-GOVERNED-ENRICHMENT-COMPOSITION-CORRECTION-CONTRACT.md`

---

## **1\. Recommendation**

**Decision:** Approve this Governed Enrichment Composition Correction Contract.

Sprint 3.105 established two real composition defects:

1. `ConflictEngineInput.claimSet` accepts the exact base `GovernedClaimSet` publication shape, but the enrichment stage publishes a distinct `EnrichedGovernedClaimSet` with a different identity and field structure.  
2. `GovernedConversationalProjection` records the base Claim Boundary publication lineage but has no first-class representation of the enrichment ruleset, enrichment evaluation, enriched Claim Set, or enriched-to-base claim identity links.

The Sprint 3.105 evaluation used an explicit bounded alias to continue testing:

enrichedGovernedClaimSetId  
    ↓ evaluation-only alias  
governedClaimSetId

That alias was legitimate evaluation evidence.

It is not an acceptable production architecture.

This contract selects:

> **Claim-Set Composition Option A — A discriminated conflict-evaluable claim-set architecture supporting both base and enriched Claim Sets under their truthful publication identities.**

It rejects converting the enriched publication into a false base-publication shape.

For projection lineage, this contract selects:

> **Projection Lineage Option A — Conditional but structurally complete enrichment lineage.**

A projection shall declare whether its canonical claim publication is:

base

or:

enriched

When the projection uses enriched claims, the enrichment ruleset identity, enrichment evaluation identity, enriched Claim Set identity, base Claim Set identity, and every enriched-claim-to-base-claim link become mandatory.

The composer remains validate/aggregate-only.

No implementation is authorized.

---

## **2\. Purpose**

This contract resolves the two blocking findings from Sprint 3.105:

### **Finding 1 — Conflict input field-shape mismatch**

The conflict engine currently expects:

GovernedClaimSet  
    governedClaimSetId  
    schemaVersion  
    claims  
    claimIds  
    segmentLinks

The enrichment stage publishes:

EnrichedGovernedClaimSet  
    enrichedGovernedClaimSetId  
    baseGovernedClaimSetId  
    enrichmentEvaluationId  
    claims  
    claimIds  
    segmentLinks

These are constitutionally distinct publications.

### **Finding 2 — Enrichment lineage disappears in projection**

The projection currently records:

claimBoundaryRulesetId  
claimBoundaryEvaluationId  
governedClaimSetId

but does not record:

enrichmentRulesetId  
enrichmentEvaluationId  
enrichedGovernedClaimSetId  
baseClaimId relationships

This contract establishes the binding correction architecture for both findings.

---

## **3\. Sprint Character**

This is a governance-decision sprint.

It shall:

* resolve the conflict-input publication architecture;  
* resolve the projection enrichment-lineage architecture;  
* define exact identities and field names;  
* define conditional requiredness;  
* define consistency checks;  
* preserve Identity Integrity;  
* preserve Composer Option A;  
* preserve Sprint 3.103 enrichment semantics;  
* define implementation boundaries for a future sprint.

It shall not:

* change code;  
* change types;  
* modify conflict evaluation;  
* modify the projection composer;  
* modify enrichment;  
* create an adapter;  
* create a migration;  
* update tests;  
* integrate `/api/chat`;  
* authorize production promotion.

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
12. Sprint 3.105 — evidentiary composition finding;  
13. current repository types and implementation;  
14. this contract.

Sprint 3.103 governs enrichment identity.

Sprint 3.90 and Sprint 3.94 govern conflict derivation and projection responsibility.

This contract governs the composition boundary between those settled architectures.

---

# **Part I — Repository Precondition**

## **5\. Required Documents**

Before drafting any binding decision, confirm the following exist:

docs/SPRINT-3.82-GOVERNED-CONVERSATIONAL-LINEAGE-IDENTITY-CONTRACT.md  
docs/SPRINT-3.85-GOVERNED-CONVERSATIONAL-IDENTITY-CORRECTION-CONTRACT.md  
docs/SPRINT-3.89-GOVERNED-CONVERSATIONAL-CLAIMS-BOUNDARY-CONTRACT.md  
docs/SPRINT-3.90-GOVERNED-CONVERSATIONAL-CONFLICTS-BOUNDARY-CONTRACT.md  
docs/SPRINT-3.94-GOVERNED-CLAIMS-AND-CONFLICTS-COMPOSITION-CORRECTION-CONTRACT.md  
docs/SPRINT-3.103-GOVERNED-EVIDENCE-TO-CLAIM-ENRICHMENT-CONTRACT.md  
docs/SPRINT-3.104-ISOLATED-EVIDENCE-TO-CLAIM-ENRICHMENT-IMPLEMENTATION.md  
docs/SPRINT-3.105-FULL-ASSEMBLY-COMPOSITION-RECHECK-WITH-ENRICHMENT.md  
docs/CONSTITUTIONAL-PUBLICATION-PRINCIPLES.md  
docs/architecture/ROADMAP.md

Read each completely.

---

## **6\. Required Source Inspection**

Read completely:

lib/governed-conversation/claim-boundary-types.ts  
lib/governed-conversation/claim-enrichment-types.ts  
lib/governed-conversation/claim-enrichment-publications.ts  
lib/governed-conversation/conflict-boundary-types.ts  
lib/governed-conversation/conflict-boundary-engine.ts  
lib/governed-conversation/conflict-boundary-publications.ts  
lib/governed-conversation/projection-composer.ts  
lib/governed-conversation/full-assembly-enrichment-composition-recheck.ts

Confirm directly:

1. the exact `GovernedClaimSet` shape;  
2. the exact `EnrichedGovernedClaimSet` shape;  
3. the exact `ConflictEngineInput` shape;  
4. the current `ConflictEvaluation.governedClaimSetId` field;  
5. the current `GovernedConflictSet.governedClaimSetId` field;  
6. the current projection input and output fields;  
7. the current claim-publication-lineage consistency check;  
8. the exact Sprint 3.105 evaluation-only alias;  
9. the enrichment fields lost from projection;  
10. the mutation finding that conflict observations are not integrity-coupled to enriched factual values.

If any central premise is absent or materially different, stop.

Return:

> **Governance Review Incomplete**

---

## **7\. Repository State Recording**

The completion report shall record:

* repository;  
* active branch;  
* starting commit;  
* working-tree state;  
* required artefact presence;  
* required source presence;  
* the exact current field shapes;  
* the exact Sprint 3.105 findings;  
* the exact files changed.

Expected files changed:

docs/SPRINT-3.106-GOVERNED-ENRICHMENT-COMPOSITION-CORRECTION-CONTRACT.md

only.

---

# **Part II — Findings Reconfirmed**

## **8\. Field-Shape Finding**

The base Claim Boundary publishes:

GovernedClaimSet

with an identity named:

governedClaimSetId

The enrichment stage publishes:

EnrichedGovernedClaimSet

with an identity named:

enrichedGovernedClaimSetId

and a lineage reference named:

baseGovernedClaimSetId

The conflict engine currently accepts only the first publication shape.

The Sprint 3.105 evaluation had to supply:

schemaVersion \= "1"  
governedClaimSetId \= enrichedGovernedClaimSetId

to continue the re-check.

That operation preserved the enriched value but mislabeled its publication meaning.

---

## **9\. Projection-Lineage Finding**

The projection currently publishes:

claimBoundaryRulesetId  
claimBoundaryEvaluationId  
governedClaimSetId

These fields truthfully identify the base recognition lineage.

When enriched claims are supplied, the projection does not separately publish:

enrichmentRulesetId  
enrichmentEvaluationId  
enrichedGovernedClaimSetId  
baseGovernedClaimSetId  
claimId ↔ baseClaimId relationships

The projection therefore cannot answer:

* which enrichment ruleset governed the claims;  
* which enrichment evaluation produced them;  
* which enriched Claim Set is canonical;  
* which base Claim Set preceded it;  
* which base claim each projected claim enriches.

This is a semantic lineage loss.

---

## **10\. Mutation Finding**

Sprint 3.105 also found that:

* an enriched claim’s status could be changed after enrichment;  
* its factual values could be changed after enrichment;  
* conflict evaluation still completed because it evaluates separately supplied observations;  
* no downstream stage checked that enriched claim content remained consistent with its enrichment publication.

This contract does not fully solve that separate integrity problem.

It does establish the publication identities required for a later integrity check to be possible.

The future implementation sprint shall preserve the mutation finding and shall not claim that lineage fields alone validate factual consistency.

---

# **Part III — Constitutional Principles**

## **11\. Identity Integrity**

Apply:

> **One immutable identity shall correspond to one immutable canonical object. A publication identity must not alias multiple distinguishable published bodies.**

Therefore:

governedClaimSetId

shall continue to identify only the base Claim Boundary publication.

It shall not identify an enriched Claim Set.

Likewise:

enrichedGovernedClaimSetId

shall identify only the enriched publication.

It shall not be relabeled as `governedClaimSetId`.

---

## **12\. Mechanism Reuse Does Not Transfer Meaning**

The conflict engine may reuse the same evaluation algorithm across base and enriched claim publications.

That does not make the two publications semantically identical.

The algorithm shall receive an explicit publication discriminator and truthful publication identity.

---

## **13\. Immutable Publication Chain**

The binding chain is:

Claim Boundary Evaluation  
    ↓  
GovernedClaimSet  
    ↓  
Evidence-to-Claim Enrichment Evaluation  
    ↓  
EnrichedGovernedClaimSet  
    ↓  
Conflict Evaluation  
    ↓  
GovernedConflictSet  
    ↓  
GovernedConversationalProjection

Every publication remains independently identifiable.

No downstream stage may erase an upstream identity merely because it uses the upstream publication’s values.

---

# **Part IV — Claim-Set Composition Options**

## **14\. Option A — Discriminated Conflict-Evaluable Claim Sets**

Extend the conflict boundary so it accepts one of two explicit publication variants:

Base Claim Set variant

or:

Enriched Claim Set variant

The conflict engine uses a closed discriminator to determine:

* publication kind;  
* canonical publication ID;  
* base recognition lineage;  
* enrichment lineage where present;  
* claims;  
* claim IDs;  
* segment links;  
* reference time;  
* conversational lineage.

### **Decision**

**Selected.**

---

## **15\. Option A — Binding Shape**

The conflict engine shall receive a discriminated input equivalent to:

type ConflictEvaluableClaimSet \=  
  | BaseConflictEvaluableClaimSet  
  | EnrichedConflictEvaluableClaimSet;

### **Base variant**

interface BaseConflictEvaluableClaimSet {  
  readonly claimSetKind: "base";  
  readonly claimSetPublicationId: string;  
  readonly claimSetPublicationType: "governed\_claim\_set";  
  readonly schemaVersion: "1";

  readonly governedClaimSetId: string;

  readonly claimBoundaryRulesetId: string;  
  readonly claimBoundaryEvaluationId: string;

  readonly threadId: string;  
  readonly requestId: string;  
  readonly exchangeId: string;  
  readonly referenceTime: string;  
  readonly createdAt: string;

  readonly claims: readonly GovernedClaimInput\[\];  
  readonly claimIds: readonly string\[\];  
  readonly segmentLinks: readonly ClaimSegmentLink\[\];  
}

Binding equality:

claimSetPublicationId  
    \=  
governedClaimSetId

### **Enriched variant**

interface EnrichedConflictEvaluableClaimSet {  
  readonly claimSetKind: "enriched";  
  readonly claimSetPublicationId: string;  
  readonly claimSetPublicationType:  
    "enriched\_governed\_claim\_set";  
  readonly schemaVersion: "1";

  readonly enrichedGovernedClaimSetId: string;  
  readonly baseGovernedClaimSetId: string;  
  readonly enrichmentEvaluationId: string;

  readonly claimBoundaryRulesetId: string;  
  readonly claimBoundaryEvaluationId: string;

  readonly threadId: string;  
  readonly requestId: string;  
  readonly exchangeId: string;  
  readonly referenceTime: string;  
  readonly createdAt: string;

  readonly claims: readonly EnrichedGovernedClaimInput\[\];  
  readonly claimIds: readonly string\[\];  
  readonly segmentLinks: readonly ClaimSegmentLink\[\];  
}

Binding equality:

claimSetPublicationId  
    \=  
enrichedGovernedClaimSetId

The implementation may define these through imported existing types rather than duplicate interfaces.

The semantic fields and discriminator are binding.

---

## **16\. Why Option A Is Selected**

### **Reason 1 — Truthful identity**

The conflict engine receives the publication under its actual identity.

No enriched identity is relabeled as a base identity.

### **Reason 2 — Explicit domain handling**

The engine can apply exact checks for each publication kind.

It does not infer the variant from missing fields.

### **Reason 3 — Existing algorithm reuse**

The engine may reuse its per-cell conflict algorithm because both variants expose:

* claims;  
* claim IDs;  
* segment links;  
* lineage;  
* reference time.

Meaning is preserved through the discriminator.

### **Reason 4 — Enrichment lineage remains available**

The enriched variant carries the base and enrichment lineage needed by downstream conflict publications.

### **Reason 5 — No unnecessary publication copy**

The architecture does not create a third claim-set publication solely to satisfy the conflict engine.

---

## **17\. Option B — Governed Adapter to Base Shape**

Introduce an adapter that transforms:

EnrichedGovernedClaimSet

into:

GovernedClaimSet

for conflict evaluation.

### **Decision**

**Rejected.**

---

## **18\. Why Option B Is Rejected**

### **Reason 1 — Publication misrepresentation**

A true `GovernedClaimSet` is the output of Claim Boundary recognition.

An enriched set is the output of Evidence-to-Claim Enrichment.

Transforming the latter into the former falsely implies recognition published the enriched statuses and factual values.

### **Reason 2 — Identity aliasing**

Using:

governedClaimSetId \=  
enrichedGovernedClaimSetId

would assign a base-publication field name to a different canonical object.

### **Reason 3 — Loss of enrichment lineage**

Unless the adapter created extra side-channel metadata, it would discard:

baseGovernedClaimSetId  
enrichmentEvaluationId  
baseClaimId

### **Reason 4 — Competing publication**

If the adapter generated a new identity, it would create a third publication representing substantially the same enriched claim body without a distinct governed responsibility.

### **Reason 5 — Evaluation-only alias already demonstrated the weakness**

Sprint 3.105 proved that the alias can make the code run.

It also proved that successful execution is not the same as constitutional compatibility.

---

## **19\. Option C — Replace Base Claim Set Everywhere**

Retire base `GovernedClaimSet` support and require the conflict engine to accept only `EnrichedGovernedClaimSet`.

### **Decision**

**Rejected.**

---

## **20\. Why Option C Is Rejected**

### **Reason 1 — Base-only architecture remains valid**

Claim Boundary and conflict evaluation may be exercised in isolated or pre-enrichment contexts.

Those historical and testing contexts remain legitimate.

### **Reason 2 — Unsupported or failed enrichment**

A future governed flow may fail enrichment before an enriched set is published.

That does not make the base publication invalid.

### **Reason 3 — Historical evidence preservation**

Earlier conflict evaluations truthfully used base Claim Sets.

The architecture shall not retroactively invalidate them.

### **Reason 4 — Unnecessary coupling**

The conflict engine’s algorithm is not inherently dependent on enrichment.

It requires a truthful claim-set publication and valid source observations.

---

## **21\. Claim-Set Composition Decision**

> **Claim-Set Composition Option A — Discriminated Conflict-Evaluable Claim Sets is binding.**

The conflict engine shall accept:

claimSetKind \= "base"

or:

claimSetKind \= "enriched"

It shall not accept an undiscriminated object that happens to contain enough similarly named fields.

---

# **Part V — Conflict Evaluation Publication Correction**

## **22\. Existing Ambiguity**

Current conflict publications use:

governedClaimSetId

for the claim-set publication evaluated.

That field name is truthful only when the evaluated publication is a base `GovernedClaimSet`.

It is not truthful for an enriched Claim Set.

---

## **23\. Conflict Evaluation Identity Decision**

Replace the generic use of:

governedClaimSetId

as the evaluated-publication reference with:

evaluatedClaimSetReference

having a closed shape equivalent to:

interface EvaluatedClaimSetReference {  
  readonly publicationId: string;  
  readonly publicationType:  
    | "governed\_claim\_set"  
    | "enriched\_governed\_claim\_set";  
  readonly claimSetKind:  
    | "base"  
    | "enriched";  
  readonly schemaVersion: "1";  
}

---

## **24\. Base Recognition Reference**

Every conflict evaluation shall also carry:

baseGovernedClaimSetId

The rule is:

### **Base variant**

baseGovernedClaimSetId  
    \=  
evaluatedClaimSetReference.publicationId

### **Enriched variant**

baseGovernedClaimSetId  
    \=  
EnrichedGovernedClaimSet.baseGovernedClaimSetId

This preserves recognition lineage for both variants.

---

## **25\. Conditional Enrichment References**

When:

claimSetKind \= "enriched"

the conflict evaluation shall also carry:

enrichmentEvaluationId  
enrichedGovernedClaimSetId

Binding equality:

enrichedGovernedClaimSetId  
    \=  
evaluatedClaimSetReference.publicationId

When:

claimSetKind \= "base"

these fields shall be absent.

They shall not be empty strings.

---

## **26\. Conflict Set Publication**

`GovernedConflictSet` shall carry the same evaluated-claim-set reference and conditional lineage fields as its owning conflict evaluation.

Required consistency:

ConflictEvaluation.evaluatedClaimSetReference  
    \=  
GovernedConflictSet.evaluatedClaimSetReference

ConflictEvaluation.baseGovernedClaimSetId  
    \=  
GovernedConflictSet.baseGovernedClaimSetId

For enriched variants:

ConflictEvaluation.enrichmentEvaluationId  
    \=  
GovernedConflictSet.enrichmentEvaluationId

ConflictEvaluation.enrichedGovernedClaimSetId  
    \=  
GovernedConflictSet.enrichedGovernedClaimSetId

---

## **27\. Migration of `governedClaimSetId`**

The current conflict-publication field:

governedClaimSetId

shall not remain as an ambiguous generic evaluated-set field.

The future implementation shall choose one of these mechanical migration forms:

1. remove it and use `evaluatedClaimSetReference` plus `baseGovernedClaimSetId`; or  
2. retain it temporarily only as a deprecated base-lineage alias whose value is always the actual base `governedClaimSetId`, never the enriched set ID.

The binding meaning is:

governedClaimSetId  
    \=  
base recognition Claim Set identity only

It shall never contain:

enrichedGovernedClaimSetId

The implementation specification shall select the least disruptive migration consistent with this meaning.

No semantic decision remains open.

---

# **Part VI — Conflict Engine Handling Rules**

## **28\. Base Claim Set Handling**

For:

claimSetKind \= "base"

the engine shall:

* validate the base publication shape;  
* validate `claimSetPublicationId === governedClaimSetId`;  
* evaluate base claim IDs;  
* publish base Claim Set lineage;  
* omit enrichment lineage.

---

## **29\. Enriched Claim Set Handling**

For:

claimSetKind \= "enriched"

the engine shall:

* validate the enriched publication shape;  
* validate `claimSetPublicationId === enrichedGovernedClaimSetId`;  
* validate `baseGovernedClaimSetId`;  
* validate `enrichmentEvaluationId`;  
* evaluate enriched claim IDs;  
* retain each enriched claim’s `baseClaimId`;  
* publish enriched and base lineage;  
* prohibit base claims from entering canonical evaluation for the same exchange.

---

## **30\. Per-Cell Evaluation**

Sprint 3.94/3.95 remains binding:

complete supplied claim set  
    ↓  
each eligible claimId × conflictClass cell

For an enriched set:

claimId

means the enriched claim ID.

The engine shall not translate it back to `baseClaimId`.

---

## **31\. Observation Linkage**

`GovernedSourceObservation.affectedClaimId` shall reference the canonical claim ID in the supplied conflict-evaluable set.

Therefore:

### **Base evaluation**

affectedClaimId  
    \=  
base claimId

### **Enriched evaluation**

affectedClaimId  
    \=  
enriched claimId

An observation referring to a base claim while the supplied set is enriched shall be rejected as claim linkage mismatch.

---

## **32\. No Dual Evaluation**

The same operator assertion shall not enter one conflict evaluation as both:

base claim

and:

enriched claim

The selected variant is canonical for that evaluation.

Base claim identity remains historical lineage only when the enriched variant is supplied.

---

# **Part VII — Projection Lineage Options**

## **33\. Projection Lineage Option A — Conditional Complete Lineage**

Extend projection input and output with:

claimPublicationStage  
baseGovernedClaimSetId  
enrichmentRulesetId  
enrichmentEvaluationId  
enrichedGovernedClaimSetId  
enrichedClaimBaseReferences

The enrichment-specific fields are conditionally required when enriched claims are projected.

### **Decision**

**Selected.**

---

## **34\. Projection Lineage Option B — Always Required Enrichment Fields**

Require enrichment lineage in every projection, including base-only projections.

### **Decision**

**Rejected.**

### **Reason**

A base-only projection has no enrichment evaluation or enriched Claim Set.

Requiring those identities would force synthetic publications.

---

## **35\. Projection Lineage Option C — Optional Independent Fields**

Add optional enrichment fields without a discriminator or all-or-none validation.

### **Decision**

**Rejected.**

### **Reason**

Independent optional fields permit structurally ambiguous combinations such as:

* enrichment evaluation without enriched set;  
* enriched set without base set;  
* base references without enrichment ruleset;  
* enriched claims marked as base-stage claims.

Optionality without a discriminator would recreate the ambiguity this contract exists to remove.

---

## **36\. Projection Lineage Decision**

> **Projection Lineage Option A — Conditional Complete Lineage is binding.**

The projection shall use a closed discriminator:

claimPublicationStage \=  
    "base"  
    | "enriched"

---

# **Part VIII — Exact Projection Fields**

## **37\. Fields Required for Every Projection**

Every projection shall continue to carry:

claimBoundaryRulesetId  
claimBoundaryEvaluationId  
governedClaimSetId

Their meanings remain:

### **`claimBoundaryRulesetId`**

The ruleset that recognised the operator claims.

### **`claimBoundaryEvaluationId`**

The evaluation that produced the base claim publications.

### **`governedClaimSetId`**

The immutable base recognition Claim Set identity.

These fields remain required even when enriched claims are projected.

---

## **38\. New Stage Discriminator**

Add:

readonly claimPublicationStage:  
  | "base"  
  | "enriched";

This field is required.

It identifies which claim publication is canonical in the projection’s `claims` collection.

---

## **39\. New Base-Set Field**

Add:

readonly baseGovernedClaimSetId: string;

This field is required for every projection.

Binding equality:

baseGovernedClaimSetId  
    \=  
governedClaimSetId

The explicit field is required because downstream enriched lineage uses the term `baseGovernedClaimSetId`.

The duplication is a deliberate migration and validation aid.

A future schema version may retire one name after all consumers migrate.

Their meanings shall not diverge.

---

## **40\. Enrichment Ruleset Field**

Add:

readonly enrichmentRulesetId?: string;

Required when:

claimPublicationStage \= "enriched"

Prohibited when:

claimPublicationStage \= "base"

---

## **41\. Enrichment Evaluation Field**

Add:

readonly enrichmentEvaluationId?: string;

Required when enriched.

Prohibited when base.

---

## **42\. Enriched Claim Set Field**

Add:

readonly enrichedGovernedClaimSetId?: string;

Required when enriched.

Prohibited when base.

It shall never equal:

governedClaimSetId

or:

baseGovernedClaimSetId

---

## **43\. Enriched Claim Base References**

Add:

readonly enrichedClaimBaseReferences?:  
  readonly {  
    readonly claimId: string;  
    readonly baseClaimId: string;  
  }\[\];

Required when enriched.

Prohibited when base.

Every projected enriched claim shall have exactly one entry.

No entry may reference an unknown projected claim.

No `claimId` may equal its `baseClaimId`.

No base claim may be linked to more than one enriched claim within the same enrichment evaluation unless a future contract explicitly authorizes branching.

Sprint 3.103 currently requires one enriched claim per base claim.

---

## **44\. Optionality Rule**

The projection’s enrichment fields are not loosely optional.

They form one conditional group.

### **Base projection**

Required:

claimPublicationStage \= "base"  
baseGovernedClaimSetId

Absent:

enrichmentRulesetId  
enrichmentEvaluationId  
enrichedGovernedClaimSetId  
enrichedClaimBaseReferences

### **Enriched projection**

Required:

claimPublicationStage \= "enriched"  
baseGovernedClaimSetId  
enrichmentRulesetId  
enrichmentEvaluationId  
enrichedGovernedClaimSetId  
enrichedClaimBaseReferences

No partial group is valid.

---

# **Part IX — Projection Input Publications**

## **45\. Base Projection Input**

For:

claimPublicationStage \= "base"

the projection input shall receive:

claimBoundaryEvaluation  
governedClaimSet  
claims \= governedClaimSet.claims

No enrichment publications are supplied.

---

## **46\. Enriched Projection Input**

For:

claimPublicationStage \= "enriched"

the projection input shall receive:

claimBoundaryEvaluation  
governedClaimSet  
enrichmentEvaluation  
enrichedGovernedClaimSet  
claims \= enrichedGovernedClaimSet.claims

The base `governedClaimSet` remains required as lineage evidence.

It is not the canonical source of the projected claim bodies.

---

## **47\. Exact Enriched Input Additions**

The future projection input shall add publication objects equivalent to:

readonly enrichmentEvaluation?:  
  EvidenceToClaimEnrichmentEvaluation;

readonly enrichedGovernedClaimSet?:  
  EnrichedGovernedClaimSet;

These publications shall be supplied together when enriched.

They shall be absent together when base.

The composer shall not accept only their string IDs without the canonical publications required for consistency validation.

---

# **Part X — Projection Consistency Checks**

## **48\. Existing Base-Lineage Check**

The existing check remains:

claimClassificationRulesetId  
    \=  
governedClaimSet.claimBoundaryRulesetId

claimBoundaryEvaluation.claimBoundaryRulesetId  
    \=  
governedClaimSet.claimBoundaryRulesetId

governedClaimSet.claimBoundaryEvaluationId  
    \=  
claimBoundaryEvaluation.claimBoundaryEvaluationId

No weakening is permitted.

---

## **49\. Base Projection Validation**

When:

claimPublicationStage \= "base"

the composer shall validate:

claims  
    \=  
governedClaimSet.claims

It shall reject supplied enrichment publications or enrichment fields.

---

## **50\. Enriched Projection Validation**

When:

claimPublicationStage \= "enriched"

the composer shall validate all of the following:

enrichmentEvaluation.baseGovernedClaimSetId  
    \=  
governedClaimSet.governedClaimSetId

enrichedGovernedClaimSet.baseGovernedClaimSetId  
    \=  
governedClaimSet.governedClaimSetId

enrichedGovernedClaimSet.enrichmentEvaluationId  
    \=  
enrichmentEvaluation.enrichmentEvaluationId

enrichmentEvaluation.enrichmentRulesetId  
    \=  
enrichmentRulesetId

enrichedGovernedClaimSet.enrichedGovernedClaimSetId  
    \=  
enrichedGovernedClaimSetId

claims  
    \=  
enrichedGovernedClaimSet.claims

every enriched claim.baseClaimId  
    exists in governedClaimSet.claimIds

every enriched claim.claimId  
    exists in enrichedGovernedClaimSet.claimIds

every enriched segment link  
    references an enriched claim

threadId, requestId, exchangeId  
    match across all publications

---

## **51\. Conflict Lineage Validation**

When conflict evaluation exists, the composer shall validate:

conflictEvaluation.evaluatedClaimSetReference.publicationId

against the canonical claim publication selected by:

claimPublicationStage

### **Base projection**

Expected:

conflictEvaluation.evaluatedClaimSetReference.publicationId  
    \=  
governedClaimSetId

### **Enriched projection**

Expected:

conflictEvaluation.evaluatedClaimSetReference.publicationId  
    \=  
enrichedGovernedClaimSetId

The same rule applies to the Conflict Set.

---

## **52\. Claim-ID Validation**

For enriched projections:

* every conflict’s affected claim ID shall be an enriched claim ID;  
* no conflict shall reference only a base claim ID;  
* every effective-claim-status record shall use an enriched claim ID;  
* every `enrichedClaimBaseReferences.claimId` shall match a projected claim;  
* base IDs remain lineage only.

---

# **Part XI — Composer Option A**

## **53\. Composer Responsibility**

Sprint 3.90 Composer Option A remains binding:

> The composer validates and aggregates. It does not derive claims, enrich claims, derive conflicts, or select source truth.

This correction does not reopen that decision.

---

## **54\. Validation Is Not Derivation**

The composer may:

* confirm supplied identities match;  
* confirm publication types match;  
* confirm supplied claims equal the selected canonical Claim Set;  
* confirm enrichment lineage is complete;  
* confirm conflicts reference the selected claims;  
* pass through enrichment identity fields;  
* compute the already-authorized `effectiveClaimStatus`.

These operations are validation and aggregation.

They do not create:

* enriched claims;  
* factual values;  
* source references;  
* enrichment outcomes;  
* conflicts.

---

## **55\. Pass-Through Fields**

The new projection fields shall be copied from validated upstream publications.

The composer shall not synthesize:

enrichmentRulesetId  
enrichmentEvaluationId  
enrichedGovernedClaimSetId  
baseClaimId

from claim contents.

If a required upstream publication is absent, the composer shall reject the input.

---

## **56\. Effective Status**

The existing projection-owned aggregation remains:

canonical enriched claim status  
    \+  
canonical conflict restrictions  
    ↓  
effectiveClaimStatus

The composer shall not recompute enrichment status from evidence.

---

# **Part XII — Sprint 3.103 Identity Preservation**

## **57\. Base Claim Identity**

The base claim remains identified by:

baseClaimId

within each enriched claim.

It is not reused as the enriched claim’s `claimId`.

---

## **58\. Enriched Claim Identity**

The enriched claim’s `claimId` remains its canonical identity downstream.

Conflict evaluations, conflicts, projection claim records, effective-status records, and governed model inputs shall reference the enriched claim ID.

---

## **59\. Base Claim Set Identity**

governedClaimSetId

continues to identify the base recognition Claim Set.

It is never replaced by the enriched ID.

---

## **60\. Enriched Claim Set Identity**

enrichedGovernedClaimSetId

identifies the post-evidence Claim Set.

It is the evaluated Claim Set identity for post-enrichment conflict evaluation.

---

## **61\. No Alias Rule**

The following is prohibited:

governedClaimSetId \=  
enrichedGovernedClaimSetId

even temporarily in production architecture.

The Sprint 3.105 evaluation-only alias remains historical evidence.

It shall not become the implementation.

---

# **Part XIII — Mutation Integrity Scope**

## **62\. Mutation Finding Preserved**

Sprint 3.105 found that conflict evaluation does not verify enriched claim status or factual values against the enrichment evaluation.

This contract records that finding as unresolved beyond the two direct correction issues.

---

## **63\. Required Future Integrity Decision**

The future implementation sprint shall not silently claim the mutation gap is solved merely because it adds lineage fields.

It shall either:

1. demonstrate that existing immutable identity verification rejects altered enriched claims; or  
2. report that a dedicated enrichment-publication-integrity validator remains required.

No new validator is authorized by this contract.

If implementation requires one, stop and recommend a separate governance decision.

---

## **64\. Conflict Observations**

This contract does not authorize conflict evaluation to derive its source observations directly from enriched claim `factualValues`.

The existing conflict engine remains observation-driven.

Any future integrity relationship between:

enriched claim factualValues

and:

GovernedSourceObservation

requires separate governance if not already mechanically provable through source publication references.

---

# **Part XIV — No-Reopening Register**

## **65\. Sprint 3.89**

**Not reopened.**

Claim recognition remains deterministic and evidence-blind.

---

## **66\. Sprint 3.90**

**Not reopened.**

The dedicated conflict engine remains the sole conflict derivation owner.

Composer Option A remains binding.

---

## **67\. Sprint 3.94/3.95**

**Not reopened.**

Per-cell evaluation over the complete supplied claim set remains binding.

This contract changes the accepted publication variants, not the per-cell algorithm.

---

## **68\. Sprint 3.103**

**Not reopened.**

The separate enrichment stage remains binding.

Base and enriched claims remain distinct immutable publications.

---

## **69\. Sprint 3.104**

**Not reopened.**

The existing enrichment implementation remains the source of:

* enrichment ruleset;  
* enrichment evaluation;  
* enriched Claim Set;  
* enriched claim IDs;  
* `baseClaimId` links.

---

# **Part XV — Responsibility Audit**

## **70\. Binding Responsibility Table**

| Question | Binding answer |
| ----- | ----- |
| May the enriched Claim Set be passed as a false base Claim Set? | No |
| Does the conflict engine accept base Claim Sets? | Yes |
| Does the conflict engine accept enriched Claim Sets? | Yes |
| How are they distinguished? | Closed `claimSetKind` discriminator |
| Does one generic ID field identify both? | No |
| Is the actual evaluated publication ID retained? | Yes |
| Is the base Claim Set ID retained for enriched evaluation? | Yes |
| Is enrichment evaluation identity retained in conflict publications? | Yes |
| Are conflict cells linked to enriched claim IDs after enrichment? | Yes |
| May base and enriched claims both be canonically evaluated in the same run? | No |
| Does the projection always retain base recognition lineage? | Yes |
| Does an enriched projection retain enrichment lineage? | Yes, completely |
| Are enrichment fields required for base-only projection? | No |
| Are enrichment fields independently optional? | No |
| Is a stage discriminator required? | Yes |
| Does the composer derive enrichment? | No |
| Does the composer validate enrichment publication consistency? | Yes |
| Does the composer pass enrichment lineage through? | Yes |
| Does the composer still compute effective status? | Yes |
| Does `governedClaimSetId` retain its base-publication meaning? | Yes |
| May it alias `enrichedGovernedClaimSetId`? | No |
| Is the Sprint 3.105 mutation gap solved by this contract? | No |
| Does this contract authorize implementation? | No |

**Decision:** Responsibility Audit passes.

---

# **Part XVI — Prohibited Hedge Language**

## **71\. Prohibited Terms**

The completed contract shall not use unresolved phrases such as:

could  
might  
perhaps  
potentially  
ideally  
where appropriate  
as needed  
reuse where practical  
implementation may choose  
one possible approach  
if useful  
probably  
likely  
some form of lineage  
equivalent identity  
compatible enough  
TBD

for decisions governed here.

---

## **72\. Required Decision Language**

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
* the adapter option is rejected;  
* a discriminator is required;  
* enrichment lineage is conditionally complete;  
* `governedClaimSetId` cannot alias the enriched identity;  
* Composer Option A remains intact;  
* implementation is not authorized.

---

# **Part XVII — Explicit Non-Decisions**

## **73\. Out of Scope**

This contract does not decide:

* implementation filenames;  
* exact TypeScript helper names;  
* test organization;  
* migration commit sequence;  
* production `/api/chat` wiring;  
* operator verification;  
* promotion;  
* conflict-observation derivation from enriched factual values;  
* a new enrichment-integrity validator;  
* persistence;  
* database schemas;  
* UI display of lineage;  
* cross-version API compatibility.

---

# **Part XVIII — No-Implementation Statement**

## **74\. No Implementation Authorized**

> **Sprint 3.106 authorizes no code change, type change, engine change, composer change, adapter, migration, production integration, or `/api/chat` modification.**

A future correction implementation sprint shall execute this contract.

Expected next sprint:

> **Sprint 3.107 — Enrichment Composition Correction Implementation**

---

# **Part XIX — Future Implementation Requirements**

## **75\. Required Conflict-Type Changes**

The implementation sprint shall:

1. introduce the discriminated conflict-evaluable claim-set type;  
2. support the base variant;  
3. support the enriched variant;  
4. remove the need for the evaluation-only alias;  
5. update conflict evaluation publications;  
6. update Conflict Set publications;  
7. preserve per-cell logic;  
8. migrate all tests and fixtures;  
9. preserve historical evaluation records.

---

## **76\. Required Projection Changes**

The implementation sprint shall add:

claimPublicationStage  
baseGovernedClaimSetId  
enrichmentRulesetId  
enrichmentEvaluationId  
enrichedGovernedClaimSetId  
enrichedClaimBaseReferences

under the exact conditional rules in this contract.

---

## **77\. Required Composer Validation**

The implementation sprint shall add consistency checks equivalent to Sections 48–52.

The checks shall reject:

* partial enrichment lineage;  
* enriched claims with base-stage discriminator;  
* base claims with enriched-stage discriminator;  
* set-ID aliasing;  
* unknown base claim references;  
* conflicts linked to base claims in an enriched projection;  
* conflict evaluation linked to the wrong set publication;  
* enriched claim summaries not matching the enriched Claim Set.

---

## **78\. Required Central Test**

Re-run all ten Sprint 3.105 scenarios without the evaluation-only alias.

Required:

EnrichedGovernedClaimSet  
    ↓  
real discriminated conflict input  
    ↓  
Conflict Evaluation  
    ↓  
Projection with complete enrichment lineage

No type cast or ID relabeling shall be used.

---

## **79\. Required Identity Tests**

Prove:

* base `governedClaimSetId` remains unchanged;  
* enriched ID remains distinct;  
* evaluated claim-set reference selects the enriched ID;  
* conflict evaluation retains base and enrichment lineage;  
* Conflict Set retains the same lineage;  
* projection retains the same lineage;  
* every projected enriched claim links to one base claim;  
* no identity aliases.

---

## **80\. Required Base-Only Tests**

Prove the base variant remains valid:

* no enrichment fields;  
* base claim IDs evaluated;  
* base set ID used as evaluated publication;  
* projection stage set to `base`;  
* no synthetic enrichment identity.

---

## **81\. Required Enriched Tests**

Prove the enriched variant:

* requires every enrichment publication;  
* evaluates enriched IDs;  
* retains base IDs as lineage only;  
* projects complete lineage;  
* applies conflict restrictions to enriched IDs;  
* preserves unsupported importance independently.

---

## **82\. Required Mutation Follow-Up**

The implementation completion report shall explicitly rerun the Sprint 3.105 mutations.

It shall report whether:

* changed enriched status is detected;  
* changed factual values are detected;  
* immutable identity comparison detects body drift;  
* the integrity gap remains.

If the gap remains, report it.

Do not add ungoverned validation.

---

# **Part XX — Full Validation**

## **83\. Documentation-Sprint Validation**

Run:

npm test  
npm run build  
npm run lint  
npm run typecheck  
git diff \--check

No exception applies.

---

## **84\. Repository Search**

Confirm:

1. no existing production discriminated claim-set type already owns this role;  
2. the Sprint 3.105 alias remains evaluation-only;  
3. no projection enrichment fields already exist under another name;  
4. no current composer check validates enrichment publication lineage;  
5. no code file changed during this sprint.

If contradictory evidence appears, stop.

Return:

> **Governance Review Incomplete**

---

# **Part XXI — Completion Report**

## **85\. Repository Precondition**

Report:

* repository;  
* branch;  
* starting commit;  
* working-tree state;  
* required artefacts;  
* required source inspection;  
* exact current type mismatch;  
* exact current lineage omission.

---

## **86\. Findings Reconfirmed**

State:

### **Field-shape mismatch**

> `GovernedClaimSet` and `EnrichedGovernedClaimSet` are distinct immutable publications and cannot be substituted through ID aliasing.

### **Lost lineage**

> The current projection cannot first-class identify the enrichment ruleset, enrichment evaluation, enriched Claim Set, or enriched-to-base claim relationships.

---

## **87\. Claim-Set Options Decision**

Report:

Option A — Selected  
Option B — Rejected  
Option C — Rejected

Include independent reasons.

---

## **88\. Projection Options Decision**

Report:

Projection Lineage Option A — Selected  
Projection Lineage Option B — Rejected  
Projection Lineage Option C — Rejected

---

## **89\. Exact New Fields**

List:

claimPublicationStage  
baseGovernedClaimSetId  
enrichmentRulesetId  
enrichmentEvaluationId  
enrichedGovernedClaimSetId  
enrichedClaimBaseReferences

State requiredness for base and enriched variants.

---

## **90\. Conflict Publication Decision**

Report:

evaluatedClaimSetReference  
baseGovernedClaimSetId  
enrichmentEvaluationId  
enrichedGovernedClaimSetId

and the exact conditional rules.

---

## **91\. Identity Integrity**

State explicitly:

> `governedClaimSetId` continues to identify only the base Claim Boundary publication. It shall never contain or alias `enrichedGovernedClaimSetId`.

Explain how the selected architecture satisfies the Identity Integrity principle.

Explain why the adapter option would violate it.

---

## **92\. Composer Option A**

State:

> The composer remains validate/aggregate-only. The new behaviour validates and passes through already-published enrichment lineage; it does not derive enrichment.

---

## **93\. Sprint 3.103 Compatibility**

State:

> Sprint 3.103’s base/enriched identity distinction remains fully binding. Base publications remain immutable, enriched publications retain distinct identities, and conflicts reference enriched claim IDs after enrichment.

---

## **94\. Mutation Finding**

State:

> Sprint 3.106 does not claim to solve the Sprint 3.105 mutation-integrity finding. A future implementation must retest it and report whether separate integrity governance remains necessary.

---

## **95\. Responsibility Audit**

Include the complete table from Section 70\.

---

## **96\. No-Implementation Statement**

State:

> Sprint 3.106 authorizes no implementation or production integration.

---

## **97\. Validation Results**

Report exact results for:

npm test  
npm run build  
npm run lint  
npm run typecheck  
git diff \--check

---

## **98\. Files Changed**

Expected:

docs/SPRINT-3.106-GOVERNED-ENRICHMENT-COMPOSITION-CORRECTION-CONTRACT.md

only.

---

## **99\. Next Step**

Expected:

> **Sprint 3.107 — Enrichment Composition Correction Implementation**

---

# **Part XXII — Recommendation Gate**

## **100\. Permitted Final Recommendation**

The final line shall be exactly one:

> **Governed Contract Complete**

or:

> **Governance Review Incomplete**

No other wording is permitted.

---

## **101\. Governed Contract Complete**

Use only if:

* both Sprint 3.105 findings are resolved;  
* one claim-set option is selected;  
* rejected options have specific reasons;  
* one projection-lineage option is selected;  
* all new field names are exact;  
* optionality is structurally defined;  
* Identity Integrity is preserved;  
* `governedClaimSetId` does not alias the enriched ID;  
* conflict publications preserve evaluated publication identity;  
* projection preserves complete enrichment lineage;  
* Composer Option A remains intact;  
* Sprint 3.103 remains intact;  
* no implementation is authorized;  
* full validation passes.

---

## **102\. Governance Review Incomplete**

Use if:

* the conflict-input architecture remains ambiguous;  
* the adapter option remains informally available;  
* enriched identity can still be stored in `governedClaimSetId`;  
* projection enrichment fields remain independently optional;  
* base and enriched claims can both enter one canonical evaluation;  
* Composer Option A is weakened;  
* Sprint 3.103 identity distinctions are collapsed;  
* implementation is silently authorized;  
* repository evidence contradicts the contract;  
* full validation fails.

---

# **Part XXIII — Binding Summary**

## **103\. Corrected Conflict Boundary**

Base GovernedClaimSet  
    ↓  
claimSetKind \= base  
claimSetPublicationId \= governedClaimSetId  
    ↓  
Conflict Evaluation

or

EnrichedGovernedClaimSet  
    ↓  
claimSetKind \= enriched  
claimSetPublicationId \= enrichedGovernedClaimSetId  
baseGovernedClaimSetId retained  
enrichmentEvaluationId retained  
    ↓  
Conflict Evaluation

The conflict engine evaluates exactly one canonical claim-set publication per run.

---

## **104\. Corrected Conflict Publication Chain**

Conflict Evaluation  
    ├── evaluatedClaimSetReference  
    ├── baseGovernedClaimSetId  
    ├── enrichmentEvaluationId, when enriched  
    └── enrichedGovernedClaimSetId, when enriched  
    ↓  
GovernedConflictSet  
    carries identical claim-set lineage

---

## **105\. Corrected Projection Chain**

Claim Boundary Evaluation  
    ↓  
GovernedClaimSet  
    ↓  
Evidence-to-Claim Enrichment Evaluation  
    ↓  
EnrichedGovernedClaimSet  
    ↓  
Conflict Evaluation  
    ↓  
GovernedConflictSet  
    ↓  
Projection  
        claimPublicationStage \= enriched  
        governedClaimSetId \= base set identity  
        baseGovernedClaimSetId \= base set identity  
        enrichmentRulesetId  
        enrichmentEvaluationId  
        enrichedGovernedClaimSetId  
        enrichedClaimBaseReferences  
        enriched claims  
        conflict restrictions  
        effective statuses

---

## **106\. Base Projection Chain**

Claim Boundary Evaluation  
    ↓  
GovernedClaimSet  
    ↓  
Conflict Evaluation  
    ↓  
Projection  
        claimPublicationStage \= base  
        governedClaimSetId  
        baseGovernedClaimSetId  
        no enrichment fields

---

## **107\. Identity Rules**

governedClaimSetId  
    \= base Claim Boundary publication only

enrichedGovernedClaimSetId  
    \= enriched Claim Set publication only

claimSetPublicationId  
    \= the actual publication evaluated

baseClaimId  
    \= lineage reference only

enriched claimId  
    \= canonical downstream claim identity

No aliasing is permitted.

---

## **108\. Composer Rule**

validate supplied publications  
verify lineage consistency  
pass identities through  
aggregate canonical status with conflict restrictions

The composer shall not:

recognise claims  
enrich claims  
resolve evidence  
derive conflicts  
select source truth

---

## **109\. Governing Decision**

Claim-set composition  
    \= Option A  
      discriminated base/enriched publications

Projection lineage  
    \= Option A  
      conditional complete enrichment lineage

Adapter-to-base-shape  
    \= rejected

Enriched-only conflict engine  
    \= rejected

Loose independent optional fields  
    \= rejected

Composer Option A  
    \= preserved

Sprint 3.103 Identity Integrity  
    \= preserved

Implementation authority  
    \= none

The final line shall be exactly:

> **Governed Contract Complete**

or:

> **Governance Review Incomplete**

---

# **Part XXIV — Completed Governance Record**

## **110\. Repository Precondition**

* Repository: `/workspace/jarvis`.
* Active branch at start: `work`.
* Starting commit: `206e29a70a241cfc95785394f6458dd204785a27`.
* Starting working tree: clean.
* The repository has no local `main` ref. `git rev-parse main` returned `fatal: ambiguous argument 'main'`; the contract at `HEAD` was therefore read completely from the working tree before the decision was finalized.
* Every required artefact in Section 5 and every required source in Section 6 exists and was read completely. Repository searches confirmed that no existing production discriminated claim-set type already owns this role, the Sprint 3.105 alias remains evaluation-only, the projection fields do not exist under other names, and the composer has no enrichment-publication-lineage validation.
* `GovernedClaimSet` currently contains `governedClaimSetId`, `schemaVersion`, `claimBoundaryEvaluationId`, `claimBoundaryRulesetId`, `threadId`, `requestId`, `exchangeId`, `referenceTime`, `claims`, `segmentLinks`, `claimIds`, and `createdAt`.
* `EnrichedGovernedClaimSet` currently contains `enrichedGovernedClaimSetId`, `baseGovernedClaimSetId`, `enrichmentEvaluationId`, `claimBoundaryRulesetId`, `claimBoundaryEvaluationId`, `threadId`, `requestId`, `exchangeId`, `referenceTime`, `claims`, `segmentLinks`, `claimIds`, and `createdAt`. Its claims are `EnrichedGovernedClaimInput` values carrying `baseClaimId`; it has no `schemaVersion` or `governedClaimSetId`.
* `ConflictEngineInput` currently contains optional `ruleset`, optional `claimSet` typed as `GovernedClaimSet`, `observations`, `requestedConflictClasses`, `referenceTime`, `createdAt`, `evaluationDiscriminator`, and optional `priorEvaluationId`.
* `ConflictEvaluation` and `GovernedConflictSet` each currently publish `governedClaimSetId` as the evaluated-set reference.
* `GovernedConversationalProjectionInput` currently accepts `claimBoundaryEvaluation`, `governedClaimSet`, optional `conflictEvaluation`, and optional `governedConflictSet` alongside its projection evidence and summary fields. `GovernedConversationalProjection` currently publishes base Claim Boundary lineage through `claimBoundaryRulesetId`, `claimBoundaryEvaluationId`, and `governedClaimSetId`, but publishes none of `enrichmentRulesetId`, `enrichmentEvaluationId`, `enrichedGovernedClaimSetId`, or an enriched-to-base claim lineage collection.
* The current composer checks that classification, boundary-evaluation, and Claim Set identities agree; that the conversational lineage agrees; and that supplied claims equal the Claim Set claims. It does not validate an enrichment evaluation or enriched Claim Set publication.
* The exact Sprint 3.105 evaluation-only alias is confirmed as `{ ...set, schemaVersion: "1" as const, governedClaimSetId: set.enrichedGovernedClaimSetId }` in `conflictBoundaryView`. The mutation proof separately confirms that changed enriched status and changed factual values can leave conflict evaluation outcomes unchanged because observations are supplied independently.
* Repository evidence supports every central premise. The only changed file is this document.

## **111\. Findings Reconfirmed**

### **Field-shape mismatch**

> `GovernedClaimSet` and `EnrichedGovernedClaimSet` are distinct immutable publications and cannot be substituted through ID aliasing.

The mismatch is exact: conflict input requires the base publication type, while enrichment publishes a distinct identity, lineage, and claim shape. The evaluation-only alias demonstrates the seam without establishing a production architecture.

### **Lost lineage**

> The current projection cannot first-class identify the enrichment ruleset, enrichment evaluation, enriched Claim Set, or enriched-to-base claim relationships.

## **112\. Claim-Set Options Decision**

* **Option A — Selected.** A closed base/enriched discriminator preserves truthful publication type and identity while allowing reuse of the conflict algorithm.
* **Option B — Rejected.** An adapter to the base shape misrepresents publication ownership, aliases identity, and loses enrichment lineage or creates a competing publication.
* **Option C — Rejected.** Enriched-only evaluation would invalidate legitimate base-only, failed-enrichment, and historical flows while coupling conflict evaluation unnecessarily to enrichment.

No adapter forcing one publication shape into the other is authorized.

## **113\. Projection Options Decision**

* **Projection Lineage Option A — Selected.** Enrichment lineage is conditional but structurally complete.
* **Projection Lineage Option B — Rejected.** Requiring enrichment fields for base-only projections would manufacture lineage that does not exist.
* **Projection Lineage Option C — Rejected.** Independently optional fields permit partial, ambiguous lineage and fail structural completeness.

## **114\. Exact New Fields**

The future implementation shall add:

* `claimPublicationStage`;
* `baseGovernedClaimSetId`;
* `enrichmentRulesetId`;
* `enrichmentEvaluationId`;
* `enrichedGovernedClaimSetId`; and
* `enrichedClaimBaseReferences`.

For a base variant, `claimPublicationStage` is `"base"`, `baseGovernedClaimSetId` is required and equals the actual base `governedClaimSetId`, and every enrichment-specific field is absent. For an enriched variant, `claimPublicationStage` is `"enriched"` and every listed lineage field is required; `enrichedClaimBaseReferences` contains the complete one-to-one enriched-claim-to-base-claim lineage. These fields are not independently optional.

## **115\. Conflict Publication Decision**

`ConflictEvaluation` and `GovernedConflictSet` shall publish the same `evaluatedClaimSetReference` and `baseGovernedClaimSetId`. For a base variant, the reference identifies the base publication, `baseGovernedClaimSetId` equals its publication ID, and `enrichmentEvaluationId` and `enrichedGovernedClaimSetId` are absent. For an enriched variant, the reference identifies the enriched publication, `baseGovernedClaimSetId` retains the recognition publication, and both `enrichmentEvaluationId` and `enrichedGovernedClaimSetId` are required and equal their validated upstream identities.

## **116\. Identity Integrity**

> `governedClaimSetId` continues to identify only the base Claim Boundary publication. It shall never contain or alias `enrichedGovernedClaimSetId`.

The selected discriminated architecture carries the actual evaluated publication in `evaluatedClaimSetReference` and separately carries base and conditional enrichment lineage. Each immutable identity therefore continues to name exactly one canonical publication. The rejected adapter would violate Identity Integrity by relabeling the enriched object as a base Claim Set or by manufacturing a redundant third publication.

## **117\. Composer Option A**

> The composer remains validate/aggregate-only. The new behaviour validates and passes through already-published enrichment lineage; it does not derive enrichment.

## **118\. Sprint 3.103 Compatibility**

> Sprint 3.103’s base/enriched identity distinction remains fully binding. Base publications remain immutable, enriched publications retain distinct identities, and conflicts reference enriched claim IDs after enrichment.

## **119\. Mutation Finding**

> Sprint 3.106 does not claim to solve the Sprint 3.105 mutation-integrity finding. A future implementation must retest it and report whether separate integrity governance remains necessary.

Lineage completeness enables later integrity work but does not prove claim-body consistency with independently supplied conflict observations. No mutation-integrity validator is authorized here.

## **120\. Responsibility Audit**

| Question | Binding answer |
| ----- | ----- |
| May the enriched Claim Set be passed as a false base Claim Set? | No |
| Does the conflict engine accept base Claim Sets? | Yes |
| Does the conflict engine accept enriched Claim Sets? | Yes |
| How are they distinguished? | Closed `claimSetKind` discriminator |
| Does one generic ID field identify both? | No |
| Is the actual evaluated publication ID retained? | Yes |
| Is the base Claim Set ID retained for enriched evaluation? | Yes |
| Is enrichment evaluation identity retained in conflict publications? | Yes |
| Are conflict cells linked to enriched claim IDs after enrichment? | Yes |
| May base and enriched claims both be canonically evaluated in the same run? | No |
| Does the projection always retain base recognition lineage? | Yes |
| Does an enriched projection retain enrichment lineage? | Yes, completely |
| Are enrichment fields required for base-only projection? | No |
| Are enrichment fields independently optional? | No |
| Is a stage discriminator required? | Yes |
| Does the composer derive enrichment? | No |
| Does the composer validate enrichment publication consistency? | Yes |
| Does the composer pass enrichment lineage through? | Yes |
| Does the composer still compute effective status? | Yes |
| Does `governedClaimSetId` retain its base-publication meaning? | Yes |
| May it alias `enrichedGovernedClaimSetId`? | No |
| Is the Sprint 3.105 mutation gap solved by this contract? | No |
| Does this contract authorize implementation? | No |

**Decision:** Responsibility Audit passes.

## **121\. No-Implementation Statement**

> Sprint 3.106 authorizes no implementation or production integration.

## **122\. Validation Results**

* `npm test` — passed: 161 test files; 765 tests passed and 1 skipped (766 total).
* `npm run build` — passed: optimized production build, type/lint validation, six static pages, and build traces completed. Google Fonts stylesheet optimization was skipped after a download failure without failing the build.
* `npm run lint` — passed with no warnings or errors.
* `npm run typecheck` — passed.
* `git diff --check` — passed.

## **123\. Files Changed**

The only changed file is:

```text
docs/SPRINT-3.106-GOVERNED-ENRICHMENT-COMPOSITION-CORRECTION-CONTRACT.md
```

No code, type, or test file changed.

## **124\. Next Step**

> **Sprint 3.107 — Enrichment Composition Correction Implementation**

## **125\. Final Recommendation**

Both Sprint 3.105 composition findings are governed without claiming that lineage solves mutation integrity. Claim-Set Composition Option A and Projection Lineage Option A are selected exactly as drafted; all rejected options remain unavailable; identity meanings, structural optionality, Composer Option A, Sprint 3.103, and the no-implementation boundary remain intact; repository evidence is consistent; and the full validation suite passes.

> **Governed Contract Complete**
