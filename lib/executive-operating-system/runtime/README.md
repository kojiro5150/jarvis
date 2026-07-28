# Canonical Executive Operating System runtime

The deterministic runtime owns sequence and trace composition only. Its constitutional tail is:

```text
ExecutiveReasoningRecord
        ↓
GovernedActionProposalSet
        ↓
ExecutiveCapabilityRoutingPlan
```

The proposal engine is the sole owner of bounded recommendations. After it publishes and validates exactly one immutable `GovernedActionProposalSet`, the runtime supplies that publication and the closed deterministic capability registry, scenario, and routing policy to `ExecutiveCapabilityRouter`. The router is the sole owner of the resulting immutable routing plan. The `capability_routing` trace stage records only the proposal-set input identity and routing-plan output identity.

Routing evaluates capability eligibility; it does not reinterpret proposals, approve actions, issue invocation envelopes, select implementations, or execute work. Approval and authority requirements are copied unchanged into each proposal routing while `approvalGranted` remains `false`. The plan also states that invocation and execution have not occurred.

The router depends on the canonical proposal contract, capability registry/matrix contracts, its validation, and deterministic hashing utilities. It cannot inspect state assembly, descriptive context, assessment, deliberation, planning, or reasoning packages. State, context, deliberation, and reasoning lineage is carried through the proposal publication rather than reconstructed.

Typed routing failures distinguish missing or malformed proposal publications, duplicate proposals, missing or inconsistent lineage, invalid registries and matrices, and invalid registered routing policy. A structurally valid plan may contain no eligible capability; this is an eligibility outcome, not a malformed operation.

The canonical runtime ends at routing-plan publication. It contains no caller-authored routing-plan input and performs no invocation, execution, approval processing, presentation integration, or `ExecutiveRunRecord` publication.

## Sprint 3.34 stop boundary

After capability routing, the runtime internally asks the sole
`ExecutiveCapabilityInvocationHandoffBuilder` to publish one deterministic handoff and the sole
`CapabilityInvocationEnvelopePublisher` to publish one immutable envelope. Its final stages are
`capability_routing → capability_invocation_handoff → capability_invocation_envelope`. The caller
cannot author either publication. Blocked and no-invocation outcomes remain explicit, approval and
authority requirements are preserved, and all trace entries assert no invocation and no execution.
The runtime stops at envelope publication and never calls the invoker or resolves an implementation.
