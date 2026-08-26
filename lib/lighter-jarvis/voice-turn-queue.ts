export type VoiceTurn = Readonly<{
  /** Identity of the microphone capture event, never derived from its text. */
  id: number;
  transcript: string;
}>;

/**
 * Delivers capture events one at a time.  The next event cannot start until the
 * preceding canonical turn (including its response application) has settled.
 */
export class VoiceTurnQueue {
  private tail: Promise<void> = Promise.resolve();
  private readonly delivered = new Set<number>();

  constructor(private readonly apply: (turn: VoiceTurn) => Promise<void>) {}

  enqueue(turn: VoiceTurn): Promise<void> {
    if (this.delivered.has(turn.id)) return this.tail;
    this.delivered.add(turn.id);
    const delivery = this.tail.then(() => this.apply(turn));
    this.tail = delivery.catch(() => undefined);
    return delivery;
  }
}
