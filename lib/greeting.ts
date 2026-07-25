/** Single source of truth for the time-of-day greeting — used by TopBar and lib/briefing.ts. */
export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
