# JARVIS Engineering Notes

**Status:** Active
**Last Updated:** 30 July 2026

## Purpose and Scope

This document is the canonical record of evidence-based operational observations about the AI-assisted engineering process used for JARVIS. Its scope is limited to:

- AI-assisted engineering;
- tooling behaviour;
- repository workflow;
- engineering methodology;
- validation practices; and
- review practices.

Engineering Notes are not part of the JARVIS architecture. They remain separate from Architecture Decision Records (ADRs) and the Engineering Constitution.

This document must not contain architectural decisions, sprint specifications, runtime behaviour, roadmap planning, or implementation designs.

## Canonical Entry Rule

Before adding an observation, search this document for an equivalent observation.

- If an equivalent observation exists, update its single canonical entry and append the new, independent confirmation to its **Occurrences** list.
- If no equivalent observation exists, create one new entry from the reusable template below.
- Do not create duplicate entries. Each engineering observation has exactly one canonical entry.
- Do not add a confirmation unless it independently supports the observation; contradictory or inconclusive evidence must be recorded as such rather than presented as confirmation.

## Evidence and Occurrence Tracking

Every observation must identify when it was first observed and list its independently observed occurrences. Evidence should be concrete and bounded to what was actually inspected. Unsupported conclusions must be avoided, and uncertainty or insufficient evidence must be stated explicitly.

## Promotion Rule

An Engineering Note may be promoted only when the evidence supports promotion:

- Promote to the Engineering Constitution when repeated observations establish a recurring engineering rule.
- Promote to an ADR only when a decision changes JARVIS architecture, runtime behaviour, repository structure, or engineering governance.
- Recurrence, not perceived importance, is the evidentiary threshold for promotion.

Promotion does not erase the operational evidence in its canonical Engineering Note. Update **Promotion Status** with the promoted destination and reference when promotion occurs.

## Reusable Entry Template

Copy this section when no equivalent canonical observation already exists.

### EN-XXX — Title

- **Observation ID:** EN-XXX
- **Title:** Concise, unique description of the observation
- **First Observed:** YYYY-MM-DD
- **Occurrences:**
  1. **YYYY-MM-DD — Session or context:** Independent confirmation and its bounded evidence.
- **Observation:** What was observed, including uncertainty where the available evidence is insufficient.
- **Evidence:** Concrete commands, outputs, artifacts, or review findings that support the observation.
- **Engineering Impact:** The demonstrated or reasonably bounded consequence for engineering work.
- **Recommended Practice:** The evidence-aligned practice to follow during future work.
- **Promotion Status:** Not promoted; explain whether recurrence is currently sufficient, or cite the promoted destination.
- **Status:** Active, superseded, or closed; include a reason when not active.

## Observations

### EN-001 — Codex execution environments may not expose repository remotes

- **Observation ID:** EN-001
- **Title:** Codex execution environments may not expose repository remotes
- **First Observed:** 2026-07-30
- **Occurrences:**
  1. **2026-07-30 — Sprint 3.56 engineering session:** Running `git remote -v` in the Codex execution environment at the JARVIS repository root returned no configured remotes, while the checked-out repository snapshot remained available for inspection and modification.
- **Observation:** A Codex execution environment may provide a usable repository snapshot without exposing a repository remote. This occurrence establishes that the condition can happen in the observed environment; it does not establish how frequently it occurs or why the remote was unavailable.
- **Evidence:** In the repository root, `git remote -v` produced no output. The working tree and Git metadata were present and accessible. No evidence from this session establishes that the upstream repository itself lacks a remote.
- **Engineering Impact:** Treating absent environment metadata as a repository defect can produce an inaccurate audit finding. The repository snapshot remains authoritative for claims about the state of the files available to the engineering session, while conclusions about external repository configuration remain bounded by what the environment exposes.
- **Recommended Practice:** Treat the repository snapshot as authoritative for repository-state audits. Report missing remotes or similar constraints as execution-environment limitations unless repository evidence establishes otherwise, and explicitly distinguish environment limitations from repository state in audit and validation results.
- **Promotion Status:** Not promoted. One occurrence is insufficient to establish recurrence.
- **Status:** Active

### EN-002 — Branch-local commit hashes may not be externally resolvable after squash/rebase merge

- **Observation ID:** EN-002
- **Title:** Branch-local commit hashes may not be externally resolvable after squash/rebase merge
- **First Observed:** 2026-07-30
- **Occurrences:** 2
  1. **2026-07-30 — Sprint 3.57 completion verification:** Completion report referenced a branch-local commit SHA that could not be resolved on GitHub. Runtime implementation was independently verified on main.
  2. **2026-07-30 — Sprint 3.57.1 documentation verification:** Completion report referenced a branch-local commit SHA that could not be resolved on GitHub. Documentation changes were independently verified on main.
- **Observation:** Completion reports generated before or during merge may record branch-local commit hashes that are not externally resolvable after squash or rebase merge. This appears to affect audit traceability only. Current evidence does not suggest any impact on repository integrity, implementation correctness, merge correctness, or production behaviour.
- **Evidence:** Two completion reports referenced branch-local commit SHAs that could not be resolved on GitHub after merge. The Sprint 3.57 runtime implementation and Sprint 3.57.1 documentation changes were independently verified on main.
- **Engineering Impact:** **Classification: Low Impact.** Engineering correctness is unaffected; repository state is unaffected; implementation was independently verified; audit traceability is reduced because locally reported commit hashes may not correspond to the final merged commit after squash or rebase. This observation is not an engineering defect.
- **Recommended Practice:** If this observation reaches three independent occurrences, investigate whether the completion workflow should instead record a post-merge commit hash, squash-merge commit hash, merged pull request reference, or another externally resolvable repository reference. Do not modify the workflow based on the current evidence alone.
- **Promotion Status:** Not promoted. Two occurrences are below the three-occurrence investigation trigger.
- **Status:** Active
