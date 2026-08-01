# Sprint 3.90 — Governed Conversational Conflicts Boundary Contract

**Status:** Complete
**Sprint Type:** Governance Decision / Conflicts Boundary Contract
**Implementation Authority:** None
**Repository:** `/workspace/jarvis`
**Branch reviewed:** `work`
**Review commit:** `8c81b717b5c316457aa835347d88e5b8d640cfb7`

## Repository Precondition

The review began in `/workspace/jarvis` on branch `work`, at commit
`8c81b717b5c316457aa835347d88e5b8d640cfb7`, with a clean working tree. The
repository has no configured local or remote `main` ref; the reviewed commit is
the merge commit containing the Sprint 3.90 specification and is the intended
review baseline. All required governing artefacts existed.

The current definitions, validators, fixtures, evaluations, and construction
paths for conversational and EOS conflicts were inspected. In particular:

* `projection-composer.ts` defines `GovernedConflictInput` with `conflictId`,
  `sourceOwners`, `affectedClaimIds`, `statusRestriction`, and
  `descriptionReference`; it checks affected claim IDs, hashes and aggregates
  supplied conflicts, and neither derives conflicts nor changes claim status;
* `types.ts` defines the distinct older `GovernedConflict` with singular
  `claimId`, `governedReference`, `compatibilityContextId`, and `description`;
  it remains load-bearing in `GovernedClaimInput.conflicts` and the response
  envelope;
* fixtures and evaluation modules construct only synthetic conversational
  conflicts; no production conversational conflict engine exists;
* EOS situational-awareness assembly creates `structural_conflict` records and
  executive-context validation consumes them, but no production path converts
  them to claim-aware conversational conflicts; and
* `GovernedClaimSet` is the authoritative future publication named by Sprint
  3.89, not a current code definition.

Only this contract file is changed.

## Governing Artefacts Reviewed

The following were read completely before decisions were drafted:

1. `docs/ENGINEERING_CONSTITUTION.md`
2. `docs/architecture/NORTH_STAR.md`
3. `docs/architecture/JARVIS-Engineering-Specification-Standard.md`
4. `docs/CONSTITUTIONAL-PUBLICATION-PRINCIPLES.md`
5. `docs/architecture/ROADMAP.md`
6. `docs/audits/SPRINT-3.88-GOVERNED-CONVERSATIONAL-PRODUCTION-EVIDENCE-AUDIT.md`
7. `docs/SPRINT-3.89-GOVERNED-CONVERSATIONAL-CLAIMS-BOUNDARY-CONTRACT.md`
8. `docs/SPRINT-3.76-GOVERNED-CONVERSATIONAL-RUNTIME-CONTRACT.md`
9. `docs/SPRINT-3.82-GOVERNED-CONVERSATIONAL-LINEAGE-IDENTITY-CONTRACT.md`
10. `docs/SPRINT-3.85-GOVERNED-CONVERSATIONAL-IDENTITY-CORRECTION-CONTRACT.md`
11. the submitted Sprint 3.90 specification at this path on the review baseline.

## Sprint 3.88 Conflicts Finding

The Conflicts Finding was reviewed in full. Its composer requirement, current
production analogues, gap analysis, classification, reasoning, earliest next
step, and ten questions were traced from the prose. Sprint 3.88 is evidence,
not decision authority. The ten questions are independently decided below.

The repository confirms its central evidence: supplied projection conflicts
are structured and claim-linked; the composer does not derive them; the older
claim-local conflict remains in use; EOS conflicts have different semantics;
fixtures are the only conversational constructors; no deterministic,
versioned production conversational conflict engine exists; and an empty array
proves only that no conflicts were supplied.

## Sprint 3.89 Claims Foundation

Sprint 3.89 binds this contract to **Claims-Boundary Architecture: Option C**:
typed intent, closed deterministic recognition, deterministic clarification,
then fail-closed unsupported. Claims exist pre-model. `ClaimBoundaryRuleset`,
`ClaimBoundaryEvaluation`, and immutable `GovernedClaimSet` publications have
separate identities. Claim identity, type, polarity, materiality, source and
coverage ownership, unsupported behavior, compound segmentation, family
separation, and Cassie importance exclusion remain unchanged.

Sprint 3.89 selected **Conflicts Contract Decision: Option A**, requiring this
complete dependent contract rather than partial conflict semantics. This
document fulfills that next-step statement. It does not reopen any Sprint 3.89
claim decision. Conflicts consume claims; they never create, merge, classify,
or redefine them.

## Conversational Conflict Architecture

**Conversational Conflict Architecture: Option B**

Option B, a closed multi-class claim-restriction taxonomy, is binding. A
governed conversational conflict exists only when the applicable immutable
conflict ruleset matches one of these classes against an existing claim and
admissible source publications:

1. `source_value_contradiction`;
2. `policy_incompatibility`; or
3. `temporal_commitment_incompatibility`.

Each class has fixed eligible claim families, source publication types,
comparison keys, scope and coverage tests, rule IDs, and status effects.
Domain modules sit beneath one root ruleset and cannot add classes. Claim
identity fixes the assertion being restricted; unequal values outside the same
claim property, entity, time, scope, and normalization rule do not conflict.

