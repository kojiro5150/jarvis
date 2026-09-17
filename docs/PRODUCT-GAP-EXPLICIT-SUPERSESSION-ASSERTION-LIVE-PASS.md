# Product Gap explicit supersession assertion — live pass

**Status:** **LIVE PASS / FROZEN** on 17 September 2026.

## Exact promoted capability

JARVIS may append one explicit user-authored `superseded_by` relationship from one exactly selected active Product Gap containing a factually wrong diagnosis to one exactly selected existing Product Gap containing its accurate replacement.

This is not resolution, correction, deduplication or record mutation. The target and successor remain unchanged. The successor's independent lifecycle status is preserved.

## Implementation record

- **PR #573:** froze and implemented the closed four-stage supersession path, opaque server-owned flow reference, deterministic target/successor selection, append-only persistence, lifecycle projection and fail-closed boundaries.

No Supabase schema migration was required. The existing append-only operating-picture decision store persists the relationship.

## Exact production proving case

The active target was:

> JARVIS product gap correction — “Reply exactly with control test complete” succeeds normally in a fresh conversation with no prior Gmail activity. The earlier Gmail-action misclassification therefore requires prior Gmail activity in the same conversation to reproduce.

The selected existing successor was:

> JARVIS product gap correction — the “reply exactly with” misclassification is not caused by retained Gmail conversational state. Direct code inspection confirms that isUnsupportedGmailMutationRequest examines only the current utterance for both a Gmail-related term such as “Gmail,” “email” or “inbox” and a mutation term such as “reply.” The test phrase itself contained both “Reply” and “Gmail,” which triggered the classification. The fresh control succeeded because it omitted the Gmail-related term, not because its conversation lacked prior Gmail activity. This correction supersedes both earlier context-dependent diagnoses.

The governed console sequence was:

1. `Show me the active JARVIS product gaps for supersession.`
2. `Select product gap 5 for supersession.`
3. `Select product gap 2 as successor.`
4. `Mark this product gap as superseded.`

JARVIS returned:

> That exact JARVIS Product Gap is now superseded by the selected existing Product Gap.

## Projection proof

The active Product Gap view was retrieved after the write. The exact incorrect target was absent.

The paged lifecycle-history view then showed:

- the exact target as `[superseded]`;
- the full exact successor statement after `superseded by:` rather than an exposed internal ID;
- the supersession timestamp `2026-09-17T11:19:34.413+00:00`; and
- the successor independently retained as `[resolved]` with its earlier resolution timestamp `2026-09-09T10:45:22.495+00:00`.

This proves that only the target left the active projection. Neither original was rewritten, deleted or reactivated.

## Scope retained after promotion

This proof authorizes only active-target factual supersession through the exact closed path. It does not authorize:

- superseding an already-resolved target;
- a general corrected status;
- weather-record deduplication;
- mixed-scope Product Gap splitting;
- semantic or model-selected relationships;
- bulk reconciliation; or
- silent mutation of durable history.

The broader lifecycle-management Product Gap remains active because these unearned lifecycle operations still exist outside the promoted capability.

The historical scheduling/voice-transcription diagnosis remains a separately evidenced lifecycle question. Because it is already resolved, reclassifying it would require a new doctrine and proof for supersession of a resolved target; PR #573 and this live pass do not authorize that transition.

## Promotion decision

The bounded active-target Product Gap supersession assertion is therefore **LIVE PASS / FROZEN**. The architectural pattern may be reused, but this proof may not be inherited by another lifecycle relationship or target state.
