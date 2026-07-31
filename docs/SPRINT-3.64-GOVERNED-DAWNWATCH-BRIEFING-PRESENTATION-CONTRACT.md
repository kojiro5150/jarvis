# Governed DAWNWATCH Briefing Presentation Contract

**Status: Governed**

## Purpose

This document is the authoritative presentation contract for future DAWNWATCH briefing work. It
supersedes the non-authoritative proposal in Sprint 3.63. Sprint 3.63 remains the authoritative
evidence base, but its recommendations do not confer implementation authority.

This decision applies the Constitutional Publication Test independently: operational value does
not by itself establish ownership; canonical facts require an existing authoritative owner, stable
semantics, provenance, and identity; deterministic derivations require complete explicit inputs;
and publication must benefit consumers independently of DAWNWATCH. Consumer convenience and
legacy placement are never publication authority.

## Scope

This contract governs DAWNWATCH's briefing input boundary, structured semantic output,
deterministic derivations, and voice boundary. It is a governance decision only. It does not alter
runtime behaviour, `OperationalState`, `ExecutiveStateSnapshot`, `OperationalCommunication`, any
responsibility statement or ADR, `dawnwatchBrief`, selectors, APIs, promotion logic, or evaluation
harnesses. It authorises no implementation; Sprint 3.65 may implement only this contract.

## Input Boundary

DAWNWATCH shall consume a narrow application-facing projection, not unrestricted legacy state and
not reconstructed canonical objects. The projection must retain canonical references and source
qualification.

### Authorised canonical facts

The following already-owned facts are authorised inputs; this contract creates no publication:

- canonical priority identity, title, and source/provenance;
- canonical commitment identity, title, governed temporal bounds, scheduled/cancelled status, and
  provenance, but only where the existing commitment contract supplies those meanings;
- canonical communication identity, sender, recipients, sent and applicable received timestamps,
  optional subject, and protocol reply references, within the Operational Communication
  Responsibility Statement; and
- canonical source identity, kind, availability status, observation time, snapshot identity, and
  provenance.

### Authorised deterministic and voice inputs

Derivations may receive an explicit reference instant, viewer timezone, locale, requested interval,
source scope, rule identifier/version, and deterministic identity tie-break rule. DAWNWATCH Voice
may receive only the resulting structured semantic state and explicit rendering context.

An explicit input does not make its semantics authoritative. Observation-window coverage,
commitment end semantics, priority urgency/order/due semantics, afternoon bounds, all-day and
zero-duration policy, and malformed-input policy remain deferred below and therefore cannot be
supplied as invented configuration.

### Explicit exclusions

The boundary excludes legacy `urgent`, rank, array order, free-text due text, connector array
position, preformatted day/time, calendar display name, provider-specific label checks, unread,
important, mailbox/provider/source labels, snippets, significance, salience, attention or reply
need, and any inferred evidence completeness. A missing canonical input must not be reconstructed
from a legacy object, source string, title, fallback array, or local default.

## Semantic Output

The governed output is structured semantics before prose. Every section carries a semantic status,
relevant canonical references, source availability, and evidence sufficiency. The vocabulary is:

- `available`: authorised evidence supports the reported observations;
- `unavailable`: a required governed source reports that it is unavailable;
- `insufficient_coverage`: sources may be available, but evidence does not establish complete
  coverage for the requested claim;
- `unsupported`: the request requires semantics this contract has not authorised; and
- `not_applicable`: a section is outside the request without implying an empty operational set.

The urgency summary reports `unsupported` until urgency ownership and its predicate are governed;
it must not report “nothing urgent.” The priorities summary may report referenced canonical
priority titles, but must not claim rank, order, urgency, or due status. In the absence of an
authorised ordering rule it may omit the list rather than expose accidental order.

The commitment summary may report authorised canonical commitment observations. A bounded
existence or absence answer requires an authorised interval rule, eligible-item rule, temporal
bounds, and complete coverage; without all of them it reports `unsupported` or
`insufficient_coverage`, never “free” or “no commitments.”

The communication summary may report bounded intrinsic communication metadata without selecting
or counting messages by unread, importance, labels, significance, salience, or required attention.
It must not report “communications clear.” Neutral observations must remain distinguishable from
an attention recommendation.

Evidence sufficiency and source availability are first-class output states, not prose-only
qualifiers. The overall semantic status is the least sufficient status required for the answer;
an available source cannot upgrade incomplete coverage, and populated fallback data cannot upgrade
an unavailable source.

## Deterministic Derivations

The following operations are authorised only over authorised inputs: stable selection by an
explicit governed predicate, deterministic ordering by an explicit key followed by canonical
identity, counts over that selected set, and locale/time formatting from canonical temporal bounds
with explicit reference instant, timezone, and locale. Each operation must record its rule version.

No derivation may use hidden clocks, host timezone, browser locale, provider order, array position,
opaque-identifier parsing, or an unavailable value treated as false. A conditional derivation is
inactive when any required input remains deferred; this contract does not turn conditional
mathematics into authority for missing semantics.

