# JARVIS — Roadmap to a Non-LLM-Dependent Executive Operating System

**Status:** Living document. Last reconciled 2026-08-28 after Sprint 3.160. The August 1 roadmap state is superseded: governed conversational source inputs, operation-level authority for bounded Calendar/Gmail/Drive reads, private-history containment, voice turn integrity, live Calendar GovernedContext/recall truthfulness, deterministic Calendar projection-fidelity protection, and the first live authority-gated Calendar attention path have now been implemented and verified. The current transition is from proving one same-identity attention condition to establishing the completeness semantics required before membership changes such as added/removed Calendar commitments can be inferred.

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
    Phase I — Deterministic Runtime Foundation
    Phase II — Governed Projection & Presentation
    Dashboard and DAWNWATCH promoted through explicit governed selectors
    Bounded operation-level authority and acquisition for Calendar, Gmail,
    and Drive on the governed console path
    Server-owned one-shot PendingAuthorization for supported proposal flows
    Typed and voice turns sharing the governed conversational path
    Calendar GovernedContext with exact user-detail binding and truthful recall

Proven but deliberately bounded
    Governed conversational claims/conflicts/evidence publication,
    enrichment and integrity machinery
    Private-source results that remain capability-scoped rather than a
    general ambient context
    Process-local PendingAuthorization (not durable/distributed)
    Legacy /api/chat retained as a parallel compatibility path, with Gmail
    execution contained and implicit private OperationalState removed

Ready for disciplined activation
    Deterministic Executive Cognition already present in the EOS:
    Situational Awareness → Attention → Situation Formation → Assessment →
    Executive Context → Candidate Construction/Evaluation/Comparison →
    Executive Reasoning
    First proving question: "What needs my attention?"

Known strategic directions, not yet earned
    Role-specific operational context
    Governed action approval/execution records
    Full voice-first experience
    Proactive anomaly detection and cross-role continuity
    Durable/distributed authority state
