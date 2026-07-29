import { createHash, randomBytes } from "node:crypto";
import type { CalendarEvent } from "../connectors/calendar-event";
import { CalendarProjectionAdapter } from "../executive-operating-system/situational-awareness/projection";
import { createSituationalAwareness, type OperationalCommitment } from "../executive-operating-system/situational-awareness/model";
import { createSituationalAwarenessSnapshot } from "../executive-operating-system/situational-awareness/lifecycle";
import { SituationalAwarenessEngine } from "../executive-operating-system/situational-awareness/assembly";
import { AvailabilityEngine } from "../executive-operating-system/computation/availability";
import { ExecutiveContextEngine } from "../executive-context";
import { recordOperationalValidation } from "./recorder";
import type { AnonymisedValidationSummary, EvidenceAttestation, OperationalScenarioRecord, OperationalValidationInput, ScenarioCategory } from "./types";

export interface BoundedCalendarConnector { verifySession():Promise<void>; listBetween(start:string,end:string,limit:number):Promise<readonly CalendarEvent[]>; }
export interface OperationalRunnerDependencies { readonly connector:BoundedCalendarConnector; readonly now?:()=>Date; readonly confirmChallenge?:(display:Readonly<Record<string,string|number>>)=>Promise<{operator:string;answer:string}|undefined>; readonly repositoryRoot?:string; }
export type OperationalRunnerResult = {status:"AUTHENTICATED_VALIDATION_NOT_EXECUTED";recommendation:"NOT_ASSESSED"}|{status:"AUTHENTICATED_EXECUTION_CLAIMED"|"OPERATIONAL_VALIDATION_COMPLETE";reportPath:string;summary:AnonymisedValidationSummary;attestation:Readonly<Record<string,string|number>>};
const runnerVersion = "operational-validation-runner-v1";
const categories: readonly ScenarioCategory[] = ["CURRENT_WORKING_DAY","TOMORROW","OVERLAPPING_COMMITMENTS","NO_COMMITMENTS","BUSY_AFTERNOON","RECURRING_COMMITMENT","CANCELLED_COMMITMENT","DECLINED_VISIBLE_INVITATION","ALL_DAY_COMMITMENT","MIXED_MEETING_DURATIONS"];
const day = (v:string) => v.slice(0,10);
export function deriveScenarios(events:readonly CalendarEvent[], commitments:readonly OperationalCommitment[], availability:{temporalOverlaps:readonly unknown[]}, now:Date): readonly {category:ScenarioCategory;present:boolean}[] {
  const today=day(now.toISOString()), tomorrow=day(new Date(now.getTime()+86400000).toISOString());
  const durations=events.filter(e=>e.time!=="All day").map(e=>Date.parse(e.end)-Date.parse(e.start));
  const present:Record<ScenarioCategory,boolean>={CURRENT_WORKING_DAY:events.some(e=>day(e.start)===today),TOMORROW:events.some(e=>day(e.start)===tomorrow),OVERLAPPING_COMMITMENTS:availability.temporalOverlaps.length>0,NO_COMMITMENTS:events.length===0,BUSY_AFTERNOON:events.filter(e=>day(e.start)===today&&new Date(e.start).getUTCHours()>=12).length>=3,RECURRING_COMMITMENT:false,CANCELLED_COMMITMENT:events.some(e=>e.status==="cancelled"),DECLINED_VISIBLE_INVITATION:false,ALL_DAY_COMMITMENT:events.some(e=>e.time==="All day"),MIXED_MEETING_DURATIONS:new Set(durations).size>1};
  // Canonical CalendarEvent deliberately has no recurrence or attendee-response fields; never infer them.
  void commitments;
  return categories.map(category=>({category,present:present[category]}));
}

