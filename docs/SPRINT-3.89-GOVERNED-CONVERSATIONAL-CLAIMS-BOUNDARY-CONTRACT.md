# Sprint 3.89 — Governed Conversational Claims Boundary Contract

**Status:** Complete
**Sprint Type:** Governance Decision / Claims Boundary Contract
**Implementation Authority:** None
**Repository:** `/workspace/jarvis`
**Branch reviewed:** `work`
**Review commit:** `710f8fef227192a91b7608ae70e46817a8ebcc13`

## Repository Precondition

The review began by confirming `/workspace/jarvis`, branch `work`, commit
`710f8fef227192a91b7608ae70e46817a8ebcc13`, and a clean working tree. All
required artefacts and implementation files existed. The repository had no
configured `main` ref; the reviewed commit is the merge commit containing the
Sprint 3.89 specification and is therefore the recorded review baseline.

The following implementation evidence was inspected: `types.ts`,
`projection-composer.ts`, `evidence-status.ts`, `input.ts`, `model-request.ts`,
`validator.ts`, `fixtures.ts`, `lineage-test-fixtures.ts`,
`parallel-evaluation.ts`, `cassie-fixture.test.ts`, all Cassie fixtures, and all
tests constructing compound claims. Inspection confirmed
`GovernedClaimInput`, the closed `CommunicationClaimType`, materiality,
ownership, source references, bounded completeness, claim-local conflicts,
`claimClassificationRulesetId`, `computeCommunicationClaimStatus`, and
`aggregateEvidenceStatus`.

Repository search confirmed that no production route, registry, parser, or
adapter constructs `GovernedClaimInput[]` from ordinary free-form chat. Typed
capability payloads are the only deterministic production request parsing
mechanism found. Only this document changes.

## Governing Artefacts Reviewed

The following were read completely before decisions were drafted:

1. `docs/ENGINEERING_CONSTITUTION.md`
2. `docs/architecture/NORTH_STAR.md`
3. `docs/architecture/JARVIS-Engineering-Specification-Standard.md`
4. `docs/CONSTITUTIONAL-PUBLICATION-PRINCIPLES.md`
5. `docs/architecture/ROADMAP.md`
6. `docs/audits/SPRINT-3.88-GOVERNED-CONVERSATIONAL-PRODUCTION-EVIDENCE-AUDIT.md`
7. `docs/SPRINT-3.76-GOVERNED-CONVERSATIONAL-RUNTIME-CONTRACT.md`
8. `docs/SPRINT-3.82-GOVERNED-CONVERSATIONAL-LINEAGE-IDENTITY-CONTRACT.md`
9. `docs/SPRINT-3.85-GOVERNED-CONVERSATIONAL-IDENTITY-CORRECTION-CONTRACT.md`
10. the Sprint 3.89 specification at this path on the review baseline

## Sprint 3.88 Claims Finding

The Claims Finding was reviewed in full: composer requirements, the current
production analogue, the deterministic-design gap, the Cassie decomposition,
classification and reasoning, and all nine questions. The audit establishes
evidence, not the decisions below. Each question is decided independently here.

## Claims-Boundary Architecture

**Claims-Boundary Architecture: Option C**

Option C is binding because it establishes one closed, ordered, pre-model path:
typed intent first, governed deterministic recognition second, deterministic
clarification third, and fail-closed unsupported last. It retains bounded
ordinary language while preventing the answering model from classifying its own
claims.

* **Option A is rejected:** typed-only execution needlessly removes bounded
  free-text utility even when a versioned grammar can publish the same intent.
* **Option B is rejected:** it does not give existing typed capability and UI
  publications explicit precedence over text recognition.
* **Option D is rejected:** it prevents direct governed handling of safely
  recognisable conversational requests and imposes an avoidable capability
  transition.

Unmatched language is published as unsupported. A governed intent with a
missing or unresolved required parameter is published as clarification
required. No model classifier participates.

## Decision 1 — Claim Unit and Authoritative Input

**Decision problem.** Define the independently evaluable unit and the input
that has authority to create it.

