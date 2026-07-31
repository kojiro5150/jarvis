# Sprint 3.60 — Dashboard Parallel Evaluation

## Evaluation summary

**Recommendation: Ready for Promotion.** Proceed to Sprint 3.61 for the separately governed
promotion activity. This sprint does not promote the Dashboard: `/api/operational-state` and the
production-rendered Dashboard are unchanged.

Nine deterministic scenarios were replayed through the legacy construction and the governed
Dashboard presentation constructor. All differences have exactly one Sprint 3.57 classification.
No Defect, Unsupported Boundary, or Undocumented Failure Mode was observed. The governed output
reproduces supported operational content and deliberately removes legacy ordering, eligibility,
clock, and publication inconsistencies in the ways approved by the governed Dashboard Presentation
Contract.

## Evaluation harness summary

`GET /api/dashboard/evaluation` is an evidence-only endpoint. With no query it returns every
scenario; `?scenario=<name>` selects one. It records the exact synthetic `OperationalState`, the
legacy construction, the governed presentation, comparison rows, and a recommendation side by
side. Unknown scenarios fail with HTTP 400. The route does not call connectors, require
credentials, alter authority, or feed a production component.

Each evaluation:

1. constructs one synthetic `OperationalState`;
2. hands that same recorded input to the legacy construction and the evaluation-only canonical
   projection used to invoke the Sprint 3.59 constructor;
3. propagates `2026-07-31T12:00:00Z`, `Australia/Melbourne`, `en-AU`, and the explicit
   calendar/email/drive source scope;
4. returns both outputs and classifications; and
5. recommends promotion only when no Defect, Unsupported Boundary, or Undocumented Failure Mode
   exists.

The harness is evaluation infrastructure, not production architecture. It does not modify
`OperationalState`, `ExecutiveStateSnapshot`, the Dashboard implementation, ADR-0007, or canonical
publication.

## Evaluation fixture summary and scenario coverage

Every fixture contains only scenario-relevant data and carries the explicit marker
`SYNTHETIC_EVALUATION_ARTEFACT_NOT_AUTHENTICATED_OPERATIONAL_EVIDENCE`. These fixtures neither
replace nor contribute to Sprint 3.52 authenticated operational evidence.

| Fixture | Coverage and deterministic assertion |
| --- | --- |
| `empty` | Empty priorities, projects, commitments, communications; all sources unavailable. |
| `single-commitment` | One supported future timed commitment. |
| `multiple-commitments` | Deliberately shuffled input plus a same-time identity tie; governed order is `a`, `b`, `later`. |
| `cancelled-commitment` | Cancelled item precedes an active item; cancellation remains visible but is ineligible for `nextCommitment`. |
| `bare-date-commitment` | `2026-08-03` renders `MON`, `All day` without timezone conversion. |
| `timed-commitment` | `2026-08-01T00:30:00Z` renders `SAT`, `10:30` in Melbourne. |
| `mixed-connectors` | Calendar and Drive available, email unavailable; summary is 2/3 and not all-live. |
| `relative-duration` | Observation two hours before the fixed reference renders `2 hours ago`. |
| `operational-content` | Priority/project labels, communication metadata/provenance, conditional derivations, and View State separation. |

Calendar reference validation is covered by the bare-date, timed, and relative-duration fixtures.
The reference instant, locale, and timezone are returned in the governed result and replay tests
compare complete evaluations.

## Behavioural comparison table

