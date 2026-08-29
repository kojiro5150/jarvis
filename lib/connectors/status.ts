import { readGoogleTokens, type GoogleTokens } from "./google/tokens";
import type {
  CalendarIntelligenceStatus,
  DriveIntelligenceStatus,
  GmailIntelligenceStatus,
} from "./types";

type ConnectorName = "calendar" | "gmail" | "drive";
type ConnectorServiceStatus =
  | CalendarIntelligenceStatus
  | GmailIntelligenceStatus
  | DriveIntelligenceStatus;

export interface ConnectorStatusSnapshot {
  calendarStatus: ConnectorServiceStatus;
  gmailStatus: ConnectorServiceStatus;
  driveStatus: ConnectorServiceStatus;
}

interface ConnectorStatusMetadata {
  providers: Record<ConnectorName, string | undefined>;
  googleConfigured: boolean;
  tokens: GoogleTokens | null;
  now: number;
}

const SCOPES: Record<ConnectorName, readonly string[]> = {
  calendar: [
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/calendar.events",
  ],
  gmail: ["https://www.googleapis.com/auth/gmail.readonly"],
  drive: ["https://www.googleapis.com/auth/drive.readonly"],
};

function configuredForGoogle(provider: string | undefined, hasTokens: boolean) {
  if (provider === "local") return false;
  return provider === "google" || hasTokens;
}

function statusFromMetadata(
  name: ConnectorName,
  metadata: ConnectorStatusMetadata,
): ConnectorServiceStatus {
  const { tokens } = metadata;
  if (!configuredForGoogle(metadata.providers[name], tokens !== null) || !tokens) {
    return "unavailable";
  }

  const scopes = new Set(tokens.scope.split(/\s+/).filter(Boolean));
  if (SCOPES[name].some(scope => !scopes.has(scope))) return "refresh_required";

  const accessTokenUsable = Boolean(tokens.access_token) && tokens.expiry_date > metadata.now;
  const canRefresh = Boolean(tokens.refresh_token) && metadata.googleConfigured;
  return accessTokenUsable || canRefresh ? "online" : "refresh_required";
}

/**
 * Derive connector chrome status without acquiring private source content.
 * This boundary reads only connector selection, OAuth configuration and
 * stored-token metadata. It deliberately does not instantiate or call a
 * Calendar, Gmail, Drive or Memory connector.
 */
export async function buildConnectorStatusSnapshot(): Promise<ConnectorStatusSnapshot> {
  const tokens = await readGoogleTokens();
  const metadata: ConnectorStatusMetadata = {
    providers: {
      calendar: process.env.CALENDAR_CONNECTOR,
      gmail: process.env.GMAIL_CONNECTOR,
      drive: process.env.DRIVE_CONNECTOR,
    },
    googleConfigured: Boolean(
      process.env.GOOGLE_CLIENT_ID &&
        process.env.GOOGLE_CLIENT_SECRET &&
        process.env.GOOGLE_REDIRECT_URI,
    ),
    tokens,
    now: Date.now(),
  };

  return {
    calendarStatus: statusFromMetadata("calendar", metadata),
    gmailStatus: statusFromMetadata("gmail", metadata),
    driveStatus: statusFromMetadata("drive", metadata),
  };
}