**Principles.** Claims are pre-model, deterministic, claim-local, fail closed,
and versioned.

**Options considered.** Explicit typed-intent publication gives strongest
directness but no free-text path; a matched governed-intent rule gives bounded
conversation but requires grammar maintenance; operator-confirmed clarification
resolves known missing parameters but adds a turn; raw text gives breadth but
has no claim authority.

> **Claim Unit Decision:** One claim is one independently answerable factual
> assertion with exactly one governed claim type, polarity, materiality value,
> required evidence-class set, completeness rule, evidence status, factual-value
> set, conflict set, ownership, and unsupported reason. Independently answerable
> assertions with different evidence rules are separate claims.

> **Authoritative Claim Input:** The immutable Governed Claim Set published by
> the Governed Claim Boundary Engine from either a validated typed-intent
> publication, a single matched rule in the Claim Boundary Ruleset, or an
> operator response to an engine-published clarification choice.

Raw free text is input to the recogniser, never authority. One operator sentence
produces zero, one, or multiple claims. Typed-only authority is rejected because
Option C includes governed patterns; pattern-only authority is rejected because
typed publications have precedence; raw-text authority is rejected because it
is not a deterministic classification publication. Implementation must split
each matched intent into its ruleset-declared claim template and must not merge
independent assertions.

## Decision 2 — Vocabulary, Compound, and Negative Claims

**Decision problem.** Fix vocabulary scope and representations for compound and
negative questions.

**Principles.** Closed vocabulary, claim-local evidence, bounded absence, and no
invented domain types govern this decision.

**Options considered.** Communication-only scope is concrete but prevents
separately governed families; a cross-domain framework preserves separation
without inventing types. A polarity field preserves the existing type vocabulary;
new negative types duplicate every type; untyped absence loses scope.

> **Claim Vocabulary Scope:** A cross-domain claim-family framework with each
> domain vocabulary closed and governed separately. Sprint 3.89 admits only the
> existing closed communication vocabulary; it creates no Calendar, memory, or
> generic source claim types.

> **Compound Question Rule:** Every independently answerable governed factual
> request becomes a separate claim. An unsupported independently answerable
> request receives a separate unsupported claim only when its existing closed
> type is recognised; an unknown family produces an unsupported evaluation
> segment rather than a fabricated claim.

> **Negative Claim Representation:** A ruleset-owned polarity field with closed
> values `affirmative` and `negative`, plus a bounded-completeness specification,
> represents negation. A negative answer is `available` only when governed
> coverage proves absence inside the declared source set and time/scope bounds.

Negative-scope types are rejected as vocabulary duplication. Bare absence is
rejected because it cannot distinguish observed absence, unavailable source,
insufficient coverage, and unsupported semantics. Implementations must add the
governed polarity and absence scope to future boundary publications without
changing current runtime code in this sprint.

## Decision 3 — Type, Materiality, Source, and Coverage Ownership

**Decision problem.** Assign deterministic ownership of classification fields.

**Principles.** The model, route, prompt builder, context builder, legacy state,
and connectors cannot assign claim governance.

**Options considered.** A dedicated engine centralises publication ownership; a
registry alone cannot own a run; distributed route or connector assignment loses
one deterministic authority.

> **Claim Classification Owner:** The Governed Claim Boundary Engine, applying
> the immutable Claim Boundary Ruleset.

> **Materiality Owner:** The Claim Boundary Ruleset; the engine copies the
> selected intent rule's fixed materiality into each claim.

> **Source and Coverage Rule Owner:** The Claim Boundary Ruleset; source-specific
> publishers supply observations and coverage facts but never choose claim
> requirements.

The recogniser selects exactly one rule or publishes ambiguity. The ruleset owns
claim templates, materiality, evidence classes, polarity, and completeness. The
projection composer consumes the claim set without recreation. Existing status
functions compute statuses after evidence evaluation. Registry-only,
route-owned, connector-owned, composer-owned, and model-owned assignment are
rejected because each breaks canonical run ownership or permits ad hoc rules.

