# Governed executive capability routing

This package is the deterministic boundary between a canonical `ExecutiveContextSnapshot` and potential specialist invocation. `ImmutableExecutiveCapabilityRegistry` validates a closed set of descriptors and module identities, dependencies, incompatibilities, versions, cycles, canonical order, identity, and recursive immutability. It never discovers runtime plugins.

`ExecutiveCapabilityRouter.route()` accepts only stable identifiers and explicit, versioned context, scenario, request, registry, and policy inputs. It records eligibility separately from permission, expands declared dependencies, publishes incompatibilities rather than choosing a winner, orders dependencies before dependants, and returns an immutable success/failure union. Registry and plan identities are SHA-256 hashes of code-unit-key-ordered canonical JSON. No clock, network, provider, model, persistence, filesystem discovery, specialist implementation, or execution is used.

EOS integration is optional and additive: supplying `capabilityRouting` publishes `capabilityRoutingPlan`; omitting it retains the legacy result and canonical stage trace. The plan is evidence of governed candidates, never evidence of execution or action authority. The assessment-driven `context/` package remains unchanged and is not accepted by the router.

Production specialist descriptors, natural-language request resolution, adaptive routing, specialist execution, action authority, handoffs, synthesis, planning, notifications, persistence, and UI are intentionally deferred.
