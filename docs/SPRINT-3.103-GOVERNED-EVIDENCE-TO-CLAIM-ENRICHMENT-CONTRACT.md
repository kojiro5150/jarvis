# **Sprint 3.103 — Governed Evidence-to-Claim Enrichment Contract**

**Status:** Governed Contract Complete
**Sprint Type:** Governance Decision / Composition Correction Contract  
**Implementation Authority:** None  
**Production Integration:** Prohibited  
**Governing Trigger:** Sprint 3.102 — Full-Assembly Conversational Composition Regression  
**Direct Structural Precedents:** Sprints 3.85 and 3.94  
**Output Path:** `docs/SPRINT-3.103-GOVERNED-EVIDENCE-TO-CLAIM-ENRICHMENT-CONTRACT.md`

---

## **1\. Recommendation**

**Decision:** Approve this governed Evidence-to-Claim Enrichment Contract.

Sprint 3.102 established a real semantic incompatibility:

assembled governed source evidence exists  
        ↓
deterministic claim recognition succeeds  
        ↓
contact\_address\_lookup is published  
        ↓
claim remains insufficient\_coverage

The claim remains insufficient because:

evaluateClaimBoundary(  
  input: BoundaryEngineInput  
): BoundaryEngineResult

has no evidence input and deliberately creates recognised contact claims before assembled governed evidence is consulted.

The existing claim engine currently evaluates:

governedEvidence \= false  
provenanceSufficient \= false  
scopeComplete \= false  
fieldCoverage \= false  
fresh \= false  
contentComplete \= false

for a recognised contact-address claim.

That behaviour is truthful at the recognition boundary.

It becomes incomplete when treated as the final evidentiary state after governed source evidence has subsequently been assembled.

This contract resolves that incompatibility by selecting:

> **Option B — A separate deterministic evidence-to-claim enrichment stage between claim recognition and conflict evaluation.**

The selected architecture preserves:

* Sprint 3.89 Option C recognition;  
* evidence-blind claim recognition;  
* no model classification;  
* immutable claim publications;  
* Composer Option A;  
* per-cell conflict evaluation;  
* restrict-don’t-adjudicate;  
* source-specific evidentiary responsibility;  
* explicit materiality;  
* fail-closed evidence correlation.

The contract authorizes no implementation.

---

## **2\. Purpose**

This contract governs one question:

> **After a claim has already been deterministically recognised, how may already-governed source evidence be consulted to produce the claim’s truthful evidentiary status?**

It does not govern:

* claim recognition;  
* natural-language parsing;  
* typed-intent recognition;  
* clarification;  
* claim-type admission;  
* source acquisition;  
* source publication;  
* conflict derivation;  
* projection composition;  
* model interpretation.

The required correction is positioned after:

Claim Boundary Recognition

and before:

Conflict Evaluation

because conflict evaluation must operate over the claim’s current governed evidentiary state.

---

## **3\. Repository Precondition**

Before completing this governance sprint:

1. Confirm the intended JARVIS repository.  
2. Confirm the current branch.  
3. Record the starting commit.  
4. Record the working-tree state.  
5. Confirm Sprint 3.102 exists and is complete.  
6. Confirm the following documents exist:

docs/SPRINT-3.85-GOVERNED-CONVERSATIONAL-IDENTITY-CORRECTION-CONTRACT.md  
docs/SPRINT-3.89-GOVERNED-CONVERSATIONAL-CLAIMS-BOUNDARY-CONTRACT.md  
docs/SPRINT-3.90-GOVERNED-CONVERSATIONAL-CONFLICTS-BOUNDARY-CONTRACT.md  
docs/SPRINT-3.94-GOVERNED-CLAIMS-AND-CONFLICTS-COMPOSITION-CORRECTION-CONTRACT.md  
docs/SPRINT-3.96-GOVERNED-GMAIL-CONVERSATIONAL-EVIDENCE-PUBLICATION-CONTRACT.md  
docs/SPRINT-3.97-GOVERNED-CALENDAR-CONVERSATIONAL-EVIDENCE-PUBLICATION-CONTRACT.md  
docs/SPRINT-3.98-GOVERNED-MEMORY-PRIORITY-CONVERSATIONAL-EVIDENCE-PUBLICATION-CONTRACT.md  
docs/SPRINT-3.99-GOVERNED-CONNECTOR-AVAILABILITY-CONVERSATIONAL-EVIDENCE-PUBLICATION-CONTRACT.md  
docs/SPRINT-3.102-FULL-ASSEMBLY-CONVERSATIONAL-COMPOSITION-REGRESSION.md  
docs/CONSTITUTIONAL-PUBLICATION-PRINCIPLES.md

7. Read all listed documents completely.  
8. Read completely:

lib/governed-conversation/claim-boundary-engine.ts  
lib/governed-conversation/claim-boundary-types.ts  
lib/governed-conversation/claim-boundary-publications.ts  
lib/governed-conversation/claim-boundary-ruleset.ts  
lib/governed-conversation/evidence-status.ts  
lib/governed-conversation/conflict-boundary-engine.ts  
lib/governed-conversation/projection-composer.ts  
lib/governed-conversation/source-evidence-assembly.ts  
lib/governed-conversation/types.ts

9. Confirm the exact current `evaluateClaimBoundary` signature.  
10. Confirm `BoundaryEngineInput` contains no assembled governed evidence.  
11. Confirm the claim engine currently creates contact claims with no source references or factual values.  
12. Confirm the source-evidence assembler produces:

communicationEvidence  
calendarEvidence  
memoryPriorityReferences  
connectorAvailability

