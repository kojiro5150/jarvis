# Sprint 3.35 — Capability invocation and execution composition

## Constitutional sequence and ownership

`CapabilityInvocationEnvelope → ExecutiveCapabilityInvoker → CapabilityInvocationRecord → CapabilityExecutionResult`

The envelope publisher continues to own immutable request publication. The invoker is the sole
invocation authority: it validates the canonical envelope, enforces explicit policy, approval,
authority, autonomous-action and blocker conditions, resolves a registered implementation,
controls dispatch, and publishes the invocation record. Its result assembler validates the adapter
return and publishes the canonical execution result. The runtime only coordinates and traces.

## Policy, registry, and bounded execution

Human approval is never inferred from routing, handoff, envelope publication, or caller behaviour.
Missing approval, insufficient authority, prohibited autonomous execution and unresolved conditions
produce blocked/no-execution publications. No approval workflow is introduced.

The closed registry rejects duplicate identities and malformed descriptors. Resolution policy
`strict-single-eligible-v1` requires exactly one eligible implementation unless authorised policy
names one explicitly. Capability, action, status, execution-class and side-effect filters are
deterministic; registration order, hidden fallback, environment, randomness and model judgement
have no authority.

Implementations receive only invocation/envelope/proposal/capability identities, action class,
bounded request, constraints and explicit reference time. They receive no earlier publications,
prompts, browser state, unrelated connectors, secrets, or runtime internals. No retry occurs.

## Publications, failures, and boundary

Every accepted envelope produces one deeply immutable, deterministically identified invocation
record and one execution result. Valid statuses cover no execution, success, failure, refusal,
partial execution, unsupported execution and implementation unavailability. Malformed or fabricated
envelopes are structural errors; constitutional refusal and resolution remain typed publications.
Malformed returns and exceptions preserve the attempted status and never become success.
`sideEffectAttempted` and `sideEffectConfirmed` are independent.

The invoker imports only the envelope and local policy, registry, adapter and deterministic utility
contracts. Lineage is preserved from envelope fields rather than reconstructed. The runtime stops
after `capability_execution`; it introduces no `ExecutiveRunRecord`, chat/browser integration,
approval workflow, new capability/connector, background work, retry, parallel execution, agent loop,
presentation control, or uncontrolled external effect.

**Eligibility ≠ approval. Handoff ≠ invocation. Envelope ≠ invocation. Invocation ≠ successful
execution. Execution attempt ≠ confirmed side effect.**
