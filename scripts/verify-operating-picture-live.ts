import { createHash } from "node:crypto";
import {
  createSupabaseOperatingPicturePersistence,
  loadSupabaseOperatingPictureConfig,
} from "../lib/operating-picture/supabase-persistence";
import {
  retrieveDurableOperatingPictureHeadForPurpose,
} from "../lib/operating-picture/purpose-retrieval";
import {
  retrieveDurableOperatingPictureForPurpose,
} from "../lib/operating-picture/purpose-projection-retrieval";

function usage(): never {
  throw new Error(
    [
      "usage:",
      "  npm run verify:operating-picture:live -- heads",
      "  npm run verify:operating-picture:live -- preflight <versionId>",
      "  npm run verify:operating-picture:live -- retrieve <recordId> <versionId> <purpose>",
      "  npm run verify:operating-picture:live -- project <purpose>",
    ].join("\n"),
  );
}

function payloadFingerprint(payload: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");
}

function configOrThrow() {
  const config = loadSupabaseOperatingPictureConfig();
  if (!config) {
    throw new Error(
      "Missing or invalid NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY in .env.local.",
    );
  }
  return config;
}

async function main(): Promise<void> {
  const [operation, ...args] = process.argv.slice(2);
  const config = configOrThrow();
  const persistence = createSupabaseOperatingPicturePersistence(config);
  const store = persistence.durableStore;

  if (operation === "heads" && args.length === 0) {
    const result = await store.listRecordHeads();

    if (result.status !== "found") {
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    console.log(JSON.stringify({
      status: result.status,
      count: result.heads.length,
      heads: result.heads,
    }, null, 2));
    return;
  }

  if (operation === "preflight" && args.length === 1) {
    const [versionId] = args;
    if (!versionId) usage();

    const result = await store.getVersionProjectionMetadata(versionId);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (operation === "retrieve" && args.length === 3) {
    const [recordId, versionId, purpose] = args;
    if (!recordId || !versionId || !purpose) usage();

    const result = await retrieveDurableOperatingPictureHeadForPurpose(
      store,
      Object.freeze({ recordId, versionId }),
      purpose,
    );

    if (result.status !== "admitted") {
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    console.log(JSON.stringify({
      status: result.status,
      item: {
        recordId: result.item.recordId,
        versionId: result.item.versionId,
        purpose: result.item.purpose,
        semanticClass: result.item.semanticClass,
        lifecycle: result.item.lifecycle,
        recoveryDisposition: result.item.recoveryDisposition,
        visibilityPurposes: result.item.visibilityPurposes,
        authorshipSource: result.item.authorshipSource,
        authorshipAt: result.item.authorshipAt,
        payloadSha256: payloadFingerprint(result.item.payload),
      },
    }, null, 2));
    return;
  }

  if (operation === "project" && args.length === 1) {
    const [purpose] = args;
    if (!purpose) usage();

    const result = await retrieveDurableOperatingPictureForPurpose(store, purpose);

    if (result.status !== "projected") {
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    console.log(JSON.stringify({
      status: result.status,
      purpose: result.purpose,
      itemCount: result.items.length,
      items: result.items.map(item => ({
        recordId: item.recordId,
        versionId: item.versionId,
        semanticClass: item.semanticClass,
        lifecycle: item.lifecycle,
        recoveryDisposition: item.recoveryDisposition,
        visibilityPurposes: item.visibilityPurposes,
        authorshipSource: item.authorshipSource,
        authorshipAt: item.authorshipAt,
        payloadSha256: payloadFingerprint(item.payload),
      })),
      decisions: result.decisions,
    }, null, 2));
    return;
  }

  usage();
}

void main().catch((error: unknown) => {
  console.error(
    error instanceof Error
      ? error.message
      : "Live Operating Picture verification failed.",
  );
  process.exitCode = 1;
});
