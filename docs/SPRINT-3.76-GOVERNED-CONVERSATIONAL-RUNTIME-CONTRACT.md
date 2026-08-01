# Governed Conversational Runtime Contract

**Status:** Governed  
**Sprint:** 3.76  
**Authority:** JARVIS Architecture  
**Supersedes:** The non-authoritative classifications in Sprint 3.75; Sprint 3.75 remains the evidence base.

## 1. Purpose

This contract establishes the binding governance boundary for JARVIS's future ordinary conversational runtime. It decides what may enter conversation as evidence, what must be determined before model invocation, what the model may interpret, and what remains human authority.

The governing sequence is:

```text
authoritative observation
        ↓
canonical or governed runtime input
        ↓
deterministic evidence and capability status
        ↓
model interpretation and articulation
        ↓
human judgment and authority
```

Fluent model output cannot replace any missing earlier stage.

## 2. Scope

This contract governs the future ordinary `/api/chat` input boundary, communication evidence, compatibility data, evidence sufficiency, model authority, semantic response structure and validation, execution audit, direct content retrieval, conversation history, and natural-language rendering.

It does not implement, integrate, evaluate, promote, or alter any runtime. It does not change an ADR, responsibility statement, prompt, model, route, source type, test, selector, or production default.

## 3. Governing Authority

The review applied, in order, the Engineering Constitution; North Star; JESS; Roadmap; Constitutional Publication Principles; accepted ADRs, especially ADR-0005, ADR-0006, ADR-0012, ADR-0017, ADR-0022, ADR-0023, and canonical-runtime ADR-0024; existing responsibility statements; `OPERATIONAL-COMMUNICATION-RESPONSIBILITY.md`; Sprint 3.69; Sprint 3.75; and current source and tests.

The independent decision tests were authoritative source, stable identity, provenance, sufficiency, non-inference, canonical ownership, consumer independence, deterministic boundary, model necessity, and preservation of human authority. Current code demonstrates behaviour; it does not confer constitutional authority. Model usefulness is not evidence sufficiency.

The Roadmap was reviewed completely before these decisions were drafted. The repository precondition was met, and the Engineering Constitution, North Star, JESS, Roadmap, publication principles, communication responsibility, Sprint 3.69, Sprint 3.75, applicable ADRs, DAWNWATCH definition, BOA assembly, model invocation, audited chat, audit storage, capability routing, rendering, and relevant tests were inspected.

## 4. Existing Runtime Evidence

Sprint 3.75 establishes that visible DAWNWATCH conversation sends `{ agentId: "dawnwatch", messages }` to the ordinary branch of `POST /api/chat`, not the explicit capability branch. That branch builds legacy `OperationalState`, serialises selected fields through `context-builder`, assembles agent and BOA instructions, invokes Claude with raw request history, appends an execution record, and returns unmodified model text.

The communication block currently exposes subject, sender, snippet, unread marking, selected source labels, heuristic order, and a computed “requiring attention” count. It omits governed `gmailRecipientEvidence`, source and connector availability, evidence coverage, message identity, observation time, and governed provenance. Local fallback can therefore appear authoritative. The execution record proves bounded operational execution, not semantic correctness. `Subject`, `Assessment`, and `Recommendation` are model-created framing rather than a deterministic schema.

The separate capability branch supports explicit deterministic executive-context derivation and identified Gmail content retrieval. Sharing an endpoint does not make that branch ordinary conversation.

## 5. Authoritative Conversational Input Boundary

Future ordinary conversation is an interface consumer, never a state, projection, routing, or execution authority.

