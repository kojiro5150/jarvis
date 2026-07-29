# Sprint 3.52A — Operational Validation Execution

Operational validation is an explicitly invoked deployment operation. Complete evidence is written
only beneath `data/validation-reports/`; that directory is gitignored because its records may contain
calendar content, legacy responses, and local engineering observations. The repository boundary accepts
only the generated anonymised summary contract.

The summary schema is closed. It contains scenario identifiers, enumerated scenario categories,
enumerated classifications, controlled outcome reason codes, integer match statistics, and an enumerated
migration recommendation. It cannot carry source observations or narrative fields. Recommendation
aggregation is conservative (`Defer` supersedes `Refine`, which supersedes `Proceed`).

The evidence recorder is not imported by the chat route, briefing implementation, connector layer, or
prompt construction. It neither changes production behaviour nor makes the Executive Operating System
authoritative. The checked-in summary is a privacy-preserving index of the deployment-owned evidence;
the complete report remains local.

Approved reason codes are:

* `EXPECTED_MATCH`
* `INTENTIONAL_IMPROVEMENT`
* `KNOWN_LIMITATION`
* `EXTRACTION_NOT_COMPARABLE`
* `REQUIRES_INVESTIGATION`
