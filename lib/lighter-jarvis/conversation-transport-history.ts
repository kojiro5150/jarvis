export type TransportMessage = Readonly<{
  role: "user" | "assistant";
  content: string;
  error?: boolean;
}>;

/**
 * Synchronous transport history. React state is only a rendering mirror: an
 * accepted response is visible here before a serialized voice turn is released.
 * This carries presentation text only and confers no connector authority.
 */
export class ConversationTransportHistory {
  private readonly histories = new Map<string, TransportMessage[]>();

  messages(specialistId: string): TransportMessage[] {
    return [...(this.histories.get(specialistId) ?? [])];
  }

  acceptUser(specialistId: string, content: string): TransportMessage[] {
    return this.append(specialistId, { role: "user", content });
  }

  acceptAssistant(specialistId: string, content: string, error = false): TransportMessage[] {
    return this.append(specialistId, { role: "assistant", content, ...(error ? { error: true } : {}) });
  }

  private append(specialistId: string, message: TransportMessage): TransportMessage[] {
    const next = [...(this.histories.get(specialistId) ?? []), message];
    this.histories.set(specialistId, next);
    return [...next];
  }
}
