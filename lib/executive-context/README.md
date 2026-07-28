# Executive Context

This constitutional package implements Sprint 3.27's separate deterministic path from one
`ExecutiveStateSnapshot` to one immutable `ExecutiveContextSnapshot`. It intentionally does not
replace or modify `lib/executive-operating-system/context`, whose assessment-based EOS contract
continues to serve the existing runtime.

The engine accepts a canonical state snapshot and an explicit RFC 3339 reference time. It validates
the state, derives raw measures and explicit relationship/source groupings, publishes structural
conditions with calculation evidence, and returns either one recursively frozen snapshot or one
deterministic failure. It does not read the clock, acquire data, infer relationships, rank entities,
or produce recommendations.

```ts
const result = new ExecutiveContextEngine().derive({ sourceState, referenceTime });
```

`replayExecutiveContext` performs the same offline derivation and requires no external service or
mutable runtime state.
