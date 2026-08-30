import type {
  AuthorityEvidence,
  GovernedEvidence,
} from "../governance-core/trust-types";
import type { OperatingPictureRecord } from "./record-core";
import type {
  DurableOperatingPictureProjectionItem,
  DurableOperatingPictureProjectionResult,
} from "./durable-projection";

declare const projection: Extract<
  DurableOperatingPictureProjectionResult,
  Readonly<{ status: "projected" }>
>;

declare const item: DurableOperatingPictureProjectionItem;

// Purpose-bounded projection remains low-trust continuity.
// @ts-expect-error projected continuity is not a trusted Operating Picture record
const _record: OperatingPictureRecord = item;

// @ts-expect-error projected continuity cannot manufacture governed evidence
const _evidence: GovernedEvidence<unknown> = item;

// @ts-expect-error projected continuity cannot manufacture reusable authority
const _authority: AuthorityEvidence<unknown> = item;

// @ts-expect-error a projection result is not the high-trust record itself
const _projectionAsRecord: OperatingPictureRecord = projection;

void _record;
void _evidence;
void _authority;
void _projectionAsRecord;
