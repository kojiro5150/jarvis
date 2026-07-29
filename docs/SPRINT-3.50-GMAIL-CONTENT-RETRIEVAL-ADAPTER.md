# Sprint 3.50 — Gmail Content Retrieval Adapter

## Constitutional boundary

The Gmail content retrieval adapter is the first consumer of the Content Retrieval Policy Engine. Its input identifies one Gmail message explicitly; it performs no search, selection, thread retrieval, attachment processing, redaction, sanitisation, summarisation, model invocation, conversational integration, or Executive Context integration.

Permission always precedes retrieval. The adapter evaluates the request's resource metadata against the supplied, versioned policy before invoking `retrieveMessage`. Only `external_processing_permitted` crosses the connector boundary. Prohibition, approved-environment-only processing, redaction-only processing, absent or malformed policy, unknown resources, and unmatched policy all return a content-free denial and a content-free audit record without calling Gmail. Redaction-only decisions record that the required transformation was not applied; the missing transformation capability is never interpreted as permission.

## Admissible content

The adapter can release only these canonical fields when both requested and policy-admissible:

* subject
* snippet
* plain-text body
* attachment filenames
* attachment filename/MIME-type metadata

HTML and attachment bodies are not represented in the result. Raw connector objects may contain other properties, but the adapter constructs a new result from the allowlist rather than passing connector objects through. Gmail labels, importance, priority, stars, flags, category or inbox classification, inferred urgency or significance, and connector-generated summaries are therefore never exposed.

## Result and audit

Every attempt returns a deeply frozen `ContentRetrievalResult`. A permitted result contains only selected content. Denied and failed results contain no content. Connector failures are converted to audited failures so every adapter attempt has an audit outcome.

Every audit contains the retrieval identifier, original typed request, authoritative policy decision and exact policy version, requested and released field names, requesting runtime, transformation status, timestamp, and outcome. It contains no retrieved subject, body, snippet, attachment name, or MIME value. Identifier and clock factories are injectable for deterministic synthetic tests; production defaults use a random UUID and the current time.

Retrieved connector content is live and intentionally non-replayable. Policy enforcement remains deterministic for the same request resource metadata and policy version. This boundary does not combine communication content with executive facts; Executive Context remains outside this sprint.
