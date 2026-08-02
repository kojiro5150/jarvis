# **Sprint 3.109 — Enrichment Integrity-Coupling Implementation**

**Status:** Specification  
**Sprint Type:** Governed Integrity Correction Implementation  
**Implementation Authority:** Sprint 3.108 — Governed Enrichment Integrity-Coupling Contract  
**Production Integration:** Prohibited  
**Direct Implementation Precedents:** Sprints 3.86, 3.95, and 3.107  
**Output Path:** `docs/SPRINT-3.109-ENRICHMENT-INTEGRITY-COUPLING-IMPLEMENTATION.md`

---

## **1\. Purpose**

Sprint 3.109 implements Sprint 3.108’s binding integrity-coupling architecture.

The implementation shall bind each source observation used by conflict evaluation to the exact immutable enriched-claim state it purports to evaluate.

The corrected chain is:

Evidence-to-Claim Enrichment  
    ↓  
canonical enriched-claim body  
    ↓  
claimIntegrityPolicyId  
claimIntegrityDigest  
    ↓  
EnrichedGovernedClaimSet

Governed source-observation construction  
    ↓  
affectedClaimId  
evaluatedClaimIntegrityDigest  
    ↓  
GovernedSourceObservation

Conflict Engine  
    ↓  
recompute enriched-claim digest  
    ↓  
compare:  
    recomputed claim digest  
    published claimIntegrityDigest  
    observation evaluatedClaimIntegrityDigest  
    ↓  
all equal  
    → continue to per-cell evaluation

any mismatch  
    → throw deterministic integrity error  
    → publish no ConflictEvaluation  
    → publish no GovernedConflictSet

The binding policy is:

governed-enriched-claim-integrity.v1

The binding digest algorithm is:

SHA-256

The binding digest encoding is:

sha256:\<64 lowercase hexadecimal characters\>

---

## **2\. Central Proof**

The central proof is the existing real function:

runEnrichedClaimMutationProof()

Before Sprint 3.109, its computed result is:

statusMutationSilentlyAccepted \= true  
factualValueMutationSilentlyAccepted \= true

After Sprint 3.109, the same real proof shall demonstrate:

baseline evaluation  
    completes normally

status mutation  
    throws before per-cell evaluation  
    publishes no ConflictEvaluation  
    publishes no GovernedConflictSet

factual-value mutation  
    throws before per-cell evaluation  
    publishes no ConflictEvaluation  
    publishes no GovernedConflictSet

The proof shall continue to invoke:

evaluateGovernedConversationalConflicts(...)

It shall not be replaced by an isolated hash-unit test.

---

## **3\. Sprint Character**

This is a correction implementation sprint.

It may:

* extend `EnrichedGovernedClaimInput`;  
* add a fixed integrity-policy constant;  
* implement canonical enriched-claim serialization;  
* implement deterministic SHA-256 digest construction;  
* add digest construction to enriched-claim publication;  
* extend `GovernedSourceObservation`;  
* update observation constructors and fixtures;  
* add deterministic integrity-error types and codes;  
* add mandatory pre-evaluation verification inside the conflict engine;  
* update the real mutation proof;  
* migrate tests and fixtures;  
* rerun the full regression matrices.

It shall not:

* change claim recognition;  
* change evidence-to-claim enrichment rules;  
* change the materiality matrix;  
* change conflict taxonomy;  
* change conflict admissibility;  
* change per-cell conflict evaluation;  
* change the six-state conflict outcome vocabulary;  
* derive observations from claims;  
* change the projection composer’s semantics;  
* alter discriminated Claim Set architecture;  
* modify `/api/chat`;  
* integrate or promote the governed runtime.

---

## **4\. Governing Hierarchy**

Apply:

1. JARVIS Engineering Constitution;  
2. JARVIS North Star;  
3. JARVIS Engineering Specification Standard;  
4. Constitutional Publication Principles;  
5. Roadmap;  
6. Sprint 3.89 — Claims Boundary Contract;  
7. Sprint 3.90 — Conflicts Boundary Contract;  
8. Sprint 3.94 — Claims and Conflicts Composition Correction Contract;  
9. Sprint 3.103 — Evidence-to-Claim Enrichment Contract;  
10. Sprint 3.106 — Enrichment Composition Correction Contract;  
11. Sprint 3.107 — Enrichment Composition Correction Implementation;  
12. Sprint 3.108 — binding integrity-coupling contract;  
13. current repository implementation;  
14. this specification.

Sprint 3.108 is the sole authority for integrity-coupling semantics.

---

# **Part I — Repository Precondition**

## **5\. Required Documents**

Before editing, confirm and read completely:

docs/SPRINT-3.86-GOVERNED-CONVERSATIONAL-IDENTITY-CORRECTION-IMPLEMENTATION.md  
docs/SPRINT-3.95-CLAIMS-AND-CONFLICTS-COMPOSITION-CORRECTION-IMPLEMENTATION.md  
docs/SPRINT-3.103-GOVERNED-EVIDENCE-TO-CLAIM-ENRICHMENT-CONTRACT.md  
docs/SPRINT-3.104-ISOLATED-EVIDENCE-TO-CLAIM-ENRICHMENT-IMPLEMENTATION.md  
docs/SPRINT-3.106-GOVERNED-ENRICHMENT-COMPOSITION-CORRECTION-CONTRACT.md  
docs/SPRINT-3.107-ENRICHMENT-COMPOSITION-CORRECTION-IMPLEMENTATION.md  
docs/SPRINT-3.108-GOVERNED-ENRICHMENT-INTEGRITY-COUPLING-CONTRACT.md  
docs/CONSTITUTIONAL-PUBLICATION-PRINCIPLES.md  
docs/architecture/ROADMAP.md

---

## **6\. Exact Contract Extraction**

Before writing code, extract directly from Sprint 3.108 and record in the completion report:

### **Policy**

governed-enriched-claim-integrity.v1

### **Claim fields**

claimIntegrityPolicyId  
claimIntegrityDigest

### **Observation field**

evaluatedClaimIntegrityDigest

### **Algorithm**

SHA-256

### **Encoding**

sha256:\<64 lowercase hexadecimal characters\>

### **Mismatch codes**

published\_claim\_digest\_mismatch  
observation\_claim\_digest\_mismatch  
observation\_digest\_missing  
claim\_digest\_missing  
mixed\_observation\_claim\_digests  
claim\_integrity\_policy\_mismatch  
claim\_integrity\_digest\_malformed

### **Fail-closed sequence**

recompute supplied enriched-claim digest  
    ↓  
compare recomputed digest with claimIntegrityDigest  
    ↓  
compare observation digest with claimIntegrityDigest  
    ↓  
all equal → per-cell evaluation

any mismatch  
    → throw  
    → no ConflictEvaluation  
    → no GovernedConflictSet

Do not approximate, rename, or expand these decisions.

---

## **7\. Required Source Inspection**

Read completely:

lib/governed-conversation/types.ts  
lib/governed-conversation/claim-enrichment-types.ts  
lib/governed-conversation/claim-enrichment-publications.ts  
lib/governed-conversation/claim-enrichment-engine.ts  
lib/governed-conversation/claim-enrichment-fixtures.ts

lib/governed-conversation/conflict-boundary-types.ts  
lib/governed-conversation/conflict-boundary-engine.ts  
lib/governed-conversation/conflict-boundary-publications.ts  
lib/governed-conversation/conflict-boundary-fixtures.ts

lib/governed-conversation/full-assembly-enrichment-composition-recheck.ts  
lib/governed-conversation/full-assembly-enrichment-composition-recheck.test.ts

