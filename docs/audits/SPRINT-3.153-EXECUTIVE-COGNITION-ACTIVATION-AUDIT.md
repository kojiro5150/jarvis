# Sprint 3.153 — Executive Cognition Activation Audit

**Status:** Audit complete  
**Audit type:** Architecture / scope discipline  
**Audited baseline:** `58c588da9a33aed024e1cd9f22ecb7af5e910281`  
**Primary proving question:** **What needs my attention?**  
**Production code changed:** No

## 1. Executive conclusion

Sprint 3.153 confirms the concern that motivated the Executive Cognition Scope Discipline: the full historical EOS pipeline is not required to answer the first real everyday question.

For **“What needs my attention?”**, the minimum deterministic capability is materially smaller:

```text
authorized governed observation
→ canonical stable observation
→ previous/current snapshot pair
→ deterministic structural change
→ deterministic attention policy selection
→ structured attention brief
→ concise conversational rendering
```

Only the observation/canonicalisation, snapshot/change, and Attention layers are load-bearing for this capability.

Situation Formation, Situation Assessment, Executive Deliberation Context, Intent & Constraints, Candidate Construction, Candidate Evaluation, Candidate Comparison, Executive Reasoning, Governed Action Proposal, and the capability invocation/execution chain are **not required for this capability**. Their existence is not evidence that they should be wired into the everyday conversational path.

This sparse result is a successful application of the scope discipline.

The existing isolated EOS machinery already proves that Calendar-derived canonical changes can produce deterministic Attention Records. However, the live governed conversational path cannot yet honestly produce this capability end-to-end. Three structural seams remain:

1. the live governed Calendar evidence publication is not mapped into the canonical EOS projection/state boundary without reacquiring the connector;
2. the snapshot lifecycle requires a previous canonical snapshot, but there is no production conversational owner/persistence contract for that previous snapshot;
3. there is no bounded Attention Brief publication/rendering contract on the governed conversational path.

Therefore the audit outcome is **Outcome C — Multiple structural gaps**.

The next sprint must still remain singular and bounded:

> **Govern one named missing seam: Governed Evidence → Canonical Attention Observation Boundary.**

Do not wire the full EOS runtime.

---

## 2. Scope-discipline derivation: start from the question, not the pipeline

The question is:

> **What needs my attention?**

An honest answer requires a bounded definition of “attention.” The existing accepted attention architecture already provides one that is sufficiently narrow:

> a canonical change that matches an explicit deterministic Attention Policy.

This avoids introducing urgency, importance, ranking, recommendation, preference learning, or LLM salience.

### Minimum required transformations

| # | Transformation | Required input | Required output | Why necessary | Temporal requirement | Semantic role |
|---|---|---|---|---|---|---|
| 1 | Governed observation acquisition | explicit current authority + source capability | bounded source observation | facts must originate from an authorised source boundary | current | acquisition only |
| 2 | Canonical stable observation | governed observation with stable identity and observed fields | canonical entity/source state | change comparison requires provider-independent stable identity and typed fields | current | canonicalisation |
| 3 | Snapshot ownership | canonical previous and current states with explicit observation times | ordered snapshot pair | a change cannot be asserted from one state | previous + current | temporal ownership |
| 4 | Structural change detection | previous/current canonical snapshots | added/modified/removed canonical changes | attention policies operate on changes, not raw observations | previous + current | factual comparison |
| 5 | Deterministic attention selection | canonical change set + governed policy registry | Attention Records / Queue | defines which changes qualify for downstream inspection | change set | deterministic selection; no ranking |
| 6 | Attention Brief publication | Attention Records | bounded structured brief | conversation should consume a smaller inspectable publication, not the entire EOS result | current derived record | publication |
| 7 | Conversational rendering | structured Attention Brief | concise user-facing answer | user needs understandable prose | current | rendering only |

No planning, recommendation, candidate generation, comparative analysis, executive reasoning, or action proposal is required to answer the question as defined.

---

## 3. Existing-stage classification

