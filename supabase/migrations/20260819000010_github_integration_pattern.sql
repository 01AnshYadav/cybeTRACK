-- GitHub Integration Pattern
-- This migration adds the abstraction layer for platform integrations.
-- The actual OAuth credentials are stored in connected_accounts.

-- Create the platform_integrations table as a reference/metadata store
-- (tokens are stored in connected_accounts, not here)
create table public.platform_integrations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  platform text not null,
  platform_id text not null,
  config jsonb default '{}'::jsonb not null,
  is_active boolean default true not null,
  last_synced_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.platform_integrations enable row level security;

-- Allow users to read their own platform integrations
create policy "Users can read own platform integrations" on public.platform_integrations for select using (auth.uid() = user_id);

-- Allow users to insert their own platform integrations
create policy "Users can insert own platform integrations" on public.platform_integrations for insert with check (auth.uid() = user_id);

-- Allow users to update their own platform integrations
create policy "Users can update own platform integrations" on public.platform_integrations for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Allow users to delete their own platform integrations
create policy "Users can delete own platform integrations" on public.platform_integrations for delete using (auth.uid() = user_id);