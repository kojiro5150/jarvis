# JARVIS Governance Core

**Status:** Frozen pre-implementation doctrine  
**Frozen:** 30 August 2026  
**Scope:** Architecture and migration rules only. This document does not claim that the target architecture has been implemented or proven.

> **PLAN-TRUST-01:** Architectural doctrine may be frozen before implementation, but implementation claims remain untrusted until verified against real code, tests, and observed behaviour. A sound plan authorises construction, not confidence.

## North Star

> **JARVIS may propose authority-requiring operations. JARVIS may never manufacture the authority to perform them.**

> **JARVIS is unconstrained in cognition and constrained in authority.**

JARVIS is one persistent conversational intelligence. It may reason, interpret, challenge, synthesise, draft, explain, decompose requests, and construct proposals as richly as model capability allows. Governance exists underneath that intelligence. It does not need to leak into JARVIS's personality or ordinary conversation.

## Load-bearing trust rule

> **MODEL-TRUST-01:** No model-authored value may inhabit an evidence-bearing, authority-bearing, provenance-bearing, policy-proof-bearing, verification-bearing, or completion-proof-bearing type.

This is a structural rule, not an instruction to be sceptical of model prose. Model-authored text is descriptive text. It is never evidence merely because it is fluent, plausible, confident, or correct.

> **TRUST-HIERARCHY-01:** No LLM can truthfully be guaranteed never to hallucinate. JARVIS therefore reduces the situations in which a model is permitted to make unsupported factual assertions rather than treating model confidence as proof.

The intended trust hierarchy is:

```text
deterministic fact
  ↓
governed/private evidence
  ↓
authoritative public evidence
  ↓
clearly identified inference
  ↓
uncertainty / failure
```

JARVIS must never silently jump upward from uncertainty, missing support, or model inference into an asserted fact. The architectural objective is to turn trust from “the model is probably right” into **“the architecture requires evidence before this class of claim can be presented as fact.”**

This hierarchy is directional rather than a claim that all current runtime paths already implement claim-level provenance. Each implementation milestone must state which transitions are structurally enforced and which still depend on model compliance.

The target implementation must make violations type errors. A future Governance Core is not acceptable if a plain model-generated string or model-produced object can be supplied where trusted evidence, authority, provenance, policy proof, or verification is required.

The historical `task_summary` failure is the reference counterexample: a model-authored description reached a permission decision and could be read as if it were evidence. The future type system must make that dataflow structurally impossible.

## Public-information trust doctrine

**Status:** Adopted 30 August 2026 after live acceptance testing of the native public-web path. These rules formalise behaviour already implemented in the public-information runtime; they were not previously frozen under these names.

> **PUBLIC-GROUND-01:** A factual public claim may be presented only when retrieved public material supports the same entity, date or time period, location where relevant, and requested attribute. Missing or conflicting support remains missing or uncertain; JARVIS must not fabricate, interpolate, blend, or strengthen a public claim beyond the retrieved support.

> **PUBLIC-FRESH-01:** A public claim described as current, latest, newest, most recent, stable, active, incumbent, or equivalent must be supported by evidence establishing freshness as of the current user-local date. A plausible or historical candidate is insufficient; JARVIS must verify that no newer authoritative result supersedes it or report uncertainty/failure.

> **PUBLIC-CURRENT-01:** When authoritative public results establish multiple candidates for the same freshness-sensitive attribute, JARVIS must compare them and retain only the candidate that satisfies the requested freshness label. Superseded candidates may be reported as historical context only when asked or necessary, and source-native categories such as Current versus LTS must be preserved rather than collapsed.

> **PUBLIC-METADATA-01:** Source provenance metadata is itself factual content. JARVIS must not add an exact publication, release, update, or retrieval date unless that date is requested or necessary and directly supported by retrieved authoritative material; otherwise the date is omitted rather than inferred.

> **PUBLIC-MINIMAL-01:** For a simple freshness-sensitive public factual question, JARVIS returns the smallest complete answer that establishes the requested fact. Unasked historical, comparative, causal, trend, ranking, recommendation, implication, or adjacent-metric content is excluded merely because it was found or seems interesting.

> **PUBLIC-CONFLICT-01:** Agreement is not conflict. Public evidence may be labelled conflicting only when authoritative observations that are comparable on entity, period, requested attribute, and relevant measure are materially incompatible. Differences in representation, row type, adjustment method, or source taxonomy must be preserved explicitly rather than silently promoted to conflict.

> **PUBLIC-ANSWER-01:** For a simple freshness-sensitive factual question, JARVIS must return an answer-bearing factual sentence, not search narration, provenance-only commentary, result numbering, or a statement about what remains to be checked. If no answer-bearing sentence remains after deterministic filtering, JARVIS fails closed.