## Decision 4 — Permitted Mechanisms

**Decision problem.** Close the recognition, clarification, and fallback set.

**Principles.** Ordered determinism, explicit ambiguity, and fail-closed
recognition apply.

> **Permitted Claim-Bounding Mechanisms:** (1) schema-validated typed capability
> payloads; (2) schema-validated typed UI actions; (3) exact commands and declared
> aliases; (4) bounded lexical patterns and deterministic grammar rules; (5)
> exact, source-qualified entity resolution with ruleset-declared unique-match
> criteria; (6) engine-published operator clarification choices for missing
> parameters, equal rule matches, or unresolved entities; (7) operator
> confirmation by selection of one such choice; and (8) fail-closed unsupported.

> **Prohibited Mechanisms:** LLM intent classification, probabilistic
> classifiers, embedding similarity, unrestricted semantic parsing, answering-
> model extraction, route or prompt inference, connector classification, and
> undeclared aliases or patterns.

> **Precedence Rule:** Validate typed capability payload; otherwise validate
> typed UI action; otherwise match exact command/alias; otherwise apply lexical
> patterns and grammar; otherwise publish clarification only for a recognised
> governed intent with a missing parameter, equal matches, or unresolved entity;
> otherwise publish unsupported.

At each stage, a valid unique match stops evaluation. An invalid typed payload
produces clarification for correctable missing fields and unsupported for an
invalid or ungoverned type; it does not fall through to text. Confirmation is
required only after a clarification publication. The model can phrase the
published choices but cannot add or select them.

## Decision 5 — Uncertainty

**Decision problem.** Surface boundary uncertainty without delegating meaning.

**Principles.** Structural uncertainty is distinct from evidence status and is
owned pre-model.

> **Claim-Boundary Uncertainty Vocabulary:** `recognised`,
> `missing_required_parameter`, `ambiguous_governed_intent`,
> `unresolved_entity`, `unsupported_language`, `unsupported_claim_type`,
> `source_unavailable`, and `insufficient_coverage`.

The first six are evaluation outcomes. The final two are claim evidence results
after a supported claim exists: `source_unavailable` maps through existing
status computation to `unavailable`; `insufficient_coverage` maps to the
identically named evidence status.

> **Clarification Ownership:** The Governed Claim Boundary Engine owns the
> ambiguity reason, closed choices, required fields, continuation token, and
> original evaluation reference. Clarification continues the same request and
> creates a new evaluation run referencing the prior run and operator response.

> **Model Role in Clarification:** The model may render engine-published wording
> and choices verbatim in meaning; it cannot invent a choice, resolve an entity,
> alter a reason, or create a claim.

No claim identity exists until classification and required parameters are
resolved. Unsupported segments stay in the Claim Boundary Evaluation and do not
enter the governed projection as fabricated claims. Generic-error collapse and
model-decided ambiguity are rejected because they erase deterministic cause.

## Decision 6 — Unsupported and Clarification

**Decision problem.** Fix unsupported triggers and the cases that allow another
operator turn.

> **Unsupported Trigger Rule:** Publish unsupported for no governed intent match,
> an ungoverned claim type or evidence category, a prohibited significance or
> authority request, a request requiring semantic/model classification, an
> invalid typed type, or ambiguity that remains after one engine-published
> clarification response.

> **Clarification-Permitted Cases:** A recognised governed intent missing a
> required parameter; multiple equal governed-rule matches with a closed choice
> list; multiple exact entity candidates; no exact entity candidate when a typed
> identifier can be requested; and a malformed correctable field in a known
> typed intent.

> **Clarification-Prohibited Cases:** No governed family match; an ungoverned
> claim or evidence category; importance/significance without a significance
> contract; prohibited authority; a request requiring probabilistic or model
> interpretation; and a second unresolved response to the same clarification.

Clarification never upgrades an ungoverned family. Transition into a typed
capability creates a new typed interaction, while clarification continues the
same request lineage. Silent fallback to the model is rejected because it
bypasses the boundary.

## Decision 7 — Claim-Family Separation

