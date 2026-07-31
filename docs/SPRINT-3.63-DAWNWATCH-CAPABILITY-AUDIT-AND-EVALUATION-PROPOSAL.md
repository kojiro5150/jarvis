# Sprint 3.63 — DAWNWATCH Capability Audit & Evaluation Proposal

## Status

**Proposed — evidence-gathering and governance-proposal only.**

This sprint does not implement a governed DAWNWATCH briefing, modify production behaviour, promote a new briefing path, or alter any canonical or legacy operational model.

Its outputs are evidence and a proposed briefing contract for later governance review.

The proposal produced by this sprint is explicitly non-authoritative.

---

## Architectural Context

This sprint shall be executed in accordance with the repository’s architectural hierarchy.

The following artefacts govern this sprint and take precedence where conflicts arise:

1. Engineering Constitution
2. North Star
3. Constitutional Publication Principles
4. Accepted Architecture Decision Records
5. Existing canonical responsibility statements, including the `OperationalCommunication` responsibility boundary
6. Sprint 3.55 capability-audit evidence
7. Sprint 3.57 canonical operational-picture parallel-evaluation method and classification discipline
8. Sprint 3.58 Governed Dashboard Presentation Contract
9. Sprint 3.60.1 runtime-computed comparison correction
10. Sprint 3.62 repository-versus-operator evidence boundary
11. This Sprint Specification

The repository has completed Sprints through 3.62.

The governed Dashboard is implemented, evaluated, integrated, and operator-promoted.

This sprint begins a separate consumer-governance sequence for the DAWNWATCH briefing.

It shall not reopen or redesign the governed Dashboard.

---

## Current Repository State

The existing DAWNWATCH opening briefing is produced by:

```text
dawnwatchBrief
```

in:

```text
lib/briefing.ts
```

It currently consumes:

```text
OperationalState
```

directly.

It does not consume:

```text
ExecutiveStateSnapshot
```

as its canonical operational source.

Sprint 3.55 therefore classified the capability as:

```text
PARTIALLY_IMPLEMENTED
```

The function is implemented and produces a deterministic string from its supplied legacy state, but its source contract remains the legacy `OperationalState` shape rather than the governed canonical executive-state publication.

The present implementation composes:

- an urgent-priority count;
- an urgency sentence;
- a ranked-priority summary;
- priority titles;
- priority due wording;
- a single first calendar commitment;
- commitment title;
- source/calendar attribution where available;
- preformatted day;
- preformatted time;
- an urgent-communications count;
- an attention sentence;
- fixed DAWNWATCH wording and sentence order.

The current briefing therefore combines operational facts, legacy presentation fields, deterministic selection rules, consumer heuristics, and DAWNWATCH-specific prose in one function.

This sprint shall separate and classify those responsibilities.

---

## Objective

Produce a complete evidence-based audit of the current `dawnwatchBrief` capability and a non-authoritative proposal for a future governed DAWNWATCH Briefing Presentation Contract.

The sprint shall:

- inventory every datum, rule, heuristic, composition, and wording decision currently used by `dawnwatchBrief`;
- trace each item to its present source in `OperationalState`;
- determine whether an equivalent governed fact already exists in `ExecutiveStateSnapshot` or another accepted canonical publication;
- inspect and apply existing canonical responsibility statements before treating a question as unresolved;
- classify each item using the constitutional test established for the governed Dashboard;
- distinguish operational facts from deterministic briefing derivations and DAWNWATCH-specific voice;
- identify information currently unavailable from governed canonical state;
- identify legacy fields that must not be copied merely because DAWNWATCH presently consumes them;
- record deferred and rejected candidates;
- define the behavioural acceptance scenario around tomorrow-afternoon availability;
- propose a future briefing presentation contract;
- identify the evidence required before that proposal can become authoritative;
- establish constraints for any later comparison or evaluation harness;
- preserve the repository-versus-operator evidence boundary for downstream promotion work.

The sprint shall not make the proposed contract authoritative.

---

## Central Architectural Question

For every piece of information currently composed by `dawnwatchBrief`, determine:

> If this information had never existed in `OperationalState`, would shared operational reality independently justify publishing it canonically today?

Existing legacy placement is not evidence of canonical ownership.

Consumer usefulness is not evidence of canonical ownership.

Shared use by multiple legacy consumers is not automatically evidence of canonical ownership if those consumers merely repeat the same ungoverned heuristic.

---

## Classification Model

Every inventoried item shall receive two separate proposed classifications.

### Governance outcome

The outcome records what the proposal recommends should happen to the current field or composition:

- **Accepted** — retain the capability substantially as proposed.
- **Modified** — retain the capability only through a different source, semantic mapping, derivation, or responsibility boundary.
- **Deferred** — make no present authorisation because required ownership, evidence, semantics, provenance, identity, or source boundaries remain unresolved.
- **Rejected** — do not retain or reproduce the field or composition because it is presentation-only, duplicative, misleading, constitutionally incompatible, or justified only by legacy existence.

### Architectural class

The class records where an accepted or modified item would belong:

- **Canonical Operational State**
- **Deterministically Derived Briefing Presentation**
- **DAWNWATCH-Specific Voice State**
- **None authorised**

`None authorised` is not an additional governance outcome.

It records that the proposal assigns no architectural class to the item.

It will ordinarily accompany:

```text
Deferred + None authorised
Rejected + None authorised
```

The two axes must not be collapsed implicitly.

A separate governance-review sprint shall decide whether each proposed outcome and class pairing is correct.

In particular, it shall confirm whether `Deferred + None authorised` remains the preferred representation or whether the authoritative contract should express deferred status without a class value.

---

## Proposed Architectural Classes

### Canonical Operational State

A governed fact describing shared operational reality that:

- already has an accepted canonical owner;
- is independently useful to multiple legitimate consumers;
- preserves identity and provenance;
- does not exist solely because DAWNWATCH needs it;
- would still warrant publication if DAWNWATCH did not exist.

No new canonical publication is authorised by this sprint.

A proposed Canonical Operational State classification may identify an existing governed fact for future consumption. It does not authorise a new field or republication of the legacy shape.

### Deterministically Derived Briefing Presentation

A replayable downstream computation over governed facts and explicit context.

Such a derivation must declare all material inputs, including where relevant:

- reference time;
- viewer timezone;
- locale;
- temporal window;
- interval-boundary policy;
- eligibility rules;
- ordering rules;
- tie-breakers;
- source scope;
- source availability;
- observation-window coverage;
- rule identifier;
- rule version;
- unavailable-input behaviour.

No hidden current clock, environment locale, connector-array order, or implicit fallback is permitted.

A derivation may operate only over authorised inputs.

A derivation does not authorise an absent or deferred input.

### DAWNWATCH-Specific Voice State

Consumer-owned wording, sentence structure, tone, emphasis, compression, narrative ordering, singular/plural grammar, and other presentation choices that do not claim independent operational authority.

This class may consume governed facts and deterministic derivations.

It must not:

- create a new operational fact;
- convert uncertainty into certainty;
- convert missing evidence into a negative factual claim;
- describe a heuristic as canonical urgency or significance;
- conceal source unavailability;
- conceal insufficient observation-window coverage.

### None Authorised

No canonical, derivation, or voice classification is presently authorised.

This class applies where:

- ownership remains unresolved;
- an existing responsibility statement excludes the information;
- required provenance or identity is absent;
- the information is rejected legacy carry-over;
- a proposed capability requires separate governance.

---

## Engineering Principle

**Audit before contract. Contract before implementation. Evaluation before promotion.**

The DAWNWATCH sequence shall follow the discipline established by the Dashboard migration:

```text
Current legacy consumer
        ↓
Capability audit and evidence
        ↓
Non-authoritative briefing-contract proposal
        ↓
Separate governance review
        ↓
Governed authoritative contract
        ↓
Implementation
        ↓
Parallel behavioural evaluation
        ↓
Runtime-computed classification validation
        ↓
Production integration
        ↓
Promotion readiness
        ↓
Operator-controlled promotion
```

Sprint 3.63 performs only:

```text
Capability audit and evidence
+
Non-authoritative briefing-contract proposal
```

---

## Acceptance Scenario

The principal acceptance scenario for this sequence is:

> **“do I have anything tomorrow afternoon”**

This sentence shall appear verbatim in the Sprint 3.63 audit and proposed contract.

It is the concrete behavioural case against which the future DAWNWATCH migration shall be judged.

### Current legacy limitation

The current `dawnwatchBrief` reads:

```text
state.calendar[0]
```

through the existing `nextEvent` helper.

It can therefore describe only the single event that happens to occupy the first position in the legacy calendar array.

It does not establish:

- the complete set of commitments tomorrow;
- the boundaries of “afternoon”;
- viewer timezone;
- reference date;
- inclusion or exclusion of interval-boundary matches;
- eligibility of cancelled commitments;
- treatment of all-day commitments;
- ordering across multiple commitments;
- whether the calendar observation window covers the requested period;
- whether source availability is sufficient to answer;
- whether no matching commitment means genuinely free or merely unavailable evidence.

Consequently, the current capability may:

- decline because the relevant commitment is not the single next item;
- answer incorrectly because the first item is outside tomorrow afternoon;
- answer correctly by coincidence when the first item happens to fall in that period;
- confuse “nothing in the current single field” with “nothing scheduled”;
- fail to distinguish a clear period from an unavailable or incomplete calendar picture.

### Intended governed capability

A future governed DAWNWATCH briefing or query response should be able to evaluate the scenario deterministically from:

- an explicit reference instant;
- an explicitly supplied viewer timezone;
- a governed definition of “tomorrow”;
- a governed definition of “afternoon”;
- the complete relevant canonical commitment set;
- commitment start and end boundaries;
- cancellation eligibility;
- all-day eligibility;
- deterministic ordering;
- source availability;
- observation-window sufficiency.

The future output must distinguish at least:

```text
Commitment present
No eligible commitment in the covered window
Insufficient or unavailable evidence
Unsupported temporal request
```

Sprint 3.63 shall document this required distinction.

It shall not implement it.

---

## Scope

### In scope

This sprint shall inspect and document:

- `dawnwatchBrief`;
- helpers called directly or indirectly by `dawnwatchBrief`;
- the relevant `OperationalState` fields;
- the relevant `ExecutiveStateSnapshot` fields;
- canonical publications and provenance available to DAWNWATCH;
- existing responsibility statements applicable to each candidate field;
- relevant temporal and source-availability contracts;
- the current opening-brief invocation path;
- current tests that exercise DAWNWATCH output;
- current behaviour for empty, partial, unavailable, and populated state;
- the current single-next-commitment limitation;
- the current urgent-communications heuristic;
- all DAWNWATCH-specific wording and sentence-order rules;
- any implicit clock, timezone, locale, ordering, eligibility, source, significance, or salience assumptions.

The sprint shall produce:

1. a current-capability inventory;
2. a source-and-consumer trace;
3. a canonical responsibility trace;
4. a classification matrix;
5. a gap and boundary register;
6. a proposed DAWNWATCH Briefing Presentation Contract;
7. a future evaluation design note;
8. governance recommendations;
9. an explicit non-promotion conclusion.

### Out of scope

This sprint shall not:

- change `dawnwatchBrief`;
- change `getOpeningBrief`;
- change `OperationalState`;
- change `ExecutiveStateSnapshot`;
- change `OperationalCommunication`;
- change an existing responsibility statement;
- change any projection adapter;
- change any canonical publication;
- change ADR-0007 or another ADR;
- add a governed briefing implementation;
- add a DAWNWATCH presentation builder;
- add a selector;
- add a comparison endpoint;
- add a parallel-evaluation harness;
- add fixtures for implementation comparison;
- alter DAWNWATCH wording;
- fix the tomorrow-afternoon behaviour;
- change calendar acquisition;
- change communication acquisition;
- alter priority semantics;
- reopen an established canonical exclusion without explicit evidence;
- promote DAWNWATCH;
- remove the legacy briefing;
- introduce operator-promotion machinery;
- claim that a proposal is authoritative.

---

## Required Evidence-Gathering Method

### 1. Trace the production call path

Document how the DAWNWATCH opening briefing is invoked.

At minimum, identify:

- the caller of `getOpeningBrief`;
- how `agentId === "dawnwatch"` reaches `dawnwatchBrief`;
- how the relevant `OperationalState` instance is acquired;
- whether the same state is supplied to conversational context;
- whether the briefing is rendered server-side or client-side;
- whether a hidden current clock, locale, timezone, or connector call is involved;
- whether the output is recomputed or persisted;
- whether any model call alters the produced opening briefing.

Do not infer the call path from comments alone.

Trace executable code and tests.

### 2. Inventory every current briefing composition

The audit shall enumerate every current output component separately.

At minimum:

| Current composition | Present source or rule |
| --- | --- |
| urgent priority count | `state.priorities.filter(p => p.urgent).length` |
| urgency singular/plural grammar | DAWNWATCH wording rule |
| `Nothing urgent.` | DAWNWATCH fallback wording |
| ranked-priority sequence | `state.priorities.map(...)` |
| rank | `priority.rank` |
| title | `priority.title` |
| due wording | `priority.due` |
| list separator | `" · "` |
| next commitment selection | `state.calendar[0]` |
| commitment title | calendar event title |
| source/calendar attribution | `source === "google"` and `calendarName` |
| day | legacy preformatted `day` |
| time | legacy preformatted `time` |
| no-event sentence | fixed DAWNWATCH wording |
| urgent communication selection | unread OR important OR Governance Engineering source label |
| communication count | filtered-array length |
| communications singular/plural grammar | DAWNWATCH wording rule |
| communications-clear sentence | fixed DAWNWATCH wording |
| sentence order | urgent → priorities → calendar → communications |
| final output format | one space-joined paragraph |

The actual audit shall expand this table where repository evidence reveals additional helpers, assumptions, fallback behaviour, or source transformations.

No consumed field, branch, empty-state behaviour, grammar decision, or composition may be omitted merely because it appears trivial.

### 3. Trace current source ownership

For every inventoried item, record:

- current type;
- current owner;
- current path;
- current producer;
- current consumer;
- applicable responsibility statement;
- whether it is provider-observed, human-asserted, locally seeded, derived, or presentation-only;
- whether identity is stable;
- whether provenance is preserved;
- whether observation time exists;
- whether source availability qualifies the claim;
- whether an existing canonical equivalent exists;
- whether current semantics match the canonical equivalent;
- whether current consumption depends on legacy naming or legacy shape;
- whether the repository has already accepted, excluded, rejected, or deferred the responsibility.

A field appearing in `OperationalState` is not sufficient evidence of canonical ownership.

### 4. Apply existing responsibility statements first

Before classifying a field as unresolved, inspect the authoritative responsibility statement governing its domain.

For communication fields, inspect the authoritative `OperationalCommunication` responsibility statement and related constitutional or publication artefacts.

Record whether each issue is:

- genuinely open;
- already governed;
- already excluded;
- already deferred;
- semantically different from the prior decision;
- supported by new evidence requiring explicit reopening.

The audit shall not re-litigate an established boundary merely because the legacy DAWNWATCH implementation consumes the excluded field.

---

## Required Classification Inventory

The sprint shall classify every current DAWNWATCH briefing item provisionally.

The following are starting hypotheses only and must be tested against repository evidence.

### Priority urgency statement

Current inputs:

- `priorities[].urgent`;
- urgent count;
- sentence grammar;
- `Nothing urgent.`

Audit questions:

- Is urgency already governed by an existing canonical responsibility?
- Is it a human assertion, a deterministic derivation, a heuristic, or a legacy Boolean?
- Does canonical priority `level` already cover the responsibility?
- Would urgency be independently published without DAWNWATCH?
- Does an existing responsibility statement exclude or defer it?
- Is the count a deterministic derivation conditional on governed urgency evidence?
- Is the sentence DAWNWATCH voice?
- Does `Nothing urgent` overclaim when urgency evidence is unavailable?

Likely proposal shape:

- urgency evidence: Deferred unless already governed;
- count: Deterministically Derived Briefing Presentation only if authorised evidence exists;
- wording: DAWNWATCH-Specific Voice State;
- `Nothing urgent` may require modification to avoid treating unavailable evidence as a negative fact.

The audit shall not pre-approve this outcome.

### Ranked-priority summary

Current inputs:

- `priority.rank`;
- array order;
- `priority.title`;
- `priority.due`;
- separator and formatting.

Audit questions:

- Which priority facts already have canonical ownership?
- Is title canonical?
- Is rank canonical, asserted ordering, relationship state, or unresolved metadata?
- Is free-text due wording replayable?
- Does array order carry authority?
- What deterministic tie-breaker would apply?
- Can the summary omit rank and due where those inputs remain ungoverned?
- Does an existing responsibility statement already govern or reject ranking and due semantics?

Likely proposal shape:

- title and canonical identity: Canonical Operational State consumption where already governed;
- rank/order: Deferred unless separately governed;
- due fact: Deferred unless represented as an authorised absolute target;
- relative due wording: Deterministically Derived Briefing Presentation only from an authorised absolute target and explicit reference context;
- separator and prose: DAWNWATCH-Specific Voice State.

### First calendar commitment

Current inputs:

- `state.calendar[0]`;
- `describeCommitment`;
- title;
- source;
- calendar name;
- day;
- time.

Audit questions:

- Does array index zero have any governed meaning?
- Are cancelled commitments eligible?
- Is connector order deterministic?
- Which canonical commitment fields already exist?
- Is calendar display name governed?
- Are day and time canonical facts or presentation derivations?
- Which timezone and locale produced them?
- Does the source observation window cover the requested period?
- Does no item mean free, empty, unavailable, not configured, or not observed?
- Does the existing canonical model preserve sufficient start/end evidence for overlap computation?
- How are all-day commitments represented?
- What source-availability evidence qualifies the answer?

Likely proposal shape:

- commitment identity, title, temporal bounds, and status: Canonical Operational State consumption where already governed;
- temporal-window selection and ordering: Deterministically Derived Briefing Presentation;
- day/time wording: Deterministically Derived Briefing Presentation with explicit timezone and locale;
- calendar label: Deferred unless source-container identity and display authority are governed;
- `First on the calendar` wording: DAWNWATCH-Specific Voice State;
- `state.calendar[0]` as authority: Rejected + None authorised.

### Urgent communications

Current selection rule:

```text
unread
OR important
OR sourceLabel === "Governance Engineering"
```

Before treating any part of this rule as an open governance question, the audit shall inspect the existing `OperationalCommunication` responsibility statement and all governing artefacts defining the communication publication boundary.

The audit shall determine whether the repository has already excluded:

- automated significance or salience assertions;
- provider importance classifications;
- mutable unread state;
- attention recommendations;
- reply-need assertions;
- consumer-specific prioritisation;
- mailbox or source-label policy;

from the canonical `OperationalCommunication` responsibility.

An existing governed exclusion shall be treated as settled architectural evidence unless the audit identifies:

- a materially different responsibility;
- new independent operational evidence;
- a constitutional conflict;
- or an explicit reason to reopen the earlier decision.

Audit questions:

- What does the authoritative `OperationalCommunication` responsibility statement already permit and exclude?
- Are `unread` and `important` provider-observed mutable labels, automated significance assertions, application state, or governed operational facts?
- Has canonical communication publication already rejected significance, salience, or attention classification?
- Is `sourceLabel === "Governance Engineering"` a private DAWNWATCH policy rather than communication state?
- Does the current heuristic mean urgent, important, unread, needs attention, needs reply, or merely selected?
- Is the heuristic shared by another consumer?
- Does shared use create legitimate operational ownership, or only duplicated consumer policy?
- Can the rule operate honestly when one or more inputs are constitutionally unavailable?
- Does `Communications clear` overclaim when source evidence is unavailable or when the legacy heuristic cannot be reconstructed?

The starting presumption shall be:

- communication identity and bounded metadata may be consumed only where already governed;
- existing exclusions on significance, salience, unread state, importance, or attention classification remain in force;
- any permitted attention selection is a versioned DAWNWATCH derivation over authorised evidence;
- `Governance Engineering` source-label selection is consumer policy unless separately governed;
- `needs attention` is DAWNWATCH wording and must not be represented as canonical communication state;
- no canonical communication expansion may be justified solely by preserving the legacy DAWNWATCH output.

Any proposal to expand canonical communication responsibility requires separate constitutional evidence and cannot be authorised by Sprint 3.63.

### DAWNWATCH sentence construction

Current presentation includes:

- `N urgent.`
- `Nothing urgent.`
- ranked compact list;
- `First on the calendar: …`
- `No scheduled commitment currently in view.`
- `N communications need attention.`
- `Communications clear.`
- fixed sentence order;
- single-paragraph format.

Audit questions:

- Which statements are neutral rendering?
- Which statements overclaim evidence?
- Does `clear` mean no items, no selected items, no urgent items, source unavailable, or no data?
- Does `currently in view` disclose the observation boundary sufficiently?
- Should uncertainty and source availability be expressible?
- Does DAWNWATCH voice need a governed vocabulary for unavailable evidence?
- Which wording belongs entirely to the consumer?
- Does the current order imply a priority or salience judgment?
- Can final prose be separated from semantic briefing content for future evaluation?

These elements are expected to be DAWNWATCH-Specific Voice State, but the audit must identify any wording that embeds an ungoverned factual claim.

---

## Proposed DAWNWATCH Briefing Presentation Contract

Sprint 3.63 shall produce a proposal with the following minimum structure.

### 1. Contract status

The proposal shall begin with:

```text
Status: Proposed — non-authoritative.
```

It shall state that:

- it records evidence and recommendations;
- it does not approve implementation;
- it does not expand canonical publication;
- it does not amend an existing responsibility statement;
- it does not supersede existing governed artefacts;
- it requires a separate governance-review sprint;
- future engineering must not implement it as though approved.

### 2. Governing rules

The proposal shall include at least:

1. Canonical facts must already have accepted ownership.
2. DAWNWATCH need does not establish canonical publication authority.
3. Existing canonical responsibility exclusions remain authoritative unless explicitly reopened through separate governance.
4. Deterministic derivations require explicit material context.
5. DAWNWATCH voice may frame evidence but may not create it.
6. An absent canonical input shall not be reconstructed from legacy state.
7. Deferred means not authorised.
8. Empty data and unavailable evidence must remain distinguishable.
9. Temporal answers require sufficient observation-window evidence.
10. Legacy behaviour may be intentionally lost where preserving it would violate governance boundaries.

### 3. Proposed input boundary

The proposal shall identify the smallest governed input boundary required for a future DAWNWATCH briefing.

