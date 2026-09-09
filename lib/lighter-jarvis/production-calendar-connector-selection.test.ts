import { describe, expect, it } from "vitest";
import { createProductionCalendarConnector } from "./production-calendar-read";

describe("production governed Calendar connector selection", () => {
  it("remains Google-backed when no OAuth session exists", () => {
    expect(createProductionCalendarConnector().source).toBe("google");
  });
});
