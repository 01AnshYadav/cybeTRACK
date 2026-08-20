-- Create the achievements table
create table public.achievements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  earned_at timestamptz default now() not null,
  metadata jsonb default '{}'::jsonb not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.achievements enable row level security;

-- Allow users to read their own achievements
create policy "Users can read own achievements" on public.achievements for select using (auth.uid() = user_id);

-- Allow users to insert their own achievements (typically system-earned, not manually created)
create policy "Users can insert own achievements" on public.achievements for insert with check (auth.uid() = user_id);

-- Allow users to update their own achievements (e.g., mark as viewed)
create policy "Users can update own achievements" on public.achievements for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Allow users to delete their own achievements
create policy "Users can delete own achievements" on public.achievements for delete using (auth.uid() = user_id);