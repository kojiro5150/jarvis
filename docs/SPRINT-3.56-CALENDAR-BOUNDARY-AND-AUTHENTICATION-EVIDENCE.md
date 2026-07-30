# Sprint 3.56 — Calendar Projection Boundary and Authentication Evidence

## Calendar boundary analysis

Production behaviour is **B: reject the entire projection**. The connector normalizes every
retrieved provider event, including bare-date all-day events, before returning the window. The
Calendar adapter then calls `mapCalendarEvents` once. That function maps the array eagerly; the
first invalid event throws, so duplicate checking, sorting, artifact construction, assembly, and
all downstream computation do not complete. There is no catch, filter, per-event result, or partial
artifact path in the adapter or authenticated runner.

The unsupported cases established by production validation are:

- bare `YYYY-MM-DD` start or end values, because the canonical commitment requires an RFC 3339
  instant and selecting an offset would invent timezone semantics;
- malformed or impossible start/end timestamps, and an end before its start;
- absent/blank event identifier, calendar identifier, or title;
- a source other than Google or a status outside `confirmed`, `tentative`, and `cancelled`; and
- duplicate calendar-qualified event identifiers.

Connector normalization does repair some partial provider metadata *before* this boundary: it
supplies a deterministic fallback identifier/title, uses start as a missing end, and uses the
current connector time when start is absent. Consequently those normalized values may pass the
adapter. This does not change the adapter boundary: whatever observation shape reaches it must
pass every validation rule, or the whole projection fails. The deliberate, fail-closed architectural
decision and its rationale are recorded in ADR-0007.

Expected operational behaviour is an aborted authenticated run, no successful artifact, and no
repository authentication summary. A valid sibling event is not evidence of partial success.

## Repository-visible evidence summary

Protected reports remain only under the gitignored `data/validation-reports/` directory. The
repository may contain only separately reviewed summaries under `docs/validation/authenticated/`,
each conforming to `authentication-evidence-summary.schema.json`. The smallest compliant document
has exactly these fields:

| Field | Meaning |
| --- | --- |
| `schemaVersion` | Closed schema identifier, currently `authentication-evidence-summary-v1`. |
| `reportIdentifier` | Opaque link to the protected report; never a user, calendar, or event identifier. |
| `executionSource` | Must be `authenticated_deployment`. |
| `connectorSource` | Must be `live_google_calendar`. |
| `adapterIdentifier` | Must be `google-calendar`. |
| `operatorConfirmation` | Must be `confirmed`. |
| `scenarioIdentifiers` | One or more non-personal identifiers from the approved validation plan. |
| `completionStatus` | Must be `OPERATIONAL_VALIDATION_COMPLETE`. |

The JSON Schema closes the object to additional properties and fixes the authenticated provenance
and completion values. A schema-valid document is eligible evidence, but repository review is still
required. Summaries must contain no names, operator identifiers, titles, descriptions, locations,
email addresses, organizations, calendar/event identifiers, exact observation timestamps,
retrieval windows, counts derived from private content, hashes, challenges, tokens, raw output,
free text, or protected observations. A protected report itself must never be copied or modified for
publication.

## Publication from existing protected reports

Existing completed protected reports can produce summaries without exposing their contents. On the
trusted machine, the operator should:

1. Run `npm run validation-reports -- summary <run-id>` and inspect the derived local view.
2. Confirm the source report records authenticated deployment, live Calendar provenance, completed
   deterministic validation, and confirmed operator attestation. Pending or failed runs produce no
   artifact.
3. Create a new JSON document containing only the eight schema fields above. Translate only the
   controlled report/scenario identifiers; do not copy the generated browser output wholesale.
4. Validate it against `docs/validation/authentication-evidence-summary.schema.json`, independently
   inspect the diff for prohibited data, and commit it under `docs/validation/authenticated/`.
5. Keep the protected report in its gitignored location. Publication is manual and append-only;
   corrections supersede rather than overwrite evidence.

No existing protected report was inspected or changed in this sprint. The checked-in Sprint 3.52A
pipeline demonstration is synthetic and therefore contributes zero authenticated summaries.
Whether a deployment currently has eligible protected reports can be determined only by an
authorized operator following the process above.

## Evidence-only capability classification

Audits shall count only schema-conforming files committed under
`docs/validation/authenticated/`. Narrative, sprint completion reports, console output, local or
protected reports, test results, recollection, and pull-request assertions never populate the
authentication column.

| Repository implementation | Repository-visible authentication summaries | Classification |
| --- | --- | --- |
| Implemented | None | `IMPLEMENTED_NOT_AUTHENTICATED` |
| Implemented | One eligible authenticated summary | `IMPLEMENTED_WITH_INITIAL_AUTHENTICATION` |
| Implemented | Multiple eligible summaries collectively covering every scenario required by the approved operational validation plan | `OPERATIONALLY_VALIDATED` |

Counts are by distinct `reportIdentifier`; duplicate files or several scenarios from one report do
not create multiple authenticated executions. `OPERATIONALLY_VALIDATED` additionally requires at
least two distinct completed reports and union coverage of the plan's defined scenario identifiers.
An audit must downgrade when either condition is absent. Implementation status is determined
separately and cannot be inferred from an evidence summary.

At sprint completion this repository has no artifact in the authenticated directory and is therefore
`IMPLEMENTED_NOT_AUTHENTICATED`; the synthetic 3.52A summary does not alter that result.

## Validation and next justified step

The mixed-window production test now makes atomic rejection executable evidence. Documentation
records the failure boundary, rationale, operational consequence, summary schema, publication
process, and classification rule. No authenticated report or operational observation is committed.

The next justified engineering step is **not** adapter redesign: an authorized operator should first
publish the smallest compliant summary for any eligible existing completed report. If none exists,
the operational validation campaign may commence against the documented fail-closed Calendar
boundary, publishing one reviewed summary after each completed scenario-bearing run.
