# Sprint 3.58 — Dashboard Presentation Contract Proposal

## Status, authority, and scope

**Status: Proposed — non-authoritative.** This document is evidence for human governance review. It
does not govern a presentation contract, approve any classification, expand `ExecutiveStateSnapshot`
or `OperationalState`, authorise consumer derivation or canonical publication, change Dashboard
behaviour, modify ADR-0007, or remove Sprint 3.57's promotion blocker. No downstream sprint may
assume this proposal has been accepted.

The inventory boundary is every `OperationalState` member, and every nested member, that the current
Dashboard rendering tree reads. That tree includes the visible status strip, top bar, agent rail,
boot sequence, conversation dock opening briefs, and memory editor. A value merely passed through a
component is not counted unless that tree reads it. Fields present in `OperationalState` but not read
by this tree are recorded separately so the completeness claim is auditable.

## Method and classification test

The inventory was produced by tracing `DashboardShell`'s single `useOperationalState()` value through
its children and through `getOpeningBrief`, `specialistBadge`, and the memory editor. Each leaf was
then compared with the canonical `SituationalAwareness` carried by `ExecutiveStateSnapshot`.

The proposed tests are:

1. **Canonical Operational State (COS):** an observed or human-asserted fact about shared operational
   reality, independently useful to more than one authorised consumer. Existing canonical coverage
   is evidence, but not automatic permission to publish a legacy field.
2. **Deterministically Derived Presentation (DDP):** a value reproducible without ambiguity from
   canonical inputs plus an explicit presentation context (for example locale or reference time).
   The context must be explicit; a hidden browser clock or locale is not deterministic replay.
3. **Dashboard-specific View State (DVS):** selection, styling, wording, editing, or layout state whose
   purpose is this Dashboard experience rather than a shared operational fact.

This applies the Publication Principles: publications have one bounded responsibility, consumer
demand and convenience are insufficient reasons to expand them, deterministic replay forbids hidden
clocks, and rendering/application state belongs downstream. It also preserves the Design
Constitution's requirements to report operational state, prefer intelligence over information, make
the Dashboard a situational-awareness command centre, and leave human judgment final.

## Complete proposed contract inventory

### Priorities

Current source for all rows is `memory.priorities`, copied unchanged by `buildOperationalState()`.
The Dashboard consumers are the memory editor; JARVIS and DAWNWATCH opening briefs; and DAWNWATCH's
badge. Canonical `OperationalPriority` already has `title`, `level`, relationships, and source, but
does not carry legacy order, prose detail, or due text.

| Dashboard field | Proposed class | Evidence and architectural rationale | Constitutional implications | Recommendation |
| --- | --- | --- | --- | --- |
| `priorities[].title` | COS | A human-maintained statement of what matters; used in briefs, recommendation text, and editing. It corresponds to canonical priority `title` and is shared reality rather than a formatting preference. | Supports Principles 3, 7, and 9; publication must preserve identity, provenance, and priority ownership. | Treat the existing canonical title as the candidate source after governance; do not add or publish anything now. |
| `priorities[].rank` and array order | COS | Explicit human ordering drives DAWNWATCH's numbered ranking, the lead recommendation, and editor reorder semantics. Rank is not derivable from canonical `level`: equal-level priorities can have different human order. | Human judgment is final (Principle 13). Silently sorting would invent authority; adding order would change identity-bearing canonical content. | Consider canonical representation of explicit human order, not immediate publication. Resolve whether order is entity data, a relationship, or a separate user-authored prioritisation publication. |
| `priorities[].detail` | COS | Human-authored current focus/next action appears in the executive and research briefs and is editable. Different valid details can share the same title, so it is not derivable presentation. | It advances clarity (Principle 7), but may overlap active-work or recommendation ownership; publication cannot become a convenience aggregate. | Consider a governed operational description or linked active-work assertion; do not copy the legacy field into the snapshot. |
| `priorities[].due` | COS | Human-authored deadline language is displayed by DAWNWATCH and edited by the user. Deadline reality is shared, although the current free-text encoding (`Today`, `This week`) is not canonical-quality time. | Approaching deadlines are operational state (Principles 3 and 10), but deterministic replay requires an absolute value or explicit reference time. | Consider an absolute canonical target/deadline with provenance; derive relative wording downstream. Do not canonise the legacy string. |
| `priorities[].urgent` | COS | An explicit user-controlled urgency assertion drives badges, briefing language, and recommendations. It cannot always be inferred from `due`, especially while `due` is free text. | Urgency affects interruption and prioritisation under Principles 9–10 and must not be silently inferred; human authority must be preserved. | Consider a governed priority level/assertion mapping (potentially existing canonical `level`); do not publish the legacy Boolean directly. |

