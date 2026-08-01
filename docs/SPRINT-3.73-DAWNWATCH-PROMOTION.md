# Sprint 3.73 — DAWNWATCH Promotion

## Status

**Promotion Record**

Sprint 3.73 records the completed operator-controlled promotion of governed DAWNWATCH.

This is a documentation and evidence-recording sprint.

It is **not**:

* a code sprint;
* an implementation sprint;
* an integration sprint;
* an evaluation sprint;
* a selector-change sprint;
* a production-default change;
* a DAWNWATCH redesign sprint.

The correct implementation outcome is that no production code change is required or authorised.

---

# Architectural Context

This sprint shall be executed under the repository constitutional hierarchy.

Authority order:

1. Engineering Constitution
2. `docs/architecture/NORTH_STAR.md`
3. JESS — JARVIS Engineering Specification Standard
4. `docs/architecture/ROADMAP.md`
5. Constitutional Publication Principles
6. Accepted ADRs and responsibility statements
7. Sprint 3.68 — Gmail Recipient Projection Audit
8. Sprint 3.69 — Governed Gmail Recipient Contract
9. Sprint 3.70 — Gmail Recipient Production Integration
10. Sprint 3.71 — DAWNWATCH Re-evaluation
11. Sprint 3.72 operator-verification evidence
12. Dashboard promotion precedent from Sprints 3.61 and 3.62
13. Current selector source and tests
14. This Sprint Specification

The Roadmap shall be read completely before the Promotion Record is drafted.

Repository evidence governs over chat summaries or remembered completion reports.

---

# Repository Precondition

Before recording promotion, confirm that the checked-out repository contains:

```text
docs/audits/SPRINT-3.68-GMAIL-RECIPIENT-PROJECTION-AUDIT.md
docs/SPRINT-3.69-GOVERNED-GMAIL-RECIPIENT-CONTRACT.md
docs/SPRINT-3.70-GMAIL-RECIPIENT-PRODUCTION-INTEGRATION.md
docs/SPRINT-3.71-DAWNWATCH-RE-EVALUATION.md
docs/architecture/ROADMAP.md
```

Also confirm the presence of:

```text
docs/SPRINT-3.61-GOVERNED-DASHBOARD-INTEGRATION.md
docs/SPRINT-3.62-GOVERNED-DASHBOARD-PROMOTION-READINESS.md
docs/SPRINT-3.62-OPERATOR-PROMOTION-CHECKLIST.md
lib/dashboard-presentation-selection.ts
lib/dawnwatch-presentation-selection.ts
```

Read all required documents completely before drafting the Promotion Record.

If any of the five DAWNWATCH evidence-chain documents is missing:

* do not reconstruct it from reports;
* do not infer its conclusions;
* do not record promotion.

Return:

> **Promotion Blocked — Required Evidence Chain Incomplete**

Before proceeding, also confirm that the Sprint 3.72 operator evidence is available in a durable form or can be cited precisely in the Promotion Record.

---

# Objective

Create an authoritative Promotion Record establishing that:

1. governed DAWNWATCH completed the full Discover → Govern → Implement → Evaluate → Integrate → Verify sequence;
2. the operator's real JARVIS instance is explicitly configured with:

```text
DAWNWATCH_PRESENTATION_MODE=GOVERNED
```

3. real operational Gmail recipient evidence reaches governed DAWNWATCH;
4. no code-level default change is required;
5. the permanent selector fallback remains `LEGACY`;
6. rollback remains available through environment configuration;
7. known non-blocking issues remain visible and deferred.

---

# Dashboard Promotion Precedent

Sprint 3.73 shall follow the Dashboard promotion model established by Sprints 3.61 and 3.62.

The permanent selector rule is:

| Configuration            | Result                       |
| ------------------------ | ---------------------------- |
| missing                  | `LEGACY`                     |
| empty or whitespace-only | `LEGACY`                     |
| `LEGACY`                 | `LEGACY`                     |
| `GOVERNED`               | `GOVERNED`                   |
| any other value          | explicit configuration error |

Promotion does not mean changing the code fallback to `GOVERNED`.

Promotion means the authorised operator explicitly configures the actual runtime to select the governed path.

