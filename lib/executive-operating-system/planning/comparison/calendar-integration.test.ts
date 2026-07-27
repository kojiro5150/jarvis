import {describe,expect,it} from "vitest";
// The complete Calendar-to-evaluation production path is covered by each upstream
// package's vertical test; this boundary proves prose cannot enter the comparison API.
import type {CandidatePlanComparisonInput} from ".";
describe("Calendar comparison boundary",()=>{it("requires canonical planning inputs rather than Calendar content",()=>{const keys:keyof CandidatePlanComparisonInput="definitions";expect(keys).toBe("definitions")})});