Potential inputs may include existing canonical facts such as:

- canonical priority identity and title;
- canonical commitment identity, title, temporal bounds, and status;
- canonical communication identity and bounded metadata;
- canonical source identity and availability;
- canonical provenance;
- explicit reference time;
- explicit viewer timezone;
- explicit locale;
- explicit briefing temporal scope;
- explicit observation-window coverage;
- explicit rule versions.

The proposal shall not add canonical fields merely to recreate legacy output.

Any absent input must be classified as:

- omitted;
- deferred;
- rejected;
- unsupported;
- or requiring separate canonical-governance evidence.

### 4. Proposed semantic presentation output

The proposal shall define a typed conceptual output without implementing it.

For example:

```text
DawnwatchBriefingPresentation
```

The actual proposed shape shall be evidence-derived.

It may include semantic sections such as:

- urgency summary;
- priorities summary;
- commitment-window summary;
- communication-attention summary;
- source-availability summary;
- evidence-sufficiency state;
- narrative rendering tokens.

The proposal must avoid reducing the governed contract to one opaque precomposed string where that would prevent independent evaluation.

It shall distinguish:

```text
semantic briefing content
```

from:

```text
final DAWNWATCH wording
```

A future implementation must be capable of comparing semantic outputs independently of prose.

### 5. Proposed deterministic derivations

For every derivation, specify:

- exact input;
- exact eligibility rule;
- exact ordering rule;
- exact tie-breaker;
- exact temporal boundary;
- exact source scope;
- exact unavailable-input behaviour;
- exact observation-window requirement;
- rule identifier;
- rule version.

Potential derivations to assess include:

- eligible commitments in a requested temporal window;
- next eligible commitment;
- commitment count in a window;
- priority count;
- selected priority list;
- communication-attention count;
- source-availability summary;
- whether a temporal claim can be answered;
- temporal labels;
- singular/plural forms.

A derivation shall fail closed or omit honestly when its governed inputs are absent.

It shall not reconstruct deferred or excluded fields from legacy state.

### 6. Proposed DAWNWATCH voice state

The proposal shall identify consumer-owned elements such as:

- sentence templates;
- ordering of sections;
- compression level;
- opening and closing phrasing;
- singular/plural wording;
- use of `urgent`, `clear`, `attention`, and `first`;
- tone;
- one-paragraph versus structured format;
- whether uncertainty is stated;
- whether source unavailability is surfaced.

DAWNWATCH voice may frame evidence.

It may not upgrade uncertainty into certainty or absence of evidence into evidence of absence.

### 7. Proposed unavailable-evidence vocabulary

The contract proposal shall explicitly distinguish:

```text
No matching item in a sufficiently covered and available source window
```

from:

```text
The source is unavailable or the observation window is insufficient
```

It shall identify candidate semantic statuses for later governance, such as:

- `AVAILABLE_WITH_MATCHES`;
- `AVAILABLE_NO_MATCHES`;
- `SOURCE_UNAVAILABLE`;
- `WINDOW_NOT_COVERED`;
- `UNSUPPORTED_QUERY`;
- `INPUT_DEFERRED`.

These names are proposals only.

The audit shall determine whether an existing repository vocabulary should be reused instead.

---

## Acceptance Scenario — “do I have anything tomorrow afternoon”

The Sprint 3.63 output shall include a dedicated section with this exact heading.

### Required explicit context

- reference instant;
- viewer timezone;
- locale where wording requires it;
- tomorrow’s local date;
- afternoon start;
- afternoon end;
- interval-boundary policy;
- inclusion or exclusion of all-day commitments;
- inclusion or exclusion of cancelled commitments;
- observation-window coverage;
- source availability;
- deterministic ordering.

### Required canonical evidence

- complete relevant commitment set;
- commitment identity;
- commitment title where the answer names matches;
- starts-at value;
- end or due value where overlap must be assessed;
- scheduled or cancelled status;
- source identity;
- provenance;
- source availability;
- observation scope or equivalent evidence that the requested window is sufficiently covered.

### Required deterministic computation

The future capability must evaluate:

```text
commitment overlaps tomorrow-afternoon window
```

rather than:

```text
commitment is the first array item
```

The candidate overlap rule to assess is:

```text
commitmentStart < afternoonEnd
AND
commitmentEnd > afternoonStart
```

This is the conventional half-open interval-overlap test and is the required starting proposal for governance review.

The audit shall determine:

- whether canonical `dueAt` is semantically valid as the event end for this purpose;
- how zero-duration commitments are handled;
- how all-day commitments are handled;
- how missing end times are handled;
- whether exact-boundary commitments count;
- whether the interval convention is already governed elsewhere.

Sprint 3.63 shall not implement the rule.

The separate governance review shall accept, modify, defer, or reject it.

### Required outcomes

The future system must distinguish:

- one or more matching commitments;
- no matching commitments with sufficient evidence;
- unavailable source;
- insufficient observation coverage;
- malformed or unsupported temporal evidence.

### Legacy before-state

Record that current behaviour depends on a single next-commitment field and may answer correctly only by coincidence.

### Proposed after-state

Record that a future governed briefing capability should compute the answer from a complete, explicit, replayable temporal window over governed commitments and source-availability evidence.

No implementation shall occur in this sprint.

---

## Future Evaluation Requirements

Sprint 3.63 shall not implement a comparison harness.

It shall define constraints for a later one.

### Runtime-computed classification requirement

Any future DAWNWATCH parallel-evaluation harness must follow the corrected Sprint 3.60.1 discipline.

Behavioural classifications shall be computed from actual runtime comparison.

They shall not be supplied as fixture literals.

The harness must not contain logic equivalent to:

```text
scenario X is Equivalent
scenario Y is Defect
```

merely because the scenario name requests that result.

