# Sprint 3.80 — Governed Conversational Runtime Integration

**Status:** Integration Incomplete — LEGACY Default  
**Authority:** Sprint 3.76 remains the governance authority; Sprints 3.77 and 3.79
remain the runtime and model-invocation authorities; Sprint 3.78 remains the
evaluation authority.

## Objective

Connect the existing governed conversational runtime to the production
`/api/chat` ordinary-conversation branch behind an independent
`CONVERSATIONAL_RUNTIME_MODE` selector, while retaining `LEGACY` as the
permanent missing/empty configuration fallback and preserving the explicit
capability branch.

Integration is not promotion, operator verification, new governance, automatic
retrieval, model-owned claim routing, or a redesign of the governed core.

## Mandatory production-input gate

Before route integration, every required `GovernedConversationalInput` field
must have a real, source-qualified production origin. In particular, the route
must receive authorised run, session, interface-contract, and projection
identities; governed evidence and availability; an explicit reference time;
non-canonical classified history; and deterministically classified bounded
claims whose evidence statuses are computed by the existing governed rules.

Integration must stop rather than inventing identities, reconstructing
canonical state in `/api/chat`, treating `OperationalState` as authoritative,
adding a conversational relevance selector, using a model to classify claims,
or omitting the governed execution audit.

## Intended selector contract

`selectConversationalRuntimeMode(value)` has the closed result type `LEGACY |
GOVERNED`. Missing, empty, whitespace-only, and exact `LEGACY` select `LEGACY`;
exact `GOVERNED` selects `GOVERNED`; every other value is an explicit
`CONVERSATIONAL_RUNTIME_MODE` configuration error. It is independent from the
Dashboard and DAWNWATCH selectors.

## Intended integration boundaries

The production model adapter is a thin translation from the Sprint 3.79
`GovernedModelRequest` to `callClaude(systemPrompt, messages)`. It does not
calculate status, add context, parse output, validate output, construct an
envelope, persist an audit record, or retry.

The route selects the runtime only. `LEGACY` retains the existing
`buildOperationalState → buildContextBlock → assembleAgentSystemPrompt →
executeAuditedChat → callClaude` chain and `{ reply, agentId }` response.
`GOVERNED`, once the gate is satisfied, constructs the authorised production
input, invokes the unchanged Sprint 3.79 pipeline, fail-closed persists its
enhanced execution record, and returns `{ mode: "GOVERNED", agentId, envelope
}`. Raw model prose is never a governed HTTP response.

## Gate result in the starting repository

The production mapping review failed. The ordinary chat path publishes only
legacy `OperationalState`; it does not receive the canonical executive run,
session, interaction-contract, or governed conversational projection required
by Sprint 3.76. Although canonical EOS types exist elsewhere, connecting them
would require a new publication/integration boundary rather than a narrow field
mapping.

No deterministic live-language classifier maps arbitrary ordinary chat text to
the existing governed claim taxonomy. The Cassie mapping exists only in
synthetic fixtures/evaluation scenarios. Finally, the production execution
audit store accepts the legacy `ExecutionAuditRecord`, not the enhanced
`GovernedExecutionRecordPayload`; storing the latter requires an authorised
persistence contract.

These are explicit stop conditions. Consequently this sprint does not add the
selector or model adapter in isolation, does not modify `/api/chat`, and does
not claim partial integration as success. `LEGACY` remains unchanged and the
explicit capability branch remains unchanged.

## Required unblocking work

1. Publish the canonical run/session/interaction contract and a stable governed
   conversational projection to the ordinary-chat application boundary.
2. Govern and implement deterministic bounded claim routing for supported live
   questions, including ambiguity behaviour, without model preclassification.
3. Authorise a fail-closed production persistence adapter/schema for the
   complete governed execution-record payload.
4. Re-run Sprint 3.80 from a clean baseline, capture route-level byte fixtures,
   implement both modes, and execute the complete required validation suite.

## Recommendation

Integration Incomplete