Option A is rejected because factual contradiction alone omits genuine,
deterministic policy and commitment incompatibilities that can restrict a
claim without being factual-value disagreement. Option C is rejected because
independent taxonomies would duplicate publication and no-conflict semantics
and permit inconsistent cross-family outcomes. Option D is rejected because
source-only publication leaves ordinary cross-source conversational conflict
evaluation unavailable. Relations outside the three named classes are not
governed conversational conflicts.

## Decision 1 — Claim Linkage

**Conflict Claim-Linkage Decision: Option A**

Strict claim linkage is binding. Every conflict references at least one claim
ID present in the single Governed Claim Set under evaluation. One conflict can
affect multiple claims in that set only when one ruleset rule names every
eligible claim family and establishes one shared comparison scope. It cannot
reference another claim set, exchange, or thread.

Unsupported evaluation segments have no claim and cannot have conflicts. A
supported claim whose conflict class is unsupported receives an evaluation
scope result, not a fabricated conflict. A no-claim evaluation produces no
Conflict Evaluation because there is no claim set to consume. Option B is
rejected: environmental inconsistencies lack the claim relevance required for
conversational restriction and need their own domain publications.

## Decision 2 — Identity Chain

> **Conflict Identity Chain:** `ClaimBoundaryRuleset` →
> `ClaimBoundaryEvaluation` → `GovernedClaimSet` → claim IDs →
> `ConflictEvaluationRuleset` → `ConflictEvaluation` →
> `GovernedConflictSet` → conflict IDs → immutable source publication
> references and source-owner IDs; the composer then creates a separate
> projection identity.

> **Conflict Identity Rule:** Every ID identifies exactly one immutable
> canonical body or event in its own identity domain; no identity substitutes
> for another and any semantic or body change creates a new identity.

The ruleset ID is content-derived from canonical ruleset content. Evaluation
IDs are event-derived and identify one attempt over one claim set, ruleset,
evidence set, availability/coverage set, comparison time, and policy. The
conflict-set ID and individual conflict IDs are content-derived from their
canonical bodies. Thread, request, exchange, and future projection references
are lineage only. The evaluation precedes the projection, so its projection
reference is absent; the projection records the evaluation and set references.

Every retry creates a new evaluation ID and links the prior attempt. A retry
that publishes an evaluated outcome creates a new conflict-set identity;
canonical content-addressed deduplication can resolve identical bodies to the
same content identity without reusing an event identity. A claim ID cannot be
a conflict ID, a set ID cannot be an evaluation ID, a projection ID cannot be
a set ID, and an exchange ID cannot be a conflict ID.

## Decision 3 — Source Ownership

> **Admissible Conflict Source Owners:** A publication is admissible only when
> it is immutable, provenance-bearing, admitted by the cross-source governed
> evidence registry, referenced by an affected claim's source scope, produced
> by a source-specific governed publisher or explicitly admitted governed
> policy publisher, and eligible under the selected conflict rule. Source-owner
> identity, schema and publication identity, observation/effective time,
> comparison scope, content kind, availability, and coverage must be present.

The engine consumes registry-admitted source-specific publications directly
through immutable registry entries. It cannot introduce a source or widen a
claim's source scope. Availability records and coverage records are metadata
for evaluation proof, never factual observations. Two observations from one
source owner can conflict only when they are separate immutable publications,
the selected rule admits version/temporal comparison, and neither supersedes
the other under a governed precedence rule. Policy versions are policy
publications for the policy class, otherwise they are evaluation metadata.

> **Prohibited Conflict Inputs:** raw connector payloads; unregistered or
> mutable observations; legacy compatibility context; source silence;
> unavailable-source markers as factual values; conversation text; prior or
> current assistant output; model interpretation; operator assertions lacking
> a separately governed source publication; prompts; route state; EOS conflict
> results; and publications outside the claim's declared source scope.

An operator assertion can become eligible only through a future governed
operator-assertion source contract and claim-family rule. The conflict
evaluator compares publications but never becomes their source owner.

## Decision 4 — Composer Role

**Projection Composer Conflict Role: Option A**

The dedicated conflict owner runs before composition and publishes the
evaluation and, for evaluated outcomes, a Governed Conflict Set. The composer
validates publication identity, claim-set linkage, affected claims, source
references, and allowed restrictions; includes the immutable publications;
and preserves canonical order and status effects.

The composer cannot derive, merge, rewrite, re-ID, reorder semantically, alter
restriction, suppress, or drop conflicts. It cannot infer no-conflict from
absence. Invalid input fails composition. Duplicate relation normalization is
owned solely by the conflict evaluator before publication. Option B is
rejected because composition ownership would combine evidence reasoning with
exclusive projection assembly and obscure whether evaluation ran.

## Decision 5 — Conflict Ruleset

> **Conflict Ruleset Architecture:** One immutable cross-domain root
> `ConflictEvaluationRuleset` with closed, separately versioned domain modules.
> The root fixes the three-class vocabulary, module IDs, deterministic module
> precedence, common identity/publication schema, claim linkage, admissibility,
> outcome aggregation, and no-conflict proof. A module can narrow eligible
> claims and sources and provide class rules; it cannot add a class or override
> root semantics.

