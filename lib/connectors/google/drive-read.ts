import { getValidGoogleAccessToken } from "./access-token";
import { GoogleServiceAuthError } from "./auth-error";
export const GOOGLE_DOC_MIME = "application/vnd.google-apps.document";
export const DRIVE_READONLY_SCOPE = "https://www.googleapis.com/auth/drive.readonly";
export type DriveTextFile = Readonly<{ fileId: string; mimeType: typeof GOOGLE_DOC_MIME; text: string }>;
export interface DriveReadConnector { readGoogleDocText(fileId: string, maxBytes: number): Promise<DriveTextFile>; }
export class GoogleDriveReadConnector implements DriveReadConnector {
  async readGoogleDocText(fileId: string, maxBytes: number): Promise<DriveTextFile> {
    const token = await getValidGoogleAccessToken();
    const headers = { Authorization: `Bearer ${token}` };
    const metadata = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?fields=id,mimeType`, { headers });
    if (metadata.status === 401 || metadata.status === 403) throw new GoogleServiceAuthError("not_connected", "Drive content requires drive.readonly scope.");
    if (!metadata.ok) throw new Error(`Drive files.get failed: ${metadata.status}`);
    const descriptor = await metadata.json() as { id?: unknown; mimeType?: unknown };
    if (descriptor.id !== fileId || descriptor.mimeType !== GOOGLE_DOC_MIME) throw new Error("unsupported_drive_mime");
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/export?mimeType=text%2Fplain`, { headers });
    if (!response.ok || !response.body) throw new Error(`Drive files.export failed: ${response.status}`);
    const declared = Number(response.headers.get("content-length"));
    if (Number.isFinite(declared) && declared > maxBytes) throw new Error("drive_content_too_large");
    const reader = response.body.getReader(); const chunks: Uint8Array[] = []; let size = 0;
    while (true) { const chunk = await reader.read(); if (chunk.done) break; size += chunk.value.byteLength;
      if (size > maxBytes) { await reader.cancel(); throw new Error("drive_content_too_large"); } chunks.push(chunk.value); }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return Object.freeze({ fileId, mimeType: GOOGLE_DOC_MIME, text: new TextDecoder("utf-8", { fatal: true }).decode(bytes) });
  }
}
