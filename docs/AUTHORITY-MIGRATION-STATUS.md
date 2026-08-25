# JARVIS Authority Migration Status

- **Status:** Living migration record
- **Last updated:** 25 August 2026 (Sprint 3.123)
- **Governing architecture:** `docs/architecture/JARVIS-NORTH-STAR-AUTHORITY-ARCHITECTURE-v0.1.md`
- **Governing ADR:** `docs/architecture/ADR-0025-operation-level-authority-before-acquisition.md`

## Purpose

This document separates four things that must not be conflated:

1. architecture required by the frozen North Star;
2. deterministic machinery that already exists somewhere in the repository;
3. production integration that is live today; and
4. migration work that remains incomplete.

A checkmark here means the stated capability is implemented at the stated layer. It does **not** imply that adjacent layers are complete.

Legend:

- `✓` implemented and verified on `main`
- `△` partial or isolated machinery exists, but the production path is incomplete
- `○` not yet implemented
- `!` current legacy behaviour conflicts with the target architecture and requires migration

## Operation-level authority

| Capability / mechanism | Adjudication | Acquisition gate | Live production path | Notes |
| --- | --- | --- | --- | --- |
| `calendar.read` | ✓ | ✓ | △ | The JARVIS conversational route now gates bounded governed Calendar reads; broader production conversation and legacy paths remain unchanged. |
| `gmail.search/read` | ○ | △ | ○ | Strong resource-policy and governed retrieval machinery exists, but user authority is not yet adjudicated upstream in the ordinary live path. |
| `drive.read` | ○ | ○ | ○ | Connector exists; operation-level authority not yet implemented. |
| `memory.read` | ○ | ○ | ○ | Memory is still acquired through legacy state-building paths; operation-level authority not yet implemented. |
| `calendar.write` | ○ | ○ | ○ | Future action capability; not part of current read migration. |
| `gmail.send` | ○ | ○ | ○ | Future action capability; must never inherit from Gmail read authority. |

## Authority evidence sources

| Evidence class | Status | Notes |
| --- | --- | --- |
| Explicit current-user utterance | ✓ for `calendar.read` only | Raw current utterance is independently matched; proposal itself is non-authoritative. |
| Named capability grants | ○ | No general named-grant machinery yet. |
| Standing grants | ○ | No standing-grant store or adjudication yet. |
| `PendingAuthorization` confirmation | △ | Server-owned state is integrated for JARVIS Calendar reads. Opaque references fail closed and resolve before model invocation; persistence remains process-local rather than durable or distributed. |
| Resource policy | △ | Mature Gmail content-retrieval policy exists; it is not positive user authority and is not yet composed into a general Authority Engine. |

## `calendar.read` detail

### Implemented

- closed `ProposedOperation` whose only admitted capability in the first slice is `calendar.read`;
- deterministic evaluation against the raw current user utterance;
- `ALLOW | ASK | DENY` decision vocabulary;
- immutable authority evidence on positive explicit reads;
- `ASK` for ambiguity, prior-context-only cases, negated reads and mixed read/write wording;
- no connector invocation inside authority adjudication.

### Authority-gated acquisition implemented

- the PR1 evaluator is composed with the existing `acquireGovernedCalendarEvidence()` seam;
- only `ALLOW` enters governed Calendar acquisition;
- `ASK` and `DENY` return without evidence and without calling `CalendarAcquisitionPort.listUpcoming()`;
- the authority decision remains separate from acquisition availability and evidence.
- live Calendar evidence is rendered deterministically server-side and is not disclosed to a conversational model in this slice;
- operation proposal is distinct from authority, including temporal schedule questions that propose `calendar.read` and still resolve to `ASK`.

### Not yet implemented

- conversational Calendar integration outside the bounded JARVIS route;
- durable or distributed conversation-state persistence of `PendingAuthorization` references;
- standing Calendar-awareness grants.

