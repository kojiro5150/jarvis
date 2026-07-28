import { createHash } from "node:crypto";
import {
  EXECUTIVE_CONTEXT_CONTRACT_VERSION, EXECUTIVE_CONTEXT_ENGINE_VERSION,
  EXECUTIVE_CONTEXT_RULE_VERSION,
} from "./types";

export function compareCodeUnits(left: string, right: string): number { return left < right ? -1 : left > right ? 1 : 0; }

export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort(compareCodeUnits).map((key) => `${JSON.stringify(key)}:${canonicalJson((value as Record<string, unknown>)[key])}`).join(",")}}`;
  return JSON.stringify(value);
}

export function stableIdentity(kind: string, value: unknown): string {
  return `${kind}:${createHash("sha256").update(canonicalJson(value), "utf8").digest("hex")}`;
}

export function executiveContextIdentity(sourceSnapshotId: string, referenceTime: string): string {
  return stableIdentity("executive-context", {
    sourceSnapshotId, referenceTime,
    contractVersion: EXECUTIVE_CONTEXT_CONTRACT_VERSION,
    engineVersion: EXECUTIVE_CONTEXT_ENGINE_VERSION,
    ruleVersion: EXECUTIVE_CONTEXT_RULE_VERSION,
  });
}