1. **Canonical boundary.** The future route shall consume the canonical interface publication required by ADR-0024—`ExecutiveInteractionContract` projected from `ExecutiveSession`—or a governed conversational projection of that exact contract. If Sprint 3.77 is constrained by the presently available named artefacts, it may compose a narrowly typed governed projection from the exact `ExecutiveStateSnapshot` and descriptive `ExecutiveContext` only when identity, provenance, availability, and run/session lineage are retained. It may not establish those intermediate artefacts as a second interface authority.
2. **`ExecutiveStateSnapshot`.** Canonical observation/state input; not model-authored, not independently rebuilt by chat, and not supplied without its identity and lineage.
3. **`ExecutiveContext`.** Only the descriptive context governed by its owning publication may supply model facts. Assessment-derived or deliberative context must remain explicitly distinct and retain its classification.
4. **Governed projections and capability statuses.** The immediate model input shall be a minimal, typed, claim-relevant projection with deterministic status. It shall remain independently useful without a model.
5. **Legacy `OperationalState`.** The full object is not an authorised future conversational input. It may exist outside chat during migration but must not remain a parallel state authority.
6. **Direct retrieval.** A separately authorised, policy-gated result may be joined as governed evidence only with resource identity, requested/returned fields, source, observation time, policy outcome, and content kind.
7. **History.** Dialogue history is labelled conversational context, never canonical evidence. Current governed evidence and status are refreshed for every request.
8. **Data minimisation.** Only fields necessary for the bounded question and safe articulation may enter the model context. Canonical runtime publications need not be copied wholesale.

Sprint 3.77 may implement this governed projection but may not let `/api/chat` directly reconstruct operational truth, choose among conflicting authorities, or consume a presentation aggregate as canonical state.

## 6. Governed Gmail Evidence Decision

**Binding decision: Option B, constrained coexistence.** Communication-related answers must consume governed `gmailRecipientEvidence` wherever it exists and the requested claim falls within recipient, participant, message identity, provenance, availability, or evidence-sufficiency ownership. Governed evidence controls those claims. Legacy communication fields may coexist only as separately classified compatibility metadata or bounded excerpt context.

The legacy-override rule is absolute:

```text
governed evidence exists for the relevant claim
→ legacy-only answer prohibited
```

For the same source-qualified communication, a governed/legacy disagreement shall not be resolved by convenience, recency guess, or model choice. The governed value controls fields it owns; the disagreement is retained as an evidence conflict, status is no better than `insufficient_coverage` for affected claims, and the response discloses the conflict. No legacy exception exists for recipient identity, address, To/Cc/Bcc membership, message identity, provenance, source availability, or coverage.

The only legacy fields that may remain are subject, sender display text, snippet, provider read/label metadata, source label, and received time under Section 7. They do not override a governed counterpart and cannot independently support governed identity, recipient, availability, absence, importance, urgency, actionability, or completeness claims.

## 7. Legacy Compatibility Boundary

`gmailThreads` may be projected field-by-field; it may not be supplied as an undifferentiated authoritative array.

| Legacy field | Permitted use | Prohibited use |
| --- | --- | --- |
| `subject` | Bounded descriptive metadata, source-qualified and linked to stable message identity | Proof of full content, significance, identity, or completeness |
| `from` | Display text describing the observed header | Verified person/contact resolution without governed identity evidence |
| `snippet` | Explicitly labelled partial excerpt | Full-body, attachment, absence, commitment, or complete-context claim |
| `receivedAt` | Descriptive time only when observation semantics and provenance are known | Hidden heuristic ordering or fabricated precision |
| `unread` | Clearly labelled provider read-state metadata | Importance, urgency, attention, workflow, action, or recommendation basis |
| `important` | No conversational authority | Any factual or interpretive significance claim |
| `needsReply` | No conversational authority | Workflow/actionability claim |
| `sourceLabel` | Clearly labelled acquisition/query attribution where operationally useful | Category, priority, importance, governance, or significance claim |

Legacy fallback data must be labelled compatibility/fallback data and paired with `unavailable`; it cannot be described as live Gmail observation. Heuristic ranking and “requiring attention” counts are not authorised. A future selector must use separately governed deterministic selection rules and must expose scope and coverage; this contract does not design that selector.

## 8. Evidence-Sufficiency Vocabulary

The following closed vocabulary is binding:

* **`available`** — sufficient governed evidence supports the bounded claim required by the question. It does not assert exhaustive knowledge.
* **`insufficient_coverage`** — relevant evidence exists or its source is available, but fields, provenance, scope, freshness, identity, retrieval depth, conflict state, or content do not support the requested claim.
* **`unavailable`** — a required source or capability cannot presently be observed or accessed. Local, mock, cached-without-authorised-freshness, or compatibility fallback cannot upgrade it.
* **`unsupported`** — the requested claim or operation is outside the governed conversational capability, regardless of model ability.

Status is deterministically derived before model invocation at the smallest applicable granularity: source, message/resource, question/claim, and answer segment. An overall answer status is a summary, never a replacement for more restrictive segment status. Mixed-status answers are permitted only when segments remain distinguishable and the summary preserves the most restrictive material limitation.

The status and its source references enter the model as immutable governed context and enter the response as machine-checkable envelope fields plus operator-visible language. The model may explain but never originate, override, omit, euphemise, or upgrade status. `unsupported` requires refusal of the unsupported claim or a clearly labelled supported reframing; `unavailable` requires disclosure rather than inference. Negative and exhaustive claims require positively established, bounded-complete scope; otherwise they are `insufficient_coverage` or `unavailable`.

## 9. Communication Claim Rules

1. **Contact/address lookup.** A verified answer requires a source-qualified address observation tied through governed evidence to stable message/participant identity, or a separately governed contact authority. Display names, snippets, labels, and history are insufficient. Ambiguous person matching is `insufficient_coverage` and requires clarification.
2. **Subject and snippet.** Subject is descriptive metadata. Snippet is a partial excerpt and must be labelled as such. Neither proves full message meaning, commitment, causality, recipient identity, or absence.
3. **Recipients.** To/Cc/Bcc and recipient-address claims follow Sprint 3.69 exactly, including provenance, source-qualified identity, coverage, and unavailable/unknown semantics. Bcc privacy and non-disclosure constraints remain in force.
4. **Importance/significance.** Importance is not canonical. The response may describe observed facts and offer a visibly model-owned interpretation of factors for operator judgment. It may not present Gmail `IMPORTANT`, unread, `needsReply`, labels, source/query labels, or ordering as importance.
5. **Urgency/attention/action.** No excluded legacy field or combination is sufficient. Without a separately governed consumer interpretation, the runtime states that urgency/attention/actionability is not governed, then may identify observable timing or content factors without concluding priority.
6. **Absence.** Missing legacy records, search terms, snippets, selected items, or retrieval results do not prove non-existence. An absence claim requires a governed query scope, successful source access, known coverage, relevant-field coverage, and a deterministic negative result.
7. **Unavailable source.** The response identifies the unavailable source and does not substitute fallback as live evidence. It may describe explicitly labelled compatibility data without answering the unavailable governed claim.
8. **Settled exclusions.** Unread, provider importance, `needsReply`, labels, categories, source labels, workflow, urgency, tasks, commitments, interpretation, and executive significance do not become canonical communication facts through context serialization or model prose.

## 10. Model Interpretation Boundary

After deterministic evidence and status, the model may explain observations, relate governed facts, identify visible tensions/dependencies, ask clarifying questions, describe possible interpretations, frame options, articulate uncertainty, and suggest considerations.

It shall not invent facts or identity; override status; turn partial or unavailable evidence into certainty; present heuristics as canonical significance; imply complete coverage; reuse prior prose as evidence; grant approval; decide priority; or acquire executive authority through confidence. Every material factual statement must be traceable to supplied governed evidence or explicitly labelled operator assertion. Interpretation remains model-owned and human judgment remains final.

## 11. Assessment Language

Model-generated **Assessment** is **Modified** and authorised only as **Model Interpretation**. The heading confers no authority. An assessment must be visibly separated from observed facts; identify evidence references; preserve per-claim status; label material inference and uncertainty; avoid unsupported significance; and never imply deterministic or human validation. If these conditions cannot be validated, the response shall omit the assessment or return a safe failure—not silently return ungoverned assessment prose.

## 12. Recommendation Language

