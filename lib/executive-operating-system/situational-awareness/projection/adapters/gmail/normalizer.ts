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

function addresses(value: string): readonly string[] {
  // Address syntax is retained as supplied; only the protocol list boundary is exposed canonically.
  return value.split(",").map((address) => address.trim()).filter(Boolean);
}

function parts(part: GmailPartObservation | undefined): readonly GmailPartObservation[] {
  return part ? [part, ...(part.parts ?? []).flatMap(parts)] : [];
}

/** Normalises explicit Gmail metadata and rejects observations without constitutional identity. */
export function normalizeGmailObservation(message: GmailMessageObservation): NormalizedGmailObservation {
  if (!message.id) throw new Error("Gmail observation requires a connector message identifier for provenance");
  const messageId = protocolId(exactlyOne(message, "Message-ID", true) as string, "Message-ID", message.id);
  const sender = exactlyOne(message, "From", true) as string;
  const recipientValues = ["To", "Cc", "Bcc"].flatMap((name) => headers(message, name));
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
    recipients: Object.freeze(recipientValues.flatMap(addresses)),
    sentAt: sentAtDate.toISOString(),
    ...(inReplyTo === undefined ? {} : { inReplyTo }),
    references: Object.freeze(references),
    provenance: Object.freeze({
      gmailMessageId: message.id,
      ...(message.threadId === undefined ? {} : { gmailThreadId: message.threadId }),
      ...(message.internalDate === undefined ? {} : { gmailInternalDate: message.internalDate }),
      ...(message.retrievedAt === undefined ? {} : { retrievedAt: message.retrievedAt }),
      hasAttachment: allParts.some(({ filename }) => typeof filename === "string" && filename.length > 0),
      unread: (message.labelIds ?? []).includes("UNREAD"),
      multipart: allParts.some(({ mimeType }) => mimeType?.toLowerCase().startsWith("multipart/")),
      htmlOnly: leafTypes.includes("text/html") && !leafTypes.includes("text/plain"),
    }),
  });
}
