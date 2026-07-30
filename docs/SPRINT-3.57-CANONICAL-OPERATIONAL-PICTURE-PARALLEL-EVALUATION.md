# Sprint 3.57 — Canonical Operational Picture Parallel Evaluation

## Decision and scope

The selected production consumer is the **Dashboard**. DAWNWATCH is unchanged. Sprint 3.57 added an
evidence-only endpoint at `/api/operational-state/evaluation`; the Dashboard continues to fetch
`/api/operational-state`, so `OperationalState` remains authoritative and no production promotion
has occurred.

**Recommendation: DO NOT PROMOTE YET.** Supported operational semantics are equivalent, and the
canonical identity and ordering behaviour is an intentional deterministic improvement. Promotion
is blocked because the current Dashboard consumer contract depends on presentation metadata that
is not part of the canonical operational model. This is a consumer contract issue, not evidence of
incorrect projection behaviour or an incomplete canonical operational picture. A locally sourced
fallback calendar also remains an ADR-0007 unsupported source boundary and makes the canonical
picture unavailable while the legacy Dashboard continues.

## Comparison methodology

1. Acquire one `OperationalState` exactly once.
2. Retain that object as the legacy result and pass its exact calendar event array to the existing
   `CalendarProjectionAdapter` through an in-memory connector.
3. Supply one explicit observation time to projection, lifecycle input, assembly, and the report.
4. Assemble an `ExecutiveStateSnapshot` only after successful atomic projection.
5. Compare event coverage, titles, temporal ranges, and status mappings by qualified identity.
6. Record every comparison row with exactly one governed classification. Replay tests compare the
   complete report for equality under identical state and observation time.
7. On projection failure, publish no snapshot, classify the error only when it matches an explicit
   ADR-0007 rejection, and continue exposing the legacy object as the report authority.

## Behavioural classification table

| Capability | Classification | Recorded evidence | Promotion implication |
| --- | --- | --- | --- |
| Event coverage, title, temporal range, status | Equivalent | A supported fixture produces one legacy event and one canonical commitment with matching values. | Supported operational semantics are equivalent. |
| Identity and ordering | Intentional Improvement | Canonical identity includes calendar and provider event identity; canonical output is sorted. ADR-0007 documents both decisions. | Document the identifier change for any future promotion. |
| Dashboard presentation contract | Defect | The current consumer requires `day`, `time`, `calendarName`, `calendarColor`, and source labels that are not canonical commitment semantics. Projection remains correct; the replacement contract is unresolved. | Explicitly define and govern the consumer contract before repeating evaluation. |
| Local calendar fallback | Unsupported Boundary | The adapter fails closed because its connector source is not Google. ADR-0007 explicitly rejects non-Google sources. | Evaluate operational frequency and impact before promotion. |
| Canonical failure with legacy authority | Equivalent | No canonical snapshot is returned; the legacy object remains present and authoritative. | No current user-visible impact; the evidence endpoint records operator impact. |

## Unsupported Boundary evidence

The deterministic local-source test supplies the same local event to the legacy picture and the
canonical adapter. Projection throws `calendar projection adapter requires the Google Calendar
connector`. The report records:

- **Classification:** Unsupported Boundary
- **ADR:** ADR-0007
- **Matched boundary:** Unsupported source value / non-Google source
- **Observed evidence:** the fail-closed error text, canonical status `unavailable`, a null snapshot,
  and the unchanged authoritative legacy state

ADR-0007 also explicitly governs bare-date all-day events, malformed timestamps, missing required
fields, unsupported status values, reversed ranges, and duplicate qualified identities. The
classifier maps only those explicit rejection families to `Unsupported Boundary` and attaches the
ADR reference and matched reason.

## Undocumented Failure Mode evidence

No undocumented failure was observed in the supported timed-Google fixture or the current known
local-source boundary. A deterministic classifier test injects an unmatched failure and verifies it
is recorded as `Undocumented Failure Mode`, without an ADR citation. Such a result forces
`DO_NOT_PROMOTE` and requires investigation; it is never inferred to be an architectural boundary.

## Classification framework evidence

The evaluation successfully exercised all five governed evidence classifications:

- **Equivalent:** supported calendar event semantics and legacy continuity matched.
- **Intentional Improvement:** provider-qualified identity and deterministic ordering differed for
  documented architectural reasons.
- **Defect:** the current Dashboard replacement contract requires presentation information that is
  not present in the canonical publication. This identifies a consumer contract defect for
  promotion; it does not identify incorrect canonical projection semantics.
- **Unsupported Boundary:** a non-Google calendar source matched an explicit ADR-0007 rejection.
- **Undocumented Failure Mode:** an injected unmatched projection failure was classified without an
  ADR citation and was not assumed to be an architectural boundary.

The framework itself is therefore validated for future operational migrations: it can distinguish
semantic equivalence, justified differences, replacement-contract defects, governed boundaries,
and failures requiring investigation.

## Consumer behaviour when canonical state is unavailable

- **Observed behaviour:** `/api/operational-state` is unchanged and the Dashboard continues to
  render from `OperationalState`. The evidence endpoint returns the legacy picture, canonical
  `unavailable`, a null snapshot, and classified failure evidence.
- **User-visible impact:** none in this sprint because the canonical result is not in the rendering
  path.
- **Operational implication:** operators must inspect the evaluation endpoint/report. A future
  replacement would lose the calendar picture whenever the local fallback is active, so promotion
  is not justified without evaluating that documented boundary.

## Confirmed ADR-0007 behaviour

Sprint 3.57 confirmed the existing fail-closed architecture; it did not introduce a new projection
capability. Projection correctly rejected an unsupported observation, produced no partial
canonical snapshot, retained the legacy operational picture as authority, and thereby preserved
consumer continuity. These are validated behaviours of the existing ADR-0007 boundary.

The evaluation does not recommend modifying ADR-0007, weakening fail-closed behaviour, suppressing
projection failures, or constructing partial artifacts.

## Outstanding Architectural Question

Sprint 3.57 does not determine whether the presentation metadata required by the current Dashboard
belongs:

- within the canonical operational model;
- as deterministic derived data; or
- as Dashboard-specific view state.

That question requires separate engineering governance before promotion. The current consumer's
needs establish a replacement requirement, but they do not by themselves establish that the
required fields are canonical operational semantics.

## Promotion criteria and architectural options

Promotion shall not proceed until the Dashboard presentation contract has been explicitly defined
and the parallel evaluation has then been successfully repeated. Two architectural approaches are
possible; Sprint 3.57 does not determine which is correct.

### Option A — Canonical Publication

The canonical operational picture publishes the additional information required by the Dashboard.
This would expand the canonical model and shall not be treated as routine implementation work. Any
such expansion must satisfy the repository's existing constitutional requirements for canonical
publication, including evidence-based justification that the additional information is a
legitimate part of the canonical operational model rather than a consumer-specific requirement.
The Dashboard's current implementation requirements alone are insufficient justification for
expanding the canonical model.

### Option B — Consumer Derivation

The Dashboard derives its required presentation information deterministically from the canonical
operational picture. This is consumer-side implementation work. Provided that the canonical model
remains unchanged, it is not a canonical model expansion and requires no additional canonical
governance beyond normal engineering review.

Sprint 3.57 identifies this decision for governance before promotion; it does not redesign either
the publication or the consumer.

## Informational next activity

The next engineering activity should determine the Dashboard presentation contract before any
production promotion is considered. This is an informational sequencing recommendation only; this
sprint creates no implementation work and makes no architectural decision.

## Outcome

The evidence answers the sprint question with the required distinction: **supported canonical
operational semantics are behaviourally equivalent to the legacy calendar semantics, but the
canonical publication is not yet a drop-in replacement for the current Dashboard contract**. The
promotion blocker is the unresolved presentation contract, classified as Outcome C for replacement
purposes rather than as incorrect projection behaviour. When local fallback observations are
active, Outcome D also applies because ADR-0007 deliberately rejects that source.

Promotion must wait until the presentation contract is governed and the evaluation is repeated.
Neither projection, `ExecutiveStateSnapshot`, `OperationalState`, ADR-0007, nor Dashboard behaviour
was redesigned or modified by this documentation update.
