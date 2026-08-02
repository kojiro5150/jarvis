# **Sprint 3.105 — Full-Assembly Composition Re-Check With Enrichment**

**Status:** Specification  
**Sprint Type:** Isolated Composition Re-Check / Evaluation  
**Implementation Authority:** Evaluation code only  
**Production Integration:** Prohibited  
**Direct Precedents:** Sprints 3.78, 3.84, 3.93, and 3.102  
**Governing Correction:** Sprints 3.103 and 3.104  
**Output Path:** `docs/SPRINT-3.105-FULL-ASSEMBLY-COMPOSITION-RECHECK-WITH-ENRICHMENT.md`

---

## **1\. Purpose**

Sprint 3.105 re-runs the complete Sprint 3.102 Full-Assembly Conversational Composition Regression after inserting the real Sprint 3.104 Evidence-to-Claim Enrichment Stage between claim recognition and conflict evaluation.

Sprint 3.102 already established the real ten-scenario matrix:

cassie-compound-contact-conflict  
single-contact-no-conflict  
legacy-memory-unattested  
connector-disconnected-local-fallback  
gmail-conflict-plus-unsupported-claim  
conflict-evaluation-unavailable  
conflict-evaluation-unsupported  
conflict-evaluation-failed  
partial-source-failure  
deterministic-replay

Sprint 3.104 proved one narrower composition:

real claim recognition  
    ↓  
real source-evidence assembly  
    ↓  
real Evidence-to-Claim Enrichment

for the Cassie case.

It did not prove that the enriched Claim Set composes correctly with:

* the real conflict engine;  
* the corrected per-cell conflict-evaluation architecture;  
* the projection composer;  
* effective-claim-status aggregation;  
* governed input construction;  
* model invocation;  
* deterministic validation;  
* every non-success evaluation state;  
* partial source failure;  
* replay;  
* the complete Sprint 3.102 scenario matrix.

Sprint 3.105 exists to answer that question without changing any architecture.

The required full chain is:

real acquisition adapters  
    ↓  
real source publishers  
    ↓  
assembleGovernedSourceEvidence  
    ↓  
evaluateClaimBoundary  
    ↓  
base GovernedClaimSet  
    ↓  
enrichGovernedClaims  
    ↓  
EnrichedGovernedClaimSet  
    ↓  
evaluateGovernedConversationalConflicts  
    ↓  
composeGovernedConversationalProjection  
    ↓  
constructGovernedConversationalInput  
    ↓  
invokeGovernedConversationModel  
    ↓  
unchanged deterministic validator

---

## **2\. Important Framing**

This is a **re-check**, not a fresh evaluation.

The evaluation shall directly reuse:

FULL\_ASSEMBLY\_SCENARIO\_IDS

and the existing Sprint 3.102 scenario-construction logic exported from:

lib/governed-conversation/full-assembly-claim-boundary-conflict-boundary-composition-regression.ts

The sprint shall not replace the existing matrix with:

* a smaller scenario set;  
* newly hand-picked easy cases;  
* a new set that omits prior failure states;  
* a Cassie-only evaluation;  
* hand-built inputs that bypass Sprint 3.102’s fixture logic.

The purpose is to determine whether adding enrichment:

1. corrects the specific Sprint 3.102 claim-status incompatibility; and  
2. preserves every other behaviour Sprint 3.102 already tested.

---

## **3\. Evaluation Gate Meaning**

The recommendation gate is:

> **Evaluation Complete**

or:

> **Evaluation Incomplete**

A real architectural finding does **not** make the evaluation incomplete.

Use:

> **Evaluation Complete**

when:

* all required scenarios ran;  
* the real architecture was exercised;  
* results are trustworthy;  
* mutation sensitivity was proven;  
* any incompatibility was precisely documented;  
* no finding was repaired in this sprint;  
* isolation and full repository validation passed.

Use:

> **Evaluation Incomplete**

only when the evaluation process itself was not completed truthfully, including:

* mandatory scenarios were omitted;  
* the real chain was bypassed;  
* fixtures were silently replaced;  
* mutation sensitivity was not proven;  
* isolation failed;  
* validation failed;  
* the evaluation code could not produce trustworthy results.

---

## **4\. Sprint Character**

This is evaluation-only.

It may:

* add a new re-check evaluator;  
* add re-check tests;  
* wrap or call the existing Sprint 3.102 scenario harness;  
* reuse its scenario IDs and construction functions;  
* invoke the real enrichment engine;  
* compare original and enriched scenario outcomes;  
* add mutation-sensitivity tests;  
* report compatibility findings.

It shall not modify:

* claim recognition;  
* claim enrichment;  
* source publishers;  
* acquisition adapters;  
* source assembly;  
* conflict evaluation;  
* conflict rulesets;  
* the projection composer;  
* evidence-status computation;  
* governed input construction;  
* model invocation;  
* the validator;  
* lineage construction;  
* `/api/chat`;  
* any production call site.

If the re-check finds a real incompatibility, it shall report it.

It shall not fix it.

---

## **5\. Governing Hierarchy**

Apply:

1. JARVIS Engineering Constitution;  
2. JARVIS North Star;  
3. JARVIS Engineering Specification Standard;  
4. Constitutional Publication Principles;  
5. Roadmap;  
6. Sprint 3.89 — Claims Boundary Contract;  
7. Sprint 3.90 — Conflicts Boundary Contract;  
8. Sprint 3.94 — Claims and Conflicts Composition Correction Contract;  
9. Sprint 3.95 — Claims and Conflicts Composition Correction Implementation;  
10. Sprints 3.96–3.101 — source-evidence contracts, publishers, and wiring;  
11. Sprint 3.102 — Full-Assembly Conversational Composition Regression;  
12. Sprint 3.103 — Evidence-to-Claim Enrichment Contract;  
13. Sprint 3.104 — Isolated Evidence-to-Claim Enrichment Implementation;  
14. current implementation;  
15. this specification.

No prior semantic decision is reopened.

---

# **Part I — Repository Precondition**

## **6\. Required Documents**

Before adding evaluation code, confirm and read completely:

docs/SPRINT-3.89-GOVERNED-CONVERSATIONAL-CLAIMS-BOUNDARY-CONTRACT.md  
docs/SPRINT-3.90-GOVERNED-CONVERSATIONAL-CONFLICTS-BOUNDARY-CONTRACT.md  
docs/SPRINT-3.91-ISOLATED-GOVERNED-CLAIMS-BOUNDARY-IMPLEMENTATION.md  
docs/SPRINT-3.92-ISOLATED-GOVERNED-CONFLICTS-BOUNDARY-IMPLEMENTATION.md  
docs/SPRINT-3.93-CLAIMS-AND-CONFLICTS-COMPOSITION-EVALUATION.md  
docs/SPRINT-3.94-GOVERNED-CLAIMS-AND-CONFLICTS-COMPOSITION-CORRECTION-CONTRACT.md  
docs/SPRINT-3.95-CLAIMS-AND-CONFLICTS-COMPOSITION-CORRECTION-IMPLEMENTATION.md  
docs/SPRINT-3.101-GOVERNED-SOURCE-EVIDENCE-PUBLISHER-WIRING.md  
docs/SPRINT-3.102-FULL-ASSEMBLY-CONVERSATIONAL-COMPOSITION-REGRESSION.md  
docs/SPRINT-3.103-GOVERNED-EVIDENCE-TO-CLAIM-ENRICHMENT-CONTRACT.md  
docs/SPRINT-3.104-ISOLATED-EVIDENCE-TO-CLAIM-ENRICHMENT-IMPLEMENTATION.md

Also read the earlier evaluation precedents:

docs/SPRINT-3.78-CONVERSATIONAL-PARALLEL-EVALUATION.md  
docs/SPRINT-3.84-CONVERSATIONAL-LINEAGE-AND-PROJECTION-EVALUATION.md  
docs/SPRINT-3.93-CLAIMS-AND-CONFLICTS-COMPOSITION-EVALUATION.md

---

## **7\. Required Source Inspection**

Read completely:

lib/governed-conversation/full-assembly-claim-boundary-conflict-boundary-composition-regression.ts  
lib/governed-conversation/full-assembly-claim-boundary-conflict-boundary-composition-regression.test.ts  
lib/governed-conversation/claim-enrichment-types.ts  
lib/governed-conversation/claim-enrichment-ruleset.ts  
lib/governed-conversation/claim-enrichment-engine.ts  
lib/governed-conversation/claim-enrichment-publications.ts  
lib/governed-conversation/claim-enrichment-fixtures.ts  
lib/governed-conversation/claim-boundary-engine.ts  
lib/governed-conversation/claim-boundary-types.ts  
lib/governed-conversation/conflict-boundary-engine.ts  
lib/governed-conversation/conflict-boundary-types.ts  
lib/governed-conversation/projection-composer.ts  
lib/governed-conversation/source-evidence-assembly.ts  
lib/governed-conversation/input.ts  
lib/governed-conversation/model-invocation.ts  
lib/governed-conversation/validator.ts

---

## **8\. Required Signature Confirmation**

Confirm the real current functions and signatures directly from source:

evaluateClaimBoundary(  
  input: BoundaryEngineInput  
): BoundaryEngineResult

enrichGovernedClaims(  
  input: ClaimEnrichmentEngineInput  
): ClaimEnrichmentEngineResult

evaluateGovernedConversationalConflicts(...)

composeGovernedConversationalProjection(  
  input: GovernedConversationalProjectionInput  
): GovernedConversationalProjection

runFullAssemblyRegressionScenario(  
  scenarioId: FullAssemblyScenarioId  
): Promise\<FullAssemblyRegressionResult\>

runFullAssemblyRegressionMatrix()

Confirm:

FULL\_ASSEMBLY\_SCENARIO\_IDS.length \=== 10

and that its exact members match Section 1\.

---

## **9\. Starting State**

Record:

* repository;  
* active branch;  
* starting commit;  
* working-tree state;  
* all required document presence;  
* all required source presence;  
* current ten scenario IDs;  
* starting blob hashes for every protected file in Section 50;  
* expected new file list.

If the existing Sprint 3.102 harness no longer exposes the stated matrix or callable function, stop.

Return:

> **Evaluation Incomplete**

---

# **Part II — Required Re-Check Architecture**

## **10\. Existing Sprint 3.102 Chain**

Sprint 3.102 currently performs:

assembleGovernedSourceEvidence  
    ↓  
evaluateClaimBoundary  
    ↓  
base GovernedClaimSet  
    ↓  
evaluateGovernedConversationalConflicts  
    ↓  
composeGovernedConversationalProjection  
    ↓  
constructGovernedConversationalInput  
    ↓  
invokeGovernedConversationModel

The re-check shall preserve all existing scenario construction and insert exactly one new governed stage:

base GovernedClaimSet  
    ↓  
enrichGovernedClaims  
    ↓  
EnrichedGovernedClaimSet

before conflict evaluation.

---

## **11\. Required New Chain**

For all ten scenarios:

existing fullAssemblySourceInput(scenarioId)  
    ↓  
assembleGovernedSourceEvidence  
    ↓  
existing lineage construction  
    ↓  
existing question and entity fixture  
    ↓  
evaluateClaimBoundary  
    ↓  
base GovernedClaimSet  
    ↓  
existing or directly reused evidence resolver fixture  
    ↓  
enrichGovernedClaims  
    ↓  
EnrichedGovernedClaimSet  
    ↓  
existing scenario-specific conflict observations  
    ↓  
evaluateGovernedConversationalConflicts  
    ↓  
composeGovernedConversationalProjection  
    ↓  
constructGovernedConversationalInput  
    ↓  
existing deterministic model adapter  
    ↓  
invokeGovernedConversationModel  
    ↓  
validator result

The evaluator shall use the real functions at every stage.

---

## **12\. No Scenario Reconstruction**

Do not independently recreate:

* Gmail acquisition fixtures;  
* Calendar fixtures;  
* Memory fixtures;  
* connector availability fixtures;  
* lineage format;  
* Cassie entities;  
* question selection;  
* compound/single-claim selection;  
* conflict observation selection;  
* requested conflict classes;  
* expected conflict outcome;  
* deterministic model adapter behaviour.

These shall be reused from the existing Sprint 3.102 module.

If the existing module does not currently export a required scenario-construction helper, the re-check may add **evaluation-only exports** to the existing historical harness only if:

1. no semantic behaviour changes;  
2. no fixture values change;  
3. no existing expectation changes;  
4. the export exposes an existing function or value unchanged;  
5. the completion report lists the exact export-only change.

Prefer a new evaluator that calls existing exported functions over changing the historical harness.

---

# **Part III — Re-Check Module**

## **13\. New Evaluation Module**

Create:

lib/governed-conversation/full-assembly-enrichment-composition-recheck.ts

Create tests:

lib/governed-conversation/full-assembly-enrichment-composition-recheck.test.ts

The module shall export:

runFullAssemblyEnrichmentRecheckScenario(...)

and:

runFullAssemblyEnrichmentRecheckMatrix(...)

The matrix runner shall iterate directly over:

FULL\_ASSEMBLY\_SCENARIO\_IDS

It shall not define a duplicate scenario-ID array.

---

## **14\. Re-Check Result**

Define an evaluation-only result equivalent to:

interface FullAssemblyEnrichmentRecheckResult {  
  readonly scenarioId: FullAssemblyScenarioId;  
  readonly evaluationRan: true;  
  readonly originalResult: FullAssemblyRegressionResult;  
  readonly enrichedResult: EnrichedFullAssemblyScenarioResult;  
  readonly originalExpectationPreserved: boolean;  
  readonly enrichmentSeamStatus:  
    | "compatible"  
    | "bounded-adapter-needed"  
    | "semantic-incompatibility"  
    | "unresolved";  
  readonly stageResults: {  
    readonly assembly: StageResult;  
    readonly recognition: StageResult;  
    readonly enrichment: StageResult;  
    readonly enrichedClaimSetToConflictEvaluation: StageResult;  
    readonly conflicts: StageResult;  
    readonly projection: StageResult;  
    readonly governedInput: StageResult;  
    readonly modelInvocation: StageResult;  
    readonly validation: StageResult;  
  };  
  readonly findings: readonly FullAssemblyEnrichmentFinding\[\];  
  readonly identityTrace: Readonly\<Record\<string, string | undefined\>\>;  
  readonly statusTrace: Readonly\<Record\<string, unknown\>\>;  
}

Use current existing types where possible.

Do not create a second semantic vocabulary for already-governed states.

---

## **15\. Original Result Baseline**

For every scenario, call:

runFullAssemblyRegressionScenario(scenarioId)

to obtain the real Sprint 3.102 baseline.

Do not reproduce the baseline by copying its expected values into the new evaluator.

The new result must compare:

real original runtime result

against:

real enrichment-inserted runtime result

---

# **Part IV — Enrichment Insertion**

## **16\. Real Base Recognition**

Call:

evaluateClaimBoundary(...)

using the exact existing scenario inputs.

Required:

* same question;  
* same typed intent state;  
* same Cassie entity;  
* same lineage;  
* same reference time;  
* same created time.

The base Claim Boundary result must match the recognition result used by Sprint 3.102.

---

## **17\. Real Enrichment**

Call:

enrichGovernedClaims(...)

with:

* the real base `GovernedClaimSet`;  
* the real `GovernedSourceEvidenceAssemblyResult`;  
* the actual scenario lineage;  
* a deterministic `sourceAssemblyReference`;  
* the existing Cassie entity parameters;  
* the real or reused Sprint 3.104 resolver fixture;  
* the existing reference and creation times.

Do not hand-create enriched claims.

---

## **18\. Resolver Reuse**

Reuse Sprint 3.104’s actual resolver-fixture logic.

The resolver shall:

* resolve only governed communication evidence references;  
* return canonical Cassie address assertions;  
* preserve real source references;  
* preserve policy and provenance;  
* never inspect legacy Gmail;  
* never select between conflicting values.

If Sprint 3.104’s resolver fixture is not exported, add a narrow evaluation-only export or build the re-check fixture by directly calling the existing exported fixture constructor.

Do not duplicate resolver semantics in the new evaluator.

---

## **19\. Failed Enrichment**

If:

enrichGovernedClaims(...)

returns:

outcome \= "failed"

the scenario shall record:

enrichmentSeamStatus \=  
  "semantic-incompatibility"

or:

"bounded-adapter-needed"

depending on the actual failure.

The evaluator shall not:

* substitute the base Claim Set;  
* skip enrichment;  
* proceed as though enrichment succeeded;  
* create a synthetic enriched set.

It may stop downstream processing for that scenario and report the precise finding.

---

# **Part V — Enriched Claim Set to Conflict Evaluation Seam**

## **20\. Named Required Seam**

The principal unverified seam is:

> **Enriched Governed Claim Set → Conflict Evaluation**

This seam shall be reported independently for every scenario.

The evaluator shall determine:

1. whether the conflict engine can receive the enriched Claim Set without semantic adaptation;  
2. whether it evaluates enriched claim IDs rather than base claim IDs;  
3. whether it preserves enriched statuses;  
4. whether it uses enriched factual values and source references where relevant;  
5. whether per-cell evaluation remains intact;  
6. whether unsupported claims remain separately evaluated or ineligible;  
7. whether no base claim is silently reintroduced.

---

## **21\. Conflict Input Requirement**

Where enrichment succeeds, conflict evaluation must consume:

enrichment.enrichedClaimSet

not:

recognition.claimSet

Required direct proof:

conflict evaluation claim-set identity  
    \=  
enrichedGovernedClaimSetId

or the exact governed identity field used by the current conflict engine.

If the conflict engine’s current type still names the field:

governedClaimSetId

the evaluator shall confirm whether structural compatibility truthfully carries the enriched set identity or whether a bounded adapter is required.

Do not silently substitute the base set ID.

---

## **22\. Enriched Claim Identity Requirement**

Every conflict evaluation cell shall reference:

enriched claimId

for the claim it evaluates.

It shall not reference:

* `baseClaimId`;  
* the base Claim Set’s `claimId`;  
* both IDs ambiguously.

Required assertion:

affectedClaimIds

and every per-cell `claimId` are members of:

enrichedClaimSet.claimIds

---

## **23\. Per-Cell Evaluation Preservation**

Sprint 3.94/3.95 established:

complete claim set  
    ↓  
each eligible claimId × conflictClass cell

The re-check shall prove this remains true after enrichment.

For the compound Cassie case:

### **Contact claim**

The enriched contact claim shall receive the source-value-contradiction cell.

### **Importance claim**

The enriched importance claim shall receive the correct:

claim\_type\_outside\_ruleset

or current exact ineligible-cell representation.

It shall not:

* invalidate the full set;  
* be dropped;  
* be treated as contact-address evidence;  
* bypass per-cell evaluation.

---

## **24\. No Duplicate Evaluation**

The evaluator shall prove that conflict evaluation does not process both:

base contact claim

and:

enriched contact claim

as separate claims for the same operator assertion.

Exactly one canonical post-enrichment claim shall enter conflict evaluation.

The base claim remains lineage history only.

---

## **25\. Enriched Factual Values**

For every scenario where the enriched contact claim reaches:

status \= available

with real:

factualValues  
sourceReferences

confirm:

* the conflict engine receives those values through its actual observation input boundary;  
* the observations’ `affectedClaimId` points to the enriched claim;  
* conflict comparison is performed against the enriched claim;  
* no value is copied from the pre-enrichment base claim;  
* no enriched factual value is silently lost before conflict evaluation.