**Decision problem.** Separate prerequisites, actions, factual claims, absence,
and interpretation.

> **Claim-Family Separation Model:** Identity resolution is a deterministic
> prerequisite; retrieval is a capability action; closed factual types are
> claim templates; negative absence is polarity plus bounded completeness; and
> importance/significance is unsupported until separately governed.

| Claim family | Governed now? | Deterministic owner | Required evidence class | Status rule owner | Notes |
| --- | ---: | --- | --- | --- | --- |
| Identity resolution | Yes, as prerequisite | Boundary Engine + identity rule | Source-qualified identity candidates | Claim Boundary Ruleset | Never a broad communication claim |
| Contact-address lookup | Yes | Boundary Engine | Identity-qualified contact metadata | Existing evidence-status computation | Existing `contact_address_lookup` |
| Communication retrieval | Yes, only existing closed types | Typed capability and Boundary Engine | Governed communication publication | Existing evidence-status computation | Retrieval action and resulting claims remain distinct |
| Message-content retrieval | Yes, only existing closed types | Typed capability and Boundary Engine | Provenanced content with content kind | Existing evidence-status computation | Snippets do not establish full content |
| Importance/significance | No | Future significance contract | Not defined | `computeCommunicationClaimStatus` | Existing `message_importance` is published unsupported |
| Schedule/commitment | No claim type admitted here | Future Calendar claim-family contract | Future Calendar publication | Future contract | Source governance can precede claim admission |
| Absence/completeness | Yes, as representation | Boundary Engine | Closed source/time/scope coverage | Claim Boundary Ruleset + status computation | Negative polarity cannot imply coverage |
| Source retrieval | Yes, as capability boundary | Typed capability owner | Source publication and availability | Source contract | Does not itself prove claim relevance |

A generic `communication_question` is rejected because it hides distinct
requirements. Treating identity, retrieval, and importance as factual peers
without their separate boundaries is rejected because it launders prerequisites
or interpretation into evidence.

## Decision 8 — Conversational Breadth

**Decision problem.** Preserve collaboration without allowing connected-data
facts outside the governed boundary.

> **Conversational Breadth Rule:** Brainstorming, reflection, writing,
> explanation, general reasoning, and non-source-dependent advice produce an
> empty governed claim set and may proceed as open-ended conversation. Any
> assertion dependent on connected data, current application state, identity,
> retrieval, or bounded absence requires a governed claim or an explicit
> unsupported result.

> **Mixed Governed/Non-Governed Message Rule:** The Boundary Engine deterministically
> segments every uniquely recognised governed intent and its grammar-bounded
> span; all residual text is one non-governed segment. Recognised claims proceed
> through the governed projection, while the model receives the residual segment
> plus claim statuses and a prohibition on supplying connected-data facts absent
> from the claim set. Clarification blocks only the affected governed segment.

Rejecting every mixed message creates needless friction. Blocking all segments
for one clarification suppresses safe conversation. Letting the model segment
the message permits factual smuggling. Implementations must preserve the
engine-published segment map.

## Decision 9 — Ruleset and Publications

**Decision problem.** Identify canonical evidence that classification ran.

> **Claim Ruleset Publication:** `ClaimBoundaryRuleset` is an immutable canonical
> object owned by the governance-approved rules registry. It has
> `claimBoundaryRulesetId`, schema version, ruleset version, closed intents,
> grammar/aliases, precedence, claim templates, materiality, source and coverage
> requirements, polarity rules, and clarification rules. Its content-derived ID
> identifies one immutable body.

> **Claim Evaluation Publication:** `ClaimBoundaryEvaluation` is an immutable
> canonical run object owned by the Governed Claim Boundary Engine. It has a
> unique `claimBoundaryEvaluationId`, schema version, ruleset ID, thread/request/
> exchange references, input digest, permitted-context references, matched rule
> IDs and spans, entity-resolution result, segment outcomes, clarification or
> unsupported details, created-at time, and optional prior-evaluation reference.

