import UnifiedOpsConsole from "@/components/console/UnifiedOpsConsole";

export const dynamic = "force-dynamic";

/**
 * JARVIS now has one production conversational surface.
 * Capability authority and private-source handling live behind /api/lighter/chat.
 */
export default function Home() {
  return <UnifiedOpsConsole />;
}
