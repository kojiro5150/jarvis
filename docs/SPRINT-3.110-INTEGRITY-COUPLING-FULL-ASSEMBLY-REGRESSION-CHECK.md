# **Sprint 3.110 — Integrity-Coupling Full-Assembly Regression Check**

**Status:** Specification  
**Sprint Type:** Isolated Full-Assembly Regression Evaluation  
**Implementation Authority:** Evaluation code only  
**Production Integration:** Prohibited  
**Direct Evaluation Precedents:** Sprints 3.78, 3.84, 3.93, 3.102, and 3.105  
**Governing Implementation:** Sprint 3.109 — Enrichment Integrity-Coupling Implementation  
**Output Path:** `docs/SPRINT-3.110-INTEGRITY-COUPLING-FULL-ASSEMBLY-REGRESSION-CHECK.md`

---

## **1\. Purpose**

Sprint 3.110 performs a narrowly scoped full-assembly regression check after Sprint 3.109 introduced deterministic integrity coupling between enriched claims and the governed source observations used by conflict evaluation.

The sprint shall reuse the exact existing full-assembly scenario matrix and evaluation harnesses.

It shall not construct a new scenario corpus.

The central question is:

> Does the governed enriched-claim integrity mechanism behave correctly across every existing full-assembly scenario, without changing the expected conflict outcome, introducing false-positive integrity failures, weakening deterministic replay, or disrupting any previously verified composition seam?

The full governed chain under evaluation is:

source acquisition adapters  
    ↓  
governed source-evidence publishers  
    ↓  
assembleGovernedSourceEvidence  
    ↓  
evaluateClaimBoundary  
    ↓  
base GovernedClaimSet  
    ↓  
enrichGovernedClaims  
    ↓  
claimIntegrityPolicyId  
claimIntegrityDigest  
    ↓  
EnrichedGovernedClaimSet  
    ↓  
governed conflict observations  
evaluatedClaimIntegrityDigest  
    ↓  
evaluateGovernedConversationalConflicts  
    ↓  
GovernedConflictSet  
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

The sprint shall directly reuse:

FULL\_ASSEMBLY\_SCENARIO\_IDS

runFullAssemblyRegressionMatrix()

runFullAssemblyEnrichmentRecheckMatrix()

runEnrichedClaimMutationProof()

and:

fullAssemblyExpectedOutcome()

from the existing Sprint 3.102 and Sprint 3.105 evaluation architecture.

The sprint shall not:

* define a replacement scenario-ID list;  
* copy the ten scenarios into a new fixture file;  
* reimplement `fullAssemblyExpectedOutcome()`;  
* construct simpler replacement scenarios;  
* omit non-success outcomes;  
* rebuild the Cassie fixture;  
* replace the real mutation proof;  
* alter scenario data so the digest mechanism passes more easily.

The fact that Sprint 3.109 passed its own targeted tests does not establish that the digest mechanism behaves correctly across every existing full-assembly shape.

That is the question Sprint 3.110 must answer.

---

## **3\. Evaluation Gate Meaning**

The final recommendation shall be exactly one of:

> **Evaluation Complete**

or:

> **Evaluation Incomplete**

Use:

> **Evaluation Complete**

when:

* the complete required evaluation ran;  
* all ten real scenarios were used;  
* expected outcomes were compared through the real mapping;  
* replay determinism was tested directly;  
* all three required non-success outcomes were examined;  
* the real mutation proof was rerun;  
* any incompatibility was documented without being fixed;  
* isolation held;  
* full repository validation passed.

A genuine new architectural finding does not make the evaluation incomplete.

Use:

> **Evaluation Incomplete**

only when the evaluation process itself could not be completed truthfully, including:

* scenarios were omitted or replaced;  
* the real harness was bypassed;  
* expected outcomes were hand-asserted;  
* digest values were not inspected;  
* mutation proof did not run;  
* isolation failed;  
* full validation failed;  
* a discovered defect was modified during the evaluation.

---

## **4\. Sprint Character**

This sprint is evaluation-only.

It may:

* add one narrowly scoped integrity regression evaluator;  
* add corresponding tests;  
* call the existing matrix runners;  
* add evaluation-only result extraction;  
* run the deterministic-replay scenario repeatedly;  
* inspect claim and observation digest values;  
* classify composition findings;  
* report unexpected digest errors.

It shall not modify:

* `claim-integrity.ts`;  
* claim enrichment;  
* enriched Claim Set publication;  
* conflict observations;  
* conflict evaluation;  
* conflict rulesets;  
* per-cell evaluation;  
* projection composition;  
* source publishers;  
* source assembly;  
* governed input construction;  
* model invocation;  
* validation;  
* `/api/chat`;  
* any production entry point.

If the evaluation finds a problem, report it.

Do not fix it.

---

## **5\. Governing Hierarchy**

Apply:

1. JARVIS Engineering Constitution;  
2. JARVIS North Star;  
3. JARVIS Engineering Specification Standard;  
4. Constitutional Publication Principles;  
5. Roadmap;  
6. Sprint 3.90 — Governed Conversational Conflicts Boundary Contract;  
7. Sprint 3.94 — Governed Claims and Conflicts Composition Correction Contract;  
8. Sprint 3.103 — Governed Evidence-to-Claim Enrichment Contract;  
9. Sprint 3.106 — Governed Enrichment Composition Correction Contract;  
10. Sprint 3.108 — Governed Enrichment Integrity-Coupling Contract;  
11. Sprint 3.109 — Enrichment Integrity-Coupling Implementation;  
12. Sprint 3.102 — Full-Assembly Regression precedent;  
13. Sprint 3.105 — Enrichment Composition Re-Check precedent;  
14. current repository implementation;  
15. this specification.

No prior semantic decision is reopened.

---

# **Part I — Repository Precondition**

## **6\. Required Documents**

Before adding evaluation code, confirm and read completely:

docs/SPRINT-3.102-FULL-ASSEMBLY-CONVERSATIONAL-COMPOSITION-REGRESSION.md  
docs/SPRINT-3.103-GOVERNED-EVIDENCE-TO-CLAIM-ENRICHMENT-CONTRACT.md  
docs/SPRINT-3.104-ISOLATED-EVIDENCE-TO-CLAIM-ENRICHMENT-IMPLEMENTATION.md  
docs/SPRINT-3.105-FULL-ASSEMBLY-COMPOSITION-RECHECK-WITH-ENRICHMENT.md  
docs/SPRINT-3.106-GOVERNED-ENRICHMENT-COMPOSITION-CORRECTION-CONTRACT.md  
docs/SPRINT-3.107-ENRICHMENT-COMPOSITION-CORRECTION-IMPLEMENTATION.md  
docs/SPRINT-3.108-GOVERNED-ENRICHMENT-INTEGRITY-COUPLING-CONTRACT.md  
docs/SPRINT-3.109-ENRICHMENT-INTEGRITY-COUPLING-IMPLEMENTATION.md  
docs/CONSTITUTIONAL-PUBLICATION-PRINCIPLES.md  
docs/architecture/ROADMAP.md

Also read the direct evaluation precedents:

docs/SPRINT-3.78-CONVERSATIONAL-PARALLEL-EVALUATION.md  
docs/SPRINT-3.84-CONVERSATIONAL-LINEAGE-AND-PROJECTION-EVALUATION.md  
docs/SPRINT-3.93-CLAIMS-AND-CONFLICTS-COMPOSITION-EVALUATION.md

If any required document is absent, stop.

Return:

> **Evaluation Incomplete**

---

## **7\. Required Source Inspection**

Read completely:

lib/governed-conversation/claim-integrity.ts  
lib/governed-conversation/claim-integrity.test.ts

