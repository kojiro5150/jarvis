import { NextRequest,NextResponse } from "next/server";
import { DeterministicExecutiveOperatingSystemRuntime,ExecutiveOperatingSystemRuntimeError } from "../../../../lib/executive-operating-system/runtime";
export async function POST(request:NextRequest){
 try{const input=await request.json();return NextResponse.json(new DeterministicExecutiveOperatingSystemRuntime().run(input))}
 catch(error){if(error instanceof ExecutiveOperatingSystemRuntimeError)return NextResponse.json({error:{type:"executive_operating_system_runtime_error",stage:error.stage,category:error.category,reasonCode:error.reasonCode,inputArtifactIds:error.inputArtifactIds}},{status:error.category==="validation"?400:422});return NextResponse.json({error:{type:"invalid_json",reasonCode:"request-body-not-json"}},{status:400})}
}