### Projects

Current source is `memory.projects`, copied unchanged into `OperationalState`. Consumers are the status
strip, memory editor, JARVIS/STEVE/MARCUS briefs, and STEVE's badge. Canonical projects currently
publish identity, name, lifecycle status, relationships, and optional target date.

| Dashboard field | Proposed class | Evidence and architectural rationale | Constitutional implications | Recommendation |
| --- | --- | --- | --- | --- |
| `projects[].name` | COS | Human-maintained project identity label is shown across the strip, briefs, and editor and corresponds to canonical project `name`. | Active projects are expressly operational state (Principle 3); identity and provenance must remain stable. | Use the governed canonical project name if this contract is accepted; no model change is proposed. |
| `projects[].progress` | COS | A human-maintained completion measure selects the most-active/furthest-along project, supplies percentages, and determines active-build badges. It is not derivable from the current canonical lifecycle status. | It can improve situational awareness, but false precision conflicts with calm, honest executive reporting and its ownership/measurement rule is undefined. | Consider publication only after defining unit, author, evidence, update semantics, and relation to project status. Do not publish now. |
| `projects[].tag` | COS | The user-facing portfolio/category label is shown in MARCUS's portfolio brief and edited as status in the memory UI. Its meaning is not recoverable from project name or canonical lifecycle status. | It may be shared classification, but the legacy name `tag` and editor label `Status` reveal unresolved semantics; publication must have a single clear responsibility. | Determine whether this is lifecycle status, programme grouping, or arbitrary label before considering a governed canonical field. |
| `projects[].tagColor` | DVS | A colour token is edited solely to style the Dashboard tag; it does not describe operational reality and no non-rendering consumer reasons from it. | Rendering state belongs in the application layer; canonical publication would violate single responsibility and Applications Consume Publications. | Keep in a Dashboard view/configuration model keyed by canonical project identity. |
| active-project subset (`0 < progress < 100`), descending-progress order, top project, counts | DDP | These values are pure filter/sort/count/first operations over project progress, with stable tie-breaking required by project identity. | Canonical publication would duplicate consumer selection and summary responsibility. Deterministic ordering must specify a tie-breaker, unlike the current stable-array-order fallback. | Derive downstream as: filter `progress > 0 && progress < 100`; sort by `progress DESC, id ASC`; select first/count. |

### Signals and blockers

Current source is `memory.signals`; `blockers` is built by filtering it. Consumers are the memory
editor, JARVIS/ORACLE/GECKO/PHDSS briefs, and specialist badges.

| Dashboard field | Proposed class | Evidence and architectural rationale | Constitutional implications | Recommendation |
| --- | --- | --- | --- | --- |
| `signals[].kind` | COS | Human-maintained classification (`deadline`, `action`, `research`, `note`) determines research queues and blocker derivation. It is shared by Dashboard briefs and agent context, not merely visual. | Signals, risks, and decision points are operational under Principles 3 and 9, but the current vocabulary conflates subject and effect (`research` versus `deadline`). | Consider a governed signal/active-work model only after semantics and ownership are defined; do not add the enum now. |
| `signals[].title` | COS | Human-authored signal identity label is displayed in research and risk briefs and edited by the user; it cannot be derived from another canonical field. | Publishing it would require canonical identity and provenance rather than positional legacy identity. | Investigate mapping to canonical active work, commitment, waiting item, or a separately governed signal publication. |
| `signals[].detail` | COS | Human-authored evidence/context is rendered in specialist briefs and is distinct for otherwise equal titles. | Useful context supports informed human judgment, but must not transfer specialist reasoning or become unowned narrative in a foundational publication. | Require evidence/provenance and clear descriptive-only semantics before any publication proposal proceeds. |
| `signals[].cta` | DVS | Imperative button/action wording is authored for consumer interaction and edited in the Dashboard; current opening briefs and badges do not reason from it. | Application-specific interaction and rendering state belongs downstream; canonical publication cannot acquire action or execution hints. | Keep as Dashboard action copy/configuration keyed to a canonical entity, with any actual action separately governed. |
| `blockers` collection | DDP | `buildOperationalState()` deterministically selects signals where `kind` is `deadline` or `note`; PHDSS consumes the resulting titles/details and badge count. | Republishing the same signal objects would be reconstructive duplication. The rule is a legacy policy proposal, not proof that all notes are genuine blockers. | If signal kinds are governed, derive `filter(kind in {deadline,note})` downstream; separately review the rule's semantic validity. |
| research-signal subset and count; total signal count | DDP | Research queues filter `kind === "research"`; JARVIS counts the complete collection. | These are bounded consumer summaries and need no canonical fields. | Derive through filter/count from governed signal facts. |