13. Confirm the current conflict engine consumes a Governed Claim Set.  
14. Confirm the projection composer validates and aggregates but does not derive source-to-claim evidentiary relationships.  
15. Confirm no existing enrichment owner already exists.

If any of these premises is false, stop.

Return:

> **Governance Review Incomplete**

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
9. Sprints 3.96–3.99 — governed source-evidence contracts;  
10. Sprint 3.102 — evidentiary finding;  
11. current code;  
12. this contract.

This contract postdates Sprint 3.89 and resolves a composition responsibility that Sprint 3.89 did not assign.

It does not invalidate Sprint 3.89’s recognition decisions.

---

# **Part I — Finding**

## **5\. Sprint 3.102 Finding Reconfirmed**

Sprint 3.102 proved:

real Gmail acquisition  
    ↓
real Gmail publisher  
    ↓
real assembled communicationEvidence  
    ↓
real contact-address recognition  
    ↓
claim status remains insufficient\_coverage

The problem is not that Gmail evidence is unavailable.

The problem is that:

assembled evidence

and:

recognised claim

have no governed correlation stage.

The current chain is:

source assembly  
    ↓
claim recognition  
    ↓
conflict evaluation  
    ↓
projection

but recognition produces its status without receiving source assembly.

The result is permanently conservative even when sufficient evidence exists.

This is a semantic incompatibility, not a test defect.

---

## **6\. Current Claim Boundary Responsibility**

Sprint 3.89 Option C established:

1\. explicit typed intent  
2\. closed deterministic pattern recognition  
3\. deterministic clarification  
4\. fail-closed unsupported

The current claim engine performs that responsibility.

It determines:

* whether a claim exists;  
* which closed claim type applies;  
* required parameters;  
* entity identity;  
* claim materiality;  
* unsupported or clarification outcomes;  
* a pre-evidence status.

It does not currently determine whether later-assembled source evidence satisfies the recognised claim.

That separation is valid.

The missing architecture is the stage that follows it.

---

# **Part II — Architectural Options**

## **7\. Option A — Evidence-Aware Claim Boundary Engine**

Modify:

evaluateClaimBoundary(input)

so `BoundaryEngineInput` optionally includes assembled governed source evidence.

Recognition runs first.

The same engine then consults evidence and produces the final claim status.

### **Decision**

**Rejected.**

### **Reason 1 — Responsibility conflation**

The claim engine would own both:

What claim did the operator make?

and:

Does the assembled evidence satisfy it?

These are distinct constitutional responsibilities.

### **Reason 2 — Recognition purity**

Although evidence could theoretically be consulted only after recognition, the engine’s public contract would become evidence-aware.

Future implementations could accidentally allow evidence shape or availability to influence recognition.

Sprint 3.89 deliberately established recognition as deterministic and source-independent.

### **Reason 3 — Re-evaluation coupling**

A change in source evidence would require rerunning the entire claim-boundary evaluation and republishing recognition history, even when:

* operator text is unchanged;  
* matched rule is unchanged;  
* entity resolution is unchanged;  
* only evidence freshness changed.

That would conflate recognition lineage with evidentiary lineage.

### **Reason 4 — Reduced audit clarity**

One publication would contain both:

* language-boundary decisions; and  
* evidence-sufficiency decisions.

This would make it harder to show which conclusion came from which stage.

---

## **8\. Option B — Separate Evidence-to-Claim Enrichment Stage**

Insert a dedicated deterministic stage after claim recognition and before conflict evaluation:

Governed Claim Set  
    \+  
assembled governed source evidence  
    ↓
Evidence-to-Claim Enrichment  
    ↓
Enriched Governed Claim Set  
    ↓
Conflict Evaluation

### **Decision**

**Selected.**

### **Reason 1 — Clean ownership**

Claim recognition remains responsible for identifying the claim.

Enrichment becomes responsible for correlating recognised claims with admissible governed evidence.

### **Reason 2 — Independent replay**

Recognition may be replayed from:

* text;  
* typed intent;  
* entity context;  
* ruleset.

Enrichment may be replayed independently from:

* recognised claim publication;  
* evidence publications;  
* materiality ruleset;  
* reference time.

### **Reason 3 — Evidence changes do not rewrite recognition**

A later evidence refresh can create a new enrichment publication without pretending the operator asked a new question.

### **Reason 4 — Conflict evaluation receives current claim state**

Conflict evaluation can operate on claims whose evidentiary status has already been determined.

### **Reason 5 — Projection composer remains pure**

The composer continues to validate and aggregate already-governed publications.

It does not acquire derivation responsibility.

---

## **9\. Option C — Projection Composer Enrichment**

The projection composer cross-references recognised claims against:

communicationEvidence  
calendarEvidence  
memoryPriorityReferences  
connectorAvailability

and computes final claim status before producing the projection.

### **Decision**

**Rejected.**

### **Reason 1 — Direct violation of Composer Option A**

Sprint 3.90 established:

> The composer validates and aggregates. It does not derive conflicts.

Sprint 3.94 preserved that principle and permitted only one explicitly governed projection-owned aggregation:

effectiveClaimStatus

from already-canonical claim and conflict restrictions.

Source-to-claim evidence correlation is not validation or aggregation.

It is evidentiary derivation.

### **Reason 2 — Hidden publication**

The composer would produce a different claim status without a distinct enrichment evaluation or publication explaining why.

### **Reason 3 — Incorrect ordering**

Conflict evaluation currently occurs before projection.

If enrichment occurred in the composer, conflict evaluation would operate on stale pre-enrichment claim status.

