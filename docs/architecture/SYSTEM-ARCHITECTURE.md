# JARVIS System Architecture

## Purpose

JARVIS is a personal AI operating environment that coordinates specialised capabilities across situational awareness, research, communication, engineering, collaboration, reflection and governance reasoning.

It is not designed as a single all-purpose persona. Its architecture separates orchestration from bounded specialist work.

## Current system layers

### 1. Interface layer

The Next.js application under `app/` and `components/` provides:

- the command interface;
- specialist selection and display;
- conversation presentation;
- operational status and briefing surfaces;
- memory editing;
- microphone capture and other interaction utilities.

### 2. API layer

Routes under `app/api/` currently expose:

- chat execution;
- Google OAuth start, callback and disconnect operations;
- memory access;
- operational picture access;
- operational state access.

API routes must remain thin. Domain behaviour should live in `lib/` modules rather than accumulating inside route handlers.

### 3. Orchestration and specialist layer

Specialists are defined under `lib/agents/` and registered through `lib/agents/index.ts`.

The architecture distinguishes:

- **Executive agents:** JARVIS and DAWNWATCH. These maintain situational awareness and coordinate work.
- **Specialist agents:** ORACLE, GECKO, HERALD, STEVE, CO-WORK, MARCUS and PHDSS. These operate within bounded functions.

JARVIS should select, frame and hand off work. It should not silently absorb every specialist function into its own prompt.

### 4. Context layer

`lib/context-builder.ts` constructs the relevant view of shared operational state for each agent.

The governing principle is:

> There is one operational state, but each specialist receives an explicit, purpose-appropriate view of it.

Context selection should be deterministic and inspectable. Specialists should not receive all available personal information by default.

### 5. Operational-state layer

`lib/operational-state.ts` and related hooks/routes represent the current structured state of the system.

This state should become the canonical source for active priorities, projects, commitments, signals and system status. Presentation components should consume this state rather than independently infer it.

### 6. Memory layer

`lib/memory/` provides the schema, seed data and local storage behaviour for persistent user context.

Memory is distinct from operational state:

- **Memory** contains durable user context and preferences.
- **Operational state** contains current work, priorities and changing conditions.

Local memory data is runtime state and must not be committed to Git.

### 7. Connector layer

`lib/connectors/` provides provider-neutral connector interfaces and Google-specific implementations for Gmail, Calendar and Drive.

Connector code should:

- isolate vendor-specific behaviour;
- return normalised domain types;
- handle authentication failures explicitly;
- avoid embedding presentation logic;
- require explicit authority before external write actions are introduced.

### 8. Model-access layer

`lib/claude.ts` currently encapsulates model access.

The application should depend on an internal model interface rather than spread provider-specific calls across components or routes. This preserves the option to introduce model selection, evaluation and fallback behaviour later.

## Core runtime flow

1. The user enters a request through the interface.
2. JARVIS or the selected specialist is resolved through the agent registry.
3. The context builder creates that agent's permitted view of memory and operational state.
4. The chat API assembles the system prompt, context and conversation.
5. The model produces a response.
6. The interface presents the response and relevant status information.
7. Future governed hand-offs or actions must be represented explicitly rather than hidden inside prose.

## Architectural boundaries

### JARVIS

Responsible for:

- interpreting user intent;
- maintaining the overall operational picture;
- choosing whether specialist help is required;
- framing hand-offs;
- synthesising outputs when more than one specialist contributes.

Not responsible for:

- pretending to possess every specialist's expertise;
- taking consequential external action without authority;
- replacing PHDSS governance reasoning;
- concealing uncertainty or routing decisions.

### Specialists

Responsible for:

- performing work within a declared domain;
- using only the context required for that domain;
- identifying uncertainty and missing information;
- returning results in a form JARVIS or the user can act on.

Not responsible for:

- silently expanding their own mandate;
- modifying shared state without an explicit contract;
- taking external actions merely because a connector exists.

## Near-term target architecture

Sprint 2 should move towards:

- typed routing decisions;
- explicit hand-off envelopes;
- a registry-driven specialist capability model;
- structured action proposals separated from model prose;
- audit events for routing, context selection and action approval;
- provider-neutral model invocation;
- tests around context isolation and orchestration behaviour.

## Non-functional requirements

JARVIS should be:

- **Legible:** a developer can identify where behaviour belongs.
- **Bounded:** specialists and connectors have explicit authority limits.
- **Testable:** routing, context construction and data normalisation can be tested without the UI.
- **Recoverable:** `main` remains a deployable baseline and changes are reviewable.
- **Private by default:** secrets, OAuth tokens, memory and runtime state are never stored in the repository.
- **Human-governed:** consequential decisions and external actions remain subject to explicit human authority.
