# ADR-0021 — Executive Interaction Processing

**Status:** Accepted  
**Date:** 29 July 2026

## Context

The completed Executive Interface Layer publishes an immutable `ExecutiveInteractionContract`.
Applications need a single executable boundary that validates and interprets that contract without
acquiring conversation, reasoning, execution, presentation, or Executive Foundation authority.

## Decision

`ExecutiveInteractionProcessor` consumes exactly one `ExecutiveInteractionContract` and publishes
exactly one immutable `ExecutiveInteractionResult`. It imports no session, operational-state, or
runtime contract and never reconstructs or mutates them. The result references only its source
contract identity and projects bounded summaries rather than source payloads.

The processor validates schema support, content-addressed integrity, deterministic ownership
metadata, constitutional authority fields, interaction constraints, and required references.
Failures are ordered immutable findings and never exceptions, repair, or recovery.

Readiness is deterministic: any finding produces `UNAVAILABLE`; valid `OBSERVATION` and `IDLE`
contracts produce `READ_ONLY`; valid `EXECUTIVE` and `SPECIALIST` contracts produce `READY`. These
rules grant no execution authority. The result ID is SHA-256 over the exact canonical result body.

## Processing boundary and ownership

The processor owns only validation, readiness, deterministic summary projection, and publication of
the result. It does not own prompts, conversation, memory, reasoning, routing, planning, execution,
UI, browser or connector state, specialist output, or any earlier publication.

Future processors may introduce explicitly versioned validation or result schemas while retaining
the one-contract/one-result boundary. Future chat, voice, dashboards, automation, APIs and executive
applications consume `ExecutiveInteractionResult`, not `ExecutiveInteractionContract` directly.

## Consequences

- Invalid and unsupported contracts remain observable without throwing.
- Replay and result identity are independent of clocks, randomness, external systems, and inference.
- The Executive Foundation and its ownership chain remain unchanged.
- Applications receive readiness and summaries without direct access to foundation contracts.
