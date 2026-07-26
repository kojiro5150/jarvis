import { describe, expect, it } from "vitest";

import { buildExecutionAuditRecord } from "./execution-audit";

import type { SpecialistExecutionApiRequest, SpecialistExecutionApiResponse } from "./execution-api";

const request: SpecialistExecutionApiRequest = {
  step: {
    stepNumber: 1,
    selectedAgentId: "oracle",
    requestedAuthority: "advise",
    grantedAuthority: "advise",
    approved: true,
    reason: "approved",
    obligations: [],
    epistemicDiscipline: [],
    escalationConditions: [],
    requiresEscalationAssessment: false,
  },
  task: "Assess the evidence",
  constraints: ["Use confirmed sources"],
  humanApproved: false,
};

describe("buildExecutionAuditRecord", () => {
  it("captures completed model metadata without mutating the request", () => {
    const response: SpecialistExecutionApiResponse = {
      status: 200,
      body: {
        status: "completed",
        result: {
          status: "completed",
          selectedAgentId: "oracle",
          content: "Assessment",
          model: "claude-test",
          inputTokens: 12,
          outputTokens: 8,
        },
      },
    };

    const record = buildExecutionAuditRecord(request, response, {
      id: "audit-1",
      timestamp: "2026-07-26T00:00:00.000Z",
    });

    expect(record).toMatchObject({
      id: "audit-1",
      selectedAgentId: "oracle",
      requestedAuthority: "advise",
      grantedAuthority: "advise",
      preparationStatus: "prepared",
      executionStatus: "completed",
      model: "claude-test",
      inputTokens: 12,
      outputTokens: 8,
    });
    expect(record.constraints).not.toBe(request.constraints);
  });

  it("captures deterministic preparation rejection reasons", () => {
    const response: SpecialistExecutionApiResponse = {
      status: 422,
      body: {
        status: "rejected",
        reason: "Collaboration step 1 is not approved",
      },
    };

    const record = buildExecutionAuditRecord(request, response, { id: "audit-2" });

    expect(record.preparationStatus).toBe("rejected");
    expect(record.executionStatus).toBe("rejected");
    expect(record.reason).toBe("Collaboration step 1 is not approved");
  });
});