lib/governed-conversation/full-assembly-claim-boundary-conflict-boundary-composition-regression.ts  
lib/governed-conversation/full-assembly-claim-boundary-conflict-boundary-composition-regression.test.ts

Also inspect all repository-wide constructors and literals of:

EnrichedGovernedClaimInput  
GovernedSourceObservation  
constructEnrichedClaim  
evaluateGovernedConversationalConflicts  
runEnrichedClaimMutationProof

---

## **8\. Current Error Boundary**

Confirm directly that `evaluateGovernedConversationalConflicts` currently wraps per-cell processing in a broad `try/catch` that maps thrown errors to:

evaluation\_failed

Sprint 3.108 requires integrity mismatches to produce no evaluation publication.

Therefore the implementation shall ensure the integrity check is not converted into:

evaluation\_failed

Permitted approaches:

1. run integrity verification before entering the existing caught evaluation block; or  
2. catch and rethrow `EnrichedClaimIntegrityError` while preserving existing handling for ordinary evaluator failures.

The selected approach shall be stated explicitly in the completion report.

---

## **9\. Starting State**

Record:

* repository;  
* active branch;  
* starting commit;  
* working-tree state;  
* required documents;  
* current `EnrichedGovernedClaimInput` shape;  
* current `GovernedSourceObservation` shape;  
* current enriched-claim identity constructor;  
* current mutation-proof output;  
* current conflict-engine error boundary;  
* all live observation constructors;  
* expected file surface;  
* protected-file hashes.

If any binding premise differs materially, stop.

Return:

> **Correction Implementation Incomplete**

---

# **Part II — Integrity Policy and Types**

## **10\. Integrity Policy Constant**

Add a fixed exported constant under a clear single owner:

export const GOVERNED\_ENRICHED\_CLAIM\_INTEGRITY\_POLICY\_ID \=  
  "governed-enriched-claim-integrity.v1" as const;

The owner should be a narrowly scoped module such as:

lib/governed-conversation/claim-integrity.ts

or an equivalent location with one clear responsibility.

Do not duplicate the literal across modules.

---

## **11\. Digest Type**

Define a branded or validated string type if consistent with repository conventions:

export type ClaimIntegrityDigest \=  
  \`sha256:${string}\`;

Runtime validation remains mandatory.

Type-level shape alone is insufficient.

---

## **12\. Mismatch Vocabulary**

Define exactly:

export const ENRICHED\_CLAIM\_INTEGRITY\_MISMATCH\_CODES \= \[  
  "published\_claim\_digest\_mismatch",  
  "observation\_claim\_digest\_mismatch",  
  "observation\_digest\_missing",  
  "claim\_digest\_missing",  
  "mixed\_observation\_claim\_digests",  
  "claim\_integrity\_policy\_mismatch",  
  "claim\_integrity\_digest\_malformed",  
\] as const;

And:

export type EnrichedClaimIntegrityMismatchCode \=  
  (typeof ENRICHED\_CLAIM\_INTEGRITY\_MISMATCH\_CODES)\[number\];

No open string extension is permitted.

---

## **13\. Deterministic Error Type**

Implement an error equivalent to:

export class EnrichedClaimIntegrityError extends Error {  
  readonly code: EnrichedClaimIntegrityMismatchCode;  
  readonly claimId: string;  
  readonly expectedDigest?: string;  
  readonly observedDigest?: string;  
}

The exact constructor may also include:

integrityPolicyId  
observationSourcePublicationId

where useful.

The error shall:

* use a deterministic message;  
* expose the closed code;  
* identify the affected claim;  
* preserve expected and observed digests where safe;  
* be distinguishable with `instanceof` or an equally reliable discriminator.

---

# **Part III — Enriched Claim Shape**

## **14\. Extend EnrichedGovernedClaimInput**

Modify:

export interface EnrichedGovernedClaimInput  
  extends GovernedClaimInput {  
  readonly baseClaimId: string;  
}

to require:

export interface EnrichedGovernedClaimInput  
  extends GovernedClaimInput {  
  readonly baseClaimId: string;  
  readonly claimIntegrityPolicyId:  
    typeof GOVERNED\_ENRICHED\_CLAIM\_INTEGRITY\_POLICY\_ID;  
  readonly claimIntegrityDigest: ClaimIntegrityDigest;  
}

Both fields are mandatory.

They shall never be optional on an enriched claim.

---

## **15\. Exact Current Canonical Claim Fields**

The current inherited canonical claim body consists of:

claimId  
claimType  
material  
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

The enriched extension adds:

baseClaimId

Sprint 3.108 additionally requires the canonical integrity body to commit to:

enrichmentEvaluationId  
threadId  
requestId  
exchangeId  
segmentId or canonical segment linkage

These lineage fields are not all physically stored on `EnrichedGovernedClaimInput`.

Therefore the digest constructor shall receive an explicit integrity context rather than silently omit them.

---

# **Part IV — Canonical Digest Body**

## **16\. Canonical Body Input**

Define a pure canonical-body constructor equivalent to:

export interface EnrichedClaimIntegrityContext {  
  readonly enrichmentEvaluationId: string;  
  readonly threadId: string;  
  readonly requestId: string;  
  readonly exchangeId: string;  
  readonly segmentIds: readonly string\[\];  
}

And:

export function constructEnrichedClaimIntegrityBody(  
  claim: EnrichedGovernedClaimInputWithoutIntegrityFields,  
  context: EnrichedClaimIntegrityContext  
): EnrichedClaimIntegrityBody;

The implementation shall use the real current claim fields.

---

## **17\. Exact Canonical Field Order**

The v1 canonical body shall emit fields in this exact top-level order:

policy  
claimId  
baseClaimId  
claimType  
material  
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
segmentIds

The policy value is:

governed-enriched-claim-integrity.v1

No insertion-order accident may change this order.

---

## **18\. Claim ID Circularity**

`claimIntegrityDigest` shall not participate in its own digest body.

`claimIntegrityPolicyId` is represented through the fixed top-level:

policy

field.

The digest body includes the enriched claim’s final:

claimId

Sprint 3.108 requires `claimId` to be protected.

The implementation shall therefore construct identities in a deterministic non-circular sequence.

Required sequence:

1. construct the enriched claim’s canonical body excluding integrity fields;  
2. derive the enriched `claimId` using the existing Sprint 3.104 identity method;  
3. construct the integrity body using that final `claimId`;  
4. compute `claimIntegrityDigest`;  
5. publish the final frozen enriched claim with both identity and digest.

Do not add the digest into the `claimId` construction body unless doing so can be proven non-circular and consistent with the existing identity rules.

The existing enriched `claimId` semantics shall remain unchanged unless a direct contradiction is found.

---

## **19\. Source References Canonicalization**

For each `GovernedSourceReference`, emit keys in this exact order:

sourceId  
resourceId  
field  
observedAt

Treat `sourceReferences` as set-semantic unless an earlier governing contract explicitly makes order meaningful.

Canonical rule:

sort by:  
sourceId  
resourceId  
field  
observedAt

using deterministic lexical comparison.

Do not mutate the published claim array merely to produce the digest.

Canonicalize a copy.

---

## **20\. Factual Values Canonicalization**

`factualValues` is `readonly unknown[]`.

For v1:

* preserve governed array order;  
* recursively canonicalize values;  
* support only JSON-compatible values already admitted by the repository;  
* reject unsupported runtime values such as functions, symbols, cyclic objects, `BigInt`, or non-finite numbers;  
* preserve string case and whitespace exactly;  
* normalize strings to NFC only if the repository’s canonical identity utility already applies that rule consistently.

Do not sort factual values unless an existing governing contract defines them as a set.

---

## **21\. Conflict Canonicalization**

For each claim-level `GovernedConflict`, emit keys in this exact order:

conflictId  
claimId  
governedReference  
compatibilityContextId  
description

The nested `governedReference` uses:

sourceId  
resourceId  
field  
observedAt

Treat `conflicts` as set-semantic.

Canonical rule:

sort by conflictId

---

## **22\. Segment Linkage**

The digest body shall contain:

segmentIds

as a deterministic array of every segment linked to the enriched claim in the owning Enriched Governed Claim Set.

Canonical rule:

unique  
sorted lexically

An enriched claim with no segment linkage shall fail publication construction.

Do not use array index as segment identity.

---

## **23\. Undefined and Empty Values**

Canonical rules:

* required fields may not be `undefined`;  
* optional fields governed as absent are omitted;  
* arrays governed as present remain arrays, including empty arrays;  
* empty strings in required identity or provenance fields are invalid;  
* `null` remains `null` only where the underlying governed type admits it;  
* `undefined` shall never be serialized as `null`.

---

## **24\. Canonical Serialization**

Implement one deterministic serializer for the v1 body.

Permitted implementation:

1. explicitly construct a plain object in the fixed schema;  
2. recursively canonicalize nested values;  
3. serialize the resulting fixed-key object as UTF-8 JSON.

Do not call raw `JSON.stringify` on the unprocessed enriched claim.

The function shall be independently tested for:

* stable key order;  
* stable nested key order;  
* stable set sorting;  
* deterministic replay;  
* sensitivity to every required field.

---

# **Part V — Digest Construction**

## **25\. Hash Function**

Implement:

export function computeEnrichedClaimIntegrityDigest(  
  body: EnrichedClaimIntegrityBody  
): ClaimIntegrityDigest;

Required algorithm:

SHA-256

Required encoding:

sha256:\<64 lowercase hex characters\>

Use the standard Node cryptographic implementation already available to the repository.

No external dependency is required.

---

## **26\. Digest Format Validation**

Implement:

export function isClaimIntegrityDigest(  
  value: string  
): value is ClaimIntegrityDigest;

Required pattern:

^sha256:\[0-9a-f\]{64}$

Uppercase hexadecimal is invalid.

Missing prefix is invalid.

---

## **27\. Recompute Function**

Implement a single public function used by both publication tests and the conflict engine:

export function recomputeEnrichedClaimIntegrityDigest(  
  claim: EnrichedGovernedClaimInput,  
  context: EnrichedClaimIntegrityContext  
): ClaimIntegrityDigest;

The recomputation shall ignore the claim’s published digest value and calculate from its actual supplied canonical body.

Do not trust the existing `claimIntegrityDigest` while recomputing it.

---

# **Part VI — Enrichment Publication Changes**

## **28\. constructEnrichedClaim**

Modify the real:

constructEnrichedClaim(...)

so it publishes:

claimIntegrityPolicyId  
claimIntegrityDigest

The constructor shall receive enough context to build the complete canonical digest body.

Preferred signature shape:

constructEnrichedClaim(  
  baseClaimId,  
  enrichmentEvaluationId,  
  body,  
  integrityContext  
)

The exact signature may vary where the existing publication flow already supplies:

threadId  
requestId  
exchangeId  
segmentIds

No ambient global state is permitted.

---

## **29\. Enrichment Evaluation Construction Order**

The current enrichment architecture has an identity-order dependency:

* enriched claims reference `enrichmentEvaluationId`;  
* enrichment evaluation records enriched claim IDs.

The existing implementation already resolves this through identity discriminators.

Sprint 3.109 shall preserve deterministic construction and avoid circular digest dependencies.

Required documented construction sequence:

1. determine enrichment ruleset and base Claim Set;  
2. determine per-claim enrichment canonical bodies;  
3. determine stable enriched-claim identity discriminators under existing rules;  
4. construct the enrichment evaluation identity;  
5. construct final enriched claims using the final `enrichmentEvaluationId`;  
6. compute each final claim’s integrity digest;  
7. construct the Enriched Governed Claim Set;  
8. ensure the evaluation’s per-claim records truthfully reference final enriched claim IDs.

If the real current sequence differs, preserve its semantics and document the exact non-circular sequence.

---

## **30\. Enrichment Evaluation Digest References**

Sprint 3.108 requires the enrichment evaluation to record or reference generated digests in its per-claim outcomes.

Extend `ClaimEnrichmentRecord` with:

readonly claimIntegrityPolicyId:  
  typeof GOVERNED\_ENRICHED\_CLAIM\_INTEGRITY\_POLICY\_ID;  
readonly claimIntegrityDigest: ClaimIntegrityDigest;

These fields are mandatory for every successfully published enriched claim.

For a failed enrichment outcome with no enriched Claim Set, do not fabricate a digest.

If the current failure record uses a synthetic enriched claim ID, stop and reconcile the exact publication semantics rather than inventing a digest.

---

## **31\. Enrichment Evaluation Identity**

Include the integrity policy and claim digests in the canonical enrichment-evaluation identity body.

Changing a claim digest shall change:

enrichmentEvaluationId

only if the repository’s existing construction sequence can do so without circularity.

If including the final digest in `enrichmentEvaluationId` creates an unavoidable cycle because the claim digest itself includes `enrichmentEvaluationId`, stop.

Do not force a circular identity construction.

In that case:

* retain the existing evaluation identity semantics;  
* record the claim digests in the completed evaluation body;  
* ensure the Enriched Claim Set identity commits to them;  
* report the constrained exception precisely.

Sprint 3.108 states the implementation must verify this relationship; it does not authorize an incoherent cycle.

---

## **32\. Enriched Claim Set Identity**

The Enriched Governed Claim Set identity body shall include final enriched claims containing:

claimIntegrityPolicyId  
claimIntegrityDigest

Therefore changing either shall change:

enrichedGovernedClaimSetId

This is mandatory.

---

# **Part VII — GovernedSourceObservation Changes**

## **33\. Extend GovernedSourceObservation**

Add a conditional field:

readonly evaluatedClaimIntegrityDigest?: ClaimIntegrityDigest;

The field is:

* mandatory when the supplied conflict-evaluable Claim Set is enriched;  
* prohibited when the supplied Claim Set is base.

The TypeScript type may remain optional because the same observation type serves both variants.

Runtime enforcement is mandatory.

---

## **34\. Observation Integrity Policy**

Sprint 3.108 names only:

evaluatedClaimIntegrityDigest

as the observation field.

Do not add a separate observation policy field unless needed for deterministic validation.

The conflict engine can validate the claim’s:

claimIntegrityPolicyId

and interpret the observation digest under that same policy.

If a separate observation policy field is added, it must equal the claim policy and must not create a second independent policy choice.

---

## **35\. Observation Construction**

Every constructor or fixture creating observations for an enriched claim shall receive the target enriched claim or its published digest.

Preferred API:

constructGovernedSourceObservation({  
  ...body,  
  affectedClaimId: enrichedClaim.claimId,  
  evaluatedClaimIntegrityDigest:  
    enrichedClaim.claimIntegrityDigest,  
});

Do not recompute the digest in the observation constructor.

The observation publisher copies the canonical published value.

---

## **36\. Observation Identity**

If `GovernedSourceObservation` has a deterministic publication identity elsewhere, include:

affectedClaimId  
evaluatedClaimIntegrityDigest

in that identity body.

If observations currently use externally supplied `sourcePublicationId` rather than a repository constructor, update deterministic fixture IDs or publication constructors so a changed claim digest cannot retain the same observation publication identity.

Do not invent a competing source identity where the source publisher owns the ID.

Document the exact existing identity mechanism and the resulting migration.

---

## **37\. Base Observations**

For:

claimSetKind \= "base"

observations shall omit:

evaluatedClaimIntegrityDigest

Supplying the field for a base evaluation shall fail closed as a malformed boundary input or be explicitly rejected by the pre-evaluation verifier.

Do not silently ignore it.

---

# **Part VIII — Conflict Engine Verification**

## **38\. Verification Timing**

Integrity verification shall occur:

after:  
    claimSet existence validation  
    claim-set publication identity validation

before:  
    unsupported-class handling  
    observation availability handling  
    per-cell eligibility  
    source normalization  
    source comparison  
    conflict derivation  
    ConflictEvaluation construction

The check must run before any valid evaluation outcome can be minted.

---

## **39\. Base Variant**

When:

claimSetKind \= "base"

the integrity verifier shall:

* require no enriched-claim digest;  
* reject or prohibit observation digest fields;  
* preserve existing base conflict behaviour;  
* proceed without enriched integrity hashing.

No base claim digest shall be synthesized.

---

## **40\. Enriched Variant Three-Step Check**

For every enriched claim in the supplied Claim Set:

### **Step 1 — Recompute**

Compute:

recomputedDigest \=  
  recomputeEnrichedClaimIntegrityDigest(  
    actual supplied enriched claim,  
    exact lineage/segment context  
  )

### **Step 2 — Verify published claim**

Compare:

recomputedDigest  
    \=  
claim.claimIntegrityDigest

### **Step 3 — Verify observations**

For every observation where:

observation.affectedClaimId \=  
claim.claimId

compare:

observation.evaluatedClaimIntegrityDigest  
    \=  
claim.claimIntegrityDigest

Only after all checks pass may per-cell evaluation begin.

---

## **41\. Integrity Context Reconstruction**

The conflict engine needs:

enrichmentEvaluationId  
threadId  
requestId  
exchangeId  
segmentIds

to recompute the exact digest.

These shall be taken only from the supplied truthful enriched Claim Set:

claimSet.enrichmentEvaluationId  
claimSet.threadId  
claimSet.requestId  
claimSet.exchangeId  
claimSet.segmentLinks

For each claim:

segmentIds \=  
claimSet.segmentLinks  
  .filter(link \=\> link.claimId \=== claim.claimId)  
  .map(link \=\> link.segmentId)

No external context parameter is required.

---

## **42\. Published Claim Validation**

For each enriched claim, fail with:

claim\_digest\_missing

if:

* `claimIntegrityPolicyId` is absent;  
* `claimIntegrityDigest` is absent.

Fail with:

claim\_integrity\_policy\_mismatch

if:

claimIntegrityPolicyId  
    ≠  
governed-enriched-claim-integrity.v1

Fail with:

claim\_integrity\_digest\_malformed

if the digest fails the required pattern.

Fail with:

published\_claim\_digest\_mismatch

if the recomputed digest differs.

---

## **43\. Observation Validation**

For each observation targeting an enriched claim:

Fail with:

observation\_digest\_missing

if `evaluatedClaimIntegrityDigest` is absent.

Fail with:

claim\_integrity\_digest\_malformed

if it is malformed.

Fail with:

observation\_claim\_digest\_mismatch

if it differs from the claim digest.

---

## **44\. Mixed Observation Digests**

For each enriched claim, collect every targeting observation’s digest.

If more than one distinct digest is present, fail with:

mixed\_observation\_claim\_digests

This failure is checked even if one digest happens to match the claim.

---

## **45\. Observations for Unknown Claims**

Preserve the existing unknown-claim handling.

An observation pointing to a claim outside:

claimSet.claimIds

remains invalid.

Digest verification does not replace identity membership.

---

## **46\. Claims With No Observations**

An enriched claim with zero observations may still proceed to normal per-cell handling and become:

insufficient\_source\_coverage

provided its own published digest verifies.

Do not require an observation merely to validate the claim publication.

---

# **Part IX — Fail-Closed Error Boundary**

## **47\. No Evaluation Publication**

For any integrity mismatch:

evaluateGovernedConversationalConflicts(...)

shall throw.

It shall not return:

evaluation\_failed

It shall not return:

evaluation\_unavailable

It shall not return an empty result.

It shall not publish a Conflict Set.

---

## **48\. Placement Relative to Existing Catch**

The current conflict engine catches ordinary errors from the per-cell loop and converts them to:

evaluation\_failed

The implementation shall choose one of these exact safe structures:

### **Structure A — Preferred**

validate structural input  
verify enriched integrity  
enter existing try/catch for evaluator processing

Integrity errors occur before the catch.

### **Structure B**

try {  
  verify integrity  
  run evaluator  
} catch (error) {  
  if (error instanceof EnrichedClaimIntegrityError) {  
    throw error  
  }  
  return evaluation\_failed  
}

The completion report shall state which was used.

No broad catch may swallow `EnrichedClaimIntegrityError`.

---

## **49\. No Partial Evaluation**

A mismatch affecting any enriched claim invalidates the complete conflict-engine invocation.

The engine shall not:

* evaluate unaffected claims;  
* return `partially_evaluated`;  
* publish cells from earlier claims;  
* publish a partial Conflict Set.

The input publication chain is malformed as a whole.

---

# **Part X — Mutation Proof Migration**

## **50\. Existing Proof Must Remain Real**

Modify the existing:

runEnrichedClaimMutationProof()

only as required to account for the new fields and thrown errors.

Do not replace it.

The proof shall continue to:

1. build a real enriched claim;  
2. build real coupled observations;  
3. run a valid baseline evaluation;  
4. mutate status after enrichment;  
5. rerun the real conflict engine;  
6. mutate factual values after enrichment;  
7. rerun the real conflict engine.

---

## **51\. Expected Result Shape**

Update its result to record explicit rejection evidence, for example:

{  
  baselineOutcome: "evaluated\_conflict\_found",  
  statusMutationRejected: true,  
  statusMutationErrorCode:  
    "published\_claim\_digest\_mismatch",  
  factualValueMutationRejected: true,  
  factualValueMutationErrorCode:  
    "published\_claim\_digest\_mismatch",  
  noStatusMutationEvaluationPublished: true,  
  noFactualValueMutationEvaluationPublished: true,  
}

The exact field names may preserve backward-compatible existing result fields.

If old fields remain, expected:

statusMutationSilentlyAccepted \= false  
factualValueMutationSilentlyAccepted \= false

---

## **52\. Status Mutation**

The proof shall mutate only:

status

It shall preserve:

claimId  
baseClaimId  
claimIntegrityPolicyId  
claimIntegrityDigest  
sourceReferences  
factualValues  
observations

Expected error:

published\_claim\_digest\_mismatch

---

## **53\. Factual-Value Mutation**

The proof shall mutate only:

factualValues

It shall preserve:

claimId  
baseClaimId  
claimIntegrityPolicyId  
claimIntegrityDigest  
status  
sourceReferences  
observations

Expected error:

published\_claim\_digest\_mismatch

---

# **Part XI — Required Positive Proof**

## **54\. Valid Enriched Claim**

Construct a genuine unmutated enriched claim through the real enrichment engine.

Required:

* correct policy ID;  
* correct digest format;  
* recomputation equals published digest;  
* every observation carries the same digest;  
* conflict evaluation proceeds normally;  
* expected outcome is produced.

---

## **55\. Valid No-Conflict Evaluation**

Use matching source observations.

Expected:

evaluated\_no\_conflict

The integrity verifier shall not create false positives.

---

## **56\. Valid Conflict Evaluation**

Use two contradictory, admissible observations carrying the same correct claim digest.

Expected:

evaluated\_conflict\_found

The digest couples both observations to the same claim state without forcing their factual values to agree.

---

## **57\. Multiple Matching Observations**

Two or more observations targeting one enriched claim may carry the same digest.

This is valid.

The digest commits to the claim state, not to the observation value.

---

# **Part XII — Negative Test Matrix**

## **58\. Claim Digest Tests**

Required:

1. missing policy ID;  
2. wrong policy ID;  
3. missing claim digest;  
4. malformed prefix;  
5. uppercase hex;  
6. wrong digest length;  
7. mutated status;  
8. mutated factual values;  
9. mutated source references;  
10. mutated provenance;  
11. mutated source availability;  
12. mutated bounded completeness;  
13. mutated observed time;  
14. mutated content kind;  
15. mutated base claim ID;  
16. mutated conflict collection;  
17. mutated segment linkage.

Each shall fail before evaluation.

---

## **59\. Observation Digest Tests**

Required:

18. missing observation digest;  
19. malformed observation digest;  
20. observation digest differs from claim digest;  
21. mixed observation digests for the same claim;  
22. observation digest from a different enriched claim;  
23. digest supplied for a base Claim Set;  
24. observation targets unknown claim despite valid digest.

Each shall fail closed under the appropriate existing or new error.

---

## **60\. Publication Tests**

Required:

25. final enriched claim is frozen;  
26. digest survives Enriched Claim Set publication;  
27. changing digest changes Enriched Claim Set identity;  
28. Claim Enrichment Record contains digest and policy;  
29. deterministic replay produces identical digest;  
30. changing a protected field changes digest;  
31. changing only unprotected ambient object ordering does not change digest.

---

# **Part XIII — Regression Proof**

## **61\. Sprint 3.102 Matrix**

Run:

runFullAssemblyRegressionMatrix()

over all:

FULL\_ASSEMBLY\_SCENARIO\_IDS

Required:

* every scenario executes;  
* no previously passing scenario regresses;  
* base conflict evaluations remain valid;  
* enriched scenarios receive correctly coupled observations.

---

## **62\. Sprint 3.105 Re-Check Matrix**

Run the real enrichment-specific re-check matrix.

Required:

* Enriched Claim Set → conflict evaluation remains compatible;  
* projection enrichment lineage remains compatible;  
* digest fields do not create ID aliasing;  
* all prior enriched scenarios remain valid;  
* mutation proof now rejects both mutations.

---

## **63\. Base-Only Regression**

Required direct proof:

claimSetKind \= "base"

continues to work with observations that do not carry:

evaluatedClaimIntegrityDigest

The new enriched integrity mechanism shall not alter base conflict results.

---

## **64\. Six-State Vocabulary**

Confirm runtime vocabulary remains exactly:

evaluated\_no\_conflict  
evaluated\_conflict\_found  
partially\_evaluated  
evaluation\_unavailable  
evaluation\_unsupported  
evaluation\_failed

No integrity outcome is added.

---

# **Part XIV — Composer and Claim-Set Boundaries**

## **65\. Composer Option A**

`projection-composer.ts` shall remain byte-identical unless a mechanical type import is unavoidable.

It shall not:

* compute digests;  
* validate observation digests;  
* repair claims;  
* derive observations;  
* become the primary integrity owner.

Required import search proving the composer does not import the claim-integrity runtime module.

---

## **66\. Discriminated Claim Sets**

Sprint 3.106/3.107 architecture remains unchanged:

claimSetKind \= "base"  
claimSetKind \= "enriched"

The integrity verifier branches on this existing discriminator.

Do not add a third Claim Set variant.

Do not alter publication identity rules.

---

## **67\. Per-Cell Evaluation**

Sprint 3.94/3.95 remains unchanged.

Integrity verification occurs before:

claimId × conflictClass

evaluation.

Once verification passes, existing per-cell logic runs without semantic modification.

---

# **Part XV — Isolation**

## **68\. Protected Production Files**

Record pre/post blob hashes for:

app/api/chat/route.ts  
lib/context-builder.ts  
lib/useAgentConversation.ts  
lib/agents/chat-execution.ts

Expected:

byte-identical

---

## **69\. Additional Protected Files**

Unless a strictly mechanical type import is required, preserve:

lib/governed-conversation/projection-composer.ts  
lib/governed-conversation/claim-boundary-engine.ts  
lib/governed-conversation/claim-boundary-ruleset.ts  
lib/governed-conversation/source-evidence-assembly.ts  
lib/governed-conversation/evidence-status.ts  
lib/governed-conversation/model-invocation.ts  
lib/governed-conversation/validator.ts

Record hashes.

---

## **70\. Pure-Node Isolation Proof**

Use:

node:fs  
node:path  
node:crypto

Do not depend on:

rg  
execFileSync  
platform-specific shell traversal

for committed isolation checks.

Prove zero contact with:

/api/chat  
context-builder.ts  
useAgentConversation.ts

---

# **Part XVI — Expected File Surface**

## **71\. Expected New File**

Preferred:

lib/governed-conversation/claim-integrity.ts

Expected test:

lib/governed-conversation/claim-integrity.test.ts

Equivalent naming is permitted only if the ownership remains clear.

---

## **72\. Expected Modified Files**

Expected live migration candidates:

lib/governed-conversation/claim-enrichment-types.ts  
lib/governed-conversation/claim-enrichment-publications.ts  
lib/governed-conversation/claim-enrichment-engine.ts  
lib/governed-conversation/claim-enrichment-fixtures.ts

lib/governed-conversation/conflict-boundary-types.ts  
lib/governed-conversation/conflict-boundary-engine.ts  
lib/governed-conversation/conflict-boundary-fixtures.ts

lib/governed-conversation/full-assembly-enrichment-composition-recheck.ts

---

## **73\. Expected Modified Tests**

Likely:

lib/governed-conversation/claim-enrichment-publications.test.ts  
lib/governed-conversation/claim-enrichment-engine.test.ts  
lib/governed-conversation/claim-enrichment-composition.test.ts

lib/governed-conversation/conflict-boundary-engine.test.ts  
lib/governed-conversation/conflict-boundary-publications.test.ts

lib/governed-conversation/full-assembly-enrichment-composition-recheck.test.ts  
lib/governed-conversation/full-assembly-claim-boundary-conflict-boundary-composition-regression.test.ts

Migrate every live observation literal found by exhaustive search.

---

## **74\. Sprint Document**

docs/SPRINT-3.109-ENRICHMENT-INTEGRITY-COUPLING-IMPLEMENTATION.md

---

## **75\. Changed-File Discipline**

The completion report shall list every changed file with:

* one-line reason;  
* governing Sprint 3.108 section;  
* change classification:  
  * integrity implementation;  
  * live fixture migration;  
  * test migration;  
  * documentation.

No silent scope expansion.

---

# **Part XVII — Stop-and-Report Conditions**

## **76\. Canonical Body Contradiction**

If the current enriched claim or lineage publications cannot supply every required canonical digest field without inventing data, stop.

Do not omit the field silently.

Return:

> **Correction Implementation Incomplete**

---

## **77\. Identity Cycle**

If including:

enrichmentEvaluationId

in the claim digest while also including final claim digests in the enrichment evaluation identity creates an unavoidable circular identity dependency, stop and report the exact cycle.

Do not break determinism through staged placeholder IDs.

A bounded implementation may preserve the existing evaluation identity while including final digests in the published evaluation body only if this is consistent with Sprint 3.108 and explicitly reported.

---

## **78\. Observation Ownership Conflict**

If observations are constructed by a source-owner module that cannot truthfully receive the enriched claim digest without violating source-publication ownership, stop.

Do not recompute claim semantics inside the source owner.

---

## **79\. Error-Catch Conflict**

If the new integrity error cannot escape the existing evaluator catch without changing unrelated error semantics, stop and report the exact conflict.

Do not map integrity mismatches to:

evaluation\_failed

---

## **80\. Composer Pressure**

If implementation appears to require the projection composer to become the digest verifier, stop.

Sprint 3.108 assigns verification to the conflict engine.

---

## **81\. Base Regression**

If base Claim Set evaluations cannot remain unchanged, stop.

Sprint 3.108 does not govern base-claim integrity.

---

# **Part XVIII — Validation**

## **82\. Targeted Validation**

Run independently:

claim-integrity tests  
claim-enrichment type tests  
claim-enrichment publication tests  
claim-enrichment engine tests  
conflict-boundary type tests  
conflict-boundary engine tests  
conflict-boundary publication tests  
runEnrichedClaimMutationProof tests

Also rerun:

Sprint 3.102 full matrix  
Sprint 3.105 enrichment re-check matrix  
claims/conflicts composition tests  
projection-composer tests  
governed-input tests  
model-invocation tests  
validator tests

---

## **83\. Full Validation**

Run:

npm test  
npm run build  
npm run lint  
npm run typecheck  
git diff \--check

No exception applies.

Targeted passing tests do not replace the complete suite.

---

# **Part XIX — Completion Report**

## **84\. Repository Precondition**

Report:

* repository;  
* branch;  
* starting commit;  
* working-tree state;  
* required documents;  
* exact Sprint 3.108 fields extracted;  
* exact canonical digest body;  
* current mutation outputs;  
* current catch structure;  
* starting protected hashes;  
* expected file surface.

---

## **85\. Integrity Policy**

Report:

claimIntegrityPolicyId \=  
governed-enriched-claim-integrity.v1

algorithm \=  
SHA-256

encoding \=  
sha256:\<64 lowercase hexadecimal characters\>

---

## **86\. Canonical Digest Body**

List the exact implemented top-level field order:

policy  
claimId  
baseClaimId  
claimType  
material  
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
segmentIds

List all nested canonicalization rules.

---

## **87\. Enriched Claim Changes**

Report:

claimIntegrityPolicyId  
claimIntegrityDigest

and where they are constructed.

State how final `claimId`, evaluation identity, and digest construction avoid circularity.

---

## **88\. Observation Changes**

Report:

evaluatedClaimIntegrityDigest

and every migrated observation constructor.

State how base and enriched observation requirements differ.

---

## **89\. Conflict Verification**

Report the implemented three-step sequence:

1. recompute digest;  
2. compare against claim digest;  
3. compare observations against claim digest.

State where it executes relative to the existing `try/catch`.

---

## **90\. Error Vocabulary**

Report every closed error code and at least one test for each.

State:

> Integrity mismatches throw before evaluation and are not mapped to `evaluation_failed`.

---

## **91\. Mutation Proof**

Report the exact real result of:

runEnrichedClaimMutationProof()

Required successful shape:

baseline completes  
status mutation rejected  
factual-value mutation rejected  
no mutation ConflictEvaluation published  
no mutation GovernedConflictSet published

Include exact error codes.

---

## **92\. Positive Evaluation Proof**

Report:

* valid enriched claim digest;  
* valid matching observation digests;  
* no-conflict result;  
* conflict-found result;  
* no false-positive integrity error.

---

## **93\. Regression Matrices**

Report:

### **Sprint 3.102**

* scenario count;  
* pass count;  
* regressions.

### **Sprint 3.105**

* scenario count;  
* pass count;  
* enrichment seam status;  
* projection-lineage status;  
* mutation result.

---

## **94\. Prior-Contract Compatibility**

State explicitly:

Sprint 3.90  
    unchanged

Sprint 3.94/3.95 per-cell evaluation  
    unchanged

Sprint 3.103 enrichment semantics  
    unchanged

Sprint 3.106/3.107 discriminated claim sets  
    unchanged

Composer Option A  
    unchanged

---

## **95\. Isolation Result**

Report:

* protected hashes;  
* pure-Node import searches;  
* no route contact;  
* no context-builder contact;  
* no conversation-hook contact;  
* no production behavioural change.

---

## **96\. Files Changed**

List every changed file with:

file  
reason  
governing contract section  
change classification

Also list historical files found during search and deliberately left unchanged.

---

## **97\. Validation Results**

Report exact results for:

targeted integrity tests  
claim-enrichment tests  
conflict-boundary tests  
mutation proof  
Sprint 3.102 matrix  
Sprint 3.105 matrix  
projection tests  
input tests  
model-invocation tests  
validator tests  
npm test  
npm run build  
npm run lint  
npm run typecheck  
git diff \--check

---

## **98\. Production Effect**

State exactly:

> Sprint 3.109 adds deterministic integrity coupling between enriched claims and the governed source observations used by conflict evaluation. It does not alter claim recognition, enrichment materiality, conflict taxonomy, per-cell evaluation, projection composition, model invocation, `/api/chat`, `context-builder.ts`, `useAgentConversation.ts`, or current production conversational behaviour.

---

## **99\. Outstanding Findings**

Report separately:

Canonical serialization:  
Digest construction:  
Enrichment identity sequence:  
Observation coupling:  
Conflict precondition verification:  
Status mutation:  
Factual-value mutation:  
Base compatibility:  
Six-state vocabulary:  
Composer Option A:  
Isolation:

---

## **100\. Recommended Next Step**

If complete:

> **Sprint 3.110 — Governed Conversational Production Integration Readiness Review**

That sprint shall review whether the now-complete isolated architecture is ready for a controlled integration attempt.

It shall not assume readiness merely from this correction.

If a new unresolved identity cycle or source-observation ownership issue is discovered, recommend the narrow governance sprint required by that evidence instead.

---

# **Part XX — Recommendation Gate**

## **101\. Permitted Final Recommendation**

The final line must be exactly one:

> **Correction Implementation Complete**

or:

> **Correction Implementation Incomplete**

No other wording is permitted.

---

## **102\. Correction Implementation Complete**

Use only if:

* the exact v1 policy is implemented;  
* the exact canonical body is implemented;  
* SHA-256 and required encoding are implemented;  
* enriched claims carry policy and digest;  
* observations carry the matching digest for enriched evaluation;  
* the conflict engine recomputes and verifies before per-cell evaluation;  
* integrity errors escape the ordinary `evaluation_failed` catch;  
* no evaluation publication is produced on mismatch;  
* status mutation is rejected;  
* factual-value mutation is rejected;  
* valid enriched evaluation passes;  
* base evaluation remains unchanged;  
* six-state vocabulary remains unchanged;  
* Composer Option A remains unchanged;  
* discriminated Claim Set architecture remains unchanged;  
* both full regression matrices pass;  
* isolation holds;  
* full validation passes.

---

## **103\. Correction Implementation Incomplete**

Use if:

* any canonical digest field is omitted;  
* digest construction is nondeterministic;  
* claim identity and digest construction become circular;  
* observations are not coupled to the published claim digest;  
* integrity mismatch becomes `evaluation_failed`;  
* a mismatched evaluation publication is returned;  
* either mutation remains silently accepted;  
* valid enriched claims produce false-positive failure;  
* base conflict evaluation regresses;  
* the composer becomes the integrity owner;  
* the six-state vocabulary changes;  
* production isolation fails;  
* full validation fails.

---

# **Part XXI — Binding Implementation Summary**

## **104\. Enrichment Publication**

EnrichedGovernedClaimInput  
    ├── baseClaimId  
    ├── claimIntegrityPolicyId  
    │      \=  
    │  governed-enriched-claim-integrity.v1  
    └── claimIntegrityDigest  
           \=  
       sha256:\<canonical claim state\>

---

## **105\. Canonical State**

policy  
claimId  
baseClaimId  
claimType  
material  
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
segmentIds

---

## **106\. Observation Coupling**

GovernedSourceObservation  
    ├── affectedClaimId  
    └── evaluatedClaimIntegrityDigest  
           \=  
       target enriched claim.claimIntegrityDigest

---

## **107\. Conflict Verification**

claimSetKind \= enriched  
    ↓  
for each enriched claim:  
    validate policy  
    validate digest format  
    recompute digest  
    compare published digest  
    validate observation digests  
    reject mixed digests  
    ↓  
all pass  
    → existing per-cell evaluation

any fail  
    → throw EnrichedClaimIntegrityError  
    → no evaluation  
    → no conflict set

---

## **108\. Non-Reopening Rules**

Claim recognition  
    unchanged

Enrichment materiality  
    unchanged

Conflict taxonomy  
    unchanged

Per-cell evaluation  
    unchanged

Six-state vocabulary  
    unchanged

Discriminated Claim Sets  
    unchanged

Projection composer  
    unchanged

Production runtime  
    untouched

---

## **109\. Central Required Result**

runEnrichedClaimMutationProof()

baseline  
    → completes

status mutation  
    → published\_claim\_digest\_mismatch  
    → rejected before evaluation

factual-value mutation  
    → published\_claim\_digest\_mismatch  
    → rejected before evaluation

---

## **110\. Governing Discipline**

publish the claim state immutably  
commit to the exact canonical body  
bind each observation to that body  
verify at the conflict trust boundary  
fail before evaluation  
publish nothing from malformed inputs  
preserve source ownership  
preserve conflict semantics  
preserve projection responsibility  
keep production untouched

The final line shall be exactly:

> **Correction Implementation Complete**

or:

> **Correction Implementation Incomplete**


---

# **Sprint 3.109 Completion Report**

## **84. Repository Precondition**

* Repository: `/workspace/jarvis`.
* Active branch: `work`.
* Starting commit: `9ca47aa9c06dcc929f11a695029487a7695b846e`.
* Starting working tree: clean (`git status --porcelain=v1` produced no entries).
* Required documents read completely before editing: Sprint 3.86, Sprint 3.95, Sprint 3.103, Sprint 3.104, Sprint 3.106, Sprint 3.107, Sprint 3.108, Constitutional Publication Principles, and the architecture Roadmap.
* Sprint 3.108 extraction: policy `governed-enriched-claim-integrity.v1`; claim fields `claimIntegrityPolicyId` and `claimIntegrityDigest`; observation field `evaluatedClaimIntegrityDigest`; SHA-256; `sha256:<64 lowercase hexadecimal characters>`; and the seven closed mismatch codes reported in Section 90 below.
* Exact canonical body: `policy`, `claimId`, `baseClaimId`, `claimType`, `material`, `status`, `ownership`, `sourceReferences`, `factualValues`, `sourceAvailable`, `provenance`, `observedAt`, `contentKind`, `boundedComplete`, `conflicts`, `enrichmentEvaluationId`, `threadId`, `requestId`, `exchangeId`, `segmentIds`.
* Starting `EnrichedGovernedClaimInput`: `GovernedClaimInput` plus only mandatory `baseClaimId`.
* Starting `GovernedSourceObservation`: no integrity field; observations linked only through `affectedClaimId`.
* Starting enriched identity constructor: `lineageIdentity("enriched-governed-claim", { baseClaimId, enrichmentEvaluationId, ...body })` followed by deep-frozen publication.
* Starting real mutation output: `statusMutationSilentlyAccepted: true` and `factualValueMutationSilentlyAccepted: true`.
* Starting catch structure: one broad `try/catch` around the per-cell loop; the catch returned `publishEvaluation(..., "evaluator_failure")`, which derived `evaluation_failed`.
* Live observation constructors found: `conflict-boundary-fixtures.ts`; `claim-boundary-conflict-boundary-composition-evaluation-fixtures.ts`; `full-assembly-claim-boundary-conflict-boundary-composition-regression.ts`; `claims-conflicts-correction-composition.test.ts`; and enriched consumers in `full-assembly-enrichment-composition-recheck.ts`. Only enriched consumers required digest migration; base constructors deliberately continue to omit it.
* Expected file surface matched the specification: one integrity module and test; enrichment types/publications/engine; conflict types/engine; enriched re-check proof and tests; mechanical historical isolation/hash-test migrations; and this report.
* Starting protected SHA-256 hashes: `app/api/chat/route.ts` `503840...8a3`; `lib/context-builder.ts` `8e689b...894d`; `lib/useAgentConversation.ts` `552749...a9c97`; `lib/agents/chat-execution.ts` `da387b...10a88`; `projection-composer.ts` `a3e2df...ae47e`; `claim-boundary-engine.ts` `9ab35f...827a`; `claim-boundary-ruleset.ts` `afe7fc...8e83`; `source-evidence-assembly.ts` `01eacd...fa8b7`; `evidence-status.ts` `c83ada...3039e`; `model-invocation.ts` `beebd3...4f5b`; `validator.ts` `1bd969...49fef`.

## **85. Integrity Policy**

`claimIntegrityPolicyId = governed-enriched-claim-integrity.v1`

`algorithm = SHA-256`

`encoding = sha256:<64 lowercase hexadecimal characters>`

## **86. Canonical Digest Body**

Implemented top-level order: `policy`, `claimId`, `baseClaimId`, `claimType`, `material`, `status`, `ownership`, `sourceReferences`, `factualValues`, `sourceAvailable`, `provenance`, `observedAt`, `contentKind`, `boundedComplete`, `conflicts`, `enrichmentEvaluationId`, `threadId`, `requestId`, `exchangeId`, `segmentIds`.

Nested rules: source-reference keys are fixed and references sort lexically by `sourceId`, `resourceId`, `field`, `observedAt`; factual arrays preserve order and recursively canonicalize JSON-compatible values with lexically sorted object keys while rejecting undefined, functions, symbols, BigInt, cycles, exotic objects, and non-finite numbers; conflict keys are fixed, nested references follow the source-reference rule, and conflicts sort by `conflictId`; segment IDs are nonempty, unique, and lexically sorted; required strings reject empty values; required arrays remain arrays; and published arrays are not mutated.

## **87. Enriched Claim Changes**

`EnrichedGovernedClaimInput` now mandates `claimIntegrityPolicyId` and `claimIntegrityDigest`. `constructEnrichedClaim` derives the unchanged enriched `claimId` first, constructs the exact integrity body with explicit lineage and segment context, computes SHA-256, and deep-freezes the final publication. Successful `ClaimEnrichmentRecord` variants mandate both fields.

Circularity is avoided by retaining the existing evaluation identity discriminator semantics. The final claim digest includes `enrichmentEvaluationId`; therefore policy/digest fields are recorded in the completed evaluation body but excluded from the evaluation identity body, as expressly permitted by Sections 31 and 77. The Enriched Claim Set identity includes the final claims and consequently commits to both integrity fields.

## **88. Observation Changes**

`GovernedSourceObservation` now exposes optional `evaluatedClaimIntegrityDigest`, with runtime conditional enforcement. Enriched re-check and mutation-proof observation construction copies the target published claim digest. Base constructors in the fixture, base full-assembly regression, claims/conflicts correction, and composition fixtures remain unchanged and omit the field. Source publication IDs remain source-owner supplied; no competing observation identity was invented.

## **89. Conflict Verification**

The implemented sequence is: (1) recompute each supplied enriched claim digest from actual state and supplied claim-set lineage/segment links; (2) compare it to the published claim digest; (3) compare all targeting observation digests to that claim digest, including mixed-digest detection.

**Selected approach: Structure A.** Claim-set publication identity and enriched integrity verification execute before entry into the existing per-cell `try/catch`. Consequently `EnrichedClaimIntegrityError` never enters the ordinary evaluator catch.

## **90. Error Vocabulary**

* `published_claim_digest_mismatch`: protected-field and segment-link mutation tests.
* `observation_claim_digest_mismatch`: well-formed different observation digest test.
* `observation_digest_missing`: missing enriched observation digest test.
* `claim_digest_missing`: missing claim policy/digest test.
* `mixed_observation_claim_digests`: matching-plus-different observation test.
* `claim_integrity_policy_mismatch`: wrong policy test.
* `claim_integrity_digest_malformed`: malformed claim and observation digest tests, including uppercase and incorrect length validation.

> Integrity mismatches throw before evaluation and are not mapped to `evaluation_failed`.

The mutation proof test sets publication flags only after a real engine return; both remain false when the error escapes, so the test would fail if the broad catch converted the error into `evaluation_failed`.

## **91. Mutation Proof**

The real `runEnrichedClaimMutationProof()` returned: baseline `evaluated_no_conflict`; status rejected `true` with `published_claim_digest_mismatch`; factual-value mutation rejected `true` with `published_claim_digest_mismatch`; no status evaluation published `true`; no factual-value evaluation published `true`; both `statusMutationSilentlyAccepted` and `factualValueMutationSilentlyAccepted` `false`.

## **92. Positive Evaluation Proof**

A genuine enrichment-engine claim has the fixed policy and valid digest, recomputation equals publication, and matching observations carry the same digest. The targeted proof produced `evaluated_no_conflict`; contradictory observations carrying the same correct digest produced `evaluated_conflict_found` and a Governed Conflict Set. Neither valid path produced a false-positive integrity error.

## **93. Regression Matrices**

### **Sprint 3.102**

Ten of ten scenarios executed and passed; regressions: zero. Base observations continued without digest fields and the six existing results remained represented.

### **Sprint 3.105**

Ten of ten scenarios executed and passed; the enriched Claim Set to conflict seam is compatible; projection lineage is compatible; deterministic identities replay; and the real mutation proof rejects both mutations without publication.

## **94. Prior-Contract Compatibility**

Sprint 3.90: unchanged. Sprint 3.94/3.95 per-cell evaluation: unchanged. Sprint 3.103 enrichment semantics: unchanged. Sprint 3.106/3.107 discriminated claim sets: unchanged. Composer Option A: unchanged.

## **95. Isolation Result**

All eleven protected post-hashes exactly equal the starting hashes recorded in Section 84. Pure-Node `node:fs`, `node:path`, and `node:crypto` checks found no claim-integrity import from `projection-composer.ts` and no route, context-builder, conversation-hook, or chat-execution contact. Production behavior remains untouched.

## **96. Files Changed**

* `claim-integrity.ts` — v1 policy, canonical body, serializer, digest, validator, and error vocabulary; Sprint 3.108 §§15-34; integrity implementation.
* `claim-integrity.test.ts` — canonical, positive, negative, publication, base, and catch-escape proofs; §§35-43, 51-52; test migration.
* `claim-enrichment-types.ts` — mandatory enriched claim and successful record integrity fields; §§15, 23; integrity implementation.
* `claim-enrichment-publications.ts` — non-circular final claim digest publication and evaluation-identity exception; §§20-23; integrity implementation.
* `claim-enrichment-engine.ts` — explicit lineage/segment context and final record digest migration; §§18-23; integrity implementation.
* `conflict-boundary-types.ts` — conditional observation digest field; §§24-25; integrity implementation.
* `conflict-boundary-engine.ts` — Structure A fail-closed verification before per-cell catch; §§28-34; integrity implementation.
* `full-assembly-enrichment-composition-recheck.ts` — coupled enriched observations and real rejection proof; §§35-38; live fixture migration.
* `full-assembly-enrichment-composition-recheck.test.ts` — new mutation result and authorized hash surface; §§35-38, 42; test migration.
* `claim-enrichment-composition.test.ts` and `full-assembly-claim-boundary-conflict-boundary-composition-regression.test.ts` — authorized implementation hash migration while retaining isolation assertions; §42; test migration.
* `claim-boundary-isolation.test.ts` and `conflict-boundary-isolation.test.ts` — mechanical exclusion of the new cross-boundary integrity test from historical hidden-import scans; §42; test migration.
* `docs/SPRINT-3.109-ENRICHMENT-INTEGRITY-COUPLING-IMPLEMENTATION.md` — this completion report; documentation.

Historical Sprint 3.86/3.95/3.103/3.104/3.106/3.107/3.108 documents and all protected production, composer, claim recognition, materiality, source assembly, model, and validator files were deliberately left unchanged.

## **97. Validation Results**

* Targeted integrity suite: 6/6 passed.
* Claim-enrichment suites: passed.
* Conflict-boundary suites: passed.
* Real mutation proof: passed with both mismatch codes and no publications.
* Sprint 3.102 matrix: 10/10 passed.
* Sprint 3.105 matrix: 10/10 passed.
* Projection, governed-input, model-invocation, and validator suites: passed as part of `npm test`.
* `npm test`: passed.
* `npm run lint`: passed with no warnings or errors.
* `npm run typecheck`: passed.
* `git diff --check`: passed.
* `npm run build`: application compilation passed, but the constrained runner terminated during Next.js post-compilation type/page-data work after a Google Fonts download warning; no successful build exit or `.next/BUILD_ID` was produced. A second resource-constrained run reached page-data collection but likewise did not complete. Under Section 83's no-exception rule, full validation is therefore not complete.

## **98. Production Effect**

> Sprint 3.109 adds deterministic integrity coupling between enriched claims and the governed source observations used by conflict evaluation. It does not alter claim recognition, enrichment materiality, conflict taxonomy, per-cell evaluation, projection composition, model invocation, `/api/chat`, `context-builder.ts`, `useAgentConversation.ts`, or current production conversational behaviour.

## **99. Outstanding Findings**

Canonical serialization: implemented and passing. Digest construction: implemented and passing. Enrichment identity sequence: deterministic constrained exception documented. Observation coupling: implemented for every enriched consumer. Conflict precondition verification: implemented before the catch. Status mutation: rejected. Factual-value mutation: rejected. Base compatibility: passing. Six-state vocabulary: unchanged. Composer Option A: unchanged. Isolation: passing. Full build completion: unresolved runner termination after successful compilation.

## **100. Recommended Next Step**

Rerun `npm run build` in an environment able to complete Next.js page-data generation. Once that no-exception validation gate passes, the governed next sprint is **Sprint 3.110 — Governed Conversational Production Integration Readiness Review**; it must not assume readiness merely from this correction.

## **101. Permitted Final Recommendation**

**Correction Implementation Incomplete**
