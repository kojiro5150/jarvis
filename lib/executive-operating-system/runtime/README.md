# Canonical Executive Operating System runtime

The deterministic runtime owns sequence and trace composition only. Its Sprint 3.35 tail is:

```text
ExecutiveCapabilityRoutingPlan
        ↓
ExecutiveCapabilityInvocationHandoff
        ↓
CapabilityInvocationEnvelope
        ↓
ExecutiveCapabilityInvoker
        ↓
CapabilityInvocationRecord
        ↓
CapabilityExecutionResult
```

The runtime presents the publisher-owned envelope directly to the invoker. The invoker—not the
coordinator—is the sole owner of invocation policy, approval and authority enforcement,
closed-registry resolution, controlled dispatch, the immutable invocation record, and assembly of
the immutable execution result. Implementations receive only the bounded request contract and
return implementation-local data; they cannot grant approval or author constitutional records.

Resolution uses `strict-single-eligible-v1`: an explicit authorised implementation identity may
select one eligible registration, otherwise exactly one eligible registration is required. Missing,
disabled, unsupported, or ambiguous registrations produce typed no-execution publications.
Registry order, ambient state, and model judgement never select an implementation.

A blocked invocation still publishes exactly one invocation record and one `not_attempted`
execution result. Execution attempt and side-effect attempt are independent, and a side effect is
confirmed only when a valid implementation return explicitly confirms it. The forward-only invoker
boundary consumes envelope fields plus local policy, registry, and bounded adapter contracts; it
does not reconstruct state, context, deliberation, reasoning, proposals, routing, or handoff.

The runtime stops after `capability_execution`. There is no retry, background work, connector
expansion, browser/chat integration, approval workflow, or `ExecutiveRunRecord`.

- Eligibility ≠ approval.
- Handoff ≠ invocation.
- Envelope ≠ invocation.
- Invocation ≠ successful execution.
- Execution attempt ≠ confirmed side effect.
