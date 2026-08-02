export type SourceAdapterStatus = "available" | "unavailable";

export interface SourceAdapterResult<T> {
  readonly status: SourceAdapterStatus;
  readonly evidence: readonly T[];
  readonly observedAt?: string;
  readonly failureReason?: string;
}

export function sourceResult<T>(
  status: SourceAdapterStatus,
  evidence: readonly T[],
  metadata: { readonly observedAt?: string; readonly failureReason?: string } = {},
): SourceAdapterResult<T> {
  return Object.freeze({
    status,
    evidence: Object.freeze([...evidence]),
    ...(metadata.observedAt === undefined ? {} : { observedAt: metadata.observedAt }),
    ...(metadata.failureReason === undefined ? {} : { failureReason: metadata.failureReason }),
  });
}
