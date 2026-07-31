import { NextResponse } from "next/server";
import { DASHBOARD_EVALUATION_SCENARIOS, evaluateDashboardScenario, type DashboardEvaluationScenario } from "../../../../lib/dashboard-parallel-evaluation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Evidence-only, credential-free harness. This route is not a production Dashboard data source. */
export async function GET(request: Request) {
  const requested = new URL(request.url).searchParams.get("scenario");
  if (requested && !DASHBOARD_EVALUATION_SCENARIOS.includes(requested as DashboardEvaluationScenario)) {
    return NextResponse.json({ error: "unknown scenario", scenarios: DASHBOARD_EVALUATION_SCENARIOS }, { status: 400 });
  }
  const scenarios = requested ? [requested as DashboardEvaluationScenario] : DASHBOARD_EVALUATION_SCENARIOS;
  const evaluations = scenarios.map(evaluateDashboardScenario);
  return NextResponse.json({ evaluationVersion: "sprint-3.60.1-v1", productionAuthorityChanged: false, evaluations });
}