## Existing governed machinery that is reusable but not equivalent to the Authority Engine

### Deterministic claim-boundary recognition — `✓`

`lib/governed-conversation/claim-boundary-engine.ts` demonstrates bounded deterministic recognition, typed-intent precedence, clarification publication and fail-closed unsupported-language handling.

This is a recognition precedent. It answers questions about governed conversational claims; it is not itself operation authorization.

### Governed Calendar acquisition — `✓`

`lib/governed-conversation/calendar-evidence-acquisition-adapter.ts` exposes:

- `CalendarAcquisitionPort`;
- bounded acquisition configuration;
- refusal to call non-Google sources;
- contained provider failure;
- governed Calendar evidence publication.

This is the acquisition seam to gate in the next Calendar authority sprint.

### Gmail resource policy — `✓`

`lib/content-retrieval-policy` and `lib/content-retrieval/gmail.ts` provide deterministic content policy and policy-before-retrieval behaviour.

This is resource-policy machinery, not proof of user authorization.

### Agent/handoff adjudication precedent — `✓`

The agent coordinator and lighter handoff flows demonstrate bounded deterministic contract and confirmation patterns.

They do not provide the general operation-level authority sources required by v0.1.

## Legacy production conflicts requiring migration

### Eager private acquisition in `buildOperationalState()` — `!`

On current `main`, `buildOperationalState()` executes:

```text
Promise.all([
  readMemory(),
  loadCalendar(),
  loadGmail(),
  loadDrive()
])
```

This means a broad state build can acquire multiple private sources before operation-level authority has been adjudicated for each source.

Target correction: authorized acquisition first, state assembly second.

### Local fallback acquisition — `!` for future authority architecture

Legacy Calendar, Gmail and Drive loaders can fall back to local data after source failures. This behaviour is historically intentional for dashboard continuity, but it must not become an authority bypass in the governed production path.

### Briefing path — `!`

The current live `brief me on today` experience can retrieve Memory, Calendar, Gmail and Drive together through legacy briefing/state machinery.

A future compliant briefing path requires bounded authority for each private operation, most likely through an explicit named grant such as `BRIEF_ME_GRANT`.

### Named specialist UX — `△`

Named specialist language remains visible in some current surfaces, including DAWNWATCH briefing behaviour.

The frozen product direction is one user-facing JARVIS identity. Internal specialist/capability machinery may remain, but should become an implementation detail rather than a user coordination requirement.

## Migration sequence

| Step | Deliverable | Status |
| --- | --- | --- |
| 1 | Isolated deterministic `calendar.read` adjudication | ✓ |
| 2 | Authority-gated governed Calendar acquisition | ✓ |
| 3 | General `PendingAuthorization` for exact operation confirmation | △ |
| 4 | Live conversational Calendar integration | △ |
| 5 | Separate private acquisition from legacy `OperationalState` assembly | ○ |
| 6 | Extend authority to Gmail, Drive and Memory | ○ |
| 7 | Named and standing grants, including bounded briefing authority | ○ |
| 8 | Complete one-JARVIS UX migration and remove authority-bypassing legacy paths | ○ |

## Governance rule for future sprints

An architectural sprint is not complete until **code, tests and governing documentation agree**.

A sprint that changes any of the following must update the relevant architecture/spec/status documentation in the same PR or an explicitly paired documentation PR:

- authority boundaries;
- operation vocabulary;
- grant semantics;
- evidence rules;
- private acquisition ordering;
- canonical state ownership;
- capability execution authority;
- user-facing architectural identity;
- supersession of an accepted architectural contract.

Historical documents should not be rewritten merely to make the past resemble the present. Supersession must be explicit.

## Evidence discipline

When updating this file:

- mark implemented behaviour only when verified in the repository;
- label isolated machinery separately from production integration;
- do not present planned behaviour as live;
- distinguish user authority, resource policy, connector availability and execution success;
- record unresolved policy gaps rather than silently inventing policy.
