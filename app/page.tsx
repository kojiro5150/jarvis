import UnifiedOpsConsole from "@/components/console/UnifiedOpsConsole";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { selectDashboardPresentationMode } from "@/lib/dashboard-presentation-selection";
import { selectConsolePresentationMode } from "@/lib/console-presentation-selection";
import { selectDawnwatchPresentationMode } from "@/lib/dawnwatch-presentation-selection";

// Presentation mode is a runtime rollback control, not a build-time substitution.
export const dynamic = "force-dynamic";

export default function Home() {
  const presentationMode = selectDashboardPresentationMode(process.env.DASHBOARD_PRESENTATION_MODE);
  const dawnwatchPresentationMode = selectDawnwatchPresentationMode(process.env.DAWNWATCH_PRESENTATION_MODE);
  const consolePresentationMode = selectConsolePresentationMode(process.env.CONSOLE_PRESENTATION_MODE);

  if (consolePresentationMode === "GOVERNED") return <UnifiedOpsConsole />;

  return <DashboardShell presentationMode={presentationMode} dawnwatchPresentationMode={dawnwatchPresentationMode} />;
}
