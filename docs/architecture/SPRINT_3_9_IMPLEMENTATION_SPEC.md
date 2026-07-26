\# Sprint 3.9 Implementation Specification  
\#\# Behavioural Constitutions

\*\*Sprint:\*\* 3.9    
\*\*Status:\*\* Approved    
\*\*Owner:\*\* JARVIS Architecture    
\*\*Implementation Agent:\*\* Codex    
\*\*Related Documents:\*\*  
\- ENGINEERING\_CONSTITUTION.md  
\- NORTH\_STAR.md

\---

\# Purpose

Sprint 3.9 introduces Behavioural Constitutions as first-class architectural objects within JARVIS.

The objective is to move specialist behaviour from prompt engineering toward explicit, structured and versioned behavioural architecture.

This sprint does \*\*not\*\* redesign JARVIS.

It formalises how specialist behaviour is represented.

\---

\# Architectural Context

Sprint 3.8 introduced:

\- BOA instruction framework  
\- instruction registry  
\- prompt assembly  
\- shared instruction loading  
\- execution integration

These capabilities remain.

Sprint 3.9 builds on them.

Behavioural Constitutions become the authoritative description of specialist behaviour.

\---

\# Problem Statement

Current specialist instructions successfully guide model behaviour but remain conceptually prompt-oriented.

The architecture requires a stronger abstraction that:

\- separates behaviour from runtime context  
\- makes behavioural design explicit  
\- supports long-term governance  
\- enables versioned behavioural evolution  
\- prepares for future specialist expansion

Behaviour should become an architectural artefact rather than a collection of prompt fragments.

\---

\# Objectives

Sprint 3.9 shall:

\- introduce Behavioural Constitutions  
\- preserve backwards compatibility  
\- formalise specialist behaviour  
\- improve behavioural consistency  
\- separate constitutional behaviour from execution context  
\- support future constitutional inheritance  
\- maintain deterministic runtime assembly

\---

\# Explicit Non-Goals

Sprint 3.9 does NOT:

\- redesign routing  
\- redesign orchestration  
\- redesign execution  
\- redesign audit  
\- redesign Supabase  
\- redesign APIs  
\- redesign UI  
\- introduce autonomous agents  
\- implement memory  
\- implement planning  
\- implement reflection  
\- change execution behaviour

Behaviour only.

\---

\# Architectural Principles

Implementation shall follow:

\- Engineering Constitution  
\- North Star  
\- Behavioural Orchestration Architecture

Specifically:

\- behaviour before prompts  
\- deterministic engineering  
\- explicit contracts  
\- backwards compatibility  
\- small composable components  
\- specialist collaboration  
\- human authority

\---

\# Behavioural Constitution

A Behavioural Constitution represents the permanent behavioural specification of a specialist.

It is independent of:

\- current task  
\- current conversation  
\- current model  
\- runtime context

The Constitution describes how a specialist behaves rather than what it knows.

\---

\# Required Constitution Schema

Every constitution shall define:

\- metadata  
\- identity  
\- mission  
\- reasoning posture  
\- exists to prevent  
\- behavioural obligations  
\- epistemic discipline  
\- authority boundaries  
\- collaboration rules  
\- escalation rules  
\- executive communication standard  
\- failure modes  
\- output contract

Optional future sections may extend this schema.

No required section may be omitted.

\---

\# Shared Constitutional Layer

Implement a shared constitutional layer containing common behavioural principles including:

\- transparency  
\- uncertainty disclosure  
\- evidence discipline  
\- human authority  
\- executive communication  
\- collaboration expectations  
\- ethical obligations

Specialists inherit these principles automatically.

\---

\# Specialist Constitutions

Implement constitutions for:

\- JARVIS  
\- GECKO  
\- MARCUS  
\- ORACLE  
\- STEVE  
\- HERALD  
\- DAWNWATCH

Each specialist shall define only behaviour unique to that specialist.

Common behaviour belongs in the shared constitutional layer.

\---

\# Runtime Behaviour

Runtime prompt assembly shall become:

Behavioural Constitution

↓

Shared Constitutional Layer

↓

Specialist Constitution

↓

Runtime Context

↓

Conversation

↓

Model

Behavioural Constitutions remain stable.

Runtime context remains dynamic.

\---

\# Registry

Extend the existing registry.

The registry shall:

\- load constitutions  
\- validate required sections  
\- expose typed interfaces  
\- support version metadata  
\- preserve existing APIs wherever practical

\---

\# Backwards Compatibility

Existing instruction loading shall continue functioning.

Migration should minimise breaking changes.

Compatibility adapters are preferred over repository-wide rewrites.

Existing execution paths should remain unchanged.

\---

\# Repository Structure

Introduce constitutional architecture using a structure similar to:

lib/

    agents/

        constitutions/

            constitution.ts

            constitutional-principles.ts

            registry.ts

            shared.ts

            jarvis.ts

            gecko.ts

            marcus.ts

            oracle.ts

            steve.ts

            herald.ts

            dawnwatch.ts

Implementation may vary where repository conventions require.

\---

\# Testing

Add tests covering:

\- constitution validation  
\- registry loading  
\- inheritance  
\- prompt assembly  
\- backwards compatibility  
\- runtime integration

Existing tests must continue passing.

\---

\# Documentation

Update documentation where required.

Behavioural Constitutions should become the documented behavioural architecture of JARVIS.

\---

\# Acceptance Criteria

Sprint 3.9 is complete when:

✓ Behavioural Constitution schema exists.

✓ Shared constitutional layer exists.

✓ Seven specialist constitutions implemented.

✓ Registry supports constitutions.

✓ Runtime prompt assembly preserved.

✓ Existing functionality maintained.

✓ Existing tests pass.

✓ New constitutional tests added.

✓ Documentation updated.

\---

\# Out of Scope

Future sprints may include:

\- constitutional inheritance  
\- adaptive constitutions  
\- reflective reasoning  
\- learning systems  
\- constitutional analytics  
\- constitutional version migration  
\- organisational constitutions

These are intentionally excluded.

\---

\# Engineering Guidance for Codex

Codex should favour:

\- explicit typing  
\- deterministic behaviour  
\- small composable modules  
\- backwards compatibility  
\- repository consistency  
\- minimal architectural disruption

Codex should avoid:

\- repository-wide rewrites  
\- unnecessary renaming  
\- speculative optimisation  
\- behavioural changes beyond this specification

When implementation choices are ambiguous, prefer the option that best aligns with the Engineering Constitution and North Star.

\---

\# Definition of Done

Sprint 3.9 is complete when Behavioural Constitutions become the authoritative behavioural architecture for JARVIS while preserving existing runtime behaviour and maintaining compatibility with Sprint 3.8.  
