import type { MorningExecutiveOrientationBrief } from "./morning-executive-orientation-contract";

type BriefKeys = keyof MorningExecutiveOrientationBrief;
type TodayEvent = MorningExecutiveOrientationBrief["today"]["timedCommitments"][number];
type WeeklyPeriod = MorningExecutiveOrientationBrief["weeklyCapacity"]["period"];
type CoverageState = MorningExecutiveOrientationBrief["coverage"]["state"];

const _weeklyPeriod: WeeklyPeriod = "this_week";
const _coverageState: CoverageState = "bounded_complete_request";

// The first Morning Brief contract has no slots that could smuggle higher-level
// interpretation, recommendation, ambient memory, or cross-source synthesis.
// @ts-expect-error priority is deliberately absent from the Level-1 publication
const _priority: BriefKeys = "priority";
// @ts-expect-error urgency is deliberately absent from the Level-1 publication
const _urgency: BriefKeys = "urgency";
// @ts-expect-error recommendation is deliberately absent from the Level-1 publication
const _recommendation: BriefKeys = "recommendation";
// @ts-expect-error continuity is deliberately absent from the Level-1 publication
const _continuity: BriefKeys = "continuity";
// @ts-expect-error Gmail is deliberately absent from the Level-1 publication
const _gmail: BriefKeys = "gmail";
// @ts-expect-error Drive is deliberately absent from the Level-1 publication
const _drive: BriefKeys = "drive";
// @ts-expect-error supported-change comparison is deferred from the first factual publication
const _supportedChanges: BriefKeys = "supportedChanges";

// The factual day surface retains only the already-governed factual projection.
// @ts-expect-error provider identity is not admitted into the Morning Brief event slot
const _providerId: keyof TodayEvent = "id";
// @ts-expect-error timeMode is not admitted into the factual day item
const _timeMode: keyof TodayEvent = "timeMode";
// @ts-expect-error attendee state is not admitted into the factual day item
const _attendee: keyof TodayEvent = "selfAttendeeResponse";

void [
  _weeklyPeriod, _coverageState, _priority, _urgency, _recommendation,
  _continuity, _gmail, _drive, _supportedChanges, _providerId, _timeMode, _attendee,
];
