# Governance Core type boundary

This directory begins the implementation of the frozen Governance Core doctrine.

PR B is deliberately narrow. It introduces nominal trust-bearing types and compile-time negative tests for `MODEL-TRUST-01`; it does **not** migrate Calendar, Gmail, Drive, or any live authority path yet.

## What is proven by this PR

The repository's normal `tsc --noEmit` run rejects direct substitution of model-authored text for:

- authority evidence;
- governed evidence;
- governed provenance;
- policy proof;
- verification proof;
- completion proof.

The negative tests live in `model-trust.typecheck.ts`. They use `@ts-expect-error`, so CI fails if a forbidden assignment ever becomes legal.

## What is not yet proven

This PR does not claim:

- existing runtime authority code uses these types;
- existing provider evidence has migrated to these types;
- a complete source-provenance constructor chain exists;
- the Governance Core is operational;
- legacy authority mechanisms are removed.

Those are later migration steps.

## Migration lock

With this type core present, `MIGRATION-LOCK-01` is active:

> No new capability-touching implementation may depend on a superseded authority mechanism. Existing legacy mechanisms may remain only for bounded migration.

New capability work must target this typed trust boundary or stop for an explicit architecture decision.
