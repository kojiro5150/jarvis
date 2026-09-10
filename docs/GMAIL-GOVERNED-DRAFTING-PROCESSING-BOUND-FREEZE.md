# Gmail Governed Drafting — Processing-Bound Freeze

**Status:** Capacity prerequisite **RESOLVED / FROZEN** on 10 September 2026. Governed Gmail drafting itself remains unimplemented.

## Decision

For the measured production configuration, governed Gmail content supplied to the model for drafting is limited to **16,000 JavaScript string code units** after the existing Gmail content-retrieval policy has produced plain text.

The empirical cross-condition ceiling is **24,000 code units**. The production bound applies an **8,000-code-unit margin**, one third of the proven ceiling.

This limit does not change the ordinary conversation-message limit of 8,000 characters, the 39-message deterministic history-compaction contract, or the complete content that may be shown in an initially authorised deterministic Gmail release.

## Evidence identity

The final local evidence report is intentionally excluded from Git:

| Field | Value |
| --- | --- |
| File | `gmail-step-down-complete.json` |
| Report SHA-256 | `54aaae6ecabbe85ad6de533cf44051d11c7e325727555aa0e4be19de0d1504ac` |
| Immediate source-report SHA-256 | `cbad9f7d92949cbb2a1d63d33a72423a2de95f5663357651cd76a80f5afb38a2` |
| Generated | `2026-09-10T12:25:01.739Z` |
| Completed | `2026-09-10T12:25:11.074Z` |
| Model | `claude-sonnet-4-5-20250929` |
| Maximum output | 1,024 tokens |
| Timeout | 30,000 ms |

The report contains only synthetic fixture measurements, digests, categorical fidelity signals and provider usage. Prompt and response content are not retained. The report remains under the repository's ignored `data/capacity-measurements/` path; this freeze record preserves verifiable provenance without committing raw measurement output.

## Method

The measurement harness exercised five deterministic synthetic fixture families:

- plain text;
- forwarded chains;
- HTML-to-text conversion;
- a Raman-shaped LinkedIn invitation thread reproducing the structure, but not the private content, of the historical drafting incident; and
- dense prose.

Each relevant content size was exercised with empty history, representative retained history, and the maximum-admissible 39-message history where selected by the deterministic boundary plan. The maximum history contains 39 messages of 7,999 code units each. Boundary candidates required five independent attempts; a size was not treated as reliable because it passed once.

Provider-credit failures were retried at their exact attempt identities. Apparent fidelity failures were not silently discarded. A synthetic-only diagnostic reproduced the bounded wording `I'm not accepting new connections at this time`, proving a deterministic validator false negative. PR #565 added exactly that evidenced grammar form, after which only the affected attempt identities were rerun. No model was used to classify fidelity.

## Final verified evidence

Independent calculation from the final report established:

| Measure | Result |
| --- | ---: |
| Results | 35 |
| Unique attempt identities | 35 |
| Distinct step-down cells | 7 |
| Attempts per cell | 5 |
| Passed | 35 |
| Failed | 0 |
| Maximum input tokens | 74,371 |
| Maximum output tokens | 123 |
| Maximum elapsed time | 4,839 ms |
| Total input tokens | 1,335,730 |

Every attempt ended with provider stop reason `end_turn`. There were no provider rejections, context-limit failures, timeouts, malformed responses, missing decline signals or forbidden fabricated details in the final evidence.

The final seven step-down cells were:

| Fixture | Size | History | Result |
| --- | ---: | --- | ---: |
| Plain text | 48,000 | Maximum-admissible 39 | 5/5 |
| Forwarded chain | 40,000 | Maximum-admissible 39 | 5/5 |
| HTML conversion | 48,000 | Empty | 5/5 |
| HTML conversion | 48,000 | Representative 39 | 5/5 |
| HTML conversion | 48,000 | Maximum-admissible 39 | 5/5 |
| Raman-shaped | 24,000 | Empty | 5/5 |
| Raman-shaped | 24,000 | Representative 39 | 5/5 |

Together with the completed screening and boundary evidence, 24,000 code units is the smallest maximum size consistently supported across the tested fixture/history conditions. It therefore governs the empirical ceiling; more permissive fixture results are not averaged upward.

## Enforcement contract

When governed Gmail drafting is implemented:

1. Measure the complete policy-processed plain-text Gmail content before model admission.
2. Content of **16,000 code units or fewer** may enter the purpose-bound governed drafting context.
3. Content above the bound fails closed with an honest processing-limit response.
4. Never silently truncate content and claim a complete evidence-grounded draft.
5. Never reconstruct omitted content from ordinary transcript history.
6. A prior Gmail read creates no drafting, reply or sending authority.
7. Drafting remains draft-only. Sending and mailbox mutation remain unavailable unless separately governed and implemented.
8. The bound controls model processing, not deterministic authorised display.

## Remeasurement triggers

The 16,000-code-unit bound must not be raised without new evidence. Remeasure before raising it, and reassess whether the existing bound remains valid, when any of these change materially:

- model or model version;
- system prompt or governed-context envelope;
- output-token budget;
- provider timeout;
- retained-history construction or maximum;
- Gmail content-normalisation policy;
- drafting schema or fidelity contract; or
- provider context-window behaviour.

## Scope boundary

This freeze resolves only the empirical processing-bound prerequisite. It does not implement a governed Gmail model-context channel, drafting proposal, fresh re-read authority flow, draft renderer, Gmail send capability, standing authority or live Raman-shaped product acceptance.
