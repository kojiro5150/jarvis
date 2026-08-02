# **Sprint 3.104 — Isolated Evidence-to-Claim Enrichment Implementation**

**Status:** Implementation Complete
**Sprint Type:** Isolated Governance-Correction Implementation  
**Implementation Authority:** Sprint 3.103 — Governed Evidence-to-Claim Enrichment Contract  
**Production Integration:** Prohibited  
**Output Path:** `docs/SPRINT-3.104-ISOLATED-EVIDENCE-TO-CLAIM-ENRICHMENT-IMPLEMENTATION.md`

---

## **1\. Purpose**

Sprint 3.104 implements Sprint 3.103’s binding Evidence-to-Claim Enrichment architecture as new, isolated modules.

The sprint inserts the missing deterministic stage between:

Sprint 3.91 claim recognition  
    ↓  
base GovernedClaimSet

and:

Sprint 3.92 conflict evaluation

The implemented chain shall be:

real GovernedClaimSet  
    \+  
real GovernedSourceEvidenceAssemblyResult  
    \+  
deterministic evidence-resolution port  
    ↓  
Evidence-to-Claim Enrichment Engine  
    ↓  
EvidenceToClaimEnrichmentEvaluation  
    \+  
EnrichedGovernedClaimSet

The stage shall:

* preserve the existing evidence-blind Claim Boundary;  
* apply the closed materiality matrix from Sprint 3.103;  
* correlate recognised claims only with admitted governed evidence;  
* compute truthful post-evidence claim statuses;  
* create new enriched claim identities linked to immutable base claims;  
* preserve all recognition lineage;  
* produce immutable enrichment publications;  
* remain fully isolated from production chat and projection call sites.

This sprint shall not modify:

lib/governed-conversation/claim-boundary-engine.ts  
lib/governed-conversation/projection-composer.ts

---

## **2\. Central Proof**

The sprint’s central proof is the real Cassie case:

“What’s Cassie’s email? Anything important?”

The existing Claim Boundary shall produce:

base contact\_address\_lookup  
    status \= insufficient\_coverage

base message\_importance  
    status \= unsupported

The new enrichment stage shall consume real assembled governed Gmail evidence and produce:

enriched contact\_address\_lookup  
    outcome \= enriched\_available  
    status \= available  
    sourceReferences \= real admitted Gmail source reference(s)  
    factualValues \= real canonical Cassie address value(s)  
    boundedComplete \= true  
    baseClaimId \= original contact claim ID  
    claimId \= new immutable enriched identity

enriched message\_importance  
    outcome \= retained\_unsupported  
    status \= unsupported  
    no evidence-based upgrade

The base Claim Set and both base claims shall remain byte-for-byte structurally unchanged.

---

## **3\. Sprint Character**

This is an isolated implementation sprint.

It may:

* add enrichment types;  
* add a versioned enrichment ruleset;  
* add a deterministic enrichment engine;  
* add immutable enrichment-publication constructors;  
* add an evidence-resolution port;  
* add source-local resolver fixtures;  
* add isolated tests;  
* reuse the existing evidence-status function;  
* reuse existing lineage identity construction;  
* consume `GovernedClaimSet`;  
* consume `GovernedSourceEvidenceAssemblyResult`.

It shall not:

* change recognition;  
* add evidence to `BoundaryEngineInput`;  
* modify `evaluateClaimBoundary`;  
* modify claim patterns;  
* modify source publishers;  
* modify acquisition adapters;  
* modify source assembly;  
* modify conflict evaluation;  
* wire enrichment into conflict evaluation;  
* modify the projection composer;  
* wire enrichment into projection call sites;  
* invoke a model;  
* access legacy OperationalState;  
* access legacy Gmail threads;  
* access `/api/chat`.

---

## **4\. Governing Hierarchy**

Apply:

1. JARVIS Engineering Constitution;  
2. JARVIS North Star;  
3. JARVIS Engineering Specification Standard;  
4. Constitutional Publication Principles;  
5. Roadmap;  
6. Sprint 3.89 — Governed Conversational Claims Boundary Contract;  
7. Sprint 3.90 — Governed Conversational Conflicts Boundary Contract;  
8. Sprint 3.91 — Isolated Governed Claims Boundary Implementation;  
9. Sprints 3.96–3.99 — governed source-evidence contracts;  
10. Sprint 3.101 — governed source-evidence wiring;  
11. Sprint 3.102 — full-assembly regression finding;  
12. Sprint 3.103 — binding enrichment contract;  
13. current repository types and functions;  
14. this specification.

Sprint 3.103 is the sole authority for enrichment semantics.

---

## **5\. Repository Precondition**

Before writing code:

1. Confirm the intended repository.  
2. Confirm the active branch.  
3. Record the starting commit.  
4. Record the starting working-tree state.  
5. Confirm Sprint 3.103 exists and is complete.  
6. Confirm these documents exist:

docs/SPRINT-3.89-GOVERNED-CONVERSATIONAL-CLAIMS-BOUNDARY-CONTRACT.md  
docs/SPRINT-3.91-ISOLATED-GOVERNED-CLAIMS-BOUNDARY-IMPLEMENTATION.md  
docs/SPRINT-3.96-GOVERNED-GMAIL-CONVERSATIONAL-EVIDENCE-PUBLICATION-CONTRACT.md  
docs/SPRINT-3.97-GOVERNED-CALENDAR-CONVERSATIONAL-EVIDENCE-PUBLICATION-CONTRACT.md  
docs/SPRINT-3.98-GOVERNED-MEMORY-PRIORITY-CONVERSATIONAL-EVIDENCE-PUBLICATION-CONTRACT.md  
docs/SPRINT-3.99-GOVERNED-CONNECTOR-AVAILABILITY-CONVERSATIONAL-EVIDENCE-PUBLICATION-CONTRACT.md  
docs/SPRINT-3.101-GOVERNED-SOURCE-EVIDENCE-PUBLISHER-WIRING.md  
docs/SPRINT-3.102-FULL-ASSEMBLY-CONVERSATIONAL-COMPOSITION-REGRESSION.md  
docs/SPRINT-3.103-GOVERNED-EVIDENCE-TO-CLAIM-ENRICHMENT-CONTRACT.md

7. Read Sprint 3.103 completely.  
8. Extract and record verbatim:  
   * all required publication fields;  
   * all six enrichment outcomes;  
   * the materiality matrix;  
   * identity rules;  
   * Cassie expected result;  
   * evidence-status rules;  
   * no-reopening decisions.  
9. Read completely:

lib/governed-conversation/claim-boundary-types.ts  
lib/governed-conversation/types.ts  
lib/governed-conversation/claim-boundary-engine.ts  
lib/governed-conversation/claim-boundary-publications.ts  
lib/governed-conversation/claim-boundary-ruleset.ts  
lib/governed-conversation/evidence-status.ts  
lib/governed-conversation/source-evidence-assembly.ts  
lib/governed-conversation/gmail-evidence-publisher.ts  
lib/governed-conversation/projection-composer.ts

10. Confirm the current exact `GovernedClaimSet` fields.  
11. Confirm the current exact `GovernedClaimInput` fields.  
12. Confirm `GovernedClaimInput` has no `baseClaimId`.  
13. Confirm `GovernedSourceEvidenceAssemblyResult` contains:  
    * `communicationEvidence`;  
    * `calendarEvidence`;  
    * `memoryPriorityReferences`;  
    * `connectorAvailability`;  
    * `sourceResults`.  
14. Confirm `GovernedCommunicationEvidenceInput` is reference-based and does not itself contain the canonical address value.  
15. Confirm no enrichment engine or enrichment publication currently exists.  
16. Record pre-sprint hashes for all protected files in Section 50\.  
17. Produce an expected file list before editing.

If any premise differs materially, stop.

Return:

> **Implementation Incomplete**

---

## **6\. Required Module Structure**

Create:

lib/governed-conversation/claim-enrichment-types.ts  
lib/governed-conversation/claim-enrichment-ruleset.ts  
lib/governed-conversation/claim-enrichment-engine.ts  
lib/governed-conversation/claim-enrichment-publications.ts  
lib/governed-conversation/claim-enrichment-fixtures.ts

Create tests:

lib/governed-conversation/claim-enrichment-types.test.ts  
lib/governed-conversation/claim-enrichment-ruleset.test.ts  
lib/governed-conversation/claim-enrichment-engine.test.ts  
lib/governed-conversation/claim-enrichment-publications.test.ts  
lib/governed-conversation/claim-enrichment-composition.test.ts

A smaller number of test files is permitted only where all required proof remains clearly separated and independently identifiable.

No existing production file is expected to change.

---

# **Part I — Enrichment Types**

## **7\. Exact Outcome Vocabulary**

