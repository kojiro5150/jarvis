export const CALENDAR_TIME_ZONE = "Australia/Melbourne" as const;
export const DEFAULT_CALENDAR_READ_DAYS = 7;

export type CalendarReadPeriod =
  | "today" | "tomorrow" | "this_morning" | "this_afternoon" | "this_evening" | "this_week" | "next_week" | "default";

export type CalendarReadWindow = Readonly<{
  start: string;
  end: string;
  timeZone: typeof CALENDAR_TIME_ZONE;
  period: CalendarReadPeriod;
}>;

type LocalDateTime = { year: number; month: number; day: number; hour: number; minute: number; second: number };

const partsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: CALENDAR_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
});

function localParts(date: Date): LocalDateTime {
  const values = Object.fromEntries(partsFormatter.formatToParts(date)
    .filter(({ type }) => type !== "literal").map(({ type, value }) => [type, Number(value)]));
  return values as LocalDateTime;
}

function localDateTimeToInstant(value: LocalDateTime): Date {
  const nominal = Date.UTC(value.year, value.month - 1, value.day, value.hour, value.minute, value.second);
  let candidate = nominal;
  // Iteration obtains the zone offset at the target instant and works on both
  // sides of Melbourne's daylight-saving transitions.
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const actual = localParts(new Date(candidate));
    const represented = Date.UTC(actual.year, actual.month - 1, actual.day, actual.hour, actual.minute, actual.second);
    const next = candidate + nominal - represented;
    if (next === candidate) break;
    candidate = next;
  }
  return new Date(candidate);
}

function shiftDate(date: Pick<LocalDateTime, "year" | "month" | "day">, days: number) {
  const shifted = new Date(Date.UTC(date.year, date.month - 1, date.day + days));
  return { year: shifted.getUTCFullYear(), month: shifted.getUTCMonth() + 1, day: shifted.getUTCDate() };
}

function boundary(date: Pick<LocalDateTime, "year" | "month" | "day">, hour = 0): Date {
  return localDateTimeToInstant({ ...date, hour, minute: 0, second: 0 });
}

/** Resolves only the deliberately closed set of Melbourne-local periods. */
export function resolveCalendarReadWindow(period: CalendarReadPeriod, now: Date): CalendarReadWindow {
  if (!Number.isFinite(now.getTime())) throw new Error("calendar read clock is invalid");
  if (period === "default") {
    return Object.freeze({ start: now.toISOString(), end: new Date(now.getTime() + DEFAULT_CALENDAR_READ_DAYS * 86_400_000).toISOString(),
      timeZone: CALENDAR_TIME_ZONE, period });
  }
  const local = localParts(now);
  const today = { year: local.year, month: local.month, day: local.day };
  let start: Date;
  let end: Date;
  if (period === "tomorrow") {
    const tomorrow = shiftDate(today, 1);
    start = boundary(tomorrow); end = boundary(shiftDate(today, 2));
  } else if (period === "this_week" || period === "next_week") {
    const weekdayName = new Intl.DateTimeFormat("en-US", { timeZone: CALENDAR_TIME_ZONE, weekday: "short" }).format(now);
    const index = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(weekdayName);
    const thisMonday = shiftDate(today, -index);
    const monday = period === "next_week" ? shiftDate(thisMonday, 7) : thisMonday;
    start = boundary(monday); end = boundary(shiftDate(monday, 7));
  } else {
    const hours: Record<Exclude<CalendarReadPeriod, "tomorrow" | "this_week" | "next_week" | "default">, [number, number]> = {
      today: [0, 24], this_morning: [0, 12], this_afternoon: [12, 17], this_evening: [17, 24],
    };
    const [startHour, endHour] = hours[period];
    start = boundary(today, startHour);
    end = endHour === 24 ? boundary(shiftDate(today, 1)) : boundary(today, endHour);
  }
  return Object.freeze({ start: start.toISOString(), end: end.toISOString(), timeZone: CALENDAR_TIME_ZONE, period });
}
