# **Sprint 3.107 — Enrichment Composition Correction Implementation**

**Status:** Specification  
**Sprint Type:** Governed Composition Correction Implementation  
**Implementation Authority:** Sprint 3.106 — Governed Enrichment Composition Correction Contract  
**Production Integration:** Prohibited  
**Direct Implementation Precedents:** Sprints 3.86 and 3.95  
**Output Path:** `docs/SPRINT-3.107-ENRICHMENT-COMPOSITION-CORRECTION-IMPLEMENTATION.md`

---

## **1\. Purpose**

Sprint 3.107 implements the two binding corrections established by Sprint 3.106:

1. **Claim-Set Composition Option A**  
   The conflict boundary shall accept a closed discriminated union of truthful base and enriched Claim Set publications.  
2. **Projection Lineage Option A**  
   The projection shall preserve conditionally complete enrichment lineage whenever enriched claims are canonical.

The implementation shall remove the Sprint 3.105 evaluation-only alias:

enrichedGovernedClaimSetId  
    ↓  
governedClaimSetId

and replace it with a production-authorized architecture in which:

base GovernedClaimSet

and:

EnrichedGovernedClaimSet

remain constitutionally distinct publications under their own identities.

The corrected chain shall be:

Claim Boundary Evaluation  
    ↓  
GovernedClaimSet  
    ↓  
Evidence-to-Claim Enrichment Evaluation  
    ↓  
EnrichedGovernedClaimSet  
    ↓  
ConflictEngineInput.claimSet  
    claimSetKind \= "enriched"  
    claimSetPublicationId \= enrichedGovernedClaimSetId  
    ↓  
Conflict Evaluation  
    ↓  
GovernedConflictSet  
    ↓  
GovernedConversationalProjection  
    claimPublicationStage \= "enriched"  
    complete base \+ enrichment lineage

This sprint does not resolve the separate Sprint 3.105 mutation-integrity finding.

---

## **2\. Central Proof**

Sprint 3.107 succeeds only if the existing Sprint 3.105 seams now pass for governed reasons:

### **Conflict-boundary seam**

Before:

EnrichedGovernedClaimSet  
    ↓  
evaluation-only alias  
    ↓  
GovernedClaimSet-shaped object

After:

EnrichedGovernedClaimSet  
    ↓  
claimSetKind \= "enriched"  
    ↓  
truthful ConflictEvaluableClaimSet

### **Projection-lineage seam**

Before:

projection  
    ├── claimBoundaryRulesetId  
    ├── claimBoundaryEvaluationId  
    └── governedClaimSetId

After, when enriched:

projection  
    ├── claimPublicationStage \= "enriched"  
    ├── claimBoundaryRulesetId  
    ├── claimBoundaryEvaluationId  
    ├── governedClaimSetId  
    ├── baseGovernedClaimSetId  
    ├── enrichmentRulesetId  
    ├── enrichmentEvaluationId  
    ├── enrichedGovernedClaimSetId  
    └── enrichedClaimBaseReferences

The implementation shall prove:

* the conflict engine receives the enriched publication under its actual identity;  
* conflict cells use enriched claim IDs;  
* base claim IDs remain lineage only;  
* the projection validates the complete enrichment publication chain;  
* no enriched ID is written into `governedClaimSetId`;  
* the composer continues to validate and aggregate only.

---

## **3\. Sprint Character**

This is a correction implementation sprint.

It may modify existing files under Sprint 3.106 authority.

It may:

* add discriminated claim-set types;  
* modify `ConflictEngineInput`;  
* update conflict evaluation and Conflict Set publication fields;  
* update the conflict engine’s validation and identity construction;  
* update conflict fixtures and tests;  
* extend projection input and output types;  
* add conditional enrichment-lineage validation;  
* update projection identity construction;  
* update composition and regression harnesses;  
* remove the Sprint 3.105 evaluation-only alias;  
* rerun all required scenario matrices;  
* rerun the existing mutation proof.

It shall not:

* modify claim recognition semantics;  
* modify enrichment semantics;  
* change the enrichment ruleset;  
* change source publishers;  
* change source acquisition;  
* change source assembly;  
* change conflict taxonomy;  
* change per-cell conflict logic;  
* derive enrichment inside the composer;  
* derive conflicts inside the composer;  
* add a new mutation-integrity validator;  
* modify `/api/chat`;  
* promote the governed runtime.

---

## **4\. Governing Hierarchy**

Apply:

1. JARVIS Engineering Constitution;  
2. JARVIS North Star;  
3. JARVIS Engineering Specification Standard;  
4. Constitutional Publication Principles;  
5. Roadmap;  
6. Sprint 3.82 — Conversational Lineage Identity Contract;  
7. Sprint 3.85 — Conversational Identity Correction Contract;  
8. Sprint 3.89 — Claims Boundary Contract;  
9. Sprint 3.90 — Conflicts Boundary Contract;  
10. Sprint 3.94 — Claims and Conflicts Composition Correction Contract;  
11. Sprint 3.95 — Claims and Conflicts Composition Correction Implementation;  
12. Sprint 3.103 — Evidence-to-Claim Enrichment Contract;  
13. Sprint 3.104 — Enrichment Implementation;  
14. Sprint 3.105 — Enrichment Composition Re-Check;  
15. Sprint 3.106 — binding correction contract;  
16. current repository implementation;  
17. this specification.

Sprint 3.106 governs every design decision in this sprint.

No design decision from Sprint 3.106 may be reopened.

---

# **Part I — Repository Precondition**

## **5\. Required Documents**

Before editing, confirm and read completely:

docs/SPRINT-3.82-GOVERNED-CONVERSATIONAL-LINEAGE-IDENTITY-CONTRACT.md  
docs/SPRINT-3.85-GOVERNED-CONVERSATIONAL-IDENTITY-CORRECTION-CONTRACT.md  
docs/SPRINT-3.86-GOVERNED-CONVERSATIONAL-IDENTITY-CORRECTION-IMPLEMENTATION.md  
docs/SPRINT-3.89-GOVERNED-CONVERSATIONAL-CLAIMS-BOUNDARY-CONTRACT.md  
docs/SPRINT-3.90-GOVERNED-CONVERSATIONAL-CONFLICTS-BOUNDARY-CONTRACT.md  
docs/SPRINT-3.94-GOVERNED-CLAIMS-AND-CONFLICTS-COMPOSITION-CORRECTION-CONTRACT.md  
docs/SPRINT-3.95-CLAIMS-AND-CONFLICTS-COMPOSITION-CORRECTION-IMPLEMENTATION.md  
docs/SPRINT-3.103-GOVERNED-EVIDENCE-TO-CLAIM-ENRICHMENT-CONTRACT.md  
docs/SPRINT-3.104-ISOLATED-EVIDENCE-TO-CLAIM-ENRICHMENT-IMPLEMENTATION.md  
docs/SPRINT-3.105-FULL-ASSEMBLY-COMPOSITION-RECHECK-WITH-ENRICHMENT.md  
docs/SPRINT-3.106-GOVERNED-ENRICHMENT-COMPOSITION-CORRECTION-CONTRACT.md  
docs/CONSTITUTIONAL-PUBLICATION-PRINCIPLES.md  
docs/architecture/ROADMAP.md

