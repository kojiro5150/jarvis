import { JsonlExecutionAuditStore } from "./execution-audit-store";
import { SupabaseExecutionAuditStore } from "./supabase-execution-audit-store";

import type { ExecutionAuditStore } from "./execution-audit-store";

export interface ExecutionAuditStoreEnvironment {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  SUPABASE_SECRET_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  JARVIS_EXECUTION_AUDIT_PATH?: string;
}

/**
 * Select one server-side audit provider deterministically.
 * No Supabase configuration uses JSONL. Partial Supabase configuration fails loudly.
 */
export function createExecutionAuditStore(
  environment: ExecutionAuditStoreEnvironment = process.env
): ExecutionAuditStore {
  const url = environment.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const secretKey = (
    environment.SUPABASE_SECRET_KEY ?? environment.SUPABASE_SERVICE_ROLE_KEY
  )?.trim();
  const hasAnySupabaseConfiguration = Boolean(url || secretKey);

  if (hasAnySupabaseConfiguration && (!url || !secretKey)) {
    throw new Error(
      "Supabase execution audit persistence requires both NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY)"
    );
  }

  if (url && secretKey) {
    return new SupabaseExecutionAuditStore({ url: url.replace(/\/$/, ""), secretKey });
  }

  return new JsonlExecutionAuditStore(environment.JARVIS_EXECUTION_AUDIT_PATH);
}