### **Reason 4 — Unbounded cross-product risk**

The composer sees every source category and every claim.

Giving it correlation authority would encourage unrestricted source × claim matching without a dedicated materiality contract.

---

## **10\. Option D — Model-Assisted Evidence Selection**

Use the conversational model to choose which assembled evidence supports which recognised claim.

### **Decision**

**Rejected.**

Sprint 3.89 prohibits model-based claim classification.

The same constitutional reasoning applies to evidentiary sufficiency.

A model may later interpret governed evidence.

It shall not determine the canonical status of the claim it is interpreting.

---

## **11\. Selected Architecture**

> **Option B — Separate deterministic Evidence-to-Claim Enrichment Stage.**

The binding chain becomes:

operator text / typed intent  
    ↓
Sprint 3.89 deterministic recognition  
    ↓
Claim Boundary Evaluation  
    ↓
Base Governed Claim Set  
    ↓
assembled governed source evidence  
    ↓
Evidence-to-Claim Enrichment Evaluation  
    ↓
Enriched Governed Claim Set  
    ↓
Sprint 3.90 conflict evaluation  
    ↓
Governed Conflict Set / evaluation outcome  
    ↓
Sprint 3.94 projection composer  
    ↓
effectiveClaimStatus aggregation

---

# **Part III — Recognition Boundary Preservation**

## **12\. Recognition Remains Evidence-Blind**

`evaluateClaimBoundary` shall remain evidence-blind.

Its recognition behaviour shall not depend on:

* Gmail evidence;  
* Calendar evidence;  
* Memory Priority evidence;  
* connector availability;  
* source count;  
* source values;  
* source conflicts;  
* evidence freshness.

The four Option C stages remain unchanged.

---

## **13\. Base Claim Status**

The contact-address claim produced by recognition may continue to carry:

insufficient\_coverage

as its **base pre-enrichment status**.

That status means:

> Recognition succeeded, but the recognition stage itself has not established sufficient governed evidence.

It shall not be interpreted as the final post-evidence claim status.

---

## **14\. Unsupported Claims**

A claim published as:

unsupported

by the Claims Boundary remains unsupported through enrichment unless a future governance contract explicitly admits an evidence class and status rule for that claim type.

The enrichment stage shall not upgrade a claim whose claim type is outside the admitted enrichment ruleset.

---

# **Part IV — Enrichment Publications**

## **15\. Required Publications**

The selected architecture requires two new immutable publication classes:

1. **Evidence-to-Claim Enrichment Evaluation**  
2. **Enriched Governed Claim Set**

The exact implementation type names may vary.

Their constitutional responsibilities shall not.

---

## **16\. Evidence-to-Claim Enrichment Evaluation**

This publication records:

enrichmentRulesetId  
enrichmentEvaluationId  
baseGovernedClaimSetId  
threadId  
requestId  
exchangeId  
projection/source-assembly reference  
referenceTime  
evaluated claim IDs  
admitted evidence-category cells  
source references consulted  
source references admitted  
source references rejected  
per-claim enrichment outcome  
createdAt

It shall explain why each claim:

* remained unchanged;  
* became available;  
* remained insufficient;  
* became unavailable;  
* remained unsupported.

---

## **17\. Enriched Governed Claim Set**

The enriched set shall contain the claim publications that downstream conflict evaluation consumes.

It shall include:

enrichedGovernedClaimSetId  
baseGovernedClaimSetId  
enrichmentEvaluationId  
claimBoundaryRulesetId  
claimBoundaryEvaluationId  
threadId  
requestId  
exchangeId  
referenceTime  
enriched claims  
segment links  
createdAt

The base Claim Boundary publications remain immutable historical records.

---

# **Part V — Identity Integrity**

## **18\. Identity Question**

The contract must decide whether an enriched claim:

1. keeps the same `claimId` and mutates status; or  
2. receives a new immutable claim identity linked to the base claim.

---

## **19\. Identity Options**

### **Identity Option A — Same claim ID, updated status**

Rejected.

A claim publication’s status, source references, factual values, provenance, freshness, and bounded-completeness state are material parts of its canonical body.

Changing those values while preserving identity would cause one immutable identity to alias two distinguishable canonical objects.

That violates Identity Integrity.

### **Identity Option B — New enriched claim identity linked to base claim**

**Selected.**

---

## **20\. Binding Identity Decision**

Each enriched claim receives:

new claimId

derived from its enriched canonical body.

It also carries:

baseClaimId

referencing the recognised base claim.

The base claim is not deleted.

The base claim is not mutated.

The enriched claim represents:

> the same recognised operator claim after a specific governed evidence-enrichment evaluation.

---

## **21\. Claim Continuity**

A new identity does not mean the operator asked a different question.

Continuity is represented by:

baseClaimId  
threadId  
requestId  
exchangeId  
segmentId  
claimType  
entityId

The enrichment publication adds a new evidentiary state to that claim lineage.

---

## **22\. Claim-Set Identity**

The enriched Claim Set receives a new:

enrichedGovernedClaimSetId

It shall not reuse:

governedClaimSetId

from the base Claim Boundary output.

One immutable Claim Set identity shall not represent both:

pre-evidence claims

and:

post-evidence claims

---

## **23\. Conflict Evaluation Input**

The conflict engine shall consume:

Enriched Governed Claim Set

after enrichment is implemented.

It shall not receive both base and enriched claim sets for the same exchange as competing canonical inputs.

The base set remains referenced through enrichment lineage.

---

# **Part VI — Enrichment Outcomes**

## **24\. Closed Per-Claim Enrichment Vocabulary**

