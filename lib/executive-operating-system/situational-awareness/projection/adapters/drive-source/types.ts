import type {
  OperationalIdentity,
  OperationalSourceId,
  OperationalTimestamp,
} from "../../../model";
import type { SourceAvailability } from "../../types";

export interface DriveSourceProjectionOptions {
  readonly identity: OperationalIdentity;
  readonly projectedAt: OperationalTimestamp;
  readonly availability: SourceAvailability;
  readonly governedEvidenceCount: number;
  readonly sourceId?: OperationalSourceId;
}
