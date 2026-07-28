# Governed executive capability invocation

This package is the execution-governance boundary between an already-routable capability and replaceable specialist behaviour. It consumes an immutable routing plan, closed implementation registry, declarative execution policy, executive context, and explicit reference time. It publishes either one deeply immutable `CapabilityInvocationRecord` or one deterministic failure; it never publishes a partial record.

The public `invoke()` pipeline validates inputs, resolves one compatible implementation by explicit policy and structural ordering, validates independent execution authority, constructs a provenance-complete invocation context, calls the implementation-neutral contract once, validates its structural result and deterministic elapsed-time evidence, and atomically publishes the record. Implementations are treated as stateless and receive all execution state through the invocation context.

The package does not route capabilities, interpret specialist output, build prompts, call models or tools, plan, schedule, retry, persist, or orchestrate specialists. `ExecutiveCapabilityInvocationHandoff` is the sole coordination boundary from a canonical aggregate routing publication: it verifies context/state identity, selects an explicitly requested routed member, verifies its routed dependencies, and issues a non-caller-authorable immutable invocation envelope. The invoker continues to own implementation selection and execution-policy enforcement.

The flat `CapabilityRoutingPlan` remains a deprecated, non-canonical source-compatibility type. The canonical runtime no longer accepts a routing plan or invokes this package; it stops after router-owned `ExecutiveCapabilityRoutingPlan` publication. Invocation remains outside Sprint 3.33.
