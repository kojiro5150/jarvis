# Sprint 3.143 — Voice Authority Turn Integrity

## Scope

This sprint makes a transcribed microphone capture enter the same canonical
submission path as a typed utterance without expanding any authority grammar or
capability. It changes client turn ordering only. There is no Drive work, new
Calendar/Gmail grammar, persistent pending store, or voice-authority redesign.

## Contract

Each successful capture receives an event identity independent of transcript
text. The console deduplicates delivery of the same event identity, while two
different captures with identical text remain two turns. Transcription provider
metadata and confidence are not carried into the turn and cannot be authority
evidence.

Voice turns use a deterministic promise queue rather than a timer or debounce:
one canonical turn is submitted, its response and client state are fully
applied, and only then may the next captured turn begin. Consequently a spoken
confirmation observes the opaque pending reference returned by the preceding
spoken `ASK`.

The only pending authority value retained by the client is
`{ pendingAuthorizationId }`. The voice layer neither reconstructs operations
nor contains Calendar/Gmail-specific authority rules. The server remains the
owner and interpreter of pending authority.

Every JARVIS request also receives a monotonically increasing client request
identity. A response may update the pending reference only if it belongs to the
latest such request. Thus an older response cannot overwrite authority state
after a newer response, including when a typed request and voice request overlap.
Typed submission and server adjudication semantics otherwise remain unchanged.

## Verification

Behavioral tests exercise Calendar `ASK` → confirmation → result, Gmail `ASK` →
confirmation → IDs, non-overlap of queued voice turns, stale response rejection,
and two separate `yes` capture events. Source-boundary assertions remain
supplementary rather than serving as proof of runtime behavior.
