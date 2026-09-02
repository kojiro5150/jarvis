# Gmail Named Result Handoff — LIVE PASS

**Status:** **LIVE PASS / FROZEN — bounded recent-result scope**
**Verified:** 2 September 2026
**Historical contract:** `GMAIL-NAMED-RESULT-HANDOFF-FREEZE.md`

## Promotion verdict

Product Gap #19 is closed within one bounded conversational path:

```text
authorized bounded Gmail search
        ↓
opaque server-owned five-message list reference
        ↓
strict named-sender or closed ordinal selection
        ↓
separate pending gmail.read authority
        ↓
explicit confirmation
        ↓
exact identified-message read
```

The message-list reference identifies a candidate only. It is not authority evidence. Sender matching uses only identities retained beside the ordered provider message IDs in module-private server state; it does not recover identity from rendered assistant prose or ask the ordinary model to select a message.

## Implementation and repair history

| PR | Merge commit | Evidence added |
| --- | --- | --- |
| #529 — Wire Gmail named result handoff into live chat | `267098727cac3808228eda0d2101a0524e444142` | Retained bounded sender identity in the opaque Gmail list state, added strict unique/ambiguous/absent resolution and wired separate exact read authority into the live route. |
| #530 — Persist sender-search results in Gmail list references | `c1aa07b1f2df09dabd320dd810a28cd195dad773` | Extended the existing list-reference transport to uniquely resolved sender-search results without introducing a new lifecycle mechanism. This related path retains its own live-acceptance contract. |
| #535 — Fail closed for overflow Gmail ordinals | `7d0580f1180bd7da245729bb137cbe4271c34d59` | Repaired `sixth one` / `seventh one` collapsing to message 1 and removed false Gmail `ASK` state when no pending read authority existed. |

The overflow defect remains part of the promotion record. Code inspection first established the exact trailing-`one` failure mechanism; RED tests then reproduced it at the reference, authority-proposal and live-route layers before the bounded grammar repair. It was re-tested against production after merge.

## Direct live acceptance

| Proof | Observed production result | Verdict |
| --- | --- | --- |
| Unique named sender | A sender appearing once in a real bounded recent list resolved to its exact displayed position, requested separate Gmail read authority and returned that exact provider message only after confirmation. | PASS |
| Ambiguous sender | A sender appearing in three bounded results returned the deterministic multiple-match response. No message was guessed and no read-authority prompt followed. | PASS |
| Absent sender and current-result ownership | After a newer Gmail result replaced the client-carried list reference, a sender present only in the earlier result returned the deterministic not-found response. A sender present once in the current list then resolved to its exact current position. | PASS |
| Overflow ordinal | `Read the sixth one.` and `Read the seventh one.` returned `That position is outside the bounded recent Gmail result.` without authority or read. | PASS |
| Valid ordinal | `Read the first one.` still requested separate exact read authority and returned only the first provider message after confirmation. | PASS |
| TTL | The configured Gmail message-list TTL remains exactly **15 minutes**. A named request made before expiry resolved normally; the same request after the boundary returned `That recent Gmail result is no longer available. Please retrieve the recent messages again.` with no new authority or read. | PASS |
| Fabricated reference | A structurally valid but unknown Gmail message-list handle submitted through the live local API returned the deterministic unavailable response, a null list reference and no pending or Gmail authority fields. | PASS |

## Frozen lifecycle and authority boundaries

- `gmail-message-list-reference.ts` remains the capability-specific mechanism for this path.
- The list is bounded to five ordered messages and expires after 15 minutes.
- The client receives only an opaque reference; provider message IDs and trusted sender identities remain server-owned.
- Ordinary conversational selection uses the currently carried list reference.
- Older server entries may coexist until TTL expiry. Same-class server-side supersession, scope binding and conversational-turn expiry are **not** claimed for this mechanism.
- Strict named matching returns exactly one of matched, ambiguous, not found, invalid or expired.
- Ordinal grammar remains closed. Sixth-through-tenth are recognized only so the five-result boundary can reject them deterministically; they do not expand the selectable result set.
- Successful identification creates a new one-shot pending `gmail.read` operation. Search authority and reference possession never authorize content acquisition.
- Invalid, expired, absent, ambiguous, out-of-range and fabricated selections fail closed before connector read or ordinary-model substitution.

## Explicit exclusions

This promotion does **not** authorize:

- migration to `governed-result-set-reference`;
- a generic reference-registry refactor;
- same-class supersession or scope semantics not present in the Gmail mechanism;
- fuzzy matching, general anaphora, Contacts lookup or mailbox-wide inference;
- Gmail drafting, sending, replying, forwarding, labels, filters or other mutation;
- treating `GMAIL-SENDER-SEARCH-RESULT-CONTINUITY-FREEZE.md` as independently live-proven;
- Calendar or Drive lifecycle changes; or
- standing Gmail authority.

## Separate observations retained as open product gaps

The live proof also exposed presentation and intent defects outside this milestone:

- a sender-qualified request shaped as `last 5 emails from <sender>` degraded into a generic recent-five search instead of preserving the sender qualifier;
- the no-current-reference fallback still said natural-language handoff was unavailable even though the bounded handoff is live when a genuine reference exists; and
- some released plain-text email bodies contained duplicated conditional markup and excessive newsletter boilerplate.

These observations do not invalidate exact identification or authority proof. They remain separate work and must not be silently described as resolved by this promotion.

## Closure

The historical Product Gap #19 classification is superseded: capability, substrate, live integration and production proof now all exist for the bounded recent-result path. Gmail named-result handoff is therefore **LIVE PASS / FROZEN** within the boundaries above.
