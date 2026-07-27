import { describe,expect,it } from "vitest";
import { productionProposalPolicies } from ".";
describe("Calendar-to-Proposal architectural boundary",()=>{it("keeps proposal policies deterministic, inert, and independent of Calendar prose",()=>{const snapshot=JSON.stringify(productionProposalPolicies.map(x=>x.metadata));expect(JSON.stringify(productionProposalPolicies.map(x=>x.metadata))).toBe(snapshot);expect(snapshot).not.toContain("calendarDescription");expect(snapshot).not.toContain("executionInstruction");expect(snapshot).not.toContain("approvalDecision")})});
