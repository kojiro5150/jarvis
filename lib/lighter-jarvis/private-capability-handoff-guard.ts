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
