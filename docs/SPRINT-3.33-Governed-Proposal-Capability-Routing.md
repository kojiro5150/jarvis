# Sprint 3.33 — Governed proposal to capability routing composition

Sprint 3.33 extends the accepted canonical runtime with `ExecutiveReasoningRecord → GovernedActionProposalSet → ExecutiveCapabilityRoutingPlan`.

`DeterministicGovernedActionProposalEngine` exclusively owns bounded recommendations. `ExecutiveCapabilityRouter` exclusively owns eligibility decisions. The runtime coordinator supplies the canonical proposal publication and closed deterministic routing configuration, records the `capability_routing` trace, and does not calculate eligibility itself.

The proposal publication carries state, descriptive-context, deliberation-context, and reasoning identities. The routing plan preserves those identities together with the proposal-set and individual proposal identities. The router never imports or reconstructs earlier publications.

Eligibility results are ordered and deterministically identified. They classify eligible, ineligible, unsupported, constitutionally blocked, and no-match outcomes. Human approval and authority requirements are carried forward unchanged; eligibility never represents consent or authorisation.

This sprint does not issue an invocation envelope, select an implementation, process approval, invoke or execute a capability, publish an execution result, integrate a UI/API/connector, or publish an `ExecutiveRunRecord`.
