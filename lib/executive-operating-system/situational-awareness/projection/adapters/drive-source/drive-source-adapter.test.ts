import { describe, expect, it } from "vitest";
import { DriveSourceProjectionAdapter } from "./adapter";

describe("DriveSourceProjectionAdapter", () => {
  it("projects source availability without promoting Drive names or content into executive entities", () => {
    const artifact = new DriveSourceProjectionAdapter({
      identity: { userId: "u", displayName: "User" },
      projectedAt: "2026-09-20T00:00:00Z",
      availability: "available",
      governedEvidenceCount: 3,
    }).project();

    expect(artifact.entities).toEqual({
      identity: { userId: "u", displayName: "User" },
    });
    expect(artifact.provenance).toMatchObject({
      sourceId: "google-drive",
      sourceKind: "drive",
      availability: "available",
    });
    expect(artifact.metadata).toEqual({
      connector: "google-drive",
      governedEvidenceCount: "3",
      semanticProjection: "none",
    });
    expect(JSON.stringify(artifact)).not.toContain("filename");
    expect(JSON.stringify(artifact)).not.toContain("priority");
  });

  it("rejects invalid governed evidence counts", () => {
    expect(() => new DriveSourceProjectionAdapter({
      identity: { userId: "u", displayName: "User" },
      projectedAt: "2026-09-20T00:00:00Z",
      availability: "available",
      governedEvidenceCount: -1,
    })).toThrow(/non-negative integer/);
  });
});