Model-generated **Recommendation** is **Modified** as **Model Interpretation**, expressed preferentially as “Options,” “Considerations,” or “Suggested next steps.” Permitted language is advisory, evidence-linked, uncertainty-aware, and explicitly subject to operator judgment. It cannot imply approval, decision, priority, or execution authority.

No recommendation may be returned for the unsupported portion of an `unsupported` answer, may override `unavailable`, or may claim evidence-backed confidence under `insufficient_coverage`. In limited evidence states the model may suggest evidence-gathering or clarification, not the substantive operational decision. A recommendation cannot rest solely on excluded legacy heuristics. High-impact action-specific recommendation policy remains deferred unless already governed by an existing canonical proposal/approval boundary.

## 13. Response Structure

A structured semantic response envelope is mandatory, though final prose/UI wording is not prescribed. It shall contain:

```text
overall evidence status
per-claim/segment evidence status
observed facts with stable source references
model interpretation (optional, explicitly owned)
uncertainties and conflicts
options or suggested next steps (optional, advisory)
unsupported/refusal information (when applicable)
validation outcome
```

Free-form natural language may exist only inside typed, separately owned sections. Evidence status, source references, interpretation ownership, and validation outcome remain machine-checkable and operator-visible. Rendering may improve legibility but cannot add, suppress, or reclassify claims.

## 14. Semantic Response Validation

Deterministic validation before return is mandatory. Execution success is insufficient. The validator shall fail closed or return a deterministic safe response when it cannot establish:

* preservation and visible rendering of evidence status;
* refusal/reframing compliance for `unsupported` and disclosure for `unavailable`;
* source references for material observed claims;
* separation and labelling of observed fact, operator assertion, model interpretation, and recommendation;
* no governed claim based only on legacy data when governed evidence exists;
* no prohibited certainty, completeness, negative claim, or source substitution;
* snippet/full-content distinction;
* recommendation restrictions and advisory ownership; and
* deterministic envelope/schema validity.

Sprint 3.77 must enforce structurally decidable rules. Open-ended semantic entailment or universal factual verification is not authorised to a second model. Claims that cannot be deterministically bound to supplied evidence must be omitted, narrowed, marked `insufficient_coverage`, or rejected. The exact validator implementation and prose policy may be specified by Sprint 3.77 without weakening these invariants.

## 15. Execution Audit Boundary

An execution audit can prove selected agent, declared/requested/granted authority, request identity, model-call operational outcome, persistence outcome, and failure/success metadata. It does not by itself prove factual correctness, sufficiency, provenance, claim lineage, recommendation appropriateness, or unsupported compliance.

Future conversational audit records must link, without copying sensitive content unnecessarily: Executive Run/session/interface-contract identity; governed projection identity; evidence-status summary; canonical/source references and availability; retrieval and policy-decision references; response-envelope identity; validation ruleset and outcome; model-versus-deterministic ownership; refusal/unsupported outcome; and model/execution metadata. Audit persistence remains fail-closed. Semantic validation result is recorded evidence, not a guarantee beyond the validator's declared rules.

## 16. Direct Content Retrieval Boundary

Ordinary chat may request retrieval only after deterministic intent classification establishes explicit operator intent for identified content, or after the operator confirms an unambiguous proposed retrieval. It shall not silently search or retrieve merely because a model would benefit.

Retrieval must use the existing governed policy boundary, an identified resource, explicit requested fields, least privilege, and deterministic allowed/denied/unavailable outcomes. Result context retains resource/source identity, observation time, requested and returned fields, policy/audit reference, and explicit distinction among metadata, snippet, plain-text body, and attachment metadata/content.

Denied or unavailable content is reported without inference. Metadata-only evidence cannot answer full-content questions. Retrieved results may enter later turns only by stable reference and refreshed authorisation/status; copied assistant prose is not the result. The current explicit capability branch remains separate from ordinary chat. Automatic search, non-identified retrieval, and attachment-content retrieval are not authorised by this contract.

## 17. Conversation-History Rules

