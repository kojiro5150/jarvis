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

This 19 September 2026 reconciliation updates current-state documentation for:

- one persistent user-facing JARVIS intelligence and governed capability boundaries;
- bounded public-web claim-level provenance for research-shaped requests;
- the promoted Gmail invitation-decline private-evidence composition exception;
- current Calendar write status: one narrow verified move path, not general Calendar write;
- Product Gap lifecycle controls and other recent governed continuity hardening;
- the roadmap's immediate authority/adversarial/durability/cognition tranche.

It deliberately does **not** amend `JARVIS-NORTH-STAR-AUTHORITY-ARCHITECTURE-v0.1.md` to remove standing grants. The current roadmap assigns that authority-source decision to ADR-0027. Until ADR-0027 lands, the frozen baseline remains historically and constitutionally intact even though the migration-status document flags it for reconciliation.

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