| Capability | Observed legacy behaviour | Governed behaviour | Classification | Supporting evidence / governance |
| --- | --- | --- | --- | --- |
| Empty picture | Empty operational segments | Empty canonical segments, `nextCommitment: null`, local-mode summary | Equivalent | Full deterministic replay matches. |
| Commitment content | Fixture identities/titles/times | Same eligible identities/titles/times | Equivalent | Every scenario compares eligible identity coverage. |
| Multiple ordering | Uses connector array order (`later`, `b`, `a`) | `startsAt ASC, id ASC` (`a`, `b`, `later`) | Intentional Improvement | Dashboard Presentation Contract, Calendar commitments; Sprint 3.59 ordering v1. |
| Cancelled selection | Index zero selects `cancelled` | Retains cancellation but selects `active` | Intentional Improvement | Dashboard Presentation Contract requires non-cancelled eligibility. |
| All-day rendering | Fixture carries `MON`, `All day` | Deterministically derives `MON`, `All day` | Equivalent | Explicit bare-date rule, locale, and UTC-safe weekday derivation. |
| Timed rendering | Fixture carries `SAT`, `10:30` | Deterministically derives `SAT`, `10:30` | Equivalent | Explicit `en-AU` and `Australia/Melbourne`. |
| Availability | Two of three legacy connector rows connected | `live: 2`, `total: 3`, `allLive: false` | Equivalent | Explicit three-source scope and availability mapping. |
| Relative duration | Legacy helper reads a hidden current clock | Fixed reference produces `2 hours ago` | Intentional Improvement | Dashboard Presentation Contract, Communications; deterministic replay rule. |
| Priority/project governed content | Legacy identity labels | Same canonical identity labels | Equivalent | Dashboard Presentation Contract, Priorities and Projects. |
| Priority/project deferred data | Legacy ranking/progress | Omitted | Intentional Improvement | Dashboard Presentation Contract outcome registers. |
| Communications/provenance | Legacy metadata plus message flags/content and mailbox label | Subject, sender, timestamp, and governed Google predicate | Equivalent for governed content | Artifact entity membership and adapter provenance are replayed. |
| Dashboard View State | Styling and interaction concerns coexist in legacy consumers | Constructor emits no colour, disclosure, animation, draft, or feedback state | Intentional Improvement | Dashboard Presentation Contract, Dashboard compositions and editing state. |
| Canonical representation | Legacy consumers can select different slices | Governed presentation exposes one ordered calendar plus next/following references | Intentional Improvement | Governed contract and North Star single operational representation principle. |
| Deferred/rejected data | Legacy shape carries progress, attribution, message flags/content and `updatedAt` | Governed presentation omits them; conditional lists remain empty | Intentional Improvement | Governed Dashboard Presentation Contract outcome registers. |

## Classification register

### Equivalent behaviours

- Empty-state behaviour and supported commitment identity/title/time content.
- Single commitment selection.
- Bare-date `All day` and timed Melbourne presentation.
- Mixed connector live/total calculation.
- Calendar information available as deterministic presentation for future consumers.

### Intentional Improvements

- Stable commitment ordering replaces connector iteration order.
- Cancelled commitments are excluded from next-event selection.
- Relative time uses a propagated reference rather than the wall clock.
- One governed calendar representation removes the legacy Dashboard/chat slice inconsistency. The
  chat path itself was not executed or changed.
- Deferred and rejected legacy fields are not reconstructed or published.

### Defects

None observed.

### Unsupported Boundaries

None observed. Fixtures remain within the governed model: supported statuses, valid temporal
values, unique identities, and governed source kinds. Consequently no boundary classification or
ADR citation is manufactured. ADR-0007 remains unchanged.

### Undocumented Failure Modes

None observed.

## Historical reference scenarios

- **Scenario A — Relative Date Reference:** the fixed Friday 31 July 2026 reference is propagated
  throughout. The next bare-date commitment is consistently Monday 3 August; no hidden system date
  participates. The Dashboard does not render conversational “tomorrow” wording.
- **Scenario B — Availability Query:** the governed calendar contains deterministic bounds and
  presentation for future consumers. This is Dashboard evidence only and makes no assertion about
  chat answering behaviour or authentication.
- **Scenario C — Legacy Consumer Consistency:** the legacy constructor can expose connector order
  while another legacy consumer selects only its first event. The governed output publishes one
  stable ordered calendar and derives next/following from it. This is an Intentional Improvement
  authorised by the governed presentation contract.

## Publication boundary confirmation

Programmatic checks assert that governed serialized output contains none of `updatedAt`, `snippet`,
`recurringEventId`, `selfAttendeeResponse`, `progress`, `calendarName`, `sourceLabel`, `unread`,
`important`, or Drive activity. `needsReply`, `urgentCommunications`, and specialist badge values
remain empty/zero where governed inputs are deferred. Canonical publication has not expanded.

## Promotion recommendation

**Ready for Promotion.** The evidence demonstrates supported operational equivalence, deterministic
presentation, governed intentional improvements, complete classifications, and an intact
publication boundary. There is no Sprint 3.60 corrective sprint to recommend. Sprint 3.61 may
consider promotion; Sprint 3.60 itself makes no authority change.
