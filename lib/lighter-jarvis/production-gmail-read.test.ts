import { describe, expect, it, vi } from "vitest";
import type { ContentRetrievalPolicy } from "../content-retrieval-policy";
import { resolveProductionGmailRead } from "./production-gmail-read";

const policy: ContentRetrievalPolicy = { policyVersion: "test-v1", rules: [{
  id: "email", match: { connectorType: "email" }, processing: "external_processing_permitted",
  admissibleFields: ["subject", "snippet", "plain_text_body", "attachment_filenames", "attachment_mime_metadata"],
}] };

describe("production identified-message Gmail read", () => {
  it("preserves the exact field binding and presents governed content deterministically", async () => {
    const retrieveMessage = vi.fn(async () => ({ subject: "Actual governed subject", snippet: "Private snippet" }));
    const createConnector = vi.fn(() => ({ retrieveMessage }));
    const result = await resolveProductionGmailRead("gmail.read FMfcgzQhWBjNbnqsJbMxtJtvlSHKtFdH [subject]", {
      loadPolicy: vi.fn(async () => policy), createConnector,
    });
    expect(result).toEqual({ handled: true, decision: "ALLOW", reason: "explicit_gmail_read", reply: "Subject: Actual governed subject" });
    expect(retrieveMessage).toHaveBeenCalledWith("FMfcgzQhWBjNbnqsJbMxtJtvlSHKtFdH");
    expect(result.reply).not.toContain("Private snippet");
  });

  it.each([
    "gmail.read", "gmail.read message", "gmail.read message subject", "gmail.read message []",
    "gmail.read message [subject, subject]", "gmail.read message [subject,subject]", "gmail.read message [from]",
  ])("fails malformed syntax without policy or connector construction: %s", async (utterance) => {
    const loadPolicy = vi.fn(async () => policy); const createConnector = vi.fn();
    const result = await resolveProductionGmailRead(utterance, { loadPolicy, createConnector });
    expect(result).toMatchObject({ handled: true, reason: "invalid_gmail_read_syntax" });
    expect(result.reply).toContain("gmail.read <message-id>");
    expect(loadPolicy).not.toHaveBeenCalled(); expect(createConnector).not.toHaveBeenCalled();
  });

  it("evaluates authority and resource policy before retrieval", async () => {
    const calls: string[] = [];
    const denied = { ...policy, rules: [{ ...policy.rules[0], processing: "retrieval_prohibited" as const }] };
    const retrieveMessage = vi.fn();
    const result = await resolveProductionGmailRead("gmail.read message-1 [subject]", {
      loadPolicy: vi.fn(async () => { calls.push("policy"); return denied; }),
      createConnector: vi.fn(() => { calls.push("connector"); return { retrieveMessage }; }),
    });
    expect(calls).toEqual(["policy", "connector"]);
    expect(result).toMatchObject({ handled: true, decision: "ALLOW", reason: "resource_policy_denied" });
    expect(retrieveMessage).not.toHaveBeenCalled();
  });

  it("does not intercept discovery or natural-language Gmail requests", async () => {
    const dependencies = { loadPolicy: vi.fn(), createConnector: vi.fn() };
    await expect(resolveProductionGmailRead("search Gmail for invoices", dependencies)).resolves.toEqual({ handled: false });
    await expect(resolveProductionGmailRead("Read my latest email", dependencies)).resolves.toEqual({ handled: false });
  });
});
