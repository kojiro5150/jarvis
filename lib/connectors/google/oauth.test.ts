import { afterEach, describe, expect, it } from "vitest";
import { buildAuthUrl } from "./oauth";

describe("Google OAuth requested scope boundary", () => {
  afterEach(() => { delete process.env.GOOGLE_CLIENT_ID; delete process.env.GOOGLE_CLIENT_SECRET; delete process.env.GOOGLE_REDIRECT_URI; });
  it("requests exactly the three intended read-only scopes", () => {
    process.env.GOOGLE_CLIENT_ID = "client"; process.env.GOOGLE_CLIENT_SECRET = "secret";
    process.env.GOOGLE_REDIRECT_URI = "http://localhost/callback";
    const scopes = new URL(buildAuthUrl("state")).searchParams.get("scope")!.split(" ");
    expect(scopes).toEqual([
      "https://www.googleapis.com/auth/calendar.readonly",
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/drive.readonly",
    ]);
    expect(scopes).not.toContain("https://www.googleapis.com/auth/drive.metadata.readonly");
    expect(scopes.filter(scope => scope.includes("/auth/drive"))).toEqual(["https://www.googleapis.com/auth/drive.readonly"]);
  });
});
