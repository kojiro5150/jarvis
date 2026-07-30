# Dashboard Presentation Contract

## Status, authority, and scope

**Status: Governed — authoritative.**

This decision supersedes `SPRINT-3.58-DASHBOARD-PRESENTATION-CONTRACT-PROPOSAL.md` for all future
Dashboard engineering. The proposal remains evidence, not authority. This contract classifies every
field or composition proposed there and applies the additional legacy test: **if the field had never
existed in `OperationalState`, would shared operational reality independently justify publishing it
today?** Existing placement is not evidence of canonical ownership.

This is a governance decision only. It does not change runtime behaviour, authorise implementation,
expand or modify `ExecutiveStateSnapshot` or `OperationalState`, amend ADR-0007, or approve a new
canonical publication. “Canonical” below means consumption of an already governed canonical fact;
it does not authorise republishing the legacy shape.

## Governing rules

1. **Canonical Operational State (COS)** is limited to facts already owned by the canonical model
   that describe shared operational reality and are independently legitimate for multiple consumers.
2. **Deterministically Derived Presentation (DDP)** is reconstructed downstream from canonical facts
   and explicit context. Locale, timezone, reference time, eligibility, ordering, and rule version
   must never be hidden inputs.
3. **Dashboard-specific View State (DVS)** owns wording, styling, disclosure, animation, drafts, and
   interaction controls.
4. Dashboard usefulness and implementation convenience confer no publication authority. A missing
   canonical input does not permit reconstruction, inference, fallback to legacy authority, or a
   convenience expansion.
5. A **Deferred** outcome is not permission to publish or consume. It records an unresolved potential
   fact and the evidence required for a later, separate governance review.

## Field-by-field governance decisions

The “outcome” applies to the Sprint 3.58 proposal; the “governed class” is authoritative now.

### Priorities

| Proposed field/composition | Outcome | Governed class | Decision and reasoning |
| --- | --- | --- | --- |
| `priorities[].title` | **Accepted** | COS | Consume the existing canonical priority title and identity. A human assertion of what matters is shared operational reality, survives the legacy test, and legitimately supports independent executive consumers. No new field is approved. |
| `priorities[].rank` and array order | **Deferred** | None authorised | Explicit human ordering may be operational, but ownership (entity field, relationship, or separate prioritisation assertion), stable identity, provenance, and multi-consumer evidence are absent. Future work must define those semantics and exhaust existing publications. Non-publication means the legacy ranking cannot be reproduced canonically; that is preferable to inventing authority. |
| `priorities[].detail` | **Deferred** | None authorised | The prose may be a description, next action, or recommendation. Its responsibility, author, provenance, and relationship to active work are unresolved. Future work must establish descriptive-only semantics and an authorised owner. Non-publication avoids importing mutable narrative or reasoning into a foundational publication. |
| `priorities[].due` | **Deferred** | None authorised | A deadline can be shared reality, but free-text relative wording is not replayable canonical time. Future work must establish an absolute asserted target, reference time, identity impact, and provenance; relative wording would then be DDP. Non-publication loses legacy wording but preserves temporal honesty. |
| `priorities[].urgent` | **Deferred** | None authorised | Urgency may be a human assertion, but its relation to canonical `level`, deadlines, and override authority is unknown. Future work must define the assertion and falsify the sufficiency of `level`. Non-publication prevents a legacy Boolean from becoming a second, conflicting priority truth. |

### Projects

| Proposed field/composition | Outcome | Governed class | Decision and reasoning |
| --- | --- | --- | --- |
| `projects[].name` | **Accepted** | COS | Consume the existing canonical project name and identity. Project identity is shared operational reality and independently useful; no expansion is approved. |
| `projects[].progress` | **Deferred** | None authorised | Unit, denominator, evidence, author, staleness, and relation to lifecycle status are undefined. Future work must define an authoritative measurement contract and independent consumers. Non-publication avoids false precision; progress-based Dashboard features remain blocked rather than canonicalised for convenience. |
| `projects[].tag` | **Deferred** | None authorised | The field ambiguously means lifecycle status, portfolio grouping, or arbitrary label. Future work must establish one responsibility, vocabulary, identity/provenance, and mapping to existing project status. Non-publication prevents semantic ambiguity in canonical state. |
| `projects[].tagColor` | **Accepted** | DVS | Colour is rendering configuration keyed by canonical project identity, not operational reality. |
| Active-project subset (`0 < progress < 100`), descending order, top project, and counts | **Accepted** | DDP | If a governed progress fact later exists, derive with `progress > 0 && progress < 100`, order by `progress DESC, id ASC`, then select/count. This decision does not authorise progress. |

### Signals and blockers

