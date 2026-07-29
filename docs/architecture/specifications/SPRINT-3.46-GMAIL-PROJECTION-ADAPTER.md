# Sprint 3.46 — First Production Email Projection Adapter

**Architectural finding: Finding B — Partial Admissibility Confirmed.**

## Implemented boundary

The production path is `Gmail API metadata → GmailMessageObservation → normalizeGmailObservation
→ GmailProjectionAdapter → ProjectionArtifact<OperationalCommunication>`. Downstream projection
depends on the bounded observation contract, not Gmail API response types. The connector requests
headers and MIME structure only; it does not request or project bodies or attachment data.

Canonical projection admits only a valid explicit `Message-ID`, asserted sender and recipients,
the protocol `Date`, and explicit `In-Reply-To` and `References`. Subject, snippets, bodies,
filenames, labels, Gmail thread identity, Gmail internal identity, and heuristics do not enter
`OperationalCommunication`. Gmail identifiers, internal timestamps, retrieval time when supplied,
read/attachment booleans, and structural MIME facts remain artifact provenance.

## Identity limitation

A syntactically valid explicit Message-ID is the only admitted message identity. Missing,
malformed, or duplicate Message-ID headers cause deterministic rejection. Duplicate relationship
headers are likewise rejected because selecting or combining them would reconstruct an
observation. Gmail message and thread identifiers never substitute for protocol identity. This is
the constitutionally admissible existing behaviour; unsupported messages remain outside the
publication and no ontology change is made.

## Structural findings and live probe

No private mailbox was accessed while producing this change, so repository percentages are not
claimed. Synthetic coverage confirms all required structural cases: complete and missing
relationships, malformed and duplicate protocol headers, Gmail thread grouping without protocol
linkage, protocol linkage without Gmail grouping, multipart and HTML-only structure, attachment
presence, and missing protocol identity. The optional live test runs only when
`GMAIL_LIVE_PROBE=1` and retains no message content or observations.

A live structural audit should aggregate only counts and percentages for Message-ID,
In-Reply-To, References, malformed/duplicate headers, Gmail/protocol grouping divergence,
multipart, HTML-only, and missing observations. Raw values, addresses, subjects, filenames, and
content must never be committed. Until such an authorised probe is executed, the empirical result
is **Finding B**, not a claim that all Gmail observations are admissible.