### Current implementation boundary

These rules do **not** mean that public claims now have deterministic claim-level provenance. The current runtime can require actual server-side web-search evidence for freshness-sensitive requests, constrain synthesis, and deterministically filter some classes of non-answer or embellishment. It cannot yet prove that every surviving natural-language sentence is semantically entailed by a specific retrieved source field.

The trust hierarchy therefore remains:

```text
deterministic fact
  ↓
governed/private evidence
  ↓
authoritative public evidence
  ↓
clearly identified inference
  ↓
uncertainty / failure
```

Public-information handling must never be described as hallucination-proof. The architectural objective is narrower and enforceable: progressively remove situations in which model-authored unsupported factual assertions are permitted to reach the user as fact.

## Input/output asymmetry

> **INPUT-FLEX-01:** Ordinary user-facing natural language should not be constrained more than necessary for reliable interpretation. Improving semantic understanding must not itself weaken authority.

> **MODEL-OUTPUT-01:** Where model output feeds a governed decision, its admissible semantic space must be as narrow and typed as that decision requires.

Rigidity therefore has two different meanings:

- rigidity applied to ordinary user expression is a smell when it exists only because interpretation is weak;
- rigidity applied to model output is often a deliberate governance control.

Closed outputs such as Understand's `scheduling_conflict | unsupported`, Advise's bounded outputs, and other closed model contracts remain valid examples of deliberate output-side rigidity.

Authority-conferring language is also not ordinary intent interpretation. A deliberately closed confirmation grammar is permitted because it determines whether authority exists, not what the user generally meant.

## Three execution classes

### A. Ordinary intelligence

```text
user
  ↓
JARVIS LLM
  ↓
reason / explain / challenge / synthesise / draft
  ↓
response
```

Ordinary reasoning is outside the authority protocol unless the turn crosses into private acquisition or execution.

### B. Governed private read

```text
user
  ↓
JARVIS interprets
  ↓
closed read proposal
  ↓
policy
  ↓
exact authority where required
  ↓
governed acquisition
  ↓
purpose-bounded release
  ↓
JARVIS or deterministic presentation, as separately authorised
```

> **MODEL-CONTENT-01:** Authorised deterministic release of private content to the user does not imply model access to that content. Model exposure is a separate governed capability boundary requiring its own policy, purpose, authority, and proof.

> **Private data may be released when it is part of the exact authorised read contract.**

> **Minimise unauthorised disclosure, not useful authorised disclosure.**

### C. Consequential write

```text
JARVIS LLM
    │
proposes operation
    │
    ▼
CLOSED REQUEST CONTRACT
    │
schema / semantic validation
    │
    ▼
AUTHORITY PROTOCOL
    │
┌───┴──────────────────────┐
│                          │
current evidence       user authority
+ provenance           bound to exact act
│                          │
└──────────┬───────────────┘
           ▼
PRE-EXECUTION RECHECK
           │
reality still matches?
      NO ──┴── YES
      │        │
    refuse   execute
               │
               ▼
       INDEPENDENT RE-READ
               │
       postconditions true?
          NO ──┴── YES
          │        │
 no success claim completion
```

The proven Calendar Act obligations remain:

- **ACT-01:** fresh provider state after authority and before mutation;
- **ACT-02:** divergence means no mutation;
- **ACT-03:** provider write response is insufficient proof of success;
- **ACT-04:** the resulting provider object is independently reacquired;
- **ACT-05:** the exact authorised postcondition is verified before a completion claim.

The pattern may transfer. Trust does not. Each new consequential capability must prove the obligations against its own provider semantics.

## Proposal construction

The LLM may become substantially better at proposal construction. It may:

- understand awkward or highly variable phrasing;
- split compound requests into multiple proposals;
- identify ambiguity;
- construct useful clarifying questions;
- normalise a request into typed operation parameters.

A model proposal means only:

> this is JARVIS's interpretation of the user's request.

It never means:

> this operation is authorised, evidenced, proven, or complete.

Compound proposals are independently governed. Authority for one sibling operation never authorises another.

## Disambiguation and purpose-bound evidence

Clarification is a distinct purpose, not an implicit widening of the requested capability.

A future clarification projection may expose only the fields needed to ask a useful question. Evidence visible for clarification does not automatically become evidence visible for answering, reasoning, execution, or verification.

> **Evidence visibility is purpose-bound, not merely capability-bound.**

## Conversation state and governance state

> **Conversation state may preserve meaning, but never manufacture authority.**

Conversation state may preserve references such as "the first one", "that meeting", or "the Georgia from Tuesday". Governance state owns exact provider identity, pending operation, provenance, policy result, authority, execution state, and verification state.

A conversational reference may identify what the user means. It cannot establish why JARVIS is permitted to act.

