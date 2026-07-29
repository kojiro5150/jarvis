# Sprint 3.53 — Migration Evidence and Recommendation Transparency

The operational validation summary contains one authoritative `migrationRecommendation` object. Its `value`, `basis`, and `evidence` are generated together by `determineMigrationRecommendation`; neither the dashboard nor the engineering summary stores or classifies a second recommendation.

`assembleMigrationRecommendationEvidence` measures and recursively freezes the structured facts without classifying them. The private `applyMigrationRecommendationGate` is the only function that constructs `value` and `basis`. `determineMigrationRecommendation` combines that classification with the measured evidence and recursively freezes the authoritative object. Both operations use the repository's shared `deepFreeze` utility, including nested scenario coverage. This makes the construction path one-way: measured results → evidence → gate classification → immutable recommendation.

## Evidence rules

- Coverage is measured over the ten registered operational scenario categories. A category is **present** only when the bounded live connector response demonstrates it; an absent category remains `SCENARIO_NOT_PRESENT`.
- `notComparable` is reported separately and is a subset of present scenarios for which no real legacy response was compared.
- Implementation defects are the count of `Action Required` comparison classifications.
- A recommendation cannot be assessed without authenticated deployment provenance, completed deterministic processing, and a valid operator attestation.
- Full category coverage is required to proceed. `PROCEED` also requires this current run's canonical legacy comparison status to be `EXECUTED`; evidence is not accumulated across runs.

These rules deliberately do not infer recurrence or attendee response. The Google normalization boundary preserves provider-supplied recurrence identity and the authenticated user's attendee response, so those categories become present only when the live response carries that evidence. Repeated authenticated observations expand evidence only when the connector actually exposes a supported observable category; missing evidence is not filled with fixtures.

## Optional legacy comparison

The runner does not invoke conversational behaviour by default. Legacy comparison is optional for an individual run, and a caller must explicitly enable a `LegacyComparisonAdapter`. The adapter receives the authenticated connector evidence, deterministic ExecutiveContext representation, scenario identity, and validation provenance. It may return a real comparison or `undefined`. No fallback response, fabricated claim, or fabricated comparison is generated.

`legacyComparisonStatus` is the single authoritative lifecycle state:

- `NOT_ENABLED` — no enabled adapter was supplied.
- `NOT_ATTEMPTED_NO_PRESENT_SCENARIOS` — an adapter was enabled, but authenticated evidence contained no present scenarios.
- `EXECUTED` — every present scenario produced a real comparison.
- `INCOMPLETE` — at least one present scenario lacked a real comparison, without an adapter failure.
- `FAILED` — adapter execution failed operationally; validation continued.

The compatibility facts are derived only from that status: `legacyComparisonEnabled` is false only for `NOT_ENABLED`, and `legacyComparisonExecuted` is true only for `EXECUTED`. Provider error messages, responses, stack traces, OAuth details, connector internals, and calendar content are discarded at the failure boundary. Provider failure details never enter anonymised reports; those reports record only `FAILED`.

## Derived reviewer views

`deriveEngineeringSummary`, `renderValidationDashboard`, and `evaluateMigrationGate` consume the authoritative recommendation. They do not inspect raw evidence to create another recommendation. The gate opens only when the authoritative value is `PROCEED` and every encoded evidence condition is satisfied.

Run authenticated validation with:

```bash
npm run validate:operations
```

The complete report remains in the repository-ignored `data/validation-reports` directory. Only its anonymised summary is suitable for deliberate publication.
