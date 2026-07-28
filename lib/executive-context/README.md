# Executive Context

This package owns the deterministic, descriptive boundary from an immutable
`ExecutiveStateSnapshot` to an immutable `ExecutiveContextSnapshot`. The engine accepts an explicit
reference time, validates and defensively copies its input, publishes stable measures, explicit
relationship groupings, structural conditions and calculation evidence, and never reads the clock.

It does not acquire observations, assemble situational awareness, infer relationships, rank or
recommend, invoke models, persist data, or perform Executive Operating System interpretation. The
existing `lib/executive-operating-system/context` package is a separate interpretive EOS capability
and is deliberately unchanged.
