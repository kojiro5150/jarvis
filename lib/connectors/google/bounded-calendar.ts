import type { CalendarEvent } from "../calendar-event";
import { normalizeGoogleEvent } from "../calendar-event";
import { getValidGoogleAccessToken } from "./access-token";
import { GoogleServiceAuthError } from "./auth-error";

export type GoogleAuthenticationDiagnosticCode =
  | "MISSING_OAUTH_SESSION"
  | "MISSING_REFRESH_TOKEN"
  | "UNAVAILABLE_OAUTH_CREDENTIALS"
  | "EXPIRED_OR_REJECTED_TOKEN"
  | "AUTHENTICATION_UNAVAILABLE";

/**
 * Maps failures from the production Google authentication boundary to a
 * bounded, credential-free deployment diagnostic.
 *
 * Error text is inspected only to select a fixed diagnostic code. Provider
 * messages, tokens, and credential material are never logged.
 */
export function describeGoogleAuthenticationFailure(
  error: unknown,
): GoogleAuthenticationDiagnosticCode {
  if (!(error instanceof GoogleServiceAuthError)) {
    return "AUTHENTICATION_UNAVAILABLE";
  }

  if (error.reason === "not_connected") {
    return "MISSING_OAUTH_SESSION";
  }

  if (error.message.includes("No refresh token")) {
    return "MISSING_REFRESH_TOKEN";
  }

  if (error.message.includes("OAuth is not configured")) {
    return "UNAVAILABLE_OAUTH_CREDENTIALS";
  }

  return "EXPIRED_OR_REJECTED_TOKEN";
}

/**
 * Deployment-only, read-only Google Calendar API surface with explicit time
 * and result bounds.
 */
export class BoundedGoogleCalendarConnector {
  async verifySession(): Promise<void> {
    try {
      // Reuse the same token store, refresh path, and OAuth configuration used
      // by the production GoogleCalendarConnector.
      await getValidGoogleAccessToken();
    } catch (error) {
      const code = describeGoogleAuthenticationFailure(error);

      // Emit only the fixed diagnostic code. Do not expose the original error
      // message, provider response, token, or credential material.
      console.error(`[operational-validation/auth] ${code}`);

      // Preserve fail-closed behaviour and the original typed failure.
      throw error;
    }
  }

  async listBetween(
    start: string,
    end: string,
    limit: number,
  ): Promise<readonly CalendarEvent[]> {
    const startTimestamp = Date.parse(start);
    const endTimestamp = Date.parse(end);

    if (
      !Number.isFinite(startTimestamp) ||
      !Number.isFinite(endTimestamp) ||
      startTimestamp >= endTimestamp ||
      limit < 1 ||
      limit > 100
    ) {
      throw new Error("invalid bounded calendar window");
    }

    const token = await getValidGoogleAccessToken();

    const calendarsResponse = await fetch(
      "https://www.googleapis.com/calendar/v3/users/me/calendarList",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!calendarsResponse.ok) {
      if (calendarsResponse.status === 401) {
        throw new GoogleServiceAuthError(
          "refresh_failed",
          "Calendar authentication failed.",
        );
      }

      throw new Error(
        `bounded Calendar list request failed: ${calendarsResponse.status}`,
      );
    }

    const calendarsData = (await calendarsResponse.json()) as {
      items?: Array<{
        id: string;
        summary?: string;
        backgroundColor?: string;
        hidden?: boolean;
        deleted?: boolean;
      }>;
    };

    const visibleCalendars =
      calendarsData.items?.filter(
        (calendar) => !calendar.hidden && !calendar.deleted,
      ) ?? [];

    const targets =
      visibleCalendars.length > 0
        ? visibleCalendars
        : [
            {
              id: "primary",
              summary: "Google Calendar",
            },
          ];

    const batches = await Promise.all(
      targets.map(async (calendar) => {
        const query = new URLSearchParams({
          timeMin: start,
          timeMax: end,
          singleEvents: "true",
          orderBy: "startTime",
          maxResults: String(limit),
        });

        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
            calendar.id,
          )}/events?${query.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new GoogleServiceAuthError(
              "refresh_failed",
              "Calendar authentication failed.",
            );
          }

          throw new Error(
            `bounded Calendar request failed: ${response.status}`,
          );
        }

        const data = (await response.json()) as {
          items?: Array<Parameters<typeof normalizeGoogleEvent>[0]>;
        };

        return (data.items ?? []).map((event, index) =>
          normalizeGoogleEvent(event, index, {
            calendarId: calendar.id,
            calendarName: calendar.summary ?? "Google Calendar",
            calendarColor: calendar.backgroundColor,
          }),
        );
      }),
    );

    return batches
      .flat()
      .sort((left, right) => left.start.localeCompare(right.start))
      .slice(0, limit);
  }
}