// Isolated downstream adapter: it exposes the real Sprint 3.91 publication type
// and constructor without changing claims semantics or composing the engines.
export type { GovernedClaimSet } from "./claim-boundary-types";
export { constructGovernedClaimSet } from "./claim-boundary-publications";
