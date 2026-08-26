# Sprint 3.147 — Repository Governance and Authority Baseline

**Status:** Frozen current-production baseline and governance reconciliation  
**Date:** 26 August 2026  
**Scope:** Documentation, regression verification, and repository governance only

## Frozen production capability baseline

The production authority baseline on the Sprint 3.147 starting commit is exactly:

- bounded `calendar.read`;
- bounded `gmail.search`;
- identified-message `gmail.read`; and
- metadata-only `drive.search` under Google's `drive.metadata.readonly` scope.

`drive.read` (including content, export, and download) and `memory.read` remain unimplemented.
Named grants, standing grants, `BRIEF_ME_GRANT`, `calendar.write`, and `gmail.send` remain
unimplemented. Capability availability is never evidence that a user authorized its use.

## Cross-capability invariants

1. A proposal is not authority.
2. A raw, explicit current utterance and an exact pending confirmation are distinct positive
   authority sources.
3. Natural-language proposals follow one path: proposal → `ASK` → server-owned exact
   `PendingAuthorization` → confirmation.
4. Search authority is not read authority. In particular, returned Gmail IDs are data, not
   authority to read those messages.
5. Capability availability, resource policy, and connection/authentication are each distinct from
   authority.
6. Governed private release is not permission for ordinary-model reuse.
7. Specialist handoff cannot substitute for governed private-source authority.
8. Voice transcription is transport only. Voice and typed confirmations use the same canonical
   authority path.
9. Long transcript size cannot pre-empt valid pending-authority resolution.
10. Bare, stale, fabricated, unknown, consumed, and capability-mismatched pending references fail
    closed.
11. Drive remains metadata-only under `drive.metadata.readonly`.
12. No model may manufacture authority or counterfeit deterministic authority UX.

## `PendingAuthorization`: live semantics and durability boundary

`PendingAuthorization` is live, server-owned, one-shot, and capability-bound. The client holds only
an opaque reference; the exact proposed operation remains authoritative on the server. The current
implementation's authoritative registry is a module-private process-local `Map`.

Process-local storage does not weaken the authority semantics above. Sprint 3.146 proved that the
live failure after more than 40 messages was caused by ordinary-model transcript-limit ordering,
not evidence that process-local storage caused the failure. Governed pending resolution now occurs
before that ordinary-model limit, while invalid references continue to fail closed.

Process-local state nevertheless remains a production reliability boundary across restarts,
multiple instances, and multi-step use. Durable/distributed persistence is incomplete and is future
work; this sprint deliberately adds no persistence.

## Legacy `/api/chat` Gmail containment

The legacy `/api/chat` activation route for `governed_gmail_retrieval` fails closed before capability
parsing, authorization, connector construction, or acquisition. The old Gmail-capable
implementation remains physically present beneath that containment guard. This is contained
technical debt, **not** a currently verified bypass.

Future disposition should favor retiring `/api/chat` or deleting its unreachable duplicate Gmail
machinery. Sprint 3.147 does not refactor, converge, or reactivate Gmail code.

## Legacy operational state

`lib/operational-state.ts` and `buildOperationalState()` still exist as legacy/internal code. Their
existence is not evidence of callable production eager acquisition: Sprint 3.129 retired the final
callable eager full-state surfaces, and quarantine/retirement regressions continue to enforce that
boundary. Migration Step 5 is complete. Reintroducing a production caller would be a regression.

## Issue hygiene

The authority-chain ledger cleanup is complete. Historical Issues #249–#311 are closed as
completed and must not be reopened. Issue #313 is the active Sprint 3.147 issue.

## Repository branch governance

The repository state verified for this sprint is:

- `main` is currently unprotected; and
- no repository ruleset is currently configured.

The required manual GitHub configuration for `main` is:

- require a pull request before merging;
- require CI to pass;
- require conversation resolution;
- block force pushes;
- block branch deletion; and
- require zero external approvals, which is acceptable for the current solo-maintainer workflow.

This document does **not** claim those settings are active. Branch protection is repository-host
configuration and must not be simulated in source code. Applying it remains the sole manual
repository action after this documentation and regression sprint.

## Explicit exclusions

This sprint changes no production implementation and adds no private capability. It does not add
`drive.read`, Drive content/export/download, `memory.read`, persistent `PendingAuthorization`, named
or standing grants, `BRIEF_ME_GRANT`, Gmail convergence, broader Gmail/Drive/Calendar grammars,
`calendar.write`, `gmail.send`, or North Star v0.2.
