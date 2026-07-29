# Sprint 3.48 — Conversation Context Adapter

## Decision

The Conversation Context Adapter is an internal representation boundary between completed deterministic Executive Operating System computation and a future conversational consumer. It accepts only a `SituationalAwarenessSnapshot` and an `AvailabilityState`, and returns one deeply immutable `ExecutiveContext` value.

`ExecutiveContext` is deterministic, replayable, connector-independent, and deliberately not a canonical publication, projection artifact, Situational Awareness collection, runtime stage, public API, versioned external contract, or constitutional gateway. Its fitness will be tested against the first real consumer in Sprint 3.49.

## Constitutional boundary

The adapter copies facts; it does not reason. Commitment totals come from the snapshot. Active and next commitment references, overlaps, occupied intervals, and available intervals come unchanged from `AvailabilityEngine` output. The adapter never invokes that engine. Communication state exposes only its canonical total; because canonical communications do not contain unread state, `unreadCount` is omitted and an explicit unknown is emitted.

Non-computable commitment bounds are carried forward as explicit unknowns. A missing next commitment is also represented as unknown rather than zero, false, or an empty identifier. No importance, attention, actionability, priority, recommendation, planning, or scheduling interpretation is produced.

## Provenance and replay

Provenance identifies the lifecycle snapshot and observation time, preserves the complete availability provenance supplied by deterministic computation, and identifies the adapter/version that performed the representation transform. The adapter rejects an availability result whose source snapshot identity does not match its snapshot input.

All output objects and arrays are defensive copies and recursively frozen. Identical input values therefore yield structurally identical output values without clocks, randomness, connector calls, or connector-native objects.

## Deliberate exclusions

There is no integration with `/api/chat`, conversational prompting, summarisation, runtime routing, or any existing Executive Runtime stage. No prior architectural layer is modified. Additional fields and any reusable-interface status are deferred until consumer evidence exists.
