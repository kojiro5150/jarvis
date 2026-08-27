import { isAmbiguousPrivateReadFollowUp } from "./private-capability-handoff-guard";
import {
  attributeBareCalendarRecollection,
  attributeCalendarRecollection,
  rewriteFalseCalendarRereadOffer,
  displayCalendarClock,
  userSuppliedTimedCalendarDetail,
} from "./calendar-provenance-truthfulness";

/**
 * Ordinary model text is presentation, never authority machinery. Keep the
 * guard content-derived: neither the model nor the client may label text as a
 * genuine authority response.
 */
export const NEUTRALIZED_ORDINARY_AUTHORITY_REPLY =
  "That request cannot be authorized through an ordinary model response.";

export const UNSUPPORTED_CALENDAR_PATH_REPLY =
  "The governed Calendar path supports calendar.read, but it does not support this request.";

export const ORDINARY_CALENDAR_FACT_REPLY = "Thanks — I'll treat that as information you provided.";
export const CALENDAR_READ_TRUTHFULNESS_REPLY =
  "I haven't read your Calendar on this turn. Calendar reads are available through the governed path when explicitly authorized.";
export const UNSUPPORTED_CALENDAR_WRITE_REPLY =
  "I can help you work with the information here, but Calendar write/update actions are not available in the current governed path.";

export const UNSUPPORTED_GMAIL_PATH_REPLY =
  "The governed Gmail path supports gmail.search and identified-message gmail.read, but it does not support this request.";

export const UNSUPPORTED_DRIVE_PATH_REPLY =
  "The governed Drive path supports drive.search metadata and exact-command identified Google Docs drive.read; it does not support arbitrary Drive content requests.";

export const EXCLUDED_DRIVE_PROVENANCE_REPLY =
  "I can't represent a prior governed Drive result from ordinary model context.";

const INTERNAL_HISTORY_MARKERS = [
  "[Governed private result omitted from ordinary model context.]",
  "[Prior governed Gmail read request omitted from ordinary model context.]",
  "[Prior governed Drive read request omitted from ordinary model context.]",
  "[Prior governed Drive provider-ID follow-up omitted from ordinary model context.]",
] as const;

