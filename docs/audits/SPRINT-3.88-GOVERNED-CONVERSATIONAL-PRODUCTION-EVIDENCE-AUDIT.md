# Sprint 3.88 — Governed Conversational Production Evidence Audit

**Status:** Complete audit; governance review required  
**Sprint type:** Audit / evidence gathering / classification  
**Implementation authority:** None  
**Evidence cut:** `28084c4344b0ec6b63ac26559b98cc4392f19b20` on branch `work`, 2026-08-01 UTC

## Repository Precondition

**Observed.** The intended repository was `/workspace/jarvis`, branch `work`, at commit
`28084c4344b0ec6b63ac26559b98cc4392f19b20`. The initial working tree was clean. All
required governing artefacts, projection files, production files, and named directories
existed. The only change made by this sprint is this audit document.

The precondition check included `git branch --show-current`, `git rev-parse HEAD`,
`git status --short`, and explicit `test -f` checks. It also confirmed the presence of:

* `lib/governed-conversation/{projection-composer,types,input}.ts`;
* `app/api/chat/route.ts`, `lib/operational-state.ts`, and `lib/context-builder.ts`;
* all files under `lib/executive-context/`, `lib/memory/`, and the named Gmail content
  connector.

No required predecessor was missing, so the stop condition did not apply.

## Governing Artefacts Reviewed

The following were read completely:

1. `docs/ENGINEERING_CONSTITUTION.md`;
2. `docs/architecture/NORTH_STAR.md`;
3. `docs/architecture/JARVIS-Engineering-Specification-Standard.md`;
4. `docs/CONSTITUTIONAL-PUBLICATION-PRINCIPLES.md`;
5. `docs/architecture/ROADMAP.md`;
6. `docs/audits/SPRINT-3.68-GMAIL-RECIPIENT-PROJECTION-AUDIT.md`;
7. `docs/audits/SPRINT-3.75-CONVERSATIONAL-RUNTIME-CAPABILITY-AUDIT.md`;
8. `docs/SPRINT-3.82-GOVERNED-CONVERSATIONAL-LINEAGE-IDENTITY-CONTRACT.md`;
9. `docs/SPRINT-3.87-GOVERNED-CONVERSATIONAL-RUNTIME-INTEGRATION.md`.

**Governed.** Sprint 3.82 makes the dedicated projection composer the exclusive owner
of the complete, versioned projection. The route, model, prompt builder,
`context-builder.ts`, and legacy `OperationalState` may not assume that ownership.
Compatibility and conversation history are non-canonical; source/reference
minimisation and deterministic claims and conflicts are mandatory. Sprint 3.87 is
evidence of a failed integration gate, not authority to waive it.

## Production Search Method

The audit used repository-wide `rg` searches for all eight exact input type names and
category property names, then independent searches for the alternate vocabulary in the
sprint specification. It enumerated relevant files with `find` (without recursive
`ls`/`grep`), inspected constructors and types, and followed imports and callers with
targeted `rg -n` searches.

Production reachability was traced in both directions:

* acquisition → normalizer/adapter → publication/state → consumer;
* `/api/chat` and UI hook → request validation → operational-state/context construction;
* composer input → assertions → governed-input/model-request/validator;
* memory store → `buildOperationalState` → dashboard/prompt consumers;
* capability request → Gmail retrieval router → policy-qualified retrieval adapter.

Tests and fixtures were recorded but separated from production. In particular,
`lineage-test-fixtures.ts`, governed-conversation fixtures, parallel evaluations,
executive-context fixtures, and Cassie scenarios are **Tested** examples, not production
producers. EOS structural types and evaluation-only `CalendarProjectionAdapter` use are
not treated as ordinary-chat production reachability. Historical prose/string matches
were not treated as callers.

Evidence labels used below are: **Observed** (source/output), **Tested** (executable
test), **Governed** (binding artefact), **Inferred** (supported conclusion), and
**Unknown** (not safely established).

## Sprint 3.87 Findings Reconfirmed or Corrected