Each admitted claim receives one enrichment outcome:

enriched\_available  
retained\_insufficient\_coverage  
retained\_unavailable  
retained\_unsupported  
not\_material  
enrichment\_failed

The implementation sprint may use equivalent exact identifiers only if the contract document records them before coding.

No open-ended string is permitted.

---

## **25\. Meaning of `enriched_available`**

Use only when:

* claim type is admitted by the enrichment ruleset;  
* required claim parameters are complete;  
* an admissible governed evidence category exists;  
* the source is available;  
* evidence identity is stable;  
* provenance is sufficient;  
* required factual value is present;  
* evidence is fresh enough under the claim rule;  
* evidence scope satisfies the bounded claim;  
* no pre-enrichment source-value conflict prevents availability.

This does not preclude later conflict evaluation from restricting the effective claim status.

---

## **26\. Meaning of `retained_insufficient_coverage`**

Use when the claim is recognised and supported in principle, but assembled evidence does not satisfy the bounded completeness rule.

Examples:

* no matching communication evidence;  
* communication reference exists but required factual value is not available;  
* provenance cannot resolve;  
* evidence is too stale;  
* entity correlation is incomplete;  
* source field coverage is incomplete.

---

## **27\. Meaning of `retained_unavailable`**

Use when the evidence source required for the claim is known but unavailable.

Example:

contact\_address\_lookup  
\+  
Gmail connector unavailable  
\+  
no other admitted contact-address source

---

## **28\. Meaning of `retained_unsupported`**

Use when the claim type has no admitted enrichment rule.

For Sprint 3.103:

message\_importance

remains unsupported.

---

## **29\. Meaning of `not_material`**

Use when an evidence category exists but is not material to the claim type.

Example:

Calendar evidence

is not material to:

contact\_address\_lookup

Its existence shall not influence the claim.

---

## **30\. Meaning of `enrichment_failed`**

Use only for a deterministic enrichment-processing failure.

It shall not be used for:

* source unavailable;  
* no evidence;  
* unsupported claim;  
* no material evidence category.

A processing failure must remain distinguishable from evidence insufficiency.

---

# **Part VII — Materiality Matrix**

## **31\. Closed Materiality Principle**

The enrichment mechanism shall not evaluate every claim against every source.

It shall use a closed, versioned materiality matrix.

Unlisted claim × evidence-category combinations are:

not\_material

They do not influence status.

---

## **32\. Sprint 3.103 Materiality Matrix**

| Claim type | Communication evidence | Calendar evidence | Memory Priority evidence | Connector availability |
| ----- | ----- | ----- | ----- | ----- |
| `contact_address_lookup` | Material | Not material | Not material | Conditionally material to source availability only |
| `message_importance` | Not admitted as importance evidence | Not material | Not material | Conditionally material only to explain unavailable source, never to support importance |

---

## **33\. Contact-Address Materiality**

For:

contact\_address\_lookup

the admitted factual evidence category is:

communicationEvidence

The evidence must ultimately resolve to a canonical source observation containing the relevant address assertion.

A mere communication reference without an address-bearing canonical observation is insufficient.

---

## **34\. Connector Availability Materiality**

Connector availability may affect:

available  
vs  
unavailable

for the evidence source.

It may not supply the factual address.

For example:

Gmail connector available

does not prove Cassie’s address.

It only confirms whether the governed Gmail source could be consulted at the relevant observation time.

---

## **35\. Calendar Evidence**

Calendar evidence is not material to either currently admitted communication claim.

The presence of Cassie as an attendee, title string, or calendar description shall not be used to establish her contact address under Sprint 3.103.

Such a future rule would require separate governance and a Calendar disclosure contract permitting attendee evidence.

Sprint 3.97 currently does not publish attendees.

---

## **36\. Memory Priority Evidence**

Memory Priority evidence is not material to:

contact\_address\_lookup  
message\_importance

A priority mentioning Cassie does not establish an address.

An operator priority does not establish message importance.

---

## **37\. Message Importance**

No source contract in Sprints 3.96–3.99 publishes canonical evidence of message importance.

Specifically:

* Gmail unread state is not importance;  
* Gmail provider importance labels are excluded;  
* `needsReply` is excluded;  
* source labels are excluded;  
* heuristic ordering is excluded;  
* Calendar events are not importance evidence;  
* Memory priorities do not make a message important;  
* connector availability does not establish importance.

Therefore:

message\_importance  
    → unsupported

remains binding.

---

# **Part VIII — Evidence Correlation**

## **38\. Correlation Responsibility**

The enrichment stage owns deterministic correlation between:

recognised claim parameters

and:

admissible governed source evidence

It shall not own semantic recognition.

---

## **39\. Contact-Address Correlation Key**

For a contact-address claim, the correlation key is:

resolved claim entityId  
\+  
admissible source-owned identity assertion

The enrichment stage shall not match solely on:

* fuzzy display name;  
* first name;  
* email local part;  
* message subject;  
* model inference.

If only a person name exists without resolved entity identity, the base claim should already have entered clarification or failed closed under Sprint 3.89.

---

## **40\. Evidence Reference Resolution**

`GovernedCommunicationEvidenceInput` is a bounded reference publication.

It may not itself contain the complete factual address value.

Therefore enrichment may use a deterministic evidence-resolution port whose only responsibility is:

governed evidence reference  
    ↓
corresponding immutable canonical source observation

This port shall not:

* search arbitrary sources;  
* use a model;  
* infer identity;  
* create evidence;  
* choose between conflicting values;  
* broaden disclosure policy.

