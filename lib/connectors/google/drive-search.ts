import { getValidGoogleAccessToken } from "./access-token";
import { GoogleServiceAuthError } from "./auth-error";

const URL = "https://www.googleapis.com/drive/v3/files";

export type DriveSearchMetadata = Readonly<{
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
}>;

export interface DriveSearchConnector {
  search(name: string, maxResults: 5): Promise<readonly DriveSearchMetadata[]>;
}

/** Escape a Drive query string literal, rather than allowing command input to alter q. */
export function escapeDriveQueryLiteral(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll("'", "\\'");
}

/** Metadata-only Drive discovery. It never exports, downloads, or gets a file. */
export class GoogleDriveSearchConnector implements DriveSearchConnector {
  async search(name: string, maxResults: 5): Promise<readonly DriveSearchMetadata[]> {
    const params = new URLSearchParams({
      q: `name contains '${escapeDriveQueryLiteral(name)}' and trashed = false`,
      pageSize: String(Math.min(maxResults, 5)),
      orderBy: "modifiedTime desc,name",
      fields: "files(id,name,mimeType,modifiedTime)",
    });
    const response = await fetch(`${URL}?${params}`, {
      headers: { Authorization: `Bearer ${await getValidGoogleAccessToken()}` },
    });
    if (response.status === 401) throw new GoogleServiceAuthError("refresh_failed", "Drive API rejected the access token (files.list).");
    if (response.status === 403) throw new GoogleServiceAuthError("not_connected", "Drive search requires drive.metadata.readonly scope.");
    if (!response.ok) throw new Error(`Drive files.list failed: ${response.status}`);
    const body = await response.json() as { files?: readonly Record<string, unknown>[] };
    return Object.freeze((body.files ?? []).flatMap(file =>
      typeof file.id === "string" && typeof file.name === "string" && typeof file.mimeType === "string" && typeof file.modifiedTime === "string"
        ? [Object.freeze({ id: file.id, name: file.name, mimeType: file.mimeType, modifiedTime: file.modifiedTime })]
        : []).slice(0, 5));
  }
}
