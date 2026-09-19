\# JARVIS Engineering Constitution

\*\*Version:\*\* 1.1  
\*\*Status:\*\* Active  
\*\*Owner:\*\* JARVIS Architecture  
\*\*Applies to:\*\* All contributors, coding agents (Codex, Claude Code, future agents), pull requests and architectural changes.  
\*\*Last Updated:\*\* 19 September 2026

\---

\# Active Architecture Amendment — 19 September 2026

The constitutional principles below remain active, but the original specialist-centric coordination language is no longer the current product boundary.

JARVIS is now one persistent user-facing intelligence operating through governed capabilities. Internal specialist or cognitive modules may remain where they provide useful behavioural or domain discipline, but users should not need to know or coordinate those modules, and no internal module carries independent authority.

Accordingly, where the historical sections **Specialists Before Generalists**, **Collaborative Intelligence**, or later specialist-oriented language imply that JARVIS must hand user work to named agents, those passages are superseded by the current North Star and Governance Core. Their enduring intent remains: preserve explicit behavioural boundaries, domain discipline, disagreement, uncertainty and modularity without turning the product into a cast of user-facing personas.

Execution authority is also interpreted under the current governing rule:

\> **JARVIS may propose authority-requiring operations. JARVIS may never manufacture the authority to perform them.**

“Execute delegated actions” therefore means execute only through a capability-specific governed path whose authority has been independently and deterministically established. Prior approval, model inference, remembered preference, connector availability or source content never manufactures that authority.

This amendment preserves the historical body rather than silently rewriting the engineering principles that produced earlier architecture.

\# Purpose

This document defines the engineering principles that govern the evolution of JARVIS.

It is not a product specification.

It is not an implementation guide.

It is the constitutional foundation that every engineering decision, pull request, architectural change and future contributor should be measured against.

JARVIS is intended to become an Executive Operating System that extends human capability through collaborative specialist intelligence.

Every engineering decision should move the system closer to that objective.

\---

\# Constitutional Principle

\> \*\*Every engineering decision should make JARVIS feel less like software and more like an exceptional executive partner.\*\*

If a proposed feature increases complexity without improving executive capability, it should be questioned.

\---

\# What JARVIS Is

JARVIS is:

\- an executive intelligence system  
\- an orchestration architecture  
\- a collaborative reasoning environment  
\- an execution platform  
\- an adaptive cognitive partner

JARVIS is not:

\- another chatbot  
\- a collection of unrelated AI personas  
\- a prompt library  
\- a workflow engine without reasoning  
\- a reasoning engine without execution  
\- a hidden decision-maker  
\- a replacement for human judgement

\---

\# Human Authority

Humans remain the final decision makers.

JARVIS may:

\- recommend  
\- analyse  
\- challenge  
\- explain  
\- prepare  
\- execute delegated actions

JARVIS must never obscure:

\- responsibility  
\- authority  
\- accountability

Execution authority must always remain explicit.

\---

\# Behaviour Before Capability

Capability alone is insufficient.

Predictable behaviour is more valuable than raw intelligence.

Every specialist should be defined primarily by its behavioural constitution rather than by its prompt or model.

Behaviour belongs in explicit constitutional specifications—not scattered prompt fragments.

\---

\# Specialists Before Generalists

JARVIS is an orchestrator.

It is intentionally not the domain expert.

New knowledge should normally be introduced by extending an existing specialist or creating a new specialist rather than expanding JARVIS itself.

The orchestrator coordinates expertise.

It does not replace it.

\---

\# Collaborative Intelligence

The quality of the system emerges from collaboration.

Specialists should:

\- contribute independent reasoning  
\- preserve disagreement where appropriate  
\- expose uncertainty  
\- hand work to better-qualified specialists

The objective is not consensus.

The objective is better judgement.

\---

\# Adaptive Reasoning

Reasoning depth should match task complexity.

Routine tasks should remain lightweight.

Complex decisions should naturally invoke deeper reasoning, broader collaboration and richer synthesis.

Deep reasoning is a scarce resource.

Use it deliberately.

\---

\# Execution Matters

Reasoning that never becomes action creates friction.

Execution without reasoning creates risk.

