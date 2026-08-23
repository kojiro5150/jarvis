export const CONFIRM_PHRASES = ["yes", "yeah", "yep", "confirm", "confirmed", "go ahead", "do it", "please do", "sure", "ok", "okay"] as const;
export const DECLINE_PHRASES = ["no", "nope", "decline", "declined", "cancel", "don't", "never mind", "stop"] as const;

export function handoffResponse(input: string): "confirm" | "decline" | undefined {
  const normalized = input.trim().toLowerCase().replace(/[.!?]$/, "");
  if ((CONFIRM_PHRASES as readonly string[]).includes(normalized)) return "confirm";
  if ((DECLINE_PHRASES as readonly string[]).includes(normalized)) return "decline";
  return undefined;
}