Define exactly:

export const CLAIM\_ENRICHMENT\_OUTCOMES \= \[  
  "enriched\_available",  
  "retained\_insufficient\_coverage",  
  "retained\_unavailable",  
  "retained\_unsupported",  
  "not\_material",  
  "enrichment\_failed",  
\] as const;

And:

export type ClaimEnrichmentOutcome \=  
  (typeof CLAIM\_ENRICHMENT\_OUTCOMES)\[number\];

No alternate spelling is permitted.

No open string extension is permitted.

---

## **8\. Evidence Category Vocabulary**

Define a closed vocabulary:

export const CLAIM\_ENRICHMENT\_EVIDENCE\_CATEGORIES \= \[  
  "communicationEvidence",  
  "calendarEvidence",  
  "memoryPriorityReferences",  
  "connectorAvailability",  
\] as const;

No arbitrary source category is admitted.

---

## **9\. Materiality Vocabulary**

Define:

export type ClaimEvidenceMateriality \=  
  | "material"  
  | "conditionally\_material"  
  | "not\_material";

The implementation shall distinguish:

* factual materiality;  
* source-availability materiality;  
* non-materiality.

---

## **10\. Enriched Claim Type**

Do not modify the existing `GovernedClaimInput`.

Define an adjacent type:

export interface EnrichedGovernedClaimInput  
  extends GovernedClaimInput {  
  readonly baseClaimId: string;  
}

The inherited fields shall retain their existing meanings.

`baseClaimId` is mandatory.

An enriched claim may not use:

claimId \=== baseClaimId

---

## **11\. Per-Claim Enrichment Record**

Define an immutable record equivalent to:

export interface ClaimEnrichmentRecord {  
  readonly baseClaimId: string;  
  readonly enrichedClaimId: string;  
  readonly claimType: GovernedClaimInput\["claimType"\];  
  readonly outcome: ClaimEnrichmentOutcome;  
  readonly admittedEvidenceCategories:  
    readonly ClaimEnrichmentEvidenceCategory\[\];  
  readonly consultedSourceReferences:  
    readonly GovernedSourceReference\[\];  
  readonly admittedSourceReferences:  
    readonly GovernedSourceReference\[\];  
  readonly rejectedSourceReferences:  
    readonly GovernedSourceReference\[\];  
  readonly reason: string;  
}

The exact field name for `reason` may be more strongly typed if the implementation defines a closed reason vocabulary.

It shall not be omitted.

---

## **12\. Evidence-to-Claim Enrichment Evaluation**

Define the publication with the exact contract fields:

export interface EvidenceToClaimEnrichmentEvaluation {  
  readonly enrichmentRulesetId: string;  
  readonly enrichmentEvaluationId: string;  
  readonly baseGovernedClaimSetId: string;  
  readonly threadId: string;  
  readonly requestId: string;  
  readonly exchangeId: string;  
  readonly sourceAssemblyReference: string;  
  readonly referenceTime: string;  
  readonly evaluatedClaimIds: readonly string\[\];  
  readonly admittedEvidenceCategoryCells:  
    readonly AdmittedEvidenceCategoryCell\[\];  
  readonly sourceReferencesConsulted:  
    readonly GovernedSourceReference\[\];  
  readonly sourceReferencesAdmitted:  
    readonly GovernedSourceReference\[\];  
  readonly sourceReferencesRejected:  
    readonly GovernedSourceReference\[\];  
  readonly claimOutcomes:  
    readonly ClaimEnrichmentRecord\[\];  
  readonly createdAt: string;  
}

Sprint 3.103 uses the semantic phrase:

projection/source-assembly reference

Because this sprint operates before projection, implement the field as:

sourceAssemblyReference

It shall identify the exact assembled evidence input evaluated.

It shall not claim that a projection already exists.

---

## **13\. Enriched Governed Claim Set**

Define:

export interface EnrichedGovernedClaimSet {  
  readonly enrichedGovernedClaimSetId: string;  
  readonly baseGovernedClaimSetId: string;  
  readonly enrichmentEvaluationId: string;  
  readonly claimBoundaryRulesetId: string;  
  readonly claimBoundaryEvaluationId: string;  
  readonly threadId: string;  
  readonly requestId: string;  
  readonly exchangeId: string;  
  readonly referenceTime: string;  
  readonly claims: readonly EnrichedGovernedClaimInput\[\];  
  readonly segmentLinks:  
    readonly {  
      readonly segmentId: string;  
      readonly claimId: string;  
    }\[\];  
  readonly claimIds: readonly string\[\];  
  readonly createdAt: string;  
}

The enriched set shall preserve recognition linkage while replacing segment-link claim IDs with enriched claim IDs.

The base set’s segment links shall remain unchanged.

---

## **14\. Engine Result**

Define a closed result shape:

export type ClaimEnrichmentEngineResult \=  
  | {  
      readonly outcome: "completed";  
      readonly evaluation:  
        EvidenceToClaimEnrichmentEvaluation;  
      readonly enrichedClaimSet:  
        EnrichedGovernedClaimSet;  
    }  
  | {  
      readonly outcome: "failed";  
      readonly evaluation:  
        EvidenceToClaimEnrichmentEvaluation;  
      readonly enrichedClaimSet?: undefined;  
    };

A deterministic processing failure shall produce:

enrichment\_failed

records in the evaluation and no falsely complete enriched Claim Set.

Do not throw for an ordinary governed enrichment failure.

Throw only for programmer-contract violations such as malformed lineage or impossible duplicate identities.

---

# **Part II — Enrichment Ruleset**

## **15\. Versioned Ruleset**

Create one immutable ruleset publication.

It shall contain:

export interface ClaimEnrichmentRuleset {  
  readonly schemaVersion: "1";  
  readonly rulesetVersion: "1.0.0";  
  readonly enrichmentRulesetId: string;  
  readonly publicationDigest: string;  
  readonly materialityMatrix:  
    readonly ClaimEnrichmentMaterialityRule\[\];  
  readonly permittedOutcomes:  
    readonly ClaimEnrichmentOutcome\[\];  
  readonly admittedClaimTypes:  
    readonly \[  
      "contact\_address\_lookup",  
      "message\_importance"  
    \];  
}

The ID and digest shall be deterministically derived from the immutable ruleset body.

---

## **16\. Exact Materiality Matrix**

Implement exactly:

| Claim type | Communication evidence | Calendar evidence | Memory Priority evidence | Connector availability |
| ----- | ----- | ----- | ----- | ----- |
| `contact_address_lookup` | `material` | `not_material` | `not_material` | `conditionally_material` for source availability only |
| `message_importance` | no admitted importance evidence | `not_material` | `not_material` | `conditionally_material` only to explain unavailable source; never to support importance |

In code, the message-importance communication cell shall resolve to:

not\_material

for evidentiary enrichment.

Its claim-level result remains:

retained\_unsupported

Do not introduce an importance-evidence rule.

---

## **17\. No Open Extension Point**

The v1 ruleset shall not expose a generic callback or arbitrary registration mechanism for new:

* claim types;  
* source categories;  
* materiality functions;  
* evidence selectors.

Future additions require a new governed ruleset version.

---

# **Part III — Evidence Resolution Port**

## **18\. Need for Resolution**

`GovernedCommunicationEvidenceInput` provides:

* source reference;  
* communication reference;  
* recipient-evidence reference;  
* provenance reference;  
* retrieval time;  
* policy information.

It does not itself carry the canonical contact address.

Therefore the enrichment engine requires a deterministic resolver port.

---

## **19\. Resolver Port**

Define an interface equivalent to:

export interface GovernedEvidenceResolver {  
  resolveCommunicationEvidence(  
    input: GovernedCommunicationEvidenceInput  
  ): readonly ResolvedCommunicationAddressAssertion\[\];  
}

The resolver shall be injected.

The enrichment engine shall not import a connector or source database.

---

## **20\. Resolved Address Assertion**

Define a bounded immutable shape equivalent to:

export interface ResolvedCommunicationAddressAssertion {  
  readonly evidenceReference: string;  
  readonly sourceReference: GovernedSourceReference;  
  readonly entityId: string;  
  readonly address: string;  
  readonly provenanceReference: string;  
  readonly observedAt: string;  
  readonly available: boolean;  
  readonly policyReference: string;  
  readonly fieldCoverage: "complete" | "incomplete";  
  readonly scopeComplete: boolean;  
  readonly fresh: boolean;  
}

The resolver output shall contain only facts already represented by the governed canonical source observation.

It shall not:

* search arbitrary messages;  
* infer entity identity;  
* fuzzy-match names;  
* choose between values;  
* inspect legacy Gmail;  
* use a model;  
* broaden policy.

---

