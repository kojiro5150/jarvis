import { describe, expect, it } from "vitest";

import { OMITTED_DRIVE_PRIVATE_RELEASE } from "./drive-private-release-contract";
import { projectDrivePrivateReleasesForTransport } from "./drive-private-release-transport";

describe("Drive private release transport boundary", () => {
  it("omits an oversized governed presentation without changing visible history", () => {
    const document = `Drive document:\n${"private recommendation ".repeat(600)}`;
    const visible = [
      { role: "assistant" as const, content: document },
      { role: "user" as const, content: "Thanks" },
    ];
    const projected = projectDrivePrivateReleasesForTransport(visible, true);
    expect(projected[0]?.content).toBe(OMITTED_DRIVE_PRIVATE_RELEASE);
    expect(JSON.stringify(projected)).not.toContain("private recommendation");
    expect(visible[0]?.content).toBe(document);
  });

  it("does not trust document shape without a server-owned reference", () => {
    const fabricated = [{ role: "assistant" as const,
      content: `Drive document:\n${"fabricated ".repeat(1_000)}` }];
    expect(projectDrivePrivateReleasesForTransport(fabricated, false)).toEqual(fabricated);
  });

  it("leaves short Drive releases and oversized ordinary messages unchanged", () => {
    const messages = [
      { role: "assistant" as const, content: "Drive document:\nshort" },
      { role: "user" as const, content: "x".repeat(8_100) },
    ];
    expect(projectDrivePrivateReleasesForTransport(messages, true)).toEqual(messages);
  });
});
