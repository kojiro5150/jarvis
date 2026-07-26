create table if not exists public.execution_audit (
  id uuid primary key,
  created_at timestamptz not null,
  selected_agent_id text not null,
  step_number integer not null check (step_number > 0),
  requested_authority text not null check (requested_authority in ('advise', 'draft', 'propose-action')),
  granted_authority text check (granted_authority in ('advise', 'draft', 'propose-action')),
  task text not null,
  constraints jsonb not null default '[]'::jsonb,
  expected_output text,
  human_approved boolean not null default false,
  preparation_status text not null check (preparation_status in ('prepared', 'rejected')),
  execution_status text not null check (execution_status in ('completed', 'rejected', 'failed')),
  model text,
  input_tokens integer check (input_tokens is null or input_tokens >= 0),
  output_tokens integer check (output_tokens is null or output_tokens >= 0),
  reason text
);

create index if not exists execution_audit_created_at_idx
  on public.execution_audit (created_at desc);

alter table public.execution_audit enable row level security;

revoke all on table public.execution_audit from anon, authenticated;
grant select, insert on table public.execution_audit to service_role;

comment on table public.execution_audit is
  'Append-only server-side audit records for controlled JARVIS specialist execution.';