If the conflict engine has no channel to consume enriched `factualValues` directly and still relies on independently created `GovernedSourceObservation[]`, classify whether that is:

compatible  
bounded-adapter-needed  
semantic-incompatibility  
unresolved

Do not assume compatibility merely because IDs compile.

---

# **Part VI — Ten Required Scenarios**

## **26\. Scenario Inventory**

The re-check shall run exactly:

FULL\_ASSEMBLY\_SCENARIO\_IDS

containing:

1. `cassie-compound-contact-conflict`  
2. `single-contact-no-conflict`  
3. `legacy-memory-unattested`  
4. `connector-disconnected-local-fallback`  
5. `gmail-conflict-plus-unsupported-claim`  
6. `conflict-evaluation-unavailable`  
7. `conflict-evaluation-unsupported`  
8. `conflict-evaluation-failed`  
9. `partial-source-failure`  
10. `deterministic-replay`

No scenario may be removed.

---

## **27\. Cassie Compound Contact Conflict**

Required enriched behaviour:

contact\_address\_lookup  
    base \= insufficient\_coverage  
    enriched \= available or contract-compliant pre-conflict status  
    enriched claim ID used by conflict evaluation

message\_importance  
    base \= unsupported  
    enriched \= unsupported  
    enriched claim ID receives ineligible per-cell result

Required conflict behaviour:

two incompatible contact values  
    ↓  
evaluated\_conflict\_found or partially\_evaluated

according to the existing scenario expectation.

Required:

* conflict references enriched contact claim;  
* importance remains unsupported;  
* no source is selected;  
* projection applies conflict restriction to enriched claim;  
* original 3.102 conflict outcome remains preserved.

---

## **28\. Single Contact, No Conflict**

This is the direct correction scenario for Sprint 3.102.

Required:

base contact claim  
    \= insufficient\_coverage

enriched contact claim  
    \= available

conflict evaluation  
    \= evaluated\_no\_conflict

effective claim status  
    \= available

This scenario shall now pass the seam that Sprint 3.102 identified as incompatible.

Required direct finding:

source assembly → recognition  
    remains intentionally pre-evidence

recognition → enrichment  
    compatible

enrichment → conflict evaluation  
    independently classified

---

## **29\. Legacy Memory Unattested**

Required:

* Memory legacy entries still publish zero governed references;  
* enrichment does not use Memory as contact evidence;  
* enrichment does not use Memory as importance evidence;  
* original no-conflict result remains unchanged;  
* absence of Memory evidence does not make enrichment fail.

---

## **30\. Connector Disconnected With Local Fallback**

Required:

gmail connector unavailable  
    ↓  
contact enrichment \=  
retained\_unavailable

where the scenario’s connector state makes Gmail unavailable.

Required:

* local fallback remains non-canonical;  
* contact address is not upgraded from local data;  
* importance remains unsupported;  
* original fallback-honesty result remains unchanged;  
* conflict evaluation receives the enriched unavailable claim.

---

## **31\. Gmail Conflict Plus Unsupported Claim**

Required:

* real Gmail evidence is assembled;  
* contact claim is enriched with admitted source references and factual values;  
* importance remains unsupported;  
* conflict observations point to enriched contact claim ID;  
* source contradiction remains visible;  
* no unsupported claim is upgraded;  
* original mixed-condition result remains preserved.

---

## **32\. Conflict Evaluation Unavailable**

Required:

* enrichment completes under the scenario’s source conditions where permitted;  
* conflict evaluation produces `evaluation_unavailable`;  
* unavailable conflict evaluation does not erase enriched claim lineage;  
* projection retains the evaluation state;  
* original result remains preserved.

---

## **33\. Conflict Evaluation Unsupported**

Required:

* enrichment completes;  
* conflict evaluation produces `evaluation_unsupported`;  
* enriched claims are not reverted to base claims;  
* unsupported conflict class remains distinguishable from unsupported claim status;  
* original result remains preserved.

---

## **34\. Conflict Evaluation Failed**

Required:

* enrichment completes unless the scenario truthfully prevents it;  
* deterministic conflict failure remains `evaluation_failed`;  
* failure does not become no-conflict;  
* enriched claim identities survive to the failure publication;  
* original result remains preserved.

---

## **35\. Partial Source Failure**

Required:

* source assembly retains independent source results;  
* Gmail failure does not suppress other sources;  
* contact enrichment becomes unavailable or insufficient according to the exact source state;  
* no synthetic Gmail assertion is created;  
* original source-isolation result remains preserved.

---

## **36\. Deterministic Replay**

Run the same enrichment-inserted scenario twice with identical:

* source fixtures;  
* base Claim Set;  
* resolver output;  
* source assembly reference;  
* reference time;  
* created time;  
* conflict discriminator;  
* model adapter output.

Required identical values:

enrichmentRulesetId  
enrichmentEvaluationId  
enriched claim IDs  
enrichedGovernedClaimSetId  
conflictEvaluationId  
governedConflictSetId  
projectionId  
responseEnvelopeId  
executionRecordId

where current deterministic identity rules require stability.

---

# **Part VII — Original Result Preservation**

## **37\. Two Independent Questions Per Scenario**

For each scenario, report:

### **Question A — Original regression preservation**

Did the result established by Sprint 3.102 remain true?

### **Question B — Enrichment-specific compatibility**

Did the new enrichment stage compose correctly with the downstream architecture?

Do not combine these into one pass/fail field.

A scenario may:

* preserve the original expected result; and  
* reveal a new enrichment seam incompatibility.

Both must be reported.

---

## **38\. Original Expected Behaviour**

Use the real Sprint 3.102 baseline result and current scenario-specific expectations.

Do not hardcode a new expected-outcome function with altered semantics.

The new evaluator may compare:

originalResult.stageResults  
originalResult.statuses  
originalResult.findings

against enriched runtime output.

---

## **39\. Permitted Corrected Difference**

The specific intended difference is:

recognised contact claim:  
insufficient\_coverage  
    ↓  
enriched contact claim:  
available

where sufficient governed Gmail evidence exists.

This is not a regression.

It is the correction governed by Sprint 3.103.

Other behaviour shall remain stable unless a real finding demonstrates why it cannot.

---

## **40\. No False Baseline Requirement**

Do not require the enriched runtime to reproduce Sprint 3.102’s known defect.

For example, in:

single-contact-no-conflict

the original `claims` stage failed because the contact claim remained insufficient.

The enriched re-check should instead report:

original known finding corrected

while preserving all unaffected scenario expectations.

---

# **Part VIII — Projection Re-Check**

## **41\. Real Composer**

Every scenario reaching projection shall call:

composeGovernedConversationalProjection(...)

The composer shall receive the enriched claims intended for downstream use.

No local projection reconstruction is permitted.

---

## **42\. Projection Claim Inputs**

The projection’s:

claims

collection shall contain enriched claims.

The projection’s claim-set publication field shall reference the enriched Claim Set or an explicitly governed bounded representation of it.

If the current composer accepts only:

GovernedClaimSet

and cannot truthfully represent:

EnrichedGovernedClaimSet

without losing:

* `baseGovernedClaimSetId`;  
* `enrichmentEvaluationId`;  
* `enrichedGovernedClaimSetId`;  
* `baseClaimId`;

classify this seam.

Do not invent a projection adapter in this evaluation.

---

## **43\. Enrichment Lineage Preservation**

The re-check shall inspect whether projection preserves:

baseGovernedClaimSetId  
enrichmentRulesetId  
enrichmentEvaluationId  
enrichedGovernedClaimSetId  
baseClaimId  
enriched claimId

Sprint 3.104 did not wire these fields into the composer.

If they disappear, report:

semantic-incompatibility

or:

bounded-adapter-needed

based on the actual architecture.

Do not treat a successful TypeScript call as proof that lineage survived.

---

## **44\. Effective Claim Status**

The projection’s existing deterministic aggregation shall operate on:

enriched canonical claim status  
\+  
conflict restriction

Required:

* available enriched claim \+ no conflict → available;  
* available enriched claim \+ conflict restriction → restricted effective status;  
* unsupported importance → unsupported;  
* unavailable enriched claim → unavailable;  
* no source-selection or adjudication.

---

# **Part IX — Governed Input and Model Re-Check**

## **45\. Governed Input**

Construct the governed input from projection output using the real:

constructGovernedConversationalInput(...)

Required:

* enriched claim IDs survive;  
* effective statuses survive;  
* source references survive;  
* factual values appear only where permitted;  
* unsupported importance remains unsupported;  
* base claim IDs are not substituted for enriched IDs.

---

## **46\. Model Invocation**

Use the same deterministic model adapter pattern as Sprint 3.102.

The adapter shall not be changed merely to accommodate enrichment.

Required valid interpretation:

* may state a non-conflicting available address;  
* shall express uncertainty where conflict exists;  
* shall not choose between conflicting values;  
* shall not claim message importance;  
* shall not upgrade unavailable or unsupported claims.

---

## **47\. Validator**

Use the unchanged validator.

Required:

* valid bounded output passes;  
* disputed-value selection fails;  
* importance upgrade fails;  
* unavailable certainty fails;  
* invented factual value fails;  
* source-reference mismatch fails where currently governed;  
* safe-envelope fallback remains unchanged.

---

# **Part X — Mutation Sensitivity**

## **48\. Required New-Seam Mutation**

The mutation shall occur:

after enrichGovernedClaims  
before evaluateGovernedConversationalConflicts

It shall target the enriched claim, not scenario metadata.

---

## **49\. Status Mutation**

Required mutation option:

real enriched contact claim:  
status \= available  
factualValues \= \["cassie.primary@example.com"\]  
sourceReferences \= \[real source\]

mutate only:

status \= unsupported

while leaving its:

* enrichment outcome;  
* factual values;  
* source references;  
* bounded completeness;  
* evaluation publication

unchanged.

Expected:

* an existing downstream validation or composition check rejects the incoherence; or  
* the re-check harness identifies a semantic integrity failure.

Silent acceptance shall be reported as a real finding.

Do not add a core validator in this sprint to force rejection.

---

## **50\. Factual-Values Mutation**

Required second mutation option:

real enriched contact claim

then replace:

factualValues

with a value absent from all admitted source assertions while preserving:

* claim ID;  
* source references;  
* enrichment evaluation ID.

Expected:

* downstream validation detects identity/body inconsistency;  
* conflict observation correlation fails;  
* projection validation rejects;  
* or the re-check reports that the mutation was silently accepted.

The mutation must demonstrate whether the downstream architecture actually verifies enrichment coherence.

---

## **51\. Mutation Pass Condition**

Mutation sensitivity is proven when the baseline passes and the mutation causes one of:

* deterministic rejection;  
* changed seam classification;  
* failed stage result;  
* explicit integrity finding.

It is not required that current core code already throws.

If it silently accepts the mutation, that is a completed and important evaluation finding.

---

## **52\. No Mutation Repair**

Do not add:

* an enrichment validator;  
* an adapter;  
* a hash check;  
* a projection check;  
* a conflict-engine check

inside core modules during this sprint.

Record the finding for later governance or correction.

---

# **Part XI — Finding Vocabulary**

## **53\. Required Composition Status**

For every evaluated seam, use exactly:

compatible  
bounded-adapter-needed  
semantic-incompatibility  
unresolved

---

## **54\. `compatible`**

Use when the real components compose without:

* semantic loss;  
* identity loss;  
* status distortion;  
* duplicated evaluation;  
* hidden fallback;  
* ungoverned adaptation.

---

## **55\. `bounded-adapter-needed`**

Use when:

* meanings are compatible;  
* the required transformation is mechanical;  
* no governance decision is missing;  
* the adapter does not create new semantic authority.

Do not implement it in Sprint 3.105.

---

## **56\. `semantic-incompatibility`**

Use when:

* identities represent different objects;  
* required lineage disappears;  
* enriched and base claims are conflated;  
* conflict evaluation uses the wrong claim publication;  
* status meaning changes;  
* a downstream stage accepts contradictory canonical state;  
* prior governance responsibilities conflict.

---

## **57\. `unresolved`**

Use only when repository evidence is insufficient to decide.

Do not use it as a softer label for a known incompatibility.

---

# **Part XII — Required Result Structure**

## **58\. Per-Scenario Stage Results**

Each scenario shall report:

assembly  
recognition  
enrichment  
enrichedClaimSetToConflictEvaluation  
conflicts  
projection  
governedInput  
modelInvocation  
validation

Each stage contains:

{  
  passed: boolean;  
  evidence: string;  
}

---

## **59\. Identity Trace**

Collect as applicable:

threadId  
requestId  
exchangeId  
claimBoundaryRulesetId  
claimBoundaryEvaluationId  
baseGovernedClaimSetId  
enrichmentRulesetId  
enrichmentEvaluationId  
enrichedGovernedClaimSetId  
base claim IDs  
enriched claim IDs  
conflictEvaluationRulesetId  
conflictEvaluationId  
governedConflictSetId  
projectionId  
responseEnvelopeId  
executionRecordId

---

## **60\. Status Trace**

Collect:

