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

// Candidate authorship, purpose, revision semantics and class are closed.
// @ts-expect-error fact is not an admissible user continuity capture class
const _factCandidate: UserContinuityCaptureCandidate = {
  captureIntent: "explicit_user_instruction",
  semanticClass: "fact",
  value: { statement: parsed.status === "matched" ? parsed.request.statement : modelText },
  authorship: { source: "user", statedAt: "2026-09-01T04:15:00.000Z" },
  visibilityPurposes: ["conversation"],
  revisionSemantics: "append_only",
};

// @ts-expect-error model authorship cannot inhabit a user-authored capture candidate
const _modelAuthoredCandidate: UserContinuityCaptureCandidate = {
  captureIntent: "explicit_user_instruction",
  semanticClass: "preference",
  value: { statement: parsed.status === "matched" ? parsed.request.statement : modelText },
  authorship: { source: "model", statedAt: "2026-09-01T04:15:00.000Z" },
  visibilityPurposes: ["conversation"],
  revisionSemantics: "append_only",
};

// @ts-expect-error capture candidates cannot request replacement semantics
const _replacementCandidate: UserContinuityCaptureCandidate = {
  captureIntent: "explicit_user_instruction",
  semanticClass: "preference",
  value: { statement: parsed.status === "matched" ? parsed.request.statement : modelText },
  authorship: { source: "user", statedAt: "2026-09-01T04:15:00.000Z" },
  visibilityPurposes: ["conversation"],
  revisionSemantics: "explicit_replacement",
};

// @ts-expect-error capture candidates cannot widen visibility beyond conversation
const _widenedVisibility: UserContinuityCaptureCandidate = {
  captureIntent: "explicit_user_instruction",
  semanticClass: "preference",
  value: { statement: parsed.status === "matched" ? parsed.request.statement : modelText },
  authorship: { source: "user", statedAt: "2026-09-01T04:15:00.000Z" },
  visibilityPurposes: ["planning"],
  revisionSemantics: "append_only",
};

// Trust-bearing objects cannot inhabit the statement slot.
// @ts-expect-error authority evidence is not a user capture statement
const _authorityStatement: UserContinuityCaptureStatement = authority;
// @ts-expect-error governed evidence is not a user capture statement
const _evidenceStatement: UserContinuityCaptureStatement = evidence;

void [
  _plainStatement,
  _modelStatement,
  _factCandidate,
  _modelAuthoredCandidate,
  _replacementCandidate,
  _widenedVisibility,
  _authorityStatement,
  _evidenceStatement,
];
