# DAWNWATCH Promotion Record

## 1. Status

**Promotion Recorded — operator-controlled governed presentation**

This standing record documents completion of the DAWNWATCH sequence:

```text
Discover → Govern → Implement → Evaluate → Integrate → Verify → Promote
```

Promotion is a deployment decision, not a source-code default change. No production code change is
required or authorised by Sprint 3.73.

## 2. Purpose

This record establishes the authorised DAWNWATCH presentation for the operator's current JARVIS
runtime, the evidence supporting that authority, the permanent conservative selector semantics,
the available rollback, and the limitations carried forward. It does not redesign DAWNWATCH,
broaden Gmail evidence claims, or grant implementation authority.

## 3. Governing Authority

This decision was made under the repository constitutional hierarchy: the Engineering
Constitution; North Star; JARVIS Engineering Specification Standard; complete Roadmap;
Constitutional Publication Principles; accepted ADRs and responsibility statements; Sprints
3.68–3.71; the precise Sprint 3.72 operator evidence recorded below; the Dashboard integration and
promotion precedent in Sprints 3.61 and 3.62; current selector source and tests; and the Sprint 3.73
specification.

The Roadmap's sequence requires promotion to follow discovery, governance, implementation,
evaluation, integration, and verification. The Dashboard precedent confirms that promotion is an
explicit operator runtime selection and does not make missing configuration select governed
behaviour. Repository evidence controls repository claims; the two live-runtime claims are bounded
to the operator observations recorded in Section 7.

## 4. Promotion Decision

> Governed DAWNWATCH is the authorised operator-selected presentation for the current JARVIS
> runtime. This authority is expressed through explicit deployment configuration. The repository
> code-level fallback remains LEGACY.

The authorised continued human-side deployment configuration is:

```text
DAWNWATCH_PRESENTATION_MODE=GOVERNED
```

This authority applies to the operator's actual runtime. It does not authorise changing either
selector, a repository or environment default, DAWNWATCH semantics or rendering, Gmail acquisition
or evidence rules, the comparator, canonical models, or the legacy path.

## 5. Permanent Selector Semantics

Direct review and targeted tests establish:

| Configuration | Result |
| --- | --- |
| missing (`undefined`) | `LEGACY` |
| empty or whitespace-only | `LEGACY` |
| `LEGACY` | `LEGACY` |
| `GOVERNED` | `GOVERNED` |
| any other value | explicit `DAWNWATCH_PRESENTATION_MODE must be LEGACY or GOVERNED` error |

DAWNWATCH selection is independent of Dashboard selection. The selectors remain unchanged.

> The code-level fallback remains permanently `LEGACY`. Governed DAWNWATCH is selected only
> through explicit operator-controlled runtime configuration.

This prevents absent, blank, or accidentally removed configuration from silently promoting
governed behaviour.

## 6. Evidence Chain

### Sprint 3.68 — Discover / audit

The audit established that a correct, tested canonical Gmail adapter already extracted and
flattened `To`, `Cc`, and `Bcc`, but production DAWNWATCH did not consume it. The primary problem was
a production wiring and evidence-boundary gap, not a missing Gmail capability.

### Sprint 3.69 — Govern

The governed contract made the canonical Gmail projection the sole production recipient authority
and prohibited the legacy `EmailMessage` path from becoming a second authority. It governed
absence, provenance, standards-aware parsing, deterministic ordering, occurrence preservation, and
non-inference. Recipient evidence may become `available` only for the bounded claim:

> At least one asserted recipient value was observed in returned recipient headers for this
> source-qualified communication.

That claim does not establish delivery, resolved identity, mailbox-wide completeness, hidden
recipient absence, mailbox ownership, or group membership.

### Sprint 3.70 — Implement / integrate Gmail evidence

Sprint 3.70 routed production recipient evidence through the canonical path. It replaced naive
comma splitting with standards-aware address-list parsing, including protection of quoted
display-name commas such as `"Smith, John"`; preserved deterministic `To → Cc → Bcc` ordering and
duplicate occurrences; used both production candidate queries; deduplicated IDs before detail
retrieval; fetched each detail once; and retained truthful retrieval-time provenance. It replaced
the unconditional DAWNWATCH `recipients: []` gap with evidence-gated canonical recipients.

