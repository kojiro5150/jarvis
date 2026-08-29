# Governance Core Test Classification

**Status:** Active classification for controlled-collapse work  
**Classified:** 30 August 2026  
**Scope:** Golden Scenario and directly affected Calendar/Gmail/Drive/authority/containment suites. This is a semantic classification of why tests exist, not a claim that every repository test has been enumerated here.

## Classes

### A — invariant / behavioural

These tests assert behaviour or a proof obligation that must survive architectural restructuring. They are standing acceptance gates when the relevant capability is touched.

### B — structural containment

These tests assert the current mechanism used to enforce an invariant: a prompt shape, hash, routing boundary, guard placement, sanitisation path, specialist identity boundary, file/module relationship, or other implementation structure.

A B failure during legitimate restructuring is not automatically a product regression. It must be reviewed, and the underlying invariant must be translated into the new structure before the old test is changed or retired.

### C — historical freeze

These tests or artefacts preserve evidence about a superseded architecture, historical failure, or completed milestone. They are evidence, not an eternal prohibition on changing the mechanism.

## Standing Golden Scenario 001 classification

| Suite / area | Class | What must survive |
| --- | --- | --- |
| `lib/governed-conversation/golden-scenario-calendar-conflict-gate-k.test.ts` | A | Gate K binds the relevant current Calendar observation/evidence and fails closed when the required evidence relationship is absent or divergent. |
| `lib/lighter-jarvis/calendar-conflict-understand.test.ts` | A | Understand remains bounded to its closed semantic output; unsupported/model-expanded claims do not escape the contract. |
| `lib/lighter-jarvis/calendar-conflict-advise.test.ts` | A | Advice remains evidence-bound, non-authoritative, and within the closed supported preference/response contract. |
| `lib/lighter-jarvis/calendar-move-execution.test.ts` | A | ACT-01 through ACT-05: fresh pre-write evidence, divergence refusal, write response not sufficient, independent reread, exact postcondition before completion. |
| relevant GS001 cases in `app/api/lighter/chat/route.test.ts` | A unless explicitly identified below as B | The user-visible Know → Understand → Advise → Act flow preserves authority, evidence binding, fail-closed ambiguity, and truthful completion. |
| prompt/hash/byte-exact assertions whose only purpose is to freeze the current GS001 prompt or module representation | B | Preserve the semantic contract, not the exact bytes, when architecture changes. |
| `docs/GOLDEN-SCENARIO-001-LIVE-PASS.md` and completed milestone freeze artefacts | C | Preserve the historical record that the scenario passed under the recorded architecture; do not treat the old mechanism as mandatory forever. |

**Standing gate:** Any PR touching GS001 routing, authority, evidence, execution, or verification must pass all relevant A tests. B failures require explicit translation review. C artefacts are not merge gates.

## Calendar authority and reference suites

| Suite / area | Class | What must survive |
| --- | --- | --- |
| `lib/lighter-jarvis/calendar-read-authority.test.ts` | A | Calendar private read authority is explicit and operation-scoped; model inference does not create authority. |
| Calendar proposal/reference/authorization replay tests | A | Client-carried references are opaque; server-owned state determines the exact operation; stale/replayed/fabricated references fail closed. |
| Calendar title/phrase parser tests that assert ordinary-language interpretation only | A for semantic matching behaviour; B for exact implementation regex/token tables | Natural phrasing may improve, but deterministic target identity and no false-positive substitution must survive. |
| legacy Calendar-specific fallback wording tests | B unless the wording itself is a safety invariant | Fail-closed unbound-reference behaviour survives; capability-specific wording need not. |

## Gmail authority, retrieval, and ordinal suites