## **21\. Reference Integrity**

Every resolved assertion must correspond to an assembled `communicationEvidence` item.

The engine shall reject or record as rejected an assertion whose:

* evidence reference does not match;  
* source reference does not match;  
* policy reference does not match;  
* observation time is inconsistent;  
* entity identity is absent;  
* address is empty.

The resolver cannot introduce evidence not present in the assembled evidence collection.

---

# **Part IV — Engine Input**

## **22\. Engine Input Type**

Define:

export interface ClaimEnrichmentEngineInput {  
  readonly baseClaimSet: GovernedClaimSet;  
  readonly assembledEvidence:  
    GovernedSourceEvidenceAssemblyResult;  
  readonly sourceAssemblyReference: string;  
  readonly resolver: GovernedEvidenceResolver;  
  readonly referenceTime: string;  
  readonly createdAt: string;  
}

No raw operator text is required.

No typed intent is required.

No Claim Boundary rerun is permitted.

---

## **23\. Input Validation**

Validate:

* `baseClaimSet.governedClaimSetId`;  
* `threadId`;  
* `requestId`;  
* `exchangeId`;  
* `claimBoundaryRulesetId`;  
* `claimBoundaryEvaluationId`;  
* `referenceTime`;  
* `createdAt`;  
* unique base claim IDs;  
* base claim IDs match `claimIds`;  
* segment links reference base claims;  
* valid source assembly reference;  
* immutable source collections or defensive immutable copies.

A malformed base publication is a programmer-contract violation.

---

# **Part V — Contact-Address Enrichment**

## **24\. Base Claim Eligibility**

A contact claim may be evaluated only when:

claimType \= contact\_address\_lookup  
ownership \= deterministic\_status  
material \= true

The base status is expected to be:

insufficient\_coverage

If an already-available base contact claim is supplied, fail closed or retain it only if Sprint 3.103’s monotonicity and publication lineage can be proven without aliasing.

The implementation shall not silently produce a second available publication from an unexplained base state.

---

## **25\. Entity Correlation**

The enrichment engine requires the recognised entity identity.

The current `GovernedClaimInput` does not contain a named `entityId` field.

Therefore the implementation shall derive the entity identifier only from a deterministic, already-published Claim Boundary source established by Sprint 3.91, such as:

* the Claim Boundary evaluation’s extracted parameters; or  
* an immutable enrichment input index keyed by base `claimId`.

Do not infer entity identity from:

* prompt text;  
* person display name;  
* email local part;  
* subject;  
* model output.

If the existing `GovernedClaimSet` alone cannot resolve the entity identity, define a narrowly scoped input:

readonly claimParametersByClaimId:  
  Readonly\<Record\<string, GovernedClaimParameters\>\>

constructed directly from the existing Claim Boundary evaluation.

Do not modify `GovernedClaimInput`.

---

## **26\. Admitted Communication Evidence**

For each contact claim:

1. inspect assembled `communicationEvidence`;  
2. resolve each item through the injected resolver;  
3. admit only assertions whose `entityId` exactly matches the recognised entity;  
4. validate policy and source-reference integrity;  
5. preserve all admitted distinct address values;  
6. select no preferred source or value.

---

## **27\. Source Availability**

Use `connectorAvailability` only to determine whether the relevant Gmail source is available.

Expected relevant connector record:

connectorId \= "gmail"

Possible results:

### **Available**

availability \= "available"

The engine may evaluate resolved communication evidence.

### **Unavailable**

availability \= "unavailable"

If no other admitted contact-address source exists, produce:

retained\_unavailable

and canonical status:

unavailable

### **Missing connector record**

Treat as insufficient evidence of availability, not as available.

Produce:

retained\_insufficient\_coverage

unless a source-specific evidence publication itself supplies the exact availability proof required by the contract.

---

## **28\. Status Computation**

Use the existing `computeEvidenceStatus` with explicit inputs.

For a complete, available, single-value Cassie assertion:

supported \= true  
sourceAvailable \= true  
governedEvidence \= true  
identitySufficient \= true  
provenanceSufficient \= true  
scopeComplete \= true  
fieldCoverage \= true  
fresh \= true  
conflictFree \= true  
contentComplete \= true

Expected status:

available

Expected enrichment outcome:

enriched\_available

---

## **29\. Insufficient Coverage**

Produce:

retained\_insufficient\_coverage

when:

* no matching communication evidence exists;  
* the resolver returns no assertion;  
* entity correlation fails;  
* provenance is incomplete;  
* field coverage is incomplete;  
* evidence is stale;  
* scope is insufficient;  
* an evidence reference cannot be resolved;  
* the address value is missing.

The enriched claim’s canonical status shall remain:

insufficient\_coverage

---

## **30\. Multiple Address Values**

If multiple distinct admissible address values exist:

* preserve every distinct factual value;  
* preserve every admitted source reference;  
* select none;  
* set pre-conflict `conflictFree = false`;  
* do not create a canonical conflict;  
* do not adjudicate.

The resulting canonical claim status shall follow `computeEvidenceStatus`.

The dedicated conflict engine remains responsible for publishing the contradiction after enrichment.

---

# **Part VI — Message-Importance Handling**

## **31\. Importance Claim Rule**

For:

claimType \= message\_importance

the engine shall not consult communication content for importance.

It shall produce:

outcome \= retained\_unsupported  
status \= unsupported

The enriched importance claim receives a new claim identity because it is part of the new enriched Claim Set publication, but its canonical status and evidentiary content remain unchanged.

---

## **32\. No Importance Evidence**

The engine shall ignore for importance:

* communication evidence;  
* Calendar evidence;  
* Memory Priority evidence;  
* unread state;  
* labels;  
* `important`;  
* `needsReply`;  
* ordering;  
* connector availability as support.

Connector unavailability may be recorded in the enrichment evaluation as contextual source unavailability.

It shall not change:

unsupported

to:

unavailable

for message importance because the claim type itself lacks an admitted evidence rule.

---

# **Part VII — Non-Material Evidence**

## **33\. Calendar Boundary**

Calendar evidence shall not be passed to the resolver for either current claim type.

Tests shall prove that adding or removing Calendar evidence does not change:

* enrichment outcome;  
* claim status;  
* factual values;  
* source references;  
* enriched claim identity

for otherwise identical current claims.

---

## **34\. Memory Priority Boundary**

Memory Priority references shall not affect either current claim type.

Tests shall prove that even a valid operator priority mentioning Cassie does not alter:

* contact address;  
* message importance;  
* claim availability.

---

## **35\. Connector Boundary**

Connector availability may affect source availability only.

It shall never enter:

factualValues

and shall never become the factual source reference supporting an email address.

---

# **Part VIII — Publication Construction**

## **36\. Deterministic Identity Construction**

Use the existing lineage identity mechanism.

Derive:

enrichmentRulesetId  
enrichmentEvaluationId  
enriched claimId  
enrichedGovernedClaimSetId

from their immutable canonical bodies.

No random UUID.

No ambient clock.

No array-index-only identity.

---

## **37\. Enriched Claim Identity Body**

The enriched claim identity shall include at minimum:

* `baseClaimId`;  
* claim type;  
* materiality;  
* canonical status;  
* ownership;  
* admitted source references;  
* factual values;  
* source availability;  
* provenance;  
* observed time;  
* content kind;  
* bounded completeness;  
* conflicts;  
* enrichment evaluation identity.

Changing evidentiary content must change the enriched claim ID.

---

## **38\. Enrichment Evaluation Identity Body**

The evaluation identity shall include:

* ruleset ID;  
* base Claim Set ID;  
* lineage;  
* source assembly reference;  
* reference time;  
* evaluated claim IDs;  
* materiality cells;  
* source references consulted;  
* admitted references;  
* rejected references;  
* per-claim outcomes;  
* created time or explicit publication discriminator consistent with existing repository conventions.

---

## **39\. Enriched Claim Set Identity Body**

The enriched set identity shall include:

* base Claim Set ID;  
* enrichment evaluation ID;  
* lineage;  
* enriched claims;  
* enriched claim IDs;  
* enriched segment links;  
* reference time;  
* created time.

It shall not reuse the base set’s ID.

---

## **40\. Segment Links**

For each base segment link:

segmentId → baseClaimId

construct an enriched link:

segmentId → enrichedClaimId

The base segment links remain unchanged.

No segment may link to both base and enriched claim IDs within the enriched Claim Set.

---

## **41\. Immutability**

Freeze:

* ruleset;  
* materiality rules;  
* resolver-return copies used by the engine;  
* enrichment records;  
* evaluation;  
* enriched claims;  
* factual values;  
* source references;  
* segment links;  
* enriched Claim Set;  
* engine result.

Do not mutate the resolver’s original output.

