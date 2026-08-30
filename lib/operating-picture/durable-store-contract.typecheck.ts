import type { AuthorityEvidence, GovernedEvidence } from "../governance-core/trust-types";
import type { OperatingPictureRecord } from "./record-core";
import type {
  DurableOperatingPictureStore,
} from "./durable-store-contract";
import type { PersistedOperatingPictureVersion } from "./persistence-record";

declare const persisted: PersistedOperatingPictureVersion;
declare const durableStore: DurableOperatingPictureStore;

// A durable row is low-trust data, not a governed record.
// @ts-expect-error persisted data cannot be assigned to a governed Operating Picture record
const _record: OperatingPictureRecord = persisted;

// @ts-expect-error persisted data cannot manufacture governed evidence
const _evidence: GovernedEvidence<unknown> = persisted;

// @ts-expect-error persisted data cannot manufacture reusable authority
const _authority: AuthorityEvidence<unknown> = persisted;

const result = durableStore.getVersion("version-id");
void result;
void _record;
void _evidence;
void _authority;