lib/governed-conversation/claim-enrichment-types.ts  
lib/governed-conversation/claim-enrichment-publications.ts  
lib/governed-conversation/claim-enrichment-engine.ts

lib/governed-conversation/conflict-boundary-types.ts  
lib/governed-conversation/conflict-boundary-engine.ts

lib/governed-conversation/full-assembly-claim-boundary-conflict-boundary-composition-regression.ts  
lib/governed-conversation/full-assembly-claim-boundary-conflict-boundary-composition-regression.test.ts

lib/governed-conversation/full-assembly-enrichment-composition-recheck.ts  
lib/governed-conversation/full-assembly-enrichment-composition-recheck.test.ts

Also inspect every exported function or type used to access:

claimIntegrityPolicyId  
claimIntegrityDigest  
evaluatedClaimIntegrityDigest  
EnrichedClaimIntegrityError  
EnrichedClaimIntegrityMismatchCode

---

## **8\. Required Function Confirmation**

Confirm directly that the current repository exports:

FULL\_ASSEMBLY\_SCENARIO\_IDS

fullAssemblyExpectedOutcome(  
  scenarioId: FullAssemblyScenarioId  
)

runFullAssemblyRegressionScenario(  
  scenarioId: FullAssemblyScenarioId  
)

runFullAssemblyRegressionMatrix()

runFullAssemblyEnrichmentRecheckScenario(  
  scenarioId: FullAssemblyScenarioId  
)

runFullAssemblyEnrichmentRecheckMatrix()

runEnrichedClaimMutationProof()

Confirm that:

FULL\_ASSEMBLY\_SCENARIO\_IDS.length \=== 10

and contains exactly:

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

If the matrix or its expected-outcome mapping has materially changed, stop and report the difference.

---

## **9\. Integrity Implementation Confirmation**

Confirm directly:

1. enriched claims publish `claimIntegrityPolicyId`;  
2. enriched claims publish `claimIntegrityDigest`;  
3. enriched observations publish `evaluatedClaimIntegrityDigest`;  
4. the policy is exactly:

governed-enriched-claim-integrity.v1

5. digest encoding matches:

^sha256:\[0-9a-f\]{64}$

6. conflict evaluation recomputes the enriched claim digest;  
7. integrity verification runs before per-cell evaluation;  
8. integrity errors are not converted to `evaluation_failed`;  
9. no `ConflictEvaluation` is published after an integrity mismatch;  
10. `runEnrichedClaimMutationProof()` currently rejects both governed mutations.

If these are not present, stop.

Return:

> **Evaluation Incomplete**

---

## **10\. Starting State**

Record:

* repository;  
* branch;  
* starting commit;  
* working-tree state;  
* required document presence;  
* required source presence;  
* exact scenario IDs;  
* expected-outcome mapping;  
* integrity-policy constant;  
* current mutation-proof result;  
* starting protected-file hashes;  
* expected new files.

---

# **Part II — Evaluation Architecture**

## **11\. Existing Base Matrix**

The Sprint 3.102 matrix runs the base Claim Set architecture.

It remains a required regression surface.

Call:

runFullAssemblyRegressionMatrix()

and verify every scenario against:

fullAssemblyExpectedOutcome(scenarioId)

Do not replace its expected outcomes with a new table.

---

## **12\. Existing Enrichment-Aware Matrix**

The Sprint 3.105/3.107 enrichment-aware matrix exercises:

source assembly  
    ↓  
claim recognition  
    ↓  
claim enrichment  
    ↓  
enriched claim integrity publication  
    ↓  
enriched conflict evaluation  
    ↓  
projection  
    ↓  
governed input  
    ↓  
model invocation  
    ↓  
validation

Call:

runFullAssemblyEnrichmentRecheckMatrix()

This is the principal matrix for evaluating the digest mechanism across the ten scenarios.

---

## **13\. No New Scenario Construction**

The evaluator shall not directly build:

* source acquisition fixtures;  
* source assembly inputs;  
* base claims;  
* enriched claims;  
* conflict observations;  
* expected conflict outcomes;  
* model adapter output;  
* projection inputs.

All scenario construction shall come from the existing harness.

A narrow evaluation-only export may be added to expose already-computed digest values if they are not currently accessible.

Any export-only change must:

* expose existing data unchanged;  
* add no semantic branch;  
* modify no fixture;  
* alter no expected outcome;  
* be listed explicitly in the completion report.

---

# **Part III — New Regression Evaluator**

## **14\. New Evaluation Module**

Create:

lib/governed-conversation/integrity-coupling-full-assembly-regression.ts

Create tests:

lib/governed-conversation/integrity-coupling-full-assembly-regression.test.ts

The module shall export functions equivalent to:

runIntegrityCouplingRegressionScenario(  
  scenarioId: FullAssemblyScenarioId  
): Promise\<IntegrityCouplingScenarioResult\>

runIntegrityCouplingRegressionMatrix():  
  Promise\<readonly IntegrityCouplingScenarioResult\[\]\>

runIntegrityReplayDeterminismCheck():  
  Promise\<IntegrityReplayDeterminismResult\>

runIntegrityNonSuccessOutcomeChecks():  
  Promise\<readonly IntegrityNonSuccessOutcomeResult\[\]\>

The matrix runner shall iterate directly over:

FULL\_ASSEMBLY\_SCENARIO\_IDS

It shall not declare a duplicate scenario array.

---

## **15\. Scenario Result Shape**

Define an evaluation-only result equivalent to:

interface IntegrityCouplingScenarioResult {  
  readonly scenarioId: FullAssemblyScenarioId;  
  readonly evaluationRan: true;

  readonly expectedOutcome:  
    ReturnType\<typeof fullAssemblyExpectedOutcome\>;

  readonly baseRegressionResult:  
    FullAssemblyRegressionResult;

  readonly enrichmentRegressionResult:  
    FullAssemblyEnrichmentRecheckResult;

  readonly observedConflictOutcome?: string;  
  readonly expectedOutcomePreserved: boolean;

  readonly claimIntegrityDigests:  
    readonly IntegrityClaimDigestTrace\[\];

  readonly observationIntegrityDigests:  
    readonly IntegrityObservationDigestTrace\[\];

  readonly integrityCheckResult:  
    "passed"  
    | "not\_applicable"  
    | "unexpected\_integrity\_rejection"  
    | "integrity\_data\_missing"  
    | "unresolved";

  readonly stageResults: {  
    readonly baseMatrix: StageResult;  
    readonly enrichmentMatrix: StageResult;  
    readonly expectedOutcome: StageResult;  
    readonly claimDigestPublication: StageResult;  
    readonly observationDigestCoupling: StageResult;  
    readonly conflictEvaluation: StageResult;  
  };

  readonly findings:  
    readonly IntegrityCouplingFinding\[\];  
}

Use existing repository types where possible.

Do not create a second governed status vocabulary.

---

## **16\. Digest Trace Shapes**

Use evaluation-only traces equivalent to:

interface IntegrityClaimDigestTrace {  
  readonly claimId: string;  
  readonly claimType: string;  
  readonly policyId: string;  
  readonly publishedDigest: string;  
  readonly recomputedDigest?: string;  
  readonly matched: boolean;  
}

interface IntegrityObservationDigestTrace {  
  readonly sourcePublicationId: string;  
  readonly affectedClaimId: string;  
  readonly evaluatedClaimIntegrityDigest?: string;  
  readonly targetClaimIntegrityDigest?: string;  
  readonly matched: boolean;  
}

The traces shall expose only deterministic test evidence already present in the synthetic harness.

---

# **Part IV — Ten-Scenario Matrix**

