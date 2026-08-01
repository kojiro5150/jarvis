# Sprint 3.74 — DAWNWATCH Communications Presentation Correction

## Status

**Bounded Presentation Fix**

## Authority and scope

This sprint operates under the Engineering Constitution, North Star, JESS, Roadmap, DAWNWATCH Promotion Record, and Sprint 3.69 governed Gmail recipient contract. It corrects presentation only. Recipient evidence, provenance, sufficiency, canonical models, connectors, selectors, evaluation, comparison, integration, production defaults, and promotion remain unchanged.

The permitted implementation surface is `lib/dawnwatch-presentation.ts` and its tests. The shared Markdown renderer may change only if a narrow correction cannot be made at the DAWNWATCH source boundary. No standing architecture record is required.

## Defects

1. The presentation voice selects `title → subject → id`, causing subjectless communications to show a canonical Message-ID even when their sender is available.
2. The shared ReactMarkdown and `remark-gfm` path interprets an angle-bracket, email-shaped Message-ID as an email autolink even though the value is a protocol identifier.

## Required correction

DAWNWATCH voice observations shall select values in this order:

```text
title → subject → sender → id
```

Priorities and commitments remain title-first. Communications use their subject when present, otherwise their already-authorised sender, and use canonical ID only as the final floor. No missing data is populated or inferred.

When the final ID floor has canonical angle-bracket Message-ID shape, the DAWNWATCH presentation boundary shall make it visible as non-linkified Markdown text (for example inline code). The shared Markdown renderer shall retain genuine email linking.

## Acceptance tests

Tests shall prove:

1. sender is preferred to a Message-ID when no subject exists;
2. subject remains preferred to sender;
3. priority and commitment titles remain preferred;
4. an ID-only synthetic observation remains visible;
5. `<message-id@example.test>` does not produce `href="mailto:message-id@example.test"` through the actual Markdown surface; and
6. a genuine email address still produces its intended email link.

## Validation

The mandatory validation is:

```text
npm test
npm run lint
npm run typecheck
npm run build
git diff --check
```

Targeted coverage shall include DAWNWATCH presentation voice, sender and ID fallbacks, Markdown linkification, and the DAWNWATCH opening-presentation regression.

## Completion criteria

This sprint is complete only when the fallback and linkification defects are corrected, legitimate email links remain functional, full validation passes, and no governed evidence or architecture semantics change.
