import {
  createExplicitReplacementDeclarationFromExactResolution,
} from "./supersession-proof";
import type {
  ExactExplicitReplacementResolution,
} from "./explicit-replacement-reference";

// @ts-expect-error raw record ids and confirmation text cannot fabricate an exact server-owned resolution
const fabricated: ExactExplicitReplacementResolution = {
  previousRecordId: "previous",
  replacementRecordId: "replacement",
  previousVersionId: "previous-version",
  replacementVersionId: "replacement-version",
  confirmedAt: "2026-08-30T06:00:00Z",
  utterance: "yes",
};

// @ts-expect-error declaration construction requires the branded exact resolution
createExplicitReplacementDeclarationFromExactResolution({
  previousRecordId: "previous",
  replacementRecordId: "replacement",
  previousVersionId: "previous-version",
  replacementVersionId: "replacement-version",
  confirmedAt: "2026-08-30T06:00:00Z",
  utterance: "yes",
});

void fabricated;
