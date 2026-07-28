# Sprint 3.34 — Capability routing to invocation handoff composition

## Constitutional runtime boundary

The canonical deterministic runtime now ends at:

```text
GovernedActionProposalSet
        ↓
ExecutiveCapabilityRoutingPlan
        ↓
ExecutiveCapabilityInvocationHandoff
        ↓
CapabilityInvocationEnvelope
```

The `ExecutiveCapabilityRouter` remains the sole owner of capability eligibility. The
`ExecutiveCapabilityInvocationHandoffBuilder` is the sole owner of deterministic route selection
and request preparation. The `CapabilityInvocationEnvelopePublisher` is the sole owner of the
immutable policy-enforcement request. The runtime coordinator only sequences these owners and
records identity continuity; callers cannot submit either publication.

## Selection and human authority

The handoff policy is explicit and versioned. `lexical_first` sorts proposals and eligible
capability identities lexically before selecting one eligible route per proposal.
`require_unambiguous` rejects a proposal with multiple eligible capabilities rather than selecting
implicitly. Ineligible identities are never promoted. Unsupported, deferred, and non-action
proposals produce `no_invocation` items. Constitutional blocks produce `blocked` items, which are
valid publications rather than evidence of invocation authority.

The routing reason, bounded request, constraints, evidence requirements, approval requirement,
authority requirements, boundaries, and unresolved conditions pass through unchanged. Both new
publications state that approval has not been granted, invocation has not occurred, and execution
has not occurred. Handoff publication is not approval; envelope publication is not invocation.

## Identity, failures, and dependencies

Handoff and envelope identities are SHA-256 identities over canonical immutable content. Each
publication preserves its immediately preceding identity and the proposal, state, context,
deliberation, and reasoning lineage carried by routing. Validation rejects missing or malformed
routing/handoff publications, duplicate outcomes, lineage and eligibility mismatches, ambiguous
selection under strict policy, and invalid publication policies with typed errors.

The handoff package imports only capability-routing contracts and local policy/validation code. The
envelope publisher imports only the canonical handoff and local invocation-envelope contracts.
Conformance tests prevent backward access to projection, state, context, attention, situations,
assessment, deliberation, intent, planning, reasoning, connectors, presentation, implementations,
or execution.

## Explicit exclusions

Sprint 3.34 does not evaluate approval, enforce invocation policy, resolve an implementation, call
the invoker, invoke a capability, execute delegated work, contact a connector, publish an
invocation record or execution result, or publish an `ExecutiveRunRecord`. Existing invocation
implementation code remains outside the canonical runtime. Sprint 3.34 adds no UI, API/chat,
briefing, retry, queue, persistence, or external-side-effect integration.
