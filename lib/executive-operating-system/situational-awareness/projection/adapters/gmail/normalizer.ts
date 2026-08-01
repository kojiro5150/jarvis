import type { GmailMessageObservation, GmailPartObservation, NormalizedGmailObservation } from "./types";

const messageIdentifier = /^<[^<>\s@]+@[^<>\s@]+>$/;

function headers(message: GmailMessageObservation, name: string): readonly string[] {
  return (message.payload?.headers ?? []).filter((header) => header.name.toLowerCase() === name.toLowerCase()).map(({ value }) => value);
}

function exactlyOne(message: GmailMessageObservation, name: string, required: boolean): string | undefined {
  const values = headers(message, name);
  if (values.length > 1) throw new Error(`Gmail message ${message.id} has duplicate ${name} headers`);
  if (values.length === 0) {
    if (required) throw new Error(`Gmail message ${message.id} is missing ${name}`);
    return undefined;
  }
  if (values[0].trim().length === 0) throw new Error(`Gmail message ${message.id} has malformed ${name}`);
  return values[0];
}

function protocolId(value: string, name: string, gmailId: string): string {
  if (!messageIdentifier.test(value)) throw new Error(`Gmail message ${gmailId} has malformed ${name}`);
  return value;
}

interface ParsedAddresses { readonly values: readonly string[]; readonly malformed: boolean }

/**
 * Tokenises an RFC 5322 address-list at structural comma boundaries. The source-asserted spelling
 * is retained: this is deliberately not an identity or deliverability parser. Quoted strings,
 * comments, angle addresses and groups all protect their internal commas.
 */
function addresses(value: string): ParsedAddresses {
  const unfolded = value.replace(/\r?\n[ \t]+/g, " ").trim();
  if (!unfolded) return { values: [], malformed: true };
  const values: string[] = [];
  let start = 0; let quote = false; let escaped = false; let commentDepth = 0; let angleDepth = 0;
  let inGroup = false; let malformed = false;
  const append = (end: number) => {
    const candidate = unfolded.slice(start, end).trim();
    if (!candidate || !validAddressElement(candidate)) malformed = true;
    else values.push(candidate);
  };
  for (let index = 0; index < unfolded.length; index += 1) {
    const character = unfolded[index];
    if (escaped) { escaped = false; continue; }
    if ((quote || commentDepth > 0) && character === "\\") { escaped = true; continue; }
    if (commentDepth > 0) {
      if (character === "(") commentDepth += 1;
      else if (character === ")") commentDepth -= 1;
      continue;
    }
    if (!quote && character === "(") { commentDepth = 1; continue; }
    if (character === '"') { quote = !quote; continue; }
    if (quote) continue;
    if (character === "<") angleDepth += 1;
    else if (character === ">") { angleDepth -= 1; if (angleDepth < 0) malformed = true; }
    else if (angleDepth === 0 && character === ":") inGroup = true;
    else if (angleDepth === 0 && character === ";" && inGroup) inGroup = false;
    else if (angleDepth === 0 && !inGroup && character === ",") { append(index); start = index + 1; }
  }
  append(unfolded.length);
  if (quote || escaped || commentDepth || angleDepth || inGroup) malformed = true;
  return { values, malformed };
}

function validAddressElement(value: string): boolean {
  const colon = value.indexOf(":");
  if (colon >= 0) return colon > 0 && value.endsWith(";");
  const leftAngle = value.indexOf("<");
  const rightAngle = value.lastIndexOf(">");
  if ((leftAngle >= 0) !== (rightAngle >= 0) || rightAngle < leftAngle) return false;
  const mailbox = leftAngle >= 0 ? value.slice(leftAngle + 1, rightAngle).trim() : value.replace(/\([^)]*\)/g, "").trim();
  return /^[^\s<>@,;:]+@[^\s<>@,;:]+$/.test(mailbox);
}

function parts(part: GmailPartObservation | undefined): readonly GmailPartObservation[] {
  return part ? [part, ...(part.parts ?? []).flatMap(parts)] : [];
}

/** Normalises explicit Gmail metadata and rejects observations without constitutional identity. */
export function normalizeGmailObservation(message: GmailMessageObservation): NormalizedGmailObservation {
  if (!message.id) throw new Error("Gmail observation requires a connector message identifier for provenance");
  const messageId = protocolId(exactlyOne(message, "Message-ID", true) as string, "Message-ID", message.id);
  const sender = exactlyOne(message, "From", true) as string;
  const parsedRecipients = ["To", "Cc", "Bcc"].flatMap((name) => headers(message, name).map(addresses));
  const recipients = parsedRecipients.flatMap(({ values }) => values);
  const recipientEvidence = recipients.length > 0 && parsedRecipients.every(({ malformed }) => !malformed)
    ? "available" as const : "unknown" as const;
  const date = exactlyOne(message, "Date", true) as string;
  const sentAtDate = new Date(date);
  if (!Number.isFinite(sentAtDate.getTime())) throw new Error(`Gmail message ${message.id} has malformed Date`);
  const inReplyToValue = exactlyOne(message, "In-Reply-To", false);
  const referencesValue = exactlyOne(message, "References", false);
  const inReplyTo = inReplyToValue === undefined ? undefined : protocolId(inReplyToValue, "In-Reply-To", message.id);
  const references = referencesValue === undefined ? [] : referencesValue.split(/\s+/).filter(Boolean).map((value) => protocolId(value, "References", message.id));
  const allParts = parts(message.payload);
  const leafTypes = allParts.filter((part) => !(part.parts?.length)).map(({ mimeType }) => mimeType?.toLowerCase());

  return Object.freeze({
    messageId,
    sender,
    recipients: Object.freeze(recipients),
    recipientEvidence,
    sentAt: sentAtDate.toISOString(),
    ...(inReplyTo === undefined ? {} : { inReplyTo }),
    references: Object.freeze(references),
    provenance: Object.freeze({
      gmailMessageId: message.id,
      ...(message.threadId === undefined ? {} : { gmailThreadId: message.threadId }),
      ...(message.internalDate === undefined ? {} : { gmailInternalDate: message.internalDate }),
      retrievedAt: message.retrievedAt,
      hasAttachment: allParts.some(({ filename }) => typeof filename === "string" && filename.length > 0),
      unread: (message.labelIds ?? []).includes("UNREAD"),
      multipart: allParts.some(({ mimeType }) => mimeType?.toLowerCase().startsWith("multipart/")),
      htmlOnly: leafTypes.includes("text/html") && !leafTypes.includes("text/plain"),
    }),
  });
}
