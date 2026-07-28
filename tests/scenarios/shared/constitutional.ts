import type { ExecutiveScenario } from "./types";

export function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Reflect.ownKeys(value).forEach((key) => deepFreeze((value as Record<PropertyKey, unknown>)[key]));
    Object.freeze(value);
  }
  return value;
}

export function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isJsonValue(value: unknown, active = new Set<object>()): boolean {
  if (value === null || ["string", "boolean"].includes(typeof value)) return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value !== "object") return false;
  if (active.has(value)) return false;
  active.add(value);
  const valid = Array.isArray(value)
    ? value.every((item) => isJsonValue(item, active))
    : Object.getPrototypeOf(value) === Object.prototype &&
      Object.values(value).every((item) => isJsonValue(item, active));
  active.delete(value);
  return valid;
}

export function validateExecutiveScenario(value: unknown): asserts value is ExecutiveScenario {
  if (!value || typeof value !== "object") throw new Error("scenario must be an object");
  const scenario = value as ExecutiveScenario;
  if (!scenario.metadata || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(scenario.metadata.id))
    throw new Error("scenario metadata.id must be a canonical identifier");
  if (!scenario.metadata.title || !scenario.metadata.description || !Number.isInteger(scenario.metadata.version) || scenario.metadata.version < 1)
    throw new Error(`scenario ${scenario.metadata.id} has invalid metadata`);
  if (!scenario.replayIdentity || !scenario.provenance?.fixture || !scenario.provenance.sourceSprint)
    throw new Error(`scenario ${scenario.metadata.id} requires provenance and replay identity`);
  if (!scenario.projectionArtifacts || !Array.isArray(scenario.projectionArtifacts.artifacts) || scenario.projectionArtifacts.artifacts.length === 0)
    throw new Error(`scenario ${scenario.metadata.id} requires projection artifacts`);
  if (!isJsonValue(scenario.projectionArtifacts))
    throw new Error(`scenario ${scenario.metadata.id} projection artifacts must be JSON-compatible`);
  if (!Array.isArray(scenario.assertions) || scenario.assertions.length === 0)
    throw new Error(`scenario ${scenario.metadata.id} requires assertions`);
  const assertionIds = new Set<string>();
  for (const assertion of scenario.assertions) {
    if (!assertion.id || !Array.isArray(assertion.path) || assertion.path.length === 0 || !assertion.path.every((part: unknown) => typeof part === "string" || (Number.isInteger(part) && (part as number) >= 0)) || !isJsonValue(assertion.expected))
      throw new Error(`scenario ${scenario.metadata.id} has an invalid assertion`);
    if (assertionIds.has(assertion.id)) throw new Error(`scenario ${scenario.metadata.id} has duplicate assertion ${assertion.id}`);
    assertionIds.add(assertion.id);
  }
}

/** Object keys are unordered; array order remains constitutionally significant. */
export function structurallyEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (Array.isArray(left) || Array.isArray(right))
    return Array.isArray(left) && Array.isArray(right) && left.length === right.length && left.every((item, index) => structurallyEqual(item, right[index]));
  if (!left || !right || typeof left !== "object" || typeof right !== "object") return false;
  const leftRecord = left as Record<string, unknown>, rightRecord = right as Record<string, unknown>;
  const leftKeys = Object.keys(leftRecord).sort(), rightKeys = Object.keys(rightRecord).sort();
  return leftKeys.length === rightKeys.length && leftKeys.every((key, index) => key === rightKeys[index] && structurallyEqual(leftRecord[key], rightRecord[key]));
}