## **17\. Required Matrix Execution**

Run all ten scenario IDs through:

runFullAssemblyRegressionMatrix()

and:

runFullAssemblyEnrichmentRecheckMatrix()

For each scenario:

1. retrieve the real expected outcome through `fullAssemblyExpectedOutcome()`;  
2. retrieve the base matrix result;  
3. retrieve the enrichment-aware result;  
4. inspect the actual conflict outcome;  
5. inspect the claim digest;  
6. inspect all observation digests;  
7. confirm no unexpected integrity error occurred;  
8. record pass or finding.

---

## **18\. Expected Outcome Rule**

For every scenario:

observed enriched conflict outcome  
    \=  
fullAssemblyExpectedOutcome(scenarioId)

unless an existing scenario intentionally has a separately governed enriched result.

If any such exception exists in the live harness, cite the exact existing rule.

Do not create a new exception.

---

## **19\. Scenario Outcome Table**

The completion report shall include:

| Scenario | Expected outcome | Observed outcome | Claim digest valid | Observation digests coupled | Integrity false positive | Result |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Cassie compound/contact conflict |  |  |  |  |  |  |
| Single contact/no conflict |  |  |  |  |  |  |
| Legacy Memory unattested |  |  |  |  |  |  |
| Connector local fallback |  |  |  |  |  |  |
| Gmail conflict \+ unsupported claim |  |  |  |  |  |  |
| Conflict evaluation unavailable |  |  |  |  |  |  |
| Conflict evaluation unsupported |  |  |  |  |  |  |
| Conflict evaluation failed |  |  |  |  |  |  |
| Partial source failure |  |  |  |  |  |  |
| Deterministic replay |  |  |  |  |  |  |

Use:

Passed  
Failed  
Not applicable

for the result column.

---

# **Part V — Per-Scenario Integrity Checks**

## **20\. Claim Digest Publication**

For every enriched claim evaluated by the conflict engine, confirm:

claimIntegrityPolicyId  
    \=  
governed-enriched-claim-integrity.v1

and:

claimIntegrityDigest

matches:

^sha256:\[0-9a-f\]{64}$

Where an exported recomputation function exists, recompute and confirm equality.

Do not duplicate digest construction logic inside the evaluator.

---

## **21\. Observation Coupling**

For every observation targeting an enriched claim, confirm:

observation.affectedClaimId  
    \=  
target enriched claim.claimId

and:

observation.evaluatedClaimIntegrityDigest  
    \=  
target enriched claim.claimIntegrityDigest

All observations targeting the same enriched claim shall carry the same digest.

---

## **22\. Base-Only Cases**

Where the base matrix uses:

claimSetKind \= "base"

confirm:

* no enriched digest requirement is incorrectly imposed;  
* base conflict evaluation continues to run;  
* observations are not required to publish an enriched digest;  
* expected outcomes remain unchanged.

The evaluator shall distinguish:

integrityCheckResult \= "not\_applicable"

from:

integrityCheckResult \= "integrity\_data\_missing"

---

## **23\. No False-Positive Rejection**

An integrity failure is a false positive where:

* the enriched claim is unmodified;  
* its published digest is valid;  
* observations carry matching digests;  
* the conflict engine throws an integrity error.

Any such occurrence is a blocking architectural finding.

Do not catch it and replace it with the scenario’s expected outcome.

---

# **Part VI — Replay Determinism**

## **24\. Named Required Check**

The evaluator shall include a named section and test:

> **Replay Determinism**

Use the existing scenario:

deterministic-replay

Do not create a separate replay fixture.

---

## **25\. Required Repetitions**

Run the deterministic-replay enrichment-aware scenario at least three times with identical inputs.

The runs shall reuse the exact existing harness.

Required comparisons include:

claimIntegrityPolicyId  
claimIntegrityDigest  
evaluatedClaimIntegrityDigest  
enrichmentEvaluationId  
enrichedGovernedClaimSetId  
conflictEvaluationId  
governedConflictSetId  
projectionId  
responseEnvelopeId  
executionRecordId  
conflict outcome

Where an identity is intentionally attempt-specific under an existing contract, identify that exception explicitly.

Do not mark a governed attempt-specific identity as nondeterministic merely because it is correctly different.

---

## **26\. Digest Determinism**

For identical replay inputs:

claimIntegrityDigest run 1  
    \=  
claimIntegrityDigest run 2  
    \=  
claimIntegrityDigest run 3

For every matching observation:

evaluatedClaimIntegrityDigest run 1  
    \=  
evaluatedClaimIntegrityDigest run 2  
    \=  
evaluatedClaimIntegrityDigest run 3

The comparison shall be byte-for-byte string equality.

---

## **27\. Replay Result Shape**

Define an evaluation result equivalent to:

interface IntegrityReplayDeterminismResult {  
  readonly scenarioId: "deterministic-replay";  
  readonly runCount: number;  
  readonly claimDigestRuns:  
    readonly (readonly string\[\])\[\];  
  readonly observationDigestRuns:  
    readonly (readonly string\[\])\[\];  
  readonly claimDigestsByteIdentical: boolean;  
  readonly observationDigestsByteIdentical: boolean;  
  readonly governedIdentitiesCompared:  
    Readonly\<Record\<string, readonly string\[\]\>\>;  
  readonly expectedOutcomePreserved: boolean;  
  readonly finding?: IntegrityCouplingFinding;  
}

---

## **28\. Determinism Failure**

Classify a real failure where identical inputs produce different digests as:

semantic-incompatibility

because the v1 integrity publication would no longer provide stable immutable-state coupling.

Do not normalize away the difference in the evaluator.

---

# **Part VII — Non-Success Outcome False-Positive Check**

## **29\. Named Required Check**

The evaluator shall include a named section:

> **Non-Success Outcome Integrity False-Positive Check**

It shall examine exactly:

conflict-evaluation-unavailable  
conflict-evaluation-unsupported  
conflict-evaluation-failed

---

## **30\. Conflict Evaluation Unavailable**

Expected real outcome:

evaluation\_unavailable

Confirm:

1. any applicable enriched claim digest validates;  
2. applicable observation digests validate;  
3. no `EnrichedClaimIntegrityError` is thrown;  
4. the outcome arises from the existing unavailable-source or insufficient-coverage reason;  
5. the digest mechanism does not convert it to another outcome;  
6. the digest mechanism does not mask the real unavailability.

Required evidence:

* observed outcome;  
* unevaluated reason;  
* digest verification result;  
* absence of an integrity error.

---

## **31\. Conflict Evaluation Unsupported**

Expected real outcome:

evaluation\_unsupported

Confirm:

1. integrity validation runs where applicable before per-cell evaluation;  
2. no integrity error occurs;  
3. the real unsupported conflict class or claim-class reason remains the cause;  
4. the expected outcome is not replaced by a digest failure;  
5. the integrity mechanism does not attempt to make an unsupported evaluation executable.

Required evidence:

* requested conflict class;  
* executable conflict classes;  
* unevaluated reason;  
* digest verification result;  
* observed outcome.

---

## **32\. Conflict Evaluation Failed**

Expected real outcome:

evaluation\_failed

Confirm:

1. the legitimate enriched claim digest is valid;  
2. applicable observation digest coupling is valid where structurally present;  
3. the conflict engine proceeds beyond integrity verification;  
4. the existing evaluator failure condition remains the cause;  
5. the result is not an integrity mismatch;  
6. no integrity error is swallowed and mislabeled as `evaluation_failed`.

Required evidence:

* digest verification passed;  
* real evaluator failure reason;  
* observed outcome;  
* proof that no `EnrichedClaimIntegrityError` occurred.

