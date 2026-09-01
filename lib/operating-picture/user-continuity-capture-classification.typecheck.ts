import type {
  AuthorityEvidence,
  GovernedEvidence,
} from "../governance-core/trust-types";
import type {
  UserContinuityCaptureCandidate,
  UserContinuityCaptureClassification,
} from "./user-continuity-capture-contract";

declare const classification: UserContinuityCaptureClassification;

// A semantic classification is descriptive model output only.
// @ts-expect-error classification cannot become a durable capture candidate
const _candidate: UserContinuityCaptureCandidate = classification;
// @ts-expect-error classification cannot become governed evidence
const _evidence: GovernedEvidence<unknown> = classification;
// @ts-expect-error classification cannot become authority
const _authority: AuthorityEvidence<unknown> = classification;

type ClassificationClass =
  Extract<UserContinuityCaptureClassification, { status: "classified" }>["semanticClass"];
type AmbiguousClass =
  Extract<UserContinuityCaptureClassification, { status: "ambiguous" }>["semanticClass"];

// @ts-expect-error fact is outside the closed capture classification vocabulary
const _fact: ClassificationClass = "fact";
// @ts-expect-error ambiguous classification carries no guessed semantic class
const _ambiguousGuess: AmbiguousClass = "plan";

void [
  _candidate,
  _evidence,
  _authority,
  _fact,
  _ambiguousGuess,
];
