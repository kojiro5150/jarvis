import { deepFreeze, validateExecutiveScenario } from "../shared/constitutional";
import type { ExecutiveScenario, ExecutiveScenarioRegistry } from "../shared/types";

const compareCodeUnits = (left: string, right: string): number => left < right ? -1 : left > right ? 1 : 0;

export class CanonicalExecutiveScenarioRegistry implements ExecutiveScenarioRegistry {
  private readonly scenarios: readonly ExecutiveScenario[];
  private readonly byId: ReadonlyMap<string, ExecutiveScenario>;

  constructor(registrations: readonly ExecutiveScenario[]) {
    registrations.forEach(validateExecutiveScenario);
    const ids = new Set<string>();
    registrations.forEach(({ metadata }) => {
      if (ids.has(metadata.id)) throw new Error(`duplicate executive scenario: ${metadata.id}`);
      ids.add(metadata.id);
    });
    this.scenarios = deepFreeze([...registrations].sort((a, b) => compareCodeUnits(a.metadata.id, b.metadata.id)));
    this.byId = new Map(this.scenarios.map((scenario) => [scenario.metadata.id, scenario]));
    Object.freeze(this);
  }

  list(): readonly ExecutiveScenario[] { return this.scenarios; }
  get(id: string): ExecutiveScenario | undefined { return this.byId.get(id); }
}
