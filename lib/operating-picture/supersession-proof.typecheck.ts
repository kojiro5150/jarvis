import {
  createUserAssertionRecord,
} from "./record-core";
import {
  proveExplicitReplacementSupersession,
  type ExplicitReplacementDeclaration,
} from "./supersession-proof";

const previous = createUserAssertionRecord({
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
const replacement = createUserAssertionRecord({
  id: "user:preference:2",
  subject: previous.subject,
  value: "I now prefer afternoons.",
  statedAt: "2026-09-01T04:30:00Z",
  visibility: ["planning"],
});

// @ts-expect-error plain caller data cannot fabricate a trusted explicit-replacement declaration
const declaration: ExplicitReplacementDeclaration = {
  previousRecordId: previous.id,
  replacementRecordId: replacement.id,
  statedAt: "2026-09-01T04:30:00Z",
};

// @ts-expect-error exact ids alone are insufficient without the branded declaration
proveExplicitReplacementSupersession(previous, replacement, {
  previousRecordId: previous.id,
  replacementRecordId: replacement.id,
  statedAt: "2026-09-01T04:30:00Z",
});

void declaration;