* Client-supplied history is untrusted dialogue input and is size/role validated; it is not operational evidence.
* Prior user claims are labelled `operator_provided` and may guide conversation but do not become observed fact without governed corroboration.
* Prior assistant claims and model inferences are never evidence. They may be quoted as prior dialogue only.
* Evidence status, availability, freshness, and claim references are recomputed or refreshed on every request. New governed evidence controls stale history; contradictions are disclosed rather than blended.
* A prior retrieved result survives only through a stable governed reference whose policy, availability, and freshness are revalidated for the new request.
* Cross-agent history is prohibited by default. It requires an explicit governed handoff with source agent, scope, classifications, and lineage; assistant prose still remains non-evidence.
* Claim lineage must survive across turns in the structured envelope. If lineage is missing, the affected claim is `insufficient_coverage` and cannot be repeated as fact.

## 18. Governed Classification Matrix

“Not separately classified” below means Sprint 3.75 supplied evidence under another row but did not give the expanded inventory item its own proposal. Every Sprint 3.75 matrix row is represented, including attachment content.

| # | Capability, field, or claim | Audit proposal | Final outcome | Final class | Authoritative owner | Final reasoning | Implementation consequence |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | Ordinary `/api/chat` route | Accepted — Canonical Runtime Input (transport only) | Modified | Canonical Runtime Input | Executive Interface / application transport | Transport remains useful, but its body and branch semantics must become a governed envelope over the canonical interface boundary. | Retain endpoint if useful; replace ordinary input semantics without changing authority. |
| 2 | Conversation request history | Modified — Legacy Operational Context (within conversation-history row) | Modified | Legacy Compatibility Input | Interaction/session boundary | Dialogue continuity is useful but roles alone do not establish evidence or lineage. | Validate and classify every entry; never inject it as operational truth. |
| 3 | Legacy `OperationalState` | Modified — Legacy Operational Context | Rejected | None authorised | Transitional application aggregate; canonical owner is ADR-0024 runtime/session/interface lineage | Full use would perpetuate a parallel state authority and hidden fallback. | Chat must not consume the full aggregate as future authority. |
| 4 | `gmailThreads` | Modified — Legacy Operational Context | Modified | Legacy Compatibility Input | Current application, field owners as governed elsewhere | Bounded display/excerpt value exists, but the aggregate mixes fallback, provider metadata, and heuristics. | Project only explicitly permitted fields with identity/status; never use wholesale. |
| 5 | `gmailRecipientEvidence` | Modified — Evidence / Provenance | Modified | Sprint 3.69 governed Gmail evidence projection | It is mandatory for claims it owns; mere presence is not automatically sufficient. | Join claim-relevant evidence and deterministic coverage/status. |
| 6 | Subject | Accepted — Legacy Operational Context | Modified | Source-qualified communication observation | Descriptive value is useful only when identity, provenance, source state, and content limits survive. | Supply as bounded metadata, not free-standing legacy text. |
| 7 | Sender | Accepted — Evidence / Provenance | Modified | Communication observation / governed participant evidence | Header display text is observable but does not prove a resolved person/contact identity. | Preserve raw/display semantics and require governed identity for contact claims. |
| 8 | Snippet | Modified — Legacy Operational Context | Modified | Source content metadata / retrieval boundary | A snippet is useful partial content but structurally insufficient for full-content claims. | Label excerpt and prevent full-body/absence conclusions. |
| 9 | Recipients | Not separately classified; covered by governed recipient evidence (Modified — Evidence / Provenance) | Accepted | Governed Evidence Input | Sprint 3.69 recipient evidence | Existing contract owns source-qualified recipient claims and their coverage. | Consume exactly under Sprint 3.69; do not reconstruct from legacy. |
| 10 | Message identity | Deferred with reply provenance — Evidence / Provenance | Accepted | Evidence / Provenance | Canonical communication/publication identity | Stable source-qualified identity is prerequisite to retrieval, conflict handling, and citations; citation UI detail need not defer the identity. | Require identity in governed input and claim references. |
| 11 | Observation time | Not separately classified; evidenced as omitted governed retrieval/observation time | Accepted | Evidence / Provenance | Governing observation/projection | Freshness and absence claims cannot be governed without observed-at semantics. | Carry observation time and distinguish it from message sent/received time. |
| 12 | Provenance | Deferred with reply provenance — Evidence / Provenance | Accepted | Evidence / Provenance | Governing observation/projection | Provenance is an input invariant; operator display granularity can evolve separately. | Preserve source/snapshot/reference lineage in envelope and audit. |
| 13 | Unread | Rejected — Heuristic Context | Modified | Legacy Compatibility Input | Provider metadata only; no OperationalCommunication canonical owner | The provider state may be described, but has no significance, attention, or workflow authority. | Include only if question-relevant and explicitly labelled; prohibit inference. |
| 14 | `important` | Rejected — Heuristic Context | Rejected | None authorised | Provider metadata has no conversational significance owner | Supplying it would invite precisely the canonical-importance inference the responsibility statement excludes. | Do not supply or use for selection, claims, assessment, or advice. |
| 15 | `needsReply` | Rejected — Heuristic Context | Rejected | None authorised | No governed workflow/actionability owner | It is presently unread-derived and invents workflow responsibility. | Remove from governed conversational inputs and reasoning. |
| 16 | Source label | Modified — Heuristic Context | Modified | Legacy Compatibility Input | Acquisition/query attribution only | Query membership can aid provenance only if its non-semantic nature is explicit. | Rename/render as attribution; prohibit significance and ranking use. |
| 17 | Heuristic ordering | Modified — Heuristic Context | Rejected | None authorised | No governed selector owner in this sprint | Hidden ordering selects evidence using excluded signals and biases synthesis. | Do not carry current ranking into governed chat; separately govern any selector. |
| 18 | “Requiring attention” count | Modified — Heuristic Context | Rejected | None authorised | No canonical attention owner for this computation | It deterministically launders excluded unread/important/action fields into significance. | Remove; do not replace except from separately governed attention publication. |
| 19 | Connector/source availability | Not separately classified; audit proposed evidence status Modified | Accepted | Capability Status | Connector/governed acquisition boundary | Availability is deterministic prerequisite evidence and must not be model-inferred. | Supply per source/resource and prevent fallback upgrades. |
| 20 | Relative-date reference | Accepted — Deterministically Derived Context | Modified | Deterministically Derived Context | Session/request temporal boundary | Explicit time is sound, but universal UTC prose does not settle operator timezone or claim-specific temporal semantics. | Derive from explicit reference instant and governed operator timezone; preserve both. |
| 21 | Deterministic evidence status | Modified — Evidence / Provenance | Accepted | Capability Status | Governed pre-model evidence evaluator | Closed status is constitutionally required to prevent fail-open prose. | Implement the four-state vocabulary before invocation and render it. |
| 22 | Unsupported-capability handling | Modified — Unsupported Capability | Accepted | Unsupported Capability | Deterministic capability boundary | Capability scope must be known before prose, with fail-closed handling. | Detect before model and validate response compliance. |
| 23 | Model interpretation | Not separately classified; assessment was Deferred — Model Interpretation | Modified | Model Interpretation | Model articulation layer | Interpretation is useful only after governed evidence/status and with explicit ownership. | Permit labelled, evidence-linked inference; never canonicalise it. |
| 24 | Model-generated assessment | Deferred — Model Interpretation | Modified | Model Interpretation | Model articulation layer | Structured separation and validation now provide sufficient governance without granting authority. | Permit only under Section 11 and validator rules. |
| 25 | Model-generated recommendation | Deferred — Model Voice / Wording | Modified | Model Interpretation | Model advisory layer; operator retains authority | Advice is cognition support, not mere voice, and must be evidence-linked and bounded by status. | Permit advisory options/next steps under Section 12; prohibit unsupported/high-impact overreach. |
| 26 | Uncertainty disclosure | Modified — Model Voice / Wording | Modified | Response Validation | Deterministic envelope/validator plus rendering | A prompt convention cannot enforce disclosure; material uncertainty must be derived/preserved structurally. | Validate status/uncertainty presence and operator visibility. |
| 27 | Direct content retrieval | Accepted — Canonical Runtime Input | Modified | Governed Evidence Input | Content-retrieval policy and connector boundary | Retrieved content is evidence, not generic input; ordinary chat needs explicit intent, identity, policy, and provenance. | Join only authorised results; no silent search or metadata-as-body answer. |
| 28 | Conversation history | Modified — Legacy Operational Context | Modified | Legacy Compatibility Input | Executive Session / interaction boundary | History supports dialogue but imports stale assertions and model synthesis. | Apply Section 17 taint, refresh, lineage, and cross-agent rules. |
| 29 | Execution audit | Accepted — Execution Audit | Modified | Execution Audit | Execution-audit boundary, linked to Executive Run | Existing process evidence is valid but insufficient for governed conversational lineage. | Add status, references, envelope, validation, ownership, and refusal linkage. |
| 30 | Semantic response validation | Not separately classified; identified as absent/gap | Accepted | Response Validation | Deterministic response boundary | A binding contract cannot rely on model obedience or operational success. | Validate the Section 14 invariants before return, fail closed. |
| 31 | Natural-language rendering | Accepted — Model Voice / Wording | Modified | Model Voice / Wording | Presentation layer | Rendering is legitimate only downstream of the structured envelope and cannot hide governance. | Render statuses, ownership, sources, and uncertainty without adding claims. |
| 32 | Attachment-content question | Deferred — Unsupported Capability | Deferred | None authorised | No current governed attachment-content retrieval owner | Attachment metadata is not content; policy, malware/privacy controls, formats, and extraction evidence remain unresolved. | Sprint 3.77 must return `unsupported`; it may not implement attachment content. |