This prevents an absent or accidentally removed environment variable from silently promoting governed behaviour.

---

# Selector Verification

Verify directly that:

```text
selectDawnwatchPresentationMode(undefined) === "LEGACY"
```

and that empty or whitespace-only values also return `LEGACY`.

Verify that only explicit:

```text
DAWNWATCH_PRESENTATION_MODE=GOVERNED
```

selects governed DAWNWATCH.

Verify invalid values continue to throw an explicit configuration error.

The Promotion Record shall confirm:

> The code-level fallback remains permanently `LEGACY`. Governed DAWNWATCH is selected only through explicit operator-controlled runtime configuration.

No change to:

```text
lib/dawnwatch-presentation-selection.ts
```

is authorised.

If current source has drifted so that missing or empty configuration selects `GOVERNED`, promotion is blocked until the selector is corrected back to `LEGACY`.

Such drift shall not be silently accepted as promotion.

---

# Promotion Authority

Sprint 3.73 authorises only the continued human-side deployment configuration:

```text
DAWNWATCH_PRESENTATION_MODE=GOVERNED
```

The operator's real `.env.local` was already verified during Sprint 3.72 as explicitly selecting `GOVERNED`.

No repository change is required to formalise that selection.

Promotion does not authorise:

* changing the selector fallback;
* deleting the legacy path;
* removing rollback;
* changing DAWNWATCH semantics;
* changing Gmail evidence rules;
* changing the comparator;
* changing the presentation renderer;
* changing any canonical model.

Rollback remains:

```text
DAWNWATCH_PRESENTATION_MODE=LEGACY
```

or removal of the variable, followed by application restart.

---

# Required Promotion Evidence Chain

The Promotion Record shall cite the complete evidence chain.

## Sprint 3.68 — Audit

Record that Sprint 3.68 established:

* a correct and tested canonical Gmail recipient adapter already existed;
* the adapter extracted and flattened `To`, `Cc`, and `Bcc`;
* the capability was not connected to the production DAWNWATCH path;
* the problem was primarily a wiring and evidence-boundary gap, not a missing Gmail capability.

## Sprint 3.69 — Governed Contract

Record that Sprint 3.69 established binding authority that:

* production recipient flow shall use the canonical Gmail projection path;
* the legacy `EmailMessage` path shall not become a second recipient authority;
* recipient evidence may become `available` only under the governed bounded claim;
* absence, provenance, parsing, ordering, and non-inference boundaries are explicit.

The bounded claim is:

> At least one asserted recipient value was observed in returned recipient headers for this source-qualified communication.

## Sprint 3.70 — Implementation

Record that Sprint 3.70:

* routed production recipient evidence through the canonical path;
* replaced naïve comma splitting with standards-aware address-list parsing;
* correctly protected quoted display-name commas such as `"Smith, John"`;
* preserved deterministic `To → Cc → Bcc` ordering;
* preserved duplicate recipient occurrences;
* used both production Gmail candidate queries;
* deduplicated message IDs before detail retrieval;
* fetched each message detail once;
* retained truthful retrieval-time provenance;
* replaced the unconditional DAWNWATCH `recipients: []` gap with evidence-gated canonical recipients.

## Sprint 3.71 — Re-evaluation

Record that Sprint 3.71:

* reused the existing runtime-computed comparator;
* did not modify `compareDawnwatchRuntime`;
* evaluated the new recipient-evidence surface;
* showed qualifying canonical recipient evidence reaches governed communications `available`;
* classified the actual runtime difference as:

```text
Intentional Improvement
```

* proved recipient-surface comparator sensitivity through a distinct mutation test;
* found no blocking regression in the existing DAWNWATCH scenario set.

The Promotion Record shall also carry forward the comparator citation-specificity limitation described below.

## Sprint 3.72 — Operator Verification

The Promotion Record shall cite the following two pieces of evidence gathered from the operator's real running JARVIS instance.

### 1. Actual presentation selection

The server-rendered Next.js payload contained:

```text
"dawnwatchPresentationMode":"GOVERNED"
```

as an actual computed runtime property.

This proves the real application selected governed DAWNWATCH through explicit configuration.

It was not inferred from repository source or sandbox behaviour.

### 2. Actual Gmail recipient evidence

