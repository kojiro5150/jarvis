/**
 * Shared by every Google-backed connector (Calendar, Gmail, and any
 * future one). Distinguishes "never connected" / "scope not granted yet"
 * from "was connected, needs reconnecting" without ever surfacing
 * Google's own error text — callers (buildOperationalState) map this to
 * the three permitted UI phrases per service: "X intelligence online" /
 * "unavailable" / "refresh required".
 */
export class GoogleServiceAuthError extends Error {
  reason: "not_connected" | "refresh_failed";
  constructor(reason: "not_connected" | "refresh_failed", message: string) {
    super(message);
    this.name = "GoogleServiceAuthError";
    this.reason = reason;
  }
}
