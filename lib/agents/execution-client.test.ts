import { describe, expect, it } from "vitest";

import { herald } from "./herald";
import { phdss } from "./phdss";
import {
  buildSpecialistExecutionRequest,
  parseSpecialistExecutionResponse,
} from "./execution-client";

const baseForm = {
  authority: "draft" as const,
  task: " Draft the board update ",
  constraintsText: "Use confirmed facts\n\nKeep it concise",
  expectedOutput: " A concise draft ",
  humanApproved: false,
};

describe("specialist execution UI boundary", () => {
  it("builds one bounded request from declared authority", () => {
    const request = buildSpecialistExecutionRequest(herald, baseForm);

    expect(request).toMatchObject({
      task: "Draft the board update",
      constraints: ["Use confirmed facts", "Keep it concise"],
      expectedOutput: "A concise draft",
      step: {
        stepNumber: 1,
        selectedAgentId: herald.id,
        requestedAuthority: "draft",
        grantedAuthority: "draft",
        approved: true,
      },
    });
  });

  it("rejects authority not declared by the specialist", () => {
    expect(
      buildSpecialistExecutionRequest(phdss, {
        ...baseForm,
        authority: "draft",
      })
    ).toBeNull();
  });

  it("requires non-empty task content", () => {
    expect(
      buildSpecialistExecutionRequest(herald, { ...baseForm, task: "   " })
    ).toBeNull();
  });

  it("carries explicit approval only for proposed actions", () => {
    const request = buildSpecialistExecutionRequest(
      { ...herald, behaviouralContract: { ...herald.behaviouralContract!, authority: ["propose-action"] } },
      { ...baseForm, authority: "propose-action", humanApproved: true }
    );

    expect(request?.humanApproved).toBe(true);
  });

  it("normalises completed and rejected API responses", () => {
    expect(
      parseSpecialistExecutionResponse({
        status: "completed",
        result: { status: "completed", content: "Draft ready", model: "claude" },
      })
    ).toEqual({ status: "completed", content: "Draft ready", model: "claude" });

    expect(
      parseSpecialistExecutionResponse({ status: "rejected", reason: "Approval required" })
    ).toEqual({ status: "rejected", reason: "Approval required" });
  });
});
