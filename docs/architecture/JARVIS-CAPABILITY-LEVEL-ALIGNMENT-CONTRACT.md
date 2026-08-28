# JARVIS Capability-Level Alignment Contract

**Status:** Alignment contract. Applies to all future conversational, situational-awareness, reasoning and action capabilities.

## Purpose

JARVIS is intended to become a truthful, governed executive assistant that can increasingly operate through natural conversation without transferring system-syntax or orchestration burden back to the user.

The risk is not only unsafe execution. The risk is architectural drift: a feature may present as simple retrieval while quietly depending on semantic reasoning, recommendation, or authority that has not been explicitly governed.

This contract provides the standing test:

> **Which level is this actually operating at, and does the implementation match what the feature claims?**

If the implementation requires a higher level than the feature claims, that is a boundary violation.

## Level 1 — Know

Truthful factual retrieval and deterministic rendering from governed evidence.

A Level 1 path may:
- select an already-governed capability;
- acquire evidence under explicit authority;
- perform deterministic token/date/range matching;
- perform deterministic comparisons or contradictions;
- compose natural-sounding factual sentences through a bounded server-owned template grammar.

A Level 1 path may not:
- expose private evidence to a model for answer composition;
- let a model choose facts, omissions, emphasis or contrast;
- semantically summarise private evidence;
- rank importance;
- infer why an item matters.

### Rendering invariant

> **Governed factual answers may be composed only by a bounded deterministic renderer from governed evidence. A model may not choose which facts to include, omit, contrast, or how to phrase them.**

Natural-sounding output is not evidence of model composition.

Example:

`requested_day = tomorrow`  
`matched_event_day = Saturday`

A deterministic renderer may use an approved correction template:

`[event title] is [matched day], not [requested day].`

The renderer, not the model, decides that the deterministic mismatch activates that template.

## Level 2 — Understand

Semantic interpretation of governed private evidence.

This is the first level at which private evidence may become model-visible for semantic composition, synthesis, interpretation, relationship detection or prioritisation.

Level 2 is not granted merely because acquisition was authorised.

### Core invariants

> **Model visibility of private evidence grants reasoning context only. It grants neither authority nor truth status beyond the governed evidence supplied.**

> **Private evidence exposure must be purpose-bounded and minimal; acquisition authority does not imply unrestricted semantic exposure.**

Before any Level 2 feature is implemented, the Private Evidence Reasoning Contract must define:
- exact private evidence classes that may be exposed;
- raw versus derived representation;
- title / subject / body scope;
- item-count and time-window bounds;
- provenance and freshness requirements;
- current-turn versus persistent exposure;
- whether derived semantic interpretations may persist;
- cross-source reasoning permissions;
- absence-inference rules;
- containment of unsupported conclusions;
- explicit prohibition on authority effects.

## Level 3 — Advise

Reasoning that relates governed evidence to goals, plans, constraints, trade-offs or recommendations.

Example distinction:

Level 2:
`One email is administrative; the other confirms the interview panel details.`

Level 3:
`Nothing in those emails changes your preparation plan.`

The second statement relates new evidence to an existing plan and makes a judgment about its consequences.

Level 3 therefore requires the Level 2 evidence boundary plus an explicit advisory contract covering:
- goals and plan representations;
- recommendation semantics;
- uncertainty and reversal conditions;
- non-aggregable constraints;
- distinction between suggestion and authority.

## Level 4 — Act

Governed execution of external operations under explicit authority.

The model may propose an operation. It may not:
- manufacture permission;
- convert conversational fluency into authority;
- manufacture execution success;
- manufacture external state.

Authority and execution remain independently adjudicated and server-owned.

## Immediate sequencing

### Sprint 3.180c — Natural intent → governed authority handoff

Level: **pre-Level-2 / operation selection**

The model receives only the current user utterance and may propose an approved typed private operation.

It does not receive Calendar titles, Gmail contents, Drive contents, provider IDs or private evidence for semantic reasoning.

### Sprint 3.180d — Governed acquisition → deterministic factual completion

Level: **Know**

Authorised private evidence may be acquired, deterministically selected, compared and rendered.

Private evidence does not become model-visible merely because it was acquired.

Natural-sounding factual output remains server-rendered.

### Sprint 3.181 — Private Evidence Reasoning Contract

Level: **boundary definition for Understand**

This sprint defines what private evidence may become model-visible, under what purpose, scope, provenance, lifetime and containment rules.

Shipping the contract does not itself constitute situational-awareness capability.

### Sprint 3.182 — Situational Awareness

Level: **Understand**, unless a particular feature actually crosses into **Advise**.

A capability such as `What do I have tomorrow?` may still be Level 1.

A capability such as `What matters tomorrow?` is Level 2 because it requires semantic interpretation.

A capability such as `What should I do about tomorrow?` is Level 3 because it relates evidence to goals or recommended action.

## Four-proof progression — trust must be re-earned

The capability levels are not only a vocabulary. Each level is a separate proof obligation.

### Proof 1 — Know

**Question:** Can JARVIS separate model fluency from factual truth?

