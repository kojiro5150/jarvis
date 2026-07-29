# Sprint 3.53 — Migration Evidence and Recommendation Transparency

The operational validation summary contains one authoritative `migrationRecommendation` object. Its `value`, `basis`, and `evidence` are generated together by `determineMigrationRecommendation`; neither the dashboard nor the engineering summary stores or classifies a second recommendation.

`assembleMigrationRecommendationEvidence` measures and freezes the structured facts without classifying them. The private `applyMigrationRecommendationGate` is the only function that constructs `value` and `basis`. `determineMigrationRecommendation` combines that classification with the measured evidence and freezes the authoritative object. This makes the construction path one-way: measured results → evidence → gate classification → immutable recommendation.

## Evidence rules

- Coverage is measured over the ten registered operational scenario categories. A category is **present** only when the bounded live connector response demonstrates it; an absent category remains `SCENARIO_NOT_PRESENT`.
- `notComparable` is reported separately and is a subset of present scenarios for which no real legacy response was compared.
- Implementation defects are the count of `Action Required` comparison classifications.
- A recommendation cannot be assessed without authenticated deployment provenance, completed deterministic processing, and a valid operator attestation.
- Full category coverage is required to proceed. If legacy comparison is explicitly enabled, every present scenario must have a real comparison result.

These rules deliberately do not infer recurrence or attendee response. The Google normalization boundary preserves provider-supplied recurrence identity and the authenticated user's attendee response, so those categories become present only when the live response carries that evidence. Repeated authenticated observations expand evidence only when the connector actually exposes a supported observable category; missing evidence is not filled with fixtures.

## Optional legacy comparison

The runner does not invoke conversational behavior by default. A caller must supply an enabled `LegacyComparisonAdapter`. The adapter receives the authenticated connector evidence, deterministic ExecutiveContext representation, scenario identity, and validation provenance. It may return a real extracted comparison or `undefined`; an incomplete attempt is recorded as `legacyComparisonExecuted: false`, and no fallback response or claim is synthesized.

## Derived reviewer views

`deriveEngineeringSummary`, `renderValidationDashboard`, and `evaluateMigrationGate` consume the authoritative recommendation. They do not inspect raw evidence to create another recommendation. The gate opens only when the authoritative value is `PROCEED` and every encoded evidence condition is satisfied.

Run authenticated validation with:

```bash
npm run validate:operations
```

The complete report remains in the repository-ignored `data/validation-reports` directory. Only its anonymised summary is suitable for deliberate publication.