| Category | Result | Independent conclusion |
| --- | --- | --- |
| Gmail communication evidence | Refined | A production canonical recipient observation does reach `OperationalState`, and separately a policy-gated content retrieval path reaches `/api/chat`; neither is the required second-stage conversational publication. |
| Calendar evidence | Refined | Real Google Calendar acquisition exists and legacy events reach chat through `OperationalState`; no governed conversational publisher exists. |
| Memory/priority references | Confirmed | Mutable local/seed priorities reach chat, but no governed reference producer exists. |
| Source evidence | Confirmed | Source-specific acquisitions and retrieval audit records exist; no claim-linked generic conversational source-evidence publisher exists. |
| Connector availability | Refined | Production UI/status mechanisms exist, but not the governed shape or sufficient semantics. |
| Conversation history | Confirmed | Raw client history reaches the route/model; no governed classified-history producer exists. |
| Claims | Confirmed | Only fixtures/evaluations construct claims; no deterministic free-form production owner exists. |
| Conflicts | Confirmed | Structural EOS and fixture conflicts exist, but no claim-aware production conversational conflict owner exists. |

## Gmail Communication-Evidence Finding

### A. Composer requirement

**Observed.** `GovernedCommunicationEvidenceInput` requires
`communicationReference`, `recipientEvidenceReference`, a four-part
`GovernedSourceReference` (`sourceId`, `resourceId`, `field`, `observedAt`),
`provenanceReference`, `retrievalTime`, `available`, `contentKind`,
`compatibilityBoundary`, and `policyReference`; `contentDigest` is optional. The
composer freezes a structured clone, includes source publications as upstream
references, and requires claims to point to an exactly matching source key. The type
does not itself carry claim IDs: linkage occurs through claim source references.

**Tested.** Projection tests demonstrate preservation of recipient references,
availability, immutable deterministic projection identity, known-source enforcement,
and the non-authority of compatibility data. The tests use invented IDs/policy strings;
they do not establish a production ID or policy owner.

### B. Current production analogue

**Observed.** `projectProductionGmailEvidence` accepts a real
`GmailProductionAcquisition`, maps every observation through canonical
`normalizeGmailObservation`, and returns a frozen
`ProductionGmailRecipientEvidence`: normalized communications, fixed source
`google-gmail`, availability/state, and optional acquisition `observedAt` and
`snapshotId`. Normalized observations contain source-qualified observation and
recipient evidence semantics defined by the canonical adapter.

Its production caller is `loadGmail()` in `lib/operational-state.ts`. A successful
`GoogleGmailConnector.acquireRecent(5)` is projected and placed in
`OperationalState.gmailRecipientEvidence`; local, unsupported connector, auth failure,
and fetch failure paths instead publish empty evidence with explicit unknown,
not-authorised, or not-fetched state. DAWNWATCH selection consumes this evidence.
`/api/chat` calls `buildOperationalState`, but `buildContextBlock` consumes legacy
`gmailThreads`, not `gmailRecipientEvidence`; therefore the canonical evidence reaches
the state built for chat but not the prompt/composer.

**Observed.** `GoogleGmailContentConnector` fetches exactly one supplied message ID and
returns decoded subject/snippet/plain-text body and attachment metadata. It has no
search/list operation. `/api/chat` exposes it only through an explicit capability
request and `GmailContentRetrievalAdapter`, which evaluates policy before acquisition,
minimises released fields, records retrieval ID/time/outcome/policy version and audit,
and fails closed. Raw decoded content is acquisition output, not governed evidence.
The retrieval result could be an upstream source-specific input behind a governed
reference, but it cannot honestly be copied directly into the composer.

### C. Gap analysis

Mechanical material exists for source/resource observations, recipient evidence,
availability, observation/snapshot time, and—on the separate content path—retrieval
audit and content policy. Missing is an authorised rule that joins those paths and
constructs conversational publication identity, exact source field/reference,
provenance reference, retrieval time when no content retrieval occurred, content kind
and digest policy, compatibility boundary, source-policy version, and minimised
claim-relevant selection. No production caller supplies the result to the composer.
Local Gmail fallback must remain compatibility-only and cannot substitute for governed
evidence.

### D. Classification

