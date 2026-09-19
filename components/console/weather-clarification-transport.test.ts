import { describe, expect, it } from "vitest";

describe("weather clarification transport", () => {
  it("round-trips only the opaque capability-owned weather reference through the sole console", async () => {
    const source = await import("node:fs").then(({ readFileSync }) =>
      readFileSync("components/console/UnifiedOpsConsole.tsx", "utf8"));

    expect(source).toContain(
      "type OpaqueWeatherClarification = Readonly<{ weatherClarificationReferenceId: string }>",
    );
    expect(source).toContain(
      "const weatherClarificationRef = useRef<OpaqueWeatherClarification | null>(null)",
    );
    expect(source).toContain(
      "const weatherClarificationReference = specialist.id === \"jarvis\"",
    );
    expect(source).toContain("weatherClarificationRef.current = null");
    expect(source).toContain("? { weatherClarificationReference }");
    expect(source).toContain(
      "weatherClarificationReference?: OpaqueWeatherClarification | null",
    );
    expect(source).toContain(
      "weatherClarificationRef.current = data.weatherClarificationReference",
    );

    const transportSlice = source.slice(
      source.indexOf("async function submitMessage"),
      source.indexOf("async function send"),
    );
    expect(transportSlice).not.toContain("ownerCapability");
    expect(transportSlice).not.toContain("conversationContinuationReference");
  });
});