> **Conflict Ruleset Owner:** The governance-approved conflict rules registry.

The publication contains immutable ruleset ID, schema and ruleset versions;
the three classes; eligible claim families/types and evidence publication
types; comparison keys and canonical normalization; temporal, entity, scope,
and coverage requirements; module order; source-owner requirements;
supersession and separately governed precedence references; restriction maps;
deterministic description templates; partial-evaluation rules; no-conflict
proof; prohibited relations; and module identities.

Rules execute in fixed class order: source value, policy, then temporal
commitment. Within a class, canonical rule ID orders evaluation. One canonical
relation key—class, sorted affected claim IDs, comparison key/scope, sorted
source references, and rule ID—produces one conflict. A semantic change creates
a new root or child identity. Claim and conflict rulesets remain distinct;
`ConflictEvaluationRuleset` consumes the selected Claim Boundary Ruleset ID.

## Decision 6 — Conflict Engine

**Conflict Evaluation Owner: Option A**

**Conflict Evaluation Owner:** Governed Conversational Conflict Engine

**Existing Engine Reuse Decision:** No production conversational conflict
engine exists. A dedicated Governed Conversational Conflict Engine must be
created in a future isolated implementation sprint. Existing EOS assembly,
status aggregation, validators, and projection composition do not own these
semantics. Generic immutable-record, sorting, validation, comparison, identity,
and storage mechanisms can be adapted only beneath the new ruleset.

Owner B is rejected because claim recognition and conflict comparison are
separate dependent evaluations. Owner C is rejected by the composer decision.
Owner D is rejected because individual source publishers cannot determine a
cross-source, claim-scoped relation.

## Decision 7 — EOS Reuse

**EOS Structural Conflict Reuse: Option C**

Current direct reuse is prohibited. EOS and conversational conflict remain
separate publication and identity domains. A future governed mapping contract
can transform only named EOS classes for named claim types after it proves
equivalent trigger, affected object, source authority, scope, lifecycle,
ruleset, status effect, and lineage. Until that contract exists, no mapping,
copy, retyping, or identifier conversion is valid.

**Mechanism reuse cannot transfer meaning.** Shared fields such as conflict ID,
source IDs, observed time, or rule text describe structural similarity, not
semantic equivalence. Likewise, a shared algorithm establishes only mechanism.
Executive-state inconsistency concerns an EOS entity snapshot; conversational
conflict restricts claims using admitted evidentiary publications. Option A is
rejected because it unnecessarily forbids a later proof-governed mapping.
Option B is rejected because identifier mapping proves neither authority nor
meaning.

## Decision 8 — Cross-Domain Boundary

> **Cross-Domain Conflict Boundary:** A relation crosses claim families or
> domains only when one identified root rule and its versioned domain modules
> explicitly admit every claim type and source publication type, name all
> affected claim IDs, prove one shared entity/property/time/scope comparison,
> and define one deterministic restriction. Shared names, fields, identifiers,
> storage, or algorithms never establish admissibility.

Thus EOS structural conflict is not evidentiary contradiction; Calendar
overlap is not communication conflict; source unavailability is not value
contradiction; model disagreement is validation failure; prior assistant error
is non-canonical dialogue; policy incompatibility is not factual
contradiction; and a family rule cannot run against another family without a
root-authorized module. Cross-claim conflict within one set is admitted under
the stated proof. Cross-set, cross-exchange, and cross-thread conflict is
Deferred and prohibited in the current contract.

## Decision 9 — Evaluation-State Architecture

**Conflict Evaluation-State Architecture: Option A**

Every nonempty Governed Claim Set receives one immutable Conflict Evaluation.
Evaluation is claim-set-wide but records a product of claim IDs × applicable
conflict classes. Each cell records evaluated scope or an explicit unevaluated
reason. Partial evaluation is allowed and represented structurally.

The closed overall outcome vocabulary is:

* `evaluated_no_conflict`: every applicable cell evaluated with sufficient
  coverage and none matched;
* `evaluated_conflict_found`: every applicable cell evaluated and at least one
  conflict matched;
* `partially_evaluated`: at least one cell evaluated and at least one applicable
  cell unevaluated, whether or not evaluated cells found conflicts;
* `evaluation_unavailable`: no applicable cell evaluated because required
  source publication, registry record, ruleset artifact, or infrastructure was
  unavailable;
* `evaluation_unsupported`: no applicable cell evaluated because all claims or
  requested classes are outside the selected ruleset; and
* `evaluation_failed`: no authoritative result because validation, evaluator,
  persistence, or identity publication failed.

A Governed Conflict Set exists only for
`evaluated_no_conflict`, `evaluated_conflict_found`, and
`partially_evaluated`. The first publishes a zero-conflict set. A partial set
contains conflicts found in evaluated cells and explicit coverage; it never
claims whole-set absence. Options B and C are rejected because a projection
marker or array convention cannot independently prove rules, sources, scope,
coverage, and immutable evaluation identity.

## Decision 10 — No-Conflict Proof