**Design-shaped**

### E. Reasoning

The canonical normalizer removes the earlier recipient-lineage uncertainty, but the
repository does not govern the second publication's identity, policy linkage, or the
join between list observation and optional content retrieval. Selecting values here
would invent publication and disclosure policy, not merely rename fields. This is a
bounded category-specific design gap rather than a need to redesign Gmail acquisition.

### F. Earliest authorised next step

A narrow Gmail-to-conversational publication contract (or responsibility statement if
governance determines existing policy already fixes every choice), followed by a
separate publisher/wiring sprint. Claim-dependent selection waits for the claims
contract; the source-specific publisher can be specified independently.

## Calendar Finding

### A. Composer requirement

**Observed.** `GovernedCalendarEvidenceInput` mandates a commitment reference, exact
source reference, ISO `start`/`end`, timezone, provenance reference, availability,
coverage limit, and policy reference. It has no explicit all-day, cancellation/status,
or fallback fields, so any representation/minimisation of those semantics must be
governed outside or before this mapping.

### B. Current production analogue

**Observed.** Real Calendar capability exists outside `executive-context`:
`getCalendarConnector()` selects Google or local; `loadCalendar()` requests five
upcoming events. Google success yields `online`; local selection yields `unavailable`;
failures use local events while preserving `refresh_required` or `unavailable` at the
coarse state level. `CalendarEvent` includes a source-qualified ID, title, start/end,
all-day flag, status and Google metadata where available. The legacy local
`CalendarEventRecord` has only display day/date/title/time.

These events reach `OperationalState.calendar`, then `/api/chat` and prompt baseline as
the first/next commitment. The fallback array and live array share the same consumer
slot; status is adjacent, not per-event provenance. There is no governed conversation
publication caller, coverage-window publication, or source snapshot identity.

**Observed.** `lib/executive-context/engine.ts` derives aggregate context from an
already assembled canonical executive snapshot. It does not acquire Calendar data or
publish conversational Calendar evidence. `operational-picture-parallel-evaluation.ts`
uses a Calendar projection adapter in an evaluation comparison; fixtures are isolated.
Thus `lib/executive-context/` contains Calendar-related evaluation capability, but no
live Calendar producer for this composer.

### C. Gap analysis

Live Google events supply much of the temporal shape, but missing choices include
commitment/publication identity, exact source field, per-event provenance and
observation time, timezone conversion and all-day semantics, cancellation filtering,
five-item/query coverage meaning, policy reference, title minimisation, and an honest
separation of local fallback from live evidence. The composer shape cannot directly
express all current event semantics.

### D. Classification

**Design-shaped**

### E. Reasoning

Acquisition is not absence, but mapping would decide what a commitment means, what the
bounded query proves, and how omitted all-day/status data affects claims. Those are
coverage, identity, and policy decisions, not mechanically fixed by existing ordinary
chat governance.

### F. Earliest authorised next step

A source-specific Calendar conversational projection contract/audit should govern
identity, timezone/all-day/status, coverage, fallback, provenance and minimisation;
implementation follows. It may proceed in parallel with claims governance, while
claim relevance wiring waits.

## Memory/Priority Finding

### A. Composer requirement

**Observed.** Each `GovernedMemoryPriorityReference` requires `memoryReference`,
`sourceOwner`, `freshness`, availability, classification as `operator_priority` or
`derived_interpretation`, and `policyReference`; digest is optional. It deliberately
publishes a reference rather than unconstrained priority content.

### B. Current production analogue

**Observed.** `MemoryStore.priorities` is mutable `Priority[]` with rank, title, detail,
human-readable due text, and optional urgency. The schema says priorities/projects/
signals are JARVIS-tracked local state, not externally owned. It has one document-level
`updatedAt`, no priority ID, item owner, item freshness, provenance, availability,
classification, policy or digest. Rank/order is used by consumers as priority order.

`readMemory()` reads `data/memory.json`, initializes it from `SEED_MEMORY`, and on any
read failure silently returns seed data. Writes may fail on production's read-only
filesystem and return an updated in-memory object anyway. Seed and authored data have
the same shape and no origin marker. `buildOperationalState` is the production caller;
priorities reach dashboard, suggestions, and `/api/chat` prompt context. These are
mutable records, not immutable publications.