It resolves references already admitted by the source publisher.

---

## **41\. Canonical Evidence Requirement**

A contact address may become available only where the resolved canonical observation provides:

* a source-owned address value;  
* stable source identity;  
* provenance;  
* observation time;  
* relationship to the resolved person/entity;  
* policy-authorised disclosure;  
* sufficient field coverage.

A source reference alone is not a factual value.

---

## **42\. No Legacy Correlation**

The enrichment stage shall not consult:

* legacy `gmailThreads`;  
* raw `OperationalState`;  
* prompt text;  
* `EmailMessage`;  
* local/mock Gmail records;  
* source labels;  
* heuristic ordering.

Only governed evidence publications and their governed canonical references are admissible.

---

# **Part IX — Cassie Decision**

## **43\. Cassie Input**

Operator question:

“What’s Cassie’s email? Anything important?”

Sprint 3.89 recognises:

Claim 1:  
contact\_address\_lookup

Claim 2:  
message\_importance

---

## **44\. Base Claims**

The Claim Boundary produces:

### **Contact claim**

claimType \= contact\_address\_lookup  
base status \= insufficient\_coverage  
ownership \= deterministic\_status

### **Importance claim**

claimType \= message\_importance  
status \= unsupported  
ownership \= unsupported

These base publications remain unchanged.

---

## **45\. Cassie Contact Enrichment**

Assume assembled governed Gmail evidence truthfully establishes one address for the resolved Cassie entity, with:

* canonical source identity;  
* sufficient provenance;  
* available source;  
* truthful retrieval time;  
* permitted disclosure policy;  
* no contradictory admissible value at enrichment time.

The enrichment result shall be:

outcome \= enriched\_available

The enriched contact claim shall have:

status \= available  
ownership \= deterministic\_status  
sourceReferences \= admitted canonical Gmail source reference(s)  
factualValues \= canonical Cassie address value(s)  
boundedComplete \= true for the bounded contact-address claim  
baseClaimId \= original contact claim ID  
claimId \= new enriched claim identity

---

## **46\. Cassie Conflict Condition**

If two admissible source observations provide different Cassie address values:

1. enrichment may establish that address evidence is present;  
2. it shall preserve all admissible source references and values;  
3. conflict evaluation shall detect the contradiction;  
4. projection-owned `effectiveClaimStatus` shall apply the conflict restriction;  
5. no source owner shall be selected;  
6. the model shall not choose one value.

The enrichment stage shall not adjudicate the disagreement.

---

## **47\. Cassie Importance Result**

The importance claim remains:

unsupported

It receives no enriched claim upgrade.

The presence of:

* Gmail communication evidence;  
* unread state;  
* labels;  
* connector availability;  
* Cassie’s identity;  
* multiple messages

does not change that result.

---

## **48\. Cassie Final Chain**

Cassie question  
    ↓
base contact claim: insufficient\_coverage  
base importance claim: unsupported  
    ↓
Gmail evidence enrichment  
    ↓
enriched contact claim: available  
enriched importance claim: unsupported  
    ↓
conflict evaluation  
    ├── no contradiction  
    │      → evaluated\_no\_conflict  
    │      → effective contact status available  
    │  
    └── contradiction  
           → evaluated\_conflict\_found  
           → effective contact status restricted  
    ↓
model interpretation

---

# **Part X — Evidence-Status Computation**

## **49\. Existing Status Vocabulary**

The enrichment stage shall use the existing closed evidence-status vocabulary:

available  
insufficient\_coverage  
unavailable  
unsupported

It shall not introduce a fifth canonical claim status.

Its evaluation outcomes explain how the canonical status was reached.

---

## **50\. Deterministic Status Inputs**

For an admitted claim, enrichment shall compute status from explicit inputs equivalent to:

supported  
sourceAvailable  
governedEvidence  
identitySufficient  
provenanceSufficient  
scopeComplete  
fieldCoverage  
fresh  
conflictFree  
contentComplete

The existing `computeEvidenceStatus` function remains authoritative where its semantics fit the enrichment calculation.

---

## **51\. Pre-Conflict `conflictFree`**

The enrichment stage shall not claim final global conflict freedom.

Before conflict evaluation:

conflictFree

means only:

> No contradiction is already structurally evident within the exact evidence cell being assessed by enrichment.

The dedicated conflict engine remains the canonical conflict owner.

If enrichment sees multiple distinct values, it shall preserve them and avoid adjudication.

---

## **52\. Monotonicity**

Enrichment may:

* upgrade `insufficient_coverage` to `available`;  
* retain `insufficient_coverage`;  
* produce `unavailable` where the required source is unavailable;  
* retain `unsupported`.

It shall not:

* upgrade `unsupported` to `available` without a future contract;  
* upgrade unavailable source evidence;  
* discard source conflicts;  
* remove provenance requirements;  
* substitute compatibility data.

---

# **Part XI — Conflict Compatibility**

## **53\. Sprint 3.90 Compatibility**

Sprint 3.90 remains binding.

The dedicated conflict engine remains the sole conflict derivation owner.

Enrichment does not derive canonical conflicts.

It may preserve multiple source values and references for later conflict evaluation.

---

## **54\. Sprint 3.94/3.95 Compatibility**

Sprint 3.94/3.95 established per-cell evaluation across the complete claim set.

That remains unchanged.

The conflict engine shall evaluate:

each enriched eligible claimId  
×  
each admitted conflict class

An unsupported importance claim does not invalidate the enriched Claim Set.

---

## **55\. Conflict Identity Linkage**

Conflicts shall reference enriched claim IDs.