### Sprint 3.71 — Evaluate

The re-evaluation reused the existing runtime-computed comparator without modifying
`compareDawnwatchRuntime`. It evaluated the new recipient surface, demonstrated that qualifying
canonical evidence reaches governed communications `available`, and computed the actual runtime
difference as `Intentional Improvement`. A separate recipient mutation proved comparator
sensitivity, while the existing scenario set showed no blocking regression. The citation-
specificity limitation in Section 9 remains visible.

### Sprint 3.72 — Verify

Operator verification supplied the two real-runtime observations recorded precisely in Section 7:
the actual computed governed presentation mode and real source-qualified Gmail recipient evidence
reaching `available`. Together with the preceding repository evidence, these observations close the
named promotion gate without broadening the governed recipient claim.

## 7. Sprint 3.72 Operator Evidence

The operator's real running JARVIS instance—not repository-source inference or sandbox behaviour—
provided the following verification evidence.

1. The server-rendered Next.js payload contained the actual computed runtime property:

   ```text
   "dawnwatchPresentationMode":"GOVERNED"
   ```

   This verifies explicit governed selection in the real application and is consistent with the
   operator's verified `.env.local` setting `DAWNWATCH_PRESENTATION_MODE=GOVERNED`.

2. The real operational-state API response contained `recipientEvidence: "available"` for at least
   one real Gmail communication, with genuine multi-recipient data, preserved duplicate recipient
   occurrences where asserted, truthful `retrievedAt`, separately retained `gmailInternalDate`,
   and source-qualified identity and provenance.

This live evidence establishes only that at least one qualifying source observation traversed the
governed production path. It is not evidence of complete mailbox coverage, complete historical
coverage, delivery, resolved recipient identity, or hidden-recipient coverage.

## 8. Rollback

The operator may roll back by setting:

```text
DAWNWATCH_PRESENTATION_MODE=LEGACY
```

Alternatively, the operator may remove the variable, which invokes the permanent `LEGACY`
fallback. Either action requires an application restart before the running application reflects
the selection. The legacy path remains present and no repository edit is required for rollback.

## 9. Known Non-Blocking Items

### Comparator citation specificity

The comparator's `Intentional Improvement` rule checks evidence status across all three DAWNWATCH
sections instead of identifying the particular changed section. The computed classification is
valid, but its governance citation can be broader than the communications-specific change that
triggered it. This is known and non-blocking; correction requires a separately governed comparator
sprint.

### Communications display wording

The presentation currently renders a communication's raw Message-ID where sender-oriented wording
would be more useful. This presentation issue does not invalidate canonical recipient evidence,
evidence sufficiency, governed `available`, production routing, selector behaviour, or promotion
authority. It is reserved for Sprint 3.74 — DAWNWATCH Communications Presentation Correction, or
another separately specified follow-up sprint.

## 10. Validation

The complete repository suite and the targeted selector test passed on the promotion-record change:

| Command | Result |
| --- | --- |
| `npm test` | PASS |
| `npm exec vitest run -- lib/dawnwatch-presentation-selection.test.ts` | PASS |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `git diff --check` | PASS |

Targeted coverage proves missing, empty, whitespace-only, explicit `LEGACY`, explicit `GOVERNED`,
invalid configuration, and independence from Dashboard selection. Change inspection confirms that
only this documentation record was added: neither selector, production code, environment defaults,
the comparator, Gmail code, canonical models, nor the legacy path changed. Repository validation
confirms code integrity; the previously gathered Sprint 3.72 observations remain the authority for
the real runtime.

## 11. Constitutional Conclusion

The complete evidence chain supports continued explicit operator selection of governed DAWNWATCH.
There is no blocking Defect or Undocumented Failure Mode in the established evidence. Promotion
preserves conservative failure behaviour, explicit human authority, truthful bounded evidence,
and immediate configuration rollback while leaving the two known non-blocking issues visible.

Governed behaviour is promoted deliberately, remains reversible, and never becomes active merely
because configuration is absent. The authorised runtime configuration is
`DAWNWATCH_PRESENTATION_MODE=GOVERNED`; the permanent repository fallback remains `LEGACY`.
