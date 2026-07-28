# Canonical Executive Operating System runtime

The deterministic runtime composes each owner-published constitutional artefact once and terminates
with one immutable `ExecutiveRunRecord`. Its completed tail is:

```text
ExecutiveCapabilityRoutingPlan
        ↓
ExecutiveCapabilityInvocationHandoff
        ↓
CapabilityInvocationEnvelope
        ↓
CapabilityInvocationRecord
        ↓
CapabilityExecutionResult
        ↓
ExecutiveRunRecord
```

The run record is the higher-order immutable audit root. It binds replay and runtime identities,
policy and authority evidence, execution evidence, validation, the ordered pre-publication trace,
and references to every constitutional publication. It does not reconstruct, summarise, reinterpret,
or copy those publications, and it never grants approval or performs execution.

`CapabilityExecutionResult` is implementation execution evidence. `ExecutiveRunRecord` is the
constitutional run publication that references that result and the publications preceding it.
Blocked invocation remains an execution publication with explicit authority and blocker evidence;
it is not approval and does not weaken the Authority Invariant.