Where audit trace requires recognition lineage, the enriched claim links back to:

baseClaimId

The conflict record shall not ambiguously reference both base and enriched IDs as if they were the same immutable object.

---

# **Part XII — Composer Compatibility**

## **56\. Composer Option A**

Sprint 3.90 Composer Option A remains fully binding:

> The projection composer validates and aggregates. It does not derive claims, evidence relationships, or conflicts.

Sprint 3.103 does not reopen it.

---

## **57\. Projection-Owned Aggregation**

Sprint 3.94’s single projection-owned:

effectiveClaimStatus

aggregation remains valid.

It aggregates:

enriched canonical claim status  
\+  
canonical conflict restriction

It does not perform evidence enrichment.

---

## **58\. Required Projection Lineage**

A future implementation shall preserve into the projection:

claimBoundaryRulesetId  
claimBoundaryEvaluationId  
baseGovernedClaimSetId  
enrichmentRulesetId  
enrichmentEvaluationId  
enrichedGovernedClaimSetId  
conflictEvaluationRulesetId  
conflictEvaluationId  
governedConflictSetId where applicable  
threadId  
requestId  
exchangeId

No stage lineage may disappear.

---

# **Part XIII — Source Contract Compatibility**

## **59\. Sprint 3.96 — Gmail**

Sprint 3.96 remains binding.

Enrichment may consume the governed Gmail conversational evidence reference and resolve its authorised canonical observation.

It shall not:

* reacquire Gmail;  
* reparse recipients;  
* invent provenance;  
* add a digest;  
* infer importance;  
* expose message bodies;  
* bypass disclosure policy.

---

## **60\. Sprint 3.97 — Calendar**

Sprint 3.97 remains binding.

Calendar evidence is not material to the two currently admitted communication claims.

Sprint 3.103 creates no Calendar-to-claim enrichment rule.

---

## **61\. Sprint 3.98 — Memory Priority**

Sprint 3.98 remains binding.

Unattested legacy priorities remain unpublished.

Published operator priorities do not become evidence of message importance.

Sprint 3.103 creates no Memory Priority enrichment rule for the two current claim types.

---

## **62\. Sprint 3.99 — Connector Availability**

Connector Availability may provide source-availability context.

It does not provide factual contact values.

It does not create importance evidence.

---

# **Part XIV — No-Reopening Register**

## **63\. Sprint 3.89**

**Not reopened.**

The four-stage Option C recognition mechanism remains unchanged.

The claim engine remains evidence-blind.

---

## **64\. Sprint 3.90**

**Not reopened.**

The conflict engine remains dedicated.

The composer remains validate/aggregate-only.

---

## **65\. Sprint 3.94/3.95**

**Not reopened.**

Per-cell conflict evaluation over complete claim sets remains unchanged.

The conflict engine will consume the enriched Claim Set rather than the base Claim Set once implementation is authorised.

This changes its upstream publication, not its per-cell evaluation semantics.

---

## **66\. Source Contracts**

**Not reopened.**

The enrichment stage consumes source publications under their existing identities and policies.

It does not change what they publish.

---

# **Part XV — Responsibility Audit**

## **67\. Publication Responsibility Audit**

| Question | Binding answer |
| ----- | ----- |
| Does claim recognition remain evidence-blind? | Yes |
| Does the claim engine gain source-acquisition responsibility? | No |
| Does enrichment occur after recognition? | Yes |
| Does enrichment occur before conflict evaluation? | Yes |
| Does the composer perform enrichment? | No |
| Does a model determine canonical claim status? | No |
| Is enrichment deterministic? | Yes |
| Does enrichment use a closed materiality matrix? | Yes |
| Is communication evidence material to contact lookup? | Yes |
| Is Calendar evidence material to contact lookup under this contract? | No |
| Is Memory Priority evidence material to current communication claims? | No |
| Does connector availability supply factual values? | No |
| Does importance gain an admitted evidence source? | No |
| Does importance remain unsupported? | Yes |
| Is a new enrichment evaluation publication required? | Yes |
| Is a new enriched Claim Set publication required? | Yes |
| Does an enriched claim receive a new identity? | Yes |
| Does the base claim remain immutable? | Yes |
| Does conflict evaluation consume enriched claims? | Yes |
| Does the composer remain validate/aggregate-only? | Yes |
| Does projection retain enrichment lineage? | Yes |
| Is source adjudication prohibited? | Yes |
| Does this contract authorize implementation? | No |

**Decision:** Publication Responsibility Audit passes.

---

# **Part XVI — Prohibited Hedge Language**

## **68\. Prohibited Terms**

The completed contract and future implementation specification shall not use unresolved language such as:

could  
might  
perhaps  
potentially  
ideally  
where appropriate  
as needed  
if useful  
reuse where practical  
implementation may determine  
probably  
likely  
some evidence  
relevant evidence  
appropriate correlation  
TBD

for decisions governed here.

---

## **69\. Required Language**

Use:

shall  
shall not  
must  
must not  
is  
is not  
Decision  
Selected  
Rejected  
Required  
Prohibited

In particular:

* recognition shall remain evidence-blind;  
* enrichment shall be separate;  
* base publications shall remain immutable;  
* enriched claims shall receive new identities;  
* message importance shall remain unsupported;  
* the composer shall not derive enrichment.

---

# **Part XVII — Explicit Non-Decisions**

## **70\. Out of Scope**

Sprint 3.103 does not decide:

