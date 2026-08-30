-- Governed Operating Picture persistence foundation.
-- Persistence mirrors already-governed semantics; it does not create trust or authority.

create table if not exists public.operating_picture_versions (
  version_id uuid primary key,
  record_id text not null,
  previous_version_id uuid null,
  recorded_at timestamptz not null,
  semantic_class text not null check (semantic_class in (
    'fact',
    'user_assertion',
    'inference',
    'plan',
    'commitment',
    'decision',
    'preference',
    'recommendation',
    'open_question'
  )),
  lifecycle text not null check (lifecycle in (
    'current',
    'stale',
    'superseded',
    'withdrawn'
  )),
  subject_namespace text not null,
  subject_entity text not null,
  subject_attribute text not null,
  revision_semantics text not null check (revision_semantics in (
    'append_only',
    'explicit_replacement',
    'authoritative_snapshot'
  )),
  visibility_purposes text[] not null default '{}',
  valid_from timestamptz null,
  valid_until timestamptz null,
  stale_after timestamptz null,
  superseded_by text null,
  payload jsonb not null,
  authorship_source text null check (authorship_source is null or authorship_source in (
    'user',
    'model',
    'governed_system',
    'governed_source',
    'governed_decision_source'
  )),
  authorship_at timestamptz null,
  provenance_source text null,
  provenance_observed_at timestamptz null,

  constraint operating_picture_version_record_pair unique (record_id, version_id),
  constraint operating_picture_previous_same_record
    foreign key (record_id, previous_version_id)
    references public.operating_picture_versions (record_id, version_id)
    deferrable initially immediate,
  constraint operating_picture_authorship_pair
    check ((authorship_source is null) = (authorship_at is null)),
  constraint operating_picture_provenance_pair
    check ((provenance_source is null) = (provenance_observed_at is null)),
  constraint operating_picture_supersession_shape
    check (
      (lifecycle = 'superseded' and superseded_by is not null)
      or (lifecycle <> 'superseded' and superseded_by is null)
    )
);

create unique index if not exists operating_picture_one_initial_version_per_record
  on public.operating_picture_versions (record_id)
  where previous_version_id is null;

create index if not exists operating_picture_versions_recorded_at
  on public.operating_picture_versions (record_id, recorded_at, version_id);

create table if not exists public.operating_picture_heads (
  record_id text primary key,
  version_id uuid not null,
  updated_at timestamptz not null default now(),

  constraint operating_picture_head_exact_version
    foreign key (record_id, version_id)
    references public.operating_picture_versions (record_id, version_id)
    deferrable initially immediate
);

alter table public.operating_picture_versions enable row level security;
alter table public.operating_picture_heads enable row level security;

-- No anon/authenticated policies are created. The Operating Picture is server-owned.
revoke all on public.operating_picture_versions from anon, authenticated;
revoke all on public.operating_picture_heads from anon, authenticated;

create or replace function public.reject_operating_picture_version_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'operating_picture_versions is append-only';
end;
$$;

drop trigger if exists operating_picture_versions_no_update
  on public.operating_picture_versions;
create trigger operating_picture_versions_no_update
before update on public.operating_picture_versions
for each row execute function public.reject_operating_picture_version_mutation();

drop trigger if exists operating_picture_versions_no_delete
  on public.operating_picture_versions;
create trigger operating_picture_versions_no_delete
before delete on public.operating_picture_versions
for each row execute function public.reject_operating_picture_version_mutation();

create or replace function public.append_operating_picture_version(
  p_version_id uuid,
  p_record_id text,
  p_previous_version_id uuid,
  p_recorded_at timestamptz,
  p_semantic_class text,
  p_lifecycle text,
  p_subject_namespace text,
  p_subject_entity text,
  p_subject_attribute text,
  p_revision_semantics text,
  p_visibility_purposes text[],
  p_valid_from timestamptz,
  p_valid_until timestamptz,
  p_stale_after timestamptz,
  p_superseded_by text,
  p_payload jsonb,
  p_authorship_source text,
  p_authorship_at timestamptz,
  p_provenance_source text,
  p_provenance_observed_at timestamptz
)
returns table(status text, reason text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_head uuid;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_record_id, 0));

  select h.version_id
    into v_head
    from public.operating_picture_heads h
    where h.record_id = p_record_id;

  if p_previous_version_id is null then
    if v_head is not null
      or exists (
        select 1
        from public.operating_picture_versions v
        where v.record_id = p_record_id
      ) then
      return query select 'rejected'::text, 'record_already_exists'::text;
      return;
    end if;
  else
    if not exists (
      select 1
      from public.operating_picture_versions v
      where v.record_id = p_record_id
        and v.version_id = p_previous_version_id
    ) then
      return query select 'rejected'::text, 'previous_version_not_found'::text;
      return;
    end if;

    if v_head is distinct from p_previous_version_id then
      return query select 'rejected'::text, 'previous_version_not_current_head'::text;
      return;
    end if;
  end if;

  insert into public.operating_picture_versions (
    version_id,
    record_id,
    previous_version_id,
    recorded_at,
    semantic_class,
    lifecycle,
    subject_namespace,
    subject_entity,
    subject_attribute,
    revision_semantics,
    visibility_purposes,
    valid_from,
    valid_until,
    stale_after,
    superseded_by,
    payload,
    authorship_source,
    authorship_at,
    provenance_source,
    provenance_observed_at
  ) values (
    p_version_id,
    p_record_id,
    p_previous_version_id,
    p_recorded_at,
    p_semantic_class,
    p_lifecycle,
    p_subject_namespace,
    p_subject_entity,
    p_subject_attribute,
    p_revision_semantics,
    coalesce(p_visibility_purposes, '{}'),
    p_valid_from,
    p_valid_until,
    p_stale_after,
    p_superseded_by,
    p_payload,
    p_authorship_source,
    p_authorship_at,
    p_provenance_source,
    p_provenance_observed_at
  );

  insert into public.operating_picture_heads (record_id, version_id, updated_at)
  values (p_record_id, p_version_id, now())
  on conflict (record_id) do update
    set version_id = excluded.version_id,
        updated_at = excluded.updated_at;

  return query select 'appended'::text, null::text;
exception
  when unique_violation then
    return query select 'rejected'::text, 'version_already_exists'::text;
end;
$$;

revoke all on function public.append_operating_picture_version(
  uuid, text, uuid, timestamptz, text, text, text, text, text, text,
  text[], timestamptz, timestamptz, timestamptz, text, jsonb, text,
  timestamptz, text, timestamptz
) from public, anon, authenticated;

grant execute on function public.append_operating_picture_version(
  uuid, text, uuid, timestamptz, text, text, text, text, text, text,
  text[], timestamptz, timestamptz, timestamptz, text, jsonb, text,
  timestamptz, text, timestamptz
) to service_role;
