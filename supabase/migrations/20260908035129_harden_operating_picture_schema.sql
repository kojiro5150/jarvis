-- Harden the governed Operating Picture schema without changing stored data.

alter function public.reject_operating_picture_version_mutation()
  set search_path = pg_catalog;

create index if not exists operating_picture_versions_previous_same_record_idx
  on public.operating_picture_versions (record_id, previous_version_id);

create index if not exists operating_picture_heads_exact_version_idx
  on public.operating_picture_heads (record_id, version_id);