### Calendar commitments

Current source is the selected Calendar connector, normalized to `CalendarEvent`; the builder takes up
to five events and the Dashboard assumes connector order when selecting the first three. Consumers
are the status strip and JARVIS/DAWNWATCH opening briefs. The memory editor does not edit calendar
events. Canonical `OperationalCommitment` already contains qualified identity, title, status,
relationships, `startsAt`, and `dueAt` (the observed end in the calendar adapter).

| Dashboard field | Proposed class | Evidence and architectural rationale | Constitutional implications | Recommendation |
| --- | --- | --- | --- | --- |
| `calendar[].id` together with `calendarId` | COS | Provider event identity plus calendar scope distinguishes events; the canonical adapter already publishes `google-calendar:{calendarId}:{eventId}`. Identity is required even where React does not currently render it. | Identity Integrity and provenance prohibit an unqualified event id. This is shared event identity, not convenience. | Consume the existing qualified canonical commitment id if governed; do not publish the two legacy fields anew. |
| `calendar[].title` | COS | Provider-observed event title is directly displayed and already maps to canonical commitment title. | A scheduled commitment and its label are shared reality under Principle 3; source validation/provenance remains mandatory. | Use canonical commitment title after approval; no expansion. |
| `calendar[].start` and `end` | COS | Provider-observed temporal range determines what is next and the displayed date/time; the canonical adapter maps these to `startsAt` and `dueAt`. | Approaching commitments are operational; exact timestamps preserve deterministic replay and avoid consumer guesses. The `dueAt` use as event end must remain explicit. | Use existing canonical timestamps after governance; separately confirm `dueAt` presentation semantics. |
| `calendar[].status` | COS | Provider-observed cancellation state maps to canonical scheduled/cancelled status. Although not visibly labelled today, it affects whether a commitment legitimately belongs in an upcoming view. | Honest reporting must not present cancelled events as active. Existing lossy mapping of tentative/confirmed remains a governed boundary. | Use canonical status; decide during governance whether tentative display requires separate evidence, without expanding now. |
| `calendar[].day` | DDP | This uppercase weekday label is computed from `start`; it is presentation formatting, not new reality. | Hidden locale/timezone would violate deterministic replay. Canonical publication would add rendering state. | Derive from `startsAt` using explicitly governed viewer timezone and locale, e.g. weekday-short then uppercase. |
| `calendar[].time` | DDP | `All day` or `HH:mm` is formatted from the temporal observation and all-day encoding. | The canonical model must not publish display strings. However, bare-date/all-day semantics and viewer timezone must be unambiguous inputs. | Derive downstream: bare date → `All day`; timestamp → locale time in explicit viewer timezone. Record inability to reproduce all-day semantics if the canonical representation loses them. |
| `calendar[].source` | DDP | The legacy brief uses it only to decide whether to show a calendar label. Canonical commitment id/provenance and source state identify Google deterministically. | Source truth belongs in provenance/source publications, while a `google` display gate is consumer policy. Do not duplicate provenance on the entity for convenience. | Derive the provider predicate from canonical provenance; never infer it from title or id parsing unless that representation is contractually guaranteed. |
| `calendar[].calendarName` | COS | Provider calendar attribution tells the user which operational domain owns an otherwise identical event and is used in briefs. It cannot be derived from event times/title or from the opaque `calendarId`. | Publication may be justified as authoritative source-container attribution, but putting UI labels on a commitment risks convenience expansion and duplication of a source entity. | Investigate a governed calendar/source identity and display name referenced by provenance; do not add `calendarName` to commitments now. |
| `calendar[].calendarColor` | DVS | No current Dashboard rendering path reads this field; historically identified presentation metadata is purely provider/UI colour even if a future calendar view uses it. | Rendering colour belongs downstream and cannot justify canonical expansion. | Exclude from the proposed operational contract; keep optional source styling in Dashboard configuration if later needed. |
| next event, next-three slice, and `Then` text | DDP | These are `calendar[0]`, `slice(1,3)`, and deterministic joining/wording, provided commitments are ordered by `startsAt` with qualified-id tie-break. Current canonical commitments are identity-sorted, so array position alone is not equivalent. | Selection is consumer presentation, but relying on unspecified order would violate deterministic replay and may misreport what is next. | Sort eligible non-cancelled commitments by `startsAt ASC, id ASC`, then select indices 0–2 and format downstream. |

