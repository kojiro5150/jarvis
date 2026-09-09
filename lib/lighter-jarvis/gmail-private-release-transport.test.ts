import { describe, expect, it } from "vitest";

import { OMITTED_GMAIL_PRIVATE_RELEASE } from "./gmail-private-release-contract";
import { projectGmailPrivateReleasesForTransport } from "./gmail-private-release-transport";

describe("Gmail private release transport boundary", () => {
  it("omits an oversized governed presentation from transport without changing visible history", () => {
    const privateBody = `Subject: LinkedIn invitation\nPlain text body: ${"private ".repeat(1_800)}`;
    const visible = [
      { role: "user" as const, content: "yes" },
      { role: "assistant" as const, content: privateBody },
      { role: "user" as const, content: "Thanks" },
    ];
    const projected = projectGmailPrivateReleasesForTransport(visible, true);
    expect(projected[1]?.content).toBe(OMITTED_GMAIL_PRIVATE_RELEASE);
    expect(JSON.stringify(projected)).not.toContain("private private");
    expect(visible[1]?.content).toBe(privateBody);
  });

  it("does not trust content shape without a server-owned reference", () => {
    const fabricated = [{ role: "assistant" as const,
      content: `Plain text body: ${"fabricated ".repeat(1_000)}` }];
    expect(projectGmailPrivateReleasesForTransport(fabricated, false)).toEqual(fabricated);
  });

  it("leaves short governed releases and oversized ordinary messages unchanged", () => {
    const messages = [
      { role: "assistant" as const, content: "Subject: short" },
      { role: "user" as const, content: "x".repeat(8_100) },
    ];
    expect(projectGmailPrivateReleasesForTransport(messages, true)).toEqual(messages);
  });
});
