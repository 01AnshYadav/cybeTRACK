-- Create the roadmaps table
create table public.roadmaps (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  domain text,
  status text default 'active' not null,
  target_date timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.roadmaps enable row level security;

-- Allow users to read their own roadmaps
create policy "Users can read own roadmaps" on public.roadmaps for select using (auth.uid() = user_id);

-- Allow users to create their own roadmaps
create policy "Users can create own roadmaps" on public.roadmaps for insert with check (auth.uid() = user_id);

-- Allow users to update their own roadmaps
create policy "Users can update own roadmaps" on public.roadmaps for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Allow users to delete their own roadmaps
create policy "Users can delete own roadmaps" on public.roadmaps for delete using (auth.uid() = user_id);


-- Create the roadmap_skills table
create table public.roadmap_skills (
  id uuid default gen_random_uuid() primary key,
  roadmap_id uuid references public.roadmaps(id) on delete cascade not null,
  skill_name text not null,
  level text default 'beginner' not null,
  progress integer default 0 not null,
  status text default 'pending' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.roadmap_skills enable row level security;

-- Allow users to read their own roadmap skills (via roadmap ownership)
create policy "Users can read own roadmap skills" on public.roadmap_skills for select using (
  exists (
    select 1 from public.roadmaps where id = roadmap_id and user_id = auth.uid()
  )
);

-- Allow users to create their own roadmap skills
create policy "Users can create own roadmap skills" on public.roadmap_skills for insert with check (
  exists (
    select 1 from public.roadmaps where id = roadmap_id and user_id = auth.uid()
  )
);

-- Allow users to update their own roadmap skills
create policy "Users can update own roadmap skills" on public.roadmap_skills for update using (
  exists (
    select 1 from public.roadmaps where id = roadmap_id and user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.roadmaps where id = roadmap_id and user_id = auth.uid()
  )
);

-- Allow users to delete their own roadmap skills
create policy "Users can delete own roadmap skills" on public.roadmap_skills for delete using (
  exists (
    select 1 from public.roadmaps where id = roadmap_id and user_id = auth.uid()
  )
);


-- Create the connected_accounts table
create table public.connected_accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  platform text not null,
  platform_user_id text not null,
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.connected_accounts enable row level security;

-- Allow users to read their own connected accounts
create policy "Users can read own connected accounts" on public.connected_accounts for select using (auth.uid() = user_id);

-- Allow users to create their own connected accounts
create policy "Users can create own connected accounts" on public.connected_accounts for insert with check (auth.uid() = user_id);

-- Allow users to update their own connected accounts
create policy "Users can update own connected accounts" on public.connected_accounts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Allow users to delete their own connected accounts
create policy "Users can delete own connected accounts" on public.connected_accounts for delete using (auth.uid() = user_id);