# JARVIS — Roadmap to a Non-LLM-Dependent Executive Operating System

**Status:** Living document. Last updated 2026-08-01 following the DAWNWATCH governance/implementation/evaluation/integration sequence.

**Purpose:** This document records where JARVIS actually stands, what has been *proven* versus merely *understood* versus *conjectural*, and the disciplined path toward an everyday executive assistant — not a governance system scaled to one user — that expands situational awareness, orientation, and cognition, and collaborates on the work of the day, without depending on an LLM to originate facts.

---

## Governing Method

Every phase below is subject to the same repeatable sequence, proven across the Dashboard and DAWNWATCH migrations:

```text
Discover → Govern → Implement → Evaluate → Integrate → Verify → Promote
```

And the same constitutional test before any new structural work begins:

> **Capabilities are evidence-led. Safety boundaries are consequence-led.**
> What observed behaviour does this explain that the current architecture cannot?
> (For safety/governance work: what unacceptable outcome does this prevent, even once?)

No phase below is authorised to skip Discover/Govern and jump to Implement, regardless of how well-understood it seems.

---

## Confidence Tiers

```text
Proven and operational
    Phase I  — Deterministic Runtime Foundation
    Dashboard (governed, evaluated, integrated, promoted — live in production)
    Calendar & Gmail generic projection adapters

Implemented but awaiting final evidence and promotion
    DAWNWATCH (governed, implemented, evaluated, integrated — promotion blocked
    on one named gap: Gmail recipient data)

Ready for disciplined discovery
    Conversational runtime (/api/chat) migration
    Gmail recipient projection (blocking DAWNWATCH promotion)

Known strategic directions, not yet architecturally earned
    Role-specific projection adapters
    Deterministic executive cognition (Candidate Construction/Evaluation/
    Comparison — built, unwired, unused; awareness, dependency analysis,
    conflict detection and planning, not primarily recommendation-production)
    Approval Records / governance event layer
    Voice interface
    Anomaly detection & cross-role continuity
    GE / PHDSS / BOA pattern synthesis
```

---

## Phase I — Deterministic Runtime Foundation ✅ Complete

Canonical models (OperationalCommitment, OperationalCommunication), the 14-stage EOS deliberation pipeline, projection/assembly architecture, AvailabilityEngine, and the constitutional discipline itself — Source-Specific Authority, Evidence-Proportionate Architecture, the five-step governance review protocol. This is the substrate everything else sits on.

---

## Phase II — Projection & Presentation Layer — Nearly Complete

**Dashboard:** governed (Sprint 3.58), implemented (3.59), evaluated with runtime-computed classification (3.60/3.60.1), integrated behind an explicit selector (3.61), and **promoted** to production default (3.62). Confirmed live against the real running application.

**DAWNWATCH:** governed (3.64), implemented (3.65), evaluated (3.66), integrated (3.67). **Not yet promoted.** Three real production-evidence bugs were found and fixed by hand after integration (missing assertion identity, missing source observation evidence, missing memory source) — all verified against real operational data. One gap remains, deliberately unresolved:

> Communications cannot reach `available` status because `EmailMessage` has no recipient field. Fixing this requires a real Gmail connector change (fetching recipient headers from the live API), not a presentation-layer fix.

### Immediate next steps

```text
3.68 — Gmail Recipient Projection Audit
3.69 — Governed Gmail Recipient Contract
3.70 — Gmail Recipient Implementation
3.71 — DAWNWATCH Re-evaluation
3.72 — DAWNWATCH Operator Verification
3.73 — DAWNWATCH Promotion
```

Numbers are indicative, not binding — the audit may reveal the sequence needs to grow or shrink. The audit (3.68) must establish, before any implementation:

- which Gmail fields are actually available from the connector;
- whether `to`, `cc`, and `bcc` are distinguishable;
- whether aliases, groups, delegated mailboxes, and hidden recipients affect semantics;
- what counts as sufficient recipient evidence;
- how provenance is retained;
- whether historical messages lack coverage;
- whether recipient absence means "none," "not fetched," or "not authorised."

---

## Phase III — Conversational Runtime Migration — Not Started, Highest Value

`/api/chat` still runs entirely on legacy `OperationalState`. This is where the project's original motivating bug lives — a confident scheduling claim followed by an unprompted retraction — and it has not been fixed, only worked around at the margins (Sprint 3.58.1's deterministic relative-date context). Sprint 3.51 exposed `ExecutiveContext` and governed retrieval to `/api/chat` *in parallel*, but the default conversational path was never migrated.

This is arguably the single highest-value remaining phase, because it is the surface most conversations actually touch.

### Required first step: full audit, mirroring Sprint 3.63's DAWNWATCH audit

