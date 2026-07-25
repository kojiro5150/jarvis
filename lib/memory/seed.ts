import type { MemoryStore } from "./schema";

/**
 * Default content for the local memory store — used to initialize
 * data/memory.json on first run, and as the in-memory fallback if the
 * filesystem isn't writable (e.g. a Vercel production deployment, where
 * this Phase-1 JSON layer can't persist — see lib/memory/store.ts).
 *
 * Keep entries in-world: this is Sam's operational picture, not a log of
 * how the dashboard itself was built.
 */
export const SEED_MEMORY: MemoryStore = {
  priorities: [
    {
      rank: 1,
      title: "Governance reasoning review",
      detail: "Final pass on the decision record before it goes to the board.",
      due: "Today",
      urgent: true,
    },
    {
      rank: 2,
      title: "Research brief — market position",
      detail: "Synthesis of competitive signals for the strategy session.",
      due: "Today",
    },
    {
      rank: 3,
      title: "Q3 roadmap sequencing",
      detail: "Lock priority order across the active project set.",
      due: "This week",
    },
  ],

  projects: [
    { name: "Governance Reasoning Framework", tag: "In review", progress: 78, tagColor: "cyan" },
    { name: "Market Research Pipeline", tag: "In progress", progress: 62, tagColor: "violet" },
    { name: "Board Update Pack", tag: "Due this week", progress: 40, tagColor: "amber" },
    { name: "Q3 Roadmap", tag: "Sequencing", progress: 25, tagColor: "emerald" },
  ],

  signals: [
    {
      kind: "deadline",
      title: "Board pack due",
      detail: "Governance summary and roadmap slide need a final pass.",
      cta: "Review",
    },
    {
      kind: "action",
      title: "Two threads need a reply",
      detail: "Flagged by HERALD — neither is urgent, both are aging.",
      cta: "Draft",
    },
    {
      kind: "research",
      title: "New market signal detected",
      detail: "A pattern worth a closer look before the strategy session.",
      cta: "Open",
    },
    {
      kind: "note",
      title: "Sequencing conflict",
      detail: "Two active projects are competing for the same week.",
      cta: "Resolve",
    },
  ],

  calendar: [
    { day: "MON", date: "6", title: "Board catch-up", time: "09:00" },
    { day: "WED", date: "8", title: "Strategy review", time: "14:00" },
    { day: "FRI", date: "10", title: "Research readout", time: "11:30" },
  ],

  gmailThreads: [
    {
      title: "Re: Board pack — final figures",
      from: "Finance",
      detail: "Waiting on confirmation of the Q3 numbers before the pack is locked.",
      waitingSince: "2 days",
    },
    {
      title: "Partnership follow-up",
      from: "External counsel",
      detail: "Short reply needed to keep the timeline moving.",
      waitingSince: "3 days",
    },
  ],

  driveFiles: [
    { name: "Governance Reasoning Record — draft v4", project: "Governance Reasoning Framework", modified: "Yesterday" },
    { name: "Market signals — raw notes", project: "Market Research Pipeline", modified: "2 days ago" },
    { name: "Board Pack — Q3", project: "Board Update Pack", modified: "3 days ago" },
  ],

  updatedAt: new Date(0).toISOString(),
};