---

## **33\. Required Distinction**

The evaluator shall distinguish:

integrity precondition failure

from:

valid evaluation\_unavailable  
valid evaluation\_unsupported  
valid evaluation\_failed

The integrity mechanism shall not collapse these into one generic failure.

---

## **34\. Non-Success Result Shape**

Use a result equivalent to:

interface IntegrityNonSuccessOutcomeResult {  
  readonly scenarioId:  
    | "conflict-evaluation-unavailable"  
    | "conflict-evaluation-unsupported"  
    | "conflict-evaluation-failed";

  readonly expectedOutcome:  
    | "evaluation\_unavailable"  
    | "evaluation\_unsupported"  
    | "evaluation\_failed";

  readonly observedOutcome?: string;  
  readonly integrityVerificationPassed: boolean;  
  readonly integrityErrorCode?: string;  
  readonly realOutcomeReason: string;  
  readonly falsePositiveDetected: boolean;  
}

---

# **Part VIII — Mutation Reconfirmation**

## **35\. Existing Real Proof**

Call:

runEnrichedClaimMutationProof()

Do not rebuild its scenario.

Do not perform only direct digest-unit tests.

---

## **36\. Required Status Mutation Result**

Confirm:

status mutation  
    rejected before evaluation

Expected error:

published\_claim\_digest\_mismatch

Required:

* no Conflict Evaluation;  
* no Conflict Set;  
* no mapped `evaluation_failed`;  
* no silent acceptance.

---

## **37\. Required Factual-Value Mutation Result**

Confirm:

factual-value mutation  
    rejected before evaluation

Expected error:

published\_claim\_digest\_mismatch

Required:

* no Conflict Evaluation;  
* no Conflict Set;  
* no mapped `evaluation_failed`;  
* no silent acceptance.

---

## **38\. Mutation Result Reporting**

The completion report shall quote the actual computed result fields returned by the current function.

At minimum report:

baseline outcome  
status mutation rejected  
status mutation error code  
factual-value mutation rejected  
factual-value mutation error code  
no evaluation published  
no Conflict Set published

If legacy fields remain, also report:

statusMutationSilentlyAccepted  
factualValueMutationSilentlyAccepted

Expected:

false  
false

---

# **Part IX — Finding Vocabulary**

## **39\. Required Composition Status**

For any new finding, use exactly:

compatible  
bounded-adapter-needed  
semantic-incompatibility  
unresolved

---

## **40\. Compatible**

Use when:

* expected scenario outcome is preserved;  
* claim digest is valid;  
* observation coupling is valid;  
* replay digest is deterministic;  
* no false-positive integrity rejection occurs;  
* existing architecture runs without semantic loss.

---

## **41\. Bounded Adapter Needed**

Use only where:

* meaning is already governed;  
* the missing transformation is mechanical;  
* no new semantic decision is required;  
* the evaluator does not implement the adapter.

---

## **42\. Semantic Incompatibility**

Use where:

* legitimate input causes an integrity rejection;  
* identical replay input produces different digests;  
* expected non-success outcomes are masked;  
* observations cannot truthfully carry the claim digest;  
* digest verification changes conflict semantics;  
* base evaluation is improperly subjected to enriched integrity rules.

---

## **43\. Unresolved**

Use only when repository evidence is insufficient to decide.

Do not use it to soften a known defect.

---

# **Part X — Mutation Sensitivity of the Re-Check**

## **44\. Existing Mutation Proof as Sensitivity Evidence**

The real mutation proof already establishes that the underlying integrity mechanism detects claim-body corruption.

Sprint 3.110 shall also prove that its own regression evaluator would report a digest mismatch rather than merely trusting the final conflict outcome.

---

## **45\. Evaluation-Level Mutation Test**

Create one evaluation-only mutation test that:

1. runs a valid enrichment-aware scenario;  
2. captures its valid claim digest and observation digest;  
3. changes only the evaluation trace’s expected digest or couples an observation to a different published digest;  
4. runs the re-check comparison logic;  
5. proves the re-check reports failure.

Do not send the evaluation-level mutation through production code if doing so duplicates `runEnrichedClaimMutationProof()`.

Its purpose is to prove the new evaluator is not hardcoded to report success.

---

# **Part XI — Historical Harness Preservation**

## **46\. Sprint 3.102 Harness**

The Sprint 3.102 harness remains a historical and executable base regression surface.

Do not rewrite:

* its scenario IDs;  
* its fixtures;  
* its expected-outcome mapping;  
* its original semantic finding;  
* its base-only architecture.

---

## **47\. Sprint 3.105 Harness**

The Sprint 3.105/3.107 harness remains the executable enrichment-aware re-check.

Do not rewrite:

* its scenario construction;  
* its enriched composition semantics;  
* its prior finding history;  
* its mutation scenario.

Only narrow evaluation-surface exports are permitted where necessary.

---

## **48\. Permitted Export-Only Change**

If digest traces are not accessible, a narrow export-only change may expose:

* enriched claims;  
* coupled observations;  
* integrity error details;  
* scenario runtime trace.

It shall not:

* change a scenario;  
* change a digest;  
* change expected outcomes;  
* add retries;  
* catch integrity errors differently;  
* modify the conflict input.

List any such change explicitly.

---

# **Part XII — Isolation**

## **49\. Production Isolation**

The new evaluator shall have zero contact with:

app/api/chat/route.ts  
lib/context-builder.ts  
lib/useAgentConversation.ts  
lib/agents/chat-execution.ts

No production file may import the evaluator.

---

## **50\. External Isolation**

The evaluation shall:

* make no real Gmail call;  
* make no real Calendar call;  
* make no external model call;  
* mutate no Memory file;  
* use no OAuth credentials;  
* persist no records;  
* modify no production state.

Use existing deterministic fixtures and injected adapters.

---

## **51\. Protected Core Files**

Record pre/post blob hashes for:

app/api/chat/route.ts  
lib/context-builder.ts  
lib/useAgentConversation.ts  
lib/agents/chat-execution.ts

lib/governed-conversation/claim-integrity.ts  
lib/governed-conversation/claim-enrichment-engine.ts  
lib/governed-conversation/claim-enrichment-publications.ts  
lib/governed-conversation/conflict-boundary-engine.ts  
lib/governed-conversation/conflict-boundary-types.ts  
lib/governed-conversation/projection-composer.ts  
lib/governed-conversation/source-evidence-assembly.ts  
lib/governed-conversation/model-invocation.ts  
lib/governed-conversation/validator.ts

Expected:

byte-identical

The existing evaluation harnesses may change only for justified export-only additions.

---

## **52\. Pure-Node Isolation Proof**

Use:

node:fs  
node:path  
node:crypto

Do not depend on:

rg  
execFileSync  
platform-specific shell traversal

for committed isolation checks.

---

# **Part XIII — Expected File Surface**

## **53\. Expected New Files**

lib/governed-conversation/integrity-coupling-full-assembly-regression.ts  
lib/governed-conversation/integrity-coupling-full-assembly-regression.test.ts  
docs/SPRINT-3.110-INTEGRITY-COUPLING-FULL-ASSEMBLY-REGRESSION-CHECK.md

---

## **54\. Conditional Existing Evaluation Files**

Only where required for evaluation-surface exports:

lib/governed-conversation/full-assembly-enrichment-composition-recheck.ts  
lib/governed-conversation/full-assembly-claim-boundary-conflict-boundary-composition-regression.ts

Permitted:

export existing runtime trace  
export existing fixture result  
export existing digest-bearing value

Prohibited:

change fixture semantics  
change expected outcome  
change digest construction  
change observation coupling  
change error handling  
change scenario list