> **Governed Claim Set Publication:** `GovernedClaimSet` is an immutable canonical
> object owned by the Governed Claim Boundary Engine. It has a unique
> `governedClaimSetId`, schema version, evaluation ID, ruleset ID,
> thread/request/exchange references, ordered claims with durable claim IDs,
> types, parameters, polarity, materiality, source requirements, bounded
> completeness, and segment links. Empty sets are valid only for no-factual-claim
> evaluations.

Each retry creates a new evaluation identity and, only when the outcome is
`recognised` or `no_governed_factual_claim`, a new claim-set identity. Identical
immutable bodies can be deduplicated only by the canonical content-derived
identity policy; ruleset, evaluation, exchange, and claim-set identities never
substitute for one another. Unsupported and clarification are discriminated
evaluation outcomes and produce no claim set. `claimClassificationRulesetId`
must reference the selected Claim Boundary Ruleset when a future adapter feeds
the existing projection. Synthetic, exchange-reused, and unversioned identities
are rejected because they cannot prove a distinct immutable run and output.

## Cassie Constitutional Test

Input: **“What's Cassie's email? Anything important?”**

The complete deterministic path under Option C is:

1. No typed payload or UI action is present.
2. The versioned grammar matches two non-overlapping declared aliases:
   `what is <person>'s email` → `contact_address_lookup`; and
   `anything important` → `message_importance`.
3. The Boundary Engine publishes two recognised intent segments. The grammar,
   not an LLM, performs the split and type assignment.
4. The exact entity slot `Cassie` is resolved under the identity rule. Multiple
   exact Cassie candidates produce `unresolved_entity` with engine-owned choices;
   one exact candidate supplies the stable entity reference.
5. The contact template fixes materiality `true`, identity-qualified contact
   metadata as its source class, and the source-qualified address completeness
   rule.
6. The importance template fixes materiality `true`, but the ruleset marks its
   significance definition unsupported under current governance.
7. The engine publishes one evaluation and one ordered Governed Claim Set that
   supplies two `GovernedClaimInput` records to the future adapter. No answering
   model has run or decided what either claim is.

| Claim | Governed type | Evidence condition | Current status |
| --- | --- | --- | --- |
| Cassie contact address | `contact_address_lookup` | Uniquely resolved Cassie; available source-qualified address; provenance and observation time; bounded coverage satisfied | Potentially `available`; otherwise existing rules yield `unavailable` or `insufficient_coverage` |
| Anything important | `message_importance` | Separately governed operator-significance definition and admissible evidence | `unsupported` |

The contact claim becomes `available` only after identity sufficiency, source
availability, address provenance, observation time, and coverage are all
satisfied. No conversational memory or unqualified snippet can supply the
address.

**The importance claim remains `unsupported` under current governance.** Unread,
Gmail-important, `needsReply`, labels, legacy attention ranking, and message
ordering do not establish operator importance, urgency, priority, or
significance. They cannot change the status to `insufficient_coverage` or supply
model inference. With both claims material, existing `aggregateEvidenceStatus`
produces overall `unsupported` even when the address is `available`.

## Source-Category Independence

| Category | Contract independent of claims? | Publisher implementation independent of claims? | Claim-linked wiring waits? | Binding reason |
| --- | ---: | ---: | ---: | --- |
| Gmail | Yes | No | Yes | Source publication semantics can be contracted now; implementation awaits that contract and admission governance; relevance requires claim rules. |
| Calendar | Yes | No | Yes | Event-evidence semantics can be contracted without inventing schedule claims; implementation and selection remain separately authorised work. |
| Memory/priorities | Yes | No | Yes | Provenance and operator ownership can be contracted without admitting priority claims; implementation cannot imply significance. |
| Connector availability | Yes | No | Yes | Availability is source state independent of claim meaning; implementation requires its own authorised sprint and claim mapping waits. |

The four determinations are therefore **Yes / No / Yes** in every row. Contract
independence authorises governance drafting only, not publisher code,
source-evidence registry admission, claim selection, or production integration.

## Source Evidence and History Relationships

