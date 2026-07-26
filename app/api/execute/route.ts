import { NextRequest, NextResponse } from "next/server";

import { ClaudeModelAdapter } from "@/lib/agents/claude-model-adapter";
import {
  handleSpecialistExecution,
  parseSpecialistExecutionRequest,
} from "@/lib/agents/execution-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const request = parseSpecialistExecutionRequest(body);
  if (!request) {
    return NextResponse.json(
      {
        error:
          "Request must contain one valid collaboration step, task, constraints, and optional expectedOutput or humanApproved fields.",
      },
      { status: 400 }
    );
  }

  const response = await handleSpecialistExecution(
    request,
    new ClaudeModelAdapter()
  );

  if (response.status === 502) {
    console.error("[/api/execute] Specialist model execution failed");
  }

  return NextResponse.json(response.body, { status: response.status });
}
