# Sprint 3.65 — Governed DAWNWATCH Briefing Implementation

## Status

Implementation

This sprint implements the Governed DAWNWATCH Briefing Presentation Contract established by Sprint 3.64.

Implementation shall be limited to the behaviour explicitly authorised by the governed contract.

This sprint is an implementation sprint.

It is not:

a governance review;
a production integration sprint;
an evaluation sprint;
a comparison-harness sprint.

## Architectural Context

This sprint shall be executed in accordance with the repository constitutional hierarchy.

Authority order:

Engineering Constitution
North Star
Constitutional Publication Principles
Accepted Architecture Decision Records
Existing Responsibility Statements
Operational Communication Responsibility Statement
Sprint 3.64 Governed DAWNWATCH Briefing Presentation Contract
Sprint 3.59 Dashboard Presentation Implementation
This Sprint Specification

Sprint 3.64 is the authoritative implementation contract.

Sprint 3.65 shall not reinterpret governance decisions.

## Repository Precondition

Before beginning implementation:

Confirm the repository is checked out from the intended branch.
Confirm the following document exists within the checked-out repository snapshot:
docs/SPRINT-3.64-GOVERNED-DAWNWATCH-BRIEFING-PRESENTATION-CONTRACT.md
Read the contract completely before implementing any code.
Re-read:
docs/SPRINT-3.59-DASHBOARD-PRESENTATION-IMPLEMENTATION.md
lib/dashboard-presentation.ts
lib/dashboard-parallel-evaluation.ts

with particular attention to the correction introduced by Sprint 3.60.1 requiring runtime-computed behavioural classifications.

If the Sprint 3.64 contract is unavailable:

do not reconstruct it;
do not infer governance decisions;
do not continue implementation.

Instead return:

Implementation Incomplete — Governed Contract Unavailable

## Objective

Implement only the behaviour authorised by Sprint 3.64.

The resulting implementation shall exist as an isolated presentation module suitable for later integration.

No production rendering path shall be modified.

## Constitutional Principle

Governance authorises implementation.

Implementation shall not expand governance.

Therefore:

Capability Audit
        ↓
Governance Review
        ↓
Governed Contract
        ↓
Implementation
        ↓
Integration

## Scope

Sprint 3.65 shall:

implement all Accepted items;
implement all Modified items;
preserve all Deferred decisions;
preserve all Rejected decisions;
implement the governed presentation logic;
create an isolated presentation module.

Sprint 3.65 shall not:

perform governance;
reconsider Sprint 3.64 decisions;
introduce new capabilities;
integrate with production rendering;
construct evaluation tooling;
construct comparison tooling;
introduce selectors;
introduce APIs;
introduce endpoints.

## Pre-Implementation Configuration Review

Before implementation begins, confirm explicit values for any governed parameters whose behaviour is defined but whose concrete values are not fixed within Sprint 3.64.

Unless the governed contract explicitly specifies otherwise, the implementation shall adopt the following defaults:

Parameter | Default
Viewer timezone | Australia/Melbourne
Locale | en-AU
Reference time | Explicit injected reference instant (no hidden clocks)
Evidence sufficiency thresholds | As defined by Sprint 3.64, otherwise use documented deterministic defaults pending future governance

These values shall be documented within the implementation.

Hidden environmental assumptions are prohibited.

## Inputs

Implementation authority comes exclusively from Sprint 3.64.

Only the following governance outcomes shall be implemented:

Accepted
Modified

The following governance outcomes shall not be implemented:

Deferred
Rejected

Deferred items shall remain explicitly unsupported.

Rejected items shall remain unavailable.

## Deferred Behaviour

Deferred functionality shall not be silently reconstructed from legacy behaviour.

Where a Deferred capability is requested, the implementation shall return an explicit governed status.

The presentation module shall expose a fixed status vocabulary representing governed availability.

Status names may be chosen for clarity by the implementer, but shall distinguish at minimum:

supported functionality;
unsupported due to pending governance;
unsupported because governance rejected the capability.