---

# **Part IX — Complete Outcome Vocabulary**

## **42\. `enriched_available`**

Required reachable test:

* recognised contact claim;  
* exact entity match;  
* Gmail connector available;  
* complete governed assertion;  
* sufficient provenance;  
* complete field coverage;  
* fresh evidence;  
* one non-conflicting value.

Expected:

status \= available  
outcome \= enriched\_available

---

## **43\. `retained_insufficient_coverage`**

Required reachable test:

* recognised contact claim;  
* Gmail connector available;  
* no matching canonical address assertion.

Expected:

status \= insufficient\_coverage  
outcome \= retained\_insufficient\_coverage

---

## **44\. `retained_unavailable`**

Required reachable test:

* recognised contact claim;  
* Gmail connector unavailable;  
* no other admitted source.

Expected:

status \= unavailable  
outcome \= retained\_unavailable

---

## **45\. `retained_unsupported`**

Required reachable test:

* recognised `message_importance`.

Expected:

status \= unsupported  
outcome \= retained\_unsupported

---

## **46\. `not_material`**

This is a per-cell outcome, not necessarily the overall claim result.

Required reachable tests:

* contact-address claim × Calendar evidence;  
* contact-address claim × Memory Priority evidence;  
* importance claim × Calendar evidence;  
* importance claim × Memory Priority evidence.

These cells must be recorded as:

not\_material

and must not influence canonical claim status.

The implementation may represent per-cell outcomes separately from the claim-level outcome, but the vocabulary must be genuinely present and tested.

---

## **47\. `enrichment_failed`**

Required reachable test:

* deterministic resolver contract failure;  
* malformed resolver result;  
* mismatched source reference;  
* duplicate impossible enriched identity;  
* malformed enrichment input that is handled as a governed evaluation failure rather than an ordinary lack of evidence.

Expected:

outcome \= enrichment\_failed

No enriched Claim Set shall be published as complete.

Do not use this outcome for ordinary absence or unavailability.

---

# **Part X — Cassie Composition Test**

## **48\. Real Recognition**

The central test shall call the real:

evaluateClaimBoundary(...)

with the exact Cassie question and resolved Cassie entity fixture.

Required base result:

two claims  
contact\_address\_lookup  
message\_importance

Do not hand-construct the base Claim Set.

---

## **49\. Real Assembled Evidence**

The test shall use the real:

assembleGovernedSourceEvidence(...)

with deterministic acquisition fixtures matching Sprint 3.102.

The assembled evidence shall contain:

* genuine Gmail communication evidence;  
* truthful Gmail connector availability;  
* any Calendar evidence required by the assembly fixture;  
* legacy unattested Memory remaining empty.

Do not hand-construct the final assembled result after bypassing its function.

---

## **50\. Real Resolver Fixture**

The resolver fixture shall map the exact published Gmail evidence reference to one canonical Cassie address assertion.

It shall not resolve any unreferenced evidence.

It shall expose enough canonical facts to satisfy Sprint 3.103.

---

## **51\. Cassie Assertions**

Verify:

### **Contact claim**

base status \= insufficient\_coverage  
enrichment outcome \= enriched\_available  
enriched status \= available  
baseClaimId \= base contact claim ID  
enriched claimId ≠ base contact claim ID  
sourceReferences.length ≥ 1  
factualValues contains canonical Cassie address  
boundedComplete \= true  
ownership \= deterministic\_status

### **Importance claim**

base status \= unsupported  
enrichment outcome \= retained\_unsupported  
enriched status \= unsupported  
baseClaimId \= base importance claim ID  
enriched claimId ≠ base importance claim ID  
no importance factual value  
no importance-supporting source reference

### **Claim Set**

enrichedGovernedClaimSetId ≠ governedClaimSetId  
baseGovernedClaimSetId \= original governedClaimSetId  
enrichmentEvaluationId is present  
claimBoundaryRulesetId preserved  
claimBoundaryEvaluationId preserved  
threadId preserved  
requestId preserved  
exchangeId preserved

---

# **Part XI — Identity Integrity Tests**

## **52\. Base Claim Immutability**

Before enrichment:

* deep-clone or serialize the base Claim Set;  
* record the base Claim Set object;  
* record base claims;  
* record base segment links.

After enrichment:

* prove structural equality to the pre-enrichment snapshot;  
* prove object contents did not change;  
* prove base IDs did not change.

The base Claim Set shall remain frozen if it was frozen before enrichment.

---

## **53\. New Enriched Identities**

Prove:

* every enriched claim ID differs from its base claim ID;  
* every enriched claim references exactly one base claim ID;  
* every base claim maps to exactly one enriched claim for the evaluation;  
* enriched claim IDs are unique;  
* enriched Claim Set ID differs from base Claim Set ID;  
* evaluation ID differs from both set IDs;  
* ruleset ID differs from evaluation and set IDs.

---

## **54\. Deterministic Replay**

Run identical enrichment twice with identical:

* base Claim Set;  
* assembled evidence;  
* resolver output;  
* source assembly reference;  
* reference time;  
* created time.

Expected:

* identical evaluation identity;  
* identical enriched claim identities;  
* identical enriched Claim Set identity;  
* identical publication bodies.

---

## **55\. Evidentiary Mutation**

Change only one canonical address value in resolver output.

Expected:

* base Claim Set unchanged;  
* enrichment evaluation ID changes;  
* enriched contact claim ID changes;  
* enriched Claim Set ID changes;  
* importance claim identity may remain stable if its enriched canonical body is unchanged and identity derivation is claim-local.

The implementation shall document whether claim-local deterministic identity preserves the unchanged importance identity across an unrelated contact-evidence mutation.

---

# **Part XII — Materiality Tests**

## **56\. Calendar Non-Materiality**

With an identical contact claim and Gmail evidence:

1. run without Calendar evidence;  
2. run with Calendar evidence.

Expected contact result is structurally identical.

No Calendar source reference may appear in:

* contact claim source references;  
* contact factual values;  
* contact enrichment reason.

---

## **57\. Memory Non-Materiality**

Repeat with Memory Priority references.

Expected contact and importance statuses remain unchanged.

No Memory reference may support either current claim.

---

## **58\. Importance Boundary**

Provide abundant communication evidence and available Gmail connector status.

Expected:

message\_importance \= unsupported

Communication evidence shall not be consulted as admitted importance evidence.

---

## **59\. Connector Conditional Materiality**

For contact lookup:

* Gmail available \+ matching evidence → may become available;  
* Gmail unavailable → unavailable;  
* connector record missing \+ no independently sufficient source availability proof → insufficient coverage.

Connector availability shall not supply the email value.

---

# **Part XIII — Recognition Isolation**

## **60\. Protected Recognition Engine**

The following shall remain byte-identical:

lib/governed-conversation/claim-boundary-engine.ts  
lib/governed-conversation/claim-boundary-ruleset.ts  
lib/governed-conversation/claim-boundary-publications.ts

Required direct proof:

* no enrichment import added;  
* no evidence input added;  
* no new claim pattern;  
* no recognition-status change.

---

## **61\. Recognition Result Independence**

Run Claim Boundary once with evidence fixtures absent and once with evidence fixtures present outside the Claim Boundary call.

The base Claim Boundary result must be identical.

This proves evidence does not influence recognition.

---

# **Part XIV — Composer Isolation**

## **62\. Protected Composer**

The following shall remain byte-identical:

lib/governed-conversation/projection-composer.ts

No enrichment code may be imported by the composer.

No projection test in Sprint 3.104 may modify the composer’s call sites.

---

## **63\. No Projection Wiring**

Sprint 3.104 shall not pass enriched claims into the production projection assembly path.

It proves the enrichment publication independently.

Wiring enriched claims into:

* conflict evaluation;  
* projection construction;  
* governed input construction

is a separate future sprint.

---

# **Part XV — Conflict Isolation**

## **64\. Conflict Engine Unchanged**

The following shall remain byte-identical:

lib/governed-conversation/conflict-boundary-engine.ts

Sprint 3.104 shall not modify its accepted Claim Set type.

A future wiring/correction sprint may adapt it to the enriched set under Sprint 3.103’s authority.

---

## **65\. Optional Isolated Compatibility Proof**

A test may demonstrate that enriched claim fields are structurally capable of being mapped into the existing conflict engine’s claim input shape.

It shall not change conflict semantics or claim set ownership.

This optional proof does not constitute integration.

---

# **Part XVI — Production Isolation**

## **66\. Protected Production Files**

Record pre/post hashes for:

app/api/chat/route.ts  
lib/context-builder.ts  
lib/useAgentConversation.ts  
lib/agents/chat-execution.ts

Expected:

byte-identical

---

## **67\. No Prohibited Imports**

