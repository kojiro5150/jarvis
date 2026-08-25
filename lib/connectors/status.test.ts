import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./google/tokens", () => ({ readGoogleTokens: vi.fn() }));

import { readGoogleTokens } from "./google/tokens";
import { buildConnectorStatusSnapshot } from "./status";

const readTokens = vi.mocked(readGoogleTokens);
const scopes = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/drive.metadata.readonly",
].join(" ");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("status-only connector snapshot", () => {
  it("reports unavailable from provider and token metadata without a grant", async () => {
    readTokens.mockResolvedValue(null);

    await expect(buildConnectorStatusSnapshot()).resolves.toEqual({
      calendarStatus: "unavailable",
      gmailStatus: "unavailable",
      driveStatus: "unavailable",
    });
  });

  it("reports scoped, renewable Google connectors online", async () => {
    vi.stubEnv("GOOGLE_CLIENT_ID", "configured");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "configured");
    vi.stubEnv("GOOGLE_REDIRECT_URI", "configured");
    readTokens.mockResolvedValue({
      access_token: "stored",
      refresh_token: "stored",
      expiry_date: 0,
      scope: scopes,
      token_type: "Bearer",
    });

    await expect(buildConnectorStatusSnapshot()).resolves.toEqual({
      calendarStatus: "online",
      gmailStatus: "online",
      driveStatus: "online",
    });
  });

  it("uses scope and explicit provider metadata independently per service", async () => {
    vi.stubEnv("CALENDAR_CONNECTOR", "local");
    readTokens.mockResolvedValue({
      access_token: "stored",
      expiry_date: Date.now() + 60_000,
      scope: "https://www.googleapis.com/auth/gmail.readonly",
      token_type: "Bearer",
    });

    await expect(buildConnectorStatusSnapshot()).resolves.toEqual({
      calendarStatus: "unavailable",
      gmailStatus: "online",
      driveStatus: "refresh_required",
    });
  });
});