### Communications

Current source is the selected Gmail connector normalized into prioritized `EmailMessage` records.
Consumers are the status strip, JARVIS/DAWNWATCH/HERALD briefs, and HERALD's badge. Canonical
`OperationalCommunication` already carries protocol identity, sender, recipients, timestamps,
optional subject, and reply-chain references.

| Dashboard field | Proposed class | Evidence and architectural rationale | Constitutional implications | Recommendation |
| --- | --- | --- | --- | --- |
| `gmailThreads[].id` | COS | Used as list identity and sourced from the provider; canonical communication already has a protocol identity. | Canonical identity must distinguish provider observation identity from RFC message identity and preserve provenance. | Use the governed canonical communication id rather than republishing the connector id. |
| `gmailThreads[].subject`, `from`, `receivedAt` | COS | Provider-observed facts are shown in the communication detail and HERALD brief and correspond to canonical `subject`, `sender`, and received/sent timestamps. | Communications are shared operational facts; publication must remain metadata-only, provenance-backed, and bounded by content policy. | Consume existing canonical metadata after governance; specify received-time fallback without hidden clock or invention. |
| `gmailThreads[].unread` and `important` | COS | Provider label observations contribute to urgent-communication selection. They are neither derivable from canonical message headers nor merely Dashboard styling. | Publication may support honest attention ranking, but label state is mutable observation state and currently lives in projection provenance, not the communication entity. Identity and observation-time semantics must be resolved. | Consider a governed source-observation state/reference, not immediate entity expansion. |
| `gmailThreads[].needsReply` | DDP | For Google it is exactly `unread`; for local seed data it is always true. The code documents it as a best-effort heuristic, not an authoritative provider fact. | Publishing a heuristic as shared reality would overstate knowledge and undermine human judgment. Its rule/version/source boundary must remain visible. | Derive as a versioned consumer rule from canonical unread evidence; do not call it canonical reply state. |
| `gmailThreads[].source` | DDP | Used only with `sourceLabel` to decide HERALD attribution; canonical provenance identifies the adapter/source. | Duplicating source on every entity for UI branching is convenience and potentially reconstructive. | Derive the provider predicate from canonical provenance/source reference. |
| `gmailThreads[].sourceLabel` | COS | Mailbox/account attribution distinguishes operational context and affects urgent selection (`Governance Engineering`). It is supplied by connector query context and cannot be derived from message metadata alone. | It may be legitimate shared source identity, but a human-readable label on each communication risks source duplication and consumer-specific naming. | Investigate a governed mailbox/source entity with stable identity and display name; do not add the label to communications now. |
| needs-reply list/count and urgent-communications list/count | DDP | Needs-reply filters the heuristic flag. Urgent communications apply `unread || important || sourceLabel === "Governance Engineering"`; both counts and singular/plural wording follow mechanically. | These are Dashboard attention policies, not new operational facts. They must not silently become canonical urgency judgments. | Derive downstream with explicit versioned rules and stable ordering by canonical timestamp/id. |
| relative received time | DDP | `relativeTime(receivedAt)` produces `just now`, minutes, hours, or days using the current clock. | A hidden browser clock prevents replay and is presentation state. | Derive using explicit render/reference time and documented rounding thresholds; never publish the string canonically. |