### C. Gap analysis

No honest mechanical derivation exists for stable item reference, operator versus
derived classification, source owner, item freshness, availability, provenance/policy,
or digest. Document time cannot prove item time; a rank cannot prove operator
authorship; seed fallback cannot be presented as authoritative memory. Reference-only
minimisation also needs an owner for referenced content.

### D. Classification

**Design-shaped**

### E. Reasoning

Although data and a production caller exist, filling mandatory fields would invent
identity, authorship and freshness. Existing memory comments explicitly describe a
limited Phase-1 store and fallback, not governed publication semantics.

### F. Earliest authorised next step

A memory-priority ownership/publication contract or responsibility statement must
precede schema or publisher implementation. The decision should distinguish seeded,
operator-authored and derived records without changing this sprint's store.

## Source Evidence Finding

### A. Composer requirement

**Observed.** `GovernedSourceEvidenceInput` is a policy-qualified publication reference
for one exact source/resource/field/observation. It requires publication identity/type/
schema, availability, governed evidence status, provenance reference, retrieval time,
content kind and policy; digest is optional. Composer assertions make it the registry
against which every claim reference is validated. It is therefore neither duplicate
domain evidence nor arbitrary raw content: it is the cross-source, claim-addressable
publication registry and retrieval/content boundary.

### B. Current production analogues

**Observed.** Plausible inputs include canonical Gmail observations, policy-gated Gmail
content retrieval/audit, Google Calendar events, Drive metadata, EOS source artifacts,
and legacy operational state. Production exists for several acquisitions, but no
ordinary-chat producer emits this generic shape or links it to claims. Gmail retrieval
has retrieval/policy identity but is invoked only by explicit capability requests;
Calendar/Drive state lacks matching publication/provenance detail; legacy prompt text
copies sensitive fields and is not a governed source reference.

### C. Gap analysis

Missing are generic registry ownership, source-publication admission rules, stable
publication/provenance references, status/coverage mapping, content-kind/digest and
model-exposure policy, source-specific failure semantics, claim linkage, and copying
versus reference rules. A single generic acquisition publisher would erase
source-specific semantics; a common envelope over source-specific governed publishers
is plausible but not authorised by current evidence.

### D. Classification

**Design-shaped**

### E. Reasoning

The type establishes a common envelope, but not which upstream publications qualify or
how their policies compose. Implementing one generic mapper now would make new
evidence-sufficiency and sensitive-content decisions. The likely boundary is
source-specific governed publishers feeding one deterministic registry/composer, but
that is an inference to be governed, not this audit's design selection.

### F. Earliest authorised next step

A cross-source evidence publication/admission contract, informed by narrow Gmail and
Calendar source contracts. Implementation must wait for it; claim-linked selection
also waits for claims governance.

## Connector Availability Finding

### A. Composer requirement

**Observed.** `GovernedConnectorAvailabilityInput` requires connector and source IDs,
availability (`available`, `unavailable`, `unauthorised`), observation time, optional
cause code, and fallback status (`none`, `governed_fallback`, `unavailable`). Composer
validation requires availability and time for every item.

### B. Current production analogue

**Observed.** `OperationalState` carries per-domain status (`online`, `unavailable`,
`refresh_required`) plus `connectorStatuses` (`name`, `source`, `connected`). Loader
functions distinguish local selection, successful Google fetch, refresh failure and
other failure, then commonly substitute local records. Gmail recipient evidence
preserves finer `not_authorised`/`not_fetched`/`unknown`; Calendar and Drive do not.
`getConnectorStatuses` derives `connected` from the last result and source from token
presence. The assembled state has one `updatedAt`, not per-status observation time.

The mechanism reaches `OperationalState`; prompt construction omits
`connectorStatuses` and generally presents fallback content without its status. It is
not a governed composer publication. Mock/local substitution is real and recorded only
coarsely in adjacent fields.

### C. Gap analysis