The real operational-state API response contained:

```text
recipientEvidence: "available"
```

for at least one real Gmail communication, together with:

* genuine multi-recipient data;
* preserved duplicate recipient occurrences where asserted;
* truthful `retrievedAt`;
* separately retained `gmailInternalDate`;
* source-qualified identity and provenance.

This proves the live application received real Gmail recipient evidence satisfying the governed production path.

The Promotion Record shall not broaden this evidence into a claim of complete mailbox or hidden-recipient coverage.

---

# Promotion Decision

Promotion may be recorded only if all of the following hold:

* all required evidence-chain records exist;
* selector fallback remains `LEGACY`;
* explicit `GOVERNED` selection works;
* Sprint 3.72 verified the operator's real runtime is configured to `GOVERNED`;
* real Gmail recipient evidence reached `available`;
* no blocking Defect or Undocumented Failure Mode remains;
* rollback remains available;
* known non-blocking items are recorded honestly.

The Promotion Record shall state:

> Governed DAWNWATCH is the authorised operator-selected presentation for the current JARVIS runtime. This authority is expressed through explicit deployment configuration. The repository code-level fallback remains LEGACY.

---

# Known Non-Blocking Items

## Comparator citation specificity

Sprint 3.71 found that the comparator's `Intentional Improvement` rule checks evidence status across all three DAWNWATCH sections rather than identifying the specific changed section.

As a result, the computed classification is valid, but the returned governance citation may be broader than the communications-specific change that triggered it.

This is known and non-blocking.

It shall not be fixed in Sprint 3.73.

Any correction requires a separately governed comparator sprint.

## Communications display wording

Sprint 3.72 identified that the presentation layer renders the raw communication Message-ID where sender-oriented display would be more useful.

This is a presentation-layer issue.

It does not invalidate:

* canonical recipient evidence;
* evidence sufficiency;
* the governed `available` state;
* production routing;
* selector behaviour;
* promotion authority.

It shall not be fixed in Sprint 3.73.

Reserve it for:

```text
Sprint 3.74 — DAWNWATCH Communications Presentation Correction
```

or another separately specified follow-up sprint.

---

# Scope

## In Scope

Sprint 3.73 shall:

* verify the selector remains unchanged and LEGACY-default;
* validate the repository;
* assemble the complete Promotion Record;
* cite the repository and operator evidence chain;
* document operator-controlled governed selection;
* document rollback;
* record known non-blocking items.

## Out of Scope

Sprint 3.73 shall not:

* modify production code;
* modify either selector;
* modify DAWNWATCH presentation logic;
* modify Gmail acquisition or normalization;
* modify the comparator;
* fix Message-ID rendering;
* alter canonical models;
* remove the legacy path;
* change environment files in the repository;
* change the permanent code fallback;
* perform new implementation;
* claim hidden-recipient or mailbox-wide completeness.

---

# Output Paths

## Sprint specification

This specification shall exist at:

```text
docs/SPRINT-3.73-DAWNWATCH-PROMOTION.md
```

Numbered sprint specifications remain under `docs/`, matching established repository convention.

## Promotion Record

Create the standing Promotion Record at:

```text
docs/architecture/DAWNWATCH-PROMOTION-RECORD.md
```

This location is deliberate.

The Promotion Record is not merely a one-off completion report. It is a durable architectural record establishing:

* the authorised production presentation;
* the permanent LEGACY code fallback;
* the operator-controlled selection model;
* the evidence chain supporting promotion;
* rollback authority;
* known carried-forward limitations.

That makes it closer in function to the Roadmap and standing responsibility records than to an audit or implementation sprint document.

---

# Deliverable

Produce exactly one new authoritative Promotion Record:

```text
docs/architecture/DAWNWATCH-PROMOTION-RECORD.md
```

The record shall contain:

1. Status
2. Purpose
3. Governing Authority
4. Promotion Decision
5. Permanent Selector Semantics
6. Evidence Chain
7. Sprint 3.72 Operator Evidence
8. Rollback
9. Known Non-Blocking Items
10. Validation
11. Constitutional Conclusion

No production source file shall be changed.

---

# Validation

Run the full repository validation suite:

```text
npm test
npm run lint
npm run typecheck
npm run build
git diff --check
```

