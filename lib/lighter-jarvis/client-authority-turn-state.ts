export type OpaquePendingAuthorization = Readonly<{ pendingAuthorizationId: string }>;

/** Client transport state: it orders responses but never interprets capability. */
export class ClientAuthorityTurnState {
  private nextRequestId = 0;
  private currentRequestId = 0;
  private pending: OpaquePendingAuthorization | null = null;

  beginRequest(): Readonly<{ requestId: number; pendingAuthorizationReference: OpaquePendingAuthorization | null }> {
    const requestId = ++this.nextRequestId;
    this.currentRequestId = requestId;
    return { requestId, pendingAuthorizationReference: this.pending };
  }

  applyResponse(requestId: number, pending: OpaquePendingAuthorization | null): boolean {
    if (requestId !== this.currentRequestId) return false;
    this.pending = pending;
    return true;
  }
}
