# Situational Awareness Assembly

This package owns the deterministic boundary from the existing `ProjectionArtifactSet` shape to
`ExecutiveStateSnapshot`. It validates and defensively copies canonical artifacts, orders them by
content-derived identity, exposes only explicit canonical references, reports supported structural
conditions, and publishes recursively frozen output.

Assembly uses only supplied artifacts, lifecycle identity, observation time, and contract versions.
It does not read a clock, use randomness or locale ordering, access a connector, invoke an adapter,
persist data, call a model, or interpret executive significance. The existing Projection Engine and
Executive Operating System remain the canonical constructors and consumers of operational state;
the snapshot's `state` is structurally compatible with that unchanged boundary.

The current canonical model has no commitment end time or blocking marker and no standalone
availability intervals. Consequently overlap and contradictory-availability detection are not
invented here. Unsupported structural semantics require a separately governed canonical-model
change. Explicit `unknown` context values are the only currently representable information gaps.