```text
request
  → /api/chat
  → state acquisition
  → prompt/context assembly
  → model invocation
  → response validation
  → client rendering
```

The audit must identify every place where legacy state, temporal inference, connector heuristics, role context, or unsupported claims enter the conversation, before any governed conversational contract is written.

---

## Phase IV — Role-Specific Projection Adapters — Not Started

Everything built so far is generic Calendar/Gmail. Nothing yet reflects the three actual operational roles (Barwon Health Service Experience Lead, LLEGC Co-Chair, GE CEO) as distinct contexts with distinct obligations, boundaries, and priority weightings. This must remain audit-first — treating it as "build three adapters" would invite exactly the swamp of heuristics, identity inference, and cross-role leakage the project has spent this session learning to avoid.

---

## Phase V — Deterministic Executive Cognition — Built, Unwired, Unused

**Renamed from an earlier draft's "Deterministic Decision-Support Reasoning," and the rename matters, not just as wording.** JARVIS is not PHDSS. PHDSS asks "what should a Board understand before making this decision" — episodic, high-stakes, institutional. JARVIS asks "what do I need to know, remember, focus on, and do right now" — continuous, everyday, personal. Framing this phase around producing *recommendations* quietly imports PHDSS's centre of gravity; framing it around expanding *executive cognition* — awareness, orientation, prioritisation, dependency analysis, conflict detection, and planning among its manifestations, decision support only one consequence among several, never the mission — keeps JARVIS what it's actually meant to be: an everyday executive assistant, not a governance system scaled down to one user.

The EOS pipeline already contains real, built stages — **Candidate Construction, Candidate Evaluation, Candidate Comparison, and Executive Reasoning** (Sprints 3.10–3.23), sitting within the full 12-stage pipeline (Projection → Situational Awareness → Attention → Situation Formation → Situation Assessment → Executive Context → Intent & Constraints → Candidate Construction → Candidate Evaluation → Candidate Comparison → Executive Reasoning → Governed Action Proposal) — deterministic, structured reasoning that predates and does not require an LLM. This is currently the most under-leveraged asset in the codebase. "Executive Cognition" is the framing for what this phase is *for*; it does not rename or replace these existing stage names, which remain the actual, built vocabulary to audit and wire.

What this phase is actually for, in the everyday-assistant terms it should be judged against: forgotten commitments, conflicting obligations, hidden dependencies, upcoming bottlenecks, drifted assumptions, competing priorities, available capacity — the ordinary, continuous "what's happening, what changed, what needs attention" questions, not "what should I decide." An LLM, if used at all in this layer, articulates trade-offs in natural language over facts this pipeline already computed — it never originates the facts or the framing.

**Audit-first requirement:** what do the existing stages actually do against real projected state right now; what would connecting them require; what is the correct constitutional boundary for where deterministic output hands off to LLM-mediated conversation.

---

## Phase VI — Approval Records / Governance Event Layer — Deferred

Paused at Sprint 3.24 specifically to build the deterministic foundation first. This is where JARVIS moves from *informing* to *proposing and acting with explicit human approval*. Cannot meaningfully begin before Phase III (a trustworthy conversational runtime) and benefits directly from Phase V (structured reasoning to generate defensible proposals, not just LLM suggestions).

---

## Phase VII — Voice Interface — Deliberately Last

By original design. A mic-capture hook exists (amplitude display only, explicitly no STT behind it). Real work has not begun, and should not begin before the reasoning underneath it is trustworthy — voice makes bad answers *more* dangerous, not less, by removing the visual pause to double-check.

---

## Phase VIII — Anomaly Detection & Cross-Role Continuity — Speculative

End-of-day summaries, boundary-keeping between roles, proactive anomaly detection. Depends on Phases III–V being solid. Anything more specific than that right now would be premature architecture.

---

## Cross-Cutting: GE / BOA Principles Applied to JARVIS's Design

**Grounded directly in the source papers** — *Behavioural Orchestration Architecture* (Hayward, 2026, working paper v3) and *Governance Engineering: Architecture, Methodology, and Empirical Evidence* (Hayward, 2026, working paper v2) — read in full, superseding the earlier code-inferred version of this section. PHDSS remains one *application* of this theory, not its source; JARVIS is a different application of the same theory, for single-user everyday executive assistance rather than multi-stakeholder institutional governance. What follows adopts BOA/GE's architectural *disciplines* — how reasoning is produced, checked, and recorded — not PHDSS's *purpose or shape* (episodic, high-stakes, Board-facing governance). A property below is worth adopting only where it makes JARVIS's everyday assistance more trustworthy; none of them are a reason to make JARVIS more governance-shaped.

### BOA's seven properties, checked against JARVIS's current state

BOA defines behavioural orchestration architecture as seven properties that only function as a system when assembled together — removing any one degrades the whole, not just that property. Honest accounting against JARVIS as it stands tonight:

