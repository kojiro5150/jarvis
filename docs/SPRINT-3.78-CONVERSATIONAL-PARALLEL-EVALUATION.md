# Sprint 3.78 — Conversational Parallel Evaluation

## Status

**Parallel Evaluation — Isolated**

## Purpose and authority

This sprint evaluates the isolated Sprint 3.77 governed conversational runtime against the deterministic information exposure of the legacy context serializer. It is governed by the Engineering Constitution, North Star, JESS, Roadmap, publication principles, accepted ADRs, operational-communication responsibility, and the Sprint 3.75–3.77 audit, contract, and implementation records.

The comparison is intentionally asymmetric:

```text
legacy OperationalState → deterministic prompt-context exposure
governed evidence → deterministic claim status, lineage, restrictions, and validation boundary
```

No model, embedding service, semantic classifier, generated prose, production selector, or external inference service participates. Comparing prompt context to model prose would be nondeterministic and would misrepresent the two paths as equivalent products.

## Evaluation architecture

The implementation separates four responsibilities:

1. `evaluation-fixtures.ts` constructs synthetic, audit-grounded facts and bounded claims. Fixtures contain no expected classification.
2. `reconstructLegacyClaimExposure` invokes the current pure `buildContextBlock` with deterministic synthetic state and extracts only fields actually serialized. It records the absence of source availability, evidence status, provenance, unsupported state, coverage boundary, and content-kind signals.
3. `evaluateConversationalScenario` calls Sprint 3.77's real status and governed-input functions. It does not reproduce their semantic logic.
4. `compareConversationalClaimCoverage` receives only a legacy exposure and governed claim record. It has no scenario ID, title, audit wording, or expected verdict. Claim results aggregate with defect-first deterministic precedence.

Every result carries `SYNTHETIC_CONVERSATIONAL_PARALLEL_EVALUATION_NOT_OPERATIONAL_EVIDENCE`, `productionAuthorityChanged: false`, and `modelInvocationUsed: false`.

## Classification vocabulary

* **Governed Equivalent** — deterministic claim coverage is aligned and no material correction is introduced.
* **Governed Improvement** — legacy fields are exposed without a deterministic boundary while the governed path correctly restricts an insufficient, unavailable, unsupported, or conflicting claim.
* **Preserved Availability** — sufficient evidence remains available with source identity and provenance.
* **Governed Defect** — runtime status conflicts with computed evidence requirements, or required lineage/conflict handling is lost.
* **Legacy Boundary Unmeasurable** — a deterministic comparison would require model inference.
* **Undocumented Evaluation Boundary** — the audit and contract do not govern a material condition.

## Evidence-led corpus

The twelve mandatory scenarios cover: Cassie contact plus importance; subject-only content; snippet-only agreement; ambiguous Alex identity; governed/legacy recipient conflict; unavailable Gmail with compatibility fallback; missing recipient evidence; Gmail importance heuristics; unsupported urgency/actionability; negative absence; prior assistant output; and genuinely sufficient Cassie contact evidence. Each fixture contains its specific Sprint 3.75 operator case or audit finding. The corpus is synthetic and establishes no live Gmail coverage, Claude behaviour, prompt quality, operator usability, integration, or promotion readiness.

## Deterministic findings

The Cassie scenario preserves the contact-address claim as `available` while classifying importance as `unsupported`. Subject-only, snippet-only, ambiguous identity, recipient gaps, negative absence, and prior-assistant assertions remain `insufficient_coverage`; compatibility fallback remains `unavailable`; importance and actionability remain `unsupported`. The sufficient-contact scenario is `Preserved Availability`, demonstrating discrimination rather than blanket restriction.

Comparator mutation tests remove required source lineage from an otherwise available record. The runtime-computed result changes from `Preserved Availability` to `Governed Defect`, proving verdicts are not fixture-name constants. Direct predicate tests also exercise unmeasurable and undocumented boundaries without introducing unresolved corpus results.

## Isolation and change boundary

This sprint adds only evaluation fixtures, reconstruction/comparison/reporting logic, tests, and this publication. It does not modify `/api/chat`, `lib/context-builder.ts`, Sprint 3.77 core modules, prompt assembly, model invocation, OperationalState, Gmail evidence, production UI, selectors, or current conversational behaviour. There is no endpoint because the module and tests provide complete evidence without enlarging an application surface.

## Conclusion

The harness deterministically evaluates claim exposure rather than generated wording. Its evidence supports later integration consideration only; it performs no integration, operator verification, or promotion.

**Evaluation Complete**