| Proposed field/composition | Outcome | Governed class | Decision and reasoning |
| --- | --- | --- | --- |
| `signals[].kind` | **Deferred** | None authorised | The vocabulary mixes subject and effect and no canonical signal responsibility exists. Future work must define authoritative observations, ownership, identity, provenance, and exhaustive mappings to active work, commitments, and waiting items. |
| `signals[].title` | **Deferred** | None authorised | A label cannot be published before the signal entity and its identity/owner are governed. Future work must demonstrate the ontological gap and independent consumers. |
| `signals[].detail` | **Deferred** | None authorised | Evidence/context may become unowned narrative or specialist reasoning. Future work must define descriptive-only content, evidence provenance, privacy, and content boundaries. |
| `signals[].cta` | **Accepted** | DVS | Imperative action copy is Dashboard interaction configuration, not a fact or execution authority. |
| `blockers` collection | **Accepted** | DDP | The legacy `kind in {deadline,note}` filter may be retained only as an explicit, versioned Dashboard policy over governed signal inputs; it must not assert that notes are canonically blockers. No signal input is authorised by this row. |
| Research-signal subset/count and total signal count | **Accepted** | DDP | Filter/count operations are consumer summaries over governed inputs, with an explicit rule version and stable identity ordering where order is shown. |

### Calendar commitments

| Proposed field/composition | Outcome | Governed class | Decision and reasoning |
| --- | --- | --- | --- |
| `calendar[].id` plus `calendarId` | **Modified** | COS | Do not reproduce two legacy fields. Consume only the existing qualified canonical commitment identity, which preserves event and calendar scope. Shared identity, provenance, and independent consumption justify publication; non-publication would make canonical reference integrity impossible. |
| `calendar[].title` | **Accepted** | COS | Consume the existing canonical commitment title. A provider-observed scheduled commitment label is shared operational reality. |
| `calendar[].start` and `end` | **Modified** | COS | Consume existing `startsAt` and `dueAt`; do not republish legacy names. Exact observed temporal bounds are shared reality and enable replay. The adapter's governed meaning of event end as `dueAt` must be preserved, not broadened. |
| `calendar[].status` | **Accepted** | COS | Consume existing canonical scheduled/cancelled status. It prevents cancelled events being presented as active. This does not approve tentative, declined, or recurring expansion. |
| `calendar[].day` | **Accepted** | DDP | Format `startsAt` using explicit viewer timezone and locale, then apply the governed casing rule. |
| `calendar[].time` | **Accepted** | DDP | Format a canonical bare date as `All day`; format a timestamp using explicit viewer timezone and locale. If canonical input does not preserve the distinction, fail/omit rather than infer. |
| `calendar[].source` | **Accepted** | DDP | Derive a provider predicate only from governed provenance/source state. Never parse an opaque id or duplicate provenance for UI branching. |
| `calendar[].calendarName` | **Deferred** | None authorised | Source-container attribution may be shared reality, but source identity, display-name authority, provenance relationship, and multi-consumer need are unresolved. Future work must assess a governed source/calendar reference rather than a copied commitment field. Non-publication may omit attribution but avoids convenience duplication. |
| `calendar[].calendarColor` | **Accepted** | DVS | Provider/UI colour is styling, including when not currently rendered. |
| Next event, next-three slice, and `Then` text | **Accepted** | DDP | Select eligible non-cancelled commitments ordered by `startsAt ASC, id ASC`; take indices 0–2 and create wording downstream. |

### Communications

| Proposed field/composition | Outcome | Governed class | Decision and reasoning |
| --- | --- | --- | --- |
| `gmailThreads[].id` | **Modified** | COS | Consume the existing canonical communication/protocol identity, not the connector id. Stable shared identity and provenance justify it independently of Dashboard list keys. |
| `gmailThreads[].subject`, `from`, and `receivedAt` | **Modified** | COS | Consume canonical `subject`, `sender`, and the contractually applicable observed timestamp. These are shared communication metadata already within the bounded content policy. Do not invent a received-time fallback; omit when the canonical contract supplies none. |
| `gmailThreads[].unread` and `important` | **Deferred** | None authorised | Mutable provider-label observations may be useful beyond the Dashboard, but entity versus source-observation ownership, observation time, identity impact, and export semantics are unresolved. Future work must perform a responsibility audit and demonstrate independent consumers. Non-publication blocks canonical attention selection but avoids mutable client state masquerading as intrinsic communication state. |
| `gmailThreads[].needsReply` | **Accepted** | DDP | It is a versioned Dashboard heuristic over governed evidence, never canonical reply state. If unread evidence is unavailable, do not reconstruct the result from local seed assumptions. |
| `gmailThreads[].source` | **Accepted** | DDP | Derive the provider predicate from governed provenance/source references; do not duplicate it on the communication. |
| `gmailThreads[].sourceLabel` | **Deferred** | None authorised | Mailbox attribution may be shared, but stable mailbox identity, display-name authority, source ownership, and privacy are unresolved. Future work must govern a source/mailbox reference and demonstrate non-Dashboard consumers. |
| Needs-reply and urgent-communication lists/counts | **Accepted** | DDP | Apply explicit, versioned Dashboard policies and order by canonical timestamp then id. The legacy `Governance Engineering` label rule is consumer policy and may run only when governed attribution exists. |
| Relative received time | **Accepted** | DDP | Derive with explicit reference time, locale, and documented rounding thresholds; never publish the string. |

