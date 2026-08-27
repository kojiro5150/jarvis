# Sprint 3.151d — Calendar residual recall-language containment

## Final live phrases

Hard-reset voice acceptance exposed three remaining recall-only source families:

- `I just saw ...`
- `The calendar view I saw ...`
- `The calendar projection I can see ...`

In each case the turn had Calendar recollection state but no current Calendar GovernedContext. The answer could therefore repeat previously reported facts, but only as historical recollection—not as a source currently seen, visible, held, accessed, available, or showing data.

## Why the bounded matchers missed them

The bare schedule matcher covered leading `I saw` and `I can see`, but not the intervening `just` in `I just saw`. The Calendar-qualified matcher covered `calendar information I saw` and `calendar result I saw`, but not the narrower `calendar view I saw` noun phrase or the present-possession phrase `calendar projection I can see`.

The extension stays inside the existing presentation helpers. It attributes the three phrases to the earlier reported Calendar result or projection and preserves useful intervals, omitted-field limitations, and conversationally supplied detail.

## False-positive boundary

The new bare form still requires schedule semantics—timing, times, time blocks, time slots, meetings, commitments, or appointments—and the caller must already have established Calendar recollection from server-owned history. Ordinary language such as `I just saw your previous message`, a projection in a chart, a view in a document, or a table view remains unchanged. The Calendar-qualified forms require the exact `calendar view` or `calendar projection` source family rather than globally rewriting `view I saw` or `projection I can see`.

The guard does not run when a current Calendar GovernedContext exists.

## Composition and shared path

Historical attribution runs before the existing false-reread containment. A mixed reply can therefore retain the user-supplied project-review statement and the unknown 3 PM detail while replacing a false offer to check Calendar again with the governed-path limitation. Unrelated detail such as a user-supplied 9 AM finance review remains unbound to a 10 AM/3 PM schedule and fails closed under the existing schedule-only rule.

The ordinary-model presentation guard is on the shared `/api/lighter/chat` server route. Typed and voice callers consequently receive the same containment; no voice-specific transport logic or client contract was added.

## Unchanged authority and acquisition

This sprint changes presentation text only. Calendar authority evaluation, proposal grammar, PendingAuthorization, operation/window semantics, GovernedContext projection, connector acquisition, OAuth, Gmail, Drive, Memory, legacy containment, and fresh-read `ASK` behavior are unchanged. Historical recognition remains non-authoritative: it cannot invoke a connector, establish authority, or create pending authorization.
