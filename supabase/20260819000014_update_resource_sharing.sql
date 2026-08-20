-- Add visibility field to resources table for sharing
alter table public.resources add column if not exists visibility text default 'private' not null;

-- Update existing records
update public.resources set visibility = 'private' where visibility is null;

-- Update RLS policies for resources
alter table public.resources enable row level security;

-- Allow users to read own resources always
create policy "Users can read own resources" on public.resources for select using (auth.uid() = user_id);

-- Allow viewing public resources
create policy "View public resources" on public.resources for select using (visibility = 'public');

-- Allow users to update their own resources including visibility
create policy "Users can update own resources" on public.resources for update using (auth.uid() = user_id) with check (auth.uid() = user_id);