Mechanical vocabulary translation is possible for successes, but not honest for all
failures: `refresh_required` does not directly establish the composer's
`unauthorised`; non-auth causes are discarded; per-request observation time and source
identity rules are absent; `governed_fallback` cannot describe today's ungoverned seed
fallback; recovery semantics and policy references are unspecified.

### D. Classification

**Design-shaped**

### E. Reasoning

Existing status proves capability, not sufficient semantics. Republishing would invent
cause retention, authorization classification, time, and fallback authority. A bounded
contract can reuse existing loader facts, but a mapper alone is premature.

### F. Earliest authorised next step

A connector-availability responsibility/contract sprint should define the closed
mapping, observation boundary, cause disclosure, and fallback classification. It can
run independently and should precede evidence-status integration.

## Conversation History Finding

### A. Composer requirement

**Observed.** `GovernedConversationTurn` mandates turn ID, classification
(`operator_provided`, `assistant_prior_output`, `retrieval_reference`), content, and
`canonicalEvidence: false`. The composer rejects canonical history; model instructions
say prior assistant output is dialogue only and retrieval references require current
governed revalidation. No timestamp/source/policy field exists in this shape.

### B. Current production analogue

**Observed.** `useAgentConversation` keeps `ChatMessage[]` in component memory. Each
message has only role and content. It appends the user message, POSTs the whole array,
then appends the assistant reply. Switching specialists and explicit reset clear the
array; reload also loses it. The server validates role/content and a 40-message limit,
then sends the raw history to `executeAuditedChat`. There is no thread/turn identity,
timestamp, persistence, retrieval reference, retry/idempotency marker or specialist
transition record. A failed request leaves the user turn locally; retry submits another
turn. Capability requests are a separate body path and are not inserted as classified
retrieval references.

### C. Gap analysis

Role-to-classification is mechanical only for successful ordinary messages. Stable
thread/turn identities, retry deduplication, request/response binding, specialist and
reset boundaries, retention/privacy, content minimisation, capability-result
references, and the authority of operator assertions remain ungoverned. Copying raw
assistant output is allowed as non-canonical dialogue but must not make it evidence.

### D. Classification

**Design-shaped**

### E. Reasoning

Lineage types provide primitives, but the live UI does not instantiate them and the
repository does not govern how UI lifecycle maps onto a thread or turn. Creating IDs
and classifications in the route would violate the exclusive ownership boundary and
settle retention/retry questions implicitly.

### F. Earliest authorised next step

A conversational continuity/history contract should bind UI lifecycle to Sprint 3.82
lineage, classification and minimisation. Publisher implementation follows. Retrieval
references additionally depend on source-evidence publication.

## Claims Finding

### A. Composer requirement

**Observed.** `GovernedClaimInput` requires ID, closed communication claim type,
materiality, evidence status, deterministic/status/unsupported ownership, source
references, factual values, source availability, provenance, observation time, content
kind, bounded completeness, and claim-local conflicts. Status aggregation and
validation enforce material-claim status, known references, conflict preservation and
limits on unsupported facts. The composer also requires a
`claimClassificationRulesetId`.

### B. Current production analogue

**Observed.** Production ordinary chat accepts arbitrary free-form text. It has a
deterministic parser only for explicit typed capability request payloads; the agent
registry selects a specialist, not structured claims. No route, registry, command
parser or EOS adapter constructs `GovernedClaimInput[]` for ordinary chat. EOS intent
and structural constraint machinery has a different lifecycle/authority and cannot be
silently reused.

**Tested.** Fixtures and parallel evaluation manually pre-decompose questions and
supply all status conditions. They demonstrate expected behavior, not a production
classifier. `computeCommunicationClaimStatus` computes status after a claim and its
conditions already exist; it does not discover claims from language.

### C. Gap analysis and deterministic-design problem

A claim owner must deterministically decide the unit of assertion/request, split
compound questions, select a closed claim type, assign materiality, represent negative
scope, attach required sources and bounded coverage, and distinguish unsupported from
unavailable/absent. It must do so before the answering model, without allowing the LLM
to define the claims by which its own answer is judged.

