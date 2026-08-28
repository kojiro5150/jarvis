# Sprint 3.164 — Calendar Membership-Change Attention Policy Audit

**Status:** Audit only  
**Sprint type:** Discover / policy selection  
**Baseline:** merged main after Sprint 3.163 (`8a7e148c8e33d05c29e91f732d0b68f906fba59e`)

## 1. Question

Sprint 3.163 closed the acquisition-completeness seam required before Calendar membership changes may be compared honestly.

The next question is narrower:

> **Which Calendar membership-change semantic, if any, has enough current architectural support to earn a deterministic attention policy next?**

Candidate semantics:

- added commitment;
- removed commitment;
- explicit provider cancellation.

This sprint does not implement any policy.

## 2. Executive conclusion

**Exactly one membership-change semantic is currently ready for bounded policy implementation: removal.**

The reason is architectural, not heuristic:

- the existing canonical Calendar comparison already emits `type: "removed"` only when both observation sets prove `bounded_complete_request`;
- the existing EOS Attention Layer already contains an accepted provider-independent policy:
  - policy id: `attention.commitment.removed`
  - version: `1.0.0`
  - reason code: `commitment.absent-from-current-snapshot`
  - reason message: `The commitment was present in the previous snapshot and is absent from the current snapshot.`;
- ADR-0009 explicitly defines removal as **present previously and absent currently**, and explicitly says that removal does **not** mean deleted, cancelled, completed, or resolved.

Therefore the current governed Calendar path can preserve that exact semantics without inventing stronger meaning.

By contrast:

- **added** is structurally observable under complete membership, but no current accepted Attention Policy selects added commitments, so inclusion in “needs my attention” is not yet governed;
- **explicit cancellation** has provider data available in the connector-level `CalendarEvent.status`, but the governed Calendar evidence publisher and canonical attention observation intentionally do not carry status, so the bounded attention path cannot currently prove a cancellation transition.

The next sprint should therefore implement only a bounded Calendar removal Attention Policy adapter with parity to the existing EOS removal policy.

## 3. Files inspected

- `lib/governed-conversation/calendar-attention-observation-comparison.ts`
- `lib/governed-conversation/calendar-attention-observation.ts`
- `lib/governed-conversation/calendar-attention-policy-adapter.ts`
- `lib/executive-operating-system/attention/policies.ts`
- `lib/executive-operating-system/attention/attention.test.ts`
- `docs/architecture/ADR-0009-Executive-Attention-Layer-and-Deterministic-Attention-Policies.md`
- `lib/connectors/calendar-event.ts`
- `lib/governed-conversation/calendar-evidence-publisher.ts`
- `docs/SPRINT-3.156-CALENDAR-START-TIME-ATTENTION-POLICY-ADAPTER.md`
- `docs/SPRINT-3.163-IMPLEMENT-CALENDAR-ACQUISITION-COMPLETENESS-ENVELOPE.md`

## 4. Candidate A — added commitment

### OBSERVED

The Calendar comparison emits:

```ts
{ type: "added", id, current }
```

when an entity exists only in the current complete observation set.

The comparison layer already requires `bounded_complete_request` for any membership change.

### OBSERVED

The accepted EOS initial Attention Policy set contains:

- cancellation;
- removal;
- start-time change;
- source became unavailable.

It does **not** contain a commitment-added policy.

### INFERRED

A new Calendar event appearing in a complete bounded window is a valid structural observation.

It is not yet a governed reason to say that the event “needs attention”.

Selecting every addition would introduce a new policy judgement, not merely expose an already-accepted deterministic policy.

### Classification

**Not ready for implementation in the next sprint.**

A future added-commitment policy would need its own governance justification.

## 5. Candidate B — removed commitment

### OBSERVED

The comparison layer emits:

```ts
{ type: "removed", id, previous }
```

only after its membership-completeness gate passes.

The gate is:

```text
previous.coverageState === bounded_complete_request
AND
current.coverageState === bounded_complete_request
```

This prevents absence under partial coverage from being interpreted as removal.

### OBSERVED

The existing EOS policy is:

```text
policy id:   attention.commitment.removed
version:     1.0.0
reason code: commitment.absent-from-current-snapshot
message:     The commitment was present in the previous snapshot and is absent from the current snapshot.
```

Its evidence is limited to:

- commitment id;
- previous status;
- previous start timestamp.

### OBSERVED

ADR-0009 defines the semantics explicitly:

> Removal means present previously and absent currently.

It also explicitly prohibits semantic inflation:

> It does not mean deleted, cancelled, completed, or resolved.

### INFERRED

The bounded Calendar attention path can implement a parity adapter without reconstructing unsupported `OperationalCommitment` fields.

The Calendar adapter should preserve only the subset it actually has:

- stable governed entity id;
- previous start timestamp;
- previous/current observation times;
- policy identity/version;
- reason code/message.

It should **not** invent `previous.status` merely because the historical EOS policy included that field in a richer canonical model.

