# Governance Core defensive guard deletion ledger

**Status:** PR G audit
**Date:** 30 August 2026
**Runtime deletions authorised by this audit:** none

## Decision

The current Governance Core types establish new trust categories, but they do not yet structurally replace the live transcript-, history-, and presentation-side protections in the existing JARVIS runtime.

> **Controlled-collapse result:** no defensive guard is deleted in PR G because no reviewed guard has yet lost its proof obligation or gained a complete structural replacement.

This is not a failure of the collapse plan. It is the deletion rule working as intended:

> Nothing is removed merely because it looks complicated. It is removed only when its invariant is demonstrably unnecessary or demonstrably preserved elsewhere.

## Ordinary model reply guard

| Rule family | Original purpose / proof obligation | Class | Current replacement | Decision | Retirement condition |
| --- | --- | --- | --- | --- | --- |
| Fake private-authority confirmation neutralisation | Ordinary model prose must not create authority UX for Calendar/Gmail/Drive acquisition | A invariant, B mechanism | `MODEL-TRUST-01` prevents trusted-type substitution, but live ordinary replies can still present misleading authority wording | **retain** | capability-touching proposal flow is fully typed and ordinary model responses can no longer be mistaken for authority prompts |
| False global capability-denial correction | Prevent model from claiming a governed capability does not exist merely because the ordinary path did not execute it | A truthfulness, B text classifier | no capability-truth registry is yet the sole presentation source | **retain / translate later** | capability availability is deterministically rendered from structured runtime capability state |
| Calendar historical-provenance attribution | Prevent recollection language from falsely claiming a fresh/current Calendar read | A provenance truthfulness, B rewrite mechanism | structured Calendar diagnostics exist but ordinary model still emits free text | **retain** | historical/current Calendar provenance becomes structured model input/output and deterministic presentation can enforce it without phrase rewriting |
| Calendar projected-field absence rewrite | Prevent “field not exposed” becoming “field absent at provider” | A evidence semantics, B text rewrite | no typed unavailable-vs-absent model projection yet | **retain** | private evidence projections represent withheld/unavailable/absent distinctly before model generation |
| Unbound user-detail collision correction | Prevent a user-supplied label from being attached to the wrong current Calendar commitment | A identity/evidence binding | no general structured conversational binding replacement yet | **retain** | binding state and resulting presentation are fully structural and model cannot merge unbound detail into provider evidence |
| Drive historical-provenance containment | Ordinary model must not reconstruct/claim prior governed Drive provider identity from excluded history | A provenance/identity, B content classifier | server-owned references exist in bounded paths but ordinary history remains content-derived | **retain / translate later** | Drive conversational references are resolved entirely from structured server state and provider IDs never enter ordinary model history |
| Internal omission-marker stripping | Omission sentinels are control artifacts, not user-facing content | B presentation containment | omission markers remain part of current sanitised history mechanism | **retain** | structured model-history projection replaces sentinel text |
| Timed Calendar user fact deterministic response | User-provided details must not be converted into fake authority/capability claims | A user-source attribution, B presentation rule | no typed user-fact projection owns this flow end-to-end | **retain** | user-supplied conversational facts are represented structurally and deterministic presentation no longer depends on ordinary model wording |

## Private capability handoff guard

| Rule family | Original purpose / proof obligation | Class | Current replacement | Decision | Retirement condition |
| --- | --- | --- | --- | --- | --- |
| Private acquisition handoff block | A model-generated specialist handoff must not become an alternate private acquisition route | A no-second-path, B specialist mechanism | specialist/handoff runtime still exists | **retain until PR H** | specialist/handoff execution path is removed and no alternate capability route remains |
| Ambiguous Drive read follow-up classifier | “read it/that” and provider-ID-like text must not reconstruct Drive identity or authority from model/history | A identity/authority, B regex mechanism | no general governed Drive conversational-reference resolver yet | **retain / translate later** | Drive has server-owned typed reference resolution for the supported follow-up family |
| Ambiguous Gmail evidence follow-up classifier | Unsupported references such as “that email” must not identify/read a message from ordinary history | A identity/authority, B regex mechanism | exact ordinal references are now governed, but broader unsupported anaphora remain | **retain / narrow later** | all supported Gmail references resolve from server-owned state and unsupported forms fail through the common reference boundary |
| Bare confirmation after containment | Repeated “yes/do it” must not manufacture a Gmail read when no pending operation exists | A exact authority/replay | pending authorization is strong, but containment responses still exist outside a pending operation | **retain** | all capability confirmation-like continuations are resolved solely through typed pending-operation state before presentation fallback |
| Provider-ID-like deny signal | A visible opaque-looking token after private history must not become trusted provider identity | A identity/provenance, B lexical heuristic | no structured Drive history state fully replaces it | **retain / translate later** | provider identity is unavailable to ordinary history and all referents are server-resolved |

## Model history boundary

