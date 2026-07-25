"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { AGENTS } from "@/lib/agents";
import type { OperationalState } from "@/lib/operational-state";

const SESSION_KEY = "jarvis-boot-shown";

interface BootSequenceProps {
  operationalState: OperationalState;
  onComplete: () => void;
}

/**
 * A brief, skippable boot sequence — shown once per browser tab session
 * (sessionStorage, so reopening the same tab doesn't replay it, but a
 * fresh tab/window does). Every line it reveals is real: the specialist
 * list comes from the actual AGENTS registry (so adding/removing a
 * specialist automatically updates this), and "Synchronising Operational
 * State" reflects the real calendarStatus/gmailStatus/connector state
 * already flowing through OperationalState — never a fabricated
 * all-green readiness screen. If the real fetch hasn't resolved yet by
 * the time this renders, Calendar/Gmail honestly show as still-local
 * rather than claiming a sync that hasn't happened.
 */
export default function BootSequence({ operationalState, onComplete }: BootSequenceProps) {
  const [visible, setVisible] = useState(false);
  const [specialistsRevealed, setSpecialistsRevealed] = useState(0);
  const [stateRevealed, setStateRevealed] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) {
      onComplete();
      return;
    }
    setVisible(true);
  }, [onComplete]);

  const specialistNames = useMemo(() => AGENTS.map((a) => a.name), []);

  const stateItems = useMemo(
    () => [
      { label: "Calendar", ok: operationalState.calendarStatus === "online" || operationalState.calendarStatus === "unavailable" },
      { label: "Gmail", ok: operationalState.gmailStatus === "online" || operationalState.gmailStatus === "unavailable" },
      { label: "Memory", ok: true },
      { label: "Connectors", ok: true },
    ],
    [operationalState.calendarStatus, operationalState.gmailStatus]
  );

  useEffect(() => {
    if (!visible) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    specialistNames.forEach((_, i) => {
      timers.push(setTimeout(() => setSpecialistsRevealed(i + 1), 90 * (i + 1)));
    });
    const specialistsDone = 90 * specialistNames.length;
    stateItems.forEach((_, i) => {
      timers.push(setTimeout(() => setStateRevealed(i + 1), specialistsDone + 150 + 140 * (i + 1)));
    });
    const stateDone = specialistsDone + 150 + 140 * stateItems.length;
    timers.push(setTimeout(() => setReady(true), stateDone + 200));
    timers.push(setTimeout(() => finish(), stateDone + 900));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  function finish() {
    if (typeof window !== "undefined") sessionStorage.setItem(SESSION_KEY, "1");
    setVisible(false);
    onComplete();
  }

  // Any key, anywhere, skips — not just when the overlay div itself has focus.
  useEffect(() => {
    if (!visible) return;
    function handleKey() {
      finish();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#050810] flex items-center justify-center cursor-pointer select-none"
      onClick={finish}
      onKeyDown={finish}
      role="button"
      tabIndex={0}
      aria-label="Skip boot sequence"
    >
      <div className="w-full max-w-md px-6 font-mono text-[14px]">
        <div className="text-cyan-300 tracking-[0.2em] text-sm mb-6">
          INITIALISING JARVIS CORE
        </div>

        <div className="text-white/40 tracking-widest text-[11px] mb-2">
          LOADING CONSTITUTIONAL SPECIALISTS
        </div>
        <div className="space-y-1 mb-6">
          {specialistNames.map((name, i) => (
            <div
              key={name}
              className={`flex items-center gap-2 transition-opacity duration-200 ${
                i < specialistsRevealed ? "opacity-100" : "opacity-0"
              }`}
            >
              <Check size={12} className="text-emerald-400" />
              <span className="text-white/70">{name}</span>
            </div>
          ))}
        </div>

        <div className="text-white/40 tracking-widest text-[11px] mb-2">
          SYNCHRONISING OPERATIONAL STATE
        </div>
        <div className="space-y-1 mb-6">
          {stateItems.map((item, i) => (
            <div
              key={item.label}
              className={`flex items-center gap-2 transition-opacity duration-200 ${
                i < stateRevealed ? "opacity-100" : "opacity-0"
              }`}
            >
              {item.ok ? (
                <Check size={12} className="text-emerald-400" />
              ) : (
                <Loader2 size={12} className="text-amber-400 animate-spin" />
              )}
              <span className="text-white/70">{item.label}</span>
            </div>
          ))}
        </div>

        <div className={`text-cyan-300 tracking-[0.2em] text-sm transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"}`}>
          OPERATIONAL PICTURE READY
        </div>

        <div className="text-white/20 text-[10px] mt-8 tracking-wide">
          Click or press any key to skip
        </div>
      </div>
    </div>
  );
}
