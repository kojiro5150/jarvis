import type { ExecutiveOperatingSystemStageId,ExecutiveOperatingSystemStageTrace } from "./types";
import { deepFreeze } from "./validation";
export function stageTrace(stageId:ExecutiveOperatingSystemStageId,sequence:number,inputArtifactIds:readonly string[],outputArtifactIds:readonly string[],empty=false):ExecutiveOperatingSystemStageTrace{return deepFreeze({stageId,sequence,inputArtifactIds:[...inputArtifactIds].sort(),outputArtifactIds:[...outputArtifactIds].sort(),status:empty?"completed_empty":"completed",validationStatus:"valid"})}
