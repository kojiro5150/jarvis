import { createHash } from "node:crypto";
import type { ExecutiveCapability, ExecutiveCapabilityRegistry } from "./types";

const idPattern = /^[a-z][a-z0-9-]*\.[a-z][a-z0-9-]*$/;
const versionPattern = /^\d+\.\d+\.\d+$/;
export const compareCodeUnits = (a: string, b: string): number => a < b ? -1 : a > b ? 1 : 0;
export function canonical(value: unknown): string { if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`; if (value && typeof value === "object") return `{${Object.keys(value).sort(compareCodeUnits).map(k => `${JSON.stringify(k)}:${canonical((value as Record<string, unknown>)[k])}`).join(",")}}`; return JSON.stringify(value); }
export function stableIdentity(prefix: string, value: unknown): string { return `${prefix}:${createHash("sha256").update(canonical(value)).digest("hex")}`; }
export function deepFreeze<T>(value: T, seen = new WeakSet<object>()): T { if (!value || typeof value !== "object" || seen.has(value)) return value; seen.add(value); Object.values(value as object).forEach(v => deepFreeze(v, seen)); return Object.freeze(value); }
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function validateCapability(capability: ExecutiveCapability, modules: ReadonlySet<string>): void {
  if (!idPattern.test(capability.capabilityId) || !versionPattern.test(capability.version)) throw new Error(`invalid capability identity or version: ${capability.capabilityId}`);
  if (!modules.has(capability.owningModuleId)) throw new Error(`unresolved module identity: ${capability.owningModuleId}`);
  if (!capability.displayName || !capability.description || !versionPattern.test(capability.requiredContextContract) || !Number.isInteger(capability.ordering?.precedence)) throw new Error(`invalid capability descriptor: ${capability.capabilityId}`);
  if (capability.requiredCapabilities.includes(capability.capabilityId) || capability.incompatibleCapabilities.includes(capability.capabilityId)) throw new Error(`contradictory self reference: ${capability.capabilityId}`);
}

/** Immutable, closed registry. It performs no discovery and exposes no mutation API. */
export class ImmutableExecutiveCapabilityRegistry implements ExecutiveCapabilityRegistry {
  readonly registryIdentity: string; readonly capabilities: readonly ExecutiveCapability[]; private readonly index: ReadonlyMap<string, ExecutiveCapability>;
  constructor(capabilities: readonly ExecutiveCapability[], moduleIds: readonly string[]) {
    const modules = new Set(moduleIds); if (modules.size !== moduleIds.length || modules.size === 0) throw new Error("module identities must be unique and non-empty");
    const copied: ExecutiveCapability[] = [...clone(capabilities)]; copied.forEach(c => validateCapability(c, modules)); copied.sort((a,b) => compareCodeUnits(a.capabilityId,b.capabilityId));
    if (copied.some((c,i) => copied[i-1]?.capabilityId === c.capabilityId)) throw new Error("duplicate capability identity");
    const ids = new Set(copied.map(c => c.capabilityId));
    for (const capability of copied) for (const reference of [...capability.requiredCapabilities,...capability.incompatibleCapabilities]) if (!ids.has(reference)) throw new Error(`invalid dependency or compatibility reference: ${reference}`);
    for (const capability of copied) for (const incompatible of capability.incompatibleCapabilities) { const peer = copied.find(c => c.capabilityId === incompatible)!; if (peer.requiredCapabilities.includes(capability.capabilityId) || capability.requiredCapabilities.includes(incompatible)) throw new Error(`contradictory compatibility rule: ${capability.capabilityId}`); }
    const visiting = new Set<string>(), visited = new Set<string>(); const visit = (id:string):void => { if(visiting.has(id)) throw new Error(`circular capability dependency: ${id}`); if(visited.has(id)) return; visiting.add(id); copied.find(c=>c.capabilityId===id)!.requiredCapabilities.forEach(visit); visiting.delete(id); visited.add(id); }; copied.forEach(c=>visit(c.capabilityId));
    this.capabilities=deepFreeze(copied); this.registryIdentity=stableIdentity("capability-registry",this.capabilities); this.index=new Map(this.capabilities.map(c=>[c.capabilityId,c])); Object.freeze(this);
  }
  get(capabilityId:string):ExecutiveCapability|undefined { return this.index.get(capabilityId); }
}
