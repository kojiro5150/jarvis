# Sprint 3.180b1 — Deterministic capability-class fallback

## Purpose

Stabilize high-confidence capability classification discovered in live voice testing after Sprint 3.180b.

Identical explicit capability requests must not randomly alternate between a validated typed capability and ordinary-model fallback.

## Live failures

- `Will it rain in Geelong tomorrow?` first fell through to an ordinary false capability denial, then on repetition correctly selected `public_information`.
- `What are my last five emails?` fell through to the legacy Gmail path-limitation guard rather than stabilizing as a Gmail intent.

## Rule

High-confidence explicit capability signals constrain the selector's admissible capability class.

Closed constraints:

- `weather|rain|forecast|temperature` → `public_information`
- `gmail|email|emails|inbox` → `gmail`
- explicit `drive` → `drive`

The bounded model may still interpret operation details within that class.

It may not downgrade an explicit capability-class signal to `ordinary_conversation`, `unsupported`, invalid output, or a contradictory capability.

When it does, the server returns a minimal typed fallback candidate in the already-approved Sprint 3.180a envelope.

## Authority and execution

This fallback:

- creates no authority;
- creates no pending authorization;
- invokes no connector;
- exposes no private evidence;
- creates no factual result.

It only stabilizes the capability class.

## Invariant

> Explicit capability class may be deterministic. Authority remains independently adjudicated.

## Acceptance

- identical weather wording always reaches the public-information typed state;
- natural email wording always reaches the Gmail typed state;
- explicit Drive wording cannot be reclassified as Gmail or public information;
- deterministic governed commands continue to run before this selector;
- no capability execution is widened.
