export type ConsolePresentationMode = "LEGACY" | "GOVERNED";

/** Server-side runtime selection. An absent value intentionally preserves production behaviour. */
export function selectConsolePresentationMode(value: string | undefined): ConsolePresentationMode {
  if (value === undefined || value.trim() === "") return "LEGACY";
  if (value === "LEGACY" || value === "GOVERNED") return value;
  throw new Error("CONSOLE_PRESENTATION_MODE must be LEGACY or GOVERNED");
}
