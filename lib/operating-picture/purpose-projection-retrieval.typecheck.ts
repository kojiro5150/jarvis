import type {
  AuthorityEvidence,
  GovernedEvidence,
} from "../governance-core/trust-types";
import type { OperatingPictureRecord } from "./record-core";
import type {
  DurablePurposeProjectionResult,
} from "./purpose-projection-retrieval";

declare const projection: Extract<
  DurablePurposeProjectionResult,
  Readonly<{ status: "projected" }>
>;

// Whole-store purpose retrieval remains low-trust continuity.
// @ts-expect-error purpose projection cannot become a trusted Operating Picture record
const _record: OperatingPictureRecord = projection;

// @ts-expect-error purpose projection cannot manufacture governed evidence
const _evidence: GovernedEvidence<unknown> = projection;

// @ts-expect-error purpose projection cannot manufacture reusable authority
const _authority: AuthorityEvidence<unknown> = projection;

void _record;
void _evidence;
void _authority;
