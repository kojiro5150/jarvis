import { describe, expect, it, vi } from "vitest";
import { GoogleServiceAuthError } from "../auth-error";
import { BoundedGoogleCalendarConnector, describeGoogleAuthenticationFailure } from "../bounded-calendar";

vi.mock("../access-token", () => ({ getValidGoogleAccessToken: vi.fn() }));
import { getValidGoogleAccessToken } from "../access-token";
const mockedAccessToken = vi.mocked(getValidGoogleAccessToken);

describe("bounded Calendar authentication boundary", () => {
  it("reports fixed, credential-free prerequisite codes", () => {
    expect(describeGoogleAuthenticationFailure(new GoogleServiceAuthError("not_connected", "No Google tokens stored."))).toBe("MISSING_OAUTH_SESSION");
    expect(describeGoogleAuthenticationFailure(new GoogleServiceAuthError("refresh_failed", "No refresh token available."))).toBe("MISSING_REFRESH_TOKEN");
    expect(describeGoogleAuthenticationFailure(new GoogleServiceAuthError("refresh_failed", "Token refresh failed: Google OAuth is not configured — secret material omitted."))).toBe("UNAVAILABLE_OAUTH_CREDENTIALS");
    expect(describeGoogleAuthenticationFailure(new GoogleServiceAuthError("refresh_failed", "Calendar API rejected the access token."))).toBe("EXPIRED_OR_REJECTED_TOKEN");
    expect(describeGoogleAuthenticationFailure(new Error("unexpected"))).toBe("AUTHENTICATION_UNAVAILABLE");
  });

  it("uses the shared production access-token boundary and rethrows after logging", async () => {
    mockedAccessToken.mockRejectedValueOnce(new GoogleServiceAuthError("refresh_failed", "No refresh token available."));
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    await expect(new BoundedGoogleCalendarConnector().verifySession()).rejects.toThrow("No refresh token");
    expect(mockedAccessToken).toHaveBeenCalledOnce();
    expect(error).toHaveBeenCalledWith("[operational-validation/auth] MISSING_REFRESH_TOKEN");
    expect(error.mock.calls.flat().join(" ")).not.toContain("No refresh token available.");
    error.mockRestore();
  });
});
