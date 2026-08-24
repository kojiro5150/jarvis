import { describe, expect, it, vi } from "vitest";
import { createTranscriptionHandler } from "./route";
import type { TranscriptionProvider } from "@/lib/lighter-jarvis/transcription/types";

function request(audio: Blob | null = new Blob(["audio"], { type: "audio/webm" }), duration = "25") {
  const form = new FormData();
  if (audio) form.append("audio", audio, "recording.webm");
  form.append("durationMs", duration);
  return new Request("http://localhost/api/lighter/transcribe", { method: "POST", body: form });
}

describe("POST /api/lighter/transcribe", () => {
  it("fails closed without the server credential", async () => {
    const response = await createTranscriptionHandler(vi.fn(), () => undefined)(request());
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "Transcription is unavailable: OPENAI_API_KEY is not configured." });
  });

  it("rejects malformed audio", async () => {
    const response = await createTranscriptionHandler(vi.fn(), () => "key")(request(null));
    expect(response.status).toBe(400);
  });

  it("returns the adapter result", async () => {
    const transcribe = vi.fn(async () => ({ text: "Bounded speech", provider: "mock", model: "mock-model" }));
    const response = await createTranscriptionHandler(() => ({ transcribe } satisfies TranscriptionProvider), () => "key")(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ text: "Bounded speech", provider: "mock", model: "mock-model" });
    expect(transcribe).toHaveBeenCalledOnce();
  });

  it("surfaces provider errors", async () => {
    const provider: TranscriptionProvider = { transcribe: vi.fn(async () => { throw new Error("upstream unavailable"); }) };
    const response = await createTranscriptionHandler(() => provider, () => "key")(request());
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "Transcription provider error: upstream unavailable" });
  });
});