### Classification totals

* **Accepted:** 8
* **Modified:** 18
* **Deferred:** 1
* **Rejected:** 5

### Departures from Sprint 3.75

The following are explicit outcome or class departures; expanded rows without an individual audit proposal are not counted as proposal reversals:

* Ordinary route: Accepted → Modified because transport is retained only with a replaced governed body.
* Full `OperationalState`: Modified → Rejected because ADR-0024 prohibits a parallel state authority.
* Subject: Accepted → Modified because identity/provenance/status constraints are mandatory.
* Sender: Accepted → Modified because display text is not resolved contact identity.
* Unread: Rejected → Modified solely as non-authoritative provider metadata when question-relevant.
* Heuristic ordering: Modified → Rejected because no authorised selector exists and its inputs encode excluded significance.
* “Requiring attention” count: Modified → Rejected because it launders excluded heuristics into an action claim.
* Relative-date reference: Accepted → Modified to require explicit operator timezone as well as reference instant.
* Evidence-sufficiency status: Modified / Evidence-Provenance → Accepted / Capability Status because it is a deterministic pre-model authority.
* Unsupported handling: Modified → Accepted because fail-closed capability classification is mandatory.
* Model assessment: Deferred → Modified because the structured ownership and validation rules now bound it.
* Model recommendation: Deferred / Model Voice → Modified / Model Interpretation because advisory reasoning is permitted only as evidence-linked synthesis.
* Uncertainty disclosure: remains Modified but moves from Model Voice to Response Validation.
* Content retrieval: Accepted / Canonical Runtime Input → Modified / Governed Evidence Input because ordinary-chat joining needs explicit intent and policy lineage.
* Execution audit: Accepted → Modified because future audit requires claim-governance linkage while retaining its bounded proof.
* Natural-language rendering: Accepted → Modified because it must render, and may not obscure, the semantic envelope.
* Message identity/provenance: Deferred → Accepted as mandatory input/lineage invariants; final UI citation granularity is not a reason to defer them.