Source-specific publication admission rules can be governed without claims when
they define provenance, observation time, availability, content kind, and
coverage facts without declaring relevance. Registry implementation,
claim-linked evidence selection, claim-reference validation, and model-exposure
policy depend on the claim ruleset and separate implementation authority.

Conversation-history classification and retention of non-canonical dialogue can
be governed independently. Retrieval references can be represented without
evidentiary authority. Deriving claims from prior turns and carrying unresolved
claims across turns depend on a future advanced continuity contract. History
text never creates a claim; only a typed publication, a current-request grammar
match, or an operator response to an engine-owned clarification does so.

## Conflicts Decision

**Conflicts Contract Decision: Option A**

Option A is selected because contradiction eligibility, affected-claim linkage,
status restrictions, evaluation coverage, publication identity, and EOS
admissibility depend on the now-fixed claim boundary and require a complete
dependent contract. Option B is rejected because a minimal subset here would
either leave material semantics open or exceed this claims-only sprint. This
contract makes no new conflict semantic decision; existing claim-local conflict
structures remain evidence, not new authority.

## Publication Architecture

```text
ClaimBoundaryRuleset
        ↓ applied by Governed Claim Boundary Engine to
Operator Request + Lineage + Permitted Context
        ↓ produces
ClaimBoundaryEvaluation
        ├── clarification_required / unsupported → no claim set
        └── recognised / no_governed_factual_claim
                    ↓ produces
             GovernedClaimSet
                    ↓ consumed by
Dedicated Conversational Projection Composer
```

The ruleset owns recognition rules, claim templates, materiality, evidence
classes, completeness, and its own identity. The evaluation owns the run,
segmentation, match, clarification, unsupported result, and lineage. The claim
set owns claim identities and instantiated governed fields. The composer only
consumes the claim set.

When all claims are recognised, the model receives the governed projection and
recognised residual conversation. When some segments are unsupported, it
receives recognised claims plus the explicit unsupported segment outcomes and
cannot answer those outcomes factually. When clarification is required, it
receives only engine-owned clarification content for that segment; other
recognised segments can proceed. With no governed factual claim, it receives the
open-ended text and the empty-set publication. For mixed content, it receives
the immutable segment map, governed statuses, and residual text. It cannot add,
merge, upgrade, or answer omitted connected-data claims.

## Final Decision Matrix

| Question | Final decision | Architectural owner | Binding mechanism | Rejected alternatives | Implementation consequence |
| --- | --- | --- | --- | --- | --- |
| One claim and authoritative input | Independently evaluable unit; claim-set publication is authority | Boundary Engine | Typed/rule/clarified publication | Raw text; blended claims | Split templates deterministically |
| Vocabulary, compound, negative | Separate closed families; split all independent requests; polarity + bounded absence | Ruleset | Closed type and polarity templates | Invented types; negative-type duplication | Preserve claim-local status |
| Type/materiality/source/coverage owner | Ruleset assigns; engine instantiates | Boundary Engine | Versioned rule template | Model, route, connector, composer | No ad hoc inference |
| Permitted bounding mechanisms | Closed Option C mechanisms in fixed order | Boundary Engine | Typed → exact → grammar → clarification → unsupported | Probabilistic and semantic parsing | Unique match or fail closed |
| Uncertainty | Eight-state closed vocabulary | Boundary Engine/status computation | Discriminated evaluation outcome | Generic error; model resolution | Publish cause and owner |
| Unsupported and clarification | Fixed triggers and one bounded clarification continuation | Boundary Engine | Engine choices + continuation lineage | Silent fallback; unbounded questioning | Ungoverned types stay unsupported |
| Claim-family separation | Prerequisite/action/claim/absence/interpretation separated | Ruleset and domain contracts | Closed family registry | Broad communication question | Domain contracts admit types |
| Conversational breadth | Empty claim set for open conversation; deterministic mixed segmentation | Boundary Engine | Segment map | Reject all mixed; model segmentation | Preserve non-factual collaboration |
| Ruleset and publication identity | Three distinct immutable canonical publications | Registry and Boundary Engine | Content/run/output identities | Synthetic, reused, unversioned IDs | Prove evaluation and output |
| Source-category independence | Contracts Yes; implementations No; wiring waits Yes | Source contract owners | Publication-only contract boundary | Claim-free relevance wiring | Parallel governance only |
| Conflicts relationship | Option A dependent contract | Future conflicts owner | Separate contract | Partial implicit semantics | Conflicts sprint precedes integration |

