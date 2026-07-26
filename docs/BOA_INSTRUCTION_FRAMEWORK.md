# BOA Instruction Framework

Sprint 3.8 introduces the typed operating layer that sits between each agent's existing `BehaviouralContract` and model execution.

## Separation of concerns

- `BehaviouralContract` is the machine-readable constitutional boundary: role, mandate, obligations, epistemic discipline, authority, escalation and output contract.
- `BoaInstructionFile` is the detailed operating file: how the specialist performs its role, prevents failure, handles evidence, collaborates, hands off and stops.
- `systemPrompt` remains the legacy/base persona until Sprint 3.9 migrates the full specialist content into BOA instruction files.

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

## Sprint 3.9

Sprint 3.9 will replace each framework entry with a substantive specialist file in this order:

1. JARVIS
2. DAWNWATCH
3. ORACLE
4. GECKO
5. MARCUS
6. HERALD
7. STEVE
8. CO-WORK
9. PHDSS