The full suite is mandatory.

No documentation-only exception applies.

Also run the existing targeted selector tests proving:

* missing → `LEGACY`;
* empty → `LEGACY`;
* explicit `LEGACY` → `LEGACY`;
* explicit `GOVERNED` → `GOVERNED`;
* invalid value → explicit error;
* DAWNWATCH selection remains independent of Dashboard selection.

Validation shall confirm:

* `lib/dawnwatch-presentation-selection.ts` is unchanged;
* `lib/dashboard-presentation-selection.ts` is unchanged;
* no production file changed;
* no environment default changed;
* no legacy path was removed;
* no comparator changed;
* no Gmail code changed;
* only documentation was added or modified.

Repository validation confirms code integrity.

Sprint 3.72's previously gathered operator evidence remains the authority for the real runtime.

---

# Success Criteria

Sprint 3.73 is complete when:

* every required evidence-chain document exists and has been read;
* the Roadmap has been read;
* Dashboard promotion precedent has been confirmed;
* the DAWNWATCH selector still defaults to `LEGACY`;
* explicit `GOVERNED` selection remains required;
* invalid configuration still fails explicitly;
* the operator's live configuration is recorded as `GOVERNED`;
* both real Sprint 3.72 evidence points are cited;
* the complete Sprint 3.68–3.72 evidence chain is recorded;
* rollback is documented;
* known non-blocking items are preserved;
* no code change occurred;
* full validation passes;
* the Promotion Record is created at the required path.

---

# Return Format

Return one completion report containing:

## Executive Summary

State whether governed DAWNWATCH promotion was recorded and whether any repository code change was required.

## Authoritative Repository State

Report:

* repository;
* branch;
* commit;
* working-tree status;
* remote/upstream limitations.

## Required Evidence Chain

Confirm review of Sprints 3.68 through 3.72 and summarise the decisive evidence from each.

## Selector Verification

Report the exact outcomes for:

```text
missing
empty
LEGACY
GOVERNED
invalid
```

Confirm the code-level fallback remains `LEGACY`.

## Operator Evidence

Record:

* `"dawnwatchPresentationMode":"GOVERNED"` from the live server-rendered payload;
* live `recipientEvidence: "available"` with real multi-recipient evidence and distinct retrieval/internal-date provenance.

## Promotion Decision

State exactly what is authorised:

```text
DAWNWATCH_PRESENTATION_MODE=GOVERNED
```

for the operator's runtime.

Confirm no repository default change is authorised.

## Rollback

State the exact rollback configuration and restart requirement.

## Known Non-Blocking Items

Record:

* comparator citation specificity;
* raw Message-ID presentation issue reserved for Sprint 3.74.

## Files Changed

List all created or modified files.

## Validation

Report exact results for:

```text
npm test
targeted selector tests
npm run lint
npm run typecheck
npm run build
git diff --check
```

## Change Confirmation

Explicitly confirm:

* documentation only;
* no production code change;
* no selector change;
* no default change;
* no Gmail change;
* no comparator change;
* no legacy-path removal.

## Outstanding Issues

List any evidence gap that would invalidate promotion and any non-blocking items carried forward.

## Recommendation

Return exactly one of:

```text
Promotion Recorded
```

or:

```text
Promotion Blocked
```

No other recommendation wording is permitted.

`Promotion Recorded` means the evidence chain supports continued explicit operator selection of governed DAWNWATCH.

It does not mean the code fallback has changed from `LEGACY`.

---

# Engineering Intent

DAWNWATCH promotion is not a code change.

The architecture was intentionally designed so that promotion and rollback remain operator-controlled deployment decisions.

The permanent code posture is conservative:

```text
unset → LEGACY
explicit LEGACY → LEGACY
explicit GOVERNED → GOVERNED
invalid → error
```

The operator has already verified that the real JARVIS instance is explicitly configured for governed DAWNWATCH and that real Gmail recipient evidence reaches the governed path.

Sprint 3.73 records that decision and its evidence.

It does not rewrite the selector to make promotion automatic.

That distinction is the final architectural safeguard of the DAWNWATCH sequence:

> Governed behaviour is promoted deliberately, remains reversible, and never becomes active merely because configuration is absent.
