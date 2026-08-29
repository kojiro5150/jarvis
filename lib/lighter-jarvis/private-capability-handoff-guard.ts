/**
 * A specialist handoff is not an alternative authority path for private data.
 *
 * This deliberately does not recognize or authorize a capability. It only
 * rejects a model-generated handoff when the untouched current utterance is a
 * request to acquire (or recall as though acquired) Calendar, Gmail, or Drive data.
 */
export function isPrivateAcquisitionHandoffRequest(utterance: string): boolean {
  const normalized = utterance.normalize("NFKC").toLowerCase().replace(/[’]/g, "'").replace(/\s+/g, " ").trim();

  const calendarSource = /\b(?:my\s+)?calendar\b/.test(normalized);
  const gmailSource = /\b(?:my\s+)?gmail\b/.test(normalized);
  const driveSource = /\b(?:my\s+)?(?:google\s+)?drive\b/.test(normalized);
  const mailSource = /\bmy\s+(?:emails?|inbox)\b/.test(normalized)
    || /\bmy\s+(?:latest|newest|most recent)\s+email\b/.test(normalized);
  const acquisition = /\b(?:show|retrieve|check|read|get|fetch|search|open|display|list|look\s+(?:at|through|in))\b/.test(normalized);
  const sourceRecall = /\bwhat\s+did\b[\s\S]*\b(?:calendar|gmail|email|inbox|drive)\b[\s\S]*\b(?:say|show|contain|return|find)\b/.test(normalized);

  return sourceRecall || (acquisition && (calendarSource || gmailSource || mailSource || driveSource));
}

/** Structural deny/history-side signal only; this neither verifies an ID nor grants authority. */
export function isProviderIdLike(utterance: string): boolean {
  return /^[A-Za-z0-9_-]{20,}$/.test(utterance.trim());
}

/** Prior Drive context may activate this deny-only classifier; it supplies no operation or authority. */
export function isAmbiguousPrivateReadFollowUp(utterance: string): boolean {
  const normalized = utterance.normalize("NFKC").toLowerCase().replace(/[’]/g, "'").replace(/\s+/g, " ").trim();
  const anaphoricRead = /^(?:read|open|show|summari[sz]e)(?:\s+(?:it|that))?[.!?]*$/.test(normalized);
  // Twenty characters is deliberately structural, not proof of a real ID.
  // It excludes ordinary short words while retaining observed opaque Drive-ID shapes.
  return anaphoricRead || isProviderIdLike(utterance);
}

/**
 * Prior governed Gmail context may activate this deny-only classifier.
 * It does not identify a message, recover evidence, or grant read authority.
 */
export function isAmbiguousGmailEvidenceFollowUp(utterance: string): boolean {
  const normalized = utterance.normalize("NFKC").toLowerCase().replace(/[’]/g, "'").replace(/\s+/g, " ").trim();
  return /^(?:one|any) of (?:my|the|those) (?:last|recent) (?:five )?emails?[.!?]*$/.test(normalized)
    || /^(?:one|any) of (?:those|the) emails?[.!?]*$/.test(normalized)
    || /^(?:the )?(?:first|second|third|fourth|fifth) (?:one|email)[.!?]*$/.test(normalized)
    || /^(?:that|this) email[.!?]*$/.test(normalized);
}
