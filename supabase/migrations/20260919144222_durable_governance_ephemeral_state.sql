-- Durable, server-only operational authority/reference state.
-- This table is not an Operating Picture or memory store. It persists only
-- bounded governance state that must survive process restart.
create table if not exists public.governance_ephemeral_state (
  id uuid primary key,
  kind text not null check (kind in (
    'pending_authorization',
    'calendar_move_authorization'
  )),
  capability text not null,
  payload jsonb not null,
  status text not null default 'active' check (status in ('active','consumed','revoked')),
  created_at timestamptz not null,
  expires_at timestamptz not null,
  consumed_at timestamptz null,
  revoked_at timestamptz null,
  constraint governance_ephemeral_state_lifetime check (expires_at > created_at),
  constraint governance_ephemeral_state_terminal_shape check (
    (status = 'active' and consumed_at is null and revoked_at is null)
    or (status = 'consumed' and consumed_at is not null and revoked_at is null)
    or (status = 'revoked' and revoked_at is not null and consumed_at is null)
  )
);

create index if not exists governance_ephemeral_state_expiry_idx
  on public.governance_ephemeral_state (expires_at);

alter table public.governance_ephemeral_state enable row level security;

revoke all on public.governance_ephemeral_state from anon, authenticated;
grant select, insert, update, delete on public.governance_ephemeral_state to service_role;

create or replace function public.consume_governance_ephemeral_state(
  p_id uuid,
  p_kind text,
  p_capability text,
  p_now timestamptz
)
returns table(status text, payload jsonb, expires_at timestamptz)
language plpgsql
security invoker
set search_path = pg_catalog
as $$
declare
  v_payload jsonb;
  v_expires_at timestamptz;
  v_status text;
  v_kind text;
  v_capability text;
begin
  update public.governance_ephemeral_state
     set status = 'consumed',
         consumed_at = p_now
   where id = p_id
     and kind = p_kind
     and capability = p_capability
     and status = 'active'
     and expires_at > p_now
  returning governance_ephemeral_state.payload,
            governance_ephemeral_state.expires_at
       into v_payload, v_expires_at;

  if found then
    return query select 'consumed'::text, v_payload, v_expires_at;
    return;
  end if;

  select s.status, s.expires_at, s.kind, s.capability
    into v_status, v_expires_at, v_kind, v_capability
    from public.governance_ephemeral_state s
   where s.id = p_id;

  if not found then
    return query select 'not_found'::text, null::jsonb, null::timestamptz;
  elsif v_kind is distinct from p_kind or v_capability is distinct from p_capability then
    return query select 'mismatch'::text, null::jsonb, v_expires_at;
  elsif v_status = 'consumed' then
    return query select 'already_consumed'::text, null::jsonb, v_expires_at;
  elsif v_status = 'revoked' then
    return query select 'revoked'::text, null::jsonb, v_expires_at;
  elsif v_expires_at <= p_now then
    return query select 'expired'::text, null::jsonb, v_expires_at;
  else
    return query select 'unavailable'::text, null::jsonb, v_expires_at;
  end if;
end;
$$;

revoke all on function public.consume_governance_ephemeral_state(uuid, text, text, timestamptz)
  from public, anon, authenticated;
grant execute on function public.consume_governance_ephemeral_state(uuid, text, text, timestamptz)
  to service_role;
