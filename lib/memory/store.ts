import fs from "node:fs/promises";
import path from "node:path";
import type { MemoryStore } from "./schema";
import { SEED_MEMORY } from "./seed";

/**
 * Server-only. Local project memory, backed by a JSON file on disk.
 *
 * This is a genuine Phase-1 memory layer — reads and writes actually
 * persist across requests and across `npm run dev` restarts on your own
 * machine. It is NOT a substitute for the Supabase-backed memory planned
 * for a later phase: a Vercel production deployment's filesystem is
 * read-only (aside from /tmp, which doesn't survive between invocations),
 * so writes there silently fail to persist and reads fall back to the
 * seed baked into the deployment. That's an intentional, honest
 * degradation — see DESIGN_CONSTITUTION.md, Phase 1 implementation notes.
 *
 * Every exported function is async even though local reads/writes are
 * fast, so callers (and the connector layer built on top of this) don't
 * need to change shape when a real database backs this later.
 */

const MEMORY_FILE = path.join(process.cwd(), "data", "memory.json");

async function ensureFile(): Promise<void> {
  try {
    await fs.access(MEMORY_FILE);
  } catch {
    await fs.mkdir(path.dirname(MEMORY_FILE), { recursive: true });
    await fs.writeFile(MEMORY_FILE, JSON.stringify(SEED_MEMORY, null, 2), "utf-8");
  }
}

export async function readMemory(): Promise<MemoryStore> {
  try {
    await ensureFile();
    const raw = await fs.readFile(MEMORY_FILE, "utf-8");
    return JSON.parse(raw) as MemoryStore;
  } catch (err) {
    console.warn("[memory] read failed, falling back to seed:", err);
    return SEED_MEMORY;
  }
}

export async function writeMemory(store: MemoryStore): Promise<MemoryStore> {
  const next: MemoryStore = { ...store, updatedAt: new Date().toISOString() };
  try {
    await ensureFile();
    await fs.writeFile(MEMORY_FILE, JSON.stringify(next, null, 2), "utf-8");
  } catch (err) {
    console.warn("[memory] write failed (read-only filesystem?) — change not persisted:", err);
  }
  return next;
}

export async function updateMemory(patch: Partial<MemoryStore>): Promise<MemoryStore> {
  const current = await readMemory();
  return writeMemory({ ...current, ...patch });
}
