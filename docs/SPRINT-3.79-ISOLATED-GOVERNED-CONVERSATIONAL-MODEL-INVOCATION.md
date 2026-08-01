# Sprint 3.79 — Isolated Governed Conversational Model Invocation

## Status

**Implementation — Isolated Model Boundary**

## Authority and scope

This sprint is governed by the Engineering Constitution, North Star, JESS, Roadmap, Constitutional Publication Principles, accepted ADRs, responsibility statements, and Sprints 3.65, 3.76, 3.77, and 3.78, in that order. Sprint 3.76 remains the governance authority; Sprint 3.77 remains the runtime and validator authority. This implementation does not reinterpret either contract.

The sprint proves, using deterministic local adapters, that model-owned interpretation and optional advice can enter the existing governed envelope without giving the model ownership of evidence, status, provenance, identity, validation, or execution authority. It does not integrate the live route, production prompt, provider, selector, audit persistence, operator verification, or promotion.

## Isolated boundary

`model-request.ts` creates a deterministic, provider-neutral request from `GovernedConversationalInput`. Compatibility data is represented only by non-authoritative boundary labels and excluded-field names; compatibility descriptive values are not supplied as governed facts. History retains its existing classification and `canonicalEvidence: false` marker.

`model-output.ts` accepts exactly one JSON object and applies a closed schema. The only permitted root fields are model-owned `interpretation` and `advisoryNextSteps`. Explicit ownership markers are mandatory. Claim and source references must exist in current governed input. Unknown/system-owned fields, prior-assistant references, invented addresses, status overrides, heuristic laundering, authority language, and snippet-to-full-content claims fail parsing. Advice must be explicitly non-authoritative and use an existing bounded advisory kind.

`model-invocation.ts` injects this adapter contract:

```ts
interface GovernedConversationModelAdapter {
  invoke(request: GovernedModelRequest): Promise<GovernedModelRawResponse>;
}
```

The request can later be translated to the existing `(systemPrompt, messages) => Promise<string>` convention without importing production execution code. No provider SDK, HTTP client, environment variable, audit store, production registry, or live Claude client is used.

## Processing flow

1. Construct the governed request and deterministic instruction.
2. Invoke the injected adapter.
3. Parse one strict structured payload without model repair.
4. Map deterministic input facts, statuses, sources, conflicts, uncertainties, and refusals into the existing Sprint 3.77 envelope; add only parsed model-owned content.
5. Call `validateResponseEnvelope` unchanged.
6. Return the validated envelope, or call the existing `constructSafeEnvelope` after parser, validator, or adapter failure.
7. Call the existing `constructExecutionRecordPayload` and retain the payload in memory only.

Model outcome, parser outcome, and safe adapter metadata are represented as model-execution metadata references in the existing execution-record shape. The implementation performs no persistence and makes no durability claim.

## Deterministic instruction requirements

The instruction requires JSON-only output, governed-fact-only factual claims, immutable statuses, visible uncertainty and conflict boundaries, deterministic/model ownership separation, non-authoritative advice, exclusion of heuristic significance, non-canonical history treatment, snippet/full-content restraint, and bounded-complete negative claims. It uses no current time, locale, timezone, randomness, or provider assumption.

## Validation and fallback

The Sprint 3.77 validator version and API are unchanged and authoritative. A successful adapter call is not sufficient for acceptance. Parser failures use a pending failed validation result; validator failures preserve the validator's exact failures. Adapter failures record that parsing did not run. Every failure path returns the pre-existing safe-envelope construction, omits failed model content, preserves deterministic claim status, and produces an in-memory execution-record payload.

## Verification coverage

Deterministic tests cover request minimisation; history and compatibility boundaries; closed parsing; ownership markers; unknown claims and sources; model-authored facts; prior-assistant misuse; status immutability and overconfidence; heuristic laundering; recommendation authority; snippet scope; accepted, parse-failed, validation-failed, and adapter-failed outcomes; safe-envelope reuse; execution-record construction; Cassie's available address plus unsupported importance; and a local production-call-shape adapter contract.

No network, API key, Claude response object, or external-provider behaviour is required or asserted.

## Deferred and rejected boundaries

This sprint does not implement attachment retrieval, automatic retrieval or search, high-impact recommendation policy, citation UI policy, replacement selection, production prompt or route wiring, a second validation model, audit-store persistence, telemetry, operator verification, or promotion. Real-provider behaviour and production integration remain downstream concerns for the provisional Sprint 3.80 integration stage.
