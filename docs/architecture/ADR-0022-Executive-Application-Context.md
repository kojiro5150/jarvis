# ADR-0022 — Executive Application Context

## Context

The Executive Interaction Processing layer publishes validated interaction readiness, but future
applications require a stable boundary that does not make the interaction result itself an
application-state container. Expanding an existing immutable publication would violate its single
constitutional responsibility.

## Decision

The Executive Application Layer owns exactly one `ExecutiveApplicationContext` publication for
exactly one immutable `ExecutiveInteractionResult` input. The context answers only: “What stable
executive context is available for applications?” Its projector is deterministic, validates the
source publication, retains its identity by reference, and assigns `applicationContextId` as
SHA-256 over the complete canonical immutable context body.

The input boundary is exclusively `ExecutiveInteractionResult`. The projector must not import,
access, or reconstruct `ExecutiveInteractionContract`, `ExecutiveSession`,
`ExecutiveOperationalState`, `ExecutiveRunRecord`, or runtime. Its output is a projection-only,
application-neutral summary of readiness, available interaction modes, channels, specialists,
authority, and capabilities plus deterministic publication metadata.

The context owns no conversation, prompts, memory, LLM state, reasoning, routing decisions,
orchestration, execution state, interface behaviour, or transient application state. Chat,
DAWNWATCH, MARCUS, Voice, Dashboard, Automation and APIs will introduce their own projections from
this boundary rather than add their responsibilities to this publication.

## Publication responsibility principle

Every immutable publication has one constitutional responsibility. Capabilities normally enter as
new projections, not by expanding existing publications. This decision leaves frozen purposes
unchanged: `ExecutiveRunRecord` owns runtime evidence; `ExecutiveOperationalState` owns operational
readiness; `ExecutiveSession` owns executive interaction context; `ExecutiveInteractionContract`
owns interface permissions and interaction boundaries; and `ExecutiveInteractionResult` owns
validated interaction readiness. `ExecutiveApplicationContext` alone owns stable application
context availability.

## Architecture

```text
Constitutional Runtime → ExecutiveRunRecord
════════════════════════════════════════════
Operational Layer → ExecutiveOperationalState
════════════════════════════════════════════
Executive Session Layer → ExecutiveSession
════════════════════════════════════════════
Executive Interface Layer → ExecutiveInteractionContract
════════════════════════════════════════════
Executive Interaction Processing → ExecutiveInteractionResult
════════════════════════════════════════════
Executive Application Layer → ExecutiveApplicationContext
════════════════════════════════════════════
Applications → Chat | DAWNWATCH | MARCUS | Voice | Dashboard | Automation | API
```

## Consequences

Applications receive one validated, replayable boundary without acquiring Foundation authority.
An invalid or non-canonical source yields a deterministic unavailable context rather than repair or
reconstruction. New application needs require separate projections when they exceed stable context
availability.
