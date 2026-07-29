# Sprint 3.52B — Authenticated Operational Validation Runner

## Status and boundary

Implementation provides a manually invoked, deployment-only validation capability. Implementation or CI completion is **not authenticated operational evidence** and yields `NOT_ASSESSED`. The runner is not imported by chat, startup, build, briefing, or scheduled behavior and exposes no Calendar write operation.

The Sprint 3.52A checked-in summary is retained solely as a synthetic demonstration of evidence-pipeline mechanics. `OV-001`–`OV-008` are not authenticated findings, defects, improvements, or migration evidence.

## Local execution

1. Use the repository's existing Google OAuth connection and token store (`data/google-tokens.json`). Do not copy tokens.
2. Run `npm run validate:operations` deliberately from the repository root.
3. The runner verifies/refreshes the existing session, reads at most 100 events in a three-day window, and does not fall back to fixtures.
4. Inspect the local-only attestation: run identifier, execution time, authentication state, exact retrieval window, counts, report hash, unpredictable challenge, and a short recognizable evidence excerpt.
5. Enter the operator identifier and the compound challenge exactly. A yes/no response cannot confirm evidence.
6. Inspect the complete report under the gitignored `data/validation-reports/`. Never commit it.
7. If publication is desired, copy only the returned closed-schema summary after independently checking that it contains no operational content. Publication is never automatic.

Missing/expired authentication exits as `AUTHENTICATED_VALIDATION_NOT_EXECUTED`, writes no completed report, and produces no summary. Connector, projection, assembly, availability, and context failures fail closed.

## Evidence states

- **Capability available:** tests/doubles pass; no authenticated evidence exists; recommendation is `NOT_ASSESSED`.
- **Execution claimed:** live processing wrote protected evidence but the challenge was skipped/incorrect; confirmation remains `pending`; recommendation is `NOT_ASSESSED`.
- **Operational validation complete:** valid live provenance, protected report, inspected evidence, and successful generated challenge permit `confirmed` and a gated `PROCEED`, `REFINE`, or `DEFER`.

## Closed schema

Every complete report and repository summary requires provenance: execution source, connector source, validation level, OAuth state, generator, generation timestamp, and runner version. Exact valid combinations are enforced in code. Synthetic, manual, replay, and mixed evidence can produce only `NOT_ASSESSED`.

Summaries enumerate identifiers, categories, classifications, controlled reason codes, aggregate counts, provenance, confirmation status, and the gated recommendation. They exclude report hashes, challenges, titles, people, email addresses, organizations, calendar identifiers, exact event timestamps, locations, descriptions, raw output, and free text.
