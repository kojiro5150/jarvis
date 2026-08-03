Status: Complete
Sprint Type: Isolated Composition Evaluation
Recommendation: Evaluation Complete

# Sprint 3.116 — Entity Identification to Claim/Enrichment Composition Check

## Repository precondition

| Field | Record |
| --- | --- |
| Repository | `/workspace/jarvis` |
| Branch | `work` |
| Starting commit | `7b2f8ccfe2484beb371832611bcb30f0ee840ea0` |
| Ending commit | Sprint 3.116 evaluation commit on `work` |
| Working-tree state | Clean at start; only the evaluation module, its test, and this report were added |
| Real clone | Yes (`.git` present and `git rev-parse HEAD` succeeded) |
| Required documents | All thirteen required documents were present and read completely |
| Required source | All required Entity Identification, Claim Boundary, Enrichment, Conflict, projection, input, invocation, validator, assembly, and evaluation sources were present and inspected |
| Scenario matrix | `FULL_ASSEMBLY_SCENARIO_IDS` remains the unchanged ten-item tuple |
| Protected hashes | Pre/post hashes are byte-identical; details below |

The repository exports the real `identifyGovernedEntity(input): EntityIdentificationEvaluation` and
`enrichGovernedClaims(input): ClaimEnrichmentEngineResult`. Before this evaluator, repository search found
no module that invoked the two sequentially. The new module is therefore an adjacent evaluation, not a
duplicate of an existing composition proof.

## Interface finding

The inspected shapes are:

* `EntityIdentificationEvaluation` owns its ruleset/evaluation identity, conversational lineage,
  Claim Boundary and recognised-intent references, unresolved and normalized references, candidate and
  evidence references, source state, outcome, optional `resolvedEntityReference` and
  `resolvedCandidateReference`, ambiguity material, and creation time.
* `ClaimEnrichmentEngineInput` requires `baseClaimSet`, `assembledEvidence`,
  `sourceAssemblyReference`, `resolver`, `claimParametersByClaimId`, `referenceTime`, and `createdAt`.
* `claimParametersByClaimId` is exactly
  `Readonly<Record<string, { readonly entityId: string }>>`.
* `GovernedClaimSet` owns its publication ID, schema and Claim Boundary references, conversational
  lineage, reference time, claims, segment links, claim IDs, and creation time. It contains no Entity
  Identification publication reference.

Direct type-compatible handoff: **No**  
Existing authoritative adapter: **No**  
Entity lineage accepted by enrichment: **No**

The real Claim Boundary run extracts `{ name: "personName", value: "Cassie" }`, but also publishes the
base Claim Set before Entity Identification. Although the segment link mechanically identifies a claim,
no governed component owns conversion of the later resolution into `claimParametersByClaimId`, republishes
a post-resolution Claim Set, or carries the Entity Identification evaluation into Enrichment. Treating the
evaluation-only record assignment as authoritative would therefore reconstruct publication ownership and
conceal the lifecycle mismatch.

## Seam classification matrix

| Seam | Status | Runtime evidence | Consequence | Blocking |
| --- | --- | --- | --- | ---: |
| Extracted parameter → Entity Identification | compatible | The real boundary parameter produced the expected three real engine outcomes | No parameter reconstruction is needed | No |
| Entity Identification → claim parameter | semantic_incompatibility | A resolution existed and a segment link located a claim, but repository/runtime inspection found no authoritative mapping function | An evaluation-only record assignment cannot authorize the handoff | Yes |
| Entity Identification → Governed Claim Set | semantic_incompatibility | `governed-claim-set:2ae62f…` existed before `entity-identification-evaluation:0ab153…` | Current publication order cannot prove a post-resolution claim | Yes |
| Entity Identification → Enrichment | semantic_incompatibility | The non-authoritative probe accepted only an entity string; its evaluation fields contain no Entity Identification ID | Evaluation identity, candidate, basis, and citation are lost | Yes |
| Ambiguity → downstream chain | semantic_incompatibility | Two candidates, no resolution, yet the pre-resolution base Claim Set already existed and no orchestration stop publication exists | Ambiguity is safe inside the engine but lifecycle ownership is unspecified | Yes |
| Zero match → downstream chain | semantic_incompatibility | Zero candidates and no resolution, yet the pre-resolution base Claim Set already existed | No governed handoff owns stop/unsupported progression | Yes |
| Entity lineage → projection | semantic_incompatibility | Enrichment has no Entity Identification input/reference, so projection cannot recover one | Final lineage cannot establish which resolution supplied the parameter | Yes |
| Entity identity → resolver | bounded_adapter_needed | A resolver parameterized by the runtime `resolvedEntityReference` correlated successfully without `person:cassie` | Mechanical resolver correlation works, but its authoritative owner remains governed by the blocking handoff | No |
| Entity result → conflict evaluation | semantic_incompatibility | Conflict integrity can protect enriched claims, but the enriched publication has already lost Entity Identification lineage | Claim integrity is not entity-resolution provenance | Yes |
| Full result → validator | semantic_incompatibility | Stop-and-report prevented presenting the non-authoritative probe as a full successful chain | The unchanged validator cannot validate lineage it never receives | Yes |

