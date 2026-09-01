# Sprint 3.186 — Morning Executive Orientation Audit

**Status:** Audit complete — implementation not yet authorised  
**Baseline:** merged `main` after PR #504 (`7c1bd9eb3afd9195ffedf7c3e03d43a82327ed9e`)  
**Primary proving question:** **Give me my morning brief.**  
**Production code changed:** No

## 1. Product problem

> **What human cognitive burden are we removing?**

JARVIS already contains several real, governed capabilities that can answer separate questions about the operator's day and week. The current burden is that the user still has to know which question to ask, ask each one separately, and mentally integrate the answers.

Examples of already-existing product questions include:

- `What needs my attention?`
- `How is my week allocated?`
- factual Calendar questions such as `What are my next 5 meetings?`
- bounded explicit continuity recall.

The next product problem is therefore not missing raw capability. It is **orientation**:

> Can JARVIS assemble a compact, truthful opening picture of the day from already-governed state without inventing priority, recommendation, significance, or ambient memory?

## 2. Repository findings

### 2.1 The full EOS exists, but is not the production conversational brain

The repository contains a real deterministic Executive Operating System runtime spanning situational awareness, attention, situation formation, assessment, executive context, deliberation, intent, constraints, candidate plans, evaluation, comparison, reasoning, proposals, routing, invocation and execution.

However, the sole production conversational runtime in `lib/lighter-jarvis/chat-handler.ts` does not import or run the full `executive-operating-system` runtime.

This is an important positive finding. Existing product capabilities have been activated through the minimum justified transformations rather than by routing ordinary conversation through every available EOS stage.

> **Audit decision:** Sprint 3.186 must not become a wholesale EOS wiring sprint.

Any EOS stage must earn inclusion because the Morning Brief needs that transformation, not because the stage exists.

### 2.2 Bounded Calendar attention is production-wired

The live `What needs my attention?` path already provides:

~~~text
fresh Calendar authority
→ bounded authorised Calendar acquisition
→ canonical current observation
→ compatible previous/current comparison
→ deterministic start-time and bounded-removal selectors
→ calendar_attention_brief
→ deterministic conversational rendering
~~~

The published artefact explicitly carries:

`semantics = deterministic_policy_match_not_priority`

This is appropriate input to a Morning Brief only as **supported detected change**, never as ranking, importance, urgency or recommendation.

Important scope limits remain:

- first use establishes a baseline rather than producing historical change;
- comparison is bounded to compatible observation windows;
- the current implementation is Calendar-only;
- added events are not a general attention policy;
- no proactive/background acquisition exists.

### 2.3 Weekly Calendar allocation is production-wired and descriptive

`How is my week allocated?` and `How is next week allocated?` already use:

~~~text
fresh Calendar authority
→ bounded complete weekly acquisition
→ governed timeMode classification
→ overlap-resolved deterministic allocation
→ calendar_weekly_time_allocation publication
→ arithmetic revalidation
→ deterministic model-free renderer
~~~

The existing renderer intentionally contains:

- Routine / Transactional;
- Deep Work / Discovery;
- Reflection;
- Development;
- Self-Care;
- Unclassified;
- semantic-unavailable time where applicable;
- total resolved occupied timed-event time;
- explicit completeness truth.

It intentionally does **not** contain:

- percentages;
- adequacy judgments;
- targets;
- balance scores;
- protected-time policy;
- recommendations;
- schedule writes.

> **Audit decision:** weekly allocation can support Morning Brief capacity orientation as factual descriptive state only.

### 2.4 Factual Calendar orientation is already governed

Sprints 3.177–3.179 created a server-owned factual Calendar surface that may expose bounded title/start/end/calendar-name data to deterministic selection and rendering while keeping Calendar titles out of ordinary model context.

This supports ordinary orientation facts such as upcoming meetings without requiring model-authored private factual prose.

Adaptive natural-language interpretation may propose a typed operation from the current utterance, but it sees no private Calendar evidence and cannot grant authority or answer the fact.

> **Audit decision:** Morning Brief schedule facts should reuse the governed factual Calendar projection or an equivalently narrow new publication, not the legacy `OperationalState` Calendar array.

### 2.5 Explicit durable continuity is now verified, but should not be ambient by default

PR #504 records verified live explicit user-authored continuity capture and later governed recall.

The verified continuity contract is purpose-bounded and user-controlled. It does not authorise ambient injection of durable memory into every ordinary turn.

> **Audit decision:** Morning Brief v1 must not automatically inject remembered preferences, plans, assertions, commitments or decisions merely because they exist.

