# Sprint 3.131 — Scoped Temporal Calendar Read

- **Status:** Implemented
- **Date:** 25 August 2026

## Closed scope

Every live `calendar.read` operation carries an immutable, half-open (`start <= event < end`) temporal window resolved from an injected clock in `Australia/Melbourne`. The only natural periods are `today`, `tomorrow`, `this morning`, `this afternoon` (12:00–17:00), `this evening` (17:00–24:00), and `this week` (Monday 00:00 through the following Monday 00:00). Melbourne civil boundaries are converted to instants, so 23- and 25-hour daylight-saving days remain correct.

A generic explicit Calendar read retains a bounded default of exactly seven elapsed days beginning at the injected-clock instant. It does not silently expand to a civil week.

## Authority and acquisition

The server-owned `PendingAuthorization` stores the whole proposed operation, including its resolved bounds. Confirmation returns that same operation; it does not recompute time. Only then is the connector constructed, and its bounded `listBetween(start, end, limit)` method receives those exact authorized bounds before private event content can be fetched. Returned provider events are also constrained to the authorized interval before publication.

Calendar output is rendered deterministically in Melbourne-local date/time notation. It bypasses the conversational model, does not disclose raw ISO timestamps, and preserves the existing metadata-only Calendar evidence policy.

## Explicit non-scope

No Gmail, Drive, or Memory authority is introduced. No model-based or broader natural-language date parser, Calendar write operation, calendar-source selection, or specialist handoff is added.
