import { readGoogleTokens } from "./tokens";
import { CALENDAR_EVENTS_SCOPE } from "./oauth";

export async function hasGoogleCalendarWriteScope(): Promise<boolean> {
  const tokens = await readGoogleTokens();
  if (!tokens) return false;
  return new Set(tokens.scope.split(/\s+/).filter(Boolean)).has(CALENDAR_EVENTS_SCOPE);
}