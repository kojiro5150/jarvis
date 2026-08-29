import { describe, expect, it } from "vitest";
import {
  parseGmailFromHeader,
  parseNaturalLanguageGmailSenderReference,
  resolveGmailSenderIdentity,
} from "./gmail-sender-identity";

describe("GS002A deterministic Gmail sender identity", () => {
  it.each([
    ["Find the email from Georgia", ["georgia"]],
    ["find messages from McDonald Georgia", ["mcdonald", "georgia"]],
    ["Please show me the mail from georgia.mcdonald@example.com", ["georgia", "mcdonald", "example", "com"]],
  ] as const)("parses a bounded sender reference: %s", (utterance, terms) => {
    expect(parseNaturalLanguageGmailSenderReference(utterance)).toEqual(terms);
  });

  it.each([
    "Find the email about Georgia",
    "Read the email from Georgia",
    "Find something from Georgia",
    "Who is Georgia?",
  ])("rejects wording outside the sender-search surface: %s", utterance => {
    expect(parseNaturalLanguageGmailSenderReference(utterance)).toBeNull();
  });

  it("reuses strict order-independent all-token containment without fuzzy matching", () => {
    const evidence = [
      { displayName: "Georgia McDonald", address: "georgia.mcdonald@example.com" },
    ] as const;

    expect(resolveGmailSenderIdentity(["georgia"], evidence)).toEqual({
      status: "matched",
      identity: evidence[0],
    });
    expect(resolveGmailSenderIdentity(["mcdonald", "georgia"], evidence)).toEqual({
      status: "matched",
      identity: evidence[0],
    });
    expect(resolveGmailSenderIdentity(["georg"], evidence)).toEqual({ status: "not_found" });
    expect(resolveGmailSenderIdentity(["georgiaa"], evidence)).toEqual({ status: "not_found" });
  });

  it("surfaces ambiguity between real distinct sender addresses", () => {
    const evidence = [
      { displayName: "Georgia McDonald", address: "georgia@example.com" },
      { displayName: "Georgia McDonald-Reyes", address: "georgia.reyes@example.com" },
    ] as const;
    expect(resolveGmailSenderIdentity(["georgia"], evidence)).toEqual({
      status: "ambiguous",
      identities: evidence,
    });
  });

  it("deduplicates repeated messages from the same real address", () => {
    const evidence = [
      { displayName: "Georgia McDonald", address: "georgia@example.com" },
      { displayName: "Georgia McDonald", address: "GEORGIA@example.com" },
    ] as const;
    expect(resolveGmailSenderIdentity(["georgia"], evidence)).toEqual({
      status: "matched",
      identity: evidence[0],
    });
  });

  it.each([
    ['Georgia McDonald <Georgia.McDonald@example.com>', { displayName: "Georgia McDonald", address: "georgia.mcdonald@example.com" }],
    ['"Georgia McDonald" <georgia@example.com>', { displayName: "Georgia McDonald", address: "georgia@example.com" }],
    ["georgia@example.com", { displayName: null, address: "georgia@example.com" }],
  ] as const)("parses real From metadata: %s", (header, expected) => {
    expect(parseGmailFromHeader(header)).toEqual(expected);
  });
});
