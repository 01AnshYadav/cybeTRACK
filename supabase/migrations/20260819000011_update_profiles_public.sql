-- Add is_public field to profiles table
alter table public.profiles add column if not exists is_public boolean default false not null;

-- Update existing records to is_public = false
update public.profiles set is_public = false where is_public is null;

-- Enable Row Level Security (already enabled, but ensure it's consistent)
alter table public.profiles enable row level security;

-- Allow users to read their own profile (always, since it's their own data)
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);

-- Allow authenticated users to view public profiles
create policy "Authenticated users can view public profiles" on public.profiles for select using (is_public = true);

-- Allow users to update their own profile including is_public setting
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);