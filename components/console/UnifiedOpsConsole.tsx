"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Specialist = { id: string; name: string; purpose: string; invokedOnly: boolean };
type Message = { role: "user" | "assistant"; content: string; error?: boolean };

const icons = ["◎", "◈", "✎", "◇", "⚑"];
const colours = ["#a78bfa", "#34d399", "#f472b6", "#60a5fa", "#f59e0b"];

function Tile({ specialist, active, index, onSelect }: { specialist: Specialist; active: boolean; index: number; onSelect: () => void }) {
  return (
    <button className={`specialist ${active ? "selected" : ""}`} type="button" onClick={onSelect}>
      <span className="specialist-icon" style={{ color: colours[index % colours.length] }}>{icons[index % icons.length]}</span>
      <span className="specialist-copy"><b>{specialist.name}</b><small>{specialist.purpose}</small></span>
      <span className="ready">● READY</span>
    </button>
  );
}

export default function UnifiedOpsConsole() {
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Record<string, Message[]>>({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let live = true;
    fetch("/api/lighter/specialists")
      .then(async response => {
        const data = await response.json() as { specialists?: Specialist[]; error?: string };
        if (!response.ok) throw new Error(data.error || `Unable to load specialists (${response.status}).`);
        if (live) setSpecialists(data.specialists ?? []);
      })
      .catch(error => { if (live) setListError(error instanceof Error ? error.message : "Unable to load specialists."); });
    return () => { live = false; };
  }, []);

  useEffect(() => {
    const updateJarvisMelbClock = () => {
      const el = document.getElementById("jarvis-melb-clock");
      if (!el) return;
      const now = new Date();
      const datePart = new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Melbourne", month: "short", day: "2-digit", year: "numeric" }).format(now).toUpperCase().replace(",", "");
      const timePart = new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Melbourne", hour: "numeric", minute: "2-digit", hour12: true }).format(now).toUpperCase();
      el.textContent = `${datePart} · ${timePart}`;
    };
    updateJarvisMelbClock();
    const timer = window.setInterval(updateJarvisMelbClock, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const dawnwatch = specialists.find(item => item.id === "dawnwatch");
  const intelligence = specialists.filter(item => item.id !== "dawnwatch");
  const selected = specialists.find(item => item.id === selectedId);
  const messages = useMemo(() => selectedId ? conversations[selectedId] ?? [] : [], [conversations, selectedId]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, loading]);

  async function send(event: FormEvent) {
    event.preventDefault();
    const content = input.trim();
    if (!selected || !content || loading) return;
    const nextMessages: Message[] = [...messages, { role: "user", content }];
    setConversations(current => ({ ...current, [selected.id]: nextMessages }));
    setInput("");
    setLoading(true);
    try {
      const response = await fetch("/api/lighter/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ specialistId: selected.id, messages: nextMessages.map(({ role, content: text }) => ({ role, content: text })) }),
      });
      const data = await response.json() as { reply?: string; error?: string };
      if (!response.ok) throw new Error(data.error || `${response.status} ${response.statusText}`);
      setConversations(current => ({ ...current, [selected.id]: [...(current[selected.id] ?? nextMessages), { role: "assistant", content: data.reply ?? "" }] }));
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unknown request error.";
      setConversations(current => ({ ...current, [selected.id]: [...(current[selected.id] ?? nextMessages), { role: "assistant", content: detail, error: true }] }));
    } finally { setLoading(false); }
  }

  return (
    <main className="console-page">
      <section className="console-frame">
        <aside className="sidebar">
          <header className="brand"><span className="brand-mark">J</span><span><b>J.A.R.V.I.S</b><small>Just A Very Intelligent System</small></span></header>
          <div className="label">EXECUTIVE OPERATIONS</div>
          <button className={`executive ${selectedId === null ? "selected" : ""}`} type="button" onClick={() => setSelectedId(null)}><span className="jarvis-icon">◎</span><span className="specialist-copy"><b>JARVIS</b><small>Orchestrator</small></span><span className="active">● ACTIVE</span></button>
          {dawnwatch ? <button className={`dawnwatch ${selectedId === dawnwatch.id ? "selected" : ""}`} type="button" onClick={() => setSelectedId(dawnwatch.id)}><span className="dawn-icon">☀</span><span className="specialist-copy"><b>DAWNWATCH</b><small>{dawnwatch.purpose}</small></span><span className="active">● ACTIVE</span></button> : <div className="dawnwatch loading-tile">Loading DAWNWATCH…</div>}
          <div className="label intelligence-label">SPECIALIST INTELLIGENCE</div>
          {intelligence.map((specialist, index) => <Tile key={specialist.id} specialist={specialist} active={selectedId === specialist.id} index={index} onSelect={() => setSelectedId(specialist.id)} />)}
          {listError && <div className="sidebar-error">{listError}</div>}
          <div className="sidebar-spacer" />
          <div className="connectors">
            <p><span>CALENDAR</span><u>DISCONNECT</u></p><p><span>GMAIL</span><u>DISCONNECT</u></p><p><span>DRIVE</span><u>DISCONNECT</u></p>
            <p><span>MEMORY</span><em>● ONLINE</em></p><p><span>PROJECTS</span><span>● READY</span></p><p><span>GITHUB</span><i>NOT CONNECTED</i></p>
          </div>
          <div className="core">JARVIS CORE v2.0.0<br />BUILT FOR SAM HAYWARD<br />GOVERNANCE ENGINEERING</div>
          <div className="online">● JARVIS STATUS — ONLINE</div><div className="connector-count">3/3 CONNECTORS LIVE</div>
        </aside>

        <div className="command-area">
          <div className="statusbar"><span className="picture">● &nbsp; OPERATIONAL PICTURE · <span id="jarvis-melb-clock">AUG 03, 2026 · 11:51 AM</span></span><span className="status-items"><b>▷ EXECUTE</b><span>♬ VOICE: STANDBY</span><span>● SYSTEM: NOMINAL</span><span>◎ CONNECTORS: 3/3 LIVE</span><span>⌂ SESSION SECURE</span><span>⚙</span></span></div>
          <div className="workspace">
            <div className="grid" /><div className="amber-glow" /><div className="cyan-glow" /><div className="scanline" />
            <div className="stars"><i /><i /><i /><i /><i /><i /><b /><b /><b /></div>
            <div className="workspace-head">
              <div className="mission"><div className="orb"><i /><i /><b /><b /><em /></div><div><h1>MISSION WORKSPACE</h1><small>ORB · NOMINAL · REF-640</small></div></div>
              <div className="tabs"><b>ACTIVE</b><span>ARTIFACTS</span><span>FILES</span><span>MEMORY</span><span>REASONING</span><i className="reticle">⊙</i><small>SIG&nbsp; <b>92%</b><br />LATENCY&nbsp; <b>12MS</b></small></div>
            </div>
            <div className="shimmer" />
            <div className="next"><span>▤</span> Next: <b>Governance Engineering Test</b>, MON 15:15 <i>|</i><span>↗</span> Governance Reasoning Framework <em /> <span>✉</span> 5 recent comms</div>
            <div className="conversation-frame"><div className="spin-border" /><div className="conversation">
              <i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" />
              <div className="messages" ref={scrollRef}>
                {!selected && <div className="home-state"><h2>JARVIS ORCHESTRATOR</h2><p>Select DAWNWATCH or a specialist intelligence unit to begin a governed conversation.</p></div>}
                {selected && messages.length === 0 && <div className="home-state"><h2>{selected.name}</h2><p>{selected.purpose}</p><small>READY FOR INVOCATION</small></div>}
                {messages.map((message, index) => <div key={`${message.role}-${index}`} className={`message ${message.role} ${message.error ? "error" : ""}`}><b>{message.role === "user" ? "YOU" : selected?.name}</b><p>{message.content}</p></div>)}
                {loading && <div className="message assistant loading"><b>{selected?.name}</b><p>PROCESSING REQUEST<span>…</span></p></div>}
              </div>
              <div className="marquee"><div><span>SIG RADAR · NOMINAL</span><span>MEMORY SYNC · OK</span><span>CONNECTORS · 3/3 LIVE</span><span>VOICE · STANDBY</span><span>SESSION · SECURE</span><span>SIG RADAR · NOMINAL</span><span>MEMORY SYNC · OK</span></div></div>
              <div className="tools"><span>🎙<small>Voice</small></span><span>🔍<small>Search</small></span><span className="brief">▤<small>Brief Me</small></span><span>◎<small>Focus</small></span><button type="button" disabled={selectedId === null} onClick={() => setSelectedId(null)}>⬡<small>Ask JARVIS</small></button></div>
            </div></div>
          </div>
          <form className="composer" onSubmit={send}><span>📎</span><input aria-label={selected ? `Ask ${selected.name} anything` : "Select a specialist"} disabled={!selected || loading} value={input} onChange={event => setInput(event.target.value)} placeholder={selected ? `Ask ${selected.name} anything...` : "Select a specialist to begin..."} /><span>🎙</span><button type="submit" disabled={!selected || loading || !input.trim()} aria-label="Send message">➤</button></form>
        </div>
      </section>
      <style jsx global>{`
        @keyframes orbPulse{0%,100%{opacity:.55;transform:scale(1)}50%{opacity:.9;transform:scale(1.06)}}@keyframes scanline{0%{transform:translateY(-100%)}100%{transform:translateY(900%)}}@keyframes ringSpin{to{transform:rotate(360deg)}}@keyframes orbitDot{to{transform:rotate(360deg) translateX(26px) rotate(-360deg)}}@keyframes glowPulse{0%,100%{box-shadow:0 0 0 1px rgba(94,231,255,.05),0 20px 50px #0006,inset 0 1px #fff1,0 0 26px rgba(94,231,255,.05)}50%{box-shadow:0 0 0 1px rgba(94,231,255,.18),0 20px 60px #0008,inset 0 1px #fff1,0 0 54px rgba(94,231,255,.18)}}@keyframes twinkle{0%,100%{opacity:.12;transform:scale(.7)}50%{opacity:.85;transform:scale(1.3)}}@keyframes shimmer{to{background-position:260px 0}}@keyframes pulseRing{0%{transform:scale(.85);opacity:.6}100%{transform:scale(1.6);opacity:0}}@keyframes beamFade{0%,100%{opacity:.05}50%{opacity:.22}}@keyframes textShimmer{to{background-position:200% 0}}@keyframes framePulse{0%,100%{box-shadow:0 30px 90px #000b,0 0 0 1px rgba(94,231,255,.06),0 0 40px rgba(94,231,255,.05)}50%{box-shadow:0 30px 90px #000b,0 0 0 1px rgba(94,231,255,.16),0 0 70px rgba(94,231,255,.14)}}@keyframes marquee{to{transform:translateX(-50%)}}
        .console-page *{box-sizing:border-box}.console-page{display:flex;align-items:center;justify-content:center;min-height:100vh;padding:40px;background:#05070b;color:#a8b3c5;font-family:'Space Grotesk',sans-serif}.console-frame{display:flex;width:1800px;height:1130px;background:#0b0f16;border:1px solid rgba(94,231,255,.18);border-radius:6px;overflow:hidden;animation:framePulse 6s ease-in-out infinite}.sidebar{width:340px;flex-shrink:0;background:#0d121c;border-right:1px solid #1a2233;display:flex;flex-direction:column;padding:24px 20px}.brand{display:flex;align-items:center;gap:12px;margin-bottom:22px}.brand-mark{width:44px;height:44px;border-radius:6px;background:#123043;border:1px solid #2a5b73;display:grid;place-items:center;color:#5ee7ff;font:700 18px 'IBM Plex Mono'}.brand b{display:block;color:#e8edf5;font:700 17px 'IBM Plex Mono';letter-spacing:1px}.brand small,.specialist-copy small{display:block;color:#5c6b82;font-size:11px;margin-top:2px}.label{color:#4a5872;font:10px 'IBM Plex Mono';letter-spacing:1.5px;margin:10px 0 8px}.intelligence-label{margin-top:8px}.executive,.specialist,.dawnwatch{border:0;width:100%;display:flex;align-items:center;gap:12px;text-align:left;font-family:inherit;cursor:pointer}.executive{padding:10px;border-radius:6px;margin-bottom:6px;background:transparent}.selected{box-shadow:inset 0 0 0 1px rgba(94,231,255,.3)!important;background:#111b29!important}.jarvis-icon,.specialist-icon,.dawn-icon{width:34px;height:34px;flex:none;border-radius:6px;display:grid;place-items:center}.jarvis-icon{background:#123043;border:1px solid #2a5b73;color:#5ee7ff;font-size:16px}.specialist-copy{flex:1;min-width:0}.specialist-copy b{color:#dbe3ef;font-size:13px}.active{color:#3ddc97;font:10px 'IBM Plex Mono'}.dawnwatch{padding:12px 10px;border-radius:6px;margin-bottom:16px;background:#1a1409;border:1px solid #4a3a12}.dawn-icon{background:#3a2a0d;border:1px solid #8a6a1f;color:#f0a83c}.dawnwatch .specialist-copy b{color:#f0a83c}.specialist{padding:9px 10px;border-radius:6px;margin-bottom:4px;background:transparent}.specialist-icon{background:#161d2b;border:1px solid #262f42}.ready{color:#5c6b82;font:10px 'IBM Plex Mono';white-space:nowrap}.loading-tile{color:#8a7a5c;font-size:11px}.sidebar-error{color:#f87171;font-size:11px;padding:8px}.sidebar-spacer{flex:1}.connectors{border-top:1px solid #1a2233;padding-top:10px}.connectors p{display:flex;justify-content:space-between;margin:0 0 9px;font-size:11px;color:#5c6b82}.connectors u{color:#5ee7ff}.connectors em{color:#3ddc97;font-style:normal}.connectors i{color:#3a4458;font-style:normal}.core{margin-top:7px;font:10px/1.6 'IBM Plex Mono';color:#3a4458}.online{margin-top:10px;color:#3ddc97;font:11px 'IBM Plex Mono'}.connector-count{color:#5c6b82;font:10px 'IBM Plex Mono'}.command-area{flex:1;min-width:0;display:flex;flex-direction:column;background:#0b0f16}.statusbar{height:47px;display:flex;align-items:center;justify-content:space-between;padding:14px 24px;border-bottom:1px solid #1a2233;font:12px 'IBM Plex Mono';white-space:nowrap}.picture,.status-items b{color:#5ee7ff}.status-items{display:flex;gap:24px;color:#8a97ad}.workspace{flex:1;padding:22px 24px;display:flex;flex-direction:column;position:relative;overflow:hidden}.grid,.amber-glow,.cyan-glow,.scanline,.stars{position:absolute;pointer-events:none}.grid{inset:0;background-image:linear-gradient(rgba(94,231,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(94,231,255,.035) 1px,transparent 1px);background-size:42px 42px}.amber-glow{top:-120px;right:-100px;width:520px;height:520px;border-radius:50%;background:radial-gradient(circle,rgba(240,168,60,.13),transparent 65%)}.cyan-glow{bottom:-160px;left:15%;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(94,231,255,.07),transparent 65%)}.scanline{left:0;right:0;height:140px;background:linear-gradient(transparent,rgba(94,231,255,.05),transparent);animation:scanline 9s linear infinite}.stars{inset:0}.stars i{position:absolute;width:3px;height:3px;border-radius:50%;background:#5ee7ff;animation:twinkle 4s infinite}.stars i:nth-child(1){top:80px;left:8%}.stars i:nth-child(2){top:220px;left:22%;background:#f0a83c}.stars i:nth-child(3){top:140px;left:46%}.stars i:nth-child(4){top:340px;left:64%}.stars i:nth-child(5){top:60px;left:78%;background:#f0a83c}.stars i:nth-child(6){top:400px;left:12%}.stars b{position:absolute;top:0;bottom:0;width:1px;background:linear-gradient(transparent,#5ee7ff,transparent);animation:beamFade 6s infinite}.stars b:nth-of-type(1){left:30%}.stars b:nth-of-type(2){left:58%;background:linear-gradient(transparent,#f0a83c,transparent)}.stars b:nth-of-type(3){left:85%}.workspace-head,.shimmer,.next,.conversation-frame{position:relative;z-index:1}.workspace-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}.mission{display:flex;align-items:center;gap:14px}.mission h1{margin:0;font-size:19px;letter-spacing:1.5px;background:linear-gradient(90deg,#e8edf5,#5ee7ff,#e8edf5,#f0a83c,#e8edf5);background-size:200%;background-clip:text;color:transparent;animation:textShimmer 5s linear infinite}.mission small{color:#5c6b82;font:11px 'IBM Plex Mono'}.orb{position:relative;width:52px;height:52px}.orb i{position:absolute;inset:-14px;border-radius:50%;border:1px solid rgba(94,231,255,.4);animation:pulseRing 3s infinite}.orb i:nth-child(2){animation-delay:1.5s}.orb b{position:absolute;inset:0;border-radius:50%;border:2px solid #f0a83c;opacity:.4;animation:ringSpin 6s linear infinite}.orb b:nth-of-type(2){inset:4px;border:1px solid #5ee7ff;animation-direction:reverse}.orb em{position:absolute;inset:12px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#ffd27a,#f0a83c 60%,#7a4c0d);animation:orbPulse 4s infinite;box-shadow:0 0 18px #f0a83c80}.tabs{display:flex;align-items:center;gap:22px;font:12px 'IBM Plex Mono';color:#5c6b82}.tabs>b{color:#f0a83c;padding-bottom:4px;border-bottom:2px solid #f0a83c}.tabs small{font-size:9px;color:#3a4a5e;border-left:1px solid #1e293b;padding-left:16px}.tabs small b{color:#5ee7ff}.reticle{font-size:26px;color:#5ee7ff;animation:ringSpin 12s linear infinite}.shimmer{height:1px;margin-bottom:14px;background:linear-gradient(90deg,transparent,rgba(94,231,255,.35) 20%,rgba(94,231,255,.35) 40%,transparent 60%);background-size:260px;animation:shimmer 3.5s linear infinite}.next{display:flex;align-items:center;gap:10px;background:#101828;border:1px solid #1e293b;border-left:2px solid #5ee7ff;border-radius:6px;padding:10px 14px;margin-bottom:14px;font-size:12px}.next span{color:#5ee7ff}.next b{color:#dbe3ef}.next i{color:#2a3448;margin:0 6px}.next em{flex:1}.conversation-frame{flex:1;border-radius:10px;padding:1.5px;overflow:hidden}.spin-border{position:absolute;inset:-50%;background:conic-gradient(rgba(94,231,255,.05),rgba(94,231,255,.7),rgba(240,168,60,.5),rgba(94,231,255,.05));animation:ringSpin 8s linear infinite}.conversation{position:relative;height:100%;background:#0d1420;border-radius:8px;overflow:hidden;animation:glowPulse 5s infinite}.conversation:before{content:"";position:absolute;inset:0 0 auto;height:60px;background:linear-gradient(rgba(94,231,255,.06),transparent)}.corner{position:absolute;width:18px;height:18px;z-index:3;opacity:.6}.tl{top:14px;left:14px;border-top:1.5px solid #5ee7ff;border-left:1.5px solid #5ee7ff}.tr{top:14px;right:14px;border-top:1.5px solid #5ee7ff;border-right:1.5px solid #5ee7ff}.bl{bottom:14px;left:14px;border-bottom:1.5px solid #5ee7ff;border-left:1.5px solid #5ee7ff}.br{bottom:14px;right:14px;border-bottom:1.5px solid #5ee7ff;border-right:1.5px solid #5ee7ff}.messages{position:absolute;inset:0 0 80px;padding:30px 28px 80px;overflow-y:auto}.home-state{text-align:center;margin-top:160px}.home-state h2{color:#dbe3ef;letter-spacing:2px;font:700 18px 'IBM Plex Mono'}.home-state p{color:#7c899d;font-size:13px}.home-state small{color:#3ddc97;font:10px 'IBM Plex Mono'}.message{max-width:78%;margin:0 0 18px}.message b{color:#5ee7ff;font:10px 'IBM Plex Mono'}.message p{white-space:pre-wrap;margin:5px 0 0;padding:12px 14px;border:1px solid #1e293b;border-radius:6px;background:#101828;color:#c2ccda;font-size:13px;line-height:1.55}.message.user{margin-left:auto}.message.user b{display:block;text-align:right;color:#f0a83c}.message.user p{border-color:#4a3a12}.message.error p{border-color:#7f1d1d;color:#fca5a5}.message.loading p{color:#5c6b82}.marquee{position:absolute;bottom:0;left:0;right:0;height:26px;overflow:hidden;border-top:1px solid #1a2233;background:#0a0f18}.marquee div{display:flex;width:max-content;gap:48px;white-space:nowrap;font:10px 'IBM Plex Mono';color:#3a4a5e;padding:6px 0 0 28px;animation:marquee 18s linear infinite}.tools{position:absolute;bottom:34px;right:28px;display:flex;gap:10px;background:rgba(16,24,40,.85);backdrop-filter:blur(8px);border:1px solid rgba(94,231,255,.25);border-radius:30px;padding:8px 10px;box-shadow:0 10px 30px #0008}.tools>span,.tools button{display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 12px;border:0;border-radius:20px;background:transparent;color:#8a97ad;font-size:14px}.tools small{font:10px 'IBM Plex Mono';white-space:nowrap}.tools .brief{background:#182234;color:#5ee7ff}.tools button{cursor:pointer}.tools button:disabled{cursor:not-allowed;color:#414b5b;background:#0c121c;opacity:.65}.composer{height:63px;display:flex;align-items:center;gap:12px;padding:14px 24px;border-top:1px solid #1a2233}.composer>span{color:#5c6b82}.composer input{flex:1;background:#101828;border:1px solid #1e293b;border-radius:20px;padding:10px 18px;color:#dbe3ef;font-size:13px;outline:none}.composer input:focus{border-color:#5ee7ff}.composer input:disabled{color:#5c6b82}.composer button{width:34px;height:34px;border:0;border-radius:50%;background:#f0a83c;color:#1a1409;cursor:pointer}.composer button:disabled{background:#3a4458;color:#202733;cursor:not-allowed}
        @media(max-width:1200px){.console-page{padding:0;align-items:flex-start;justify-content:flex-start;overflow:auto}.console-frame{transform-origin:top left;min-width:1800px}.status-items{gap:12px}}
      `}</style>
    </main>
  );
}