| Existing stage / layer | Classification | Finding |
|---|---|---|
| Governed private acquisition | **Load-bearing** | Required to obtain current private observations without manufacturing authority. The governed Calendar route already proves ASK/ALLOW acquisition semantics. |
| Projection / canonicalisation | **Load-bearing** | Stable canonical identity and typed timestamps are required before trustworthy comparison. |
| State assembly / Situational Awareness | **Load-bearing** | Provides the canonical provider-independent state boundary. |
| Snapshot Lifecycle | **Load-bearing** | Explicit previous/current snapshots are required for structural change. |
| Executive Attention | **Load-bearing** | Existing deterministic policies already select cancellation, start-time change, removal, and source-unavailable transitions. |
| Executive Context Derivation | **Not required for this capability** | “What changed under an explicit attention policy?” does not require active role/project context. |
| Situation Formation | **Not required for this capability** | Grouping changes into interpreted situations is unnecessary for a bounded list of matched Attention Records. |
| Situation Assessment | **Not required for this capability** | Assessment adds interpretation beyond the factual policy match. |
| Executive Deliberation Context | **Not required for this capability** | No deliberation is required to report selected changes. |
| Intent & Constraints | **Not required for this capability** | The user asked for attention items, not planning intent. |
| Candidate Plan Construction | **Not required for this capability** | No options are requested. |
| Candidate Plan Evaluation | **Not required for this capability** | No candidate plans exist or are needed. |
| Candidate Plan Comparison | **Not required for this capability** | No comparative choice is requested. |
| Executive Reasoning | **Not required for this capability** | Reporting deterministic attention records does not require a recommendation or reasoned choice. |
| Governed Action Proposal | **Not required for this capability** | Attention is not action. |
| Capability routing / invocation / execution | **Not required for this capability** | The first capability is read/brief only after source acquisition; no downstream action is authorised or required. |
| Executive Run Record | **Unproven for this capability** | A durable audit publication may later be useful, but the question itself does not demonstrate that the full EOS run-record contract is required. |
| Attention Brief publication | **Missing but required** | No current bounded publication exists between Attention Queue and ordinary conversational rendering. |

### Scope result

The historical runtime contains nineteen ordered runtime stages, but the first everyday attention capability does not justify wiring most of them.

That is evidence **against** architectural-completeness integration.

---

## 4. OBSERVED / INFERRED / UNKNOWN findings

## A. Input ownership

### OBSERVED

- `/api/lighter/chat` resolves governed private operations before ordinary model work.
- Current authorised Calendar acquisition returns governed Calendar evidence containing a stable `commitmentReference`, source reference, start, end, timezone, provenance reference, coverage limit and policy reference.
- The current conversational Calendar GovernedContext deliberately projects only start/end plus user-supplied exact bindings.
- The EOS canonical Calendar projection path is different: `CalendarProjectionAdapter` owns a connector and calls `listUpcoming()` itself.
- EOS `ProjectionArtifact` requires canonical entities plus provenance.
- `OperationalCommitment` has stable `id`, title, status, start timestamp and due timestamp.
- `SituationalAwarenessEngine` requires current projection artifacts **and a caller-supplied previous snapshot**.
- `ExecutiveOperatingSystemInput` also requires `previousSnapshot`.

### INFERRED

The live conversational Calendar evidence cannot be passed directly into the existing `CalendarProjectionAdapter` without either:
- reacquiring the connector; or
- constructing an artificial connector wrapper around already-acquired evidence.

The former would violate the authority/acquisition boundary. The latter would hide a new semantic ownership boundary inside an adapter-shaped workaround.

Therefore a separate bounded **governed-evidence-to-canonical observation** contract is warranted before any attention activation.

### UNKNOWN

No current production owner is proven for a durable previous EOS snapshot on the governed conversational path.

---

## B. Attention semantics

### OBSERVED

The initial policy registry contains exactly four policies:

| Policy | Match | Reason code |
|---|---|---|
| `attention.commitment.cancelled@1.0.0` | commitment status changes to cancelled | `commitment.status.changed-to-cancelled` |
| `attention.commitment.start-time-changed@1.0.0` | same canonical commitment id, changed `startsAt` | `commitment.start-time.changed` |
| `attention.commitment.removed@1.0.0` | commitment present previously, absent currently | `commitment.absent-from-current-snapshot` |
| `attention.source.became-unavailable@1.0.0` | source available → unavailable | `source.availability.changed-to-unavailable` |

The Attention Engine:
- consumes only a canonical `SituationalAwarenessChangeSet`;
- produces immutable Attention Records;
- retains previous/current canonical values;
- records policy identity/version and structured reason evidence;
- uses structural deterministic ordering;
- performs no scoring, ranking, interpretation or model work.

