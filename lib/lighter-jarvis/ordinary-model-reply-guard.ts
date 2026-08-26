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

const INTERNAL_HISTORY_MARKERS = [
  "[Governed private result omitted from ordinary model context.]",
  "[Prior governed Gmail read request omitted from ordinary model context.]",
  "[Prior governed Drive read request omitted from ordinary model context.]",
] as const;

const PRIVATE_SOURCE = /\b(?:calendar|gmail|e-?mail|inbox|drive)\b/i;
const CONFIRMATION_REQUEST = /(?:\b(?:confirm|confirmation|permission|authorize|authorise|approval|consent)\b|\b(?:may|can)\s+I\b|\b(?:reply|respond|say)\s+["'“”]?(?:yes|confirm|approve|allow)\b)/i;
const PRIVATE_ACCESS = /\b(?:access|read|search|retrieve|check|view|show|look(?:ing)?\s+(?:at|through|in)|connect(?:ing)?\s+to)\b/i;
const CALENDAR_REQUEST = /\bcalendar\b/i;
const GMAIL_REQUEST = /\b(?:gmail|e-?mail|emails|inbox|mailbox)\b/i;
const DRIVE_REQUEST = /\bdrive\b/i;
const FALSE_GLOBAL_CAPABILITY_CLAIM = /(?:\b(?:i\s+)?(?:do\s+not|don['’]?t|cannot|can['’]?t|am\s+not|I['’]?m\s+not|unable\s+to)\s+(?:(?:currently|directly)\s+)?(?:have\s+(?:(?:the|that|this|any)\s+)?(?:ability|capability|access)|access|connect(?:ed)?|read|search|retrieve|check|view)|\bno\s+(?:calendar|gmail|e-?mail|inbox|mailbox|drive)\s+(?:access|capability|integration)|\b(?:this|that|the)\s+capability\s+(?:does\s+not|doesn['’]?t)\s+exist|\b(?:calendar|gmail|e-?mail|inbox|mailbox|drive)\s+(?:is\s+not|isn['’]?t)\s+(?:connected|available|supported))/i;

export function presentsPrivateAuthorityConfirmation(content: string): boolean {
  return PRIVATE_SOURCE.test(content)
    && CONFIRMATION_REQUEST.test(content)
    && PRIVATE_ACCESS.test(content);
}

/** Applies only to text returned by an ordinary model invocation. */
export function guardOrdinaryModelReply(content: string, currentUserUtterance?: string): string {
  if (presentsPrivateAuthorityConfirmation(content)) {
    return NEUTRALIZED_ORDINARY_AUTHORITY_REPLY;
  }

  // This is static capability knowledge, not authority or connector evidence.
  // It corrects only a false global denial made on an unsupported ordinary path.
  if (currentUserUtterance && FALSE_GLOBAL_CAPABILITY_CLAIM.test(content)) {
    if (CALENDAR_REQUEST.test(currentUserUtterance)) return UNSUPPORTED_CALENDAR_PATH_REPLY;
    if (GMAIL_REQUEST.test(currentUserUtterance)) return UNSUPPORTED_GMAIL_PATH_REPLY;
    if (DRIVE_REQUEST.test(currentUserUtterance)) return UNSUPPORTED_DRIVE_PATH_REPLY;
  }

  let guarded = content;
  for (const marker of INTERNAL_HISTORY_MARKERS) guarded = guarded.replaceAll(marker, "");
  guarded = guarded.trim();
  return guarded || NEUTRALIZED_ORDINARY_AUTHORITY_REPLY;
}
