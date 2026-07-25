/**
 * The reference image puts a "VIEW ALL X →" link at the bottom of every
 * card. There's no drill-down view built anywhere in this app yet, so
 * rather than wiring a link to nowhere (or silently dropping it and
 * losing the visual match), this renders honestly as a non-interactive,
 * slightly muted affordance with a tooltip explaining why it doesn't
 * navigate — the same "honestly disabled" pattern already used for the
 * Artifacts/Files/Reasoning tabs in the Mission Workspace.
 */
export default function CardFooterLink({ label }: { label: string }) {
  return (
    <div className="mt-2.5 pt-2 border-t border-white/5 shrink-0">
      <span
        title="Drill-down view not built yet"
        className="text-[11px] font-mono tracking-wide text-cyan-300/50 cursor-default inline-flex items-center gap-1 select-none"
      >
        {label} <span aria-hidden>→</span>
      </span>
    </div>
  );
}
