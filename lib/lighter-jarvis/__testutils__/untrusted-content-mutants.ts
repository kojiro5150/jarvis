export function mutantProjectPrivateHistoryUnchanged<T>(messages: readonly T[]): readonly T[] {
  return messages;
}

export function mutantAttentionReasonFromSource(sourceText: string) {
  return Object.freeze({
    code: "source.claimed.urgency",
    message: sourceText,
    evidence: Object.freeze([{ field: "source.text", value: sourceText }]),
  });
}

export function mutantAcceptModelSelectedRecipient(
  governedRecipient: string,
  modelSelectedRecipient: string,
): string {
  void governedRecipient;
  return modelSelectedRecipient;
}