“No natural-language claim parser or route classification” prohibits solving this by
adding an ungoverned semantic parser to `/api/chat`—especially an LLM parser—or making
the route the projection owner. It does not prove that all deterministic recognition is
forever forbidden; whether bounded patterns, typed intents, explicit capability
selection, operator confirmation, constrained vocabulary, or a fail-closed hybrid are
permitted is itself the missing governance decision.

Arbitrary language is not demonstrably compatible with complete deterministic claim
construction. A future boundary could distinguish recognised typed/known intents from
open-ended unsupported requests, but whether that remains an adequate everyday
assistant interaction, and how clarification works, must be decided by governance.

### Required Cassie analysis

For “What's Cassie's email? Anything important?” the minimum fixture decomposition is:

1. a material `contact_address_lookup` claim for a resolved Cassie identity/address,
   requiring identity-sufficient, source-qualified recipient/address evidence; and
2. a material `message_importance` claim, requiring an authorised definition and
   evidence rules for significance.

The first may become available from canonical recipient evidence if identity and scope
are sufficient. The second remains unsupported under current governance: unread,
Gmail-important, needs-reply, labels and legacy attention rankings are heuristic and do
not establish operator significance. One combined status would either suppress the
valid address or launder a heuristic importance judgment.

### D. Classification

**Design-shaped**

### E. Reasoning

There is no production owner or deterministic algorithm, and the required decisions
define meaning, materiality, relevance, negative scope and sufficiency. This is the
critical governance gap, not a missing adapter.

### F. Earliest authorised next step and bounded contract questions

A dedicated claims-boundary contract must answer, without selecting an implementation
in this audit:

* What is one claim, and what deterministic input is authoritative?
* Which claim vocabulary applies beyond communication, and how are compound and
  negative questions represented?
* Who assigns type/materiality and the required source/coverage rules?
* Which typed UI/capability/pattern/confirmation/fail-closed mechanisms are permitted?
* How is uncertainty surfaced without model-owned classification?
* When is unknown language `unsupported`, and may the operator clarify it?
* How are identity, contact, importance, schedule, absence and retrieval separated?
* How is everyday conversational breadth preserved without weakening determinism?
* Which versioned ruleset and publication identity prove that evaluation ran?

No claim implementation is authorised before those answers.

## Conflicts Finding

### A. Composer requirement

**Observed.** `GovernedConflictInput` requires conflict ID, source owners, one or more
affected claim IDs, a restricting status, and description reference. Composer
validation rejects unknown affected claims. The composer aggregates supplied conflicts;
it does not derive them. The older `GovernedConflict` links a claim, governed source
reference and compatibility context, and validators require preservation.

### B. Current production analogues

**Observed.** EOS/executive-state snapshots carry `structural_conflict` records and the
executive-context engine counts them. Memory seed contains prose called “Sequencing
conflict.” Neither is a conversational, affected-claim conflict producer. Governed
conversation conflicts are constructed only in fixtures/evaluations (for example a
legacy address disagreeing with governed recipient evidence). No production engine
emits claim-aware `GovernedConflictInput`.

### C. Gap analysis and required answers

A conversational conflict is a relation among an already classified claim and
source-owned observations, not merely two unequal strings, source unavailability, a
policy disagreement, or a calendar overlap. It cannot be instantiated before affected
claim identities and admissible source publications exist. Under the present type, a
conflict cannot validly exist without an affected claim.

EOS structural conflicts cannot be reused honestly unless a future governed mapping
proves identical meaning, owners and affected claim; otherwise doing so conflates
executive-state structure with conversational evidentiary contradiction. An empty
array proves only “none supplied.” It proves “no conflict” only when an identified,
versioned evaluation ran over sufficient coverage; otherwise conflict evaluation is
unavailable/unevaluated and claim status must not imply conflict-free evidence.

### D. Classification

**Design-shaped**

### E. Reasoning

No deterministic/versioned production rules say which observations contradict for a
given claim, how cross-domain relations are scoped, or what no-conflict evidence is.
Those semantics depend on the still-ungoverned claim and source boundaries.

### F. Earliest authorised next step and governance questions

