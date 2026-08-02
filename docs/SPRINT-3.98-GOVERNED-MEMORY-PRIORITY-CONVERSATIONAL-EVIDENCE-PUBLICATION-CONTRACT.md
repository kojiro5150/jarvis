# Sprint 3.98 — Governed Memory Priority Conversational Evidence Publication Contract

**Status:** Specification  
**Sprint Type:** Governance Decision / Publication Contract  
**Implementation Authority:** None  
**Production Integration:** Prohibited  
**Governing Trigger:** Sprint 3.88 — Governed Conversational Production Evidence Audit

## 1. Recommendation

**Decision:** Approve this governed Memory Priority conversational evidence publication
contract.

The current flat `Priority` shape does not contain enough provenance to classify every
existing entry honestly as either `operator_priority` or `derived_interpretation`.
No priority shall become governed conversational memory evidence until explicit
write-time or attestation-time provenance establishes its classification and stable
identity. Existing priorities shall not be silently defaulted.

## 2. Repository Precondition

| Item | Confirmed result |
| --- | --- |
| Repository | `/workspace/jarvis` |
| Branch | `work` |
| Starting commit | `2c80fbe2485c4648b5ad7f4075fe42386bd6bf4a` |
| Starting working tree | Clean |
| Sprint 3.96 | Present and committed in repository history |
| Sprint 3.97 | Present and committed in repository history |

The following required artefacts exist:

```text
docs/SPRINT-3.96-GOVERNED-GMAIL-CONVERSATIONAL-EVIDENCE-PUBLICATION-CONTRACT.md
docs/SPRINT-3.97-GOVERNED-CALENDAR-CONVERSATIONAL-EVIDENCE-PUBLICATION-CONTRACT.md
docs/audits/SPRINT-3.88-GOVERNED-CONVERSATIONAL-PRODUCTION-EVIDENCE-AUDIT.md
docs/CONSTITUTIONAL-PUBLICATION-PRINCIPLES.md
docs/architecture/ROADMAP.md
lib/memory/schema.ts
lib/memory/store.ts
lib/memory/seed.ts
app/api/memory/route.ts
components/MemoryEditor.tsx
lib/governed-conversation/projection-composer.ts
```

No repository evidence differed materially from the governing trigger or direct
precedents.

## 3. Governing Artefacts Reviewed

The following materials were read completely:

1. `docs/ENGINEERING_CONSTITUTION.md`;
2. `docs/architecture/NORTH_STAR.md`;
3. `docs/architecture/JARVIS-Engineering-Specification-Standard.md`;
4. `docs/CONSTITUTIONAL-PUBLICATION-PRINCIPLES.md`;
5. `docs/architecture/ROADMAP.md`;
6. Sprint 3.88, including its complete Memory/Priority finding;
7. Sprint 3.96;
8. Sprint 3.97;
9. `lib/memory/schema.ts`;
10. `lib/memory/store.ts`;
11. `lib/memory/seed.ts`;
12. `app/api/memory/route.ts`;
13. `components/MemoryEditor.tsx`;
14. `lib/operational-state.ts`; and
15. `lib/governed-conversation/projection-composer.ts`.

This contract applies the governing hierarchy in that order. It does not reopen claims,
conflicts, projection identity, Gmail, Calendar, conversational model authority, or
evidence-status semantics.

## 4. Current Memory Architecture

```text
SEED_MEMORY
    ↓
data/memory.json
    ↓
readMemory / writeMemory / updateMemory
    ↓
OperationalState.priorities
```

The current shape is:

```ts
interface Priority {
  rank: number;
  title: string;
  detail: string;
  due: string;
  urgent?: boolean;
}
```

It contains no stable priority ID, writer identity, source owner, classification,
item-level creation or update time, attestation, derivation reference, parent evidence,
or provenance record. `MemoryStore.updatedAt` records a whole-store write, not the
creation or last modification of an individual priority.

## 5. Write-Path Investigation

Repository-wide searches established the following complete current write path:

```text
MemoryEditor.handleSave
    ↓ PATCH /api/memory with the complete priorities array
app/api/memory/route.ts PATCH
    ↓ updateMemory(body)
lib/memory/store.ts updateMemory
    ↓ writeMemory({ ...current, ...patch })
data/memory.json
```

`writeMemory` has one repository caller: `updateMemory`. `updateMemory` has one
repository caller: `PATCH /api/memory`. The normal production UI caller of that route is
`MemoryEditor`. It adds, edits, deletes, and reorders priorities, edits title, detail,
and due text, sets `urgent`, and saves the entire array.

`PATCH /api/memory` validates only patchable array keys. It records no authenticated
actor, writer class, creation method, or source classification.

`SEED_MEMORY` becomes runtime memory through both initial file creation and read-error
fallback. Seed and subsequently supplied priority entries have the same flat shape.

Searches of agents, LLM execution, scheduled processes, automations, connectors,
projection engines, context builders, server jobs, and all callers found no current
agent or automation writing local-memory priorities. Agents and context builders read
`OperationalState.priorities`; they do not call the memory write functions or route.

The separate Executive Operating System priority types and Dawnwatch presentation
provenance are not producers of `GovernedMemoryPriorityReference` and do not establish
the authorship of flat `MemoryStore.priorities`. Test and evaluation fixtures that
construct `memoryPriorityReferences` are not production producers.

No production producer of `GovernedMemoryPriorityReference` or
`memoryPriorityReferences` exists. No current local-memory priority provenance type
exists.

**Binding factual conclusion:**

> Current stored priority bodies do not prove operator authorship.

The absence of a current agent writer is relevant. It does not establish durable
per-entry publication provenance.

# Part I — Classification Decision

## 6. Classification Options

### Option A — Default every current priority to `operator_priority`

**Rejected.** The operator-facing editor and absence of a current agent writer do not
survive as per-entry facts in storage. Seed values and generic API writes cannot be
distinguished from direct operator entries after storage. This default would convert
missing evidence into provenance.

### Option B — Classify by content

**Rejected.** First-person wording, analytical wording, rank, due text, and `urgent`
are content, not authorship evidence.

### Option C — Require explicit provenance for every publishable priority

**Selected.** Write-time or migration-time provenance shall establish stable identity,
source owner, classification, relevant time, and derivation references. Legacy entries
remain operational but ineligible until attested or republished with provenance.

### Option D — Permanently publish every current entry as unavailable

**Rejected.** Withholding a synthetic reference is the truthful interim result, but a
permanent unavailable-only architecture would not define the required publication path.

## 7. Classification Decision

> **Option C — Explicit provenance is mandatory.**

A priority shall be classified `operator_priority` only when governed provenance
establishes direct operator creation or explicit operator review and attestation.

A priority shall be classified `derived_interpretation` only when governed provenance
identifies the authorised deriving process, its derivation owner, and its source evidence
or parent publication. It shall not be relabelled as operator-authored.

No classification shall be computed from priority content.

## 8. Existing Entry Decision

Existing flat priorities are **unattested legacy priority records** for migration. This
is not a third classification value.

> Existing flat priorities emit no governed priority reference until explicitly
> attested or republished with provenance.

They remain available to legacy operational memory. Legacy usability does not confer
governed evidentiary authority.

An operator-attestation migration shall require per-entry confirmation that the entry is
the operator's stated priority. Confirmation shall create a stable ID,
`operator_priority` classification, operator owner, attestation timestamp, and a
reference to the migrated record or snapshot. Silent bulk classification is prohibited.
Seed entries require the same attestation.

## 9. Future Derived Priorities

This contract does not authorise an agent or model to write priorities. A separately
authorised derived writer shall preserve `derived_interpretation`, derivation owner,
source-publication references, derivation ruleset, creation time, and stable identity.
A derived priority shall never be stored in a form indistinguishable from an operator
priority.

# Part II — Urgency Boundary

## 10. `urgent?: boolean` Decision

> `urgent` influences none of the seven governed publication fields.

