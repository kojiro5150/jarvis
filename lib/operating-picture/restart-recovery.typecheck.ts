import type {
  AuthorityEvidence,
  GovernedEvidence,
} from "../governance-core/trust-types";
import type { OperatingPictureRecord } from "./record-core";
import type { RecoveredOperatingPictureVersion } from "./restart-recovery";

declare const recovered: RecoveredOperatingPictureVersion;

// Restart recovery preserves continuity classification only.
// @ts-expect-error recovered durable continuity is not a trusted Operating Picture record
const _record: OperatingPictureRecord = recovered;

// @ts-expect-error recovered durable continuity cannot become governed evidence
const _evidence: GovernedEvidence<unknown> = recovered;

// @ts-expect-error recovered durable continuity cannot become reusable authority
const _authority: AuthorityEvidence<unknown> = recovered;

void _record;
void _evidence;
void _authority;