Deferred and Rejected capabilities shall always resolve to an explicit status value from this governed vocabulary.

They shall never be represented by:

null;
undefined;
omitted fields;
inferred behaviour;
implicit fallback behaviour.

## Tomorrow Afternoon Rule

Sprint 3.64 Deferred the semantic definition for:

"Do I have anything tomorrow afternoon?"

Accordingly:

Sprint 3.65 shall not implement interval-overlap evaluation.

It shall not compute:

commitmentStart < afternoonEnd
AND
commitmentEnd > afternoonStart

It shall instead return an explicit governed status indicating that the required governance has not yet authorised this semantic.

This is intentional.

It is not a defect.

## Deterministic Behaviour

Implementation shall remain fully deterministic.

No hidden clocks.

No implicit locale.

No implicit timezone.

No runtime inference beyond the governed contract.

## Output Module

Implementation shall produce one isolated presentation module.

Authoritative output path:

lib/dawnwatch-presentation.ts

The module shall mirror the structural approach used by:

lib/dashboard-presentation.ts

while implementing only the DAWNWATCH contract.

## Production Isolation

Sprint 3.65 shall not modify:

dawnwatchBrief
getOpeningBrief
production rendering
production orchestration
runtime wiring

The implementation shall remain isolated.

Production integration is a later sprint.

## Comparison and Evaluation

Sprint 3.65 shall not create:

comparison harnesses;
behavioural evaluation;
evaluation endpoints;
parallel execution;
production comparisons.

Those capabilities belong to later sprints.

If future comparison logic is introduced, behavioural classifications shall be computed from actual runtime comparison exactly as required by Sprint 3.60.1.

Hardcoded behavioural classifications are prohibited.

## Existing Governance Boundaries

Sprint 3.65 shall not modify:

OperationalState
ExecutiveStateSnapshot
OperationalCommunication
responsibility statements
ADRs
constitutional publications

Previously governed exclusions remain excluded.

## Implementation Constraints

Implementation shall preserve:

deterministic ordering;
deterministic formatting;
explicit provenance;
explicit evidence handling.

Implementation shall not introduce semantic expansion.

## Deliverable

Produce one implementation module:

lib/dawnwatch-presentation.ts

The implementation shall reflect only the Governed DAWNWATCH Briefing Presentation Contract.

## Success Criteria

Sprint 3.65 is complete when:

every Accepted item is implemented;
every Modified item is implemented;
no Deferred item is implemented;
no Rejected item is implemented;
every Deferred or Rejected capability returns an explicit governed status value from the module's status vocabulary;
Tomorrow Afternoon returns an explicit governed unsupported status;
implementation remains isolated;
no production rendering path changes;
no governance artefacts are modified;
the module is ready for future integration.

## Validation

Run the complete repository validation suite:

npm test
npm run lint
npm run typecheck
git diff --check

Additionally:

Run all targeted tests covering the new presentation module.

Confirm:

no production rendering path changed;
no selectors added;
no evaluation harness added;
no comparison harness added;
no endpoint added;
no API added;
no runtime wiring added;
no governance documents modified;
no responsibility statements modified.

## Return Format

Return one completion report containing:

### Repository State

branch
commit SHA
working tree status

### Configuration Review

Document the final implementation parameters:

timezone
locale
reference-time behaviour
evidence sufficiency behaviour

### Governed Implementation Summary

Confirm:

Accepted items implemented
Modified items implemented
Deferred items intentionally unsupported
Rejected items intentionally excluded

Document the implemented governed status vocabulary.

### Deferred Behaviour

Explicitly confirm that:

"Do I have anything tomorrow afternoon?"

returns an explicit governed unsupported status in accordance with Sprint 3.64 and that no interval-overlap computation was implemented.

### Validation

Report the results of:

npm test
npm run lint
npm run typecheck
git diff --check

and all targeted presentation-module tests.

### Deliverables

List every file created or modified.

### Recommendation

Return exactly one of:

Implementation Complete

or

Implementation Incomplete

No other recommendation wording is permitted.
