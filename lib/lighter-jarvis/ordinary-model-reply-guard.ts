import { isAmbiguousPrivateReadFollowUp } from "./private-capability-handoff-guard";
import { attributeCalendarRecollection } from "./calendar-provenance-truthfulness";

/**
 * Ordinary model text is presentation, never authority machinery. Keep the
 * guard content-derived: neither the model nor the client may label text as a
 * genuine authority response.
 */
export const NEUTRALIZED_ORDINARY_AUTHORITY_REPLY =
  "That request cannot be authorized through an ordinary model response.";

export const UNSUPPORTED_CALENDAR_PATH_REPLY =
  "The governed Calendar path supports calendar.read, but it does not support this request.";

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
  priorReportContainedOnlySchedule?: boolean;
  isDetailFollowUp?: boolean;
}>;

export function guardOrdinaryModelReply(content: string, currentUserUtterance?: string, governedDriveHistoryExcluded = false,
  calendarProvenance?: CalendarProvenanceState): string {
  if (presentsPrivateAuthorityConfirmation(content)) {
    return NEUTRALIZED_ORDINARY_AUTHORITY_REPLY;
  }

  const explicitDriveProvenance = EXPLICIT_DRIVE_PROVENANCE_CLAIMS.some(pattern => pattern.test(content));
  const contextualDriveProvenance = CONTEXTUAL_DRIVE_PROVENANCE_CLAIMS.some(pattern => pattern.test(content))
    && isDriveProvenanceFollowUp(currentUserUtterance);
  if (governedDriveHistoryExcluded && (explicitDriveProvenance || contextualDriveProvenance)) {
    return EXCLUDED_DRIVE_PROVENANCE_REPLY;
  }

  if (calendarProvenance && !calendarProvenance.hasCurrentCalendarGovernedContext
    && calendarProvenance.isCalendarRecollection) {
    if (calendarProvenance.isDetailFollowUp && calendarProvenance.priorReportContainedOnlySchedule) {
      return "The earlier calendar result I reported contained only the times, not the meeting details.";
    }
    const attributed = attributeCalendarRecollection(content);
    if (attributed) return attributed;
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

  let guarded = content;
  for (const marker of INTERNAL_HISTORY_MARKERS) guarded = guarded.replaceAll(marker, "");
  guarded = guarded.trim();
  return guarded || NEUTRALIZED_ORDINARY_AUTHORITY_REPLY;
}
