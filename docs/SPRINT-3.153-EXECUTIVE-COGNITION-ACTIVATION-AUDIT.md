# Sprint 3.153 — Executive Cognition Activation Audit

**Status:** Specification  
**Sprint type:** Architecture reconciliation and audit  
**Implementation authority:** None  
**Production integration:** Prohibited  
**Starting baseline:** merged `main` after PR #337 (`211d160`)  
**Primary proving question:** **What needs my attention?**

## 1. Purpose

JARVIS now has a substantially hardened governed conversational path, bounded operation-level authority for Calendar/Gmail/Drive, server-owned pending authorization, private-history containment, typed/voice turn integrity, and a live Calendar GovernedContext path. Sprint 3.152d also closed the verified Calendar projection-fidelity regression in which model prose could substitute a user-mentioned time for a real projected commitment.

The next architectural question is no longer primarily whether JARVIS can read private sources safely. It is what the real everyday question “What needs my attention?” actually requires before any existing Executive Operating System stage is allowed to define the answer.

Sprint 3.153 therefore does **not** begin by auditing or wiring the twelve-stage cognition pipeline as a presumed route. It applies the Executive Cognition Scope Discipline:

1. derive the minimum deterministic information transformations required to answer the question honestly;
2. identify the minimum evidence/state each transformation requires;
3. only then map those transformations to existing EOS stages where they genuinely fit;
4. leave every other stage unwired.

It shall answer one bounded question:

> What is the minimum deterministic architecture required for JARVIS to answer “What needs my attention?” honestly, and which existing EOS stages—if any—are actually load-bearing for that capability?

This sprint must not implement that path.

## 2. Governing constraints

Apply, in order:

1. Engineering Constitution;
2. North Star;
3. JARVIS Engineering Specification Standard;
4. `docs/architecture/EXECUTIVE-COGNITION-SCOPE-DISCIPLINE.md` for Executive Cognition scope selection;
5. accepted ADRs;
6. current `docs/architecture/ROADMAP.md`;
7. current authority architecture and `docs/AUTHORITY-MIGRATION-STATUS.md`;
8. current source and tests;
9. this sprint specification.

The Executive Cognition Scope Discipline is binding for this audit as a scope constraint beneath the Engineering Constitution and North Star. It does not supersede JESS or accepted ADRs outside the scope-selection question. A stage does not earn production wiring because it already exists, compiles, or appears in the historical pipeline.

The frozen authority rule remains:

> JARVIS may propose authority-requiring operations. JARVIS may never manufacture the authority to perform them.

The audit must also preserve the established cognition distinctions:

- observation is not interpretation;
- change is not importance;
- attention is not planning;
- attention is not recommendation;
- attention is not action;
- queue order is not priority unless a separately governed contract says so.

## 3. Repository reality to inspect

Read and trace the actual current implementation of:

### Governed conversational ingress
- `components/console/UnifiedOpsConsole.tsx`
- `app/api/lighter/chat/route.ts`
- `lib/lighter-jarvis/chat-handler.ts`
- Calendar/Gmail/Drive production resolvers
- pending authorization
- model-history boundary
- GovernedContext Calendar assembly and provenance helpers

### Canonical operational state and projection
- projection adapters and projection registry
- ProjectionEngine
- Situational Awareness canonical types
- snapshot lifecycle
- deterministic change-set construction

### Executive Attention
- `lib/executive-operating-system/attention/types.ts`
- `engine.ts`
- `registry.ts`
- `policies.ts`
- `validation.ts`
- ADR-0009
- Sprint 3.14 specification and tests

### Downstream cognition — inspect only after minimum transformations are derived
- Situation Formation
- Situation Assessment
- Executive Context
- Intent & Constraints
- Candidate Construction
- Candidate Evaluation
- Candidate Comparison
- Executive Reasoning
- Governed Action Proposal

These stages are inspection candidates, not presumed dependencies. Do not route the proving question through them merely to observe whether they produce output.

### Runtime composition
- `lib/executive-operating-system/runtime/engine.ts`
- runtime types and run records
- any current production callers of EOS runtime/cognition stages

Do not infer wiring from file presence. Follow imports and real callers.

## 4. Required audit findings

The audit must first derive the capability from the question itself, before inspecting existing stage fit.

### 4.0 Minimum transformation derivation

State the minimum deterministic information transformations required to answer:

> **What needs my attention?**

For each transformation identify:

- required input information;
- required output information;
- why the transformation is necessary for an honest answer;
- whether it requires current state only or comparison with prior state;
- whether it selects, interprets, ranks, recommends, or merely renders;
- what would be lost if the transformation were omitted.

Do not name an existing EOS stage as justification for a transformation. Stage mapping happens only after this derivation.

After the minimum transformations are defined, classify every existing cognition stage considered by the audit as exactly one of:

- **Load-bearing** — demonstrably required for this capability; state precisely what necessary transformation it provides.
- **Not required for this capability** — this question does not require it; this makes no claim about whether another future capability may need it.
- **Unproven** — not exercised by the evidence available in this audit.

A result in which most stages are **Not required for this capability** is a successful audit result and must not be treated as a reason to wire them anyway.

The audit must then produce explicit **OBSERVED / INFERRED / UNKNOWN** findings for each question below.

### A. Input ownership

For every EOS stage relevant to attention, identify:

- exact input type;
- exact producer;
- whether that producer is live on the governed console path;
- whether input can contain private evidence;
- authority/provenance semantics attached to that input;
- whether any field is currently synthesized from legacy OperationalState.

### B. Attention semantics

For every active Attention Policy identify:

- matching condition;
- required canonical fields;
- reason code/evidence;
- whether it expresses only selection or also implies severity/priority;
- whether policy output is currently consumed anywhere in production.

Confirm whether the current Attention Queue is sufficient to answer “what needs my attention?” without adding ranking.

### C. Identity and provenance continuity

Trace whether source identity and observation provenance survive:

```text
governed acquisition
→ projection
→ snapshot
→ change set
→ attention record
```

If identity/provenance is lost, name the exact seam.

Do not propose reconstruction from prose.

### D. Temporal/change requirements

Determine whether the Attention layer requires:

- one current snapshot;
- current + previous snapshots;
- persisted prior snapshot;
- explicit observation times;
- lifecycle correspondence.

If a previous snapshot is required, identify whether current production has an honest owner for it.

### E. Conversational rendering boundary

Identify the narrowest possible structured output for a future Attention Brief.

A valid future brief must be derivable from deterministic records before prose and should contain, at minimum where supported:

- attention record identity;
- matched policy identity/version;
- affected canonical entity/reference;
- structured reason code;
- source/provenance reference;
- bounded time/change evidence;
- explicit non-ranking semantics.

The audit must state whether the ordinary conversational model can safely render such a brief without receiving raw private source data.

### F. First end-to-end proving scenario

Define one scenario using current canonical fields only.

Preferred scenario:

> a Calendar commitment previously present changes start time, is cancelled, or is removed; the deterministic Attention Policy matches the canonical change; JARVIS can later explain that this item needs attention and why.

Use whichever scenario is actually supported by current code. Do not force the preferred scenario if the canonical model cannot represent it.

## 5. Required architecture map

Produce two maps, in this order.

### Map 1 — Minimum capability path

Show only the transformations derived from the real question, without forcing historical EOS stage names onto them.

Example shape only:

```text
governed evidence
→ canonical state
→ change detection
→ deterministic attention selection
→ attention records
→ concise rendering
```

The audit may return a smaller or different path if the evidence requires it.

### Map 2 — Existing-stage fit

Map each transformation from Map 1 to an existing EOS stage only where the code demonstrably provides that transformation. Mark every inspected stage as **Load-bearing**, **Not required for this capability**, or **Unproven**.

Then classify readiness using one of these outcomes:

### Outcome A — Directly activatable
Every minimum transformation has an honest current owner and the mapped load-bearing stages can compose without inference.

### Outcome B — One named missing seam
Exactly one required transformation or owner is absent. Name it and stop there.

### Outcome C — Multiple structural gaps
List each required missing transformation/owner and stop. Do not hide them inside an implementation sprint.

The audit must not return “ready” merely because all packages compile independently, and it must not add stages to achieve architectural completeness.

## 6. Non-goals

Do not add or modify:

- connectors;
- source acquisition;
- operation authority;
- PendingAuthorization;
- Calendar/Gmail/Drive capability grammar;
- GovernedContext semantics;
- attention policies;
- scoring;
- ranking;
- priority inference;
- severity inference;
- machine learning;
- LLM salience;
- background jobs;
- notifications;
- persistence;
- role inference;
- action proposals;
- approvals;
- execution;
- voice behaviour;
- UI;
- API routes;
- legacy runtime convergence.

No production TypeScript/TSX change is authorized.

## 7. Deliverables

Create exactly:

`docs/audits/SPRINT-3.153-EXECUTIVE-COGNITION-ACTIVATION-AUDIT.md`

The audit must include:

1. Executive conclusion;
2. audited commit;
3. files and governing artefacts reviewed;
4. runtime/cognition architecture map;
5. minimum-transformation map derived from the real question;
6. existing-stage classification table (Load-bearing / Not required for this capability / Unproven);
7. stage-by-stage input/output table for load-bearing or inspected stages;
8. production caller map;
9. attention policy inventory;
10. identity/provenance continuity findings;
11. temporal/snapshot requirements;
12. first proving scenario;
13. named blockers;
14. recommendation for exactly one next sprint.

The next-sprint recommendation must be one of:

- **Implement bounded Attention Brief seam**
- **Govern one named missing seam**
- **Executive Cognition activation blocked pending architecture correction**

Do not recommend multiple simultaneous implementation tracks.

## 8. Acceptance criteria

Sprint 3.153 is complete only when:

- the roadmap has been reconciled to the post-3.152c repository state;
- the audit uses the actual merged `main` implementation;
- the minimum required transformations are derived from the real question before existing-stage mapping;
- every inspected EOS stage is classified as Load-bearing, Not required for this capability, or Unproven;
- no stage is wired or recommended merely because it already exists;
- a mostly "Not required for this capability" result is accepted without architectural completion pressure;
- every claimed production path is proven by caller tracing;
- every unsupported connection is labelled UNKNOWN or absent;
- the Attention layer is not confused with ranking or prioritisation;
- no LLM is given factual or priority authority;
- no source authority is broadened;
- no production code changes;
- no speculative role model;
- one bounded next sprint is derived from evidence.

## 9. Validation

For this documentation-only sprint run:

```bash
npm test
npm run lint
npm run typecheck
npm run build
git diff --check
```

If repository policy or environment prevents one command from completing, report the exact failure rather than substituting a claim.

## 10. Exit condition

The sprint exits only when we can truthfully answer:

> What minimum deterministic information transformations are actually required for JARVIS to answer “What needs my attention?” today; which existing EOS stages genuinely provide those transformations; and what is the smallest missing seam—if any—between the required capability and current governed operational evidence?

No implementation begins until that answer is evidence-backed.
