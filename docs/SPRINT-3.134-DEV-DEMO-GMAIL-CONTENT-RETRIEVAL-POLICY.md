# Sprint 3.134 — Development/Demo Gmail Content-Retrieval Policy

- **Status:** Implemented
- **Date:** 25 August 2026
- **Scope:** Concrete resource-policy configuration for identified-message Gmail reads

## Configuration

The tracked `config/content-retrieval-policy.dev.json` is the bounded, non-secret policy for the
development/demo environment. `.env.development` explicitly wires the live local JARVIS runtime to
that file through the server-only `CONTENT_RETRIEVAL_POLICY_PATH` variable. `.env.local.example`
documents the same setting for copied local configuration and deployment setup.

The policy has one first-match rule. It matches the existing `email` connector resource type,
permits external processing, and admits only `subject`. It does not admit snippets, bodies,
attachments, connector significance, search results, mailbox listings, or mutation data. The rule
does not create authority: it can be evaluated only after the existing exact identified-message
`gmail.read` authority decision allows the operation.

## Preserved execution order

The live path remains strictly:

```text
user authority
→ resource policy
→ connector/acquisition
→ requested ∩ policy-admissible ∩ supported fields
→ deterministic presentation
```

The existing loader still returns no policy for an absent path or unreadable/malformed JSON, and
the existing policy engine converts a missing or invalid policy into retrieval prohibition. Policy
denial does not invoke `retrieveMessage`. The tracked policy is data consumed by those boundaries;
it is not a fallback, hard-coded allow, loader bypass, or expansion of the policy engine.

## Explicit non-scope

This sprint adds no Gmail search, listing, discovery, thread traversal, natural-language mailbox
selection, send, modify, or delete operation. It changes no Gmail authority or
`PendingAuthorization` behavior and makes no Calendar, DAWNWATCH, Drive, or Memory change.
