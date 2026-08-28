# Sprint 3.180a — Capability-neutral typed intent envelope

## Purpose

Implement the first executable seam from the Sprint 3.180 architecture without changing runtime routing or authority.

This sprint removes one architectural coupling: conversational intent is no longer conceptually represented only as Calendar-specific query grammar.

It introduces a closed, capability-neutral intent envelope that may later be produced by a bounded interpreter and mapped into governed capability proposals.

## Nadler burden

> What human cognitive burden are we removing?

The target burden is the need for the user to translate natural intent into a capability-specific machine grammar.

3.180a does not yet remove that burden in production. It creates the typed boundary required to do so safely in 3.180b and later increments.

## Envelope

Closed intent classes:

- `capability_request`
- `ordinary_conversation`
- `unsupported`

Closed capability vocabulary:

- `calendar`
- `gmail`
- `drive`
- `public_information`

Closed operations:

- `read`
- `search`
- `lookup`

Only approved pairs are accepted:

- calendar + read
- gmail + search
- gmail + read
- drive + search
- drive + read
- public_information + lookup

Optional bounded metadata:

- literal `subjectTerms`
- closed temporal constraint
- closed requested-output shape

## Authority isolation

A validated intent candidate is not:

- authority evidence;
- a pending authorization;
- an execution instruction;
- a connector invocation;
- a provider resource identifier;
- private evidence;
- a factual result.

The validator rejects unknown fields. A model cannot smuggle `authority`, `decision`, `providerId`, `resourceId`, execution state, or arbitrary capability names through this envelope.

The North Star therefore remains unchanged:

> **JARVIS may propose authority-requiring operations. JARVIS may never manufacture the authority to perform them.**

## Runtime impact

None in 3.180a.

The existing deterministic Calendar, Gmail, Drive, pending-authorization, and ordinary-conversation paths remain untouched.

This is deliberate.

3.180b may introduce bounded interpretation into this type and prove public/private capability selection. Only after deterministic validation should private candidates be mapped into existing server-owned proposal and authority machinery.

## Acceptance

The validator must:

1. accept only exact closed intent shapes;
2. accept only approved capability-operation pairs;
3. reject unknown fields and enums;
4. reject provider/resource IDs;
5. reject authority/execution fields;
6. bound subject tokens and normalize them without semantic expansion;
7. freeze accepted candidates;
8. have no side effects and invoke no capability.