Instead, it must:

1. construct one shared input;
2. run the legacy briefing path;
3. run the governed briefing path;
4. compare independently produced semantic and rendered results;
5. derive `Equivalent` or `Defect` from actual observed equality or governed predicates;
6. append `Intentional Improvement` only where a separate authoritative governance artefact defines the expected difference;
7. classify explicit supported failures as `Unsupported Boundary`;
8. classify unmatched failures as `Undocumented Failure Mode`;
9. derive the recommendation from the resulting rows.

### Mutation-detection requirement

A future evaluator must include mutation-style tests proving that:

- changing governed semantic output causes a previously equivalent row to become `Defect`;
- changing legacy output causes the comparator to detect divergence;
- governance-derived `Intentional Improvement` rows remain tied to an authoritative artefact;
- no test can obtain `Equivalent` merely by passing an expected label;
- a deliberately introduced tomorrow-afternoon interval error is detected;
- a deliberately omitted matching commitment is detected;
- a false `no commitments` claim is detected when source evidence is unavailable.

### Semantic-before-prose comparison

A future harness shall compare at least two levels:

1. semantic briefing content;
2. rendered DAWNWATCH wording.

This prevents harmless wording changes from obscuring factual regressions.

It also prevents identical prose from concealing different underlying evidence or sufficiency states.

### Identical-input evidence

The future evaluation must record that both paths received:

- the same acquired operational observations;
- the same reference instant;
- the same timezone;
- the same locale;
- the same source-availability state;
- the same requested temporal window;
- the same observation-window evidence;
- the same applicable configuration.

### Synthetic evidence notice

Any fixture-based output shall be labelled clearly as synthetic.

It shall not be represented as:

- authenticated operational evidence;
- production evidence;
- evidence from the operator’s real JARVIS instance.

---

## Proposed Future Evaluation Scenarios

Sprint 3.63 shall recommend, but not implement, a scenario set that includes at least:

- empty state;
- no urgent priorities;
- one urgent priority;
- multiple priorities;
- priority title without governed rank;
- missing governed due semantics;
- one eligible commitment;
- multiple commitments;
- cancelled commitment first in legacy array;
- tomorrow-morning commitment only;
- tomorrow-afternoon commitment not first;
- tomorrow-afternoon overlapping commitment;
- commitment ending exactly at afternoon start;
- commitment starting exactly at afternoon end;
- all-day commitment;
- zero-duration commitment;
- no tomorrow-afternoon commitments with available source;
- unavailable calendar source;
- insufficient observation window;
- empty communications;
- one communication matching the legacy attention heuristic;
- missing governed unread or important evidence;
- source-label-dependent legacy selection;
- communication source unavailable;
- mixed source availability;
- malformed temporal evidence;
- deterministic replay under identical inputs.

The principal scenario shall remain:

```text
do I have anything tomorrow afternoon
```

---

## Operator and Repository Evidence Boundary

Sprint 3.63 is documentation and repository evidence only.

No promotion machinery shall be built.

The sprint shall record the downstream boundary established in Sprint 3.62:

- Codex can verify repository state;
- Codex can verify tests and isolated runtime behaviour;
- Codex can compare implementations in its own environment;
- Codex cannot inspect or modify the operator’s actual `.env.local`;
- Codex cannot verify the operator’s real running JARVIS instance;
- Codex cannot perform final visual or experiential acceptance;
- an isolated DAWNWATCH process is not the real production briefing.

A future promotion sequence will therefore require separate stages:

```text
Repository promotion readiness
        ↓
Operator configuration
        ↓
Actual local JARVIS restart
        ↓
Real DAWNWATCH behavioural verification
        ↓
Operator promotion record
```

Sprint 3.63 shall flag this future requirement only.

It shall not add selectors, environment variables, checklists, or promotion reports.

---

## Required Audit Deliverables

### 1. Current Capability Inventory

A complete table of every current DAWNWATCH briefing datum, rule, and phrase.

Required columns:

- item;
- current output example;
- current source field or helper;
- producer;
- current semantics;
- current source type;
- current consumer;
- applicable responsibility statement;
- hidden inputs;
- failure or ambiguity;
- proposed outcome;
- proposed class;
- evidence.

### 2. Canonical Coverage Matrix

For each current item, record:

- canonical equivalent exists;
- canonical equivalent does not exist;
- canonical equivalent is semantically different;
- current field is legacy-only;
- governing responsibility statement;
- prior accepted, deferred, rejected, or excluded status;
- provenance available;
- stable identity available;
- observation time available;
- source availability available;
- observation-window evidence available;
- safe deterministic derivation possible;
- governance decision required.

### 3. Briefing Classification Matrix

Required columns:

- current composition;
- proposed outcome;
- proposed class;
- reasoning;
- consequence of omission;
- existing governance evidence;
- evidence required for governance;
- future implementation constraint.

Proposed outcomes shall use:

- Accepted;
- Modified;
- Deferred;
- Rejected.

Proposed classes shall use:

- Canonical Operational State;
- Deterministically Derived Briefing Presentation;
- DAWNWATCH-Specific Voice State;
- None authorised.

### 4. Gap and Boundary Register

At minimum, assess:

- urgency ownership;
- priority rank;
- priority due semantics;
- array-order authority;
- calendar display-name ownership;
- preformatted day and time;
- cancellation handling;
- complete temporal-window coverage;
- all-day semantics;
- overlap semantics;
- zero-duration semantics;
- source availability;
- observation-window sufficiency;
- unread status;
- important status;
- significance and salience exclusions;
- Governance Engineering source-label rule;
- communication-attention semantics;
- `clear` wording;
- absence of evidence versus evidence of absence;
- implicit current time;
- timezone;
- locale;
- deterministic replay;
- provenance;
- privacy and content boundaries.