## 19. Deferred Register

| Decision | Why deferred | Condition to reopen | Sprint 3.77 rule |
| --- | --- | --- | --- |
| Attachment-content retrieval and answers | No governed retrieval/extraction authority, field contract, content-security policy, format coverage, or provenance semantics exists | A separate governance decision establishes identified retrieval, least privilege, privacy/malware controls, extraction classification, status, provenance, and validation | Return `unsupported`; do not retrieve, infer, or summarise attachment content |
| Automatic non-identified search/retrieval | The existing capability is identified-resource-only and this contract does not create search authority | Separate governance defines explicit intent, search scope, identity resolution, coverage, privacy, and negative-result semantics | Do not implement automatic search |
| High-impact action-specific recommendation policy beyond existing governed proposal/approval boundaries | Impact taxonomy and domain authority are not established here | Separate domain governance supplies impact, approval, escalation, and evidence requirements | Restrict to evidence-gathering, clarification, or already governed advisory bounds |
| Operator-visible citation presentation granularity | Stable references and machine-checkable lineage are mandatory, but a specific UI form is not required for semantic governance | UI/accessibility design and operator evaluation | Preserve references and render them visibly; do not invent a new authority |
| Replacement deterministic communication selector | Existing heuristic selector is rejected; no new selection policy is evidenced | Separate policy defines claim relevance, coverage, stable ordering, limits, and negative-claim consequences | Do not reuse the legacy heuristic ordering |

