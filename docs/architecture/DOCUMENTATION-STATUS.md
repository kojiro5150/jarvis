# JARVIS Documentation Status

**Status:** Active documentation-governance index  
**Date:** 19 September 2026  
**Purpose:** Prevent current-state reconciliation from silently rewriting frozen doctrine or historical evidence.

## Documentation classes

JARVIS documentation serves different evidentiary purposes. Staleness must be handled according to document class rather than by bulk-updating every file.

### 1. Living current-state documents

These should be reconciled when implementation or product posture materially changes:

- `README.md`
- `docs/architecture/ROADMAP.md`
- `docs/AUTHORITY-MIGRATION-STATUS.md`
- current-state / implementation-status sections of `docs/architecture/JARVIS-GOVERNANCE-CORE.md`
- current-architecture notes in `docs/architecture/SYSTEM-ARCHITECTURE.md`

A living document may summarise promoted behaviour, open gaps and next-development gates, but must not claim a capability is proven without code/test/observed-behaviour evidence.

### 2. Constitutional / governing documents

These are not silently rewritten to match implementation drift. Changes require an explicit amendment, ADR, or other named architectural decision.

Current examples:

- `docs/ENGINEERING_CONSTITUTION.md`
- `docs/architecture/NORTH_STAR.md`
- `docs/architecture/JARVIS-NORTH-STAR-AUTHORITY-ARCHITECTURE-v0.1.md`
- accepted ADRs
- frozen architecture contracts

When a governing document contains superseded language, preserve the historical text and add an explicit amendment or reconciliation note that states which later governing decision controls.

### 3. Historical implementation evidence

Sprint specifications, audits, freeze records and live-pass documents are point-in-time evidence. They should normally remain unchanged even when later architecture supersedes their mechanism.

Examples:

- `docs/SPRINT-*.md`
- `docs/*LIVE-PASS*.md`
- capability-specific freeze records
- historical audits and implementation specifications

Do not rewrite these to sound current. If later work changes their status, link or annotate from a living/current document instead.

## Current reconciliation boundary

This closeout reconciliation updates current-state documentation through the merged September A–D tranche on `main` at `cd6421b673f01bd40db307ac972c8d832d99d835`.

Current living-state reconciliation now includes:

- ADR-0027 authority-source reconciliation and non-typed write containment;
- the active/frozen Untrusted Content Adversarial Corpus v0.1;
- restart-safe server-only durable pending authority and Calendar move authority;
- deterministic three-source Executive Orientation over already-governed Calendar/Gmail/Drive evidence;
- the fact that Step E remains demand-triggered rather than automatically active;
- branch-protection reality: `verify` is required; `verify-presentation` is additional CI evidence.

The earlier 19 September reconciliation also updated current-state documentation for:

- one persistent user-facing JARVIS intelligence and governed capability boundaries;
- bounded public-web claim-level provenance for research-shaped requests;
- the promoted Gmail invitation-decline private-evidence composition exception;
- current Calendar write status: one narrow verified move path, not general Calendar write;
- Product Gap lifecycle controls and other recent governed continuity hardening;
- the roadmap's immediate authority/adversarial/durability/cognition tranche.

ADR-0027 supplies the explicit authority-source amendment: standing grants are removed as an admissible authority source, while named grants remain future architecture only under ADR-0027's bounded activation requirements. Steps B–D now add executable adversarial control, durable authority state, and deterministic Executive Orientation without changing that doctrine. The North Star, ADR-0025, historical sprint records, live-pass records, and Step C/D baseline hashes preserve their point-in-time evidence rather than being rewritten to the latest commit.

## Drift rule

When implementation and documentation diverge:

1. verify the actual runtime/code/test state;
2. identify the document class;
3. update living status documents;
4. amend governing documents explicitly rather than silently;
5. preserve historical records;
6. never use documentation cleanup to smuggle in an unmade architectural decision.

The repository-wide behavioural test remains:

> **What observed behaviour does this explain or enable that the current architecture cannot?**

Documentation should make the answer auditable, not manufacture it.