### Conclusion

The existing Attention Queue is sufficient as the **selection** layer for the first capability.

It is not itself a user-facing brief.

---

## C. Identity and provenance continuity

### OBSERVED

The EOS projection/state path retains:
- stable canonical entity identifiers;
- projection `sourceId`, `sourceKind`, `adapterId`, `projectedAt`, availability;
- Executive State Snapshot provenance.

The lifecycle change set retains:
- canonical entity id;
- previous/current records;
- previous/current snapshot ids;
- previous/current observed times at the change-set level.

Attention Records retain:
- entity id;
- previous/current records;
- previous/current snapshot ids;
- policy identity/version;
- structured policy evidence.

### Gap

The live governed Calendar evidence uses a different identity vocabulary:
- `commitmentReference`;
- `sourceReference`;
- `provenanceReference`;
- disclosure policy identity.

There is no production mapping proving that this governed evidence identity becomes the EOS canonical commitment identity/provenance **without loss or reacquisition**.

That is the first missing seam.

---

## D. Temporal / snapshot requirements

### OBSERVED

`compareSituationalAwarenessSnapshots(previous, current)` rejects reversed observation order and compares stable canonical ids.

All existing initial Attention Policies depend on a `SituationalAwarenessChangeSet`.

The current EOS runtime input requires:
- current projection artifacts;
- caller-supplied `previousSnapshot`;
- new `snapshotId`;
- new `observedAt`.

ADR-0008 explicitly excluded persistence.

ADR-0009 also excluded attention persistence.

### Conclusion

A single current Calendar read is insufficient to answer the first change-based attention capability.

A truthful answer requires an explicitly owned previous canonical observation boundary.

There is currently no proven production conversational owner for that history.

---

## E. Conversational rendering boundary

### Minimum future publication

A future structured Attention Brief should be smaller than the full Attention Queue and should not expose raw connector data.

Minimum fields, where supported:

```ts
type AttentionBriefItem = {
  attentionId: string
  policy: { id: string; version: string }
  domain: string
  entityId?: string
  changeType: "added" | "modified" | "removed"
  reason: {
    code: string
    message: string
    evidence: readonly { field: string; value: string | number | boolean | null }[]
  }
  previousSnapshotId: string
  currentSnapshotId: string
}

type AttentionBrief = {
  briefId: string
  items: readonly AttentionBriefItem[]
  semantics: "deterministic_policy_match_not_priority"
}
```

The precise contract is not implemented in this sprint.

### Model boundary

A model could safely render a bounded brief **only if**:
- the factual items are already fully determined server-side;
- the model cannot add records, ranking, urgency, cause or recommendations;
- a deterministic fallback renderer exists;
- any prose drift is bounded/validated similarly to current Calendar projection fidelity.

Whether a model is needed at all is unproven. A deterministic textual renderer may be sufficient for the first capability.

---

## F. First proving scenario

The repository already proves the correct first scenario in isolation:

```text
previous canonical Calendar snapshot:
  commitment google-calendar:executive:board exists

current canonical Calendar snapshot:
  same commitment absent

deterministic lifecycle:
  commitments / removed

attention policy:
  attention.commitment.removed

attention record:
  reason = commitment.absent-from-current-snapshot
```

This is appropriate because the policy wording remains bounded:

> present previously and absent currently

It does not claim cancellation, deletion, intent, cause or urgency.

For the future live proving test, start-time change may be even clearer because it avoids observation-window ambiguity:

```text
same stable commitment id
previous startsAt = 10:00
current startsAt = 11:00
→ commitment.start-time.changed
```

---

## 5. Runtime and caller map

### OBSERVED canonical EOS runtime

The standalone deterministic runtime executes:

```text
state assembly
→ executive context derivation
→ snapshot lifecycle
→ executive attention
→ situation formation
→ situation assessment
→ executive deliberation context
→ intent and constraints
→ candidate plan construction
→ candidate plan evaluation
→ candidate plan comparison
→ executive reasoning
→ governed action proposal
→ capability routing
→ invocation handoff
→ invocation envelope
→ invocation
→ execution
→ executive run record
```

### Production reachability finding

Repository search finds `DeterministicExecutiveOperatingSystemRuntime` production construction in `app/api/eos/run/route.ts`, plus scripts/tests.