Only attachment-content is a Deferred matrix outcome. The other entries are unresolved design/evidence requirements and must not be mistaken for authorised capabilities.

## 20. Rejected Register

* Full legacy `OperationalState` as the future chat authority.
* Gmail `important` as conversational evidence or significance input.
* `needsReply` as workflow/actionability evidence.
* Current heuristic communication ranking in governed conversation.
* Current “requiring attention” count.
* Legacy-only answers to a claim owned by available governed evidence.
* Prior assistant output as operational evidence.
* Silent fallback substitution, model-originated status, and model override of deterministic status.

Rejected items may not be implemented by Sprint 3.77 under aliases, prompt language, derived fields, or equivalent computations.

## 21. Implementation Constraints

> This contract establishes governance authority only. It does not modify `/api/chat`, prompt construction, model invocation, OperationalState, Gmail evidence, response validation, rendering, or production behaviour.

Sprint 3.77 may implement only Accepted and Modified matrix decisions and the binding boundaries in this contract. It must not implement Deferred or Rejected capabilities, change constitutional owners, introduce a parallel runtime/interface authority, silently retain legacy heuristics, or treat a prompt as enforcement. Integration, evaluation, operator verification, and promotion remain later stages.

## 22. Validation Results

The repository's full validation suite and the existing targeted conversational/runtime tests were required for publication. Results are recorded after execution in the committed version of this contract:

| Check | Result |
| --- | --- |
| `npm test` | PASS — 112 test files; 555 passed, 1 skipped (556 total) |
| Targeted existing tests (15 files) | PASS — 15 test files; 90 tests passed |
| `npm run lint` | PASS — no ESLint warnings or errors |
| `npm run typecheck` | PASS — TypeScript completed without errors |
| `npm run build` | PASS — production build completed; Google Fonts download was unavailable and Next.js skipped font optimisation |
| `git diff --check` | PASS — no whitespace errors |
| Change-boundary inspection | PASS — only this governed contract was created; no runtime, prompt, test, model, ADR, responsibility, selector, or production file changed |

## 23. Constitutional Conclusion

The future conversational model may articulate a governed account of reality; it may not manufacture that account. Governed Gmail evidence is mandatory for claims it owns, and legacy-only answers are prohibited when that evidence exists. The four-state sufficiency vocabulary is binding and deterministic. Assessment and recommendations remain visibly model-owned, evidence-linked, uncertainty-aware, advisory, and subordinate to operator judgment. Semantic validation and audit lineage are required but retain distinct responsibilities.

These decisions are sufficient to specify **Sprint 3.77 — Governed Conversational Runtime Implementation**. They do not mean the runtime has been implemented, integrated, evaluated, or promoted.

**Governed Contract Complete**
