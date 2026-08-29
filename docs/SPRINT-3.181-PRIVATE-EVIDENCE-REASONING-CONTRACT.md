# Sprint 3.181 — Private Evidence Reasoning Contract

**Status:** Architecture contract only. No private-evidence semantic reasoning capability is authorised by this document.

## Purpose

Define the first boundary at which a reasoning model may receive governed private evidence for semantic composition, synthesis, interpretation or prioritisation.

The contract must answer:

> **What private evidence may become visible to a reasoning model, in what representation, for what purpose, for how long, and with what provenance and containment guarantees?**

This sprint defines the boundary. It does not implement Level-2 reasoning.

---

## Core invariants

> **Model visibility of private evidence grants reasoning context only. It grants neither authority nor truth status beyond the governed evidence supplied.**

> **Private evidence exposure must be purpose-bounded and minimal; acquisition authority does not imply unrestricted semantic exposure.**

> **The first point at which a model may receive governed private evidence for semantic composition, synthesis, interpretation or prioritisation is the Private Evidence Reasoning boundary.**

> **Referential continuity is not semantic evidence access. JARVIS may deterministically resolve a natural reference such as “the first one” against a bounded server-owned governed result set without exposing that result set to the model. Any subsequent private-data operation still requires its own legitimate authority.**

> **Later operations may discover that the world has changed. They may not rewrite what was previously observed.**

---

## Four separate truths

A later conversational operation over an earlier governed result must preserve four distinct states.

1. **Historical selection truth** — what the governed operation actually returned at time T.
2. **Referential truth** — what the user’s later bounded reference resolves to.
3. **Current operational truth** — whether the exact resource can still be retrieved or acted on now.
4. **Referential scope truth** — whether the historical result remains eligible to serve as an implicit conversational referent.

These states must not collapse into one generic `resolved` or `failed` flag.

A successful historical identity resolution does not assert current availability.

A later retrieval failure does not invalidate the historical observation.

---

## Governed result-set reference

A result set eligible for later deterministic reference must be represented server-side as an immutable bounded record.

Minimum shape:

```text
GovernedResultSetReference
  id
  capability
  resultSetType
  referentialClass
  supportedReferenceKinds
  orderedResourceIds
  originatingOperation
  createdAt
  expiresAt
  remainingReferenceTurns
  supersededBy?
```

Additional provider data may be retained only when separately justified by the originating governed operation.

The client may receive an opaque reference where transport requires one. Provider resource IDs do not need to be replayed into ordinary conversational history.

The model must not reconstruct resource identity from rendered prose.

---

## Referential eligibility

A governed result set is **eligible** to serve as an implicit conversational referent only while all of the following are true:

1. it was produced by a successfully authorised governed operation;
2. its ordered resource identities remain preserved server-side;
3. it has not been superseded by a later governed result set of the same referential class;
4. it has not exceeded its explicit lifetime;
5. it has not been explicitly invalidated; and
6. the containing conversation/session has not ended.

Eligibility is determined only by server-owned structural state.

It must not be inferred from conversational topic, model judgement, semantic similarity or apparent user intent.

---

## Referential class and supersession

A later **successfully produced** governed result set supersedes only an earlier result set of the **same referential class**.

A successful same-class result set supersedes the earlier set even when it contains zero resources. An empty newer result must not cause implicit fallback to an older non-empty result.

A later operation that fails before producing a governed result set does not supersede the earlier set merely because authority was granted or acquisition was attempted.

Example:

```text
Gmail latest-five result A
Gmail latest-five result B
→ B supersedes A
```

But:

```text
Gmail latest-five result A
Calendar tomorrow result B
→ both may remain eligible
```

Cross-capability activity does not implicitly retire an otherwise eligible result set.

Supersession changes referential eligibility only. It does not rewrite or delete the historical observation.

---

## Explicit referential lifetime

For the first bounded implementation, an otherwise eligible result set remains available for implicit reference for:

> **15 minutes or six subsequent user turns, whichever occurs first.**

These are server-owned constants, not model-selected values.

Turn-count semantics are exact: the first six subsequent user turns may use the result set if all other eligibility conditions hold. The set expires for implicit reference before processing the seventh subsequent user turn. A turn that successfully resolves a reference still counts as one of those six turns.

Time semantics are half-open: a result set is time-eligible only while `now < expiresAt`. At `now >= expiresAt`, implicit reference is expired.

A new governed result set of the same referential class supersedes the earlier set immediately even if its time/turn lifetime has not expired.

Expiry removes permission for implicit reference resolution.