**Current status:** Substantially demonstrated for bounded reads. This status does not imply that broader semantic reasoning, advice, memory, or consequential execution have inherited the same trust.

### Proof 2 — Understand

**Question:** Can JARVIS reason over governed private evidence without turning inference into fact?

**Current status:** Not yet demonstrated. Sprint 3.181 defines the exposure boundary; a later bounded Level 2 capability must prove the behaviour under adversarial and live acceptance conditions.

### Proof 3 — Advise

**Question:** Can JARVIS make useful judgments without disguising recommendation as fact or authority?

**Current status:** Not yet demonstrated. Level 3 must independently govern goals, plans, constraints, uncertainty, recommendation semantics and reversal conditions.

### Proof 4 — Act

**Question:** Can JARVIS execute consequential actions while keeping model intent, human authority, external state and verification separate?

**Current status:** Not yet demonstrated. Success in bounded read authority is not evidence that consequential writes have passed this proof.

### Standing rule

> **The project does not get to win the argument once and live off that reputation. Each capability level must re-earn trust independently.**

Know succeeding does not confer legitimacy on Understand. Understand succeeding does not confer legitimacy on Advise. Advise succeeding does not confer legitimacy on Act.

The purpose of the roadmap is therefore not to assume the destination is reachable. It is to build a sequence of proofs that determines whether increasingly capable JARVIS behaviour can remain truthful, governed and useful as consequence increases.

## Worked-example labeling rule

Worked examples are useful for keeping the product destination visible, but they must not imply that the next architecture milestone alone makes the full interaction reachable.

Any example that crosses capability levels must be labelled with the highest level it actually reaches.

For example:

- `The panel composition changed.` — **Know**, if directly evidenced.
- `The change appears relevant to the focus of your preparation.` — **Understand**, if semantically inferred within the approved private-evidence reasoning contract.
- `I'd put more emphasis on how you've translated lived experience into system-level policy.` — **Advise**, because it recommends a change in preparation.

Therefore:

> **A destination example that spans Know → Understand → Advise must be labelled as a Level 3 destination example, not as evidence that Sprint 3.181 or Sprint 3.182 alone makes it reachable.**

Shipping Sprint 3.181 means the private semantic-exposure boundary has been defined. Shipping a later Level 2 proving capability means bounded understanding has been demonstrated. Neither should be described as having earned advisory reasoning until the Level 3 contract and implementation exist.

## Private-semantic boundary cadence

The normal product-development loop is fast and empirical, but new private semantic-exposure boundaries require pre-implementation adversarial governance.

For Sprint 3.181 and any later material widening of model-visible private evidence:

```text
audit
→ contract
→ adversarial paper tests
→ implementation
→ synthetic / fixture tests
→ bounded live acceptance
```

This exception exists because a first live failure at this boundary could expose real private evidence through an ungoverned reasoning path.

> **When failure would first expose real private evidence to an ungoverned reasoning path, do not use live failure as the discovery mechanism.**

## Drift tests

Every future feature should fail design review if any of these are true:

1. A Level 1 feature requires model visibility of private evidence.
2. A Level 1 renderer lets the model decide what facts to include, omit, contrast or emphasise.
3. A Level 2 feature quietly makes recommendations.
4. A Level 3 feature implicitly creates authority.
5. Acquisition authority is treated as unrestricted permission to expose private evidence.
6. A model-produced field appears descriptive but can alter authority, evidence status or execution.
7. A fluent response is treated as evidence that the system legitimately knew the facts it stated.

## Product alignment

The purpose of these boundaries is not to expose governance machinery to the user.

The target experience remains:

- the human speaks naturally;
- JARVIS carries the syntax and orchestration burden;
- JARVIS can truthfully say what it knows, what it inferred, and what it has not checked;
- increasingly rich reasoning becomes available only as the corresponding evidence and authority boundaries are deliberately opened.

The trust chassis must enable the product, not become the product.

The architecture should therefore move upward from parser growth toward governed reasoning over trustworthy state, while preserving the capability-level boundary test above.

## Companion Eight-Question Review

The capability-level test is paired with the JARVIS Eight-Question Review:

1. **Nadler — Problem:** What human cognitive burden are we removing?
2. **Anandkumar — First principles:** What must remain true regardless of implementation?
3. **Truell / Pichai — Product:** What is the simplest possible human interaction?
4. **Ibrahim — Trust:** What would make a reasonable person trust this behaviour?
5. **Raman — Verification:** How could we prove that claim false?
6. **Pineau — Dissent:** What is the strongest argument against this design?
7. **Bogdan-Martin — Institution:** What happens if millions of systems eventually behave this way?
8. **Sam — Authority:** Where does legitimate authority come from, and can JARVIS ever manufacture it?

The two frameworks serve different purposes:

- **Eight Questions:** *Should we build it this way?*
- **Know / Understand / Advise / Act:** *What capability boundary are we actually crossing?*

The Eight-Question Review is diagnostic, not generative:

> **Do not force all eight questions to produce work. Their job is to expose what matters, not manufacture complexity.**


## Standing review question

For every new feature, every sprint contract, and every appealing worked example:

> **Which level is this actually operating at, and does the implementation match what the feature claims?**