base claim statuses  
enrichment outcomes  
enriched claim statuses  
conflict evaluation outcome  
conflict restrictions  
effective claim statuses  
governed input overall status  
model outcome  
validation outcome  
source assembly statuses

---

## **61\. Findings**

Each finding shall include:

interface FullAssemblyEnrichmentFinding {  
  readonly scenarioId: FullAssemblyScenarioId;  
  readonly seam: string;  
  readonly status:  
    | "compatible"  
    | "bounded-adapter-needed"  
    | "semantic-incompatibility"  
    | "unresolved";  
  readonly expected: string;  
  readonly observed: string;  
  readonly evidence: string;  
  readonly affectedGovernance: readonly string\[\];  
  readonly requiredNextStep: string;  
}

---

# **Part XIII — Required Scenario Table**

## **62\. Completion Report Table**

Include:

| Scenario | Original result preserved | Enrichment | Enriched set → conflicts | Conflict result | Projection | Model/validator | Overall evaluation |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Cassie compound/contact conflict |  |  |  |  |  |  |  |
| Single contact/no conflict |  |  |  |  |  |  |  |
| Legacy Memory unattested |  |  |  |  |  |  |  |
| Connector local fallback |  |  |  |  |  |  |  |
| Gmail conflict \+ unsupported |  |  |  |  |  |  |  |
| Evaluation unavailable |  |  |  |  |  |  |  |
| Evaluation unsupported |  |  |  |  |  |  |  |
| Evaluation failed |  |  |  |  |  |  |  |
| Partial source failure |  |  |  |  |  |  |  |
| Deterministic replay |  |  |  |  |  |  |  |

Use only:

Passed  
Failed  
Not applicable

for stage results.

Use the composition-status vocabulary separately for findings.

---

# **Part XIV — Original Regression Comparison**

## **63\. Required Comparison Register**

For every scenario report:

| Scenario | Sprint 3.102 observed result | Sprint 3.105 enriched result | Intended correction | Unintended regression |
| ----- | ----- | ----- | ----- | ----- |
|  |  |  | Yes/No | Yes/No |

---

## **64\. Expected Intended Corrections**

Expected intentional differences include:

* contact claims with sufficient Gmail evidence may become available;  
* new enrichment identities appear;  
* new enrichment outcomes appear;  
* conflict evaluation should reference enriched claim IDs;  
* downstream stages should consume enriched claims.

---

## **65\. Expected Preserved Results**

Preserve:

* ten scenario IDs;  
* source assembly truthfulness;  
* unattested Memory exclusion;  
* connector fallback honesty;  
* conflict outcome distinction;  
* per-cell conflict evaluation;  
* no source adjudication;  
* effective-status restriction;  
* model ownership;  
* validator authority;  
* deterministic replay;  
* production isolation.

---

# **Part XV — Historical Harness Preservation**

## **66\. Sprint 3.102 Historical Record**

The existing Sprint 3.102 harness and completion document remain truthful records of the pre-enrichment architecture.

Do not rewrite:

* its finding;  
* its original baseline behaviour;  
* its scenario IDs;  
* its historical expectations;  
* its report.

Sprint 3.105 adds a re-check layer.

It does not rewrite Sprint 3.102 as though enrichment existed then.

---

## **67\. Permitted Historical Harness Changes**

Only evaluation-surface exports are permitted, if strictly required.

For example:

* export an existing scenario helper;  
* export an existing expected-outcome function;  
* export an existing observation constructor.

No behavioural change is permitted.

The completion report must list each export-only modification.

---

# **Part XVI — No-Fix Rule**

## **68\. Evaluation Purity**

If the enriched chain reveals:

* type incompatibility;  
* identity loss;  
* status mismatch;  
* duplicated claim evaluation;  
* stale base claim use;  
* conflict observation mismatch;  
* projection lineage loss;  
* mutation acceptance;  
* validator gap;

report it.

Do not fix it.

---

## **69\. Prohibited Workarounds**

Do not:

* cast away enriched types merely to compile;  
* copy enriched claims into a fake base Claim Set without recording the semantic effect;  
* restore base claim IDs before conflict evaluation;  
* omit unsupported claims;  
* hand-change conflict observation IDs after evaluation starts;  
* drop `baseClaimId`;  
* replace enriched set identity with base set identity;  
* manually inject enrichment lineage into projection;  
* loosen conflict expectations;  
* loosen validator expectations;  
* remove failing scenarios;  
* convert findings into test fixtures that assert the defect as success.

---

## **70\. Type Casts**

A TypeScript structural cast is not proof of architectural compatibility.

If a cast is required:

1. record the exact source and target types;  
2. identify fields lost;  
3. classify the seam;  
4. do not claim compatibility solely because runtime execution continues.

Prefer no cast.

---

# **Part XVII — Isolation**

## **71\. Production Isolation**

The new evaluator shall have zero contact with:

app/api/chat/route.ts  
lib/context-builder.ts  
lib/useAgentConversation.ts  
lib/agents/chat-execution.ts

No production module may import the evaluator.

---

## **72\. External Isolation**

The evaluation shall:

* make no real Gmail call;  
* make no real Calendar call;  
* make no external model call;  
* write no Memory file;  
* use no real OAuth token;  
* mutate no production state.

Use the existing deterministic fixtures and injected adapters.

---

## **73\. Protected Files**

Record pre/post blob hashes for:

app/api/chat/route.ts  
lib/context-builder.ts  
lib/useAgentConversation.ts  
lib/agents/chat-execution.ts

lib/governed-conversation/claim-boundary-engine.ts  
lib/governed-conversation/claim-boundary-types.ts  
lib/governed-conversation/claim-boundary-publications.ts  
lib/governed-conversation/claim-boundary-ruleset.ts

lib/governed-conversation/claim-enrichment-types.ts  
lib/governed-conversation/claim-enrichment-ruleset.ts  
lib/governed-conversation/claim-enrichment-engine.ts  
lib/governed-conversation/claim-enrichment-publications.ts  
lib/governed-conversation/claim-enrichment-fixtures.ts

lib/governed-conversation/conflict-boundary-engine.ts  
lib/governed-conversation/conflict-boundary-ruleset.ts  
lib/governed-conversation/conflict-boundary-types.ts  
lib/governed-conversation/conflict-boundary-publications.ts

lib/governed-conversation/source-evidence-assembly.ts  
lib/governed-conversation/projection-composer.ts  
lib/governed-conversation/input.ts  
lib/governed-conversation/model-invocation.ts  
lib/governed-conversation/validator.ts

Expected:

byte-identical

The historical Sprint 3.102 evaluator may change only for explicitly justified export-only additions.

