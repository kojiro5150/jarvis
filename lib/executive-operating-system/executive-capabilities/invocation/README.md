# Governed executive capability invocation

This package is the execution-governance boundary between an already-routable capability and replaceable specialist behaviour. It consumes an immutable routing plan, closed implementation registry, declarative execution policy, executive context, and explicit reference time. It publishes either one deeply immutable `CapabilityInvocationRecord` or one deterministic failure; it never publishes a partial record.

The public `invoke()` pipeline validates inputs, resolves one compatible implementation by explicit policy and structural ordering, validates independent execution authority, constructs a provenance-complete invocation context, calls the implementation-neutral contract once, validates its structural result and deterministic elapsed-time evidence, and atomically publishes the record. Implementations are treated as stateless and receive all execution state through the invocation context.

The package does not route capabilities, interpret specialist output, build prompts, call models or tools, plan, schedule, retry, persist, or orchestrate specialists. The neutral implementation used by tests is test-only. The EOS integration is additive through `runWithCapabilityInvocation()`; the existing `run()` pipeline, result, stage order, and replay behaviour remain unchanged.