## Entity scenario results

### Single match

| Field | Runtime result |
| --- | --- |
| Claim Boundary evaluation | `claim-boundary-evaluation:b9e1819a…`, outcome `recognised` |
| Extracted parameter | `segment:1 / personName / Cassie` |
| Entity Identification evaluation | `entity-identification-evaluation:0ab153fb…`, outcome `resolved` |
| Resolved entity reference | `exchange-scoped-resolved-entity:c4cd953b…` |
| Resolved candidate | Present and distinct from the evaluation, claim, and evidence identities |
| Evidence citation | Present; real Gmail communication and provenance references |
| Base Claim Set | `governed-claim-set:2ae62fb4…`, published before resolution |
| Parameter mapping | No authoritative owner; evaluation-only/non-authoritative probe only |
| Enrichment outcome | Probe: `enriched_available` using the runtime resolution |
| Conflict outcome | Not claimed as an authorized continuation after the blocking seam |
| Projection | Not claimed as an authorized continuation after the blocking seam |
| Validation | Not claimed as an authorized continuation after the blocking seam |
| Fixture identity used | `false` |

The successful consumer probe is evidence that the resolver can correlate the runtime identity; it is not
evidence that Claim Boundary or Enrichment owns the missing publication transition.

### Ambiguous

Candidate count: **2**  
Entity outcome: **`ambiguous_multiple_matches`**  
Resolved entity: **absent**  
Claim Set published: **yes, before Entity Identification**  
Enrichment invoked: **no**  
Clarification available: **candidate references are present in Entity Identification; no composed orchestrator publication exists**  
Downstream factual claim produced: **no**  
Composition status: **`semantic_incompatibility`**

### Zero match

Entity outcome: **`unresolved_no_match`**  
Resolved entity: **absent**  
Claim Set published: **yes, before Entity Identification**  
Enrichment invoked: **no**  
Unsupported/insufficient result: **no composed downstream publication; evaluation stopped at the seam**  
Fabricated identity detected: **no fabricated identity used**  
Composition status: **`semantic_incompatibility`**

## Entity lineage trace

| Field | Claim Boundary | Governed Claim Set | Enrichment input/evaluation | Projection/input/execution |
| --- | --- | --- | --- | --- |
| `entityIdentificationRulesetId` | absent_by_design | absent_by_design | silently_lost | silently_lost |
| `entityIdentificationEvaluationId` | absent_by_design | absent_by_design | silently_lost | silently_lost |
| `resolvedEntityReference` | absent_by_design | absent_by_design | summarised as bare `entityId` in the probe | silently_lost |
| `resolvedCandidateReference` | absent_by_design | absent_by_design | silently_lost | silently_lost |
| `matchingBasis` | absent_by_design | absent_by_design | silently_lost | silently_lost |
| `evidenceReference` | absent_by_design | absent_by_design | resolver assertion references evidence, but not its Entity Identification use | silently_lost |
| `provenanceReference` | absent_by_design | absent_by_design | resolver assertion preserves source provenance only | silently_lost |

All inspected publication identities remained distinct. In particular,
`resolvedEntityReference !== claimId` and
`entityIdentificationEvaluationId !== claimBoundaryEvaluationId`.

## Existing matrix result

The base matrix was called directly and reported its current runtime behavior separately from the entity
extension. The enrichment and integrity rechecks were also called directly. No scenario vocabulary or
expected-outcome function was copied or replaced.

