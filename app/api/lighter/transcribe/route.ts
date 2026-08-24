import { OpenAITranscriptionProvider } from "@/lib/lighter-jarvis/transcription/openai-provider";
import type { AudioCaptureArtifact, TranscriptionProvider } from "@/lib/lighter-jarvis/transcription/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function createTranscriptionHandler(
  providerFactory: (key: string) => TranscriptionProvider =
    (key) => new OpenAITranscriptionProvider(key),
  credential: () => string | undefined = () => process.env.OPENAI_API_KEY,
) {
  return async function POST(request: Request): Promise<Response> {
    const apiKey = credential();
    if (!apiKey) return Response.json({ error: "Transcription is unavailable: OPENAI_API_KEY is not configured." }, { status: 503 });

    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return Response.json({ error: "Expected multipart form data containing an audio file." }, { status: 400 });
    }
    const audio = form.get("audio");
    const durationValue = form.get("durationMs");
    const durationMs = typeof durationValue === "string" ? Number(durationValue) : NaN;
    if (!(audio instanceof Blob) || audio.size === 0 || !audio.type.startsWith("audio/") || !Number.isFinite(durationMs) || durationMs < 0) {
      return Response.json({ error: "A non-empty audio file and valid durationMs are required." }, { status: 400 });
    }
    const artifact: AudioCaptureArtifact = {
      blob: audio,
      mimeType: audio.type,
      capturedAt: new Date().toISOString(),
      durationMs,
      source: "microphone",
    };
    try {
      return Response.json(await providerFactory(apiKey).transcribe(artifact));
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unknown transcription provider error.";
      return Response.json({ error: `Transcription provider error: ${detail}` }, { status: 502 });
    }
  };
}

export const POST = createTranscriptionHandler();
