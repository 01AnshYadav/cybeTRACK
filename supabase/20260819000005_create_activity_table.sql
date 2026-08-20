-- Create the activity table
create table public.activity (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  activity_type text not null,
  title text not null,
  description text,
  metadata jsonb default '{}'::jsonb not null,
  source text,
  created_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.activity enable row level security;

-- Allow users to read their own activity
create policy "Users can read own activity" on public.activity for select using (auth.uid() = user_id);

-- Allow users to insert their own activity
create policy "Users can insert own activity" on public.activity for insert with check (auth.uid() = user_id);