"use client";

import { useEffect, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import type { OperationalState } from "@/lib/operational-state";
import type { Priority, ProjectStatus, Signal } from "@/lib/memory/schema";

interface MemoryEditorProps {
  open: boolean;
  operationalState: OperationalState;
  onClose: () => void;
  onSaved: () => void;
}

const ACCENT_OPTIONS: ProjectStatus["tagColor"][] = ["cyan", "violet", "amber", "emerald"];
const SIGNAL_KIND_OPTIONS: { value: Signal["kind"]; label: string }[] = [
  { value: "deadline", label: "Deadline" },
  { value: "action", label: "Action" },
  { value: "research", label: "Research" },
  { value: "note", label: "Note / Blocker" },
];

const inputClass =
  "w-full rounded-md bg-white/5 border border-white/10 px-2.5 py-1.5 text-sm text-white/90 placeholder-white/30 outline-none focus:ring-1 focus:ring-cyan-400/50";
const labelClass = "text-[10px] tracking-wide text-white/40 mb-1 block";

/**
 * Sprint 2.5 — a minimal, functional editor for JARVIS's operational
 * memory. Deliberately not fancy: plain fields, add/remove rows, one
 * Save action. Everything is phrased in operational language (Priority,
 * Status, Deadline, Current Focus) — never JSON, file paths, or field
 * names from the underlying schema. Saves through the existing
 * PATCH /api/memory route, then calls onSaved() so the caller can
 * refresh OperationalState (lib/useOperationalState.ts) — that's what
 * makes JARVIS and DAWNWATCH's next reply reflect the change, since both
 * read OperationalState fresh on every request (Sprint 2.4).
 */
export default function MemoryEditor({ open, operationalState, onClose, onSaved }: MemoryEditorProps) {
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [projects, setProjects] = useState<ProjectStatus[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Load a fresh working copy every time the editor opens, so edits from
  // a prior open (cancelled or saved) never leak into the next session.
  useEffect(() => {
    if (open) {
      setPriorities(operationalState.priorities.map((p) => ({ ...p })));
      setProjects(operationalState.projects.map((p) => ({ ...p })));
      setSignals(operationalState.signals.map((s) => ({ ...s })));
      setError(null);
      setSaved(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const rankedPriorities = priorities.map((p, i) => ({ ...p, rank: i + 1 }));
      const res = await fetch("/api/memory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priorities: rankedPriorities, projects, signals }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Update didn't go through.");
      onSaved();
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update didn't go through. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-white/10 bg-void-900 shadow-glow-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
          <div>
            <h2 className="text-sm font-semibold tracking-widest text-white/90">
              UPDATE OPERATIONAL MEMORY
            </h2>
            <p className="text-xs text-white/40 mt-0.5">
              Changes apply immediately across JARVIS, DAWNWATCH, and the dashboard.
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white/80 hover:border-white/20"
          >
            <X size={15} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-6">
          {/* Priorities */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs tracking-widest text-white/50">PRIORITIES</h3>
              <button
                onClick={() =>
                  setPriorities((prev) => [
                    ...prev,
                    { rank: prev.length + 1, title: "", detail: "", due: "Today", urgent: false },
                  ])
                }
                className="flex items-center gap-1 text-xs text-cyan-300 hover:text-cyan-200"
              >
                <Plus size={13} /> Add priority
              </button>
            </div>
            <div className="space-y-3">
              {priorities.map((p, i) => (
                <div key={i} className="rounded-lg border border-white/10 p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <label className={labelClass}>Priority</label>
                      <input
                        className={inputClass}
                        value={p.title}
                        onChange={(e) =>
                          setPriorities((prev) =>
                            prev.map((row, idx) => (idx === i ? { ...row, title: e.target.value } : row))
                          )
                        }
                        placeholder="e.g. Governance reasoning review"
                      />
                    </div>
                    <button
                      onClick={() => setPriorities((prev) => prev.filter((_, idx) => idx !== i))}
                      className="mt-5 text-white/30 hover:text-rose-300"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div>
                    <label className={labelClass}>Current Focus / Next Action</label>
                    <textarea
                      className={`${inputClass} resize-none`}
                      rows={2}
                      value={p.detail}
                      onChange={(e) =>
                        setPriorities((prev) =>
                          prev.map((row, idx) => (idx === i ? { ...row, detail: e.target.value } : row))
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className={labelClass}>Deadline</label>
                      <input
                        className={inputClass}
                        value={p.due}
                        onChange={(e) =>
                          setPriorities((prev) =>
                            prev.map((row, idx) => (idx === i ? { ...row, due: e.target.value } : row))
                          )
                        }
                        placeholder="e.g. Today, This week"
                      />
                    </div>
                    <label className="flex items-center gap-1.5 text-xs text-white/50 mt-4">
                      <input
                        type="checkbox"
                        checked={!!p.urgent}
                        onChange={(e) =>
                          setPriorities((prev) =>
                            prev.map((row, idx) => (idx === i ? { ...row, urgent: e.target.checked } : row))
                          )
                        }
                      />
                      Urgent
                    </label>
                  </div>
                </div>
              ))}
              {priorities.length === 0 && (
                <p className="text-xs text-white/30">No priorities recorded.</p>
              )}
            </div>
          </section>

          {/* Projects */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs tracking-widest text-white/50">PROJECTS</h3>
              <button
                onClick={() =>
                  setProjects((prev) => [
                    ...prev,
                    { name: "", tag: "In progress", progress: 0, tagColor: "cyan" },
                  ])
                }
                className="flex items-center gap-1 text-xs text-cyan-300 hover:text-cyan-200"
              >
                <Plus size={13} /> Add project
              </button>
            </div>
            <div className="space-y-3">
              {projects.map((p, i) => (
                <div key={i} className="rounded-lg border border-white/10 p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <label className={labelClass}>Project</label>
                      <input
                        className={inputClass}
                        value={p.name}
                        onChange={(e) =>
                          setProjects((prev) =>
                            prev.map((row, idx) => (idx === i ? { ...row, name: e.target.value } : row))
                          )
                        }
                      />
                    </div>
                    <button
                      onClick={() => setProjects((prev) => prev.filter((_, idx) => idx !== i))}
                      className="mt-5 text-white/30 hover:text-rose-300"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className={labelClass}>Status</label>
                      <input
                        className={inputClass}
                        value={p.tag}
                        onChange={(e) =>
                          setProjects((prev) =>
                            prev.map((row, idx) => (idx === i ? { ...row, tag: e.target.value } : row))
                          )
                        }
                        placeholder="e.g. In review, Sequencing"
                      />
                    </div>
                    <div className="w-24">
                      <label className={labelClass}>Progress %</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        className={inputClass}
                        value={p.progress}
                        onChange={(e) =>
                          setProjects((prev) =>
                            prev.map((row, idx) =>
                              idx === i ? { ...row, progress: Number(e.target.value) } : row
                            )
                          )
                        }
                      />
                    </div>
                    <div className="w-28">
                      <label className={labelClass}>Accent</label>
                      <select
                        className={inputClass}
                        value={p.tagColor}
                        onChange={(e) =>
                          setProjects((prev) =>
                            prev.map((row, idx) =>
                              idx === i
                                ? { ...row, tagColor: e.target.value as ProjectStatus["tagColor"] }
                                : row
                            )
                          )
                        }
                      >
                        {ACCENT_OPTIONS.map((c) => (
                          <option key={c} value={c}>
                            {c[0].toUpperCase() + c.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              {projects.length === 0 && <p className="text-xs text-white/30">No projects recorded.</p>}
            </div>
          </section>

          {/* Signals / Blockers */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs tracking-widest text-white/50">SIGNALS &amp; BLOCKERS</h3>
              <button
                onClick={() =>
                  setSignals((prev) => [
                    ...prev,
                    { kind: "note", title: "", detail: "", cta: "Review" },
                  ])
                }
                className="flex items-center gap-1 text-xs text-cyan-300 hover:text-cyan-200"
              >
                <Plus size={13} /> Add signal
              </button>
            </div>
            <div className="space-y-3">
              {signals.map((s, i) => (
                <div key={i} className="rounded-lg border border-white/10 p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <label className={labelClass}>Title</label>
                      <input
                        className={inputClass}
                        value={s.title}
                        onChange={(e) =>
                          setSignals((prev) =>
                            prev.map((row, idx) => (idx === i ? { ...row, title: e.target.value } : row))
                          )
                        }
                      />
                    </div>
                    <button
                      onClick={() => setSignals((prev) => prev.filter((_, idx) => idx !== i))}
                      className="mt-5 text-white/30 hover:text-rose-300"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div>
                    <label className={labelClass}>Detail</label>
                    <input
                      className={inputClass}
                      value={s.detail}
                      onChange={(e) =>
                        setSignals((prev) =>
                          prev.map((row, idx) => (idx === i ? { ...row, detail: e.target.value } : row))
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className={labelClass}>Type</label>
                      <select
                        className={inputClass}
                        value={s.kind}
                        onChange={(e) =>
                          setSignals((prev) =>
                            prev.map((row, idx) =>
                              idx === i ? { ...row, kind: e.target.value as Signal["kind"] } : row
                            )
                          )
                        }
                      >
                        {SIGNAL_KIND_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className={labelClass}>Suggested Action</label>
                      <input
                        className={inputClass}
                        value={s.cta}
                        onChange={(e) =>
                          setSignals((prev) =>
                            prev.map((row, idx) => (idx === i ? { ...row, cta: e.target.value } : row))
                          )
                        }
                        placeholder="e.g. Review, Draft, Resolve"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {signals.length === 0 && <p className="text-xs text-white/30">No signals recorded.</p>}
            </div>
          </section>
        </div>

        <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between shrink-0">
          <div className="text-xs">
            {error && <span className="text-rose-300">{error}</span>}
            {saved && !error && (
              <span className="text-emerald-300">Project state saved. Project intelligence updated.</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-full border border-white/10 px-4 py-2 text-xs text-white/60 hover:text-white/90 hover:border-white/20"
            >
              {saved ? "Done" : "Cancel"}
            </button>
            {!saved && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-full bg-cyan-400/10 border border-cyan-400/40 px-4 py-2 text-xs text-cyan-300 disabled:opacity-40"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
