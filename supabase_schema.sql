-- Supabase PostgreSQL Schema for AI Notetaker (StudyCraft AI)

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Profiles
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- 2. Sessions & Study Decks Table
create table if not exists public.study_sessions (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  subject text not null,
  description text,
  meeting_source text default 'General',
  raw_transcript text,
  summary text,
  bullet_points jsonb default '[]'::jsonb,
  action_items jsonb default '[]'::jsonb,
  key_terms jsonb default '[]'::jsonb,
  flashcards jsonb default '[]'::jsonb,
  quiz jsonb default '[]'::jsonb,
  mind_map jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Study Sessions
alter table public.study_sessions enable row level security;
create policy "Users can view own study sessions" on public.study_sessions for select using (auth.uid() = user_id);
create policy "Users can insert own study sessions" on public.study_sessions for insert with check (auth.uid() = user_id);
create policy "Users can update own study sessions" on public.study_sessions for update using (auth.uid() = user_id);
create policy "Users can delete own study sessions" on public.study_sessions for delete using (auth.uid() = user_id);

-- 3. Storage Bucket Policy for Media Files
-- Create bucket 'recordings' in Supabase Storage UI with Public=false, then run:
-- create policy "Users can upload recordings" on storage.objects for insert with check (bucket_id = 'recordings' and auth.uid() = owner);
-- create policy "Users can view own recordings" on storage.objects for select using (bucket_id = 'recordings' and auth.uid() = owner);
