import DashboardShell from "@/components/dashboard/DashboardShell";
import { selectDashboardPresentationMode } from "@/lib/dashboard-presentation-selection";
import { selectDawnwatchPresentationMode } from "@/lib/dawnwatch-presentation-selection";

// Presentation mode is a runtime rollback control, not a build-time substitution.
export const dynamic = "force-dynamic";

export default function Home() {
  const presentationMode = selectDashboardPresentationMode(process.env.DASHBOARD_PRESENTATION_MODE);
  const dawnwatchPresentationMode = selectDawnwatchPresentationMode(process.env.DAWNWATCH_PRESENTATION_MODE);
  return <DashboardShell presentationMode={presentationMode} dawnwatchPresentationMode={dawnwatchPresentationMode} />;
}