> **No-Conflict Proof Rule:** No conflict is proven only by a
> `ConflictEvaluation` with outcome `evaluated_no_conflict` and its linked
> zero-conflict `GovernedConflictSet`. The evaluation must identify the ruleset,
> evaluation, claim set, every evaluated claim, every applicable class,
> admissible source publications, availability and coverage records,
> comparison scopes and reference time, deterministic per-cell results, and
> the conflict-set identity. All applicable cells must have sufficient required
> source coverage.

> **Unevaluated Representation:** Unevaluated scope is a nonempty immutable list
> of records containing claim ID, class, source requirement, comparison scope,
> and exactly one closed reason:
> `conflict_class_unsupported`, `required_source_unavailable`,
> `insufficient_source_coverage`, `ruleset_unavailable`, `evaluator_failure`,
> `claim_type_outside_ruleset`, or `evaluation_deferred`. Overall outcome is
> derived from the cell records by the fixed vocabulary above.

This is a checkable structural difference: evaluated no-conflict has an
evaluation, complete per-cell coverage, a deterministic `no_match` result for
every applicable cell, and a linked zero-conflict set; unevaluated has explicit
reason records and cannot use `evaluated_no_conflict`. No supplied conflict,
one source, source silence, no model objection, empty compatibility context,
or an empty array never proves absence.

## Closed Taxonomy

| Candidate relation | Conflict class? | Governing owner | Required claim linkage | Required evidence | Result if not a conflict |
| --- | ---: | --- | --- | --- | --- |
| Source-value contradiction | Yes | Conflict Engine, `source_value_contradiction` rule | One or more eligible claims in one set | At least two admissible observations with incompatible normalized values for the same property/entity/scope/time and sufficient coverage | No match for evaluated scope, or explicit coverage/unavailability result |
| Source-availability disagreement | No | Source availability and coverage publishers | Claim source requirement only | Immutable availability/coverage records | Availability or coverage restriction; never contradiction |
| Claim-status inconsistency | No | Publication validator | Same claim and canonical evaluation lineage | Incompatible canonical statuses or duplicate owners | Publication-coherence validation failure |
| Temporal/commitment incompatibility | Yes | Conflict Engine, `temporal_commitment_incompatibility` module | All affected eligible claims in one set | Admissible commitments plus deterministic temporal/resource impossibility proof | Ordinary schedule relation or unsupported/unevaluated class |
| Prior assistant-output contradiction | No | Response/history validator | Prior turn reference only; not claim evidence | Current governed evidence and non-canonical dialogue | Correction/uncertainty response; no conflict publication |
| Policy incompatibility | Yes | Conflict Engine, `policy_incompatibility` module | All affected eligible claims in one set | Two or more applicable governed policy publications whose obligations cannot jointly hold in one scope | Policy applicability result or unsupported/unevaluated class |
| Coverage incompatibility | No | Claim ruleset and evidence coverage evaluator | Claim whose required scope is unmet | Registry-admitted coverage records | `insufficient_coverage` restriction or unevaluated cell |
| Operator assertion contradiction | No | Future operator-source governance | None under current rules | No current admissible publication | Clarification/non-canonical context; future source contract required |
| Model-output contradiction | No | Governed response validator | Output-to-claim validation links | Model output and canonical projection | Validation failure or invented-fact violation; response withheld |

Relations not explicitly admitted by the closed taxonomy are not governed
conversational conflicts. There is no `other` class.

## Publication Architecture

```text
ClaimBoundaryRuleset → ClaimBoundaryEvaluation → GovernedClaimSet
                                                    ↓
Registry-admitted source publications + availability/coverage publications
                                                    ↓
ConflictEvaluationRuleset → Governed Conversational Conflict Engine
                                                    ↓
                           ConflictEvaluation → GovernedConflictSet
                                                    ↓
                         Dedicated Conversational Projection Composer
```

### ConflictEvaluationRuleset

This immutable canonical publication is owned by the governance-approved
conflict rules registry. It contains all fields and rules fixed in Decision 5.
Its ID is derived from canonical content. Publication occurs before evaluation.
A schema-compatible editorial change that affects canonical content and every
semantic, module, template, precedence, status, or proof change creates a new
ID and version. It references, but never shares identity with, the Claim
Boundary Ruleset.

### ConflictEvaluation

This immutable event publication represents exactly one engine attempt over
one claim set, conflict ruleset, identified source-evidence and coverage set,
comparison time, and evaluation policy. It contains evaluation ID, schema
version, ruleset and claim-set IDs, claim IDs, source publication references,
availability/coverage references, evaluated class/cell records, excluded or
unsupported cells, comparison time, closed outcome, unevaluated/failure reason,
created-at time, optional prior evaluation, and thread/request/exchange
lineage. It does not claim a future projection ID. Each retry has a new event
ID and prior-attempt link.

### GovernedConflictSet

This immutable result publication contains a content-derived set ID, schema
version, evaluation/ruleset/claim-set IDs, canonically ordered immutable
conflicts, evaluated claim IDs and cells, coverage records, and the scoped
no-conflict result. Zero-conflict sets are published for
`evaluated_no_conflict`. Failed, unavailable, and unsupported evaluations
publish no set. Partial evaluations publish a set with explicit evaluated and
unevaluated scope. A set can span claim families only under the cross-domain
proof and only within one claim set. Order is canonical, not semantic. The
engine alone deduplicates by canonical relation key before publication.

