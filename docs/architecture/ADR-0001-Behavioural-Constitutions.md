\# ADR-0001: Behavioural Constitutions

\*\*Status:\*\* Accepted    
\*\*Date:\*\* 2026-07-26    
\*\*Authors:\*\* Governance Engineering Project

\---

\#\# Context

JARVIS coordinates multiple specialist reasoning modules that collaborate to support executive decision-making. Prior to Sprint 3.9, each specialist's behavioural expectations existed primarily as prompt content and implementation conventions.

This made behavioural intent difficult to audit, compare, validate, or evolve independently of runtime code.

Sprint 3.9 introduces Behavioural Constitutions as a formal architectural layer.

\---

\#\# Decision

JARVIS adopts \*\*typed Behavioural Constitutions\*\* as the canonical specification for behavioural identity.

Each specialist defines:

\- mission  
\- responsibilities  
\- authority boundaries  
\- collaboration expectations  
\- output contract  
\- constitutional principles  
\- versioned metadata

All constitutions implement a common TypeScript interface and are validated through a shared registry.

\---

\#\# Why Constitutions Exist

Behaviour should be treated as architecture rather than implementation detail.

A Behavioural Constitution provides a durable, versioned specification describing:

\- what a specialist is responsible for  
\- what it must not do  
\- how it collaborates with other specialists  
\- how it communicates uncertainty  
\- what guarantees it provides to downstream components

This separates behavioural governance from runtime execution.

\---

\#\# Why Runtime Behaviour Was Not Changed

Sprint 3.9 intentionally introduces no runtime behavioural changes.

The objective is to establish architectural foundations before modifying execution logic.

Keeping runtime behaviour unchanged provides:

\- deterministic verification  
\- low implementation risk  
\- straightforward review  
\- clear separation between architectural definition and behavioural evolution

Future sprints may consume constitutions directly.

\---

\#\# Why Constitutions Are Typed

Constitutions are implemented as strongly typed TypeScript objects.

This provides:

\- compile-time validation  
\- structural consistency  
\- discoverability  
\- IDE support  
\- safer refactoring  
\- versioned behavioural contracts

Behaviour therefore becomes part of the codebase's enforceable architecture rather than informal documentation.

\---

\#\# Why Shared Inheritance Exists

Every specialist inherits a shared constitutional layer covering project-wide expectations including:

\- transparency  
\- evidence discipline  
\- uncertainty communication  
\- executive communication  
\- human authority  
\- ethical obligations

This prevents duplication while ensuring all specialists operate from a consistent constitutional baseline.

Specialists extend this shared foundation with domain-specific responsibilities rather than redefining common principles.

\---

\#\# Why CO-WORK and PHDSS Were Excluded

Behavioural Constitutions currently apply only to the core JARVIS specialist architecture.

CO-WORK and PHDSS have distinct architectural responsibilities and behavioural models.

Including them during Sprint 3.9 would have expanded scope and coupled independent systems prematurely.

They may adopt constitutional specifications in future once their behavioural architectures stabilise.

\---

\#\# Why Backward Compatibility Was Preserved

Sprint 3.9 preserves complete runtime compatibility.

Existing execution logic, APIs, prompts, orchestration, and specialist behaviour remain unchanged.

This enables:

\- incremental adoption  
\- independent validation  
\- low deployment risk  
\- stable production behaviour

Future behavioural enhancements can safely build upon the constitutional layer without requiring disruptive architectural changes.

\---

\#\# Consequences

Positive:

\- Behaviour becomes explicit architecture.  
\- Behaviour is versioned and reviewable.  
\- Specialists gain consistent identity.  
\- Future behavioural evolution has a stable foundation.  
\- Governance and engineering documentation remain aligned.

Trade-offs:

\- Introduces additional architectural artefacts.  
\- Future runtime integration requires deliberate design rather than automatic inheritance.

These trade-offs are considered acceptable in exchange for stronger behavioural governance and maintainability.

\---

\#\# Future Work

Potential future extensions include:

\- runtime constitutional enforcement  
\- behavioural compliance validation  
\- constitution-aware orchestration  
\- behavioural testing against constitutional guarantees  
\- constitutional version migration  
\- governance audit tooling  
