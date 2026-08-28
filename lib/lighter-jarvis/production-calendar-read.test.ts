import { describe, expect, it, vi } from "vitest";
import { resolveProductionCalendarRead } from "./production-calendar-read";

const event = { id: "event-1", title: "Review", start: "2026-08-26T09:00:00Z",
  end: "2026-08-26T10:00:00Z", day: "WED", time: "09:00", source: "google" as const,
  calendarId: "primary", calendarName: "Work" };

function dependencies() {
  const listUpcoming = vi.fn(async () => [event]);
  const listBetween = vi.fn(async () => [event]);
  const createConnector = vi.fn(() => ({ source: "google" as const, listUpcoming, listBetween }));
  return { value: { createConnector, clock: () => new Date("2026-08-25T00:00:00Z") }, createConnector, listUpcoming, listBetween };
}

describe("production calendar.read authority ordering", () => {
  it("acquires through the governed seam after an explicit ALLOW", async () => {
    const deps = dependencies();
    const result = await resolveProductionCalendarRead({ currentUserUtterance: "Show my calendar" }, deps.value);
    expect(result.decision).toBe("ALLOW");
    expect(result.evidence?.status).toBe("available");
    expect(deps.listBetween).toHaveBeenCalledWith("2026-08-25T00:00:00.000Z", "2026-09-01T00:00:00.000Z", 5);
  });

  it("creates pending server state for ASK without constructing or calling a connector", async () => {
    const deps = dependencies();
    const result = await resolveProductionCalendarRead({ currentUserUtterance: "How does tomorrow look?" }, deps.value);
    expect(result).toMatchObject({ decision: "ASK", evidence: null,
      pendingAuthorizationReference: { pendingAuthorizationId: expect.any(String) } });
    expect(deps.createConnector).not.toHaveBeenCalled();
    expect(deps.listUpcoming).not.toHaveBeenCalled();
  });

  it("resolves the exact pending operation before acquiring", async () => {
    const deps = dependencies();
    const pending = await resolveProductionCalendarRead({ currentUserUtterance: "How does tomorrow look?" }, deps.value);
    const confirmed = await resolveProductionCalendarRead({ currentUserUtterance: "Yes, please.",
      pendingAuthorizationReference: pending.pendingAuthorizationReference }, deps.value);
    expect(confirmed).toMatchObject({ decision: "ALLOW", reason: "pending_authorization_confirmed" });
    expect(confirmed.authorityEvidence).toEqual([expect.objectContaining({
      source: "pending_authorization_confirmation",
      pendingAuthorizationId: pending.pendingAuthorizationReference!.pendingAuthorizationId,
      utterance: "Yes, please.",
    })]);
    expect(deps.listBetween).toHaveBeenCalledOnce();
  });

  it("proposes an implicit temporal read but asks rather than acquiring", async () => {
    const deps = dependencies();
    const result = await resolveProductionCalendarRead({ currentUserUtterance: "How does tomorrow look?" }, deps.value);
    expect(result).toMatchObject({ decision: "ASK", authorityEvidence: [] });
    expect(deps.createConnector).not.toHaveBeenCalled();
  });

  it("retains and consumes the exact resolved temporal bounds after confirmation", async () => {
    const deps = dependencies();
    const pending = await resolveProductionCalendarRead({ currentUserUtterance: "What's on tomorrow?" }, deps.value);
    expect(pending.window).toMatchObject({
      start: "2026-08-25T14:00:00.000Z", end: "2026-08-26T14:00:00.000Z", period: "tomorrow",
    });
    await resolveProductionCalendarRead({ currentUserUtterance: "yes",
      pendingAuthorizationReference: pending.pendingAuthorizationReference }, deps.value);
    expect(deps.listBetween).toHaveBeenCalledWith(
      "2026-08-25T14:00:00.000Z", "2026-08-26T14:00:00.000Z", 5,
    );
  });


  it("carries a complete governed weekly allocation through the production read result", async () => {
    const weeklyEvents = [
      {
        ...event,
        id: "routine",
        start: "2026-08-24T09:00:00Z",
        end: "2026-08-24T16:00:00Z",
        timeMode: "routine" as const,
      },
      {
        ...event,
        id: "self-care",
        start: "2026-08-24T12:00:00Z",
        end: "2026-08-24T13:00:00Z",
        timeMode: "self_care" as const,
      },
    ];
    const listBetween = vi.fn();
    const listBetweenWithCompleteness = vi.fn(async (start: string, end: string) => ({
      events: weeklyEvents,
      completeness: {
        sourceId: "google-calendar" as const,
        windowStart: start,
        windowEnd: end,
        requestedLimit: 5,
        targetDiscovery: "calendar_list" as const,
        targetCount: 1,
        targets: [{
          calendarId: "primary",
          status: "complete" as const,
          returnedCount: 2,
          continuation: "none" as const,
        }],
        mergedReturnedCount: 2,
        mergeTruncated: false,
        completeness: "complete" as const,
        observedAt: "2026-08-25T00:00:00.000Z",
      },
    }));
    const deps = {
      createConnector: () => ({
        source: "google" as const,
        listBetween,
        listBetweenWithCompleteness,
      }),
      clock: () => new Date("2026-08-25T00:00:00Z"),
    };

    const pending = await resolveProductionCalendarRead({
      currentUserUtterance: "How does this week look?",
    }, deps);
    const confirmed = await resolveProductionCalendarRead({
      currentUserUtterance: "yes",
      pendingAuthorizationReference: pending.pendingAuthorizationReference,
    }, deps);

    expect(confirmed).toMatchObject({
      decision: "ALLOW",
      window: { period: "this_week" },
      evidence: {
        coverageState: "bounded_complete_request",
        weeklyAllocation: {
          publicationType: "calendar_weekly_time_allocation",
          minutesByMode: { routine: 360, self_care: 60 },
          totalTimedMinutes: 420,
        },
      },
    });
  });

  it("retains weekly allocation purpose through pending confirmation", async () => {
    const deps = dependencies();
    const pending = await resolveProductionCalendarRead({
      currentUserUtterance: "How is my week allocated?",
    }, deps.value);

    expect(pending).toMatchObject({
      decision: "ASK",
      purpose: "calendar_weekly_allocation",
      window: { period: "this_week" },
      pendingAuthorizationReference: { pendingAuthorizationId: expect.any(String) },
    });
    expect(deps.createConnector).not.toHaveBeenCalled();

    const confirmed = await resolveProductionCalendarRead({
      currentUserUtterance: "Yes",
      pendingAuthorizationReference: pending.pendingAuthorizationReference,
    }, deps.value);

    expect(confirmed).toMatchObject({
      decision: "ALLOW",
      purpose: "calendar_weekly_allocation",
      window: { period: "this_week" },
    });
  });

  it("retains next-week allocation bounds and uses the larger bounded weekly limit after confirmation", async () => {
    const deps = dependencies();
    const pending = await resolveProductionCalendarRead({
      currentUserUtterance: "How is next week allocated?",
    }, {
      ...deps.value,
      clock: () => new Date("2026-08-28T08:00:00.000Z"),
    });

    expect(pending).toMatchObject({
      decision: "ASK",
      purpose: "calendar_weekly_allocation",
      window: {
        period: "next_week",
        start: "2026-08-30T14:00:00.000Z",
        end: "2026-09-06T14:00:00.000Z",
      },
    });

    await resolveProductionCalendarRead({
      currentUserUtterance: "Yes",
      pendingAuthorizationReference: pending.pendingAuthorizationReference,
    }, {
      ...deps.value,
      clock: () => new Date("2026-08-28T08:00:00.000Z"),
    });

    expect(deps.listBetween).toHaveBeenCalledWith(
      "2026-08-30T14:00:00.000Z",
      "2026-09-06T14:00:00.000Z",
      100,
    );
  });

  it("retains a factual selector through pending confirmation and uses the bounded factual limit", async () => {
    const deps = dependencies();
    const pending = await resolveProductionCalendarRead({
      currentUserUtterance: "What time is the interview on Tuesday?",
    }, {
      ...deps.value,
      clock: () => new Date("2026-08-28T09:00:00.000Z"),
    });

    expect(pending).toMatchObject({
      decision: "ASK",
      purpose: "calendar_factual_query",
      factualQuery: {
        kind: "title_match_on_weekday",
        terms: ["interview"],
        weekday: "tuesday",
      },
      window: {
        period: "default",
        start: "2026-08-28T09:00:00.000Z",
        end: "2026-09-04T09:00:00.000Z",
      },
    });

    const confirmed = await resolveProductionCalendarRead({
      currentUserUtterance: "Yes",
      pendingAuthorizationReference: pending.pendingAuthorizationReference,
    }, {
      ...deps.value,
      clock: () => new Date("2026-08-28T09:00:00.000Z"),
    });

    expect(confirmed).toMatchObject({
      decision: "ALLOW",
      purpose: "calendar_factual_query",
      factualQuery: {
        kind: "title_match_on_weekday",
        terms: ["interview"],
        weekday: "tuesday",
      },
    });
    expect(deps.listBetween).toHaveBeenCalledWith(
      "2026-08-28T09:00:00.000Z",
      "2026-09-04T09:00:00.000Z",
      100,
    );
  });

  it("leaves bare confirmation outside the Calendar authority flow", async () => {
    const deps = dependencies();
    expect(await resolveProductionCalendarRead({ currentUserUtterance: "yes" }, deps.value))
      .toMatchObject({ handled: false, decision: null });
    expect(deps.createConnector).not.toHaveBeenCalled();
  });

  it("does zero acquisition for an invalid reference", async () => {
    const deps = dependencies();
    expect((await resolveProductionCalendarRead({ currentUserUtterance: "yes",
      pendingAuthorizationReference: { pendingAuthorizationId: "invented" } }, deps.value)).decision).toBe("ASK");
    expect(deps.createConnector).not.toHaveBeenCalled();
    expect(deps.listUpcoming).not.toHaveBeenCalled();
  });

  it("does zero acquisition after DENY", async () => {
    const deps = dependencies();
    const pending = await resolveProductionCalendarRead({ currentUserUtterance: "How does tomorrow look?" }, deps.value);
    expect((await resolveProductionCalendarRead({ currentUserUtterance: "no",
      pendingAuthorizationReference: pending.pendingAuthorizationReference }, deps.value)).decision).toBe("DENY");
    expect(deps.createConnector).not.toHaveBeenCalled();
  });
  it("retains Calendar attention purpose through pending confirmation before acquisition", async () => {
    const deps = dependencies();
    const pending = await resolveProductionCalendarRead({
      currentUserUtterance: "What needs my attention?",
    }, deps.value);

    expect(pending).toMatchObject({
      decision: "ASK",
      purpose: "calendar_attention",
      window: { period: "today" },
      pendingAuthorizationReference: { pendingAuthorizationId: expect.any(String) },
    });
    expect(deps.createConnector).not.toHaveBeenCalled();

    const confirmed = await resolveProductionCalendarRead({
      currentUserUtterance: "Yes",
      pendingAuthorizationReference: pending.pendingAuthorizationReference,
    }, deps.value);

    expect(confirmed).toMatchObject({
      decision: "ALLOW",
      purpose: "calendar_attention",
      window: { period: "today" },
    });
    expect(deps.listBetween).toHaveBeenCalledOnce();
  });
});