Pure-Node search shall prove:

* `/api/chat` imports no enrichment module;  
* `context-builder.ts` imports no enrichment module;  
* `useAgentConversation.ts` imports no enrichment module;  
* `lib/agents/` imports no enrichment module;  
* enrichment modules import no production route;  
* enrichment modules import no context builder;  
* enrichment modules import no conversation hook;  
* enrichment modules import no model invocation;  
* enrichment modules import no legacy OperationalState;  
* enrichment modules import no legacy Gmail connector.

---

## **68\. Pure-Node Isolation Check**

Use:

node:fs  
node:path  
node:crypto

Do not depend on:

rg  
execFileSync  
platform-specific shell traversal

for committed isolation validation.

---

# **Part XVII — Required Test Matrix**

## **69\. Ruleset Tests**

1. exact ruleset version;  
2. stable ruleset identity;  
3. stable publication digest;  
4. exact six-outcome vocabulary;  
5. exact four evidence categories;  
6. exact two admitted claim types;  
7. exact materiality matrix;  
8. no generic extension registration.

---

## **70\. Publication Tests**

9. evaluation carries every required field;  
10. enriched set carries every required field;  
11. base set ID is preserved as reference;  
12. enriched set ID differs;  
13. base claim ID is preserved as reference;  
14. enriched claim ID differs;  
15. segment links point to enriched claims;  
16. all publications are immutable;  
17. deterministic replay is stable.

---

## **71\. Contact Enrichment Tests**

18. complete Gmail evidence → `enriched_available`;  
19. no matching evidence → `retained_insufficient_coverage`;  
20. unavailable Gmail → `retained_unavailable`;  
21. incomplete provenance → `retained_insufficient_coverage`;  
22. incomplete field coverage → `retained_insufficient_coverage`;  
23. stale evidence → `retained_insufficient_coverage`;  
24. multiple values are preserved without adjudication;  
25. connector availability supplies no factual value.

---

## **72\. Importance Tests**

26. importance → `retained_unsupported`;  
27. Gmail evidence does not upgrade it;  
28. Calendar evidence does not upgrade it;  
29. Memory evidence does not upgrade it;  
30. connector availability does not upgrade it;  
31. excluded heuristics do not enter engine inputs or outputs.

---

## **73\. Outcome Reachability Tests**

32. `enriched_available`;  
33. `retained_insufficient_coverage`;  
34. `retained_unavailable`;  
35. `retained_unsupported`;  
36. `not_material`;  
37. `enrichment_failed`.

All six must be demonstrated at runtime.

---

## **74\. Materiality Tests**

38. Calendar is not consulted for contact;  
39. Memory is not consulted for contact;  
40. Calendar is not consulted for importance;  
41. Memory is not consulted for importance;  
42. communication evidence is not admitted for importance;  
43. connector availability affects availability only.

---

## **75\. Cassie Composition Tests**

44. real Claim Boundary call;  
45. real assembly call;  
46. real resolver call;  
47. contact enriched available;  
48. importance retained unsupported;  
49. new claim IDs;  
50. base links;  
51. new enriched set ID;  
52. base set unchanged.

---

## **76\. Isolation Tests**

53. claim engine unchanged;  
54. composer unchanged;  
55. conflict engine unchanged;  
56. production files unchanged;  
57. no prohibited imports;  
58. no model call;  
59. no network call;  
60. no Memory write;  
61. pure-Node isolation proof passes.

---

# **Part XVIII — Stop-and-Report Conditions**

## **77\. Base-Type Incompatibility**

If implementation cannot preserve the base `GovernedClaimInput` shape while adding `baseClaimId` through an adjacent enriched type, stop.

Do not modify `GovernedClaimInput` without a separate governance decision.

---

## **78\. Entity-Identity Gap**

If the existing Claim Boundary publications contain no deterministic path from the contact claim to the resolved `entityId`, stop and report the exact missing field.

Do not infer it from text.

A narrowly scoped parameter-reference adapter may be added only if it consumes the existing Claim Boundary evaluation’s extracted parameters without changing recognition semantics.

---

## **79\. Evidence-Resolution Gap**

If no deterministic resolver can connect a governed communication evidence reference to an immutable canonical address assertion without:

* querying legacy state;  
* searching arbitrary Gmail;  
* inferring identity;  
* broadening policy;

stop.

Report the exact missing canonical reference boundary.

Do not fabricate `factualValues`.

---

## **80\. Status-Function Incompatibility**

If `computeEvidenceStatus` cannot express one of Sprint 3.103’s binding outcomes without changing its semantics, stop.

Do not modify it in this sprint.

Report whether the gap is:

* bounded adapter need;  
* semantic incompatibility;  
* unresolved.

---

## **81\. Identity Incompatibility**

If the existing lineage identity mechanism cannot produce distinct deterministic identities for:

* enrichment evaluation;  
* enriched claims;  
* enriched Claim Set;

stop.

Do not use random IDs.

---

## **82\. Contract Contradiction**

If implementation reveals two binding Sprint 3.103 requirements cannot simultaneously hold, stop.

Do not choose one silently.

Return:

> **Implementation Incomplete**

---

# **Part XIX — Expected Files**

## **83\. Expected New Modules**

lib/governed-conversation/claim-enrichment-types.ts  
lib/governed-conversation/claim-enrichment-ruleset.ts  
lib/governed-conversation/claim-enrichment-engine.ts  
lib/governed-conversation/claim-enrichment-publications.ts  
lib/governed-conversation/claim-enrichment-fixtures.ts

---

## **84\. Expected Tests**

lib/governed-conversation/claim-enrichment-types.test.ts  
lib/governed-conversation/claim-enrichment-ruleset.test.ts  
lib/governed-conversation/claim-enrichment-engine.test.ts  
lib/governed-conversation/claim-enrichment-publications.test.ts  
lib/governed-conversation/claim-enrichment-composition.test.ts

Equivalent consolidation is permitted only when every required proof remains explicit.

---

## **85\. Sprint Document**

docs/SPRINT-3.104-ISOLATED-EVIDENCE-TO-CLAIM-ENRICHMENT-IMPLEMENTATION.md

No existing core module is expected to change.

---

# **Part XX — Validation**

## **86\. Targeted Validation**

Run independently:

claim-enrichment types tests  
claim-enrichment ruleset tests  
claim-enrichment publication tests  
claim-enrichment engine tests  
Cassie enrichment composition tests

Also rerun:

claim-boundary tests  
source-evidence assembly tests  
evidence-status tests

---

## **87\. Full Validation**

Run:

npm test  
npm run build  
npm run lint  
npm run typecheck  
git diff \--check

No exception applies.

---

## **88\. Historical Evidence Preservation**

Do not rewrite:

* Sprint 3.102’s failed single-contact scenario;  
* historical evaluation fixtures;  
* previous incompatibility tables;  
* old expected outcomes.

They remain truthful evidence of the pre-enrichment architecture.

Sprint 3.104 adds the correction.

It does not rewrite history.

---

# **Part XXI — Completion Report**

## **89\. Repository Precondition**

Report:

* repository;  
* branch;  
* starting commit;  
* working-tree state;  
* required document presence;  
* extracted Sprint 3.103 vocabulary;  
* protected starting hashes.

---

## **90\. Governing Artefacts Reviewed**

List all documents and code read completely.

---

## **91\. Exact Contract Extraction**

Report verbatim:

### **Outcome vocabulary**

enriched\_available  
retained\_insufficient\_coverage  
retained\_unavailable  
retained\_unsupported  
not\_material  
enrichment\_failed

### **Evidence categories**

communicationEvidence  
calendarEvidence  
memoryPriorityReferences  
connectorAvailability

### **Identity fields**

baseClaimId  
enrichedGovernedClaimSetId  
baseGovernedClaimSetId  
enrichmentEvaluationId  
enrichmentRulesetId

### **Publication fields**

List every implemented evaluation and enriched-set field.

---

## **92\. Module Results**

Report each module:

claim-enrichment-types.ts  
claim-enrichment-ruleset.ts  
claim-enrichment-publications.ts  
claim-enrichment-engine.ts  
claim-enrichment-fixtures.ts

with one-line responsibility.

---

## **93\. Cassie Result**

Report:

### **Base**

contact\_address\_lookup \= insufficient\_coverage  
message\_importance \= unsupported

### **Enriched**

contact\_address\_lookup \= available  
message\_importance \= unsupported

Report:

* base claim IDs;  
* enriched claim IDs;  
* base Claim Set ID;  
* enriched Claim Set ID;  
* admitted source references;  
* factual address values;  
* enrichment outcomes.

---

## **94\. Outcome Reachability**

Report a table:

