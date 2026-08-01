import type { BoundaryEngineInput } from "./claim-boundary-types";
export const CLAIM_BOUNDARY_FIXTURE_MARKER = "SYNTHETIC_CLAIM_BOUNDARY_FIXTURE_NOT_OPERATIONAL_EVIDENCE" as const;
export const CLAIM_BOUNDARY_TIME = "2026-08-01T12:00:00.000Z";
export const cassieBoundaryInput: BoundaryEngineInput = Object.freeze({ text: "What's Cassie's email? Anything important?", threadId: "thread:boundary", requestId: "request:cassie-boundary", exchangeId: "exchange:cassie-boundary", referenceTime: CLAIM_BOUNDARY_TIME, createdAt: CLAIM_BOUNDARY_TIME, entities: [{ entityId: "person:cassie", personName: "Cassie", displayLabel: "Cassie" }] });
export const inputFor = (text: string, overrides: Partial<BoundaryEngineInput> = {}): BoundaryEngineInput => ({ ...cassieBoundaryInput, text, requestId: `request:${text}`, exchangeId: `exchange:${text}`, ...overrides });
