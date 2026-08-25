import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/connectors/status", () => ({
  buildConnectorStatusSnapshot: vi.fn(async () => ({
    calendarStatus: "online",
    gmailStatus: "unavailable",
    driveStatus: "refresh_required",
  })),
}));

import { buildConnectorStatusSnapshot } from "@/lib/connectors/status";
import { GET } from "./route";

describe("GET /api/connector-status", () => {
  it("returns only the status-only snapshot", async () => {
    const response = await GET();

    expect(buildConnectorStatusSnapshot).toHaveBeenCalledOnce();
    expect(await response.json()).toEqual({
      calendarStatus: "online",
      gmailStatus: "unavailable",
      driveStatus: "refresh_required",
    });
  });
});
