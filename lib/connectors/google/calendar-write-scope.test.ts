import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./tokens", () => ({ readGoogleTokens: vi.fn() }));

import { readGoogleTokens } from "./tokens";
import { hasGoogleCalendarWriteScope } from "./calendar-write-scope";

const readTokens = vi.mocked(readGoogleTokens);

afterEach(() => vi.clearAllMocks());

describe("Google Calendar write-scope gate", () => {
  it("fails closed for an existing read-only grant", async () => {
    readTokens.mockResolvedValue({
      access_token: "stored",
      refresh_token: "stored",
      expiry_date: Date.now() + 60_000,
      scope: [
        "https://www.googleapis.com/auth/calendar.readonly",
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/drive.readonly",
      ].join(" "),
      token_type: "Bearer",
    });

    await expect(hasGoogleCalendarWriteScope()).resolves.toBe(false);
  });

  it("admits only a stored grant that actually contains calendar.events", async () => {
    readTokens.mockResolvedValue({
      access_token: "stored",
      refresh_token: "stored",
      expiry_date: Date.now() + 60_000,
      scope: [
        "https://www.googleapis.com/auth/calendar.readonly",
        "https://www.googleapis.com/auth/calendar.events",
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/drive.readonly",
      ].join(" "),
      token_type: "Bearer",
    });

    await expect(hasGoogleCalendarWriteScope()).resolves.toBe(true);
  });
});
