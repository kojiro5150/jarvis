"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { Components } from "react-markdown";
import CollapsibleSection from "../ui/CollapsibleSection";

/**
 * Shared dark-glass typography for every rendered markdown surface —
 * opening briefs (lib/briefing.ts's plain-text output still renders fine
 * through this), and every live /api/chat reply. Purely presentational:
 * no change to what text an agent produces.
 */
const MARKDOWN_COMPONENTS: Components = {
  h1: (props) => (
    <h1 className="text-lg font-semibold tracking-[0.02em] text-white/95 mt-3 mb-1.5 first:mt-0" {...props} />
  ),
  h2: (props) => (
    <h2 className="text-base font-semibold tracking-[0.02em] text-white/90 mt-3 mb-1.5 first:mt-0" {...props} />
  ),
  h3: (props) => (
    <h3 className="text-[15px] font-medium tracking-[0.02em] text-white/85 mt-2.5 mb-1 first:mt-0" {...props} />
  ),
  p: (props) => <p className="leading-relaxed mb-2 last:mb-0" {...props} />,
  ul: (props) => <ul className="list-disc pl-5 space-y-1 mb-2" {...props} />,
  ol: (props) => <ol className="list-decimal pl-5 space-y-1 mb-2" {...props} />,
  li: (props) => <li className="leading-relaxed" {...props} />,
  a: (props) => (
    <a className="underline decoration-white/30 hover:decoration-white/60 text-cyan-300" target="_blank" rel="noreferrer" {...props} />
  ),
  strong: (props) => <strong className="font-semibold text-white/95" {...props} />,
  blockquote: (props) => (
    <blockquote className="border-l-2 border-white/15 pl-3 italic text-white/60 my-2" {...props} />
  ),
  hr: () => <hr className="border-white/10 my-3" />,
  code: ({ className, children, ...rest }) => {
    const isBlock = Boolean(className);
    if (!isBlock) {
      return (
        <code className="rounded bg-white/10 px-1.5 py-0.5 text-[0.85em] font-mono text-cyan-200" {...rest}>
          {children}
        </code>
      );
    }
    return (
      <code className={`font-mono text-[0.85em] ${className ?? ""}`} {...rest}>
        {children}
      </code>
    );
  },
  pre: (props) => (
    <pre className="rounded-lg bg-black/40 border border-white/10 p-3 overflow-x-auto mb-2 text-[14px]" {...props} />
  ),
  table: (props) => (
    <div className="overflow-x-auto mb-2 rounded-lg border border-white/10">
      <table className="w-full text-xs border-collapse" {...props} />
    </div>
  ),
  thead: (props) => <thead className="bg-white/5" {...props} />,
  th: (props) => <th className="text-left font-medium text-white/70 px-3 py-2 border-b border-white/10" {...props} />,
  td: (props) => <td className="px-3 py-2 border-b border-white/5 text-white/80 align-top" {...props} />,
};

function renderMarkdown(content: string) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={MARKDOWN_COMPONENTS}>
      {content}
    </ReactMarkdown>
  );
}

/** Splits on H2 ("## ") boundaries — used to decide whether a response is long/structured enough to collapse. */
function splitIntoSections(content: string): { title: string; body: string }[] | null {
  const lines = content.split("\n");
  const headingIndices: number[] = [];
  lines.forEach((line, i) => {
    if (/^##\s+.+/.test(line)) headingIndices.push(i);
  });

  if (headingIndices.length < 2) return null;

  const sections: { title: string; body: string }[] = [];
  headingIndices.forEach((startIdx, i) => {
    const title = lines[startIdx].replace(/^##\s+/, "").trim();
    const endIdx = headingIndices[i + 1] ?? lines.length;
    const body = lines.slice(startIdx + 1, endIdx).join("\n").trim();
    sections.push({ title, body });
  });

  return sections;
}

interface MarkdownMessageProps {
  content: string;
}

/**
 * Renders one message's content. Short/unstructured text (the common
 * case — opening briefs, quick replies) renders directly. A response
 * with 2+ "## " headings (a genuinely long, structured answer) instead
 * renders as collapsible sections — first one open, rest collapsed — so
 * a long JARVIS/DAWNWATCH read-out doesn't become a wall of text. This
 * is pure post-processing of the text an agent already produced; no
 * prompt or backend change is required for it to work.
 *
 * v29 (Sprint 11, Section 1): body text corrected to the v16 typography
 * spec's actual Body Primary definition — Inter Regular, 14px/22px line
 * height — down from an oversized 17px/1.7 that had drifted from spec
 * over prior passes. This isn't a new, smaller size being introduced;
 * it's reverting to what was already specified.
 *
 * v35 (Sprint 17, Section 9): the `max-w-[90ch]` cap below is gone —
 * flagged as visibly narrowing Mission Workspace's text into an indented
 * column rather than spanning the panel's actual full width. `90ch` at
 * this 14px body size is roughly 630px, well short of the Mission
 * Workspace panel's real width — the cap was doing real, visible work,
 * not a no-op. AgentDocument's `border-l-2` accent (ConversationDock.tsx)
 * was kept as the intentional document-vs-bubble differentiator it's
 * been since Sprint 8, rather than removed too — it's a 2px line, not a
 * width constraint, so it wasn't the source of the narrowing itself.
 */
export default function MarkdownMessage({ content }: MarkdownMessageProps) {
  const sections = splitIntoSections(content);

  if (!sections) {
    return <div className="text-[14px] leading-[22px] text-white/85">{renderMarkdown(content)}</div>;
  }

  const preamble = content.split("\n").slice(0, content.split("\n").findIndex((l) => /^##\s+.+/.test(l))).join("\n").trim();

  return (
    <div className="text-[14px] leading-[22px] text-white/85 space-y-2">
      {preamble && <div>{renderMarkdown(preamble)}</div>}
      {sections.map((section, i) => (
        <CollapsibleSection key={`${section.title}-${i}`} title={section.title} defaultOpen={i === 0}>
          {renderMarkdown(section.body)}
        </CollapsibleSection>
      ))}
    </div>
  );
}