### Drive activity

| Proposed field/composition | Outcome | Governed class | Decision and reasoning |
| --- | --- | --- | --- |
| `driveFiles[].name` | **Deferred** | None authorised | Document activity has no governed canonical destination. Future work must establish source authority, stable identity, bounded metadata/content policy, independent consumers, and exhaust existing publications before proposing a separate activity publication. |
| `driveFiles[].project` | **Deferred** | None authorised | The relationship is shared only if explicitly asserted against canonical project identity. Future work must provide relationship provenance and prohibit filename inference. |
| `driveFiles[].modified` | **Deferred** | None authorised | Legacy relative text is not replayable. Future work must establish an authoritative absolute observation timestamp in an approved activity responsibility. |
| Recently touched list/count | **Accepted** | DDP | If governed activity inputs later exist, derive an observed-window list/count ordered by time then id. Do not present the upstream limit as total backlog. |

### Availability and connector state

| Proposed field/composition | Outcome | Governed class | Decision and reasoning |
| --- | --- | --- | --- |
| `calendarStatus`, `gmailStatus`, and `driveStatus` | **Modified** | COS | Consume existing canonical source availability, keyed by governed source identity; do not republish legacy service scalars. Availability is shared operational reality because it qualifies the reliability of every consumer's picture. `refresh_required` and reconnect actions are excluded as application authentication/control state pending separate governance. |
| `connectorStatuses[].name` | **Accepted** | DDP | Derive a display label from governed source kind only if rendered; the current count needs no name. |
| `connectorStatuses[].source` | **Accepted** | DDP | Use governed source identity/provenance when required; do not copy a presentation field. |
| `connectorStatuses[].connected` | **Accepted** | DDP | Derive `connected := source.status === available`; never publish a competing Boolean. |
| System reading (`ATTENTION REQUIRED`, `NOMINAL`, `LOCAL MODE`) | **Accepted** | DDP | Keep explicit versioned precedence in the Dashboard. The source set, including whether Drive participates, and the meaning of local mode must be configuration, not canonical truth. |
| Per-service dot/action state and labels | **Accepted** | DVS | Colour, `live`/`syncing`/`offline`, and connect/reconnect/disconnect controls are application rendering and interaction state driven by governed availability. |
| Boot `ok` flags and reveal state | **Accepted** | DVS | Animation timing and experience readiness are component-local and do not represent source availability. |
| Connector live count, total, and `allLive` | **Accepted** | DDP | Filter/count over an explicitly scoped source set; the rule must state whether `not_configured` participates in the denominator. |

### Dashboard compositions and editing state

| Proposed field/composition | Outcome | Governed class | Decision and reasoning |
| --- | --- | --- | --- |
| Opening-brief strings and recommendation wording | **Accepted** | DVS | Templates, greetings, prose, and recommendations are conversational application state. They consume facts plus explicit agent, locale, and reference-time context and convey no canonical authority. |
| Specialist badge numbers | **Accepted** | DDP | Derive through versioned per-agent filter/count rules over governed identities. Allocation is consumer policy. |
| Memory-editor working copies, ordering, dirty values, and save/error/saved flags | **Accepted** | DVS | Mutable drafts and interaction feedback remain outside immutable publications. A future write path requires a separately governed command contract. |
| Open status-strip segment | **Accepted** | DVS | Disclosure/layout selection is component-local. |

### Legacy fields explicitly inventoried but not consumed

| Field | Outcome | Governed class | Decision and reasoning |
| --- | --- | --- | --- |
| `OperationalState.updatedAt` | **Rejected** | None | Dashboard does not consume it, and legacy presence alone does not establish publication need. Any future snapshot/reference time must be justified by its owning contract. |
| `EmailMessage.snippet` | **Rejected** | None | It is unconsumed and would widen the metadata/content boundary solely through legacy carry-over. Future content retrieval must use its governed policy and boundary. |
| `CalendarEvent.recurringEventId` | **Rejected** | None | It is unconsumed, and this review has no evidence or authority to add recurrence semantics. A future recurrence proposal requires independent operational evidence and governance. |
| `CalendarEvent.selfAttendeeResponse` | **Rejected** | None | It is unconsumed and no governed attendee-response responsibility or consumer need is established. |