| Outcome | Test scenario | Observed canonical status | Passed |
| ----- | ----- | ----- | ----- |
| `enriched_available` |  |  |  |
| `retained_insufficient_coverage` |  |  |  |
| `retained_unavailable` |  |  |  |
| `retained_unsupported` |  |  |  |
| `not_material` |  |  |  |
| `enrichment_failed` |  |  |  |

---

## **95\. Identity Integrity**

Report:

* every enriched claim differs from base;  
* every enriched claim links to base;  
* enriched set differs from base set;  
* base Claim Set remained unchanged;  
* replay identity result;  
* mutation identity result.

---

## **96\. Materiality Result**

Report every matrix cell and prove non-material categories were not consulted.

---

## **97\. Recognition Isolation**

Report pre/post hashes for Claim Boundary files.

State:

> The Claim Boundary remains evidence-blind and byte-identical.

---

## **98\. Composer Isolation**

Report the composer hash.

State:

> The projection composer remains byte-identical and performs no evidence-to-claim enrichment.

---

## **99\. Conflict Isolation**

Report the conflict engine hash.

State:

> Conflict evaluation remains unchanged and is not wired to enrichment in Sprint 3.104.

---

## **100\. Production Isolation**

Report hashes and import searches for:

app/api/chat/route.ts  
lib/context-builder.ts  
lib/useAgentConversation.ts  
lib/agents/chat-execution.ts

---

## **101\. Files Changed**

List every added or changed file with one-line reason.

No silent scope expansion.

---

## **102\. Validation Results**

Report exact results for:

targeted enrichment tests  
claim-boundary tests  
source-assembly tests  
evidence-status tests  
npm test  
npm run build  
npm run lint  
npm run typecheck  
git diff \--check

---

## **103\. Production Effect**

State exactly:

> Sprint 3.104 introduces an isolated deterministic Evidence-to-Claim Enrichment Stage. It does not alter claim recognition, conflict evaluation, projection composition, model invocation, `/api/chat`, `context-builder.ts`, `useAgentConversation.ts`, or current production behaviour.

---

## **104\. Outstanding Findings**

Report separately:

Enrichment types:  
Ruleset:  
Evidence resolver:  
Contact correlation:  
Importance boundary:  
Identity:  
Materiality:  
Status computation:  
Recognition isolation:  
Composer isolation:  
Conflict isolation:  
Production isolation:

---

## **105\. Recommended Next Step**

If complete:

> **Sprint 3.105 — Claims Enrichment and Conflict/Projection Wiring**

That sprint shall wire the enriched Claim Set into:

1. conflict evaluation;  
2. projection construction;  
3. the full isolated composition chain.

It shall not yet modify `/api/chat`.

---

# **Part XXII — Recommendation Gate**

## **106\. Permitted Final Recommendation**

The final line must be exactly one:

> **Implementation Complete**

or:

> **Implementation Incomplete**

No other wording is permitted.

---

## **107\. Implementation Complete**

Use only if:

* Sprint 3.103 was followed exactly;  
* all enrichment modules exist;  
* all six outcomes are runtime-reachable;  
* Cassie contact reaches available;  
* Cassie importance remains unsupported;  
* real source references are preserved;  
* real factual values are resolved through the governed port;  
* enriched claim IDs differ from base claim IDs;  
* enriched Claim Set ID differs from base;  
* base Claim Set remains unchanged;  
* materiality boundaries hold;  
* Claim Boundary remains byte-identical;  
* projection composer remains byte-identical;  
* conflict engine remains byte-identical;  
* production files remain byte-identical;  
* full validation passes;  
* no production integration occurs.

---

## **108\. Implementation Incomplete**

Use if:

* a required outcome cannot be expressed;  
* Cassie cannot be enriched truthfully;  
* factual values require legacy or inferred evidence;  
* base identity is mutated;  
* enriched identity aliases base identity;  
* a non-material evidence category influences a claim;  
* importance is upgraded;  
* Claim Boundary or composer must be changed;  
* isolation fails;  
* validation fails.

Report the exact blocking stage and evidence.

---

# **Part XXIII — Binding Implementation Summary**

## **109\. Final Architecture**

real Claim Boundary  
    ↓  
immutable base GovernedClaimSet  
    ├── contact: insufficient\_coverage  
    └── importance: unsupported  
    ↓  
real assembled governed evidence  
    \+  
deterministic evidence resolver  
    ↓  
isolated Claim Enrichment Engine  
    ├── closed materiality matrix  
    ├── exact entity correlation  
    ├── source availability  
    ├── provenance validation  
    ├── field coverage  
    ├── freshness  
    ├── no model  
    └── no adjudication  
    ↓  
EvidenceToClaimEnrichmentEvaluation  
    ↓  
EnrichedGovernedClaimSet  
    ├── new claim IDs  
    ├── baseClaimId links  
    ├── real source references  
    ├── real factual values  
    ├── enriched statuses  
    └── new set identity

The exact outcome vocabulary is:

enriched\_available  
retained\_insufficient\_coverage  
retained\_unavailable  
retained\_unsupported  
not\_material  
enrichment\_failed

The exact current materiality boundary is:

contact\_address\_lookup  
    communicationEvidence \= material  
    connectorAvailability \= conditionally material  
    calendarEvidence \= not material  
    memoryPriorityReferences \= not material

message\_importance  
    no admitted factual evidence category  
    connectorAvailability cannot support importance  
    status remains unsupported

The identity rule is:

base claim  
    remains immutable

enriched claim  
    receives new claimId  
    links via baseClaimId

base Claim Set  
    remains immutable

enriched Claim Set  
    receives new enrichedGovernedClaimSetId

The governing implementation discipline is:

recognise first  
preserve recognition  
consult only governed evidence  
resolve references deterministically  
apply only closed materiality  
publish enrichment immutably  
do not adjudicate  
do not modify the composer  
do not touch production

The final line shall be exactly:

> **Implementation Complete**

or:

> **Implementation Incomplete**

---

# **Sprint 3.104 Implementation Completion Report**

## **89. Repository Precondition**

* **Repository:** `/workspace/jarvis`, the intended JARVIS repository.
* **Branch:** `work`.
* **Starting commit:** `31991c78c6c5c88006b599f10e33cf384875b9fa` (`Merge pull request #181 from kojiro5150/docs/sprint-3.104-spec-v2`).
* **Starting working-tree state:** clean.
* **Sprint 3.103:** present with status `Governed Contract Complete`.
* **Required document presence:** every document required by Section 5 was present before editing: Sprints 3.89, 3.91, 3.96, 3.97, 3.98, 3.99, 3.101, 3.102, and 3.103.
* **Premise confirmation:** `GovernedClaimSet` has exactly `governedClaimSetId`, `schemaVersion`, `claimBoundaryEvaluationId`, `claimBoundaryRulesetId`, `threadId`, `requestId`, `exchangeId`, `referenceTime`, `claims`, `segmentLinks`, `claimIds`, and `createdAt`. `GovernedClaimInput` has exactly `claimId`, `claimType`, `material`, `status`, `ownership`, `sourceReferences`, `factualValues`, `sourceAvailable`, `provenance`, `observedAt`, `contentKind`, `boundedComplete`, and `conflicts`; it has no `baseClaimId`.
* **Assembly premise:** `GovernedSourceEvidenceAssemblyResult` contains `communicationEvidence`, `calendarEvidence`, `memoryPriorityReferences`, `connectorAvailability`, and `sourceResults`.
* **Resolution premise:** `GovernedCommunicationEvidenceInput` is reference-only and contains no canonical address value. The deterministic injected resolver port is therefore required.
* **Existing-owner search:** no pre-sprint claim-enrichment engine or publication existed.
* **Expected file list recorded before editing:** the five Section 83 modules, the five Section 84 tests, and this sprint document.

### **Extracted Sprint 3.103 vocabulary**

* **Outcomes:** `enriched_available`, `retained_insufficient_coverage`, `retained_unavailable`, `retained_unsupported`, `not_material`, `enrichment_failed`.
* **Materiality:** contact × communication is material; contact × connector availability is conditionally material to source availability only; contact × Calendar and Memory Priority are not material. Message importance has no admitted factual evidence category; every importance evidentiary cell resolves to `not_material`, including connector availability, and importance remains unsupported.
* **Identity:** every enriched claim receives a new `claimId` and mandatory `baseClaimId`; the base claim and base Claim Set remain immutable; the enriched set receives a new `enrichedGovernedClaimSetId`.
* **Cassie:** contact changes from `insufficient_coverage` to `available` when complete governed Gmail evidence resolves; importance remains `unsupported`.
* **Evidence status:** the existing four statuses remain authoritative and are computed from explicit support, availability, governance, identity, provenance, scope, coverage, freshness, pre-conflict value consistency, and content-completeness inputs.
* **No reopening:** Sprint 3.89 recognition remains evidence-blind; Sprint 3.90 conflict ownership and Composer Option A remain unchanged; Sprint 3.94/3.95 per-cell conflict semantics remain unchanged; Sprints 3.96–3.99 source contracts remain unchanged.