| Suite / area | Class | What must survive |
| --- | --- | --- |
| `lib/lighter-jarvis/gmail-search-authority.test.ts` | A | Search authority remains exact and cannot be widened from a different Gmail operation. |
| `lib/lighter-jarvis/pending-authorization.test.ts` | A | Pending operations remain server-owned; references are opaque; confirmation is raw-user-derived, exact, capability-bound, consumed, and non-replayable. |
| `lib/lighter-jarvis/production-gmail-search.test.ts` | A | Search is bounded; policy controls release; private content not requested by the operation is not leaked; exact authority precedes acquisition where required. Presentation-format-only assertions are B. |
| `lib/lighter-jarvis/gmail-message-list-reference.test.ts` | A | Ordinals bind to the server-owned ordered result set; fabricated/expired/out-of-range references fail closed. |
| `lib/lighter-jarvis/gmail-ordinal-read.test.ts` | A | "first/second/..." selection creates an exact server-owned Gmail read proposal; model output cannot supply/substitute provider identity; read authority remains separate. |
| Gmail metadata connector tests | A for requested field scope and provider-call semantics; B for renderer formatting | Metadata-only retrieval must not silently widen to body/snippet/attachments. |
| historical Gmail containment docs/suites describing the legacy bypass | C for the old mechanism, A for any still-live "no second execution path" invariant test | The bypass history is frozen; the invariant that no independent execution path exists remains live. |

## Drive suites

| Suite / area | Class | What must survive |
| --- | --- | --- |
| Drive search/read authority and proposal tests | A | Exact bounded private acquisition; no model-invented connector access or provider identity. |
| Drive fabrication/truthfulness regression tests | A | JARVIS must not claim Drive evidence or capability that the runtime did not establish. |
| Drive provider-ID/history sanitisation tests | B when they assert the current text-derived sanitisation mechanism; A when they assert the underlying "ordinary model cannot use private provider identity as authority/evidence" behaviour | The invariant must migrate before text-derived containment can be removed. |
| historical Drive containment sprint artefacts | C | Preserve the record of why the containment was introduced. |

## Cross-capability containment suites

| Suite / area | Class | What must survive |
| --- | --- | --- |
| `lib/lighter-jarvis/ordinary-model-reply-guard.test.ts` | Mixed A/B | A: ordinary model cannot manufacture private facts, connector access, authority, provenance, or execution/completion claims. B: exact guard strings, phrase tables, or current placement when a typed boundary can make the same state impossible. |
| `lib/lighter-jarvis/private-capability-handoff-guard.test.ts` | Mixed A/B | A: ambiguous private follow-ups cannot manufacture exact identity or authority. B: the current deny-only classifier and handoff-specific mechanism once a typed proposal/reference boundary replaces it. |
| `lib/lighter-jarvis/model-history-boundary.test.ts` | Mixed A/B | A: private releases/provider IDs cannot become authority-bearing or fabricated ordinary-model evidence. B: recognition of governed state by rendered text and replacement-marker strings. |
| specialist/handoff prompt, roster, hash, byte-exact, or routing-shape tests | B unless they assert a live trust invariant independently of specialist identity | Named specialist/runtime structure may be removed; any authority or private-data invariant it happened to enforce must be translated first. |
| live-pass and historical closure documents | C | Historical evidence remains available without freezing obsolete runtime structure. |

## Mixed-file rule

Large suites such as `app/api/lighter/chat/route.test.ts`, `ordinary-model-reply-guard.test.ts`, and `model-history-boundary.test.ts` contain tests with different purposes. Classification applies to the **individual assertion's proof obligation**, not automatically to every test in the file.

When a restructuring PR makes such a file red:

1. identify the failing test by name;
2. state whether the assertion is A, B, or C and why;
3. if A, fix the implementation or stop the migration;
4. if B, demonstrate where the underlying invariant moved, then translate the test;
5. if C, preserve the historical evidence and remove it from the standing runtime gate only when appropriate.

"Expected because architecture changed" is never sufficient by itself.

## PR #428 precedent

PR #428 is the reference case for why this classification exists. Structural prompt/hash/byte assertions can legitimately fail during a safe architectural restructuring while behavioural invariants remain intact. The correct response is neither "all red means unsafe" nor "structural red can be ignored". The correct response is to classify the assertion, identify its underlying invariant, and consciously translate or retire the structural test.

## Standing acceptance rule

For every controlled-collapse PR:

- all relevant A tests must pass before merge;
- each B failure must have a documented translation or retirement decision tied to its underlying invariant;
- C artefacts are preserved as history and do not independently block a safe new structure;
- new regressions discovered during migration are classified by proof obligation before being normalised into the suite.

This classification is descriptive evidence about the current test estate. It must be revised when implementation work proves that a test was misclassified or reveals a missing invariant.
