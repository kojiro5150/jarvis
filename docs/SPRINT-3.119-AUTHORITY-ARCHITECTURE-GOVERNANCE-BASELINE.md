# Sprint 3.119 — Authority Architecture Governance Baseline

- **Status:** Documentation sprint
- **Date:** 25 August 2026
- **Owner:** JARVIS Architecture
- **Scope:** Governance baseline only; no runtime code changes

## Objective

Establish a clean, accurate repository governance baseline for the frozen JARVIS North Star & Authority Architecture v0.1 before further authority-runtime implementation.

This sprint does not change production behaviour. It records what is constitutionally required, what is already implemented, what remains legacy behaviour, and how future sprints must document architectural change.

## Governing principle

> **JARVIS may propose authority-requiring operations. JARVIS may never manufacture the authority to perform them.**

The documentation created by this sprint must preserve the distinction between:

- verified current implementation;
- frozen target architecture;
- historical architecture;
- migration status;
- unresolved future work.

## Repository evidence verified before documentation

The following load-bearing claims were rechecked on current `main` before this sprint was written.

### 1. Legacy `OperationalState` still performs eager multi-source acquisition

`lib/operational-state.ts` currently builds state using:

```text
Promise.all([
  readMemory(),
  loadCalendar(),
  loadGmail(),
  loadDrive()
])
```

The Calendar, Gmail and Drive loaders may invoke connector content reads and may fall back to local data.

**Classification:** current verified implementation; migration required.

### 2. Isolated `calendar.read` authority core is implemented on `main`

`lib/lighter-jarvis/calendar-read-authority.ts` currently provides:

- a closed `ProposedOperation` for `calendar.read`;
- raw current-user-utterance evaluation;
- deterministic `ALLOW | ASK | DENY` decision vocabulary;
- immutable explicit-utterance evidence for positive authority;
- `ASK` when authority is not established;
- no connector invocation.

**Classification:** current verified implementation; isolated authority slice complete.

### 3. Governed Calendar acquisition already exists

`lib/governed-conversation/calendar-evidence-acquisition-adapter.ts` already provides `CalendarAcquisitionPort` and `acquireGovernedCalendarEvidence()`.

It refuses non-Google acquisition before invoking `listUpcoming()`, validates bounded acquisition configuration and contains provider failure.

**Classification:** current verified governed acquisition machinery; not yet authority-gated.

### 4. Deterministic governed-conversation recognition already exists

`lib/governed-conversation/claim-boundary-engine.ts` implements bounded deterministic recognition, typed intent handling, clarification and unsupported outcomes without a model classifier.

**Classification:** reusable architectural precedent; not operation-level authority.

### 5. Gmail content resource policy already exists

`lib/content-retrieval-policy` contains deterministic processing decisions including permitted, restricted and prohibited outcomes, with governed Gmail retrieval tests demonstrating policy-before-retrieval behaviour.

**Classification:** mature resource-policy machinery; not positive user authority.

### 6. Historical constitutional documents contain earlier assumptions

The active Engineering Constitution and accepted ADRs include the historical specialist/orchestrator model and earlier runtime assumptions. Those documents remain evidence of the architecture at the time they were accepted.

**Classification:** historical governance; preserved, with explicit supersession where the new North Star conflicts.

## Artefacts created

### North Star

`docs/architecture/JARVIS-NORTH-STAR-AUTHORITY-ARCHITECTURE-v0.1.md`

Purpose:

- freeze the one-JARVIS product direction;
- define propose/adjudicate/execute separation;
- define admissible authority evidence classes;
- define authority non-transitivity;
- define `ALLOW | ASK | DENY`;
- define authority-before-acquisition;
- preserve voice equivalence;
- establish canonical adversarial cases;
- identify current implementation and incomplete migration without presenting future state as live.

### ADR-0025

`docs/architecture/ADR-0025-operation-level-authority-before-acquisition.md`

Purpose:

- record why operation-level authority must precede private acquisition;
- state the migration decision;
- preserve the distinction between user authority, resource policy, capability availability and execution;
- prohibit putting a single broad authority decision in front of legacy `buildOperationalState()`;
- require reuse of the existing governed Calendar acquisition seam;
- define the staged migration sequence.

### Migration status

`docs/AUTHORITY-MIGRATION-STATUS.md`

Purpose:

- provide a living, inspectable matrix of implemented, partial, missing and legacy-conflicting behaviour;
- prevent isolated machinery from being mistaken for production integration;
- make future sprint completion visible.

## PR1 implementation record

The first authority implementation slice was merged in PR #250, **Add explicit `calendar.read` authority core**.

### Scope delivered

```text
ProposedOperation(calendar.read)
        +
raw current user utterance
        ↓
deterministic authority adjudication
        ↓
ALLOW + immutable explicit-utterance evidence
or
ASK + no authority evidence
```

### Canonical cases preserved

```text
"What's on my calendar tomorrow?"
+ proposed calendar.read
→ ALLOW

"How does tomorrow look?"
+ proposed calendar.read
→ ASK

prior Calendar context
+ current "What should I do?"
+ proposed calendar.read
→ ASK
```

Negated Calendar reads and mixed read/write wording also fail closed to `ASK`.

### Explicit non-scope

PR #250 did not:

- invoke Calendar connectors;
- gate governed Calendar acquisition;
- introduce `PendingAuthorization`;
- create named or standing grants;
- alter Gmail, Drive or Memory authority;
- change `buildOperationalState()`;
- change production conversational routing;
- remove named-specialist UX.

## Governance decision for future work

From this sprint onward:

> **An architectural sprint is not complete until code, tests and governing documentation agree.**

Documentation is part of the implementation contract, not optional cleanup.

A sprint affecting authority, evidence, acquisition, state ownership, capability execution or architectural identity must update the relevant documentation in the same PR or in an explicitly paired documentation PR.

## Historical-document rule

Historical sprint specifications, audits and ADRs must not be silently rewritten to match current architecture.

If a new accepted decision changes the governing architecture:

1. preserve the historical document;
2. record the new decision in the appropriate higher-level architecture or ADR;
3. state supersession explicitly;
4. update the living migration/status record.

This preserves provenance and makes architectural evolution auditable.

## Next sprint dependency

The next authority implementation sprint is bounded:

**Authority-gated governed Calendar acquisition.**

It must reuse the existing `CalendarAcquisitionPort` / `acquireGovernedCalendarEvidence()` seam and prove:

```text
ASK or DENY
→ governed Calendar acquisition not invoked
→ CalendarAcquisitionPort.listUpcoming() not called

ALLOW
→ governed Calendar acquisition may run
```

No broader production migration should be smuggled into that proof.

## Completion criteria

This documentation sprint is complete when:

- the North Star exists in the repository;
- ADR-0025 records the migration decision;
- the living migration status clearly distinguishes implemented and incomplete layers;
- PR #250 is accurately recorded without overstating production integration;
- historical documents remain untouched;
- no runtime code changes are included.
