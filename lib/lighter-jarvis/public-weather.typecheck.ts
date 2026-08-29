import { markModelText } from "@/lib/governance-core/trust-types";
import type {
  PublicEvidenceProvenance,
  RetrievedPublicEvidence,
  RetrievedWeatherPublicEvidence,
} from "@/lib/governance-core/public-grounding";

const modelText = markModelText("It will rain in Geelong tomorrow.");

if (false) {
  // @ts-expect-error PUBLIC-GROUNDING-01: model-authored text is not retrieved public evidence.
  const weather: RetrievedWeatherPublicEvidence = modelText;

  // @ts-expect-error PUBLIC-GROUNDING-01: model-authored text is not generic retrieved public evidence.
  const generic: RetrievedPublicEvidence<"weather", unknown> = modelText;

  // @ts-expect-error PUBLIC-GROUNDING-01: model-authored text is not public provenance.
  const provenance: PublicEvidenceProvenance = modelText;

  void weather;
  void generic;
  void provenance;
}