> **Referential expiry does not invalidate the historical truth of the governed observation.**

The underlying audit/observation record may remain available under its own retention policy.

---

## Reference resolution

### Structural reference compatibility

Each referential class must declare a closed set of supported reference kinds/nouns, for example `gmail_message` or `calendar_item`.

Compatibility is structural. It must be decided from the typed reference candidate and the result set's declared `supportedReferenceKinds`, never from model judgement, topic inference, semantic similarity or rendered private evidence.

If no eligible result set supports the typed reference kind, resolution is `absent`.

### Capability-qualified reference

A capability-qualified reference such as:

- “the first email”
- “the second Calendar item”

may resolve against the single most recent eligible result set of that capability and compatible referential class.

### Bare reference

A bare reference such as:

- “the first one”
- “the second one”

may resolve only when exactly one eligible governed result set across supported referential classes can satisfy it.

If zero eligible result sets can satisfy the reference, resolution is `expired` only when a structurally compatible historical set exists but its explicit lifetime has ended; otherwise resolution is `absent`.

If more than one eligible result set can satisfy it, resolution is ambiguous and JARVIS must request clarification.

Recency alone must not silently choose between multiple eligible cross-capability result sets unless a later contract explicitly defines such a rule.

### Ordinal resolution

Ordinal resolution is deterministic:

```text
"the first one"
→ typed ordinal 1
→ eligible server-owned result set
→ exact ordered resource ID #1
```

The model may interpret the bounded reference phrase into a typed ordinal candidate.

The runtime owns the referent.

---

## Identity is not authority

> **A prior authorised search may establish identity, but it does not establish read authority.**

Example:

```text
"Show me my last five emails."
→ authorised Gmail subject-list result
→ immutable ordered resource identities

"Tell me about the first one."
→ deterministic ordinal resolution
→ exact Gmail message ID established
→ fresh gmail.read proposal
→ explicit read authority
→ policy-gated current retrieval
```

The previous search authority must not be reused as authority for a different operation.

No silent search rerun is permitted merely to satisfy the later reference.

---

## Historical identity versus current availability

> **Referential continuity preserves historical identity, not current availability.**

If ordinal resolution succeeds but the later authorised operation against that exact resource fails, JARVIS must report the failure at the operational layer.

It must not:

- report that the reference failed when it did not;
- silently select a different resource;
- rerun the originating search and reinterpret the ordinal against current state;
- ask the model to guess which resource the user meant; or
- rewrite the earlier result set.

Example:

```text
Earlier result set:
[id-A, id-B, id-C, id-D, id-E]

"The first one"
→ id-A
→ reference resolution SUCCESS

fresh authorised gmail.read(id-A)
→ provider reports unavailable

truthful result:
"I identified the message you meant, but it can no longer be retrieved."
```

---

## Distinct failure outcomes

At minimum, implementation must distinguish:

### Reference resolution

```text
resolved
ambiguous
absent
expired
out_of_range
invalid
```

Definitions:

- `absent` — no eligible structurally compatible governed result set exists;
- `expired` — a structurally compatible historical set exists but is no longer eligible because its explicit lifetime ended;
- `out_of_range` — an eligible compatible set exists but the requested ordinal is not present in that set;
- `invalid` — the server-owned reference state is malformed, inconsistent, tampered with, explicitly invalidated or otherwise fails structural integrity checks.

### Operation authority

```text
ASK
ALLOW
DENY
```

### Current retrieval

```text
available
unavailable
policy_denied
authorization_failed
connector_failed
```

The user-facing wording must derive from the layer that actually failed.

Examples:

- absent reference → “I don't have an eligible governed result set that this reference can safely identify.”
- expired reference → “I can no longer safely resolve that reference against the earlier result.”
- out-of-range ordinal → “That earlier result did not contain an item at that position.”
- invalid reference state → “I can't safely use that prior result reference.”
- ambiguous reference → ask which governed result set/item the user means.
- exact identity resolved + unavailable → “I identified the item you meant, but it can no longer be retrieved.”
- exact identity resolved + policy denied → “I identified the item, but I can’t release that content under the current policy.”
- exact identity resolved + connector failure → “I identified the item, but retrieval failed right now.”

---

## Private Evidence Reasoning boundary

Referential resolution alone does not cross this boundary.

The boundary is crossed when a reasoning model is intentionally supplied governed private evidence in order to perform semantic work such as:

- interpretation;
- summarisation;
- comparison;
- prioritisation;
- relevance judgement;
- cross-source synthesis;
- recommendation support.

Before any such exposure, the runtime must establish:

