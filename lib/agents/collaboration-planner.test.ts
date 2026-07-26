import { describe, expect, it } from "vitest";

import { planCollaboration } from "./collaboration-planner";
import { herald } from "./herald";
import { oracle } from "./oracle";
import { phdss } from "./phdss";


describe("deterministic collaboration planning", () => {
  it("preserves declared order with stable step numbers", () => {
    const plan = planCollaboration({
      steps: [
        { selectedAgentId: oracle.id, requestedAuthority: "advise" },
        { selectedAgentId: herald.id, requestedAuthority: "draft" },
      ],
    });

    expect(plan.steps.map((step) => step.selectedAgentId)).toEqual([
      oracle.id,
      herald.id,
    ]);
    expect(plan.steps.map((step) => step.stepNumber)).toEqual([1, 2]);
  });

  it("approves a plan when every step is contract-authorised", () => {
    const plan = planCollaboration({
      steps: [
        { selectedAgentId: oracle.id, requestedAuthority: "advise" },
        { selectedAgentId: herald.id, requestedAuthority: "draft" },
      ],
    });

    expect(plan.approved).toBe(true);
    expect(plan.reason).toBe(
      "All 2 collaboration steps are contract-authorised"
    );
    expect(plan.rejectedSteps).toEqual([]);
    expect(plan.approvedSteps).toHaveLength(2);
  });

  it("rejects the plan when any step exceeds declared authority", () => {
    const plan = planCollaboration({
      steps: [
        { selectedAgentId: oracle.id, requestedAuthority: "advise" },
        { selectedAgentId: phdss.id, requestedAuthority: "draft" },
      ],
    });

    expect(plan.approved).toBe(false);
    expect(plan.reason).toBe("1 of 2 collaboration steps rejected");
    expect(plan.approvedSteps).toHaveLength(1);
    expect(plan.rejectedSteps).toHaveLength(1);
    expect(plan.rejectedSteps[0]).toMatchObject({
      stepNumber: 2,
      selectedAgentId: phdss.id,
      requestedAuthority: "draft",
      approved: false,
    });
  });

  it("keeps valid steps inspectable when another step is rejected", () => {
    const plan = planCollaboration({
      steps: [
        { selectedAgentId: "unknown-agent", requestedAuthority: "advise" },
        { selectedAgentId: herald.id, requestedAuthority: "draft" },
      ],
    });

    expect(plan.steps).toHaveLength(2);
    expect(plan.steps[1]).toMatchObject({
      selectedAgentId: herald.id,
      approved: true,
      grantedAuthority: "draft",
    });
  });

  it("flags declared escalation conditions for later assessment only", () => {
    const plan = planCollaboration({
      steps: [{ selectedAgentId: phdss.id, requestedAuthority: "advise" }],
    });

    expect(plan.requiresEscalationAssessment).toBe(true);
    expect(plan.steps[0].requiresEscalationAssessment).toBe(true);
    expect(plan.steps[0].escalationConditions).toEqual(
      phdss.behaviouralContract?.escalationConditions
    );
  });

  it("does not flag rejected steps as requiring escalation assessment", () => {
    const plan = planCollaboration({
      steps: [{ selectedAgentId: phdss.id, requestedAuthority: "draft" }],
    });

    expect(plan.requiresEscalationAssessment).toBe(false);
    expect(plan.steps[0].requiresEscalationAssessment).toBe(false);
  });

  it("returns a valid empty plan", () => {
    expect(planCollaboration({ steps: [] })).toEqual({
      approved: true,
      reason: "All 0 collaboration steps are contract-authorised",
      steps: [],
      approvedSteps: [],
      rejectedSteps: [],
      requiresEscalationAssessment: false,
    });
  });

  it("returns stable plans for identical requests", () => {
    const request = {
      steps: [
        { selectedAgentId: oracle.id, requestedAuthority: "advise" as const },
        { selectedAgentId: herald.id, requestedAuthority: "draft" as const },
      ],
    };

    expect(planCollaboration(request)).toEqual(planCollaboration(request));
  });
});