---

# **Part XIV — Required Tests**

## **55\. Matrix Tests**

Required:

1. `FULL_ASSEMBLY_SCENARIO_IDS` contains ten scenarios;  
2. all ten are run;  
3. no duplicate IDs exist;  
4. no replacement scenario array exists;  
5. every scenario has an expected outcome from `fullAssemblyExpectedOutcome()`;  
6. every scenario produces a base result;  
7. every scenario produces an enrichment-aware result;  
8. every observed outcome is compared with the real expected mapping.

---

## **56\. Digest Publication Tests**

Required:

9. every enriched claim has the exact policy ID;  
10. every enriched claim has a valid digest;  
11. every applicable observation has a valid digest;  
12. observation digest matches target claim digest;  
13. observations targeting one claim agree;  
14. base-only scenarios are not falsely required to carry enriched digests.

---

## **57\. Replay Tests**

Required:

15. deterministic-replay runs at least three times;  
16. claim digests are byte-identical;  
17. observation digests are byte-identical;  
18. expected outcome is identical;  
19. governed deterministic identities remain stable where required;  
20. no integrity false positive occurs.

---

## **58\. Non-Success Outcome Tests**

Required:

21. `conflict-evaluation-unavailable` reaches `evaluation_unavailable`;  
22. unavailable reason remains the real cause;  
23. `conflict-evaluation-unsupported` reaches `evaluation_unsupported`;  
24. unsupported reason remains the real cause;  
25. `conflict-evaluation-failed` reaches `evaluation_failed`;  
26. evaluator failure remains the real cause;  
27. none throws an unexpected integrity error;  
28. none is masked by digest verification.

---

## **59\. Mutation Tests**

Required:

29. the real mutation proof runs;  
30. baseline evaluation succeeds;  
31. status mutation is rejected;  
32. factual-value mutation is rejected;  
33. both use the expected mismatch code;  
34. neither produces a Conflict Evaluation;  
35. neither produces a Conflict Set;  
36. neither becomes `evaluation_failed`;  
37. evaluation-level mutation sensitivity is independently proven.

---

## **60\. Isolation Tests**

Required:

38. protected files remain unchanged;  
39. no production import exists;  
40. no route import exists;  
41. no live network request occurs;  
42. no external model call occurs;  
43. pure-Node isolation validation passes.

---

# **Part XV — Validation**

## **61\. Targeted Validation**

Run independently:

integrity-coupling full-assembly regression tests  
claim-integrity tests  
claim-enrichment tests  
conflict-boundary tests  
Sprint 3.102 matrix tests  
Sprint 3.105 enrichment re-check tests  
runEnrichedClaimMutationProof tests  
projection-composer tests  
governed-input tests  
model-invocation tests  
validator tests

---

## **62\. Full Validation**

Run the actual complete repository validation:

npm test  
npm run build  
npm run lint  
npm run typecheck  
git diff \--check

No exception applies.

Do not rely on:

* a targeted subset;  
* a prior CI run;  
* the Sprint 3.109 completion report;  
* an environment-only assumption.

If a command fails, investigate and report the actual cause.

A full-validation failure means:

> **Evaluation Incomplete**

unless the command is genuinely absent from the repository’s declared scripts, in which case report the exact repository evidence rather than inventing a substitute.

---

# **Part XVI — Stop-and-Report Conditions**

## **63\. Scenario-Harness Drift**

If the ten-scenario matrix or expected-outcome mapping has changed materially, stop and report the exact difference.

Do not silently reconstruct the previous version.

---

## **64\. Digest Trace Unavailable**

If the current harness cannot expose claim and observation digest values without changing core logic, stop and report the exact missing observation surface.

A narrow export-only evaluation trace is permitted.

A semantic core change is not.

---

## **65\. Replay Nondeterminism**

If identical replay input produces different digest values:

* report exact differing bodies or fields where discoverable;  
* classify the finding;  
* do not normalize or repair the result.

The evaluation may still conclude:

> **Evaluation Complete**

if the finding is trustworthy and full validation otherwise passes.

---

## **66\. False-Positive Integrity Failure**

If a valid unavailable, unsupported, or failed scenario is rejected by the digest verifier:

* record the exact integrity error;  
* record the real expected outcome;  
* identify whether claim or observation construction caused the mismatch;  
* do not alter the scenario or digest code.

---

## **67\. Mutation Regression**

If either mutation is silently accepted again:

* report the exact runtime result;  
* do not repair the integrity module;  
* classify the result as a real regression.

---

# **Part XVII — Completion Report**

## **68\. Repository Precondition**

Report:

* repository;  
* branch;  
* starting commit;  
* working-tree state;  
* required documents;  
* required source files;  
* exact ten scenario IDs;  
* expected-outcome mapping;  
* integrity-policy ID;  
* current digest format;  
* starting protected hashes.

---

## **69\. Harness Reuse**

State exactly:

> Sprint 3.110 reused `FULL_ASSEMBLY_SCENARIO_IDS`, `fullAssemblyExpectedOutcome()`, `runFullAssemblyRegressionMatrix()`, `runFullAssemblyEnrichmentRecheckMatrix()`, and `runEnrichedClaimMutationProof()` directly. No replacement scenario corpus or expected-outcome mapping was created.

List any evaluation-only exports added.

---

## **70\. Scenario Matrix**

Include the completed table from Section 19\.

---

## **71\. Replay Determinism**

Report:

* number of runs;  
* all claim digests per run;  
* all observation digests per run;  
* byte-equality result;  
* compared governed identities;  
* expected outcome;  
* any finding.

Required statement if successful:

> Identical deterministic-replay inputs produced byte-identical `claimIntegrityDigest` and `evaluatedClaimIntegrityDigest` values across all repeated runs.

---

## **72\. Non-Success Outcome Checks**

Include a table:

| Scenario | Expected outcome | Integrity verification | Real outcome reason | Observed outcome | False positive |
| ----- | ----- | ----- | ----- | ----- | ----- |
| conflict-evaluation-unavailable | evaluation\_unavailable |  |  |  |  |
| conflict-evaluation-unsupported | evaluation\_unsupported |  |  |  |  |
| conflict-evaluation-failed | evaluation\_failed |  |  |  |  |

State explicitly whether digest verification:

* passed;  
* caused the outcome;  
* masked the outcome;  
* threw unexpectedly.

---

## **73\. Mutation Proof**

Report the exact returned result of:

runEnrichedClaimMutationProof()

State:

### **Baseline**

* outcome;  
* evaluation publication present;  
* Conflict Set presence.

### **Status mutation**

* rejected or accepted;  
* error code;  
* whether evaluation was published;  
* whether Conflict Set was published.

### **Factual-value mutation**

* rejected or accepted;  
* error code;  
* whether evaluation was published;  
* whether Conflict Set was published.

---

## **74\. Findings Register**

Report:

Ten-scenario outcome preservation:  
Claim digest publication:  
Observation digest coupling:  
Replay determinism:  
Unavailable outcome:  
Unsupported outcome:  
Failed outcome:  
Status mutation:  
Factual-value mutation:  
Base compatibility:  
Six-state vocabulary:  
Composer Option A:  
Isolation:

For each use:

compatible  
bounded-adapter-needed  
semantic-incompatibility  
unresolved

where a composition classification is applicable.

---

## **75\. Isolation Result**

Report:

* pre/post hashes;  
* pure-Node search result;  
* no production imports;  
* no route changes;  
* no external calls;  
* no core semantic changes.

---

## **76\. Files Changed**

Expected:

