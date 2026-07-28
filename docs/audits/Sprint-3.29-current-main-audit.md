# Sprint 3.29 audit against the Sprint 3.27 and Sprint 3.28 boundaries

## Scope and verdict

This audit reviews the current `work` branch at `31da395`, whose history contains the
merged Sprint 3.27 context work, Sprint 3.29 invocation work, and the subsequent
capability-routing reconciliation. No remediation is included in this change.

**Verdict: remediation required.** The Sprint 3.29 invocation package is internally
deterministic and its isolated execution-governance behavior is implemented, but it
is not composed with the canonical Sprint 3.28 `ExecutiveCapabilityRoutingPlan` or
the Sprint 3.27 `ExecutiveContextSnapshot`. The only runtime integration exercises a
separately authored invocation-only routing object against the older EOS context
model. Consequently the repository does not currently demonstrate the required
router-to-invoker handoff.

## Current architectural flow

There are two parallel flows rather than one end-to-end flow.

1. **Sprint 3.27/3.28 routing flow:** an `ExecutiveContextSnapshot` from
   `lib/executive-context` is supplied to `ExecutiveCapabilityRouter`. The router
   validates the context contract, registered scenario and registered routing policy,
   evaluates registered capabilities and routing rules, and publishes one aggregate
   `ExecutiveCapabilityRoutingPlan`. The plan contains context/state identities,
   scenario and policy identities, routed capabilities with rule/condition evidence,
   and unresolved capabilities. Nothing in production code consumes this plan.
2. **Sprint 3.29 invocation flow:** a caller independently supplies a flat
   invocation `CapabilityRoutingPlan`, the older
   `lib/executive-operating-system/context` `ExecutiveContext`, an `ExecutionPolicy`,
   an implementation registry, and a reference time. The invoker validates that flat
   plan, checks context identity, checks execution policy, deterministically selects
   one compatible permitted implementation, invokes it once, validates its result,
   and publishes a deterministic invocation record or failure.
3. **EOS integration flow:** `runWithCapabilityInvocation()` first executes the
   existing twelve-stage runtime, which constructs the older EOS `ExecutiveContext`.
   It then passes a caller-supplied flat `CapabilityRoutingPlan` directly to a new
   invoker. It neither runs `ExecutiveCapabilityRouter` nor accepts or adapts an
   `ExecutiveCapabilityRoutingPlan`.

## Contract and ownership findings

### Routing-plan ownership is not coherent

`ExecutiveCapabilityRoutingPlan` is the canonical Sprint 3.28 router publication. It
is an aggregate plan and owns the actual routing decision and evidence. The
invocation package separately declares `CapabilityRoutingPlan`, a single-capability
shape with `routingStatus`, three caller-supplied authority booleans, and dependency
statuses. These fields do not occur in the router publication.

A per-capability invocation envelope could be a coherent derived contract, but no
code identifies it as such and no boundary derives or validates it from the aggregate
plan. In the current implementation it is a second routing authority contract whose
truth is asserted by the invocation caller. Both types are publicly exported from the
same barrel, which makes the split visible without making the relationship explicit.

### No deterministic adapter or handoff exists

There is no adapter, mapper, overload, factory, or coordinator that accepts
`ExecutiveCapabilityRoutingPlan` and produces invocation input. In particular, no
code defines how to:

- select one member of `routedCapabilities` for invocation;
- translate a routed member into `routingStatus` and `authority`;
- translate `dependencyCapabilityIds` into satisfied dependency records;
- preserve `routingRuleIds` and `supportingConditionIds`;
- reject an unresolved capability at the handoff; or
- bind the routing policy identity to the separate execution policy.

The aggregate and flat plan contracts are therefore structurally incompatible, not
merely differently named.

### Invocation does not select a capability, but callers can author routing authority

The invoker does not infer or choose a capability: it uses the supplied flat plan's
`capabilityId`. It does independently and deterministically select an implementation
for that capability, and it correctly evaluates implementation execution authority
through `executionEnabled`, compatibility, status, execution class, preference, and
precedence.

However, invocation validates only that the caller-set `registered`, `eligible`, and
`permitted` flags are all true. It does not verify those claims against the Sprint
3.28 registry, scenario, routing policy, routing rule evidence, or aggregate plan.
Thus any caller that can construct the public flat type can author the routing
authority accepted by invocation. The integration and invocation tests do exactly
that rather than consuming router output. This is duplicate authority at the
composition boundary even though implementation-level execution authority remains
properly separated.

### Routing identity is copied, but canonical routing evidence is lost

For the invocation-only shape, the invoker preserves the supplied routing plan ID,
context ID, state snapshot ID, capability/version, and routing contract version in
the invocation context, provenance, and record. Implementation registry and execution
policy identities are also recorded.

That preservation does not reach canonical Sprint 3.28 evidence. Routed capability
rule IDs, supporting condition IDs, aggregate scenario ID, routing policy ID,
unresolved capability publication, and the exact aggregate plan relationship have no
place in `CapabilityRoutingPlan` or `CapabilityInvocationProvenance`. A caller may
reuse an aggregate plan ID, but the record cannot prove which routed member and which
routing evidence produced the invocation. The invocation contract also accepts any
non-empty routing contract version instead of requiring the exported Sprint 3.28
contract constant.

### Context ownership also mismatches the merged boundary

The Sprint 3.28 router consumes the Sprint 3.27 `ExecutiveContextSnapshot`, whose
state identity is nested under `sourceStateIdentity` and whose contract identity is
in `derivationMetadata`. The invoker and EOS runtime integration instead consume the
older EOS `ExecutiveContext`, which exposes a top-level `snapshotId`. These are
distinct contracts from distinct packages. Therefore passing the exact context used
to produce the canonical routing plan into invocation is not type-correct, and the
runtime cannot currently construct the Sprint 3.28 plan from its own context output.

## Test and replay assessment

The focused suites pass and establish useful local guarantees:

- the router is deterministic and preserves supporting condition IDs;
- the invoker deterministically resolves implementations, enforces its execution
  policy, freezes publications, and replays identical hand-authored inputs;
- the additive runtime path preserves the pre-existing runtime result and trace.

They do not establish composition. Router tests stop at
`ExecutiveCapabilityRoutingPlan`; invocation tests begin with a hand-built
`CapabilityRoutingPlan`; and the runtime integration test also hand-builds the flat
plan after separately running the runtime. There is no integration or replay test
that routes a Sprint 3.27 context and invokes the resulting routed capability, and no
negative test proving that invocation cannot be reached by fabricated routing
authority.

Type checking passes because each parallel flow is internally type-consistent. It
does not demonstrate compatibility between the two different plan and context types.

## Required remediation boundary

Before Sprint 3.29 can be considered integrated, the architecture needs one canonical,
deterministic handoff owned outside the invoker that:

1. consumes the Sprint 3.28 aggregate plan and its exact Sprint 3.27 context;
2. selects only an explicitly routed capability without re-routing or inference;
3. carries the aggregate plan identity and all member routing/dependency evidence;
4. gives the invoker a derived, non-authorable execution input or makes it consume the
   canonical routing publication directly;
5. keeps routing policy and execution policy distinct while binding both identities
   into provenance;
6. integrates that handoff into EOS coordination; and
7. adds end-to-end deterministic success, rejection, evidence-preservation, and replay
   tests.

The internally sound implementation-registry and execution-policy selection behavior
can remain invocation-owned. The invoker must not acquire routing, inference, or
capability-selection authority as part of remediation.
