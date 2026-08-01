# Sprint 3.71 — DAWNWATCH Re-evaluation

## Status

**Parallel Evaluation**

Sprint 3.71 re-evaluates governed DAWNWATCH after Sprint 3.70 integrated canonical Gmail recipient evidence. It changes evaluation evidence only; it does not change governed semantics, production authority, presentation, Gmail acquisition, or promotion state.

## Authority and roadmap position

Work is governed, in order, by the Engineering Constitution, North Star, JESS, Roadmap, Constitutional Publication Principles, accepted ADRs and responsibility statements, the OperationalCommunication Responsibility Statement, Sprint 3.64, Sprint 3.69, Sprint 3.70, Sprint 3.66, current source and tests, and this specification. Actual runtime comparison overrides fixture labels or historical expectations.

The sequence remains:

```text
3.70 Gmail Recipient Production Integration
  -> 3.71 DAWNWATCH Re-evaluation
  -> 3.72 DAWNWATCH Operator Verification
  -> 3.73 DAWNWATCH Promotion
```

## Objective

Use the existing runtime-computed comparison architecture to determine whether production-shaped Gmail recipient evidence:

1. reaches governed communications `available` when authoritative and complete;
2. remains `insufficient_coverage` or `unavailable` for `unknown`, `not_fetched`, and `not_authorised` evidence;
3. receives an honest classification from the unchanged comparator; and
4. leaves every pre-existing Sprint 3.66 classification unchanged.

## Architectural constraints

`compareDawnwatchRuntime` in `lib/dawnwatch-parallel-evaluation.ts` is the sole classification authority and must remain unchanged. Scenario construction, runtime execution/evidence extraction, and comparison remain separate. Scenarios must not contain verdicts, expected classifications, or shortcuts. Both legacy and governed paths execute, and comparable facts are extracted from their returned values.

This sprint must not modify production DAWNWATCH presentation or selection, Gmail normalization/acquisition/connectors, canonical models, production composition, defaults, governance rules, ADRs, or responsibility statements. It creates no endpoint and promotes nothing.

## Scenario registry

The original scenarios remain:

* `shared-priority-observation`
* `empty-evidence`
* `unavailable-evidence`
* `tomorrow-afternoon`

The evaluation adds:

* `recipient-evidence-available`
* `recipient-evidence-unknown`
* `recipient-evidence-not-fetched`
* `recipient-evidence-not-authorised`

All fixtures are explicit and deterministic. The fixture notice remains:

```text
SYNTHETIC_EVALUATION_ARTEFACT_NOT_AUTHENTICATED_OPERATIONAL_EVIDENCE
```

### Available

The synthetic Gmail acquisition carries a source-qualified message identity, canonical assertion and snapshot identities, connector retrieval and sent times, provenance, and an observed returned `To` header. It passes through the Sprint 3.70 production projection and DAWNWATCH production bridge. The bounded claim is only that at least one asserted recipient value was observed in returned recipient headers; it does not establish completeness, delivery, resolved identity, or absence of hidden recipients.

### Unknown

An available Gmail source carries partial recipient values with malformed or ambiguous coverage represented as `unknown`. Partial values cannot upgrade communications to `available`.

### Not fetched

An available Gmail source explicitly represents message recipient evidence as `not_fetched`. It cannot become successful empty evidence or `available`.

### Not authorised

An available Gmail source explicitly represents recipient-level authority failure as `not_authorised`. It remains distinct from an empty recipient list and yields insufficient coverage; source-level unavailability would instead yield `unavailable`.

## Comparable runtime evidence

Recipient comparisons record only facts obtained after execution: the legacy communication claim, governed communications status and observations, represented recipient state, and Gmail source availability. They contain no authored classification flag. The unchanged comparator assigns `Equivalent`, `Intentional Improvement`, `Defect`, `Unsupported Boundary`, or `Undocumented Failure Mode`.

An `Intentional Improvement` is valid only when produced by that comparator. Its returned governing citation must be reported verbatim. If its existing rule or citation vocabulary is broader than Sprint 3.69 recipient governance, that limitation remains visible and is not repaired in this sprint.

## Regression and mutation requirements

The original four scenarios run without fixture rewrites. Shared priority remains equivalent, empty and unavailable evidence preserve their computed evidence-visibility result, and tomorrow afternoon remains an explicitly cited `Unsupported Boundary` under Sprint 3.64.

A recipient-specific mutation changes only test runtime comparable evidence. The unmutated classification is computed first; removal of recipient comparison visibility must then be detected as `Defect` where the unchanged rules support it. Production code is never mutated.

## Endpoint and version

The existing isolated endpoint, `app/api/dawnwatch/evaluation/route.ts`, consumes the expanded registry. Evaluation output uses `sprint-3.71-v1` and retains `productionAuthorityChanged: false`. The route performs no fixture construction, classification, or production logic and rejects unknown scenarios.

## Validation

Required validation is:

```text
npm test
npm run lint
npm run typecheck
npm run build
git diff --check
```

Targeted coverage includes parallel evaluation, the evaluation endpoint, the production bridge, governed presentation, recipient states, all four new scenarios, and recipient mutation detection. Validation also confirms the comparator body and all prohibited production and governance files remain unchanged.

## Execution boundary

This sprint can establish deterministic repository-level runtime behaviour and comparison. It cannot establish live provider behaviour, operator configuration, authenticated operational evidence, operator-visible usability, or promotion readiness. It is neither Sprint 3.72 operator verification nor Sprint 3.73 promotion.

The strongest successful conclusion is exactly:

```text
Evaluation Complete
```

If implementation or the evaluation harness is unavailable, comparison is untrustworthy, or a blocker prevents completion, the conclusion is exactly:

```text
Evaluation Incomplete
```
