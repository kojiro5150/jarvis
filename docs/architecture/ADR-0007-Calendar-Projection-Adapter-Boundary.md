# ADR-0007: Calendar Projection Adapter Boundary

- **Status:** Accepted
- **Date:** 2026-07-27
- **Governing decision:** ADR-0006, Projection Before Interpretation

## Context

The production Google Calendar connector already retrieves and normalizes provider observations. Situational Awareness must consume those observations without teaching the connector about executive state or teaching the Projection Engine about Google Calendar.

## Decision

The Calendar Projection Adapter is the sole semantic boundary between the provider-neutral calendar connector contract and ProjectionArtifact. The connector retrieves events. The adapter validates and deterministically translates them into operational commitments. ProjectionRegistry is the only integration mechanism, and ProjectionEngine remains the sole constructor of SituationalAwareness.

The observation timestamp, identity, availability and source identifier are supplied to the adapter. It never reads a clock or generates them. Event identifiers are qualified as `google-calendar:<calendar-id>:<event-id>`, preserving Google's stable recurring-instance identifier while preventing collisions between calendars. Output ordering is by that canonical identifier.

Google `cancelled` maps to canonical `cancelled`; confirmed, tentative, or an omitted Google status maps to the objective `scheduled` state. The adapter does not infer priority, urgency, relationships, meeting classification, tasks, or action.

PR1 has no `endsAt` field. The observed event end is therefore carried in the commitment's bounded `dueAt` timestamp rather than discarded. No role or project references are inferred.

Bare all-day dates have no offset and cannot satisfy the existing canonical RFC 3339 timestamp contract without inventing a timezone. They are rejected explicitly. Missing identifiers or titles, malformed or reversed timestamp ranges, unsupported statuses, non-Google sources, and duplicate qualified identifiers are also rejected rather than repaired or silently discarded.

Artifact provenance records the Google Calendar connector, calendar adapter, source identifier, supplied observation timestamp, and supplied availability. The qualified commitment identifier preserves the event-level source identifier under the existing immutable canonical model.

## Consequences

- Connector code has no dependency on SituationalAwareness or projection types.
- ProjectionEngine has no dependency on calendar or connector implementations.
- Replays of identical observations and supplied projection context are identical.
- Future adapters can reuse ProjectionAdapter, ProjectionArtifact, ProjectionRegistry and ProjectionEngine without modifying them.
- Supporting all-day events or a distinct canonical end timestamp requires a separately governed canonical-model change; this adapter does not silently anticipate one.