### Individual Governed Conflict

Each canonical conflict contains conflict ID, class, affected claim IDs,
source publication references and owners, comparison key and scope,
restricting status, ruleset-owned description reference, evaluated-at time,
rule ID, evidence/coverage references, and class-schema-validated domain
metadata. `detectedAt` is not a separate inferred event: it equals the parent
evaluation's evaluated-at time. The structured rule match, not its description,
establishes existence.

The existing `GovernedConflictInput` is a **projection view of the richer
canonical conflict**. Its five fields are insufficient to prove class,
ruleset/rule, source publication identity, comparison scope, evaluation, and
coverage, so it cannot be the canonical publication. A future adapter derives
that view without changing meaning.

The older `GovernedConflict` is a **legacy claim-local and response-envelope
view**, not the same type and not a duplicate. Its singular `claimId`, governed
reference, compatibility reference, and description cannot represent the new
canonical multi-claim relation. During future isolated migration, each
claim-local occurrence must reference one canonical conflict ID and carry only
a non-authoritative compatibility projection; it cannot create conflict
semantics. Response envelopes expose canonical conflict views. Removal or
schema replacement requires a separately authorized compatibility migration.

## Identity Integrity Compliance

The Constitutional Publication Principles' **Identity Integrity** principle
applies to every publication:

| Publication | Immutable object/event represented | ID identifies | Cannot share ID with | Change requiring new identity | Retry/content rule |
| --- | --- | --- | --- | --- | --- |
| Conflict Evaluation Ruleset | One canonical rules body and module graph | Exact ruleset content | Claim ruleset, evaluation, set, conflict | Any canonical or semantic rule change | Content-addressed; no retry concept |
| Conflict Evaluation | One attempt over fixed inputs, coverage, time, and policy | Evaluation event | Ruleset, claim set, conflict set, projection | Retry, input/coverage/time/policy/outcome change | New event ID; link prior attempt |
| Governed Conflict Set | One ordered result and coverage body | Exact set content | Evaluation, claim set, projection, conflict | Conflict, order key, coverage, scope, or result change | New result identity; identical canonical content can deduplicate |
| Governed Conflict | One matched canonical relation | Exact class/claims/sources/scope/rule/restriction body | Claim, set, evaluation, exchange | Any affected claim, source, scope, rule, class, or restriction change | Content-addressed; retry can reference same relation only when body is identical |

One set identity cannot represent different conflict bodies. An evaluation ID
cannot survive source coverage change. A conflict ID cannot survive affected
claim changes. A ruleset ID cannot survive semantic changes. A claim ID never
stands in for a conflict ID. Mutable bodies under stable IDs are invalid.

## Status Restriction

The root ruleset owns a monotonic restriction lattice:

```text
available → insufficient_coverage → unavailable → unsupported
```

A conflict or evaluation condition can preserve or move right; it can never
upgrade evidence sufficiency. `source_value_contradiction` restricts an
otherwise available affected claim to `insufficient_coverage` because evidence
exists but does not establish one coherent value. `policy_incompatibility`
restricts an otherwise available claim to `unsupported` when no governed
treatment can jointly satisfy applicable policies. A policy module with a
governed safe treatment can preserve the existing status while publishing the
conflict and treatment reference. `temporal_commitment_incompatibility`
restricts affected available claims to `insufficient_coverage`; it never
selects a commitment.

Insufficient coverage without a matched conflict maps to
`insufficient_coverage`. An unavailable required source maps to `unavailable`.
An unsupported class or claim family maps to `unsupported` only when the claim
ruleset declares conflict evaluation mandatory for that claim; otherwise it is
an explicit unevaluated cell and the existing claim status is preserved with a
model wording restriction. Claim-status inconsistency, malformed publication,
unknown claim ID, evaluator exception, persistence failure, and publication
identity failure are validation/evaluation failures, not status choices. The
composer merely verifies the ruleset-owned mapping.

Both or all incompatible source-owned values remain visible by governed
reference. Suppression is forbidden. A separately governed precedence rule can
select one value only when referenced by the conflict rule and evaluation; the
losing observation remains auditable. Without such a rule, no conflict-free
synthesized value can be created. The model can describe the bounded conflict
and recommend verification, but cannot adjudicate or select precedence.

Descriptions use immutable deterministic ruleset templates populated with
structured references. Human-authored policy text can be referenced by a
template. Source publishers and models do not author the canonical description
or determine existence. The model can render it without changing class,
restriction, or scope.

## No-Conflict and Partial Evaluation

Partial evaluation is permitted by claim × class cell, not by hidden source or
domain omission. Every applicable source requirement and class is recorded.
Evaluated cells can support a bounded no-conflict statement; unevaluated cells
carry one closed reason. Overall aggregation follows Decision 9. Any found
conflict restricts its affected claims even when the overall result is partial.
Missing required coverage applies the claim-status rule above. Evaluation
failure never yields an empty set or model-ready conflict-free projection.

