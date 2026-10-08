-- Upload access for the church pictures bucket.
-- Covers BOTH spellings, so it works whether the bucket id is "church-pics" or "church pics".
-- (Policies for a bucket that doesn't exist are harmless.)

drop policy if exists "church pics public read"  on storage.objects;
drop policy if exists "church pics admin upload" on storage.objects;
drop policy if exists "church pics admin update" on storage.objects;
drop policy if exists "church pics admin delete" on storage.objects;

create policy "church pics public read" on storage.objects
  for select using (bucket_id in ('church-pics', 'church pics'));

create policy "church pics admin upload" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('church-pics', 'church pics') and is_admin());

create policy "church pics admin update" on storage.objects
  for update to authenticated
  using (bucket_id in ('church-pics', 'church pics') and is_admin());

create policy "church pics admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id in ('church-pics', 'church pics') and is_admin());

-- Make the bucket public so images show on the website
update storage.buckets set public = true where id in ('church-pics', 'church pics');