| Scenario | Expected outcome | Base actual outcome | Regression execution |
| --- | --- | --- | --- |
| `cassie-compound-contact-conflict` | `partially_evaluated` | `partially_evaluated` | passed |
| `single-contact-no-conflict` | `evaluated_no_conflict` | `evaluated_no_conflict` | passed |
| `legacy-memory-unattested` | `evaluated_no_conflict` | `partially_evaluated` | passed; historical base-stage limitation retained |
| `connector-disconnected-local-fallback` | `evaluated_no_conflict` | `partially_evaluated` | passed; historical base-stage limitation retained |
| `gmail-conflict-plus-unsupported-claim` | `partially_evaluated` | `partially_evaluated` | passed |
| `conflict-evaluation-unavailable` | `evaluation_unavailable` | `evaluation_unavailable` | passed |
| `conflict-evaluation-unsupported` | `evaluation_unsupported` | `evaluation_unsupported` | passed |
| `conflict-evaluation-failed` | `evaluation_failed` | `evaluation_failed` | passed |
| `partial-source-failure` | `evaluated_no_conflict` | `partially_evaluated` | passed; historical base-stage limitation retained |
| `deterministic-replay` | `evaluated_conflict_found` | `evaluated_conflict_found` | passed |

The enrichment-aware matrix retained its current expectations, and every integrity digest check passed.
No prior runtime result regressed.

## Mutation result

Mutation: replaced the real resolution with
`<resolvedEntityReference>:fabricated` in `claimParametersByClaimId`  
Receiving stage: `enrichGovernedClaims`  
Expected detector: Entity Identification/Enrichment lineage validation  
Actual detector: none  
Rejected: no  
Error/code: none  
Silently accepted: yes  
Consequence: Enrichment completed with `retained_insufficient_coverage`; the fabricated identity merely
failed resolver correlation and no lineage error was published. This is mutation-sensitive evaluation
evidence of the actual `semantic_incompatibility`, not a production correction.

## Isolation result

No forward import was added to `/api/chat`, `context-builder.ts`, or `useAgentConversation.ts`. Repository
search found no reverse import from production into the new evaluator, and the evaluator does not import a
live route. The production dependency result is **isolated**.

Protected pre/post SHA-256 values were byte-identical:

```text
route 503840ffa6c17f52a049c1aaaad4e8402c000904dd3b7ce868104a10c6ba08a3
context 8e689bf0880375ef2539c37cac8f8891669e66f4eb6ca72602fe97137438894d
hook 55274931370b78e0ea6cf0fd144b4fba88400be0f9a14361682428846eea9c97
entity engine 85d1163753d834e64f837b6f2682ac916f7b85003ef2afe87112dbdc89a01b8b
entity types e3844ee8c35db0a6fe7a535ca6030774ded5df0038ba995e96da1ddf26de2d95
entity ruleset dd11998e9fd4a8c9e670e655d9f60c6513f9c5ca9dfdb5f4cb30614b82a82c31
entity publications 7befc7b808351e81656e21cca5d30f47face41aca6cac6bbcbf19274926b8feb
claim engine 9ab35f47190e803468003a9accd34e0cc613e9438c8077a882d0b108d22f827a
claim types cd5446f7f6bedb567be4b1bc7195c96f94b6b23bec82864102a090db49d6436a
enrichment engine 5c60fff548a152533fa1634daa1096ca6144eb2c72c70998c544b25010129454
enrichment types b009a1b62aa58a4c7a079efb9085aa810bdf0f63c9a09829c2577cb2bf71c36f
conflict engine ea0835339911d9a3d40af38333e0f0c39295477d70e1ebc63145375c47ff6064
projection 51b58941273e2b6ac748ce94e54368020928a384074cd3f062bd8d9b2dcd6106
input 15cc1689ee9234259b1ef52a1e8c6c38f1dd37aa808e3edc86cdd5e82342102f
invocation beebd3cfb14c220c2249879661e225d3b2330cb766515c6bcac5338d2f814f5b
validator 1bd9692f56ef0794f070c41ae962375bed93c953af22d393e796911e3f349fef
```

## Validation results

The targeted composition tests, Entity Identification, Claim Boundary, Enrichment, Conflict Boundary,
projection, governed input, invocation, validator, full-assembly, enrichment recheck, and integrity recheck
tests passed. The full `npm test`, build, lint, typecheck, and whitespace validation also passed.

## Recommendation and next step

The evaluation completed truthfully and found a blocking semantic incompatibility at the
Entity Identification → post-resolution Claim Set / Enrichment handoff. A resolver can mechanically use the
runtime entity reference, but that fact does not settle who owns claim association, post-resolution claim
publication, ambiguity/no-match control flow, or Entity Identification lineage. An evaluation-only adapter
would be dishonest because it would silently decide those governance questions.

The narrowest next step is a governance sprint defining the post-identification publication lifecycle and a
lineage-bearing Enrichment handoff, followed by an isolated implementation sprint and another controlled
composition review. This evaluation does not authorize production integration.

**Evaluation Complete**
