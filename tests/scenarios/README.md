# Executive Scenario Framework

This package defines immutable, deterministic executive environments used to
exercise the canonical Executive Operating System runtime. A scenario owns
identity, metadata, projection artifacts, assertions, provenance, and replay
identity. It never owns runtime configuration or executive reasoning.

`cancelled-commitment/scenario.ts` is the initial canonical scenario and reuses
the existing golden projection artifact set. `index.ts` is the sole canonical
publication point. Runtime configuration is supplied separately to
`DeterministicExecutiveScenarioLoader.execute`, preserving the boundary between
executive reality and its interpretation.

Registry construction validates every registration before publishing an
atomically constructed, deeply frozen, code-unit-sorted collection. The loader
validates again before invoking `DeterministicExecutiveOperatingSystemRuntime`
and returns a deeply frozen report in which assertion failures are explicit.
