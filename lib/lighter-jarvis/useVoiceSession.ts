"use client";

import { useMicCapture } from "@/lib/useMicCapture";

export type VoiceState = "standby" | "listening" | "error";

export interface VoiceSession {
  state: VoiceState;
  amplitude: number;
  toggle: () => void;
}

/** Lighter-console voice orchestration backed only by the real mic capture. */
export function useVoiceSession(): VoiceSession {
  const { active, amplitude, error, toggle } = useMicCapture();

  const state: VoiceState = error
    ? "error"
    : active
      ? "listening"
      : "standby";

  return { state, amplitude, toggle };
}
