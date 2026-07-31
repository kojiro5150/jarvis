# Sprint 3.67 — Governed DAWNWATCH Integration

## Status

**Integration**

This sprint integrates the Governed DAWNWATCH Briefing Presentation into the production execution path.

It introduces explicit governed presentation selection while preserving the legacy implementation as the production default.

This sprint is an integration sprint.

It is **not**:

- a governance sprint;
- a presentation-implementation sprint;
- an evaluation sprint;
- an operator-verification sprint;
- a promotion sprint.

---

# Architectural Context

This sprint shall be executed in accordance with the repository constitutional hierarchy.

Authority order:

1. Engineering Constitution
2. North Star
3. Constitutional Publication Principles
4. Accepted Architecture Decision Records
5. Existing Responsibility Statements
6. Operational Communication Responsibility Statement
7. Sprint 3.64 Governed DAWNWATCH Briefing Presentation Contract
8. Sprint 3.65 Governed DAWNWATCH Briefing Implementation
9. Sprint 3.66 DAWNWATCH Parallel Evaluation
10. Sprint 3.61 Governed Dashboard Integration
11. This Sprint Specification

Sprint 3.67 integrates behaviour that has already been governed, implemented in isolation, and evaluated.

It shall not reinterpret governance, reimplement presentation semantics, or alter evaluation classifications.

---

# Repository Precondition

Before beginning implementation:

1. Confirm the repository is checked out from the intended branch.
2. Confirm the following artefacts exist within the checked-out repository snapshot:

```text
docs/SPRINT-3.65-GOVERNED-DAWNWATCH-BRIEFING-IMPLEMENTATION.md
lib/dawnwatch-presentation.ts
lib/dawnwatch-presentation.test.ts
lib/dawnwatch-parallel-evaluation.ts
lib/dawnwatch-parallel-evaluation.test.ts
app/api/dawnwatch/evaluation/route.ts
```

3. Read the following files completely before modifying any code:

```text
docs/SPRINT-3.61-GOVERNED-DASHBOARD-INTEGRATION.md
lib/dashboard-presentation-selection.ts
lib/dawnwatch-presentation.ts
lib/briefing.ts
components/dashboard/ConversationDock.tsx
```

4. Confirm the actual production call path for the DAWNWATCH opening brief before making integration changes.
5. Re-read Sprint 3.63's audit if any part of the traced call path remains unclear.

If any required artefact is unavailable:

- do not reconstruct it from memory;
- do not infer missing implementation;
- do not proceed with integration.

Instead return:

> **Integration Incomplete — Required Artefacts Unavailable**

---

# Objective

Integrate the Governed DAWNWATCH Briefing Presentation into the production opening-brief path using a dedicated runtime selector.

The integration shall:

- preserve the legacy path as the default;
- keep both legacy and governed paths executable;
- adapt the governed structured presentation for the existing rendering surface;
- introduce no new briefing semantics;
- make no promotion decision.

---

# Constitutional Principle

Integration connects governed behaviour to a production path.

Integration does not promote that behaviour to the default.

Therefore:

```text
Governed Contract
        ↓
Isolated Implementation
        ↓
Parallel Evaluation
        ↓
LEGACY-default Integration
        ↓
Operator Verification
        ↓
Promotion Decision
```

---

# Scope

Sprint 3.67 shall:

- introduce an independent DAWNWATCH presentation-mode selector;
- preserve LEGACY as the default mode;
- fail explicitly for invalid selector values;
- introduce a narrow presentation adapter for the governed output;
- wire both legacy and governed paths into the verified production call path;
- modify the DAWNWATCH-consuming UI boundary to accept a discriminated presentation input;
- add selector, adapter, and integration tests;
- produce isolated-sandbox verification evidence only.

Sprint 3.67 shall not:

- conduct new governance;
- modify the Sprint 3.64 contract;
- modify governed DAWNWATCH presentation semantics;
- modify the parallel-evaluation comparator;
- change the production default;
- promote governed DAWNWATCH;
- remove the legacy path;
- introduce a new API or evaluation endpoint;
- add comparison logic;
- add new briefing capabilities.

