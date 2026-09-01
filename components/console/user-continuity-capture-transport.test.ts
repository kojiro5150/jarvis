import { describe, expect, it } from "vitest";

describe("explicit continuity capture clarification transport", () => {
  it("round-trips only the opaque one-shot clarification reference through the sole console", async () => {
    const source = await import("node:fs").then(({ readFileSync }) =>
      readFileSync("components/console/UnifiedOpsConsole.tsx", "utf8"));

    expect(source).toContain(
      "type OpaqueUserContinuityCaptureClarification = Readonly<{ userContinuityCaptureClarificationReferenceId: string }>",
    );
    expect(source).toContain(
      "const userContinuityCaptureClarificationRef = useRef<OpaqueUserContinuityCaptureClarification | null>(null)",
    );
    expect(source).toContain(
      "userContinuityCaptureClarificationRef.current = null",
    );
    expect(source).toContain(
      "userContinuityCaptureClarificationReference: captureClarificationReference",
    );
    expect(source).toContain(
      "data.userContinuityCaptureClarificationReference",
    );

    const transportSlice = source.slice(
      source.indexOf("async function submitMessage"),
      source.indexOf("async function send"),
    );
    expect(transportSlice).not.toContain("statement:");
    expect(transportSlice).not.toContain("semanticClass:");
  });
});
