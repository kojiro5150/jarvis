import type { CalendarFreeTimeResult } from "./calendar-free-time";

const day = new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Melbourne", weekday: "long", day: "numeric", month: "long" });
const time = new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Melbourne", hour: "numeric", minute: "2-digit", hour12: true });

export function renderCalendarFreeTime(result: CalendarFreeTimeResult): string {
  if (result.status === "rejected") {
    if (result.reason === "calendar_incomplete") return "I can't truthfully calculate your free time because this bounded Calendar read was not complete.";
    if (result.reason === "calendar_unavailable") return "I couldn't retrieve the governed Calendar evidence needed to calculate your free time.";
    if (result.reason === "weekend_preference_missing") return "I don't have an explicit current user-authored weekend work-availability preference to use.";
    return "I couldn't safely calculate your free time because the governed Calendar evidence contained an invalid interval.";
  }
  const scope = result.includeWeekend
    ? "your remembered discretionary work-availability windows (weekdays 6:00 PM–9:00 PM; weekends 8:00 AM–6:00 PM, Melbourne time)"
    : "your remembered discretionary work-availability window (weekdays 6:00 PM–9:00 PM, Melbourne time)";
  if (result.slots.length === 0) return `I found no remaining available discretionary time this week within ${scope}.`;
  const lines = result.slots.map(slot => `- ${day.format(new Date(slot.start))}, ${time.format(new Date(slot.start))}–${time.format(new Date(slot.end))}`);
  return [
    `Available discretionary time this week within ${scope}:`,
    ...lines,
    result.includeWeekend ? "Weekend time uses your remembered 8:00 AM–6:00 PM preference because you explicitly requested it." : "Weekends are excluded by your remembered preference.",
  ].join("\n");
}