It shall not influence `memoryReference`, `sourceOwner`, `freshness`, `available`,
`classification`, `policyReference`, or content-digest presence. It shall not prove
operator authorship or promote a derived interpretation.

An attested urgency flag can support the separately governed, source-attributed fact
that the operator marked a priority urgent. It does not establish objective urgency,
required action, comparative importance, or JARVIS endorsement. Sprint 3.98 creates no
claim/evidence mapping for that fact.

# Part III — Provenance and Identity Architecture

## 11. Required Provenance

A publishable priority requires, at minimum:

```text
priorityId
sourceOwner
classification
createdAt
updatedAt
attestedAt?                 # operator attestation
derivationReference?        # derived interpretation
sourcePublicationReferences?
availability/lifecycle state
```

The implementation type name is not governed here. These semantics are required.

## 12. Stable Priority Identity

`rank` is mutable order and shall not be identity. `title` is mutable and duplicable and
shall not be identity. A body hash shall not be sole identity because ordinary edits
would replace the identity.

Each priority receives a stable `priorityId` when it becomes a governed memory
publication. That ID survives rank, title, detail, due-date, and urgency changes. A
genuinely new priority receives a new ID.

One stable ID identifies one continuing canonical priority-publication lineage. The
conversational reference points to that identity; it does not construct a competing
priority publication. Stored priority and provenance shall either be one record or have
a direct one-to-one, identity-coherent link. Rank- or title-based joins are prohibited.

## 13. Source Owner

For a direct or attested operator priority:

```text
sourceOwner = authenticated operator identity
```

Until a governed stable operator-identity publication exists, implementation must use
one fixed owner reference explicitly established for the single-user installation. It
shall not infer owner from display name, request text, wording, urgency, browser state,
or model output.

For a derived interpretation:

```text
sourceOwner = governed deriving agent/process identity
```

The publisher shall copy that governed owner and shall not substitute the operator.

# Part IV — Seven-Field Mapping

## 14. Binding Field Matrix

| Field | Binding source | Decision |
| --- | --- | --- |
| `memoryReference` | Stable governed priority ID | Deterministic |
| `sourceOwner` | Governed priority provenance | Deterministic |
| `freshness` | Priority-level governed update time | Deterministic |
| `available` | Present, available, provenance-complete governed priority | Deterministic |
| `classification` | Explicit provenance classification | Deterministic |
| `policyReference` | Fixed versioned disclosure policy | Deterministic |
| `contentDigest` | No value | Explicitly absent in v1 |

No field remains unresolved.

## 15. Exact Mapping

For governed priority publication `P`:

```text
memoryReference
    = "jarvis-memory:priority:" + P.priorityId

sourceOwner
    = P.provenance.sourceOwner

freshness
    = P.provenance.updatedAt

available
    = P.lifecycleState === "available"
      AND all required provenance is valid

classification
    = P.provenance.classification

policyReference
    = "governed-memory-priority-conversational-disclosure.v1"

contentDigest
    = absent
```

No model judgment, content heuristic, hidden clock, rank, title wording, due text, or
urgency participates.

## 16. `memoryReference`

The exact namespace is:

```text
jarvis-memory:priority:<priorityId>
```

It refers to the canonical governed priority. Repository search found no existing use
of this namespace and therefore no namespace conflict.

## 17. Freshness Decision

> Priority-level governed `updatedAt` is required; whole-store `updatedAt` is not item
> freshness.

For an attested legacy priority, `updatedAt` shall equal attestation/migration time
unless migration has independently supported, more precise item-update evidence.
Migration shall not copy `MemoryStore.updatedAt` as an item timestamp. The store time
can remain snapshot context but is not this field.

## 18. Availability

`available` is true only when the canonical priority currently exists, has a stable ID,
owner, valid classification and item freshness, validates all required provenance, and
has not been deleted, withdrawn, or superseded as unavailable.

An unattested legacy entry emits no reference. It does not emit a synthetic reference
with `available = false`. Availability describes an actual governed publication; it
does not repair absent provenance.

## 19. Classification

The only values are:

```text
operator_priority
derived_interpretation
```