Continuity may become a later brief section only after a concrete orientation need proves that automatic relevance selection is useful and a separate purpose-bounded admission contract exists.

### 2.6 Legacy JARVIS/DAWNWATCH briefing code is not the implementation substrate

`lib/briefing.ts` still contains legacy briefing heuristics including:

- `state.priorities[0]` as a leading priority;
- `urgent` flags;
- `getRecommendation(...)` producing prescriptive next-action wording;
- `dawnwatchBrief(...)` treating ranked priorities and communications as executive briefing content;
- sentences such as `Nothing urgent.` and `Communications clear.`.

The later governed DAWNWATCH presentation contract explicitly rejected or deferred several of these semantics, including connector index ordering, ungoverned priority rank, urgency heuristics, communication attention claims and communications-clear claims.

The current North Star also supersedes named specialists as the user's coordination model: the product boundary is one persistent JARVIS intelligence.

> **Audit decision:** do not revive, extend, rename or route the new Morning Brief through legacy `jarvisBrief`, `dawnwatchBrief`, `OperationalState`, or named-agent presentation architecture.

The new capability should be JARVIS-owned and composed from currently governed publications.

## 3. Capability-level classification

The first Morning Brief should remain **Level 1 — Know**, with deterministic composition of already-governed facts.

It may answer:

- what is scheduled;
- what supported Calendar changes were detected;
- what the governed weekly allocation currently shows;
- whether evidence is incomplete or unavailable.

It may not answer:

- what is most important;
- what the user should do first;
- whether the week is good or bad;
- whether there is enough deep work or self-care;
- whether a meeting should be moved;
- what a remembered preference implies for the day;
- what cross-source evidence means semantically.

Those claims cross into Level 2 Understand or Level 3 Advise and must be governed separately.

## 4. First bounded Morning Brief contract

### 4.1 User interaction

Initial proving phrase:

> **Give me my morning brief.**

Supported aliases may be added only if they are stable and unambiguous. Natural-language expansion is not the purpose of the first implementation.

### 4.2 Authority

The request itself does not silently grant Calendar authority.

The first implementation should identify that Calendar evidence is required and use the existing server-owned authority mechanism.

Target UX:

~~~text
USER
Give me my morning brief.

JARVIS
Please explicitly confirm that I may read your Calendar for the morning brief.

USER
Yes.

JARVIS
[bounded factual Morning Brief]
~~~

A bare `Yes` remains meaningless without the exact pending server-owned operation.

### 4.3 Single brief purpose

Introduce one non-authoritative purpose, conceptually:

`calendar_morning_brief`

It must bind the exact intended acquisition windows and publication requirements inside the pending operation. The purpose does not grant authority.

### 4.4 Evidence acquisition

The Morning Brief should not perform several hidden independent Calendar reads merely because existing user-facing capabilities are currently split by purpose.

The implementation contract should define **one bounded Calendar acquisition sufficient to derive the admitted brief sections**, or explicitly prove why multiple separately authorised reads are necessary.

The preferred first design is one complete bounded weekly acquisition that can deterministically derive:

- today's timed commitments from the same acquired event set;
- this week's descriptive allocation from the same acquired event set.

Attention-change comparison is different because it requires a prior compatible observation.

For v1:

- if an eligible prior Morning Brief/attention observation exists for the same bounded `today` window, supported change facts may be included;
- otherwise the current observation may establish the next baseline and the brief must say no historical comparison was available rather than imply no changes occurred.

No source reread should be duplicated merely to satisfy presentation layering.

### 4.5 Proposed structured publication

Conceptual shape only; exact TypeScript belongs in the implementation contract:

~~~text
MorningExecutiveOrientationBrief
  kind: morning_executive_orientation_brief
  observedAt
  timeZone
  coverage
  today
    timedCommitments[]
  supportedChanges
    comparisonState
    items[]
  weeklyCapacity
    period
    minutesByMode
    semanticUnavailableMinutes
    totalTimedMinutes
  limitations[]
~~~

The publication must be constructed before user-facing prose.

### 4.6 Deterministic rendering

Morning Brief v1 should use deterministic rendering only.

Example shape:

~~~text
Morning brief:

Today
- 9:00 AM–10:00 AM — Interview
- 1:00 PM–2:00 PM — LLEGC meeting

Supported changes
- One Calendar commitment changed start time since the previous compatible check.

This week's resolved allocation
- Routine / Transactional: 21h
- Deep Work / Discovery: 4h
- Reflection: 1h
- Development: 2h
- Self-Care: 3h

