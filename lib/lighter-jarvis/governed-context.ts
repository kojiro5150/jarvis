import type { CalendarContextSource } from "./calendar-governed-context";

export type GovernedContextSource = CalendarContextSource;

/** Server-created, current-turn evidence supplied separately from chat history. */
export type GovernedContext = Readonly<{
  version: "1";
  sources: readonly GovernedContextSource[];
}>;

export function createGovernedContext(source: CalendarContextSource): GovernedContext {
  return Object.freeze({ version: "1", sources: Object.freeze([source]) });
}
