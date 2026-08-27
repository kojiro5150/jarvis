# Sprint 3.151c — Calendar bare recall-source language containment

## Live failure

After a hard-reset voice flow had acquired and displayed a timing-only Calendar result, a bounded detail follow-up could receive: “I can see the timing of your two meetings tomorrow…” The reply retained both previously reported intervals and correctly lacked hidden titles, but its leading perception phrase falsely implied a current source.

The model did not repeat the word `calendar`; it referred to “the timing” because the conversational subject was already established. Literal Calendar-word matching therefore missed the presentation defect even though the server had deterministically established all of the following: the utterance was a Calendar recall/detail follow-up, a prior visible Calendar report existed, and no current Calendar GovernedContext existed.

The exact live precursor began `Looking at your calendar for tomorrow...`. The initial correction's history recognizer supported `Based on your calendar...` but not this bounded live presentation family, so the prior-report premise was not established and the bare-language guard could not run. The shared route regression now uses the complete live precursor, including its Melbourne date context and numbered intervals.

## Bounded presentation rule

Only inside that server-established Calendar recollection path, leading `I can see` or `I saw` language is historically attributed when its object has schedule/result semantics: timing, times, time blocks, time slots, meetings, commitments, or appointments. The rewrite preserves the useful schedule content and any truthful omitted-field limitation.

This second tier does not inspect model text to infer intent, recollection, authority, or acquisition. It is never invoked when current Calendar GovernedContext exists.

Prior Calendar report recognition is presentation/history classification only. It is not authority, current GovernedContext, resource policy, or capability evidence; it cannot acquire data, create pending authorization, or suppress the unchanged fresh-read `ASK` decision.

## False-positive boundary

Ordinary perception and conversational acknowledgement remain unchanged, including “I can see what you mean,” “I can see the difference,” references to a previous message, and options or data in user-provided notes and tables. The rule is neither a global `I can see` rewrite nor a global `I saw` rewrite.

## Unchanged behavior and non-goals

- Calendar authority evaluation, proposal grammar, pending authorization, operation/window semantics, GovernedContext projection, and connector execution are unchanged.
- User-supplied meeting details remain conversational evidence; the presentation rewrite neither creates nor removes those facts.
- False offers to reread Calendar for omitted metadata remain contained after historical attribution.
- The shared server-side ordinary-model reply guard serves typed and voice requests, so both transports inherit identical presentation semantics without voice-specific code.
- Gmail, Drive, Memory, OAuth, client contracts, voice transport, specialist routing, legacy containment, and OperationalState are out of scope.
- This sprint does not broaden the governed timing-only Calendar projection or make omitted titles recoverable.