```

---

## Phase I — Deterministic Runtime Foundation ✅ Complete

Canonical models (OperationalCommitment, OperationalCommunication), the 14-stage EOS deliberation pipeline, projection/assembly architecture, AvailabilityEngine, and the constitutional discipline itself — Source-Specific Authority, Evidence-Proportionate Architecture, the five-step governance review protocol. This is the substrate everything else sits on.

---

## Phase II — Projection & Presentation Layer ✅ Complete

**Dashboard:** governed (Sprint 3.58), implemented (3.59), evaluated with runtime-computed classification (3.60/3.60.1), integrated behind an explicit selector (3.61), and **promoted** to production default (3.62). Confirmed live against the real running application.

**DAWNWATCH:** governed (3.64), implemented (3.65), evaluated (3.66), integrated (3.67), **promoted (3.73), live on the real account.** Three real production-evidence bugs were found and fixed by hand after initial integration (missing assertion identity, missing source observation evidence, missing memory source) — all verified against real operational data. One further gap was then found and closed: communications could not reach `available` status because `EmailMessage` had no recipient field, requiring a real Gmail connector change rather than a presentation fix.

**Resolved (Sprints 3.68-3.74).** Sprint 3.68 audited the Gmail connector and found a correct, tested canonical recipient-extraction adapter already existed but was unwired from production — a wiring gap, not a capability gap. Sprint 3.69 governed the fix: production routes through the canonical adapter, with a closed absence vocabulary (`none`/`not_fetched`/`not_authorised`/`unknown`, `none` reserved and unemittable). Sprint 3.70 implemented it — a real RFC 5322-aware address parser replacing naive comma-splitting, dual-query deduplication. Sprint 3.71 re-evaluated: the unchanged, runtime-computed comparator classified the change as a genuine `Intentional Improvement`. Sprint 3.72 verified this directly against the operator's live account — the real server-rendered payload showed `dawnwatchPresentationMode:"GOVERNED"`, and the real API response showed genuine, un-deduplicated multi-recipient evidence. Sprint 3.73 recorded promotion at `docs/architecture/DAWNWATCH-PROMOTION-RECORD.md`, with zero code change to the permanent `LEGACY` fallback — promotion is explicit deployment configuration only, confirmed live. Sprint 3.74 fixed a minor presentation issue (sender name preferred over raw Message-ID; Message-IDs no longer misrendered as email autolinks).

**Phase II is complete.** Selector: `lib/dawnwatch-presentation-selection.ts`.

---

## Phase III — Trustworthy Conversational Runtime — Substantially Operational, Parallel Legacy Path Remains

The August 1 roadmap described conversational integration as blocked on missing governed production evidence inputs. That blocker is no longer the current state.

**Sprints 3.88–3.119** built the missing governed conversational evidence, claim, conflict, enrichment, identity and integrity machinery. Source-specific publishers and acquisition adapters were connected and evaluated without allowing the projection composer or model to invent evidence relationships.

**Sprints 3.120–3.148** then established a bounded live authority architecture on the governed console path. Supported private operations are proposed and adjudicated before acquisition; positive authority comes from the current user turn or server-owned one-shot pending state, never from model output. Calendar reads, bounded Gmail search, identified-message Gmail reads, Drive metadata search and identified Google Doc reads have deterministic gated production paths. Ordinary model history excludes governed private releases where required. Legacy Gmail execution on `/api/chat` is explicitly contained rather than treated as equivalent authority.

**Sprint 3.149** audited the authentic runtime and established an important architectural fact: the governed console uses `/api/lighter/chat` for both typed and serialized voice turns, with deterministic private-capability resolvers ahead of ordinary model invocation. The alternate Dashboard/`/api/chat` path remains production-reachable as a separate compatibility runtime; the repository does not justify calling the entire product a single converged conversational runtime.

**Sprints 3.150–3.152c** closed the first live GovernedContext loop for Calendar. An authorized current-turn Calendar projection may enter bounded JARVIS reasoning; later conversational recall may use visible prior prose but cannot represent that recollection as current Calendar access. Exact user-supplied times bind only to exact projected commitments. The final hard-reset live acceptance suite passed 6/6 after Sprint 3.152c.

### Current Phase III conclusion

Phase III is no longer blocked on the old projection-input gap. The governed conversational path is operational enough to support the next architectural experiment: consuming trustworthy structured state in executive cognition.

It is **not complete in the sense of universal convergence**:

- `/api/chat` remains a parallel legacy/compatibility path;
- PendingAuthorization remains process-local rather than durable/distributed;
- private capabilities are still intentionally bounded rather than ambient;
- Calendar is the strongest live GovernedContext proof; Gmail and Drive remain primarily deterministic release paths;
- no claim is made that arbitrary private evidence may be assembled into model context.

These are explicit boundaries, not reasons to delay the next audit.

### Immediate next step

Sprints 3.153–3.160 have now taken the first proving question from audit through live UI verification:

```text
"What needs my attention?"
        ↓
authorised Calendar evidence
        ↓
same-identity start-time change detection
        ↓
deterministic attention policy
        ↓
bounded Attention Brief
        ↓
