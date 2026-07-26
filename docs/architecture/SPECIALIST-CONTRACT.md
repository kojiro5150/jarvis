# Specialist and Hand-off Contract

## Purpose

This contract defines the minimum requirements for a JARVIS specialist and the boundary between orchestration, specialist reasoning and external action.

## Specialist definition

Each specialist must declare:

- `id` — stable machine-readable identifier;
- `name` — display name;
- `subtitle` and `description` — concise purpose;
- `tier` — `executive` or `specialist`;
- `contextScope` — permitted view of shared operational state;
- `systemPrompt` — behavioural specification;
- `accent` and `icon` — presentation metadata.

Future iterations should add machine-readable capability and hand-off metadata rather than relying on prompt prose alone.

## Behavioural Constitutions

Behavioural Constitutions are the authoritative, versioned descriptions of permanent specialist behaviour. They define identity, mission, reasoning posture, prevention purpose, obligations, epistemic discipline, authority boundaries, collaboration and escalation rules, executive communication, failure modes and output contracts.

The shared constitutional layer is inherited by each constitution and contains system-wide transparency, uncertainty, evidence, human-authority, communication, collaboration and ethical obligations. Specialist files contain only behaviour unique to their role.

Sprint 3.9 provides constitutions for JARVIS, GECKO, MARCUS, ORACLE, STEVE, HERALD and DAWNWATCH. CO-WORK and PHDSS remain unchanged. Constitutions are architectural specifications during this sprint; `systemPrompt`, `BoaInstructionFile` and `BehaviouralContract` continue to drive the existing runtime and authority paths without behavioural change.

## Bounded responsibility

| Agent | Tier | Primary responsibility |
|---|---|---|
| JARVIS | Executive | Intent interpretation, orchestration, hand-off and synthesis |
| DAWNWATCH | Executive | Situational awareness and operational briefing |
| ORACLE | Specialist | Research, evidence and analytical insight |
| GECKO | Specialist | External market and ecosystem signals |
| HERALD | Specialist | Communication and publication support |
| STEVE | Specialist | Software engineering and technical implementation |
| CO-WORK | Specialist | Collaborative execution and long-form project work |
| MARCUS | Specialist | Reflection, judgement and perspective |
| PHDSS | Specialist | Governance-grade reasoning support for consequential decisions |

These boundaries describe primary responsibility, not a claim that no overlap can exist. When work crosses boundaries, JARVIS should make the hand-off explicit.

## Hand-off envelope

A future typed hand-off should contain at least:

```ts
interface AgentHandoff {
  fromAgentId: string;
  toAgentId: string;
  userIntent: string;
  task: string;
  contextScope: string;
  constraints: string[];
  expectedOutput: string;
  authority: "advise" | "draft" | "propose-action";
}
```

The hand-off must preserve the user's intent while narrowing the task to the receiving specialist's mandate.

## Authority boundary

A specialist response may:

- analyse;
- advise;
- draft;
- identify uncertainty;
- recommend a next step;
- propose an external action.

A specialist response may not, merely through model-generated prose:

- grant itself broader authority;
- perform an external write action;
- make a consequential decision on the user's behalf;
- modify persistent shared state without an explicit application-level operation.

External actions must be represented separately from ordinary conversational output and require an explicit authority check.

## Context boundary

Specialists receive the smallest useful context scope. Context selection must be based on declared configuration, not ad hoc prompt assembly in UI components.

Sensitive personal context should not be sent to a specialist solely because it exists in memory.

## Output expectations

Specialists should:

- answer within their declared responsibility;
- distinguish known information, inference and uncertainty;
- surface missing information that materially affects the result;
- state when another specialist or the user must decide;
- avoid implying that a recommendation is an authorised action.

## Routing principles

1. Direct specialist selection by the user takes precedence.
2. JARVIS may recommend or initiate a hand-off when the task clearly belongs to a specialist.
3. Multi-specialist work should be decomposed into explicit tasks.
4. PHDSS is invoked for governance-grade reasoning, not as a generic assistant.
5. MARCUS supports reflection and judgement but does not replace professional, clinical, legal or financial advice.
6. A connector's technical availability does not itself confer authority to use it.

## Verification targets for Sprint 2

- Unit tests confirm every registered agent has required metadata.
- Context-scope tests confirm specialists receive only declared state slices.
- Routing tests cover direct selection, fallback and unknown-agent behaviour.
- Hand-off objects are validated before model invocation.
- Proposed external actions are separated from conversational text.