* implementation file names;  
* database persistence;  
* production `/api/chat` wiring;  
* user-interface changes;  
* additional claim types;  
* Calendar attendee evidence;  
* Memory-derived message significance;  
* message-body evidence;  
* arbitrary source search;  
* fuzzy entity resolution;  
* source ranking;  
* source adjudication;  
* conflict resolution;  
* promotion.

---

# **Part XVIII — No-Implementation Statement**

## **71\. No Implementation Authorised**

> **Sprint 3.103 authorizes no code change, type change, engine change, composer change, source-publisher change, integration, or `/api/chat` modification.**

A future correction implementation sprint shall execute this contract.

The expected next sprint is:

> **Sprint 3.104 — Isolated Governed Evidence-to-Claim Enrichment Implementation**

---

# **Part XIX — Future Implementation Requirements**

## **72\. Future Modules**

A future implementation is expected to introduce isolated modules equivalent to:

claim-enrichment-types.ts  
claim-enrichment-ruleset.ts  
claim-enrichment-engine.ts  
claim-enrichment-publications.ts  
claim-enrichment-fixtures.ts

The exact names are implementation choices.

The responsibility split is not.

---

## **73\. Required Future Inputs**

The future enrichment engine shall receive:

Base Governed Claim Set  
assembled governed evidence collections  
source-evidence resolver port  
enrichment ruleset  
reference time  
createdAt  
lineage identities

It shall not receive raw operator text for recognition purposes.

It may preserve text-independent claim parameters already published by the Claim Boundary.

---

## **74\. Required Future Outputs**

The future engine shall return:

Evidence-to-Claim Enrichment Evaluation  
Enriched Governed Claim Set

or a fail-closed evaluation outcome.

It shall not mutate the base Claim Set.

---

## **75\. Required Future Cassie Test**

The central implementation proof shall run:

“What’s Cassie’s email? Anything important?”

through:

real claim boundary  
    ↓
real base Claim Set  
    ↓
real assembled Gmail evidence  
    ↓
real enrichment engine

Required result:

contact\_address\_lookup  
    → available

message\_importance  
    → unsupported

before conflict restrictions.

---

## **76\. Required Future Conflict Test**

With two contradictory Cassie address values:

* enrichment preserves both;  
* enrichment selects neither;  
* conflict engine produces the contradiction;  
* effective status is restricted;  
* model cannot adjudicate.

---

## **77\. Required Future Identity Tests**

Prove:

* base claim ID remains unchanged;  
* enriched claim ID differs;  
* enriched claim references base claim ID;  
* base and enriched Claim Set IDs differ;  
* all thread/request/exchange lineage matches;  
* no identity aliases;  
* replay is deterministic.

---

## **78\. Required Future Materiality Tests**

Prove:

* communication evidence may affect contact lookup;  
* connector availability may affect source availability only;  
* Calendar evidence does not affect contact lookup;  
* Memory Priority evidence does not affect contact lookup;  
* no source category upgrades message importance;  
* unlisted claim × source cells are `not_material`.

---

# **Part XX — Validation**

## **79\. Full Validation**

Although this sprint changes documentation only, run:

npm test  
npm run build  
npm run lint  
npm run typecheck  
git diff \--check

No exception applies.

---

## **80\. Repository Searches**

Confirm:

1. no existing claim-enrichment engine exists;  
2. `evaluateClaimBoundary` remains evidence-blind;  
3. the projection composer has no source-to-claim correlation logic;  
4. conflict evaluation consumes the current Claim Set;  
5. assembled evidence is not currently passed into claim evaluation;  
6. no source contract publishes message-importance evidence;  
7. no model currently owns canonical claim-status enrichment;  
8. only this document changes.

If repository evidence contradicts the selected architecture, stop.

Return:

> **Governance Review Incomplete**

---

# **Part XXI — Completion Report**

## **81\. Repository Precondition**

* **Repository:** `/workspace/jarvis`, the intended JARVIS repository.
* **Branch:** `work`.
* **Starting commit:** `10c0cdf804cb8be4cd9bbcc5be8835c0ee6880e2` (`Merge pull request #179 from kojiro5150/docs/sprint-3.103-spec`).
* **Starting working-tree state:** clean.
* **Required artefact presence:** Sprint 3.102 is present and complete. Every document and source file required by Section 3 is present and was read completely.
* **Source-file inspection:** `evaluateClaimBoundary(input: BoundaryEngineInput): BoundaryEngineResult` is the exact current signature. `BoundaryEngineInput` contains only `text`, `typedIntent`, `typedIntentSource`, `threadId`, `requestId`, `exchangeId`, `referenceTime`, `createdAt`, `entities`, `priorEvaluationId`, `clarificationAttempt`, and `compatibilityContext`; it contains no assembled governed evidence. The recognised contact claim has empty `sourceReferences` and `factualValues`, and its `computeEvidenceStatus` call fixes `governedEvidence`, `provenanceSufficient`, `scopeComplete`, `fieldCoverage`, `fresh`, and `contentComplete` to `false`.
* **Assembly and downstream inspection:** `assembleGovernedSourceEvidence` produces `communicationEvidence`, `calendarEvidence`, `memoryPriorityReferences`, and `connectorAvailability`. The conflict engine consumes a Governed Claim Set. The projection composer validates publication coherence, aggregates canonical conflict restrictions into `effectiveClaimStatuses`, and carries evidence collections without deriving evidence-to-claim relationships.
* **Required repository searches:** repository-wide searches found no existing claim-enrichment engine or other enrichment owner, no assembled-evidence argument at any `evaluateClaimBoundary` call, no projection-composer source-to-claim derivation, no source contract publishing message-importance evidence, and no model owner of canonical claim-status enrichment. The premises of this contract are confirmed.

