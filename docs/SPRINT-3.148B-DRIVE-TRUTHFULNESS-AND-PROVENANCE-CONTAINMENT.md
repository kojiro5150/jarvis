# Sprint 3.148b — Drive Truthfulness and Provenance Containment

## Scope

This sprint changes only ordinary-model reply presentation after governed Drive history has been excluded. It does not change Drive authority, search/read connectors, OAuth, pending authorization, supported file classes or bounds, routing, specialist architecture, natural-language read behavior, search-to-read non-transitivity, or model-history isolation.

## Truthfulness rule

When governed Drive history was excluded and an ordinary-model reply makes a false Drive-wide capability denial, the reply is deterministically replaced with `UNSUPPORTED_DRIVE_PATH_REPLY`. The excluded-history signal is deny-side presentation evidence only: it does not infer an ID, propose or authorize an operation, invoke a connector, or create a specialist route.

This covers anaphoric current turns such as `read it`, `open it`, `show it`, and `summarize it` without requiring the word “Drive” in the current utterance. A Drive reference is required in the model's false denial, so unrelated capability statements are unchanged.

## Provenance rule

When governed Drive history was excluded, deterministic patterns replace ordinary-model claims that it found, remembered, or is restating an earlier Drive result with `EXCLUDED_DRIVE_PROVENANCE_REPLY`. The contained family includes:

- document/file IDs allegedly found earlier or before;
- previously found document IDs;
- earlier Drive-search results;
- Drive files allegedly found;
- provider IDs allegedly found earlier;
- document-name-plus-ID recollections;
- a file allegedly found earlier plus its ID; and
- IDs allegedly originating from an earlier Drive result.

The guard returns neither fabricated metadata nor true governed metadata. It uses no classifier and restores no governed result to model history.

## Regression evidence

Route-level tests reproduce the live anaphoric denial and fabricated-ID transcripts. They assert deterministic replacement, model-input exclusion of the true ID, absence of the fabricated ID in the response, and absence of connector calls, pending authorization, and `routeTo`. Existing authority, history, handoff, cross-capability, voice, and operational-state suites remain the frozen boundary.
