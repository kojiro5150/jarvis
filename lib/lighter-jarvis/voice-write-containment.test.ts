import { describe, expect, it, vi } from "vitest";
import type { CalendarEvent } from "../connectors/calendar-event";
import type { CalendarEventWritePort } from "../connectors/google/calendar-write";
import type { ScopedCalendarAcquisitionPort } from "../governed-conversation/scoped-calendar-evidence-acquisition-adapter";
import type { DurablePurposeProjectionResult } from "../operating-picture/purpose-projection-retrieval";
import { createProductGapResolutionTargetReference } from "../operating-picture/product-gap-resolution-reference";
import { createLighterChatHandler, TYPED_WRITE_CONFIRMATION_REQUIRED_REPLY } from "./chat-handler";
import { createCalendarMoveAuthorizationReference } from "./calendar-move-authorization";
import { createCalendarMoveProposalReference } from "./calendar-move-proposal-reference";

const request = (
  content: string,
  inputModality: "typed" | "voice" | "action" | undefined,
  extra: Record<string, unknown> = {},
) => new Request("http://localhost/api/lighter/chat", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    specialistId: "jarvis",
    ...(inputModality === undefined ? {} : { inputModality }),
    messages: [{ role: "user", content }],
    ...extra,
  }),
});

const noopModel = vi.fn(async () => "ordinary model must not run");

function captureDependencies() {
  const persist = vi.fn(async () => ({
    status: "persisted" as const,
    recordId: "capture:1",
    versionId: "capture:v1",
  }));
  return {
    persist,
    dependencies: {
      clock: () => new Date("2026-09-19T10:00:00.000Z"),
      classify: async () => ({
        status: "classified" as const,
        classification: {
          responseType: "user_continuity_capture_classification" as const,
          status: "classified" as const,
          semanticClass: "preference" as const,
        },
      }),
      persist,
    },
  };
}

const baseGap = Object.freeze({
  recordId: "gap:one",
  versionId: "gap:one:head",
  purpose: "conversation",
  semanticClass: "user_assertion" as const,
  lifecycle: "current" as const,
  recoveryDisposition: "recoverable_user_continuity" as const,
  subject: Object.freeze({
    namespace: "user_continuity",
    entity: "gap:one",
    attribute: "user_assertion",
    revision: "append_only" as const,
  }),
  payload: Object.freeze({ statement: "JARVIS product gap — test target." }),
  visibilityPurposes: Object.freeze(["conversation"]),
  validFrom: null,
  validUntil: null,
  staleAfter: null,
  authorshipSource: "user" as const,
  authorshipAt: "2026-09-19T09:00:00.000Z",
});

function resolutionProjection(): Extract<DurablePurposeProjectionResult, { status: "projected" }> {
  return Object.freeze({
    status: "projected",
    purpose: "conversation",
    items: Object.freeze([baseGap]),
    decisions: Object.freeze([]),
  });
}

const wrongGap = Object.freeze({
  ...baseGap,
  recordId: "gap:wrong",
  versionId: "gap:wrong:head",
  payload: Object.freeze({ statement: "JARVIS product gap — wrong diagnosis." }),
});
const rightGap = Object.freeze({
  ...baseGap,
  recordId: "gap:right",
  versionId: "gap:right:head",
  payload: Object.freeze({ statement: "JARVIS product gap — correct diagnosis." }),
});

function supersessionProjection(): Extract<DurablePurposeProjectionResult, { status: "projected" }> {
  const resolved = Object.freeze({
    ...rightGap,
    recordId: "resolution:right",
    versionId: "resolution:right:head",
    semanticClass: "decision" as const,
    subject: Object.freeze({
      namespace: "product_gap_resolution",
      entity: rightGap.recordId,
      attribute: "status",
      revision: "append_only" as const,
    }),
    payload: Object.freeze({ status: "resolved", targetRecordId: rightGap.recordId }),
  });
  return Object.freeze({
    status: "projected",
    purpose: "conversation",
    items: Object.freeze([wrongGap, rightGap, resolved]),
    decisions: Object.freeze([]),
  });
}