| Property | Failure mode it addresses | JARVIS's current state |
|---|---|---|
| **Obligation-bound role design** | Role ambiguity, responsibility diffusion | Partial. Sprint 3.64's governed contract obligates DAWNWATCH to specific input boundaries and forbids specific reconstructions — a real obligation, not just a description. Not yet extended to other specialists. |
| **Epistemic containment** | Dominant voice capture | Not applicable yet — JARVIS's specialists don't currently share a synthesis stage to be captured within. Becomes relevant only if a cross-specialist synthesis layer is built (see Phase gap below). |
| **Staged convergence** | Premature closure | Present in spirit: governance → implementation → evaluation → integration → promotion never collapses stages. Not yet applied *within* a single reasoning act. |
| **Failure visibility** | Analysis assuming best-case conditions | Present and load-bearing. DAWNWATCH's evidence-sufficiency vocabulary (`insufficient_coverage`, `unavailable`) is exactly this property, implemented in code rather than prompted. |
| **Mandatory adversarial challenge** | Absence of institutionalised dissent | **Absent.** Nothing in JARVIS currently argues against its own dominant conclusion before presenting it. Real gap — see Deliberate Advocacy Principle below. |
| **Falsification discipline** | Unfalsifiable governance decisions | **Absent as an explicit discipline**, though DAWNWATCH's status vocabulary is a close relative — it states what evidence exists and doesn't, which is halfway to stating what would change the answer. |
| **Accountable determination with permanent record** | Accountability-free conclusion | **Absent.** JARVIS has no equivalent of a Decision Ledger — no persistent, structured record of what was reasoned, challenged, and accepted for any single executive decision. This is the clearest concrete gap for Phase VI. |

Three of seven are genuinely present (in different form, but functioning); one is partial; three are real, named gaps — not vague aspirations, but specific missing properties with specific failure modes attached.

### The three foundational distinctions — and one already validates JARVIS's existing design

BOA states three distinctions that separate it from ordinary prompt engineering: **obligation over role**, **interaction architecture over prompting**, and — most relevant here — **reasoning record as primary output over decision as primary output**. The paper's own words: *"Most deliberative systems treat the decision as the primary output and the reasoning as secondary or transient. Behavioural orchestration architecture reverses this relationship."*

This is a direct, independent validation of DAWNWATCH's existing design. Its governed contract already produces structured semantic status (`available` / `insufficient_coverage` / `unsupported` / etc.) *before* prose — the reasoning record exists as a first-class artefact, and the voice layer renders it afterward rather than being the only output. That wasn't built with BOA's language in mind, but it's the same distinction, independently arrived at. Worth stating explicitly as design guidance going forward: any future JARVIS reasoning layer should keep this order — structured record first, natural-language rendering second — not the reverse.

### GE's six structural properties as an audit checklist for any future JARVIS reasoning layer

GE names six properties adequate governance requires simultaneously: multi-domain, adversarially challenged, epistemically honest, reality-tested, transparent, auditable. Whenever Phase V (deterministic executive cognition) or Phase VI (Approval Records) actually gets built, this table is the right audit to run against the design before implementation — not after.

### Two named design patterns worth adopting directly, not reinventing

**The Deliberate Advocacy Principle.** BOA's precise formulation: the challenge function *"derives its advocacy obligation at runtime from the direction of the dominant signal rather than occupying a pre-assigned position."* Not a fixed skeptic persona — a function that always argues against wherever the current reasoning is currently leaning, whichever direction that happens to be. This is the exact shape a future JARVIS "did I miss something" check should take, if Phase V ever produces something resembling a recommendation: not a permanent devil's advocate role, but logic that inverts based on where the analysis actually landed.

**The categorical refusal obligation / non-aggregable constraint.** BOA's distinction: most considerations get weighed against each other, but some boundaries should sit entirely *outside* that weighing — never outvoted by a sufficiently strong signal elsewhere. Directly relevant to how any future JARVIS priority-scoring or decision-support layer should treat hard constraints (privacy boundaries, safety-relevant refusals): not as one weighted input among many, but as a check that runs before weighting happens at all.

### Confirmed: the Chair Decision reversal is the current, live PHDSS architecture

Correction to an earlier draft of this section, now resolved with direct evidence. Both papers, as originally uploaded (BOA v3, GE v2), describe the Chair issuing a recommendation from a defined vocabulary (PROCEED WITH CONDITIONS / CONDITIONAL APPROVAL / PILOT / DEFER / DO NOT PROCEED) — but a newer build of the live application confirms this vocabulary is retired in the actual, currently-running system. The system prompt itself now states explicitly: *"You do not issue a recommendation, a proceed/defer/halt instruction, or any preferred course of action — that authority belongs entirely to the human decision-maker."* The Chair's real, current function is to **surface and integrate findings from every module into one coherent, structured record — never to adjudicate or originate a verdict.** The old recommendation vocabulary survives only as a defunct fallback parser for historical data, not the active path. The papers are the ones a step behind the practitioner's own live system, not the other way around — worth noting as provenance, not as reducing confidence in the finding.