---

## **6\. Exact Contract Extraction**

Before writing code, extract directly from Sprint 3.106 and record in the completion report:

### **Claim-set discriminator**

claimSetKind:  
    "base"  
    | "enriched"

### **Publication-type discriminator**

claimSetPublicationType:  
    "governed\_claim\_set"  
    | "enriched\_governed\_claim\_set"

### **Canonical publication identity**

claimSetPublicationId

### **Base conflict-evaluable fields**

claimSetKind  
claimSetPublicationId  
claimSetPublicationType  
schemaVersion  
governedClaimSetId  
claimBoundaryRulesetId  
claimBoundaryEvaluationId  
threadId  
requestId  
exchangeId  
referenceTime  
createdAt  
claims  
claimIds  
segmentLinks

### **Enriched conflict-evaluable fields**

claimSetKind  
claimSetPublicationId  
claimSetPublicationType  
schemaVersion  
enrichedGovernedClaimSetId  
baseGovernedClaimSetId  
enrichmentEvaluationId  
claimBoundaryRulesetId  
claimBoundaryEvaluationId  
threadId  
requestId  
exchangeId  
referenceTime  
createdAt  
claims  
claimIds  
segmentLinks

### **Projection stage discriminator**

claimPublicationStage:  
    "base"  
    | "enriched"

### **Required projection lineage fields**

baseGovernedClaimSetId  
enrichmentRulesetId  
enrichmentEvaluationId  
enrichedGovernedClaimSetId  
enrichedClaimBaseReferences

Do not approximate or rename these fields.

---

## **7\. Required Source Inspection**

Read completely:

lib/governed-conversation/claim-boundary-types.ts  
lib/governed-conversation/claim-enrichment-types.ts  
lib/governed-conversation/claim-enrichment-publications.ts

lib/governed-conversation/conflict-boundary-types.ts  
lib/governed-conversation/conflict-boundary-engine.ts  
lib/governed-conversation/conflict-boundary-publications.ts  
lib/governed-conversation/conflict-boundary-engine.test.ts  
lib/governed-conversation/conflict-boundary-publications.test.ts

lib/governed-conversation/projection-composer.ts  
lib/governed-conversation/projection-composer.test.ts

lib/governed-conversation/full-assembly-claim-boundary-conflict-boundary-composition-regression.ts  
lib/governed-conversation/full-assembly-claim-boundary-conflict-boundary-composition-regression.test.ts

lib/governed-conversation/full-assembly-enrichment-composition-recheck.ts  
lib/governed-conversation/full-assembly-enrichment-composition-recheck.test.ts

Also search exhaustively for:

ConflictEngineInput  
GovernedClaimSet  
EnrichedGovernedClaimSet  
governedClaimSetId  
enrichedGovernedClaimSetId  
claimBoundaryRulesetId  
claimBoundaryEvaluationId  
conflictEvaluationId  
governedConflictSetId  
composeGovernedConversationalProjection  
runFullAssemblyRegressionMatrix  
runFullAssemblyEnrichmentRecheckMatrix  
runEnrichedClaimMutationProof

---

## **8\. Starting State**

Record:

* repository;  
* active branch;  
* starting commit;  
* working-tree state;  
* required file presence;  
* exact current type shapes;  
* exact current conflict publication shapes;  
* exact current projection fields;  
* exact current consistency checks;  
* exact location of the Sprint 3.105 alias;  
* exact mutation-proof implementation;  
* expected changed files.

If the repository differs materially from Sprint 3.106’s premises, stop.

Return:

> **Correction Implementation Incomplete**

---

# **Part II — Conflict-Evaluable Claim-Set Architecture**

## **9\. Required Type Architecture**

Implement:

export type ConflictEvaluableClaimSet \=  
  | BaseConflictEvaluableClaimSet  
  | EnrichedConflictEvaluableClaimSet;

The type shall be a real closed discriminated union.

It shall not be:

* an intersection;  
* a partial type;  
* a loose object with optional enriched fields;  
* a base type with an ID alias;  
* a type cast used only at call sites.

---

## **10\. Base Variant**

Implement the exact semantic shape:

export interface BaseConflictEvaluableClaimSet {  
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

  readonly claims: GovernedClaimSet\["claims"\];  
  readonly claimIds: GovernedClaimSet\["claimIds"\];  
  readonly segmentLinks: GovernedClaimSet\["segmentLinks"\];  
}

Binding invariant:

claimSetPublicationId  
    \=  
governedClaimSetId

The implementation may make the existing `GovernedClaimSet` structurally satisfy this variant through an explicit constructor or publication-view function.

It shall not mutate historical `GovernedClaimSet` publications in place merely to add discriminator fields after publication.

---

## **11\. Enriched Variant**

Implement the exact semantic shape:

export interface EnrichedConflictEvaluableClaimSet {  
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

  readonly claims: EnrichedGovernedClaimSet\["claims"\];  
  readonly claimIds: EnrichedGovernedClaimSet\["claimIds"\];  
  readonly segmentLinks: EnrichedGovernedClaimSet\["segmentLinks"\];  
}

Binding invariant:

claimSetPublicationId  
    \=  
enrichedGovernedClaimSetId

The enriched variant shall retain:

baseGovernedClaimSetId  
enrichmentEvaluationId

without relabeling either.

---

## **12\. Ruleset Identity Gap**

Sprint 3.106’s enriched conflict-evaluable shape requires:

claimBoundaryRulesetId  
claimBoundaryEvaluationId

The current `EnrichedGovernedClaimSet` already carries both.

It does not currently carry:

enrichmentRulesetId

as a Claim Set field; that identity exists on the owning enrichment evaluation.

Do not add an ungoverned `enrichmentRulesetId` to the conflict-evaluable set merely for convenience unless Sprint 3.106 explicitly requires it there.

The conflict-evaluable enriched variant requires:

enrichmentEvaluationId

and downstream conflict publications may derive the enrichment ruleset only from the canonical enrichment evaluation supplied separately where required.

Do not infer it from string patterns.

---

## **13\. Constructors**

Add explicit pure constructors or publication-view functions equivalent to:

constructBaseConflictEvaluableClaimSet(  
  set: GovernedClaimSet  
): BaseConflictEvaluableClaimSet

constructEnrichedConflictEvaluableClaimSet(  
  set: EnrichedGovernedClaimSet  
): EnrichedConflictEvaluableClaimSet

These are not adapters that collapse publication meaning.

They add the closed conflict-boundary discriminator while preserving the actual publication identity.

Required:

base publication  
    → base discriminator  
    → same base identity

enriched publication  
    → enriched discriminator  
    → same enriched identity

No new claim-set publication identity is created.

---

## **14\. Constructor Validation**

The base constructor shall reject:

* empty `governedClaimSetId`;  
* duplicate claim IDs;  
* segment links to unknown claims;  
* missing schema version;  
* publication-ID mismatch.

The enriched constructor shall reject:

* empty `enrichedGovernedClaimSetId`;  
* empty `baseGovernedClaimSetId`;  
* empty `enrichmentEvaluationId`;  
* enriched ID equal to base ID;  
* duplicate enriched claim IDs;  
* enriched claim with missing `baseClaimId`;  
* enriched claim whose `claimId === baseClaimId`;  
* segment links to unknown enriched claims;  
* publication-ID mismatch.

---

## **15\. ConflictEngineInput**

Modify:

export interface ConflictEngineInput {  
  readonly claimSet?: ConflictEvaluableClaimSet;  
  ...  
}

The engine shall no longer require the exact historical `GovernedClaimSet` type.

It shall require the discriminated conflict-evaluable type.

No `any`, broad cast, or generic record is permitted.

---

# **Part III — Conflict Engine Handling**

## **16\. Shared Claim-Set Access**

The engine may define internal helpers for common fields:

claims  
claimIds  
segmentLinks  
threadId  
requestId  
exchangeId  
referenceTime  
createdAt  
claimBoundaryRulesetId  
claimBoundaryEvaluationId  
claimSetPublicationId

The shared algorithm shall not erase:

claimSetKind  
claimSetPublicationType

or conditional enrichment lineage.

---

## **17\. Base Validation**

When:

claimSetKind \= "base"

validate:

claimSetPublicationType  
    \=  
"governed\_claim\_set"

claimSetPublicationId  
    \=  
governedClaimSetId

The engine shall evaluate base claim IDs.

No enrichment fields shall exist on the base variant.

---

## **18\. Enriched Validation**

When:

claimSetKind \= "enriched"

validate:

claimSetPublicationType  
    \=  
"enriched\_governed\_claim\_set"

claimSetPublicationId  
    \=  
enrichedGovernedClaimSetId

enrichedGovernedClaimSetId  
    ≠  
baseGovernedClaimSetId

Every enriched claim shall have:

baseClaimId

and:

claimId ≠ baseClaimId

The engine shall evaluate enriched `claimId` values only.

---

## **19\. Observation Linkage**

For each supplied observation:

observation.affectedClaimId

shall identify a claim in:

claimSet.claimIds

### **Base input**

The affected ID shall be a base claim ID.

### **Enriched input**

The affected ID shall be an enriched claim ID.

An observation pointing to a base claim while the canonical input is enriched shall fail closed under the existing claim-linkage failure semantics.

Do not translate IDs automatically.

---

## **20\. Per-Cell Logic**

Preserve Sprint 3.94/3.95 semantics exactly:

each supplied claim  
    ×  
each requested conflict class

The following shall remain unchanged:

* eligible claim types;  
* executable conflict classes;  
* unsupported conflict classes;  
* `claim_type_outside_ruleset`;  
* source-availability rules;  
* coverage rules;  
* no-conflict proof;  
* conflict derivation;  
* restrict-don’t-adjudicate;  
* no `selectedSourceOwnerId`.

The only change is the truthful claim-set publication boundary.

---

# **Part IV — Conflict Publication Migration**

## **21\. Evaluated Claim Set Reference**

Implement:

export interface EvaluatedClaimSetReference {  
  readonly publicationId: string;  
  readonly publicationType:  
    | "governed\_claim\_set"  
    | "enriched\_governed\_claim\_set";  
  readonly claimSetKind:  
    | "base"  
    | "enriched";  
  readonly schemaVersion: "1";  
}

This reference shall identify the actual publication evaluated.

---

## **22\. ConflictEvaluation Fields**

Modify `ConflictEvaluation` to carry:

evaluatedClaimSetReference  
baseGovernedClaimSetId  
enrichmentEvaluationId?  
enrichedGovernedClaimSetId?

### **Base evaluation**

evaluatedClaimSetReference.publicationId  
    \=  
base governedClaimSetId

evaluatedClaimSetReference.publicationType  
    \=  
"governed\_claim\_set"

evaluatedClaimSetReference.claimSetKind  
    \=  
"base"

baseGovernedClaimSetId  
    \=  
governedClaimSetId

Absent:

enrichmentEvaluationId  
enrichedGovernedClaimSetId

### **Enriched evaluation**

evaluatedClaimSetReference.publicationId  
    \=  
enrichedGovernedClaimSetId

evaluatedClaimSetReference.publicationType  
    \=  
"enriched\_governed\_claim\_set"

evaluatedClaimSetReference.claimSetKind  
    \=  
"enriched"

Required:

baseGovernedClaimSetId  
enrichmentEvaluationId  
enrichedGovernedClaimSetId

---

## **23\. GovernedConflictSet Fields**

Modify `GovernedConflictSet` to carry the same:

evaluatedClaimSetReference  
baseGovernedClaimSetId  
enrichmentEvaluationId?  
enrichedGovernedClaimSetId?

The Conflict Set shall agree exactly with its owning `ConflictEvaluation`.

---

## **24\. Existing `governedClaimSetId`**

Sprint 3.106 permits one of two mechanical migrations:

1. remove ambiguous generic usage; or  
2. retain temporarily as a deprecated base-lineage alias.

For this sprint, select and document one concrete implementation.

Preferred migration:

retain governedClaimSetId temporarily

with its binding meaning narrowed to:

base GovernedClaimSet identity only

This minimizes migration risk while preserving truth.

If retained:

### **Base evaluation**

governedClaimSetId  
    \=  
baseGovernedClaimSetId  
    \=  
evaluated publication ID

### **Enriched evaluation**

governedClaimSetId  
    \=  
baseGovernedClaimSetId

and explicitly:

governedClaimSetId  
    ≠  
enrichedGovernedClaimSetId

It shall never again contain the enriched set identity.

The completion report shall state whether this preferred migration was used.

---

## **25\. Conflict Identity Construction**

Update conflict evaluation and Conflict Set identity bodies so they include:

evaluatedClaimSetReference  
baseGovernedClaimSetId  
enrichmentEvaluationId, when enriched  
enrichedGovernedClaimSetId, when enriched

Changing the evaluated publication kind or identity shall change:

conflictEvaluationId  
governedConflictSetId

where applicable.

---

## **26\. Publication Consistency**

Before returning a Conflict Set, validate:

evaluation.evaluatedClaimSetReference  
    \=  
conflictSet.evaluatedClaimSetReference

evaluation.baseGovernedClaimSetId  
    \=  
conflictSet.baseGovernedClaimSetId

For enriched input:

evaluation.enrichmentEvaluationId  
    \=  
conflictSet.enrichmentEvaluationId

evaluation.enrichedGovernedClaimSetId  
    \=  
conflictSet.enrichedGovernedClaimSetId

---

# **Part V — Projection Input Architecture**

## **27\. Claim Publication Stage**

Add to `GovernedConversationalProjectionInput`:

readonly claimPublicationStage:  
  | "base"  
  | "enriched";

This field is mandatory.

---

## **28\. Base Publications Remain Required**

Every projection input shall continue to supply:

claimBoundaryEvaluation  
governedClaimSet

The base recognition publications remain required even when enriched claims are canonical.

They provide immutable recognition lineage.

---

## **29\. Conditional Enrichment Publications**

Add:

readonly enrichmentEvaluation?:  
  EvidenceToClaimEnrichmentEvaluation;

readonly enrichedGovernedClaimSet?:  
  EnrichedGovernedClaimSet;

These form one conditional group.

### **Base stage**

Both absent.

### **Enriched stage**

Both required.

A partial group is invalid.

---

## **30\. Projection Input Claims**

### **Base stage**

input.claims  
    \=  
input.governedClaimSet.claims

### **Enriched stage**

input.claims  
    \=  
input.enrichedGovernedClaimSet.claims

The composer shall validate equality.

It shall not create or transform claim bodies.

---

# **Part VI — Projection Output Architecture**

## **31\. Required Existing Fields**

Retain:

claimBoundaryRulesetId  
claimBoundaryEvaluationId  
governedClaimSetId

Their meaning remains base recognition lineage.

---

## **32\. Add Required Stage Field**

Add:

readonly claimPublicationStage:  
  | "base"  
  | "enriched";

---

## **33\. Add Required Base Field**

Add:

readonly baseGovernedClaimSetId: string;

Binding equality:

baseGovernedClaimSetId  
    \=  
governedClaimSetId

for both stages.

---

## **34\. Add Conditional Enrichment Fields**

Add:

readonly enrichmentRulesetId?: string;  
readonly enrichmentEvaluationId?: string;  
readonly enrichedGovernedClaimSetId?: string;  
readonly enrichedClaimBaseReferences?:  
  readonly {  
    readonly claimId: string;  
    readonly baseClaimId: string;  
  }\[\];

These fields are conditionally complete.

They are not independently optional.

---

## **35\. Base Projection Shape**

When:

claimPublicationStage \= "base"

required:

governedClaimSetId  
baseGovernedClaimSetId

prohibited:

enrichmentRulesetId  
enrichmentEvaluationId  
enrichedGovernedClaimSetId  
enrichedClaimBaseReferences

---

## **36\. Enriched Projection Shape**

When:

claimPublicationStage \= "enriched"

required:

governedClaimSetId  
baseGovernedClaimSetId  
enrichmentRulesetId  
enrichmentEvaluationId  
enrichedGovernedClaimSetId  
enrichedClaimBaseReferences

Required inequality:

enrichedGovernedClaimSetId  
    ≠  
governedClaimSetId

enrichedGovernedClaimSetId  
    ≠  
baseGovernedClaimSetId

---

# **Part VII — Composer Validation**

## **37\. Existing Base-Lineage Validation**

Preserve the existing checks:

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

## **38\. Stage Validation**

The composer shall branch only on:

claimPublicationStage

It shall not infer stage from:

* presence of `baseClaimId`;  
* field names;  
* claim status;  
* enrichment IDs;  
* source references.

---

## **39\. Base-Stage Validation**

When base:

1. `enrichmentEvaluation` is absent;  
2. `enrichedGovernedClaimSet` is absent;  
3. all conditional enrichment output fields are absent;  
4. `claims` equals `governedClaimSet.claims`;  
5. every conflict evaluation uses a base evaluated-set reference;  
6. every affected claim ID is a base claim ID.

---

## **40\. Enriched-Stage Validation**

When enriched, validate:

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
    is non-empty

claims  
    \=  
enrichedGovernedClaimSet.claims

Every enriched claim shall satisfy:

baseClaimId  
    exists in governedClaimSet.claimIds

claimId  
    exists in enrichedGovernedClaimSet.claimIds

claimId  
    ≠  
baseClaimId

---

## **41\. Enriched Claim Base References**

Construct the projection field as a pass-through summary of validated enriched claims:

enrichedClaimBaseReferences \=  
    enriched claims.map({  
      claimId,  
      baseClaimId  
    })

This operation is permitted aggregation.

The composer shall not infer a base claim through semantic matching.

It copies the explicit `baseClaimId` already published by enrichment.

Sort deterministically if required by existing canonicalization conventions.

---

## **42\. Conflict Evaluation Validation**

For base stage:

conflictEvaluation.evaluatedClaimSetReference.publicationId  
    \=  
governedClaimSet.governedClaimSetId

claimSetKind \= "base"

For enriched stage:

conflictEvaluation.evaluatedClaimSetReference.publicationId  
    \=  
enrichedGovernedClaimSet.enrichedGovernedClaimSetId

claimSetKind \= "enriched"

Also validate:

conflictEvaluation.baseGovernedClaimSetId  
    \=  
governedClaimSet.governedClaimSetId

and, when enriched:

conflictEvaluation.enrichmentEvaluationId  
    \=  
enrichmentEvaluation.enrichmentEvaluationId

conflictEvaluation.enrichedGovernedClaimSetId  
    \=  
enrichedGovernedClaimSet.enrichedGovernedClaimSetId

---

## **43\. Conflict Set Validation**

Apply identical claim-set lineage checks to `GovernedConflictSet`.

The composer shall reject:

* evaluation and set with different evaluated publication references;  
* set linked to base while evaluation is enriched;  
* enriched set missing enrichment identity;  
* base set carrying enrichment identity;  
* conflict set referencing a different base Claim Set.

---

## **44\. Claim and Conflict ID Validation**

For enriched stage:

* every projected claim ID shall be enriched;  
* every conflict affected claim ID shall be enriched;  
* every effective-claim-status claim ID shall be enriched;  
* every `baseClaimId` remains lineage only;  
* no conflict shall directly affect a base claim ID.

