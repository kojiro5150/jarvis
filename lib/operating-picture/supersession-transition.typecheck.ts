import type {
  AuthoritativeSnapshotSupersessionProof,
  ExplicitReplacementSupersessionProof,
} from "./supersession-proof";
import {
  applyAuthoritativeSnapshotSupersession,
  applyExplicitReplacementSupersession,
} from "./lifecycle-core";
import { createUserAssertionRecord } from "./record-core";

declare const explicitProof: ExplicitReplacementSupersessionProof;
declare const authoritativeProof: AuthoritativeSnapshotSupersessionProof;

const record = createUserAssertionRecord({
  id: "user:preference:1",
  subject: {
    namespace: "user",
    entity: "preferences",
    attribute: "time_of_day",
    revision: "explicit_replacement",
  },
  value: "I prefer mornings.",
  statedAt: "2026-08-30T04:30:00Z",
  visibility: ["planning"],
});

applyExplicitReplacementSupersession(record, explicitProof);

// @ts-expect-error authoritative snapshot proof cannot enter the explicit-replacement transition
applyExplicitReplacementSupersession(record, authoritativeProof);

// @ts-expect-error explicit replacement proof cannot enter the authoritative-snapshot transition
applyAuthoritativeSnapshotSupersession(record, explicitProof);
