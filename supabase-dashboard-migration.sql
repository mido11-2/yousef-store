-- Yousef Store: game management fields + Storage policies
-- Run this once in Supabase SQL Editor.

alter table public.games
  add column if not exists sort_order integer not null default 0,
  add column if not exists is_featured boolean not null default false,
  add column if not exists is_visible boolean not null default true;

-- Give existing games a stable initial order based on their id.
update public.games
set sort_order = id
where sort_order = 0;

-- Public storefront can read visible games.
drop policy if exists "Public can view visible games" on public.games;
create policy "Public can view visible games"
on public.games
for select
to anon, authenticated
using (is_visible = true);

-- Logged-in admins can also see hidden games in the dashboard.
drop policy if exists "Authenticated admins can view all games" on public.games;
create policy "Authenticated admins can view all games"
on public.games
for select
to authenticated
using (true);

-- Logged-in admin can create/update/delete games.
drop policy if exists "Authenticated admins can insert games" on public.games;
create policy "Authenticated admins can insert games"
on public.games
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated admins can update games" on public.games;
create policy "Authenticated admins can update games"
on public.games
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated admins can delete games" on public.games;
create policy "Authenticated admins can delete games"
on public.games
for delete
to authenticated
using (true);

-- Storage upload policy for the logged-in dashboard.
drop policy if exists "Authenticated users can upload game images" on storage.objects;
create policy "Authenticated users can upload game images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'game-images');

-- Allow public reading of files in the public bucket.
drop policy if exists "Public can read game images" on storage.objects;
create policy "Public can read game images"
on storage.objects
for select
to public
using (bucket_id = 'game-images');
