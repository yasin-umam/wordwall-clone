-- =============================================================================
-- PlayLearn (Wordwall clone) — Fase 1 schema
-- Full Supabase: PostgreSQL + RLS + Auth + Realtime
-- Konsep inti: 1 baris `activities` = 1 set konten (jsonb, template-agnostic).
-- Template bisa diganti tanpa mengubah konten.
-- =============================================================================

-- 1. PROFILES (cermin auth.users) ---------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  created_at timestamptz default now()
);

-- 2. ACTIVITIES ---------------------------------------------------------------
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users on delete cascade,
  title text not null,
  template_type text not null,          -- 'quiz'|'match_up'|'anagram'|'open_box'|'wheel'|'flashcards'
  content jsonb not null default '{}',   -- struktur ternormalisasi, template-agnostic
  theme text default 'classic',
  settings jsonb default '{}',           -- {timer: true, shuffle: true, ...}
  is_public boolean default false,
  share_slug text unique,                -- token pendek utk link, bukan expose UUID
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. PLAY_RESULTS (diisi pemain, termasuk anonim) -----------------------------
create table public.play_results (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities on delete cascade,
  player_name text not null,
  score int not null default 0,
  time_ms int,
  accuracy numeric,
  played_at timestamptz default now()
);

create index on public.activities (owner_id);
create index on public.activities (share_slug);
create index on public.play_results (activity_id);
create index on public.play_results (activity_id, score desc, time_ms asc);

-- ============ updated_at otomatis ============
create function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

create trigger activities_set_updated_at
  before update on public.activities
  for each row execute function public.set_updated_at();

-- ============ RLS ============
alter table public.profiles     enable row level security;
alter table public.activities   enable row level security;
alter table public.play_results enable row level security;

-- PROFILES: hanya diri sendiri
create policy "own profile read"   on public.profiles for select using (id = auth.uid());
create policy "own profile insert" on public.profiles for insert with check (id = auth.uid());
create policy "own profile update" on public.profiles for update using (id = auth.uid());

-- ACTIVITIES: pemilik penuh; publik hanya yang is_public (berlaku utk anon juga)
create policy "owner full select" on public.activities for select using (owner_id = auth.uid());
create policy "public can read"   on public.activities for select using (is_public = true);
create policy "owner insert"      on public.activities for insert with check (owner_id = auth.uid());
create policy "owner update"      on public.activities for update using (owner_id = auth.uid());
create policy "owner delete"      on public.activities for delete using (owner_id = auth.uid());

-- PLAY_RESULTS: siapa pun (termasuk anon) boleh INSERT, TAPI hanya ke aktivitas publik
create policy "anyone can submit result" on public.play_results
  for insert with check (
    exists (select 1 from public.activities a
            where a.id = activity_id and a.is_public = true)
  );

-- Leaderboard: hasil terlihat kalau aktivitasnya publik, atau kamu pemiliknya
create policy "read results" on public.play_results
  for select using (
    exists (select 1 from public.activities a
            where a.id = activity_id
              and (a.is_public = true or a.owner_id = auth.uid()))
  );

-- ============ Trigger buat profile otomatis saat signup ============
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', 'Guru'));
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ Realtime ============
-- Aktifkan realtime untuk leaderboard live (main bareng di kelas).
alter publication supabase_realtime add table public.play_results;

-- ============ Storage: bucket activity-media ============
insert into storage.buckets (id, name, public)
values ('activity-media', 'activity-media', true)
on conflict (id) do nothing;

-- Public read untuk media (gambar/audio dalam konten)
create policy "activity-media public read"
  on storage.objects for select
  using (bucket_id = 'activity-media');

-- Upload hanya authenticated, ke folder bernama uid masing-masing
-- (path harus: <uid>/namafile.ext)
create policy "activity-media owner upload"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'activity-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "activity-media owner update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'activity-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "activity-media owner delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'activity-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
