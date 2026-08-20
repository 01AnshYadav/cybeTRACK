-- Create the resources table
create table public.resources (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  roadmap_skill_id uuid references public.roadmap_skills(id) on delete cascade not null,
  title text not null,
  description text,
  url text,
  resource_type text default 'other' not null,
  status text default 'not_started' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.resources enable row level security;

-- Allow users to read their own resources (via roadmap skill ownership)
create policy "Users can read own resources" on public.resources for select using (
  exists (
    select 1 from public.roadmap_skills where id = roadmap_skill_id and user_id = auth.uid()
  )
);

-- Allow users to create their own resources
create policy "Users can create own resources" on public.resources for insert with check (
  auth.uid() = user_id
);

-- Allow users to update their own resources
create policy "Users can update own resources" on public.resources for update using (
  auth.uid() = user_id
) with check (
  auth.uid() = user_id
);

-- Allow users to delete their own resources
create policy "Users can delete own resources" on public.resources for delete using (
  auth.uid() = user_id
);