`snippet` is not read anywhere in the current Dashboard rendering tree and is therefore not a
Dashboard contract field. It must not be promoted by association.

### Drive activity

Current source is the selected Drive connector, exposed as `driveFiles`. Consumers are CO-WORK's
opening brief and badge. Canonical `SituationalAwareness` has a Drive source state but no file/activity
entity.

| Dashboard field | Proposed class | Evidence and architectural rationale | Constitutional implications | Recommendation |
| --- | --- | --- | --- | --- |
| `driveFiles[].name` | COS | Provider/local observed document label is shown by CO-WORK and contributes to a shared recently-touched work picture. It is not derivable from current canonical state. | Recent document activity can support continuity (Principle 11), but adding file entities would be a substantial responsibility expansion and could expose content or private metadata. | Investigate a separate bounded document-activity publication, source authority, identity, and content policy; do not expand the snapshot now. |
| `driveFiles[].project` | COS | Human/provider attribution connects document activity to a project and is shown in the brief; it cannot be reconstructed reliably from file name. | A relationship to a canonical project is shared reality only if explicitly observed, never inferred. Non-Reconstruction requires references rather than copied project objects. | Require canonical project identity and explicit relationship provenance before considering publication. |
| `driveFiles[].modified` | COS | The displayed recent-activity time is an operational observation, but the legacy field is human-readable free text rather than a canonical timestamp. | Continuity benefits do not excuse hidden-time parsing. Deterministic replay needs an absolute observation timestamp. | Consider an absolute `modifiedAt` in a separate governed activity contract; derive `Yesterday`-style wording downstream. |
| recently touched list and count | DDP | CO-WORK joins all supplied file rows and its badge counts them. | Count and prose are consumer summaries, while the current upstream limit of five must not be mistaken for total backlog. | Derive downstream and label semantics as observed-window count, with stable time/id ordering. |

### Availability and connector state

`calendarStatus`, `gmailStatus`, and `driveStatus` are built from connector selection/fetch outcomes.
`connectorStatuses` is separately synthesized from those outcomes and stored-token presence. Consumers
are the boot sequence, top bar, compact system status controls, and connector-count footer.
Canonical `OperationalSourceState` already defines source kind/status and optional observation time.

| Dashboard field | Proposed class | Evidence and architectural rationale | Constitutional implications | Recommendation |
| --- | --- | --- | --- | --- |
| `calendarStatus`, `gmailStatus`, `driveStatus` | COS | Whether each intelligence source is online, unavailable, or requires refresh changes the reliability of the operational picture and drives real reconnect actions. It is shared source reality, not colour choice. | Principle 4 requires professional gap reporting; canonical source state already owns availability, but `refresh_required` is also an application authentication/action condition. Raw OAuth errors must not leak. | Map governed availability to canonical source states; separately govern whether refresh action state belongs in an application-facing auth contract. Do not alter either model now. |
| `connectorStatuses[].name` | DDP | The connector name is not read per row by the Dashboard; array entries only contribute counts. Canonical source `kind` can deterministically supply a display label. | Duplicating names merely to count sources is convenience. | Exclude from the consumed leaf contract; derive any future label from governed source kind. |
| `connectorStatuses[].source` | DDP | Not read by the current Dashboard. Canonical provenance/source identity can represent provider origin. | Do not duplicate provenance as view data. | Exclude from the consumed leaf contract and derive only if a future view requires it. |
| `connectorStatuses[].connected` | DDP | This Boolean is synthesized as status `online` and is used only for live/total counts. | Republishing it alongside status creates two potentially inconsistent truths; counts are presentation summaries. | Derive `connected := source.status === available` under a governed mapping, then count. |
| system reading (`ATTENTION REQUIRED` / `NOMINAL` / `LOCAL MODE`) | DDP | Fixed precedence over calendar/Gmail statuses: refresh required; else any online; else local mode. | Executive-language copy belongs downstream and the omission of Drive is a current consumer rule, not canonical meaning. | Keep as a versioned Dashboard rule; human review should decide whether Drive omission is intended. |
| per-service dot/action (`live`, `syncing`, `offline`; connect/reconnect/disconnect) | DVS | These states and labels translate service status into colour and a Dashboard authentication control. | Rendering and interaction state belongs to the application; it carries no execution authority beyond the separately governed endpoint. | Keep in Dashboard view/control state, driven by governed availability. |
| boot `ok` flags and reveal state | DVS | Calendar/Gmail mark both `online` and `unavailable` as `ok`; timed reveal counters exist only for the boot animation. | This is animation/experience state, not an availability fact and must not enter a publication. | Keep local to the boot component. |
| connector live count, total, and `allLive` | DDP | Filter/count/equality over source availability; displayed in the rail and top bar. | Bounded summary is appropriate downstream, not a second canonical fact. | Derive from the explicitly scoped canonical source set; define whether `not_configured` belongs in the denominator. |

