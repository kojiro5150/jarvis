import type { ProjectionAdapter } from "./types";

/** An explicit adapter registry whose enumeration is independent of registration order. */
export class ProjectionRegistry {
  readonly #adapters = new Map<string, ProjectionAdapter>();

  register(adapter: ProjectionAdapter): void {
    if (!adapter || typeof adapter !== "object" || typeof adapter.project !== "function") {
      throw new Error("projection adapter must implement project()");
    }
    if (typeof adapter.id !== "string" || adapter.id.trim().length === 0) {
      throw new Error("projection adapter id must be a non-empty string");
    }
    if (this.#adapters.has(adapter.id)) throw new Error(`duplicate projection adapter: ${adapter.id}`);
    this.#adapters.set(adapter.id, adapter);
  }

  remove(adapterId: string): boolean { return this.#adapters.delete(adapterId); }

  adapters(): readonly ProjectionAdapter[] {
    return Object.freeze([...this.#adapters.values()].sort((left, right) => left.id < right.id ? -1 : left.id > right.id ? 1 : 0));
  }
}
