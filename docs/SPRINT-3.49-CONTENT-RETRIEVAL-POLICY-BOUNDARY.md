# Sprint 3.49 — Content Retrieval Policy Boundary

## Constitutional contract

Content retrieval is a separate, non-canonical interface crossing. Connectors remain authoritative for communication content; Executive Context remains authoritative for executive facts. This package performs no retrieval and has no conversation-runtime, connector, or model integration.

Permission always precedes retrieval. `evaluateContentRetrievalPolicy` is a pure, deterministic evaluation of resource metadata and versioned deployment policy. Unknown resources, absent configuration, invalid configuration, and unmatched resources are prohibited. Ordered rules use first-match precedence so the same metadata, policy, and policy version produce the same result.

## Independent gates

1. **Processing environment:** the decision distinguishes external processing, transformation-only processing, approved-environment-only processing, and prohibition.
2. **Field admissibility:** fields are intersected with the rule allowlist only when raw external processing is permitted. Transformation-only and approved-environment decisions release no raw fields because this sprint supplies no approved transformation.

Connector significance (labels, importance, priority, flags, connector summaries, and inferred urgency or significance) is constitutionally excluded. A configuration attempting to admit such a field is invalid and therefore denied.

## Deployment configuration

Production policy is deployment data. Supply its path explicitly to `loadContentRetrievalPolicy`, normally from deployment or secrets configuration. The repository tracks only `config/content-retrieval-policy.example.json`. Local policies named `config/content-retrieval-policy.local.json` or `config/content-retrieval-policy.*.local.json` are ignored, so a normal `git add .` cannot stage them. Never place real identities, organisation mappings, domain rules, or institutional overrides in the example.

Every configuration requires a non-empty `policyVersion`. Audit records copy that exact version alongside request metadata, requested and released fields, transformation state, runtime, timestamp, and outcome. They deliberately do not store retrieved content.

## Future boundary

Sprint 3.50 may retrieve content only after evaluation and must create an audit record for every attempt. It must not treat a connector's technical capability as permission, and must not ask the conversation runtime to decide safety after raw content has crossed the boundary.