For base stage, existing behaviour remains.

---

## **45\. Composer Option A Proof**

Add a targeted test proving the composer:

* rejects incomplete enrichment publications;  
* rejects mismatched identities;  
* accepts complete validated publications;  
* copies lineage fields to output;  
* computes effective status from supplied claim status and supplied conflict restrictions only;  
* does not call enrichment;  
* does not call evidence resolution;  
* does not derive factual values;  
* does not derive conflicts.

Required direct import search:

projection-composer.ts

shall not import:

claim-enrichment-engine  
claim-enrichment-ruleset  
source-evidence resolver  
conflict-boundary-engine

Type imports and publication types are permitted.

Runtime derivation imports are prohibited.

---

# **Part VIII — Projection Identity**

## **46\. Projection Identity Body**

Add to the canonical projection identity body:

claimPublicationStage  
baseGovernedClaimSetId  
enrichmentRulesetId, when enriched  
enrichmentEvaluationId, when enriched  
enrichedGovernedClaimSetId, when enriched  
enrichedClaimBaseReferences, when enriched

Changing enrichment lineage shall change:

projectionId

---

## **47\. Base Projection Replay**

For identical base input:

* projection ID remains deterministic;  
* no enrichment fields appear;  
* existing base scenario identities remain stable unless schema migration intentionally changes the canonical projection body.

Any expected identity changes caused by the newly required stage discriminator shall be documented.

---

## **48\. Enriched Projection Replay**

For identical enriched input:

* all enrichment fields are stable;  
* projection ID is stable;  
* changing only `enrichmentEvaluationId` changes projection ID;  
* changing only `enrichedGovernedClaimSetId` changes projection ID;  
* changing a `baseClaimId` relationship changes projection ID.

---

# **Part IX — Call-Site Migration**

## **49\. Exhaustive Search**

Find every caller constructing:

ConflictEngineInput

and every caller constructing:

GovernedConversationalProjectionInput

Migrate all live consumers.

Do not assume the surface is limited to:

* Sprint 3.102 harness;  
* Sprint 3.105 harness;  
* direct unit tests.

Search repository-wide.

---

## **50\. Base Conflict Callers**

Existing base-only callers shall construct:

BaseConflictEvaluableClaimSet

through the governed constructor.

Do not populate discriminator fields manually at every call site where a shared constructor is available.

---

## **51\. Enriched Conflict Callers**

Enriched callers shall construct:

EnrichedConflictEvaluableClaimSet

through the governed constructor.

Delete:

conflictBoundaryView(...)

from the Sprint 3.105 re-check.

No ID alias shall remain.

---

## **52\. Projection Callers**

Every projection caller shall set:

claimPublicationStage

Base callers supply no enrichment publications.

Enriched callers supply:

enrichmentEvaluation  
enrichedGovernedClaimSet

The composer shall derive its output lineage only by validating and passing through those publications.

---

# **Part X — Historical Evaluation Preservation**

## **53\. Sprint 3.105 Historical Finding**

Sprint 3.105’s completion report remains unchanged.

Its finding that the alias was required remains historically true.

Do not rewrite the report.

---

## **54\. Re-Check Harness**

The Sprint 3.105 evaluation harness is current executable code, not merely a frozen report.

It shall be migrated so that:

* `conflictBoundaryView` is deleted;  
* enriched conflict input uses the new constructor;  
* projection input uses enriched-stage publications;  
* the two prior seam findings now evaluate the corrected architecture;  
* the mutation proof remains semantically the same.

The harness shall continue to report what the current architecture does.

---

## **55\. Historical Tests**

Tests explicitly asserting the old defect as historical evidence shall be reviewed carefully.

Distinguish:

### **Live regression tests**

Must be migrated to the corrected architecture.

### **String-literal historical records**

May remain unchanged if they document what Sprint 3.105 found and do not import retired live symbols.

List every deliberately unchanged historical file in the completion report.

---

# **Part XI — Central Regression Proof**

## **56\. Sprint 3.102 Matrix**

Run the real:

runFullAssemblyRegressionMatrix()

over:

FULL\_ASSEMBLY\_SCENARIO\_IDS

All ten scenarios shall execute.

The base architecture shall remain valid.

---

## **57\. Sprint 3.105 Enrichment Re-Check**

Run the real enrichment re-check matrix.

The same seams shall now report:

### **Enriched Claim Set → Conflict Evaluation**

Expected:

compatible

not:

bounded-adapter-needed

### **Projection enrichment lineage**

Expected:

compatible

not:

semantic-incompatibility

The test shall pass because:

* no alias exists;  
* the conflict engine accepts the enriched variant truthfully;  
* conflict publications retain both base and enrichment lineage;  
* the projection retains complete enrichment lineage;  
* consistency checks validate the chain.

Do not weaken or remove the old checks.

Replace their expected findings only after proving the corrected behaviour.

---

## **58\. Cassie Compound Scenario**

Required:

* base Claim Set remains immutable;  
* enrichment publishes distinct enriched IDs;  
* conflict engine receives `claimSetKind: "enriched"`;  
* evaluated publication ID equals `enrichedGovernedClaimSetId`;  
* `baseGovernedClaimSetId` remains the original base set;  
* contact conflict uses enriched claim ID;  
* importance receives the ineligible per-cell result;  
* projection stage is `enriched`;  
* all enrichment fields are present;  
* effective status remains restricted;  
* no source is selected.

---

## **59\. Single Contact, No Conflict**

Required:

base contact status  
    \=  
insufficient\_coverage

enriched contact status  
    \=  
available

conflict evaluation  
    \=  
evaluated\_no\_conflict

projection effective status  
    \=  
available

Complete enrichment lineage shall survive.

---

## **60\. Base-Only Compatibility**

At least one direct test shall prove:

claimSetKind \= "base"

continues to work.

Required:

* base conflict evaluation;  
* base Conflict Set;  
* base projection;  
* no enrichment fields;  
* no synthetic enrichment identity;  
* existing per-cell logic unchanged.

---

# **Part XII — Mutation Proof**

## **61\. Required Existing Function**

Re-run the real:

runEnrichedClaimMutationProof()

Do not replace it with a new mutation helper.

The function may be mechanically migrated to the new constructors and fields.

Its mutations shall remain:

1. enriched claim status changed after enrichment;  
2. enriched claim factual values changed after enrichment.

---

## **62\. Expected Honest Result**

Sprint 3.106 explicitly did not authorize resolution of this gap.

Therefore a likely valid result remains:

statusMutationSilentlyAccepted \= true  
factualValueMutationSilentlyAccepted \= true

