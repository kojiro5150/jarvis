export interface AudioCaptureArtifact {
  blob: Blob;
  mimeType: string;
  capturedAt: string;
  durationMs: number;
  source: "microphone";
}

export interface TranscriptionResult {
  text: string;
  provider: string;
  model: string;
  language?: string;
  durationMs?: number;
}

export interface TranscriptionProvider {
  transcribe(audio: AudioCaptureArtifact): Promise<TranscriptionResult>;
}