## Final Classification Matrix

| Item | Sprint 3.88 finding | Final outcome | Architectural class | Binding decision | Owner | Implementation consequence |
| --- | --- | --- | --- | --- | --- | --- |
| Claim unit | Open design gap | Accepted | Boundary | One independently evaluable assertion | Boundary Engine | Split claims |
| Claim vocabulary | Closed communication types exist | Modified | Vocabulary | Cross-domain framework; types governed per domain | Rules registry | No invented types |
| Compound questions | Cassie requires decomposition | Accepted | Construction | One claim per independent request | Boundary Engine | Separate statuses |
| Negative claims | Representation open | Modified | Representation | Polarity + bounded completeness | Ruleset | Distinguish absence states |
| Recognition mechanism | No free-text owner | Modified | Option C | Fixed deterministic precedence | Boundary Engine | No LLM classification |
| Type assignment | Owner absent | Accepted | Classification | Ruleset template instantiated by engine | Boundary Engine | Versioned type assignment |
| Materiality | Owner absent | Accepted | Classification | Fixed in rule template | Ruleset | No model assignment |
| Source requirements | Owner absent | Accepted | Evidence boundary | Fixed in rule template | Ruleset | Connectors cannot select |
| Coverage rules | Owner absent | Accepted | Evidence boundary | Fixed bounded-completeness template | Ruleset | No availability-driven inference |
| Unsupported language | Fail-closed needed | Accepted | Evaluation | Explicit unsupported variant | Boundary Engine | No silent fallback |
| Clarification | Governance needed | Modified | Evaluation | One engine-owned continuation | Boundary Engine | Closed choices only |
| Claim-family separation | Families materially differ | Accepted | Architecture | Prerequisite/action/fact/interpretation split | Rules registry | No broad type |
| Mixed conversational messages | Breadth requires decision | Modified | Segmentation | Engine-owned governed/residual map | Boundary Engine | Safe open conversation continues |
| Claim ruleset | Version identity missing | Accepted | Publication | Immutable `ClaimBoundaryRuleset` | Rules registry | Rules are auditable |
| Claim evaluation publication | Run proof missing | Accepted | Publication | Immutable `ClaimBoundaryEvaluation` | Boundary Engine | Each run has identity |
| Governed claim-set publication | Set proof missing | Accepted | Publication | Immutable `GovernedClaimSet` | Boundary Engine | Composer consumes, never recreates |
| Cassie contact-address claim | Separate material claim | Accepted | Constitutional case | `contact_address_lookup`; conditionally available | Boundary Engine/status function | Requires qualified evidence |
| Cassie importance claim | Separate unsupported claim | Accepted | Constitutional case | `message_importance`; unsupported | Ruleset/status function | No heuristic laundering |
| Source-category independence | Four contracts can proceed | Modified | Sequencing | Contracts only can proceed in parallel | Source governance owners | No publisher implementation authority |
| Conflicts sequencing | Dependent contract proposed | Accepted | Sequencing | Option A | Future conflicts owner | Contract before integration |

Counts: **Accepted 15; Modified 5; Deferred 0; Rejected 0** in this matrix.
Deferrals and mechanism rejections are recorded in the registers below rather
than used to avoid any required decision.

## Rejected Register