### **Protected starting hashes**

| File | SHA-256 |
| --- | --- |
| `lib/governed-conversation/claim-boundary-engine.ts` | `9ab35f47190e803468003a9accd34e0cc613e9438c8077a882d0b108d22f827a` |
| `lib/governed-conversation/claim-boundary-ruleset.ts` | `afe7fce7814b2d02da8e6ebecfbff2c721abf418bdfd426cf689340d898a8e83` |
| `lib/governed-conversation/claim-boundary-publications.ts` | `ccd7caa39316eb2fce1c7c8c8eda3741d0182eb12a123de9f7860e8225aa7c95` |
| `lib/governed-conversation/projection-composer.ts` | `d66c9dfccf98a428fb58e6db68af171751bfe2b56b602d028f9c212fee958355` |
| `lib/governed-conversation/conflict-boundary-engine.ts` | `5b62297ed0d69a9f70bf6e82788cc996c37cb9bf733dded27876ae098e57e27d` |
| `app/api/chat/route.ts` | `503840ffa6c17f52a049c1aaaad4e8402c000904dd3b7ce868104a10c6ba08a3` |
| `lib/context-builder.ts` | `8e689bf0880375ef2539c37cac8f8891669e66f4eb6ca72602fe97137438894d` |
| `lib/useAgentConversation.ts` | `55274931370b78e0ea6cf0fd144b4fba88400be0f9a14361682428846eea9c97` |
| `lib/agents/chat-execution.ts` | `da387b401acd4cc87609112e7b110451254af16bb33d8dd5224c4fb9aa210a88` |

## **90. Governing Artefacts Reviewed**

The following were read completely before implementation:

* `docs/SPRINT-3.104-ISOLATED-EVIDENCE-TO-CLAIM-ENRICHMENT-IMPLEMENTATION.md`;
* `docs/SPRINT-3.103-GOVERNED-EVIDENCE-TO-CLAIM-ENRICHMENT-CONTRACT.md`;
* `lib/governed-conversation/claim-boundary-types.ts`;
* `lib/governed-conversation/types.ts`;
* `lib/governed-conversation/claim-boundary-engine.ts`;
* `lib/governed-conversation/claim-boundary-publications.ts`;
* `lib/governed-conversation/claim-boundary-ruleset.ts`;
* `lib/governed-conversation/evidence-status.ts`;
* `lib/governed-conversation/source-evidence-assembly.ts`;
* `lib/governed-conversation/gmail-evidence-publisher.ts`;
* `lib/governed-conversation/projection-composer.ts`.

The other Section 5 governance documents were confirmed present. Sprint 3.103 was the sole semantic authority extracted for this implementation.

## **91. Exact Contract Extraction**

### **Outcome vocabulary**

enriched_available
retained_insufficient_coverage
retained_unavailable
retained_unsupported
not_material
enrichment_failed

### **Evidence categories**

communicationEvidence
calendarEvidence
memoryPriorityReferences
connectorAvailability

### **Identity fields**

baseClaimId
enrichedGovernedClaimSetId
baseGovernedClaimSetId
enrichmentEvaluationId
enrichmentRulesetId

### **Evaluation publication fields**

`enrichmentRulesetId`, `enrichmentEvaluationId`, `baseGovernedClaimSetId`, `threadId`, `requestId`, `exchangeId`, `sourceAssemblyReference`, `referenceTime`, `evaluatedClaimIds`, `admittedEvidenceCategoryCells`, `sourceReferencesConsulted`, `sourceReferencesAdmitted`, `sourceReferencesRejected`, `claimOutcomes`, `createdAt`.

### **Enriched Claim Set publication fields**

`enrichedGovernedClaimSetId`, `baseGovernedClaimSetId`, `enrichmentEvaluationId`, `claimBoundaryRulesetId`, `claimBoundaryEvaluationId`, `threadId`, `requestId`, `exchangeId`, `referenceTime`, `claims`, `segmentLinks`, `claimIds`, `createdAt`.

## **92. Module Results**

* **`claim-enrichment-types.ts`:** defines the closed vocabularies, adjacent enriched claim type, resolver port, input/result unions, materiality cells, and immutable publication contracts.
* **`claim-enrichment-ruleset.ts`:** publishes the deterministic v1 closed ruleset, its exact eight materiality cells, digest, and lineage identity.
* **`claim-enrichment-publications.ts`:** constructs deep-frozen evaluations, enriched claims, and enriched Claim Sets with deterministic distinct identities.
* **`claim-enrichment-engine.ts`:** validates base lineage, applies exact materiality, correlates only exact entity assertions, computes evidence status, distinguishes governed failure from programmer-contract errors, and never imports a connector.
* **`claim-enrichment-fixtures.ts`:** supplies the deterministic real-assembly Cassie acquisition fixture and a reference-bound canonical resolver fixture.

## **93. Cassie Result**

### **Base**

contact_address_lookup = insufficient_coverage
message_importance = unsupported

* **Base Claim Set ID:** `governed-claim-set:b26983dc276ddaa5c79540449c382392fb32b8db022b7ea35cd915b4d7ed866b`.
* **Base contact claim ID:** `governed-claim:7c276ab86cf27e8d495404de0a870c658730553dbc88eb744ea0b882d63d5605`.
* **Base importance claim ID:** `governed-claim:950fda67747a0912be5f975cbb7efadc00c8fb3dac485efabd2536b5676670de`.

### **Enriched**

contact_address_lookup = available
message_importance = unsupported

* **Enrichment evaluation ID:** `claim-enrichment-evaluation:3bdad5ee52ad6678fb17650d2eadd5d06b3af4dbf26a1fbd76eebee899ba9c28`.
* **Enriched Claim Set ID:** `enriched-governed-claim-set:b3846b6ad44b7b539a4c7205dc1f94991504a765fa6e7d6776dd9d3682a02a45`.
* **Enriched contact claim ID:** `enriched-governed-claim:03c0113f6b6ba7cb9870158f9d881c02b742bdf000f646646ec035b270d42e99`.
* **Enriched importance claim ID:** `enriched-governed-claim:30cbd6f70cea82d596691f425150baed48794268fbac8f5a58e5349e4e36013a`.
* **Admitted source reference:** `{ sourceId: "google-gmail", resourceId: "cassie-message-1", field: "communication_metadata", observedAt: "2026-08-01T12:00:00.000Z" }`.
* **Factual address values:** `cassie@example.com`.
* **Outcomes:** contact = `enriched_available`; importance = `retained_unsupported`.
* **Central proof:** the serialized base Claim Set remained byte-for-byte structurally unchanged, while the enriched contact acquired the real resolved source reference and value and the importance claim acquired neither.

## **94. Outcome Reachability**

| Outcome | Test scenario | Observed canonical status | Passed |
| --- | --- | --- | --- |
| `enriched_available` | Exact Cassie entity, available Gmail, complete fresh assertion | `available` | Yes |
| `retained_insufficient_coverage` | Available Gmail with no assertion, incomplete coverage, stale assertion, or insufficient scope | `insufficient_coverage` | Yes |
| `retained_unavailable` | Gmail connector unavailable and no other admitted source | `unavailable` | Yes |
| `retained_unsupported` | Recognised `message_importance` | `unsupported` | Yes |
| `not_material` | Calendar/Memory cells and every importance evidence-category cell | Claim status unchanged; cell-only result | Yes |
| `enrichment_failed` | Resolver throws or violates its deterministic contract | No enriched canonical Claim Set published | Yes |

## **95. Identity Integrity**

* Every enriched claim identity differs from its base identity.
* Every enriched claim carries exactly one `baseClaimId`.
* Every base claim maps to exactly one enriched claim, and enriched segment links reference only enriched identities.
* The enriched Claim Set identity differs from the base Claim Set identity.
* The base Claim Set remained structurally unchanged and retained its original object and IDs.
* Identical replay produced identical evaluation, enriched-claim, and enriched-set identities and identical publication bodies.
* Mutating only the canonical contact address changed the evaluation ID, enriched contact ID, and enriched set ID while leaving the base set unchanged. The implementation includes the enrichment-evaluation lineage in every enriched claim, so the importance enriched identity also changes when the evaluation identity changes; it does not claim claim-local independence across evaluation mutations.

## **96. Materiality Result**

