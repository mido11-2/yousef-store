-- Run this once in Supabase SQL Editor.
create table if not exists public.games (
  id bigint primary key,
  name text not null,
  image text not null,
  platform text not null default 'PS4',
  category text not null default 'أخرى',
  whatsapp_options jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.games enable row level security;

drop policy if exists "Public can read games" on public.games;
create policy "Public can read games"
on public.games for select
using (true);

drop policy if exists "Authenticated can insert games" on public.games;
create policy "Authenticated can insert games"
on public.games for insert
to authenticated
with check (true);

drop policy if exists "Authenticated can update games" on public.games;
create policy "Authenticated can update games"
on public.games for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated can delete games" on public.games;
create policy "Authenticated can delete games"
on public.games for delete
to authenticated
using (true);


-- Run this Storage section after creating a PUBLIC bucket named game-images
-- in Supabase Dashboard -> Storage.
drop policy if exists "Authenticated can upload game images" on storage.objects;
create policy "Authenticated can upload game images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'game-images');

drop policy if exists "Authenticated can update game images" on storage.objects;
create policy "Authenticated can update game images"
on storage.objects for update
to authenticated
using (bucket_id = 'game-images')
with check (bucket_id = 'game-images');

drop policy if exists "Authenticated can delete game images" on storage.objects;
create policy "Authenticated can delete game images"
on storage.objects for delete
to authenticated
using (bucket_id = 'game-images');