| Rejected item | False claim or authority problem prevented |
| --- | --- |
| Answering-model claim classification | Prevents the answerer defining its own evaluation boundary |
| LLM-based intent extraction | Prevents probabilistic meaning from becoming canonical fact |
| Unrestricted semantic parsing | Prevents undeclared intents and evidence rules |
| Embedding-similarity claim assignment | Prevents similarity scores masquerading as governed classification |
| Route-owned claim construction | Prevents transport code becoming a governance owner |
| Prompt-builder claim construction | Prevents prompt text creating canonical claims |
| Treating every free-text sentence as a claim | Prevents open conversation and unsupported language from being fabricated as facts |
| One blended claim for compound questions | Prevents independent evidence conditions being hidden |
| One blended status for the Cassie request | Prevents an address result concealing unsupported importance |
| Unread as importance | Prevents a mailbox state from becoming significance |
| Gmail-important as operator importance | Prevents connector heuristics from claiming operator authority |
| `needsReply` as significance | Prevents workflow inference from becoming evidence of importance |
| Labels as significance | Prevents arbitrary metadata from becoming operator meaning |
| Legacy attention ranking as evidence | Prevents compatibility data from gaining canonical authority |
| Silent unsupported-to-model fallback | Prevents the model bypassing fail-closed evaluation |
| Synthetic claim identities | Prevents test or transient labels from representing canonical objects |
| Unversioned recognition rules | Prevents untraceable classification changes |
| Implementation-selected recognition mechanisms | Prevents implementation discretion from changing Option C |

## Deferred Register

| Deferred matter | Why and missing governance | Blocks isolated claims implementation? | Blocks source-category contracts? | Blocks production integration? | Expected future sprint |
| --- | --- | ---: | ---: | ---: | --- |
| New claim families | Each needs closed vocabulary and evidence semantics | No | No | Yes for that family | Domain claim-family contract |
| Message-significance governance | Operator significance and admissible evidence are undefined | No; importance remains unsupported | No | Yes for importance | Significance contract |
| General-purpose natural-language recognition | Deterministic bounded grammar is the selected limit | No | No | No | No sprint scheduled |
| Conflict semantics | Claim-linked categories and coverage need a full contract | No for boundary engine | No | Yes | Dependent conflicts contract |
| Advanced cross-turn continuity | Carry-forward identity and expiry are ungoverned | No | No | Yes for continuity | History/continuity contract |
| Production UI design | Interaction affordances require implementation design authority | No | No | Yes | Production integration design sprint |
| Operator verification | Requires implemented isolated publications and evaluation | No | No | Yes | Verification sprint |
| Promotion | Requires contracts, implementation, evaluation, and verification | No | No | Yes | Promotion sprint |

## Files Changed

```text
docs/SPRINT-3.89-GOVERNED-CONVERSATIONAL-CLAIMS-BOUNDARY-CONTRACT.md
```

No source file, test, route, prompt, selector, or runtime file changed.

## Validation

Full-repository validation completed:

| Command | Result |
| --- | --- |
| `npm test` | Passed: 133 test files; 648 tests passed and 1 skipped |
| `npm run build` | Passed; Next.js completed the production build. Google Fonts stylesheet optimisation was skipped after a network download failure; compilation and page generation succeeded. |
| `npm run lint` | Passed: no ESLint warnings or errors |
| `npm run typecheck` | Passed: `tsc --noEmit` exited successfully |
| `git diff --check` | Passed: no whitespace errors |

Document checks additionally confirm one selected architecture and three
reasoned rejections; nine binding decisions; deterministic Cassie decomposition;
unsupported importance; intact heuristic exclusions; explicit source-category
answers; Option A conflicts sequencing; distinct publication identities;
complete matrices and registers; and no implementation authority.

## Implementation Authority

Sprint 3.89 establishes claims-boundary governance only. It does not implement
claim recognition, claim construction, clarification, UI affordances, route
behavior, source publication, conflicts, projection integration, model changes,
or production behavior.

> Sprint 3.89 authorizes no implementation and changes no production behavior.

## Next Step

The next permitted sprint is the dependent conflicts contract. Gmail, Calendar,
memory/priority, and connector-availability publication contracts can proceed as
parallel governance sprints. After the conflicts contract, an isolated
claims-boundary implementation sprint can implement Option C and the three
publications without production route integration.

## Recommendation

**Governed Contract Complete**
