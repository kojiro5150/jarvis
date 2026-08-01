import { createHash } from "node:crypto";
import { canonicalise, lineageIdentity } from "./lineage-types";
import type { ClaimBoundaryEvaluation, ClaimBoundaryRuleset, ClaimBoundaryRulesetBody, GovernedClaimSet } from "./claim-boundary-types";

const freeze = <T>(value: T): T => Object.freeze(structuredClone(value)) as T;
const digest = (value: unknown) => createHash("sha256").update(canonicalise(value)).digest("hex");
function required(value: unknown, message: string): asserts value { if (!value) throw new Error(message); }

export function constructClaimBoundaryRuleset(body: ClaimBoundaryRulesetBody): ClaimBoundaryRuleset {
  required(body.claimTemplates.length === 2 && new Set(body.claimTemplates.map(x => x.claimType)).size === 2, "ruleset must contain exactly the two admitted templates");
  const publicationDigest = digest(body);
  return freeze({ ...body, publicationDigest, claimBoundaryRulesetId: `claim-boundary-ruleset:${publicationDigest}` });
}

export function constructClaimBoundaryEvaluation(body: Omit<ClaimBoundaryEvaluation, "claimBoundaryEvaluationId">, eventDiscriminator: string): ClaimBoundaryEvaluation {
  required(body.threadId && body.requestId && body.exchangeId && eventDiscriminator, "evaluation lineage and event discriminator are required");
  required(![body.requestId, body.exchangeId, body.claimBoundaryRulesetId].includes(eventDiscriminator), "evaluation identity cannot alias lineage");
  return freeze({ ...body, claimBoundaryEvaluationId: lineageIdentity("claim-boundary-evaluation", { ...body, eventDiscriminator }) });
}

export function constructGovernedClaimSet(body: Omit<GovernedClaimSet, "governedClaimSetId" | "claimIds">, eventDiscriminator: string): GovernedClaimSet {
  required(body.claimBoundaryEvaluationId && body.claimBoundaryRulesetId && eventDiscriminator, "claim set publication references are required");
  const claimIds = body.claims.map(x => x.claimId);
  required(new Set(claimIds).size === claimIds.length, "claim identities must be distinct");
  required(body.segmentLinks.length === body.claims.length && body.segmentLinks.every(x => claimIds.includes(x.claimId)), "each claim requires one segment link");
  return freeze({ ...body, claimIds, governedClaimSetId: lineageIdentity("governed-claim-set", { ...body, claimIds, eventDiscriminator }) });
}

export const claimBoundaryInputDigest = (input: unknown): string => digest(input);
