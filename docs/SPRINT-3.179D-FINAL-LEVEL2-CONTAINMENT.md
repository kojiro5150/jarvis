# Sprint 3.179d — Final Level-2 containment and grammar freeze

## Purpose

Close the final known Level-2 containment hole found in live voice acceptance without widening semantic Calendar inference.

Live failure:

> When am I next doing something on JARVIS?

This wording is conceptual/relational. It asks for semantic interpretation of what Calendar titles are *about*, not a literal deterministic title-token match. Under the frozen Level-2 boundary, it must not authorize a Calendar read or search literal tokens such as `something` and `jarvis`.

## Change

The existing closed Level-2 relational containment set now also includes:

- `doing something on`
- `doing something about`

These phrases are rejected from deterministic Level-1 parsing and from the bounded 3.179 conversational interpreter. They receive the existing neutral containment reply and do not create a pending Calendar authorization.

No semantic title inference is added.

## Grammar freeze

After this patch, the 3.178/3.179 Calendar grammar family is frozen.

Future natural-language variants are not to be handled by continuing regex expansion unless they expose a verified authority, evidence, provenance, or truthfulness defect in an already-supported contract.

The next product problem is not “support more phrases.” It is:

> Remove the cognitive burden of translating natural human intent into machine-recognisable capability grammar while preserving deterministic authority, evidence, provenance, and truth boundaries.

That problem belongs to Sprint 3.180.

## Invariants retained

- deterministic before adaptive;
- meaning is not authority;
- a question is not evidence;
- no private Calendar fact is inferred by the model;
- no Calendar title is exposed for unrestricted semantic interpretation;
- fresh explicit authority is required for factual Calendar reads;
- bounded complete acquisition is required before factual publication;
- unsupported Level-2 wording fails closed;
- ordinary model text cannot manufacture Calendar authority.

## Acceptance

`When am I next doing something on JARVIS?`

must:

1. return the neutral unsupported factual Calendar wording response;
2. create no pending authorization;
3. perform no Calendar acquisition;
4. invoke no ordinary model factual-answer path.
