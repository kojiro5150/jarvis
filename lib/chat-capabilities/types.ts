import type { GmailContentRetrievalRequest, ContentRetrievalResult } from "../content-retrieval";
import type { ContentRetrievalPolicy } from "../content-retrieval-policy";
import type { ExecutiveContext } from "../executive-operating-system/conversation-context";
import type { ExecutiveContextCapabilityInput } from "../executive-operating-system/computation/executive-context-capability";

export type ExecutiveContextCapabilityRequest = Readonly<{
  operation: "executive_context";
}> & ExecutiveContextCapabilityInput;

export type GovernedGmailCapabilityRequest = Readonly<{
  operation: "governed_gmail_retrieval";
  request: GmailContentRetrievalRequest;
}>;

export type ChatCapabilityRequest = ExecutiveContextCapabilityRequest | GovernedGmailCapabilityRequest;

export type ChatCapabilityResponse =
  | Readonly<{ operation: "executive_context"; outcome: "success"; context: ExecutiveContext }>
  | Readonly<{ operation: "executive_context"; outcome: "failed"; error: string }>
  | Readonly<{ operation: "governed_gmail_retrieval"; outcome: ContentRetrievalResult["outcome"]; result: ContentRetrievalResult }>
  | Readonly<{ operation: "governed_gmail_retrieval"; outcome: "failed"; error: string }>;

export type ChatCapabilityDependencies = Readonly<{
  gmailConnector: import("../content-retrieval").GmailContentConnector;
  loadPolicy: () => Promise<ContentRetrievalPolicy | null>;
}>;