## Trusted values and constructors

Future trust-bearing types must be obtainable only through narrow trusted constructors or boundaries. Conceptually:

```text
validateOperation(...)
bindExplicitUserAuthority(...)
acquireGovernedEvidence(...)
evaluatePolicy(...)
verifyProviderState(...)
```

Generic helpers that promote arbitrary strings or objects into trusted values are prohibited.

Model-authored summaries, rationales, inferred intent, confidence, explanations, or self-descriptions may be retained as descriptive data, but can never satisfy trust-bearing requirements.

## Migration lock

> **MIGRATION-LOCK-01:** Once the typed Governance Core is introduced, no new capability-touching implementation may depend on a superseded authority mechanism. Legacy mechanisms may exist only for bounded migration of already-existing paths.

This rule becomes active when the trust-bearing type core lands. It exists specifically to prevent a new governed mechanism and an older independent mechanism from evolving in parallel.

## Golden Scenario gate

> **GOLDEN-GATE-01:** Before any architectural-collapse PR is merged, every relevant invariant-classified Golden Scenario test must pass. Any failure of a structural-containment test must be explicitly reviewed and either translated to preserve its underlying invariant or retired with a documented reason. Structural failures may never be dismissed merely as "expected." Historical-freeze tests remain evidence of prior architecture and do not independently prohibit a safe restructuring.

The standing classification is defined in `GOVERNANCE-CORE-TEST-CLASSIFICATION.md` and must be updated when a test's role materially changes.

## Controlled collapse

> **Nothing is removed merely because it looks complicated. It is removed only when its invariant is either demonstrably unnecessary or demonstrably preserved elsewhere.**

Every candidate deletion must record:

1. component;
2. original purpose;
3. invariant or proof obligation it protected;
4. structural replacement;
5. regression evidence;
6. retain / translate / retire decision.

Security should come from states the architecture makes impossible, not from how many places remember to say no.

## Architecture that is expected to simplify

The following families are candidates for collapse, not pre-authorised deletions:

- named specialist/persona routing in the live conversational runtime;
- specialist handoff machinery;
- capability-specific conversational guards that only compensate for missing typed boundaries;
- content-derived history heuristics once equivalent typed server-owned state exists;
- duplicated capability-specific authority plumbing where a common typed primitive is proven;
- duplicated opaque-reference mechanisms where lifecycle and trust semantics genuinely match;
- legacy execution routes after dependency and execution-path audits prove they are no longer live.

Useful reasoning modules may survive without remaining named personas or authority-bearing actors.

## Architecture that must not be weakened by simplification

Controlled collapse must preserve the substance of:

- exact authority binding;
- server-owned pending operations;
- replay protection;
- closed confirmation grammar;
- governed private acquisition;
- field- and purpose-level release policy;
- provider provenance;
- fail-closed ambiguity;
- pre-write freshness;
- divergence checks;
- independent post-write reread;
- exact postcondition verification;
- no hidden second execution path;
- deliberate closed model-output grammars;
- historical regression evidence.

## Target direction

```text
                         JARVIS LLM
                   understanding / reasoning
                  conversation / proposal
                              │
                              ▼
                      MODEL PROPOSAL
                      untrusted by type
                              │
                              ▼
                 CLOSED REQUEST CONTRACT
                              │
                   semantic validation
                              │
                              ▼
                     GOVERNANCE CORE
          ┌───────────────────┼──────────────────┐
          │                   │                  │
       POLICY              EVIDENCE          AUTHORITY
     typed result       typed provenance   typed user grant
          │                   │                  │
          └───────────────────┼──────────────────┘
                              │
                         authorised?
                       NO ────┴──── YES
                       │             │
                    refuse       capability
                                     │
                       ┌─────────────┴─────────────┐
                       │                           │
                     READ                        WRITE
                       │                           │
                acquire / release          fresh pre-check
                                                   │
                                                execute
                                                   │
                                         independent reread
                                                   │
                                        verify postcondition
                       │                           │
                       └─────────────┬─────────────┘
                                     ▼
                              GOVERNED RESULT
                                     │
                                     ▼
                                   JARVIS
                            natural presentation
```

There is no legal trust path:

```text
ModelText ─────X─────> Authority
ModelText ─────X─────> Evidence
ModelText ─────X─────> Provenance
ModelText ─────X─────> Policy proof
ModelText ─────X─────> Verification
```

## Verification standard

This doctrine is frozen; its implementation is not proven.

Every implementation PR must be inspected as code, tested directly, and evaluated against observed behaviour. Do not trust the architecture description, commit message, PR summary, model confidence, or aggregate CI alone when an independent observation can establish the invariant more directly.

A good plan earns the right to be built. It does not yet earn the right to be trusted.