The publisher validates and preserves upstream classification. It shall not calculate
classification from the body or caller.

## 20. Content Digest Decision

> Absent in v1.

The current body has no governed canonical serialization or immutable body publication.
Hashing JSON or selected fields would introduce an unauthorised canonicalisation and
identity decision. A later integrity contract must define any digest.

# Part V — Disclosure Policy

## 21. Policy Reference

```text
governed-memory-priority-conversational-disclosure.v1
```

This fixed, versioned constant is not publication identity, runtime state, model output,
or a user preference. No mutable policy registry is required for v1. Repository search
found no conflicting use of this identifier.

## 22. Permitted Disclosure

The policy authorises a governed conversational projection to reference priority
identity, source owner, classification, item freshness, availability, and policy
identity. Separately governed source selection can retrieve bounded canonical priority
content relevant to a governed claim. The reference itself remains referential.

## 23. Prohibited Disclosure and Inference

The publisher shall not infer objective urgency or importance, comparative priority,
executive commitment, approval, obligation, deadline certainty, project membership,
completion, or source truth beyond the identified owner's stated or derived position.

The policy does not authorise unrestricted copying of every priority, detail, due field,
urgency flag, or the complete memory store into a model request.

`operator_priority` means directly stated or explicitly attested by the operator. It
does not mean objectively correct, highest-ranked forever, evidence-overriding, or
independently endorsed by JARVIS.

`derived_interpretation` means an identified authorised process produced a governed
interpretation from identified upstream evidence. It shall remain visibly derived. An
operator attestation that changes this responsibility requires an explicit new
provenance event under a separately governed workflow.

# Part VI — Store, Dependency, and Failure Responsibility

## 24. Existing Store Role

`lib/memory/store.ts` remains Phase-1 persistence. This contract does not authorise a
new backend, Supabase, database migration, event sourcing, agent writes, or automatic
derivation. A future implementation shall extend a stored priority or maintain a
directly linked provenance record with one coherent stable identity; it shall not create
an unrelated copy joined by rank or title.

## 25. Dependency Decision

> Current `Priority` alone is insufficient; governed priority provenance is required
> first.

The publisher is not a pure function of the current `Priority`. It requires the
canonical governed priority publication, governed provenance, lifecycle availability,
and the fixed Sprint 3.98 policy constant.

## 26. Fail-Closed Eligibility

The future publisher shall emit no `GovernedMemoryPriorityReference` unless all of the
following are valid:

```text
priorityId
priority identity
sourceOwner
classification
priority-level updatedAt
available lifecycle state
publication/provenance identity correspondence
```

Missing classification shall not default from content, urgency, route, or absence of
agent writers. Missing owner shall not become `unknown`, `memory`, or `system`. A
whole-store timestamp shall not substitute for missing item freshness. Seed and fallback
entries remain compatibility data until explicitly attested.

# Part VII — Claims and Conflicts

## 27. Downstream Boundaries

The publisher does not decide the operator's question, relevance, claim support,
claim-specific staleness, evidence ordering, or conflicts. Existing claims and conflict
governance applies. The rule remains **restrict, do not adjudicate**.

Classification is not evidence status. An operator or derived priority can be available
yet stale for a claim, conflicted, or outside scope. Downstream evidence rules retain
that responsibility.

# Part VIII — Publication Responsibility Audit

## 28. Audit

| Question | Binding answer |
| --- | --- |
| Does the current `Priority` body contain provenance? | No |
| Can every current entry honestly default to `operator_priority`? | No |
| Does repository search show an active local-memory priority writer? | No |
| Does writer absence prove every stored entry's authorship? | No |
| Is explicit provenance required before governed publication? | Yes |
| Can existing priorities be migrated through operator attestation? | Yes |
| Can seed entries default to operator-authored? | No |
| Can `urgent` determine classification? | No |
| Can `urgent` determine availability? | No |
| Is stable per-priority identity required? | Yes |
| Can rank serve as identity? | No |
| Can whole-store `updatedAt` serve as item freshness? | No |
| Is a fixed disclosure policy required? | Yes |
| Is a mutable policy registry required? | No |
| Is content digest required in v1? | No |
| Does mapping create a second priority publication? | No |
| Does this contract authorise agent writes? | No |
| Does this contract change claim/conflict governance? | No |
| Does this contract preserve Identity Integrity? | Yes |

