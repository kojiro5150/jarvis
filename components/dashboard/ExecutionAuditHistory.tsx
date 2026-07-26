"use client";

import { useCallback, useEffect, useState } from "react";
import { Clock3, Loader2, RefreshCw } from "lucide-react";

import type { ExecutionAuditRecord } from "@/lib/agents/execution-audit";

export const EXECUTION_AUDIT_UPDATED_EVENT = "jarvis:execution-audit-updated";

export default function ExecutionAuditHistory() {
  const [records, setRecords] = useState<ExecutionAuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/executions?limit=25", { cache: "no-store" });
      const body = (await response.json()) as { records?: ExecutionAuditRecord[]; error?: string };
      if (!response.ok || !Array.isArray(body.records)) {
        throw new Error(body.error ?? "Execution audit history is unavailable");
      }
      setRecords(body.records);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Execution audit history is unavailable");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const refresh = () => void load();
    window.addEventListener(EXECUTION_AUDIT_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(EXECUTION_AUDIT_UPDATED_EVENT, refresh);
  }, [load]);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs tracking-widest text-white/60 font-mono">
            <Clock3 size={14} /> EXECUTION AUDIT HISTORY
          </div>
          <p className="mt-1 text-xs text-white/30">Append-only local JSONL record. Read-only in this interface.</p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 hover:text-white/80 disabled:opacity-40"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
          REFRESH
        </button>
      </div>

      {error && <div className="rounded-lg border border-rose-400/25 bg-rose-500/5 p-3 text-sm text-rose-200/80">{error}</div>}
      {!error && !loading && records.length === 0 && (
        <div className="rounded-lg border border-white/5 bg-black/20 p-4 text-sm text-white/30">No controlled executions recorded yet.</div>
      )}

      <div className="space-y-2">
        {records.map((record) => (
          <article key={record.id} className="rounded-xl border border-white/8 bg-black/20 p-3 text-xs">
            <div className="flex flex-wrap items-center gap-2 text-white/70">
              <span className="font-mono tracking-wider">{record.selectedAgentId.toUpperCase()}</span>
              <span className="text-white/20">·</span>
              <span>{record.requestedAuthority}</span>
              <span className={`ml-auto uppercase ${record.executionStatus === "completed" ? "text-emerald-300" : record.executionStatus === "rejected" ? "text-amber-300" : "text-rose-300"}`}>
                {record.executionStatus}
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-white/60">{record.task}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-white/30">
              <span>{new Date(record.timestamp).toLocaleString()}</span>
              <span>approval: {record.humanApproved ? "yes" : "no"}</span>
              {record.model && <span>{record.model}</span>}
              {record.inputTokens !== undefined && <span>in: {record.inputTokens}</span>}
              {record.outputTokens !== undefined && <span>out: {record.outputTokens}</span>}
            </div>
            {record.reason && <p className="mt-2 text-rose-200/60">{record.reason}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}