Use a dependent conflict contract after the claims boundary, rather than one combined
contract: claims must establish identity/type/relevance first; conflict governance can
then define eligible source owners, contradiction categories, status restrictions,
description references, coverage proof, unevaluated representation, versioning, and
whether any narrowly proven EOS mapping is admissible. This sequencing avoids making
claim semantics implicitly inside a conflict contract.

## Cross-Category Dependencies

```text
claims
    ↓ determine relevance for
communications / calendar / memory / source evidence / history

connector availability
    ↓ constrains evidence status across sources

source-specific publications → source evidence registry
    ↓ support claims and referenced retrieved content

claims + source evidence + coverage
    ↓
conflicts

conversation history
    ↓ may introduce operator context, retrieval references, and prior-output conflicts
```

**Inferred.** Claims are the governance critical path; conflicts are downstream. Source
publication and connector availability are the evidence-infrastructure path. Gmail,
Calendar, memory and connector contracts can be governed in parallel because their
source semantics do not require selecting a claim parser, but claim-relevant selection
and final composer wiring cannot proceed until the claims contract exists. The generic
source registry needs its admission policy and at least source-specific publication
contracts. History identity/classification can be governed in parallel; retrieval
history requires source evidence. Conflict implementation must wait for claims and
source evidence. `/api/chat` integration waits for all eight real publications,
projection ownership, persistence/validation, and operator verification.

No category is presently direct-implementation-ready. This does not mean acquisition
must be redesigned: Gmail, Calendar, memory, status and raw history all supply useful
inputs. It means their required governed publication decisions have not yet been made.

## Central Classification Matrix

| Category | Existing production analogue | Current shape | Composer-required shape | Primary classification | Dependency | Earliest authorised next step |
| --- | --- | --- | --- | --- | --- | --- |
| Gmail second-stage mapping | Canonical normalized recipient observations; separate policy-gated content retrieval | Frozen recipient-evidence bundle plus retrieval audit/result | `GovernedCommunicationEvidenceInput` | **Design-shaped** | Gmail publication policy; claims for relevance | Narrow Gmail conversational publication contract |
| Calendar evidence | Google/local upcoming-event acquisition | Rich `CalendarEvent[]` or local fallback plus coarse status | `GovernedCalendarEvidenceInput` | **Design-shaped** | Calendar identity/coverage/minimisation policy | Source-specific Calendar projection contract/audit |
| Memory/priority references | Local mutable/seed `Priority[]` | Rank/title/detail/due/urgent plus store-level time | `GovernedMemoryPriorityReference` | **Design-shaped** | Authorship, identity, freshness and fallback authority | Memory ownership/publication contract |
| Source evidence | Gmail retrieval, domain acquisitions, Drive/EOS metadata | Heterogeneous source outputs; no claim-linked registry | `GovernedSourceEvidenceInput` | **Design-shaped** | Source-specific publications and admission policy; claims | Cross-source evidence publication contract |
| Connector availability | Domain status and `ConnectorStatus[]` | Coarse status/source/connected; local fallback | `GovernedConnectorAvailabilityInput` | **Design-shaped** | Availability/cause/fallback contract | Connector availability responsibility/contract |
| Conversation history | Client `ChatMessage[]` sent to route | Ephemeral role/content array | governed classified history references (`GovernedConversationTurn`) | **Design-shaped** | Continuity/retention; source evidence for retrieval refs | History/continuity contract |
| Claims | Explicit capability payload parser; synthetic fixtures | Free text in production; prebuilt claims only in tests | `GovernedClaimInput` | **Design-shaped** | Foundational critical path | Dedicated claims-boundary contract |
| Conflicts | EOS structural records; synthetic claim conflicts | Different-domain records or fixtures only | `GovernedConflictInput` | **Design-shaped** | Claims + source evidence + coverage | Dependent conflict contract after claims |

## Readiness Matrix

“Production caller” means a caller for the current analogue, not a caller producing the
composer shape. “Governed publication” means this exact conversational category.