If so, the completion report shall state plainly:

> The enrichment composition identity and projection-lineage defects are corrected. The separate mutation-integrity gap remains: conflict evaluation still operates on independently supplied observations and does not verify mutated enriched status or factual values against the enrichment publication.

This remaining gap does not make Sprint 3.107 incomplete if:

* the two authorized corrections are complete;  
* the mutation proof ran truthfully;  
* the result is reported honestly.

---

## **63\. Unexpected Mutation Detection**

If the corrected identity checks now detect one or both mutations without adding new semantic validation:

* report exactly which existing check detected it;  
* prove the detection comes from Sprint 3.106-authorized lineage consistency;  
* do not claim general factual integrity unless both body and source-observation consistency are genuinely verified.

---

## **64\. Prohibited Mutation Work**

Do not add:

* a new enrichment integrity validator;  
* a source-observation reconciliation engine;  
* a factual-value comparison rule;  
* a model check;  
* conflict observation derivation from enriched claims.

If such a mechanism is required, stop and report it as a future governance need.

---

# **Part XIII — Required Tests**

## **65\. Conflict-Evaluable Type Tests**

Prove:

1. base variant has exact discriminator;  
2. enriched variant has exact discriminator;  
3. base publication ID equals base ID;  
4. enriched publication ID equals enriched ID;  
5. base and enriched IDs cannot alias;  
6. base variant rejects enrichment fields;  
7. enriched variant requires base ID;  
8. enriched variant requires enrichment evaluation ID;  
9. enriched claims require `baseClaimId`;  
10. duplicate IDs fail closed.

---

## **66\. Conflict Engine Tests**

Prove:

11. base variant evaluates;  
12. enriched variant evaluates;  
13. enriched observations require enriched claim IDs;  
14. base observations cannot target enriched evaluation;  
15. per-cell logic remains unchanged;  
16. unsupported importance remains independently unevaluated;  
17. no whole-set rejection returns;  
18. no selected source owner is produced;  
19. evaluation publishes truthful evaluated-set reference;  
20. Conflict Set publishes matching lineage.

---

## **67\. Conflict Publication Tests**

Prove:

21. base evaluation carries base reference;  
22. enriched evaluation carries enriched reference;  
23. enriched evaluation carries base lineage;  
24. enriched evaluation carries enrichment evaluation ID;  
25. enriched Conflict Set matches evaluation;  
26. `governedClaimSetId`, if retained, always means base ID;  
27. enriched ID never appears in `governedClaimSetId`;  
28. changing evaluated publication changes evaluation identity.

---

## **68\. Projection Input Tests**

Prove:

29. `claimPublicationStage` is required;  
30. base stage rejects enrichment publications;  
31. enriched stage requires both enrichment publications;  
32. partial enrichment group fails;  
33. base claims must match base set;  
34. enriched claims must match enriched set;  
35. base-set lineage mismatch fails;  
36. enrichment-evaluation mismatch fails;  
37. enriched-set mismatch fails;  
38. unknown `baseClaimId` fails.

---

## **69\. Projection Output Tests**

Prove:

39. base output carries stage `base`;  
40. base output contains no enrichment fields;  
41. enriched output carries stage `enriched`;  
42. enriched output carries all required fields;  
43. enriched base-reference list is complete;  
44. no claim ID equals base claim ID;  
45. enriched set ID differs from base set ID;  
46. projection ID includes enrichment lineage;  
47. conflict restrictions apply to enriched IDs;  
48. effective status remains deterministic.

---

## **70\. Composer Option A Tests**

Prove:

49. no runtime import of enrichment engine;  
50. no runtime import of conflict engine;  
51. composer does not call evidence resolution;  
52. composer does not derive factual values;  
53. composer does not derive conflicts;  
54. composer only validates supplied publications;  
55. composer only passes through lineage;  
56. composer only performs existing effective-status aggregation.

---

## **71\. Full Regression Tests**

Prove:

57. all ten Sprint 3.102 scenarios execute;  
58. all ten Sprint 3.105 scenarios execute;  
59. bounded-adapter finding is resolved;  
60. projection-lineage incompatibility is resolved;  
61. Cassie compound remains correct;  
62. single-contact correction remains correct;  
63. unattested Memory remains excluded;  
64. connector fallback remains honest;  
65. conflict outcome distinctions remain;  
66. deterministic replay remains stable.

---

## **72\. Mutation Tests**

Prove:

67. `runEnrichedClaimMutationProof()` executes;  
68. baseline still completes;  
69. status mutation result is reported;  
70. factual-value mutation result is reported;  
71. no new integrity validator was added;  
72. remaining gap is not hidden.

---

# **Part XIV — Isolation**

## **73\. Protected Production Files**

Record pre/post blob hashes for:

app/api/chat/route.ts  
lib/context-builder.ts  
lib/useAgentConversation.ts  
lib/agents/chat-execution.ts

Expected:

byte-identical

---

## **74\. Additional Protected Boundaries**

Unless explicitly required by this sprint, preserve:

lib/governed-conversation/claim-boundary-engine.ts  
lib/governed-conversation/claim-enrichment-engine.ts  
lib/governed-conversation/source-evidence-assembly.ts  
lib/governed-conversation/evidence-status.ts  
lib/governed-conversation/model-invocation.ts  
lib/governed-conversation/validator.ts

Record hashes.

Any change requires an explicit reason tied to Sprint 3.106.

Core semantic changes are prohibited.

---

## **75\. Pure-Node Isolation Proof**

Use:

node:fs  
node:path  
node:crypto

Do not depend on:

rg  
execFileSync  
platform-specific shell traversal

for committed isolation validation.

Prove:

* no production chat import;  
* no context-builder import;  
* no conversation-hook import;  
* no new model dependency;  
* no route dependency.

---

# **Part XV — Expected File Surface**

## **76\. Expected Modified Files**

Expected modification candidates include:

lib/governed-conversation/conflict-boundary-types.ts  
lib/governed-conversation/conflict-boundary-engine.ts  
lib/governed-conversation/conflict-boundary-publications.ts

lib/governed-conversation/projection-composer.ts

lib/governed-conversation/full-assembly-claim-boundary-conflict-boundary-composition-regression.ts  
lib/governed-conversation/full-assembly-enrichment-composition-recheck.ts

---

## **77\. Expected Modified Tests**

Likely:

lib/governed-conversation/conflict-boundary-engine.test.ts  
lib/governed-conversation/conflict-boundary-publications.test.ts  
lib/governed-conversation/projection-composer.test.ts

lib/governed-conversation/full-assembly-claim-boundary-conflict-boundary-composition-regression.test.ts  
lib/governed-conversation/full-assembly-enrichment-composition-recheck.test.ts