Temporal-window filtering and ordering are therefore **Deferred**, not Modified as proposed in
Sprint 3.63. The operation is deterministic in isolation, but determinism cannot cure the absent
authority for generic end bounds, interval coverage, eligibility, and afternoon boundaries.

## Voice Boundary

DAWNWATCH Voice State exclusively owns wording, sentence order, grammar, punctuation, separators,
formatting, paragraph layout, compression, and narrative flow. Its authoritative owner is the
DAWNWATCH application capability. Voice may vary these elements only after structured semantics
exist and must preserve semantic status and uncertainty.

Voice may not create urgency, rank, due status, chronological authority, attention, availability,
coverage, or absence. In particular, grammar and punctuation that depend on deferred or rejected
facts remain dormant. “Nothing urgent,” “first on the calendar,” “needs attention,” and
“communications clear” are not authorised factual claims.

## Governed Classifications

Each row below corresponds to the Sprint 3.63 Classification Matrix. The compound calendar-label
row is separated because its two candidates require different final outcomes. Thus all matrix
content receives exactly one decision per candidate.

| Sprint 3.63 composition | Outcome | Architectural class | Authoritative owner | Independent constitutional decision |
| --- | --- | --- | --- | --- |
| Priority canonical id/title consumption | **Modified** | Canonical Operational State | Canonical priority publication | Consume the existing source-qualified identity and title only. The title has independent operational value, stable canonical identity, and replayable provenance; legacy unmapped titles have none of that authority. |
| Urgent evidence/count | **Deferred** | None authorised | None established | The legacy Boolean has no authoritative assertion contract, stable meaning, or provenance. A count inherits that defect; DAWNWATCH demand cannot establish an owner. |
| Urgency wording | **Modified** | DAWNWATCH Voice State | DAWNWATCH application capability | Grammar is consumer-owned, but may render urgency only after authorised semantics exist and must otherwise render an explicit unsupported/unavailable state. |
| Priority rank/order | **Deferred** | None authorised | None established | Neither array position nor numeric rank identifies an authoritative, versioned ordering assertion. Stable tie-breaking cannot repair missing ownership. |
| Due text | **Deferred** | None authorised | None established | Relative free text has hidden temporal context and no canonical priority-target owner; it is neither stable nor replayable. |
| List punctuation/separator | **Accepted** | DAWNWATCH Voice State | DAWNWATCH application capability | Separators communicate no operational fact and are deterministic voice when applied only to authorised ordered content. |
| Empty priority handling | **Modified** | DAWNWATCH Voice State | DAWNWATCH application capability | An empty rendering segment is replaced by an explicit semantic status; whitespace must not stand in for evidence or absence. |
| Canonical commitment facts | **Modified** | Canonical Operational State | Canonical commitment publication | Consume existing qualified identity, title, contractually governed bounds, status, and provenance. Do not republish legacy names or broaden `dueAt` into a generic end without governance. |
| Index-zero selection | **Rejected** | None authorised | Not applicable | Connector position lacks operational meaning, stable ordering, completeness, and cross-consumer authority. |
| Temporal-window filtering/ordering | **Deferred** | None authorised | None established for the complete rule | Explicit deterministic arithmetic is plausible, but end, eligibility, coverage, timezone policy, and requested-window semantics are not all governed. This departs from Sprint 3.63's Modified proposal to avoid authorising an unusable partial rule. |
| Calendar display name | **Deferred** | None authorised | None established | A container name may have independent value, but stable source-container identity, display-name authority, provenance, and privacy scope are absent. |
| Google-only label rule | **Rejected** | None authorised | Not applicable | A provider string comparison is connector policy, not canonical provenance, and would give a display label operational authority. |
| Legacy day/time fields | **Rejected** | None authorised | Not applicable | These strings embed host timezone and locale and discard derivation context, so identical canonical observations cannot guarantee replay. |
| Calendar/no-event sentences | **Modified** | DAWNWATCH Voice State | DAWNWATCH application capability | Voice may distinguish a matching observation, no match in proven complete coverage, insufficient coverage, unavailable evidence, and unsupported semantics; it may not infer absence from an array. |
| Canonical communication metadata | **Modified** | Canonical Operational State | `OperationalCommunication` | Only the intrinsic, source-asserted metadata already owned by that publication is admissible. Identity and provenance survive; attention and connector organisation do not enter with it. |
| Unread/important/source-label OR and count | **Rejected** | None authorised | Not applicable | Every predicate is outside the settled communication responsibility or depends on ungoverned connector organisation. Combining and counting excluded inputs does not create a legitimate derivation. |
| Attention statement | **Rejected** | None authorised | Not applicable | “Needs attention” assigns significance and required action, responsibilities explicitly excluded from canonical communication and unsupported by a separately governed consumer policy. |
| Communications-clear sentence | **Modified** | DAWNWATCH Voice State | DAWNWATCH application capability | The exact claim is prohibited. Voice must report neutral observations and evidence status; zero heuristic matches cannot become evidence of operational clarity. |
| Sentence order/one-paragraph voice | **Modified** | DAWNWATCH Voice State | DAWNWATCH application capability | Sentence order remains voice, but a compact paragraph is permitted only as a lossless rendering after structured semantic output, with insufficiency and unavailability visible. |