---

# Presentation Selector

Introduce a new independent runtime selector:

```text
DAWNWATCH_PRESENTATION_MODE
```

This selector is separate from:

```text
DASHBOARD_PRESENTATION_MODE
```

The two selectors govern different presentation capabilities.

They shall not:

- share state;
- reuse one another's environment variable;
- be coupled in control flow;
- imply that selecting one capability selects the other.

A deployment may therefore run any deliberate combination of:

- legacy Dashboard and legacy DAWNWATCH;
- governed Dashboard and legacy DAWNWATCH;
- legacy Dashboard and governed DAWNWATCH;
- governed Dashboard and governed DAWNWATCH.

---

# Selector Semantics

The DAWNWATCH selector shall use the same strict semantics established for Dashboard in Sprint 3.61.

| Input value | Result |
|---|---|
| missing | `LEGACY` |
| empty or whitespace-only | `LEGACY` |
| `LEGACY` | `LEGACY` |
| `GOVERNED` | `GOVERNED` |
| any other value | explicit configuration error |

Invalid values shall never silently fall back to `LEGACY` or `GOVERNED`.

The error shall identify `DAWNWATCH_PRESENTATION_MODE` and the accepted values.

Selector behaviour shall be deterministic and independently testable.

---

# Default and Promotion Boundary

`LEGACY` remains the default in Sprint 3.67.

Missing or empty configuration shall preserve the existing production behaviour.

This sprint authorises no:

- default change;
- promotion;
- legacy-path deletion;
- operator-runtime claim.

`GOVERNED` shall execute only when explicitly selected through valid runtime configuration.

---

# Verified Production Call Path

Sprint 3.63 traced the current opening-brief path and identified a materially different integration shape from Dashboard.

The DAWNWATCH opening brief is composed client-side inside:

```text
components/dashboard/ConversationDock.tsx
```

The component currently invokes:

```text
getOpeningBrief(agent.id, operationalState)
```

on each render.

`getOpeningBrief` selects the legacy `dawnwatchBrief` branch when `agent.id === "dawnwatch"`.

The integration shall verify this call path against the current repository before changing it, but shall not disregard the traced path without concrete repository evidence that it has changed.

The completion report shall record the verified call chain and the files modified at each integration boundary.

---

# Client Integration Path

`ConversationDock` is a client component.

The DAWNWATCH selector therefore shall not be implemented as a direct server-only `process.env` read inside browser-executed code.

Before implementation, determine the repository-consistent boundary at which `DAWNWATCH_PRESENTATION_MODE` can be read safely and supplied to `ConversationDock` or its caller.

The preferred pattern is to mirror the existing Dashboard configuration boundary where practical:

1. resolve and validate the environment value in server-executed code;
2. pass the resulting discriminant through typed props to the client-side rendering path;
3. keep browser code independent of private runtime-environment access.

The implementation may use the nearest existing server-rendered parent or equivalent repository-established configuration boundary, but it shall document the chosen path.

The implementation shall not:

- expose private environment configuration to arbitrary browser code;
- read `process.env.DAWNWATCH_PRESENTATION_MODE` directly from `ConversationDock`;
- introduce a public `NEXT_PUBLIC_` variable solely to avoid the server/client boundary;
- silently default in the client after the server has received an invalid value.

An invalid value must fail explicitly at the configuration boundary before governed or legacy rendering is selected.

---

# Integration Behaviour

When the resolved mode is:

```text
LEGACY
```

DAWNWATCH shall continue to render the existing output produced through the legacy `dawnwatchBrief` path.

When the resolved mode is:

```text
GOVERNED
```

DAWNWATCH shall render output derived from:

```text
lib/dawnwatch-presentation.ts
```

Both paths shall remain executable and covered by tests.

The selector shall choose the path.