No in-repository caller from the governed JARVIS conversational route to `/api/eos/run` was found.

Therefore the canonical EOS runtime is production-exposed as an API boundary, but it is not the current everyday governed conversational path.

This matters: **do not integrate `/api/lighter/chat` with the full `/api/eos/run` runtime merely because that route already exists.**

---

## 6. Minimum capability map

### Map 1 — Question-derived architecture

```text
current authorised governed source evidence
        ↓
canonical stable observation
        ↓
explicit previous/current observation ownership
        ↓
deterministic change set
        ↓
explicit deterministic Attention Policies
        ↓
Attention Records
        ↓
bounded Attention Brief
        ↓
deterministic or tightly bounded conversational rendering
```

### Map 2 — Existing-stage fit

```text
governed acquisition                         LOAD-BEARING / live
        ↓
governed evidence → EOS canonical observation MISSING SEAM #1
        ↓
Situational Awareness / Snapshot             LOAD-BEARING / isolated
        ↓
previous snapshot production ownership        MISSING SEAM #2
        ↓
Snapshot comparison                           LOAD-BEARING / implemented
        ↓
Executive Attention                           LOAD-BEARING / implemented
        ↓
Attention Brief publication                   MISSING SEAM #3
        ↓
conversation                                  not yet integrated

Situation Formation onward                    NOT REQUIRED FOR THIS CAPABILITY
```

---

## 7. Named blockers

### Blocker 1 — Governed evidence → canonical observation ownership

The live private-source path publishes governed Calendar evidence under conversational disclosure rules.

The existing canonical Calendar adapter is connector-owning and performs acquisition itself.

There is no explicit production contract saying:

> Given already-authorised governed Calendar evidence, deterministically create exactly the bounded canonical observation needed for attention without any additional source access.

This is the **earliest blocker**.

### Blocker 2 — previous snapshot owner

The lifecycle is deliberately pure and caller-driven.

No production conversational component currently owns:
- previous snapshot retention;
- replacement rules;
- source/window compatibility;
- restart/durability semantics.

Attention cannot honestly assert change until that ownership is governed.

### Blocker 3 — Attention Brief publication/rendering

The Attention Queue exists, but there is no everyday conversational publication contract.

The full EOS result is too large and includes stages not required for this capability.

---

## 8. Readiness outcome

**Outcome C — Multiple structural gaps.**

This does **not** mean the EOS architecture failed.

The opposite is true: its lower deterministic boundaries are reusable, while the scope discipline prevents the rest of the historical pipeline from being dragged into the product without need.

The first capability is **not directly activatable yet**.

---

## 9. Exactly one next sprint

### Recommendation: **Govern one named missing seam**

**Next sprint title:**

> **Sprint 3.154 — Governed Evidence to Canonical Attention Observation Contract**

### One question

> How may already-authorised governed Calendar evidence become a canonical attention observation without reacquiring Calendar, widening disclosure, inventing title/status semantics, or depending on the full EOS runtime?

### Required boundary

Input should be the existing governed Calendar evidence publication, not a connector.

Output should be only the minimum canonical representation required by the selected proving policy.

For a first start-time-change proof, likely minimum semantics are:

- stable canonical commitment id derived deterministically from governed commitment/source identity;
- start timestamp;
- bounded end timestamp only if canonical contract requires it;
- source/provenance reference;
- explicit observation time;
- no title reconstruction;
- no role/project inference;
- no cancellation inference;
- no connector call.

If the current `OperationalCommitment` contract cannot represent this without inventing required title/status fields, Sprint 3.154 must stop and report that as the exact contract mismatch rather than filling those fields with synthetic content.

### Explicit exclusions

Sprint 3.154 must not:
- persist snapshots;
- build the Attention Brief;
- invoke the Attention Engine in production;
- integrate the full EOS runtime;
- add Situation Formation or later stages;
- add ranking;
- add action;
- change source authority.

---

## 10. Final scope-discipline verdict

The first real Executive Cognition question did **not** justify the twelve-stage historical pipeline.

It justified approximately this much:

```text
canonical observation
→ temporal comparison
→ deterministic attention selection
→ bounded rendering
```

That is the desired result of the scope discipline.

JARVIS should now become simpler at the production boundary, not more architecturally complete.
