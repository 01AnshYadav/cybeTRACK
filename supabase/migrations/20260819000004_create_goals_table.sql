-- Create the goals table
create table public.goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  status text default 'active' not null,
  target_date timestamptz,
  progress integer default 0 not null,
  roadmap_id uuid references public.roadmaps(id) on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.goals enable row level security;

-- Allow users to read their own goals
create policy "Users can read own goals" on public.goals for select using (auth.uid() = user_id);

-- Allow users to create their own goals
create policy "Users can create own goals" on public.goals for insert with check (auth.uid() = user_id);

-- Allow users to update their own goals
create policy "Users can update own goals" on public.goals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Allow users to delete their own goals
create policy "Users can delete own goals" on public.goals for delete using (auth.uid() = user_id);