The adapter shall adapt the governed result.

The UI shall render the discriminated result.

These responsibilities shall remain separate.

---

# Presentation Adapter

Because the two implementations do not expose the same shape, Sprint 3.67 shall introduce a distinct presentation adapter.

The legacy implementation returns a prose string.

The governed implementation returns structured semantic fields, governed availability statuses, section statuses, evidence statements, capabilities, and a governed voice rendering.

The adapter shall translate the governed presentation into the typed input required by the existing UI boundary without changing its semantics.

The adapter is responsible only for:

- accepting the governed presentation result;
- preserving its explicit semantic and availability statuses;
- exposing the governed voice and any explicitly rendered status metadata through a discriminated presentation type;
- producing a stable input for the DAWNWATCH rendering component.

The adapter shall not:

- perform selector resolution;
- reconstruct legacy urgency, priority rank, due-date, communication-attention, calendar-name, or temporal-window behaviour;
- convert Deferred or Rejected capabilities into supported claims;
- suppress `pending_governance` or `rejected_by_governance` statuses;
- add facts not present in the governed presentation;
- modify `lib/dawnwatch-presentation.ts`.

---

# Discriminated Presentation Input

The production rendering boundary shall accept an explicit discriminated presentation shape equivalent in discipline to Sprint 3.61's `LEGACY | GOVERNED` treatment.

The exact type names may follow repository conventions, but the discriminant shall distinguish at minimum:

```text
LEGACY
GOVERNED
```

The legacy branch shall carry the existing prose output.

The governed branch shall carry the adapted governed presentation required by the UI, including its governed voice and any explicit status metadata the component renders.

The UI shall not infer the mode from field presence, null values, string content, or runtime heuristics.

---

# Rendering Integration

The expected production consumer is:

```text
components/dashboard/ConversationDock.tsx
```

or the equivalent component identified by the verified call path if the repository has changed.

The component shall be updated to accept or receive the discriminated DAWNWATCH presentation input while preserving all non-DAWNWATCH agent behaviour.

The integration shall ensure:

- JARVIS and all other specialist opening briefs remain unchanged;
- the DAWNWATCH legacy branch renders as it does before this sprint;
- the governed branch renders from the Sprint 3.65 presentation result;
- explicit unsupported and evidence statuses are not converted into invented prose claims;
- message history, user input, and assistant-message rendering remain outside this sprint's semantic scope.

The governed rendering may use the existing governed `voice` field as the primary prose surface, supplemented only by status metadata already present in the governed result.

It shall not create a second independent voice implementation inside the component.

---

# Governed Input Bridge

If the current production `OperationalState` must be bridged into the application-facing input expected by `buildDawnwatchPresentation`, that bridge shall remain presentation-boundary-only.

It shall:

- map only fields authorised by Sprint 3.64 and accepted by `DawnwatchPresentationInput`;
- preserve canonical identifiers and provenance where available;
- supply explicit reference time, timezone, locale, and source scope;
- preserve evidence insufficiency where required information is unavailable.

It shall not:

- modify `OperationalState`;
- publish a new canonical state model;
- infer missing provenance;
- reconstruct Deferred or Rejected fields from legacy state;
- use unread, importance, source-label, rank, due-text, or single-calendar-index heuristics as governed facts;
- compute the Tomorrow Afternoon interval-overlap rule.

Where current production state cannot satisfy governed evidence requirements, the governed presentation shall honestly produce its governed unavailable or insufficient-coverage status.

---

# Tomorrow Afternoon Boundary

Sprint 3.64 Deferred the Tomorrow Afternoon interval-overlap rule.

Sprint 3.65 implemented that capability as unsupported pending governance.

Sprint 3.67 shall preserve that result through selection, adaptation, and rendering.

It shall not compute:

```text
commitmentStart < afternoonEnd
AND
commitmentEnd > afternoonStart
```

It shall not use legacy `state.calendar[0]` behaviour as a substitute.

