import { describe, expect, it } from "vitest";
import { resolveDriveOrdinalReadProposal } from "./drive-ordinal-read";
import {
  advanceGovernedReferentialScopeUserTurn,
  createGovernedReferentialScopeReference,
  createGovernedResultSetReference,
} from "./governed-result-set-reference";
import { resolvePendingAuthorization } from "./pending-authorization";

describe("Drive ordinal read proposal", () => {
  it("identifies the exact stored Drive result and creates separate pending read authority", () => {
    const scope = createGovernedReferentialScopeReference();
    const result = createGovernedResultSetReference({
      scopeReference: scope,
      referentialClass: "drive.search_results",
      orderedResourceIds: ["file-1", "file-2"],
      originatingOperation: "drive.search Atlas",
    })!;
    advanceGovernedReferentialScopeUserTurn(scope);

    const proposal = resolveDriveOrdinalReadProposal({
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

    expect(resolvePendingAuthorization({
      currentUserUtterance: "yes",
      pendingAuthorizationReference: proposal.pendingAuthorizationReference,
      expectedCapability: "drive.read",
    })).toMatchObject({
      decision: "ALLOW",
      proposedOperation: { capability: "drive.read", fileId: "file-1", contentMode: "text" },
    });
  });

  it("fails closed for out-of-range and fabricated references", () => {
    const scope = createGovernedReferentialScopeReference();
    const result = createGovernedResultSetReference({
      scopeReference: scope,
      referentialClass: "drive.search_results",
      orderedResourceIds: ["file-1"],
      originatingOperation: "drive.search Atlas",
    })!;
    advanceGovernedReferentialScopeUserTurn(scope);

    expect(resolveDriveOrdinalReadProposal({
      currentUserUtterance: "Read the fifth one.",
      governedReferentialScopeReference: scope,
      governedResultSetReference: result,
    })).toMatchObject({ handled: true, pendingAuthorizationReference: undefined });

    expect(resolveDriveOrdinalReadProposal({
      currentUserUtterance: "Read the first one.",
      governedReferentialScopeReference: scope,
      governedResultSetReference: { governedResultSetReferenceId: "fabricated" },
    })).toMatchObject({ handled: true, governedResultSetReference: null });
  });
});