Coverage: complete for this bounded Calendar read.
~~~

The exact renderer must not introduce adjectives such as `important`, `busy`, `light`, `good`, `bad`, `protected`, `urgent`, `balanced`, `overloaded`, or `priority` unless a later governed policy explicitly owns those meanings.

## 5. Hard exclusions

Morning Brief v1 does not authorise:

- legacy `OperationalState` priority or recommendation heuristics;
- DAWNWATCH as a user-facing persona;
- LLM ranking of Calendar items;
- LLM-written private factual prose;
- importance, urgency or priority inference;
- schedule-quality or adequacy judgment;
- recommendations or proposed moves;
- Gmail/Drive cross-source synthesis;
- automatic durable-continuity injection;
- automatic transcript memory;
- proactive/background execution;
- notifications;
- Calendar writes;
- full EOS runtime activation.

## 6. Required falsification tests before live acceptance

The implementation must prove at least:

1. `Give me my morning brief.` creates no authority by itself;
2. the pending operation binds exact Calendar purpose and window;
3. no Calendar acquisition occurs before explicit confirmation;
4. one authorised bounded acquisition cannot be silently widened;
5. partial weekly acquisition withholds any claim of a complete weekly allocation;
6. today's commitments are selected deterministically from governed acquired events;
7. event titles used in factual rendering never enter ordinary model context;
8. weekly allocation arithmetic reconciles before publication;
9. Morning Brief does not infer schedule adequacy;
10. Morning Brief does not rank commitments;
11. Morning Brief does not emit a recommendation;
12. no model is called for the v1 brief response;
13. no durable continuity is automatically injected;
14. absent prior observation produces `comparison unavailable / baseline established`, not `no changes`;
15. incompatible prior observation windows fail closed rather than force comparison;
16. supported attention changes preserve `policy match, not priority` semantics;
17. legacy `jarvisBrief` / `dawnwatchBrief` are not called;
18. legacy `OperationalState` priority fields do not enter the brief;
19. a bounded complete no-event day may truthfully render no timed commitments for the admitted day;
20. an unavailable source does not become a claim that nothing is scheduled.

## 7. Smallest implementation sequence

Do not implement the whole vision in one PR.

Recommended sequence:

### 3.186A — Morning Brief publication contract

Define the typed structured publication, exact admitted inputs, coverage rules, and fail-closed states. No route wiring.

### 3.186B — Morning Brief deterministic assembler/renderer

Build the publication and deterministic renderer from synthetic already-governed Calendar inputs. No production acquisition changes.

### 3.186C — Production Calendar composition

Add the exact `calendar_morning_brief` proposal/pending-purpose path and reuse the minimum bounded Calendar acquisition necessary to construct today's factual schedule plus weekly descriptive allocation.

### 3.186D — Optional supported-change composition

Only after the factual brief is live, add prior/current observation comparison if the existing attention reference can be reused without conflating authority, coverage or lifecycle. If it cannot, design a Morning Brief-specific non-authoritative observation reference rather than forcing reuse.

### 3.186E — Live acceptance

Run one test at a time against the actual deployed JARVIS and independently verify any consequential acquisition/completeness claim where required.

## 8. What comes after the factual Morning Brief

Do not pre-authorise the next level.

After live use, observe the remaining cognitive burden.

If the natural next question is:

> `What actually matters here?`

that is evidence for a bounded significance/prioritisation policy.

If it is:

> `Am I protecting enough deep-work / reflection / development time?`

that is evidence for schedule-adequacy governance.

If it is:

> `What should I move?`

that is a Level 3 planning/advisory capability.

If it is:

> `Handle the obvious one.`

that is a new Act boundary.

The roadmap should follow the burden revealed by real use, not the adjacency of existing modules.

## 9. Audit conclusion

> **Proceed with a bounded Level-1 Morning Executive Orientation capability.**

The repository already contains enough governed substrate to make a useful first Morning Brief without activating broad reasoning, ranking, advice, ambient memory, or the full EOS runtime.

The architectural shape is:

~~~text
natural Morning Brief request
→ typed non-authoritative Calendar brief proposal
→ explicit Calendar authority
→ minimum bounded complete Calendar acquisition
→ governed factual day projection
→ governed weekly allocation
→ optional compatible supported-change comparison
→ structured Morning Executive Orientation publication
→ deterministic rendering
~~~

This is the smallest next step that moves JARVIS from a collection of truthful capabilities toward a coherent everyday executive partner while preserving the trust architecture already earned.