The governed path shall remain capable of displaying an explicit unsupported or pending-governance result where that capability is represented.

---

# Existing Behaviour

Sprint 3.67 changes only:

- mode selection;
- production-path wiring;
- governed input bridging where required;
- presentation adaptation;
- discriminated rendering.

Legacy presentation semantics shall remain unchanged.

Governed presentation semantics shall remain unchanged.

Parallel-evaluation semantics shall remain unchanged.

---

# Execution Boundary

Sprint 3.67 executes within an isolated repository and sandbox environment.

It can verify:

- source structure;
- selector behaviour;
- adapter behaviour;
- integration tests;
- repository tests;
- lint;
- type checking;
- build behaviour where included in the repository validation suite.

It cannot verify:

- the operator's actual running JARVIS instance;
- the operator's real environment-variable configuration;
- deployment-specific server/client propagation;
- external hosting behaviour;
- production user experience.

The sprint shall not claim that governed DAWNWATCH has been promoted or verified in the operator's runtime.

The strongest permitted successful recommendation is:

```text
Ready for Operator Verification
```

The sprint shall never return:

```text
Promotion Complete
```

---

# Explicit Constraints

Sprint 3.67 shall not modify:

- any governance document other than creating this sprint specification;
- `lib/dawnwatch-presentation.ts`;
- `lib/dawnwatch-presentation.test.ts`;
- `lib/dawnwatch-parallel-evaluation.ts`;
- `lib/dawnwatch-parallel-evaluation.test.ts`;
- the DAWNWATCH evaluation endpoint;
- `OperationalCommunication`;
- `OperationalState`;
- `ExecutiveStateSnapshot`;
- any responsibility statement;
- any ADR.

It shall not:

- change `DASHBOARD_PRESENTATION_MODE` semantics;
- couple the two presentation selectors;
- implement a selector, comparison harness, or evaluation endpoint beyond the integration requirements stated here;
- alter the Sprint 3.65 status vocabulary;
- silently reconstruct legacy exclusions as governed data.

---

# Authoritative Output Paths

The selector shall be created at:

```text
lib/dawnwatch-presentation-selection.ts
```

The adapter shall be created at:

```text
lib/dawnwatch-presentation-adapter.ts
```

Tests shall be created at explicit repository-consistent paths, expected to include:

```text
lib/dawnwatch-presentation-selection.test.ts
lib/dawnwatch-presentation-adapter.test.ts
```

Integration modifications shall be limited to the verified production call path.

The expected UI integration target is:

```text
components/dashboard/ConversationDock.tsx
```

and the nearest existing server-rendered caller or configuration boundary required to supply the validated selector mode.

If the verified path differs, the implementation shall use the actual path and explain the difference in the completion report.

This sprint specification shall exist at:

```text
docs/SPRINT-3.67-GOVERNED-DAWNWATCH-INTEGRATION.md
```

---

# Deliverables

Produce:

- an independent DAWNWATCH presentation selector;
- a governed presentation adapter;
- a typed server-to-client mode propagation path;
- discriminated legacy/governed DAWNWATCH rendering;
- selector tests;
- adapter tests;
- production-path integration tests;
- a completion report using the required return format.

---

# Success Criteria

Sprint 3.67 is complete when:

- `DAWNWATCH_PRESENTATION_MODE` exists independently of the Dashboard selector;
- missing and empty values select `LEGACY`;
- explicit `LEGACY` selects the legacy path;
- explicit `GOVERNED` selects the governed path;
- invalid values fail explicitly;
- selector resolution occurs at a valid server/configuration boundary rather than through an unusable client-side environment read;
- the resolved mode reaches the client-side DAWNWATCH rendering path through typed data;
- both legacy and governed paths remain executable;
- the existing legacy path remains the default;
- the governed path renders from `lib/dawnwatch-presentation.ts` through a narrow adapter;
- Deferred and Rejected statuses remain explicit;
- the Tomorrow Afternoon rule remains unsupported pending governance;
- other agents' opening briefs remain unchanged;
- no governed presentation or evaluation logic is modified;
- no promotion claim is made;
- repository validation passes.