### 5. Proposed DAWNWATCH Briefing Presentation Contract

A single non-authoritative proposal incorporating:

- status and authority;
- governing rules;
- field-by-field classification;
- proposed input boundary;
- proposed semantic output;
- proposed derivations;
- proposed voice state;
- unavailable-evidence states;
- tomorrow-afternoon scenario;
- deferred register;
- rejected register;
- existing responsibility boundaries;
- open governance questions;
- recommended next activity.

### 6. Evaluation Design Note

A non-implementation section defining:

- future comparison levels;
- runtime-computed classification;
- mutation tests;
- scenario requirements;
- identical-input evidence;
- synthetic-evidence labelling;
- recommendation gate;
- unsupported-boundary handling;
- undocumented-failure handling.

---

## Governance Questions the Audit Must Answer

The audit shall answer, or explicitly leave unresolved with required evidence:

1. Does DAWNWATCH need a distinct presentation contract, or can it consume an existing governed presentation?
2. Should DAWNWATCH consume `ExecutiveStateSnapshot` directly or a narrower application adapter?
3. Which current facts already have canonical ownership?
4. Which current fields are legacy presentation artefacts?
5. Which candidate questions have already been resolved by existing responsibility statements?
6. Does canonical state contain enough commitment information for arbitrary bounded temporal-window questions?
7. How is observation-window completeness represented?
8. How should all-day events interact with `afternoon`?
9. What interval-overlap rule is appropriate?
10. How should zero-duration commitments be handled?
11. Is priority urgency a canonical assertion, a derivation, or already excluded?
12. Is priority ordering canonical, asserted, or consumer-specific?
13. Is due information available as an absolute governed target?
14. Has `OperationalCommunication` already excluded unread, importance, significance, salience, or attention state?
15. Is `Governance Engineering` attention selection private consumer policy?
16. Does `needs attention` require a separate semantic contract?
17. Should DAWNWATCH expose source unavailability explicitly?
18. Should the future presentation retain one compact paragraph or expose structured semantic sections?
19. Which elements belong to DAWNWATCH voice rather than operational state?
20. What evidence would justify any canonical expansion?
21. Which legacy outputs should be intentionally lost rather than reconstructed?
22. What separate governance-review sprint is required before implementation?

---

## Constitutional Constraints

Do not:

- treat current legacy usage as canonical evidence;
- copy the `OperationalState` briefing shape into `ExecutiveStateSnapshot`;
- add fields merely to preserve current prose;
- represent `priority.rank` as canonical without governance;
- represent free-text `due` as replayable time;
- represent `urgent` as canonical merely because it is a Boolean;
- preserve `state.calendar[0]` as a governed next-event rule;
- use connector order as operational authority;
- infer calendar coverage from an empty array;
- infer availability from absence of commitments;
- treat a source display label as canonical source identity;
- expose communication content beyond accepted metadata boundaries;
- treat unread or important as intrinsic communication truth without reconciling the existing responsibility statement;
- classify unread, important, significance, salience, or attention state as newly undecided without first applying existing `OperationalCommunication` governance;
- describe the Governance Engineering label heuristic as universal urgency;
- use a hidden current clock;
- use implicit timezone or locale;
- classify future runtime equivalence through hardcoded literals;
- implement the proposed contract;
- add promotion machinery;
- claim operator verification.

---

## Validation

Although this sprint is evidence and documentation only, the complete repository validation suite is mandatory.

Run:

```text
npm test
npm run lint
npm run typecheck
git diff --check
```

No proportionality or repository-cost exception applies.

In addition to the complete suite, run or explicitly identify the tests covering:

- `getOpeningBrief`;
- the DAWNWATCH branch of `getOpeningBrief`;
- `urgentCommunications`;
- `describeCommitment`;
- empty-calendar briefing behaviour;
- priority and communication briefing composition;
- operational-state construction;
- canonical executive-state construction;
- existing communication-publication responsibility invariants;
- the Sprint 3.60.1 runtime comparator and mutation-detection behaviour where its discipline is cited.

The completion report shall record:

- test-file count;
- passed-test count;
- skipped-test count;
- targeted DAWNWATCH test count;
- lint result;
- typecheck result;
- diff-check result;
- any warnings.

Validation shall also confirm:

- no runtime file changed;
- no type changed;
- no schema changed;
- no canonical publication changed;
- no responsibility statement changed;
- no selector was added;
- no API route was added;
- no environment variable was added;
- no comparison harness was implemented;
- no existing DAWNWATCH behaviour changed.

---

## Success Criteria

Sprint 3.63 is complete when:

- the current DAWNWATCH call path is traced;
- every current briefing datum and phrase is inventoried;
- every hidden assumption is recorded;
- every item is traced to its current owner and producer;
- applicable responsibility statements are identified;
- already-governed exclusions are distinguished from genuinely unresolved questions;
- canonical coverage is assessed;
- each item receives a proposed outcome and class;
- the outcome and class axes remain distinct;
- deferred and rejected items are explicit;
- no legacy field is accepted solely because it exists;
- the tomorrow-afternoon acceptance scenario is fully analysed;
- the interval-overlap requirement is documented;
- the current coincidence-based limitation is documented;
- a non-authoritative briefing-contract proposal is produced;
- the proposal explicitly requires separate governance review;
- future runtime classification requirements reflect Sprint 3.60.1;
- mutation-detection requirements are recorded;
- the Sprint 3.62 operator/repository boundary is acknowledged for downstream work;
- no implementation or promotion machinery is introduced;
- no runtime behaviour changes;
- the full validation suite passes;
- the completion recommendation is evidence-based.

---

## Completion Gate

Return:

```text
Audit Complete — Governance Review Required
```

only if all evidence and proposal deliverables are complete.

Return:

```text
Audit Incomplete
```

if:

- any current `dawnwatchBrief` composition is omitted;
- the call path is unverified;
- current and canonical semantics are conflated;
- a proposed outcome or class lacks reasoning;
- outcome and class are implicitly collapsed;
- existing responsibility statements are not inspected;
- a settled communication boundary is treated as newly undecided without justification;
- hidden temporal or source assumptions remain unrecorded;
- the tomorrow-afternoon scenario is not analysed;
- the proposal is presented as authoritative;
- runtime code changes;
- a future evaluator is implemented;
- classifications are hardcoded rather than identified as future runtime evidence;
- promotion machinery is introduced;
- the full validation suite is not run.

Do not return:

```text
Ready for Promotion
```

Do not return:

```text
Promotion Complete
```

Do not return:

```text
Ready for Implementation
```

Implementation requires a separate authoritative governance decision.

---

## Expected Outcome

The sprint should establish a conclusion in this form:

```text
dawnwatchBrief is operationally present but architecturally partial.

It currently composes legacy OperationalState facts, legacy presentation fields,
consumer heuristics, deterministic formatting, and DAWNWATCH voice in one function.

A governed DAWNWATCH briefing requires an explicit presentation contract separating:

- existing canonical operational facts;
- deterministic briefing derivations;
- DAWNWATCH-specific voice;
- deferred inputs;
- rejected legacy carry-over;
- and existing canonical responsibility exclusions.

The proposed contract is evidence only and requires separate governance review.
```

The audit should also establish that:

```text
do I have anything tomorrow afternoon
```

cannot be governed by a single next-commitment field.

It requires explicit interval-overlap computation over sufficient canonical commitment evidence and source availability.

The starting candidate rule is:

```text
commitmentStart < afternoonEnd
AND
commitmentEnd > afternoonStart
```

subject to separate governance review.

---

## Informational Follow-On Sequence

The completion report may recommend, without authorising:

### Sprint 3.64 — Governed DAWNWATCH Briefing Contract Review

Potential objective:

- review every Sprint 3.63 proposal;
- apply existing responsibility statements;
- apply the constitutional publication test;
- accept, modify, defer, or reject each item;
- establish an authoritative DAWNWATCH Briefing Presentation Contract;
- authorise no implementation beyond the contract itself.

Only after that governance review should implementation be considered.

A likely later sequence is:

```text
3.63  Capability Audit & Evaluation Proposal
3.64  Governed Briefing Contract Review
3.65  Governed Briefing Implementation
3.66  Parallel Evaluation
3.66.1 Runtime Classification Validation, if required
3.67  Production Integration
3.68  Promotion Readiness
Operator Promotion
```

These sprint numbers are informational only and may be revised.

---

## Return Format

Provide one completion document containing:

### Executive Summary

State what was audited and confirm that no implementation or promotion occurred.

### Repository State

Record:

- repository;
- branch;
- commit;
- relevant files inspected;
- working-tree status;
- remote or environment limitations.

### Current Call Path

Document the executable path from state acquisition to DAWNWATCH briefing rendering.

### Current Capability Inventory

Inventory every datum, rule, helper, fallback, and phrase.

### Existing Responsibility Evidence

Document the canonical responsibility statements inspected, including `OperationalCommunication`, and state which questions were already governed versus genuinely unresolved.

### Canonical Coverage Matrix

Identify existing canonical equivalents and unresolved gaps.

### Classification Matrix

Classify every item using separate outcome and class columns.

### Acceptance Scenario

Include the exact heading:

```text
Acceptance Scenario — “do I have anything tomorrow afternoon”
```

Document current behaviour, required evidence, required interval derivation, and intended governed outcomes.

### Proposed Briefing Contract

Include the complete non-authoritative proposal.

### Deferred and Rejected Registers

List every item not authorised for future implementation.

### Future Evaluation Constraints

Record runtime-computed classification, mutation testing, identical-input evidence, and semantic-before-prose comparison.

### Evidence Boundary

State:

```text
This sprint provides repository evidence and a governance proposal only. It does not verify or alter the operator’s actual JARVIS runtime.
```

### Validation Results

Include:

- full tests;
- targeted DAWNWATCH tests;
- lint;
- typecheck;
- diff check;
- confirmation that runtime files did not change.

### Outstanding Questions

List unresolved architectural and constitutional decisions.

### Recommendation

Return exactly one:

```text
Audit Complete — Governance Review Required
```

or:

```text
Audit Incomplete
```

---

## Engineering Intent

DAWNWATCH is not merely a paragraph formatter.

It is the executive briefing surface through which JARVIS presents a compressed reading of the operator’s immediate situation.

That makes its information boundary consequential.

The existing implementation is deterministic in the narrow sense that the same `OperationalState` produces the same string. But deterministic string construction is not sufficient governance when the supplied state mixes:

- canonical facts;
- legacy fields;
- hidden temporal assumptions;
- connector-order assumptions;
- unresolved urgency semantics;
- source-label heuristics;
- automated significance or salience signals;
- and consumer-specific prose.

Sprint 3.63 therefore does not attempt to upgrade DAWNWATCH by replacing one input object with another.

It first establishes:

- what DAWNWATCH is legitimately entitled to know;
- what existing responsibility statements already permit or exclude;
- what it may derive;
- what belongs only to its voice;
- what evidence is missing;
- and what legacy behaviour should not survive.

The concrete test is intentionally ordinary:

```text
do I have anything tomorrow afternoon
```

A trustworthy executive assistant should not answer that question because the relevant event happened to occupy array index zero.

It should answer through a deterministic interval-overlap computation over a complete, bounded, replayable, source-qualified operational picture—or state honestly that the evidence is insufficient.

This sprint defines the evidence and governance work required to reach that standard without prematurely changing the system.
