import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./memory/store", () => ({
  readMemory: vi.fn(async () => ({
    priorities: [], projects: [], signals: [], calendar: [], gmailThreads: [], driveFiles: [],
    updatedAt: "1970-01-01T00:00:00.000Z",
  })),
}));

vi.mock("./connectors", () => ({
  getCalendarConnector: () => ({ source: "local", listUpcoming: async () => [] }),
  getGmailConnector: () => ({ source: "local", listRecent: async () => [] }),
  getDriveConnector: () => ({ source: "local", listRecentActivity: async () => [] }),
  getConnectorStatuses: () => [],
}));

vi.mock("./connectors/google/tokens", () => ({ hasStoredGoogleTokens: () => false }));
vi.mock("./connectors/calendar", () => ({ LocalCalendarConnector: class {} }));
vi.mock("./connectors/gmail", () => ({ LocalGmailConnector: class {} }));
vi.mock("./connectors/drive", () => ({ LocalDriveConnector: class {} }));
vi.mock("./connectors/google/auth-error", () => ({ GoogleServiceAuthError: class extends Error {} }));

import { buildOperationalState } from "./operational-state";

describe("legacy operational-picture construction time", () => {
  beforeEach(() => vi.useRealTimers());

  it("uses the picture construction timestamp rather than the memory timestamp", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-30T12:34:56.789Z"));

    const state = await buildOperationalState();

    expect(state.updatedAt).toBe("2026-07-30T12:34:56.789Z");
    expect(state.updatedAt).not.toBe("1970-01-01T00:00:00.000Z");
  });
});
