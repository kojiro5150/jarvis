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
    ),
  constraint operating_picture_semantic_source_shape
    check (
      (semantic_class = 'fact'
        and authorship_source is null
        and provenance_source is not null)
      or (semantic_class = 'user_assertion'
        and authorship_source = 'user'
        and provenance_source is null)
      or (semantic_class = 'inference'
        and authorship_source = 'model'
        and provenance_source is null)
      or (semantic_class = 'plan'
        and (
          (authorship_source = 'user' and provenance_source is null)
          or (authorship_source = 'governed_system' and provenance_source is not null)
        ))
      or (semantic_class = 'commitment'
        and (
          (authorship_source = 'user' and provenance_source is null)
          or (authorship_source = 'governed_source' and provenance_source is not null)
        ))
      or (semantic_class = 'decision'
        and (
          (authorship_source = 'user' and provenance_source is null)
          or (authorship_source = 'governed_decision_source' and provenance_source is not null)
        ))
      or (semantic_class = 'preference'
        and authorship_source = 'user'
        and provenance_source is null)
      or (semantic_class = 'recommendation'
        and authorship_source = 'model'
        and provenance_source is null)
      or (semantic_class = 'open_question'
        and authorship_source = 'model'
        and provenance_source is null)
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
  v_previous public.operating_picture_versions%rowtype;
  v_payload jsonb := coalesce(p_payload, 'null'::jsonb);
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

    if p_lifecycle <> 'current' or p_superseded_by is not null then
      return query select 'rejected'::text, 'transition_invalid'::text;
      return;
    end if;
  else
    select v.*
      into v_previous
      from public.operating_picture_versions v
      where v.record_id = p_record_id
        and v.version_id = p_previous_version_id;

    if not found then
      return query select 'rejected'::text, 'previous_version_not_found'::text;
      return;
    end if;

    if v_head is distinct from p_previous_version_id then
      return query select 'rejected'::text, 'previous_version_not_current_head'::text;
      return;
    end if;

    if v_previous.semantic_class is distinct from p_semantic_class
      or v_previous.subject_namespace is distinct from p_subject_namespace
      or v_previous.subject_entity is distinct from p_subject_entity
      or v_previous.subject_attribute is distinct from p_subject_attribute
      or v_previous.revision_semantics is distinct from p_revision_semantics
      or v_previous.visibility_purposes is distinct from coalesce(p_visibility_purposes, '{}')
      or v_previous.valid_from is distinct from p_valid_from
      or v_previous.valid_until is distinct from p_valid_until
      or v_previous.stale_after is distinct from p_stale_after
      or v_previous.payload is distinct from v_payload
      or v_previous.authorship_source is distinct from p_authorship_source
      or v_previous.authorship_at is distinct from p_authorship_at
      or v_previous.provenance_source is distinct from p_provenance_source
      or v_previous.provenance_observed_at is distinct from p_provenance_observed_at then
      return query select 'rejected'::text, 'transition_invalid'::text;
      return;
    end if;

    if (v_previous.lifecycle = 'current' and p_lifecycle not in ('stale', 'superseded', 'withdrawn'))
      or (v_previous.lifecycle = 'stale' and p_lifecycle not in ('superseded', 'withdrawn'))
      or v_previous.lifecycle in ('superseded', 'withdrawn')
      or (p_lifecycle = 'stale' and p_stale_after is null) then
      return query select 'rejected'::text, 'transition_invalid'::text;
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
    v_payload,
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
