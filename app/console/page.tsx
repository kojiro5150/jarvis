import type { Metadata } from "next";
import UnifiedOpsConsole from "@/components/console/UnifiedOpsConsole";

export const metadata: Metadata = {
  title: "J.A.R.V.I.S — Unified Ops Console",
};

export default function ConsolePage() {
  return <UnifiedOpsConsole />;
}
