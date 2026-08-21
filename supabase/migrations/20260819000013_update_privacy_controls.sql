-- Add granular privacy settings to profiles table
alter table public.profiles add column if not exists display_name_visibility text default 'public' not null;
alter table public.profiles add column if not exists bio_visibility text default 'public' not null;
alter table public.profiles add column if not exists interests_visibility text default 'public' not null;
alter table public.profiles add column if not exists github_username_visibility text default 'public' not null;

-- Update existing records
update public.profiles set display_name_visibility = 'public' where display_name_visibility is null;
update public.profiles set bio_visibility = 'public' where bio_visibility is null;
update public.profiles set interests_visibility = 'public' where interests_visibility is null;
update public.profiles set github_username_visibility = 'public' where github_username_visibility is null;

-- Update RLS policies to use visibility settings
drop policy if exists "Authenticated users can view public profiles" on public.profiles;
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

-- Allow users to read own profile always
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);

-- Allow viewing profiles based on visibility settings
create policy "View profiles based on visibility" on public.profiles for select using (
    auth.uid() = id
    or (
        is_public = true
        and (
            case display_name_visibility
                when 'public' then true
                when 'followers' then false
                when 'private' then false
            end
        )
        and case bio_visibility
            when 'public' then true
            when 'followers' then false
            when 'private' then false
        end
        and case interests_visibility
            when 'public' then true
            when 'followers' then false
            when 'private' then false
        end
        and case github_username_visibility
            when 'public' then true
            when 'followers' then false
            when 'private' then false
        end
    )
);

-- Allow users to update their own profile including visibility settings
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);