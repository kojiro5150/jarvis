# Contributing to JARVIS

## Working principle

Keep `main` stable. Make focused changes on a branch and integrate them through a pull request.

## Local setup

```bash
npm ci
npm run dev
```

Create `.env.local` from `.env.local.example` and populate required values locally. Never commit `.env.local`, OAuth tokens, memory data or other runtime state.

## Branch naming

Use a short, descriptive name:

- `sprint-1-operating-system`
- `feature/typed-routing`
- `fix/google-token-refresh`
- `docs/specialist-contract`

## Before committing

Run:

```bash
npm run lint
npm test
npm run build
```

A change is not considered verified merely because it renders in development mode.

## Commit guidance

Use concise, purposeful commit messages:

- `docs: define specialist hand-off contract`
- `feat: add typed routing decision`
- `fix: handle expired Google access token`
- `test: cover context isolation by agent scope`

Avoid combining unrelated changes in one commit.

## Pull requests

A pull request should state:

- what changed;
- why it changed;
- what was deliberately left unchanged;
- how it was verified;
- any security, privacy or governance implications.

## Sprint document locations

Sprint specification documents are created at `docs/SPRINT-<number>-<title>.md`.

Sprint completion, audit or evidence documents produced in response to a specification are created at the same path unless the specification explicitly directs otherwise. If a distinct location for audit-type outputs is intentional, it must be named explicitly in the governing sprint specification's **Return Format** section, not chosen ad hoc by the implementing session.

Any sprint specification that expects a differently located output, such as an Evaluation Design Note or a document in the `audits/` subdirectory, must state the exact intended path explicitly in its own text.

## Architecture decisions

Create an ADR under `docs/architecture/` when a change:

- changes a major system boundary;
- introduces a new external dependency or provider;
- alters authority, routing or action behaviour;
- changes persistence or identity architecture;
- would be costly to reverse.

## Security and privacy

Do not commit:

- `.env.local` or other secret-bearing environment files;
- `data/google-tokens.json`;
- `data/memory.json`;
- `node_modules/`;
- `.next/`;
- personal exports or downloaded connector content.

If a credential is accidentally committed, removing the file in a later commit is not sufficient. Revoke or rotate the credential and clean the repository history where necessary.

## Product constraint

JARVIS coordinates and supports work. Consequential decisions and external actions must remain subject to explicit human authority unless a separately documented and approved authority model exists.