Parity here means preserving the accepted policy identity and removal semantics, not manufacturing unavailable evidence fields.

### Classification

**Ready for one bounded policy implementation sprint.**

## 6. Candidate C — explicit provider cancellation

### OBSERVED

The connector-level canonical `CalendarEvent` can carry:

```ts
status?: "confirmed" | "tentative" | "cancelled"
```

### OBSERVED

The governed Calendar evidence publisher currently publishes only:

- stable commitment reference;
- source/provenance reference;
- start;
- end;
- timezone;
- coverage limit;
- disclosure policy.

It does not publish provider status.

### OBSERVED

The canonical Calendar attention observation likewise contains no status field.

### OBSERVED

The existing EOS cancellation policy requires an explicit transition:

```text
previous.status !== cancelled
current.status === cancelled
```

### INFERRED

The current governed attention path cannot truthfully apply the existing cancellation policy because the required status evidence is absent before comparison.

A disappearance from the Calendar result must not be relabelled as cancellation. ADR-0009 explicitly forbids that equivalence.

### Classification

**Blocked by a separate evidence-contract question.**

Do not add cancellation semantics in the next sprint.

## 7. Why removal is the correct next policy

Removal is the only candidate that satisfies all current constraints simultaneously:

1. the structural change already exists in the canonical comparison vocabulary;
2. the change is fail-closed behind complete membership;
3. an accepted deterministic EOS policy already governs its meaning;
4. its accepted wording is deliberately weaker than “cancelled” or “deleted”;
5. no provider-specific inference is required;
6. no title, role, project, priority, severity or recommendation is required;
7. no LLM judgement is required.

This is the same architectural pattern used successfully for the start-time policy in Sprint 3.156.

## 8. Required policy boundary

The future Calendar removal adapter should match only:

```text
change.type === "removed"
```

from an already-valid `CalendarAttentionObservationChangeSet`.

It must not independently decide whether coverage was complete.

That decision belongs to the comparison layer, which has already either:

- emitted the removed change under complete coverage; or
- failed closed before the policy adapter runs.

The policy adapter must not duplicate or weaken that gate.

## 9. Required semantics

The bounded Calendar removal policy should preserve:

```text
policy id:      attention.commitment.removed
policy version: 1.0.0
reason code:    commitment.absent-from-current-snapshot
reason message: The commitment was present in the previous snapshot and is absent from the current snapshot.
```

The wording is deliberately factual.

It must not say:

- cancelled;
- deleted;
- declined;
- completed;
- no longer happening;
- no longer relevant;
- urgent;
- important;
- conflict;
- action required.

## 10. Evidence boundary

The minimum evidence for a Calendar removal match is:

- governed commitment id;
- previous start timestamp;
- previous observation time;
- current observation time;
- policy id/version.

No current provider status is available because there is no current observation for a removed entity.

No previous status should be synthesized from connector history or default values.

The policy reason may therefore carry fewer evidence fields than the full EOS policy while preserving the same accepted semantic claim.

## 11. Added-event non-selection

A structurally added event may pass through comparison without matching any attention policy.

That is correct.

The system may truthfully know:

> a commitment appeared in the current complete bounded observation.

without yet claiming:

> this needs your attention.

Observation and attention selection remain separate.

## 12. Cancellation non-selection

An explicit cancellation policy remains a legitimate future capability, but it requires a separate governed evidence seam first.

The next cancellation audit would need to determine:

- whether provider cancellation status is reliably retrievable in the current bounded query;
- whether it should enter governed Calendar evidence;
- whether its disclosure is allowed;
- how recurrence/deleted-instance semantics affect identity;
- whether the current canonical observation should gain a status field.

None of that is needed for removal.

## 13. Authority impact

None.

A removal policy operates only after:

```text
explicit Calendar authority
→ current bounded acquisition
→ completeness derivation
→ governed evidence
→ canonical observation
→ previous/current comparison
```

It performs no source access and grants no authority.

## 14. Readiness outcome

**Outcome A — directly activatable for one policy only: bounded commitment removal.**

No architecture correction is required.

No new evidence seam is required for removal.

Added and cancellation remain out of scope.

## 15. Next sprint recommendation

Exactly one next sprint:

> **Sprint 3.165 — Bounded Calendar Removal Attention Policy Adapter**

It should:

- add one isolated Calendar removal selector beside the existing start-time selector;
- preserve the existing EOS removal policy identity/version/reason semantics;
- require only existing bounded Calendar change records;
- add parity tests against the accepted EOS policy where semantically possible;
- prove added changes do not match;
- prove modified changes do not match;
- make no production/live wiring changes.

## 16. Exit condition

Sprint 3.164 exits when the repository records this evidence-backed distinction:

> **Removed** is ready for deterministic Calendar attention selection because complete bounded membership and an accepted provider-independent removal policy already exist. **Added** is observable but not yet governed as attention. **Cancellation** has a historical policy but lacks the governed status evidence required on the current Calendar attention path.

That is the smallest truthful next step.
