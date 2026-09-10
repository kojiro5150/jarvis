export const GMAIL_INVITATION_DECLINE_DRAFT_CAPABILITY =
  "gmail.read_for_invitation_decline_draft" as const;

export const GMAIL_INVITATION_DECLINE_AUTHORITY_PROMPT =
  "I can re-read the previously released Gmail message to prepare a thank-and-decline draft. Please explicitly confirm that I may read that exact message again.";

export const GMAIL_INVITATION_DECLINE_UNAVAILABLE =
  "I couldn't safely prepare that draft from the exact Gmail message. No draft was generated.";

export const GMAIL_INVITATION_DECLINE_PROCESSING_LIMIT =
  "That complete Gmail message is too large to process safely for drafting. No draft was generated.";

export const OMITTED_GMAIL_INVITATION_DECLINE_DRAFT =
  "[Prior governed Gmail draft omitted; editing or reuse requires a separately governed path.]";

export const GMAIL_INVITATION_DECLINE_REUSE_CONTAINMENT =
  "I can't safely edit, reuse, or send that previously generated Gmail draft through this path.";

export const GMAIL_INVITATION_DECLINE_MAX_EVIDENCE_CODE_UNITS = 16_000;
