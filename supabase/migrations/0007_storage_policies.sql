-- 0007_storage_policies.sql
-- Upload permissions for the Storage buckets the website can use.
-- The website uploads to the bucket named in VITE_STORAGE_BUCKET (default "church-pics").
-- Public can view files; only administrators (rows in public.profiles) can upload, replace or delete.
-- Buckets are created below if missing ("church-pics" and "media"); a bucket named "church pics"
-- (with a space) is covered by the policies if you created one, but is not created here.
-- SAFE TO RE-RUN.

insert into storage.buckets (id, name, public) values ('church-pics', 'church-pics', true)
  on conflict (id) do update set public = true;
insert into storage.buckets (id, name, public) values ('media', 'media', true)
  on conflict (id) do update set public = true;
update storage.buckets set public = true where id = 'church pics';

drop policy if exists "site media public read" on storage.objects;
create policy "site media public read" on storage.objects for select
  using (bucket_id in ('church-pics', 'church pics', 'media'));

drop policy if exists "site media admin upload" on storage.objects;
create policy "site media admin upload" on storage.objects for insert to authenticated
  with check (bucket_id in ('church-pics', 'church pics', 'media') and public.is_admin());

drop policy if exists "site media admin update" on storage.objects;
create policy "site media admin update" on storage.objects for update to authenticated
  using (bucket_id in ('church-pics', 'church pics', 'media') and public.is_admin());

drop policy if exists "site media admin delete" on storage.objects;
create policy "site media admin delete" on storage.objects for delete to authenticated
  using (bucket_id in ('church-pics', 'church pics', 'media') and public.is_admin());
