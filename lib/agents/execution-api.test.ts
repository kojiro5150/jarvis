import { describe, expect, it } from "vitest";

import {
  handleSpecialistExecution,
  parseSpecialistExecutionRequest,
} from "./execution-api";
import { herald } from "./herald";
import { jarvis } from "./jarvis";

import type { ModelAdapter } from "./model-executor";
import type { CollaborationPlanStep, HandoffAuthority } from "./types";

function approvedStep(
  selectedAgentId: string,
  authority: HandoffAuthority
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

const successfulAdapter: ModelAdapter = {
  async execute() {
    return {
      content: "Prepared specialist output",
      model: "test-model",
      inputTokens: 10,
      outputTokens: 5,
    };
  },
};

describe("specialist execution API boundary", () => {
  it("parses a valid typed request defensively", () => {
    const constraints = ["Use confirmed facts"];
    const parsed = parseSpecialistExecutionRequest({
      step: approvedStep(herald.id, "draft"),
      task: "Draft the update",
      constraints,
      expectedOutput: "A concise draft",
    });

    expect(parsed?.task).toBe("Draft the update");
    expect(parsed?.constraints).toEqual(constraints);
    expect(parsed?.constraints).not.toBe(constraints);
  });

  it("rejects malformed request bodies", () => {
    expect(parseSpecialistExecutionRequest(null)).toBeNull();
    expect(
      parseSpecialistExecutionRequest({
        step: {},
        task: "Draft",
        constraints: [],
      })
    ).toBeNull();
    expect(
      parseSpecialistExecutionRequest({
        step: approvedStep(herald.id, "draft"),
        task: "Draft",
        constraints: "none",
      })
    ).toBeNull();
  });

  it("executes one approved specialist step", async () => {
    const response = await handleSpecialistExecution(
      {
        step: approvedStep(herald.id, "draft"),
        task: "Draft the board update",
        constraints: ["Preserve confirmed facts"],
      },
      successfulAdapter
    );

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: "completed",
      result: {
        status: "completed",
        selectedAgentId: herald.id,
        content: "Prepared specialist output",
      },
    });
  });

  it("returns 422 when deterministic preparation rejects the step", async () => {
    const step = approvedStep(herald.id, "draft");
    step.approved = false;
    step.grantedAuthority = undefined;

    const response = await handleSpecialistExecution(
      { step, task: "Draft", constraints: [] },
      successfulAdapter
    );

    expect(response).toEqual({
      status: 422,
      body: {
        status: "rejected",
        reason: "Collaboration step 1 is not approved",
      },
    });
  });

  it("requires explicit human approval for proposed actions", async () => {
    const response = await handleSpecialistExecution(
      {
        step: approvedStep(jarvis.id, "propose-action"),
        task: "Propose a calendar change",
        constraints: ["Do not perform the change"],
      },
      successfulAdapter
    );

    expect(response).toEqual({
      status: 403,
      body: {
        status: "rejected",
        reason: "Executable instruction requires explicit human approval",
      },
    });
  });

  it("allows a human-approved proposed action to generate text only", async () => {
    const response = await handleSpecialistExecution(
      {
        step: approvedStep(jarvis.id, "propose-action"),
        task: "Propose a calendar change",
        constraints: ["Do not perform the change"],
        humanApproved: true,
      },
      successfulAdapter
    );

    expect(response.status).toBe(200);
  });

  it("does not leak provider failure details", async () => {
    const failingAdapter: ModelAdapter = {
      async execute() {
        throw new Error("secret provider diagnostic");
      },
    };

    const response = await handleSpecialistExecution(
      {
        step: approvedStep(herald.id, "draft"),
        task: "Draft the update",
        constraints: [],
      },
      failingAdapter
    );

    expect(response).toEqual({
      status: 502,
      body: {
        status: "failed",
        reason: "Specialist model execution failed",
      },
    });
  });
});
