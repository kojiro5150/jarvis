"use client";

import { useEffect, useState } from "react";
import { Loader2, Play, ShieldCheck } from "lucide-react";

import MarkdownMessage from "../markdown/MarkdownMessage";
import { accentClasses } from "@/lib/agents/accent";
import {
  buildSpecialistExecutionRequest,
  parseSpecialistExecutionResponse,
} from "@/lib/agents/execution-client";

import type { AgentDefinition, HandoffAuthority } from "@/lib/agents/types";
import type { SpecialistExecutionUiResult } from "@/lib/agents/execution-client";

export default function SpecialistExecutionPanel({ agent }: { agent: AgentDefinition }) {
  const contract = agent.behaviouralContract;
  const authorities = contract?.authority ?? [];
  const [authority, setAuthority] = useState<HandoffAuthority>(authorities[0] ?? "advise");
  const [task, setTask] = useState("");
  const [constraintsText, setConstraintsText] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [humanApproved, setHumanApproved] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SpecialistExecutionUiResult | null>(null);
  const c = accentClasses(agent.accent);

  useEffect(() => {
    setAuthority(authorities[0] ?? "advise");
    setTask("");
    setConstraintsText("");
    setExpectedOutput("");
    setHumanApproved(false);
    setResult(null);
    // authority values are stable registry metadata; reset only when agent changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent.id]);

  async function handleExecute(event: React.FormEvent) {
    event.preventDefault();
    const request = buildSpecialistExecutionRequest(agent, {
      authority,
      task,
      constraintsText,
      expectedOutput,
      humanApproved,
    });

    if (!request) {
      setResult({ status: "rejected", reason: "Task or authority is not valid for this specialist" });
      return;
    }

    setRunning(true);
    setResult(null);
    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      setResult(parseSpecialistExecutionResponse(await response.json()));
    } catch {
      setResult({ status: "failed", reason: "Execution link interrupted" });
    } finally {
      setRunning(false);
    }
  }

  if (!contract || authorities.length === 0) {
    return <div className="p-5 text-sm text-white/40">This specialist has no executable authority declared.</div>;
  }

  const approvalRequired = authority === "propose-action";

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <form onSubmit={handleExecute} className="space-y-3">
          <div>
            <label className="block text-[10px] tracking-widest text-white/35 font-mono mb-1.5">TASK</label>
            <textarea
              value={task}
              onChange={(event) => setTask(event.target.value)}
              rows={3}
              placeholder={`Give ${agent.name} one bounded task...`}
              className={`w-full rounded-xl bg-white/5 border ${c.border} px-3 py-2.5 text-sm text-white/90 placeholder-white/25 outline-none focus:ring-2 ${c.ring}`}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] tracking-widest text-white/35 font-mono mb-1.5">AUTHORITY</label>
              <select
                value={authority}
                onChange={(event) => {
                  setAuthority(event.target.value as HandoffAuthority);
                  setHumanApproved(false);
                }}
                className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white/80"
              >
                {authorities.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] tracking-widest text-white/35 font-mono mb-1.5">EXPECTED OUTPUT — OPTIONAL</label>
              <input
                value={expectedOutput}
                onChange={(event) => setExpectedOutput(event.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white/80 outline-none"
                placeholder={contract.outputContract}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] tracking-widest text-white/35 font-mono mb-1.5">CONSTRAINTS — ONE PER LINE</label>
            <textarea
              value={constraintsText}
              onChange={(event) => setConstraintsText(event.target.value)}
              rows={2}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white/80 outline-none"
              placeholder="Use confirmed information only"
            />
          </div>

          {approvalRequired && (
            <label className="flex items-start gap-2 rounded-lg border border-amber-400/25 bg-amber-400/5 px-3 py-2 text-xs text-amber-100/80">
              <input
                type="checkbox"
                checked={humanApproved}
                onChange={(event) => setHumanApproved(event.target.checked)}
                className="mt-0.5"
              />
              I explicitly approve generation of a proposed action. This does not execute the action.
            </label>
          )}

          <button
            type="submit"
            disabled={running || !task.trim() || (approvalRequired && !humanApproved)}
            className={`inline-flex items-center gap-2 rounded-lg border ${c.border} ${c.bg} px-4 py-2 text-sm ${c.text} disabled:opacity-35`}
          >
            {running ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            {running ? `${agent.name} RUNNING` : `EXECUTE ${agent.name}`}
          </button>
        </form>

        <aside className="rounded-xl border border-white/10 bg-black/20 p-4 text-xs text-white/50 space-y-3">
          <div className="flex items-center gap-2 text-white/70"><ShieldCheck size={14} className={c.text} /> CONTROL BOUNDARY</div>
          <div><span className="text-white/30">SPECIALIST</span><br />{agent.name} — {contract.role}</div>
          <div><span className="text-white/30">DECLARED AUTHORITY</span><br />{authorities.join(" · ")}</div>
          <div><span className="text-white/30">OUTPUT CONTRACT</span><br />{contract.outputContract}</div>
          <p className="text-white/30">One text-only model execution. No tools, external side effects, automatic routing, multi-agent run or synthesis.</p>
        </aside>
      </div>

      {result && (
        <div className={`mt-4 rounded-xl border p-4 ${result.status === "completed" ? `${c.border} bg-white/[0.03]` : "border-rose-400/30 bg-rose-500/5"}`}>
          <div className="mb-2 text-[10px] tracking-widest font-mono text-white/35">
            {result.status === "completed" ? `COMPLETED${result.model ? ` · ${result.model}` : ""}` : result.status.toUpperCase()}
          </div>
          {result.status === "completed" ? <MarkdownMessage content={result.content} /> : <p className="text-sm text-rose-200/80">{result.reason}</p>}
        </div>
      )}
    </div>
  );
}
