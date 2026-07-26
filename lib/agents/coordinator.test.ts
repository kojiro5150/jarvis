import { describe, expect, it } from "vitest";

import { coordinateHandoff } from "./coordinator";
import { herald } from "./herald";
import { jarvis } from "./jarvis";
import { phdss } from "./phdss";


describe("contract-aware coordination", () => {
  it("approves authority explicitly declared by the selected agent", () => {
    const decision = coordinateHandoff({
      selectedAgentId: herald.id,
      requestedAuthority: "draft",
    });

    expect(decision.approved).toBe(true);
    expect(decision.grantedAuthority).toBe("draft");
    expect(decision.outputContract).toBe(
      herald.behaviouralContract?.outputContract
    );
  });

  it("rejects authority outside the selected agent's contract", () => {
    const decision = coordinateHandoff({
      selectedAgentId: phdss.id,
      requestedAuthority: "draft",
    });

    expect(decision).toMatchObject({
      selectedAgentId: phdss.id,
      approved: false,
      reason: `Agent ${phdss.id} is not authorised for draft`,
    });
    expect(decision.grantedAuthority).toBeUndefined();
  });

  it("allows JARVIS to propose an action without authorising execution", () => {
    const decision = coordinateHandoff({
      selectedAgentId: jarvis.id,
      requestedAuthority: "propose-action",
    });

    expect(decision.approved).toBe(true);
    expect(decision.grantedAuthority).toBe("propose-action");
    expect(decision.reason).not.toContain("execute");
  });

  it("surfaces behavioural obligations and epistemic discipline", () => {
    const decision = coordinateHandoff({
      selectedAgentId: phdss.id,
      requestedAuthority: "advise",
    });

    expect(decision.obligations).toEqual(
      phdss.behaviouralContract?.obligations
    );
    expect(decision.epistemicDiscipline).toEqual(
      phdss.behaviouralContract?.epistemicDiscipline
    );
  });

  it("surfaces escalation conditions without judging whether they apply", () => {
    const decision = coordinateHandoff({
      selectedAgentId: herald.id,
      requestedAuthority: "draft",
    });

    expect(decision.escalationConditions).toEqual(
      herald.behaviouralContract?.escalationConditions
    );
  });

  it("returns fresh contract arrays rather than mutable registry references", () => {
    const decision = coordinateHandoff({
      selectedAgentId: herald.id,
      requestedAuthority: "draft",
    });

    expect(decision.obligations).not.toBe(
      herald.behaviouralContract?.obligations
    );
    expect(decision.escalationConditions).not.toBe(
      herald.behaviouralContract?.escalationConditions
    );
  });

  it("rejects unknown agents deterministically", () => {
    expect(
      coordinateHandoff({
        selectedAgentId: "unknown-agent",
        requestedAuthority: "advise",
      })
    ).toEqual({
      selectedAgentId: "unknown-agent",
      approved: false,
      reason: "Unknown agent: unknown-agent",
      obligations: [],
      epistemicDiscipline: [],
      escalationConditions: [],
    });
  });

  it("returns stable decisions for identical requests", () => {
    const request = {
      selectedAgentId: herald.id,
      requestedAuthority: "draft" as const,
    };

    expect(coordinateHandoff(request)).toEqual(coordinateHandoff(request));
  });
});