---

## **74\. Pure-Node Isolation Proof**

Use:

node:fs  
node:path  
node:crypto

Do not rely on:

rg  
execFileSync  
platform-specific shell traversal

for committed isolation checks.

---

# **Part XVIII — Expected Files**

## **75\. Expected New Files**

lib/governed-conversation/full-assembly-enrichment-composition-recheck.ts  
lib/governed-conversation/full-assembly-enrichment-composition-recheck.test.ts  
docs/SPRINT-3.105-FULL-ASSEMBLY-COMPOSITION-RECHECK-WITH-ENRICHMENT.md

---

## **76\. Conditional Existing File Change**

Only if required to expose existing scenario-construction logic:

lib/governed-conversation/full-assembly-claim-boundary-conflict-boundary-composition-regression.ts

Permitted change:

export existing helper

Prohibited change:

change scenario semantics  
change fixture data  
change expected outcome  
insert enrichment into historical result  
remove original finding

---

# **Part XIX — Required Tests**

## **77\. Scenario Matrix Tests**

Required:

1. all ten `FULL_ASSEMBLY_SCENARIO_IDS` execute;  
2. matrix length remains ten;  
3. no duplicate scenario IDs;  
4. no substituted scenario IDs;  
5. each scenario produces an original result;  
6. each scenario produces an enrichment re-check result.

---

## **78\. Enrichment Seam Tests**

Required:

7. base Claim Set remains unchanged;  
8. enrichment runs after recognition;  
9. enrichment runs before conflicts;  
10. successful enrichment produces a new set ID;  
11. conflict engine receives enriched claims;  
12. conflict engine does not receive base claims;  
13. per-cell evaluation uses enriched claim IDs;  
14. importance remains separately ineligible;  
15. no duplicated base/enriched evaluation.

---

## **79\. Original Regression Tests**

Required:

16. unattested Memory remains empty;  
17. local fallback remains unavailable;  
18. conflict-unavailable remains distinct;  
19. conflict-unsupported remains distinct;  
20. conflict-failed remains distinct;  
21. partial source failure remains isolated;  
22. deterministic replay remains stable;  
23. no source is adjudicated.

---

## **80\. Projection Tests**

Required:

24. composer is real;  
25. enriched claims enter projection;  
26. conflict restrictions apply to enriched IDs;  
27. effective status is correct;  
28. unsupported importance remains unsupported;  
29. no conflict remains distinguishable from evaluation not running;  
30. enrichment lineage loss is explicitly detected and classified.

---

## **81\. Model and Validator Tests**

Required:

31. real mocked model path runs;  
32. valid bounded output passes;  
33. disputed-value selection fails;  
34. importance upgrade fails;  
35. unavailable certainty fails;  
36. invented value fails;  
37. safe-envelope behaviour remains unchanged.

---

## **82\. Mutation Tests**

Required:

38. baseline enriched scenario passes;  
39. status mutation occurs after enrichment;  
40. factual-value mutation occurs after enrichment;  
41. downstream detection or explicit integrity finding occurs;  
42. mutation does not alter scenario metadata;  
43. original unmutated result remains stable.

---

## **83\. Isolation Tests**

Required:

44. protected files remain unchanged;  
45. production imports remain absent;  
46. evaluator imports no production route;  
47. no live network call;  
48. no live model call;  
49. pure-Node isolation check passes.

---

# **Part XX — Validation**

## **84\. Targeted Validation**

Run the new re-check suite independently.

Also rerun targeted suites for:

Sprint 3.102 full-assembly regression  
claim enrichment  
claim boundary  
conflict boundary  
claims/conflicts composition  
source-evidence assembly  
projection composer  
governed input  
model invocation  
validator

---

## **85\. Full Validation**

Run the actual complete repository validation:

npm test  
npm run build  
npm run lint  
npm run typecheck  
git diff \--check

No exception applies.

Do not rely only on targeted tests.

---

# **Part XXI — Stop-and-Report Conditions**

## **86\. Scenario Reuse Failure**

If the re-check cannot directly reuse the ten scenarios without reconstructing their semantics, stop and report the exact missing export or ownership boundary.

A bounded export-only change may be made.

A scenario rewrite may not.

---

## **87\. Enriched Set Type Incompatibility**

If `EnrichedGovernedClaimSet` cannot be passed to conflict evaluation without:

* changing identity meaning;  
* losing `baseClaimId`;  
* reusing the base set ID;  
* changing conflict semantics;

report the finding.

Do not create a compatibility shim.

---

## **88\. Conflict Observation Identity Gap**

If existing `GovernedSourceObservation` fixtures still reference base claim IDs and no governed existing mechanism connects them to enriched claim IDs, classify the seam.

Do not silently rewrite IDs without recording whether the operation is:

* mechanical;  
* semantic;  
* already authorized;  
* ungoverned.

---

## **89\. Projection Lineage Gap**

If the composer accepts enriched claim values but drops enrichment publication identities, report the exact lost fields.

Do not add fields to the composer in this sprint.

---

## **90\. Mutation Silence**

If mutated enriched status or factual values are silently accepted by all downstream stages:

* mark mutation sensitivity as proven through a detected integrity gap;  
* report the silent acceptance as a real finding;  
* do not add a validator.

The evaluation may still be:

> **Evaluation Complete**

---

# **Part XXII — Completion Report**

## **91\. Repository Precondition**

Report:

* repository;  
* branch;  
* starting commit;  
* working-tree state;  
* required document presence;  
* required function signatures;  
* exact ten scenario IDs;  
* starting protected hashes.

---

## **92\. Architecture Confirmed**

Report the exact real chain used:

assembleGovernedSourceEvidence  
evaluateClaimBoundary  
enrichGovernedClaims  
evaluateGovernedConversationalConflicts  
composeGovernedConversationalProjection  
constructGovernedConversationalInput  
invokeGovernedConversationModel  
validator

---

## **93\. Scenario Reuse**

State explicitly:

> All ten scenarios were taken directly from `FULL_ASSEMBLY_SCENARIO_IDS`, and the existing Sprint 3.102 scenario-construction logic was reused rather than rebuilt.

List any export-only historical-harness changes.

---

## **94\. Scenario Table**

Include the complete table from Section 62\.

---

## **95\. Original Result Comparison**

Include the complete register from Section 63\.

For every scenario distinguish:

* intended correction;  
* preserved behaviour;  
* unintended regression;  
* new finding.

---

## **96\. Enriched Set to Conflict Evaluation Finding**

Report, as a named section:

### **Input set identity**

Which set identity did conflict evaluation receive?

### **Claim identities**

