import { describe, expect, it, vi } from "vitest";
import { governedLegacyConflictFixture } from "./fixtures";
import { constructGovernedConversationalInput, type EosReferenceVerifier, type GovernedInputConstruction } from "./input";

const base = (): GovernedInputConstruction => ({
  inputId: "input:truthful", threadId: "thread:1", requestId: "request:1", exchangeId: "exchange:1", projectionId: "projection:1", projectionLineage: { threadId: "thread:1", requestId: "request:1", exchangeId: "exchange:1", projectionId: "projection:1" },
  referenceTime: "2025-01-15T12:00:00.000Z", question: { text: "Question" }, claims: [], sources: [],
});
const verifier = (valid = true): EosReferenceVerifier => ({ verifyRun: vi.fn(() => valid), verifySession: vi.fn(() => valid), verifyInterfaceContract: vi.fn(() => valid), verifyCoherence: vi.fn(() => valid) });

describe("governed conversational input identity", () => {
  it("constructs conversational-only input without EOS context", () => { const input = constructGovernedConversationalInput(base()); expect(input).toMatchObject({ threadId: "thread:1", requestId: "request:1", exchangeId: "exchange:1" }); expect(input.runId).toBeUndefined(); expect(input.sessionId).toBeUndefined(); expect(input.interfaceContractId).toBeUndefined(); });
  it.each(["threadId", "requestId", "exchangeId"] as const)("requires %s", (field) => { expect(() => constructGovernedConversationalInput({ ...base(), [field]: "" })).toThrow("mandatory conversational lineage"); });
  it("rejects mismatched projection lineage", () => { expect(() => constructGovernedConversationalInput({ ...base(), exchangeId: "exchange:other" })).toThrow("projection lineage mismatch"); });
  it.each([["runId", "run:real", "verifyRun"], ["sessionId", "session:real", "verifySession"], ["interfaceContractId", "contract:real", "verifyInterfaceContract"]] as const)("accepts a verified %s unchanged", (field, id, method) => { const eos = verifier(); const input = constructGovernedConversationalInput({ ...base(), [field]: id, eosReferenceVerifier: eos }); expect(input[field]).toBe(id); expect(eos[method]).toHaveBeenCalledWith(id); expect("eosReferenceVerifier" in input).toBe(false); });
  it.each([["runId", "run:fake", "verifyRun"], ["sessionId", "session:fake", "verifySession"], ["interfaceContractId", "contract:fake", "verifyInterfaceContract"]] as const)("rejects an unverifiable %s", (field, id, method) => { const eos = verifier(); vi.mocked(eos[method]).mockReturnValue(false); expect(() => constructGovernedConversationalInput({ ...base(), [field]: id, eosReferenceVerifier: eos })).toThrow("not a genuine EOS"); });
  it("verifies mixed references independently and rejects incoherent lineage", () => { const eos = verifier(); vi.mocked(eos.verifyCoherence).mockReturnValue(false); expect(() => constructGovernedConversationalInput({ ...base(), runId: "run:real", sessionId: "session:real", interfaceContractId: "contract:real", eosReferenceVerifier: eos })).toThrow("not coherent"); expect(eos.verifyRun).toHaveBeenCalledOnce(); expect(eos.verifySession).toHaveBeenCalledOnce(); expect(eos.verifyInterfaceContract).toHaveBeenCalledOnce(); });
  it("fails closed when EOS context has no verifier", () => { expect(() => constructGovernedConversationalInput({ ...base(), runId: "run:unverified" })).toThrow("requires a verifier"); });
  it("separates non-authoritative compatibility and non-canonical history", () => { const input = governedLegacyConflictFixture.input; expect(input.claims[0].status).toBe("insufficient_coverage"); expect(input.compatibilityContext[0].authority).toBe("none"); expect(input.conversationHistory.every(turn => !turn.canonicalEvidence)).toBe(true); });
});