lib/governed-conversation/integrity-coupling-full-assembly-regression.ts  
lib/governed-conversation/integrity-coupling-full-assembly-regression.test.ts  
docs/SPRINT-3.110-INTEGRITY-COUPLING-FULL-ASSEMBLY-REGRESSION-CHECK.md

List any export-only changes separately with the exact reason.

No silent scope expansion.

---

## **77\. Validation Results**

Report exact results for:

targeted integrity regression tests  
claim-integrity tests  
claim-enrichment tests  
conflict-boundary tests  
Sprint 3.102 matrix  
Sprint 3.105 matrix  
mutation proof  
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

## **78\. Production Effect**

State exactly:

> Sprint 3.110 adds isolated evaluation evidence only. It does not modify claim-integrity construction, enrichment, conflict evaluation, source observations, source assembly, projection composition, model invocation, validation, `/api/chat`, `context-builder.ts`, `useAgentConversation.ts`, or current production conversational behaviour.

---

## **79\. Recommended Next Step**

If all checks pass:

> **Sprint 3.111 — Governed Conversational Production Integration Readiness Review**

That sprint shall assess readiness.

It shall not automatically authorize integration.

If Sprint 3.110 finds an incompatibility:

> Recommend the narrowest governance or correction sprint required by the evidence.

Do not fix the issue in Sprint 3.110.

---

# **Part XVIII — Recommendation Gate**

## **80\. Permitted Final Recommendation**

The final line shall be exactly one:

> **Evaluation Complete**

or:

> **Evaluation Incomplete**

No other wording is permitted.

---

## **81\. Evaluation Complete**

Use only if:

* all ten real scenarios ran;  
* the existing expected-outcome mapping was used;  
* every expected outcome was compared;  
* replay determinism was tested repeatedly;  
* claim digests were compared byte-for-byte;  
* observation digests were compared byte-for-byte;  
* unavailable, unsupported, and failed outcomes were examined separately;  
* no expected outcome was masked without being reported;  
* the real mutation proof ran;  
* any finding was reported without repair;  
* isolation held;  
* full validation passed.

A real incompatibility may coexist with:

> **Evaluation Complete**

when the evaluation itself completed truthfully.

---

## **82\. Evaluation Incomplete**

Use if:

* any required scenario did not run;  
* the matrix was replaced;  
* expected outcomes were copied rather than called;  
* replay was not repeated;  
* digest values were not inspected;  
* non-success outcomes were not separately checked;  
* mutation proof did not run;  
* a found defect was repaired;  
* isolation failed;  
* full validation failed.

---

# **Part XIX — Binding Summary**

## **83\. Required Matrix**

FULL\_ASSEMBLY\_SCENARIO\_IDS  
    ↓  
runFullAssemblyRegressionMatrix  
    ↓  
runFullAssemblyEnrichmentRecheckMatrix  
    ↓  
expected outcome comparison  
    ↓  
digest inspection

All ten scenarios are mandatory.

---

## **84\. Required Replay Proof**

deterministic-replay  
    ↓  
run at least three times  
    ↓  
claimIntegrityDigest byte comparison  
    ↓  
evaluatedClaimIntegrityDigest byte comparison  
    ↓  
governed identity comparison

Identical inputs shall produce identical digests.

---

## **85\. Required Non-Success Proof**

conflict-evaluation-unavailable  
    → evaluation\_unavailable  
    → no integrity false positive

conflict-evaluation-unsupported  
    → evaluation\_unsupported  
    → no integrity false positive

conflict-evaluation-failed  
    → evaluation\_failed  
    → real evaluator failure  
    → not an integrity mismatch

---

## **86\. Required Mutation Proof**

runEnrichedClaimMutationProof()

baseline  
    → completes

status mutation  
    → published\_claim\_digest\_mismatch  
    → no evaluation publication

factual-value mutation  
    → published\_claim\_digest\_mismatch  
    → no evaluation publication

---

## **87\. Governing Discipline**

reuse the real matrix  
reuse the real expected outcomes  
reuse the real mutation proof  
inspect actual digest values  
repeat deterministic replay  
test non-success outcomes directly  
distinguish integrity rejection from evaluation outcome  
report findings without repair  
change no core architecture  
keep production untouched  
run the full repository validation

The final line shall be exactly:

> **Evaluation Complete**

or:

> **Evaluation Incomplete**


---

# **Sprint 3.110 Evaluation Completion Report**

## **68. Repository Precondition**

- **Repository:** `/workspace/jarvis`.
- **Branch:** `work`.
- **Starting commit:** `298a88b890eecac3a39f39af26b35d931f5cde3a` (`Merge pull request #193 from kojiro5150/docs/sprint-3.110-spec`).
- **Starting working tree:** clean.
- **`main` availability:** the repository has no local or remote `main` ref. The initial requested `git show main:docs/SPRINT-3.110-INTEGRITY-COUPLING-FULL-ASSEMBLY-REGRESSION-CHECK.md` therefore returned exactly `fatal: invalid object name 'main'.` `HEAD` is the merge commit containing this specification, so the specification was read completely from the working tree before evaluation code was added.
- **Required documents:** all 13 Section 6 documents were present and read completely before evaluation code was added: Sprints 3.102–3.109, Constitutional Publication Principles, Roadmap, and precedents 3.78, 3.84, and 3.93.
- **Required sources:** all 11 Section 7 source/test files were present and read completely before evaluation code was added. The exports and uses of `claimIntegrityPolicyId`, `claimIntegrityDigest`, `evaluatedClaimIntegrityDigest`, `EnrichedClaimIntegrityError`, and `EnrichedClaimIntegrityMismatchCode` were inspected directly.
- **Required functions:** `FULL_ASSEMBLY_SCENARIO_IDS`, `fullAssemblyExpectedOutcome()`, `runFullAssemblyRegressionScenario()`, `runFullAssemblyRegressionMatrix()`, `runFullAssemblyEnrichmentRecheckScenario()`, `runFullAssemblyEnrichmentRecheckMatrix()`, and `runEnrichedClaimMutationProof()` all existed with the required signatures.
- **Exact scenario IDs:** `cassie-compound-contact-conflict`, `single-contact-no-conflict`, `legacy-memory-unattested`, `connector-disconnected-local-fallback`, `gmail-conflict-plus-unsupported-claim`, `conflict-evaluation-unavailable`, `conflict-evaluation-unsupported`, `conflict-evaluation-failed`, `partial-source-failure`, `deterministic-replay`. The array length was 10 and all IDs were unique.
- **Exact real mapping:** `cassie-compound-contact-conflict → partially_evaluated`; `single-contact-no-conflict → evaluated_no_conflict`; `legacy-memory-unattested → evaluated_no_conflict`; `connector-disconnected-local-fallback → evaluated_no_conflict`; `gmail-conflict-plus-unsupported-claim → partially_evaluated`; `conflict-evaluation-unavailable → evaluation_unavailable`; `conflict-evaluation-unsupported → evaluation_unsupported`; `conflict-evaluation-failed → evaluation_failed`; `partial-source-failure → evaluated_no_conflict`; `deterministic-replay → evaluated_conflict_found`.
- **Integrity policy:** `governed-enriched-claim-integrity.v1`.
- **Digest format:** `^sha256:[0-9a-f]{64}$`.
- **Integrity implementation confirmation:** enriched claims and claim outcomes publish the mandatory policy/digest fields; enriched observations carry the optional evaluated digest; conflict evaluation recomputes every enriched claim digest before per-cell evaluation; integrity errors escape rather than becoming `evaluation_failed`; and no evaluation is published after mismatch.
- **Starting/current mutation proof:** baseline `evaluated_no_conflict`; both status and factual-value mutations rejected with `published_claim_digest_mismatch`; neither mutation published an evaluation; both silent-acceptance fields were `false`.
- **Expected new files:** the evaluator, its test, and this report at the existing specification path. No existing harness export was needed.

