import { ExecutiveContextEngine } from "./engine";
import type { ExecutiveContextDerivationInput, ExecutiveContextResult } from "./types";

/** Offline replay uses only the fixed, explicit derivation input. */
export function replayExecutiveContext(input: ExecutiveContextDerivationInput): ExecutiveContextResult {
  return new ExecutiveContextEngine().derive(input);
}
