# Sprint 3.138 — Deterministic Model-History Boundary

- **Status:** Implemented
- **Scope:** `/api/lighter/chat` ordinary model invocation only
- **Invariant:** governed private acquisition → deterministic user release ≠ automatic ordinary model context

The route continues to recognize authority from the untouched current user utterance and resolve
server-owned `PendingAuthorization` before any history transformation. Governed Gmail search,
identified-message Gmail read, and Calendar read responses remain deterministic and unchanged for
the user. Before a later ordinary model call, however, assistant messages matching those
deterministic release envelopes are replaced in a fresh model-only history with a fixed omission
marker. The client-visible transcript is neither mutated nor rewritten.

The boundary derives no trust from client-carried authority, provenance, or other metadata. A
fabricated message shaped like a private deterministic release is therefore omitted too. Ordinary
user and assistant turns pass through byte-for-byte, preserving normal conversational history.

This sprint adds no natural-language `gmail.read`, fields, policy permissions, Gmail acquisition,
or Calendar authority. It does not change `PendingAuthorization` storage. The frozen exact Gmail
search/read and Calendar authority/acquisition paths remain upstream of the model boundary.
