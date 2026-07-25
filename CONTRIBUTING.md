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

## Architecture decisions

Create an ADR under `docs/adr/` when a change:

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