| Claim type | Evidence category | Materiality/result | Consultation proof |
| --- | --- | --- | --- |
| `contact_address_lookup` | `communicationEvidence` | `material` | Exact assembled references were resolved and admitted only after entity and integrity checks. |
| `contact_address_lookup` | `calendarEvidence` | `not_material` | Adding Calendar evidence left outcomes, status, facts, sources, and enriched claim identity unchanged. |
| `contact_address_lookup` | `memoryPriorityReferences` | `not_material` | Adding Memory Priority evidence left outcomes, status, facts, sources, and enriched claim identity unchanged. |
| `contact_address_lookup` | `connectorAvailability` | `conditionally_material` for source availability only | Changed only available/unavailable/insufficient source state and never entered factual values or factual source references. |
| `message_importance` | `communicationEvidence` | `not_material` | No communication reference was consulted or admitted for importance. |
| `message_importance` | `calendarEvidence` | `not_material` | No Calendar reference was consulted or admitted for importance. |
| `message_importance` | `memoryPriorityReferences` | `not_material` | No Memory reference was consulted or admitted for importance. |
| `message_importance` | `connectorAvailability` | `not_material` for evidentiary enrichment | Connector state never changed the importance outcome or status and was not consulted or admitted for importance. |

The materiality proof records all eight cells. Every importance category, including connector availability, resolves to `not_material`; connector state has no path into importance status.

## **97. Recognition Isolation**

| File | Starting SHA-256 | Post-implementation SHA-256 |
| --- | --- | --- |
| `claim-boundary-engine.ts` | `9ab35f47190e803468003a9accd34e0cc613e9438c8077a882d0b108d22f827a` | `9ab35f47190e803468003a9accd34e0cc613e9438c8077a882d0b108d22f827a` |
| `claim-boundary-ruleset.ts` | `afe7fce7814b2d02da8e6ebecfbff2c721abf418bdfd426cf689340d898a8e83` | `afe7fce7814b2d02da8e6ebecfbff2c721abf418bdfd426cf689340d898a8e83` |
| `claim-boundary-publications.ts` | `ccd7caa39316eb2fce1c7c8c8eda3741d0182eb12a123de9f7860e8225aa7c95` | `ccd7caa39316eb2fce1c7c8c8eda3741d0182eb12a123de9f7860e8225aa7c95` |

> The Claim Boundary remains evidence-blind and byte-identical.

## **98. Composer Isolation**

`projection-composer.ts` starting/post SHA-256: `d66c9dfccf98a428fb58e6db68af171751bfe2b56b602d028f9c212fee958355`.

> The projection composer remains byte-identical and performs no evidence-to-claim enrichment.

## **99. Conflict Isolation**

`conflict-boundary-engine.ts` starting/post SHA-256: `5b62297ed0d69a9f70bf6e82788cc996c37cb9bf733dded27876ae098e57e27d`.

> Conflict evaluation remains unchanged and is not wired to enrichment in Sprint 3.104.

## **100. Production Isolation**

| File | Starting/post SHA-256 | Enrichment import search |
| --- | --- | --- |
| `app/api/chat/route.ts` | `503840ffa6c17f52a049c1aaaad4e8402c000904dd3b7ce868104a10c6ba08a3` | None |
| `lib/context-builder.ts` | `8e689bf0880375ef2539c37cac8f8891669e66f4eb6ca72602fe97137438894d` | None |
| `lib/useAgentConversation.ts` | `55274931370b78e0ea6cf0fd144b4fba88400be0f9a14361682428846eea9c97` | None |
| `lib/agents/chat-execution.ts` | `da387b401acd4cc87609112e7b110451254af16bb33d8dd5224c4fb9aa210a88` | None |

The committed pure-Node isolation test uses only `node:fs`, `node:path`, and `node:crypto` for traversal, import inspection, and hashes. It proves no production enrichment import; no enrichment import of a production route, context builder, conversation hook, model invocation, legacy OperationalState, legacy Gmail state, or connector; and no model, network, or Memory write path.

## **101. Files Changed**

* `lib/governed-conversation/claim-enrichment-types.ts` — new closed enrichment and resolver contracts.
* `lib/governed-conversation/claim-enrichment-ruleset.ts` — new deterministic v1 materiality publication.
* `lib/governed-conversation/claim-enrichment-publications.ts` — new immutable deterministic publication constructors.
* `lib/governed-conversation/claim-enrichment-engine.ts` — new isolated enrichment engine.
* `lib/governed-conversation/claim-enrichment-fixtures.ts` — new Cassie real-assembly and resolver fixtures.
* `lib/governed-conversation/claim-enrichment-types.test.ts` — exact vocabulary and adjacent-type proofs.
* `lib/governed-conversation/claim-enrichment-ruleset.test.ts` — exact closed ruleset and materiality proofs.
* `lib/governed-conversation/claim-enrichment-engine.test.ts` — contact, importance, status, failure, and outcome reachability proofs.
* `lib/governed-conversation/claim-enrichment-publications.test.ts` — publication fields, immutability, replay, and mutation identity proofs.
* `lib/governed-conversation/claim-enrichment-composition.test.ts` — real Cassie composition, non-materiality, and pure-Node isolation proofs.
* `docs/SPRINT-3.104-ISOLATED-EVIDENCE-TO-CLAIM-ENRICHMENT-IMPLEMENTATION.md` — this committed completion report.

No existing production, recognition, publisher, acquisition, assembly, composer, conflict, route, hook, or agent file changed.

## **102. Validation Results**

| Command | Exact result |
| --- | --- |
| `npx vitest run lib/governed-conversation/claim-enrichment-types.test.ts` | Passed: 1 file, 2 tests. |
| `npx vitest run lib/governed-conversation/claim-enrichment-ruleset.test.ts` | Passed: 1 file, 2 tests. |
| `npx vitest run lib/governed-conversation/claim-enrichment-publications.test.ts` | Passed: 1 file, 2 tests. |
| `npx vitest run lib/governed-conversation/claim-enrichment-engine.test.ts` | Passed: 1 file, 7 tests. |
| `npx vitest run lib/governed-conversation/claim-enrichment-composition.test.ts` | Passed: 1 file, 4 tests. |
| `npx vitest run lib/governed-conversation/claim-boundary-engine.test.ts` | Passed: 1 file, 18 tests. |
| `npx vitest run lib/governed-conversation/source-evidence-assembly.test.ts` | Passed: 1 file, 4 tests. |
| `npx vitest run lib/governed-conversation/evidence-status.test.ts` | Passed: 1 file, 2 tests. |
| `npm test` | Passed: 160 files; 760 tests passed and 1 skipped. |
| `npm run build` | Passed: optimized production build, type/lint validation, six static pages, and build traces completed. Google Fonts stylesheet optimization was skipped after its download failed. |
| `npm run lint` | Passed: no ESLint warnings or errors. |
| `npm run typecheck` | Passed: `tsc --noEmit` exited successfully. |
| `git diff --check` | Passed: no whitespace errors. |

## **103. Production Effect**

> Sprint 3.104 introduces an isolated deterministic Evidence-to-Claim Enrichment Stage. It does not alter claim recognition, conflict evaluation, projection composition, model invocation, `/api/chat`, `context-builder.ts`, `useAgentConversation.ts`, or current production behaviour.

## **104. Outstanding Findings**

* **Enrichment types:** Complete; the base `GovernedClaimInput` is unchanged and the adjacent enriched type requires `baseClaimId`.
* **Ruleset:** Complete; one immutable v1 ruleset exposes no generic extension point.
* **Evidence resolver:** Complete; an injected bounded port resolves only admitted communication references and the engine imports no connector.
* **Contact correlation:** Complete; the narrow immutable claim-parameter index is constructed from the existing Claim Boundary evaluation's extracted `entityId` parameter and exact segment linkage.
* **Importance boundary:** Complete; every evidence category is non-material to importance and status remains `unsupported`.
* **Identity:** Complete; deterministic, distinct, replay-stable lineage exists for evaluation, claims, and enriched set.
* **Materiality:** Complete; every matrix cell is runtime-tested and connector availability cannot influence importance.
* **Status computation:** Complete; existing `computeEvidenceStatus` expresses all canonical enrichment states without modification.
* **Recognition isolation:** Complete; protected recognition files are byte-identical.
* **Composer isolation:** Complete; the composer is byte-identical and unwired.
* **Conflict isolation:** Complete; the conflict engine is byte-identical and unwired.
* **Production isolation:** Complete; protected production files are byte-identical and pure-Node import searches pass.

## **105. Recommended Next Step**

> **Sprint 3.105 — Claims Enrichment and Conflict/Projection Wiring**

That sprint shall wire the enriched Claim Set into conflict evaluation, projection construction, and the full isolated composition chain. It shall not yet modify `/api/chat`.

> **Implementation Complete**
