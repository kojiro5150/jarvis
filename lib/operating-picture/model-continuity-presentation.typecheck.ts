import type {
  AuthorityEvidence,
  GovernedEvidence,
} from "../governance-core/trust-types";
import type { DurableOperatingPictureProjectionItem } from "./durable-projection";
import type {
  ModelContinuityPresentation,
  ModelContinuityPresentationItem,
  ResolvedModelContinuityItem,
} from "./model-continuity-presentation";

declare const presentation: ModelContinuityPresentation;
declare const presentationItem: ModelContinuityPresentationItem;
declare const resolved: ResolvedModelContinuityItem;

// Displayable continuity deliberately excludes durable identity.
// @ts-expect-error durable record identity must not cross presentation boundary
presentation.items[0].recordId;
// @ts-expect-error durable version identity must not cross presentation boundary
presentation.items[0].versionId;

// Presentation is not the durable projection and cannot regain its trust context.
// @ts-expect-error presentation item is not a durable projection item
const _projection: DurableOperatingPictureProjectionItem = presentationItem;

// Neither resolved nor displayable continuity is trust-bearing evidence or authority.
// @ts-expect-error resolved continuity is not governed evidence
const _resolvedEvidence: GovernedEvidence<unknown> = resolved;
// @ts-expect-error presentation is not governed evidence
const _presentationEvidence: GovernedEvidence<unknown> = presentation;
// @ts-expect-error presentation is not authority evidence
const _presentationAuthority: AuthorityEvidence<unknown> = presentation;

void [
  _projection,
  _resolvedEvidence,
  _presentationEvidence,
  _presentationAuthority,
];
