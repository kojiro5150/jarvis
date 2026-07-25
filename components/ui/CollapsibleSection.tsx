"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

/**
 * A single disclosure block — used to break up long assistant responses
 * into named sections ("Operational Assessment", "Recommendations", etc.)
 * instead of one wall of text. Presentation-only: purely a client-side
 * accordion around already-rendered content, no effect on what an agent
 * says or how it's generated.
 */
export default function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-white/10 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs tracking-wide text-white/70 hover:text-white/90 hover:bg-white/5 transition-colors"
      >
        <ChevronRight
          size={13}
          className={`shrink-0 transition-transform ${open ? "rotate-90" : ""}`}
        />
        <span className="truncate">{title}</span>
      </button>
      {open && <div className="px-3.5 pb-3 pt-1">{children}</div>}
    </div>
  );
}
