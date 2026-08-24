import { createTranscriptionHandler } from "@/lib/lighter-jarvis/transcribe-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = createTranscriptionHandler();
