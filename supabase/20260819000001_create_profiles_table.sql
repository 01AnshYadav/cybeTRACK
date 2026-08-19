-- Create the profiles table
create table public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  username text unique not null,
  display_name text not null,
  bio text,
  github_username text,
  interests text[] default '{}',
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Allow everyone to read profiles (public visibility for now)
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);

-- Allow authenticated users to update their own profile
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Allow authenticated users to insert their own profile on signup
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);