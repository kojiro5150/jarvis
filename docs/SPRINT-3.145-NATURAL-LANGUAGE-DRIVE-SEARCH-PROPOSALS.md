# Sprint 3.145 — Natural-Language Drive Search Proposals

## Scope

JARVIS may deterministically recognise exactly three high-precision natural-language forms for the
existing metadata-only `drive.search` operation:

```text
Search my Drive for <file name>
Find <file name> in my Drive
Look in my Drive for <file name>
```

Recognition creates the existing frozen operation `{ capability: "drive.search", name,
maxResults: 5 }`; it is a proposal and supplies no authority. Pronoun and anaphoric operands are
rejected rather than resolved from conversation history.

The authority sequence is fixed:

```text
exact drive.search command → ALLOW
natural-language request → ASK → server-owned PendingAuthorization → explicit confirmation → ALLOW
```

The server-owned pending record retains the exact proposed name. A bare confirmation without that
record has no authority. Pending state is one-shot and capability-bound, so Calendar or Gmail
pending authority cannot execute Drive search and Drive pending authority cannot execute those
capabilities. Typed and transcribed voice requests traverse the same canonical server path. The
confirmation prompt is deterministic server copy, never model-generated authority UX.

## Preserved boundaries

Execution remains the Sprint 3.144 Google-only governed connector under
`drive.metadata.readonly`, with no local fallback. One deterministic `files.list` request returns
at most five records containing only provider ID, name, MIME type, and modified time; provider IDs
are preserved. File content, snippets, export, download, summarisation, model synthesis, and
follow-on reads remain outside the capability. The exact `drive.search <file name>` grammar and
direct `ALLOW` path are unchanged.

The three forms are matched case-insensitively and may end in one `.`, `?`, or `!`; no other
normalisation is performed. Other word orders, broad Drive verbs, content reads, fuzzy or semantic
matching, referential expressions, and voice-specific shortcuts are not admitted. The deny-side
private-capability handoff classifier checks both the raw utterance and a model-proposed task
summary for Drive acquisition requests. That dual check can only prevent a specialist bypass: a
task summary is never authority and cannot create a proposal or pending state. This sprint adds no
`drive.read`, Calendar, Gmail, Memory, specialist, standing-grant, or general natural-language
authority.

## Verification

Regression coverage fixes all three accepted forms, rejects broadened and anaphoric variants,
proves `ASK` performs no connector construction, confirms execution uses the exact stored operand,
and verifies one-shot confirmation, cross-capability isolation, direct-command preservation, the
five-record cap, provider IDs, and metadata-only deterministic output.
