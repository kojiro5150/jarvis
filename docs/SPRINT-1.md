# Sprint 1 — Operating-System Foundation

**Branch:** `sprint-1-operating-system`  
**Objective:** turn the imported JARVIS prototype into a maintainable, governed software project without changing its visible product behaviour.

## Sprint outcome

At the end of Sprint 1, JARVIS should have:

1. a documented system architecture and responsibility model;
2. an explicit engineering workflow for branches, commits and pull requests;
3. automated checks for linting, tests and production builds;
4. a defined specialist registry and routing contract;
5. a prioritised backlog for the next implementation sprint.

## In scope

- Repository structure and documentation.
- Architecture Decision Records (ADRs).
- Continuous integration.
- Specialist boundaries, shared context and orchestration contracts.
- Security and local-state rules.
- Baseline technical-debt identification.

## Out of scope

- Major UI redesign.
- New specialist capabilities.
- Production authentication redesign.
- Database migration.
- Autonomous external actions.
- Changes to PHDSS governance logic.

## Workstreams

### 1. Architecture baseline

- Document the current Next.js application, API routes, specialist layer, connector layer, memory layer and operational-state layer.
- Define JARVIS as orchestrator rather than an unbounded subject-matter specialist.
- Record the relationship between executive agents and bounded specialists.

### 2. Engineering discipline

- Work through short-lived branches and pull requests.
- Keep `main` deployable.
- Use ADRs for consequential architectural choices.
- Require lint, test and build checks before merge once CI is operational.

### 3. Specialist contract

Every specialist must have:

- a stable machine identifier;
- a human-readable purpose;
- a bounded responsibility;
- an explicit context scope;
- a system prompt;
- a declared tier;
- defined hand-off conditions;
- no implicit authority to perform external actions.

### 4. Governance and safety

- Secrets and OAuth tokens remain outside Git.
- Local memory and runtime state remain outside Git.
- Human authority is retained for consequential decisions and external actions.
- Routing, context selection and specialist output should become inspectable over time.

## Definition of done

Sprint 1 is complete when:

- [ ] architecture documentation is merged;
- [ ] the contribution and branching workflow is merged;
- [ ] CI runs lint, tests and build on pull requests;
- [ ] specialist and routing contracts are documented;
- [ ] security-sensitive local files are confirmed ignored;
- [ ] implementation issues for Sprint 2 are created and prioritised;
- [ ] the Sprint 1 pull request is reviewed and merged into `main`.

## Guiding constraint

Sprint 1 should improve the system's legibility and maintainability without breaking the functioning JARVIS baseline imported on 25 July 2026.