### Dashboard compositions and editing state

| Dashboard field | Current source and consumers | Proposed class | Architectural / constitutional rationale | Recommendation |
| --- | --- | --- | --- | --- |
| opening-brief strings and recommendation wording | Pure `getOpeningBrief` templates consuming the fields above; rendered by `ConversationDock` | DVS | Agent-specific prose, greetings, singular/plural forms, and recommendation language are conversational application state. Canonical publication would acquire presentation, reasoning, and recommendation responsibility contrary to Publication Principles and human-final authority. | Keep templates downstream. Any future derivation contract should consume canonical facts, explicit agent id, locale, and explicit reference time. |
| specialist badge numbers | Filter/count rules over priorities, signals, communications, projects, Drive files, and blockers; rendered by `AgentRail` | DDP | Counts are reproducible summaries but the per-agent allocation is consumer routing/presentation policy, not canonical ownership. | Derive downstream with rule versions and canonical identities. |
| memory editor working copies, ordering, dirty values, save/error/saved flags | Initial copies of priorities/projects/signals plus user edits; consumed only by `MemoryEditor` | DVS | Mutable drafts and interaction state are expressly application state. Publishing them would violate deep immutability and human approval boundaries. | Keep outside `ExecutiveStateSnapshot`; use a separately governed command/write contract if canonical editing is later designed. |
| open status-strip segment | Local `useState`; consumed only by `StatusStrip` | DVS | Disclosure/layout choice has no operational meaning. | Keep component-local. |

### Explicitly not consumed

The inventory found no Dashboard-tree read of `OperationalState.updatedAt`, `CalendarEvent.calendarColor`,
`EmailMessage.snippet`, `CalendarEvent.recurringEventId`, or `CalendarEvent.selfAttendeeResponse`.
`calendarId`, calendar `status`, and connector `name`/`source` are also not directly rendered, but are
listed above because they participate in identity/contract analysis or the passed connector shape.
No unconsumed field is recommended for publication merely because it exists in `OperationalState`.

## Canonical publication proposals: evidence threshold and open questions

Every COS label above means only **plausible shared operational state requiring governance**. It is
not a recommendation for immediate publication. Before any COS candidate could be published, human
review would need all of the following evidence:

- at least one authoritative source and stable canonical identity, with observation time and
  provenance, rather than a legacy array position or free-text approximation;
- demonstrated need across authorised consumers independent of the Dashboard, not merely present UI
  demand;
- a field-by-field Publication Responsibility Audit showing that the snapshot remains descriptive,
  bounded, non-reconstructive, and free of rendering, reasoning, action, or mutable draft state;
- a declared immediate-upstream input, deterministic normalization/failure contract, identity impact,
  deep-immutability mechanism, migration impact, and replay/boundary tests;
- evidence that an existing canonical entity/reference cannot already express the fact and that a
  separate downstream or new bounded publication would be inferior; and
- explicit architectural approval and human confirmation of semantics, authority, privacy, and
  content-retrieval boundaries.

Candidate-specific unresolved architectural questions are:

1. **Priority:** Is explicit rank canonical entity content, an ordered user assertion, or a separate
   prioritisation relationship? How do `urgent`, canonical `level`, due time, and human override
   interact? Who owns prose `detail`?