| Category | Acquisition exists | Canonical normalization exists | Governed publication exists | Production caller exists | Governance sufficient | Implementation ready |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Gmail | Yes | Yes | No | Yes | No | No |
| Calendar | Yes | Partial (Google event mapping; no conversational publication) | No | Yes | No | No |
| Memory/priorities | Yes (local/seed read) | No | No | Yes | No | No |
| Source evidence | Partial, source-specific | Partial, source-specific | No | Yes, for some analogues | No | No |
| Connector availability | Yes | No | No | Yes | No | No |
| History | Yes (client collection) | No | No | Yes | No | No |
| Claims | No (ordinary-chat claim acquisition) | No | No | No | No | No |
| Conflicts | No (conversational claim conflicts) | No | No | No | No | No |

## Non-Authoritative Sequencing Proposal

> **NON-AUTHORITATIVE — GOVERNANCE REVIEW REQUIRED**

1. **Claims governance (critical path):** define deterministic claim ownership,
   supported interaction boundary, vocabulary, materiality, negative scope, source
   requirements, unsupported handling, and ruleset identity.
2. **Parallel source-boundary governance:** independently govern (a) Gmail second-stage
   publication, (b) Calendar publication, (c) memory-priority ownership/publication,
   and (d) connector availability. These should be narrow contracts, not one omnibus
   implementation sprint.
3. **History/continuity governance in parallel:** bind UI lifecycle and retrieval
   references to Sprint 3.82 identities and minimisation.
4. **Cross-source evidence contract:** after source-contract inputs are known, govern
   registry admission, provenance/policy composition, content references/digests and
   status coverage.
5. **Claims implementation:** only after item 1 is accepted, implement the deterministic
   owner under the named responsibility—not in `/api/chat`, the model or prompt builder.
6. **Source publishers and availability/history implementations:** separate narrow
   sprints after their contracts; work may proceed in parallel where dependencies allow.
7. **Dependent conflicts governance, then implementation:** use governed claim and
   source identities to define contradiction and proof-of-evaluation. Claims and
   conflicts should therefore be sequential dependent governance sprints, not one
   combined contract.
8. **Projection completion and integration audit:** re-attempt `/api/chat` integration
   only when all eight production categories have real, versioned owners/publications,
   the composer remains the exclusive projection owner, and persistence, validation,
   safe response and operator-verification gates can run end to end.

This proposal authorizes nothing. `LEGACY` remains production behavior through future
parallel evaluation, integration, operator verification and explicit promotion. No
route, LLM, prompt builder, `context-builder.ts`, or `OperationalState` may become the
projection owner.

## Files Changed

Only:

```text
docs/audits/SPRINT-3.88-GOVERNED-CONVERSATIONAL-PRODUCTION-EVIDENCE-AUDIT.md
```

No production, library, governed-conversation, executive-context, memory,
chat-capability, test, fixture, roadmap, responsibility, ADR or existing document was
changed.

## Validation

The canonical full-repository validation sequence was run after the audit was written:

| Command | Result |
| --- | --- |
| `npm test` | Passed — 133 test files; 648 passed and 1 skipped (649 total) |
| `npm run build` | Passed; Next.js warned that Google Fonts could not be downloaded and skipped font optimisation |
| `npm run lint` | Passed with no warnings or errors |
| `npm run typecheck` | Passed |
| `git diff --check` | Passed |

Additional boundary checks confirmed that the only changed path was this new audit;
all eight category headings and exactly one primary classification per category are
present; claims/conflicts governance questions, both matrices, and the exact
non-authoritative label are present. Validation was complete and no pre-existing or
sprint-created failure remained.

## Implementation Authority

> Sprint 3.88 authorizes no implementation and changes no production behavior.

## Next Step

Governance must review and accept/revise the classifications and sequencing, then issue
the claims-boundary contract and approve the independently scoped source, availability,
memory and history contract work before Sprint 3.89 begins. No implementation sprint is
authorised by this recommendation.

## Final Recommendation Gate

All prerequisites existed; all eight categories were traced and classified; required
matrices, dependency analysis, bounded claims/conflicts questions and a
non-authoritative sequence are complete; only this audit changed; and full validation
passed.

**Audit Complete — Governance Review Required**
