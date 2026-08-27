# Sprint 3.153 — Executive Cognition Activation Audit

**Status:** Specification  
**Sprint type:** Architecture reconciliation and audit  
**Implementation authority:** None  
**Production integration:** Prohibited  
**Starting baseline:** `cef9440bf8b0e3027187f33412eb10fe3ee2a811`  
**Primary proving question:** **What needs my attention?**

## 1. Purpose

JARVIS now has a substantially hardened governed conversational path, bounded operation-level authority for Calendar/Gmail/Drive, server-owned pending authorization, private-history containment, typed/voice turn integrity, and a live Calendar GovernedContext path with 6/6 final acceptance.

The next architectural question is no longer primarily whether JARVIS can read private sources safely. It is whether the existing deterministic Executive Operating System can consume current truthful state and produce useful everyday cognition without handing factual or priority authority back to an LLM.

Sprint 3.153 therefore audits the existing Executive Cognition chain against the current production architecture.

It shall answer one bounded question:

> Can current governed operational evidence be transformed, through existing canonical EOS stages, into a deterministic and inspectable answer to “What needs my attention?” without inventing evidence, priority, severity, or action authority?

This sprint must not implement that path.

## 2. Governing constraints

Apply, in order:

1. Engineering Constitution;
2. North Star;
3. JARVIS Engineering Specification Standard;
4. accepted ADRs;
5. current `docs/architecture/ROADMAP.md`;
6. current authority architecture and `docs/AUTHORITY-MIGRATION-STATUS.md`;
7. current source and tests;
8. this sprint specification.

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

### Downstream cognition
- Situation Formation
- Situation Assessment
- Executive Context
- Intent & Constraints
- Candidate Construction
- Candidate Evaluation
- Candidate Comparison
- Executive Reasoning
- Governed Action Proposal

### Runtime composition
- `lib/executive-operating-system/runtime/engine.ts`
- runtime types and run records
- any current production callers of EOS runtime/cognition stages

Do not infer wiring from file presence. Follow imports and real callers.

## 4. Required audit findings

The audit must produce explicit **OBSERVED / INFERRED / UNKNOWN** findings for each question below.

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

Produce an evidence-backed map of the actual path, using one of these outcomes:

### Outcome A — Directly activatable
```text
authorized source
→ existing projection
→ existing snapshot lifecycle
→ existing change set
→ existing Attention Engine
→ future bounded Attention Brief
```

### Outcome B — One named missing seam
Same as A, but identify exactly one missing owner/contract blocking the chain.

### Outcome C — Multiple structural gaps
List each gap and stop. Do not hide them inside an implementation sprint.

The audit must not return “ready” merely because all packages compile independently.

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
5. stage-by-stage input/output table;
6. production caller map;
7. attention policy inventory;
8. identity/provenance continuity findings;
9. temporal/snapshot requirements;
10. first proving scenario;
11. named blockers;
12. recommendation for exactly one next sprint.

The next-sprint recommendation must be one of:

- **Implement bounded Attention Brief seam**
- **Govern one named missing seam**
- **Executive Cognition activation blocked pending architecture correction**

Do not recommend multiple simultaneous implementation tracks.

## 8. Acceptance criteria

Sprint 3.153 is complete only when:

- the roadmap has been reconciled to the post-3.152c repository state;
- the audit uses the actual merged `main` implementation;
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

> What exact deterministic path would allow JARVIS to answer “What needs my attention?” today, and what is the smallest missing seam—if any—between the governed operational evidence already proven and the existing Executive Attention machinery?

No implementation begins until that answer is evidence-backed.
