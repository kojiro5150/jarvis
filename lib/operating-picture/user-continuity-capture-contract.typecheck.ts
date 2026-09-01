import type {
  AuthorityEvidence,
  GovernedEvidence,
  ModelText,
} from "../governance-core/trust-types";
import {
  parseExplicitUserContinuityCaptureRequest,
  type UserContinuityCaptureCandidate,
  type UserContinuityCaptureStatement,
} from "./user-continuity-capture-contract";

declare const modelText: ModelText;
declare const authority: AuthorityEvidence<unknown>;
declare const evidence: GovernedEvidence<unknown>;

const parsed = parseExplicitUserContinuityCaptureRequest(
  "Remember that I prefer short status updates.",
);

if (parsed.status === "matched") {
  const _statement: UserContinuityCaptureStatement = parsed.request.statement;
  void _statement;
}

// The branded user-capture statement can only come from the deterministic
// capture boundary. Plain/model-authored strings cannot be substituted.
// @ts-expect-error plain strings are not deterministic user capture statements
const _plainStatement: UserContinuityCaptureStatement = "model could have written this";
// @ts-expect-error model-authored text cannot become a user-authored capture statement
const _modelStatement: UserContinuityCaptureStatement = modelText;

type CaptureClass = UserContinuityCaptureCandidate["semanticClass"];
type CaptureSource = UserContinuityCaptureCandidate["authorship"]["source"];
type CaptureRevision = UserContinuityCaptureCandidate["revisionSemantics"];
type CaptureVisibility = UserContinuityCaptureCandidate["visibilityPurposes"][number];

// @ts-expect-error fact is not an admissible user continuity capture class
const _factClass: CaptureClass = "fact";
// @ts-expect-error model authorship cannot inhabit a user-authored capture candidate
const _modelSource: CaptureSource = "model";
// @ts-expect-error capture candidates cannot request replacement semantics
const _replacementRevision: CaptureRevision = "explicit_replacement";
// @ts-expect-error capture candidates cannot widen visibility beyond conversation
const _planningVisibility: CaptureVisibility = "planning";

// Trust-bearing objects cannot inhabit the statement slot.
// @ts-expect-error authority evidence is not a user capture statement
const _authorityStatement: UserContinuityCaptureStatement = authority;
// @ts-expect-error governed evidence is not a user capture statement
const _evidenceStatement: UserContinuityCaptureStatement = evidence;

void [
  _plainStatement,
  _modelStatement,
  _factClass,
  _modelSource,
  _replacementRevision,
  _planningVisibility,
  _authorityStatement,
  _evidenceStatement,
];
