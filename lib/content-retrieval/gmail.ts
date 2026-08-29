import {
  createRetrievalAuditRecord,
  evaluateContentRetrievalPolicy,
  resolveReleasedFields,
  type ContentResource,
  type ContentRetrievalPolicy,
  type RetrievalAuditRecord,
  type RetrievalRequest,
  type TransformationStatus,
} from "../content-retrieval-policy";

export const GMAIL_CONTENT_FIELDS = [
  "sender",
  "subject",
  "snippet",
  "plain_text_body",
  "attachment_filenames",
  "attachment_mime_metadata",
] as const;

export type GmailContentField = (typeof GMAIL_CONTENT_FIELDS)[number];

export type GmailContentRetrievalRequest = Readonly<{
  resource: ContentResource & Readonly<{ connectorType: "email" }>;
  requestedFields: readonly GmailContentField[];
  requestingRuntime: string;
}>;

export type GmailAttachmentMimeMetadata = Readonly<{
  filename: string;
  mimeType: string;
}>;

/** Raw connector response. Extra connector fields are accepted but never copied to the result. */
export type GmailRetrievedMessage = Readonly<{
  sender?: string;
  subject?: string;
  snippet?: string;
  plainTextBody?: string;
  attachments?: readonly Readonly<{ filename: string; mimeType: string; [key: string]: unknown }>[];
  [key: string]: unknown;
}>;

export interface GmailContentConnector {
  retrieveMessage(resourceId: string): Promise<GmailRetrievedMessage>;
}

export type GmailReleasedContent = Readonly<{
  sender?: string;
  subject?: string;
  snippet?: string;
  plainTextBody?: string;
  attachmentFilenames?: readonly string[];
  attachmentMimeMetadata?: readonly GmailAttachmentMimeMetadata[];
}>;

export type ContentRetrievalResult = Readonly<{
  retrievalId: string;
  resourceId: string;
  policyVersion: string | null;
  outcome: "permitted" | "denied" | "failed";
  content?: GmailReleasedContent;
  audit: RetrievalAuditRecord;
}>;

export type GmailContentRetrievalAdapterOptions = Readonly<{
  connector: GmailContentConnector;
  now?: () => Date;
  createRetrievalId?: () => string;
}>;

const freeze = <T extends object>(value: T): Readonly<T> => {
  for (const child of Object.values(value)) {
    if (child && typeof child === "object" && !Object.isFrozen(child)) freeze(child);
  }
  return Object.freeze(value);
};

function selectContent(message: GmailRetrievedMessage, fields: readonly string[]): GmailReleasedContent {
  const selected: Record<string, unknown> = {};
  const allowed = new Set(fields);
  if (allowed.has("sender") && typeof message.sender === "string") selected.sender = message.sender;
  if (allowed.has("subject") && typeof message.subject === "string") selected.subject = message.subject;
  if (allowed.has("snippet") && typeof message.snippet === "string") selected.snippet = message.snippet;
  if (allowed.has("plain_text_body") && typeof message.plainTextBody === "string") selected.plainTextBody = message.plainTextBody;
  const attachments = Array.isArray(message.attachments) ? message.attachments : [];
  if (allowed.has("attachment_filenames")) selected.attachmentFilenames = attachments.map(({ filename }) => filename);
  if (allowed.has("attachment_mime_metadata")) {
    selected.attachmentMimeMetadata = attachments.map(({ filename, mimeType }) => ({ filename, mimeType }));
  }
  return selected;
}

/** Policy evaluation is completed before the connector is invoked. Non-permitted decisions fail closed. */
export class GmailContentRetrievalAdapter {
  private readonly now: () => Date;
  private readonly createRetrievalId: () => string;

  constructor(private readonly options: GmailContentRetrievalAdapterOptions) {
    this.now = options.now ?? (() => new Date());
    this.createRetrievalId = options.createRetrievalId ?? (() => crypto.randomUUID());
  }

  async retrieve(
    request: GmailContentRetrievalRequest,
    policy: ContentRetrievalPolicy | null | undefined,
  ): Promise<ContentRetrievalResult> {
    const retrievalId = this.createRetrievalId();
    const evaluation = evaluateContentRetrievalPolicy(request.resource, policy);
    const supportedFields = new Set<string>(GMAIL_CONTENT_FIELDS);
    const releasedFields = resolveReleasedFields(evaluation, request.requestedFields)
      .filter((field) => supportedFields.has(field));
    const transformationStatus: TransformationStatus = evaluation.decision === "redacted_processing_only"
      ? "required_not_applied"
      : "not_required";
    const auditRequest: RetrievalRequest = {
      resource: {
        ...request.resource,
        ...(request.resource.recipientIdentities
          ? { recipientIdentities: [...request.resource.recipientIdentities] }
          : {}),
      },
      requestedFields: [...request.requestedFields],
      requestingRuntime: request.requestingRuntime,
    };

    const finish = (outcome: ContentRetrievalResult["outcome"], content?: GmailReleasedContent) => {
      const audit = createRetrievalAuditRecord({
        retrievalId,
        request: auditRequest,
        evaluation,
        releasedFields: outcome === "permitted" ? releasedFields : [],
        transformationStatus,
        timestamp: this.now().toISOString(),
        outcome,
      });
      return freeze({ retrievalId, resourceId: request.resource.resourceId, policyVersion: evaluation.policyVersion, outcome, ...(content ? { content } : {}), audit });
    };

    if (evaluation.decision !== "external_processing_permitted") return finish("denied");

    try {
      const message = await this.options.connector.retrieveMessage(request.resource.resourceId);
      return finish("permitted", selectContent(message, releasedFields));
    } catch {
      return finish("failed");
    }
  }
}