The answering model can say **“No conflict was detected within the identified
sources, classes, and comparison scope.”** only for an
`evaluated_no_conflict` evaluation, or for named evaluated cells in a partial
evaluation with explicit unevaluated scope. It cannot say “No conflict exists”
or “The sources agree” universally. For unavailable, unsupported, failed, or
deferred scope it must say **“Conflict evaluation did not complete for [named
scope and published reason].”** It cannot turn source silence into agreement.

Malformed sources, unknown claim IDs, evaluator exceptions, persistence
failure, and identity failure produce `evaluation_failed` and withhold a
conflict set. Ruleset or required infrastructure absence produces
`evaluation_unavailable`. Unsupported claims/classes produce
`evaluation_unsupported`. Insufficient coverage and unavailable sources are
cell reasons and aggregate to partial or unavailable according to whether any
cell completed.

## EOS Comparison

| Property | EOS structural conflict | Conversational evidentiary conflict |
| --- | --- | --- |
| Trigger | Incompatible canonical values for one EOS entity identity | A named conflict rule matches claim-linked admitted publications |
| Affected object | Executive-state entity/snapshot | Claim or claims in one Governed Claim Set |
| Source owners | EOS assembly source IDs | Claim-scoped governed evidence or policy publishers admitted by registry/rule |
| Lifecycle | EOS situational-awareness assembly and executive-context consumption | Pre-model conflict evaluation, set publication, projection, validation |
| Ruleset | EOS assembly rule | Versioned `ConflictEvaluationRuleset` and domain modules |
| Status effect | Structural record counted in executive context | Monotonic claim restriction or evaluation/validation result |
| Publication identity | EOS `conflictId` in EOS domain | Separate evaluation, set, and canonical relation identities |
| Model role | Receives executive context under EOS contract | Explains published bounded result; never creates or adjudicates it |

EOS records remain EOS-only now. Current direct reuse is prohibited. A future
mapping contract is permitted under Decision 7. Shared storage and algorithms
can be reused without sharing publication semantics. Shared implementation
mechanisms do not establish shared semantic authority.

## Four Source Categories

Conflict governance confirms Sprint 3.89's **Yes / No / Yes** findings in every
row; it does not correct them.

| Category | Source contract remains independent? | Publisher implementation remains independent? | Conflict-aware claim wiring waits? | Binding reason |
| --- | ---: | ---: | ---: | --- |
| Gmail | Yes | No | Yes | Publication semantics can be governed independently; publisher implementation needs separate authority and registry admission; claim/conflict relevance waits for ruleset wiring. |
| Calendar | Yes | No | Yes | Event publication semantics do not depend on conflict classes; implementation is separately authorized; commitment comparison waits for a Calendar claim module. |
| Memory/priorities | Yes | No | Yes | Provenance and operator ownership can be contracted without making priority or significance a conflict; implementation and claim admission remain separate. |
| Connector availability | Yes | No | Yes | Availability is source-state/coverage metadata, not contradiction; implementation requires separate authority and conflict-aware claim mapping waits. |

Source contracts can proceed as parallel governance work. Conflicts do not
block source publication, but this sprint authorizes no publisher code,
registry implementation, claim wiring, or production integration.

## Ten-Question Decision Matrix

| Sprint 3.88 question | Binding decision | Architectural owner | Publication affected | Rejected alternatives | Implementation consequence |
| --- | --- | --- | --- | --- | --- |
| Can conflict exist without a claim? | Claim-Linkage A: no; all affected claims are in one set | Conflict Engine | Conflict Evaluation/Set/conflict | Environmental conflict | Validate nonempty claim links |
| What identities link conflict, claims, and sources? | Distinct ruleset, evaluation, set, conflict, claim, source, and lineage identities | Registry + Engine | All four conflict publications | Aliasing or mutable IDs | Implement immutable chain and retry links |
| Who owns underlying observations? | Registry-admitted source/policy publishers | Source publishers and registry | Evaluation/conflict | Engine, legacy, model, raw source ownership | Consume references without widening scope |
| Does composer derive or aggregate? | Composer Option A: validate and aggregate only | Projection Composer | Projection | Composer derivation | Consume immutable evaluation/set |
| What rules govern evaluation? | One root ruleset with closed versioned modules and three classes | Conflict rules registry | Ruleset | Unversioned or independent taxonomies | Implement fixed rule/module schema |
| Does an engine exist/reuse? | None exists; create dedicated engine; mechanism-only adaptation | Conflict Engine | Evaluation/Set | Claim engine, composer, source owners | Isolated engine implementation required |
| May EOS conflicts be reused? | EOS Option C: no current reuse; future proof-governed mapping only | Separate EOS and conflict owners | Future mapping publication | Direct reuse; permanent mapping ban | Keep identities/results separate |
| What is cross-domain conflation? | Crossing requires root rule, modules, eligible claims/sources, and shared scope proof | Conflict rules registry | Ruleset/Evaluation | Shared names, fields, IDs, algorithms | Fail closed outside authorized module |
| Does empty array prove no conflict? | Evaluation-State A; no | Conflict Engine | Evaluation/Set | Projection marker; array convention | Publish zero set only with complete proof |
| What proves no conflict versus unevaluated? | Complete per-cell proof + zero set versus explicit reason records | Conflict Engine | Evaluation/Set | Absence inference | Structurally distinct outcomes |

## Final Classification Matrix

