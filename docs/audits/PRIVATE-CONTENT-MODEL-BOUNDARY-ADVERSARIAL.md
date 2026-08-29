# Private Content → Model Boundary Adversarial Review

**Status:** Architecture-only review
**Date:** 30 August 2026
**Runtime change authorised:** No

## Question under test

Can JARVIS gain private-content reasoning without allowing deterministic presentation, transcript visibility, prior read authority, or model self-description to substitute for a governed reasoning-exposure decision?

## Cases

| Case | Attack | Required outcome |
| --- | --- | --- |
| Display → reasoning | User authorised and saw an email body, then asks “summarise that” | Prior display alone does not expose body to the model |
| Transcript replay | Client resends visible private body in history | Ordinary model boundary removes it unless active reasoning state separately admits it |
| Prior read authority | Exact Gmail read was authorised last turn | Grant does not become model-exposure authority |
| Model asks for more | Model says it needs body/attachments | Model request has no authority weight |
| Missing field | Body withheld but subject supplied | Body is unavailable, not absent |
| Cross-source inference | Calendar and Gmail independently read | No combined reasoning unless purpose explicitly admits both |
| Persistent context | Bounded reasoning happened on turn A | Turn B gets no automatic private evidence inheritance |
| Provider identity | Visible text contains a resource-like identifier | Transcript/model cannot reconstruct trusted provider identity |
| Derived claim | Model infers urgency from subject/body | Urgency remains derived interpretation, not provider fact |
| Reasoning failure | Model invocation fails | No widening, reacquisition, or alternate authority path |

## Review result

The contract survives these attacks only if four separations remain hard:

1. acquisition ≠ presentation;
2. presentation ≠ model exposure;
3. model exposure ≠ authority;
4. derived interpretation ≠ source fact.

## Implementation prerequisites not yet satisfied

Before implementation the repository still needs a concrete typed design for reasoning purpose, source/field projection, server-owned reasoning exposure state, exposure lifetime, provenance-bearing model input, derived-interpretation typing, cross-source composition policy, and disposal/history semantics.

No implementation should be accepted merely by passing body text into `callModel`, `GovernedContext`, ordinary transcript history, or a specialist prompt.

## Verdict

**PASS AS AN ARCHITECTURE CONTRACT.**

This is not runtime proof and not permission to implement the feature.