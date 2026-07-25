/**
 * @deprecated Superseded by lib/memory/ (schema.ts + seed.ts + store.ts)
 * and lib/connectors/ (calendar.ts, gmail.ts, drive.ts). Nothing in this
 * app imports from this file anymore — it's kept only so an old import
 * doesn't hard-fail if something external still references it. Re-exports
 * from the new location; don't add new data here, add it to
 * lib/memory/seed.ts instead.
 */
export type { Priority, ProjectStatus, Signal } from "./memory/schema";
export type { CalendarEventRecord as CalendarEvent } from "./connectors/types";
export { SEED_MEMORY } from "./memory/seed";

import { SEED_MEMORY } from "./memory/seed";

export const PRIORITIES = SEED_MEMORY.priorities;
export const PROJECTS = SEED_MEMORY.projects;
export const SIGNALS = SEED_MEMORY.signals;
export const CALENDAR_EVENTS = SEED_MEMORY.calendar;