**Decision:** Publication Responsibility Audit passes. The publication architecture is
truthful only with provenance-first eligibility.

# Part IX — Future Implementation and Tests

## 29. Required Sequence

1. **Sprint 3.99 — Governed Memory Priority Identity and Provenance Implementation:**
   add stable identity, item provenance, owner, explicit classification, item timestamps,
   lifecycle, and per-entry migration/attestation.
2. A later isolated sprint shall implement a deterministic publisher equivalent to
   `projectMemoryPriorityReferences(...)`.
3. A separate integration sprint shall wire governed memory evidence into production
   conversation.

Sprint 3.98 authorises none of these implementation steps.

## 30. Required Future Test Contract

The provenance implementation shall prove operator creation and attestation, seed
ineligibility before attestation, rejection of generic provenance-free writes, governed
derived classification, owner integrity, stable identity across reorder and body edits,
new identity for a new priority, and unavailability after deletion or withdrawal.

The publisher tests shall prove all seven exact mappings, both classifications, absent
digest, deterministic replay, and independence from urgency, rank, and wording.

Negative tests shall reject missing or duplicate IDs, missing or arbitrary owners,
missing or invalid classifications, missing item freshness, store time masquerading as
item freshness, unattested seeds, a direct flat `Priority`, urgency-based provenance,
derived-to-operator relabelling, invented digest, and unknown policy reference.

Identity tests shall prove stable identity across rank/body changes, non-aliasing,
canonical-ID references, no second publication, explicit version linkage, and identical
references on replay.

# Part X — No-Implementation Statement

## 31. No Implementation Authorised

> Sprint 3.98 authorizes no code change, schema migration, publisher, integration, or
> `/api/chat` modification.

It does not authorise changes to `Priority`, `MemoryStore`, `/api/memory`,
`MemoryEditor`, seed data, production wiring, or agent write authority. This sprint
establishes governance only.

# Part XI — Validation and Completion Record

## 32. Validation

The required full validation sequence was run after this contract was written:

| Command | Result |
| --- | --- |
| `npm test` | Pass |
| `npm run build` | Pass |
| `npm run lint` | Pass |
| `npm run typecheck` | Pass |
| `git diff --check` | Pass |

Repository-wide `rg` searches additionally confirmed every `writeMemory`,
`updateMemory`, `/api/memory`, `priorities`, `GovernedMemoryPriorityReference`, and
`memoryPriorityReferences` reference; no unreviewed automated writer; no production
memory-priority reference producer; no current local-priority provenance authority; no
policy or identity-namespace conflict; and no modification to `/api/chat`.

## 33. Files Changed

Only:

```text
docs/SPRINT-3.98-GOVERNED-MEMORY-PRIORITY-CONVERSATIONAL-EVIDENCE-PUBLICATION-CONTRACT.md
```

No code, schema, test, fixture, existing documentation, or production file changed.

## 34. Binding Architecture

```text
operator or authorised deriving process
    ↓
governed priority write
    ├── stable priorityId
    ├── sourceOwner
    ├── classification
    ├── createdAt / updatedAt
    ├── attestation or derivation provenance
    └── lifecycle availability
    ↓
canonical governed memory priority
    ↓ deterministic Sprint 3.98 mapping
GovernedMemoryPriorityReference
    ↓
GovernedConversationalProjection
```

The binding rule is:

```text
no agent writer found
≠
proof that every stored priority is operator-authored
```

The flat store body is not provenance. Seed data is not attestation. A generic API
write is not source identity. Urgency is not authorship. Rank is not identity.
Whole-store freshness is not item freshness. Missing provenance shall never become
certainty.

## 35. Next Step

> **Sprint 3.99 — Governed Memory Priority Identity and Provenance Implementation**

**Governed Contract Complete**
