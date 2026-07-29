# Sprint 3.45 — Cross-Publication Identity Probe

## Architectural finding

**Finding C — Implicit Behaviour Identified.** Identical identifier strings safely coexist in
OperationalCommitment and OperationalCommunication because the implementation indexes,
validates, merges, orders, and compares entities within explicitly named publication
collections. No global canonical-entity identifier namespace or cross-publication lookup was
observed.

The runtime behaviour is correct for collection-scoped identity, but the reviewed constitutional
publications do not state an explicit invariant that identifier uniqueness is scoped to a
canonical publication. This probe adds regression evidence for the current behaviour; a future
documentation sprint should decide whether to formalise collection-scoped identity as a
constitutional publication principle. No runtime enforcement or identity redesign is required
by the observed behaviour.

## Probe evidence

The focused probe constructs an OperationalCommitment and an OperationalCommunication with the
same literal `id` value and observes the following boundaries:

1. **Construction and projection** accept both values and preserve one entity in each named
   collection. Collection-local lookup returns the appropriate publication rather than the
   entity from the other collection.
2. **Assembly** succeeds, preserves both publications, and reports neither a structural conflict
   nor an explicit relationship. Conflict keys include the collection name, so the shared string
   does not create a cross-publication collision.
3. **Lifecycle snapshots** reconstruct and defensively isolate both named collections through
   the canonical model boundary.
4. **Lifecycle comparison** indexes commitments and communications independently. Modifying the
   commitment produces exactly one commitment modification while the communication remains
   unchanged, despite their equal identifier strings.
5. **Deterministic replay** of a JSON round trip produces the same assembled snapshot, including
   the same derived snapshot identity and both publication records.
6. **Mutation isolation** is preserved: mutating the candidate communication after snapshot
   construction cannot alter the snapshotted communication or the commitment sharing its
   identifier value.

## Existing cross-publication reference finding

Direct schema inspection remains conclusive and was not re-probed. OperationalCommunication has
no OperationalCommitment reference field, and OperationalCommitment has no
OperationalCommunication reference field. The communication `references` and `inReplyTo` values
are protocol facts expressed as strings; assembly does not interpret them as canonical
relationships.

## Implications and recommendation

- Publication identity currently behaves as collection-scoped identity throughout the observed
  construction, projection, assembly, snapshot, comparison, and replay boundaries.
- No hidden global identity coupling was observed, so the sprint stop condition requiring only
  documentation of a failed boundary was not triggered.
- Production implementation remains unchanged. Global identifier validation, a collection
  registry, and identity architecture changes would invent behaviour beyond this validation
  sprint and are not recommended.
- Preserve the focused regression probe. Consider a separate constitutional documentation
  change that explicitly declares whether canonical identifiers are unique within their
  publication rather than across all Situational Awareness publications.