Also migrate every other live consumer found by exhaustive search.

---

## **78\. Conditional New File**

A dedicated shared type/constructor file is permitted if it improves ownership, for example:

lib/governed-conversation/conflict-evaluable-claim-set.ts

Use only if:

* it prevents circular imports;  
* it gives the discriminated publication boundary one clear owner;  
* it does not create a new publication;  
* its role is documented.

Do not add it merely to avoid modifying the appropriate existing type file.

---

## **79\. Sprint Document**

docs/SPRINT-3.107-ENRICHMENT-COMPOSITION-CORRECTION-IMPLEMENTATION.md

---

## **80\. Changed-File Discipline**

Because this sprint modifies existing core types, the completion report shall list every changed file with:

* one-line reason;  
* governing Sprint 3.106 section;  
* whether the change is semantic, mechanical migration, test migration, or documentation.

No silent scope expansion.

---

# **Part XVI — Stop-and-Report Conditions**

## **81\. Contract Shape Conflict**

If the exact Sprint 3.106 discriminated shapes cannot be implemented without contradicting current immutable publication semantics, stop.

Do not collapse them into a generic partial type.

Return:

> **Correction Implementation Incomplete**

---

## **82\. Circular Ownership Conflict**

If implementing the union produces a circular dependency between:

* claim-boundary types;  
* enrichment types;  
* conflict types;

solve only through a neutral type-owner module if semantics remain unchanged.

If resolution would require moving or redefining publication authority, stop and report.

---

## **83\. Projection Derivation Pressure**

If the composer cannot retain enrichment lineage without deriving missing fields from claim contents, stop.

Required fields must come from supplied canonical publications.

Do not infer them.

---

## **84\. Conflict Algorithm Pressure**

If supporting enriched sets appears to require changing:

* conflict taxonomy;  
* comparison keys;  
* source admissibility;  
* per-cell eligibility;  
* conflict status restriction;  
* no-adjudication;

stop.

Sprint 3.107 authorizes input/publication correction, not conflict redesign.

---

## **85\. Mutation-Integrity Pressure**

If passing the required tests appears to require solving the mutation gap:

* do not add the solution;  
* preserve the proof;  
* report the remaining gap.

The expected unresolved mutation finding is not a reason to force broader scope.

---

## **86\. Historical Record Pressure**

If a test or evaluation file records the old defect as historical string data, do not rewrite it merely because the code is corrected.

Distinguish historical evidence from live consumers.

---

# **Part XVII — Validation**

## **87\. Targeted Validation**

Run and report independently:

conflict-evaluable claim-set tests  
conflict engine tests  
conflict publication tests  
projection composer tests  
Sprint 3.102 full matrix  
Sprint 3.105 enrichment re-check matrix  
runEnrichedClaimMutationProof test

Also rerun:

claim-boundary suite  
claim-enrichment suite  
source-assembly suite  
claims/conflicts composition suite  
governed-input suite  
model-invocation suite  
validator suite

---

## **88\. Full Validation**

Run:

npm test  
npm run build  
npm run lint  
npm run typecheck  
git diff \--check

No exception applies.

---

## **89\. Required Full-Suite Discipline**

The sprint shall not rely on targeted suites alone.

A passing targeted regression with a failing repository-wide test is:

> **Correction Implementation Incomplete**

---

# **Part XVIII — Completion Report**

## **90\. Repository Precondition**

Report:

* repository;  
* branch;  
* starting commit;  
* working-tree state;  
* required documents;  
* exact contract fields extracted;  
* exact current field shapes;  
* protected starting hashes;  
* expected file surface.

---

## **91\. Contract Decisions Implemented**

State:

### **Claim-Set Composition**

> Claim-Set Composition Option A was implemented through a closed `claimSetKind: "base" | "enriched"` discriminated architecture.

### **Projection Lineage**

> Projection Lineage Option A was implemented through conditional but structurally complete enrichment lineage.

---

## **92\. Exact Type Shapes**

Report the implemented shapes verbatim for:

BaseConflictEvaluableClaimSet  
EnrichedConflictEvaluableClaimSet  
ConflictEvaluableClaimSet  
EvaluatedClaimSetReference

---

## **93\. Conflict Publication Migration**

Report:

* whether `governedClaimSetId` was retained temporarily;  
* its exact meaning;  
* base evaluation shape;  
* enriched evaluation shape;  
* Conflict Set shape;  
* identity-construction changes.

Required statement:

> `governedClaimSetId` never contains or aliases `enrichedGovernedClaimSetId`.

---

## **94\. Projection Fields**

Report:

claimPublicationStage  
baseGovernedClaimSetId  
enrichmentRulesetId  
enrichmentEvaluationId  
enrichedGovernedClaimSetId  
enrichedClaimBaseReferences

State exact base/enriched requiredness.

---

## **95\. Composer Validation**

Report every new consistency check.

State:

> The composer validates and passes through already-published enrichment lineage. It does not perform claim recognition, evidence resolution, enrichment, conflict derivation, or source adjudication.

---

## **96\. Central Regression Result**

Report:

### **Sprint 3.102 matrix**

* scenarios run;  
* scenarios passed;  
* regressions.

### **Sprint 3.105 re-check**

* prior bounded-adapter finding;  
* corrected current result;  
* prior projection-lineage incompatibility;  
* corrected current result.

Required outcome if successful:

Enriched Claim Set → Conflict Evaluation  
    \= compatible

Projection enrichment lineage  
    \= compatible

---

## **97\. Identity Integrity**

Report:

* base Claim Set ID;  
* enriched Claim Set ID;  
* evaluated publication ID;  
* base lineage ID;  
* enrichment evaluation ID;  
* projected enrichment IDs;  
* enriched claim/base claim links.

Confirm no aliasing.

---

## **98\. Composer Option A Proof**

Report:

* runtime imports;  
* prohibited import search;  
* validation-only tests;  
* pass-through fields;  
* unchanged derivation ownership.

---

## **99\. Mutation Proof**

Run and report the exact output of:

runEnrichedClaimMutationProof()

Required fields:

baselineOutcome  
statusMutationOutcome  
factualValueMutationOutcome  
metadataUnchanged  
statusMutationSilentlyAccepted  
factualValueMutationSilentlyAccepted

If still accepted, state plainly:

> The mutation-integrity gap remains and was not within Sprint 3.107’s implementation authority.

Do not classify that expected remaining gap as a failure of the two authorized corrections.

---

## **100\. Isolation Result**

Report:

* protected hashes;  
* pure-Node searches;  
* zero production contact;  
* no new model call;  
* no route changes.

---

## **101\. Files Changed**

List every changed file with:

