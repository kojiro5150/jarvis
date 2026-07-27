import { describe,expect,it } from "vitest";
import { productionReasoningPolicies } from ".";
describe("Calendar integration boundary",()=>{it("keeps production reasoning independent of narrative and side effects",()=>{expect(productionReasoningPolicies).toHaveLength(8);for(const policy of productionReasoningPolicies){expect(policy.metadata.origin).toBe("sprint-3.22");expect(policy).not.toHaveProperty("execute");expect(policy).not.toHaveProperty("recommend")}})});