export async function runAuthenticatedOperationalValidation(deps:OperationalRunnerDependencies):Promise<OperationalRunnerResult>{
  try { await deps.connector.verifySession(); } catch { return {status:"AUTHENTICATED_VALIDATION_NOT_EXECUTED",recommendation:"NOT_ASSESSED"}; }
  const now=(deps.now??(()=>new Date()))(), observedAt=now.toISOString();
  const start=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate())).toISOString();
  const end=new Date(Date.parse(start)+3*86400000).toISOString();
  const events=await deps.connector.listBetween(start,end,100); // no fixture fallback
  const connector={source:"google" as const,listUpcoming:async(limit=100)=>events.slice(0,limit)};
  const artifact=await new CalendarProjectionAdapter({identity:{userId:"authenticated-operator",displayName:"Authenticated Operator"},observedAt,connector,limit:100}).project();
  const previous=createSituationalAwarenessSnapshot({snapshotId:`previous-${now.getTime()}`,observedAt:new Date(now.getTime()-1).toISOString(),state:createSituationalAwareness({identity:{userId:"authenticated-operator",displayName:"Authenticated Operator"},roles:[],projects:[],commitments:[],waitingItems:[],priorities:[],activeWork:[],sources:[]})});
  const assembled=new SituationalAwarenessEngine().assemble({artifacts:[artifact],previousSnapshot:previous,snapshotId:`lifecycle-${now.getTime()}`,observedAt});
  if(assembled.outcome!=="success") throw new Error(`situational awareness failed: ${assembled.code}`);
  const availability=new AvailabilityEngine().compute(assembled.snapshot,{currentInstant:observedAt,start,end});
  const executive=new ExecutiveContextEngine().derive({sourceSnapshot:assembled.snapshot,referenceTime:observedAt});
  if(executive.outcome!=="success") throw new Error(`ExecutiveContext failed: ${executive.code}`);
  const derived=deriveScenarios(events,assembled.snapshot.state.commitments,availability,now);
  const scenarios:OperationalScenarioRecord[]=derived.map((item,index)=>({scenarioId:`OV-LIVE-${String(index+1).padStart(3,"0")}`,scenarioCategory:item.category,validationDate:day(observedAt),connectorEvidence:events,canonicalProjection:artifact,situationalAwareness:assembled.snapshot,availabilityComputation:availability,executiveRepresentation:executive.snapshot,comparisonClassification:item.present?"Not Comparable":"Scenario Not Present",outcomeReason:item.present?"EXTRACTION_NOT_COMPARABLE":"SCENARIO_NOT_PRESENT",matchedClaims:0,comparedClaims:0}));
  const runId=`ov-${observedAt.replace(/[^0-9]/g,"")}-${randomBytes(4).toString("hex")}`;
  const provenance={executionSource:"authenticated_deployment" as const,connectorSource:"live_google_calendar" as const,validationLevel:"operational" as const,oauthSession:"present" as const,generatedBy:"authenticated-operational-validation-runner",generatedAt:observedAt,runnerVersion};
  const reportHash=createHash("sha256").update(JSON.stringify({runId,provenance,scenarios,retrievalWindow:{start,end}})).digest("hex");
  const challengeId=randomBytes(8).toString("hex"), expected=`${reportHash.slice(0,8)}-${events.length}-${challengeId.slice(-4)}`;
  const display={runId,executionTimestamp:observedAt,runnerVersion,authenticationStatus:"present",retrievalWindow:`${start} / ${end}`,eventCount:events.length,projectedCommitmentCount:assembled.snapshot.state.commitments.length,scenarioCount:derived.filter(s=>s.present).length,reportHash,challengeId,challenge:`Enter ${expected}`,localEvidenceExcerpt:events[0]?.title?.slice(0,48) ?? "(no events observed)"};
  const response=await deps.confirmChallenge?.(display);
  let attestation:EvidenceAttestation|undefined;
  if(response?.answer===expected&&response.operator.trim()) attestation={reportWritten:true,challengeCompleted:true,attestedAt:new Date().toISOString(),confirmedAt:new Date().toISOString(),confirmingOperator:response.operator.trim(),challengeId,reportHash,runnerVersion};
  const input:OperationalValidationInput={runId,provenance,operatorConfirmation:attestation?"confirmed":"pending",...(attestation?{attestation}:{}),scenarios,retrievalWindow:{start,end,category:"THREE_DAY_BOUNDED"}};
  const recorded=await recordOperationalValidation(input,{repositoryRoot:deps.repositoryRoot});
  return {status:attestation?"OPERATIONAL_VALIDATION_COMPLETE":"AUTHENTICATED_EXECUTION_CLAIMED",...recorded,attestation:display};
}