live deterministic JARVIS reply
```

The next deliberate question is whether the same attention path may truthfully expand to Calendar **membership changes** such as additions/removals.

Sprint 3.161 audited the missing Calendar membership-completeness seam; Sprint 3.162 governed it; Sprint 3.163 implemented it in production; Sprint 3.164 selected **removed** as the only membership change currently ready for attention semantics; Sprint 3.165 implemented that removal policy as an isolated deterministic adapter. Sprint 3.166 now audits publication readiness and finds that the existing `calendar_attention_brief` artefact is already semantically general enough for removal, but its TypeScript contract is still narrowed to the original start-time match. The renderer remains intentionally start-time-specific and must stay fail-closed. The next step is Sprint 3.167 — widen only the brief publication contract to a closed start-time-or-removal policy-match union, with no renderer or live wiring changes.

---

## Phase IV — Role-Specific Projection Adapters — Not Started

Everything built so far is generic Calendar/Gmail. Nothing yet reflects the three actual operational roles (Barwon Health Service Experience Lead, LLEGC Co-Chair, GE CEO) as distinct contexts with distinct obligations, boundaries, and priority weightings. This must remain audit-first — treating it as "build three adapters" would invite exactly the swamp of heuristics, identity inference, and cross-role leakage the project has spent this session learning to avoid.

---

## Phase V — Deterministic Executive Cognition — First Live Attention Path Proven

JARVIS is not PHDSS scaled down to one person. Its everyday purpose is continuous executive cognition: awareness, orientation, attention, dependency recognition, conflict detection, capacity understanding and planning support. A decision recommendation is not the centre of gravity.

The repository already contains the deterministic EOS stages needed to explore that purpose. In particular, the Observation/Situational Awareness and Executive Attention layers are real, typed and policy-bound; later Situation Formation, Assessment, Executive Context, Candidate Construction, Candidate Evaluation, Candidate Comparison and Executive Reasoning stages also exist. Their existence, however, is not evidence that the current governed conversational runtime can truthfully drive them end to end.

The first proving capability was deliberately narrower than "wire Executive Reasoning":

> **What needs my attention?**

Why this first:

- it is central to the everyday JARVIS vision;
- the existing Attention layer is explicitly deterministic and policy-based;
- it can surface matched changes without pretending queue order is importance;
- it does not require autonomous action or a system-issued recommendation;
- it provides a clean structured-record-first boundary before any LLM wording.

The target conceptual chain is:

```text
authorized / governed operational evidence
        ↓
canonical projected state
        ↓
situational snapshot / change set
        ↓
deterministic Attention Policies
        ↓
Executive Attention Queue
        ↓
bounded Attention Brief
        ↓
optional conversational rendering
```

The LLM may eventually explain an Attention Brief; it must not originate the underlying facts, manufacture a change, invent priority, or silently turn structural queue ordering into importance.

**Sprints 3.153–3.160 completed the first bounded activation.** The production path now answers the proving question for one deterministic condition: a same-identity Calendar commitment start-time change within a compatible authorised `today` window. It does not yet imply general executive attention, priority, or comprehensive Calendar membership awareness. Sprint 3.161 resumes audit-first discipline before expanding that claim.

---

## Phase VI — Approval Records / Governance Event Layer — Deferred

Paused at Sprint 3.24 specifically to build the deterministic foundation first. This is where JARVIS moves from *informing* to *proposing and acting with explicit human approval*. Cannot meaningfully begin before Phase III (a trustworthy conversational runtime) and benefits directly from Phase V (structured reasoning to generate defensible proposals, not just LLM suggestions).

---

## Phase VII — Voice Interface — Transport Integrated, Experience Incomplete

Voice is no longer accurately described as untouched. The governed console has mic/voice-session plumbing and, since Sprint 3.143, capture-identified voice turns are serialized through the same canonical submission path as typed turns. The Calendar acceptance work also proved the same authority and recall semantics through voice.

What remains is the broader voice-first experience: dependable speech input/output, interruption/turn management, natural conversational pacing, and production UX quality. Those capabilities must continue to inherit the same authority and evidence semantics as typed interaction; voice may not become a second authority path.

The sequencing principle still stands: deepen cognition first, then make it more ambient through voice.

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

- Do not build role-awareness, action execution, proactive continuity, or broad voice autonomy speculatively. Each requires its own audit and bounded authority contract.
- Do not fold a projection fix into a "quick patch" — Sprint 3.68 exists specifically because that temptation was already named and rejected once, and the full audit-first sequence (3.68-3.74) is what actually closed the gap.
- Do not force legacy `/api/chat` convergence merely to simplify the diagram. The governed console path and legacy compatibility path must be compared by demonstrated behaviour; retirement or convergence requires a separate evidence-led decision.
- Do not make "What needs my attention?" a synonym for LLM ranking. Attention must remain a deterministic, inspectable policy result before any conversational rendering.
- Do not route a real question through every existing EOS stage merely to see which stages fire. Derive the minimum required transformations first; existing stages must earn inclusion against that need.
- Do not interpret a mostly-unwired result as failure. "Not required for this capability" is a valid successful audit finding and does not imply deletion or irrelevance elsewhere.
- Do not treat a successful Attention audit as authority to enable planning or action. Attention is not recommendation, approval, or execution.
