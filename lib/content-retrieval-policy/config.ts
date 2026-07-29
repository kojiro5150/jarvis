import { readFile } from "node:fs/promises";
import type { ContentRetrievalPolicy } from "./types";

/** Loads deployment data from an explicit path; absence or malformed JSON fails closed. */
export async function loadContentRetrievalPolicy(path: string | undefined): Promise<ContentRetrievalPolicy | null> {
  if (!path) return null;
  try {
    return JSON.parse(await readFile(path, "utf8")) as ContentRetrievalPolicy;
  } catch {
    return null;
  }
}