| Rule family | Original purpose / proof obligation | Class | Current replacement | Decision | Retirement condition |
| --- | --- | --- | --- | --- | --- |
| Deterministic private-release omission | Private Calendar/Gmail/Drive presentation must not become ambient ordinary-model evidence | **A invariant** (`MODEL-CONTENT-01`) | no private reasoning exposure implementation exists; content-derived sanitisation is still the live barrier | **retain** | a structured model-history projection excludes private releases by typed provenance/purpose rather than rendered text |
| Prior exact Gmail/Drive read command omission | Provider identity and exact private-operation syntax must not become ordinary-model authority/evidence | A identity/authority, B regex mechanism | no structured transcript projection yet | **retain / translate later** | exact operations live only in server governance state and ordinary model history receives no authority-bearing identifiers |
| Governed Gmail/Drive history detectors | Activate deny/presentation guards without trusting client metadata | A containment signal, B content-derived mechanism | no trusted server-owned conversation state is wired through the live handler for this purpose | **retain / translate later** | `ConversationState`/server state is integrated into the handler and replaces content inference |
| Negative Calendar factual marker | Preserve historical negative result without falsely presenting it as a fresh read | A historical truth/provenance, B sentinel mechanism | no typed historical evidence projection yet | **retain** | historical negative evidence enters a structured recollection projection with provenance/staleness |
| Calendar original-request omission around governed factual release | Prevent prior private query wording from re-entering ordinary model history as if current evidence context | A purpose/history containment, B transcript pattern | no structured private-turn envelope yet | **retain / translate later** | governed private turns are represented outside ordinary model transcript entirely |

## What the Governance Core already replaces — and what it does not

The new core **does** now make these categories explicit and non-interchangeable at type level:

- model-authored text;
- validated operation;
- authority evidence;
- governed evidence;
- provenance;
- policy proof;
- verification/completion proof;
- conversation reference/state;
- server-owned governance state;
- untrusted model proposal.

But those types are not yet wired through every existing live capability path. Therefore they do **not yet** replace:

- content-derived private-history sanitisation;
- free-text ordinary-model truthfulness correction;
- specialist-handoff containment;
- capability-specific ambiguous-reference deny rules.

Deleting those now would remove proof obligations rather than architecture.

## Controlled-collapse ledger

| Component | Purpose | Underlying invariant | Replacement status | Regression evidence | Decision |
| --- | --- | --- | --- | --- | --- |
| `ordinary-model-reply-guard.ts` | truthfulness + fake authority containment | model prose cannot create authority/evidence/current-provider claims | partial only | `ordinary-model-reply-guard.test.ts`, route regressions | **retain** |
| `private-capability-handoff-guard.ts` | stop alternate private acquisition/identity paths | no second execution/acquisition route; no model/history identity manufacture | partial only | guard tests + route private-handoff tests | **retain until H / later reference migration** |
| `model-history-boundary.ts` | stop private presentation becoming ambient evidence | `MODEL-CONTENT-01`; provider IDs/history not authority | no structural history replacement yet | model-history tests + private-content-boundary tests | **retain** |
| specialist/handoff checks inside `chat-handler.ts` | block model-generated routing around governed capability paths | no second route | scheduled for PR H | route tests / historical Gmail containment | **retain until H** |

## Standing rule for PR H and later

Any deletion PR must cite this ledger row and show:

1. the exact invariant being preserved;
2. the new structural replacement;
3. the invariant-classified tests that prove the replacement;
4. why the old mechanism no longer carries an independent proof obligation;
5. whether the old test is retained, translated, or retired.

“The new architecture is cleaner” is not a deletion argument.

## Audit conclusion

PR G earns **zero runtime deletions**.

That is the correct outcome at this point in the migration. PR H may remove specialist/handoff runtime structure because its relevant proof obligations can be translated into the single-JARVIS capability boundary. The history and ordinary-model guards require further structural migration before they can safely collapse.

## PR H specialist/handoff collapse result

PR H removes the specialist/handoff runtime mechanism itself:

- non-JARVIS specialist identities are removed from the active registry;
- relay-specialist prompt synthesis is removed;
- model-generated `propose_handoff` parsing and `routeTo/taskSummary/marketScopes` responses are removed;
- the hidden UI handoff confirmation workflow is removed;
- the specialist catalogue endpoint is removed;
- handoff phrase parsing is removed from the live UI path.

The no-second-private-path invariant is preserved by **removing the alternate route**, not by weakening the private-capability guards. Gmail/Drive ambiguous-reference containment, pending-authorization checks, ordinary-model truthfulness guards, and private model-history sanitisation remain in place because their proof obligations are independent of specialist routing.

Test treatment:

- specialist roster, relay, and handoff-UI assertions are structural Class B and are translated to single-JARVIS runtime assertions;
- any assertion that a private capability cannot execute through a second route remains Class A and must continue to pass;
- no historical containment evidence is deleted merely because the specialist mechanism is gone.