const calendarSource: CalendarEvent = {
  id: "deep",
  title: "hidden",
  start: "2026-09-19T09:00:00.000Z",
  end: "2026-09-19T10:30:00.000Z",
  day: "SAT",
  time: "19:00",
  source: "google",
  calendarId: "primary",
  calendarName: "Private",
  timeMode: "deep_work",
};

function calendarAuthorization() {
  const proposal = createCalendarMoveProposalReference({
    commitmentReference: "google-calendar:calendar:primary:event:deep",
    calendarId: "primary",
    eventId: "deep",
    expectedStart: calendarSource.start,
    expectedEnd: calendarSource.end,
    targetStart: "2026-09-19T10:30:00.000Z",
    targetEnd: "2026-09-19T12:00:00.000Z",
    durationMinutes: 90,
    observedAt: "2026-09-19T08:00:00.000Z",
  });
  return createCalendarMoveAuthorizationReference(proposal);
}

function calendarRead(): ScopedCalendarAcquisitionPort {
  return {
    source: "google",
    listBetween: vi.fn(async () => [calendarSource]),
    listBetweenWithCompleteness: vi.fn<
      NonNullable<ScopedCalendarAcquisitionPort["listBetweenWithCompleteness"]>
    >(async (start, end, limit = 100) => ({
      events: [calendarSource],
      completeness: {
        sourceId: "google-calendar",
        windowStart: start,
        windowEnd: end,
        requestedLimit: limit,
        targetDiscovery: "calendar_list",
        targetCount: 1,
        targets: [{
          calendarId: "primary",
          status: "complete",
          returnedCount: 1,
          continuation: "none",
        }],
        mergedReturnedCount: 1,
        mergeTruncated: false,
        completeness: "complete",
        observedAt: "2026-09-19T08:10:00.000Z",
      },
    })),
  };
}