2. **Project:** What exactly does `progress` measure, who asserts it, and when is it stale? Is `tag`
   lifecycle status or portfolio grouping? Should progress live in active work rather than project?
3. **Signal:** Is a signal a new canonical entity, active work, waiting item, commitment, or source
   observation? How are risk, deadline, research topic, and note separated without inference?
4. **Calendar attribution:** Is calendar identity a source entity, provenance attribute, role, or
   project relationship? Can all-day intent be preserved by the existing timestamps? Does `dueAt`
   legitimately mean event end for presentation? How should tentative/declined/recurring facts work?
5. **Communication attention:** Are unread/important mutable source observations canonical entity
   state or provenance only? Is mailbox identity a source, role, or application account? What rule
   can legitimately claim `needsReply`, and whose judgment is authoritative?
6. **Drive:** Does recent document activity belong in this snapshot at all, or in a new bounded
   document-activity publication? What metadata/content and project-link evidence may be exposed?
7. **Source/auth state:** Does `refresh_required` describe operational source availability or
   Dashboard authentication remediation? What source set and denominator define `allLive`?

Until these are answered, the constitutional default is downstream derivation or a separately
governed publication—not expansion of the frozen canonical snapshot.

## Proposed derivation prerequisites

Consumer derivation is not implemented or authorised here. Governance would need to supply inputs
the legacy Dashboard currently hides:

- explicit viewer timezone and locale for weekday/time labels;
- explicit render/reference time for greetings and relative communication ages;
- stable canonical identity tie-breakers for every sort;
- explicit eligibility rules for cancelled commitments and source availability;
- versioned rules for blockers, urgent communications, needs-reply, active projects, badges, and
  system-reading precedence; and
- source/entity joins for calendar and mailbox display names rather than parsing opaque ids.

Without these inputs, `day`, `time`, relative age, and selection ordering are not deterministically
derived in the constitutional sense even though the current browser code usually produces a value.

## Completeness matrix

| `OperationalState` top-level field | Dashboard use covered | Nested fields accounted for | Proposed outcome |
| --- | --- | --- | --- |
| `priorities` | editor, briefs, recommendation, badge | `rank`, `title`, `detail`, `due`, `urgent` | COS candidates; derived summaries; editor state DVS |
| `projects` | strip, editor, briefs, badge | `name`, `tag`, `progress`, `tagColor` | first three COS candidates; colour DVS; summaries DDP |
| `signals` | editor, briefs, badges | `kind`, `title`, `detail`, `cta` | first three COS candidates; CTA DVS; summaries DDP |
| `blockers` | PHDSS brief/badge | constituent signal fields above | DDP |
| `calendar` | strip and briefs | every `CalendarEvent` field, including explicitly unused fields | facts/identity COS; labels DDP; colour DVS |
| `calendarStatus` | boot/top bar/rail | complete scalar | COS candidate plus derived/DVS renderings |
| `gmailThreads` | strip and briefs/badge | every `EmailMessage` field, including unused `snippet` | facts and attribution COS candidates; heuristics/summaries DDP |
| `gmailStatus` | boot/top bar/rail | complete scalar | COS candidate plus derived/DVS renderings |
| `driveFiles` | brief/badge | `name`, `project`, `modified` | COS candidates in unresolved publication; list/count DDP |
| `driveStatus` | rail | complete scalar | COS candidate plus DVS rendering |
| `connectorStatuses` | top bar/rail counts | `name`, `source`, `connected` | DDP; names/source explicitly unused |
| `updatedAt` | no read | scalar explicitly excluded | no Dashboard contract classification required; no publication recommendation |

Thus every field actually derived from `OperationalState` by the Dashboard has a proposed
classification, source, consumers, rationale, constitutional implications, and recommendation; the
unconsumed remainder is explicitly bounded rather than silently omitted.

## Recommendation for governance review

Review this inventory as a proposal, resolve the open semantic and ownership questions, and govern a
separate presentation contract before repeating parallel evaluation. Do not promote
`ExecutiveStateSnapshot`, retire `OperationalState`, migrate DAWNWATCH, implement derivations, or
expand a canonical model on the strength of this document. Sprint 3.57's blocker remains open until
humans accept, amend, or reject this proposal and a later authorised sprint validates the governed
contract.
