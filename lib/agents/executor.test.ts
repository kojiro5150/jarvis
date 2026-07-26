import { describe, expect, it } from "vitest";

import { prepareExecution } from "./executor";
import { herald } from "./herald";
import { jarvis } from "./jarvis";
import { phdss } from "./phdss";

import type { CollaborationPlanStep } from "./types";

function approvedStep(
  selectedAgentId: string,
  authority: "advise" | "draft" | "propose-action"
): CollaborationPlanStep {
  return {
    stepNumber: 1,
    selectedAgentId,
    requestedAuthority: authority,
    approved: true,
    reason: "approved",
    grantedAuthority: authority,
    obligations: [],
    epistemicDiscipline: [],
    escalationConditions: [],
    requiresEscalationAssessment: false,
  };
}

describe("deterministic execution gate", () => {
  it("prepares an approved contract-valid step", () => {
    const decision = prepareExecution({
      step: approvedStep(herald.id, "draft"),
      task: "Draft the board update",
      constraints: ["Preserve confirmed facts"],
    });

    expect(decision.prepared).toBe(true);
    expect(decision.instruction).toMatchObject({
      selectedAgentId: herald.id,
      authority: "draft",
      task: "Draft the board update",
      requiresHumanApproval: false,
    });
    expect(decision.instruction?.expectedOutput).toBe(
      herald.behaviouralContract?.outputContract
    );
  });

  it("rejects a collaboration step that was not approved", () => {
    const step = approvedStep(phdss.id, "advise");
    step.approved = false;
    step.grantedAuthority = undefined;

    expect(
      prepareExecution({ step, task: "Review the decision", constraints: [] })
    ).toEqual({
      prepared: false,
      reason: "Collaboration step 1 is not approved",
    });
  });

  it("rejects missing task content", () => {
    expect(
      prepareExecution({
        step: approvedStep(herald.id, "draft"),
        task: "   ",
        constraints: [],
      })
    ).toEqual({
      prepared: false,
      reason: "Collaboration step 1 has no executable task",
    });
  });

  it("rejects stale or tampered authority", () => {
    expect(
      prepareExecution({
        step: approvedStep(phdss.id, "draft"),
        task: "Draft a decision",
        constraints: [],
      })
    ).toEqual({
      prepared: false,
      reason: `Agent ${phdss.id} is no longer authorised for draft`,
    });
  });

  it("rejects inconsistent requested and granted authority", () => {
    const step = approvedStep(herald.id, "draft");
    step.requestedAuthority = "advise";

    expect(
      prepareExecution({ step, task: "Draft a response", constraints: [] })
    ).toEqual({
      prepared: false,
      reason: "Collaboration step 1 has inconsistent authority",
    });
  });

  it("requires later human approval for proposed actions", () => {
    const decision = prepareExecution({
      step: approvedStep(jarvis.id, "propose-action"),
      task: "Propose a calendar change",
      constraints: ["Do not execute"],
    });

    expect(decision.instruction?.requiresHumanApproval).toBe(true);
  });

  it("copies constraints and current contract boundaries", () => {
    const constraints = ["Use only confirmed information"];
    const decision = prepareExecution({
      step: approvedStep(herald.id, "draft"),
      task: "Draft the email",
      constraints,
      expectedOutput: "A concise email draft",
    });

    expect(decision.instruction?.constraints).not.toBe(constraints);
    expect(decision.instruction?.obligations).not.toBe(
      herald.behaviouralContract?.obligations
    );
    expect(decision.instruction?.expectedOutput).toBe(
      "A concise email draft"
    );
  });

  it("returns stable decisions for identical requests", () => {
    const request = {
      step: approvedStep(phdss.id, "advise"),
      task: "Assess governance risks",
      constraints: ["Human authority retained"],
    };

    expect(prepareExecution(request)).toEqual(prepareExecution(request));
  });
});
