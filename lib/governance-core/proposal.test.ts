import { describe, expect, it } from "vitest";
import {
  createModelProposal,
  createModelProposalBatch,
} from "./proposal";

describe("Governance Core model proposal boundary", () => {
  it("represents a compound request as independent low-trust proposals", () => {
    const calendar = createModelProposal({
      capability: "calendar",
      operation: "read",
      temporalConstraint: "tomorrow",
    }, "The user asked to check tomorrow's calendar.");

    const gmail = createModelProposal({
      capability: "gmail",
      operation: "search",
      requestedOutput: "list",
    }, "The user also asked to check email.");

    const batch = createModelProposalBatch([calendar, gmail]);

    expect(batch).not.toBeNull();
    expect(batch?.proposals).toHaveLength(2);
    expect(batch?.proposals[0]).toMatchObject({
      kind: "model_proposal",
      candidate: { capability: "calendar", operation: "read" },
    });
    expect(batch?.proposals[1]).toMatchObject({
      kind: "model_proposal",
      candidate: { capability: "gmail", operation: "search" },
    });
    expect(Object.isFrozen(batch)).toBe(true);
    expect(Object.isFrozen(batch?.proposals)).toBe(true);
    expect(Object.isFrozen(calendar.candidate)).toBe(true);
    expect(Object.isFrozen(gmail.candidate)).toBe(true);
  });

  it("does not infer shared authority from grouping and bounds batch size", () => {
    const proposal = createModelProposal({ capability: "calendar", operation: "read" });

    expect(createModelProposalBatch([])).toBeNull();
    expect(createModelProposalBatch(Array.from({ length: 9 }, () => proposal))).toBeNull();

    const batch = createModelProposalBatch([proposal]);
    expect(batch && "authority" in batch).toBe(false);
    expect(batch?.proposals.some(item => "authority" in item)).toBe(false);
  });
});
