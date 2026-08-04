import { createLighterChatHandler } from "@/lib/lighter-jarvis/chat-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = createLighterChatHandler();