| Item | Sprint 3.88 finding | Final outcome | Architectural class | Binding decision | Owner | Implementation consequence |
| --- | --- | --- | --- | --- | --- | --- |
| Central conflict taxonomy | Relation semantics absent | Modified | Option B | Three-class closed taxonomy | Rules registry | Root ruleset plus modules |
| Claim linkage | Claim required | Accepted | Claim-Linkage A | At least one claim in one set | Conflict Engine | Reject orphan/cross-set conflicts |
| Multi-claim linkage | Input permits affected claims | Accepted | Relation | Shared rule/scope permits many | Conflict Engine | Canonical sorted claim IDs |
| Cross-claim linkage | Needed rule absent | Modified | Boundary | Root/module authorization required | Rules registry | Fail closed outside named families |
| Source ownership | Source-owned observations required | Accepted | Evidence | Publishers remain owners | Source publishers | Engine consumes references |
| Source eligibility | Not production-governed | Modified | Admission | Registry + claim scope + rule | Registry/ruleset | No backdoor admission |
| Composer role | Aggregates and checks claim IDs | Accepted | Composer A | Validate/aggregate only | Composer | No derivation or mutation |
| Conflict ruleset | Missing | Accepted | Publication | Immutable root plus modules | Rules registry | Version all semantics |
| Conflict evaluator | Missing | Accepted | Owner A | Dedicated engine | Conflict Engine | Isolated implementation |
| Evaluation publication | Missing | Accepted | Publication | Immutable event with closed outcome | Conflict Engine | Prove every attempt |
| Conflict-set publication | Missing | Accepted | Publication | Evaluated outcomes only | Conflict Engine | Zero and partial sets explicit |
| Individual conflict identity | Shapes incomplete | Modified | Publication | Rich immutable canonical relation | Conflict Engine | Adapt two legacy views later |
| Source-value contradiction | Candidate relation | Accepted | Conflict class | Same property/entity/scope incompatibility | Conflict Engine | Preserve values |
| Source availability | Not automatically conflict | Rejected | Coverage | Metadata/restriction only | Availability publisher | No conflict construction |
| Claim-status inconsistency | Open distinction | Rejected | Validation | Coherence failure | Validator | Fail publication |
| Temporal incompatibility | Calendar overlap not automatic | Modified | Conflict class | Deterministic eligible commitment impossibility only | Domain module | Calendar claim module required |
| Prior assistant contradiction | Non-canonical analogue | Rejected | Dialogue | Correction, not evidence conflict | Validator/model boundary | Revalidate current evidence |
| Policy incompatibility | Not factual disagreement | Modified | Conflict class | Separate governed class | Policy module | Require applicable policy publications |
| Coverage incompatibility | Open distinction | Rejected | Coverage | Insufficient coverage, not conflict | Coverage evaluator | Publish reason/restrict status |
| Operator assertion contradiction | Ownership absent | Deferred | Source governance | Not currently eligible | Future source owner | Future contract needed |
| Model-output contradiction | Model cannot own conflict | Rejected | Validation | Withhold invalid output | Response validator | No conflict publication |
| No-conflict proof | Empty array insufficient | Accepted | Evaluation A | Complete proof + zero set | Conflict Engine | Explicit per-cell results |
| Partial evaluation | Needed distinction | Modified | Evaluation | Allowed by claim × class cell | Conflict Engine | Record all omitted scope |
| Empty conflict arrays | Proves none supplied | Rejected | Representation | Never proves no conflict alone | Conflict Engine | Require evaluation/set |
| EOS conflict reuse | Different domain | Modified | EOS Option C | No current reuse; mapped only by future contract | Separate owners | Keep identity domains separate |
| Cross-domain mapping | Equivalence unproven | Deferred | Mapping | Current mapping prohibited | Future governance | Does not block isolated engine |
| Source-category independence | Yes/No/Yes | Accepted | Sequencing | Confirm all four rows | Source governance owners | Contracts can proceed; wiring waits |

Counts: **Accepted 12; Modified 9; Deferred 2; Rejected 6**. Deferrals do not
leave any of the ten questions or current taxonomy decisions open.

## Rejected Register