There is genuine published evidence in BOA itself for exactly why this revision happened. Section 5.4 reports a real corpus finding: of 48 runs reaching a Chair determination, 33 returned CONDITIONAL APPROVAL — including 17 of the 22 runs where the Adversarial Probe had returned CONCLUSION CHALLENGED. The paper's own diagnosis: *"a sufficiently directional Director analysis can pull the Chair's output toward a smoothed narrative that elides or downplays an inconvenient Probe finding."* A documented, quantified failure mode, not a hunch — even inside a carefully designed multi-stage architecture, a probabilistic system asked to issue a final verdict tends to soften genuinely challenged conclusions. The confirmed fix — surface, don't adjudicate — is the direct, evidenced answer to that finding.

This is the single most important piece of evidence for Phase VI's scoping, now confirmed rather than hypothesised. The question for Approval Records is not "can JARVIS compute a verdict deterministically" — it's "should anything in this system hold verdict authority at all." PHDSS's own confirmed answer, backed by a real corpus finding: no — the system's job ends at producing a complete, structured, challenged reasoning record; determination stays entirely with the human. Phase VI should adopt this as its starting design constraint, not merely a question to consider: any future JARVIS Approval Record layer should surface evidence, trade-offs, and unresolved tensions, and stop there — never produce a value that reads as a recommendation, however phrased.

### Explicitly not adopted

The 13-Director/6-module institutional-Board framing is domain-specific machinery for multi-stakeholder public health governance — JARVIS's single-user context doesn't need it. The API-key-in-browser implementation detail in PHDSS's client code is a real anti-pattern JARVIS already avoids by running server-side.

---

## The Actual Vision, Stated Precisely

**JARVIS is not PHDSS scaled down to one person.** PHDSS is a governance reasoning system for episodic, consequential institutional decisions. JARVIS is an everyday executive assistant — the goal is expanded situational awareness, orientation, and prioritisation in continuous daily operation, not a decision engine. Decision support is one capability that falls out of doing that well; it is not the mission itself. This distinction is not cosmetic — it determines what actually gets built in Phase V and beyond.

The goal — an executive operating system that identifies environment, roles, and obligations, and interacts collaboratively to keep track of what matters and move things forward — is **not** dependent on an LLM for its core value, and that is by design, not limitation:

- **Facts are computed deterministically.** What's on the calendar, what evidence is sufficient, whether a claim can honestly be answered — all of this is proven tonight to be buildable, testable, and verifiable without any LLM in the loop. The project's original motivating bug ("tomorrow is Tuesday") was never a case for a smarter model; it was a case for not letting a model be responsible for facts at all.
- **Executive cognition is grounded in deterministic state and structured reasoning.** Phase V's unwired Candidate Construction/Evaluation/Comparison stages are classical, explainable reasoning over real evidence. Situational awareness, prioritisation, dependency analysis, conflict detection, and planning all emerge from that same deterministic foundation — priority-ranking is one manifestation among several, not the scope of the phase.
- **An LLM's honest role, if used at all, is interface, not intelligence.** Reasoning over verified facts and articulating trade-offs in natural language is a categorically safer and more limited job than inventing the facts — and it's the only part of "collaborative" assistance that genuinely still requires the flexibility an LLM provides. Fully replacing that flexibility with rules would trade away the actual collaborative quality being asked for.

The full Iron-Man vision — fully autonomous, understands anything, acts on everything — should stay aspirational rather than promised. But the ordinary, everyday version of it is no longer science fiction: something that wakes up every morning and reliably answers *what's happening, what changed, what needs attention* — using real evidence, only reaching for language-model flexibility where it's genuinely needed, and only occasionally surfacing something that looks like a decision to weigh. Most of the foundation for that is proven. The rest is a short, specific, identifiable list of next steps — not a leap.

---

## What Not To Do

Consistent with the discipline established across this session:

- Do not build Phase IV, V, VI, VII, or the synthesis layer speculatively. Each requires its own audit first.
- Do not fold the recipient-projection fix into a "quick patch" — Sprint 3.68 exists specifically because that temptation was already named and rejected once tonight.
- Do not treat the `3.68`–`3.73` numbering as committed. It is a sketch of expected shape, not a binding plan.
- Do not promote DAWNWATCH before the communications gap closes, or Dashboard's `/api/chat` migration before its own audit exists. Replacement follows demonstrated equivalence — always.