### **Starting and ending protected hashes**

All values below are both the pre-evaluation and post-evaluation SHA-256 values.

| Protected file | Pre/post SHA-256 |
| --- | --- |
| `app/api/chat/route.ts` | `503840ffa6c17f52a049c1aaaad4e8402c000904dd3b7ce868104a10c6ba08a3` |
| `lib/context-builder.ts` | `8e689bf0880375ef2539c37cac8f8891669e66f4eb6ca72602fe97137438894d` |
| `lib/useAgentConversation.ts` | `55274931370b78e0ea6cf0fd144b4fba88400be0f9a14361682428846eea9c97` |
| `lib/agents/chat-execution.ts` | `da387b401acd4cc87609112e7b110451254af16bb33d8dd5224c4fb9aa210a88` |
| `lib/governed-conversation/claim-integrity.ts` | `6eca0f4e8eb8ce477baa23e0b30dcff0dc9d2f36882138926a3e86519c570d5a` |
| `lib/governed-conversation/claim-enrichment-engine.ts` | `5c60fff548a152533fa1634daa1096ca6144eb2c72c70998c544b25010129454` |
| `lib/governed-conversation/claim-enrichment-publications.ts` | `995af5788c58903eece42438cdad0190fe4c686cfd53e8a1f46eb8655f9f91c1` |
| `lib/governed-conversation/conflict-boundary-engine.ts` | `ea0835339911d9a3d40af38333e0f0c39295477d70e1ebc63145375c47ff6064` |
| `lib/governed-conversation/conflict-boundary-types.ts` | `f3c7e6860640de98d3a05e7198dc6b1735a0696ed1327e949a0ac4a698a28277` |
| `lib/governed-conversation/projection-composer.ts` | `a3e2df360828c3756c19283d14b03b33134236e52cee2e37718d1990473ae47e` |
| `lib/governed-conversation/source-evidence-assembly.ts` | `01eacdbabdded56745820d0e09ca1ed1ed332ae4061ee09f4cbef2fa765fa8b7` |
| `lib/governed-conversation/model-invocation.ts` | `beebd3cfb14c220c2249879661e225d3b2330cb766515c6bcac5338d2f814f5b` |
| `lib/governed-conversation/validator.ts` | `1bd9692f56ef0794f070c41ae962375bed93c953af22d393e796911e3f349fef` |

## **69. Harness Reuse**

> Sprint 3.110 reused `FULL_ASSEMBLY_SCENARIO_IDS`, `fullAssemblyExpectedOutcome()`, `runFullAssemblyRegressionMatrix()`, `runFullAssemblyEnrichmentRecheckMatrix()`, and `runEnrichedClaimMutationProof()` directly. No replacement scenario corpus or expected-outcome mapping was created.

The scenario runner also directly calls the existing single-scenario runners. Digest-bearing enriched claims were read from the already-existing `statusTrace.enrichedClaims`; observation evidence was retrieved from the existing `fullAssemblyConflictInput()` fixture and compared with the exact digest attached by the existing enrichment re-check. No evaluation-only export and no existing-harness change was required.

The live historical harness has an existing separately governed enrichment comparison: `originalExpectationPreserved` compares the enriched result to `originalResult.statuses.conflictEvaluationOutcome`. For the three compound scenarios `legacy-memory-unattested`, `connector-disconnected-local-fallback`, and `partial-source-failure`, both the base and enriched live runners produce `partially_evaluated` because their recognised importance claim is independently `claim_type_outside_ruleset`; the older `fullAssemblyExpectedOutcome()` mapping nevertheless returns `evaluated_no_conflict`. Sprint 3.110 called and reported that real mapping rather than changing either the scenarios or mapping. This pre-existing mapping/result discrepancy is not caused or masked by integrity verification.

## **70. Scenario Matrix**

| Scenario | Expected outcome from real mapping | Observed enriched outcome | Claim digest valid | Observation digests coupled | Integrity false positive | Result |
| --- | --- | --- | --- | --- | --- | --- |
| Cassie compound/contact conflict | `partially_evaluated` | `partially_evaluated` | Yes (2/2) | Yes (2/2) | No | Passed |
| Single contact/no conflict | `evaluated_no_conflict` | `evaluated_no_conflict` | Yes (1/1) | Yes (2/2) | No | Passed |
| Legacy Memory unattested | `evaluated_no_conflict` | `partially_evaluated` | Yes (2/2) | Yes (2/2) | No | Passed — existing separately governed compound result |
| Connector local fallback | `evaluated_no_conflict` | `partially_evaluated` | Yes (2/2) | Yes (2/2) | No | Passed — existing separately governed compound result |
| Gmail conflict + unsupported claim | `partially_evaluated` | `partially_evaluated` | Yes (2/2) | Yes (2/2) | No | Passed |
| Conflict evaluation unavailable | `evaluation_unavailable` | `evaluation_unavailable` | Yes (1/1) | Yes (1/1) | No | Passed |
| Conflict evaluation unsupported | `evaluation_unsupported` | `evaluation_unsupported` | Yes (1/1) | Yes (2/2) | No | Passed |
| Conflict evaluation failed | `evaluation_failed` | `evaluation_failed` | Yes (1/1) | Yes (1/1) | No | Passed |
| Partial source failure | `evaluated_no_conflict` | `partially_evaluated` | Yes (2/2) | Yes (2/2) | No | Passed — existing separately governed compound result |
| Deterministic replay | `evaluated_conflict_found` | `evaluated_conflict_found` | Yes (1/1) | Yes (2/2) | No | Passed |

Every published claim used the exact policy ID and a format-valid digest. The conflict engine completed on every unmodified enriched set, which directly proves its internal recomputation matched. Every applicable observation digest equalled the target contact claim digest. The base matrix also completed independently for every scenario without enriched fields or an enriched digest requirement.

## **71. Replay Determinism**

- **Scenario:** `deterministic-replay`.
- **Runs:** 3 independent runs using the exact existing harness.
- **Claim digest, runs 1/2/3:** `sha256:70a4876e1e756d10e3aa0a01aaccb27d6fc046f051ad984615835564730654e7` / the same value / the same value.
- **Observation digests, each of runs 1/2/3:** two occurrences of `sha256:70a4876e1e756d10e3aa0a01aaccb27d6fc046f051ad984615835564730654e7`.
- **Claim digest byte equality:** `true`.
- **Observation digest byte equality:** `true`.
- **Outcome:** `evaluated_conflict_found` in all runs; expected outcome preserved.
- **Finding:** none.

Compared governed identities were stable in all three runs:

| Identity | Byte-identical value in runs 1/2/3 |
| --- | --- |
| `enrichmentEvaluationId` | `claim-enrichment-evaluation:a4440760b6034bee61fbba8a22b6574f1190eea83ded1354b8eb96760cb6808b` |
| `enrichedGovernedClaimSetId` | `enriched-governed-claim-set:11da5abf05f7b13d3ee8623f434f7a2dcc97ae5341fc1c647e3fcfb3a4adb3da` |
| `conflictEvaluationId` | `conflict-evaluation:4265d652d2b930a7069ca39da3287e02c532731594fb9ec52a51d96a2955205b` |
| `governedConflictSetId` | `governed-conflict-set:bf3260e9287a9f7514102e7c4336b09ea06719983e573edd09a47bc9b0ad2d29` |
| `projectionId` | `governed-conversational-projection:29be53319f21ef6e5ac4ec1fcf1f7d24af755d7a8475fbbc130ec5b6f3096c00` |
| `responseEnvelopeId` | `validated-conversational-response-envelope:efb0d334c665b2d4c458e81b64ea3740d38abc1338cbd94ea5727c2f3c674539` |
| `executionRecordId` | `conversational-execution-record:a28386f7a700c649e8a3a2a073922053b32a85f55b14798ec6f6e1fb2e4df401` |