1. exact purpose;
2. exact source(s);
3. minimum representation required;
4. admissible fields;
5. provenance;
6. freshness;
7. exposure lifetime;
8. whether cross-source combination is permitted;
9. whether derived interpretation may persist; and
10. the downstream authority effects that remain prohibited.

Acquisition authority alone is insufficient.

---

## Evidence representation rules

The implementation must explicitly decide, per capability and purpose, whether model-visible evidence may include:

- raw title versus governed projection;
- email subject;
- email snippet;
- body text;
- attachment metadata;
- provider identifiers;
- item count;
- source identity;
- timestamp/freshness;
- absence/negative evidence;
- cross-source relationships.

Anything not explicitly admitted remains unavailable to the reasoning model.

Absence of exposed evidence must never be converted into evidence of absence.

---

## Persistence and history

Private evidence exposed for a bounded reasoning purpose must not become ambient model history by default.

A later turn must not inherit semantic evidence visibility merely because an earlier turn was authorised.

If a derived interpretation is retained, it must be typed as a derived interpretation with provenance and staleness semantics. It must not be promoted to source fact.

Rendered deterministic private results remain presentation-visible to the user but are excluded from ordinary model history unless a later governed reasoning contract deliberately admits them.

---

## Cross-capability historical invariant

The same principle applies to Gmail, Calendar, Drive and future private capabilities:

> **A governed historical observation may establish identity or state at time T. Subsequent operations must preserve that historical truth while independently establishing whatever current-state facts they require. Failure of the later operation does not invalidate or rewrite the earlier observation.**

Calendar example:

```text
Know-time observation remains historically true
→ Act-time current state is re-verified before execution
```

Gmail example:

```text
historical search identity remains historically true
→ later read operates against that exact identity
→ current availability is reported separately
```

---

## Non-goals

Sprint 3.181 does not authorise:

- arbitrary private evidence in ordinary model context;
- persistent ambient Gmail/Calendar/Drive context;
- semantic ranking of private evidence;
- recommendations from private evidence;
- cross-source reasoning;
- action authority;
- implicit read authority inherited from search;
- model-generated resource identity;
- model-selected referential lifetime;
- topic-based referential expiry;
- silent re-query to repair a stale historical reference.

---

## Required adversarial paper tests

Before implementation, the contract must survive at least these cases:

1. acquisition succeeds but semantic exposure is not authorised;
2. Calendar is authorised but Gmail is not;
3. current-turn purpose does not justify broader conversation-history exposure;
4. body unavailable while a narrower projection is permitted;
5. absence of exposed evidence is not treated as evidence of absence;
6. model interpretation cannot create authority;
7. cross-source reasoning is not inferred from two independently authorised sources;
8. history does not silently persist semantic evidence;
9. unsupported inference remains inference;
10. later turn does not inherit prior evidence exposure;
11. “the first one” resolves from server-owned identity, not rendered prose;
12. a second same-class result set supersedes the first for implicit reference;
13. cross-capability result sets coexist until expiry;
14. a bare ordinal with multiple eligible result sets is ambiguous;
15. a capability-qualified ordinal resolves only within that capability;
16. an expired result set remains historically true but cannot be implicitly referenced;
17. exact historical identity resolves but current resource retrieval returns unavailable;
18. current retrieval failure does not trigger silent search rerun or ordinal reinterpretation;
19. read authority is requested fresh after identity resolution;
20. model output cannot substitute a different resource when the exact referenced resource is unavailable;
21. an empty successful same-class result supersedes an earlier non-empty result and does not fall back to it;
22. a failed later same-class operation produces no result set and therefore does not supersede the earlier successful result;
23. an ordinal outside the stored result-set bounds is `out_of_range`, not `invalid` and not a request to rerun the search;
24. fabricated, tampered or structurally inconsistent opaque reference state is `invalid`;
25. the first six subsequent user turns may reference a set, while the seventh may not;
26. `now == expiresAt` is expired;
27. same-capability result sets of different referential classes are matched only through a closed structural compatibility rule;
28. a newer same-capability but incompatible referential class does not become the target of a qualified reference merely because it is more recent;
29. a current read of a historically identified mutable resource does not imply that current content equals content observed earlier;
30. server/process loss of the preserved ordered identities cannot be repaired by reconstructing them from client-visible prose or model memory.

---

## Exit condition

Sprint 3.181 is complete when the private-evidence reasoning boundary, referential-continuity rules, failure states and adversarial paper cases are accepted as the governing contract.

Only then may Sprint 3.182 implement the first bounded **Understand** capability.

