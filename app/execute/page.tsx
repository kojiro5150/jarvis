"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useState } from "react";

import SpecialistExecutionPanel from "@/components/dashboard/SpecialistExecutionPanel";
import { AGENTS, getAgent } from "@/lib/agents";
import { accentClasses } from "@/lib/agents/accent";

const SPECIALISTS = AGENTS.filter((agent) => agent.tier === "specialist");

export default function SpecialistExecutionPage() {
  const [selectedId, setSelectedId] = useState(SPECIALISTS[0]?.id ?? "oracle");
  const agent = getAgent(selectedId);
  const c = accentClasses(agent.accent);

  return (
    <main className="min-h-screen bg-[#05070b] text-white p-5 md:p-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <Link href="/" className="mb-3 inline-flex items-center gap-2 text-xs text-white/40 hover:text-white/70">
              <ArrowLeft size={13} /> RETURN TO COMMAND CONSOLE
            </Link>
            <h1 className="text-xl tracking-wide">CONTROLLED SPECIALIST EXECUTION</h1>
            <p className="mt-1 text-sm text-white/40">One specialist. One bounded text-only task. No tools or external side effects.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-300/80">
            <ShieldCheck size={15} /> EXECUTION GATE ACTIVE
          </div>
        </header>

        <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <label className="text-[10px] tracking-widest text-white/35 font-mono">SELECT SPECIALIST</label>
            <select
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
              className={`min-w-64 rounded-lg bg-black/60 border ${c.border} px-3 py-2 text-sm text-white/80`}
            >
              {SPECIALISTS.map((specialist) => (
                <option key={specialist.id} value={specialist.id}>
                  {specialist.name} — {specialist.subtitle}
                </option>
              ))}
            </select>
            <span className={`text-xs ${c.text}`}>{agent.behaviouralContract?.role}</span>
          </div>

          <SpecialistExecutionPanel agent={agent} />
        </section>
      </div>
    </main>
  );
}