Did every cell use enriched claim IDs?

### **Per-cell evaluation**

Were contact and importance handled independently?

### **Factual values and source references**

Did enriched evidence reach the conflict-evaluation boundary truthfully?

### **Duplicate evaluation**

Were base claims excluded from canonical conflict evaluation?

### **Composition status**

Exactly one of:

compatible  
bounded-adapter-needed  
semantic-incompatibility  
unresolved

---

## **97\. Projection Finding**

Report:

* enriched claims received;  
* enriched claim IDs preserved;  
* enrichment lineage fields preserved or lost;  
* conflict restriction applied;  
* effective status;  
* exact composition status.

---

## **98\. Mutation Sensitivity**

Report:

### **Baseline**

Observed valid enriched claim.

### **Status mutation**

Exact mutation and detection result.

### **Factual-value mutation**

Exact mutation and detection result.

### **Finding**

Whether downstream integrity enforcement exists or a gap was found.

---

## **99\. Identity Trace**

Report for every scenario:

baseGovernedClaimSetId  
enrichmentRulesetId  
enrichmentEvaluationId  
enrichedGovernedClaimSetId  
base claim IDs  
enriched claim IDs  
conflictEvaluationId  
governedConflictSetId  
projectionId  
responseEnvelopeId  
executionRecordId

where applicable.

---

## **100\. Isolation Result**

Report:

* pre/post hashes;  
* pure-Node import search;  
* no production imports;  
* no live services;  
* no core semantic modifications.

---

## **101\. Files Changed**

Expected:

lib/governed-conversation/full-assembly-enrichment-composition-recheck.ts  
lib/governed-conversation/full-assembly-enrichment-composition-recheck.test.ts  
docs/SPRINT-3.105-FULL-ASSEMBLY-COMPOSITION-RECHECK-WITH-ENRICHMENT.md

Optionally:

lib/governed-conversation/full-assembly-claim-boundary-conflict-boundary-composition-regression.ts

for export-only changes.

List every file with a one-line reason.

No silent scope expansion.

---

## **102\. Validation Results**

Report exact results for:

new enrichment re-check suite  
Sprint 3.102 regression suite  
claim-enrichment suite  
claim-boundary suite  
conflict-boundary suite  
claims/conflicts composition suite  
source-evidence assembly suite  
projection suite  
input suite  
model-invocation suite  
validator suite  
npm test  
npm run build  
npm run lint  
npm run typecheck  
git diff \--check

---

## **103\. Production Effect**

State exactly:

> Sprint 3.105 adds isolated evaluation evidence only. It does not modify claim recognition, enrichment semantics, conflict evaluation, source evidence, projection composition, model invocation, validation, `/api/chat`, `context-builder.ts`, `useAgentConversation.ts`, or current production behaviour.

---

## **104\. Findings Register**

Report by seam:

Source assembly → recognition:  
Recognition → enrichment:  
Enrichment publication:  
Enriched Claim Set → conflict evaluation:  
Conflict evaluation → projection:  
Projection enrichment lineage:  
Projection → governed input:  
Governed input → model invocation:  
Model output → validator:  
Mutation integrity:  
Replay:  
Isolation:

---

## **105\. Recommended Next Step**

If all seams are compatible:

> **Sprint 3.106 — Governed Conversational Production Integration Readiness Review**

This shall be a readiness decision, not automatic integration.

If a bounded adapter is required:

> Recommend a narrowly scoped correction implementation sprint.

If a semantic incompatibility is found:

> Recommend a governance correction contract before implementation.

Do not recommend production integration while a blocking finding remains unresolved.

---

# **Part XXIII — Recommendation Gate**

## **106\. Permitted Final Recommendation**

The final line must be exactly one:

> **Evaluation Complete**

or:

> **Evaluation Incomplete**

No other wording is permitted.

---

## **107\. Evaluation Complete**

Use when:

* all ten scenarios ran;  
* the original real scenario matrix was reused;  
* enrichment was inserted at the correct stage;  
* the enriched-to-conflict seam was directly tested;  
* original results were compared;  
* mutation sensitivity was proven;  
* all findings were reported without correction;  
* isolation held;  
* full validation passed.

A blocking architectural finding is compatible with:

> **Evaluation Complete**

provided the evaluation itself completed truthfully.

---

## **108\. Evaluation Incomplete**

Use only when:

* one or more scenarios did not run;  
* the real scenario matrix was replaced;  
* a core function was stubbed;  
* enrichment was bypassed;  
* conflict evaluation still used the base Claim Set without being reported;  
* mutation sensitivity was not tested;  
* isolation failed;  
* full validation failed;  
* a finding was repaired or hidden during evaluation.

---

# **Part XXIV — Binding Summary**

## **109\. Required Re-Check**

Sprint 3.105 shall execute:

FULL\_ASSEMBLY\_SCENARIO\_IDS  
    ↓  
existing Sprint 3.102 scenario construction  
    ↓  
assembleGovernedSourceEvidence  
    ↓  
evaluateClaimBoundary  
    ↓  
base GovernedClaimSet  
    ↓  
enrichGovernedClaims  
    ↓  
EnrichedGovernedClaimSet  
    ↓  
evaluateGovernedConversationalConflicts  
    ↓  
composeGovernedConversationalProjection  
    ↓  
constructGovernedConversationalInput  
    ↓  
invokeGovernedConversationModel  
    ↓  
unchanged validator

For all ten scenarios.

---

## **110\. Required New Seam Proof**

The sprint must determine whether:

Enriched Governed Claim Set  
    ↓  
Conflict Evaluation

is:

compatible  
bounded-adapter-needed  
semantic-incompatibility  
unresolved

The proof must address:

set identity  
enriched claim identity  
baseClaimId lineage  
factualValues  
sourceReferences  
per-cell evaluation  
unsupported claim handling  
duplicate evaluation

---

## **111\. Required Regression Proof**

For every scenario report:

what Sprint 3.102 proved  
what enrichment intentionally changed  
what remained unchanged  
what regressed  
what new incompatibility appeared

---

## **112\. Required Mutation Proof**

Corrupt:

enriched claim status

or:

enriched claim factualValues

after enrichment and before conflict evaluation.

Prove either:

* downstream rejection; or  
* a trustworthy finding that the inconsistency was silently accepted.

Do not add a fix.

---

## **113\. Governing Discipline**

reuse the real matrix  
insert only the new stage  
test the exact unverified seam  
compare against the real baseline  
preserve every prior scenario  
mutate the enriched publication  
trust findings more than expected success  
change no architecture

The final line shall be exactly:

> **Evaluation Complete**

or:

> **Evaluation Incomplete**

