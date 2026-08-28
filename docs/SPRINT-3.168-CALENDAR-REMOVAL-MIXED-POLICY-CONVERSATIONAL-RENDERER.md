# Sprint 3.168 — Calendar Removal and Mixed-Policy Conversational Renderer

**Status:** Implemented  
**Sprint type:** Bounded renderer implementation  
**Baseline:** merged main after Sprint 3.167 (`cafabac741848a3dd2d39f6e0d6210cafa0c5860`)

## 1. Why this sprint implements instead of auditing again

Sprint 3.166 already established the remaining renderer questions:

- single removal wording;
- multiple and mixed-policy wording;
- zero-match wording;
- fail-closed policy/reason/evidence validation.

Sprint 3.167 then completed the publication prerequisite.

No further architecture discovery was required before implementation. Sprint 3.168 therefore implements the smallest deterministic renderer extension directly.

## 2. Supported policy families

The renderer now supports exactly two governed Calendar Attention Policy families:

```text
attention.commitment.start-time-changed@1.0.0
attention.commitment.removed@1.0.0
```

with reason codes:

```text
commitment.start-time.changed
commitment.absent-from-current-snapshot
```

No other policy is accepted.

## 3. Start-time rendering remains unchanged for one item

A single start-time match still renders:

```text
A Calendar commitment changed start time from <previous> to <current>.
```

The same exact evidence validation remains:

- governed commitment identity;
- previous start;
- current start;
- both timestamps valid;
- timestamps differ.

## 4. Removal rendering

A single removal match renders:

```text
A Calendar commitment previously scheduled for <previous> is no longer present in this bounded Calendar window.
```

This wording is deliberately limited to observed bounded absence.

It does not say:

- cancelled;
- deleted;
- completed;
- declined;
- resolved;
- no longer happening.

Required removal evidence is:

- governed commitment identity;
- previous start.

No current start or status is invented.

## 5. Multiple and mixed-policy rendering

When more than one supported policy match exists, the renderer uses one neutral deterministic heading:

```text
N Calendar attention changes matched this bounded check:
```

Each item is then rendered using its own policy-specific factual template.

This supports:

- multiple start-time changes;
- multiple removals;
- mixed start-time and removal matches.

The existing brief order is preserved.

The heading does not rank or group by policy family.

## 6. Zero-match wording

The old start-time-specific empty response:

```text
No Calendar start-time changes matched this bounded check.
```

is replaced with:

```text
No supported Calendar attention changes matched this bounded check.
```

This remains narrower than:

- nothing needs your attention;
- all clear;
- nothing important changed;
- no action is required.

It refers only to the supported bounded deterministic policy set.

## 7. Fail-closed dispatch

The renderer dispatches only by exact supported policy identity and version.

Each policy family then validates:

- matching structural change type;
- exact reason code;
- exact governed identity evidence;
- required policy-specific timestamps.

Unsupported policy, reason, structural type, identity, or evidence fails closed.

The renderer still does not trust `reason.message` as prose input.

## 8. No model role

Rendering remains fully deterministic.

No:

- OpenAI;
- Anthropic;
- text generation;
- chat handler;
- runtime clock;
- ranking;
- interpretation.

A model has still not earned a place between deterministic Calendar attention policy selection and user-facing wording.

## 9. Live path unchanged

Sprint 3.168 does not yet wire the removal selector into live Calendar attention.

The live path still selects only start-time matches.

This sprint makes the renderer ready for the already-published removal match type.

## 10. Tests

Tests prove:

1. single start-time rendering remains unchanged;
2. revised bounded zero-match wording;
3. multiple start-time output uses neutral mixed-capable heading;
4. one removal renders deterministic bounded-absence wording;
5. removal does not inflate absence into cancellation/deletion/completion/decline/resolution;
6. mixed start-time/removal output renders deterministically;
7. unsupported policy remains fail-closed;
8. unsupported reason remains fail-closed;
9. identity mismatch remains fail-closed;
10. removal evidence missing or invalid remains fail-closed;
11. no model/runtime-dependent prose source is introduced.

## 11. Authority unchanged

The renderer consumes a structured Calendar Attention Brief only.

It cannot:

- acquire Calendar data;
- create or reuse authority;
- widen source scope;
- trigger background reads;
- persist observations;
- execute actions.

## 12. Next sprint

Exactly one next sprint:

> **Sprint 3.169 — Live Calendar Removal Attention Wiring**

The required seams are now already present:

```text
complete bounded comparison
→ removal policy selector
→ removal-capable brief publisher
→ removal-capable deterministic renderer
```

Sprint 3.169 should therefore be an implementation sprint, not another readiness audit.

It should combine the already-governed start-time and removal policy matches in the existing live `What needs my attention?` path, preserve deterministic brief ordering, retain the existing authority flow, and add end-to-end regression tests.

## 13. Exit condition

Sprint 3.168 exits when the deterministic Calendar renderer can truthfully render the complete currently-supported Calendar policy set — start-time and bounded removal — including mixed and zero-match cases, without adding model judgement, lifecycle cause, priority, recommendation, or action.
