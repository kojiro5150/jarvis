import { markModelText } from "@/lib/governance-core/trust-types";
import type { GroundedPublicWeatherEvidence } from "./public-weather";

const modelText = markModelText("It will rain in Geelong tomorrow.");

if (false) {
  // @ts-expect-error PUBLIC-GROUNDING-01: model-authored text is not grounded public evidence.
  const grounded: GroundedPublicWeatherEvidence = modelText;
  void grounded;
}