Final decision totals are **1 Accepted, 8 Modified, 5 Deferred, and 5 Rejected** across the 19
candidate decisions represented above.

## Deferred Register

Deferred items are complete decisions and confer no implementation permission:

1. priority urgency and counts require an authoritative assertion owner, semantics relative to
   canonical `level`, source/provenance, versioning, and independent consumers;
2. priority rank/order requires ownership of an explicit ordered assertion, stable identity,
   provenance, ties, and versioning;
3. priority due requires an authoritative absolute target and explicit temporal context;
4. temporal-window filtering requires governed commitment end semantics, eligible status, all-day
   and zero-duration rules, malformed-input behaviour, source scope, complete observation-window
   evidence, timezone policy, and requested-window definitions; and
5. calendar display name requires stable container identity, display-name authority, provenance,
   privacy scope, and independent consumer evidence.

## Rejected Register

Rejected carry-over consists of connector index-zero authority; Google/source-string display-label
policy; legacy preformatted day/time; unread/important/source-label selection and its OR/count; and
attention claims. These may not be reconstructed under new names or retained solely for backwards
compatibility. The settled Operational Communication exclusions for read state, importance,
mailbox/provider labels, attention heuristics, significance, and salience remain intact.

## Tomorrow Afternoon Rule

**Outcome: Deferred. No architectural class is authorised.**

The proposed half-open overlap expression is mathematically coherent:

```text
commitmentStart < afternoonEnd
AND
commitmentEnd > afternoonStart
```

It is not governed for implementation because the evidence does not establish a generic canonical
`commitmentEnd`, the start/end of “afternoon,” complete observation-window coverage, timezone and
daylight-saving policy, cancelled/all-day/zero-duration eligibility, malformed or absent end
behaviour, or privacy-safe source scope. `dueAt` must not silently acquire generic interval-end
semantics. A future governance review may accept or replace the expression only after those owners
and meanings exist. Until then, “Do I have anything tomorrow afternoon?” must yield `unsupported`
or `insufficient_coverage` as applicable, never a fabricated yes/no answer.

## Evidence Sufficiency Rules

1. A positive observation requires authorised identity, provenance, semantic fields, and an
   available source within the declared scope.
2. A negative claim requires all positive-claim inputs plus explicit evidence that the complete
   requested observation window and source scope were examined.
3. An empty collection proves only that no represented items were supplied; it does not prove
   absence, freedom, clarity, or lack of urgency.
4. `observedAt` establishes observation time, not observation-window completeness.
5. Mixed source states must remain source-qualified; one available source cannot mask another
   unavailable required source.
6. Unsupported semantics remain unsupported even when data happens to be present.

## Unavailable Evidence Behaviour

Unavailable, incomplete, malformed, and unsupported evidence must produce their explicit semantic
status deterministically. Last-good or local fallback data may be identified as such but must not
be presented as a current complete observation. DAWNWATCH must omit a factual assertion rather
than infer, default, or reconstruct it. Voice may explain the limitation but cannot soften it into
an unqualified negative claim.

## Implementation Constraints

Sprint 3.64 authorises no implementation. A future Sprint 3.65 implementation must:

- implement only Accepted and Modified decisions in this contract;
- leave Deferred derivations inactive and omit Rejected inputs and behaviours;
- use a narrow application-facing projection that preserves canonical identities/provenance;
- preserve all existing publication and Operational Communication responsibility boundaries;
- introduce no additional behaviour or canonical-model expansion on this contract's authority;
- make every reference time, timezone, locale, source scope, window, rule version, and tie-breaker
  explicit where an authorised derivation requires it; and
- preserve backwards compatibility only where that does not retain an unauthorised semantic claim.

## Future Evaluation Constraints

Any later evaluation must follow Sprint 3.60.1: compare structured semantic output first and voice
rendering second using identical recorded observations and explicit context. `Equivalent`,
`Defect`, and `Intentional Improvement` must be computed solely from actual runtime comparison;
scenario labels or hardcoded classifications are prohibited. Intentional improvement additionally
requires an authoritative governance citation.

Fixtures must be identified as synthetic where applicable. Mutation tests must demonstrate that
semantic and prose differences, interval boundaries, omitted matches, and false negative claims
under unavailable or insufficient evidence are detected. Evaluation cannot authorise a Deferred
input, revive a Rejected behaviour, or promote an implementation.

## Constitutional Conclusion

The contract preserves applications as consumers, canonical single responsibility,
non-reconstruction, identity integrity, provenance, deterministic replay, and evidence-before-
governance. The principal departure from Sprint 3.63 is deliberate: temporal-window filtering is
Deferred rather than Modified because the necessary semantic owners and completeness evidence do
not yet form an executable governed rule. The tomorrow-afternoon overlap rule is likewise Deferred.
All other refinements clarify ownership or prevent voice from manufacturing facts. No implementation
is authorised by this decision.