| Rejected item | False claim, authority error, or audit ambiguity prevented |
| --- | --- |
| Conversational Architecture A | Prevents policy and commitment incompatibility from being hidden outside an otherwise complete restriction contract |
| Conversational Architecture C | Prevents family implementations from inventing inconsistent taxonomy and no-conflict semantics |
| Conversational Architecture D | Prevents absence of source-produced conflicts from masquerading as a completed conversational boundary |
| Conflict without an affected claim | Prevents environmental inconsistency from acquiring conversational relevance |
| Model-generated conflicts | Prevents the answerer creating its own restriction evidence |
| Route-owned conflict detection | Prevents transport code becoming canonical evaluator |
| Projection-composer-owned derivation | Preserves exclusive composition without covert evidence reasoning |
| Empty-array-as-no-conflict | Prevents “none supplied” from becoming proof of evaluation |
| Source unavailability as contradiction | Preserves availability and coverage meaning |
| Two unequal strings as conflict | Requires entity/property/time/scope normalization and logical incompatibility |
| Prior assistant output as canonical evidence | Prevents non-canonical dialogue from gaining source authority |
| Current model disagreement as conflict | Keeps invented-fact and validation failure distinct |
| Direct EOS conflict copying/retyping | Prevents mechanism or vocabulary from transferring meaning |
| Shared type or identifier names as equivalence | Preserves publication-domain identity |
| Mutable conflict under stable ID | Enforces Identity Integrity |
| Conflict rules without version identity | Preserves repeatability and auditability |
| Evaluation without source coverage | Prevents scoped ignorance from being reported as agreement |
| Implementation-defined or `other` classes | Keeps taxonomy closed |
| Model-selected source precedence | Prevents model adjudication |
| Conflict status upgrade | Preserves monotonic evidence restriction |
| Silent suppression of a conflicting value | Preserves source ownership and uncertainty |
| Claim Boundary Engine as conflict owner | Preserves dependent evaluation separation |
| Source publishers as cross-source evaluator | Prevents one source assigning relevance to other sources |
| EOS Reuse Option A | Preserves a strictly proof-governed future mapping path without authorizing it now |
| EOS Reuse Option B | Prevents identifier mapping from pretending semantic equivalence |
| Projection Boolean or absence marker | Prevents projection structure from substituting for immutable evaluation proof |

## Deferred Register

| Deferred matter | Why and missing governance/evidence | Blocks isolated conflict implementation? | Blocks source-category work? | Blocks projection integration? | Expected future sprint |
| --- | --- | ---: | ---: | ---: | --- |
| Calendar commitment module | Closed Calendar claim types, resource semantics, and admissible commitment publications are absent | No; class framework and unsupported cells are fixed | No | Yes for this class | Calendar claim-family and conflict-module contract |
| New domain conflict classes | Closed taxonomy amendment requires evidence and a new root ruleset governance decision | No | No | No for admitted classes | Future conflict-taxonomy amendment |
| Significance conflicts | Sprint 3.89 keeps importance/significance unsupported | No | No | Yes for significance | Significance contract, then module governance |
| Cross-set/exchange/thread conflicts | Continuity, expiry, and identity scopes are not governed | No | No | Yes for continuity conflicts | History/continuity conflict contract |
| Governed operator-assertion source | Provenance, authority, expiry, and claim eligibility are undefined | No | No | Yes for operator conflicts | Operator-source publication contract |
| Human-authored resolution | Resolution authority and audit publication are outside conflict detection | No | No | No | Conflict-resolution contract |
| Source precedence policy | No general authority selects a substantively correct source | No; preserve all values | No | Yes for automatic adjudication only | Source-precedence contract |
| EOS-to-conversation mapping | Semantic equivalence has not been proven for any named class | No | No | Yes for EOS-derived evidence only | Dedicated mapping contract |
| Durable persistence | Storage port and retention choices require implementation authority | No | No | Yes | Isolated implementation design |
| Operator verification | Requires implemented publications and fixtures | No | No | Yes | Verification sprint |
| Promotion | Requires implementation, evaluation, integration, and verification | No | No | Yes | Promotion sprint |

None of these deferrals blocks a future isolated implementation of the root
ruleset, evaluation, conflict set, source-value contradiction module, explicit
evaluation states, and canonical identities.

## Files Changed

```text
docs/SPRINT-3.90-GOVERNED-CONVERSATIONAL-CONFLICTS-BOUNDARY-CONTRACT.md
```

No source, test, route, prompt, selector, runtime, Roadmap, or separate report
file changed.

## Validation

Full repository validation completed after the contract was written:

| Command | Result |
| --- | --- |
| `npm test` | Passed: 133 test files; 648 tests passed and 1 skipped |
| `npm run build` | Passed: compilation, type validation, page generation, and build traces completed; Google Fonts stylesheet optimization was skipped after its download failed |
| `npm run lint` | Passed: no ESLint warnings or errors |
| `npm run typecheck` | Passed: `tsc --noEmit` exited successfully |
| `git diff --check` | Passed |

Document checks confirm: ten binding decisions; exactly one central,
claim-linkage, composer, EOS, owner, and evaluation-state option; a closed
three-class taxonomy; explicit publication identities and Identity Integrity;
structurally different no-conflict and unevaluated results; complete matrices
and registers; unmodified Sprint 3.89 decisions; unambiguous Yes/No/Yes source
rows; and no implementation authority.

## Implementation Authority

> Sprint 3.90 establishes conflict-boundary governance only. It does not implement conflict evaluation, source comparison, conflict publications, status restriction, source precedence, route behavior, projection behavior, model behavior, persistence, or production integration.

> Sprint 3.90 authorizes no implementation and changes no production behavior.

## Next Step

The next permitted sprint is an isolated governed conversational conflict
implementation sprint for the root ruleset, source-value contradiction module,
evaluation publication, Governed Conflict Set, canonical conflict identity,
and explicit no-conflict/unevaluated structure. It cannot integrate `/api/chat`.
Gmail, Calendar, memory/priority, and connector-availability source-publication
contracts can proceed in parallel as governance-only work. Calendar commitment,
operator assertion, source precedence, and EOS mapping remain subject to their
named future contracts.

## Recommendation

**Governed Contract Complete**