---

# Targeted Tests

At minimum, tests shall prove:

## Selector

- `undefined` resolves to `LEGACY`;
- empty string resolves to `LEGACY`;
- whitespace-only string resolves to `LEGACY`;
- `LEGACY` resolves to `LEGACY`;
- `GOVERNED` resolves to `GOVERNED`;
- every other value throws an explicit configuration error.

## Adapter

- governed voice is preserved;
- governed semantic and availability statuses required by the UI are preserved;
- `pending_governance` remains explicit;
- `rejected_by_governance` remains explicit;
- no legacy-only field is reconstructed.

## Integration

- default mode renders the legacy DAWNWATCH brief;
- explicit `LEGACY` renders the legacy DAWNWATCH brief;
- explicit `GOVERNED` renders the governed DAWNWATCH presentation;
- invalid configuration fails before rendering selection;
- non-DAWNWATCH agents continue to use their existing opening briefs;
- the governed path does not mutate `OperationalState`;
- the client component does not directly read the private runtime environment variable.

---

# Validation

Run the complete repository validation suite:

```text
npm test
npm run lint
npm run typecheck
git diff --check
```

Run all targeted selector, adapter, and integration tests.

Additionally confirm:

- `LEGACY` remains the default;
- both DAWNWATCH paths execute in tests;
- invalid configuration produces an explicit error;
- the selector is independent of `DASHBOARD_PRESENTATION_MODE`;
- no direct browser-side `process.env.DAWNWATCH_PRESENTATION_MODE` read was introduced;
- no production path outside the verified integration boundary changed;
- no governance contract changed;
- `lib/dawnwatch-presentation.ts` did not change;
- `lib/dawnwatch-parallel-evaluation.ts` did not change;
- `OperationalCommunication`, `OperationalState`, and `ExecutiveStateSnapshot` did not change;
- no responsibility statement or ADR changed;
- no promotion or default change occurred.

---

# Return Format

Return one completion report containing the following sections.

## Repository State

- branch;
- commit SHA;
- working tree status.

## Preconditions

Confirm the required Sprint 3.65 and Sprint 3.66 artefacts existed and were read before implementation.

## Verified Call Path

Document the actual production call chain for DAWNWATCH from selector resolution through `getOpeningBrief` or its integration replacement to `ConversationDock` rendering.

Identify the server/configuration boundary used to resolve `DAWNWATCH_PRESENTATION_MODE` and explain how the validated mode reaches the client component.

## Selector Behaviour

Confirm:

- missing → `LEGACY`;
- empty → `LEGACY`;
- whitespace-only → `LEGACY`;
- `LEGACY` → `LEGACY`;
- `GOVERNED` → `GOVERNED`;
- invalid → explicit configuration error.

Confirm that the selector is independent of `DASHBOARD_PRESENTATION_MODE`.

## Integration Summary

Summarise:

- selector implementation;
- governed input bridge;
- presentation adapter;
- discriminated rendering input;
- production integration files.

Confirm that legacy remains the default and both paths remain executable.

## Governance Boundary Preservation

Confirm:

- Deferred and Rejected capabilities were not reconstructed;
- the Tomorrow Afternoon interval-overlap rule was not implemented;
- unsupported and evidence statuses remain explicit;
- governed and evaluation module internals were not modified.

## Execution Boundary

State explicitly that verification occurred only in the isolated repository/sandbox.

State explicitly that the operator's real running JARVIS instance and real deployment configuration were not verified.

## Validation

Report the result of:

```text
npm test
npm run lint
npm run typecheck
git diff --check
```

Report all targeted selector, adapter, and integration test results.

## Deliverables

List every file created or modified.

## Recommendation

Return exactly one of:

```text
Ready for Operator Verification
```

or

```text
Integration Incomplete
```

No other recommendation wording is permitted.