JARVIS should naturally move between:

Awareness

↓

Reasoning

↓

Execution

without unnecessary user effort.

\---

\# Deterministic Engineering

Prefer deterministic engineering over prompt complexity whenever practical.

Prefer:

\- typed interfaces  
\- explicit contracts  
\- registries  
\- structured metadata  
\- deterministic routing  
\- well-defined APIs  
\- compile-time validation

Avoid encoding architecture inside free-form prompts whenever code can enforce the same behaviour.

\---

\# Behavioural Constitutions

Every specialist should be defined through a Behavioural Constitution.

A Behavioural Constitution specifies:

\- identity  
\- mission  
\- reasoning posture  
\- behavioural obligations  
\- epistemic discipline  
\- authority boundaries  
\- collaboration rules  
\- escalation rules  
\- executive communication standard  
\- failure modes  
\- output contract

Behaviour should be explicit, versioned and reviewable.

\---

\# Architectural Simplicity

Complexity is a cost.

Every architectural change should improve at least one of:

\- clarity  
\- maintainability  
\- modularity  
\- extensibility  
\- behavioural consistency

without unnecessarily degrading another.

Prefer simple systems that compose well over sophisticated systems that require explanation.

\---

\# Loose Coupling

Specialists should remain independent wherever possible.

Avoid:

\- hidden dependencies  
\- implicit behaviour  
\- cross-module assumptions  
\- duplicated logic

Interactions should occur through explicit contracts.

\---

\# Transparency

Important system behaviour should be discoverable.

Architecture should be understandable from the repository.

Major reasoning behaviour should be represented by explicit artefacts rather than hidden implementation details.

Documentation is part of the architecture.

\---

\# Progressive Evolution

Prefer incremental architectural evolution over large rewrites.

Small, reviewable pull requests are preferred.

Backward compatibility should be preserved unless an intentional migration has been approved.

\---

\# Testing

Every architectural change should include appropriate tests.

Critical behaviour should never depend solely on manual verification.

Behavioural changes deserve behavioural tests.

Architectural changes deserve integration tests.

\---

\# Documentation

The architecture is part of the product.

Documentation should evolve with implementation.

When architecture changes, documentation should change in the same pull request.

\---

\# Security

Secrets must never be committed.

Execution authority must be explicit.

External actions should be auditable.

Sensitive operations should favour confirmation over automation.

\---

\# Technical Debt

Technical debt should be acknowledged explicitly.

Temporary solutions should be clearly identified.

Architectural shortcuts should not become permanent through neglect.

\---

\# BOA Alignment

Behavioural Orchestration Architecture provides the behavioural foundation of JARVIS.

BOA exists to provide:

\- behavioural specification  
\- role segregation  
\- epistemic discipline  
\- structured collaboration  
\- adaptive orchestration  
\- transparency

JARVIS implements BOA as executive cognition.

PHDSS implements BOA as institutional governance.

They are sibling systems sharing a common architectural foundation.

\---

\# Engineering Decision Filter

Before implementing any significant change, ask:

1\. Does this improve executive capability?  
2\. Does it reduce cognitive load?  
3\. Does it preserve human authority?  
4\. Does it strengthen behavioural consistency?  
5\. Does it simplify rather than complicate the architecture?  
6\. Could this behaviour be enforced in deterministic code rather than prompts?  
7\. Does it make JARVIS feel more like an exceptional executive partner?

If the answer to most of these questions is "no", reconsider the design.

\---

\# Repository Hierarchy

When documents conflict, the following precedence applies:

1\. Engineering Constitution  
2\. Architectural Decision Records (ADRs)  
3\. Sprint Implementation Specifications  
4\. Source Code Comments  
5\. Pull Request Discussions

Lower-level artefacts must not contradict higher-level architectural decisions.

Where a conflict exists, the higher-level document prevails unless it is formally amended.  
—

\# Constitutional Closing Principle

Technology is not the product.

Reasoning is not the product.

Artificial intelligence is not the product.

The product is a trusted executive partner that helps people think more clearly, decide more confidently and execute more effectively while remaining fully accountable for the decisions they make.

Every commit should move JARVIS one step closer to that goal.  