## Governed outcome registers

### Accepted canonical publications

No new canonical publication or field is approved. The Dashboard may, in a future implementation
sprint, consume these **existing** canonical facts:

- priority title and canonical identity;
- project name and canonical identity;
- qualified commitment identity, title, `startsAt`, `dueAt`, and scheduled/cancelled status;
- canonical communication identity, subject, sender, and applicable observed timestamp; and
- canonical source identity and availability.

These facts pass the constitutional test because each records source- or human-asserted shared
operational reality, has legitimate independent consumers, remains within an existing bounded
responsibility, preserves identity/provenance, and would be chosen for publication even without the
legacy Dashboard. Publication strengthens the model by exposing owned facts; it does not copy the
legacy presentation shape.

Publication consequences are bounded canonical reference, replay, and honest cross-consumer
reporting. Non-publication would prevent consumers from identifying priorities/projects,
representing commitments/communications, or qualifying source reliability without inference. That
does **not** justify any additional candidate field: each accepted fact already has canonical
ownership.

### Accepted deterministic derivations

The governed DDP set is: project selections/counts; signal/blocker selections/counts (conditional on
future governed inputs); calendar day/time/source and next-event compositions; communication
needs-reply/source/urgent selections/counts and relative time; Drive activity summaries (conditional
on future governed inputs); connector names/source predicates/connected state/system reading/live
summaries; and specialist badges.

All derivations require explicit context, versioned policy, canonical identities, and deterministic
tie-breakers. A conditional derivation does not authorise its missing input.

### Accepted Dashboard view state

The governed DVS set is project tag colour; signal CTA; calendar colour; per-service dots/actions;
boot flags/reveal state; opening-brief and recommendation prose; memory-editor drafts and feedback;
and status-strip disclosure state.

### Modified proposals

Legacy calendar identity and temporal names, communication identity/metadata names and fallback,
and service status scalars are modified to consumption of their existing canonical equivalents.
They must not be republished in the legacy shape. This distinction preserves canonical identity,
provenance, single responsibility, and non-reconstruction.

### Rejected proposals

`updatedAt`, communication `snippet`, calendar recurrence id, and self-attendee response are rejected
from this contract. They were inventoried only because they exist in legacy shapes; none passes the
independent-publication/legacy test on the evidence before this review.

### Deferred decisions

Deferred: priority rank/order, detail, due, and urgent; project progress and tag; signal kind, title,
and detail; calendar name attribution; communication unread/important and source label; and all
Drive activity facts. The field tables specify the missing evidence and required work. Until a new
governance decision, these fields have no canonical authority and no canonical substitute may be
inferred.

## Constitutional conclusion

The decision applies Identity Integrity, bounded Projection, Single Responsibility,
Non-Reconstruction, Deterministic Replay, Applications Consume Publications, the mandatory
Publication Responsibility Audit, and evidence-before-ontology. Consumer convenience is never
enough. Hidden clocks/locales, copied source labels, mutable drafts, styling, prose, heuristics, and
legacy placement cannot become canonical reality. Deferral is required where a fact may be real but
its owner, semantics, provenance, identity, or cross-consumer evidence is not yet established.

The governed contract is therefore approved as the authoritative architectural contract for the
Dashboard. Sprint 3.58's proposal is superseded; only the outcomes in this document may guide future
work.

## Recommendation for Sprint 3.59

Sprint 3.59 should implement only the accepted mappings, derivations, and view-state boundaries,
without schema expansion or behaviour invention. It should:

1. define an application-facing adapter contract over existing canonical facts;
2. make locale, timezone, reference time, source scope, rule versions, and sort tie-breakers explicit;
3. fail or omit honestly whenever a deferred canonical input is unavailable—never reconstruct it
   from titles, opaque ids, array order, browser defaults, or legacy state;
4. keep DVS local to the Dashboard and keep conditional DDP inactive where inputs are deferred;
5. add deterministic replay, identity/order, unavailable-state, and presentation-boundary tests;
6. repeat the Sprint 3.57 parallel evaluation against this governed contract before any authority
   switch; and
7. treat every deferred item as separate future evidence/governance work, not Sprint 3.59 scope.

Sprint 3.59 must not modify `ExecutiveStateSnapshot`, `OperationalState`, ADR-0007, or canonical
publication responsibilities on the authority of this contract.