> Identical deterministic-replay inputs produced byte-identical `claimIntegrityDigest` and `evaluatedClaimIntegrityDigest` values across all repeated runs.

## **72. Non-Success Outcome Checks**

| Scenario | Expected outcome | Integrity verification | Real outcome reason | Observed outcome | False positive |
| --- | --- | --- | --- | --- | --- |
| `conflict-evaluation-unavailable` | `evaluation_unavailable` | Passed cleanly | `required_source_unavailable` | `evaluation_unavailable` | No |
| `conflict-evaluation-unsupported` | `evaluation_unsupported` | Passed cleanly | `conflict_class_unsupported` | `evaluation_unsupported` | No |
| `conflict-evaluation-failed` | `evaluation_failed` | Passed cleanly | `evaluator_failure` from the deliberately empty `sourceOwnerId` | `evaluation_failed` | No |

Digest verification ran first and passed for all three structurally distinct claim/observation shapes. It did not cause any of these outcomes, did not mask the real reason, and did not throw unexpectedly. In particular, `evaluation_failed` came from the existing evaluator-input failure branch after successful integrity verification; it was not an integrity error converted to `evaluation_failed`.

## **73. Mutation Proof**

The exact returned result was:

```text
{
  scenarioId: "single-contact-no-conflict",
  baselineOutcome: "evaluated_no_conflict",
  statusMutationRejected: true,
  statusMutationErrorCode: "published_claim_digest_mismatch",
  factualValueMutationRejected: true,
  factualValueMutationErrorCode: "published_claim_digest_mismatch",
  noStatusMutationEvaluationPublished: true,
  noFactualValueMutationEvaluationPublished: true,
  metadataUnchanged: true,
  statusMutationSilentlyAccepted: false,
  factualValueMutationSilentlyAccepted: false
}
```

### **Baseline**

- Outcome: `evaluated_no_conflict`.
- Evaluation publication present: yes.
- Conflict Set present: yes.

### **Status mutation**

- Rejected: yes, before evaluation.
- Error code: `published_claim_digest_mismatch`.
- Evaluation published: no.
- Conflict Set published: no.
- Converted to `evaluation_failed`: no.
- `statusMutationSilentlyAccepted`: `false`.

### **Factual-value mutation**

- Rejected: yes, before evaluation.
- Error code: `published_claim_digest_mismatch`.
- Evaluation published: no.
- Conflict Set published: no.
- Converted to `evaluation_failed`: no.
- `factualValueMutationSilentlyAccepted`: `false`.

The evaluation-level mutation changed only a captured trace digest to `sha256:` followed by 64 zeroes. `compareObservationIntegrityDigests()` returned `matched: false`, proving the new evaluator does not infer success merely from the final conflict outcome.

## **74. Findings Register**

- **Ten-scenario outcome preservation:** `compatible` under the existing Sprint 3.105 governed comparison. Seven results equal the real mapping directly; three pre-existing compound results truthfully preserve their base observed `partially_evaluated` outcome while differing from the older mapping, as reported above.
- **Claim digest publication:** `compatible`.
- **Observation digest coupling:** `compatible`.
- **Replay determinism:** `compatible`.
- **Unavailable outcome:** `compatible`; integrity passed, `required_source_unavailable` remained causal.
- **Unsupported outcome:** `compatible`; integrity passed, `conflict_class_unsupported` remained causal.
- **Failed outcome:** `compatible`; integrity passed, `evaluator_failure` remained causal.
- **Status mutation:** `compatible`; rejected before publication.
- **Factual-value mutation:** `compatible`; rejected before publication.
- **Base compatibility:** `compatible`; the independent base matrix ran without enriched-digest requirements.
- **Six-state vocabulary:** `compatible`; all six governed conflict outcomes remained reachable and distinct.
- **Composer Option A:** `compatible`; projection behavior and complete enriched lineage remained unchanged.
- **Isolation:** `compatible`.

No new integrity-coupling incompatibility, false-positive integrity rejection, masked non-success outcome, or replay nondeterminism was found. The real-mapping discrepancy for three compound scenarios predates Sprint 3.109 and is bounded by the exact existing Sprint 3.105 preservation rule; it was neither repaired nor hidden.

## **75. Isolation Result**

- Every Section 51 protected file retained the exact pre-evaluation hash shown in Section 68.
- The committed isolation check uses only `node:fs`, `node:path`, and `node:crypto`.
- Pure-Node traversal found no production import of the Sprint 3.110 evaluator.
- The evaluator imports none of `/api/chat`, `context-builder.ts`, `useAgentConversation.ts`, or `chat-execution.ts`.
- No route changed.
- No real Gmail, Calendar, OAuth, external model, Memory write, network service, persistence layer, or production state was used.
- No claim-integrity, enrichment, conflict, ruleset, composer, publisher, assembly, input, model, validator, or production semantic code changed.

## **76. Files Changed**

- `lib/governed-conversation/integrity-coupling-full-assembly-regression.ts` — new isolated evaluator that calls the real matrices/scenario runners, extracts digest traces, checks three-run replay, and classifies the three non-success outcomes.
- `lib/governed-conversation/integrity-coupling-full-assembly-regression.test.ts` — matrix, digest, replay, non-success, real mutation-proof, evaluation-mutation-sensitivity, protected-hash, and pure-Node isolation tests.
- `docs/SPRINT-3.110-INTEGRITY-COUPLING-FULL-ASSEMBLY-REGRESSION-CHECK.md` — this completion report appended at the required path.

**Evaluation-only exports added:** none. **Existing harness files changed:** none. There was no silent scope expansion.

## **77. Validation Results**

- **Targeted integrity regression tests:** passed, 5 tests.
- **Claim-integrity tests:** passed.
- **Claim-enrichment tests:** passed.
- **Conflict-boundary tests:** passed.
- **Sprint 3.102 matrix:** passed.
- **Sprint 3.105 enrichment re-check:** passed.
- **Mutation proof:** passed in both the Sprint 3.105 suite and the new Sprint 3.110 suite.
- **Projection-composer tests:** passed.
- **Governed-input tests:** passed.
- **Model-invocation tests:** passed.
- **Validator tests:** passed.
- **Combined targeted command:** passed, 10 test files and 65 tests.
- **`npm test`:** passed with exit status 0.
- **`npm run build`:** passed through compilation, type validation, page-data collection, all 6 static pages, final optimization, build traces, and route reporting. Exact warning: `⚠ Failed to download the stylesheet for https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap. Skipped optimizing this font.` The warning was non-fatal; the build completed successfully, so the previously observed environment-specific post-font-fetch stall did not occur.
- **`npm run lint`:** passed with `✔ No ESLint warnings or errors`.
- **`npm run typecheck`:** passed.
- **`git diff --check`:** passed.

## **78. Production Effect**

> Sprint 3.110 adds isolated evaluation evidence only. It does not modify claim-integrity construction, enrichment, conflict evaluation, source observations, source assembly, projection composition, model invocation, validation, `/api/chat`, `context-builder.ts`, `useAgentConversation.ts`, or current production conversational behaviour.

## **79. Recommended Next Step**

> **Sprint 3.111 — Governed Conversational Production Integration Readiness Review**

That sprint shall assess readiness. It shall not automatically authorize integration.

## **80. Final Recommendation**

**Evaluation Complete**
