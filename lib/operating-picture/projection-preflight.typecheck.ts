import type {
  PersistedOperatingPictureProjectionMetadata,
} from "./persistence-record";

declare const metadata: PersistedOperatingPictureProjectionMetadata;

// Projection preflight is intentionally payload-free.
// @ts-expect-error preflight metadata must not expose semantic payload
metadata.payload;

// @ts-expect-error preflight metadata must not expose subject content
metadata.subjectNamespace;

// @ts-expect-error preflight metadata must not expose temporal payload fields
metadata.validFrom;

void metadata.versionId;
void metadata.recordId;
void metadata.semanticClass;
void metadata.lifecycle;
void metadata.visibilityPurposes;
void metadata.authorshipSource;
void metadata.provenanceSource;