describe("ADR-0027 D5 voice write containment", () => {
  it.each(["voice", "action", undefined] as const)(
    "contains continuity capture for non-typed modality %s",
    async inputModality => {
      const { persist, dependencies } = captureDependencies();
      const handler = createLighterChatHandler(
        noopModel, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, dependencies,
      );
      const response = await handler(request(
        "Remember that I prefer short status updates.",
        inputModality,
      ));
      expect(await response.json()).toMatchObject({
        reply: TYPED_WRITE_CONFIRMATION_REQUIRED_REPLY,
        execution: "none",
      });
      expect(persist).not.toHaveBeenCalled();
    },
  );

  it("allows the same continuity capture when repeated as typed", async () => {
    const { persist, dependencies } = captureDependencies();
    const handler = createLighterChatHandler(
      noopModel, undefined, undefined, undefined, undefined, undefined,
      undefined, undefined, dependencies,
    );
    await handler(request("Remember that I prefer short status updates.", "voice"));
    const typed = await handler(request("Remember that I prefer short status updates.", "typed"));
    expect(await typed.json()).toMatchObject({
      reply: "Remembered.",
      userContinuityCapture: { status: "persisted" },
    });
    expect(persist).toHaveBeenCalledOnce();
  });

  it.each(["voice", "action", undefined] as const)(
    "does not consume Product Gap resolution target for non-typed modality %s",
    async inputModality => {
      const appendVersion = vi.fn(async version => ({ status: "appended" as const, version }));
      const dependencies = {
        clock: () => new Date("2026-09-19T10:00:00.000Z"),
        retrieveProjection: async () => resolutionProjection(),
        appendVersion,
      };
      const target = createProductGapResolutionTargetReference({
        target: { recordId: "gap:one", versionId: "gap:one:head" },
        now: dependencies.clock(),
      });
      const handler = createLighterChatHandler(
        noopModel, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, undefined, dependencies,
      );
      const blocked = await handler(request("Mark this product gap as resolved.", inputModality, {
        productGapResolutionTargetReference: target,
      }));
      expect(await blocked.json()).toMatchObject({
        reply: TYPED_WRITE_CONFIRMATION_REQUIRED_REPLY,
        productGapResolutionTargetReference: target,
      });
      expect(appendVersion).not.toHaveBeenCalled();

      const typed = await handler(request("Mark this product gap as resolved.", "typed", {
        productGapResolutionTargetReference: target,
      }));
      expect(await typed.json()).toMatchObject({
        productGapResolution: { status: "persisted" },
        productGapResolutionTargetReference: null,
      });
      expect(appendVersion).toHaveBeenCalledOnce();
    },
  );

  it.each(["voice", "action", undefined] as const)(
    "does not consume Product Gap supersession pair for non-typed modality %s",
    async inputModality => {
      const appendVersion = vi.fn(async version => ({ status: "appended" as const, version }));
      const dependencies = {
        clock: () => new Date("2026-09-19T10:00:00.000Z"),
        retrieveProjection: async () => supersessionProjection(),
        appendVersion,
      };
      const handler = createLighterChatHandler(
        noopModel, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, undefined, undefined, undefined, undefined,
        dependencies,
      );
      const listed = await (await handler(request(
        "Show me the active JARVIS product gaps for supersession.", "typed",
      ))).json();
      const targeted = await (await handler(request(
        "Select product gap 1 for supersession.", "typed",
        { productGapSupersessionReference: listed.productGapSupersessionReference },
      ))).json();
      const successor = await (await handler(request(
        "Select product gap 1 as successor.", "typed",
        { productGapSupersessionReference: targeted.productGapSupersessionReference },
      ))).json();

      const blocked = await handler(request(
        "Mark this product gap as superseded.", inputModality,
        { productGapSupersessionReference: successor.productGapSupersessionReference },
      ));
      expect(await blocked.json()).toMatchObject({
        reply: TYPED_WRITE_CONFIRMATION_REQUIRED_REPLY,
        productGapSupersessionReference: successor.productGapSupersessionReference,
      });
      expect(appendVersion).not.toHaveBeenCalled();

      const typed = await handler(request(
        "Mark this product gap as superseded.", "typed",
        { productGapSupersessionReference: successor.productGapSupersessionReference },
      ));
      expect(await typed.json()).toMatchObject({
        productGapSupersession: { status: "persisted" },
        productGapSupersessionReference: null,
      });
      expect(appendVersion).toHaveBeenCalledOnce();
    },
  );

  it.each(["voice", "action", undefined] as const)(
    "does not consume Calendar move authorization for non-typed modality %s",
    async inputModality => {
      const authorization = calendarAuthorization();
      const moveEvent = vi.fn<CalendarEventWritePort["moveEvent"]>(async () => ({ ok: true, status: 200 }));
      const writeConnector: CalendarEventWritePort = {
        hasWriteScope: vi.fn(async () => true),
        moveEvent,
        readEvent: vi.fn(async () => ({
          ...calendarSource,
          start: "2026-09-19T20:30:00+10:00",
          end: "2026-09-19T22:00:00+10:00",
        })),
      };
      const act = {
        createReadConnector: () => calendarRead(),
        createWriteConnector: () => writeConnector,
        hasWriteScope: async () => true,
        clock: () => new Date("2026-09-19T08:10:00.000Z"),
      };
      const handler = createLighterChatHandler(
        noopModel, undefined, undefined, undefined, undefined, undefined, act,
      );

      const blocked = await handler(request("Yes.", inputModality, {
        calendarMoveAuthorizationReference: authorization,
      }));
      expect(await blocked.json()).toMatchObject({
        reply: TYPED_WRITE_CONFIRMATION_REQUIRED_REPLY,
        execution: "none",
        calendarMoveAuthorizationReference: authorization,
      });
      expect(moveEvent).not.toHaveBeenCalled();

      const typed = await handler(request("Yes.", "typed", {
        calendarMoveAuthorizationReference: authorization,
      }));
      expect(await typed.json()).toMatchObject({
        execution: "calendar.event.move",
        calendarConflictAct: { status: "resolved" },
        calendarMoveAuthorizationReference: null,
      });
      expect(moveEvent).toHaveBeenCalledOnce();
    },
  );
});
