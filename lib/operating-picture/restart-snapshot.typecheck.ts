import type {
  AuthorityEvidence,
  GovernedEvidence,
} from "../governance-core/trust-types";
import type { OperatingPictureRecord } from "./record-core";
import type {
  OperatingPictureRestartSnapshotResult,
} from "./restart-snapshot";
import type { OperatingPictureStore } from "./store-contract";

declare const snapshot: Extract<
  OperatingPictureRestartSnapshotResult,
  Readonly<{ status: "recovered" }>
>;

// A complete restart snapshot is still low-trust continuity.
// @ts-expect-error restart snapshot cannot become the high-trust store
const _store: OperatingPictureStore = snapshot;

// @ts-expect-error restart snapshot records are not trusted Operating Picture records
const _record: OperatingPictureRecord = snapshot.records[0];

// @ts-expect-error restart snapshot cannot manufacture governed evidence
const _evidence: GovernedEvidence<unknown> = snapshot.records[0];

// @ts-expect-error restart snapshot cannot manufacture reusable authority
const _authority: AuthorityEvidence<unknown> = snapshot.records[0];

void _store;
void _record;
void _evidence;
void _authority;
