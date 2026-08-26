# Sprint 3.148 — Identified-file Drive read authority foundation

## Implemented boundary

The sole operation is the immutable `{ capability: "drive.read", fileId, contentMode: "text" }`.
Only the byte-exact current utterance `drive.read <provider-file-id> [text]` authorizes it. A search
result, provider ID alone, confirmation, filename, natural language, anaphora, pending authorization,
or specialist handoff cannot authorize content acquisition.

The only supported class is a Google Docs document
(`application/vnd.google-apps.document`) exported by Google as `text/plain`. The release is complete,
verbatim, deterministic text—never summarized—and is refused rather than truncated above 65,536
downloaded bytes. The connector performs no local fallback and binds metadata and export requests to
the exact authorized provider ID.

## Boundaries and ordering

Processing is strictly: exact current-turn user authority; Drive-specific closed policy; OAuth
capability check; Google connector construction; identified-file metadata and export acquisition;
bounded deterministic release. Policy and OAuth grant are prerequisites, not user authority.

The Google grant changes from `drive.metadata.readonly` to Google's minimum general content-read
scope, `https://www.googleapis.com/auth/drive.readonly`. It adds no write scope. Existing users must
reconnect; absence of the new scope fails closed before connector construction.

Deterministic Drive content releases and earlier exact Drive read commands are content-derived and
removed from ordinary model history. Release-shaped fabricated assistant history is treated exactly
the same. The implementation adds no Drive pending flow and no authorization machinery outside the
canonical exact-current-utterance substrate.
