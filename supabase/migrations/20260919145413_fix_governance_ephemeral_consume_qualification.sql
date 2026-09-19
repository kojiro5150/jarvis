-- Repair PL/pgSQL ambiguity between the RETURNS TABLE status output name
-- and governance_ephemeral_state.status. Preserve the same atomic semantics.
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
  update public.governance_ephemeral_state as s
     set status = 'consumed',
         consumed_at = p_now
   where s.id = p_id
     and s.kind = p_kind
     and s.capability = p_capability
     and s.status = 'active'
     and s.expires_at > p_now
  returning s.payload, s.expires_at
       into v_payload, v_expires_at;

  if found then
    return query select 'consumed'::text, v_payload, v_expires_at;
    return;
  end if;

  select s.status, s.expires_at, s.kind, s.capability
    into v_status, v_expires_at, v_kind, v_capability
    from public.governance_ephemeral_state as s
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