file  
reason  
governing contract section  
change classification

Also list historical files found during exhaustive search and deliberately left unchanged.

---

## **102\. Validation Results**

Report exact outcomes for:

targeted conflict-evaluable tests  
conflict-engine tests  
conflict-publication tests  
projection tests  
Sprint 3.102 matrix  
Sprint 3.105 matrix  
mutation proof  
claim-boundary tests  
claim-enrichment tests  
source-assembly tests  
claims/conflicts composition tests  
input tests  
model-invocation tests  
validator tests  
npm test  
npm run build  
npm run lint  
npm run typecheck  
git diff \--check

---

## **103\. Production Effect**

State exactly:

> Sprint 3.107 corrects the isolated enrichment-to-conflict and enrichment-to-projection composition architecture. It does not modify `/api/chat`, `context-builder.ts`, `useAgentConversation.ts`, model-provider behaviour, source acquisition, source publication, claim recognition, enrichment semantics, conflict taxonomy, or production conversational behaviour.

---

## **104\. Outstanding Findings**

Report separately:

Discriminated claim-set architecture:  
Conflict publication lineage:  
Projection enrichment lineage:  
Composer validation:  
Per-cell evaluation:  
Base-only compatibility:  
Enriched compatibility:  
Mutation integrity:  
Isolation:

---

## **105\. Recommended Next Step**

If the two authorized corrections are complete and the mutation gap remains:

> **Sprint 3.108 — Governed Enriched Claim and Conflict Observation Integrity Audit**

That sprint should determine whether the remaining mutation gap is:

* already preventable through immutable publication verification;  
* a bounded missing validator;  
* a deeper semantic relationship requiring a new contract.

Do not silently fold that work into production integration.

If the mutation proof unexpectedly passes because existing authorized checks now detect both mutations, the next step may instead be:

> **Sprint 3.108 — Governed Conversational Production Integration Readiness Review**

The completion report shall recommend only the path supported by evidence.

---

# **Part XIX — Recommendation Gate**

## **106\. Permitted Final Recommendation**

The final line must be exactly one:

> **Correction Implementation Complete**

or:

> **Correction Implementation Incomplete**

No other wording is permitted.

---

## **107\. Correction Implementation Complete**

Use only if:

* the exact Sprint 3.106 discriminated shapes are implemented;  
* no evaluation-only ID alias remains;  
* base and enriched publications retain truthful identities;  
* conflict evaluation supports both variants;  
* conflict publications preserve evaluated publication identity;  
* enriched conflict evaluation retains base and enrichment lineage;  
* projection input supports conditional enrichment publications;  
* projection output retains complete enrichment lineage;  
* composer validation is rigorous;  
* Composer Option A remains intact;  
* Sprint 3.102 matrix passes;  
* Sprint 3.105’s two authorized findings are resolved;  
* mutation proof is rerun and honestly reported;  
* production isolation holds;  
* full validation passes.

The mutation-integrity gap may remain and still permit:

> **Correction Implementation Complete**

because Sprint 3.106 explicitly excluded its resolution.

---

## **108\. Correction Implementation Incomplete**

Use if:

* the enriched ID is still aliased into `governedClaimSetId`;  
* the union is not genuinely discriminated;  
* base and enriched variants are inferred from optional fields;  
* conflict publications lose evaluated-set identity;  
* projection enrichment fields are incomplete;  
* the composer does not validate the publication chain;  
* the composer derives enrichment;  
* Sprint 3.102 regresses;  
* Sprint 3.105’s two seams remain unresolved;  
* the mutation result is hidden or misstated;  
* production isolation fails;  
* full validation fails.

---

# **Part XX — Binding Implementation Summary**

## **109\. Corrected Conflict Architecture**

GovernedClaimSet  
    ↓  
constructBaseConflictEvaluableClaimSet  
    ↓  
{  
  claimSetKind: "base",  
  claimSetPublicationType: "governed\_claim\_set",  
  claimSetPublicationId: governedClaimSetId  
}  
    ↓  
Conflict Evaluation

or:

EnrichedGovernedClaimSet  
    ↓  
constructEnrichedConflictEvaluableClaimSet  
    ↓  
{  
  claimSetKind: "enriched",  
  claimSetPublicationType:  
    "enriched\_governed\_claim\_set",  
  claimSetPublicationId:  
    enrichedGovernedClaimSetId,  
  baseGovernedClaimSetId,  
  enrichmentEvaluationId  
}  
    ↓  
Conflict Evaluation

---

## **110\. Corrected Conflict Publication Architecture**

Conflict Evaluation  
    ├── evaluatedClaimSetReference  
    ├── baseGovernedClaimSetId  
    ├── enrichmentEvaluationId, when enriched  
    └── enrichedGovernedClaimSetId, when enriched  
    ↓  
GovernedConflictSet  
    carries identical lineage

---

## **111\. Corrected Projection Architecture**

### **Base**

claimPublicationStage \= "base"  
governedClaimSetId  
baseGovernedClaimSetId  
no enrichment fields

### **Enriched**

claimPublicationStage \= "enriched"  
governedClaimSetId  
baseGovernedClaimSetId  
enrichmentRulesetId  
enrichmentEvaluationId  
enrichedGovernedClaimSetId  
enrichedClaimBaseReferences

---

## **112\. Identity Rules**

governedClaimSetId  
    \=  
base recognition publication only

enrichedGovernedClaimSetId  
    \=  
enriched publication only

claimSetPublicationId  
    \=  
actual evaluated publication identity

baseClaimId  
    \=  
historical recognition lineage

enriched claimId  
    \=  
canonical downstream claim identity

No aliasing is permitted.

---

## **113\. Composer Rule**

The composer shall:

validate stage  
validate base lineage  
validate enrichment lineage  
validate conflict lineage  
validate claim bodies  
validate claim/base links  
pass identities through  
aggregate canonical status with conflict restrictions

It shall not:

recognise claims  
resolve evidence  
enrich claims  
derive conflicts  
select source truth  
repair malformed publications

---

## **114\. Mutation Rule**

Sprint 3.107 shall rerun:

runEnrichedClaimMutationProof()

It shall not add an unauthorized fix.

The result shall be reported exactly as observed.

---

## **115\. Governing Discipline**

implement the exact discriminated publications  
preserve base and enriched identity separately  
remove the evaluation-only alias  
publish truthful conflict lineage  
retain complete projection lineage  
validate rather than derive  
rerun the same regression seams  
rerun the existing mutation proof  
fix only what Sprint 3.106 authorized  
report the remaining integrity gap honestly  
keep production untouched

The final line shall be exactly:

> **Correction Implementation Complete**

or:

> **Correction Implementation Incomplete**

