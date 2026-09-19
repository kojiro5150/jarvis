import { describe, expect, it } from "vitest";
import { resolveDriveOrdinalReadProposal } from "./drive-ordinal-read";
import {
  advanceGovernedReferentialScopeUserTurn,
  createGovernedReferentialScopeReference,
  createGovernedResultSetReference,
} from "./governed-result-set-reference";
import { resolveDurablePendingAuthorization } from "./durable-pending-authorization";

describe("Drive ordinal read proposal", () => {
  it("identifies the exact stored Drive result and creates separate pending read authority", async () => {
    const scope = createGovernedReferentialScopeReference();
    const result = createGovernedResultSetReference({
      scopeReference: scope,
      referentialClass: "drive.search_results",
      orderedResourceIds: ["file-1", "file-2"],
      originatingOperation: "drive.search Atlas",
    })!;
    advanceGovernedReferentialScopeUserTurn(scope);

    const proposal = await resolveDriveOrdinalReadProposal({
      currentUserUtterance: "Read the first one.",
      governedReferentialScopeReference: scope,
      governedResultSetReference: result,
    });

    expect(proposal).toMatchObject({
      handled: true,
      pendingAuthorizationReference: { pendingAuthorizationId: expect.any(String) },
      governedReferentialScopeReference: scope,
      governedResultSetReference: result,
    });
    expect(JSON.stringify(proposal)).not.toContain("file-1");

    expect(await resolveDurablePendingAuthorization({
      currentUserUtterance: "yes",
      pendingAuthorizationReference: proposal.pendingAuthorizationReference,
      expectedCapability: "drive.read",
    })).toMatchObject({
      decision: "ALLOW",
      proposedOperation: { capability: "drive.read", fileId: "file-1", contentMode: "text" },
    });
  });

  it.each(["Read the sixth one.", "read the seventh one", "Open the 6th one.", "Show me the 7th file."])(
    "never collapses an overflow ordinal to the trailing word one: %s",
    async utterance => {
      const scope = createGovernedReferentialScopeReference();
      const result = createGovernedResultSetReference({
        scopeReference: scope,
        referentialClass: "drive.search_results",
        orderedResourceIds: ["file-1", "file-2", "file-3", "file-4", "file-5"],
        originatingOperation: "drive.search Atlas",
      })!;
      advanceGovernedReferentialScopeUserTurn(scope);

      const resolved = await resolveDriveOrdinalReadProposal({
        currentUserUtterance: utterance,
        governedReferentialScopeReference: scope,
        governedResultSetReference: result,
      });

      expect(resolved).toMatchObject({
        handled: true,
        reply: "That position is outside the bounded recent Drive result.",
      });
      expect(resolved).not.toHaveProperty("pendingAuthorizationReference");
      expect(JSON.stringify(resolved)).not.toContain("file-1");
    },
  );

  it("fails closed for out-of-range and fabricated references", async () => {
    const scope = createGovernedReferentialScopeReference();
    const result = createGovernedResultSetReference({
      scopeReference: scope,
      referentialClass: "drive.search_results",
      orderedResourceIds: ["file-1"],
      originatingOperation: "drive.search Atlas",
    })!;
    advanceGovernedReferentialScopeUserTurn(scope);

    const outOfRange = await resolveDriveOrdinalReadProposal({
      currentUserUtterance: "Read the fifth one.",
      governedReferentialScopeReference: scope,
      governedResultSetReference: result,
    });
    expect(outOfRange).toMatchObject({ handled: true });
    expect(outOfRange).not.toHaveProperty("pendingAuthorizationReference");

    expect(await resolveDriveOrdinalReadProposal({
      currentUserUtterance: "Read the first one.",
      governedReferentialScopeReference: scope,
      governedResultSetReference: { governedResultSetReferenceId: "fabricated" },
    })).toMatchObject({ handled: true, governedResultSetReference: null });
  });
});