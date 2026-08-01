import { NextResponse } from "next/server";
import {
  DAWNWATCH_EVALUATION_SCENARIOS,
  evaluateDawnwatchScenario,
  type DawnwatchEvaluationScenario,
} from "../../../../lib/dawnwatch-parallel-evaluation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Isolated, credential-free evaluation endpoint; it is not a production DAWNWATCH route. */
export async function GET(request: Request) {
  const requested = new URL(request.url).searchParams.get("scenario");
  if (requested && !DAWNWATCH_EVALUATION_SCENARIOS.includes(requested as DawnwatchEvaluationScenario)) {
    return NextResponse.json({ error: "unknown scenario", scenarios: DAWNWATCH_EVALUATION_SCENARIOS }, { status: 400 });
  }
  const scenarios = requested ? [requested as DawnwatchEvaluationScenario] : DAWNWATCH_EVALUATION_SCENARIOS;
  return NextResponse.json({
    evaluationVersion: "sprint-3.71-v1",
    productionAuthorityChanged: false,
    evaluations: scenarios.map(evaluateDawnwatchScenario),
  });
}
