# BOA Instruction Framework

Sprint 3.8 introduces the typed operating layer that sits between each agent's existing `BehaviouralContract` and model execution.

## Separation of concerns

- `BehaviouralConstitution` is the authoritative, versioned behavioural specification for a Sprint 3.9 specialist. It remains independent of runtime tasks, conversations, models and operational context.
- The shared constitutional layer supplies common transparency, evidence, uncertainty, human-authority, communication, collaboration and ethical obligations. A specialist constitution contains only role-specific behaviour.
- `BehaviouralContract` remains the machine-readable runtime authority boundary used by coordination and execution: role, mandate, obligations, epistemic discipline, authority, escalation and output contract.
- `BoaInstructionFile` is the detailed operating file: how the specialist performs its role, prevents failure, handles evidence, collaborates, hands off and stops.
- `systemPrompt` remains the legacy/base runtime persona.

Behavioural Constitutions are authoritative architectural specifications, not the runtime prompt source in Sprint 3.9. Existing prompt assembly and execution behaviour remain unchanged.

## Required sections

1. Identity and function
2. Mission
3. Non-goals
4. Behavioural obligations
5. Failure modes
6. Epistemic rules
7. Evidence handling
8. Authority limits
9. Escalation triggers
10. Handoff rules
11. Collaboration rules
12. Output structure
13. Stop conditions

## Lifecycle

Instruction files carry semantic versioning and one status:

- `framework` — structure and shared safeguards only
- `draft` — specialist content is being developed
- `active` — approved for production behaviour
- `retired` — retained for provenance but not used

## Runtime assembly order

```text
base agent system prompt
→ BOA instruction file
→ current operational context
→ bounded user task / conversation
```

The assembly is deterministic. Instruction files do not select agents, grant authority, approve actions, invoke tools or synthesise multiple specialist outputs.

## Sprint 3.9 constitutional coverage

Sprint 3.9 adds constitutions for:

1. JARVIS
2. GECKO
3. MARCUS
4. ORACLE
5. STEVE
6. HERALD
7. DAWNWATCH

CO-WORK and PHDSS retain their existing definitions and BOA framework files. Constitution loading is deliberately separate from prompt loading; a future approved sprint may migrate runtime prompt material.