const PRIVATE_SOURCE = /\b(?:calendar|gmail|e-?mail|inbox|drive)\b/i;
const CONFIRMATION_REQUEST = /(?:\b(?:confirm|confirmation|permission|authorize|authorise|approval|consent)\b|\b(?:may|can)\s+I\b|\b(?:reply|respond|say)\s+["'“”]?(?:yes|confirm|approve|allow)\b)/i;
const PRIVATE_ACCESS = /\b(?:access|read|search|retrieve|check|view|show|look(?:ing)?\s+(?:at|through|in)|connect(?:ing)?\s+to)\b/i;
const CALENDAR_REQUEST = /\bcalendar\b/i;
const PRIVATE_ACQUISITION_UTTERANCE = /\bwhat(?:'s| is)\s+on\s+(?:for\s+)?(?:today|tomorrow)\b|\b(?:calendar|gmail|e-?mail|inbox|drive)\b[\s\S]*\b(?:read|search|retrieve|check|view|show|look|access|connect|what(?:'s| is)|on)\b|\b(?:read|search|retrieve|check|view|show|look|access|connect|what(?:'s| is))\b[\s\S]*\b(?:calendar|gmail|e-?mail|inbox|drive)\b/i;
const PROJECTED_FIELD_ABSENCE = /\b(?:the\s+)?(?:calendar entry|meeting|event)\s+(?:doesn['’]?t|does not)\s+include\s+(?:a\s+)?(?:label|title|description)(?:\s+or\s+(?:a\s+)?(?:label|title|description))?|\b(?:the\s+)?(?:meeting|event)\s+has\s+no\s+(?:title|label|description)(?:\s+in\s+the\s+calendar)?|\bthere\s+is\s+no\s+(?:title|label|description)\s+on\s+(?:the\s+)?(?:meeting|event)\b|\bI don['’]?t have any\s+(?:subject|title|description)(?:\s+or\s+(?:subject|title|description))*\s+information\s+visible\s+in\s+the\s+calendar\s+data\b/gi;
const UNSAFE_BOUND_DETAIL_RECALL = /(?:\bfrom the calendar information I have\b|\bbased on what['’]s visible in your calendar\b|\bcalendar evidence I have access to\b|\bavailable from (?:your|the) calendar\b|\bvisible in the calendar data\b)/i;
const GMAIL_REQUEST = /\b(?:gmail|e-?mail|emails|inbox|mailbox)\b/i;
const DRIVE_REQUEST = /\bdrive\b/i;
const FALSE_GLOBAL_CAPABILITY_CLAIM = /(?:\b(?:i\s+)?(?:do\s+not|don['’]?t|cannot|can['’]?t|am\s+not|I['’]?m\s+not|unable\s+to)\s+(?:(?:currently|directly)\s+)?(?:have\s+(?:(?:the|that|this|any)\s+)?(?:ability|capability|access)|access|connect(?:ed)?|read|search|retrieve|check|view)|\bno\s+(?:calendar|gmail|e-?mail|inbox|mailbox|drive)\s+(?:access|capability|integration)|\b(?:this|that|the)\s+capability\s+(?:does\s+not|doesn['’]?t)\s+exist|\b(?:calendar|gmail|e-?mail|inbox|mailbox|drive)\s+(?:is\s+not|isn['’]?t)\s+(?:connected|available|supported))/i;
const DRIVE_CAPABILITY_DENIAL = /\b(?:google\s+)?drive\b/i;
const EXPLICIT_DRIVE_PROVENANCE_CLAIMS = [
  /\byour Drive search returned\b/i,
  /\bearlier,? your Drive search returned\b/i,
  /\bthe Drive file I found was\b/i,
  /\bthe ID from the earlier Drive result was\b/i,
] as const;
const CONTEXTUAL_DRIVE_PROVENANCE_CLAIMS = [
  /\bI(?:'m| am) showing you (?:the )?result I already provided\b/i,
  /\bI found (?:this|that) document earlier\b/i,
  /\bthe document ID was\b/i,
  /\bthe (?:document|file) ID I found (?:earlier|before) was\b/i,
  /\bI previously found (?:the )?document ID\b/i,
  /\bI found provider ID\b[^\r\n]*\bearlier\b/i,
  /\bthe document was\b[^\r\n]*\band its ID was\b/i,
  /\bI found that file earlier and its ID is\b/i,
  /\bthe document ID from the earlier search was\b/i,
  /\bthe only document ID (?:we(?:'ve| have) discussed|we discussed) is\b[^\r\n]*\b(?:result of|from) your search\b/i,
] as const;
const DRIVE_PROVENANCE_FOLLOW_UP = /^(?:what was the (?:document|file) ID you found (?:earlier|before)|what file did you find|what was that (?:Google )?Drive file ID|which document did (?:the )?(?:Google )?Drive search return)[?!.]*$/i;

function isDriveProvenanceFollowUp(utterance: string | undefined): boolean {
  if (!utterance) return false;
  const normalized = utterance.normalize("NFKC").replace(/\s+/g, " ").trim();
  return DRIVE_PROVENANCE_FOLLOW_UP.test(normalized) || isAmbiguousPrivateReadFollowUp(utterance);
}

export function presentsPrivateAuthorityConfirmation(content: string): boolean {
  return PRIVATE_SOURCE.test(content)
    && CONFIRMATION_REQUEST.test(content)
    && PRIVATE_ACCESS.test(content);
}

/** Applies only to text returned by an ordinary model invocation. */
export type CalendarProvenanceState = Readonly<{
  hasCurrentCalendarGovernedContext: boolean;
  isCalendarRecollection: boolean;
  priorVisibleReportIsScheduleOnly?: boolean;
  isDetailFollowUp?: boolean;
  unboundUserDetails?: readonly Readonly<{ clock: string; label: string }>[];
  currentCommitmentClocks?: readonly string[];
  currentCalendarFallback?: string;
  boundUserDetails?: readonly Readonly<{ clock: string; label: string }>[];
  unknownCommitmentClocks?: readonly string[];
}>;

export function guardOrdinaryModelReply(content: string, currentUserUtterance?: string, governedDriveHistoryExcluded = false,
  calendarProvenance?: CalendarProvenanceState): string {
  let guarded = content;
  const ordinaryCalendarFact = currentUserUtterance
    ? userSuppliedTimedCalendarDetail(currentUserUtterance) !== undefined
    : false;

  // A narrow timed Calendar fact is ordinary user-provided conversation.
  // Once classified, presentation is deterministic: model wording cannot turn
  // the same fact into authority UX, capability denial, or a write/update path.
  if (ordinaryCalendarFact) {
    return ORDINARY_CALENDAR_FACT_REPLY;
  }
  const hasProjectedFieldAbsence = Boolean(calendarProvenance
    && (calendarProvenance.hasCurrentCalendarGovernedContext || calendarProvenance.isCalendarRecollection)
    && PROJECTED_FIELD_ABSENCE.test(guarded));
  PROJECTED_FIELD_ABSENCE.lastIndex = 0;
  if (hasProjectedFieldAbsence) {
    guarded = guarded.replace(PROJECTED_FIELD_ABSENCE,
      "The governed Calendar result available here did not include that field");
    PROJECTED_FIELD_ABSENCE.lastIndex = 0;
  }
  const explicitDriveProvenance = EXPLICIT_DRIVE_PROVENANCE_CLAIMS.some(pattern => pattern.test(content));
  const contextualDriveProvenance = CONTEXTUAL_DRIVE_PROVENANCE_CLAIMS.some(pattern => pattern.test(content))
    && isDriveProvenanceFollowUp(currentUserUtterance);
  if (governedDriveHistoryExcluded && (explicitDriveProvenance || contextualDriveProvenance)) {
    return EXCLUDED_DRIVE_PROVENANCE_REPLY;
  }

  if (calendarProvenance && !calendarProvenance.hasCurrentCalendarGovernedContext
    && calendarProvenance.isCalendarRecollection) {
    // Only unsafe live possession/source-level wording triggers deterministic
    // reconstruction. Safe historical model wording remains untouched.
    if (calendarProvenance.isDetailFollowUp
      && (calendarProvenance.boundUserDetails?.length ?? 0) > 0
      && UNSAFE_BOUND_DETAIL_RECALL.test(guarded)) {
      const known = (calendarProvenance.boundUserDetails ?? [])
        .map(detail => `From what you told me earlier, the ${detail.clock} commitment is the ${detail.label}.`).join(" ");
      const unknown = (calendarProvenance.unknownCommitmentClocks ?? [])
        .map(clock => `The earlier governed Calendar result did not include title or description information for the ${clock} commitment.`).join(" ");
      return `From the earlier Calendar result I reported: ${known} ${unknown}`.trim();
    }
    const attributed = attributeCalendarRecollection(guarded)
      ?? attributeBareCalendarRecollection(guarded);
    if (attributed) guarded = attributed;
    if (hasProjectedFieldAbsence && calendarProvenance.isDetailFollowUp) {
      const bound = calendarProvenance.boundUserDetails ?? [];
      if (bound.length > 0) {
        const known = bound.map(detail => `From what you told me earlier, the ${detail.clock} commitment is the ${detail.label}.`).join(" ");
        const unknown = (calendarProvenance.unknownCommitmentClocks ?? [])
          .map(clock => `The governed Calendar result did not include title or description information for the ${clock} commitment.`).join(" ");
        return `From the earlier Calendar result I reported: ${known} ${unknown}`.trim();
      }
      if (calendarProvenance.priorVisibleReportIsScheduleOnly) {
        return "From the earlier Calendar result I reported, only timing information was available in the governed projection, not titles or descriptions.";
      }
    }
    if (attributed) {
      if (calendarProvenance.isDetailFollowUp) {
        return rewriteFalseCalendarRereadOffer(guarded) ?? guarded;
      }
      return guarded;
    }
    if (calendarProvenance.isDetailFollowUp && calendarProvenance.priorVisibleReportIsScheduleOnly) {
      return "The governed Calendar path available here includes timing information only, not titles or descriptions.";
    }
    if (calendarProvenance.isDetailFollowUp) {
      const withoutFalseReread = rewriteFalseCalendarRereadOffer(guarded);
      if (withoutFalseReread) return withoutFalseReread;
      if (presentsPrivateAuthorityConfirmation(content)) {
        const bound = calendarProvenance.boundUserDetails ?? [];
        if (bound.length > 0) {
          const known = bound.map(detail => `From what you told me earlier, the ${detail.clock} commitment is the ${detail.label}.`).join(" ");
          const unknown = (calendarProvenance.unknownCommitmentClocks ?? [])
            .map(clock => `I don't have information about what the ${clock} commitment is about`).join("; ");
          return `${known}${unknown ? ` ${unknown} because the earlier Calendar result contained timing only.` : ""}`;
        }
        return "The governed Calendar path available here includes timing information only, not titles or descriptions.";
      }
    }
  }

  if (calendarProvenance?.hasCurrentCalendarGovernedContext && calendarProvenance.unboundUserDetails?.some(detail =>
    content.toLocaleLowerCase().includes(detail.label.toLocaleLowerCase())
    && (calendarProvenance.currentCommitmentClocks ?? []).some(clock => content.toUpperCase().includes(clock.toUpperCase())))) {
    const detail = calendarProvenance.unboundUserDetails.find(item => content.toLocaleLowerCase().includes(item.label.toLocaleLowerCase()))!;
    return `${calendarProvenance.currentCalendarFallback ?? "The current Calendar result contains timing only."}\nYou previously mentioned ${detail.label} at ${displayCalendarClock(detail.clock)}, but that time does not match a commitment in this Calendar result, so I cannot associate it with one.`;
  }

  // A proven recall/detail turn is ordinary recollection even if the model asks
  // for authority. Only non-recall ordinary text is neutralized as fake UX.
  if (presentsPrivateAuthorityConfirmation(content)
    && (!currentUserUtterance || PRIVATE_ACQUISITION_UTTERANCE.test(currentUserUtterance))) {
    return NEUTRALIZED_ORDINARY_AUTHORITY_REPLY;
  }

  // This is static capability knowledge, not authority or connector evidence.
  // It corrects only a false global denial made on an unsupported ordinary path.
  if (currentUserUtterance && FALSE_GLOBAL_CAPABILITY_CLAIM.test(content)) {
    if (CALENDAR_REQUEST.test(currentUserUtterance)) return UNSUPPORTED_CALENDAR_PATH_REPLY;
    if (GMAIL_REQUEST.test(currentUserUtterance)) return UNSUPPORTED_GMAIL_PATH_REPLY;
    if (DRIVE_REQUEST.test(currentUserUtterance)) return UNSUPPORTED_DRIVE_PATH_REPLY;
  }

  // Excluded Drive history is deny-side presentation evidence only. It can
  // correct a model's false Drive-wide denial, but cannot identify or acquire a
  // file and never participates in authority resolution.
  if (governedDriveHistoryExcluded
    && FALSE_GLOBAL_CAPABILITY_CLAIM.test(content)
    && DRIVE_CAPABILITY_DENIAL.test(content)) {
    return UNSUPPORTED_DRIVE_PATH_REPLY;
  }

  for (const marker of INTERNAL_HISTORY_MARKERS) guarded = guarded.replaceAll(marker, "");
  guarded = guarded.trim();
  return guarded || NEUTRALIZED_ORDINARY_AUTHORITY_REPLY;
}
