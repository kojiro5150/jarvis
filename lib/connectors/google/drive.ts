import type { DriveConnector } from "../drive";
import type { ConnectorSource, DriveFileRecord } from "../types";
import { relativeTime } from "../email-message";
import { getValidGoogleAccessToken } from "./access-token";
import { GoogleServiceAuthError } from "./auth-error";

/** Re-exported under this name to match the calendar/gmail connectors' naming convention. */
export { GoogleServiceAuthError as GoogleDriveAuthError };

const DRIVE_FILES_LIST_URL = "https://www.googleapis.com/drive/v3/files";

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
}

interface GoogleDriveListResponse {
  files?: GoogleDriveFile[];
}

/**
 * DriveFileRecord's `project` field predates a real backend — it was
 * written for the local memory store's hand-authored records, which
 * name an actual project ("Governance Reasoning Framework", etc.). A
 * real Drive file doesn't carry that concept, and getting a file's
 * parent-folder NAME from the Drive API costs a second request per file
 * (folder IDs aren't resolved to names in the same call) — not worth it
 * just to label "recently touched," so this maps the file's mimeType to
 * a short, honest type label instead ("Google Doc", "Spreadsheet",
 * "PDF", etc.). It's real data about the file, just not a project name —
 * flagged here rather than silently repurposing the field to mean
 * something it wasn't designed for.
 */
const MIME_TYPE_LABELS: Record<string, string> = {
  "application/vnd.google-apps.document": "Google Doc",
  "application/vnd.google-apps.spreadsheet": "Google Sheet",
  "application/vnd.google-apps.presentation": "Google Slides",
  "application/vnd.google-apps.folder": "Folder",
  "application/vnd.google-apps.form": "Google Form",
  "application/pdf": "PDF",
  "image/png": "Image",
  "image/jpeg": "Image",
};

function labelForMimeType(mimeType: string): string {
  return MIME_TYPE_LABELS[mimeType] ?? "File";
}

/**
 * Real Google Drive connector — implements the same DriveConnector
 * interface the local connector does, so nothing above this layer needs
 * to change. Metadata only (drive.metadata.readonly — see oauth.ts):
 * name, type, and last-modified time, never file contents. Excludes
 * trashed files; ordered most-recently-modified first, matching what
 * "recent activity" means for the other two connectors.
 */
export class GoogleDriveConnector implements DriveConnector {
  readonly source: ConnectorSource = "google";

  async listRecentActivity(limit = 5): Promise<DriveFileRecord[]> {
    const accessToken = await getValidGoogleAccessToken();

    const params = new URLSearchParams({
      pageSize: String(limit),
      orderBy: "modifiedTime desc",
      q: "trashed = false",
      fields: "files(id,name,mimeType,modifiedTime)",
    });

    const res = await fetch(`${DRIVE_FILES_LIST_URL}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new GoogleServiceAuthError("refresh_failed", "Drive API rejected the access token (files.list).");
      }
      if (res.status === 403) {
        // Same "token predates this scope" case gmail.ts handles — see
        // oauth.ts's v43 honesty note. Not a bad/expired token, just a
        // missing grant.
        throw new GoogleServiceAuthError(
          "not_connected",
          "Drive scope not granted yet — reconnect to include Drive access."
        );
      }
      throw new Error(`Drive files.list failed: ${res.status}`);
    }

    const json = (await res.json()) as GoogleDriveListResponse;
    return (json.files ?? []).map((f) => ({
      name: f.name,
      project: labelForMimeType(f.mimeType),
      modified: relativeTime(f.modifiedTime),
    }));
  }
}