---

## **82\. Sprint 3.102 Finding Reconfirmed**

> The recognised contact-address claim cannot become available because the current Claim Boundary has no assembled-evidence input and no separate enrichment stage exists.

---

## **83\. Options Decision**

* **Option A — Rejected.** Making the Claim Boundary evidence-aware would conflate recognition and evidence sufficiency, weaken evidence-blind recognition, couple evidence refreshes to recognition replay, and obscure publication responsibility.
* **Option B — Selected.** A separate deterministic stage gives evidence correlation one bounded owner, permits independent recognition and enrichment replay, preserves immutable recognition history, supplies current evidentiary state to conflict evaluation, and leaves the composer pure.
* **Option C — Rejected.** Composer enrichment would turn validation and aggregation into hidden evidentiary derivation, occur after conflict evaluation, and create an unbounded claim-by-source correlation responsibility.
* **Option D — Rejected.** Model-assisted evidence selection would make a probabilistic interpreter the owner of canonical claim sufficiency and violate the deterministic, evidence-governed boundary.

---

## **84\. Recognition Compatibility**

> Sprint 3.89 Option C remains unchanged. Recognition stays evidence-blind and no model classification is introduced.

---

## **85\. Composer Compatibility**

> Sprint 3.90 Composer Option A remains unchanged. The projection composer does not perform evidence-to-claim enrichment.

---

## **86\. Conflict Compatibility**

> Sprint 3.94/3.95 per-cell conflict evaluation remains unchanged and will consume the enriched Claim Set.

---

## **87\. Identity Decision**

> An enriched claim receives a new immutable claim identity linked to its base claim. The base claim and base Claim Set remain unchanged.

The enriched Claim Set receives its own new `enrichedGovernedClaimSetId`; it shall not reuse the base `governedClaimSetId`.

---

## **88\. Cassie Decision**

contact\_address\_lookup  
    → available when sufficient governed Gmail evidence exists

message\_importance  
    → unsupported

**Conflict caveat:** contradictory admissible contact-address values are all preserved by enrichment. Conflict evaluation detects and restricts the contradiction; neither enrichment nor the model selects a source.

---

## **89\. Materiality Matrix**

| Claim type | Communication evidence | Calendar evidence | Memory Priority evidence | Connector availability |
| ----- | ----- | ----- | ----- | ----- |
| `contact_address_lookup` | Material | Not material | Not material | Conditionally material to source availability only |
| `message_importance` | Not admitted as importance evidence | Not material | Not material | Conditionally material only to explain unavailable source, never to support importance |

Every unlisted claim × evidence-category combination is `not_material`.

---

## **90\. Publication Lineage**

The required immutable lineage is:

base `governedClaimSetId`
    ↓
`enrichmentRulesetId`
    ↓
`enrichmentEvaluationId`
    ↓
new `enrichedGovernedClaimSetId`
    ↓
new enriched `claimId`
    ↓
`baseClaimId`

The base claim and base Governed Claim Set remain immutable, and thread/request/exchange lineage remains continuous.

---

## **91\. Publication Responsibility Audit**

| Question | Binding answer |
| ----- | ----- |
| Does claim recognition remain evidence-blind? | Yes |
| Does the claim engine gain source-acquisition responsibility? | No |
| Does enrichment occur after recognition? | Yes |
| Does enrichment occur before conflict evaluation? | Yes |
| Does the composer perform enrichment? | No |
| Does a model determine canonical claim status? | No |
| Is enrichment deterministic? | Yes |
| Does enrichment use a closed materiality matrix? | Yes |
| Is communication evidence material to contact lookup? | Yes |
| Is Calendar evidence material to contact lookup under this contract? | No |
| Is Memory Priority evidence material to current communication claims? | No |
| Does connector availability supply factual values? | No |
| Does importance gain an admitted evidence source? | No |
| Does importance remain unsupported? | Yes |
| Is a new enrichment evaluation publication required? | Yes |
| Is a new enriched Claim Set publication required? | Yes |
| Does an enriched claim receive a new identity? | Yes |
| Does the base claim remain immutable? | Yes |
| Does conflict evaluation consume enriched claims? | Yes |
| Does the composer remain validate/aggregate-only? | Yes |
| Does projection retain enrichment lineage? | Yes |
| Is source adjudication prohibited? | Yes |
| Does this contract authorize implementation? | No |

**Decision:** Publication Responsibility Audit passes.

---

## **92\. No-Implementation Statement**

> Sprint 3.103 authorizes no implementation or production integration.

---

## **93\. Validation**

| Command | Result |
| ----- | ----- |
| `npm test` | Passed: 155 test files; 743 tests passed and 1 skipped. |
| `npm run build` | Passed: optimized production build, type/lint validation, six static pages, and build traces completed; Google Fonts stylesheet optimization was skipped after its download failed. |
| `npm run lint` | Passed: no ESLint warnings or errors. |
| `npm run typecheck` | Passed: `tsc --noEmit` exited successfully. |
| `git diff --check` | Passed: no whitespace errors. |

---

## **94\. Files Changed**

Only:

`docs/SPRINT-3.103-GOVERNED-EVIDENCE-TO-CLAIM-ENRICHMENT-CONTRACT.md`

No code, test, fixture, route, type, engine, composer, publisher, integration, or other documentation file changed.

---

## **95\. Next Step**

> **Sprint 3.104 — Isolated Governed Evidence-to-Claim Enrichment Implementation**

---

# **Part XXII — Recommendation Gate**

## **96\. Permitted Final Recommendation**

> **Governed Contract Complete**
